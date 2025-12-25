const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/index');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    // Check for both id and _id in the decoded token to be safe
    req.user = await User.findById(decoded.id || decoded._id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found with this token' });
    }
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role (${req.user?.role || 'none'}) is not authorized to perform this action` });
    }
    next();
  };
};