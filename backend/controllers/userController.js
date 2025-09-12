const User = require('../models/User');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  res.json({
    success: true,
    data: { user }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'username', 'email', 'phone', 'bloodType', 'profile', 'isAvailable'
  ];
  
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required to delete account'
    });
  }

  // Verify password
  const user = await User.findById(req.user._id).select('+password');
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid password'
    });
  }

  // Soft delete - deactivate account
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// @desc    Get user donation history
// @route   GET /api/users/donations
// @access  Private
const getDonationHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const donations = await Donation.find({ donor: req.user._id })
    .populate('bloodRequest', 'patientName bloodType hospital urgency')
    .sort({ donationDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Donation.countDocuments({ donor: req.user._id });

  res.json({
    success: true,
    data: {
      donations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Update user availability
// @route   PUT /api/users/availability
// @access  Private
const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isAvailable },
    { new: true }
  );

  res.json({
    success: true,
    message: `Availability updated to ${isAvailable ? 'available' : 'unavailable'}`,
    data: { user }
  });
});

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ recipient: req.user._id });
  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user._id, 
    isRead: false 
  });

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.markAsRead();

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
});

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getDonationHistory,
  updateAvailability,
  getNotifications,
  markNotificationAsRead
};
