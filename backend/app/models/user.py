from datetime import datetime
from app import db
from app.extensions import bcrypt
import logging

logger = logging.getLogger(__name__)

class User:
    collection = db.users
    
    @staticmethod
    def create(user_data):
        """Create a new user with hashed password"""
        try:
            # Hash password
            password = user_data.pop('password')
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            
            user_doc = {
                'name': user_data.get('name'),
                'email': user_data.get('email'),
                'phone': user_data.get('phone', ''),
                'address': user_data.get('address', ''),
                'password_hash': password_hash,
                'role': user_data.get('role', 'user'),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            result = User.collection.insert_one(user_doc)
            logger.info(f"Created user: {user_data.get('email')} with role: {user_data.get('role', 'user')}")
            return result
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        try:
            return User.collection.find_one({'email': email})
        except Exception as e:
            logger.error(f"Error finding user by email: {e}")
            return None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        from bson import ObjectId
        try:
            return User.collection.find_one({'_id': ObjectId(user_id)})
        except Exception as e:
            logger.error(f"Error finding user by id: {e}")
            return None
    
    @staticmethod
    def update(user_id, update_data):
        """Update user"""
        from bson import ObjectId
        try:
            # If password is in update_data, hash it
            if 'password' in update_data:
                password = update_data.pop('password')
                update_data['password_hash'] = bcrypt.generate_password_hash(password).decode('utf-8')
            
            update_data['updated_at'] = datetime.utcnow()
            
            result = User.collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': update_data}
            )
            logger.info(f"Updated user: {user_id}")
            return result
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            raise
    
    @staticmethod
    def verify_password(user, password):
        """Verify user password"""
        try:
            password_hash = user.get('password_hash')
            if not password_hash:
                logger.warning(f"No password hash found for user: {user.get('email')}")
                return False
            
            result = bcrypt.check_password_hash(password_hash, password)
            logger.info(f"Password verification for {user.get('email')}: {result}")
            return result
        except Exception as e:
            logger.error(f"Error verifying password: {e}")
            return False