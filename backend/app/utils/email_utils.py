# app/utils/email_utils.py
from flask import current_app
from flask_mail import Message
import logging

logger = logging.getLogger(__name__)

def send_welcome_email(email, name):
    """Send welcome email to new users"""
    try:
        from app import mail
        
        msg = Message(
            subject='Welcome to Harvestify! 🌾',
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff;">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🌾 Welcome to Harvestify!</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #16a34a;">Hello {name}!</h2>
                    <p>Thank you for joining Harvestify - your intelligent farming companion!</p>
                    
                    <h3>With Harvestify, you can:</h3>
                    <ul style="padding-left: 20px;">
                        <li>🌱 Get AI-powered crop recommendations</li>
                        <li>🧪 Receive personalized fertilizer advice</li>
                        <li>🔬 Detect crop diseases instantly</li>
                        <li>📦 Shop premium agricultural products</li>
                        <li>👨‍🌾 Consult with expert agronomists</li>
                    </ul>
                    
                    <p>Start exploring your farming journey with us today!</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://harvestify.com/dashboard" 
                           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            Get Started →
                        </a>
                    </div>
                </div>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>Harvestify - Intelligent Farming Solutions</p>
                    <p>© 2024 Harvestify. All rights reserved.</p>
                    <p style="margin-top: 10px;">
                        <a href="#" style="color: #16a34a;">Unsubscribe</a> | 
                        <a href="#" style="color: #16a34a;">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        logger.info(f"Welcome email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email}: {str(e)}")
        return False


def send_order_confirmation(email, order_id, items, total):
    """Send order confirmation email"""
    try:
        from app import mail
        
        items_html = ''
        for item in items:
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{item.get('name', 'Product')}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{item.get('quantity', 1)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">₹{item.get('price', 0)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">₹{item.get('price', 0) * item.get('quantity', 1)}</td>
            </tr>
            """
        
        msg = Message(
            subject=f'Order Confirmed! #{order_id}',
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
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
                    <h1 style="color: white;">✅ Order Confirmed!</h1>
                </div>
                <div style="padding: 30px;">
                    <h2>Order #{order_id}</h2>
                    <p>Thank you for your order! We'll process it soon.</p>
                    
                    <h3>Order Summary:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f3f4f6;">
                                <th style="padding: 12px; text-align: left;">Product</th>
                                <th style="padding: 12px; text-align: left;">Qty</th>
                                <th style="padding: 12px; text-align: left;">Price</th>
                                <th style="padding: 12px; text-align: left;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                        <strong>Total Amount: ₹{total}</strong>
                    </div>
                    
                    <p style="margin-top: 20px;">We'll notify you when your order is shipped.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://harvestify.com/orders/{order_id}" 
                           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
                            Track Order →
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
        return True
        
    except Exception as e:
        logger.error(f"Failed to send order confirmation to {email}: {str(e)}")
        return False


def send_otp_email(email, otp):
    """Send OTP for password reset"""
    try:
        from app import mail
        
        msg = Message(
            subject='Password Reset OTP - Harvestify',
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
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
                    <h1 style="color: white;">🔐 Password Reset OTP</h1>
                </div>
                <div style="padding: 30px; text-align: center;">
                    <h2>Your OTP Code:</h2>
                    <div style="font-size: 36px; font-weight: bold; padding: 20px; background: #f3f4f6; border-radius: 8px; letter-spacing: 5px;">
                        {otp}
                    </div>
                    <p style="margin-top: 20px;">This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
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
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP to {email}: {str(e)}")
        return False