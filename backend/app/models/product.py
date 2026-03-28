from datetime import datetime
from app import db
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class Product:
    collection = db.products
    
    @staticmethod
    def create(product_data):
        """Create a new product"""
        product_data['created_at'] = datetime.utcnow()
        product_data['updated_at'] = datetime.utcnow()
        return Product.collection.insert_one(product_data)
    
    @staticmethod
    def find_all(category=None):
        """Get all products with optional category filter"""
        query = {}
        if category and category != 'all':
            query['category'] = category
        products = list(Product.collection.find(query).sort('created_at', -1))
        for p in products:
            p['_id'] = str(p['_id'])
        return products
    
    @staticmethod
    def find_by_id(product_id):
        """Find product by ID"""
        try:
            product = Product.collection.find_one({'_id': ObjectId(product_id)})
            if product:
                product['_id'] = str(product['_id'])
            return product
        except Exception as e:
            logger.error(f"Error finding product by ID: {e}")
            return None
    
    @staticmethod
    def update(product_id, update_data):
        """Update product"""
        from bson import ObjectId
        update_data['updated_at'] = datetime.utcnow()
        return Product.collection.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': update_data}
        )
    
    @staticmethod
    def delete(product_id):
        """Delete product"""
        from bson import ObjectId
        return Product.collection.delete_one({'_id': ObjectId(product_id)})
    
    @staticmethod
    def search(query):
        """Search products by name or tags"""
        from bson import ObjectId
        search_pattern = {'$regex': query, '$options': 'i'}
        products = list(Product.collection.find({
            '$or': [
                {'name': search_pattern},
                {'tags': search_pattern},
                {'description': search_pattern}
            ]
        }).limit(20))
        
        for p in products:
            p['_id'] = str(p['_id'])
        return products
    
    @staticmethod
    def find_featured(limit=4):
        """Get featured products (with badges)"""
        products = list(Product.collection.find({
            'badge': {'$in': ['Best Seller', 'Popular', 'New', 'Eco Choice']}
        }).limit(limit))
        
        for p in products:
            p['_id'] = str(p['_id'])
        return products
    
    @staticmethod
    def seed_initial_products():
        """Seed initial products if collection is empty"""
        if Product.collection.count_documents({}) == 0:
            logger.info("Seeding initial products...")
            from datetime import datetime
            
            initial_products = [
                {
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
                    "description": "High-nitrogen slow-release fertilizer for leafy greens and cereals.",
                    "how_to_use": "Apply 2–3 kg per acre. Mix thoroughly into topsoil before sowing.",
                    "benefits": ["Boosts vegetative growth", "Slow-release formula"],
                    "tags": ["Nitrogen", "Slow Release"],
                    "stock": 120,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                # Add more products here...
            ]
            
            for product in initial_products:
                Product.collection.insert_one(product)
            logger.info(f"Seeded {len(initial_products)} initial products")
            return True
        return False
