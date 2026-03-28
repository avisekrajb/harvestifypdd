import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FaUser, FaEnvelope, FaPhone, FaMapMarker, FaLock, FaSun, FaMoon, FaSave, FaEdit } from 'react-icons/fa'
import toast from 'react-hot-toast'
import '../styles/Profile.css'

const Profile = () => {
  const { user, updateProfile, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="login-required">
            <div className="login-icon">👤</div>
            <h2>Login Required</h2>
            <p>Please login to view your profile</p>
          </div>
        </div>
      </div>
    )
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setIsEditing(false)
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.new.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          current_password: passwordData.current,
          new_password: passwordData.new
        })
      })
      
      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswordData({ current: '', new: '', confirm: '' })
        setShowPasswordForm(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account settings</p>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <FaUser />
              </div>
              <h3>{user.name}</h3>
              <p className="member-since">
                Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div className="profile-actions">
              <button 
                className={`action-btn ${isEditing ? 'cancel' : 'edit'}`}
                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              >
                {isEditing ? <FaSave /> : <FaEdit />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="profile-details-card">
            <div className="details-header">
              <h3>Account Information</h3>
            </div>

            {!isEditing ? (
              <div className="details-view">
                <div className="detail-item">
                  <FaUser className="detail-icon" />
                  <div>
                    <label>Full Name</label>
                    <p>{user.name}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <FaEnvelope className="detail-icon" />
                  <div>
                    <label>Email Address</label>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <FaPhone className="detail-icon" />
                  <div>
                    <label>Phone Number</label>
                    <p>{user.phone || 'Not added'}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <FaMapMarker className="detail-icon" />
                  <div>
                    <label>Address</label>
                    <p>{user.address || 'Not added'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="details-edit">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="disabled"
                  />
                  <small>Email cannot be changed</small>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your address"
                  />
                </div>
                <button 
                  className="save-btn"
                  onClick={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="security-card">
            <h3>Security Settings</h3>
            
            <div className="theme-toggle-card">
              <div className="theme-info">
                <div className="theme-icon">
                  {darkMode ? <FaMoon /> : <FaSun />}
                </div>
                <div>
                  <label>Dark Mode</label>
                  <p>Switch between light and dark theme</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="password-section">
              <div className="password-header">
                <FaLock className="lock-icon" />
                <div>
                  <label>Password</label>
                  <p>Change your account password</p>
                </div>
                <button 
                  className="change-password-btn"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  {showPasswordForm ? 'Cancel' : 'Change'}
                </button>
              </div>

              {showPasswordForm && (
                <div className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button 
                    className="update-password-btn"
                    onClick={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="danger-card">
            <h3>Danger Zone</h3>
            <p>Once you logout, you'll need to sign in again</p>
            <button className="logout-btn" onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile