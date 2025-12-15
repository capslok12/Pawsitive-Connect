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
