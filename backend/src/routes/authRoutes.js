const express = require('express');
const { register, login, getCurrentUser, getUsersByRole } = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/signup', register);
router.post('/login', login);

// Protected routes
router.get('/me', getCurrentUser);
router.get('/users', getUsersByRole); // Only accessible to admin/supervisor

module.exports = router;