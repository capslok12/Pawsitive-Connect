const Blog = require('../models/Blog');
const User = require('../models/User');

// Create blog (only vets and admins)
exports.createBlog = async (req, res) => {
  try {
    const { title, content, category, imageURL, excerpt } = req.body;
    
    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({ 
        message: 'Title, content, and category are required' 
      });
    }

    const blog = new Blog({
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      category,
      imageURL: imageURL || '',
      author: req.user.id
    });

    await blog.save();
    await blog.populate('author', 'name role clinicName specialization');

    res.status(201).json({
      message: 'Blog published successfully!',
      blog
    });
  } catch (err) {
    console.error('Blog creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all blogs with filtering and pagination
exports.getBlogs = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    let filter = { isPublished: true };
    
    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'name role clinicName specialization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name role clinicName specialization experience');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (!blog.isPublished && (!req.user || (blog.author._id.toString() !== req.user.id && req.user.role !== 'admin'))) {
      return res.status(403).json({ message: 'Blog not available' });
    }

    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    
    // Handle invalid ID format
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Get blogs by author (for vet's own blogs)
exports.getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.id })
      .populate('author', 'name role clinicName')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    console.error('Error fetching my blogs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, category, imageURL, excerpt, isPublished } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Check if user is the author
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.imageURL = imageURL || blog.imageURL;
    blog.excerpt = excerpt || blog.excerpt;
    blog.isPublished = isPublished !== undefined ? isPublished : blog.isPublished;
    blog.updatedAt = new Date();

    await blog.save();
    res.json({ message: 'Blog updated successfully', blog });
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get blog categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { isPublished: true });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error' });
  }
};