const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createBlog,
  getBlogs,
  getBlogById,
  getMyBlogs,
  updateBlog,
  deleteBlog,
  getCategories
} = require('../controllers/blogController');

// Public routes
router.get('/', getBlogs);
router.get('/categories', getCategories);
router.get('/:id', getBlogById);

// Protected routes (Vets and Admins only for creation)
router.post('/', protect, authorize('vet', 'admin'), createBlog);
router.get('/my/blogs', protect, authorize('vet', 'admin'), getMyBlogs);
router.put('/:id', protect, authorize('vet', 'admin'), updateBlog);
router.delete('/:id', protect, authorize('vet', 'admin'), deleteBlog);

module.exports = router;