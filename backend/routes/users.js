const express = require('express');
const { 
  getProfile, 
  updateProfile, 
  deleteAccount, 
  getDonationHistory,
  updateAvailability,
  getNotifications,
  markNotificationAsRead,
  getUserRequests
} = require('../controllers/userController');
const { protect, checkOwnership } = require('../middleware/auth');
const { validateUserUpdate, validateObjectId, validatePagination } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/profile', asyncHandler(getProfile));
router.put('/profile', validateUserUpdate, asyncHandler(updateProfile));
router.delete('/account', asyncHandler(deleteAccount));

// Donation history
router.get('/donations', validatePagination, asyncHandler(getDonationHistory));

// Availability
router.put('/availability', asyncHandler(updateAvailability));

// User requests
router.get('/requests', validatePagination, asyncHandler(getUserRequests));

// Notifications
router.get('/notifications', validatePagination, asyncHandler(getNotifications));
router.put('/notifications/:id/read', validateObjectId('id'), asyncHandler(markNotificationAsRead));

module.exports = router;
