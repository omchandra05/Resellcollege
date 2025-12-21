const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const { protect } = require('../middleware/authMiddleware');

// REGISTER
router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  authController.register
);

// LOGIN
router.post(
  '/login',
  [
    body('emailOrUsername').notEmpty(),
    body('password').notEmpty()
  ],
  authController.login
);

// PROFILE
router.get('/me', protect, authController.getProfile);

module.exports = router;
