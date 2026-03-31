from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import logging
import base64
from datetime import datetime
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

load_dotenv()

bp = Blueprint('disease', __name__, url_prefix='/api/disease')
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

# Configure Cloudinary - reads from .env
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
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
    """Analyze plant disease using Gemini AI - Reads API key from .env"""
    try:
        import google.generativeai as genai
        
        # Read API key from environment variable only
        GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        
        if not GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY not found in environment variables")
            return None
        
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Use the working model from test
        model_name = 'gemini-2.5-flash'
        
        logger.info(f"Using model: {model_name}")
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
        
        if response and response.text:
            logger.info("Successfully analyzed with Gemini")
            return response.text
        else:
            logger.error("Empty response from Gemini")
            return None
        
    except ImportError:
        logger.error("google-generativeai not installed. Run: pip install google-generativeai")
        return None
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return None

def parse_gemini_response(response_text):
    """Parse Gemini response into structured data"""
    import re
    
    result = {
        'disease': 'Unknown',
        'confidence': 0,
        'plantName': 'Unknown',
        'geminiResponse': response_text or 'No analysis available'
    }
    
    if not response_text:
        return result
    
    # Extract disease
    disease_match = re.search(r'\*\*DISEASE:\*\*\s*(.+?)(?:\n|$)', response_text, re.IGNORECASE)
    if disease_match:
        result['disease'] = disease_match.group(1).strip()
    
    # Extract confidence
    confidence_match = re.search(r'\*\*CONFIDENCE:\*\*\s*(\d+)%', response_text, re.IGNORECASE)
    if confidence_match:
        result['confidence'] = float(confidence_match.group(1))
    else:
        # Try alternative format
        confidence_match = re.search(r'(\d+)%', response_text)
        if confidence_match:
            result['confidence'] = float(confidence_match.group(1))
    
    # Extract plant type
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
        image_base64 = encode_image_to_base64(image_bytes)
        
        # Upload to Cloudinary
        image_url, public_id = upload_to_cloudinary(image_bytes, file.filename)
        
        # Analyze with Gemini
        gemini_response = analyze_with_gemini(image_base64)
        
        if gemini_response:
            result = parse_gemini_response(gemini_response)
            result['geminiResponse'] = gemini_response
        else:
            result = {
                'disease': 'Analysis Failed',
                'confidence': 0,
                'plantName': 'Unknown',
                'geminiResponse': 'Unable to analyze the image. Please ensure it is a clear plant leaf photo and try again.',
                'error': 'Gemini API failed'
            }
        
        result['image_url'] = image_url
        result['filename'] = file.filename
        
        # Save to history if user is logged in and analysis succeeded
        user_id = get_jwt_identity()
        if user_id and image_url and result.get('disease') != 'Analysis Failed':
            from app import db
            from bson import ObjectId
            
            if 'disease_history' not in db.list_collection_names():
                db.create_collection('disease_history')
            
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
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Disease detection error: {e}")
        return jsonify({
            'disease': 'Error',
            'confidence': 0,
            'plantName': 'Unknown',
            'geminiResponse': f'Server error: {str(e)}',
            'error': str(e)
        }), 200

def _build_cors_response():
    response = jsonify({'message': 'OK'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response
