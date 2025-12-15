// At the top of your existing routes/reports.js file:
const auth = require('../middleware/auth'); // Add this import

// Then ADD this new route (keep all your existing routes):

// POST /api/reports/:id/adopt - Submit adoption request
router.post('/:id/adopt', auth, async (req, res) => {
  try {
    const { message, contactInfo } = req.body;
    const reportId = req.params.id;

    if (!message || !contactInfo?.phone || !contactInfo?.email) {
      return res.status(400).json({ 
        error: 'Please provide message, phone, and email' 
      });
    }

    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    if (report.status !== 'Ready for Adoption') {
      return res.status(400).json({ 
        error: 'This animal is not currently available for adoption' 
      });
    }

    const adoptionRequestData = {
      userId: req.user.id,
      userName: req.user.name,
      message,
      contactInfo: {
        phone: contactInfo.phone,
        email: contactInfo.email
      },
      requestDate: new Date(),
      status: 'pending'
    };

    if (!report.adoptionRequests) {
      report.adoptionRequests = [];
    }
    
    report.adoptionRequests.push(adoptionRequestData);
    await report.save();
    
    res.status(200).json({ 
      message: 'Adoption request submitted successfully',
      adoptionRequest: adoptionRequestData
    });

  } catch (error) {
    console.error('Adoption request error:', error);
    res.status(500).json({ 
      error: 'Failed to submit adoption request',
      details: error.message 
    });
  }
});
// routes/reports.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ============================================
// ADD THIS ROUTE BEFORE ANY /:id ROUTES
// ============================================
router.get('/analytics/dashboard', auth, async (req, res) => {
  try {
    // 1. Get total counts by status
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const adoptedReports = await Report.countDocuments({ status: 'Adopted' });
    const readyForAdoption = await Report.countDocuments({ status: 'Ready for Adoption' });

    // 2. Get issue type distribution
    const issueTypeStats = await Report.aggregate([
      {
        $group: {
          _id: '$issueType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 3. Get monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Get top rescuers leaderboard
    const topRescuers = await Report.aggregate([
      {
        $group: {
          _id: '$reportedBy',
          rescueCount: { $sum: 1 },
          points: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$status', 'Adopted'] }, then: 10 },
                  { case: { $eq: ['$status', 'Ready for Adoption'] }, then: 7 },
                  { case: { $eq: ['$status', 'Under Treatment'] }, then: 5 },
                  { case: { $eq: ['$status', 'Rescued'] }, then: 3 }
                ],
                default: 1
              }
            }
          }
        }
      },
      { $sort: { points: -1, rescueCount: -1 } },
      { $limit: 10 }
    ]);

    // 5. Populate user names
    const rescuerIds = topRescuers.map(r => r._id);
    const users = await User.find({ _id: { $in: rescuerIds } })
      .select('_id name');

    const topRescuersWithNames = topRescuers.map(rescuer => {
      const user = users.find(u => u._id.toString() === rescuer._id.toString());
      return {
        _id: rescuer._id,
        name: user ? user.name : 'Unknown User',
        rescueCount: rescuer.rescueCount,
        points: rescuer.points
      };
    });

    // 6. Send response
    res.json({
      totalReports,
      pendingReports,
      adoptedReports,
      readyForAdoption,
      issueTypeStats,
      monthlyStats,
      topRescuers: topRescuersWithNames
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    });
  }
});

// ... rest of your existing routes (/:id routes go here) ...

module.exports = router;
