import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // In Frontend/src/components/Auth/Login.jsx - Update the success part:
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
        const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const res = await axios.post(`${backend}/api/auth/login`, { 
        email, 
        password 
        });
        
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('name', res.data.name);
        localStorage.setItem('userId', res.data.userId); // Add this line
        
        setAuth({ 
        token: res.data.token, 
        role: res.data.role, 
        name: res.data.name,
        id: res.data.userId // Add this line
        });
        
        setMessage('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) { 
        console.error(err); 
        setMessage(err.response?.data?.message || 'Login failed'); 
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="form-container">
      <h2>Login to PAWS</h2>
      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input 
            placeholder="Enter your email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            type="email"
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            placeholder="Enter your password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            type="password"
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;