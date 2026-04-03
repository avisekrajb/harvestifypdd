import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    MONGO_DB = os.getenv('MONGODB_DB', 'harvestify')
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-harvestify-secret-2024')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
    WEATHER_API_URL = os.getenv('WEATHER_API_URL', 'http://api.weatherapi.com/v1')
    
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
    
    # Email Configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', MAIL_USERNAME)
    
    # Redis (Optional)
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
