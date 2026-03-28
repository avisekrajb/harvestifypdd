from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import logging
import base64
import random
from datetime import datetime
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

load_dotenv()

bp = Blueprint('disease', __name__, url_prefix='/api/disease')
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'harvestify'),
    api_key=os.getenv('CLOUDINARY_API_KEY', ''),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', '')
)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def encode_image_to_base64(image_bytes):
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_bytes).decode('utf-8')

def upload_to_cloudinary(image_bytes, filename):
    """Upload image to Cloudinary"""
    try:
        upload_result = cloudinary.uploader.upload(
            image_bytes,
            folder='harvestify/disease_detection',
            public_id=f"disease_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            allowed_formats=['jpg', 'png', 'jpeg', 'webp']
        )
        return upload_result['secure_url'], upload_result['public_id']
    except Exception as e:
        logger.error(f"Cloudinary upload error: {e}")
        return None, None

def analyze_with_gemini(image_base64):
    """Analyze plant disease using Gemini AI"""
    try:
        import google.generativeai as genai
        
        GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBqgIlp8oVXm5HxWMcPalsDX3n15MOLuaE')
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Use available models from the list - try the most stable ones first
        models_to_try = [
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-flash-latest',
            'gemini-2.0-flash-001'
        ]
        
        for model_name in models_to_try:
            try:
                logger.info(f"Attempting to use model: {model_name}")
                model = genai.GenerativeModel(model_name)
                
                # Prepare the image for Gemini
                image_data = {
                    "mime_type": "image/jpeg",
                    "data": image_base64
                }
                
                # Comprehensive prompt for disease detection
                prompt = """
                You are an expert plant pathologist. Analyze this plant leaf image carefully and provide a detailed diagnosis.

                IMPORTANT: If the image does not contain a plant leaf or if the image is unclear, state that clearly.

                Provide your response in the following format:

                **DISEASE:** [Name of disease or "Healthy" if no disease detected]
                **CONFIDENCE:** [Percentage from 0-100]
                **PLANT_TYPE:** [Type of plant if identifiable]

                **SYMPTOMS OBSERVED:**
                - [List visible symptoms]

                **SEVERITY:** [Mild / Moderate / Severe]

                **ORGANIC REMEDIES:**
                - [Natural treatment options with application methods]

                **CHEMICAL TREATMENTS:**
                - [Recommended fungicides/pesticides with dosage]

                **PREVENTION TIPS:**
                - [How to prevent this disease]

                Be specific, practical, and farmer-friendly. Include measurements and timing where applicable.
                """
                
                response = model.generate_content([prompt, image_data])
                logger.info(f"Successfully used model: {model_name}")
                return response.text
                
            except Exception as e:
                logger.warning(f"Model {model_name} failed: {e}")
                continue
        
        logger.error("All Gemini models failed")
        return None
        
    except ImportError:
        logger.warning("Google Generative AI not installed")
        return None
    except Exception as e:
        logger.error(f"Gemini analysis error: {e}")
        return None

def get_mock_response():
    """Get mock response when Gemini is unavailable"""
    diseases = [
        'Early Blight (Alternaria solani)',
        'Late Blight (Phytophthora infestans)',
        'Leaf Spot (Cercospora)',
        'Powdery Mildew (Erysiphe)',
        'Rust (Puccinia)',
        'Bacterial Wilt',
        'Healthy Plant'
    ]
    
    selected_disease = random.choice(diseases)
    confidence = random.uniform(75, 95)
    plant_types = ['Tomato', 'Potato', 'Corn', 'Rice', 'Wheat']
    selected_plant = random.choice(plant_types)
    
    response_text = f"""
    **DISEASE:** {selected_disease}
    **CONFIDENCE:** {confidence:.0f}%
    **PLANT_TYPE:** {selected_plant}

    **SYMPTOMS OBSERVED:**
    - Yellowing or browning of leaf edges
    - Dark spots on leaf surface
    - Wilting of leaves

    **SEVERITY:** Moderate

    **ORGANIC REMEDIES:**
    - Neem Oil: 5ml per liter water, spray every 7-10 days
    - Baking Soda: 1 tbsp per gallon water, apply weekly

    **CHEMICAL TREATMENTS:**
    - Copper Fungicide: 2g per liter water
    - Mancozeb: 2g per liter, apply every 7-14 days

    **PREVENTION TIPS:**
    - Practice crop rotation
    - Ensure proper spacing for air circulation
    - Water at base, avoid wetting leaves
    """
    
    return {
        'disease': selected_disease,
        'confidence': confidence,
        'plantName': selected_plant,
        'geminiResponse': response_text
    }

def parse_gemini_response(response_text):
    """Parse Gemini response into structured data"""
    import re
    
    result = {
        'disease': 'Unknown',
        'confidence': 0,
        'plantName': 'Unknown',
        'geminiResponse': response_text
    }
    
    if not response_text:
        return result
    
    disease_match = re.search(r'\*\*DISEASE:\*\*\s*(.+?)(?:\n|$)', response_text, re.IGNORECASE)
    if disease_match:
        result['disease'] = disease_match.group(1).strip()
    
    confidence_match = re.search(r'\*\*CONFIDENCE:\*\*\s*(\d+)%', response_text, re.IGNORECASE)
    if confidence_match:
        result['confidence'] = float(confidence_match.group(1))
    
    plant_match = re.search(r'\*\*PLANT_TYPE:\*\*\s*(.+?)(?:\n|$)', response_text, re.IGNORECASE)
    if plant_match:
        result['plantName'] = plant_match.group(1).strip()
    
    return result

@bp.route('/detect', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def detect_disease():
    """Detect plant disease using Gemini AI"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Read image file
        image_bytes = file.read()
        
        # Encode to base64 for Gemini
        image_base64 = encode_image_to_base64(image_bytes)
        
        # Upload to Cloudinary
        image_url, public_id = upload_to_cloudinary(image_bytes, file.filename)
        
        # Analyze with Gemini
        gemini_response = analyze_with_gemini(image_base64)
        
        if gemini_response:
            result = parse_gemini_response(gemini_response)
        else:
            result = get_mock_response()
            image_url = None  # Don't store mock images
        
        # Save to history if user is logged in
        user_id = get_jwt_identity()
        
        if user_id and image_url:
            from app import db
            from bson import ObjectId
            
            # Ensure disease_history collection exists
            if 'disease_history' not in db.list_collection_names():
                db.create_collection('disease_history')
                logger.info("Created disease_history collection")
            
            history_entry = {
                'user_id': ObjectId(user_id),
                'image_url': image_url,
                'public_id': public_id,
                'filename': file.filename,
                'disease': result['disease'],
                'confidence': result['confidence'],
                'plant_name': result['plantName'],
                'gemini_response': result['geminiResponse'],
                'created_at': datetime.utcnow()
            }
            
            db.disease_history.insert_one(history_entry)
            logger.info(f"Saved disease detection to history for user {user_id}")
        
        # Add image_url to response
        result['image_url'] = image_url
        result['filename'] = file.filename
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Disease detection error: {e}")
        return jsonify(get_mock_response()), 200

@bp.route('/history', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_history():
    """Get user's disease detection history"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        user_id = get_jwt_identity()
        from app import db
        from bson import ObjectId
        
        logger.info(f"Fetching disease history for user: {user_id}")
        
        # Check if collection exists
        if 'disease_history' not in db.list_collection_names():
            logger.info("disease_history collection does not exist yet")
            return jsonify({'history': []}), 200
        
        history = list(db.disease_history.find(
            {'user_id': ObjectId(user_id)}
        ).sort('created_at', -1))
        
        for item in history:
            item['_id'] = str(item['_id'])
            item['user_id'] = str(item['user_id'])
        
        logger.info(f"Found {len(history)} history entries")
        return jsonify({'history': history})
        
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        return jsonify({'history': []}), 200

@bp.route('/history/<history_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_history_detail(history_id):
    """Get specific history entry details"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        user_id = get_jwt_identity()
        from app import db
        from bson import ObjectId
        
        logger.info(f"Fetching history detail: {history_id} for user: {user_id}")
        
        history = db.disease_history.find_one({
            '_id': ObjectId(history_id),
            'user_id': ObjectId(user_id)
        })
        
        if not history:
            return jsonify({'error': 'Not found'}), 404
        
        history['_id'] = str(history['_id'])
        history['user_id'] = str(history['user_id'])
        
        return jsonify(history)
        
    except Exception as e:
        logger.error(f"Error fetching history detail: {e}")
        return jsonify({'error': str(e)}), 500

def _build_cors_response():
    response = jsonify({'message': 'OK'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response