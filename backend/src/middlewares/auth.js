const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found or inactive.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH-MIDDLEWARE] ❌ Authentication error:', error.message);
    console.error('[AUTH-MIDDLEWARE] Error name:', error.name);
    console.error('[AUTH-MIDDLEWARE] Error stack:', error.stack);
    console.error('[AUTH-MIDDLEWARE] Token preview:', req.header('Authorization')?.substring(0, 50) + '...');
    if (error.name === 'JsonWebTokenError') {
      console.error('[AUTH-MIDDLEWARE] JWT validation failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    const userRole = req.user.role ? String(req.user.role).toUpperCase().trim() : '';
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}.`
      });
    }
    
    next();
  };
};

module.exports = { auth, authorize };