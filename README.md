# 🌾 Harvestify - Intelligent Farming Platform

Harvestify is an AI-powered agricultural platform that helps farmers make data-driven decisions for crop selection, fertilizer application, and disease management.

## 🚀 Features

- **Crop Recommendation**: AI-powered crop suggestions based on soil parameters and weather
- **Fertilizer Guide**: Personalized fertilizer recommendations from CSV dataset
- **Disease Detection**: AI-based crop disease identification from images
- **Product Store**: E-commerce for agricultural inputs
- **Order Management**: Track orders and delivery status
- **Expert Consultation**: Connect with agronomists
- **Weather Integration**: Real-time weather data
- **Dark Mode**: Theme switching for comfort

## 🛠️ Tech Stack

### Frontend
- React.js 18
- React Router v6
- Context API for state management
- Axios for API calls
- CSS Modules with dark mode support

### Backend
- Flask 3.0.3
- MongoDB (PyMongo)
- JWT Authentication
- Flask-Mail for emails
- Scikit-learn for ML predictions
- Cloudinary for image uploads

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account
- Cloudinary account
- WeatherAPI key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
python run.py