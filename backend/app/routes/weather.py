from flask import Blueprint, request, jsonify
from app.services.weather_service import get_weather

bp = Blueprint('weather', __name__, url_prefix='/api/weather')

@bp.route('/', methods=['GET'])
def get_current_weather():
    try:
        city = request.args.get('city')
        state = request.args.get('state')
        
        if not city or not state:
            return jsonify({'error': 'City and state required'}), 400
        
        weather = get_weather(city, state)
        return jsonify(weather)
    except Exception as e:
        return jsonify({'error': str(e)}), 500