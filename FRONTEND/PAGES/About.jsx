import React from 'react';
import './About.css';

const About = () => {
  const founders = [
    {
      id: 1,
      name: "Shahriar",
      image: "../../src/assets/Morol.png",
      institution: "BRAC University",
      department: "Computer Science and Engineering",
      email: "mn9447109@gmail.com",
      linkedin: "https://www.linkedin.com/in/shahriar-nahid-7019462a9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      github: "https://github.com/capslok12",
      facebook: "https://www.facebook.com/share/16QJMEJQ6h/",
      role: "Co-Founder & Researcher"
    },
    {
      id: 2,
      name: "Shafiur Rahman Rad",
      image: "/src/assets/Rad.jpeg",
      institution: "BRAC University",
      department: "Computer Science and Engineering",
      email: "shafiurrahmanrad25@gmail.com",
      linkedin: "https://www.linkedin.com/in/shafiur-rahman-rad-879717290?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      github: "https://github.com/Rad0130",
      facebook: "https://www.facebook.com/profile.php?id=100072754745638&mibextid=ZbWKwL",
      role: "Co-Founder & Lead Developer"
    },
    {
      id: 3,
      name: "Lubaba Tasin",
      image: "/src/assets/Lubaba.jpg",
      institution: "BRAC University",
      department: "Computer Science and Engineering",
      email: "ltsubah@gmail.com",
      linkedin: "www.linkedin.com/in/lubaba-tasin-977542250",
      github: "https://github.com/capslok12",
      facebook: "https://www.facebook.com/share/19aXNJPmHK/",
      role: "Co-Founder & Presentation Designer"
    },
    {
      id: 4,
      name: "Md.Mubin Ibne Azad",
      image: "/src/assets/Mubin01.png",
      institution: "BRAC University",
      department: "Computer Science and Engineering",
      email: "ibnemubin29@gmail.com",
      linkedin: "www.linkedin.com/in/mubin-ibne-azad",
      github: "https://github.com/md-mubin-ibne-azad",
      facebook: "https://www.facebook.com/Ibnemubin18",
      role: "Co-Founder & Poster Designer"
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-content">
          <h1>About PAWS</h1>
          <p className="hero-subtitle">
            Platform for Animal Welfare & Support - Bridging Technology with Compassion
          </p>
          <div className="hero-description">
            <p>
              PAWS is a comprehensive web-based platform designed to address the critical issue of stray animal 
              welfare in Bangladesh and beyond. Our mission is to create a sustainable ecosystem where technology 
              meets compassion, enabling efficient rescue, treatment, and adoption of animals in need.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mission-section">
        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon">🚨</div>
            <h3>Quick Reporting</h3>
            <p>Instant animal reporting with AI-powered analysis and location tracking</p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">🏥</div>
            <h3>Medical Care</h3>
            <p>Professional veterinary assistance and treatment tracking</p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">❤️</div>
            <h3>Safe Adoption</h3>
            <p>Verified adoption process ensuring animals find loving homes</p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">🤝</div>
            <h3>Community</h3>
            <p>Building a network of rescuers, vets, and animal lovers</p>
          </div>
        </div>
      </div>

      {/* Founders Section */}
      <div className="founders-section">
        <div className="section-header">
          <h2>Meet Our Founders</h2>
          <p>The passionate developers behind PAWS</p>
        </div>

        <div className="founders-grid">
          {founders.map((founder) => (
            <div key={founder.id} className="founder-card">
              <div className="founder-image-container">
                <img 
                  src={founder.image} 
                  alt={founder.name}
                  className="founder-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExNC4zNTkgMTEwIDEyNiA5OC4zNTg1IDEyNiA4NEMxMjYgNjkuNjQxNSAxMTQuMzU5IDU4IDEwMCA1OEM4NS42NDE1IDU4IDc0IDY5LjY0MTUgNzQgODRDNzQgOTguMzU4NSA4NS42NDE1IDExMCAxMDAgMTEwWk0xMzAgMTQySDEzMlYxMzJIMTMwQzEzMCAxMTguMTkzIDEyMi4xMzcgMTA2LjQ2OCAxMTEuMDM4IDEwMS42MjFDMTE2LjIxMiA5OC4zMTA1IDEyMCA5Mi40Njg1IDEyMCA4NkMxMjAgNzUuNzI5NSA5MC43Mjk1IDcwIDYwIDcwQzI5LjI3MDUgNzAgMCA3NS43Mjk1IDAgODZDMCA5Mi40Njg1IDMuNzg4NDUgOTguMzEwNSA4Ljk2MTU1IDEwMS42MjFDLTIuMTM2ODUgMTA2LjQ2OCAtMTAgMTE4LjE5MyAtMTAgMTMySDEyVjE0Mkg3MEM4MC4yNzA1IDE0MiAxMTkuNzI5IDE0MiAxMzAgMTQyWiIgZmlsbD0iIzlBQTZBNiIvPgo8L3N2Zz4K';
                  }}
                />
                <div className="founder-role-badge">{founder.role}</div>
              </div>

              <div className="founder-info">
                <h3 className="founder-name">{founder.name}</h3>
                
                <div className="founder-details">
                  <div className="detail-item">
                    <span className="detail-icon">🎓</span>
                    <div className="detail-content">
                      <strong>{founder.institution}</strong>
                      <span>{founder.department}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">📧</span>
                    <div className="detail-content">
                      <strong>Email</strong>
                      <a href={`mailto:${founder.email}`}>{founder.email}</a>
                    </div>
                  </div>
                </div>

                <div className="founder-social">
                  {founder.linkedin && (
                    <a 
                      href={founder.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-btn linkedin"
                      aria-label="LinkedIn"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                  {founder.github && (
                    <a 
                      href={founder.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-btn github"
                      aria-label="GitHub"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                  {founder.facebook && (
                    <a 
                      href={founder.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-btn facebook"
                      aria-label="Facebook"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Animals Helped</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Rescuers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">200+</div>
            <div className="stat-label">Successful Adoptions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Emergency Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
