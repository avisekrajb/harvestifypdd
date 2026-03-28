import re
import random
import string
from datetime import datetime, timedelta
import hashlib
import hmac

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate Indian phone number"""
    pattern = r'^[6-9]\d{9}$'
    return re.match(pattern, phone) is not None

def validate_password(password):
    """Validate password strength"""
    return len(password) >= 6

def generate_order_id():
    """Generate unique order ID"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

def generate_otp():
    """Generate 4-digit OTP"""
    return ''.join(random.choices(string.digits, k=4))

def format_currency(amount):
    """Format currency in Indian Rupees"""
    return f"₹{amount:,.2f}"

def format_date(date_obj):
    """Format datetime to readable string"""
    if isinstance(date_obj, str):
        date_obj = datetime.fromisoformat(date_obj)
    return date_obj.strftime('%d %b %Y, %I:%M %p')

def format_short_date(date_obj):
    """Format date to short format"""
    if isinstance(date_obj, str):
        date_obj = datetime.fromisoformat(date_obj)
    return date_obj.strftime('%d %b %Y')

def calculate_discount(original_price, current_price):
    """Calculate discount percentage"""
    if not original_price or original_price <= current_price:
        return 0
    return round(((original_price - current_price) / original_price) * 100)

def sanitize_input(text):
    """Sanitize user input"""
    if not text:
        return ''
    return text.strip().replace('<', '&lt;').replace('>', '&gt;')

def truncate_text(text, max_length=100):
    """Truncate text to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + '...'

def parse_float(value, default=0.0):
    """Safely parse float value"""
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def parse_int(value, default=0):
    """Safely parse integer value"""
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def calculate_confidence_score(probability):
    """Calculate confidence percentage from probability"""
    return round(probability * 100, 2)

def get_status_color(status):
    """Get color for order status"""
    colors = {
        'pending': '#fbbf24',
        'processing': '#60a5fa',
        'delivered': '#4ade80',
        'cancelled': '#f87171'
    }
    return colors.get(status, '#6b7280')

def get_severity_color(severity):
    """Get color for disease severity"""
    colors = {
        'Low': '#4ade80',
        'Medium': '#fbbf24',
        'High': '#f87171',
        'Critical': '#ef4444'
    }
    return colors.get(severity, '#6b7280')

def generate_hash(text, salt=None):
    """Generate SHA256 hash"""
    if salt is None:
        salt = os.urandom(32).hex()
    hash_obj = hashlib.sha256(f"{text}{salt}".encode())
    return hash_obj.hexdigest(), salt

def verify_hash(text, hash_value, salt):
    """Verify SHA256 hash"""
    generated_hash, _ = generate_hash(text, salt)
    return hmac.compare_digest(generated_hash, hash_value)

def chunk_list(lst, chunk_size):
    """Split list into chunks"""
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

def merge_dicts(dict1, dict2):
    """Merge two dictionaries"""
    result = dict1.copy()
    result.update(dict2)
    return result

def filter_dict(data, keys):
    """Filter dictionary by keys"""
    return {k: v for k, v in data.items() if k in keys}

def exclude_keys(data, keys):
    """Exclude keys from dictionary"""
    return {k: v for k, v in data.items() if k not in keys}

def safe_get(data, key, default=None):
    """Safely get value from dictionary"""
    try:
        return data.get(key, default)
    except (AttributeError, TypeError):
        return default

def get_client_ip(request):
    """Get client IP address from request"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr

def is_ajax_request(request):
    """Check if request is AJAX"""
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest'