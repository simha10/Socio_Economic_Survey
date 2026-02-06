const Slum = require('../models/Slum');
const SlumSurvey = require('../models/SlumSurvey');
const HouseholdSurvey = require('../models/HouseholdSurvey');
const Assignment = require('../models/Assignment');

/**
 * Comprehensive status synchronization helper
 * Handles the complex logic for synchronizing statuses across all related models
 */

/**
 * Update Slum surveyStatus based on SlumSurvey and HouseholdSurvey progress
 * @param {string} slumId - The ID of the slum to update
 * @returns {Promise<boolean>} - Whether the update was successful
 */
async function updateSlumStatus(slumId) {
  try {
    console.log(`[STATUS_SYNC] Updating status for slum ID: ${slumId}`);
    
    // Get the slum
    const slum = await Slum.findById(slumId);
    if (!slum) {
      console.error(`[STATUS_SYNC] Slum not found: ${slumId}`);
      return false;
    }

    // Get the slum survey for this slum
    const slumSurvey = await SlumSurvey.findOne({ slum: slumId });
    if (!slumSurvey) {
      console.log(`[STATUS_SYNC] No slum survey found for slum: ${slumId}`);
      // If no slum survey exists, keep slum status as DRAFT
      if (slum.surveyStatus !== 'DRAFT') {
        slum.surveyStatus = 'DRAFT';
        await slum.save();
        console.log(`[STATUS_SYNC] Slum status updated to DRAFT (no slum survey)`);
      }
      return true;
    }

    // Get all household surveys for this slum
    const householdSurveys = await HouseholdSurvey.find({ slum: slumId });
    const totalHouseholds = slum.totalHouseholds || 0;
    const submittedHouseholdCount = householdSurveys.filter(hs => 
      hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
    ).length;

    console.log(`[STATUS_SYNC] Slum: ${slum.slumName}, Total Households: ${totalHouseholds}, Submitted Households: ${submittedHouseholdCount}`);

    // Determine new status based on comprehensive logic
    let newStatus = 'DRAFT';

    // Case 1: Slum survey is submitted or completed
    if (slumSurvey.surveyStatus === 'SUBMITTED' || slumSurvey.surveyStatus === 'COMPLETED') {
      // Case 2: All household surveys are submitted and match total households
      if (submittedHouseholdCount > 0 && submittedHouseholdCount === totalHouseholds) {
        newStatus = 'COMPLETED';
      } else {
        // Slum survey submitted but household surveys not complete
        newStatus = 'IN PROGRESS';
      }
    } 
    // Case 3: Slum survey is in progress
    else if (slumSurvey.surveyStatus === 'IN PROGRESS') {
      newStatus = 'IN PROGRESS';
    }
    // Case 4: Slum survey is draft
    else if (slumSurvey.surveyStatus === 'DRAFT') {
      // If there are submitted household surveys, mark as in progress
      if (submittedHouseholdCount > 0) {
        newStatus = 'IN PROGRESS';
      } else {
        newStatus = 'DRAFT';
      }
    }

    // Update slum status if it changed
    if (slum.surveyStatus !== newStatus) {
      slum.surveyStatus = newStatus;
      await slum.save();
      console.log(`[STATUS_SYNC] Slum status updated from ${slum.surveyStatus} to ${newStatus}`);
    } else {
      console.log(`[STATUS_SYNC] Slum status unchanged: ${newStatus}`);
    }

    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating slum status for ${slumId}:`, error);
    return false;
  }
}

/**
 * Update Assignment slumSurveyStatus based on SlumSurvey status
 * @param {string} slumSurveyId - The ID of the slum survey
 * @returns {Promise<boolean>} - Whether the update was successful
 */
async function updateAssignmentStatusFromSlumSurvey(slumSurveyId) {
  try {
    console.log(`[STATUS_SYNC] Updating assignment status from slum survey ID: ${slumSurveyId}`);
    
    // Get the slum survey
    const slumSurvey = await SlumSurvey.findById(slumSurveyId).populate('slum');
    if (!slumSurvey) {
      console.error(`[STATUS_SYNC] Slum survey not found: ${slumSurveyId}`);
      return false;
    }

    // Map surveyStatus to slumSurveyStatus for assignment
    let assignmentStatus;
    switch (slumSurvey.surveyStatus) {
      case 'DRAFT':
        assignmentStatus = 'NOT STARTED';
        break;
      case 'IN PROGRESS':
        assignmentStatus = 'IN PROGRESS';
        break;
      case 'SUBMITTED':
      case 'COMPLETED':
        assignmentStatus = 'SUBMITTED';
        break;
      default:
        assignmentStatus = 'NOT STARTED';
    }

    // Find the assignment for this slum and surveyor
    const assignment = await Assignment.findOne({
      slum: slumSurvey.slum._id,
      surveyor: slumSurvey.surveyor
    });

    if (assignment) {
      if (assignment.slumSurveyStatus !== assignmentStatus) {
        assignment.slumSurveyStatus = assignmentStatus;
        await assignment.save();
        console.log(`[STATUS_SYNC] Assignment status updated from ${assignment.slumSurveyStatus} to ${assignmentStatus}`);
      } else {
        console.log(`[STATUS_SYNC] Assignment status unchanged: ${assignmentStatus}`);
      }
      return true;
    } else {
      console.error(`[STATUS_SYNC] Assignment not found for slum: ${slumSurvey.slum._id} and surveyor: ${slumSurvey.surveyor}`);
      return false;
    }
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating assignment status from slum survey ${slumSurveyId}:`, error);
    return false;
  }
}

/**
 * Update statuses when household survey is submitted
 * @param {string} householdSurveyId - The ID of the household survey
 * @returns {Promise<boolean>} - Whether the update was successful
 */
async function updateStatusesFromHouseholdSurvey(householdSurveyId) {
  try {
    console.log(`[STATUS_SYNC] Updating statuses from household survey ID: ${householdSurveyId}`);
    
    // Get the household survey
    const householdSurvey = await HouseholdSurvey.findById(householdSurveyId).populate('slum');
    if (!householdSurvey) {
      console.error(`[STATUS_SYNC] Household survey not found: ${householdSurveyId}`);
      return false;
    }

    const slumId = householdSurvey.slum._id;

    // Update the slum status based on household survey progress
    const result = await updateSlumStatus(slumId);
    
    // Also update the slum survey status if needed
    const slumSurvey = await SlumSurvey.findOne({ slum: slumId });
    if (slumSurvey) {
      // If all household surveys are submitted, we might want to mark slum survey as completed
      const householdSurveys = await HouseholdSurvey.find({ slum: slumId });
      const totalHouseholds = householdSurvey.slum.totalHouseholds || 0;
      const submittedCount = householdSurveys.filter(hs => 
        hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
      ).length;

      // If all households are surveyed, update slum survey status
      if (submittedCount > 0 && submittedCount === totalHouseholds && 
          slumSurvey.surveyStatus !== 'COMPLETED') {
        slumSurvey.surveyStatus = 'COMPLETED';
        await slumSurvey.save();
        console.log(`[STATUS_SYNC] Slum survey marked as COMPLETED due to all household surveys submitted`);
        
        // Update assignment status as well
        await updateAssignmentStatusFromSlumSurvey(slumSurvey._id);
      }
    }

    return result;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating statuses from household survey ${householdSurveyId}:`, error);
    return false;
  }
}

/**
 * Initialize status synchronization for a new assignment
 * @param {string} assignmentId - The ID of the assignment
 * @returns {Promise<boolean>} - Whether the initialization was successful
 */
async function initializeAssignmentStatus(assignmentId) {
  try {
    console.log(`[STATUS_SYNC] Initializing status for assignment ID: ${assignmentId}`);
    
    const assignment = await Assignment.findById(assignmentId)
      .populate('slum')
      .populate('surveyor');

    if (!assignment) {
      console.error(`[STATUS_SYNC] Assignment not found: ${assignmentId}`);
      return false;
    }

    // Set initial slum survey status to NOT STARTED
    assignment.slumSurveyStatus = 'NOT STARTED';
    await assignment.save();
    
    console.log(`[STATUS_SYNC] Assignment initialized with slumSurveyStatus: NOT STARTED`);
    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error initializing assignment status ${assignmentId}:`, error);
    return false;
  }
}

module.exports = {
  updateSlumStatus,
  updateAssignmentStatusFromSlumSurvey,
  updateStatusesFromHouseholdSurvey,
  initializeAssignmentStatus
};