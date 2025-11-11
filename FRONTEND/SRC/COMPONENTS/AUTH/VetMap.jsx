import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vet icon
const vetIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0IDNWN0gxMFYzSDhWNUg0VjNIMlY5SDRWMTFINlYxM0g0VjE1SDJWMTdINFYxOUg2VjIxSDhWMTlIMTBWMjFIMTJWMTlIMTRWMTdIMTZWMTVIMTRWMTNIMTZWMTFIMThWOUgyMFY3SDE2VjVIMTRWM1pNMTIgMTVWOEgxNlYxNUgxMloiIGZpbGw9IiMyN0FFNjAiLz4KPC9zdmc+',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [1, -34],
});

const VetMap = ({ userLocation, onVetSelect }) => {
  const [nearbyVets, setNearbyVets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLocation.lat && userLocation.lng) {
      fetchNearbyVets();
    }
  }, [userLocation]);

  const fetchNearbyVets = async () => {
    setLoading(true);
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${backend}/api/vets/nearby`, {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 20 // 20km radius
        }
      });
      setNearbyVets(response.data);
    } catch (error) {
      console.error('Error fetching nearby vets:', error);
    }
    setLoading(false);
  };

  return (
    <div className="vet-map-container">
      <div className="vet-map-header">
        <h3>🏥 Nearby Veterinarians</h3>
        <button 
          type="button"
          onClick={fetchNearbyVets} 
          disabled={loading}
          className="refresh-btn"
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <MapContainer 
        center={[userLocation.lat, userLocation.lng]} 
        zoom={13} 
        style={{ height: '400px', width: '100%', borderRadius: '10px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div className="popup-content">
              <strong>Your Location</strong>
              <p>Lat: {userLocation.lat.toFixed(5)}</p>
              <p>Lng: {userLocation.lng.toFixed(5)}</p>
            </div>
          </Popup>
        </Marker>

        {/* Vet markers */}
        {nearbyVets.map((vet) => (
          <Marker 
            key={vet._id} 
            position={[vet.location?.lat || 23.8103, vet.location?.lng || 90.4125]}
            icon={vetIcon}
          >
            <Popup>
              <div className="vet-popup">
                <h4>🏥 {vet.clinicName || 'Veterinary Clinic'}</h4>
                <p><strong>Dr. {vet.name}</strong></p>
                <p>Specialization: {vet.specialization || 'General'}</p>
                <p>Availability: {vet.availability || 'Business Hours'}</p>
                {vet.contactInfo?.phone && (
                  <p>📞 {vet.contactInfo.phone}</p>
                )}
                {vet.phone && !vet.contactInfo?.phone && (
                  <p>📞 {vet.phone}</p>
                )}
                <div className="vet-actions">
                  <button 
                    type="button"
                    onClick={() => onVetSelect(vet)}
                    className="contact-vet-btn"
                  >
                    🚨 Contact Immediately
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {nearbyVets.length === 0 && !loading && (
        <div className="no-vets-message">
          <p>No veterinarians found nearby. Try increasing the search radius.</p>
        </div>
      )}

      <style jsx>{`
        .vet-map-container {
          background: white;
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .vet-map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .vet-map-header h3 {
          margin: 0;
          color: #2c3e50;
        }
        
        .refresh-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .refresh-btn:hover:not(:disabled) {
          background: #2980b9;
        }
        
        .refresh-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        
        .vet-popup {
          min-width: 250px;
        }
        
        .vet-popup h4 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        
        .vet-popup p {
          margin: 5px 0;
          color: #7f8c8d;
          font-size: 14px;
        }
        
        .vet-actions {
          margin-top: 10px;
        }
        
        .contact-vet-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          width: 100%;
        }
        
        .contact-vet-btn:hover {
          background: #c0392b;
        }
        
        .popup-content {
          text-align: center;
        }
        
        .popup-content p {
          margin: 5px 0;
          font-size: 12px;
          color: #7f8c8d;
        }
        
        .no-vets-message {
          text-align: center;
          padding: 20px;
          color: #7f8c8d;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 10px;
        }
        
        /* Leaflet popup customization */
        :global(.leaflet-popup-content-wrapper) {
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        :global(.leaflet-popup-content) {
          margin: 15px;
          font-family: inherit;
        }
        
        :global(.leaflet-popup-tip) {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default VetMap;
