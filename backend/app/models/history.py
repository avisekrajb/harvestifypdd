from datetime import datetime
from app import db
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class History:
    collection = db.history
    
    @staticmethod
    def create(history_data):
        """Create a new history entry"""
        try:
            # Store user_id as string (not ObjectId) for consistency
            if 'user_id' in history_data:
                # Keep as string to match database
                pass
            result = History.collection.insert_one(history_data)
            logger.info(f"History entry created: {result.inserted_id}")
            return result
        except Exception as e:
            logger.error(f"Error creating history: {e}")
            return None
    
    @staticmethod
    def find_by_user_and_type(user_id, type):
        """Find history by user ID and type - handles both string and ObjectId"""
        try:
            # Try both string and ObjectId formats
            query = {
                '$or': [
                    {'user_id': user_id},  # String format
                    {'user_id': ObjectId(user_id)}  # ObjectId format
                ],
                'type': type
            }
            
            cursor = History.collection.find(query).sort('created_at', -1)
            
            history = []
            for item in cursor:
                # Convert ObjectId to string for JSON
                item['_id'] = str(item['_id'])
                if 'user_id' in item:
                    item['user_id'] = str(item['user_id'])
                history.append(item)
            
            logger.info(f"Found {len(history)} history entries for user {user_id}")
            return history
            
        except Exception as e:
            logger.error(f"Error finding history: {e}")
            return []
    
    @staticmethod
    def find_by_user(user_id):
        """Find all history by user ID"""
        try:
            query = {
                '$or': [
                    {'user_id': user_id},
                    {'user_id': ObjectId(user_id)}
                ]
            }
            cursor = History.collection.find(query).sort('created_at', -1)
            
            history = []
            for item in cursor:
                item['_id'] = str(item['_id'])
                item['user_id'] = str(item['user_id'])
                history.append(item)
            
            return history
        except Exception as e:
            logger.error(f"Error finding user history: {e}")
            return []
