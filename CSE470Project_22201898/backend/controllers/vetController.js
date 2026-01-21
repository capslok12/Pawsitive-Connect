const User = require('../models/User');
const Report = require('../models/Report');
const { createNotification } = require('./notificationController');

// Get nearby vets based on location
exports.getNearbyVets = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in kilometers
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Convert radius to radians (approximate)
    const radiusInRadians = radius / 6371;

    const vets = await User.find({
      role: 'vet',
      isAvailable: true,
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
        }
      }
    }).select('-password');

    res.json(vets);
  } catch (err) {
    console.error('Error fetching nearby vets:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Contact vet immediately
exports.contactVet = async (req, res) => {
  try {
    const { vetId, reportId, message } = req.body;
    
    const vet = await User.findById(vetId);
    if (!vet || vet.role !== 'vet') {
      return res.status(404).json({ message: 'Vet not found' });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Create notification for vet
    await createNotification(
      vetId,
      'Emergency Animal Case',
      `Urgent: ${message || 'An animal needs immediate veterinary attention'}`,
      'new_report',
      reportId
    );

    // Update report with assigned vet
    report.assignedVet = vetId;
    report.status = 'In Progress';
    await report.save();

    res.json({ 
      message: 'Vet has been notified and will contact you shortly',
      vetContact: {
        name: vet.name,
        phone: vet.contactInfo?.phone || vet.phone,
        clinic: vet.clinicName
      }
    });
  } catch (err) {
    console.error('Error contacting vet:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vet accepts rescue case
exports.acceptVetCase = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.assignedVet = req.user.id;
    report.status = 'Under Treatment';
    await report.save();

    // Notify reporter
    if (report.createdBy) {
      await createNotification(
        report.createdBy,
        'Veterinarian Assigned',
        `Dr. ${req.user.name} has accepted your animal case and will provide treatment`,
        'rescue_assigned',
        reportId
      );
    }

    res.json({ 
      message: 'Case accepted successfully',
      report 
    });
  } catch (err) {
    console.error('Error accepting vet case:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update treatment details
exports.updateTreatment = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { vetNotes, treatmentPlan, estimatedRecoveryTime, healthInfo } = req.body;
    
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.assignedVet?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this case' });
    }

    report.vetNotes = vetNotes || report.vetNotes;
    report.treatmentPlan = treatmentPlan || report.treatmentPlan;
    report.estimatedRecoveryTime = estimatedRecoveryTime || report.estimatedRecoveryTime;
    report.healthInfo = healthInfo || report.healthInfo;
    
    await report.save();

    res.json(report);
  } catch (err) {
    console.error('Error updating treatment:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark animal ready for adoption
exports.markReadyForAdoption = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { contactPerson, contactPhone, contactEmail, location, adoptionFee, requirements } = req.body;
    
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.assignedVet?.toString() !== req.user.id && report.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to post for adoption' });
    }

    report.status = 'Ready for Adoption';
    report.isForAdoption = true;
    report.adoptionInfo = {
      postedBy: req.user.id,
      contactPerson: contactPerson || (report.assignedVet ? 'vet' : 'reporter'),
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      location: location || '',
      adoptionFee: adoptionFee || 0,
      requirements: requirements || ''
    };

    await report.save();

    res.json({ 
      message: 'Animal listed for adoption successfully',
      report 
    });
  } catch (err) {
    console.error('Error marking ready for adoption:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vet's active cases
exports.getVetCases = async (req, res) => {
  try {
    const cases = await Report.find({
      $or: [
        { assignedVet: req.user.id },
        { status: 'Under Treatment' }
      ]
    })
    .populate('createdBy', 'name email phone')
    .sort({ updatedAt: -1 });

    res.json(cases);
  } catch (err) {
    console.error('Error fetching vet cases:', err);
    res.status(500).json({ message: 'Server error' });
  }
};