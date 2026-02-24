const HouseholdSurvey = require('../../models/HouseholdSurvey');
const Slum = require('../../models/Slum');
const { updateStatusesFromHouseholdSurvey, updateSlumPopulationFromHouseholdSurveys, updateSlumBplPopulationFromHouseholdSurveys, updateSlumDemographicPopulationFromHouseholdSurveys } = require('../../utils/statusSyncHelper');
const { sendSuccess, sendError } = require('../../utils/helpers/responseHelper');
const { v4: uuidv4 } = require('uuid');

// Import the sample data for bulk imports
const fs = require('fs');
const path = require('path');

// Placeholder for old exports - will be removed after testing
const _exports = {};

/**
 * Create or initialize a household survey
 */
exports.createOrGetHouseholdSurvey = async (req, res) => {
  try {
    const { slumId, houseDoorNo, parcelId, propertyNo } = req.body;
    const userId = req.user.id || req.user._id;

    if (!slumId) {
      return sendError(res, 'slumId is required', 400);
    }

    // Check if slum exists
    const slum = await Slum.findById(slumId);
    if (!slum) {
      return sendError(res, 'Slum not found', 404);
    }

    let survey;

    // Check if parcelId and propertyNo are provided (new workflow)
    if (parcelId !== undefined && propertyNo !== undefined) {
      // Check if survey already exists for this slum, parcelId and propertyNo
      survey = await HouseholdSurvey.findOne({ 
        slum: slumId, 
        parcelId: parseInt(parcelId),
        propertyNo: parseInt(propertyNo),
        surveyor: userId 
      });
    } else if (houseDoorNo) {
      // Check if survey already exists for this slum and house door number (legacy workflow)
      survey = await HouseholdSurvey.findOne({ 
        slum: slumId, 
        houseDoorNo: houseDoorNo,
        surveyor: userId 
      });
    }

    if (!survey) {
      // Check if there's an imported record for this parcel/property combination
      if (parcelId !== undefined && propertyNo !== undefined) {
        const importedRecord = await HouseholdSurvey.findOne({ 
          slum: slumId, 
          parcelId: parseInt(parcelId),
          propertyNo: parseInt(propertyNo)
        });
        
        if (importedRecord) {
          // Use the imported record if it exists (copy its prefilled data)
          survey = new HouseholdSurvey({
            slum: slumId,
            householdId: uuidv4(),
            houseDoorNo: `${parseInt(parcelId)}-${parseInt(propertyNo)}`, // Generate houseDoorNo from parcel and property
            parcelId: parseInt(parcelId),
            propertyNo: parseInt(propertyNo),
            source: 'CREATED', // New record created from imported data
            surveyor: userId,
            surveyStatus: 'DRAFT',
            // Copy prefilled data from imported record
            headName: importedRecord.headName,
            fatherName: importedRecord.fatherName,
            landTenureStatus: importedRecord.landTenureStatus,
            houseStructure: importedRecord.houseStructure
          });
        } else {
          // Create new survey with auto-generated householdId and parcel info
          survey = new HouseholdSurvey({
            slum: slumId,
            householdId: uuidv4(),
            houseDoorNo: `${parseInt(parcelId)}-${parseInt(propertyNo)}`, // Generate houseDoorNo from parcel and property
            parcelId: parseInt(parcelId),
            propertyNo: parseInt(propertyNo),
            source: 'CREATED',
            surveyor: userId,
            surveyStatus: 'DRAFT',
          });
        }
      } else if (houseDoorNo) {
        // Legacy workflow - create survey with houseDoorNo only
        survey = new HouseholdSurvey({
          slum: slumId,
          householdId: uuidv4(),
          houseDoorNo: houseDoorNo,
          surveyor: userId,
          surveyStatus: 'DRAFT',
        });
      } else {
        return sendError(res, 'Either houseDoorNo or both parcelId and propertyNo must be provided', 400);
      }
      
      await survey.save();
    }

    await survey.populate([
      { path: 'slum', select: 'slumName location ward' },
      { path: 'surveyor', select: 'name email' },
    ]);

    // Update slum population calculation after creating/retrieving survey
    await updateSlumPopulationFromHouseholdSurveys(survey.slum._id);
    
    // Update BPL population calculation after creating/retrieving survey
    await updateSlumBplPopulationFromHouseholdSurveys(survey.slum._id);
    await updateSlumDemographicPopulationFromHouseholdSurveys(survey.slum._id);

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

    // Check authorization for supervisors (allow them to view any survey)
    if (req.user.role === 'SUPERVISOR') {
      // Supervisors can view all surveys for HHQC purposes
    } else if (req.user.role === 'SURVEYOR') {
      // Surveyors can only view their own surveys
      if (survey.surveyor.toString() !== req.user.id.toString()) {
        return sendError(res, 'Not authorized to view this survey', 403);
      }
    }
    // Admins can view all surveys by default

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

    // Check authorization - allow original surveyor, admins, and supervisors
    if (survey.surveyor.toString() !== userId.toString() && 
        req.user.role !== 'ADMIN' && 
        req.user.role !== 'SUPERVISOR') {
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
    
    // Auto-calculation is now handled in the frontend. Backend will accept whatever values are sent.
    
    Object.assign(survey, sanitizedUpdateData);
    survey.lastModifiedBy = userId;
    survey.lastModifiedAt = new Date();
    survey.surveyStatus = updateData.surveyStatus || survey.surveyStatus;

    await survey.save();
    await survey.populate([
      { path: 'slum', select: 'slumName village ward' },
      { path: 'surveyor', select: 'name email' },
    ]);

    // Update slum population if family members count changed
    if (updateData.familyMembersTotal !== undefined || 
        updateData.familyMembersMale !== undefined || 
        updateData.familyMembersFemale !== undefined) {
      await updateSlumPopulationFromHouseholdSurveys(survey.slum._id);
    }
    
    // Update BPL population if BPL status or family members count changed
    if (updateData.belowPovertyLine !== undefined || 
        updateData.familyMembersTotal !== undefined || 
        updateData.familyMembersMale !== undefined || 
        updateData.familyMembersFemale !== undefined) {
      await updateSlumBplPopulationFromHouseholdSurveys(survey.slum._id);
      await updateSlumDemographicPopulationFromHouseholdSurveys(survey.slum._id);
    }
    
    // Update demographic population if caste or minority status changed
    if (updateData.caste !== undefined || updateData.minorityStatus !== undefined || 
        updateData.familyMembersTotal !== undefined || 
        updateData.familyMembersMale !== undefined || 
        updateData.familyMembersFemale !== undefined) {
      await updateSlumDemographicPopulationFromHouseholdSurveys(survey.slum._id);
    }

    
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
    
    // Auto-calculation is now handled in the frontend. Backend will accept whatever values are sent.
    

    
    // Try assignment with error handling
    try {
      Object.assign(survey, sanitizedData);
      
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
      await survey.save();
    } catch (saveError) {
      console.error('Error during survey.save():', saveError.message);
      throw saveError;
    }
    
    await survey.populate([
      { path: 'slum', select: 'slumName location ward' },
      { path: 'surveyor', select: 'name email' },
    ]);

    // Update related statuses after successful submission
    await updateStatusesFromHouseholdSurvey(surveyId);
    
    // Update slum population based on family members count
    await updateSlumPopulationFromHouseholdSurveys(survey.slum._id);
    
    // Update BPL population based on BPL status and family members count
    await updateSlumBplPopulationFromHouseholdSurveys(survey.slum._id);
    
    // Update demographic population based on caste and minority status
    await updateSlumDemographicPopulationFromHouseholdSurveys(survey.slum._id);


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

    // Save slum reference before deletion
    const slumId = survey.slum;
    
    await HouseholdSurvey.findByIdAndDelete(surveyId);

    
    // Update slum population calculation after deletion
    if (slumId) {
      await updateSlumPopulationFromHouseholdSurveys(slumId);
      await updateSlumBplPopulationFromHouseholdSurveys(slumId);
      await updateSlumDemographicPopulationFromHouseholdSurveys(slumId);
    }
    
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

    // Update slum population if family members section was updated
    if (section === 'demographics' || section === 'familyMembersTotal' || 
        section === 'familyMembersMale' || section === 'familyMembersFemale') {
      await updateSlumPopulationFromHouseholdSurveys(survey.slum._id);
    }
    
    // Update BPL population if BPL status or family members section was updated
    if (section === 'demographics' || section === 'belowPovertyLine' || 
        section === 'familyMembersTotal' || section === 'familyMembersMale' || 
        section === 'familyMembersFemale') {
      await updateSlumBplPopulationFromHouseholdSurveys(survey.slum._id);
    }
    
    // Update demographic population if caste, minority status, or family members section was updated
    if (section === 'demographics' || section === 'caste' || section === 'minorityStatus' || 
        section === 'familyMembersTotal' || section === 'familyMembersMale' || 
        section === 'familyMembersFemale') {
      await updateSlumDemographicPopulationFromHouseholdSurveys(survey.slum._id);
    }


    sendSuccess(res, survey, `${section} updated successfully`);
  } catch (error) {
    console.error('Error in updateSurveySection:', error.message);
    sendError(res, error.message || 'Failed to update survey section', 500);
  }
};

/**
 * Get all household surveys for a specific slum
 */
exports.getHouseholdSurveysBySlum = async (req, res) => {
  try {
    const { slumId } = req.params;
    const { status } = req.query;

    let query = { slum: slumId };
    if (status) {
      query.surveyStatus = status;
    }

    const surveys = await HouseholdSurvey.find(query)
      .populate([
        { path: 'slum', select: 'slumName location ward' },
        { path: 'surveyor', select: 'name email' },
      ])
      .sort({ createdAt: -1 });

    sendSuccess(res, surveys, 'Household surveys retrieved successfully');
  } catch (error) {
    console.error('Error in getHouseholdSurveysBySlum:', error.message);
    sendError(res, error.message || 'Failed to get household surveys', 500);
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

/**
 * Get all distinct parcelIds for a given slum
 */
exports.getParcelsBySlum = async (req, res) => {
  try {
    const { slumId } = req.params;

    if (!slumId) {
      return sendError(res, 'slumId is required', 400);
    }

    // Find all distinct parcelIds for the given slum
    const parcels = await HouseholdSurvey.distinct('parcelId', { 
      slum: slumId, 
      parcelId: { $exists: true, $ne: null } 
    });

    // Filter out undefined/null values and sort numerically
    const validParcels = parcels.filter(p => p !== undefined && p !== null).sort((a, b) => a - b);

    sendSuccess(res, validParcels, 'Parcel IDs retrieved successfully');
  } catch (error) {
    console.error('Error in getParcelsBySlum:', error.message);
    sendError(res, error.message || 'Failed to get parcels', 500);
  }
};

/**
 * Get all propertyNos for a given slum and parcelId
 */
exports.getPropertiesBySlumAndParcel = async (req, res) => {
  try {
    const { slumId, parcelId } = req.params;

    if (!slumId || !parcelId) {
      return sendError(res, 'slumId and parcelId are required', 400);
    }

    // Find all propertyNos for the given slum and parcelId
    const properties = await HouseholdSurvey.distinct('propertyNo', { 
      slum: slumId, 
      parcelId: parseInt(parcelId),
      propertyNo: { $exists: true, $ne: null } 
    });

    // Filter out undefined/null values and sort numerically
    const validProperties = properties.filter(p => p !== undefined && p !== null).sort((a, b) => a - b);

    sendSuccess(res, validProperties, 'Property numbers retrieved successfully');
  } catch (error) {
    console.error('Error in getPropertiesBySlumAndParcel:', error.message);
    sendError(res, error.message || 'Failed to get properties', 500);
  }
};

/**
 * Get household survey by slum, parcelId, and propertyNo
 */
exports.getHouseholdSurveyByParcel = async (req, res) => {
  try {
    const { slumId, parcelId, propertyNo } = req.params;
    const userId = req.user.id || req.user._id;

    if (!slumId || !parcelId || !propertyNo) {
      return sendError(res, 'slumId, parcelId, and propertyNo are required', 400);
    }

    // Find the household survey by slum, parcel, and property
    // For imported surveys, the surveyor might be null initially
    // Allow access to current user's surveys, or to admins/supervisors who can view all
    const userRole = req.user.role;
    let queryConditions = {
      slum: slumId,
      parcelId: parseInt(parcelId),
      propertyNo: parseInt(propertyNo),
    };
    
    // If user is not admin/supervisor, restrict to their own surveys
    if (!['ADMIN', 'SUPERVISOR'].includes(userRole)) {
      queryConditions.$or = [
        { surveyor: userId },  // Surveys assigned to current user
        { surveyor: null }     // Unassigned imported surveys
      ];
    }
    
    const survey = await HouseholdSurvey.findOne(queryConditions).populate([
      { path: 'slum', select: 'slumName location ward' },
      { path: 'surveyor', select: 'name email' },
    ]);

    if (!survey) {
      return sendError(res, 'Survey not found for this slum and parcel/property combination', 404);
    }

    sendSuccess(res, survey, 'Survey retrieved successfully');
  } catch (error) {
    console.error('Error in getHouseholdSurveyByParcel:', error.message);
    sendError(res, error.message || 'Failed to get survey', 500);
  }
};

/**
 * Get the next available New Parcel ID (N001, N002, etc.) for a slum
 */
exports.getNextNewParcelId = async (req, res) => {
  try {
    const { slumId } = req.params;

    if (!slumId) {
      return sendError(res, 'slumId is required', 400);
    }

    // Find all household surveys for this slum with parcelId starting with 'N'
    const existingNewParcels = await HouseholdSurvey.find({
      slum: slumId,
      parcelId: { $exists: true, $ne: null }
    }).select('parcelId');

    // Extract numeric parts from parcel IDs that start with 'N'
    const usedNumbers = existingNewParcels
      .map(hs => {
        if (typeof hs.parcelId === 'string' && hs.parcelId.startsWith('N')) {
          const numPart = hs.parcelId.substring(1);
          return parseInt(numPart, 10);
        }
        return null;
      })
      .filter(num => num !== null && !isNaN(num))
      .sort((a, b) => a - b);

    // Find the next available number
    let nextNumber = 1;
    if (usedNumbers.length > 0) {
      // Check for gaps in the sequence
      for (let i = 0; i < usedNumbers.length; i++) {
        if (usedNumbers[i] > nextNumber) {
          break;
        }
        if (usedNumbers[i] === nextNumber) {
          nextNumber++;
        }
      }
    }

    const nextParcelId = `N${nextNumber.toString().padStart(3, '0')}`;
    
    sendSuccess(res, { nextParcelId }, 'Next new parcel ID retrieved successfully');
  } catch (error) {
    console.error('Error in getNextNewParcelId:', error.message);
    sendError(res, error.message || 'Failed to get next new parcel ID', 500);
  }
};

/**
 * Bulk import household data from external dataset
 */
exports.importHouseholds = async (req, res) => {
  try {
    const { data, slumId } = req.body;

    if (!data || !Array.isArray(data)) {
      return sendError(res, 'Data array is required', 400);
    }

    if (!slumId) {
      return sendError(res, 'slumId is required', 400);
    }

    // Validate slum exists
    const slum = await Slum.findById(slumId);
    if (!slum) {
      return sendError(res, 'Slum not found', 404);
    }

    // Validate and sanitize input data
    const validatedData = [];
    for (const item of data) {
      if (
        item.parcelId === undefined || 
        item.propertyNo === undefined ||
        item.headName === undefined
      ) {
        continue; // Skip invalid records
      }

      validatedData.push({
        slum: slumId,
        householdId: uuidv4(), // Generate new householdId for imported records
        houseDoorNo: `${item.parcelId}-${item.propertyNo}`,
        parcelId: parseInt(item.parcelId),
        propertyNo: parseInt(item.propertyNo),
        source: 'IMPORTED',
        surveyStatus: 'DRAFT', // Imported records start as draft
        // Prefill data from import
        headName: item.headName || '',
        fatherName: item.fatherName || '',
        landTenureStatus: item.landTenureStatus || '',
        houseStructure: item.houseStructure || ''
      });
    }

    if (validatedData.length === 0) {
      return sendError(res, 'No valid records to import', 400);
    }

    // Use bulkWrite for efficient insertion with upsert to avoid duplicates
    const bulkOps = validatedData.map(record => ({
      updateOne: {
        filter: {
          slum: record.slum,
          parcelId: record.parcelId,
          propertyNo: record.propertyNo
        },
        update: record,
        upsert: true
      }
    }));

    const result = await HouseholdSurvey.bulkWrite(bulkOps);



    sendSuccess(res, {
      imported: result.upsertedCount || 0,
      updated: result.modifiedCount || 0,
      totalProcessed: validatedData.length
    }, 'Households imported successfully');

  } catch (error) {
    console.error('Error in importHouseholds:', error.message);
    sendError(res, error.message || 'Failed to import households', 500);
  }
};