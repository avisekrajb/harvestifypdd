from datetime import datetime
from app import db
from bson import ObjectId
import random
import string
import time
import logging

logger = logging.getLogger(__name__)

class Order:
    collection = db.orders
    
    @staticmethod
    def generate_order_id():
        """Generate unique order ID with timestamp"""
        timestamp = int(time.time() * 1000)
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"ORD{timestamp}{random_part}"
    
    @staticmethod
    def create(order_data):
        """Create a new order with unique order_id"""
        # Ensure order_id is unique
        order_id = Order.generate_order_id()
        
        # Check if order_id already exists (rare, but handle)
        while Order.collection.find_one({'order_id': order_id}):
            order_id = Order.generate_order_id()
        
        order_data['order_id'] = order_id
        order_data['created_at'] = datetime.utcnow()
        order_data['updated_at'] = datetime.utcnow()
        order_data['status'] = order_data.get('status', 'pending')
        
        try:
            result = Order.collection.insert_one(order_data)
            logger.info(f"Order created: {order_id}")
            return result
        except Exception as e:
            logger.error(f"Error creating order: {e}")
            raise
    
    @staticmethod
    def find_by_order_id(order_id):
        """Find order by order_id string"""
        return Order.collection.find_one({'order_id': order_id})
    
    @staticmethod
    def find_by_user(user_id):
        """Find orders by user ID"""
        from bson import ObjectId
        try:
            orders = list(Order.collection.find(
                {'user_id': ObjectId(user_id)}
            ).sort('created_at', -1))
            return orders
        except Exception as e:
            logger.error(f"Error finding orders by user: {e}")
            return []
    
    @staticmethod
    def find_by_id(order_id):
        """Find order by ObjectId"""
        try:
            return Order.collection.find_one({'_id': ObjectId(order_id)})
        except Exception as e:
            logger.error(f"Error finding order by id: {e}")
            return None
    
    @staticmethod
    def find_all(limit=100, skip=0):
        """Find all orders"""
        try:
            return list(Order.collection.find()
                        .sort('created_at', -1)
                        .skip(skip)
                        .limit(limit))
        except Exception as e:
            logger.error(f"Error finding all orders: {e}")
            return []
    
    @staticmethod
    def update_status(order_id, status):
        """Update order status"""
        from bson import ObjectId
        try:
            return Order.collection.update_one(
                {'_id': ObjectId(order_id)},
                {
                    '$set': {
                        'status': status,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
        except Exception as e:
            logger.error(f"Error updating order status: {e}")
            return None
    
    @staticmethod
    def count():
        """Get total number of orders"""
        try:
            return Order.collection.count_documents({})
        except Exception as e:
            logger.error(f"Error counting orders: {e}")
            return 0
    
    @staticmethod
    def count_by_status(status):
        """Get number of orders by status"""
        try:
            return Order.collection.count_documents({'status': status})
        except Exception as e:
            logger.error(f"Error counting orders by status: {e}")
            return 0
    
    @staticmethod
    def get_total_revenue():
        """Get total revenue from all orders"""
        try:
            pipeline = [
                {'$group': {'_id': None, 'total': {'$sum': '$total'}}}
            ]
            result = list(Order.collection.aggregate(pipeline))
            return result[0]['total'] if result else 0
        except Exception as e:
            logger.error(f"Error calculating total revenue: {e}")
            return 0