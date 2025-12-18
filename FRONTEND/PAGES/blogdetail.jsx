import React, { useState, useEffect } from 'react';
import { useParams, Link} from 'react-router-dom';
import axios from 'axios';
import './Blog.css';

const BlogDetail = ({ auth }) => {
  const { id } = useParams();
//   const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    if (id) {
      fetchBlog();
      fetchRelatedBlogs();
    } else {
      setError('No blog ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchBlog = async () => {
    setLoading(true);
    setError('');
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      console.log('Fetching blog:', `${backend}/api/blogs/${id}`);
      
      const response = await axios.get(`${backend}/api/blogs/${id}`);
      console.log('Blog detail response:', response.data);
      
      setBlog(response.data);
    } catch (err) {
      console.error('Error fetching blog:', err);
      
      if (err.response?.status === 404) {
        setError('Blog not found. It may have been deleted or does not exist.');
      } else if (err.response?.status === 400) {
        setError('Invalid blog ID format.');
      } else {
        setError('Failed to load blog. Please try again later.');
      }
    }
    setLoading(false);
  };

  const fetchRelatedBlogs = async () => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${backend}/api/blogs?limit=3`);
      
      if (response.data && Array.isArray(response.data)) {
        setRelatedBlogs(response.data.filter(b => b._id !== id).slice(0, 3));
      } else if (response.data && response.data.blogs) {
        setRelatedBlogs(response.data.blogs.filter(b => b._id !== id).slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching related blogs:', err);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Animal Care': '❤️',
      'Health Tips': '🏥',
      'Rescue Stories': '📖',
      'First Aid': '🆘',
      'Nutrition Guide': '🍎',
      'Behavior Tips': '🎭',
      'Veterinary Advice': '👨‍⚕️',
      'Community News': '📢'
    };
    return icons[category] || '📝';
  };

  // Sample blog data for demo
  const sampleBlog = {
    _id: id,
    title: 'How to Keep Your Pet Healthy During Winter',
    content: `Winter can be challenging for our furry friends. The cold weather brings unique challenges that every pet owner should be aware of.

## Keeping Pets Warm

1. **Provide Warm Bedding**: Ensure your pet has a warm, cozy bed away from drafts.
2. **Limit Outdoor Time**: Shorten walks and outdoor playtime during extreme cold.
3. **Protect Paws**: Use pet-safe ice melt and consider booties for sensitive paws.

## Nutrition in Cold Weather

Pets may need more calories in winter to maintain body heat. Consult your vet about adjusting food portions.

## Health Check-ups

Regular vet visits are crucial. Watch for signs of hypothermia:
- Shivering
- Lethargy
- Weakness
- Pale gums

Remember, if it's too cold for you, it's probably too cold for your pet!`,
    category: 'Animal Care',
    author: { 
      name: 'Dr. Sarah Wilson', 
      role: 'vet', 
      clinicName: 'Paws & Claws Clinic',
      specialization: 'General Veterinary Medicine',
      experience: '10+ years in small animal care'
    },
    createdAt: new Date().toISOString(),
    views: 150,
    imageURL: ''
  };

  if (loading) {
    return (
      <div className="blog-container">
        <div className="loading">Loading blog post...</div>
      </div>
    );
  }

  if (error && !blog) {
    return (
      <div className="blog-container">
        <div className="error-message">
          <h3>⚠️ {error}</h3>
          <p>Showing sample blog content for demonstration:</p>
        </div>
        
        {/* Show sample blog when there's an error */}
        <article className="blog-detail">
          <header className="blog-detail-header">
            <div className="blog-category-large">
              {getCategoryIcon(sampleBlog.category)} {sampleBlog.category}
            </div>
            
            <h1 className="blog-detail-title">{sampleBlog.title}</h1>
            
            <div className="blog-detail-meta">
              <div className="author-details">
                <div className="author-avatar">
                  {sampleBlog.author?.role === 'vet' ? '👨‍⚕️' : '👤'}
                </div>
                <div>
                  <strong>
                    {sampleBlog.author?.role === 'vet' ? 'Dr. ' : ''}{sampleBlog.author?.name}
                  </strong>
                  {sampleBlog.author?.clinicName && (
                    <p className="clinic-name">{sampleBlog.author.clinicName}</p>
                  )}
                </div>
              </div>
              
              <div className="publish-info">
                <span className="publish-date">
                  Published on {new Date(sampleBlog.createdAt).toLocaleDateString()}
                </span>
                {sampleBlog.views > 0 && (
                  <span className="views-count">{sampleBlog.views} views</span>
                )}
              </div>
            </div>
          </header>

          <div className="blog-detail-content">
            {sampleBlog.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="author-bio">
            <h3>About the Author</h3>
            <div className="bio-content">
              <div className="author-avatar-large">👨‍⚕️</div>
              <div>
                <h4>Dr. {sampleBlog.author.name}</h4>
                {sampleBlog.author.clinicName && (
                  <p><strong>Clinic:</strong> {sampleBlog.author.clinicName}</p>
                )}
                {sampleBlog.author.specialization && (
                  <p><strong>Specialization:</strong> {sampleBlog.author.specialization}</p>
                )}
                {sampleBlog.author.experience && (
                  <p><strong>Experience:</strong> {sampleBlog.author.experience}</p>
                )}
              </div>
            </div>
          </div>
        </article>

        <div className="back-section" style={{ marginTop: '30px' }}>
          <Link to="/blog" className="back-btn">
            ← Back to All Blogs
          </Link>
        </div>
      </div>
    );
  }

  const currentBlog = blog || sampleBlog;

  return (
    <div className="blog-container">
      {/* Back Button */}
      <div className="back-section">
        <Link to="/blog" className="back-btn">
          ← Back to Blogs
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
          <p>Showing available content below:</p>
        </div>
      )}

      {/* Blog Header */}
      <article className="blog-detail">
        <header className="blog-detail-header">
          <div className="blog-category-large">
            {getCategoryIcon(currentBlog.category)} {currentBlog.category}
          </div>
          
          <h1 className="blog-detail-title">{currentBlog.title}</h1>
          
          <div className="blog-detail-meta">
            <div className="author-details">
              <div className="author-avatar">
                {currentBlog.author?.role === 'vet' ? '👨‍⚕️' : '👤'}
              </div>
              <div>
                <strong>
                  {currentBlog.author?.role === 'vet' ? 'Dr. ' : ''}{currentBlog.author?.name || 'Unknown Author'}
                </strong>
                {currentBlog.author?.clinicName && (
                  <p className="clinic-name">{currentBlog.author.clinicName}</p>
                )}
              </div>
            </div>
            
            <div className="publish-info">
              <span className="publish-date">
                Published on {currentBlog.createdAt ? new Date(currentBlog.createdAt).toLocaleDateString() : 'Recent'}
              </span>
              {currentBlog.views > 0 && (
                <span className="views-count">{currentBlog.views} views</span>
              )}
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {currentBlog.imageURL && (
          <div className="blog-featured-image">
            <img src={currentBlog.imageURL} alt={currentBlog.title} />
          </div>
        )}

        {/* Blog Content */}
        <div className="blog-detail-content">
          {currentBlog.content && currentBlog.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Author Bio for Vets */}
        {currentBlog.author?.role === 'vet' && (
          <div className="author-bio">
            <h3>About the Author</h3>
            <div className="bio-content">
              <div className="author-avatar-large">👨‍⚕️</div>
              <div>
                <h4>Dr. {currentBlog.author.name}</h4>
                {currentBlog.author.clinicName && (
                  <p><strong>Clinic:</strong> {currentBlog.author.clinicName}</p>
                )}
                {currentBlog.author.specialization && (
                  <p><strong>Specialization:</strong> {currentBlog.author.specialization}</p>
                )}
                {currentBlog.author.experience && (
                  <p><strong>Experience:</strong> {currentBlog.author.experience}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons for Blog Owner */}
        {auth?.role === 'vet' && currentBlog.author?._id === auth.id && (
          <div className="blog-actions-detailed">
            <button className="btn btn-warning">✏️ Edit Blog</button>
            <button className="btn btn-danger">🗑️ Delete Blog</button>
          </div>
        )}
      </article>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="related-blogs">
          <h2>You Might Also Like</h2>
          <div className="related-blogs-grid">
            {relatedBlogs.map(relatedBlog => (
              <div key={relatedBlog._id} className="related-blog-card">
                {relatedBlog.imageURL && (
                  <img src={relatedBlog.imageURL} alt={relatedBlog.title} />
                )}
                <div className="related-blog-content">
                  <div className="blog-category">
                    {getCategoryIcon(relatedBlog.category)} {relatedBlog.category}
                  </div>
                  <h4>{relatedBlog.title}</h4>
                  <Link to={`/blog/${relatedBlog._id}`} className="read-more-link">
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Back to Top */}
      <div className="back-section" style={{ marginTop: '40px' }}>
        <Link to="/blog" className="back-btn">
          ← Back to All Blogs
        </Link>
      </div>
    </div>
  );
};

export default BlogDetail;
