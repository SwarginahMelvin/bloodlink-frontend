const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create blood request
// @route   POST /api/requests
// @access  Private
const createBloodRequest = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.create({
    ...req.body,
    requester: req.user._id
  });

  // Populate requester details
  await bloodRequest.populate('requester', 'username email phone');

  res.status(201).json({
    success: true,
    message: 'Blood request created successfully',
    data: { bloodRequest }
  });
});

// @desc    Get blood requests
// @route   GET /api/requests
// @access  Private
const getBloodRequests = asyncHandler(async (req, res) => {
  const { 
    bloodType, 
    city, 
    state, 
    urgency, 
    status = 'pending',
    page = 1, 
    limit = 20 
  } = req.query;

  const skip = (page - 1) * limit;
  const query = { isActive: true };

  // Filter by blood type
  if (bloodType) {
    query.bloodType = bloodType;
  }

  // Filter by location
  if (city) {
    query['hospital.address.city'] = new RegExp(city, 'i');
  }
  if (state) {
    query['hospital.address.state'] = new RegExp(state, 'i');
  }

  // Filter by urgency
  if (urgency) {
    query.urgency = urgency;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  const bloodRequests = await BloodRequest.find(query)
    .populate('requester', 'username email phone')
    .sort({ urgency: -1, createdAt: -1 })
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

// @desc    Get blood request by ID
// @route   GET /api/requests/:id
// @access  Private
const getBloodRequestById = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.findById(req.params.id)
    .populate('requester', 'username email phone')
    .populate('matchedDonors.donor', 'username bloodType profile phone');

  if (!bloodRequest) {
    return res.status(404).json({
      success: false,
      message: 'Blood request not found'
    });
  }

  res.json({
    success: true,
    data: { bloodRequest }
  });
});

// @desc    Update blood request
// @route   PUT /api/requests/:id
// @access  Private
const updateBloodRequest = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.findById(req.params.id);

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

  // Don't allow updates if request is fulfilled or cancelled
  if (['fulfilled', 'cancelled'].includes(bloodRequest.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update fulfilled or cancelled requests'
    });
  }

  const updatedRequest = await BloodRequest.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('requester', 'username email phone');

  res.json({
    success: true,
    message: 'Blood request updated successfully',
    data: { bloodRequest: updatedRequest }
  });
});

// @desc    Delete blood request
// @route   DELETE /api/requests/:id
// @access  Private
const deleteBloodRequest = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.findById(req.params.id);

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

  // Soft delete
  bloodRequest.isActive = false;
  bloodRequest.status = 'cancelled';
  await bloodRequest.save();

  res.json({
    success: true,
    message: 'Blood request deleted successfully'
  });
});

// @desc    Match donors to blood request
// @route   POST /api/requests/:id/match
// @access  Private
const matchDonorsToRequest = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.findById(req.params.id);

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

  // Get compatible blood types
  const compatibleBloodTypes = getCompatibleBloodTypes(bloodRequest.bloodType);
  
  // Find eligible donors
  const donors = await User.find({
    bloodType: { $in: compatibleBloodTypes },
    role: { $in: ['user', 'donor'] },
    isActive: true,
    isAvailable: true,
    _id: { $ne: req.user._id }
  })
  .select('-password -refreshTokens')
  .sort({ lastDonationDate: 1, createdAt: -1 })
  .limit(10);

  // Filter donors who can donate
  const eligibleDonors = donors.filter(donor => donor.canDonate());

  // Update blood request with matched donors
  const matchedDonors = eligibleDonors.map(donor => ({
    donor: donor._id,
    status: 'pending'
  }));

  bloodRequest.matchedDonors = matchedDonors;
  bloodRequest.status = 'matched';
  await bloodRequest.save();

  // Send notifications to matched donors
  for (const donor of eligibleDonors) {
    await Notification.createNotification(
      donor._id,
      'donation_match',
      'Blood Donation Match',
      `You have been matched for a blood donation request for ${bloodRequest.patientName}. Please check the details and respond.`,
      { bloodRequest: bloodRequest._id }
    );
  }

  res.json({
    success: true,
    message: 'Donors matched successfully',
    data: {
      bloodRequest,
      matchedDonors: eligibleDonors,
      totalMatches: eligibleDonors.length
    }
  });
});

// @desc    Fulfill blood request
// @route   POST /api/requests/:id/fulfill
// @access  Private
const fulfillRequest = asyncHandler(async (req, res) => {
  const { donorId, donationDate, location, volume = 450 } = req.body;

  const bloodRequest = await BloodRequest.findById(req.params.id);

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

  // Check if donor is matched
  const matchedDonor = bloodRequest.matchedDonors.find(
    match => match.donor.toString() === donorId
  );

  if (!matchedDonor) {
    return res.status(400).json({
      success: false,
      message: 'Donor not matched to this request'
    });
  }

  // Create donation record
  const donation = await Donation.create({
    donor: donorId,
    bloodRequest: bloodRequest._id,
    donationDate,
    location,
    bloodType: bloodRequest.bloodType,
    volume,
    status: 'completed'
  });

  // Update blood request
  bloodRequest.fulfilledUnits += 1;
  matchedDonor.status = 'completed';

  if (bloodRequest.fulfilledUnits >= bloodRequest.unitsRequired) {
    bloodRequest.status = 'fulfilled';
  }

  await bloodRequest.save();

  // Update donor's last donation date
  await User.findByIdAndUpdate(donorId, {
    lastDonationDate: donationDate
  });

  // Send notification to donor
  await Notification.createNotification(
    donorId,
    'donation_completed',
    'Donation Completed',
    'Thank you for your blood donation. Your contribution will help save lives.',
    { donation: donation._id }
  );

  res.json({
    success: true,
    message: 'Blood request fulfilled successfully',
    data: { donation, bloodRequest }
  });
});

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

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  matchDonorsToRequest,
  fulfillRequest
};
