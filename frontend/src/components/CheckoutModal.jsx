import React, { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../services/api'
import { FaWallet, FaTruck, FaImage, FaCheckCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import './CheckoutModal.css'

const CheckoutModal = ({ cart, onClose, onPlaceOrder }) => {
  const { user, updateProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [wantConsultation, setWantConsultation] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + shipping

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.address || !formData.phone) {
      toast.error('Please fill all required fields')
      return
    }

    if (paymentMethod === 'paytm' && !transactionId) {
      toast.error('Please enter transaction ID')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        ...formData,
        items: cart,
        subtotal,
        shipping,
        total,
        paymentMethod,
        transactionId: paymentMethod === 'paytm' ? transactionId : null,
        screenshot: paymentMethod === 'paytm' ? screenshot : null,
        wantConsultation
      }

      await createOrder(orderData)
      
      await updateProfile(formData)
      
      toast.success('Order placed successfully!')
      onPlaceOrder()
      onClose()
    } catch (error) {
      console.error('Order error:', error)
      toast.error(error.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setScreenshot(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="checkout-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="checkout-modal">
        <button className="checkout-close" onClick={onClose}>✕</button>
        
        <div className="checkout-header">
          <h2>Checkout</h2>
          <p>Complete your order details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Details</div>
            </div>
            <div className="step-line" />
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Payment</div>
            </div>
          </div>

          {step === 1 && (
            <div className="checkout-section">
              <h3>Delivery Information</h3>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              
              <div className="consultation-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={wantConsultation}
                    onChange={(e) => setWantConsultation(e.target.checked)}
                  />
                  <span className="checkbox-custom">
                    {wantConsultation && <FaCheckCircle />}
                  </span>
                  <span>Request Agronomist Consultation</span>
                </label>
                <p className="consultation-note">
                  An expert agronomist will contact you after delivery
                </p>
              </div>

              <button
                type="button"
                className="next-btn"
                onClick={() => setStep(2)}
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-section">
              <h3>Payment Method</h3>
              
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon"><FaTruck /></div>
                  <div className="payment-details">
                    <strong>Cash on Delivery</strong>
                    <span>Pay when you receive the order</span>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'paytm' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paytm"
                    checked={paymentMethod === 'paytm'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon"><FaWallet /></div>
                  <div className="payment-details">
                    <strong>Paytm / UPI</strong>
                    <span>Pay using Paytm, Google Pay, PhonePe</span>
                  </div>
                </label>
              </div>

              {paymentMethod === 'paytm' && (
                <div className="payment-instructions">
                  <div className="qr-placeholder">
                    <div className="qr-emoji">📱</div>
                    <p>Pay to: <strong>harvestify@paytm</strong></p>
                    <p className="amount">Amount: ₹{total.toLocaleString()}</p>
                  </div>
                  
                  <div className="upload-section">
                    <label>Transaction ID / UTR</label>
                    <input
                      type="text"
                      placeholder="Enter transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                    
                    <label>Upload Payment Screenshot</label>
                    <div 
                      className="upload-area"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        style={{ display: 'none' }}
                      />
                      {screenshot ? (
                        <img src={screenshot} alt="Screenshot" className="screenshot-preview" />
                      ) : (
                        <>
                          <FaImage />
                          <p>Click to upload screenshot</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cart.map(item => (
                    <div key={item.id} className="summary-item">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="checkout-actions">
                <button type="button" className="back-btn" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="place-order-btn" disabled={loading}>
                  {loading ? 'Processing...' : `Place Order • ₹${total.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default CheckoutModal
