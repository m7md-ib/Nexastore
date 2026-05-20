const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    if (!req.user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied: Admin only');
  }
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {}
  }

  next();
});

module.exports = { protect, admin, optionalAuth };
