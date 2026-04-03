import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaTruck, 
  FaCheckCircle, 
  FaBoxOpen, 
  FaCreditCard, 
  FaMapMarkerAlt,
  FaClock,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowLeft,
  FaShareAlt,
  FaPrint,
  FaDownload,
  FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);

  // Status steps
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: FaCreditCard, description: 'Your order has been received and is being processed', timeLabel: 'Ordered on' },
    { key: 'confirmed', label: 'Order Confirmed', icon: FaCheckCircle, description: 'Your order has been confirmed', timeLabel: 'Confirmed on' },
    { key: 'processing', label: 'Processing', icon: FaBoxOpen, description: 'Your items are being packed', timeLabel: 'Processing started' },
    { key: 'shipped', label: 'Shipped', icon: FaTruck, description: 'Your order is on the way!', timeLabel: 'Shipped on' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: FaTruck, description: 'Your order is out for delivery today!', timeLabel: 'Out for delivery' },
    { key: 'delivered', label: 'Delivered', icon: FaCheckCircle, description: 'Your order has been delivered!', timeLabel: 'Delivered on' }
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Use the correct API endpoint
      const response = await api.get(`/orders/by-order-number/${orderId}`);
      
      if (response.data.order) {
        const orderData = response.data.order;
        setOrder(orderData);
        
        // Calculate estimated delivery
        if (orderData.created_at) {
          const orderDate = new Date(orderData.created_at);
          const minDelivery = new Date(orderDate);
          minDelivery.setDate(orderDate.getDate() + 3);
          const maxDelivery = new Date(orderDate);
          maxDelivery.setDate(orderDate.getDate() + 7);
          setEstimatedDelivery({ min: minDelivery, max: maxDelivery });
        }
      } else {
        throw new Error('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      if (err.response?.status === 404) {
        setError('Order not found. Please check the order number and try again.');
      } else {
        setError('Unable to load order details. Please try again later.');
      }
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const status = order.status || 'pending';
    const index = statusSteps.findIndex(step => step.key === status);
    return index >= 0 ? index : 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'processing': '#8b5cf6',
      'shipped': '#10b981',
      'out_for_delivery': '#f97316',
      'delivered': '#22c55e'
    };
    return colors[status] || '#6b7280';
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

  const handleDownloadInvoice = () => {
    toast.info('Invoice download feature coming soon!');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <FaSpinner style={styles.spinner} />
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
          <p>{error || "We couldn't find this order. Please check the order ID and try again."}</p>
          <button onClick={() => navigate('/')} style={styles.primaryBtn}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <FaArrowLeft /> Back
        </button>
        <div style={styles.headerActions}>
          <button onClick={handleShare} style={styles.actionBtn}>
            <FaShareAlt /> Share
          </button>
          <button onClick={handlePrint} style={styles.actionBtn}>
            <FaPrint /> Print
          </button>
          <button onClick={handleDownloadInvoice} style={styles.actionBtn}>
            <FaDownload /> Invoice
          </button>
        </div>
      </div>

      <div style={styles.orderSummary}>
        <div style={styles.orderIdSection}>
          <h1 style={styles.orderTitle}>Order #{order.order_id || orderId}</h1>
          <span style={{
            ...styles.statusBadge,
            background: `${getStatusColor(order.status)}20`,
            color: getStatusColor(order.status),
            border: `1px solid ${getStatusColor(order.status)}40`
          }}>
            {order.status?.toUpperCase() || 'PENDING'}
          </span>
        </div>
        
        <div style={styles.orderMeta}>
          <div style={styles.metaItem}>
            <FaClock /> <span>Placed on: {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          {estimatedDelivery && (
            <div style={styles.metaItem}>
              <FaTruck /> <span>Estimated Delivery: {estimatedDelivery.min.toLocaleDateString()} - {estimatedDelivery.max.toLocaleDateString()}</span>
            </div>
          )}
          <div style={styles.metaItem}>
            <FaMapMarkerAlt /> <span>Shipping to: {order.address || 'Not specified'}</span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div style={styles.timelineContainer}>
        <div style={styles.timelineProgress}>
          <div style={{ ...styles.progressLine, width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
        </div>
        <div style={styles.timelineSteps}>
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.key} style={{ ...styles.timelineStep, opacity: isCompleted ? 1 : 0.5 }}>
                <div style={{
                  ...styles.stepIcon,
                  ...(isCompleted && { borderColor: '#10b981', background: '#10b981', color: 'white' }),
                  ...(isCurrent && { transform: 'scale(1.1)', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' })
                }}>
                  <Icon />
                </div>
                <div style={styles.stepContent}>
                  <h4 style={styles.stepTitle}>{step.label}</h4>
                  <p style={styles.stepDesc}>{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details */}
      <div style={styles.orderDetailsGrid}>
        <div style={styles.itemsSection}>
          <h3 style={styles.sectionTitle}>Order Items</h3>
          <div style={styles.itemsList}>
            {order.items?.map((item, index) => (
              <div key={index} style={styles.orderItem}>
                <div style={styles.itemImage}>{item.image || '🌱'}</div>
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
        </div>

        <div style={styles.infoSection}>
          <div style={styles.paymentInfo}>
            <h3 style={styles.sectionTitle}>Payment Information</h3>
            <div style={styles.infoRow}>
              <span>Payment Method:</span>
              <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
            <div style={{ ...styles.infoRow, ...styles.totalRow }}>
              <span>Total Amount:</span>
              <span>₹{order.total}</span>
            </div>
          </div>

          <div style={styles.shippingInfo}>
            <h3 style={styles.sectionTitle}>Shipping Address</h3>
            <div style={styles.addressDetails}>
              <p><strong>{order.name}</strong></p>
              <p>{order.address}</p>
              <p>{order.phone && <><FaPhoneAlt /> {order.phone}</>}</p>
              <p>{order.email && <><FaEnvelope /> {order.email}</>}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  loadingSpinner: { textAlign: 'center', padding: '4rem' },
  spinner: { width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem', display: 'block' },
  errorContainer: { textAlign: 'center', padding: '4rem' },
  errorIcon: { fontSize: '4rem', marginBottom: '1rem' },
  primaryBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' },
  headerActions: { display: 'flex', gap: '0.5rem' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' },
  orderSummary: { background: 'linear-gradient(135deg, #f8f9fa, #fff)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #e9ecef' },
  orderIdSection: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' },
  orderTitle: { fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', margin: 0 },
  statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' },
  orderMeta: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' },
  timelineContainer: { position: 'relative', marginBottom: '3rem', padding: '1rem 0' },
  timelineProgress: { position: 'relative', height: '4px', background: '#e2e8f0', borderRadius: '2px', margin: '0 2rem' },
  progressLine: { position: 'absolute', height: '100%', background: 'linear-gradient(90deg, #10b981, #22c55e)', borderRadius: '2px', transition: 'width 0.5s ease' },
  timelineSteps: { display: 'flex', justifyContent: 'space-between', marginTop: '2rem', flexWrap: 'wrap' },
  timelineStep: { flex: 1, textAlign: 'center', minWidth: '100px', transition: 'all 0.3s' },
  stepIcon: { width: '48px', height: '48px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.25rem', transition: 'all 0.3s' },
  stepContent: { textAlign: 'center' },
  stepTitle: { margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' },
  stepDesc: { margin: 0, fontSize: '0.75rem', color: '#64748b', display: 'none' },
  orderDetailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' },
  itemsSection: { background: 'white', borderRadius: '16px', border: '1px solid #e9ecef', overflow: 'hidden' },
  sectionTitle: { padding: '1rem 1.5rem', margin: 0, background: '#f8fafc', borderBottom: '1px solid #e9ecef', fontSize: '1rem', fontWeight: '600' },
  itemsList: { padding: '1rem' },
  orderItem: { display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #f0f0f0' },
  itemImage: { width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' },
  itemDetails: { flex: 1 },
  itemName: { margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: '600' },
  itemTotal: { fontWeight: '600', color: '#10b981' },
  infoSection: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  paymentInfo: { background: 'white', borderRadius: '16px', border: '1px solid #e9ecef', overflow: 'hidden' },
  shippingInfo: { background: 'white', borderRadius: '16px', border: '1px solid #e9ecef', overflow: 'hidden' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid #f0f0f0' },
  totalRow: { fontWeight: '700', color: '#10b981', fontSize: '1.125rem' },
  addressDetails: { padding: '1rem 1.5rem', lineHeight: '1.6', fontSize: '0.875rem', color: '#334155' }
};

// Add keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @media (max-width: 768px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } .stepDesc { display: none; } }
`;
document.head.appendChild(styleSheet);

export default OrderTracking;
