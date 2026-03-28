"""Complete fix for orders collection - run this once"""
import os
import sys
import random
import string
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def generate_order_id():
    """Generate unique order ID"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

def main():
    print("=" * 60)
    print("Harvestify - Orders Collection Fix Tool")
    print("=" * 60)
    
    try:
        # Get MongoDB connection
        mongo_uri = os.getenv('MONGODB_URI')
        if not mongo_uri:
            print("❌ Error: MONGODB_URI not found in .env file")
            print("Please check your .env file")
            return
        
        db_name = os.getenv('MONGODB_DB', 'harvestify')
        
        print(f"\n📡 Connecting to MongoDB...")
        print(f"   Database: {db_name}")
        
        client = MongoClient(mongo_uri)
        db = client[db_name]
        
        # Test connection
        client.admin.command('ping')
        print("✓ Connected successfully")
        
        # Get collections
        orders_collection = db.orders
        
        # Check current state
        total_orders = orders_collection.count_documents({})
        print(f"\n📊 Current state:")
        print(f"   Total orders: {total_orders}")
        
        if total_orders == 0:
            print("\n✅ No orders found. Creating indexes...")
        else:
            print(f"\n🔍 Analyzing {total_orders} orders...")
            
            # Check for orders without order_id
            missing_order_id = orders_collection.count_documents({
                '$or': [
                    {'order_id': None},
                    {'order_id': {'$exists': False}},
                    {'order_id': ''}
                ]
            })
            print(f"   Orders without order_id: {missing_order_id}")
            
            # Find duplicates
            pipeline = [
                {'$group': {
                    '_id': '$order_id',
                    'count': {'$sum': 1},
                    'ids': {'$push': '$_id'}
                }},
                {'$match': {'count': {'$gt': 1}}}
            ]
            duplicates = list(orders_collection.aggregate(pipeline))
            print(f"   Duplicate order_ids: {len(duplicates)}")
            
            if duplicates:
                print("\n⚠️ Found duplicate order_ids:")
                for dup in duplicates:
                    print(f"   - '{dup['_id']}' appears {dup['count']} times")
            
            # Fix orders
            print("\n🔧 Fixing orders...")
            
            # Fix missing order_ids
            if missing_order_id > 0:
                null_orders = orders_collection.find({
                    '$or': [
                        {'order_id': None},
                        {'order_id': {'$exists': False}},
                        {'order_id': ''}
                    ]
                })
                
                fixed_count = 0
                for order in null_orders:
                    new_id = generate_order_id()
                    orders_collection.update_one(
                        {'_id': order['_id']},
                        {'$set': {'order_id': new_id}}
                    )
                    fixed_count += 1
                
                print(f"   ✓ Fixed {fixed_count} orders with missing order_id")
            
            # Fix duplicates
            if duplicates:
                for dup in duplicates:
                    # Keep the first one, update others
                    keep_id = dup['ids'][0]
                    for i in range(1, len(dup['ids'])):
                        new_id = generate_order_id()
                        orders_collection.update_one(
                            {'_id': dup['ids'][i]},
                            {'$set': {'order_id': new_id}}
                        )
                    print(f"   ✓ Fixed duplicates for: {dup['_id']}")
        
        # Drop existing indexes
        print("\n🗑️ Removing existing indexes...")
        existing_indexes = orders_collection.index_information()
        for index_name in existing_indexes:
            if index_name != '_id_':
                try:
                    orders_collection.drop_index(index_name)
                    print(f"   Dropped: {index_name}")
                except Exception as e:
                    print(f"   Could not drop {index_name}: {e}")
        
        # Create new indexes
        print("\n📇 Creating new indexes...")
        
        # Unique order_id index
        orders_collection.create_index(
            [('order_id', 1)], 
            unique=True, 
            sparse=True,
            name='order_id_1'
        )
        print("   ✓ Created unique index on order_id")
        
        # user_id index
        orders_collection.create_index(
            [('user_id', 1)], 
            name='user_id_1'
        )
        print("   ✓ Created index on user_id")
        
        # created_at index
        orders_collection.create_index(
            [('created_at', -1)], 
            name='created_at_-1'
        )
        print("   ✓ Created index on created_at")
        
        # Verify final state
        print("\n✅ Verifying final state...")
        final_orders = orders_collection.count_documents({})
        print(f"   Total orders: {final_orders}")
        
        # Verify no duplicates
        final_duplicates = list(orders_collection.aggregate([
            {'$group': {
                '_id': '$order_id',
                'count': {'$sum': 1}
            }},
            {'$match': {'count': {'$gt': 1}}}
        ]))
        
        if final_duplicates:
            print(f"   ⚠️ WARNING: Still found {len(final_duplicates)} duplicates!")
        else:
            print("   ✓ No duplicates found")
        
        # Show final indexes
        final_indexes = orders_collection.index_information()
        print(f"\n📋 Final indexes:")
        for idx_name in final_indexes:
            print(f"   - {idx_name}")
        
        print("\n" + "=" * 60)
        print("✨ Orders collection fixed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'client' in locals():
            client.close()
            print("\n🔌 Disconnected from MongoDB")

if __name__ == '__main__':
    main()