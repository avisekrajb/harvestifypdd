from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app import db
from bson import ObjectId
from app.models.user import User
from app.extensions import bcrypt
from datetime import datetime, timedelta
import logging
import traceback
import random
import string

bp = Blueprint('doctor', __name__, url_prefix='/api/doctor')
logger = logging.getLogger(__name__)

@bp.route('/login', methods=['POST', 'OPTIONS'])
def doctor_login():
    """Doctor login endpoint"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        logger.info(f"Doctor login attempt for: {email}")
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = User.find_by_email(email)
        
        if not user:
            logger.warning(f"User not found: {email}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if user is a doctor
        if user.get('role') != 'doctor':
            logger.warning(f"User {email} is not a doctor. Role: {user.get('role')}")
            return jsonify({'error': 'Access denied. Not a doctor account.'}), 403
        
        # Verify password
        if not User.verify_password(user, password):
            logger.warning(f"Invalid password for: {email}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(user['_id']))
        
        # Get doctor profile
        doctor = db.doctors.find_one({'user_id': str(user['_id'])})
        
        logger.info(f"Doctor login successful: {email}")
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'role': 'doctor',
                'speciality': doctor.get('speciality') if doctor else 'General',
                'photo': doctor.get('photo') if doctor else None
            }
        })
    except Exception as e:
        logger.error(f"Doctor login error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@bp.route('/dashboard', methods=['GET', 'OPTIONS'])
@jwt_required()
def doctor_dashboard():
    """Get doctor dashboard data"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        user_id = get_jwt_identity()
        logger.info(f"Fetching dashboard for doctor: {user_id}")
        
        user = User.find_by_id(ObjectId(user_id))
        
        if not user:
            logger.warning(f"User not found: {user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('role') != 'doctor':
            logger.warning(f"User {user_id} is not a doctor")
            return jsonify({'error': 'Access denied'}), 403
        
        # Get doctor profile
        doctor = db.doctors.find_one({'user_id': str(user_id)})
        
        # Initialize empty data
        assigned_users = []
        pending_consultations = []
        completed_consultations = []
        
        # Get assigned users
        if doctor and doctor.get('assigned_users'):
            for assigned_id in doctor['assigned_users']:
                try:
                    assigned_user = db.users.find_one({'_id': ObjectId(assigned_id)})
                    if assigned_user:
                        # Get consultation status for this user
                        consultation = db.consultations.find_one({
                            'user_id': assigned_id,
                            'doctor_id': str(user_id)
                        })
                        
                        user_data = {
                            'id': str(assigned_user['_id']),
                            'name': assigned_user['name'],
                            'email': assigned_user['email'],
                            'phone': assigned_user.get('phone', ''),
                            'address': assigned_user.get('address', ''),
                            'consultation_status': consultation.get('status', 'pending') if consultation else 'pending',
                            'consultation_id': str(consultation['_id']) if consultation else None,
                            'notes': consultation.get('notes', '') if consultation else '',
                            'assigned_date': consultation.get('assigned_date') if consultation else datetime.utcnow()
                        }
                        
                        # Get orders for this user
                        orders = list(db.orders.find({'user_id': ObjectId(assigned_id)}).sort('created_at', -1))
                        for order in orders:
                            order['_id'] = str(order['_id'])
                            if 'user_id' in order:
                                order['user_id'] = str(order['user_id'])
                        user_data['orders'] = orders[:5]
                        
                        # Categorize by consultation status
                        if user_data['consultation_status'] == 'pending':
                            pending_consultations.append(user_data)
                        else:
                            completed_consultations.append(user_data)
                        
                        assigned_users.append(user_data)
                        
                except Exception as e:
                    logger.error(f"Error processing assigned user {assigned_id}: {e}")
                    continue
        
        # Sort by assigned date
        pending_consultations.sort(key=lambda x: x.get('assigned_date', datetime.min), reverse=True)
        completed_consultations.sort(key=lambda x: x.get('assigned_date', datetime.min), reverse=True)
        
        return jsonify({
            'doctor': {
                'id': str(doctor['_id']) if doctor else None,
                'name': user['name'],
                'email': user['email'],
                'speciality': doctor.get('speciality') if doctor else 'General',
                'bio': doctor.get('bio') if doctor else '',
                'phone': user.get('phone', ''),
                'photo': doctor.get('photo') if doctor else None,
                'total_assigned': len(assigned_users),
                'pending_count': len(pending_consultations),
                'completed_count': len(completed_consultations)
            },
            'pending_consultations': pending_consultations,
            'completed_consultations': completed_consultations,
            'stats': {
                'total_assigned': len(assigned_users),
                'pending': len(pending_consultations),
                'completed': len(completed_consultations)
            }
        })
    except Exception as e:
        logger.error(f"Doctor dashboard error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@bp.route('/consultation/<user_id>/status', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_consultation_status(user_id):
    """Update consultation status for a user (success/pending)"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        doctor_user_id = get_jwt_identity()
        data = request.get_json()
        status = data.get('status')
        notes = data.get('notes', '')
        
        if not status or status not in ['pending', 'success']:
            return jsonify({'error': 'Invalid status. Must be pending or success'}), 400
        
        doctor = User.find_by_id(ObjectId(doctor_user_id))
        
        if not doctor or doctor.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403
        
        # Verify this user is assigned to the doctor
        doctor_doc = db.doctors.find_one({'user_id': str(doctor_user_id)})
        if not doctor_doc or user_id not in doctor_doc.get('assigned_users', []):
            return jsonify({'error': 'Access denied to this user'}), 403
        
        # Get user
        user = User.find_by_id(ObjectId(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update or create consultation record
        consultation = db.consultations.find_one({
            'user_id': user_id,
            'doctor_id': str(doctor_user_id)
        })
        
        if consultation:
            db.consultations.update_one(
                {'_id': consultation['_id']},
                {'$set': {
                    'status': status,
                    'notes': notes,
                    'updated_at': datetime.utcnow(),
                    'completed_at': datetime.utcnow() if status == 'success' else None
                }}
            )
        else:
            db.consultations.insert_one({
                'user_id': user_id,
                'doctor_id': str(doctor_user_id),
                'doctor_name': doctor['name'],
                'user_name': user['name'],
                'status': status,
                'notes': notes,
                'assigned_date': datetime.utcnow(),
                'completed_at': datetime.utcnow() if status == 'success' else None,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            })
        
        # Send email notification to user
        try:
            from app.services.email_service import send_consultation_status_email
            send_consultation_status_email(
                user['email'],
                user['name'],
                doctor['name'],
                status,
                notes
            )
            logger.info(f"Consultation status email sent to {user['email']}")
        except Exception as e:
            logger.error(f"Failed to send consultation status email: {e}")
        
        return jsonify({
            'message': f'Consultation marked as {status}',
            'status': status
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating consultation status: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@bp.route('/consultation/<user_id>/notes', methods=['POST', 'OPTIONS'])
@jwt_required()
def add_consultation_notes(user_id):
    """Add notes to a consultation"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        doctor_user_id = get_jwt_identity()
        data = request.get_json()
        notes = data.get('notes')
        
        if not notes:
            return jsonify({'error': 'Notes are required'}), 400
        
        doctor = User.find_by_id(ObjectId(doctor_user_id))
        
        if not doctor or doctor.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403
        
        # Verify this user is assigned to the doctor
        doctor_doc = db.doctors.find_one({'user_id': str(doctor_user_id)})
        if not doctor_doc or user_id not in doctor_doc.get('assigned_users', []):
            return jsonify({'error': 'Access denied to this user'}), 403
        
        # Update consultation notes
        consultation = db.consultations.find_one({
            'user_id': user_id,
            'doctor_id': str(doctor_user_id)
        })
        
        if consultation:
            db.consultations.update_one(
                {'_id': consultation['_id']},
                {'$set': {
                    'notes': notes,
                    'updated_at': datetime.utcnow()
                }}
            )
        else:
            db.consultations.insert_one({
                'user_id': user_id,
                'doctor_id': str(doctor_user_id),
                'doctor_name': doctor['name'],
                'user_name': User.find_by_id(ObjectId(user_id))['name'],
                'status': 'pending',
                'notes': notes,
                'assigned_date': datetime.utcnow(),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            })
        
        return jsonify({'message': 'Notes added successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error adding consultation notes: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/profile', methods=['GET', 'PUT', 'OPTIONS'])
@jwt_required()
def doctor_profile():
    """Get and update doctor profile"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(ObjectId(user_id))
        
        if not user or user.get('role') != 'doctor':
            return jsonify({'error': 'Access denied'}), 403
        
        if request.method == 'GET':
            doctor = db.doctors.find_one({'user_id': str(user_id)})
            
            # Get assigned users
            assigned_users = []
            if doctor and doctor.get('assigned_users'):
                for assigned_id in doctor['assigned_users']:
                    try:
                        assigned_user = db.users.find_one({'_id': ObjectId(assigned_id)})
                        if assigned_user:
                            assigned_users.append({
                                'id': str(assigned_user['_id']),
                                'name': assigned_user['name'],
                                'email': assigned_user['email'],
                                'phone': assigned_user.get('phone', ''),
                                'address': assigned_user.get('address', '')
                            })
                    except Exception as e:
                        logger.error(f"Error getting assigned user: {e}")
                        continue
            
            return jsonify({
                'name': user['name'],
                'email': user['email'],
                'phone': user.get('phone', ''),
                'bio': doctor.get('bio', '') if doctor else '',
                'speciality': doctor.get('speciality', 'General') if doctor else 'General',
                'photo': doctor.get('photo') if doctor else None,
                'assigned_users': assigned_users
            })
        
        elif request.method == 'PUT':
            data = request.get_json()
            
            # Update user basic info
            user_update = {}
            if 'name' in data:
                user_update['name'] = data['name']
            if 'phone' in data:
                user_update['phone'] = data['phone']
            
            if user_update:
                user_update['updated_at'] = datetime.utcnow()
                db.users.update_one({'_id': ObjectId(user_id)}, {'$set': user_update})
            
            # Update doctor info
            doctor_update = {}
            if 'bio' in data:
                doctor_update['bio'] = data['bio']
            if 'speciality' in data:
                doctor_update['speciality'] = data['speciality']
            if 'photo' in data:
                doctor_update['photo'] = data['photo']
            
            if doctor_update:
                doctor_update['updated_at'] = datetime.utcnow()
                db.doctors.update_one(
                    {'user_id': str(user_id)},
                    {'$set': doctor_update},
                    upsert=True
                )
            
            return jsonify({'message': 'Profile updated successfully'})
            
    except Exception as e:
        logger.error(f"Doctor profile error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

def _build_cors_response():
    """Build CORS response for OPTIONS requests"""
    response = jsonify({'message': 'OK'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response