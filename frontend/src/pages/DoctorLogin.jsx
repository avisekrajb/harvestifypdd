import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaStethoscope } from 'react-icons/fa'
import toast from 'react-hot-toast'
import api from '../services/api'
import '../styles/DoctorLogin.css'

const DoctorLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields')
      return
    }
    
    setLoading(true)
    try {
      const response = await api.post('/doctor/login', formData)
      const { access_token, user } = response.data
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      toast.success(`Welcome Dr. ${user.name}!`)
      navigate('/doctor/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="doctor-login-page">
      <div className="doctor-login-container">
        <div className="doctor-login-card">
          <div className="doctor-login-header">
            <div className="doctor-icon">
              <FaStethoscope />
            </div>
            <h1>Doctor Login</h1>
            <p>Access your agronomist dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="doctor@harvestify.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
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
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login to Dashboard →'}
            </button>
          </form>
          
          <div className="doctor-login-footer">
            <p>New to Harvestify? <a href="/">Contact Admin</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorLogin