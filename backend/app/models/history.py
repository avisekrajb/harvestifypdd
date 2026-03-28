from datetime import datetime
from app import db

class History:
    collection = db.history
    
    @staticmethod
    def create(history_data):
        return History.collection.insert_one(history_data)
    
    @staticmethod
    def find_by_user_and_type(user_id, type):
        from bson import ObjectId
        return list(History.collection.find(
            {'user_id': ObjectId(user_id), 'type': type}
        ).sort('created_at', -1))
    
    @staticmethod
    def find_by_user(user_id):
        from bson import ObjectId
        return list(History.collection.find(
            {'user_id': ObjectId(user_id)}
        ).sort('created_at', -1))