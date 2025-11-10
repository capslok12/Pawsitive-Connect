// routes/reportRoutes.js (Update this file)
const express = require('express');
const { createReport, analyzeImage, contactVet, getMyReports } = require('../controllers/reportController'); 
const { protect } = require('../middleware/authMiddleware'); // ASSUMED MIDDLEWARE

const router = express.Router();

// 1. New route for the Finder Dashboard
router.route('/my-reports').get(protect, getMyReports); 

// 2. Existing routes (Keep these)
router.route('/').post(protect, createReport); 
router.route('/analyze-image').post(analyzeImage);
router.route('/vets/contact').post(protect, contactVet); 

module.exports = router;
