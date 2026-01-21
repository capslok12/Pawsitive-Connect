const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createReport,
  getReports,
  updateReportStatus,
  uploadRecoveryPhoto,
  acceptRescue,
  postForAdoption,
  requestAdoption,
  getAdoptionRequests,
  updateAdoptionRequest,
  analyzeImage,
  getAnalytics
} = require('../controllers/reportController');

// Public routes
router.get('/', getReports);
router.post('/analyze-image', analyzeImage);

// Protected routes
router.post('/', protect, authorize('public', 'rescuer', 'admin'), createReport);
router.patch('/:id', protect, updateReportStatus);
router.patch('/recovery/:id', protect, authorize('vet', 'admin'), uploadRecoveryPhoto);
router.post('/:id/accept', protect, authorize('rescuer', 'admin'), acceptRescue);
router.post('/:id/adopt', protect, authorize('public', 'rescuer', 'admin'), requestAdoption);
router.post('/:id/post-adoption', protect, authorize('rescuer', 'vet', 'admin'), postForAdoption);
router.get('/admin/adoptions', protect, authorize('admin', 'rescuer', 'vet'), getAdoptionRequests);
router.patch('/:reportId/adoptions/:requestId', protect, authorize('admin', 'rescuer', 'vet'), updateAdoptionRequest);
router.get('/analytics/dashboard', protect, authorize('admin'), getAnalytics);

module.exports = router;