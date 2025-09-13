const express = require('express');
const { getBloodTypeStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes are protected
router.use(protect);

// Blood type statistics
router.get('/blood-types', asyncHandler(getBloodTypeStats));

module.exports = router;
