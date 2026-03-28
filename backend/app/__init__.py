from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv
import os
import logging
import random
import string
from datetime import datetime

load_dotenv()

bcrypt = Bcrypt()
jwt = JWTManager()
mail = Mail()
mongo_client = None
db = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_indexes():
    """Create MongoDB indexes safely with cleanup"""
    try:
        # Users collection indexes
        users_collection = db.users
        existing_indexes = users_collection.index_information()
        
        # Drop existing email index if it exists to recreate properly
        if 'email_1' in existing_indexes:
            try:
                users_collection.drop_index('email_1')
                logger.info("Dropped existing email index")
            except:
                pass
        
        # Create email index
        users_collection.create_index([('email', ASCENDING)], unique=True, name='email_1')
        logger.info("Created email index on users collection")
        
        # Orders collection indexes
        orders_collection = db.orders
        existing_orders_indexes = orders_collection.index_information()
        
        # Drop existing order_id index if it exists
        if 'order_id_1' in existing_orders_indexes:
            try:
                orders_collection.drop_index('order_id_1')
                logger.info("Dropped existing order_id index")
            except:
                pass
        
        # Fix documents with null or missing order_id
        def generate_order_id():
            return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        
        # Find documents with null or missing order_id
        null_orders = orders_collection.find({
            '$or': [
                {'order_id': None},
                {'order_id': {'$exists': False}}
            ]
        })
        
        count = 0
        for order in null_orders:
            orders_collection.update_one(
                {'_id': order['_id']},
                {'$set': {'order_id': generate_order_id()}}
            )
            count += 1
        
        logger.info(f"Fixed {count} orders with missing order_id")
        
        # Create unique order_id index
        orders_collection.create_index([('order_id', ASCENDING)], unique=True, sparse=True, name='order_id_1')
        logger.info("Created order_id index on orders collection")
        
        # Create user_id index
        if 'user_id_1' not in orders_collection.index_information():
            orders_collection.create_index([('user_id', ASCENDING)], name='user_id_1')
            logger.info("Created user_id index on orders collection")
        
        # Products collection indexes
        products_collection = db.products
        existing_products_indexes = products_collection.index_information()
        
        if 'name_1' not in existing_products_indexes:
            products_collection.create_index([('name', ASCENDING)], name='name_1')
            logger.info("Created name index on products collection")
        
        # History collection indexes
        history_collection = db.history
        existing_history_indexes = history_collection.index_information()
        
        if 'user_id_1' not in existing_history_indexes:
            history_collection.create_index([('user_id', ASCENDING)], name='user_id_1')
            logger.info("Created user_id index on history collection")
        
        if 'created_at_-1' not in existing_history_indexes:
            history_collection.create_index([('created_at', -1)], name='created_at_-1')
            logger.info("Created created_at index on history collection")
        
        # Disease history collection indexes
        if 'disease_history' in db.list_collection_names():
            disease_history_collection = db.disease_history
            if 'user_id_1' not in disease_history_collection.index_information():
                disease_history_collection.create_index([('user_id', ASCENDING)], name='user_id_1')
                logger.info("Created user_id index on disease_history collection")
            
            if 'created_at_-1' not in disease_history_collection.index_information():
                disease_history_collection.create_index([('created_at', -1)], name='created_at_-1')
                logger.info("Created created_at index on disease_history collection")
        
        # Doctor advice collection indexes
        if 'doctor_advice' in db.list_collection_names():
            doctor_advice_collection = db.doctor_advice
            if 'doctor_id_1' not in doctor_advice_collection.index_information():
                doctor_advice_collection.create_index([('doctor_id', ASCENDING)], name='doctor_id_1')
                logger.info("Created doctor_id index on doctor_advice collection")
            
            if 'user_id_1' not in doctor_advice_collection.index_information():
                doctor_advice_collection.create_index([('user_id', ASCENDING)], name='user_id_1')
                logger.info("Created user_id index on doctor_advice collection")
        
        # Consultations collection indexes
        if 'consultations' in db.list_collection_names():
            consultations_collection = db.consultations
            if 'user_id_1' not in consultations_collection.index_information():
                consultations_collection.create_index([('user_id', ASCENDING)], name='user_id_1')
                logger.info("Created user_id index on consultations collection")
            
            if 'doctor_id_1' not in consultations_collection.index_information():
                consultations_collection.create_index([('doctor_id', ASCENDING)], name='doctor_id_1')
                logger.info("Created doctor_id index on consultations collection")
        
        logger.info("All indexes created successfully")
        
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")
        logger.info("Continuing with existing indexes...")

def seed_initial_data():
    """Seed initial data into collections"""
    try:
        # Seed admin user if not exists
        from app.models.user import User
        
        admin = User.find_by_email('admin@harvestify.com')
        if not admin:
            logger.info("Creating admin user...")
            admin_data = {
                'name': 'Admin',
                'email': 'admin@harvestify.com',
                'password': 'admin123',
                'role': 'admin',
                'phone': '9876543210',
                'address': 'Admin Office'
            }
            User.create(admin_data)
            logger.info("Admin user created - Email: admin@harvestify.com, Password: admin123")
        
        # Seed a sample doctor for testing
        doctor = User.find_by_email('doctor@harvestify.com')
        if not doctor:
            logger.info("Creating sample doctor user...")
            doctor_data = {
                'name': 'Sample Doctor',
                'email': 'doctor@harvestify.com',
                'password': 'doctor123',
                'role': 'doctor',
                'phone': '9876543211',
                'address': 'Doctor Clinic'
            }
            doctor_id = User.create(doctor_data)
            
            # Create doctor profile
            doctor_profile = {
                'name': 'Sample Doctor',
                'speciality': 'Crop Disease Specialist',
                'phone': '9876543211',
                'email': 'doctor@harvestify.com',
                'bio': 'Experienced agronomist with 10+ years in crop disease management',
                'user_id': str(doctor_id.inserted_id),
                'assigned_users': [],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            db.doctors.insert_one(doctor_profile)
            logger.info("Sample doctor created - Email: doctor@harvestify.com, Password: doctor123")
        
        # Seed products
        from app.models.product import Product
        seeded = Product.seed_initial_products()
        if seeded:
            logger.info("Products seeded successfully")
        
        # Create disease_history collection if it doesn't exist
        if 'disease_history' not in db.list_collection_names():
            db.create_collection('disease_history')
            logger.info("Disease history collection created")
        
        # Create consultations collection if it doesn't exist
        if 'consultations' not in db.list_collection_names():
            db.create_collection('consultations')
            logger.info("Consultations collection created")
        
    except Exception as e:
        logger.error(f"Error seeding data: {e}")

def create_app():
    app = Flask(__name__)
    
    app.config.from_object('app.config.Config')
    
    # Configure CORS properly for production
    cors_origins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:80',
        'http://localhost',
        'https://harvestifyfinalyear.onrender.com',  # Your frontend URL
        'https://harvestifypdd-1.onrender.com',      # Your backend URL
    ]
    
    CORS(app, 
         origins=cors_origins,
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    # Initialize extensions
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    
    # MongoDB connection
    global mongo_client, db
    try:
        mongo_client = MongoClient(app.config['MONGO_URI'])
        db = mongo_client[app.config['MONGO_DB']]
        
        # Test connection
        mongo_client.admin.command('ping')
        logger.info("Connected to MongoDB successfully")
        
        # Create indexes
        create_indexes()
        
        # Seed initial data
        seed_initial_data()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise
    
    # Serve uploaded files
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory('uploads', filename)
    
    # Register blueprints - IMPORTANT: Import here to avoid circular imports
    from app.routes import auth, crops, fertilizer, products, orders, profile, admin, weather, doctor, user, disease
    app.register_blueprint(auth.bp)
    app.register_blueprint(crops.bp)
    app.register_blueprint(fertilizer.bp)
    app.register_blueprint(products.bp)
    app.register_blueprint(orders.bp)
    app.register_blueprint(profile.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(weather.bp)
    app.register_blueprint(doctor.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(disease.bp)
    
    # Add health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Harvestify API is running'})
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    # Add OPTIONS handler for preflight requests
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            response = app.make_default_options_response()
            # Allow all origins for preflight
            origin = request.headers.get('Origin', '*')
            response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
            response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.headers.add('Access-Control-Max-Age', '86400')
            return response
    
    return app
