import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { FaUser, FaEnvelope, FaPhone, FaMapMarker, FaGraduationCap, FaCamera, FaUsers } from 'react-icons/fa'
import toast from 'react-hot-toast'
import './DoctorProfile.css'

const DoctorProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    email: '',
    speciality: ''
  })
  const [assignedUsers, setAssignedUsers] = useState([])

  useEffect(() => {
    fetchDoctorProfile()
  }, [])

  const fetchDoctorProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/doctor/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setProfile(data)
      setFormData({
        name: data.name,
        bio: data.bio,
        phone: data.phone,
        email: data.email,
        speciality: data.speciality
      })
      setAssignedUsers(data.assigned_users || [])
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast.success('Profile updated successfully')
        setEditing(false)
        fetchDoctorProfile()
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>
  }

  if (!profile) {
    return <div>No profile data found</div>
  }

  return (
    <div className="doctor-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.photo ? (
            <img src={profile.photo} alt={profile.name} />
          ) : (
            <div className="avatar-placeholder">
              <FaUser />
            </div>
          )}
          <button className="change-photo-btn">
            <FaCamera /> Change Photo
          </button>
        </div>
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p className="speciality"><FaGraduationCap /> {profile.speciality}</p>
          <div className="contact-info">
            <p><FaEnvelope /> {profile.email}</p>
            <p><FaPhone /> {profile.phone}</p>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>About Me</h3>
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows="4"
              placeholder="Write your bio here..."
            />
          ) : (
            <p>{profile.bio || 'No bio added yet'}</p>
          )}
        </div>

        <div className="profile-section">
          <h3>Assigned Farmers</h3>
          <div className="assigned-users">
            {assignedUsers.length === 0 ? (
              <p>No farmers assigned yet</p>
            ) : (
              assignedUsers.map(user => (
                <div key={user.id} className="user-card">
                  <FaUsers className="user-icon" />
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span>{user.phone}</span>
                    <span className="user-address">{user.address}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="profile-actions">
          {editing ? (
            <>
              <button className="save-btn" onClick={handleUpdateProfile}>Save Changes</button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile