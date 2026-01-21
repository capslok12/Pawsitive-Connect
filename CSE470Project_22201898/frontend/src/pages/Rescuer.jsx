import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Rescuer = ({ auth }) => {
  const [reports, setReports] = useState([]);
  const [role, setRole] = useState(auth.role || 'user');

  // Fix marker icons
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Fetch all reports (only pending for rescue map)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const res = await axios.get(`${backend}/api/reports`);
        // Only show pending reports on rescue map
        const pendingReports = res.data.filter(r => r.status === 'Pending');
        setReports(pendingReports);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReports();
  }, []);

  // Accept rescue mission
  const handleAcceptRescue = async (reportId) => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await axios.post(`${backend}/api/reports/${reportId}/accept`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      alert('Rescue mission accepted! The report will be removed from the map.');
      // Refresh reports to remove accepted one
      const res = await axios.get(`${backend}/api/reports`);
      const pendingReports = res.data.filter(r => r.status === 'Pending');
      setReports(pendingReports);
    } catch (err) {
      console.error(err);
      alert('Failed to accept rescue mission');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🗺️ Rescue Map - Emergency Animals</h2>
      <p>These animals need immediate rescue. Accept missions to help them!</p>

      {/* Role selector for demo */}
      {!auth.token && (
        <div style={{ marginBottom: 12 }}>
          <label>View as: </label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">Public User</option>
            <option value="rescuer">Rescuer</option>
          </select>
        </div>
      )}

      {/* Map */}
      <div style={{ height: 500, marginBottom: 20 }}>
        <MapContainer center={[23.8103, 90.4125]} zoom={12} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {reports.map(r => (
            <Marker key={r._id} position={[r.lat, r.lng]}>
              <Popup>
                <div style={{ width: 220 }}>
                  <img src={r.photoURL} alt="animal" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                  <p><strong>{r.animalType || 'Animal'} - {r.issueType}</strong></p>
                  <p>{r.description}</p>
                  <p>Status: <b>{r.status}</b></p>
                  <p>Severity: 
                    <span style={{
                      color: r.injurySeverity === 'High' ? '#e74c3c' : 
                             r.injurySeverity === 'Medium' ? '#f39c12' : '#27ae60',
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {r.injurySeverity}
                    </span>
                  </p>

                  {/* Accept button for rescuers */}
                  {(auth.role === 'rescuer' || role === 'rescuer') && (
                    <button 
                      onClick={() => handleAcceptRescue(r._id)}
                      style={{ 
                        width: '100%', 
                        background: '#27ae60', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px', 
                        borderRadius: '4px',
                        marginTop: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Accept Rescue Mission
                    </button>
                  )}

                  <small>{new Date(r.createdAt).toLocaleString()}</small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Emergency Reports List */}
      <h3>🚨 Animals Needing Rescue</h3>
      <div className="emergency-list">
        {reports.map(report => (
          <div key={report._id} className="emergency-card">
            <img src={report.photoURL} alt="Animal" style={{width: 80, height: 80, objectFit: 'cover', borderRadius: '8px'}} />
            <div className="emergency-info">
              <h4>{report.animalType || 'Animal'} - {report.issueType}</h4>
              <p>{report.description}</p>
              <p><strong>Location:</strong> {report.lat.toFixed(4)}, {report.lng.toFixed(4)}</p>
              <p><strong>Severity:</strong> 
                <span className={`severity-${report.injurySeverity?.toLowerCase()}`}>
                  {report.injurySeverity}
                </span>
              </p>
              
              {(auth.role === 'rescuer' || role === 'rescuer') && (
                <button 
                  onClick={() => handleAcceptRescue(report._id)}
                  className="btn btn-success"
                >
                  ✅ Accept Rescue
                </button>
              )}
            </div>
          </div>
        ))}
        
        {reports.length === 0 && (
          <div className="empty-state">
            <p>No animals currently need rescue! Great work! 🎉</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .emergency-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-width: 800px;
        }
        
        .emergency-card {
          display: flex;
          gap: 15px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 4px solid #e74c3c;
        }
        
        .emergency-info {
          flex: 1;
        }
        
        .emergency-info h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
        }
        
        .severity-high { color: #e74c3c; font-weight: bold; }
        .severity-medium { color: #f39c12; font-weight: bold; }
        .severity-low { color: #27ae60; font-weight: bold; }
        
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
          background: #f8f9fa;
          border-radius: 10px;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .btn-success {
          background: #27ae60;
          color: white;
        }
        
        .btn-success:hover {
          background: #219a52;
        }
      `}</style>
    </div>
  );
};

export default Rescuer;