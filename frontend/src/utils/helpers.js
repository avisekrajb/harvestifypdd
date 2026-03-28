export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatShortDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const getCropEmoji = (cropName) => {
  const emojiMap = {
    'rice': '🌾',
    'wheat': '🌾',
    'maize': '🌽',
    'cotton': '🌿',
    'groundnut': '🥜',
    'soybean': '🫘',
    'sugarcane': '🎋',
    'potato': '🥔',
    'tomato': '🍅',
    'onion': '🧅',
    'cabbage': '🥬',
    'cauliflower': '🥦',
    'chilli': '🌶️',
    'okra': '🥬'
  }
  return emojiMap[cropName?.toLowerCase()] || '🌱'
}

export const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return '#4ade80'
  if (confidence >= 60) return '#fbbf24'
  return '#f87171'
}

export const getConfidenceText = (confidence) => {
  if (confidence >= 80) return 'High Match'
  if (confidence >= 60) return 'Medium Match'
  return 'Low Match'
}

export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= currentPrice) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

export const renderStars = (rating) => {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const stars = []
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('★')
  }
  if (hasHalf) {
    stars.push('½')
  }
  while (stars.length < 5) {
    stars.push('☆')
  }
  return stars.join('')
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/
  return re.test(phone)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

export const generateOrderId = () => {
  return 'ORD' + Math.random().toString(36).substring(2, 10).toUpperCase()
}

export const getStatusColor = (status) => {
  const colors = {
    pending: '#fbbf24',
    processing: '#60a5fa',
    delivered: '#4ade80',
    cancelled: '#f87171'
  }
  return colors[status] || '#6b7280'
}

export const getStatusIcon = (status) => {
  const icons = {
    pending: '⏳',
    processing: '🔄',
    delivered: '✅',
    cancelled: '❌'
  }
  return icons[status] || '📦'
}

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

export const sortByDate = (array, field = 'created_at', order = 'desc') => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[field])
    const dateB = new Date(b[field])
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}