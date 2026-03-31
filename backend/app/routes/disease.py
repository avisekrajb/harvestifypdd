from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import logging
import base64
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
    """Analyze plant disease using Gemini AI - No mock data, only real AI"""
    try:
        import google.generativeai as genai
        
        GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        if not GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY not configured")
            return None, "Gemini API key not configured"
        
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Use the most stable model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Prepare the image for Gemini
        image_data = {
            "mime_type": "image/jpeg",
            "data": image_base64
        }
        
        # Comprehensive prompt for disease detection with validation
        prompt = """
        You are an expert plant pathologist. Analyze this image carefully.

        FIRST, determine if this image contains a plant leaf. 
        If the image does NOT contain a plant leaf, respond with:
        **VALIDATION_ERROR:** Not a plant leaf image. Please upload a clear photo of a plant leaf.

        If the image contains soil or anything else that is not a plant leaf, respond with:
        **VALIDATION_ERROR:** Not a plant leaf image. Please upload a clear photo of a plant leaf.

        ONLY if the image contains a plant leaf, provide a detailed diagnosis in this format:

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
        return response.text, None
        
    except ImportError:
        logger.error("Google Generative AI not installed")
        return None, "Gemini AI library not installed. Please install: pip install google-generativeai"
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Gemini analysis error: {error_msg}")
        return None, f"Gemini API error: {error_msg}"

def parse_gemini_response(response_text):
    """Parse Gemini response into structured data"""
    import re
    
    # Check for validation error
    if "**VALIDATION_ERROR:**" in response_text:
        match = re.search(r'\*\*VALIDATION_ERROR:\*\*\s*(.+?)(?:\n|$)', response_text)
        error_msg = match.group(1).strip() if match else "Invalid image. Please upload a plant leaf image."
        return {
            'error': True,
            'message': error_msg,
            'disease': 'Validation Error',
            'confidence': 0,
            'plantName': 'Unknown',
            'geminiResponse': response_text
        }
    
    result = {
        'error': False,
        'disease': 'Unknown',
        'confidence': 0,
        'plantName': 'Unknown',
        'geminiResponse': response_text
    }
    
    if not response_text:
        result['error'] = True
        result['message'] = 'No response from AI'
        return result
    
    # Extract disease
    disease_match = re.search(r'\*\*DISEASE:\*\*\s*(.+?)(?:\n|$)', response_text, re.IGNORECASE)
    if disease_match:
        result['disease'] = disease_match.group(1).strip()
    
    # Extract confidence
    confidence_match = re.search(r'\*\*CONFIDENCE:\*\*\s*(\d+)%', response_text, re.IGNORECASE)
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
    """Detect plant disease using Gemini AI only (no mock data)"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PNG, JPG, or JPEG'}), 400
        
        # Read image file
        image_bytes = file.read()
        
        # Encode to base64 for Gemini
        image_base64 = encode_image_to_base64(image_bytes)
        
        # Upload to Cloudinary (always upload for history)
        image_url, public_id = upload_to_cloudinary(image_bytes, file.filename)
        
        # Analyze with Gemini (NO MOCK DATA)
        gemini_response, error_msg = analyze_with_gemini(image_base64)
        
        if not gemini_response:
            # Return error message, no mock data
            return jsonify({
                'error': True,
                'message': error_msg or 'Failed to analyze image with Gemini AI. Please try again.',
                'disease': 'Analysis Failed',
                'confidence': 0,
                'plantName': 'Unknown',
                'image_url': image_url,
                'filename': file.filename
            }), 200
        
        # Parse the response
        result = parse_gemini_response(gemini_response)
        
        # Add image URL to result
        result['image_url'] = image_url
        result['filename'] = file.filename
        
        # Save to history only if analysis was successful and user is logged in
        if not result.get('error'):
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
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Disease detection error: {e}")
        return jsonify({
            'error': True,
            'message': f'Server error: {str(e)}',
            'disease': 'Error',
            'confidence': 0,
            'plantName': 'Unknown'
        }), 500

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
