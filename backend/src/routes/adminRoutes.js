const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const { getStates, getStateById, getDistricts, getDistrictById, getDistrictsByState } = require('../controllers/locationController');
const { createUser, listUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { createSlum, listSlums, getSlumById, updateSlum, deleteSlum } = require('../controllers/slumController');

const router = express.Router();

// Location routes (accessible to authenticated users)
router.get('/states', auth, getStates);
router.get('/states/:id', auth, getStateById);
router.get('/districts', auth, getDistricts);
router.get('/districts/:id', auth, getDistrictById);
router.get('/districts/state/:stateId', auth, getDistrictsByState);

// User management routes (admin only)
router.post('/users', auth, authorize('ADMIN'), createUser);
router.get('/users', auth, authorize('ADMIN'), listUsers);
router.get('/users/:userId', auth, authorize('ADMIN'), getUserById);
router.put('/users/:userId', auth, authorize('ADMIN'), updateUser);
router.delete('/users/:userId', auth, authorize('ADMIN'), deleteUser);

// Slum management routes (admin and supervisor)
router.post('/slums', auth, authorize('ADMIN', 'SUPERVISOR'), createSlum);
router.get('/slums', auth, listSlums);
router.get('/slums/:slumId', auth, getSlumById);
router.put('/slums/:slumId', auth, authorize('ADMIN', 'SUPERVISOR'), updateSlum);
router.delete('/slums/:slumId', auth, authorize('ADMIN'), deleteSlum);

module.exports = router;