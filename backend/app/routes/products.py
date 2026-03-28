from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.product import Product
from app.utils.decorators import admin_required
from bson import ObjectId
import logging
from datetime import datetime

bp = Blueprint('products', __name__, url_prefix='/api/products')
logger = logging.getLogger(__name__)

@bp.route('/', methods=['GET', 'OPTIONS'])
def get_products():
    """Get all products with optional category filter"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        category = request.args.get('category', 'all')
        logger.info(f"Fetching products with category: {category}")
        
        products = Product.find_all(category)
        logger.info(f"Found {len(products)} products")
        
        return jsonify({'products': products})
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['GET', 'OPTIONS'])
def get_product(product_id):
    """Get a single product by ID"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        product = Product.find_by_id(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify(product)
    except Exception as e:
        logger.error(f"Error fetching product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST', 'OPTIONS'])
@jwt_required()
@admin_required
def create_product():
    """Create a new product (Admin only)"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Product name is required'}), 400
        if not data.get('price'):
            return jsonify({'error': 'Product price is required'}), 400
        
        # Prepare product data
        product_data = {
            'name': data.get('name'),
            'category': data.get('category', 'fertilizer'),
            'price': float(data.get('price')),
            'original_price': float(data.get('original_price', data.get('price'))),
            'rating': data.get('rating', 4.5),
            'reviews': data.get('reviews', 0),
            'badge': data.get('badge'),
            'image': data.get('image', '🌱'),
            'photo': data.get('photo'),
            'color': data.get('color', '#4ade80'),
            'description': data.get('description', ''),
            'how_to_use': data.get('how_to_use', ''),
            'benefits': data.get('benefits', []),
            'tags': data.get('tags', []),
            'stock': int(data.get('stock', 100)),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        product_id = Product.create(product_data)
        logger.info(f"Product created: {data.get('name')} with ID: {product_id.inserted_id}")
        
        return jsonify({
            'message': 'Product created successfully',
            'id': str(product_id.inserted_id)
        }), 201
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
@admin_required
def update_product(product_id):
    """Update an existing product (Admin only)"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        data = request.get_json()
        
        # Add updated timestamp
        data['updated_at'] = datetime.utcnow()
        
        result = Product.update(product_id, data)
        
        if result.matched_count == 0:
            return jsonify({'error': 'Product not found'}), 404
        
        logger.info(f"Product updated: {product_id}")
        return jsonify({'message': 'Product updated successfully'})
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
@admin_required
def delete_product(product_id):
    """Delete a product (Admin only)"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        # Validate product_id
        if not product_id or product_id == 'undefined':
            return jsonify({'error': 'Valid product ID is required'}), 400
        
        result = Product.delete(product_id)
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Product not found'}), 404
        
        logger.info(f"Product deleted: {product_id}")
        return jsonify({'message': 'Product deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/search', methods=['GET', 'OPTIONS'])
def search_products():
    """Search products by name or tags"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'products': []}), 200
        
        products = Product.search(query)
        return jsonify({'products': products})
    except Exception as e:
        logger.error(f"Error searching products: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/featured', methods=['GET', 'OPTIONS'])
def get_featured_products():
    """Get featured products (with badges)"""
    if request.method == 'OPTIONS':
        return _build_cors_response()
    
    try:
        limit = int(request.args.get('limit', 4))
        products = Product.find_featured(limit)
        return jsonify({'products': products})
    except Exception as e:
        logger.error(f"Error fetching featured products: {e}")
        return jsonify({'error': str(e)}), 500

def _build_cors_response():
    """Build CORS response for OPTIONS requests"""
    response = jsonify({'message': 'OK'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response
