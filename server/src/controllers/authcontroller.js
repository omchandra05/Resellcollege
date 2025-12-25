const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config/index');
const User = require('../models/user');

// Helper for generating tokens with fallback for expiresIn
const signToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    // Falls back to '7d' if config is missing to prevent server crash
    expiresIn: config.JWT_EXPIRES_IN || '7d',
  });
};

// Centralized response function
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output for security
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role, // Essential for your dynamic Buyer/Seller UI
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    }
  });
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ status: 'error', errors: errors.array() });
    }

    const { username, name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Email or username already in use' 
      });
    }

    // Create user
    const newUser = await User.create({
      username,
      name,
      email,
      password,
      role: role || 'buyer' 
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    // 1) Check if email and password exist
    if (!emailOrUsername || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email/username and password!'
      });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    }).select('+password +role');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // 3) Send token
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};