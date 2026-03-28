import React from 'react'
import { FaStar, FaStarHalf, FaShoppingCart, FaBolt, FaTimes, FaCheckCircle, FaLeaf, FaTruck, FaShieldAlt } from 'react-icons/fa'
import './ProductDetailModal.css'

const ProductDetailModal = ({ product, onClose, onAddToCart, onBuyNow }) => {
  if (!product) return null

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} />)
    }
    if (hasHalf) {
      stars.push(<FaStarHalf key="half" />)
    }
    return stars
  }

  const discount = product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="detail-layout">
          <div className="detail-image-section">
            <div className="detail-image">
              {product.photo ? (
                <img src={product.photo} alt={product.name} />
              ) : (
                <div className="detail-emoji">{product.image || '🌱'}</div>
              )}
              {discount > 0 && (
                <div className="detail-discount">{discount}% OFF</div>
              )}
              {product.badge && (
                <div className="detail-badge">{product.badge}</div>
              )}
            </div>
            <div className="detail-shipping">
              <div className="shipping-item">
                <FaTruck />
                <span>Free shipping on orders above ₹500</span>
              </div>
              <div className="shipping-item">
                <FaShieldAlt />
                <span>100% genuine products</span>
              </div>
            </div>
          </div>
          
          <div className="detail-info">
            <h2 className="detail-name">{product.name}</h2>
            
            <div className="detail-rating">
              <div className="stars">{renderStars(product.rating)}</div>
              <span className="reviews">({product.reviews} reviews)</span>
              <span className="stock-info">In Stock: {product.stock || 100}</span>
            </div>
            
            <div className="detail-price">
              <span className="current">₹{product.price}</span>
              {product.original_price > product.price && (
                <>
                  <span className="original">₹{product.original_price}</span>
                  <span className="save-badge">Save ₹{product.original_price - product.price}</span>
                </>
              )}
            </div>
            
            <p className="detail-description">{product.description}</p>
            
            {product.benefits && product.benefits.length > 0 && (
              <div className="detail-benefits">
                <h4><FaCheckCircle /> Key Benefits</h4>
                <ul>
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.how_to_use && (
              <div className="detail-how-to">
                <h4><FaLeaf /> How to Use</h4>
                <p>{product.how_to_use}</p>
              </div>
            )}
            
            <div className="detail-tags">
              {product.tags?.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
            
            <div className="detail-actions">
              <button className="add-to-cart-btn" onClick={() => { onAddToCart(); onClose(); }}>
                <FaShoppingCart /> Add to Cart
              </button>
              <button className="buy-now-btn" onClick={() => { onBuyNow(); onClose(); }}>
                <FaBolt /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal