const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Dashboard endpoint - gets stats and recent listings
router.get('/dashboard', sellerController.getDashboard);

// Get all listings for this seller with filters
router.get('/listings', sellerController.getListings);

// Get analytics data
router.get('/analytics', sellerController.getAnalytics);

// Get sales data
router.get('/sales', sellerController.getSales);

module.exports = router;
