import React from 'react'
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa'
import './CartDrawer.css'

const CartDrawer = ({ cart, onClose, onCheckout, updateQuantity, removeItem }) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + shipping

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h3>
            <FaShoppingCart /> Your Cart
            <span className="cart-count">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
          </h3>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h4>Your cart is empty</h4>
              <p>Add some products to your cart to checkout</p>
            </div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} />
                  ) : (
                    <span className="cart-item-emoji">{item.image || '🌱'}</span>
                  )}
                </div>
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">₹{item.price}</p>
                  <div className="cart-item-quantity">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <div className="cart-item-total">
                  <p>₹{(item.price * item.quantity).toLocaleString()}</p>
                  <button className="remove-item" onClick={() => removeItem(item.id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
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
            <button className="checkout-btn" onClick={onCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer