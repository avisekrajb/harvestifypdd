import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import CropCard from '../components/CropCard'
import HistoryTable from '../components/HistoryTable'
import { recommendCrops, getUserCropHistory } from '../services/api'
import { FaSearch, FaLeaf, FaThermometerHalf, FaTint, FaMountain, FaHistory } from 'react-icons/fa'
import toast from 'react-hot-toast'
import '../styles/Crops.css'

const Crops = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('recommendation')
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    N: '',
    P: '',
    K: '',
    ph: '',
    rainfall: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    }
  }, [activeTab])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const data = await getUserCropHistory()
      setHistory(data.history || [])
    } catch (error) {
      console.error('History fetch error:', error)
      toast.error(error.error || 'Failed to fetch history')
      setHistory([])
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
    
    const n = parseFloat(formData.N)
    if (!formData.N || isNaN(n) || n < 0 || n > 140) newErrors.N = 'N must be between 0-140'
    
    const p = parseFloat(formData.P)
    if (!formData.P || isNaN(p) || p < 0 || p > 140) newErrors.P = 'P must be between 0-140'
    
    const k = parseFloat(formData.K)
    if (!formData.K || isNaN(k) || k < 0 || k > 140) newErrors.K = 'K must be between 0-140'
    
    const ph = parseFloat(formData.ph)
    if (!formData.ph || isNaN(ph) || ph < 0 || ph > 14) newErrors.ph = 'pH must be between 0-14'
    
    const rainfall = parseFloat(formData.rainfall)
    if (!formData.rainfall || isNaN(rainfall) || rainfall < 0 || rainfall > 500) {
      newErrors.rainfall = 'Rainfall must be between 0-500 mm'
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
      const result = await recommendCrops({
        ...formData,
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall)
      })
      
      setRecommendations(result)
      setActiveTab('results')
      toast.success('Recommendations generated successfully!')
      
    } catch (error) {
      console.error('Recommendation error:', error)
      toast.error(error.error || 'Failed to get recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="crops-page">
      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'recommendation' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendation')}
          >
            <FaSearch /> New Recommendation
          </button>
          <button
            className={`tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
            disabled={!recommendations}
          >
            <FaLeaf /> Results
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('history')
              fetchHistory()
            }}
          >
            <FaHistory /> History
          </button>
        </div>

        {activeTab === 'recommendation' && (
          <div className="form-card">
            <h2 className="form-title">Enter Your Details</h2>
            
            <form onSubmit={handleSubmit} className="crop-form">
              <div className="form-section-title">
                <FaMountain className="section-icon" />
                <h3>Location</h3>
              </div>
              
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

              <div className="form-section-title">
                <FaLeaf className="section-icon" />
                <h3>Soil Nutrients (mg/kg)</h3>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nitrogen (N)</label>
                  <input
                    type="number"
                    name="N"
                    value={formData.N}
                    onChange={handleChange}
                    placeholder="0-140"
                    step="0.1"
                    min="0"
                    max="140"
                    className={errors.N ? 'error' : ''}
                  />
                  {errors.N && <span className="error-text">{errors.N}</span>}
                </div>
                
                <div className="form-group">
                  <label>Phosphorus (P)</label>
                  <input
                    type="number"
                    name="P"
                    value={formData.P}
                    onChange={handleChange}
                    placeholder="0-140"
                    step="0.1"
                    min="0"
                    max="140"
                    className={errors.P ? 'error' : ''}
                  />
                  {errors.P && <span className="error-text">{errors.P}</span>}
                </div>
                
                <div className="form-group">
                  <label>Potassium (K)</label>
                  <input
                    type="number"
                    name="K"
                    value={formData.K}
                    onChange={handleChange}
                    placeholder="0-140"
                    step="0.1"
                    min="0"
                    max="140"
                    className={errors.K ? 'error' : ''}
                  />
                  {errors.K && <span className="error-text">{errors.K}</span>}
                </div>
              </div>

              <div className="form-section-title">
                <FaThermometerHalf className="section-icon" />
                <h3>Other Factors</h3>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>pH Level</label>
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
                
                <div className="form-group">
                  <label>Rainfall (mm/year)</label>
                  <input
                    type="number"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleChange}
                    placeholder="0-500"
                    step="0.1"
                    min="0"
                    max="500"
                    className={errors.rainfall ? 'error' : ''}
                  />
                  {errors.rainfall && <span className="error-text">{errors.rainfall}</span>}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary submit-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : <><FaSearch /> Get Recommendations</>}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'results' && recommendations && (
          <div className="results-container">
            <div className="location-card">
              <div className="location-header">
                <FaMountain className="location-icon" />
                <h2>{recommendations.location?.city || 'N/A'}, {recommendations.location?.region || 'N/A'}</h2>
              </div>
              
              <div className="weather-grid">
                <div className="weather-item">
                  <FaThermometerHalf className="weather-icon" />
                  <div>
                    <span className="weather-label">Temperature</span>
                    <span className="weather-value">{recommendations.weather?.temperature?.toFixed(1) || 'N/A'}°C</span>
                  </div>
                </div>
                
                <div className="weather-item">
                  <FaTint className="weather-icon" />
                  <div>
                    <span className="weather-label">Humidity</span>
                    <span className="weather-value">{recommendations.weather?.humidity?.toFixed(1) || 'N/A'}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="soil-card">
              <h3><FaLeaf /> Soil Parameters</h3>
              <div className="soil-grid">
                <div className="soil-item">
                  <span className="soil-label">Nitrogen (N)</span>
                  <span className="soil-value">{recommendations.soil?.N?.toFixed(1) || 'N/A'} mg/kg</span>
                </div>
                <div className="soil-item">
                  <span className="soil-label">Phosphorus (P)</span>
                  <span className="soil-value">{recommendations.soil?.P?.toFixed(1) || 'N/A'} mg/kg</span>
                </div>
                <div className="soil-item">
                  <span className="soil-label">Potassium (K)</span>
                  <span className="soil-value">{recommendations.soil?.K?.toFixed(1) || 'N/A'} mg/kg</span>
                </div>
                <div className="soil-item">
                  <span className="soil-label">pH Level</span>
                  <span className="soil-value">{recommendations.soil?.ph?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="soil-item">
                  <span className="soil-label">Rainfall</span>
                  <span className="soil-value">{recommendations.soil?.rainfall?.toFixed(1) || 'N/A'} mm</span>
                </div>
              </div>
            </div>

            <div className="recommendations-section">
              <h3>Top Recommended Crops</h3>
              <div className="recommendations-grid">
                {recommendations.recommendations && recommendations.recommendations.map((rec, index) => (
                  <CropCard
                    key={index}
                    crop={rec.crop}
                    confidence={rec.confidence}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-container">
            <h2 className="history-title">Your Recommendation History</h2>
            {historyLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading history...</p>
              </div>
            ) : (
              <HistoryTable history={history} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Crops