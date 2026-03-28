from pymongo import MongoClient
from datetime import datetime
import bcrypt
import os

# Connect to MongoDB
client = MongoClient('mongodb+srv://rajbanshi:hardware@cluster0.so5agoe.mongodb.net/?appName=Cluster0')
db = client['harvestify']

def hash_password(password):
    """Hash password using bcrypt"""
    # Generate salt and hash
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password, hashed):
    """Verify password against hash"""
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        print(f"Verification error: {e}")
        return False

# Check if admin exists
admin = db.users.find_one({'email': 'admin@harvestify.com'})

if admin:
    print(f"Admin user found: {admin['email']}")
    print(f"Admin role: {admin.get('role')}")
    print(f"Admin name: {admin.get('name')}")
    print(f"Password hash exists: {bool(admin.get('password_hash'))}")
    
    if admin.get('password_hash'):
        # Test password verification
        test_password = 'admin123'
        is_valid = verify_password(test_password, admin.get('password_hash', ''))
        print(f"Password 'admin123' is valid: {is_valid}")
        
        # If password is invalid, update it
        if not is_valid:
            print("Password is invalid, updating...")
            new_hash = hash_password('admin123')
            db.users.update_one(
                {'email': 'admin@harvestify.com'},
                {'$set': {
                    'password_hash': new_hash, 
                    'updated_at': datetime.utcnow()
                }}
            )
            print("Admin password updated successfully!")
    else:
        print("No password hash found, updating...")
        new_hash = hash_password('admin123')
        db.users.update_one(
            {'email': 'admin@harvestify.com'},
            {'$set': {
                'password_hash': new_hash, 
                'updated_at': datetime.utcnow()
            }}
        )
        print("Admin password hash added successfully!")
else:
    print("Admin user not found. Creating...")
    
    # Create admin user with hashed password
    password_hash = hash_password('admin123')
    
    admin_data = {
        'name': 'Admin',
        'email': 'admin@harvestify.com',
        'password_hash': password_hash,
        'role': 'admin',
        'phone': '9876543210',
        'address': 'Admin Office',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = db.users.insert_one(admin_data)
    print(f"Admin user created with id: {result.inserted_id}")

# Verify the admin user after update
print("\n=== Verifying Admin User ===")
admin_updated = db.users.find_one({'email': 'admin@harvestify.com'})
if admin_updated:
    print(f"Email: {admin_updated['email']}")
    print(f"Role: {admin_updated.get('role')}")
    print(f"Password hash exists: {bool(admin_updated.get('password_hash'))}")
    print(f"Hash preview: {admin_updated.get('password_hash', '')[:50]}...")
    
    # Test the new password
    test_result = verify_password('admin123', admin_updated.get('password_hash', ''))
    print(f"Password verification test: {test_result}")

# List all users with their roles
print("\n=== All Users ===")
for user in db.users.find().sort('created_at', -1).limit(10):
    print(f"  - {user['email']} (role: {user.get('role', 'user')}, hashed: {bool(user.get('password_hash'))})")