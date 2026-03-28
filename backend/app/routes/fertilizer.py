from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ml_service import fertilizer_service
from app.services.weather_service import get_weather
from app.models.history import History
from datetime import datetime

bp = Blueprint('fertilizer', __name__, url_prefix='/api/fertilizer')

@bp.route('/predict', methods=['POST'])
@jwt_required()
def predict_fertilizer():
    try:
        data = request.get_json()
        
        weather = get_weather(data['city'], data['state']) if data.get('city') else None
        
        recommendation = fertilizer_service.recommend(
            crop=data['crop'],
            soil_type=data['soilType'],
            n_level=data['nLevel'],
            p_level=data['pLevel'],
            k_level=data['kLevel'],
            ph=float(data['ph']),
            weather=weather
        )
        
        History.create({
            'user_id': get_jwt_identity(),
            'type': 'fertilizer',
            'input_data': data,
            'recommendations': [recommendation],
            'weather_data': weather,
            'created_at': datetime.utcnow()
        })
        
        return jsonify(recommendation)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_fertilizer_history():
    try:
        user_id = get_jwt_identity()
        history = History.find_by_user_and_type(user_id, 'fertilizer')
        return jsonify({'history': history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500