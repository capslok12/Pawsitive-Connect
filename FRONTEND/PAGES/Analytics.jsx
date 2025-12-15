import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const Analytics = ({ auth }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.get(`${backend}/api/reports/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!analytics) return <div>Failed to load analytics</div>;

  return (
    <div className="dashboard">
      <h2>📊 Analytics Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{analytics.totalReports}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{analytics.pendingReports}</div>
          <div className="stat-label">Pending Rescue</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{analytics.adoptedReports}</div>
          <div className="stat-label">Successfully Adopted</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{analytics.readyForAdoption}</div>
          <div className="stat-label">Ready for Adoption</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Issue Type Distribution */}
        <div className="chart-card">
          <h3>Issue Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.issueTypeStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, count }) => `${_id}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.issueTypeStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="chart-card">
          <h3>Monthly Reports</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Rescuers Leaderboard */}
      <div className="chart-card">
        <h3>🏆 Top Rescuers Leaderboard</h3>
        <div className="leaderboard">
          {analytics.topRescuers.map((rescuer, index) => (
            <div key={rescuer._id} className="leaderboard-item">
              <div className="rank">#{index + 1}</div>
              <div className="rescuer-info">
                <strong>{rescuer.name}</strong>
                <span>Rescues: {rescuer.rescueCount}</span>
                <span>Points: {rescuer.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .chart-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .leaderboard {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .leaderboard-item {
          display: flex;
          align-items: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          gap: 15px;
        }
        
        .rank {
          background: #3498db;
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: bold;
        }
        
        .rescuer-info {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        
        .rescuer-info span {
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default Analytics;
