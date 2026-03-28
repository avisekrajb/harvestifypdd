import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000,
  withCredentials: false
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server')
      return Promise.reject(error)
    }
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/me')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/?login=true'
      toast.error('Session expired. Please login again.')
    }
    return Promise.reject(error)
  }
)

// ==================== AUTH APIs ====================
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData)
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export const verifyOtp = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp })
  return response.data
}

export const resetPassword = async (email, password) => {
  const response = await api.post('/auth/reset-password', { email, password })
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

// ==================== CROP APIs ====================
export const recommendCrops = async (data) => {
  const response = await api.post('/crops/recommend', data)
  return response.data
}

export const getUserCropHistory = async () => {
  const response = await api.get('/crops/history')
  return response.data
}

// ==================== FERTILIZER APIs ====================
export const predictFertilizer = async (data) => {
  const response = await api.post('/fertilizer/predict', data)
  return response.data
}

export const getUserFertilizerHistory = async () => {
  const response = await api.get('/fertilizer/history')
  return response.data
}

// ==================== PRODUCT APIs ====================
export const getProducts = async (category = 'all') => {
  const response = await api.get(`/products?category=${category}`)
  return response.data
}

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`)
  return response.data
}

export const createProduct = async (productData) => {
  const response = await api.post('/admin/products', productData)
  return response.data
}

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/admin/products/${id}`, productData)
  return response.data
}

export const deleteProduct = async (id) => {
  const response = await api.delete(`/admin/products/${id}`)
  return response.data
}

export const uploadProductPhoto = async (file) => {
  const formData = new FormData()
  formData.append('photo', file)
  const response = await api.post('/admin/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// ==================== ORDER APIs ====================
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData)
  return response.data
}

export const getUserOrders = async () => {
  const response = await api.get('/orders')
  return response.data
}

export const updateOrderStatus = async (orderId, status, doctorName = null) => {
  const response = await api.put(`/admin/orders/${orderId}/status`, { 
    status, 
    doctor_name: doctorName 
  })
  return response.data
}

// ==================== PROFILE APIs ====================
export const updateProfile = async (profileData) => {
  const response = await api.put('/profile', profileData)
  return response.data
}

export const changePassword = async (passwordData) => {
  const response = await api.post('/profile/change-password', passwordData)
  return response.data
}

// ==================== WEATHER API ====================
export const getWeather = async (city, state) => {
  const response = await api.get(`/weather?city=${city}&state=${state}`)
  return response.data
}

// ==================== ADMIN APIs ====================
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data
}

export const getAllOrders = async () => {
  const response = await api.get('/admin/orders')
  return response.data
}

export const getAllUsers = async () => {
  const response = await api.get('/admin/users')
  return response.data
}

export const getDoctors = async () => {
  const response = await api.get('/admin/doctors')
  return response.data
}

export const createDoctor = async (doctorData) => {
  const response = await api.post('/admin/doctors', doctorData)
  return response.data
}

export const updateDoctor = async (id, doctorData) => {
  const response = await api.put(`/admin/doctors/${id}`, doctorData)
  return response.data
}

export const deleteDoctor = async (id) => {
  if (!id) {
    throw new Error('Doctor ID is required')
  }
  const response = await api.delete(`/admin/doctors/${id}`)
  return response.data
}

export const getMessages = async () => {
  const response = await api.get('/admin/messages')
  return response.data
}

export const sendContactMessage = async (messageData) => {
  const response = await api.post('/admin/messages', messageData)
  return response.data
}

export const markMessageRead = async (id) => {
  const response = await api.put(`/admin/messages/${id}/read`)
  return response.data
}

// ==================== DISEASE DETECTION APIs ====================
export const detectDisease = async (formData) => {
  const response = await api.post('/disease/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  })
  return response.data
}

export const getUserDiseaseHistory = async () => {
  const response = await api.get('/disease/history')
  return response.data
}

export const getDiseaseHistoryDetail = async (id) => {
  const response = await api.get(`/disease/history/${id}`)
  return response.data
}

// ==================== DOCTOR APIs ====================
export const doctorLogin = async (email, password) => {
  const response = await api.post('/doctor/login', { email, password })
  return response.data
}

export const getDoctorDashboard = async () => {
  const response = await api.get('/doctor/dashboard')
  return response.data
}

export const getDoctorProfile = async () => {
  const response = await api.get('/doctor/profile')
  return response.data
}

export const updateDoctorProfile = async (profileData) => {
  const response = await api.put('/doctor/profile', profileData)
  return response.data
}

export const updateConsultationStatus = async (userId, status, notes = '') => {
  const response = await api.put(`/doctor/consultation/${userId}/status`, { status, notes })
  return response.data
}

export const addConsultationNotes = async (userId, notes) => {
  const response = await api.post(`/doctor/consultation/${userId}/notes`, { notes })
  return response.data
}

export const getAssignedUsers = async () => {
  const response = await api.get('/doctor/assigned-users')
  return response.data
}

// ==================== USER DASHBOARD APIs ====================
export const getUserDashboard = async () => {
  const response = await api.get('/user/dashboard')
  return response.data
}

// ==================== UPLOAD APIs ====================
export const uploadFile = async (file, type = 'general') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export default api
