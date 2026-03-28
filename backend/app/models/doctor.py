from datetime import datetime
from app import db
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class Doctor:
    collection = db.doctors
    
    @staticmethod
    def create(doctor_data):
        """Create a new doctor"""
        try:
            doctor_doc = {
                'name': doctor_data.get('name'),
                'speciality': doctor_data.get('speciality'),
                'phone': doctor_data.get('phone', ''),
                'email': doctor_data.get('email', ''),
                'bio': doctor_data.get('bio', ''),
                'photo': doctor_data.get('photo'),
                'assigned_users': [],  # List of user IDs assigned to this doctor
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            result = Doctor.collection.insert_one(doctor_doc)
            logger.info(f"Doctor created: {doctor_data.get('name')}")
            return result
        except Exception as e:
            logger.error(f"Error creating doctor: {e}")
            raise
    
    @staticmethod
    def find_all():
        """Get all doctors"""
        try:
            doctors = list(Doctor.collection.find().sort('created_at', -1))
            for doctor in doctors:
                doctor['_id'] = str(doctor['_id'])
            return doctors
        except Exception as e:
            logger.error(f"Error fetching doctors: {e}")
            return []
    
    @staticmethod
    def find_by_id(doctor_id):
        """Find doctor by ID"""
        try:
            doctor = Doctor.collection.find_one({'_id': ObjectId(doctor_id)})
            if doctor:
                doctor['_id'] = str(doctor['_id'])
            return doctor
        except Exception as e:
            logger.error(f"Error finding doctor: {e}")
            return None
    
    @staticmethod
    def find_by_email(email):
        """Find doctor by email"""
        try:
            doctor = Doctor.collection.find_one({'email': email})
            if doctor:
                doctor['_id'] = str(doctor['_id'])
            return doctor
        except Exception as e:
            logger.error(f"Error finding doctor by email: {e}")
            return None
    
    @staticmethod
    def update(doctor_id, update_data):
        """Update doctor"""
        try:
            update_data['updated_at'] = datetime.utcnow()
            result = Doctor.collection.update_one(
                {'_id': ObjectId(doctor_id)},
                {'$set': update_data}
            )
            return result
        except Exception as e:
            logger.error(f"Error updating doctor: {e}")
            raise
    
    @staticmethod
    def delete(doctor_id):
        """Delete doctor"""
        try:
            result = Doctor.collection.delete_one({'_id': ObjectId(doctor_id)})
            return result
        except Exception as e:
            logger.error(f"Error deleting doctor: {e}")
            raise
    
    @staticmethod
    def assign_user(doctor_id, user_id):
        """Assign a user to a doctor"""
        try:
            result = Doctor.collection.update_one(
                {'_id': ObjectId(doctor_id)},
                {'$addToSet': {'assigned_users': str(user_id)}}
            )
            return result
        except Exception as e:
            logger.error(f"Error assigning user: {e}")
            raise
    
    @staticmethod
    def get_assigned_users(doctor_id):
        """Get all users assigned to a doctor"""
        try:
            doctor = Doctor.find_by_id(doctor_id)
            if doctor and doctor.get('assigned_users'):
                from app.models.user import User
                users = []
                for user_id in doctor['assigned_users']:
                    user = User.find_by_id(ObjectId(user_id))
                    if user:
                        user['_id'] = str(user['_id'])
                        users.append(user)
                return users
            return []
        except Exception as e:
            logger.error(f"Error getting assigned users: {e}")
            return []