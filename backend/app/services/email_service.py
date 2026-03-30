from flask import current_app
from flask_mail import Message
import logging
import random
import string
import os

logger = logging.getLogger(__name__)

def get_mail():
    """Get mail instance from current app"""
    from app import mail
    return mail

def get_base_url():
    """Get base URL from config (development vs production)"""
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'development':
        return os.getenv('BASE_URL', 'http://localhost:5000')
    else:
        return os.getenv('BASE_URL', 'https://harvestifyfinalyear.onrender.com')

def get_frontend_url():
    """Get frontend URL for email links"""
    return os.getenv('FRONTEND_URL', 'https://harvestifyfinalyear.onrender.com')

def generate_otp():
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def test_email_connection():
    """Test email configuration"""
    try:
        print("\n=== Testing Email Configuration ===")
        print(f"MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
        print(f"MAIL_PORT: {current_app.config.get('MAIL_PORT')}")
        print(f"MAIL_USE_TLS: {current_app.config.get('MAIL_USE_TLS')}")
        print(f"MAIL_USERNAME: {current_app.config.get('MAIL_USERNAME')}")
        print(f"MAIL_PASSWORD: {'*' * len(current_app.config.get('MAIL_PASSWORD', '')) if current_app.config.get('MAIL_PASSWORD') else 'NOT SET'}")
        print("===================================\n")
        return True
    except Exception as e:
        print(f"Error testing email config: {e}")
        return False

def send_welcome_email(email, name):
    """Send welcome email to new users"""
    try:
        mail = get_mail()
        frontend_url = get_frontend_url()
        
        msg = Message(
            subject='Welcome to Harvestify!',
            recipients=[email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME'))
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Harvestify!</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #16a34a; margin-top: 0;">Hello {name}!</h2>
                    <p style="font-size: 16px;">Thank you for joining Harvestify - your intelligent farming companion!</p>
                    
                    <h3 style="color: #333; margin-top: 25px;">With Harvestify, you can:</h3>
                    <ul style="padding-left: 20px; line-height: 1.8;">
                        <li>Get AI-powered crop recommendations</li>
                        <li>Receive personalized fertilizer advice</li>
                        <li>Detect crop diseases instantly</li>
                        <li>Shop premium agricultural products</li>
                        <li>Consult with expert agronomists</li>
                    </ul>
                    
                    <p style="margin-top: 25px;">Start exploring your farming journey with us today!</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{frontend_url}/dashboard" 
                           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                            Get Started
                        </a>
                    </div>
                </div>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>Harvestify - Intelligent Farming Solutions</p>
                    <p>&copy; 2024 Harvestify. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        logger.info(f"Welcome email sent to {email}")
        return True, "Email sent successfully"
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send welcome email to {email}: {error_msg}")
        return False, error_msg

def send_order_confirmation(email, order_id, items, total):
    """Send order confirmation email"""
    try:
        mail = get_mail()
        frontend_url = get_frontend_url()
        
        items_html = ''
        for item in items:
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{item.get('name', 'Product')}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">{item.get('quantity', 1)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹{item.get('price', 0)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹{item.get('price', 0) * item.get('quantity', 1)}</td>
            </tr>
            """
        
        msg = Message(
            subject=f'Order Confirmed! #{order_id}',
            recipients=[email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME'))
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white;">Order Confirmed!</h1>
                </div>
                <div style="padding: 30px;">
                    <h2>Order #{order_id}</h2>
                    <p>Thank you for your order! We'll process it soon.</p>
                    
                    <h3>Order Summary:</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background: #f3f4f6;">
                                <th style="padding: 12px; text-align: left;">Product</th>
                                <th style="padding: 12px; text-align: center;">Qty</th>
                                <th style="padding: 12px; text-align: right;">Price</th>
                                <th style="padding: 12px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; text-align: right;">
                        <strong>Total Amount: ₹{total}</strong>
                    </div>
                    
                    <p style="margin-top: 20px;">We'll notify you when your order is shipped.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="{frontend_url}/orders/{order_id}" 
                           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
                            Track Order
                        </a>
                    </div>
                </div>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
                    <p>Harvestify - Intelligent Farming Solutions</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        logger.info(f"Order confirmation email sent to {email} for order #{order_id}")
        return True, "Email sent successfully"
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send order confirmation to {email}: {error_msg}")
        return False, error_msg

def send_otp_email(email, otp):
    """Send OTP for password reset"""
    try:
        mail = get_mail()
        frontend_url = get_frontend_url()
        
        msg = Message(
            subject='Password Reset OTP - Harvestify',
            recipients=[email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME'))
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white;">Password Reset OTP</h1>
                </div>
                <div style="padding: 30px; text-align: center;">
                    <h2>Your OTP Code:</h2>
                    <div style="font-size: 40px; font-weight: bold; padding: 20px; background: #f3f4f6; border-radius: 8px; letter-spacing: 8px;">
                        {otp}
                    </div>
                    <p style="margin-top: 20px;">This OTP will expire in <strong>10 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    
                    <div style="margin-top: 30px;">
                        <a href="{frontend_url}/reset-password" style="color: #16a34a;">Reset Password</a>
                    </div>
                </div>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
                    <p>Harvestify - Intelligent Farming Solutions</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        logger.info(f"OTP email sent to {email}")
        return True, "OTP sent successfully"
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send OTP to {email}: {error_msg}")
        return False, error_msg

def send_order_status_update(email, order_id, status):
    """Send order status update email"""
    try:
        mail = get_mail()
        frontend_url = get_frontend_url()
        
        status_emoji = {
            'pending': '⏳',
            'processing': '🔄',
            'shipped': '🚚',
            'delivered': '✅',
            'cancelled': '❌'
        }.get(status, '📦')
        
        status_text = {
            'pending': 'Pending Confirmation',
            'processing': 'Processing',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        }.get(status, status)
        
        msg = Message(
            subject=f'Order Status Update - #{order_id}',
            recipients=[email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME'))
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white;">{status_emoji} Order Status Update</h1>
                </div>
                <div style="padding: 30px;">
                    <h2>Order #{order_id}</h2>
                    <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; text-align: center;">
                        <strong style="color: #16a34a;">Status: {status_text}</strong>
                    </div>
                    <p style="margin-top: 20px;">Your order is now <strong>{status_text}</strong>.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="{frontend_url}/orders/{order_id}" 
                           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
                            View Details
                        </a>
                    </div>
                </div>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
                    <p>Harvestify - Intelligent Farming Solutions</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        logger.info(f"Status update email sent to {email} for order #{order_id}")
        return True, "Status update sent"
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send status update to {email}: {error_msg}")
        return False, error_msg

def send_doctor_creation_email(doctor_email, doctor_name, password):
    """Send email to doctor when account is created"""
    try:
        mail = get_mail()
        frontend_url = get_frontend_url()
        
        msg = Message(
            subject='Welcome to Harvestify Doctor Panel!',
            recipients=[doctor_email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME'))
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white;">Welcome to Harvestify!</h1>
                </div>
                <div style="padding: 30px;">
                    <h2>Hello Dr. {doctor_name},</h2>
                    <p>Congratulations! You've been added as an Agronomist/Doctor on the Harvestify platform.</p>
                    
                    <h3>Your Account Details:</h3>
                    <ul style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                        <li><strong>Email:</strong> {doctor_email}</li>
                        <li><strong>Password:</strong> {password}</li>
                    </ul>
                    
                    <p style="margin-top: 20px;">Please login and change your password immediately.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{frontend_url}/doctor/login" 
                           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
                            Login to Dashboard
                        </a>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
                        <p style="margin: 0; color: #92400e;"><strong>Your Responsibilities:</strong></p>
                        <ul style="margin-top: 10px; color: #92400e;">
                            <li>Provide expert advice to assigned farmers</li>
                            <li>Review crop health reports</li>
                            <li>Recommend appropriate treatments</li>
                            <li>Respond to farmer queries within 24 hours</li>
                        </ul>
                    </div>
                </div>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
                    <p>Harvestify - Intelligent Farming Solutions</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        logger.info(f"Doctor creation email sent to {doctor_email}")
        return True, "Email sent successfully"
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send doctor creation email: {error_msg}")
        return False, error_msg

def send_doctor_assignment_email(doctor_email, doctor_name, user_name, user_email, user_phone, user_address, order_id):
    """Send email to doctor when assigned to a user"""
    try:
        mail = get_mail()
        frontend_url = get_frontend_url()
        
        msg = Message(
            subject=f'New Farmer Assigned - Order #{order_id}',
            recipients=[doctor_email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME'))
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white;">New Farmer Assigned</h1>
                </div>
                <div style="padding: 30px;">
                    <h2>Hello Dr. {doctor_name},</h2>
                    <p>A new farmer has been assigned to you for consultation.</p>
                    
                    <h3>Farmer Details:</h3>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                        <p><strong>Name:</strong> {user_name}</p>
                        <p><strong>Email:</strong> {user_email}</p>
                        <p><strong>Phone:</strong> {user_phone}</p>
                        <p><strong>Address:</strong> {user_address}</p>
                        <p><strong>Order ID:</strong> #{order_id}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 8px;">
                        <p style="margin: 0; color: #166534;"><strong>Next Steps:</strong></p>
                        <ul style="margin-top: 10px; color: #166534;">
                            <li>Review the farmer's order details</li>
                            <li>Contact the farmer within 24 hours</li>
                            <li>Provide expert agricultural advice</li>
                            <li>Follow up on crop progress</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="{frontend_url}/doctor/dashboard" 
                           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
                            View Dashboard
                        </a>
                    </div>
                </div>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
                    <p>Harvestify - Intelligent Farming Solutions</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        logger.info(f"Doctor assignment email sent to {doctor_email}")
        return True, "Email sent successfully"
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send doctor assignment email: {error_msg}")
        return False, error_msg

def send_user_assignment_notification(user_email, user_name, doctor_name, doctor_speciality):
    """Send email to user when doctor is assigned"""
    try:
        mail = get_mail()
        frontend_url = get_frontend_url()
        
        msg = Message(
            subject='Expert Agronomist Assigned to You!',
            recipients=[user_email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME'))
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white;">Expert Assigned!</h1>
                </div>
                <div style="padding: 30px;">
                    <h2>Hello {user_name},</h2>
                    <p>We're pleased to inform you that an expert agronomist has been assigned to assist you!</p>
                    
                    <h3>Your Assigned Expert:</h3>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                        <p><strong>Name:</strong> Dr. {doctor_name}</p>
                        <p><strong>Speciality:</strong> {doctor_speciality}</p>
                    </div>
                    
                    <p>Your expert will contact you soon to discuss your farming needs and provide personalized guidance.</p>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 8px;">
                        <p style="margin: 0; color: #166534;"><strong>What to expect:</strong></p>
                        <ul style="margin-top: 10px; color: #166534;">
                            <li>Personalized consultation call within 24 hours</li>
                            <li>Expert advice on crop selection and management</li>
                            <li>Guidance on fertilizer and pesticide use</li>
                            <li>Ongoing support throughout your farming journey</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="{frontend_url}/dashboard" 
                           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
                            Go to Dashboard
                        </a>
                    </div>
                </div>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
                    <p>Harvestify - Intelligent Farming Solutions</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        logger.info(f"User assignment notification sent to {user_email}")
        return True, "Email sent successfully"
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send user assignment notification: {error_msg}")
        return False, error_msg

def send_consultation_status_email(user_email, user_name, doctor_name, status, notes):
    """Send consultation status update email to user"""
    try:
        mail = get_mail()
        frontend_url = get_frontend_url()
        
        status_text = {
            'pending': 'Pending Review',
            'success': 'Completed Successfully'
        }.get(status, status)
        
        status_emoji = {
            'pending': '⏳',
            'success': '✅'
        }.get(status, '📋')
        
        status_color = {
            'pending': '#fbbf24',
            'success': '#4ade80'
        }.get(status, '#16a34a')
        
        msg = Message(
            subject=f'Consultation Update - Dr. {doctor_name}',
            recipients=[user_email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME'))
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">{status_emoji} Consultation Update</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #16a34a;">Hello {user_name}!</h2>
                    <p>Your consultation with <strong>Dr. {doctor_name}</strong> has been updated.</p>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>Status:</strong> 
                            <span style="background: {status_color}; color: white; padding: 4px 12px; border-radius: 99px; font-size: 0.85rem;">
                                {status_text}
                            </span>
                        </p>
                        <p style="margin: 0;"><strong>Doctor's Notes:</strong></p>
                        <p style="margin: 10px 0 0 0; color: #4b5563;">{notes or 'No additional notes provided'}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 8px;">
                        <p style="margin: 0; color: #166534;"><strong>Congratulations!</strong> Your consultation has been completed successfully. If you have any further questions, feel free to reach out to your doctor.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="{frontend_url}/dashboard" 
                           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            View Dashboard
                        </a>
                    </div>
                </div>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>Harvestify - Intelligent Farming Solutions</p>
                    <p>&copy; 2024 Harvestify. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        logger.info(f"Consultation status email sent to {user_email}")
        return True, "Email sent successfully"
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send consultation status email: {error_msg}")
        return False, error_msg
