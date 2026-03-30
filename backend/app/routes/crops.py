from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ml_service import crop_service
from app.services.weather_service import get_weather
from app.models.history import History
from datetime import datetime
import logging

bp = Blueprint('crops', __name__, url_prefix='/api/crops')
logger = logging.getLogger(__name__)

@bp.route('/recommend', methods=['POST'])
@jwt_required()
def recommend_crops():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        logger.info(f"Recommendation request from user: {user_id}")
        
        weather = get_weather(data['city'], data['state'])
        
        recommendations = crop_service.recommend(
            n=data['N'],
            p=data['P'],
            k=data['K'],
            temperature=weather.get('temperature', 25),
            humidity=weather.get('humidity', 70),
            ph=data['ph'],
            rainfall=data['rainfall']
        )
        
        # Create history entry
        history_data = {
            'user_id': user_id,  # Will be converted to ObjectId in model
            'type': 'crop',
            'input_data': data,
            'recommendations': recommendations,
            'weather_data': weather,
            'created_at': datetime.utcnow()
        }
        
        History.create(history_data)
        logger.info(f"History saved for user: {user_id}")
        
        return jsonify({
            'recommendations': recommendations,
            'weather': weather,
            'soil': {
                'N': data['N'],
                'P': data['P'],
                'K': data['K'],
                'ph': data['ph'],
                'rainfall': data['rainfall']
            },
            'location': {
                'city': data['city'],
                'region': data['state']
            }
        })
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_crop_history():
    try:
        user_id = get_jwt_identity()
        logger.info(f"Fetching crop history for user: {user_id}")
        
        history = History.find_by_user_and_type(user_id, 'crop')
        logger.info(f"Found {len(history)} crop history entries")
        
        return jsonify({'history': history})
    except Exception as e:
        logger.error(f"History fetch error: {e}")
        return jsonify({'history': [], 'error': str(e)}), 200
