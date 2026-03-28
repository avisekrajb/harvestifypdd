from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app.services.email_service import generate_otp, send_otp_email, send_welcome_email
from datetime import datetime, timedelta
from bson import ObjectId
import logging

bp = Blueprint('auth', __name__, url_prefix='/api/auth')
logger = logging.getLogger(__name__)

def _build_cors_preflight_response():
    """Build CORS preflight response"""
    response = make_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@bp.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        logger.info(f"Signup attempt for email: {data.get('email')}")
        
        # Check if user exists
        existing = User.find_by_email(data['email'])
        if existing:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create user
        user_id = User.create(data)
        
        # Send welcome email
        try:
            send_welcome_email(data['email'], data['name'])
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")
        
        # Create access token
        access_token = create_access_token(identity=str(user_id.inserted_id))
        
        # Get created user
        user = User.find_by_id(user_id.inserted_id)
        
        return jsonify({
            'message': 'Account created successfully',
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'phone': user.get('phone', ''),
                'address': user.get('address', ''),
                'role': user.get('role', 'user')
            }
        }), 201
    except Exception as e:
        logger.error(f"Signup error: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        logger.info(f"Login attempt for email: {email}")
        
        # Find user
        user = User.find_by_email(email)
        
        if not user:
            logger.warning(f"User not found: {email}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        logger.info(f"User found: {user.get('email')}, role: {user.get('role')}")
        logger.info(f"Password hash exists: {bool(user.get('password_hash'))}")
        
        # Verify password
        if not User.verify_password(user, password):
            logger.warning(f"Invalid password for: {email}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(user['_id']))
        
        logger.info(f"Login successful for: {email}")
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'phone': user.get('phone', ''),
                'address': user.get('address', ''),
                'role': user.get('role', 'user')
            }
        })
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/me', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_current_user():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        user_id = get_jwt_identity()
        logger.info(f"Fetching user: {user_id}")
        
        user = User.find_by_id(ObjectId(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'phone': user.get('phone', ''),
            'address': user.get('address', ''),
            'role': user.get('role', 'user'),
            'created_at': user.get('created_at')
        })
    except Exception as e:
        logger.error(f"Get user error: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        email = data.get('email')
        logger.info(f"Forgot password for: {email}")
        
        user = User.find_by_email(email)
        if not user:
            return jsonify({'error': 'Email not found'}), 404
        
        otp = generate_otp()
        
        try:
            send_otp_email(email, otp)
        except Exception as e:
            logger.error(f"Failed to send OTP email: {e}")
        
        # Store OTP in database
        User.update(user['_id'], {
            'reset_otp': otp,
            'reset_otp_expires': datetime.utcnow() + timedelta(minutes=10)
        })
        
        return jsonify({'message': 'OTP sent to your email'})
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/verify-otp', methods=['POST', 'OPTIONS'])
def verify_otp():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        
        user = User.find_by_email(email)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('reset_otp') != otp:
            return jsonify({'error': 'Invalid OTP'}), 400
        
        if datetime.utcnow() > user.get('reset_otp_expires', datetime.utcnow()):
            return jsonify({'error': 'OTP expired'}), 400
        
        return jsonify({'message': 'OTP verified successfully'})
    except Exception as e:
        logger.error(f"Verify OTP error: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.get_json()
        email = data.get('email')
        new_password = data.get('password')
        
        user = User.find_by_email(email)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update password
        User.update(user['_id'], {'password': new_password})
        
        # Clear OTP
        User.update(user['_id'], {
            'reset_otp': None,
            'reset_otp_expires': None
        })
        
        return jsonify({'message': 'Password reset successfully'})
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return jsonify({'error': str(e)}), 500