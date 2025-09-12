const express = require('express');
const { 
  createBloodRequest, 
  getBloodRequests, 
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  matchDonorsToRequest,
  fulfillRequest
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const { validateBloodRequest, validateObjectId, validatePagination } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes are protected
router.use(protect);

// Blood request routes
router.post('/', validateBloodRequest, asyncHandler(createBloodRequest));
router.get('/', validatePagination, asyncHandler(getBloodRequests));
router.get('/:id', validateObjectId('id'), asyncHandler(getBloodRequestById));
router.put('/:id', validateObjectId('id'), validateBloodRequest, asyncHandler(updateBloodRequest));
router.delete('/:id', validateObjectId('id'), asyncHandler(deleteBloodRequest));

// Matching and fulfillment
router.post('/:id/match', validateObjectId('id'), asyncHandler(matchDonorsToRequest));
router.post('/:id/fulfill', validateObjectId('id'), asyncHandler(fulfillRequest));

module.exports = router;
