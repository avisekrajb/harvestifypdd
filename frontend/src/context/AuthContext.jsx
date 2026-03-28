import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      console.log('=== INITIALIZING AUTH ===')
      console.log('Stored token exists:', !!storedToken)
      console.log('Stored user:', storedUser)
      
      if (storedToken && storedUser) {
        try {
          // Set token in state and axios headers
          setToken(storedToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
          
          // Parse stored user
          const userData = JSON.parse(storedUser)
          console.log('Parsed stored user:', userData)
          console.log('User role from storage:', userData.role)
          console.log('Is admin from storage:', userData.role === 'admin')
          
          // Set user from storage immediately while verifying
          setUser(userData)
          
          // Verify token is still valid by fetching user
          const response = await api.get('/auth/me')
          const verifiedUser = response.data
          
          console.log('Verified user from server:', verifiedUser)
          console.log('Verified user role:', verifiedUser.role)
          
          // Update user with latest data from server
          setUser(verifiedUser)
          localStorage.setItem('user', JSON.stringify(verifiedUser))
          
        } catch (error) {
          console.error('Token validation failed:', error)
          // Token is invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          delete api.defaults.headers.common['Authorization']
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
      setAuthChecked(true)
      console.log('=== AUTH INITIALIZED ===')
    }
    
    initAuth()
  }, [])

  // Update axios headers when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = async (email, password) => {
    try {
      console.log('=== LOGIN ATTEMPT ===')
      console.log('Email:', email)
      const response = await api.post('/auth/login', { email, password })
      const { access_token, user: userData } = response.data
      
      console.log('Login response user:', userData)
      console.log('User role from login:', userData.role)
      console.log('Is admin:', userData.role === 'admin')
      
      // Store in localStorage
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Update state
      setToken(access_token)
      setUser(userData)
      
      toast.success(`Welcome back, ${userData.name}! 🌾`)
      console.log('=== LOGIN SUCCESS ===')
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData)
      const { access_token, user: userDataResponse } = response.data
      
      // Store in localStorage
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userDataResponse))
      
      // Update state
      setToken(access_token)
      setUser(userDataResponse)
      
      toast.success(`Welcome to Harvestify, ${userDataResponse.name}! 🌱`)
      return { success: true, user: userDataResponse }
    } catch (error) {
      console.error('Signup error:', error)
      const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = useCallback(() => {
    console.log('=== LOGGING OUT ===')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('OTP sent to your email')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send OTP'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const verifyOtp = async (email, otp) => {
    try {
      await api.post('/auth/verify-otp', { email, otp })
      toast.success('OTP verified')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Invalid OTP'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (email, password) => {
    try {
      await api.post('/auth/reset-password', { email, password })
      toast.success('Password reset successfully')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to reset password'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/profile', data)
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setUser(null)
      return false
    }
    
    try {
      const response = await api.get('/auth/me')
      const userData = response.data
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    } catch (error) {
      logout()
      return false
    }
  }, [logout])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      authChecked,
      login,
      signup,
      logout,
      forgotPassword,
      verifyOtp,
      resetPassword,
      updateProfile,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}