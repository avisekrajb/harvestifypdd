import React from 'react'
import './Loader.css'

const Loader = ({ 
  size = 'medium', 
  fullScreen = false, 
  message = 'Loading...',
  type = 'default' // 'default', 'spinner', 'pulse', 'bounce', 'logo'
}) => {
  const sizeClass = `loader-${size}`
  
  const renderLoader = () => {
    switch(type) {
      case 'spinner':
        return (
          <div className="spinner-loader">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        )
      case 'pulse':
        return (
          <div className="pulse-loader">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-core"></div>
          </div>
        )
      case 'bounce':
        return (
          <div className="bounce-loader">
            <div className="bounce-dot"></div>
            <div className="bounce-dot"></div>
            <div className="bounce-dot"></div>
          </div>
        )
      case 'logo':
        return (
          <div className="logo-loader">
            <div className="logo-circle">
              <div className="logo-circle-inner"></div>
            </div>
            <div className="logo-icon-large">🌾</div>
          </div>
        )
      default:
        return (
          <div className="default-loader">
            <div className="loader-ring">
              <div className="loader-ring-inner"></div>
            </div>
            <div className="loader-icon">🌿</div>
          </div>
        )
    }
  }
  
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-content">
          {renderLoader()}
          <div className="loader-text-container">
            <div className="loader-title">Harvestify</div>
            <div className="loader-message">{message}</div>
            <div className="loader-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`loader ${sizeClass} loader-${type}`}>
      {renderLoader()}
      {message && <p className="loader-message-small">{message}</p>}
    </div>
  )
}

export default Loader