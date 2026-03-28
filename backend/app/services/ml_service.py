import pandas as pd
import numpy as np
import joblib
import os
import logging

logger = logging.getLogger(__name__)

class CropRecommendationService:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.scaler = None
        self.load_model()
    
    def load_model(self):
        """Load trained model from file"""
        model_path = 'app/models/crop_model.pkl'
        try:
            if os.path.exists(model_path):
                model_data = joblib.load(model_path)
                self.model = model_data['model']
                self.label_encoder = model_data['label_encoder']
                self.scaler = model_data['scaler']
                logger.info("Loaded trained crop model")
            else:
                logger.warning("No trained model found, using fallback")
                self.use_fallback = True
        except Exception as e:
            logger.error(f"Error loading crop model: {e}")
            self.use_fallback = True
    
    def recommend(self, n, p, k, temperature, humidity, ph, rainfall):
        """Recommend crops based on input parameters"""
        if self.model is not None:
            try:
                # Scale features
                features = np.array([[n, p, k, temperature, humidity, ph, rainfall]])
                features_scaled = self.scaler.transform(features)
                
                # Predict
                prediction = self.model.predict(features_scaled)
                probabilities = self.model.predict_proba(features_scaled)[0]
                
                # Get top 5 predictions
                top_indices = np.argsort(probabilities)[-5:][::-1]
                recommendations = []
                
                for idx in top_indices:
                    crop = self.label_encoder.inverse_transform([idx])[0]
                    confidence = probabilities[idx]
                    recommendations.append({
                        'crop': crop,
                        'confidence': round(confidence * 100, 2)
                    })
                
                return recommendations
            except Exception as e:
                logger.error(f"Prediction error: {e}")
                return self.fallback_recommendation(n, p, k, ph)
        else:
            return self.fallback_recommendation(n, p, k, ph)
    
    def fallback_recommendation(self, n, p, k, ph):
        """Fallback rule-based recommendations"""
        recommendations = []
        
        # Rule-based recommendations
        if n > 80:
            recommendations.append({'crop': 'Rice', 'confidence': 85})
            recommendations.append({'crop': 'Maize', 'confidence': 75})
        if p > 60:
            recommendations.append({'crop': 'Wheat', 'confidence': 80})
            recommendations.append({'crop': 'Soybean', 'confidence': 70})
        if k > 60:
            recommendations.append({'crop': 'Potato', 'confidence': 78})
        if 6.5 <= ph <= 7.5:
            recommendations.append({'crop': 'Cotton', 'confidence': 72})
        
        # Add more fallbacks if needed
        if len(recommendations) < 3:
            recommendations.append({'crop': 'Groundnut', 'confidence': 65})
            recommendations.append({'crop': 'Sugarcane', 'confidence': 60})
        
        return recommendations[:5]

class FertilizerRecommendationService:
    def __init__(self):
        self.model = None
        self.label_encoders = None
        self.fertilizer_data = None
        self.load_model()
        self.load_data()
    
    def load_model(self):
        """Load trained model from file"""
        model_path = 'app/models/fertilizer_model.pkl'
        try:
            if os.path.exists(model_path):
                model_data = joblib.load(model_path)
                self.model = model_data['model']
                self.label_encoders = model_data['label_encoders']
                logger.info("Loaded trained fertilizer model")
            else:
                logger.warning("No trained fertilizer model found, using fallback")
        except Exception as e:
            logger.error(f"Error loading fertilizer model: {e}")
    
    def load_data(self):
        """Load fertilizer dataset for fallback"""
        try:
            self.fertilizer_data = pd.read_csv('app/data/fertilizer.csv')
        except Exception as e:
            logger.error(f"Error loading fertilizer data: {e}")
            self.fertilizer_data = pd.DataFrame()
    
    def recommend(self, crop, soil_type, n_level, p_level, k_level, ph, weather=None):
        """Recommend fertilizer based on inputs"""
        if self.model is not None and self.label_encoders:
            try:
                # Encode inputs
                level_map = {'Low': 0, 'Medium': 1, 'High': 2}
                
                crop_encoded = self.label_encoders['crop'].transform([crop])[0]
                soil_encoded = self.label_encoders['soil'].transform([soil_type])[0]
                n_encoded = level_map[n_level]
                p_encoded = level_map[p_level]
                k_encoded = level_map[k_level]
                
                # Create feature vector
                features = [[crop_encoded, soil_encoded, n_encoded, p_encoded, k_encoded, ph]]
                
                # Predict
                prediction = self.model.predict(features)[0]
                fertilizer = self.label_encoders['fertilizer'].inverse_transform([prediction])[0]
                
                # Get confidence
                probabilities = self.model.predict_proba(features)[0]
                confidence = probabilities[prediction] * 100
                
                # Get details from dataset
                matched = self.fertilizer_data[self.fertilizer_data['Fertilizer_Name'] == fertilizer].iloc[0]
                
                return {
                    'fertilizer': fertilizer,
                    'n_amount': matched['N_Amount'],
                    'p_amount': matched['P_Amount'],
                    'k_amount': matched['K_Amount'],
                    'tips': matched['Tips'],
                    'confidence': round(confidence, 2)
                }
            except Exception as e:
                logger.error(f"Fertilizer prediction error: {e}")
                return self.fallback_recommendation(crop, n_level, p_level, k_level)
        else:
            return self.fallback_recommendation(crop, n_level, p_level, k_level)
    
    def fallback_recommendation(self, crop, n_level, p_level, k_level):
        """Fallback rule-based fertilizer recommendations"""
        n_map = {'Low': 50, 'Medium': 30, 'High': 10}
        p_map = {'Low': 40, 'Medium': 25, 'High': 5}
        k_map = {'Low': 35, 'Medium': 20, 'High': 8}
        
        return {
            'fertilizer': 'Balanced NPK Fertilizer',
            'n_amount': n_map.get(n_level, 30),
            'p_amount': p_map.get(p_level, 25),
            'k_amount': k_map.get(k_level, 20),
            'tips': f'For {crop}, apply during early growth stage. Water immediately after application.',
            'confidence': 75
        }

# Initialize services
crop_service = CropRecommendationService()
fertilizer_service = FertilizerRecommendationService()