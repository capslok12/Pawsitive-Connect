import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Report from './pages/Report';
import Adopt from './pages/Adopt';
import Rescuer from './pages/Rescuer';
import Blog from './pages/Blog';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Import Footer
import './App.css';
import About from './pages/About';
import VetDashboard from './pages/VetDashboard';
import BlogDetail from './pages/BlogDetail';

function App() {
  const [auth, setAuth] = useState({ 
    token: localStorage.getItem('token'), 
    role: localStorage.getItem('role'), 
    name: localStorage.getItem('name'),
    id: localStorage.getItem('userId')
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const userId = localStorage.getItem('userId');
    
    if (token && role && name) {
      setAuth({ token, role, name, id: userId });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    setAuth({ token: null, role: null, name: null, id: null });
  };

  return (
    <Router>
      <div className="app">
        <Navbar auth={auth} logout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login setAuth={setAuth} />} />
            <Route 
              path="/dashboard" 
              element={auth.token ? <Dashboard auth={auth} /> : <Navigate to="/login" />} 
            />
            <Route path="/report" element={<Report auth={auth} />} />
            <Route path="/adopt" element={<Adopt auth={auth} />} />
            <Route path="/rescuer" element={<Rescuer auth={auth} />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/notifications" element={<Notifications auth={auth} />} />
            <Route 
              path="/analytics" 
              element={auth.token && auth.role === 'admin' ? <Analytics auth={auth} /> : <Navigate to="/login" />} 
            />
            <Route path="/about" element={<About />} />
            <Route 
              path="/vet-dashboard" 
              element={auth.token && auth.role === 'vet' ? <VetDashboard auth={auth} /> : <Navigate to="/login" />} 
            />
            <Route path="/blog/:id" element={<BlogDetail auth={auth} />} />
          </Routes>
        </main>
        <Footer /> {/* Add Footer here */}
      </div>
    </Router>
  );
}

export default App;