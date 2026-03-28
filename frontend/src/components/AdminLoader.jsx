import React from 'react'
import './Loader.css'

const AdminLoader = ({ message = 'Loading dashboard data...' }) => {
  return (
    <div className="admin-loader">
      <div className="loader-content">
        <div className="logo-loader">
          <div className="logo-circle">
            <div className="logo-circle-inner"></div>
          </div>
          <div className="logo-icon-large">🌾</div>
        </div>
        <div className="loader-text-container">
          <div className="loader-title">Admin Panel</div>
          <div className="loader-message">{message}</div>
          <div className="loader-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoader