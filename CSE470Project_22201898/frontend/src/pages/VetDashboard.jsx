import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const VetDashboard = ({ auth }) => {
  const [activeCases, setActiveCases] = useState([]);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [treatmentDetails, setTreatmentDetails] = useState({
    vetNotes: '',
    treatmentPlan: '',
    estimatedRecoveryTime: '',
    healthInfo: ''
  });

  useEffect(() => {
    fetchActiveCases();
    fetchNearbyReports();
  }, []);

  const fetchActiveCases = async () => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${backend}/api/vets/cases`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setActiveCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const fetchNearbyReports = async () => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${backend}/api/reports?status=Pending`);
      setNearbyReports(response.data);
    } catch (error) {
      console.error('Error fetching nearby reports:', error);
    }
  };

  const acceptCase = async (reportId) => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await axios.post(`${backend}/api/vets/cases/${reportId}/accept`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      fetchActiveCases();
      fetchNearbyReports();
      alert('Case accepted successfully!');
    } catch (error) {
      console.error('Error accepting case:', error);
      alert('Failed to accept case');
    }
  };

  const updateTreatment = async (reportId) => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await axios.patch(`${backend}/api/vets/cases/${reportId}/treatment`, treatmentDetails, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setSelectedCase(null);
      setTreatmentDetails({
        vetNotes: '',
        treatmentPlan: '',
        estimatedRecoveryTime: '',
        healthInfo: ''
      });
      fetchActiveCases();
      alert('Treatment details updated!');
    } catch (error) {
      console.error('Error updating treatment:', error);
      alert('Failed to update treatment');
    }
  };

  const markReadyForAdoption = async (reportId) => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await axios.patch(`${backend}/api/vets/cases/${reportId}/adoption`, {
        contactPerson: 'vet',
        contactPhone: auth.phone || '',
        contactEmail: auth.email
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      fetchActiveCases();
      alert('Animal marked ready for adoption! It will be removed from rescue map.');
    } catch (error) {
      console.error('Error marking for adoption:', error);
      alert('Failed to mark for adoption');
    }
  };

  return (
    <div className="vet-dashboard">
      <div className="dashboard-header">
        <h1>🏥 Veterinarian Dashboard</h1>
        <p>Welcome, Dr. {auth.name}</p>
        <p>Help animals in need by accepting cases and providing treatment.</p>
      </div>

      <div className="dashboard-content">
        {/* Nearby Emergency Reports */}
        <div className="cases-section">
          <h2>🚨 Nearby Emergency Reports</h2>
          <p>These animals need immediate veterinary attention in your area:</p>
          
          <div className="cases-grid">
            {nearbyReports.map((report) => (
              <div key={report._id} className="case-card emergency">
                <img src={report.photoURL} alt="Animal" className="case-image" />
                <div className="case-info">
                  <h3>{report.animalType || 'Animal'} - {report.issueType}</h3>
                  <p><strong>Status:</strong> {report.status}</p>
                  <p><strong>Severity:</strong> 
                    <span className={`severity-${report.injurySeverity?.toLowerCase()}`}>
                      {report.injurySeverity}
                    </span>
                  </p>
                  <p><strong>Description:</strong> {report.description}</p>
                  <p><strong>Location:</strong> {report.lat.toFixed(4)}, {report.lng.toFixed(4)}</p>
                  
                  {report.createdBy && (
                    <div className="reporter-info">
                      <p><strong>Reporter:</strong> {report.createdBy.name}</p>
                    </div>
                  )}

                  <div className="case-actions">
                    <button 
                      onClick={() => acceptCase(report._id)}
                      className="btn btn-primary"
                    >
                      ✅ Accept This Case
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {nearbyReports.length === 0 && (
              <div className="empty-state">
                <p>No emergency reports nearby. Check back later for animals needing help.</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Cases */}
        <div className="cases-section">
          <h2>Your Active Cases</h2>
          <div className="cases-grid">
            {activeCases.map((caseItem) => (
              <div key={caseItem._id} className="case-card">
                <img src={caseItem.photoURL} alt="Animal" className="case-image" />
                <div className="case-info">
                  <h3>{caseItem.animalType || 'Animal'} - {caseItem.issueType}</h3>
                  <p><strong>Status:</strong> {caseItem.status}</p>
                  <p><strong>Severity:</strong> {caseItem.injurySeverity}</p>
                  <p><strong>Description:</strong> {caseItem.description}</p>
                  
                  {caseItem.createdBy && (
                    <div className="reporter-info">
                      <p><strong>Reporter:</strong> {caseItem.createdBy.name}</p>
                      {caseItem.reporterContact?.phone && (
                        <p><strong>Contact:</strong> {caseItem.reporterContact.phone}</p>
                      )}
                    </div>
                  )}

                  <div className="case-actions">
                    {caseItem.status === 'In Progress' && !caseItem.assignedVet && (
                      <button 
                        onClick={() => acceptCase(caseItem._id)}
                        className="btn btn-primary"
                      >
                        ✅ Accept Case
                      </button>
                    )}

                    {caseItem.assignedVet?.toString() === auth.id && (
                      <>
                        <button 
                          onClick={() => setSelectedCase(caseItem)}
                          className="btn btn-warning"
                        >
                          📝 Update Treatment
                        </button>
                        
                        {caseItem.status === 'Under Treatment' && (
                          <button 
                            onClick={() => markReadyForAdoption(caseItem._id)}
                            className="btn btn-success"
                          >
                            🏠 Ready for Adoption
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment Update Modal */}
        {selectedCase && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Update Treatment Details for {selectedCase.animalType}</h3>
              <div className="form-group">
                <label>Veterinary Notes</label>
                <textarea 
                  value={treatmentDetails.vetNotes}
                  onChange={(e) => setTreatmentDetails({
                    ...treatmentDetails,
                    vetNotes: e.target.value
                  })}
                  rows="4"
                  placeholder="Medical observations, diagnosis, etc."
                />
              </div>
              <div className="form-group">
                <label>Treatment Plan</label>
                <textarea 
                  value={treatmentDetails.treatmentPlan}
                  onChange={(e) => setTreatmentDetails({
                    ...treatmentDetails,
                    treatmentPlan: e.target.value
                  })}
                  rows="3"
                  placeholder="Medications, procedures, follow-up care"
                />
              </div>
              <div className="form-group">
                <label>Estimated Recovery Time</label>
                <input 
                  type="text"
                  value={treatmentDetails.estimatedRecoveryTime}
                  onChange={(e) => setTreatmentDetails({
                    ...treatmentDetails,
                    estimatedRecoveryTime: e.target.value
                  })}
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>
              <div className="form-group">
                <label>Health Information</label>
                <textarea 
                  value={treatmentDetails.healthInfo}
                  onChange={(e) => setTreatmentDetails({
                    ...treatmentDetails,
                    healthInfo: e.target.value
                  })}
                  rows="3"
                  placeholder="Current health status, medications, etc."
                />
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => updateTreatment(selectedCase._id)}
                  className="btn btn-primary"
                >
                  Save Treatment Details
                </button>
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VetDashboard;