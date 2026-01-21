import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ auth, logout }) => {
  const location = useLocation();

  // Hide certain links based on role
  const shouldShowReport = auth.role !== 'vet';
  const shouldShowDashboard = auth.role !== 'vet';
  const shouldShowVetDashboard = auth.role === 'vet';
  const shouldShowRescuerMap = auth.role !== 'vet';

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ color: '#3498db', margin: 0 }}>🐾 PAWS</h2>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            🏠 Home
          </Link>
          
          {shouldShowReport && (
            <Link to="/report" className={location.pathname === '/report' ? 'active' : ''}>
              🚨 Report
            </Link>
          )}
          
          <Link to="/adopt" className={location.pathname === '/adopt' ? 'active' : ''}>
            🏠 Adopt
          </Link>
          
          {shouldShowRescuerMap && (
            <Link to="/rescuer" className={location.pathname === '/rescuer' ? 'active' : ''}>
              🗺️ Rescue Map
            </Link>
          )}
          
          <Link to="/blog" className={location.pathname === '/blog' ? 'active' : ''}>
            📝 Blog
          </Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
            👥 About
          </Link>
          
          {auth.token ? (
            <>
              {shouldShowDashboard && (
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                  📊 Dashboard
                </Link>
              )}
              
              {shouldShowVetDashboard && (
                <Link to="/vet-dashboard" className={location.pathname === '/vet-dashboard' ? 'active' : ''}>
                  🏥 Vet Dashboard
                </Link>
              )}
              
              <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
                🔔 Notifications
              </Link>
              
              {auth.role === 'admin' && (
                <Link to="/analytics" className={location.pathname === '/analytics' ? 'active' : ''}>
                  📈 Analytics
                </Link>
              )}
              
              <span style={{ color: '#3498db', fontWeight: '500' }}>Welcome, {auth.name}</span>
              <span style={{ 
                background: '#e8f4fd', 
                color: '#3498db', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                textTransform: 'capitalize'
              }}>
                {auth.role}
              </span>
              <button onClick={logout} className="logout-btn">
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-outline">Register</Link>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .btn-outline {
          background: transparent;
          border: 2px solid #3498db;
          color: #3498db;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .btn-outline:hover {
          background: #3498db;
          color: white;
        }
        
        .active {
          background: #3498db !important;
          color: white !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;