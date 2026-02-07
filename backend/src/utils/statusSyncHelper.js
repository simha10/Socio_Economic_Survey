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

    console.log(`[STATUS_SYNC] Current slum status: ${slum.surveyStatus}, Slum name: ${slum.slumName}`);

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

    console.log(`[STATUS_SYNC] Found slum survey with status: ${slumSurvey.surveyStatus}`);

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

    console.log(`[STATUS_SYNC] Determined new slum status: ${newStatus}`);

    // Update slum status if it changed
    if (slum.surveyStatus !== newStatus) {
      const oldStatus = slum.surveyStatus;
      slum.surveyStatus = newStatus;
      await slum.save();
      console.log(`[STATUS_SYNC] Slum status updated from ${oldStatus} to ${newStatus}`);
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

    console.log(`[STATUS_SYNC] SlumSurvey status: ${slumSurvey.surveyStatus}, Slum: ${slumSurvey.slum?.slumName}`);

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
      console.log(`[STATUS_SYNC] Found assignment ID: ${assignment._id}, Current slumSurveyStatus: ${assignment.slumSurveyStatus}, New: ${assignmentStatus}`);
      
      if (assignment.slumSurveyStatus !== assignmentStatus) {
        assignment.slumSurveyStatus = assignmentStatus;
        await assignment.save();
        console.log(`[STATUS_SYNC] Assignment slumSurveyStatus updated from ${assignment.slumSurveyStatus} to ${assignmentStatus}`);
      } else {
        console.log(`[STATUS_SYNC] Assignment slumSurveyStatus unchanged: ${assignmentStatus}`);
      }
      
      // Also update the main assignment status
      console.log(`[STATUS_SYNC] Triggering main assignment status update`);
      await updateAssignmentMainStatus(assignment._id);
      
      // Update the slum status as well
      console.log(`[STATUS_SYNC] Triggering slum status update`);
      await updateSlumStatus(slumSurvey.slum._id);
      
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
        // Update main assignment status
        const assignment = await Assignment.findOne({
          slum: slumId,
          surveyor: slumSurvey.surveyor
        });
        if (assignment) {
          await updateAssignmentMainStatus(assignment._id);
        }
      }
    }

    return result;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating statuses from household survey ${householdSurveyId}:`, error);
    return false;
  }
}

/**
 * Update Assignment main status based on survey completion
 * This updates the primary assignment.status field used by the dashboard
 * @param {string} assignmentId - The ID of the assignment
 * @returns {Promise<boolean>} - Whether the update was successful
 */
async function updateAssignmentMainStatus(assignmentId) {
  try {
    console.log(`[STATUS_SYNC] Updating main assignment status for ID: ${assignmentId}`);
    
    const assignment = await Assignment.findById(assignmentId)
      .populate('slum')
      .populate('surveyor');

    if (!assignment) {
      console.error(`[STATUS_SYNC] Assignment not found: ${assignmentId}`);
      return false;
    }

    console.log(`[STATUS_SYNC] Current assignment status: ${assignment.status}`);
    console.log(`[STATUS_SYNC] Assignment slum: ${assignment.slum?.slumName}`);
    console.log(`[STATUS_SYNC] Assignment surveyor: ${assignment.surveyor?.name}`);

    // Get related surveys
    const slumSurvey = await SlumSurvey.findOne({
      slum: assignment.slum._id,
      surveyor: assignment.surveyor._id
    });

    const householdSurveys = await HouseholdSurvey.find({
      slum: assignment.slum._id,
      surveyor: assignment.surveyor._id
    });

    const totalHouseholds = assignment.slum.totalHouseholds || 0;
    const completedHouseholdCount = householdSurveys.filter(hs => 
      hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
    ).length;

    console.log(`[STATUS_SYNC] Found ${householdSurveys.length} household surveys, ${completedHouseholdCount} completed`);
    console.log(`[STATUS_SYNC] Slum survey exists: ${!!slumSurvey}`);
    console.log(`[STATUS_SYNC] Slum survey status: ${slumSurvey?.surveyStatus || 'N/A'}`);

    // Determine main assignment status based on comprehensive logic
    let newMainStatus = 'PENDING'; // Default status

    if (!slumSurvey && householdSurveys.length === 0) {
      // No surveys started yet
      newMainStatus = 'PENDING';
      console.log(`[STATUS_SYNC] Condition 1: No surveys started - Status: PENDING`);
    } else if (slumSurvey?.surveyStatus === 'DRAFT' && householdSurveys.length === 0) {
      // Slum survey created but not started, no household surveys
      newMainStatus = 'PENDING';
      console.log(`[STATUS_SYNC] Condition 2: Draft with no HH surveys - Status: PENDING`);
    } else if (
      slumSurvey?.surveyStatus === 'IN PROGRESS' || 
      householdSurveys.length > 0
    ) {
      // Work has started (either slum survey in progress or household surveys exist)
      newMainStatus = 'IN PROGRESS';
      console.log(`[STATUS_SYNC] Condition 3: Work started - Status: IN PROGRESS`);
      console.log(`[STATUS_SYNC]   Slum survey IN PROGRESS: ${slumSurvey?.surveyStatus === 'IN PROGRESS'}`);
      console.log(`[STATUS_SYNC]   Has household surveys: ${householdSurveys.length > 0}`);
    } else if (
      (slumSurvey?.surveyStatus === 'SUBMITTED' || slumSurvey?.surveyStatus === 'COMPLETED') &&
      completedHouseholdCount > 0 && 
      completedHouseholdCount === totalHouseholds
    ) {
      // Both slum survey and all household surveys are completed
      newMainStatus = 'COMPLETED';
      console.log(`[STATUS_SYNC] Condition 4: All surveys completed - Status: COMPLETED`);
    } else if (
      slumSurvey?.surveyStatus === 'SUBMITTED' || slumSurvey?.surveyStatus === 'COMPLETED'
    ) {
      // Slum survey completed but household surveys not done
      newMainStatus = 'IN PROGRESS';
      console.log(`[STATUS_SYNC] Condition 5: Slum survey done, HH pending - Status: IN PROGRESS`);
    }

    console.log(`[STATUS_SYNC] Calculated new main status: ${newMainStatus}`);

    // Update assignment status if it changed
    if (assignment.status !== newMainStatus) {
      console.log(`[STATUS_SYNC] Status will change from ${assignment.status} to ${newMainStatus}`);
      assignment.status = newMainStatus;
      if (newMainStatus === 'COMPLETED') {
        assignment.completedAt = new Date();
      } else if (newMainStatus === 'PENDING') {
        assignment.completedAt = null;
      }
      await assignment.save();
      console.log(`[STATUS_SYNC] Assignment main status updated from ${assignment.status} to ${newMainStatus}`);
    } else {
      console.log(`[STATUS_SYNC] Assignment main status unchanged: ${newMainStatus} (current: ${assignment.status})`);
    }

    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating assignment main status ${assignmentId}:`, error);
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
    // Set initial main status to PENDING
    assignment.status = 'PENDING';
    await assignment.save();
    
    console.log(`[STATUS_SYNC] Assignment initialized with slumSurveyStatus: NOT STARTED and status: PENDING`);
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
  updateAssignmentMainStatus,
  initializeAssignmentStatus
};