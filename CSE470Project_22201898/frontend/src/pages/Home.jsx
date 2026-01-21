import { Link } from 'react-router-dom';

export default function Home(){
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>🐾 PAWS</h1>
        <h2>Platform for Animal Welfare & Support</h2>
        <p>
          Every animal deserves love and care. PAWS connects compassionate people with animals in need. 
          Report injured strays, help with rescues, or give a forever home to a recovered animal.
        </p>
        
        <div className="cta-buttons">
          <Link to="/report" className="btn btn-primary">
            🚨 Report an Animal
          </Link>
          <Link to="/adopt" className="btn btn-success">
            🏠 Adopt a Friend
          </Link>
          <Link to="/rescuer" className="btn btn-warning">
            🗺️ View Rescue Map
          </Link>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginTop: '40px',
          textAlign: 'left'
        }}>
          <div style={{ padding: '15px' }}>
            <h3>📱 Easy Reporting</h3>
            <p>Upload photos and location to report animals in need</p>
          </div>
          <div style={{ padding: '15px' }}>
            <h3>🤖 AI Assistance</h3>
            <p>Automatic animal type and injury severity detection</p>
          </div>
          <div style={{ padding: '15px' }}>
            <h3>🏥 Veterinary Care</h3>
            <p>Professional treatment and recovery tracking</p>
          </div>
          <div style={{ padding: '15px' }}>
            <h3>❤️ Loving Homes</h3>
            <p>Safe adoption process for recovered animals</p>
          </div>
        </div>
      </div>
    </div>
  );
}