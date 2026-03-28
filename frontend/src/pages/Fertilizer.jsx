import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import FertilizerResult from '../components/FertilizerResult'
import FertilizerHistoryTable from '../components/FertilizerHistoryTable'
import WeatherWidget from '../components/WeatherWidget'
import { predictFertilizer, getUserFertilizerHistory, getWeather } from '../services/api'
import { FaFlask, FaSearch, FaHistory } from 'react-icons/fa'
import toast from 'react-hot-toast'
import '../styles/Fertilizer.css'

const Fertilizer = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('predict')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [history, setHistory] = useState([])
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    crop: '',
    soilType: '',
    nLevel: '',
    pLevel: '',
    kLevel: '',
    ph: ''
  })

  const [errors, setErrors] = useState({})

  const cropOptions = [
    'Rice', 'Wheat', 'Maize', 'Barley', 'Cotton', 'Groundnut', 
    'Soybean', 'Sugarcane', 'Sunflower', 'Potato', 'Tomato', 
    'Onion', 'Chickpea', 'Pigeonpea', 'Mungbean', 'Blackgram',
    'Rapeseed', 'Mustard', 'Linseed', 'Sesame', 'Safflower',
    'Castor', 'Jute', 'Mesta', 'Cowpea', 'Pea', 'Bean',
    'Cabbage', 'Cauliflower', 'Brinjal', 'Chilli', 'Okra'
  ]

  const soilTypeOptions = [
    'Clayey', 'Loamy', 'Sandy', 'Silty', 'Peaty', 'Chalky', 'Saline'
  ]

  const nutrientLevelOptions = ['Low', 'Medium', 'High']

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    }
  }, [activeTab])

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (formData.city && formData.state) {
        setWeatherLoading(true)
        try {
          const data = await getWeather(formData.city, formData.state)
          setWeather(data)
        } catch (error) {
          console.error('Weather fetch error:', error)
        } finally {
          setWeatherLoading(false)
        }
      }
    }

    const debounceTimer = setTimeout(fetchWeatherData, 1000)
    return () => clearTimeout(debounceTimer)
  }, [formData.city, formData.state])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const data = await getUserFertilizerHistory()
      setHistory(data.history || [])
    } catch (error) {
      toast.error('Failed to fetch history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State/Province is required'
    if (!formData.crop) newErrors.crop = 'Please select a crop'
    if (!formData.soilType) newErrors.soilType = 'Please select soil type'
    if (!formData.nLevel) newErrors.nLevel = 'Please select nitrogen level'
    if (!formData.pLevel) newErrors.pLevel = 'Please select phosphorus level'
    if (!formData.kLevel) newErrors.kLevel = 'Please select potassium level'
    if (!formData.ph || formData.ph < 0 || formData.ph > 14) {
      newErrors.ph = 'pH must be between 0-14'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fix the errors in the form')
      return
    }
    
    setLoading(true)
    try {
      const result = await predictFertilizer({
        ...formData,
        ph: parseFloat(formData.ph),
        weather: weather
      })
      
      setPrediction(result)
      setActiveTab('result')
      toast.success('Fertilizer recommendation generated!')
      
    } catch (error) {
      console.error("API Error:", error)
      toast.error(error.error || 'Failed to get fertilizer recommendation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fertilizer-page">
      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => setActiveTab('predict')}
          >
            <FaFlask /> Predict Fertilizer
          </button>
          <button
            className={`tab ${activeTab === 'result' ? 'active' : ''}`}
            onClick={() => setActiveTab('result')}
            disabled={!prediction}
          >
            <FaSearch /> Results
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory /> History
          </button>
        </div>

        {(formData.city || formData.state) && (
          <WeatherWidget 
            weather={weather} 
            loading={weatherLoading}
            city={formData.city}
            state={formData.state}
          />
        )}

        {activeTab === 'predict' && (
          <div className="form-card">
            <h2 className="form-title">Fertilizer Recommendation</h2>
            
            <form onSubmit={handleSubmit} className="fertilizer-form">
              <div className="form-section">
                <h3 className="section-title">📍 Location</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city name"
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="error-text">{errors.city}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>State/Province *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state/province"
                      className={errors.state ? 'error' : ''}
                    />
                    {errors.state && <span className="error-text">{errors.state}</span>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">🌱 Crop & Soil Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Crop *</label>
                    <select
                      name="crop"
                      value={formData.crop}
                      onChange={handleChange}
                      className={errors.crop ? 'error' : ''}
                    >
                      <option value="">Select Crop</option>
                      {cropOptions.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                    {errors.crop && <span className="error-text">{errors.crop}</span>}
                  </div>

                  <div className="form-group">
                    <label>Soil Type *</label>
                    <select
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                      className={errors.soilType ? 'error' : ''}
                    >
                      <option value="">Select Soil Type</option>
                      {soilTypeOptions.map(soil => (
                        <option key={soil} value={soil}>{soil}</option>
                      ))}
                    </select>
                    {errors.soilType && <span className="error-text">{errors.soilType}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nitrogen Level (N) *</label>
                    <select
                      name="nLevel"
                      value={formData.nLevel}
                      onChange={handleChange}
                      className={errors.nLevel ? 'error' : ''}
                    >
                      <option value="">Select N Level</option>
                      {nutrientLevelOptions.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    {errors.nLevel && <span className="error-text">{errors.nLevel}</span>}
                  </div>

                  <div className="form-group">
                    <label>Phosphorus Level (P) *</label>
                    <select
                      name="pLevel"
                      value={formData.pLevel}
                      onChange={handleChange}
                      className={errors.pLevel ? 'error' : ''}
                    >
                      <option value="">Select P Level</option>
                      {nutrientLevelOptions.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    {errors.pLevel && <span className="error-text">{errors.pLevel}</span>}
                  </div>

                  <div className="form-group">
                    <label>Potassium Level (K) *</label>
                    <select
                      name="kLevel"
                      value={formData.kLevel}
                      onChange={handleChange}
                      className={errors.kLevel ? 'error' : ''}
                    >
                      <option value="">Select K Level</option>
                      {nutrientLevelOptions.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    {errors.kLevel && <span className="error-text">{errors.kLevel}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Soil pH *</label>
                    <input
                      type="number"
                      name="ph"
                      value={formData.ph}
                      onChange={handleChange}
                      placeholder="0-14"
                      step="0.1"
                      min="0"
                      max="14"
                      className={errors.ph ? 'error' : ''}
                    />
                    {errors.ph && <span className="error-text">{errors.ph}</span>}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary submit-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : <><FaFlask /> Get Fertilizer Recommendation</>}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'result' && prediction && (
          <FertilizerResult prediction={prediction} />
        )}

        {activeTab === 'history' && (
          <div className="history-container">
            <h2 className="history-title">Your Fertilizer Recommendation History</h2>
            {historyLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading history...</p>
              </div>
            ) : (
              <FertilizerHistoryTable history={history} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Fertilizer