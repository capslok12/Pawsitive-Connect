import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Assume 'auth' is passed as a prop or accessed via context
import '../../App.css'; // Reusing your general CSS

const FinderDashboard = ({ auth }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get the backend URL from environment variables, matching your teammate's style
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    // Only attempt to fetch if the user is authenticated
    if (!auth?.token) {
        setError("Please log in to view your reports.");
        setLoading(false);
        return;
    }

    const fetchMyReports = async () => {
      try {
        const res = await axios.get(`${backend}/api/reports/my-reports`, {
          headers: {
            // Securely pass the JWT token for authentication
            Authorization: `Bearer ${auth.token}` 
          }
        });
        setReports(res.data.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Failed to load your reports. Please check the network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, [auth, backend]);


  // --- UI RENDERING ---

  if (loading) {
    return <div className="loading-message">Loading your reports...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>🐾 My Submitted Emergency Reports</h2>
      <p>Track the current status of animals you have reported.</p>
      
      {reports.length === 0 ? (
        <div className="empty-state">
          <h3>No Reports Found</h3>
          <p>You haven't submitted any reports yet. Click below to file an emergency report.</p>
          {/* Assuming a route to the ReportForm component */}
          <a href="/report" className="btn-primary">🚨 File a New Report</a>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-header">
                <span className={`status-badge ${report.status.toLowerCase().replace(' ', '-')}`}>
                  {report.status}
                </span>
                <span className="report-date">
                  Reported: {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="report-details">
                <p><strong>Animal Type:</strong> {report.animalType}</p>
                <p><strong>Issue:</strong> {report.issueType} ({report.injurySeverity})</p>
                <p><strong>Location:</strong> Lat: {report.location.coordinates[1].toFixed(4)}, Lng: {report.location.coordinates[0].toFixed(4)}</p>
              </div>
              <div className="report-actions">
                 {/* This link will later lead to a detailed single report view */}
                 <a href={`/reports/${report._id}`} className="btn-secondary">View Details</a>
              </div>
            </div>
          ))}
        </div>
      )}

       {/* Simple inline styles to demonstrate the look based on your App.css */}
       <style jsx>{`
            .dashboard-container {
                max-width: 900px;
                margin: 40px auto;
                padding: 20px;
                background: #f4f7f9;
                border-radius: 15px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            h2 { color: #3498db; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin-bottom: 20px; }
            .reports-list { display: grid; gap: 20px; }
            .report-card { 
                background: white; 
                padding: 20px; 
                border-radius: 10px; 
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); 
                transition: transform 0.2s;
            }
            .report-card:hover { transform: translateY(-3px); }
            .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .status-badge { 
                padding: 5px 10px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: 600; 
                color: white;
            }
            .status-badge.awaiting-triage { background: #f39c12; }
            .status-badge.triage-complete { background: #2980b9; }
            .status-badge.rescuer-dispatched { background: #27ae60; }
            .status-badge.case-closed { background: #95a5a6; }
            .report-date { font-size: 12px; color: #7f8c8d; }
            .report-details p { margin: 5px 0; font-size: 14px; }
            .report-actions { text-align: right; margin-top: 15px; }
            .btn-primary, .btn-secondary {
                padding: 8px 15px;
                border-radius: 6px;
                text-decoration: none;
                font-size: 14px;
                display: inline-block;
            }
            .btn-primary { background: #3498db; color: white; }
            .btn-secondary { background: #ecf0f1; color: #2c3e50; border: 1px solid #bdc3c7; }
            .empty-state { text-align: center; padding: 50px; background: white; border-radius: 10px; border: 1px dashed #bdc3c7; }
        `}</style>
    </div>
  );
};

export default FinderDashboard;
