const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Search donors
// @route   GET /api/donors/search
// @access  Public
const searchDonors = asyncHandler(async (req, res) => {
  const { 
    bloodType, 
    city, 
    state, 
    withinKm = 50,
    page = 1, 
    limit = 20 
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {
    role: { $in: ['user', 'donor'] },
    isActive: true,
    isAvailable: true
  };

  // Filter by blood type
  if (bloodType) {
    query.bloodType = bloodType;
  }

  // Filter by location
  if (city) {
    query['profile.address.city'] = new RegExp(city, 'i');
  }
  if (state) {
    query['profile.address.state'] = new RegExp(state, 'i');
  }

  const donors = await User.find(query)
    .select('-password -refreshTokens -email -phone')
    .sort({ lastDonationDate: 1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      donors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get donor profile
// @route   GET /api/donors/:id
// @access  Private
const getDonorProfile = asyncHandler(async (req, res) => {
  const donor = await User.findById(req.params.id)
    .select('-password -refreshTokens -email -phone');

  if (!donor) {
    return res.status(404).json({
      success: false,
      message: 'Donor not found'
    });
  }

  // Check if donor is available and can donate
  const canDonate = donor.canDonate();
  const isAvailable = donor.isAvailable && canDonate;

  res.json({
    success: true,
    data: {
      donor: {
        ...donor.toObject(),
        canDonate,
        isAvailable
      }
    }
  });
});

// @desc    Get nearby donors
// @route   GET /api/donors/nearby
// @access  Public
const getNearbyDonors = asyncHandler(async (req, res) => {
  const { 
    latitude, 
    longitude, 
    bloodType, 
    radius = 50,
    page = 1, 
    limit = 20 
  } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  const skip = (page - 1) * limit;
  const query = {
    role: { $in: ['user', 'donor'] },
    isActive: true,
    isAvailable: true,
    'profile.address.coordinates.latitude': {
      $exists: true,
      $ne: null
    },
    'profile.address.coordinates.longitude': {
      $exists: true,
      $ne: null
    }
  };

  // Filter by blood type
  if (bloodType) {
    query.bloodType = bloodType;
  }

  let donors = await User.find(query)
    .select('-password -refreshTokens -email -phone')
    .sort({ lastDonationDate: 1, createdAt: -1 });

  // Calculate distance and filter by radius
  const userLat = parseFloat(latitude);
  const userLng = parseFloat(longitude);
  const radiusKm = parseFloat(radius);

  donors = donors.filter(donor => {
    if (!donor.profile?.address?.coordinates) return false;
    
    const donorLat = donor.profile.address.coordinates.latitude;
    const donorLng = donor.profile.address.coordinates.longitude;
    
    const distance = calculateDistance(userLat, userLng, donorLat, donorLng);
    donor.distance = distance;
    
    return distance <= radiusKm;
  });

  // Sort by distance
  donors.sort((a, b) => a.distance - b.distance);

  // Paginate
  const total = donors.length;
  const paginatedDonors = donors.slice(skip, skip + parseInt(limit));

  res.json({
    success: true,
    data: {
      donors: paginatedDonors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Match donors for blood request
// @route   POST /api/donors/match
// @access  Private
const matchDonorsForRequest = asyncHandler(async (req, res) => {
  const { bloodRequestId } = req.body;

  const bloodRequest = await BloodRequest.findById(bloodRequestId);
  
  if (!bloodRequest) {
    return res.status(404).json({
      success: false,
      message: 'Blood request not found'
    });
  }

  // Check if user owns the request
  if (bloodRequest.requester.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Find compatible donors
  const compatibleBloodTypes = getCompatibleBloodTypes(bloodRequest.bloodType);
  
  const donors = await User.find({
    bloodType: { $in: compatibleBloodTypes },
    role: { $in: ['user', 'donor'] },
    isActive: true,
    isAvailable: true,
    _id: { $ne: req.user._id } // Exclude requester
  })
  .select('-password -refreshTokens -email -phone')
  .sort({ lastDonationDate: 1, createdAt: -1 })
  .limit(20);

  // Filter donors who can donate
  const eligibleDonors = donors.filter(donor => donor.canDonate());

  res.json({
    success: true,
    data: {
      bloodRequest,
      matchedDonors: eligibleDonors,
      totalMatches: eligibleDonors.length
    }
  });
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// Helper function to get compatible blood types
function getCompatibleBloodTypes(bloodType) {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  
  return compatibility[bloodType] || [];
}

// @desc    Register as donor
// @route   POST /api/donors/register
// @access  Private
const registerAsDonor = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    weight,
    address,
    emergencyContact
  } = req.body;

  // Update user profile with donor information
  const user = await User.findByIdAndUpdate(
    userId,
    {
      role: 'donor',
      isAvailable: true,
      'profile.firstName': firstName,
      'profile.lastName': lastName,
      'profile.dateOfBirth': dateOfBirth,
      'profile.gender': gender,
      'profile.weight': weight,
      'profile.address': address,
      'profile.emergencyContact': emergencyContact
    },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Successfully registered as donor',
    data: { user }
  });
});

module.exports = {
  searchDonors,
  getDonorProfile,
  getNearbyDonors,
  matchDonorsForRequest,
  registerAsDonor
};
