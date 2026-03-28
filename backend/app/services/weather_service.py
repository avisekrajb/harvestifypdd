import requests
import os
from datetime import datetime

def get_weather(city, state):
    try:
        api_key = os.getenv('WEATHER_API_KEY')
        url = f"http://api.weatherapi.com/v1/current.json?key={api_key}&q={city},{state}"
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'temperature': data['current']['temp_c'],
                'humidity': data['current']['humidity'],
                'wind_speed': data['current']['wind_kph'],
                'condition': data['current']['condition']['text'],
                'icon': data['current']['condition']['icon'],
                'last_updated': data['current']['last_updated']
            }
        else:
            return {
                'temperature': 25.0,
                'humidity': 70.0,
                'condition': 'Data unavailable'
            }
    except Exception as e:
        print(f"Weather API error: {e}")
        return {
            'temperature': 25.0,
            'humidity': 70.0,
            'condition': 'Weather data unavailable'
        }