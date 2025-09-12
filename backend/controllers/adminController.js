const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalDonors,
    totalBloodRequests,
    totalDonations,
    activeRequests,
    recentDonations,
    bloodTypeStats,
    monthlyStats
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: { $in: ['user', 'donor'] }, isActive: true }),
    BloodRequest.countDocuments({ isActive: true }),
    Donation.countDocuments({ status: 'completed' }),
    BloodRequest.countDocuments({ status: 'pending', isActive: true }),
    Donation.countDocuments({ 
      status: 'completed',
      donationDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }),
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Donation.aggregate([
      { 
        $match: { 
          status: 'completed',
          donationDate: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalDonors,
        totalBloodRequests,
        totalDonations,
        activeRequests,
        recentDonations
      },
      bloodTypeStats,
      monthlyStats
    }
  });
});

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSystemAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    userRegistrations,
    bloodRequests,
    donations,
    topCities,
    urgencyStats
  ] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    BloodRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    Donation.aggregate([
      { $match: { donationDate: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' },
            day: { $dayOfMonth: '$donationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    User.aggregate([
      { $match: { isActive: true, 'profile.address.city': { $exists: true } } },
      { $group: { _id: '$profile.address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    BloodRequest.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      period: `${days} days`,
      userRegistrations,
      bloodRequests,
      donations,
      topCities,
      urgencyStats
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { 
    role, 
    bloodType, 
    city, 
    isActive = true,
    page = 1, 
    limit = 20 
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  if (role) query.role = role;
  if (bloodType) query.bloodType = bloodType;
  if (city) query['profile.address.city'] = new RegExp(city, 'i');
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const users = await User.find(query)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get all blood requests
// @route   GET /api/admin/blood-requests
// @access  Private/Admin
const getAllBloodRequests = asyncHandler(async (req, res) => {
  const { 
    status, 
    bloodType, 
    urgency,
    page = 1, 
    limit = 20 
  } = req.query;

  const skip = (page - 1) * limit;
  const query = { isActive: true };

  if (status) query.status = status;
  if (bloodType) query.bloodType = bloodType;
  if (urgency) query.urgency = urgency;

  const bloodRequests = await BloodRequest.find(query)
    .populate('requester', 'username email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await BloodRequest.countDocuments(query);

  res.json({
    success: true,
    data: {
      bloodRequests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get all donations
// @route   GET /api/admin/donations
// @access  Private/Admin
const getAllDonations = asyncHandler(async (req, res) => {
  const { 
    status, 
    bloodType,
    page = 1, 
    limit = 20 
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  if (status) query.status = status;
  if (bloodType) query.bloodType = bloodType;

  const donations = await Donation.find(query)
    .populate('donor', 'username email phone bloodType')
    .populate('bloodRequest', 'patientName bloodType hospital urgency')
    .sort({ donationDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Donation.countDocuments(query);

  res.json({
    success: true,
    data: {
      donations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const updates = {};
  if (isActive !== undefined) updates.isActive = isActive;
  if (role) updates.role = role;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: { user: updatedUser }
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Soft delete
  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllBloodRequests,
  getAllDonations,
  updateUserStatus,
  deleteUser,
  getSystemAnalytics
};
