const express = require('express');
const { 
  searchDonors, 
  getDonorProfile, 
  getNearbyDonors,
  matchDonorsForRequest,
  registerAsDonor
} = require('../controllers/donorController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validatePagination, validateDonorRegistration } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Public routes (with optional auth)
router.get('/search', optionalAuth, validatePagination, asyncHandler(searchDonors));
router.get('/nearby', optionalAuth, validatePagination, asyncHandler(getNearbyDonors));

// Protected routes
router.post('/register', protect, validateDonorRegistration, asyncHandler(registerAsDonor));
router.get('/:id', protect, asyncHandler(getDonorProfile));
router.post('/match', protect, asyncHandler(matchDonorsForRequest));

module.exports = router;
