import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'rescuer'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await axios.post(`${backend}/api/auth/register`, formData);
      
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { 
      console.error(err); 
      setMessage(err.response?.data?.message || 'Registration failed'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Join PAWS</h2>
      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            name="name"
            placeholder="Enter your full name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input 
            name="email"
            placeholder="Enter your email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            type="email"
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            name="password"
            placeholder="Create a password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            type="password"
          />
        </div>
        
        <div className="form-group">
          <label>Role</label>
          <select 
            name="role"
            value={formData.role} 
            onChange={handleChange}
          >
            <option value="rescuer">Animal Rescuer</option>
            <option value="vet">Veterinarian</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Create Account'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;