const express = require('express');
const { register, login, getCurrentUser, getUsersByRole } = require('../controllers/authController');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/signup', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.get('/users', auth, authorize('ADMIN', 'SUPERVISOR'), getUsersByRole); // Only accessible to admin/supervisor

module.exports = router;