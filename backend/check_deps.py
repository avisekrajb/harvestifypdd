import sys
import subprocess
import importlib.metadata

def check_package(package_name):
    """Check if package is installed and get version"""
    try:
        version = importlib.metadata.version(package_name)
        return f"✅ {package_name} == {version}"
    except importlib.metadata.PackageNotFoundError:
        return f"❌ {package_name} - NOT INSTALLED"

# List of required packages
required_packages = [
    'flask',
    'flask-cors',
    'flask-jwt-extended',
    'flask-bcrypt',
    'flask-mail',
    'pandas',
    'numpy',
    'scikit-learn',
    'requests',
    'python-dotenv',
    'pymongo',
    'certifi',
    'cloudinary',
    'python-dateutil',
    'werkzeug',
    'gunicorn',
    'google-generativeai',
]

print("\n" + "="*50)
print("📦 HARVESTIFY DEPENDENCY CHECK")
print("="*50)

for package in required_packages:
    print(check_package(package))

print("\n" + "="*50)
print(f"Python version: {sys.version}")
print("="*50)