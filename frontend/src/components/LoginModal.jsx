import React, { useState } from 'react'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield, FaUser } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ForgotPasswordModal from './ForgotPasswordModal'
import './AuthModal.css'

const LoginModal = ({ onClose, onSwitch }) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      return
    }
    setLoading(true)
    const result = await login(formData.email, formData.password)
    if (result.success) {
      onClose()
      // Redirect based on user role
      if (result.user?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
    setLoading(false)
  }

  const handleAutoFillAdmin = () => {
    setFormData({
      email: 'admin@harvestify.com',
      password: 'admin123'
    })
  }

  const handleAutoFillUser = () => {
    setFormData({
      email: 'engineerrajbanshi@gmail.com',
      password: '789456'
    })
  }

  if (showForgotPassword) {
    return <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} onBack={() => setShowForgotPassword(false)} />
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="auth-header">
          <div className="auth-icon">🌿</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your Harvestify account</p>
        </div>

        {/* Auto-fill Buttons */}
        <div className="auto-fill-buttons">
          <button 
            type="button" 
            className="auto-fill-btn admin" 
            onClick={handleAutoFillAdmin}
          >
            <FaUserShield /> Admin Login
          </button>
          <button 
            type="button" 
            className="auto-fill-btn user" 
            onClick={handleAutoFillUser}
          >
            <FaUser /> Demo User
          </button>
        </div>

        <div className="divider">
          <span>Or login with your credentials</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <button 
              type="button"
              className="forgot-link"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          <div className="auth-footer">
            Don't have an account?{' '}
            <button type="button" onClick={onSwitch} disabled={loading}>
              Create one free
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
