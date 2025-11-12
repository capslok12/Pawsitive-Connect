const Report = require('../models/Report');
const User = require('../models/User');
const { createNotification, notifyNearbyRescuers } = require('./notificationController');

exports.createReport = async (req, res) => {
  try {
    const { photoURL, description, lat, lng, issueType, animalType, injurySeverity } = req.body;
    
    if (!photoURL || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'photoURL, lat and lng are required' });
    }

    const report = new Report({ 
      photoURL, 
      description, 
      lat, 
      lng, 
      issueType: issueType || 'Other',
      animalType: animalType || '',
      injurySeverity: injurySeverity || 'Medium',
      createdBy: req.user?.id 
    });
    
    await report.save();

    // Notify nearby rescuers and vets
    await notifyNearbyRescuers(report._id, lat, lng);

    return res.status(201).json(report);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status, issueType } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (issueType) filter.issueType = issueType;

    const reports = await Report.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('assignedVet', 'name email clinicName')
      .sort({ createdAt: -1 });
    
    return res.json(reports);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Pending', 'In Progress', 'Under Treatment', 'Ready for Adoption', 'Adopted'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    await report.save();

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload recovery photo
exports.uploadRecoveryPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { recoveryPhotoURL } = req.body;

    if (!recoveryPhotoURL) return res.status(400).json({ message: 'Recovery photo URL required' });

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.recoveryPhotoURL = recoveryPhotoURL;
    await report.save();

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.acceptRescue = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.status !== 'Pending') {
      return res.status(400).json({ message: 'Report already accepted' });
    }

    report.status = 'In Progress';
    report.assignedTo = req.user.id;
    await report.save();

    // Add points to rescuer
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10, rescueCount: 1 } });

    // Create notification
    await createNotification(
      req.user.id,
      'Rescue Mission Accepted',
      `You have accepted rescue mission for ${report.issueType} animal`,
      'rescue_assigned',
      report._id
    );

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Post for adoption (for rescuers)
exports.postForAdoption = async (req, res) => {
  try {
    const { id } = req.params;
    const { animalName, healthInfo, contactPhone, contactEmail, location, adoptionFee, requirements } = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Check if user is the rescuer who accepted this case
    if (report.assignedTo?.toString() !== req.user.id && report.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to post this animal for adoption' });
    }

    report.status = 'Ready for Adoption';
    report.isForAdoption = true;
    report.animalName = animalName || report.animalName;
    report.healthInfo = healthInfo || report.healthInfo;
    report.adoptionInfo = {
      postedBy: req.user.id,
      contactPerson: 'rescuer',
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      location: location || '',
      adoptionFee: adoptionFee || 0,
      requirements: requirements || ''
    };

    await report.save();

    res.json({ 
      message: 'Animal posted for adoption successfully',
      report 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requestAdoption = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, contactInfo } = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Animal not found' });
    if (report.status !== 'Ready for Adoption') {
      return res.status(400).json({ message: 'Animal not available for adoption' });
    }

    // Check if already requested
    const existingRequest = report.adoptionRequests.find(
      req => req.userId && req.userId.toString() === req.user.id
    );
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested adoption' });
    }

    report.adoptionRequests.push({
      userId: req.user.id,
      message: message || 'I would like to adopt this animal',
      contactInfo: {
        phone: contactInfo?.phone || '',
        email: contactInfo?.email || ''
      }
    });

    await report.save();

    // Notify the poster (rescuer or vet)
    await createNotification(
      report.adoptionInfo.postedBy,
      'New Adoption Request',
      `Someone wants to adopt ${report.animalName || 'the animal'}`,
      'adoption_request',
      report._id
    );

    res.json({ message: 'Adoption request submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdoptionRequests = async (req, res) => {
  try {
    const reports = await Report.find({
      'adoptionRequests.0': { $exists: true },
      $or: [
        { 'adoptionInfo.postedBy': req.user.id },
        { assignedTo: req.user.id }
      ]
    })
    .populate('adoptionRequests.userId', 'name email phone')
    .populate('assignedTo', 'name')
    .sort({ 'adoptionRequests.createdAt': -1 });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAdoptionRequest = async (req, res) => {
  try {
    const { reportId, requestId } = req.params;
    const { status } = req.body;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Check if user is authorized (poster or assigned rescuer)
    if (report.adoptionInfo.postedBy.toString() !== req.user.id && report.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to manage this adoption' });
    }

    const request = report.adoptionRequests.id(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;

    if (status === 'Approved') {
      report.status = 'Adopted';
      // Notify the requester
      await createNotification(
        request.userId,
        'Adoption Approved!',
        `Your adoption request has been approved! Please contact the shelter.`,
        'adoption_request',
        report._id
      );
    }

    await report.save();
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// AI Analysis Simulation
exports.analyzeImage = async (req, res) => {
  try {
    // Simulate AI analysis
    const { imageUrl } = req.body;
    
    const analysisResults = {
      animalType: Math.random() > 0.5 ? 'Dog' : 'Cat',
      injurySeverity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      confidence: (Math.random() * 0.5 + 0.5).toFixed(2),
      firstAidSuggestions: 'Keep the animal warm and provide water. Avoid sudden movements.'
    };

    res.json(analysisResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI analysis failed' });
  }
};

// Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const inProgressReports = await Report.countDocuments({ status: 'In Progress' });
    const adoptedReports = await Report.countDocuments({ status: 'Adopted' });
    const readyForAdoption = await Report.countDocuments({ status: 'Ready for Adoption' });

    const issueTypeStats = await Report.aggregate([
      { $group: { _id: '$issueType', count: { $sum: 1 } } }
    ]);

    const monthlyStats = await Report.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topRescuers = await User.aggregate([
      { $match: { role: 'rescuer' } },
      { $sort: { rescueCount: -1 } },
      { $limit: 10 },
      { $project: { name: 1, rescueCount: 1, points: 1 } }
    ]);

    res.json({
      totalReports,
      pendingReports,
      inProgressReports,
      adoptedReports,
      readyForAdoption,
      issueTypeStats,
      monthlyStats,
      topRescuers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Analytics error' });
  }
};