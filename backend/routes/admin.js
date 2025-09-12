const express = require('express');
const { 
  getDashboardStats,
  getAllUsers,
  getAllBloodRequests,
  getAllDonations,
  updateUserStatus,
  deleteUser,
  getSystemAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// Dashboard and analytics
router.get('/dashboard', asyncHandler(getDashboardStats));
router.get('/analytics', asyncHandler(getSystemAnalytics));

// User management
router.get('/users', validatePagination, asyncHandler(getAllUsers));
router.put('/users/:id/status', validateObjectId('id'), asyncHandler(updateUserStatus));
router.delete('/users/:id', validateObjectId('id'), asyncHandler(deleteUser));

// Blood requests management
router.get('/blood-requests', validatePagination, asyncHandler(getAllBloodRequests));

// Donations management
router.get('/donations', validatePagination, asyncHandler(getAllDonations));

module.exports = router;
