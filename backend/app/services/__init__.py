from app.services.ml_service import crop_service, fertilizer_service
from app.services.email_service import send_welcome_email, send_order_confirmation, send_order_status_update, send_otp_email
from app.services.weather_service import get_weather
from app.services.cloudinary_service import upload_image, delete_image