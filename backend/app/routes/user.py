from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from bson import ObjectId
from app.models.user import User
from datetime import datetime
import logging
import traceback

bp = Blueprint('user', __name__, url_prefix='/api/user')
logger = logging.getLogger(__name__)

@bp.route('/dashboard', methods=['GET', 'OPTIONS'])
@jwt_required()
def user_dashboard():
    """Get user dashboard data"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        user_id = get_jwt_identity()
        logger.info(f"Fetching dashboard for user: {user_id}")
        
        user = User.find_by_id(ObjectId(user_id))
        
        if not user:
            logger.warning(f"User not found: {user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's orders
        orders = list(db.orders.find({'user_id': ObjectId(user_id)}).sort('created_at', -1))
        for order in orders:
            order['_id'] = str(order['_id'])
            if 'user_id' in order:
                order['user_id'] = str(order['user_id'])
        
        # Get consultations
        consultations = list(db.consultations.find({'user_id': user_id}).sort('created_at', -1))
        for consultation in consultations:
            consultation['_id'] = str(consultation['_id'])
        
        # Get doctor info for consultations
        for consultation in consultations:
            doctor = db.doctors.find_one({'user_id': consultation.get('doctor_id')})
            if doctor:
                consultation['doctor_name'] = doctor.get('name', 'Unknown')
                consultation['doctor_speciality'] = doctor.get('speciality', 'General')
        
        # Get assigned doctor
        assigned_doctor = None
        doctor_doc = db.doctors.find_one({'assigned_users': user_id})
        if doctor_doc:
            assigned_doctor = {
                'id': str(doctor_doc['_id']),
                'name': doctor_doc['name'],
                'speciality': doctor_doc.get('speciality', 'General'),
                'phone': doctor_doc.get('phone', ''),
                'email': doctor_doc.get('email', '')
            }
        
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'phone': user.get('phone', ''),
                'address': user.get('address', ''),
                'joined': user.get('created_at')
            },
            'orders': orders[:10],  # Last 10 orders
            'consultations': consultations,
            'assigned_doctor': assigned_doctor,
            'stats': {
                'total_orders': len(orders),
                'total_consultations': len(consultations),
                'pending_consultations': len([c for c in consultations if c.get('status') == 'pending']),
                'completed_consultations': len([c for c in consultations if c.get('status') == 'success'])
            }
        })
    except Exception as e:
        logger.error(f"User dashboard error: {e}")
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