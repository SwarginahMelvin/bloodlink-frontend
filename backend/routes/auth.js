const express = require('express');
const { register, login, logout, refreshToken, forgotPassword, resetPassword, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, asyncHandler(register));
router.post('/login', validateUserLogin, asyncHandler(login));
router.post('/logout', protect, asyncHandler(logout));
router.post('/refresh-token', asyncHandler(refreshToken));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));
router.get('/verify-email/:token', asyncHandler(verifyEmail));

module.exports = router;
