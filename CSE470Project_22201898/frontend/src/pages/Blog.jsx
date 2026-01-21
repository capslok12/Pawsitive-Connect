import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Blog.css';

const Blog = ({ auth }) => {
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Blog form state
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    category: 'Animal Care',
    imageURL: '',
    excerpt: ''
  });

  const blogCategories = [
    'All',
    'Animal Care',
    'Health Tips', 
    'Rescue Stories',
    'First Aid',
    'Nutrition Guide',
    'Behavior Tips',
    'Veterinary Advice',
    'Community News'
  ];

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, currentPage, searchTerm]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const params = {
        page: currentPage,
        limit: 9
      };
      
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get(`${backend}/api/blogs`, { params });
      
      if (response.data && Array.isArray(response.data)) {
        setBlogs(response.data);
        setTotalPages(1);
      } else if (response.data && response.data.blogs) {
        setBlogs(response.data.blogs);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setBlogs([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again later.');
      setBlogs([]);
    }
    setLoading(false);
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    setUploadingImage(true);
    try {
      const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      
      const response = await fetch(url, { method: 'POST', body: formData });
      const data = await response.json();
      
      if (data.secure_url) {
        setBlogForm({...blogForm, imageURL: data.secure_url});
        return data.secure_url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again or use a URL instead.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const imageUrl = await uploadImageToCloudinary(file);
    if (imageUrl) {
      alert('Image uploaded successfully!');
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      alert('Please fill in all required fields (Title and Content)');
      return;
    }

    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await axios.post(`${backend}/api/blogs`, blogForm, {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      
      // Reset form
      setBlogForm({
        title: '',
        content: '',
        category: 'Animal Care',
        imageURL: '',
        excerpt: ''
      });
      setShowCreateForm(false);
      fetchBlogs();
      alert('Blog published successfully! 🎉');
    } catch (err) {
      console.error('Error creating blog:', err);
      if (err.response?.status === 401) {
        alert('Please log in as a veterinarian to publish blogs.');
      } else {
        alert('Failed to publish blog. Please try again.');
      }
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
      'Community News': '📢',
      'All': '📝'
    };
    return icons[category] || '📝';
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Sample blogs for demo
  const sampleBlogs = [
    {
      _id: '1',
      title: 'How to Keep Your Pet Healthy During Winter',
      content: 'Winter can be challenging for pets. Here are some tips to keep them warm and healthy...',
      category: 'Animal Care',
      author: { name: 'Dr. Sarah Wilson', role: 'vet', clinicName: 'Paws & Claws Clinic' },
      createdAt: new Date().toISOString(),
      imageURL: ''
    },
    {
      _id: '2',
      title: 'First Aid for Common Pet Injuries',
      content: 'Learn basic first aid techniques for common pet injuries you might encounter...',
      category: 'First Aid',
      author: { name: 'Dr. Mike Johnson', role: 'vet', clinicName: 'Animal Emergency Center' },
      createdAt: new Date().toISOString(),
      imageURL: ''
    },
    {
      _id: '3',
      title: 'The Importance of Regular Vet Check-ups',
      content: 'Regular veterinary visits are crucial for your pet\'s long-term health and wellbeing...',
      category: 'Health Tips',
      author: { name: 'Dr. Emily Chen', role: 'vet', clinicName: 'Healthy Pets Clinic' },
      createdAt: new Date().toISOString(),
      imageURL: ''
    }
  ];

  const displayBlogs = blogs.length > 0 ? blogs : sampleBlogs;

  return (
    <div className="blog-container">
      {/* Header Section */}
      <div className="blog-header">
        <div className="header-content">
          <h1>📝 Community Blog</h1>
          <p>Expert advice, rescue stories, and tips from our veterinary community</p>
        </div>
        
        {/* Create Blog Button for Vets */}
        {auth?.role === 'vet' && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="create-blog-btn"
          >
            ✏️ Write a Blog
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={fetchBlogs} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="blog-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="category-filters">
          {blogCategories.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {getCategoryIcon(category)} {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading blogs...</div>
      ) : (
        <>
          {/* Blog Grid */}
          <div className="blog-grid">
            {displayBlogs.length === 0 ? (
              <div className="empty-state">
                <h3>No blogs found</h3>
                <p>
                  {selectedCategory !== 'All' 
                    ? `No blogs in "${selectedCategory}" category.`
                    : 'No blogs available yet.'
                  }
                </p>
                {auth?.role === 'vet' && (
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="btn btn-primary"
                  >
                    ✏️ Write the First Blog
                  </button>
                )}
              </div>
            ) : (
              displayBlogs.map(blog => (
                <div key={blog._id} className="blog-card">
                  {blog.imageURL && (
                    <img src={blog.imageURL} alt={blog.title} className="blog-image" />
                  )}
                  
                  <div className="blog-content">
                    <div className="blog-category">
                      {getCategoryIcon(blog.category)} {blog.category}
                    </div>
                    
                    <h3 className="blog-title">{blog.title}</h3>
                    
                    <p className="blog-excerpt">
                      {blog.excerpt || (blog.content && blog.content.length > 150 
                        ? `${blog.content.substring(0, 150)}...` 
                        : blog.content || 'No content available'
                      )}
                    </p>
                    
                    <div className="blog-meta">
                      <div className="author-info">
                        <strong>
                          {blog.author?.role === 'vet' ? 'Dr. ' : ''}{blog.author?.name || 'Unknown Author'}
                        </strong>
                        {blog.author?.clinicName && (
                          <span> • {blog.author.clinicName}</span>
                        )}
                      </div>
                      <span className="blog-date">
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="blog-actions">
                      <button 
                        onClick={() => window.location.href = `/blog/${blog._id}`}
                        className="read-more-btn"
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {blogs.length > 0 && totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="pagination-btn"
              >
                ← Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Blog Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content blog-form-modal">
            <div className="modal-header">
              <h2>✏️ Write a Blog Post</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="blog-form">
              <div className="form-group">
                <label>Blog Title *</label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                  placeholder="Enter an engaging title..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={blogForm.category}
                  onChange={(e) => setBlogForm({...blogForm, category: e.target.value})}
                  required
                >
                  {blogCategories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Featured Image</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-upload-input"
                    id="blog-image-upload"
                  />
                  <label htmlFor="blog-image-upload" className="image-upload-label">
                    {uploadingImage ? '📤 Uploading...' : '📷 Upload Image'}
                  </label>
                  
                  <div className="image-url-section">
                    <span className="or-text">- OR -</span>
                    <input
                      type="url"
                      value={blogForm.imageURL}
                      onChange={(e) => setBlogForm({...blogForm, imageURL: e.target.value})}
                      placeholder="Paste image URL here"
                      className="image-url-input"
                    />
                  </div>
                  
                  {blogForm.imageURL && (
                    <div className="image-preview">
                      <img src={blogForm.imageURL} alt="Preview" />
                      <span>Image Preview ✓</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Blog Content *</label>
                <textarea
                  value={blogForm.content}
                  onChange={(e) => {
                    setBlogForm({
                      ...blogForm, 
                      content: e.target.value,
                      excerpt: e.target.value.substring(0, 150) + '...'
                    });
                  }}
                  placeholder="Write your blog content here... Share your expertise, stories, and tips."
                  rows="12"
                  required
                />
                <div className="character-count">
                  {blogForm.content.length} characters
                </div>
              </div>

              <div className="form-group">
                <label>Excerpt (Auto-generated, you can edit)</label>
                <textarea
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({...blogForm, excerpt: e.target.value})}
                  placeholder="Short description that appears in blog listings"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? '📤 Publishing...' : '📢 Publish Blog'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;