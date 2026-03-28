import os
import google.generativeai as genai
import base64
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBqgIlp8oVXm5HxWMcPalsDX3n15MOLuaE')
genai.configure(api_key=GEMINI_API_KEY)

def analyze_plant_disease(image_data):
    """
    Analyze plant disease using Gemini AI
    """
    try:
        # Use Gemini 2.0 Flash model
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Prepare the image
        image_parts = []
        if image_data:
            # Convert image to base64 if it's bytes
            if isinstance(image_data, bytes):
                image_base64 = base64.b64encode(image_data).decode('utf-8')
                image_parts = [{"mime_type": "image/jpeg", "data": image_base64}]
            else:
                image_parts = [image_data]
        
        # Prompt for disease detection
        detection_prompt = """
        You are an expert plant pathologist. Analyze this plant leaf image and provide:
        
        1. **Disease Name**: What disease is affecting this plant (if any)
        2. **Confidence**: How confident are you in your diagnosis (0-100%)
        3. **Symptoms**: List the visual symptoms visible in the image
        4. **Severity**: Is the infection mild, moderate, or severe?
        
        Format your response as:
        DISEASE: [disease name]
        CONFIDENCE: [percentage]
        SYMPTOMS: [list of symptoms]
        SEVERITY: [mild/moderate/severe]
        """
        
        response = model.generate_content([detection_prompt] + image_parts if image_parts else [detection_prompt])
        return response.text
        
    except Exception as e:
        logger.error(f"Gemini detection error: {e}")
        return None

def get_treatment_recommendations(disease_name, plant_name, severity):
    """
    Get treatment recommendations using Gemini AI
    """
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        treatment_prompt = f"""
        You are an expert agricultural consultant. Provide a detailed treatment plan for:
        
        Plant: {plant_name}
        Disease: {disease_name}
        Severity: {severity}
        
        Provide a comprehensive response with the following sections:
        
        1. **Disease Overview**: Brief description of the disease and its impact
        2. **Organic Remedies**: Natural, eco-friendly treatment options
        3. **Chemical Treatments**: Recommended fungicides/pesticides with application guidelines
        4. **Application Method**: How to apply treatments properly
        5. **Prevention Tips**: How to prevent recurrence
        6. **Post-Treatment Care**: What to do after treatment
        7. **When to Seek Expert Help**: Signs that require professional consultation
        
        Keep the response practical and farmer-friendly. Include specific product names where applicable.
        """
        
        response = model.generate_content(treatment_prompt)
        return response.text
        
    except Exception as e:
        logger.error(f"Gemini treatment error: {e}")
        return None

def analyze_and_treat(image_data):
    """
    Complete analysis: detect disease and provide treatment plan
    """
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Prepare the image
        if isinstance(image_data, bytes):
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            image_parts = [{"mime_type": "image/jpeg", "data": image_base64}]
        else:
            image_parts = [image_data]
        
        # Combined prompt for detection and treatment
        combined_prompt = """
        You are an expert plant pathologist and agricultural consultant. Analyze this plant leaf image and provide:
        
        **1. DIAGNOSIS**
        - Disease Name:
        - Confidence Level (0-100%):
        - Visible Symptoms:
        - Severity (mild/moderate/severe):
        
        **2. TREATMENT PLAN**
        
        **Organic Remedies:**
        - [List 2-3 natural treatment options]
        
        **Chemical Treatments:**
        - [List 2-3 commercial products with application instructions]
        
        **Application Method:**
        - [Step-by-step application instructions]
        
        **Prevention:**
        - [How to prevent this disease in the future]
        
        **Post-Treatment Care:**
        - [What to do after treatment]
        
        **When to Consult Expert:**
        - [Signs that need professional help]
        
        Make the response practical, farmer-friendly, and specific. Include product names and dosages where appropriate.
        """
        
        response = model.generate_content([combined_prompt] + image_parts)
        
        # Parse the response to extract structured data
        response_text = response.text
        
        # Extract disease name
        disease = "Unknown"
        if "Disease Name:" in response_text:
            import re
            match = re.search(r'Disease Name:\s*(.+?)(?:\n|$)', response_text)
            if match:
                disease = match.group(1).strip()
        
        # Extract confidence
        confidence = 0
        if "Confidence Level:" in response_text:
            import re
            match = re.search(r'Confidence Level:\s*(\d+)%', response_text)
            if match:
                confidence = float(match.group(1))
        
        # Extract plant name (try to infer from disease or image context)
        plant_name = "Unknown Plant"
        if "corn" in disease.lower():
            plant_name = "Corn"
        elif "potato" in disease.lower():
            plant_name = "Potato"
        elif "tomato" in disease.lower():
            plant_name = "Tomato"
        elif "rice" in disease.lower():
            plant_name = "Rice"
        elif "wheat" in disease.lower():
            plant_name = "Wheat"
        
        return {
            'disease': disease,
            'confidence': confidence,
            'plantName': plant_name,
            'geminiResponse': response_text
        }
        
    except Exception as e:
        logger.error(f"Gemini analysis error: {e}")
        return {
            'error': f'Failed to analyze with Gemini: {str(e)}',
            'disease': 'Analysis Failed',
            'confidence': 0,
            'plantName': 'Unknown'
        }