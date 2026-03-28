import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUsers, FaCheckCircle, FaClock, FaUserMd, FaEnvelope, FaPhone, FaMapMarker, FaStethoscope, FaNotesMedical, FaCheck, FaHourglassHalf } from 'react-icons/fa'
import api from '../services/api'
import toast from 'react-hot-toast'
import '../styles/DoctorDashboard.css'

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await api.get('/doctor/dashboard')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/doctor/login')
      } else {
        toast.error('Failed to load dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (userId, status, notes = '') => {
    setUpdatingStatus(userId)
    try {
      const response = await api.put(`/doctor/consultation/${userId}/status`, { status, notes })
      if (response.data.message) {
        toast.success(response.data.message)
        fetchDashboardData()
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (loading) {
    return (
      <div className="doctor-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return <div>No data available</div>
  }

  const { doctor, pending_consultations, completed_consultations, stats } = dashboardData

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="doctor-info">
            {doctor.photo ? (
              <img src={doctor.photo} alt={doctor.name} className="doctor-avatar" />
            ) : (
              <div className="doctor-avatar-placeholder">
                <FaUserMd />
              </div>
            )}
            <div>
              <h1>Dr. {doctor.name}</h1>
              <p><FaStethoscope /> {doctor.speciality}</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="profile-btn" onClick={() => navigate('/doctor/profile')}>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-info">
              <h3>{stats.total_assigned}</h3>
              <p>Total Assigned Farmers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaHourglassHalf /></div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending Consultations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div className="stat-info">
              <h3>{stats.completed}</h3>
              <p>Completed Consultations</p>
            </div>
          </div>
        </div>

        {/* Pending Consultations Section */}
        <div className="section">
          <h2><FaHourglassHalf /> Pending Consultations ({pending_consultations.length})</h2>
          <div className="farmers-grid">
            {pending_consultations.length === 0 ? (
              <div className="empty-state">No pending consultations</div>
            ) : (
              pending_consultations.map(user => (
                <div key={user.id} className="farmer-card pending">
                  <div className="farmer-header">
                    <div className="farmer-icon"><FaUserMd /></div>
                    <h3>{user.name}</h3>
                    <span className="status-badge pending">Pending</span>
                  </div>
                  <div className="farmer-details">
                    <p><FaEnvelope /> {user.email}</p>
                    <p><FaPhone /> {user.phone || 'Not provided'}</p>
                    <p><FaMapMarker /> {user.address || 'Not provided'}</p>
                  </div>
                  <div className="farmer-orders">
                    <strong>Recent Orders: {user.orders?.length || 0}</strong>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="btn-success"
                      onClick={() => handleStatusUpdate(user.id, 'success', 'Consultation completed successfully. Great progress!')}
                      disabled={updatingStatus === user.id}
                    >
                      {updatingStatus === user.id ? 'Updating...' : <><FaCheck /> Mark as Success</>}
                    </button>
                    <button 
                      className="btn-pending"
                      onClick={() => handleStatusUpdate(user.id, 'pending', 'Consultation pending review')}
                      disabled={updatingStatus === user.id}
                    >
                      {updatingStatus === user.id ? 'Updating...' : <><FaHourglassHalf /> Mark as Pending</>}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Consultations Section */}
        <div className="section">
          <h2><FaCheckCircle /> Completed Consultations ({completed_consultations.length})</h2>
          <div className="farmers-grid">
            {completed_consultations.length === 0 ? (
              <div className="empty-state">No completed consultations</div>
            ) : (
              completed_consultations.map(user => (
                <div key={user.id} className="farmer-card completed">
                  <div className="farmer-header">
                    <div className="farmer-icon"><FaUserMd /></div>
                    <h3>{user.name}</h3>
                    <span className="status-badge success">Completed</span>
                  </div>
                  <div className="farmer-details">
                    <p><FaEnvelope /> {user.email}</p>
                    <p><FaPhone /> {user.phone || 'Not provided'}</p>
                    <p><FaMapMarker /> {user.address || 'Not provided'}</p>
                  </div>
                  {user.notes && (
                    <div className="consultation-notes">
                      <FaNotesMedical />
                      <p>{user.notes}</p>
                    </div>
                  )}
                  <div className="farmer-orders">
                    <strong>Orders: {user.orders?.length || 0}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard