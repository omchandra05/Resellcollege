const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Update user profile
router.put('/profile', usersController.updateProfile);

// Get user profile
router.get('/profile', usersController.getProfile);

module.exports = router;
