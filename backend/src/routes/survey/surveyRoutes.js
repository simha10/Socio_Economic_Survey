const express = require('express');
const { auth, authorize } = require('../../middlewares/auth');
const {
  createSlum,
  getAllSlums,
  getSlumById,
  updateSlum,
  deleteSlum
} = require('../../controllers/survey/slumController');
const {
  assignSlumToSurveyor,
  getAllAssignments,
  getAssignmentById,
  getMyAssignments,
  getAssignmentsForSurveyor,
  updateAssignmentStatus,
  updateAssignment,
  deleteAssignment,
  updateAssignmentManualStatus
} = require('../../controllers/survey/assignmentController');
const {
  createOrGetHouseholdSurvey,
  getHouseholdSurvey,
  updateHouseholdSurvey,
  submitHouseholdSurvey,
  getHouseholdSurveyByHouseholdId,
  deleteHouseholdSurvey,
  updateSurveySection: updateHouseholdSurveySection,
  getSurveysSummary,
  getHouseholdSurveysBySlum,
  getHouseholdSurveyCount
} = require('../../controllers/survey/householdSurveyController');
const {
  createOrGetSlumSurvey,
  getSlumSurvey,
  updateSlumSurvey,
  submitSlumSurvey,
  getSlumSurveyBySlumId,
  deleteSlumSurvey,
  updateSurveySection: updateSlumSurveySection
} = require('../../controllers/survey/slumSurveyController');
const {
  getParcelsBySlum,
  getPropertiesBySlumAndParcel,
  getHouseholdSurveyByParcel,
  importHouseholds,
  getNextNewParcelId
} = require('../../controllers/survey/householdSurveyController');

const router = express.Router();

// ===== SLUM ROUTES =====
// Create, read, update, delete slums
router.post('/slums', auth, authorize('SUPERVISOR', 'ADMIN'), createSlum);
router.get('/slums', auth, getAllSlums);
router.get('/slums/:id', auth, getSlumById);
router.put('/slums/:id', auth, authorize('SUPERVISOR', 'ADMIN'), updateSlum);
router.delete('/slums/:id', auth, authorize('SUPERVISOR', 'ADMIN'), deleteSlum);

// ===== SLUM SURVEY ROUTES =====
// Create or get slum survey
router.post('/slum-surveys/:slumId', auth, authorize('SURVEYOR'), createOrGetSlumSurvey);
// Get specific survey
router.get('/slum-surveys/:surveyId', auth, getSlumSurvey);
// Get survey for a specific slum
router.get('/slum-surveys/slum/:slumId', auth, getSlumSurveyBySlumId);
// Update survey (full or partial)
router.put('/slum-surveys/:surveyId', auth, updateSlumSurvey);
// Update specific section
router.patch('/slum-surveys/:surveyId/section', auth, updateSlumSurveySection);
// Submit survey
router.post('/slum-surveys/:surveyId/submit', auth, submitSlumSurvey);
// Delete survey
router.delete('/slum-surveys/:surveyId', auth, deleteSlumSurvey);

// ===== HOUSEHOLD SURVEY ROUTES =====
// Create or get household survey
router.post('/household-surveys', auth, authorize('SURVEYOR'), createOrGetHouseholdSurvey);
// Get specific household survey
router.get('/household-surveys/:surveyId', auth, getHouseholdSurvey);
// Get survey for a specific household
router.get('/household-surveys/household/:householdId', auth, getHouseholdSurveyByHouseholdId);
// Update household survey (full or partial)
router.put('/household-surveys/:surveyId', auth, updateHouseholdSurvey);
// Update specific household survey section
router.patch('/household-surveys/:surveyId/section', auth, updateHouseholdSurveySection);
// Submit household survey
router.post('/household-surveys/:surveyId/submit', auth, submitHouseholdSurvey);
// Delete household survey
router.delete('/household-surveys/:surveyId', auth, deleteHouseholdSurvey);
// Get all surveys summary for surveyor
router.get('/household-surveys/summary/all', auth, getSurveysSummary);
// Get all household surveys for a specific slum
router.get('/household-surveys/slum/:slumId', auth, authorize('SUPERVISOR', 'ADMIN'), getHouseholdSurveysBySlum);
// Get household survey count for a specific slum (submitted only)
router.get('/household-surveys/slum/:slumId/count', auth, authorize('SUPERVISOR', 'ADMIN'), getHouseholdSurveyCount);

// ===== PARCEL-BASED HOUSEHOLD ROUTES =====
// Get all distinct parcel IDs for a slum
router.get('/household-surveys/parcels/:slumId', auth, authorize('SURVEYOR', 'SUPERVISOR', 'ADMIN'), getParcelsBySlum);
// Get all property numbers for a specific slum and parcel
router.get('/household-surveys/properties/:slumId/:parcelId', auth, authorize('SURVEYOR', 'SUPERVISOR', 'ADMIN'), getPropertiesBySlumAndParcel);
// Get household survey by slum, parcelId, and propertyNo
router.get('/household-surveys/by-parcel/:slumId/:parcelId/:propertyNo', auth, authorize('SURVEYOR'), getHouseholdSurveyByParcel);
// Import household data in bulk
router.post('/household-surveys/import', auth, authorize('ADMIN', 'SUPERVISOR'), importHouseholds);
// Get next available new parcel ID (N001, N002, etc.)
router.get('/household-surveys/next-new-parcel/:slumId', auth, authorize('SURVEYOR'), getNextNewParcelId);

// ===== ASSIGNMENT ROUTES =====
// Create new assignment
router.post('/assignments/assign-slum', auth, authorize('SUPERVISOR', 'ADMIN'), assignSlumToSurveyor);
// Get all assignments (admin/supervisor)
router.get('/assignments', auth, authorize('SUPERVISOR', 'ADMIN'), getAllAssignments);
// Get my assigned slums (surveyor) - MUST be before /:id route to avoid matching as ID
router.get('/assignments/my-assigned-slums', auth, getMyAssignments);
// Get assignments for specific surveyor (admin/supervisor) - MUST be before /:id route to avoid matching as ID
router.get('/assignments/surveyor/:userId', auth, authorize('SUPERVISOR', 'ADMIN'), getAssignmentsForSurveyor);
// Get specific assignment by ID - MUST be last
router.get('/assignments/:id', auth, getAssignmentById);
// Update assignment status (legacy route for backward compatibility)
router.put('/assignments/:id/status', auth, authorize('SUPERVISOR', 'ADMIN'), updateAssignmentStatus);
// Manual status update by Supervisor/Admin (new explicit status management)
router.put('/assignments/:id/manual-status', auth, authorize('SUPERVISOR', 'ADMIN'), updateAssignmentManualStatus);
// Update assignment (full update)
router.put('/assignments/:id', auth, authorize('SUPERVISOR', 'ADMIN'), updateAssignment);
// Delete assignment
router.delete('/assignments/:id', auth, authorize('SUPERVISOR', 'ADMIN'), deleteAssignment);

module.exports = router;