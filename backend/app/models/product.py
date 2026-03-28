from datetime import datetime  # Add this import
from app import db
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class Product:
    collection = db.products
    
    @staticmethod
    def create(product_data):
        product_data['created_at'] = datetime.utcnow()
        product_data['updated_at'] = datetime.utcnow()
        return Product.collection.insert_one(product_data)
    
    @staticmethod
    def find_all(category=None):
        query = {}
        if category and category != 'all':
            query['category'] = category
        products = list(Product.collection.find(query).sort('created_at', -1))
        for p in products:
            p['_id'] = str(p['_id'])
        return products
    
    @staticmethod
    def find_by_id(product_id):
        product = Product.collection.find_one({'_id': ObjectId(product_id)})
        if product:
            product['_id'] = str(product['_id'])
        return product
    
    @staticmethod
    def update(product_id, update_data):
        update_data['updated_at'] = datetime.utcnow()
        return Product.collection.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': update_data}
        )
    
    @staticmethod
    def delete(product_id):
        return Product.collection.delete_one({'_id': ObjectId(product_id)})
    
    @staticmethod
    def seed_initial_products():
        """Seed initial products if collection is empty"""
        if Product.collection.count_documents({}) == 0:
            logger.info("Seeding initial products...")
            
            initial_products = [
                {
                    "id": 1,
                    "name": "NitroBoost Pro",
                    "category": "fertilizer",
                    "price": 849,
                    "original_price": 1099,
                    "rating": 4.7,
                    "reviews": 312,
                    "badge": "Best Seller",
                    "image": "🌱",
                    "photo": None,
                    "color": "#4ade80",
                    "description": "High-nitrogen slow-release fertilizer for leafy greens and cereals. NPK 30-10-10 formula with micronutrients.",
                    "how_to_use": "Apply 2–3 kg per acre. Mix thoroughly into topsoil before sowing. Reapply after 45 days.",
                    "benefits": ["Boosts vegetative growth", "Slow-release formula", "Contains zinc & iron", "pH balanced"],
                    "tags": ["Nitrogen", "Slow Release", "All Crops"],
                    "stock": 120,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "id": 2,
                    "name": "PhosMax Gold",
                    "category": "fertilizer",
                    "price": 699,
                    "original_price": 899,
                    "rating": 4.5,
                    "reviews": 218,
                    "badge": "Popular",
                    "image": "🌾",
                    "photo": None,
                    "color": "#fbbf24",
                    "description": "Phosphorus-rich fertilizer that promotes root development and flowering. Ideal for wheat, maize, and vegetables.",
                    "how_to_use": "Broadcast 3 kg/acre during land preparation. Can be banded near seed rows.",
                    "benefits": ["Root strengthening", "Improved flowering", "Disease resistance", "High solubility"],
                    "tags": ["Phosphorus", "Root Care", "Wheat"],
                    "stock": 85,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "id": 3,
                    "name": "OrganoPower Compost",
                    "category": "fertilizer",
                    "price": 550,
                    "original_price": 650,
                    "rating": 4.8,
                    "reviews": 457,
                    "badge": "Eco Choice",
                    "image": "🍂",
                    "photo": None,
                    "color": "#a78bfa",
                    "description": "100% organic composted manure enriched with beneficial microbes. Improves soil structure and water retention.",
                    "how_to_use": "Apply 5 tonnes/acre and mix with soil. Safe for organic farming certification.",
                    "benefits": ["100% organic", "Improves soil health", "Long-lasting effects", "Microbe enriched"],
                    "tags": ["Organic", "Soil Health", "All Crops"],
                    "stock": 200,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "id": 4,
                    "name": "PotaShield Plus",
                    "category": "fertilizer",
                    "price": 780,
                    "original_price": 980,
                    "rating": 4.4,
                    "reviews": 189,
                    "badge": None,
                    "image": "🥔",
                    "photo": None,
                    "color": "#f472b6",
                    "description": "Potassium sulphate fertilizer that enhances fruit quality, shelf life, and drought tolerance.",
                    "how_to_use": "Apply 2 kg/acre as basal dose. Top-dress at fruit development stage. Avoid contact with foliage.",
                    "benefits": ["Drought tolerance", "Improved fruit quality", "Better shelf life", "Low chloride"],
                    "tags": ["Potassium", "Fruit Quality", "Vegetables"],
                    "stock": 60,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "id": 5,
                    "name": "ZincStar Micronutrient",
                    "category": "fertilizer",
                    "price": 420,
                    "original_price": 520,
                    "rating": 4.6,
                    "reviews": 143,
                    "badge": "New",
                    "image": "⚡",
                    "photo": None,
                    "color": "#34d399",
                    "description": "Chelated zinc micronutrient fertilizer correcting zinc deficiency in rice, wheat, and maize.",
                    "how_to_use": "Foliar spray: 2g/litre water. Soil application: 5 kg/acre at early vegetative stage.",
                    "benefits": ["Corrects zinc deficiency", "Chelated formula", "Fast absorption", "Suitable for spray"],
                    "tags": ["Micronutrient", "Zinc", "Rice"],
                    "stock": 150,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "id": 6,
                    "name": "FoliarFeed Supreme",
                    "category": "fertilizer",
                    "price": 650,
                    "original_price": 800,
                    "rating": 4.3,
                    "reviews": 97,
                    "badge": None,
                    "image": "💧",
                    "photo": None,
                    "color": "#60a5fa",
                    "description": "Complete water-soluble NPK 19-19-19 with trace elements for foliar application and drip irrigation.",
                    "how_to_use": "Dissolve 2g/litre water. Spray on both leaf surfaces. Apply every 15 days.",
                    "benefits": ["Water soluble", "Drip compatible", "Quick action", "Complete nutrition"],
                    "tags": ["Foliar", "Drip Irrigation", "All Crops"],
                    "stock": 75,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "id": 7,
                    "name": "BioBoost Liquid",
                    "category": "fertilizer",
                    "price": 380,
                    "original_price": 450,
                    "rating": 4.4,
                    "reviews": 156,
                    "badge": "Organic",
                    "image": "💚",
                    "photo": None,
                    "color": "#22c55e",
                    "description": "Bio-fertilizer with beneficial microorganisms for improved nutrient uptake.",
                    "how_to_use": "Mix 5ml per litre of water. Apply as soil drench at 15-day intervals.",
                    "benefits": ["Enhances nutrient absorption", "Improves soil microbial activity", "Environment friendly", "Increases yield"],
                    "tags": ["Bio", "Organic", "Soil Health"],
                    "stock": 200,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "id": 8,
                    "name": "CropGuard Insecticide",
                    "category": "pesticide",
                    "price": 450,
                    "original_price": 550,
                    "rating": 4.2,
                    "reviews": 89,
                    "badge": "Effective",
                    "image": "🦟",
                    "photo": None,
                    "color": "#ef4444",
                    "description": "Broad-spectrum insecticide for controlling major crop pests.",
                    "how_to_use": "Spray 2ml per litre of water. Apply during early morning or late evening.",
                    "benefits": ["Controls wide range of pests", "Quick action", "Systemic protection", "Long residual effect"],
                    "tags": ["Insecticide", "Pest Control", "All Crops"],
                    "stock": 100,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "id": 9,
                    "name": "WeedMaster Herbicide",
                    "category": "pesticide",
                    "price": 520,
                    "original_price": 620,
                    "rating": 4.1,
                    "reviews": 67,
                    "badge": None,
                    "image": "🌿",
                    "photo": None,
                    "color": "#8b5cf6",
                    "description": "Selective herbicide for broadleaf weed control in cereal crops.",
                    "how_to_use": "Apply 1.5ml per litre of water at weed seedling stage.",
                    "benefits": ["Selective action", "No crop damage", "Effective on broadleaf weeds", "Rainfast in 2 hours"],
                    "tags": ["Herbicide", "Weed Control", "Cereals"],
                    "stock": 80,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            ]
            
            for product in initial_products:
                Product.collection.insert_one(product)
            
            logger.info(f"Seeded {len(initial_products)} initial products")
            return True
        return False