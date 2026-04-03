import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaTruck, FaCheckCircle, FaBoxOpen, FaCreditCard, 
  FaMapMarkerAlt, FaClock, FaPhoneAlt, FaEnvelope, 
  FaArrowLeft, FaSpinner 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Direct fetch to the working backend endpoint
      const response = await fetch(`https://harvestifypdd-1.onrender.com/api/orders/by-order-number/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Order not found');
      }
      
      const data = await response.json();
      
      if (data.order) {
        setOrder(data.order);
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2>Order Not Found</h2>
          <p>{error || "We couldn't find this order."}</p>
          <button onClick={() => navigate('/')} style={styles.primaryBtn}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* Order Summary */}
      <div style={styles.orderSummary}>
        <div style={styles.orderIdSection}>
          <h1 style={styles.orderTitle}>Order #{order.order_id}</h1>
          <span style={{
            ...styles.statusBadge,
            background: `${getStatusColor(order.status)}20`,
            color: getStatusColor(order.status)
          }}>
            {order.status?.toUpperCase() || 'PENDING'}
          </span>
        </div>
        
        <div style={styles.orderMeta}>
          <div style={styles.metaItem}>
            <FaClock /> <span>Placed on: {new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div style={styles.metaItem}>
            <FaMapMarkerAlt /> <span>Shipping to: {order.address}</span>
          </div>
        </div>
      </div>

      {/* Order Details Grid */}
      <div style={styles.orderDetailsGrid}>
        {/* Items Section */}
        <div style={styles.itemsSection}>
          <h3 style={styles.sectionTitle}>Order Items</h3>
          <div style={styles.itemsList}>
            {order.items?.map((item, index) => (
              <div key={index} style={styles.orderItem}>
                <div style={styles.itemImage}>
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <span style={{ fontSize: '1.5rem' }}>{item.image || '🌱'}</span>
                  )}
                </div>
                <div style={styles.itemDetails}>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ₹{item.price}</p>
                </div>
                <div style={styles.itemTotal}>
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
          <div style={styles.orderTotal}>
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          <div style={styles.paymentInfo}>
            <h3 style={styles.sectionTitle}>Payment Information</h3>
            <div style={styles.infoRow}>
              <span>Payment Method:</span>
              <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
          </div>

          <div style={styles.shippingInfo}>
            <h3 style={styles.sectionTitle}>Shipping Address</h3>
            <div style={styles.addressDetails}>
              <p><strong>{order.name}</strong></p>
              <p>{order.address}</p>
              <p><FaPhoneAlt /> {order.phone}</p>
              <p><FaEnvelope /> {order.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div style={styles.helpSection}>
        <h3>Need Help?</h3>
        <p>If you have any questions about your order, our support team is here to help!</p>
        <div style={styles.helpButtons}>
          <button style={styles.helpBtn} onClick={() => window.location.href = 'mailto:support@harvestify.com'}>
            <FaEnvelope /> Email Support
          </button>
          <button style={styles.helpBtn} onClick={() => navigate('/')}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  loadingSpinner: { textAlign: 'center', padding: '4rem' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' },
  errorContainer: { textAlign: 'center', padding: '4rem' },
  errorIcon: { fontSize: '4rem', marginBottom: '1rem' },
  primaryBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '1rem' },
  header: { marginBottom: '2rem' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' },
  orderSummary: { background: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #e9ecef' },
  orderIdSection: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' },
  orderTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0 },
  statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
  orderMeta: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' },
  orderDetailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' },
  itemsSection: { background: 'white', borderRadius: '16px', border: '1px solid #e9ecef', overflow: 'hidden' },
  sectionTitle: { padding: '1rem 1.5rem', margin: 0, background: '#f8fafc', borderBottom: '1px solid #e9ecef', fontSize: '1rem', fontWeight: '600' },
  itemsList: { padding: '1rem' },
  orderItem: { display: 'flex', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f0f0f0' },
  itemImage: { width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemDetails: { flex: 1 },
  itemName: { margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: '600' },
  itemTotal: { fontWeight: '600', color: '#10b981' },
  orderTotal: { display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e9ecef', fontWeight: '700', fontSize: '1rem' },
  infoSection: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  paymentInfo: { background: 'white', borderRadius: '16px', border: '1px solid #e9ecef', overflow: 'hidden' },
  shippingInfo: { background: 'white', borderRadius: '16px', border: '1px solid #e9ecef', overflow: 'hidden' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid #f0f0f0' },
  addressDetails: { padding: '1rem 1.5rem', lineHeight: '1.8', fontSize: '0.875rem', color: '#334155' },
  helpSection: { background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', border: '1px solid #e9ecef', marginTop: '2rem' },
  helpButtons: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' },
  helpBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }
};

// Add keyframes animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default OrderTracking;
