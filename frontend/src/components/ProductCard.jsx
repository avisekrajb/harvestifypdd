import React, { useState } from 'react'
import { FaStar, FaStarHalf, FaShoppingCart, FaBolt } from 'react-icons/fa'
import './ProductCard.css'

const ProductCard = ({ product, onAddToCart, onBuyNow, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  
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

  // Get the correct image URL
  const getImageUrl = () => {
    if (!product.photo || imageError) {
      return null
    }
    
    // If it's a full URL (starts with http), use as is
    if (product.photo.startsWith('http://') || product.photo.startsWith('https://')) {
      return product.photo
    }
    
    // If it's a local path (starts with /uploads), prepend the backend URL
    if (product.photo.startsWith('/uploads')) {
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'
      return `${backendUrl}${product.photo}`
    }
    
    // Otherwise, treat as a local path
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'
    return `${backendUrl}/${product.photo}`
  }

  const handleImageError = () => {
    console.error('Failed to load image:', product.photo)
    setImageError(true)
  }

  const imageUrl = getImageUrl()

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewDetails}
    >
      <div className="product-image">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={product.name}
            onError={handleImageError}
          />
        ) : (
          <div className="product-emoji">{product.image || '🌱'}</div>
        )}
        {discount > 0 && (
          <div className="product-discount">{discount}% OFF</div>
        )}
        {product.badge && (
          <div className="product-badge">{product.badge}</div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          <div className="stars">{renderStars(product.rating)}</div>
          <span className="reviews">({product.reviews} reviews)</span>
        </div>
        
        <div className="product-price">
          <span className="current-price">₹{product.price}</span>
          {product.original_price > product.price && (
            <span className="original-price">₹{product.original_price}</span>
          )}
        </div>
        
        <div className="product-tags">
          {product.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="product-tag">{tag}</span>
          ))}
        </div>
        
        <div className={`product-actions ${isHovered ? 'visible' : ''}`}>
          <button 
            className="btn-cart"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart()
            }}
          >
            <FaShoppingCart /> Add to Cart
          </button>
          <button 
            className="btn-buy"
            onClick={(e) => {
              e.stopPropagation()
              onBuyNow()
            }}
          >
            <FaBolt /> Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard