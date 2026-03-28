"""Script to fix orders collection and create indexes properly"""
from pymongo import MongoClient
import random
import string
import os
from dotenv import load_dotenv

load_dotenv()

def generate_order_id():
    """Generate unique order ID"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

def fix_orders_collection():
    """Fix orders collection by ensuring all orders have order_id"""
    try:
        # Connect to MongoDB
        mongo_uri = os.getenv('MONGODB_URI')
        db_name = os.getenv('MONGODB_DB', 'harvestify')
        
        client = MongoClient(mongo_uri)
        db = client[db_name]
        
        print(f"Connected to MongoDB: {db_name}")
        
        # Get orders collection
        orders_collection = db.orders
        
        # Count total orders
        total_orders = orders_collection.count_documents({})
        print(f"Total orders: {total_orders}")
        
        # Find orders with null or missing order_id
        null_orders = orders_collection.find({
            '$or': [
                {'order_id': None},
                {'order_id': {'$exists': False}},
                {'order_id': ''}
            ]
        })
        
        null_count = orders_collection.count_documents({
            '$or': [
                {'order_id': None},
                {'order_id': {'$exists': False}},
                {'order_id': ''}
            ]
        })
        
        print(f"Orders without order_id: {null_count}")
        
        # Fix each order
        fixed_count = 0
        for order in null_orders:
            new_order_id = generate_order_id()
            orders_collection.update_one(
                {'_id': order['_id']},
                {'$set': {'order_id': new_order_id}}
            )
            fixed_count += 1
            if fixed_count % 10 == 0:
                print(f"Fixed {fixed_count} orders...")
        
        print(f"Fixed {fixed_count} orders")
        
        # Drop existing index if it exists
        existing_indexes = orders_collection.index_information()
        if 'order_id_1' in existing_indexes:
            orders_collection.drop_index('order_id_1')
            print("Dropped existing order_id_1 index")
        
        # Create unique index
        orders_collection.create_index([('order_id', 1)], unique=True, sparse=True, name='order_id_1')
        print("Created new unique order_id_1 index")
        
        # Verify
        index_info = orders_collection.index_information()
        print(f"Indexes: {list(index_info.keys())}")
        
        # Verify no duplicates
        pipeline = [
            {'$group': {
                '_id': '$order_id',
                'count': {'$sum': 1}
            }},
            {'$match': {'count': {'$gt': 1}}}
        ]
        
        duplicates = list(orders_collection.aggregate(pipeline))
        if duplicates:
            print(f"WARNING: Found {len(duplicates)} duplicate order_ids!")
        else:
            print("No duplicate order_ids found")
        
        print("\n✅ Orders collection fixed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        raise
    finally:
        client.close()

if __name__ == '__main__':
    fix_orders_collection()