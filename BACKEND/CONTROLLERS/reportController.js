// controllers/reportController.js (Add this new function to your existing exports)
const Report = require('../models/Report'); 

// ... existing exports (createReport, analyzeImage, contactVet) ...

// @desc    Get all reports submitted by the logged-in Finder
// @route   GET /api/reports/my-reports
// @access  Private (Requires JWT Token)
exports.getMyReports = async (req, res) => {
    try {
        // The 'protect' middleware ensures req.user.id exists
        const finderId = req.user.id; 

        const reports = await Report.find({ finder: finderId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });

    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({ 
            message: 'Server error while fetching reports.',
            error: error.message
        });
    }
};

// ... remember to update module.exports to include getMyReports
// module.exports = { createReport, analyzeImage, contactVet, getMyReports };
