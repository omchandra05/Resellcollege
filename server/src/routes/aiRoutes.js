const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/improve-listing', protect, aiController.improveListing);
router.post('/chat', aiController.handleChat); // Publicly accessible chatbot

module.exports = router;