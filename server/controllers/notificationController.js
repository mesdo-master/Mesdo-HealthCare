const Notification = require('../models/user/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const mode = req.query.mode;
    // Verify user authentication
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated',
      });
    }

    const notifs = await Notification.find({ recipient: req.user._id ,mode:mode })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: notifs,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      details: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    // Validate notification ID
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Notification ID is required',
      });
    }

    // Verify user authentication
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated',
      });
    }

    // Find and update notification
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    // Check if notification exists and belongs to user
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or not authorized',
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);

    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification ID format',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      details: error.message,
    });
  }
};


exports.getUnreadNotifications = async (req, res) => {
  try {
    const mode = req.query.mode;
    // Verify user authentication
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated',
      });
    }

    const unreadNotifs = await Notification.find({
      recipient: req.user._id,
      mode: mode,
      isRead: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: unreadNotifs,
      message: 'Unread notifications fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch unread notifications',
      details: error.message,
    });
  }
}