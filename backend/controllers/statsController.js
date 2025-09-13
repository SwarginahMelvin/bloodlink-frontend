const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get blood type statistics
// @route   GET /api/stats/blood-types
// @access  Private
const getBloodTypeStats = asyncHandler(async (req, res) => {
  try {
    // Get all blood types and their counts from registered users
    const userStats = await User.aggregate([
      { $match: { isActive: true, bloodType: { $exists: true, $ne: null } } },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get blood request statistics
    const requestStats = await BloodRequest.aggregate([
      { $match: { status: { $in: ['pending', 'urgent'] } } },
      { $group: { _id: '$bloodType', requests: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get donation statistics
    const donationStats = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $lookup: { from: 'users', localField: 'donor', foreignField: '_id', as: 'donorInfo' } },
      { $unwind: '$donorInfo' },
      { $group: { _id: '$donorInfo.bloodType', donations: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Combine all statistics
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const stats = bloodTypes.map(type => {
      const userStat = userStats.find(stat => stat._id === type);
      const requestStat = requestStats.find(stat => stat._id === type);
      const donationStat = donationStats.find(stat => stat._id === type);

      return {
        bloodType: type,
        availableDonors: userStat ? userStat.count : 0,
        activeRequests: requestStat ? requestStat.requests : 0,
        totalDonations: donationStat ? donationStat.donations : 0
      };
    });

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Blood type stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood type statistics'
    });
  }
});

module.exports = {
  getBloodTypeStats
};
