const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createNotification = async (userId, title, message, type = 'system', relatedReport = null) => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      relatedReport
    });
  } catch (err) {
    console.error('Notification creation error:', err);
  }
};

exports.notifyNearbyRescuers = async (reportId, lat, lng) => {
  try {
    // Find all available rescuers (simplified - in production, use geospatial queries)
    const rescuers = await User.find({ 
      role: 'rescuer', 
      isAvailable: true 
    });

    for (const rescuer of rescuers) {
      await exports.createNotification(
        rescuer._id,
        'New Animal Rescue Request',
        'A new animal needs rescue in your area',
        'new_report',
        reportId
      );
    }
    
    console.log(`Notified ${rescuers.length} rescuers about new report ${reportId}`);
  } catch (err) {
    console.error('Rescuer notification error:', err);
  }
};
