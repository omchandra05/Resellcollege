const jwt = require('jsonwebtoken');
const config = require('../config/index');
const User = require('../models/user');

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication error: token missing'));

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('Authentication error: user not found'));

    socket.user = user;
    return next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
};
