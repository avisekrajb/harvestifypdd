// Email validation helper
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Phone validation helper (Indian phone numbers)
export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/
  return re.test(phone)
}

// Password validation helper
export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validateCropForm = (formData) => {
  const errors = {}
  
  if (!formData.city?.trim()) {
    errors.city = 'City is required'
  }
  if (!formData.state?.trim()) {
    errors.state = 'State/Province is required'
  }
  
  const n = parseFloat(formData.N)
  if (!formData.N || isNaN(n) || n < 0 || n > 140) {
    errors.N = 'N must be between 0-140'
  }
  
  const p = parseFloat(formData.P)
  if (!formData.P || isNaN(p) || p < 0 || p > 140) {
    errors.P = 'P must be between 0-140'
  }
  
  const k = parseFloat(formData.K)
  if (!formData.K || isNaN(k) || k < 0 || k > 140) {
    errors.K = 'K must be between 0-140'
  }
  
  const ph = parseFloat(formData.ph)
  if (!formData.ph || isNaN(ph) || ph < 0 || ph > 14) {
    errors.ph = 'pH must be between 0-14'
  }
  
  const rainfall = parseFloat(formData.rainfall)
  if (!formData.rainfall || isNaN(rainfall) || rainfall < 0 || rainfall > 500) {
    errors.rainfall = 'Rainfall must be between 0-500 mm'
  }
  
  return errors
}

export const validateFertilizerForm = (formData) => {
  const errors = {}
  
  if (!formData.city?.trim()) errors.city = 'City is required'
  if (!formData.state?.trim()) errors.state = 'State/Province is required'
  if (!formData.crop) errors.crop = 'Please select a crop'
  if (!formData.soilType) errors.soilType = 'Please select soil type'
  if (!formData.nLevel) errors.nLevel = 'Please select nitrogen level'
  if (!formData.pLevel) errors.pLevel = 'Please select phosphorus level'
  if (!formData.kLevel) errors.kLevel = 'Please select potassium level'
  
  const ph = parseFloat(formData.ph)
  if (!formData.ph || isNaN(ph) || ph < 0 || ph > 14) {
    errors.ph = 'pH must be between 0-14'
  }
  
  return errors
}

export const validateLoginForm = (formData) => {
  const errors = {}
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email address'
  }
  
  if (!formData.password) {
    errors.password = 'Password is required'
  }
  
  return errors
}

export const validateSignupForm = (formData) => {
  const errors = {}
  
  if (!formData.name?.trim()) {
    errors.name = 'Name is required'
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email address'
  }
  
  if (!formData.password) {
    errors.password = 'Password is required'
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = 'Invalid phone number (must be 10 digits starting with 6-9)'
  }
  
  return errors
}

export const validateCheckoutForm = (formData) => {
  const errors = {}
  
  if (!formData.name?.trim()) {
    errors.name = 'Name is required'
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email address'
  }
  
  if (!formData.phone?.trim()) {
    errors.phone = 'Phone is required'
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Invalid phone number (must be 10 digits starting with 6-9)'
  }
  
  if (!formData.address?.trim()) {
    errors.address = 'Address is required'
  }
  
  return errors
}

// Export all validators as a single object
const validators = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateCropForm,
  validateFertilizerForm,
  validateLoginForm,
  validateSignupForm,
  validateCheckoutForm
}

export default validators