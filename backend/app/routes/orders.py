from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.order import Order
from app.models.user import User
from app.services.email_service import send_order_confirmation, send_order_status_update
from bson import ObjectId
from datetime import datetime  # Add this import
import logging
import random
import string

bp = Blueprint('orders', __name__, url_prefix='/api/orders')
logger = logging.getLogger(__name__)

@bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        user_id = get_jwt_identity()
        logger.info(f"Fetching orders for user: {user_id}")
        
        orders = list(Order.collection.find({'user_id': ObjectId(user_id)}).sort('created_at', -1))
        
        # Convert ObjectId to string for JSON serialization
        for order in orders:
            order['_id'] = str(order['_id'])
            order['user_id'] = str(order['user_id'])
            if 'items' in order:
                for item in order['items']:
                    if 'id' in item and not isinstance(item['id'], str):
                        item['id'] = str(item['id'])
        
        logger.info(f"Found {len(orders)} orders for user")
        return jsonify({'orders': orders})
        
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        logger.info(f"Creating order for user: {user_id}")
        logger.info(f"Order data: {data}")
        
        # Generate order ID
        order_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        
        # Prepare order data
        order_data = {
            'user_id': ObjectId(user_id),
            'order_id': order_id,
            'name': data.get('name'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'address': data.get('address'),
            'items': data.get('items', []),
            'subtotal': data.get('subtotal', 0),
            'shipping': data.get('shipping', 0),
            'total': data.get('total', 0),
            'payment_method': data.get('payment_method', 'cod'),
            'transaction_id': data.get('transaction_id'),
            'screenshot': data.get('screenshot'),
            'want_consultation': data.get('want_consultation', False),
            'status': 'pending',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert order
        result = Order.collection.insert_one(order_data)
        logger.info(f"Order created with ID: {result.inserted_id}")
        
        # Send confirmation email
        try:
            user = User.find_by_id(ObjectId(user_id))
            if user and user.get('email'):
                send_order_confirmation(
                    user['email'], 
                    order_id, 
                    data.get('items', []), 
                    data.get('total', 0)
                )
                logger.info(f"Confirmation email sent to {user['email']}")
        except Exception as email_error:
            logger.error(f"Failed to send confirmation email: {email_error}")
        
        return jsonify({
            'message': 'Order placed successfully',
            'order_id': str(result.inserted_id),
            'order_number': order_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@bp.route('/<order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    try:
        data = request.get_json()
        status = data.get('status')
        
        Order.collection.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'status': status, 'updated_at': datetime.utcnow()}}
        )
        
        order = Order.collection.find_one({'_id': ObjectId(order_id)})
        if order:
            user = User.find_by_id(order['user_id'])
            if user and user.get('email'):
                send_order_status_update(user['email'], order['order_id'], status)
        
        return jsonify({'message': 'Order status updated'})
        
    except Exception as e:
        logger.error(f"Error updating order status: {e}")
        return jsonify({'error': str(e)}), 500
    
    
    
    # Add this new route to get a single order by order_id (the generated order number like TDDVZ9L8MM)
@bp.route('/by-order-number/<order_number>', methods=['GET'])
def get_order_by_order_number(order_number):
    """Get order by order number (public route - no auth required for tracking)"""
    try:
        logger.info(f"Fetching order by order number: {order_number}")
        
        order = Order.collection.find_one({'order_id': order_number})
        
        if not order:
            logger.warning(f"Order not found with order number: {order_number}")
            return jsonify({'error': 'Order not found'}), 404
        
        # Convert ObjectId to string for JSON serialization
        order['_id'] = str(order['_id'])
        order['user_id'] = str(order['user_id'])
        if 'items' in order:
            for item in order['items']:
                if 'id' in item and not isinstance(item['id'], str):
                    item['id'] = str(item['id'])
        
        logger.info(f"Order found: {order['order_id']}")
        return jsonify({'order': order})
        
    except Exception as e:
        logger.error(f"Error fetching order: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@bp.route('/<order_id>', methods=['GET'])
@jwt_required()
def get_order_by_id(order_id):
    """Get order by MongoDB ObjectId (requires authentication)"""
    try:
        user_id = get_jwt_identity()
        
        # Try to find by ObjectId
        try:
            obj_id = ObjectId(order_id)
            order = Order.collection.find_one({'_id': obj_id, 'user_id': ObjectId(user_id)})
        except:
            # If not valid ObjectId, try to find by order_id string
            order = Order.collection.find_one({'order_id': order_id, 'user_id': ObjectId(user_id)})
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Convert ObjectId to string
        order['_id'] = str(order['_id'])
        order['user_id'] = str(order['user_id'])
        if 'items' in order:
            for item in order['items']:
                if 'id' in item and not isinstance(item['id'], str):
                    item['id'] = str(item['id'])
        
        return jsonify({'order': order})
        
    except Exception as e:
        logger.error(f"Error fetching order: {e}")
        return jsonify({'error': str(e)}), 500