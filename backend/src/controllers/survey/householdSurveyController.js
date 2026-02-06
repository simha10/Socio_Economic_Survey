const HouseholdSurvey = require('../../models/HouseholdSurvey');
const Slum = require('../../models/Slum');
const { updateStatusesFromHouseholdSurvey } = require('../../utils/statusSyncHelper');
const { sendSuccess, sendError } = require('../../utils/helpers/responseHelper');
const { v4: uuidv4 } = require('uuid');

// Placeholder for old exports - will be removed after testing
const _exports = {};

/**
 * Create or initialize a household survey
 */
exports.createOrGetHouseholdSurvey = async (req, res) => {
  try {
    const { slumId, houseDoorNo } = req.body;
    const userId = req.user.id || req.user._id;

    if (!slumId || !houseDoorNo) {
      return sendError(res, 'slumId and houseDoorNo are required', 400);
    }

    // Check if slum exists
    const slum = await Slum.findById(slumId);
    if (!slum) {
      return sendError(res, 'Slum not found', 404);
    }

    // Check if survey already exists for this slum and house door number
    let survey = await HouseholdSurvey.findOne({ 
      slum: slumId, 
      houseDoorNo: houseDoorNo,
      surveyor: userId 
    });

    if (!survey) {
      // Create new survey with auto-generated householdId
      const householdId = uuidv4();
      survey = new HouseholdSurvey({
        slum: slumId,
        householdId: householdId,
        houseDoorNo: houseDoorNo,
        surveyor: userId,
        surveyStatus: 'DRAFT',
      });
      await survey.save();
      console.log(`Created new household survey for slum ${slumId}, house ${houseDoorNo}`);
    }

    await survey.populate([
      { path: 'slum', select: 'slumName location ward' },
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
      { path: 'slum', select: 'slumName village ward' },
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

    // Update survey fields directly (flat structure)
    // Ensure numeric fields have proper values
    const sanitizedUpdateData = { ...updateData };
    
    // Sanitize numeric fields
    const numericFields = [
      'familyMembersMale', 'familyMembersFemale', 'familyMembersTotal',
      'illiterateAdultMale', 'illiterateAdultFemale', 'illiterateAdultTotal',
      'childrenNotAttendingMale', 'childrenNotAttendingFemale', 'childrenNotAttendingTotal',
      'handicappedPhysically', 'handicappedMentally', 'handicappedTotal',
      'earningAdultMale', 'earningAdultFemale', 'earningAdultTotal',
      'earningNonAdultMale', 'earningNonAdultFemale', 'earningNonAdultTotal',
      'monthlyIncome', 'monthlyExpenditure', 'debtOutstanding'
    ];
    
    numericFields.forEach(field => {
      if (sanitizedUpdateData[field] === undefined || sanitizedUpdateData[field] === null || sanitizedUpdateData[field] === '') {
        sanitizedUpdateData[field] = 0;
      } else if (typeof sanitizedUpdateData[field] === 'string') {
        sanitizedUpdateData[field] = parseInt(sanitizedUpdateData[field]) || 0;
      }
    });
    
    Object.assign(survey, sanitizedUpdateData);
    survey.lastModifiedBy = userId;
    survey.lastModifiedAt = new Date();
    survey.surveyStatus = updateData.surveyStatus || survey.surveyStatus;

    await survey.save();
    await survey.populate([
      { path: 'slum', select: 'slumName village ward' },
      { path: 'surveyor', select: 'name email' },
    ]);

    console.log(`Updated household survey ${surveyId}`);
    sendSuccess(res, survey, 'Survey updated successfully');
  } catch (error) {
    console.error('Error in updateHouseholdSurvey:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return sendError(res, 'Validation failed', 400, { validationErrors: errors });
    }
    
    // Handle enum validation errors
    if (error.message && error.message.includes('`enum`')) {
      return sendError(res, `Invalid value provided: ${error.message}`, 400);
    }
    
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

    // Log incoming data for debugging
    console.log('Incoming form data:', JSON.stringify(req.body, null, 2));
    
    // Update survey with form data directly (flat structure)
    // Ensure numeric fields have proper values
    // Exclude system fields that shouldn't be overwritten
    const { householdId, houseDoorNo, slum, surveyor, ...formData } = req.body;
    const sanitizedData = { ...formData };
    
    // Sanitize numeric fields
    const numericFields = [
      'familyMembersMale', 'familyMembersFemale', 'familyMembersTotal',
      'illiterateAdultMale', 'illiterateAdultFemale', 'illiterateAdultTotal',
      'childrenNotAttendingMale', 'childrenNotAttendingFemale', 'childrenNotAttendingTotal',
      'handicappedPhysically', 'handicappedMentally', 'handicappedTotal',
      'earningAdultMale', 'earningAdultFemale', 'earningAdultTotal',
      'earningNonAdultMale', 'earningNonAdultFemale', 'earningNonAdultTotal',
      'monthlyIncome', 'monthlyExpenditure', 'debtOutstanding'
    ];
    
    numericFields.forEach(field => {
      if (sanitizedData[field] === undefined || sanitizedData[field] === null || sanitizedData[field] === '') {
        sanitizedData[field] = 0;
      } else if (typeof sanitizedData[field] === 'string') {
        sanitizedData[field] = parseInt(sanitizedData[field]) || 0;
      }
    });
    
    console.log('Sanitized data:', JSON.stringify(sanitizedData, null, 2));
    console.log('Excluded fields:', { 
      householdId: !!req.body.householdId, 
      houseDoorNo: !!req.body.houseDoorNo, 
      slum: !!req.body.slum, 
      surveyor: !!req.body.surveyor 
    });
    
    // Try assignment with error handling
    try {
      Object.assign(survey, sanitizedData);
      console.log('Assignment successful');
    } catch (assignError) {
      console.error('Error during Object.assign:', assignError);
      console.error('Survey object:', survey);
      console.error('Sanitized data:', sanitizedData);
      throw assignError;
    }
    
    survey.surveyStatus = 'SUBMITTED';
    survey.submittedBy = userId;
    survey.submittedAt = new Date();
    survey.lastModifiedBy = userId;
    survey.lastModifiedAt = new Date();

    // Try save with error handling
    try {
      console.log('Attempting to save survey...');
      await survey.save();
      console.log('Survey saved successfully');
    } catch (saveError) {
      console.error('Error during survey.save():', saveError);
      console.error('Survey object before save:', JSON.stringify(survey.toObject(), null, 2));
      throw saveError;
    }
    
    await survey.populate([
      { path: 'slum', select: 'slumName location ward' },
      { path: 'surveyor', select: 'name email' },
    ]);

    // Update related statuses after successful submission
    await updateStatusesFromHouseholdSurvey(surveyId);

    console.log(`Submitted household survey ${surveyId}`);
    sendSuccess(res, survey, 'Survey submitted successfully', 200);
  } catch (error) {
    console.error('Error in submitHouseholdSurvey:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return sendError(res, 'Validation failed', 400, { validationErrors: errors });
    }
    
    // Handle enum validation errors
    if (error.message && error.message.includes('`enum`')) {
      return sendError(res, `Invalid value provided: ${error.message}`, 400);
    }
    
    sendError(res, error.message || 'Failed to submit survey', 500);
  }
};

/**
 * Get survey by slum and houseDoorNo (for a specific surveyor)
 */
exports.getHouseholdSurveyByHouseholdId = async (req, res) => {
  try {
    const { slumId, houseDoorNo } = req.params;
    const userId = req.user.id || req.user._id;

    const survey = await HouseholdSurvey.findOne({
      slum: slumId,
      houseDoorNo: houseDoorNo,
      surveyor: userId,
    }).populate([
      { path: 'slum', select: 'slumName location ward' },
      { path: 'surveyor', select: 'name email' },
    ]);

    if (!survey) {
      return sendError(res, 'Survey not found for this slum and house', 404);
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
    
    console.log(`Updating section: ${section}`);
    console.log('Data received:', JSON.stringify(data, null, 2));
    console.log('Survey section exists:', !!survey[section]);

    // Check authorization
    if (survey.surveyor.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
      return sendError(res, 'Not authorized to update this survey', 403);
    }

    // Update the specific section
    // Since data here is already structured for the specific section, we can assign directly
    if (survey[section]) {
      // If section exists, merge the data
      Object.assign(survey[section], data);
    } else {
      // If section doesn't exist, create it
      // Ensure we're not trying to set properties on undefined
      if (typeof data === 'object' && data !== null) {
        survey[section] = { ...data };
      } else {
        survey[section] = data;
      }
    }
    survey.surveyStatus = 'IN PROGRESS';
    survey.lastModifiedBy = userId;
    survey.lastModifiedAt = new Date();

    await survey.save();
    await survey.populate([
      { path: 'slum', select: 'slumName location ward' },
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
      .select('slum houseDoorNo householdId surveyStatus createdAt submittedAt')
      .populate('slum', 'slumName location ward')
      .sort({ createdAt: -1 });

    const summary = {
      total: surveys.length,
      draft: surveys.filter(s => s.surveyStatus === 'DRAFT').length,
      inProgress: surveys.filter(s => s.surveyStatus === 'IN PROGRESS').length,
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