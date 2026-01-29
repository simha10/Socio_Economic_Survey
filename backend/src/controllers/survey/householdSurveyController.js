const HouseholdSurvey = require('../../models/HouseholdSurvey');
const Household = require('../../models/Household');
const { sendSuccess, sendError } = require('../../utils/helpers/responseHelper');

// Helper function to transform flat form data to nested structure expected by model
function transformFormData(formData) {
  const transformed = {};
  
  // Map flat form fields to nested structure
  if (formData.slumName !== undefined) {
    if (!transformed.generalInformation) transformed.generalInformation = {};
    transformed.generalInformation.slumName = formData.slumName;
  }
  if (formData.locationWard !== undefined) {
    if (!transformed.generalInformation) transformed.generalInformation = {};
    transformed.generalInformation.locationWardNo = formData.locationWard;
  }
  if (formData.houseDoorNo !== undefined) {
    if (!transformed.generalInformation) transformed.generalInformation = {};
    transformed.generalInformation.houseNo = formData.houseDoorNo;
  }
  if (formData.dateOfSurvey !== undefined) {
    if (!transformed.generalInformation) transformed.generalInformation = {};
    transformed.generalInformation.dateOfSurvey = formData.dateOfSurvey;
  }
  
  // Map head of family information
  if (formData.headName !== undefined) {
    if (!transformed.headOfFamily) transformed.headOfFamily = {};
    transformed.headOfFamily.name = formData.headName;
  }
  if (formData.fatherName !== undefined) {
    if (!transformed.headOfFamily) transformed.headOfFamily = {};
    transformed.headOfFamily.fatherName = formData.fatherName;
  }
  if (formData.sex !== undefined) {
    if (!transformed.headOfFamily) transformed.headOfFamily = {};
    transformed.headOfFamily.sex = formData.sex;
  }
  if (formData.caste !== undefined) {
    if (!transformed.headOfFamily) transformed.headOfFamily = {};
    transformed.headOfFamily.caste = formData.caste;
  }
  if (formData.religion !== undefined) {
    if (!transformed.headOfFamily) transformed.headOfFamily = {};
    transformed.headOfFamily.religion = formData.religion;
  }
  if (formData.minorityStatus !== undefined) {
    if (!transformed.headOfFamily) transformed.headOfFamily = {};
    transformed.headOfFamily.minorityStatus = formData.minorityStatus;
  }
  if (formData.femaleHeadStatus !== undefined) {
    if (!transformed.headOfFamily) transformed.headOfFamily = {};
    transformed.headOfFamily.femaleHeadStatus = formData.femaleHeadStatus;
  }
  if (formData.maleHeadStatus !== undefined) {
    if (!transformed.headOfFamily) transformed.headOfFamily = {};
    transformed.headOfFamily.maleHeadStatus = formData.maleHeadStatus;
  }
  
  // Map family composition
  if (formData.familyMembersMale !== undefined || formData.familyMembersFemale !== undefined || formData.familyMembersTotal !== undefined) {
    if (!transformed.familyComposition) transformed.familyComposition = {};
    if (formData.familyMembersMale !== undefined) transformed.familyComposition.totalFamilyMembers = transformed.familyComposition.totalFamilyMembers || {};
    if (formData.familyMembersMale !== undefined) transformed.familyComposition.totalFamilyMembers.male = formData.familyMembersMale;
    if (formData.familyMembersFemale !== undefined) transformed.familyComposition.totalFamilyMembers.female = formData.familyMembersFemale;
    if (formData.familyMembersTotal !== undefined) transformed.familyComposition.totalFamilyMembers.total = formData.familyMembersTotal;
  }
  if (formData.illiterateAdultMale !== undefined || formData.illiterateAdultFemale !== undefined || formData.illiterateAdultTotal !== undefined) {
    if (!transformed.familyComposition) transformed.familyComposition = {};
    if (formData.illiterateAdultMale !== undefined) transformed.familyComposition.illiterateAdults = transformed.familyComposition.illiterateAdults || {};
    if (formData.illiterateAdultMale !== undefined) transformed.familyComposition.illiterateAdults.male = formData.illiterateAdultMale;
    if (formData.illiterateAdultFemale !== undefined) transformed.familyComposition.illiterateAdults.female = formData.illiterateAdultFemale;
    if (formData.illiterateAdultTotal !== undefined) transformed.familyComposition.illiterateAdults.total = formData.illiterateAdultTotal;
  }
  if (formData.childrenNotAttendingMale !== undefined || formData.childrenNotAttendingFemale !== undefined || formData.childrenNotAttendingTotal !== undefined) {
    if (!transformed.familyComposition) transformed.familyComposition = {};
    if (formData.childrenNotAttendingMale !== undefined) transformed.familyComposition.childrenNotInSchool = transformed.familyComposition.childrenNotInSchool || {};
    if (formData.childrenNotAttendingMale !== undefined) transformed.familyComposition.childrenNotInSchool.male = formData.childrenNotAttendingMale;
    if (formData.childrenNotAttendingFemale !== undefined) transformed.familyComposition.childrenNotInSchool.female = formData.childrenNotAttendingFemale;
    if (formData.childrenNotAttendingTotal !== undefined) transformed.familyComposition.childrenNotInSchool.total = formData.childrenNotAttendingTotal;
  }
  if (formData.handicappedMale !== undefined || formData.handicappedFemale !== undefined || formData.handicappedTotal !== undefined) {
    if (!transformed.familyComposition) transformed.familyComposition = {};
    if (formData.handicappedMale !== undefined) transformed.familyComposition.handicappedPersons = transformed.familyComposition.handicappedPersons || {};
    if (formData.handicappedMale !== undefined) transformed.familyComposition.handicappedPersons.male = formData.handicappedMale;
    if (formData.handicappedFemale !== undefined) transformed.familyComposition.handicappedPersons.female = formData.handicappedFemale;
    if (formData.handicappedTotal !== undefined) transformed.familyComposition.handicappedPersons.total = formData.handicappedTotal;
  }
  
  // Map housing and infrastructure
  if (formData.typeOfStructure !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.typeOfStructure = formData.typeOfStructure;
  }
  if (formData.wallMaterial !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.wallMaterial = formData.wallMaterial;
  }
  if (formData.roofMaterial !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.roofMaterial = formData.roofMaterial;
  }
  if (formData.floorMaterial !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.floorMaterial = formData.floorMaterial;
  }
  if (formData.houseArea !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.houseArea = formData.houseArea;
  }
  if (formData.noOfRooms !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.numberOfRooms = formData.noOfRooms;
  }
  if (formData.houseOwnership !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.ownershipStatus = formData.houseOwnership;
  }
  if (formData.houseCondition !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.condition = formData.houseCondition;
  }
  if (formData.puccaHouse !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.isPuccaStructure = formData.puccaHouse;
  }
  if (formData.separateKitchen !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.hasSeparateKitchen = formData.separateKitchen;
  }
  if (formData.cookingFuel !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.cookingFuel = formData.cookingFuel;
  }
  if (formData.cookingLocation !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.cookingLocation = formData.cookingLocation;
  }
  if (formData.toiletType !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.toiletType = formData.toiletType;
  }
  if (formData.toiletLocation !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.toiletLocation = formData.toiletLocation;
  }
  if (formData.waterSource !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.waterSource = formData.waterSource;
  }
  if (formData.waterSupplyDuration !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.waterSupplyDuration = formData.waterSupplyDuration;
  }
  if (formData.waterSourceDistance !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.distanceToWaterSource = formData.waterSourceDistance;
  }
  if (formData.electricityConnection !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.hasElectricity = formData.electricityConnection;
  }
  if (formData.lightingSource !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.lightingSource = formData.lightingSource;
  }
  if (formData.drainageType !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.drainageType = formData.drainageType;
  }
  if (formData.roadType !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.roadType = formData.roadType;
  }
  if (formData.wasteDisposal !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.wasteDisposalMethod = formData.wasteDisposal;
  }
  if (formData.wasteCollectionFrequency !== undefined) {
    if (!transformed.housingInfrastructure) transformed.housingInfrastructure = {};
    transformed.housingInfrastructure.wasteCollectionFrequency = formData.wasteCollectionFrequency;
  }
  
  // Map income and expenditure
  if (formData.earningAdultMale !== undefined || formData.earningAdultFemale !== undefined || formData.earningAdultTotal !== undefined) {
    if (!transformed.incomeExpenditure) transformed.incomeExpenditure = {};
    if (formData.earningAdultMale !== undefined) transformed.incomeExpenditure.earningMembers = transformed.incomeExpenditure.earningMembers || {};
    if (formData.earningAdultMale !== undefined) transformed.incomeExpenditure.earningMembers.male = formData.earningAdultMale;
    if (formData.earningAdultFemale !== undefined) transformed.incomeExpenditure.earningMembers.female = formData.earningAdultFemale;
    if (formData.earningAdultTotal !== undefined) transformed.incomeExpenditure.earningMembers.total = formData.earningAdultTotal;
  }
  if (formData.mainSourceOfIncome !== undefined) {
    if (!transformed.incomeExpenditure) transformed.incomeExpenditure = {};
    transformed.incomeExpenditure.mainSourceOfIncome = formData.mainSourceOfIncome;
  }
  if (formData.secondarySourceOfIncome !== undefined) {
    if (!transformed.incomeExpenditure) transformed.incomeExpenditure = {};
    transformed.incomeExpenditure.secondarySourceOfIncome = formData.secondarySourceOfIncome;
  }
  if (formData.monthlyIncome !== undefined) {
    if (!transformed.incomeExpenditure) transformed.incomeExpenditure = {};
    transformed.incomeExpenditure.monthlyIncome = formData.monthlyIncome;
  }
  if (formData.monthlyExpenditure !== undefined) {
    if (!transformed.incomeExpenditure) transformed.incomeExpenditure = {};
    transformed.incomeExpenditure.monthlyExpenditure = formData.monthlyExpenditure;
  }
  if (formData.debtOutstanding !== undefined) {
    if (!transformed.incomeExpenditure) transformed.incomeExpenditure = {};
    transformed.incomeExpenditure.debtOutstanding = formData.debtOutstanding;
  }
  if (formData.debtReason !== undefined) {
    if (!transformed.incomeExpenditure) transformed.incomeExpenditure = {};
    transformed.incomeExpenditure.debtReason = formData.debtReason;
  }
  if (formData.hasSavings !== undefined) {
    if (!transformed.incomeExpenditure) transformed.incomeExpenditure = {};
    transformed.incomeExpenditure.hasSavings = formData.hasSavings;
  }
  if (formData.savingsAmount !== undefined) {
    if (!transformed.incomeExpenditure) transformed.incomeExpenditure = {};
    transformed.incomeExpenditure.savingsAmount = formData.savingsAmount;
  }
  
  // Map assets
  if (formData.consumerDurables !== undefined) {
    if (!transformed.assets) transformed.assets = {};
    transformed.assets.consumerDurables = formData.consumerDurables;
  }
  if (formData.livestock !== undefined) {
    if (!transformed.assets) transformed.assets = {};
    transformed.assets.livestock = formData.livestock;
  }
  if (formData.landOwnership !== undefined) {
    if (!transformed.assets) transformed.assets = {};
    transformed.assets.landOwnership = formData.landOwnership;
  }
  if (formData.landArea !== undefined) {
    if (!transformed.assets) transformed.assets = {};
    transformed.assets.landArea = formData.landArea;
  }
  if (formData.vehicleOwnership !== undefined) {
    if (!transformed.assets) transformed.assets = {};
    transformed.assets.vehicleOwnership = formData.vehicleOwnership;
  }
  
  // Copy over any other fields that don't need transformation
  Object.keys(formData).forEach(key => {
    if (![
      'slumName', 'locationWard', 'houseDoorNo', 'dateOfSurvey',
      'headName', 'fatherName', 'sex', 'caste', 'religion', 'minorityStatus', 'femaleHeadStatus', 'maleHeadStatus',
      'familyMembersMale', 'familyMembersFemale', 'familyMembersTotal',
      'illiterateAdultMale', 'illiterateAdultFemale', 'illiterateAdultTotal',
      'childrenNotAttendingMale', 'childrenNotAttendingFemale', 'childrenNotAttendingTotal',
      'handicappedMale', 'handicappedFemale', 'handicappedTotal',
      'typeOfStructure', 'wallMaterial', 'roofMaterial', 'floorMaterial', 'houseArea', 'noOfRooms',
      'houseOwnership', 'houseCondition', 'puccaHouse', 'separateKitchen', 'cookingFuel', 'cookingLocation',
      'toiletType', 'toiletLocation', 'waterSource', 'waterSupplyDuration', 'waterSourceDistance',
      'electricityConnection', 'lightingSource', 'drainageType', 'roadType', 'wasteDisposal', 'wasteCollectionFrequency',
      'earningAdultMale', 'earningAdultFemale', 'earningAdultTotal',
      'mainSourceOfIncome', 'secondarySourceOfIncome', 'monthlyIncome', 'monthlyExpenditure', 'debtOutstanding', 'debtReason', 'hasSavings', 'savingsAmount',
      'consumerDurables', 'livestock', 'landOwnership', 'landArea', 'vehicleOwnership'
    ].includes(key)) {
      transformed[key] = formData[key];
    }
  });
  
  return transformed;
}

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

    // Transform flat form data to nested structure expected by model
    const transformedData = transformFormData(updateData);
    
    // Update survey fields
    Object.assign(survey, transformedData);
    survey.lastModifiedBy = userId;
    survey.lastModifiedAt = new Date();
    survey.surveyStatus = transformedData.surveyStatus || survey.surveyStatus;

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

    // Transform flat form data to nested structure expected by model
    const transformedData = transformFormData(req.body);
    
    // Update survey with form data if provided
    Object.assign(survey, transformedData);
    
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
    // Since data here is already structured for the specific section, we can assign directly
    if (survey[section]) {
      // If section exists, merge the data
      Object.assign(survey[section], data);
    } else {
      // If section doesn't exist, create it
      survey[section] = data;
    }
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