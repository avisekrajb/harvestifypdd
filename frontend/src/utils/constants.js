export const API_URL = process.env.REACT_APP_API_URL || '/api'

export const CROP_OPTIONS = [
  'Rice', 'Wheat', 'Maize', 'Barley', 'Cotton', 'Groundnut', 
  'Soybean', 'Sugarcane', 'Sunflower', 'Potato', 'Tomato', 
  'Onion', 'Chickpea', 'Pigeonpea', 'Mungbean', 'Blackgram',
  'Rapeseed', 'Mustard', 'Linseed', 'Sesame', 'Safflower',
  'Castor', 'Jute', 'Mesta', 'Cowpea', 'Pea', 'Bean',
  'Cabbage', 'Cauliflower', 'Brinjal', 'Chilli', 'Okra'
]

export const SOIL_TYPE_OPTIONS = [
  'Clayey', 'Loamy', 'Sandy', 'Silty', 'Peaty', 'Chalky', 'Saline'
]

export const NUTRIENT_LEVEL_OPTIONS = ['Low', 'Medium', 'High']

export const PAYMENT_METHODS = [
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive the order' },
  { id: 'paytm', name: 'Paytm / UPI', icon: '📱', description: 'Pay using Paytm, Google Pay, PhonePe' }
]

export const ORDER_STATUS = {
  pending: { label: 'Pending', color: '#fbbf24', icon: '⏳' },
  processing: { label: 'Processing', color: '#60a5fa', icon: '🔄' },
  delivered: { label: 'Delivered', color: '#4ade80', icon: '✅' },
  cancelled: { label: 'Cancelled', color: '#f87171', icon: '❌' }
}

export const DISEASE_LIST = [
  { name: 'Leaf Blight', crop: 'Rice', severity: 'High', confidence: 94, treatment: 'Apply copper-based fungicide, improve drainage', prevention: 'Use resistant varieties, crop rotation' },
  { name: 'Powdery Mildew', crop: 'Wheat', severity: 'Medium', confidence: 87, treatment: 'Apply sulfur-based fungicide, increase air circulation', prevention: 'Avoid overhead irrigation, plant resistant varieties' },
  { name: 'Root Rot', crop: 'Vegetables', severity: 'High', confidence: 91, treatment: 'Apply Trichoderma, improve soil drainage', prevention: 'Crop rotation, use disease-free seeds' },
  { name: 'Rust', crop: 'Maize', severity: 'Medium', confidence: 85, treatment: 'Apply azoxystrobin fungicide', prevention: 'Plant resistant hybrids, remove crop debris' },
  { name: 'Bacterial Wilt', crop: 'Tomato', severity: 'Critical', confidence: 96, treatment: 'Remove infected plants, apply copper spray', prevention: 'Use certified seeds, solarize soil' }
]

export const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'All Products', icon: '🛍️' },
  { id: 'fertilizer', label: 'Fertilizers', icon: '🧪' },
  { id: 'pesticide', label: 'Pesticides', icon: '🦟' },
  { id: 'tool', label: 'Tools', icon: '🔧' }
]

export const STATS_DATA = [
  { value: '50,000+', label: 'Farmers Served', icon: '👨‍🌾' },
  { value: '98%', label: 'Satisfaction Rate', icon: '⭐' },
  { value: '500+', label: 'Products', icon: '📦' },
  { value: '24/7', label: 'Expert Support', icon: '💬' }
]

export const FEATURES = [
  { icon: '🌱', title: 'Crop Recommendations', desc: 'AI-powered crop suggestions based on soil and weather', action: '/crops' },
  { icon: '🧪', title: 'Fertilizer Guide', desc: 'Personalized fertilizer recommendations', action: '/fertilizer' },
  { icon: '🔬', title: 'Disease Detection', desc: 'Upload photo for instant disease diagnosis', action: '/disease' },
  { icon: '🛒', title: 'Shop Products', desc: 'Premium agricultural inputs delivered', action: '/products' }
]

export const CONTACT_INFO = [
  { icon: '📞', label: 'Phone', value: '+91 98765 43210' },
  { icon: '✉️', label: 'Email', value: 'support@harvestify.in' },
  { icon: '📍', label: 'Office', value: 'Agri Hub, New Delhi - 110001' }
]