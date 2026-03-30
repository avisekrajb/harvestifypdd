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
            # Ensure collection exists
            if History.collection is None:
                logger.error("History collection is None")
                return None
            
            result = History.collection.insert_one(history_data)
            logger.info(f"History entry created with id: {result.inserted_id}")
            return result
        except Exception as e:
            logger.error(f"Error creating history entry: {e}")
            return None
    
    @staticmethod
    def find_by_user_and_type(user_id, type):
        """Find history by user ID and type"""
        try:
            from bson import ObjectId
            
            # Validate user_id
            if not user_id:
                logger.warning("No user_id provided")
                return []
            
            # Convert to ObjectId
            try:
                obj_id = ObjectId(user_id)
            except:
                logger.warning(f"Invalid user_id format: {user_id}")
                return []
            
            # Query history
            cursor = History.collection.find({
                'user_id': obj_id,
                'type': type
            }).sort('created_at', -1)
            
            history = []
            for item in cursor:
                # Convert ObjectId to string for JSON serialization
                item['_id'] = str(item['_id'])
                if 'user_id' in item:
                    item['user_id'] = str(item['user_id'])
                history.append(item)
            
            logger.info(f"Found {len(history)} history entries for user {user_id} and type {type}")
            return history
            
        except Exception as e:
            logger.error(f"Error finding history: {e}")
            return []
    
    @staticmethod
    def find_by_user(user_id):
        """Find all history by user ID"""
        try:
            from bson import ObjectId
            
            if not user_id:
                return []
            
            try:
                obj_id = ObjectId(user_id)
            except:
                return []
            
            cursor = History.collection.find({
                'user_id': obj_id
            }).sort('created_at', -1)
            
            history = []
            for item in cursor:
                item['_id'] = str(item['_id'])
                item['user_id'] = str(item['user_id'])
                history.append(item)
            
            return history
            
        except Exception as e:
            logger.error(f"Error finding user history: {e}")
            return []
    
    @staticmethod
    def delete_by_user(user_id):
        """Delete all history for a user"""
        try:
            from bson import ObjectId
            
            result = History.collection.delete_many({'user_id': ObjectId(user_id)})
            logger.info(f"Deleted {result.deleted_count} history entries for user {user_id}")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Error deleting history: {e}")
            return 0
