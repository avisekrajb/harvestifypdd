from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ml_service import crop_service
from app.services.weather_service import get_weather
from app.models.history import History
from datetime import datetime

bp = Blueprint('crops', __name__, url_prefix='/api/crops')

@bp.route('/recommend', methods=['POST'])
@jwt_required()
def recommend_crops():
    try:
        data = request.get_json()
        
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
        
        History.create({
            'user_id': get_jwt_identity(),
            'type': 'crop',
            'input_data': data,
            'recommendations': recommendations,
            'weather_data': weather,
            'created_at': datetime.utcnow()
        })
        
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
        return jsonify({'error': str(e)}), 500

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_crop_history():
    try:
        user_id = get_jwt_identity()
        history = History.find_by_user_and_type(user_id, 'crop')
        return jsonify({'history': history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500