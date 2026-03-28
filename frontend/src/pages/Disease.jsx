import React, { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { FaCamera, FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import '../styles/Disease.css'

const Disease = () => {
  const { user } = useAuth()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef()

  const diseases = [
    { name: 'Leaf Blight', crop: 'Rice', severity: 'High', confidence: 94, treatment: 'Apply copper-based fungicide, improve drainage', prevention: 'Use resistant varieties, crop rotation' },
    { name: 'Powdery Mildew', crop: 'Wheat', severity: 'Medium', confidence: 87, treatment: 'Apply sulfur-based fungicide, increase air circulation', prevention: 'Avoid overhead irrigation, plant resistant varieties' },
    { name: 'Root Rot', crop: 'Vegetables', severity: 'High', confidence: 91, treatment: 'Apply Trichoderma, improve soil drainage', prevention: 'Crop rotation, use disease-free seeds' },
    { name: 'Rust', crop: 'Maize', severity: 'Medium', confidence: 85, treatment: 'Apply azoxystrobin fungicide', prevention: 'Plant resistant hybrids, remove crop debris' },
    { name: 'Bacterial Wilt', crop: 'Tomato', severity: 'Critical', confidence: 96, treatment: 'Remove infected plants, apply copper spray', prevention: 'Use certified seeds, solarize soil' },
    { name: 'Healthy', crop: 'General', severity: 'None', confidence: 98, treatment: 'Continue current practices', prevention: 'Maintain proper nutrition and irrigation' }
  ]

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }
    
    setImage(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target.result)
    }
    reader.readAsDataURL(file)
    setResult(null)
  }

  const analyzeImage = () => {
    if (!user) {
      toast.error('Please login to use disease detection')
      return
    }
    
    if (!image) {
      toast.error('Please upload an image first')
      return
    }
    
    setAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const randomDisease = diseases[Math.floor(Math.random() * diseases.length)]
      setResult(randomDisease)
      setAnalyzing(false)
      toast.success('Analysis complete!')
    }, 3000)
  }

  const resetAnalysis = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="disease-page">
      <div className="container">
        <div className="disease-header">
          <h1 className="disease-title">AI Disease Detection</h1>
          <p className="disease-subtitle">
            Upload a photo of your crop and our AI will identify diseases and recommend treatments
          </p>
        </div>

        <div className="disease-content">
          <div className="upload-section">
            <div 
              className={`upload-area ${preview ? 'has-image' : ''}`}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {!preview ? (
                <>
                  <FaCamera className="upload-icon" />
                  <h3>Upload Crop Photo</h3>
                  <p>Click or drag and drop to upload</p>
                  <span className="upload-hint">Supports JPG, PNG, WebP (Max 5MB)</span>
                </>
              ) : (
                <>
                  <img src={preview} alt="Crop preview" className="image-preview" />
                  <button className="change-image-btn" onClick={(e) => {
                    e.stopPropagation()
                    resetAnalysis()
                  }}>
                    Change Image
                  </button>
                </>
              )}
            </div>

            {preview && !result && (
              <button 
                className="analyze-btn"
                onClick={analyzeImage}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <FaSpinner className="spinning" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FaUpload />
                    Analyze Disease
                  </>
                )}
              </button>
            )}
          </div>

          {analyzing && (
            <div className="analyzing-state">
              <div className="analyzing-animation">
                <div className="pulse-ring"></div>
                <div className="analyzing-icon">🔬</div>
              </div>
              <h3>AI Analyzing Your Crop</h3>
              <p>Processing image through our deep learning model...</p>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          )}

          {result && !analyzing && (
            <div className="results-section">
              <div className={`result-card ${result.severity.toLowerCase()}`}>
                <div className="result-header">
                  <div className="result-icon">
                    {result.severity === 'Critical' ? <FaExclamationTriangle /> : 
                     result.severity === 'None' ? <FaCheckCircle /> : '🔬'}
                  </div>
                  <div className="result-title">
                    <h2>{result.name}</h2>
                    <p>Detected on {result.crop}</p>
                  </div>
                  <div className="confidence-badge">
                    {result.confidence}% Confidence
                  </div>
                </div>

                <div className="severity-indicator">
                  <span className="severity-label">Severity:</span>
                  <span className={`severity-value ${result.severity.toLowerCase()}`}>
                    {result.severity}
                  </span>
                </div>

                {result.severity !== 'None' ? (
                  <>
                    <div className="treatment-section">
                      <h3>💊 Recommended Treatment</h3>
                      <p>{result.treatment}</p>
                    </div>
                    <div className="prevention-section">
                      <h3>🛡️ Prevention Tips</h3>
                      <p>{result.prevention}</p>
                    </div>
                    <div className="warning-note">
                      <FaExclamationTriangle />
                      <p>For severe cases, consult a local agronomist immediately</p>
                    </div>
                  </>
                ) : (
                  <div className="healthy-section">
                    <FaCheckCircle className="healthy-icon" />
                    <h3>Your Crop Looks Healthy! 🌱</h3>
                    <p>Continue with your current farming practices to maintain crop health.</p>
                    <div className="healthy-tips">
                      <h4>Maintenance Tips:</h4>
                      <ul>
                        <li>Regular monitoring for early signs of diseases</li>
                        <li>Maintain proper irrigation schedule</li>
                        <li>Apply balanced fertilizers as per soil test</li>
                        <li>Practice crop rotation for sustainable farming</li>
                      </ul>
                    </div>
                  </div>
                )}

                <button className="new-analysis-btn" onClick={resetAnalysis}>
                  Analyze Another Image
                </button>
              </div>

              {result.severity !== 'None' && (
                <div className="expert-consult">
                  <h3>Need Expert Advice?</h3>
                  <p>Our agronomists can provide personalized guidance for your crop</p>
                  <button className="consult-btn">Book Consultation →</button>
                </div>
              )}
            </div>
          )}

          <div className="disease-info">
            <h3>Common Crop Diseases</h3>
            <div className="disease-grid">
              {diseases.slice(0, 4).map((disease, idx) => (
                <div key={idx} className="disease-info-card">
                  <div className="disease-name">{disease.name}</div>
                  <div className="disease-crop">{disease.crop}</div>
                  <div className={`disease-severity ${disease.severity.toLowerCase()}`}>
                    {disease.severity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Disease