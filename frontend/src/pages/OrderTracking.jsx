import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaTruck, FaCheckCircle, FaBoxOpen, FaCreditCard, 
  FaMapMarkerAlt, FaClock, FaPhoneAlt, FaEnvelope, 
  FaArrowLeft, FaShareAlt, FaPrint, FaDownload,
  FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://harvestifypdd-1.onrender.com/api/orders/by-order-number/${orderId}`);
      
      if (!response.ok) throw new Error('Order not found');
      
      const data = await response.json();
      
      if (data.order) {
        setOrder(data.order);
        
        // Calculate estimated delivery (3-7 days from order date)
        const orderDate = new Date(data.order.created_at);
        const minDelivery = new Date(orderDate);
        minDelivery.setDate(orderDate.getDate() + 3);
        const maxDelivery = new Date(orderDate);
        maxDelivery.setDate(orderDate.getDate() + 7);
        setEstimatedDelivery({ min: minDelivery, max: maxDelivery });
      } else {
        throw new Error('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Order not found. Please check the order number and try again.');
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'processing': '#3b82f6',
      'shipped': '#10b981',
      'delivered': '#22c55e',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusSteps = () => {
    const status = order?.status || 'pending';
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: FaCreditCard, completed: ['pending', 'processing', 'shipped', 'delivered'].includes(status) },
      { key: 'processing', label: 'Processing', icon: FaBoxOpen, completed: ['processing', 'shipped', 'delivered'].includes(status) },
      { key: 'shipped', label: 'Shipped', icon: FaTruck, completed: ['shipped', 'delivered'].includes(status) },
      { key: 'delivered', label: 'Delivered', icon: FaCheckCircle, completed: status === 'delivered' }
    ];
    return steps;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order #${orderId}`,
        text: `Track your Harvestify order #${orderId}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="tracking-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="tracking-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Order Not Found</h2>
          <p>{error || "We couldn't find this order."}</p>
          <button onClick={() => navigate('/')} className="primary-btn">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();
  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);
  const progressPercent = (currentStepIndex / (statusSteps.length - 1)) * 100;

  return (
    <div className="tracking-container">
      {/* Header */}
      <div className="tracking-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back
        </button>
        <div className="header-actions">
          <button onClick={handleShare} className="action-btn">
            <FaShareAlt /> Share
          </button>
          <button onClick={handlePrint} className="action-btn">
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <div className="order-id-section">
          <h1>Order #{order.order_id}</h1>
          <span className={`status-badge ${order.status}`}>
            {order.status?.toUpperCase() || 'PENDING'}
          </span>
        </div>
        
        <div className="order-meta">
          <div className="meta-item">
            <FaClock /> <span>Placed on: {new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          {estimatedDelivery && (
            <div className="meta-item">
              <FaTruck /> <span>Est. Delivery: {estimatedDelivery.min.toLocaleDateString()} - {estimatedDelivery.max.toLocaleDateString()}</span>
            </div>
          )}
          <div className="meta-item">
            <FaMapMarkerAlt /> <span>Shipping to: {order.address}</span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="timeline-container">
        <div className="timeline-progress">
          <div className="progress-line" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="timeline-steps">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.completed;
            const isCurrent = order.status === step.key;
            
            return (
              <div key={step.key} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="step-icon">
                  <Icon />
                  {isCompleted && index < currentStepIndex && <FaCheckCircle className="check-mark" />}
                </div>
                <div className="step-content">
                  <h4>{step.label}</h4>
                  <p>{step.key === 'pending' ? 'Order received' : step.key === 'processing' ? 'Being prepared' : step.key === 'shipped' ? 'On the way' : 'Delivered to you'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Truck Animation for Shipped Status */}
      {(order.status === 'shipped') && (
        <div className="truck-animation">
          <div className="truck-wrapper">
            <FaTruck className="moving-truck" />
            <div className="truck-trail" />
          </div>
          <p>Your order is on the way! 🚚</p>
        </div>
      )}

      {/* Order Details Grid */}
      <div className="order-details-grid">
        {/* Items Section */}
        <div className="items-section">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} />
                  ) : (
                    <span className="item-emoji">{item.image || '🌱'}</span>
                  )}
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ₹{item.price}</p>
                </div>
                <div className="item-total">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="payment-info">
            <h3>Payment Information</h3>
            <div className="info-row">
              <span>Payment Method:</span>
              <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
            <div className="info-row">
              <span>Payment Status:</span>
              <span style={{ color: order.payment_method === 'cod' ? '#f59e0b' : '#10b981' }}>
                {order.payment_method === 'cod' ? 'Pending' : 'Paid'}
              </span>
            </div>
          </div>

          <div className="shipping-info">
            <h3>Shipping Address</h3>
            <div className="address-details">
              <p><strong>{order.name}</strong></p>
              <p>{order.address}</p>
              <div className="contact-info">
                <p><FaPhoneAlt /> {order.phone}</p>
                <p><FaEnvelope /> {order.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>Need Help?</h3>
        <p>If you have any questions about your order, our support team is here to help!</p>
        <div className="help-buttons">
          <button className="help-btn" onClick={() => window.location.href = 'mailto:support@harvestify.com'}>
            <FaEnvelope /> Email Support
          </button>
          <button className="help-btn" onClick={() => navigate('/')}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
