import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { FaShoppingBag, FaUserMd, FaClock, FaCheckCircle, FaEnvelope, FaPhone, FaMapMarker, FaCalendar } from 'react-icons/fa'
import api from '../services/api'
import toast from 'react-hot-toast'
import '../styles/UserDashboard.css'

const UserDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await api.get('/user/dashboard')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/?login=true'
      } else {
        toast.error('Failed to load dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="user-dashboard">
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

  const { user: userData, orders, consultations, assigned_doctor, stats } = dashboardData

  return (
    <div className="user-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="user-info">
            <div className="user-avatar">
              {userData.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1>Welcome back, {userData.name}!</h1>
              <p>Here's what's happening with your account</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FaShoppingBag /></div>
            <div className="stat-info">
              <h3>{stats.total_orders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaClock /></div>
            <div className="stat-info">
              <h3>{stats.pending_consultations}</h3>
              <p>Pending Consultations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div className="stat-info">
              <h3>{stats.completed_consultations}</h3>
              <p>Completed Consultations</p>
            </div>
          </div>
        </div>

        {/* Assigned Doctor Section */}
        {assigned_doctor && (
          <div className="section">
            <h2><FaUserMd /> Your Assigned Agronomist</h2>
            <div className="doctor-card">
              <div className="doctor-icon"><FaUserMd /></div>
              <div className="doctor-info">
                <h3>Dr. {assigned_doctor.name}</h3>
                <p>{assigned_doctor.speciality}</p>
                <div className="doctor-contact">
                  <p><FaEnvelope /> {assigned_doctor.email}</p>
                  <p><FaPhone /> {assigned_doctor.phone || 'Contact via email'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consultations Section */}
        <div className="section">
          <h2>Your Consultations</h2>
          <div className="consultations-list">
            {consultations.length === 0 ? (
              <div className="empty-state">No consultations yet</div>
            ) : (
              consultations.map(consultation => (
                <div key={consultation.id} className={`consultation-card ${consultation.status}`}>
                  <div className="consultation-header">
                    <div className="consultation-icon">
                      {consultation.status === 'success' ? <FaCheckCircle /> : <FaClock />}
                    </div>
                    <div>
                      <h4>Dr. {consultation.doctor_name}</h4>
                      <p>{consultation.doctor_speciality}</p>
                    </div>
                    <span className={`status-badge ${consultation.status}`}>
                      {consultation.status === 'success' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="consultation-details">
                    <p><FaCalendar /> {new Date(consultation.assigned_date).toLocaleDateString()}</p>
                    {consultation.notes && (
                      <div className="consultation-notes">
                        <strong>Doctor's Notes:</strong>
                        <p>{consultation.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="section">
          <h2>Recent Orders</h2>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No orders yet</td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.order_id}</td>
                      <td>₹{order.total}</td>
                      <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard