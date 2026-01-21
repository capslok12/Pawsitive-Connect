import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Adopt({ auth }){
  const [adoptables, setAdoptables] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [adoptionRequest, setAdoptionRequest] = useState({
    message: '',
    contactInfo: {
      phone: '',
      email: ''
    }
  });

  useEffect(() => {
    fetchAdoptables();
  }, []);

  const fetchAdoptables = async () => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.get(`${backend}/api/reports`);
      // Filter animals ready for adoption
      const adoptableList = res.data.filter(r => r.status === 'Ready for Adoption');
      setAdoptables(adoptableList);
    } catch(err) {
      console.error('Error fetching adoptables:', err);
    }
  };

  const requestAdoption = async (animalId) => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await axios.post(`${backend}/api/reports/${animalId}/adopt`, adoptionRequest, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      alert('Adoption request submitted successfully!');
      setSelectedAnimal(null);
    } catch(err) {
      console.error('Error requesting adoption:', err);
      alert('Failed to submit adoption request');
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>🏠 Animals Ready for Adoption</h2>
      <p>Give a loving home to these rescued animals</p>
      
      <div className="animal-grid">
        {adoptables.map(animal => (
          <div key={animal._id} className="animal-card">
            <img src={animal.recoveryPhotoURL || animal.photoURL} alt="Animal" className="animal-image" />
            <div className="animal-info">
              <h3>{animal.animalName || `Rescued ${animal.animalType}`}</h3>
              <p><strong>Type:</strong> {animal.animalType}</p>
              <p><strong>Condition:</strong> {animal.issueType}</p>
              <p><strong>Health Status:</strong> {animal.healthInfo || 'Under treatment'}</p>
              
              <div className="contact-info">
                <h4>Contact for Adoption:</h4>
                {animal.adoptionInfo?.contactPerson === 'vet' ? (
                  <p>🏥 Contact the treating veterinarian</p>
                ) : (
                  <p>👤 Contact the rescuer</p>
                )}
                {animal.adoptionInfo?.contactPhone && (
                  <p>📞 {animal.adoptionInfo.contactPhone}</p>
                )}
                {animal.adoptionInfo?.contactEmail && (
                  <p>📧 {animal.adoptionInfo.contactEmail}</p>
                )}
                {animal.adoptionInfo?.location && (
                  <p>📍 {animal.adoptionInfo.location}</p>
                )}
              </div>

              <button 
                onClick={() => setSelectedAnimal(animal)}
                className="btn btn-primary"
              >
                🏠 Request Adoption
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Adoption Request Modal */}
      {selectedAnimal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Adoption Request for {selectedAnimal.animalName}</h3>
            <div className="form-group">
              <label>Why do you want to adopt this animal?</label>
              <textarea 
                value={adoptionRequest.message}
                onChange={(e) => setAdoptionRequest({
                  ...adoptionRequest,
                  message: e.target.value
                })}
                rows="4"
                placeholder="Tell us about your experience with animals, your home environment, etc."
              />
            </div>
            <div className="form-group">
              <label>Your Phone Number</label>
              <input 
                type="tel"
                value={adoptionRequest.contactInfo.phone}
                onChange={(e) => setAdoptionRequest({
                  ...adoptionRequest,
                  contactInfo: {
                    ...adoptionRequest.contactInfo,
                    phone: e.target.value
                  }
                })}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="form-group">
              <label>Your Email</label>
              <input 
                type="email"
                value={adoptionRequest.contactInfo.email}
                onChange={(e) => setAdoptionRequest({
                  ...adoptionRequest,
                  contactInfo: {
                    ...adoptionRequest.contactInfo,
                    email: e.target.value
                  }
                })}
                placeholder="Enter your email"
              />
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => requestAdoption(selectedAnimal._id)}
                className="btn btn-primary"
              >
                Submit Adoption Request
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
}