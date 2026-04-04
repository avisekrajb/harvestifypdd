import React, { useState, useEffect } from 'react';
import { 
  FaBug, FaCloudUploadAlt, FaSpinner, FaCheckCircle, 
  FaExclamationTriangle, FaInfoCircle, FaLeaf, FaChartLine, 
  FaFlask, FaClock, FaSeedling, FaTint, FaUserMd, 
  FaShieldAlt, FaHistory, FaTimes, FaImage, FaCalendar,
  FaSearch, FaDownload, FaEye
} from 'react-icons/fa';
import { detectDisease, getUserDiseaseHistory, getDiseaseHistoryDetail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('detect');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploadTime, setUploadTime] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchHistory();
    }
  }, [activeTab, user]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await getUserDiseaseHistory();
      setHistory(response.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (PNG, JPG, JPEG, WebP)');
        return;
      }

      if (file.size > 16 * 1024 * 1024) {
        toast.error('File size should be less than 16MB');
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      
      const sizeInKB = file.size / 1024;
      if (sizeInKB < 1024) {
        setFileSize(`${sizeInKB.toFixed(1)} KB`);
      } else {
        setFileSize(`${(sizeInKB / 1024).toFixed(1)} MB`);
      }

      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file) handleFileSelect({ target: { files: [file] } });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    setUploadTime(new Date().toLocaleString());

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await detectDisease(formData);
      setResult(response);
      toast.success('Analysis complete!');
      if (activeTab === 'history') fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setFileName('');
    setFileSize('');
    setUploadTime('');
  };

  const viewHistoryDetail = async (id) => {
    try {
      const detail = await getDiseaseHistoryDetail(id);
      setSelectedHistory(detail);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load details');
    }
  };

  const getConfidenceClass = (confidence) => {
    if (confidence >= 70) return 'confidence-high';
    if (confidence >= 40) return 'confidence-medium';
    return 'confidence-low';
  };

  const getPlantIcon = (disease) => {
    const lowerDisease = disease?.toLowerCase() || '';
    if (lowerDisease.includes('corn')) return '🌽';
    if (lowerDisease.includes('potato')) return '🥔';
    if (lowerDisease.includes('tomato')) return '🍅';
    return '🌱';
  };

  const getPlantName = (disease, plantName) => {
    if (plantName && plantName !== 'Unknown') return plantName;
    const lowerDisease = disease?.toLowerCase() || '';
    if (lowerDisease.includes('corn')) return 'Corn';
    if (lowerDisease.includes('potato')) return 'Potato';
    if (lowerDisease.includes('tomato')) return 'Tomato';
    return 'Plant';
  };

  const parseResponseSections = (text) => {
    if (!text) return null;
    const sections = { symptoms: [], organic: [], chemical: [], prevention: [] };
    const lines = text.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('symptom')) currentSection = 'symptoms';
      else if (lowerLine.includes('organic')) currentSection = 'organic';
      else if (lowerLine.includes('chemical')) currentSection = 'chemical';
      else if (lowerLine.includes('prevention')) currentSection = 'prevention';
      
      const trimmedLine = line.trim();
      if (trimmedLine && (trimmedLine.startsWith('-') || trimmedLine.startsWith('•'))) {
        const item = trimmedLine.replace(/^[-•]\s*/, '');
        if (currentSection === 'symptoms') sections.symptoms.push(item);
        else if (currentSection === 'organic') sections.organic.push(item);
        else if (currentSection === 'chemical') sections.chemical.push(item);
        else if (currentSection === 'prevention') sections.prevention.push(item);
      }
    }
    return sections;
  };

  return (
    <div className="disease-detection">
      <div className="container">
        {/* Tabs */}
        <div className="detection-tabs">
          <button 
            className={`tab-btn ${activeTab === 'detect' ? 'active' : ''}`}
            onClick={() => setActiveTab('detect')}
          >
            <FaBug /> Detect Disease
          </button>
          {user && (
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory /> My History
            </button>
          )}
        </div>

        {/* Detection Tab */}
        {activeTab === 'detect' && (
          <div className="main-card">
            <div className="text-center mb-4">
              <h1 className="display-4 fw-bold text-success">
                <FaBug className="me-3" />
                AI Plant Disease Detection
              </h1>
              <p className="text-muted lead"> Upload a plant leaf image for instant analysis</p>
            </div>

            <div className="supported-plants">
              <h5><FaInfoCircle className="me-2" /> How it works</h5>
              <div className="plant-badges">
                <span className="plant-badge"><FaSeedling /> Upload clear leaf image</span>
                <span className="plant-badge"><FaChartLine /> AI analyzes with your trained model</span>
                <span className="plant-badge"><FaFlask /> Get treatment recommendations</span>
              </div>
            </div>

            {!result ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div 
                    className="upload-area"
                    onClick={() => document.getElementById('fileInput').click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <FaCloudUploadAlt className="upload-icon" />
                    <h4 className="mt-3 text-success">Click to upload or drag and drop</h4>
                    <p className="text-muted">PNG, JPG, JPEG, WebP (Max. 16MB)</p>
                  </div>
                  <input 
                    type="file" 
                    id="fileInput" 
                    accept=".jpg,.jpeg,.png,.webp" 
                    onChange={handleFileSelect} 
                    className="d-none" 
                  />
                  {fileName && (
                    <div className="file-info">
                      <FaCheckCircle className="text-success me-2" />
                      Selected: <strong>{fileName}</strong> <span className="text-muted ms-2">({fileSize})</span>
                    </div>
                  )}
                </div>
                
                {loading && (
                  <div className="text-center">
                    <FaSpinner className="spinner-icon" />
                    <p className="mt-2 text-success fw-bold">Analyzing with your trained model...</p>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={!selectedFile || loading}
                >
                  <FaBug className="me-2" />
                  {loading ? 'Analyzing...' : 'Detect Disease with AI'}
                </button>
              </form>
            ) : (
              <div className="result-card">
                <h4 className="mb-4 text-success"><FaChartLine className="me-2" /> Analysis Results</h4>
                
                <div className="result-grid">
                  <div className="result-image">
                    <img src={previewUrl} alt="Uploaded" />
                    <p className="text-muted small mt-2"><FaLeaf /> Uploaded Leaf Image</p>
                    <div className="file-details">
                      <p><FaImage /> {fileName}</p>
                      <p><FaClock /> {uploadTime}</p>
                      <p><FaChartLine /> {fileSize}</p>
                    </div>
                  </div>
                  
                  <div className="result-details">
                    <div className="detection-summary">
                      <div className="detection-item">
                        <FaSeedling className="detection-icon" />
                        <div><span className="detection-label">Detected Plant</span><span className="detection-value">{getPlantIcon(result.disease)} {getPlantName(result.disease, result.plantName)}</span></div>
                      </div>
                      <div className="detection-item">
                        <FaExclamationTriangle className="detection-icon text-danger" />
                        <div><span className="detection-label">Detected Disease</span><span className="detection-value fw-bold">{result.disease}</span></div>
                      </div>
                      <div className="detection-item">
                        <FaChartLine className="detection-icon" />
                        <div><span className="detection-label">Confidence Score</span><span className={`detection-value ${getConfidenceClass(result.confidence)}`}>{result.confidence?.toFixed(2)}%</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {result.geminiResponse && (
                  <div className="gemini-analysis">
                    <div className="gemini-header">
                      <FaFlask className="gemini-icon" />
                      <h5>Treatment Plan</h5>
                      <span className="gemini-badge">powered by batch-6 </span>
                    </div>
                    <div className="treatment-content">
                      {(() => {
                        const sections = parseResponseSections(result.geminiResponse);
                        return (
                          <>
                            {sections.symptoms.length > 0 && (
                              <div className="treatment-section"><h6><FaExclamationTriangle /> Symptoms</h6><ul>{sections.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                            )}
                            {sections.organic.length > 0 && (
                              <div className="treatment-section organic"><h6><FaLeaf /> Organic Remedies</h6><ul>{sections.organic.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
                            )}
                            {sections.chemical.length > 0 && (
                              <div className="treatment-section chemical"><h6><FaFlask /> Chemical Treatments</h6><ul>{sections.chemical.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
                            )}
                            {sections.prevention.length > 0 && (
                              <div className="treatment-section prevention"><h6><FaShieldAlt /> Prevention Tips</h6><ul>{sections.prevention.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                            )}
                            {!sections.symptoms.length && !sections.organic.length && (
                              <div className="treatment-raw"><div style={{ whiteSpace: 'pre-wrap' }}>{result.geminiResponse}</div></div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div className="text-center mt-4">
                  <button onClick={resetForm} className="btn-outline">Analyze Another Image</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-card">
            <h2><FaHistory /> Detection History</h2>
            {historyLoading ? (
              <div className="loading-container"><FaSpinner className="spinner-icon" /><p>Loading history...</p></div>
            ) : history.length === 0 ? (
              <div className="empty-history"><FaHistory /><p>No detection history yet. Upload an image to get started!</p></div>
            ) : (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr><th>Image</th><th>Disease</th><th>Plant</th><th>Confidence</th><th>Date</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {history.map(item => (
                      <tr key={item._id}>
                        <td><img src={item.image_url} alt={item.filename} className="history-thumb" /></td>
                        <td className="disease-cell">{item.disease}</td>
                        <td><span className="plant-badge-sm">{getPlantIcon(item.disease)} {item.plant_name}</span></td>
                        <td><span className={`confidence-badge ${getConfidenceClass(item.confidence)}`}>{item.confidence?.toFixed(1)}%</span></td>
                        <td><FaCalendar /> {new Date(item.created_at).toLocaleDateString()}</td>
                        <td><button className="view-btn" onClick={() => viewHistoryDetail(item._id)}><FaEye /> View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedHistory && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}><FaTimes /></button>
            <div className="modal-header"><h3><FaBug /> Disease Analysis Details</h3></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-image">
                  <img src={selectedHistory.image_url} alt={selectedHistory.filename} />
                  <p><FaImage /> {selectedHistory.filename}</p>
                  <p><FaCalendar /> {new Date(selectedHistory.created_at).toLocaleString()}</p>
                </div>
                <div className="detail-info">
                  <div className="detail-item"><strong>Disease:</strong> <span>{selectedHistory.disease}</span></div>
                  <div className="detail-item"><strong>Plant:</strong> <span>{getPlantIcon(selectedHistory.disease)} {selectedHistory.plant_name}</span></div>
                  <div className="detail-item"><strong>Confidence:</strong> <span className={`confidence-badge ${getConfidenceClass(selectedHistory.confidence)}`}>{selectedHistory.confidence?.toFixed(1)}%</span></div>
                </div>
              </div>
              {selectedHistory.gemini_response && (
                <div className="detail-treatment">
                  <h4><FaFlask /> Treatment Recommendations</h4>
                  <div className="treatment-content" style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedHistory.gemini_response}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
