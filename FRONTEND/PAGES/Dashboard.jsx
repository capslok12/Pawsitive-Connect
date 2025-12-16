import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Dashboard = ({ auth }) => {
  const [reports, setReports] = useState([]);
  const [recoveryFile, setRecoveryFile] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [adoptionForm, setAdoptionForm] = useState({
    animalName: '',
    healthInfo: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    adoptionFee: 0,
    requirements: ''
  });
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch all reports
  const fetchReports = async () => {
    try {
      const res = await axios.get(`${backend}/api/reports`);
      setReports(res.data);
    } catch (err) { 
      console.error(err); 
      alert('Failed to fetch reports');
    }
  };

  useEffect(() => { 
    if (auth.token) {
      fetchReports(); 
    }
  }, [auth.token]);

  if (!auth.token) return <p>Please login to access dashboard</p>;

  // Update status
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${backend}/api/reports/${id}`, { status }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      fetchReports();
      alert(`Status updated to ${status}`);
    } catch (err) { 
      console.error(err); 
      alert('Status update failed'); 
    }
  };

  // Post for adoption
  const postForAdoption = async (reportId) => {
    try {
      await axios.post(`${backend}/api/reports/${reportId}/post-adoption`, adoptionForm, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setSelectedAnimal(null);
      setAdoptionForm({
        animalName: '',
        healthInfo: '',
        contactPhone: '',
        contactEmail: '',
        location: '',
        adoptionFee: 0,
        requirements: ''
      });
      fetchReports();
      alert('Animal posted for adoption successfully!');
    } catch (err) {
      console.error('Error posting for adoption:', err);
      alert('Failed to post for adoption');
    }
  };

  // Upload recovery photo
  const uploadRecoveryPhoto = async (reportId) => {
    if (!recoveryFile) { alert('Please select a file'); return; }
    try {
      // Cloudinary upload
      const formData = new FormData();
      formData.append('file', recoveryFile);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const resUpload = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST', body: formData
      });
      const data = await resUpload.json();
      const recoveryPhotoURL = data.secure_url;

      // Update backend
      await axios.patch(`${backend}/api/reports/recovery/${reportId}`, { recoveryPhotoURL }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      fetchReports();
      setRecoveryFile(null);
      alert('Recovery photo uploaded successfully!');
    } catch (err) { 
      console.error(err); 
      alert('Upload failed'); 
    }
  };

  // Filter reports based on user role
  const getUserReports = () => {
    if (auth.role === 'admin') return reports;
    if (auth.role === 'rescuer') {
      return reports.filter(report => 
        report.assignedTo?._id === auth.id || report.createdBy?._id === auth.id
      );
    }
    return reports.filter(report => report.createdBy?._id === auth.id);
  };

  const userReports = getUserReports();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {auth.name}</h2>
        <h3>Your Role: {auth.role === 'rescuer' ? 'Animal Rescuer' : auth.role}</h3>
        {auth.role === 'rescuer' && (
          <p>You can accept rescue missions, update status, and post animals for adoption.</p>
        )}
      </div>

      {/* Rescuer Stats */}
      {auth.role === 'rescuer' && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              {userReports.filter(r => r.status === 'In Progress').length}
            </div>
            <div className="stat-label">Active Rescues</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {userReports.filter(r => r.status === 'Ready for Adoption').length}
            </div>
            <div className="stat-label">Ready for Adoption</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {userReports.filter(r => r.status === 'Adopted').length}
            </div>
            <div className="stat-label">Successfully Adopted</div>
          </div>
        </div>
      )}

      {/* Reports Map */}
      <div className="map-section">
        <h3>Your Rescue Operations</h3>
        <MapContainer center={[23.8103, 90.4125]} zoom={12} style={{ height: '400px', width: '100%', marginBottom:20 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {userReports.map(r => (
            <Marker key={r._id} position={[r.lat, r.lng]}>
              <Popup style={{width:220}}>
                <div>
                  <img src={r.photoURL} alt="Before" style={{width:'100%', height:120, objectFit:'cover'}}/>
                  <p>{r.description}</p>
                  <p><strong>Status:</strong> {r.status}</p>
                  <p><strong>Type:</strong> {r.animalType}</p>
                  
                  {r.recoveryPhotoURL && (
                    <div style={{display:'flex', gap:4, marginTop:4}}>
                      <img src={r.photoURL} alt="Before" style={{width:100, height:80, objectFit:'cover'}}/>
                      <img src={r.recoveryPhotoURL} alt="After" style={{width:100, height:80, objectFit:'cover'}}/>
                    </div>
                  )}

                  {/* Rescuer actions */}
                  {auth.role === 'rescuer' && (
                    <div style={{marginTop:6}}>
                      <select 
                        value={r.status} 
                        onChange={(e) => updateStatus(r._id, e.target.value)}
                        style={{width: '100%', marginBottom: '5px'}}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Treatment">Under Treatment</option>
                        <option value="Ready for Adoption">Ready for Adoption</option>
                        <option value="Adopted">Adopted</option>
                      </select>
                      
                      {r.status === 'Under Treatment' && (
                        <button 
                          onClick={() => setSelectedAnimal(r)}
                          style={{width: '100%', marginTop: '5px'}}
                          className="btn btn-success"
                        >
                          🏠 Post for Adoption
                        </button>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setRecoveryFile(e.target.files[0])}
                        style={{width: '100%', marginTop: '5px'}}
                      />
                      <button 
                        onClick={() => uploadRecoveryPhoto(r._id)}
                        style={{width: '100%', marginTop: '5px'}}
                        className="btn btn-primary"
                      >
                        Upload Recovery Photo
                      </button>
                    </div>
                  )}

                  <small>{new Date(r.createdAt).toLocaleString()}</small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Reports List */}
      <div className="reports-section">
        <h3>Your Animal Reports</h3>
        <div className="reports-grid">
          {userReports.map(report => (
            <div key={report._id} className="report-card">
              <img src={report.photoURL} alt="Animal" className="report-image" />
              <div className="report-info">
                <h4>{report.animalType || 'Animal'} - {report.issueType}</h4>
                <p><strong>Status:</strong> 
                  <span className={`status-badge status-${report.status.toLowerCase().replace(' ', '-')}`}>
                    {report.status}
                  </span>
                </p>
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Location:</strong> {report.lat.toFixed(4)}, {report.lng.toFixed(4)}</p>
                <p><strong>Reported:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                
                {auth.role === 'rescuer' && (
                  <div className="report-actions">
                    <select 
                      value={report.status} 
                      onChange={(e) => updateStatus(report._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Under Treatment">Under Treatment</option>
                      <option value="Ready for Adoption">Ready for Adoption</option>
                      <option value="Adopted">Adopted</option>
                    </select>
                    
                    {report.status === 'Under Treatment' && (
                      <button 
                        onClick={() => setSelectedAnimal(report)}
                        className="btn btn-success"
                      >
                        🏠 Post for Adoption
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {userReports.length === 0 && (
          <div className="empty-state">
            <p>No reports found. {auth.role === 'rescuer' ? 'Accept some rescue missions from the Rescue Map!' : 'Report an animal to get started!'}</p>
          </div>
        )}
      </div>

      {/* Adoption Posting Modal */}
      {selectedAnimal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Post {selectedAnimal.animalType} for Adoption</h3>
            
            <div className="form-group">
              <label>Animal Name</label>
              <input 
                type="text"
                value={adoptionForm.animalName}
                onChange={(e) => setAdoptionForm({...adoptionForm, animalName: e.target.value})}
                placeholder="Give the animal a name"
              />
            </div>
            
            <div className="form-group">
              <label>Health Information</label>
              <textarea 
                value={adoptionForm.healthInfo}
                onChange={(e) => setAdoptionForm({...adoptionForm, healthInfo: e.target.value})}
                placeholder="Current health status, vaccinations, special needs"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Contact Phone</label>
              <input 
                type="tel"
                value={adoptionForm.contactPhone}
                onChange={(e) => setAdoptionForm({...adoptionForm, contactPhone: e.target.value})}
                placeholder="Phone number for adoption inquiries"
              />
            </div>
            
            <div className="form-group">
              <label>Contact Email</label>
              <input 
                type="email"
                value={adoptionForm.contactEmail}
                onChange={(e) => setAdoptionForm({...adoptionForm, contactEmail: e.target.value})}
                placeholder="Email for adoption inquiries"
              />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text"
                value={adoptionForm.location}
                onChange={(e) => setAdoptionForm({...adoptionForm, location: e.target.value})}
                placeholder="Where is the animal located?"
              />
            </div>
            
            <div className="form-group">
              <label>Adoption Fee (if any)</label>
              <input 
                type="number"
                value={adoptionForm.adoptionFee}
                onChange={(e) => setAdoptionForm({...adoptionForm, adoptionFee: e.target.value})}
                placeholder="0 for free adoption"
              />
            </div>
            
            <div className="form-group">
              <label>Adoption Requirements</label>
              <textarea 
                value={adoptionForm.requirements}
                onChange={(e) => setAdoptionForm({...adoptionForm, requirements: e.target.value})}
                placeholder="What are the requirements for adopting this animal?"
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => postForAdoption(selectedAnimal._id)}
                className="btn btn-primary"
              >
                🏠 Post for Adoption
              </button>
              <button 
                onClick={() => setSelectedAnimal(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;