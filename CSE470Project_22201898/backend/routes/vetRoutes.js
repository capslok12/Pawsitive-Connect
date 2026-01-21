const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getNearbyVets,
  contactVet,
  acceptVetCase,
  updateTreatment,
  markReadyForAdoption,
  getVetCases
} = require('../controllers/vetController');

// Public routes
router.get('/nearby', getNearbyVets);
router.post('/contact', contactVet);

// Vet-only routes
router.get('/cases', protect, authorize('vet', 'admin'), getVetCases);
router.post('/cases/:reportId/accept', protect, authorize('vet', 'admin'), acceptVetCase);
router.patch('/cases/:reportId/treatment', protect, authorize('vet', 'admin'), updateTreatment);
router.patch('/cases/:reportId/adoption', protect, authorize('vet', 'admin', 'public'), markReadyForAdoption);

module.exports = router;