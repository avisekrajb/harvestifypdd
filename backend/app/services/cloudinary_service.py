import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

def upload_image(file, folder='harvestify'):
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            allowed_formats=['jpg', 'png', 'jpeg', 'webp']
        )
        return {
            'url': result['secure_url'],
            'public_id': result['public_id']
        }
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None

def delete_image(public_id):
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False