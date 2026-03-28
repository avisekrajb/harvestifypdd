#!/usr/bin/env python
"""
Training script for Harvestify ML models
Run this script to train and save models
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ml_training import train_all_models

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌾 Harvestify ML Model Training")
    print("="*60 + "\n")
    
    results = train_all_models()
    
    print("\n✅ Training completed successfully!")
    print(f"📊 Crop Model Accuracy: {results['crop_accuracy']:.2%}")
    print(f"📊 Fertilizer Model Accuracy: {results['fertilizer_accuracy']:.2%}")
    print("\n📁 Models saved in: backend/app/models/")