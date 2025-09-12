const express = require('express');
const { 
  searchDonors, 
  getDonorProfile, 
  getNearbyDonors,
  matchDonorsForRequest
} = require('../controllers/donorController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Public routes (with optional auth)
router.get('/search', optionalAuth, validatePagination, asyncHandler(searchDonors));
router.get('/nearby', optionalAuth, validatePagination, asyncHandler(getNearbyDonors));

// Protected routes
router.get('/:id', protect, asyncHandler(getDonorProfile));
router.post('/match', protect, asyncHandler(matchDonorsForRequest));

module.exports = router;
