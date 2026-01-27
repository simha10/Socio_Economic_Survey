const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  console.log('[AUTH-MIDDLEWARE] Processing authentication for:', req.method, req.path);
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('[AUTH-MIDDLEWARE] Token extracted:', !!token);
    
    if (!token) {
      console.log('[AUTH-MIDDLEWARE] No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    console.log('[AUTH-MIDDLEWARE] Token decoded, user ID:', decoded.userId);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('[AUTH-MIDDLEWARE] User lookup result:', !!user, user ? user.isActive : null);
    
    if (!user || !user.isActive) {
      console.log('[AUTH-MIDDLEWARE] User not found or inactive');
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found or inactive.'
      });
    }

    req.user = user;
    console.log('[AUTH-MIDDLEWARE] Authentication successful, user:', user.username, 'role:', user.role);
    next();
  } catch (error) {
    console.error('[AUTH-MIDDLEWARE] Authentication error:', error.message);
    if (error.name === 'JsonWebTokenError') {
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
    console.log('[AUTHORIZE-MIDDLEWARE] Authorizing user:', req.user ? req.user.username : 'NO_USER', 'for roles:', roles);
    if (!req.user) {
      console.log('[AUTHORIZE-MIDDLEWARE] No authenticated user found');
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('[AUTHORIZE-MIDDLEWARE] User role', req.user.role, 'not in allowed roles:', roles);
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}.`
      });
    }
    
    console.log('[AUTHORIZE-MIDDLEWARE] Authorization successful');
    next();
  };
};

module.exports = { auth, authorize };