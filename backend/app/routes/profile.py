from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from bson import ObjectId

bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@bp.route('/', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    try:
        user_id = get_jwt_identity()
        
        if request.method == 'GET':
            user = User.find_by_id(ObjectId(user_id))
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'phone': user.get('phone', ''),
                'address': user.get('address', '')
            })
        
        elif request.method == 'PUT':
            data = request.get_json()
            update_data = {}
            
            if 'name' in data:
                update_data['name'] = data['name']
            if 'phone' in data:
                update_data['phone'] = data['phone']
            if 'address' in data:
                update_data['address'] = data['address']
            
            User.update(user_id, update_data)
            return jsonify({'message': 'Profile updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        user = User.find_by_id(ObjectId(user_id))
        
        if not User.verify_password(user, data.get('current_password')):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        User.update(user_id, {'password': data.get('new_password')})
        
        return jsonify({'message': 'Password changed successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500