from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            logger.info(f"Checking admin access for user: {user_id}")
            
            user = User.find_by_id(ObjectId(user_id))
            
            if not user:
                logger.warning(f"User not found: {user_id}")
                return jsonify({'error': 'User not found'}), 401
            
            if user.get('role') != 'admin':
                logger.warning(f"Admin access denied for user: {user.get('email')}, role: {user.get('role')}")
                return jsonify({'error': 'Admin access required'}), 403
            
            logger.info(f"Admin access granted for: {user.get('email')}")
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Admin decorator error: {e}")
            return jsonify({'error': 'Authentication required'}), 401
    return decorated

def login_required(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Login required error: {e}")
            return jsonify({'error': 'Authentication required'}), 401
    return decorated