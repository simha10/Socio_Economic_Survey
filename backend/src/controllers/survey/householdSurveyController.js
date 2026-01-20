const HouseholdSurvey = require('../../models/HouseholdSurvey');
const Household = require('../../models/Household');
const { sendSuccess, sendError } = require('../../utils/helpers/responseHelper');
// Placeholder for old exports - will be removed after testing
const _exports = {};

/**
 * Create or initialize a household survey
 */
exports.createOrGetHouseholdSurvey = async (req, res) => {
  try {
    const { householdId } = req.params;
    const userId = req.user.id || req.user._id;

    // Check if household exists
    const household = await Household.findById(householdId);
    if (!household) {
      return sendError(res, 'Household not found', 404);
    }

    // Check if survey already exists
    let survey = await HouseholdSurvey.findOne({ household: householdId, surveyor: userId });

    if (!survey) {
      // Create new survey with default values
      survey = new HouseholdSurvey({
        household: householdId,
        surveyor: userId,
        surveyStatus: 'DRAFT',
      });
      await survey.save();
      console.log(`Created new household survey for household ${householdId}`);
    }

    await survey.populate([
      { path: 'household', select: 'headOfFamily memberCount address' },
      { path: 'surveyor', select: 'name email' },
    ]);

    sendSuccess(res, survey, 'Household survey retrieved/created successfully');
  } catch (error) {
    console.error('Error in createOrGetHouseholdSurvey:', error.message);
    sendError(res, error.message || 'Failed to create/get household survey', 500);
  }
};

/**
 * Get household survey by ID
 */
exports.getHouseholdSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await HouseholdSurvey.findById(surveyId).populate([
      { path: 'household', select: 'headOfFamily memberCount address' },
      { path: 'surveyor', select: 'name email' },
    ]);

    if (!survey) {
      return sendError(res, 'Survey not found', 404);
    }

    sendSuccess(res, survey, 'Survey retrieved successfully');
  } catch (error) {
    console.error('Error in getHouseholdSurvey:', error.message);
    sendError(res, error.message || 'Failed to get survey', 500);
  }
};

/**
 * Update household survey (partial update for form sections)
 */
exports.updateHouseholdSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const updateData = req.body;
    const userId = req.user.id || req.user._id;

    // Find survey
    const survey = await HouseholdSurvey.findById(surveyId);
    if (!survey) {
      return sendError(res, 'Survey not found', 404);
    }

    // Check authorization
    if (survey.surveyor.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
      return sendError(res, 'Not authorized to update this survey', 403);
    }

    // Update survey fields
    Object.assign(survey, updateData);
    survey.lastModifiedBy = userId;
    survey.lastModifiedAt = new Date();
    survey.surveyStatus = updateData.surveyStatus || survey.surveyStatus;

    await survey.save();
    await survey.populate([
      { path: 'household', select: 'headOfFamily memberCount address' },
      { path: 'surveyor', select: 'name email' },
    ]);

    console.log(`Updated household survey ${surveyId}`);
    sendSuccess(res, survey, 'Survey updated successfully');
  } catch (error) {
    console.error('Error in updateHouseholdSurvey:', error.message);
    sendError(res, error.message || 'Failed to update survey', 500);
  }
};

/**
 * Submit household survey (mark as SUBMITTED)
 */
exports.submitHouseholdSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.id || req.user._id;

    const survey = await HouseholdSurvey.findById(surveyId);
    if (!survey) {
      return sendError(res, 'Survey not found', 404);
    }

    // Check authorization
    if (survey.surveyor.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
      return sendError(res, 'Not authorized to submit this survey', 403);
    }

    survey.surveyStatus = 'SUBMITTED';
    survey.submittedBy = userId;
    survey.submittedAt = new Date();
    survey.lastModifiedBy = userId;
    survey.lastModifiedAt = new Date();

    await survey.save();
    await survey.populate([
      { path: 'household', select: 'headOfFamily memberCount address' },
      { path: 'surveyor', select: 'name email' },
    ]);

    console.log(`Submitted household survey ${surveyId}`);
    sendSuccess(res, survey, 'Survey submitted successfully', 200);
  } catch (error) {
    console.error('Error in submitHouseholdSurvey:', error.message);
    sendError(res, error.message || 'Failed to submit survey', 500);
  }
};

/**
 * Get survey by household ID (for a specific surveyor)
 */
exports.getHouseholdSurveyByHouseholdId = async (req, res) => {
  try {
    const { householdId } = req.params;
    const userId = req.user.id || req.user._id;

    const survey = await HouseholdSurvey.findOne({
      household: householdId,
      surveyor: userId,
    }).populate([
      { path: 'household', select: 'headOfFamily memberCount address' },
      { path: 'surveyor', select: 'name email' },
    ]);

    if (!survey) {
      return sendError(res, 'Survey not found for this household', 404);
    }

    sendSuccess(res, survey, 'Survey retrieved successfully');
  } catch (error) {
    console.error('Error in getHouseholdSurveyByHouseholdId:', error.message);
    sendError(res, error.message || 'Failed to get survey', 500);
  }
};

/**
 * Delete household survey (only for DRAFT status)
 */
exports.deleteHouseholdSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.id || req.user._id;

    const survey = await HouseholdSurvey.findById(surveyId);
    if (!survey) {
      return sendError(res, 'Survey not found', 404);
    }

    // Only allow deletion of DRAFT surveys
    if (survey.surveyStatus !== 'DRAFT') {
      return sendError(res, 'Can only delete DRAFT surveys', 400);
    }

    // Check authorization
    if (survey.surveyor.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
      return sendError(res, 'Not authorized to delete this survey', 403);
    }

    await HouseholdSurvey.findByIdAndDelete(surveyId);
    console.log(`Deleted household survey ${surveyId}`);
    sendSuccess(res, null, 'Survey deleted successfully');
  } catch (error) {
    console.error('Error in deleteHouseholdSurvey:', error.message);
    sendError(res, error.message || 'Failed to delete survey', 500);
  }
};

/**
 * Update specific survey section (for incremental saves)
 */
exports.updateSurveySection = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { section, data } = req.body;
    const userId = req.user.id || req.user._id;

    if (!section || !data) {
      return sendError(res, 'Section and data are required', 400);
    }

    const survey = await HouseholdSurvey.findById(surveyId);
    if (!survey) {
      return sendError(res, 'Survey not found', 404);
    }

    // Check authorization
    if (survey.surveyor.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
      return sendError(res, 'Not authorized to update this survey', 403);
    }

    // Update the specific section
    survey[section] = data;
    survey.surveyStatus = 'IN_PROGRESS';
    survey.lastModifiedBy = userId;
    survey.lastModifiedAt = new Date();

    await survey.save();
    await survey.populate([
      { path: 'household', select: 'headOfFamily memberCount address' },
      { path: 'surveyor', select: 'name email' },
    ]);

    console.log(`Updated survey section: ${section} for survey ${surveyId}`);
    sendSuccess(res, survey, `${section} updated successfully`);
  } catch (error) {
    console.error('Error in updateSurveySection:', error.message);
    sendError(res, error.message || 'Failed to update survey section', 500);
  }
};

/**
 * Get all surveys assigned to a surveyor
 */
exports.getSurveysSummary = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { status } = req.query;

    const query = { surveyor: userId };
    if (status) {
      query.surveyStatus = status;
    }

    const surveys = await HouseholdSurvey.find(query)
      .select('household surveyStatus createdAt submittedAt')
      .populate('household', 'headOfFamily memberCount address')
      .sort({ createdAt: -1 });

    const summary = {
      total: surveys.length,
      draft: surveys.filter(s => s.surveyStatus === 'DRAFT').length,
      inProgress: surveys.filter(s => s.surveyStatus === 'IN_PROGRESS').length,
      submitted: surveys.filter(s => s.surveyStatus === 'SUBMITTED').length,
      completed: surveys.filter(s => s.surveyStatus === 'COMPLETED').length,
      surveys: surveys
    };

    sendSuccess(res, summary, 'Surveys summary retrieved successfully');
  } catch (error) {
    console.error('Error in getSurveysSummary:', error.message);
    sendError(res, error.message || 'Failed to get surveys summary', 500);
  }
};