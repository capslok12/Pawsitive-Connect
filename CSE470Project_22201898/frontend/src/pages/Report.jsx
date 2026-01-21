import ReportForm from '../components/ReportForm';

export default function Report({ auth }){
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      width: '100%'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '20px'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '10px',
          color: '#2c3e50',
          fontSize: '2.5em'
        }}>
          🚨 Report an Animal in Need
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#7f8c8d',
          fontSize: '1.1em',
          marginBottom: '30px'
        }}>
          Help save a life by reporting animals that need assistance. Your report will alert nearby rescuers.
        </p>
      </div>
      <ReportForm auth={auth} />
    </div>
  );
}