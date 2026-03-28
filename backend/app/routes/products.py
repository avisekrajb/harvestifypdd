from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.product import Product
from bson import ObjectId
import logging

bp = Blueprint('products', __name__, url_prefix='/api/products')
logger = logging.getLogger(__name__)

@bp.route('/', methods=['GET'])
def get_products():
    try:
        category = request.args.get('category', 'all')
        logger.info(f"Fetching products with category: {category}")
        
        products = Product.find_all(category)
        logger.info(f"Found {len(products)} products")
        
        return jsonify({'products': products})
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.find_by_id(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify(product)
    except Exception as e:
        logger.error(f"Error fetching product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    try:
        data = request.get_json()
        product_id = Product.create(data)
        return jsonify({'message': 'Product created', 'id': str(product_id.inserted_id)}), 201
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        data = request.get_json()
        Product.update(product_id, data)
        return jsonify({'message': 'Product updated'})
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        Product.delete(product_id)
        return jsonify({'message': 'Product deleted'})
    except Exception as e:
        logger.error(f"Error deleting product: {e}")
        return jsonify({'error': str(e)}), 500