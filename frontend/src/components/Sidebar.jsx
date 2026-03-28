import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaHome, FaLeaf, FaFlask, FaSearch, FaShoppingCart, FaHistory, FaUser } from 'react-icons/fa'
import './Sidebar.css'

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const menuItems = [
    { id: '/', label: 'Home', icon: <FaHome /> },
    { id: '/products', label: 'Products', icon: <FaShoppingCart /> },
    { id: '/crops', label: 'Crops', icon: <FaLeaf /> },
    { id: '/fertilizer', label: 'Fertilizer', icon: <FaFlask /> },
    { id: '/disease', label: 'Disease AI', icon: <FaSearch /> },
    { id: '/orders', label: 'Orders', icon: <FaHistory /> },
    { id: '/profile', label: 'Profile', icon: <FaUser /> }
  ]

  if (!open) return null

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">🌿</div>
            <span>Harvestify</span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">👤</div>
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        )}

        <div className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${location.pathname === item.id ? 'active' : ''}`}
              onClick={() => {
                navigate(item.id)
                onClose()
              }}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default Sidebar