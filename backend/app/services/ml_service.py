import numpy as np
import joblib
import os
import csv
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler

logger = logging.getLogger(__name__)

class CropRecommendationService:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.scaler = None
        self.is_trained = False
        self.train_from_csv()
    
    def load_csv_data(self, filepath):
        """Load CSV data without pandas"""
        data = []
        try:
            with open(filepath, 'r') as f:
                reader = csv.reader(f)
                headers = next(reader)  # Skip header
                for row in reader:
                    if row and len(row) >= 8:
                        data.append(row)
            return data
        except Exception as e:
            logger.error(f"Error loading CSV {filepath}: {e}")
            return []
    
    def train_from_csv(self):
        """Train model from CSV data"""
        csv_path = 'app/data/crops.csv'
        
        if not os.path.exists(csv_path):
            logger.error(f"Crop CSV file not found: {csv_path}")
            self.is_trained = False
            return
        
        # Load data
        rows = self.load_csv_data(csv_path)
        
        if not rows:
            logger.error("No data loaded from crops.csv")
            self.is_trained = False
            return
        
        # Extract features and labels
        X = []
        y = []
        
        for row in rows:
            try:
                # Features: N, P, K, temperature, humidity, ph, rainfall
                features = [
                    float(row[0]),  # N
                    float(row[1]),  # P
                    float(row[2]),  # K
                    float(row[3]),  # temperature
                    float(row[4]),  # humidity
                    float(row[5]),  # ph
                    float(row[6])   # rainfall
                ]
                label = row[7]  # crop label
                
                X.append(features)
                y.append(label)
            except (ValueError, IndexError) as e:
                logger.warning(f"Skipping invalid row: {row} - {e}")
                continue
        
        if len(X) < 10:
            logger.error(f"Insufficient data for training. Found {len(X)} samples")
            self.is_trained = False
            return
        
        # Convert to numpy arrays
        X = np.array(X, dtype=np.float32)
        
        # Encode labels
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5
        )
        self.model.fit(X_scaled, y_encoded)
        
        self.is_trained = True
        logger.info(f"Crop model trained successfully with {len(X)} samples")
        
        # Save model for future use
        self.save_model()
    
    def save_model(self):
        """Save trained model to file"""
        try:
            model_path = 'app/models/crop_model.pkl'
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            model_data = {
                'model': self.model,
                'label_encoder': self.label_encoder,
                'scaler': self.scaler
            }
            joblib.dump(model_data, model_path)
            logger.info(f"Model saved to {model_path}")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def recommend(self, n, p, k, temperature, humidity, ph, rainfall):
        """Recommend crops based on input parameters"""
        if not self.is_trained or self.model is None:
            logger.error("Model not trained. Cannot make predictions.")
            raise Exception("Crop model not trained. Please ensure crops.csv exists with proper data.")
        
        try:
            # Create feature array
            features = np.array([[n, p, k, temperature, humidity, ph, rainfall]], dtype=np.float32)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Predict probabilities
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Get top 5 predictions
            top_indices = np.argsort(probabilities)[-5:][::-1]
            recommendations = []
            
            for idx in top_indices:
                crop = self.label_encoder.inverse_transform([idx])[0]
                confidence = probabilities[idx] * 100
                recommendations.append({
                    'crop': crop,
                    'confidence': round(confidence, 2)
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise Exception(f"Failed to predict crops: {str(e)}")


class FertilizerRecommendationService:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.fertilizer_data = []
        self.is_trained = False
        self.train_from_csv()
    
    def load_csv_data(self, filepath):
        """Load CSV data without pandas"""
        data = []
        try:
            with open(filepath, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
            return data
        except Exception as e:
            logger.error(f"Error loading CSV {filepath}: {e}")
            return []
    
    def train_from_csv(self):
        """Train model from CSV data"""
        csv_path = 'app/data/fertilizer.csv'
        
        if not os.path.exists(csv_path):
            logger.error(f"Fertilizer CSV file not found: {csv_path}")
            self.is_trained = False
            return
        
        # Load data
        self.fertilizer_data = self.load_csv_data(csv_path)
        
        if not self.fertilizer_data:
            logger.error("No data loaded from fertilizer.csv")
            self.is_trained = False
            return
        
        # Prepare features and labels
        X = []
        y = []
        
        # Level mapping
        level_map = {'Low': 0, 'Medium': 1, 'High': 2}
        
        # Collect unique values for encoding
        crops = set()
        soil_types = set()
        fertilizers = set()
        
        for row in self.fertilizer_data:
            try:
                crops.add(row['Crop'])
                soil_types.add(row['Soil_Type'])
                fertilizers.add(row['Fertilizer_Name'])
            except KeyError as e:
                logger.warning(f"Missing column in CSV: {e}")
                continue
        
        # Create encoders
        self.label_encoders['crop'] = LabelEncoder()
        self.label_encoders['soil'] = LabelEncoder()
        self.label_encoders['fertilizer'] = LabelEncoder()
        
        self.label_encoders['crop'].fit(list(crops))
        self.label_encoders['soil'].fit(list(soil_types))
        self.label_encoders['fertilizer'].fit(list(fertilizers))
        
        # Build feature matrix
        for row in self.fertilizer_data:
            try:
                crop_encoded = self.label_encoders['crop'].transform([row['Crop']])[0]
                soil_encoded = self.label_encoders['soil'].transform([row['Soil_Type']])[0]
                n_encoded = level_map.get(row.get('N_Level', 'Medium'), 1)
                p_encoded = level_map.get(row.get('P_Level', 'Medium'), 1)
                k_encoded = level_map.get(row.get('K_Level', 'Medium'), 1)
                ph = float(row.get('pH', 7.0))
                
                features = [crop_encoded, soil_encoded, n_encoded, p_encoded, k_encoded, ph]
                fertilizer_encoded = self.label_encoders['fertilizer'].transform([row['Fertilizer_Name']])[0]
                
                X.append(features)
                y.append(fertilizer_encoded)
                
            except Exception as e:
                logger.warning(f"Skipping row due to error: {e}")
                continue
        
        if len(X) < 10:
            logger.error(f"Insufficient data for training. Found {len(X)} samples")
            self.is_trained = False
            return
        
        # Convert to numpy arrays
        X = np.array(X, dtype=np.float32)
        y = np.array(y)
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5
        )
        self.model.fit(X, y)
        
        self.is_trained = True
        logger.info(f"Fertilizer model trained successfully with {len(X)} samples")
        
        # Save model
        self.save_model()
    
    def save_model(self):
        """Save trained model to file"""
        try:
            model_path = 'app/models/fertilizer_model.pkl'
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            model_data = {
                'model': self.model,
                'label_encoders': self.label_encoders,
                'fertilizer_data': self.fertilizer_data
            }
            joblib.dump(model_data, model_path)
            logger.info(f"Model saved to {model_path}")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def recommend(self, crop, soil_type, n_level, p_level, k_level, ph, weather=None):
        """Recommend fertilizer based on inputs"""
        if not self.is_trained or self.model is None:
            logger.error("Model not trained. Cannot make predictions.")
            raise Exception("Fertilizer model not trained. Please ensure fertilizer.csv exists with proper data.")
        
        try:
            level_map = {'Low': 0, 'Medium': 1, 'High': 2}
            
            # Encode inputs
            crop_encoded = self.label_encoders['crop'].transform([crop])[0]
            soil_encoded = self.label_encoders['soil'].transform([soil_type])[0]
            n_encoded = level_map.get(n_level, 1)
            p_encoded = level_map.get(p_level, 1)
            k_encoded = level_map.get(k_level, 1)
            
            # Create feature vector
            features = np.array([[crop_encoded, soil_encoded, n_encoded, p_encoded, k_encoded, ph]], dtype=np.float32)
            
            # Predict
            prediction = self.model.predict(features)[0]
            probabilities = self.model.predict_proba(features)[0]
            confidence = probabilities[prediction] * 100
            
            # Get fertilizer name
            fertilizer = self.label_encoders['fertilizer'].inverse_transform([prediction])[0]
            
            # Find matching fertilizer data
            matched = None
            for row in self.fertilizer_data:
                if row['Fertilizer_Name'] == fertilizer:
                    matched = row
                    break
            
            if not matched:
                matched = {'N_Amount': 0, 'P_Amount': 0, 'K_Amount': 0, 'Tips': 'Apply as per recommendations'}
            
            return {
                'fertilizer': fertilizer,
                'n_amount': float(matched.get('N_Amount', 0)),
                'p_amount': float(matched.get('P_Amount', 0)),
                'k_amount': float(matched.get('K_Amount', 0)),
                'tips': matched.get('Tips', f'Apply {fertilizer} as per soil test recommendations.'),
                'confidence': round(confidence, 2)
            }
            
        except Exception as e:
            logger.error(f"Fertilizer prediction error: {e}")
            raise Exception(f"Failed to predict fertilizer: {str(e)}")


# Initialize services
crop_service = CropRecommendationService()
fertilizer_service = FertilizerRecommendationService()
