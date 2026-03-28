import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { FaShoppingCart, FaUser, FaMoon, FaSun, FaBars } from 'react-icons/fa'
import './Navbar.css'

const Navbar = ({ onMenuClick, onLoginClick }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { getCartCount, setCartOpen } = useCart()
  const { darkMode, toggleDarkMode } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: '/', label: 'Home' },
    { id: '/products', label: 'Products' },
    { id: '/crops', label: 'Crops' },
    { id: '/fertilizer', label: 'Fertilizer' },
    { id: '/disease', label: 'Disease AI' },
    { id: '/orders', label: 'Orders' },
    { id: '/profile', label: 'Profile' }
  ]

  const handleNavigation = (path) => {
    navigate(path)
  }

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick()
    } else {
      navigate('/?login=true')
    }
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <button className="menu-btn" onClick={onMenuClick}>
          <FaBars />
        </button>

        <div className="logo" onClick={() => handleNavigation('/')}>
          <div className="logo-icon">🌿</div>
          <span className="logo-text">Harvestify</span>
        </div>

        <div className="nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${location.pathname === item.id ? 'active' : ''}`}
              onClick={() => handleNavigation(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {user && (
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              <FaShoppingCart />
              {getCartCount() > 0 && (
                <span className="cart-count">{getCartCount()}</span>
              )}
            </button>
          )}

          <div className="user-menu">
            <button
              className="avatar-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user ? <FaUser /> : '🌾'}
            </button>

            {showDropdown && (
              <div className="dropdown">
                {!user ? (
                  <>
                    <button onClick={handleLoginClick}>Sign In</button>
                    <button onClick={() => navigate('/?signup=true')}>Create Account</button>
                  </>
                ) : (
                  <>
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                    <button onClick={() => { navigate('/profile'); setShowDropdown(false); }}>Profile</button>
                    <button onClick={() => { navigate('/orders'); setShowDropdown(false); }}>My Orders</button>
                    <hr />
                    <button onClick={logout} className="logout-btn">Sign Out</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar