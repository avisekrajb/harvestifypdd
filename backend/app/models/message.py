from datetime import datetime
from app import db
from bson import ObjectId

class Message:
    collection = db.messages
    
    @staticmethod
    def create(message_data):
        message_data['created_at'] = datetime.utcnow()
        message_data['read'] = False
        return Message.collection.insert_one(message_data)
    
    @staticmethod
    def find_all():
        messages = list(Message.collection.find().sort('created_at', -1))
        for m in messages:
            m['_id'] = str(m['_id'])
        return messages
    
    @staticmethod
    def mark_read(message_id):
        return Message.collection.update_one(
            {'_id': ObjectId(message_id)},
            {'$set': {'read': True, 'updated_at': datetime.utcnow()}}
        )
    
    @staticmethod
    def delete(message_id):
        return Message.collection.delete_one({'_id': ObjectId(message_id)})