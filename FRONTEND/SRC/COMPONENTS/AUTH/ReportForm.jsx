import { useState } from 'react';
import axios from 'axios';
import MapPicker from './MapPicker';
import VetMap from './VetMap'; // Add missing import

export default function ReportForm({ auth }){
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('Injured');
  const [animalType, setAnimalType] = useState('');
  const [injurySeverity, setInjurySeverity] = useState('Medium');
  const [latlng, setLatlng] = useState({ lat: 23.8103, lng: 90.4125 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [showVetMap, setShowVetMap] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [contactingVet, setContactingVet] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatlng({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setUseCurrentLocation(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          setMessage('Unable to get your current location. Please click on the map instead.');
        }
      );
    } else {
      setMessage('Geolocation is not supported by this browser. Please click on the map.');
    }
  };

  const uploadToCloudinary = async (file) => {
    try {
      const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(url, { method: 'POST', body: formData });
      return res.json();
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const analyzeImageWithAI = async (imageUrl) => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.post(`${backend}/api/reports/analyze-image`, { imageUrl });
      setAiAnalysis(res.data);
      setAnimalType(res.data.animalType);
      setInjurySeverity(res.data.injurySeverity);
    } catch (err) {
      console.error('AI analysis failed:', err);
      // Continue without AI analysis - it's optional
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFile(file);
    setAiAnalysis(null);

    // Upload and analyze
    setLoading(true);
    try {
      const uploadRes = await uploadToCloudinary(file);
      if (uploadRes.secure_url) {
        await analyzeImageWithAI(uploadRes.secure_url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setLoading(false);
  };

  const contactVetImmediately = async (vet) => {
    setContactingVet(true);
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${backend}/api/vets/contact`, {
        vetId: vet._id,
        reportId: null, // Will be set after report creation
        message: `Emergency: ${issueType} ${animalType} at location (${latlng.lat}, ${latlng.lng}). ${description}`
      });

      setSelectedVet(vet);
      setMessage(`✅ ${response.data.message}. Vet contact: ${response.data.vetContact.phone}`);
    } catch (error) {
      console.error('Error contacting vet:', error);
      setMessage('❌ Failed to contact vet. Please try again.');
    }
    setContactingVet(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { 
      setMessage('❌ Please select an image'); 
      return; 
    }
    
    setLoading(true);
    setMessage('');

    try {
      // Upload image to Cloudinary
      const uploadRes = await uploadToCloudinary(file);
      if (!uploadRes.secure_url) throw new Error('Image upload failed');

      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Prepare request data
      const reportData = {
        photoURL: uploadRes.secure_url,
        description,
        issueType,
        animalType,
        injurySeverity,
        lat: latlng.lat,
        lng: latlng.lng
      };

      // If user is logged in, send with auth header
      if (auth?.token) {
        const res = await axios.post(`${backend}/api/reports`, reportData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setMessage('✅ Report submitted successfully! Rescuers have been notified.');
      } else {
        // For demo purposes, allow submission without auth
        const res = await axios.post(`${backend}/api/reports`, reportData);
        setMessage('✅ Report submitted successfully! (Demo mode - please login for full features)');
      }

      // Reset form
      setFile(null);
      setDescription('');
      setIssueType('Injured');
      setAnimalType('');
      setInjurySeverity('Medium');
      setAiAnalysis(null);
      
    } catch (err) {
      console.error('Submission error:', err);
      setMessage(`❌ Submission failed: ${err.response?.data?.message || err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="wide-form-container">
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Left Column - Form Inputs */}
          <div className="form-column">
            <div className="form-section">
              <h3>📸 Animal Information</h3>
              
              <div className="form-group">
                <label>Animal Photo *</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={loading}
                />
                {file && (
                  <div style={{ marginTop: '8px' }}>
                    <small>Selected: {file.name}</small>
                    <div style={{ 
                      marginTop: '8px',
                      padding: '8px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      ✅ Image ready for upload
                    </div>
                  </div>
                )}
              </div>

              {aiAnalysis && (
                <div className="ai-analysis">
                  <h4>🤖 AI Analysis Results</h4>
                  <div className="ai-results">
                    <div className="ai-result-item">
                      <strong>Animal Type:</strong> 
                      <span className="ai-value">{aiAnalysis.animalType}</span>
                    </div>
                    <div className="ai-result-item">
                      <strong>Injury Severity:</strong> 
                      <span className={`ai-severity ${aiAnalysis.injurySeverity.toLowerCase()}`}>
                        {aiAnalysis.injurySeverity}
                      </span>
                    </div>
                    <div className="ai-result-item">
                      <strong>First Aid:</strong> 
                      <span className="ai-suggestion">{aiAnalysis.firstAidSuggestions}</span>
                    </div>
                    <div className="ai-confidence">
                      <small>Confidence: {(aiAnalysis.confidence * 100).toFixed(1)}%</small>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Issue Type *</label>
                  <select value={issueType} onChange={e => setIssueType(e.target.value)}>
                    <option value="Injured">🤕 Injured</option>
                    <option value="Starving">🍖 Starving</option>
                    <option value="Lost">🏠 Lost</option>
                    <option value="Other">❓ Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Animal Type</label>
                  <select value={animalType} onChange={e => setAnimalType(e.target.value)}>
                    <option value="">Select type</option>
                    <option value="Dog">🐕 Dog</option>
                    <option value="Cat">🐈 Cat</option>
                    <option value="Bird">🐦 Bird</option>
                    <option value="Other">🐾 Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Provide details about the animal's condition, behavior, location landmarks, time spotted, etc."
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Location */}
          <div className="form-column">
            <div className="form-section">
              <h3>📍 Location Details</h3>
              
              <div className="form-group">
                <label>Set Location *</label>
                <div className="location-controls">
                  <button 
                    type="button" 
                    onClick={getCurrentLocation}
                    className="btn btn-primary location-btn"
                  >
                    📍 Use Current Location
                  </button>
                  {useCurrentLocation && (
                    <span className="location-success">Location detected!</span>
                  )}
                </div>
                
                <div className="map-container-large">
                  <MapPicker latlng={latlng} setLatlng={setLatlng} />
                </div>
                
                <div className="coordinates">
                  <strong>Coordinates:</strong> 
                  Lat: {latlng.lat.toFixed(5)} | Lng: {latlng.lng.toFixed(5)}
                </div>
              </div>

              <div className="form-group">
                <label>Emergency Level</label>
                <select value={injurySeverity} onChange={e => setInjurySeverity(e.target.value)}>
                  <option value="Low">🟢 Low - Animal appears stable</option>
                  <option value="Medium">🟡 Medium - Needs attention soon</option>
                  <option value="High">🔴 High - Urgent care needed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vet Map Section */}
        {showVetMap && (
          <div className="vet-map-section">
            <div className="section-header">
              <h3>🏥 Find Nearby Veterinarians</h3>
              <button 
                type="button"
                onClick={() => setShowVetMap(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <VetMap 
              userLocation={latlng}
              onVetSelect={contactVetImmediately}
            />
            {contactingVet && (
              <div className="loading-message">
                Contacting veterinarian...
              </div>
            )}
          </div>
        )}

        {!showVetMap && (
          <div className="vet-help-section">
            <button 
              type="button"
              onClick={() => setShowVetMap(true)}
              className="find-vets-btn"
            >
              🏥 Find Nearby Veterinarians for Immediate Help
            </button>
            <p className="help-text">
              Contact a veterinarian immediately for emergency first aid guidance
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="submit-section">
          <button 
            type="submit" 
            className="submit-btn-large" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Submitting Report...
              </>
            ) : (
              <>
                🚨 Submit Animal Report
              </>
            )}
          </button>
          
          {!auth?.token && (
            <div className="demo-notice">
              <p>
                💡 <strong>Demo Mode:</strong> You can submit reports without an account. 
                For full features like tracking your reports and receiving updates, 
                please <a href="/register">register</a> or <a href="/login">login</a>.
              </p>
            </div>
          )}
        </div>
      </form>

      <style jsx>{`
        .wide-form-container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 30px;
        }
        
        .form-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-section {
          background: rgba(248, 249, 250, 0.8);
          padding: 25px;
          border-radius: 15px;
          border: 1px solid rgba(222, 226, 230, 0.5);
        }
        
        .form-section h3 {
          margin-bottom: 20px;
          color: #2c3e50;
          font-size: 1.3em;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: white;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        .form-group textarea {
          resize: vertical;
          min-height: 120px;
          font-family: inherit;
        }
        
        .location-controls {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .location-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .location-btn:hover {
          background: #2980b9;
        }
        
        .location-success {
          color: #27ae60;
          font-weight: 500;
          font-size: 14px;
        }
        
        .map-container-large {
          height: 400px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid #e9ecef;
          margin-bottom: 10px;
        }
        
        .coordinates {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 6px;
          font-size: 13px;
          color: #6c757d;
          text-align: center;
        }
        
        .ai-analysis {
          background: linear-gradient(135deg, #e8f4fd, #d1ecf1);
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #3498db;
          margin-bottom: 20px;
        }
        
        .ai-analysis h4 {
          margin-bottom: 15px;
          color: #2c3e50;
          font-size: 1.1em;
        }
        
        .ai-results {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .ai-result-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 8px 0;
          border-bottom: 1px solid rgba(52, 152, 219, 0.2);
        }
        
        .ai-value {
          font-weight: 600;
          color: #2c3e50;
        }
        
        .ai-severity {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }
        
        .ai-severity.high {
          background: #e74c3c;
        }
        
        .ai-severity.medium {
          background: #f39c12;
        }
        
        .ai-severity.low {
          background: #27ae60;
        }
        
        .ai-suggestion {
          font-size: 13px;
          color: #7f8c8d;
          font-style: italic;
        }
        
        .ai-confidence {
          text-align: right;
          font-size: 12px;
          color: #95a5a6;
          margin-top: 5px;
        }
        
        .vet-map-section {
          background: rgba(248, 249, 250, 0.8);
          padding: 25px;
          border-radius: 15px;
          border: 1px solid rgba(222, 226, 230, 0.5);
          margin-bottom: 20px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .close-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .close-btn:hover {
          background: #c0392b;
        }
        
        .vet-help-section {
          text-align: center;
          padding: 20px;
          background: rgba(52, 152, 219, 0.1);
          border-radius: 15px;
          margin-bottom: 20px;
        }
        
        .find-vets-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 10px;
        }
        
        .find-vets-btn:hover {
          background: #219a52;
          transform: translateY(-2px);
        }
        
        .help-text {
          color: #7f8c8d;
          font-size: 14px;
        }
        
        .loading-message {
          text-align: center;
          padding: 10px;
          color: #3498db;
          font-weight: 500;
        }
        
        .submit-section {
          text-align: center;
          padding-top: 20px;
          border-top: 2px solid #f8f9fa;
        }
        
        .submit-btn-large {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
          margin-bottom: 20px;
        }
        
        .submit-btn-large:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
        }
        
        .submit-btn-large:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .demo-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 10px;
          padding: 15px;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .demo-notice p {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }
        
        .demo-notice a {
          color: #3498db;
          font-weight: 600;
          text-decoration: none;
        }
        
        .demo-notice a:hover {
          text-decoration: underline;
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .map-container-large {
            height: 300px;
          }
        }
        
        @media (max-width: 768px) {
          .wide-form-container {
            padding: 20px;
          }
          
          .form-section {
            padding: 20px;
          }
          
          .location-controls {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .section-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}