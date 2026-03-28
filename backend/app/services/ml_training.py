import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import logging

logger = logging.getLogger(__name__)

class CropModelTrainer:
    """Train and save crop recommendation model"""
    
    def __init__(self, data_path='app/data/crops.csv'):
        self.data_path = data_path
        self.model = None
        self.label_encoder = None
        self.scaler = None
        
    def load_data(self):
        """Load and preprocess the crop dataset"""
        try:
            df = pd.read_csv(self.data_path)
            logger.info(f"Loaded {len(df)} records from {self.data_path}")
            logger.info(f"Columns: {df.columns.tolist()}")
            logger.info(f"Target classes: {df['label'].unique()}")
            return df
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def preprocess_data(self, df):
        """Preprocess the data for training"""
        # Separate features and target
        feature_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        X = df[feature_columns]
        y = df['label']
        
        # Encode target labels
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        logger.info(f"Features shape: {X_scaled.shape}")
        logger.info(f"Target classes: {len(self.label_encoder.classes_)}")
        
        return X_scaled, y_encoded
    
    def train_model(self, X, y, test_size=0.2, random_state=42):
        """Train the Random Forest model"""
        # Check if we have enough samples for stratification
        from collections import Counter
        class_counts = Counter(y)
        min_class_count = min(class_counts.values())
        
        if min_class_count < 2:
            logger.warning(f"Some classes have only {min_class_count} sample(s). Using simple split without stratification.")
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state
            )
        else:
            # Use stratified split
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state, stratify=y
            )
        
        logger.info(f"Training set size: {len(X_train)}")
        logger.info(f"Test set size: {len(X_test)}")
        
        # Determine number of estimators based on dataset size
        n_estimators = min(100, max(10, len(X_train) // 10))
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=8,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Model Accuracy: {accuracy:.4f}")
        
        if len(np.unique(y_test)) > 1:
            logger.info("\nClassification Report:")
            logger.info(classification_report(y_test, y_pred, target_names=self.label_encoder.classes_))
        
        return accuracy
    
    def save_model(self, model_path='app/models/crop_model.pkl'):
        """Save the trained model"""
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        model_data = {
            'model': self.model,
            'label_encoder': self.label_encoder,
            'scaler': self.scaler,
            'feature_names': ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        }
        
        joblib.dump(model_data, model_path)
        logger.info(f"Model saved to {model_path}")
    
    def load_model(self, model_path='app/models/crop_model.pkl'):
        """Load a trained model"""
        try:
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.label_encoder = model_data['label_encoder']
            self.scaler = model_data['scaler']
            logger.info(f"Model loaded from {model_path}")
            return True
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def predict(self, features):
        """Make predictions on new data"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        # Scale features
        features_scaled = self.scaler.transform([features])
        
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
    
    def train_and_save(self):
        """Complete training pipeline"""
        logger.info("Starting crop model training...")
        
        # Load data
        df = self.load_data()
        
        # Preprocess
        X, y = self.preprocess_data(df)
        
        # Train
        accuracy = self.train_model(X, y)
        
        # Save
        self.save_model()
        
        logger.info(f"Training completed with accuracy: {accuracy:.4f}")
        return accuracy


class FertilizerModelTrainer:
    """Train and save fertilizer recommendation model"""
    
    def __init__(self, data_path='app/data/fertilizer.csv'):
        self.data_path = data_path
        self.model = None
        self.label_encoders = None
        self.fertilizer_data = None
        
    def load_data(self):
        """Load and preprocess the fertilizer dataset"""
        try:
            df = pd.read_csv(self.data_path)
            logger.info(f"Loaded {len(df)} records from {self.data_path}")
            return df
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def preprocess_data(self, df):
        """Preprocess data for training"""
        # Encode categorical variables
        label_encoders = {}
        
        # Encode Crop
        le_crop = LabelEncoder()
        df['crop_encoded'] = le_crop.fit_transform(df['Crop'])
        label_encoders['crop'] = le_crop
        
        # Encode Soil_Type
        le_soil = LabelEncoder()
        df['soil_encoded'] = le_soil.fit_transform(df['Soil_Type'])
        label_encoders['soil'] = le_soil
        
        # Encode N_Level, P_Level, K_Level
        level_map = {'Low': 0, 'Medium': 1, 'High': 2}
        df['n_encoded'] = df['N_Level'].map(level_map)
        df['p_encoded'] = df['P_Level'].map(level_map)
        df['k_encoded'] = df['K_Level'].map(level_map)
        
        # Features
        feature_columns = ['crop_encoded', 'soil_encoded', 'n_encoded', 'p_encoded', 'k_encoded', 'pH']
        X = df[feature_columns]
        
        # Target - Fertilizer Name
        le_fertilizer = LabelEncoder()
        y = le_fertilizer.fit_transform(df['Fertilizer_Name'])
        label_encoders['fertilizer'] = le_fertilizer
        
        logger.info(f"Features shape: {X.shape}")
        logger.info(f"Unique fertilizers: {len(le_fertilizer.classes_)}")
        
        return X, y, label_encoders
    
    def train_model(self, X, y, test_size=0.2, random_state=42):
        """Train the Random Forest model for fertilizer recommendation"""
        # Check class distribution
        from collections import Counter
        class_counts = Counter(y)
        min_class_count = min(class_counts.values())
        
        logger.info(f"Class distribution: {dict(class_counts)}")
        
        # Determine if we can use stratification
        use_stratify = min_class_count >= 2 and len(y) > 10
        
        if use_stratify:
            try:
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=test_size, random_state=random_state, stratify=y
                )
            except ValueError as e:
                logger.warning(f"Stratification failed: {e}. Using simple split.")
                use_stratify = False
        
        if not use_stratify:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state
            )
        
        logger.info(f"Training set size: {len(X_train)}")
        logger.info(f"Test set size: {len(X_test)}")
        
        # Determine number of estimators
        n_estimators = min(50, max(10, len(X_train) // 5))
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=6,
            min_samples_split=3,
            min_samples_leaf=1,
            random_state=random_state,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Fertilizer Model Accuracy: {accuracy:.4f}")
        
        return accuracy
    
    def save_model(self, model_path='app/models/fertilizer_model.pkl'):
        """Save the trained model"""
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        model_data = {
            'model': self.model,
            'label_encoders': self.label_encoders
        }
        
        joblib.dump(model_data, model_path)
        logger.info(f"Fertilizer model saved to {model_path}")
    
    def load_model(self, model_path='app/models/fertilizer_model.pkl'):
        """Load a trained model"""
        try:
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.label_encoders = model_data['label_encoders']
            logger.info(f"Fertilizer model loaded from {model_path}")
            return True
        except Exception as e:
            logger.error(f"Error loading fertilizer model: {e}")
            return False
    
    def predict(self, crop, soil_type, n_level, p_level, k_level, ph):
        """Make fertilizer prediction"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        # Encode inputs
        crop_encoded = self.label_encoders['crop'].transform([crop])[0]
        soil_encoded = self.label_encoders['soil'].transform([soil_type])[0]
        
        level_map = {'Low': 0, 'Medium': 1, 'High': 2}
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
        
        # Get recommended NPK amounts from dataset
        df = pd.read_csv(self.data_path)
        matched = df[df['Fertilizer_Name'] == fertilizer].iloc[0]
        
        return {
            'fertilizer': fertilizer,
            'n_amount': matched['N_Amount'],
            'p_amount': matched['P_Amount'],
            'k_amount': matched['K_Amount'],
            'tips': matched['Tips'],
            'confidence': round(confidence, 2)
        }
    
    def train_and_save(self):
        """Complete training pipeline"""
        logger.info("Starting fertilizer model training...")
        
        # Load data
        df = self.load_data()
        
        # Preprocess
        X, y, label_encoders = self.preprocess_data(df)
        self.label_encoders = label_encoders
        
        # Train
        accuracy = self.train_model(X, y)
        
        # Save
        self.save_model()
        
        logger.info(f"Fertilizer model training completed with accuracy: {accuracy:.4f}")
        return accuracy


# Training script
def train_all_models():
    """Train both crop and fertilizer models"""
    logger.info("=" * 50)
    logger.info("Training Crop Recommendation Model")
    logger.info("=" * 50)
    
    crop_trainer = CropModelTrainer()
    crop_accuracy = crop_trainer.train_and_save()
    
    logger.info("\n" + "=" * 50)
    logger.info("Training Fertilizer Recommendation Model")
    logger.info("=" * 50)
    
    fertilizer_trainer = FertilizerModelTrainer()
    fertilizer_accuracy = fertilizer_trainer.train_and_save()
    
    logger.info("\n" + "=" * 50)
    logger.info("Training Complete!")
    logger.info(f"Crop Model Accuracy: {crop_accuracy:.4f}")
    logger.info(f"Fertilizer Model Accuracy: {fertilizer_accuracy:.4f}")
    logger.info("=" * 50)
    
    return {
        'crop_accuracy': crop_accuracy,
        'fertilizer_accuracy': fertilizer_accuracy
    }


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Run training
    results = train_all_models()