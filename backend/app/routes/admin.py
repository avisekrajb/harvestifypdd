import os
import base64
import uuid
import logging
import random
import string
import traceback
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId

from app import db
from app.models.user import User
from app.extensions import bcrypt
from app.services.email_service import (
    send_doctor_assignment_email, 
    send_user_assignment_notification, 
    send_doctor_creation_email,
    send_order_status_update
)

bp = Blueprint('admin', __name__, url_prefix='/api/admin')
logger = logging.getLogger(__name__)

# Upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Create upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# OPTIONS handler
@bp.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

@bp.route('/stats', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_stats():
    try:
        total_orders = db.orders.count_documents({}) if db.orders is not None else 0
        total_users = db.users.count_documents({}) if db.users is not None else 0
        total_products = db.products.count_documents({}) if db.products is not None else 0
        total_messages = db.messages.count_documents({}) if db.messages is not None else 0
        
        # Calculate total revenue
        total_revenue = 0
        try:
            pipeline = [{'$group': {'_id': None, 'total': {'$sum': '$total'}}}]
            revenue_result = list(db.orders.aggregate(pipeline))
            total_revenue = revenue_result[0]['total'] if revenue_result else 0
        except:
            pass
        
        pending_orders = db.orders.count_documents({'status': 'pending'}) if db.orders is not None else 0
        
        return jsonify({
            'total_orders': total_orders,
            'total_users': total_users,
            'total_products': total_products,
            'total_messages': total_messages,
            'total_revenue': total_revenue,
            'pending_orders': pending_orders
        })
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/orders', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_all_orders():
    try:
        orders_cursor = db.orders.find().sort('created_at', -1)
        orders = []
        
        for order in orders_cursor:
            order_dict = {}
            for key, value in order.items():
                if isinstance(value, ObjectId):
                    order_dict[key] = str(value)
                else:
                    order_dict[key] = value
            
            if 'order_id' not in order_dict or not order_dict.get('order_id'):
                order_dict['order_id'] = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
            
            if 'items' not in order_dict:
                order_dict['items'] = []
            
            orders.append(order_dict)
        
        return jsonify({'orders': orders})
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        return jsonify({'error': str(e), 'orders': []}), 500

@bp.route('/orders/<order_id>/status', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_order_status(order_id):
    try:
        data = request.get_json()
        status = data.get('status')
        doctor_name = data.get('doctor_name')
        
        if not order_id:
            return jsonify({'error': 'Order ID is required'}), 400
        
        # Get the order first
        order = db.orders.find_one({'_id': ObjectId(order_id)})
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        update_data = {'status': status, 'updated_at': datetime.utcnow()}
        
        # If doctor is being assigned
        if doctor_name is not None:
            update_data['assigned_doctor'] = doctor_name if doctor_name else None
            
            if order and doctor_name:
                # Find doctor by name
                doctor = db.doctors.find_one({'name': doctor_name})
                
                if doctor:
                    # Get user details
                    user = db.users.find_one({'_id': order['user_id']})
                    
                    if user:
                        # Assign user to doctor
                        db.doctors.update_one(
                            {'_id': doctor['_id']},
                            {'$addToSet': {'assigned_users': str(order['user_id'])}}
                        )
                        
                        logger.info(f"Assigned doctor {doctor_name} to user {user['name']}")
                        
                        # Send email to doctor
                        try:
                            send_doctor_assignment_email(
                                doctor['email'],
                                doctor['name'],
                                user['name'],
                                user['email'],
                                user.get('phone', 'Not provided'),
                                user.get('address', 'Not provided'),
                                order.get('order_id', order_id)
                            )
                            logger.info(f"Doctor assignment email sent to {doctor['email']}")
                        except Exception as e:
                            logger.error(f"Failed to send doctor assignment email: {e}")
                        
                        # Send email to user
                        try:
                            send_user_assignment_notification(
                                user['email'],
                                user['name'],
                                doctor['name'],
                                doctor.get('speciality', 'Agriculture Expert')
                            )
                            logger.info(f"User notification email sent to {user['email']}")
                        except Exception as e:
                            logger.error(f"Failed to send user notification email: {e}")
        
        # Update order status
        result = db.orders.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': update_data}
        )
        
        # Send order status update email to user
        if status and status != order.get('status'):
            user = db.users.find_one({'_id': order['user_id']})
            if user and user.get('email'):
                try:
                    send_order_status_update(
                        user['email'],
                        order.get('order_id', order_id),
                        status
                    )
                    logger.info(f"Order status update email sent to {user['email']} for order {order_id}")
                except Exception as e:
                    logger.error(f"Failed to send order status update email: {e}")
        
        return jsonify({'message': 'Order updated successfully'})
    except Exception as e:
        logger.error(f"Error updating order: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@bp.route('/users', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_all_users():
    try:
        users_cursor = db.users.find().sort('created_at', -1)
        users = []
        
        for user in users_cursor:
            user_dict = {}
            for key, value in user.items():
                if isinstance(value, ObjectId):
                    user_dict[key] = str(value)
                else:
                    user_dict[key] = value
            
            user_dict.pop('password_hash', None)
            user_dict.pop('reset_otp', None)
            user_dict.pop('reset_otp_expires', None)
            
            users.append(user_dict)
        
        return jsonify({'users': users})
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        return jsonify({'error': str(e), 'users': []}), 500

@bp.route('/products', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_products():
    try:
        products_cursor = db.products.find().sort('created_at', -1)
        products = []
        for product in products_cursor:
            product['_id'] = str(product['_id'])
            products.append(product)
        return jsonify({'products': products})
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return jsonify({'error': str(e), 'products': []}), 500

@bp.route('/products', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_product():
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Product name is required'}), 400
        
        product_data = {
            'name': data.get('name'),
            'category': data.get('category', 'fertilizer'),
            'price': float(data.get('price', 0)),
            'original_price': float(data.get('original_price', data.get('price', 0))),
            'rating': data.get('rating', 4.5),
            'reviews': data.get('reviews', 0),
            'badge': data.get('badge'),
            'image': data.get('image', '🌱'),
            'photo': data.get('photo'),
            'description': data.get('description', ''),
            'how_to_use': data.get('how_to_use', ''),
            'benefits': data.get('benefits', []),
            'tags': data.get('tags', []),
            'stock': int(data.get('stock', 100)),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.products.insert_one(product_data)
        return jsonify({'message': 'Product created', 'id': str(result.inserted_id)}), 201
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/products/<product_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_product(product_id):
    try:
        data = request.get_json()
        
        if not product_id:
            return jsonify({'error': 'Product ID is required'}), 400
        
        try:
            obj_id = ObjectId(product_id)
        except:
            return jsonify({'error': 'Invalid product ID format'}), 400
        
        update_data = {
            'updated_at': datetime.utcnow()
        }
        
        # Update fields if provided
        fields = ['name', 'category', 'badge', 'image', 'photo', 'description', 'how_to_use', 'benefits', 'tags']
        for field in fields:
            if field in data:
                update_data[field] = data[field]
        
        if 'price' in data:
            update_data['price'] = float(data['price'])
        if 'original_price' in data:
            update_data['original_price'] = float(data['original_price'])
        if 'rating' in data:
            update_data['rating'] = float(data['rating'])
        if 'reviews' in data:
            update_data['reviews'] = int(data['reviews'])
        if 'stock' in data:
            update_data['stock'] = int(data['stock'])
        
        result = db.products.update_one(
            {'_id': obj_id},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify({'message': 'Product updated successfully'})
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/products/<product_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_product(product_id):
    try:
        if not product_id or product_id == 'undefined':
            return jsonify({'error': 'Valid product ID is required'}), 400
        
        try:
            obj_id = ObjectId(product_id)
        except:
            return jsonify({'error': 'Invalid product ID format'}), 400
        
        result = db.products.delete_one({'_id': obj_id})
        if result.deleted_count == 0:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify({'message': 'Product deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/doctors', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_doctors():
    try:
        doctors = list(db.doctors.find().sort('created_at', -1))
        for doctor in doctors:
            doctor['_id'] = str(doctor['_id'])
            doctor['assigned_users_count'] = len(doctor.get('assigned_users', []))
        return jsonify({'doctors': doctors})
    except Exception as e:
        logger.error(f"Error fetching doctors: {e}")
        return jsonify({'error': str(e), 'doctors': []}), 500

@bp.route('/doctors', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_doctor():
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Doctor name is required'}), 400
        
        if not data.get('email'):
            return jsonify({'error': 'Doctor email is required'}), 400
        
        # Generate a random password for doctor login
        temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        
        # Check if doctor already exists
        existing = User.find_by_email(data.get('email'))
        if existing:
            return jsonify({'error': 'Doctor with this email already exists'}), 400
        
        # Create user account for doctor
        doctor_user = {
            'name': data.get('name'),
            'email': data.get('email'),
            'password': temp_password,
            'phone': data.get('phone', ''),
            'address': data.get('address', ''),
            'role': 'doctor',
            'bio': data.get('bio', ''),
            'photo': data.get('photo'),
            'created_at': datetime.utcnow()
        }
        
        user_id = User.create(doctor_user)
        
        # Also store in doctors collection
        doctor_data = {
            'name': data.get('name'),
            'speciality': data.get('speciality', 'General'),
            'phone': data.get('phone', ''),
            'email': data.get('email', ''),
            'bio': data.get('bio', ''),
            'photo': data.get('photo'),
            'user_id': str(user_id.inserted_id),
            'assigned_users': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.doctors.insert_one(doctor_data)
        
        # Send welcome email to doctor
        try:
            send_doctor_creation_email(data.get('email'), data.get('name'), temp_password)
            logger.info(f"Doctor creation email sent to {data.get('email')}")
        except Exception as e:
            logger.error(f"Failed to send doctor creation email: {e}")
        
        return jsonify({
            'message': 'Doctor added successfully',
            'id': str(result.inserted_id),
            'temp_password': temp_password
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating doctor: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/doctors/<doctor_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_doctor(doctor_id):
    try:
        data = request.get_json()
        
        if not doctor_id:
            return jsonify({'error': 'Doctor ID is required'}), 400
        
        try:
            obj_id = ObjectId(doctor_id)
        except:
            return jsonify({'error': 'Invalid doctor ID format'}), 400
        
        # Get doctor to find associated user
        doctor = db.doctors.find_one({'_id': obj_id})
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        # Update doctors collection
        doctor_update = {'updated_at': datetime.utcnow()}
        
        update_fields = ['name', 'speciality', 'phone', 'email', 'bio', 'photo']
        for field in update_fields:
            if field in data:
                doctor_update[field] = data[field]
        
        db.doctors.update_one({'_id': obj_id}, {'$set': doctor_update})
        
        # Update user collection
        if doctor.get('user_id'):
            user_update = {'updated_at': datetime.utcnow()}
            for field in update_fields:
                if field in data:
                    user_update[field] = data[field]
            
            db.users.update_one({'_id': ObjectId(doctor['user_id'])}, {'$set': user_update})
        
        return jsonify({'message': 'Doctor updated successfully'})
    except Exception as e:
        logger.error(f"Error updating doctor: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/doctors/<doctor_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_doctor(doctor_id):
    try:
        if not doctor_id or doctor_id == 'undefined':
            return jsonify({'error': 'Valid doctor ID is required'}), 400
        
        try:
            obj_id = ObjectId(doctor_id)
        except:
            return jsonify({'error': 'Invalid doctor ID format'}), 400
        
        # Get doctor to find associated user
        doctor = db.doctors.find_one({'_id': obj_id})
        
        # Delete doctor from doctors collection
        result = db.doctors.delete_one({'_id': obj_id})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Doctor not found'}), 404
        
        # Delete associated user account
        if doctor and doctor.get('user_id'):
            db.users.delete_one({'_id': ObjectId(doctor['user_id'])})
        
        return jsonify({'message': 'Doctor deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting doctor: {e}")
        return jsonify({'error': str(e)}), 500

# ... (rest of your admin routes continue below)

@bp.route('/upload-photo', methods=['POST', 'OPTIONS'])
@jwt_required()
def upload_photo():
    try:
        import time
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo provided'}), 400
        
        file = request.files['photo']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
        if file.content_type not in allowed_types:
            return jsonify({'error': 'Invalid file type. Please upload JPEG, PNG, or WebP image.'}), 400
        
        # Read file content
        file_content = file.read()
        
        # Upload to Cloudinary
        try:
            import cloudinary
            import cloudinary.uploader
            
            # Configure Cloudinary
            cloudinary.config(
                cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'harvestify'),
                api_key=os.getenv('CLOUDINARY_API_KEY', ''),
                api_secret=os.getenv('CLOUDINARY_API_SECRET', '')
            )
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file_content,
                folder='harvestify/products',
                allowed_formats=['jpg', 'png', 'jpeg', 'webp', 'gif']
            )
            
            image_url = upload_result['secure_url']
            public_id = upload_result['public_id']
            
            logger.info(f"Photo uploaded to Cloudinary: {public_id}")
            
            return jsonify({
                'url': image_url,
                'public_id': public_id,
                'message': 'Photo uploaded successfully'
            })
            
        except ImportError:
            logger.warning("Cloudinary not installed, using mock URL")
            return jsonify({
                'url': f"https://picsum.photos/400/400?random={int(time.time())}",
                'public_id': 'mock_id',
                'message': 'Mock photo URL (Cloudinary not configured)'
            })
            
    except Exception as e:
        logger.error(f"Error uploading photo: {e}")
        return jsonify({'error': str(e)}), 500
