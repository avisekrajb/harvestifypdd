import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserOrders } from '../services/api'
import { FaBox, FaCalendar, FaRupeeSign, FaTruck, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import '../styles/Orders.css'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await getUserOrders()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="status-icon pending" />
      case 'processing':
        return <FaTruck className="status-icon processing" />
      case 'delivered':
        return <FaCheckCircle className="status-icon delivered" />
      case 'cancelled':
        return <FaTimesCircle className="status-icon cancelled" />
      default:
        return <FaBox className="status-icon" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Confirmation'
      case 'processing':
        return 'Processing'
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  if (!user) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="login-required">
            <div className="login-icon">🔒</div>
            <h2>Login Required</h2>
            <p>Please login to view your order history</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h3>No Orders Yet</h3>
            <p>Start shopping to see your orders here</p>
            <button className="shop-now-btn" onClick={() => window.location.href = '/products'}>
              Shop Now →
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">#{order.order_id || order.id}</span>
                    <span className="order-date">
                      <FaCalendar /> {format(new Date(order.created_at), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.status)}
                    <span className={`status-text ${order.status}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="preview-item">
                      <div className="preview-emoji">{item.image || '🌱'}</div>
                      <div className="preview-info">
                        <div className="preview-name">{item.name}</div>
                        <div className="preview-qty">x{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="more-items">+{order.items.length - 3} more</div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <FaRupeeSign />
                    <span>{order.total.toLocaleString()}</span>
                  </div>
                  <div className="order-payment">
                    {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '📱 Online Payment'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          getStatusIcon={getStatusIcon}
          getStatusText={getStatusText}
        />
      )}
    </div>
  )
}

const OrderDetailModal = ({ order, onClose, getStatusIcon, getStatusText }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>Order Details</h2>
          <div className="order-status-large">
            {getStatusIcon(order.status)}
            <span className={`status-text ${order.status}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="order-info-section">
          <div className="info-row">
            <span className="info-label">Order ID:</span>
            <span className="info-value">#{order.order_id || order.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Placed on:</span>
            <span className="info-value">
              {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment Method:</span>
            <span className="info-value">
              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </span>
          </div>
          {order.transaction_id && (
            <div className="info-row">
              <span className="info-label">Transaction ID:</span>
              <span className="info-value">{order.transaction_id}</span>
            </div>
          )}
        </div>

        <div className="delivery-section">
          <h3>Delivery Address</h3>
          <p className="address">{order.address}</p>
          <div className="contact-info">
            <span>{order.name}</span>
            <span>{order.phone}</span>
          </div>
        </div>

        <div className="items-section">
          <h3>Items Ordered</h3>
          <div className="items-list">
            {order.items?.map((item, idx) => (
              <div key={idx} className="order-item-detail">
                <div className="item-emoji">{item.image || '🌱'}</div>
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-price">₹{item.price} x {item.quantity}</div>
                </div>
                <div className="item-total">₹{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="price-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{order.subtotal?.toLocaleString() || (order.total - 50).toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{order.total.toLocaleString()}</span>
          </div>
        </div>

        {order.want_consultation && (
          <div className="consultation-note">
            <div className="note-icon">👨‍🌾</div>
            <div className="note-text">
              <strong>Agronomist Consultation Requested</strong>
              <p>An expert will contact you within 24 hours</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders