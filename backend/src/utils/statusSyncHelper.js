const Slum = require('../models/Slum');
const SlumSurvey = require('../models/SlumSurvey');
const HouseholdSurvey = require('../models/HouseholdSurvey');
const Assignment = require('../models/Assignment');

/**
 * Get existing status information for a slum to maintain consistency across assignments
 * @param {string} slumId - The ID of the slum
 * @returns {Promise<Object|null>} - Status information or null if no existing assignments
 */
async function getExistingSlumStatus(slumId) {
  try {
    // Find all assignments for this slum
    const assignments = await Assignment.find({ slum: slumId })
      .populate('slum')
      .populate('surveyor');
    
    if (assignments.length === 0) {
      return null; // No existing assignments
    }
    
    // Get slum surveys for this slum
    const slumSurveys = await SlumSurvey.find({ slum: slumId });
    
    // Get household surveys for this slum
    const householdSurveys = await HouseholdSurvey.find({ slum: slumId });
    
    // Calculate household progress across all assignments
    const totalCompleted = householdSurveys.filter(survey => 
      survey.surveyStatus === 'COMPLETED' || survey.surveyStatus === 'SUBMITTED'
    ).length;

    // Determine slumSurveyStatus based on actual slum survey progress across ALL surveyors
    // This represents the overall status of the slum survey component for this slum
    let slumSurveyStatus = 'NOT STARTED';
    if (slumSurveys.length > 0) {
      // Check if any slum survey is in progress or completed by any surveyor
      const hasInProgress = slumSurveys.some(ss => ss.surveyStatus === 'IN PROGRESS');
      const hasCompletedOrSubmitted = slumSurveys.some(ss => 
        ss.surveyStatus === 'SUBMITTED' || ss.surveyStatus === 'COMPLETED');
      
      if (hasInProgress) {
        slumSurveyStatus = 'IN PROGRESS';
      } else if (hasCompletedOrSubmitted) {
        slumSurveyStatus = 'SUBMITTED';
      } 
      // Otherwise remains 'NOT STARTED' (even if drafts exist, if they're not in progress/complete)
    }

    // Determine the assignment status based on overall work done for this slum
    // If ANY work has been done on this slum by ANY surveyor, the status should reflect that
    const totalHouseholds = assignments[0]?.slum?.totalHouseholds || 0;
    const allHouseholdsCompleted = totalCompleted > 0 && totalCompleted === totalHouseholds;
    
    // Determine status based on whether ANY work has been done on this slum
    let overallStatus = 'PENDING'; // Default when no work has been done by any surveyor
    
    if (allHouseholdsCompleted && (hasCompletedOrSubmitted || hasInProgress)) {
      overallStatus = 'COMPLETED'; // All work completed for this slum
    } else if (hasInProgress || hasCompletedOrSubmitted || totalCompleted > 0) {
      // If any work has been done on this slum (slum survey started/completed OR household surveys submitted)
      overallStatus = 'IN PROGRESS';
    }
    // Otherwise remains 'PENDING'

    return {
      slumSurveyStatus: slumSurveyStatus,
      status: overallStatus,
      householdSurveyProgress: {
        completed: totalCompleted,
        total: totalHouseholds
      }
    };
  } catch (error) {
    console.error(`[STATUS_SYNC] Error getting existing slum status for ${slumId}:`, error);
    return null;
  }
}

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

    // Determine new status based on the required logic
    let newStatus = 'DRAFT';

    // Requirement 1: If either surveyStatus in SlumSurvey model is IN PROGRESS 
    // or either the completed count in householdSurveyProgress array is greater than 0,
    // the surveyStatus in Slum model needs to get updated to IN PROGRESS
    if (slumSurvey.surveyStatus === 'IN PROGRESS' || submittedHouseholdCount > 0) {
      newStatus = 'IN PROGRESS';
    }
    // Requirement 4: If surveyStatus in SlumSurvey model is Submitted and the household survey count 
    // matches the total household count, then only, mark the surveyStatus in Slum model as COMPLETED
    else if (
      slumSurvey.surveyStatus === 'SUBMITTED' && 
      submittedHouseholdCount > 0 && 
      submittedHouseholdCount === totalHouseholds
    ) {
      newStatus = 'COMPLETED';
    }
    // Otherwise remains DRAFT (or as per slum survey status)
    else {
      // If slum survey is SUBMITTED but not all households are done, it stays IN PROGRESS
      if (slumSurvey.surveyStatus === 'SUBMITTED') {
        newStatus = 'IN PROGRESS';
      } else if (slumSurvey.surveyStatus === 'COMPLETED') {
        newStatus = 'COMPLETED';
      } else {
        newStatus = slumSurvey.surveyStatus === 'DRAFT' ? 'DRAFT' : slumSurvey.surveyStatus;
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
    // Requirement 3: If surveyStatus in Slum Survey is IN PROGRESS, then update the slumSurveyStatus 
    // in Assignment records of that particular slum as IN PROGRESS. Same goes for the SUBMITTED status.
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

    // Find ALL assignments for this slum (multiple surveyors can be assigned)
    const assignments = await Assignment.find({
      slum: slumSurvey.slum._id
    });

    if (assignments.length > 0) {
      console.log(`[STATUS_SYNC] Found ${assignments.length} assignments for slum: ${slumSurvey.slum._id}`);
      
      // Update slumSurveyStatus for all assignments
      for (const assignment of assignments) {
        console.log(`[STATUS_SYNC] Processing assignment ID: ${assignment._id}, Current slumSurveyStatus: ${assignment.slumSurveyStatus}, New: ${assignmentStatus}`);
        
        if (assignment.slumSurveyStatus !== assignmentStatus) {
          assignment.slumSurveyStatus = assignmentStatus;
          await assignment.save();
          console.log(`[STATUS_SYNC] Assignment ${assignment._id} slumSurveyStatus updated from ${assignment.slumSurveyStatus} to ${assignmentStatus}`);
        } else {
          console.log(`[STATUS_SYNC] Assignment ${assignment._id} slumSurveyStatus unchanged: ${assignmentStatus}`);
        }
        
        // Also update the main assignment status
        console.log(`[STATUS_SYNC] Triggering main assignment status update for assignment: ${assignment._id}`);
        await updateAssignmentMainStatus(assignment._id);
      }
      
      // Update the slum status as well
      console.log(`[STATUS_SYNC] Triggering slum status update`);
      await updateSlumStatus(slumSurvey.slum._id);
      
      return true;
    } else {
      console.error(`[STATUS_SYNC] No assignments found for slum: ${slumSurvey.slum._id}`);
      return false;
    }
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating assignment status from slum survey ${slumSurveyId}:`, error);
    return false;
  }
}

/**
 * Update householdSurveyProgress in Assignment model
 * @param {string} slumId - The ID of the slum
 * @param {string} surveyorId - The ID of the surveyor
 * @returns {Promise<boolean>} - Whether the update was successful
 */
async function updateHouseholdSurveyProgress(slumId, surveyorId) {
  try {
    console.log(`[STATUS_SYNC] Updating household survey progress for slum: ${slumId}, surveyor: ${surveyorId}`);

    // Find ALL assignments for this slum (multiple surveyors can be assigned)
    const assignments = await Assignment.find({
      slum: slumId
    });

    if (assignments.length === 0) {
      console.error(`[STATUS_SYNC] No assignments found for slum: ${slumId}`);
      return false;
    }

    // Get the slum to get totalHouseholds
    const slum = await Slum.findById(slumId);
    if (!slum) {
      console.error(`[STATUS_SYNC] Slum not found: ${slumId}`);
      return false;
    }

    // Count ALL submitted/completed household surveys for this slum (across all surveyors)
    const householdSurveys = await HouseholdSurvey.find({
      slum: slumId
    });

    const completedCount = householdSurveys.filter(hs =>
      hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
    ).length;

    const totalCount = slum.totalHouseholds || 0;

    // Update the householdSurveyProgress for ALL assignments (same aggregated progress)
    for (const assignment of assignments) {
      const prevProgress = assignment.householdSurveyProgress;
      assignment.householdSurveyProgress = {
        completed: completedCount,
        total: totalCount
      };
      await assignment.save();
      
      console.log(`[STATUS_SYNC] Updated assignment ${assignment._id} householdSurveyProgress from ${prevProgress?.completed}/${prevProgress?.total} to ${completedCount}/${totalCount}`);
    }

    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating household survey progress:`, error);
    return false;
  }
}

/**
 * Auto-sync slum totalHouseholds and assignment progress when household records change
 * @param {string} slumId - The ID of the slum
 * @param {string} surveyorId - The ID of the surveyor (optional)
 * @returns {Promise<boolean>} - Whether the sync was successful
 */
async function autoSyncHouseholdCounts(slumId, surveyorId = null) {
  try {
    console.log(`[AUTO_SYNC] Auto-syncing household counts for slum: ${slumId}`);
    
    // Get the slum
    const slum = await Slum.findById(slumId);
    if (!slum) {
      console.error(`[AUTO_SYNC] Slum not found: ${slumId}`);
      return false;
    }

    // Count all household surveys for this slum (regardless of surveyor)
    const totalHouseholdCount = await HouseholdSurvey.countDocuments({ slum: slumId });
    
    console.log(`[AUTO_SYNC] Actual household count: ${totalHouseholdCount}, Current slum totalHouseholds: ${slum.totalHouseholds}`);
    
    // Update slum totalHouseholds if it doesn't match actual count
    if (slum.totalHouseholds !== totalHouseholdCount) {
      const oldCount = slum.totalHouseholds;
      slum.totalHouseholds = totalHouseholdCount;
      await slum.save();
      console.log(`[AUTO_SYNC] Updated slum totalHouseholds from ${oldCount} to ${totalHouseholdCount}`);
    }
    
    // Update ALL assignments for this slum (not just for specific surveyor)
    const assignments = await Assignment.find({ slum: slumId });
    
    console.log(`[AUTO_SYNC] Found ${assignments.length} assignments to update`);
    
    for (const assignment of assignments) {
      // Count all household surveys for this slum regardless of surveyor
      // (since progress should be shared across all assignments for the same slum)
      const householdSurveys = await HouseholdSurvey.find({
        slum: slumId
      });
      
      const completedCount = householdSurveys.filter(hs =>
        hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
      ).length;
      
      const prevProgress = assignment.householdSurveyProgress;
      const newProgress = {
        completed: completedCount,
        total: totalHouseholdCount
      };
      
      assignment.householdSurveyProgress = newProgress;
      await assignment.save();
      
      console.log(`[AUTO_SYNC] Updated assignment ${assignment._id} progress from ${prevProgress?.completed}/${prevProgress?.total} to ${newProgress.completed}/${newProgress.total}`);
    }
    
    return true;
  } catch (error) {
    console.error(`[AUTO_SYNC] Error in auto-sync:`, error);
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
    const surveyorId = householdSurvey.surveyor;

    // Update the householdSurveyProgress in Assignment
    await updateHouseholdSurveyProgress(slumId, surveyorId);

    // Update the slum status based on household survey progress
    const result = await updateSlumStatus(slumId);
    
    // Update the main assignment status
    const assignment = await Assignment.findOne({
      slum: slumId,
      surveyor: surveyorId
    });
    
    if (assignment) {
      await updateAssignmentMainStatus(assignment._id);
    }
    
    // Synchronize all assignments for this slum to ensure consistency
    const canonicalStatus = await getCanonicalSlumStatus(slumId);
    await syncAllAssignmentsForSlum(slumId, canonicalStatus);
    
    // Also update the slum survey status if needed
    const slumSurvey = await SlumSurvey.findOne({ slum: slumId });
    if (slumSurvey) {
      // If all household surveys are submitted AND the slum survey is already submitted, 
      // then we can mark the slum survey as COMPLETED
      const householdSurveys = await HouseholdSurvey.find({ slum: slumId });
      const totalHouseholds = householdSurvey.slum.totalHouseholds || 0;
      const submittedCount = householdSurveys.filter(hs => 
        hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
      ).length;

      // Requirement 4: Only if slum survey is SUBMITTED and all household surveys are completed, 
      // then mark slum survey as COMPLETED
      if (slumSurvey.surveyStatus === 'SUBMITTED' && 
          submittedCount > 0 && submittedCount === totalHouseholds && 
          slumSurvey.surveyStatus !== 'COMPLETED') {
        slumSurvey.surveyStatus = 'COMPLETED';
        await slumSurvey.save();
        console.log(`[STATUS_SYNC] Slum survey marked as COMPLETED due to all household surveys submitted and slum survey SUBMITTED`);
        
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
        
        // Synchronize all assignments for this slum to ensure consistency
        const canonicalStatus = await getCanonicalSlumStatus(slumId);
        await syncAllAssignmentsForSlum(slumId, canonicalStatus);
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
      slum: assignment.slum._id
    });

    const householdSurveys = await HouseholdSurvey.find({
      slum: assignment.slum._id
    });

    const totalHouseholds = assignment.slum.totalHouseholds || 0;
    const completedHouseholdCount = householdSurveys.filter(hs => 
      hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
    ).length;

    console.log(`[STATUS_SYNC] Found ${householdSurveys.length} household surveys, ${completedHouseholdCount} completed`);
    console.log(`[STATUS_SYNC] Slum survey exists: ${!!slumSurvey}`);
    console.log(`[STATUS_SYNC] Slum survey status: ${slumSurvey?.surveyStatus || 'N/A'}`);

    // Determine main assignment status based on the required logic
    let newMainStatus = 'PENDING'; // Default status

    // Requirement 1: If either surveyStatus in SlumSurvey model is IN PROGRESS 
    // or either the completed count in householdSurveyProgress array is greater than 0,
    // the status in Assignment model needs to get updated to IN PROGRESS
    if (slumSurvey?.surveyStatus === 'IN PROGRESS' || completedHouseholdCount > 0) {
      newMainStatus = 'IN PROGRESS';
      console.log(`[STATUS_SYNC] Condition 1: Slum survey IN PROGRESS or HH count > 0 - Status: IN PROGRESS`);
    }
    // Requirement 4: If surveyStatus in SlumSurvey model is Submitted and the household survey count 
    // matches the total household count, then only, mark the status in Assignment model as COMPLETED
    else if (
      slumSurvey?.surveyStatus === 'SUBMITTED' && 
      completedHouseholdCount > 0 && 
      completedHouseholdCount === totalHouseholds
    ) {
      newMainStatus = 'COMPLETED';
      console.log(`[STATUS_SYNC] Condition 2: Slum survey SUBMITTED and all HH completed - Status: COMPLETED`);
    }
    // Otherwise remains PENDING
    else {
      newMainStatus = 'PENDING';
      console.log(`[STATUS_SYNC] Condition 3: Default status - Status: PENDING`);
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

    // Check for existing status for this slum
    const existingStatus = await getExistingSlumStatus(assignment.slum._id);
    
    if (existingStatus) {
      // Use existing status and progress
      assignment.slumSurveyStatus = existingStatus.slumSurveyStatus;
      assignment.status = existingStatus.status;
      assignment.householdSurveyProgress = existingStatus.householdSurveyProgress;
      console.log(`[STATUS_SYNC] Copied existing status from slum ${assignment.slum._id}`);
    } else {
      // Set initial default status
      assignment.slumSurveyStatus = 'NOT STARTED';
      assignment.status = 'PENDING';
      assignment.householdSurveyProgress = {
        completed: 0,
        total: assignment.slum?.totalHouseholds || 0
      };
      console.log(`[STATUS_SYNC] Initialized with default status for new slum`);
    }
    
    await assignment.save();
    console.log(`[STATUS_SYNC] Assignment status initialized:`, {
      slumSurveyStatus: assignment.slumSurveyStatus,
      status: assignment.status,
      householdSurveyProgress: assignment.householdSurveyProgress
    });
    
    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error initializing assignment status ${assignmentId}:`, error);
    return false;
  }
}

/**
 * Function to get canonical status for a slum based on actual survey progress
 * @param {string} slumId - The ID of the slum
 * @returns {Promise<Object>} - Canonical status and progress data
 */
async function getCanonicalSlumStatus(slumId) {
  try {
    // Get all slum surveys for this slum
    const slumSurveys = await SlumSurvey.find({ slum: slumId });
    
    // Get all household surveys for this slum
    const householdSurveys = await HouseholdSurvey.find({ slum: slumId });
    
    // Calculate progress
    const slumDoc = await Slum.findById(slumId).select('totalHouseholds').lean();
    const totalCompleted = householdSurveys.filter(hs => 
      hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
    ).length;
    
    // Determine slum survey status (highest status among all slum surveys)
    let slumSurveyStatus = 'NOT STARTED';
    let hasInProgress = false;
    let hasSubmitted = false;
    
    if (slumSurveys.length > 0) {
      hasInProgress = slumSurveys.some(ss => ss.surveyStatus === 'IN PROGRESS');
      hasSubmitted = slumSurveys.some(ss => 
        ss.surveyStatus === 'SUBMITTED' || ss.surveyStatus === 'COMPLETED'
      );
      
      if (hasInProgress) {
        slumSurveyStatus = 'IN PROGRESS';
      } else if (hasSubmitted) {
        slumSurveyStatus = 'SUBMITTED';
      }
    }
    
    // Determine overall assignment status
    let overallStatus = 'PENDING';
    const allHouseholdsCompleted = totalCompleted > 0 && totalCompleted === (slumDoc?.totalHouseholds || 0);
    
    if (allHouseholdsCompleted && (hasSubmitted || hasInProgress)) {
      overallStatus = 'COMPLETED';
    } else if (hasInProgress || hasSubmitted || totalCompleted > 0) {
      overallStatus = 'IN PROGRESS';
    }
    
    return {
      status: overallStatus,
      slumSurveyStatus: slumSurveyStatus,
      householdSurveyProgress: {
        completed: totalCompleted,
        total: slumDoc?.totalHouseholds || 0
      }
    };
  } catch (error) {
    console.error(`[STATUS_SYNC] Error in getCanonicalSlumStatus for slum ${slumId}:`, error);
    // Return default values in case of error
    return {
      status: 'PENDING',
      slumSurveyStatus: 'NOT STARTED',
      householdSurveyProgress: {
        completed: 0,
        total: 0
      }
    };
  }
}

/**
 * Function to synchronize all assignments for a slum
 * @param {string} slumId - The ID of the slum
 * @param {Object} updateData - Data to update in all assignments
 * @returns {Promise<boolean>} - Whether the sync was successful
 */
async function syncAllAssignmentsForSlum(slumId, updateData) {
  const assignments = await Assignment.find({ slum: slumId });
  
  const promises = assignments.map(assignment => {
    // Update only the fields that should be synchronized
    if (updateData.status !== undefined) assignment.status = updateData.status;
    if (updateData.slumSurveyStatus !== undefined) assignment.slumSurveyStatus = updateData.slumSurveyStatus;
    if (updateData.householdSurveyProgress !== undefined) {
      assignment.householdSurveyProgress = updateData.householdSurveyProgress;
    }
    
    return assignment.save();
  });
  
  await Promise.all(promises);
  return true;
}

/**
 * Calculate and update slum population based on household survey family members
 * @param {string} slumId - The ID of the slum
 * @returns {Promise<boolean>} - Whether the update was successful
 */
async function updateSlumPopulationFromHouseholdSurveys(slumId) {
  try {
    console.log(`[STATUS_SYNC] Updating slum population from household surveys for slum ID: ${slumId}`);
    
    // Get all household surveys for this slum
    const householdSurveys = await HouseholdSurvey.find({ slum: slumId });
    
    // Calculate the sum of family members from all household surveys
    let totalPopulation = 0;
    householdSurveys.forEach(hs => {
      if (hs.familyMembersTotal && typeof hs.familyMembersTotal === 'number') {
        totalPopulation += hs.familyMembersTotal;
      }
    });
    
    console.log(`[STATUS_SYNC] Calculated total population: ${totalPopulation} from ${householdSurveys.length} household surveys`);
    
    // Find the slum survey for this slum
    let slumSurvey = await SlumSurvey.findOne({ slum: slumId });
    
    if (!slumSurvey) {
      console.log(`[STATUS_SYNC] No slum survey found for slum: ${slumId}. Creating one if needed elsewhere.`);
      return true; // Don't fail if no slum survey exists yet
    }
    
    // Update the slum population in the slum survey
    if (slumSurvey.cityTownSlumProfile) {
      slumSurvey.cityTownSlumProfile.slumPopulation = totalPopulation;
    } else {
      // Initialize cityTownSlumProfile if it doesn't exist
      slumSurvey.cityTownSlumProfile = {
        slumPopulation: totalPopulation
      };
    }
    
    // Save the updated slum survey
    await slumSurvey.save();
    
    console.log(`[STATUS_SYNC] Updated slum population to ${totalPopulation} for slum survey: ${slumSurvey._id}`);
    
    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating slum population from household surveys for slum ${slumId}:`, error);
    return false;
  }
}

/**
 * Calculate and update BPL population based on household survey BPL status
 * @param {string} slumId - The ID of the slum
 * @returns {Promise<boolean>} - Whether the update was successful
 */
async function updateSlumBplPopulationFromHouseholdSurveys(slumId) {
  try {
    console.log(`[STATUS_SYNC] Updating slum BPL population from household surveys for slum ID: ${slumId}`);
    
    // Get all household surveys for this slum
    const householdSurveys = await HouseholdSurvey.find({ slum: slumId });
    
    // Calculate BPL population: sum family members only for households with belowPovertyLine = 'YES'
    let bplPopulation = 0;
    let bplHouseholds = 0;
    
    // Calculate total submitted household surveys (for No. of Slum Households)
    const submittedHouseholds = householdSurveys.filter(hs => 
      hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
    ).length;
    
    householdSurveys.forEach(hs => {
      if (hs.belowPovertyLine === 'YES') {
        bplHouseholds += 1;
        if (hs.familyMembersTotal && typeof hs.familyMembersTotal === 'number') {
          bplPopulation += hs.familyMembersTotal;
        }
      }
    });
    
    console.log(`[STATUS_SYNC] Calculated BPL population: ${bplPopulation} from ${bplHouseholds} BPL households out of ${householdSurveys.length} total households`);
    
    // Find the slum survey for this slum
    let slumSurvey = await SlumSurvey.findOne({ slum: slumId });
    
    if (!slumSurvey) {
      console.log(`[STATUS_SYNC] No slum survey found for slum: ${slumId}. Creating one if needed elsewhere.`);
      return true; // Don't fail if no slum survey exists yet
    }
    
    // Update the BPL population and households in the slum survey
    if (slumSurvey.cityTownSlumProfile) {
      slumSurvey.cityTownSlumProfile.bplPopulation = bplPopulation;
      slumSurvey.cityTownSlumProfile.bplHouseholds = bplHouseholds;
      // Update No. of Slum Households from submitted household surveys
      slumSurvey.cityTownSlumProfile.noSlumHouseholds = submittedHouseholds;
    } else {
      // Initialize cityTownSlumProfile if it doesn't exist
      slumSurvey.cityTownSlumProfile = {
        bplPopulation: bplPopulation,
        bplHouseholds: bplHouseholds,
        noSlumHouseholds: submittedHouseholds
      };
    }
    
    // Also update the demographic profile BPL data
    if (slumSurvey.demographicProfile) {
      if (!slumSurvey.demographicProfile.bplPopulation) {
        slumSurvey.demographicProfile.bplPopulation = {};
      }
      if (!slumSurvey.demographicProfile.numberOfBplHouseholds) {
        slumSurvey.demographicProfile.numberOfBplHouseholds = {};
      }
      
      // Set total values
      slumSurvey.demographicProfile.bplPopulation.Total = bplPopulation;
      slumSurvey.demographicProfile.numberOfBplHouseholds.Total = bplHouseholds;
    }
    
    // Save the updated slum survey
    await slumSurvey.save();
    
    console.log(`[STATUS_SYNC] Updated BPL population to ${bplPopulation} and BPL households to ${bplHouseholds} for slum survey: ${slumSurvey._id}`);
    
    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating slum BPL population from household surveys for slum ${slumId}:`, error);
    return false;
  }
}

/**
 * Calculate and update demographic population based on household survey caste and minority status
 * @param {string} slumId - The ID of the slum
 * @returns {Promise<boolean>} - Whether the update was successful
 */
async function updateSlumDemographicPopulationFromHouseholdSurveys(slumId) {
  try {
    console.log(`[STATUS_SYNC] Updating slum demographic population from household surveys for slum ID: ${slumId}`);
    
    // Get all household surveys for this slum
    const householdSurveys = await HouseholdSurvey.find({ slum: slumId });
    
    // Initialize demographic counters
    let demographicCounts = {
      SC: { population: 0, households: 0 },
      ST: { population: 0, households: 0 },
      OBC: { population: 0, households: 0 },
      Others: { population: 0, households: 0 },
      Minorities: { population: 0, households: 0 },
      Total: { population: 0, households: 0 }
    };
    
    // Initialize BPL demographic counters
    let bplDemographicCounts = {
      SC: { population: 0, households: 0 },
      ST: { population: 0, households: 0 },
      OBC: { population: 0, households: 0 },
      Others: { population: 0, households: 0 },
      Minorities: { population: 0, households: 0 },
      Total: { population: 0, households: 0 }
    };
    
    // Initialize women-headed household demographic counters
    let womenHeadedDemographicCounts = {
      SC: { population: 0, households: 0 },
      ST: { population: 0, households: 0 },
      OBC: { population: 0, households: 0 },
      Others: { population: 0, households: 0 },
      Minorities: { population: 0, households: 0 },
      Total: { population: 0, households: 0 }
    };
    
    // Calculate demographic distribution from all household surveys
    householdSurveys.forEach(hs => {
      const familyMembers = hs.familyMembersTotal || 0;
      
      // Count total population and households
      demographicCounts.Total.population += familyMembers;
      demographicCounts.Total.households += 1;
      
      // Map caste to demographic groups
      if (hs.caste === 'SC') {
        demographicCounts.SC.population += familyMembers;
        demographicCounts.SC.households += 1;
      } else if (hs.caste === 'ST') {
        demographicCounts.ST.population += familyMembers;
        demographicCounts.ST.households += 1;
      } else if (hs.caste === 'OBC') {
        demographicCounts.OBC.population += familyMembers;
        demographicCounts.OBC.households += 1;
      } else {
        // General caste maps to Others
        demographicCounts.Others.population += familyMembers;
        demographicCounts.Others.households += 1;
      }
      
      // Count minorities separately (regardless of caste)
      if (hs.minorityStatus === 'MINORITY') {
        demographicCounts.Minorities.population += familyMembers;
        demographicCounts.Minorities.households += 1;
      }
      
      // Calculate BPL demographic distribution (only for households below poverty line)
      if (hs.belowPovertyLine === 'YES') {
        bplDemographicCounts.Total.population += familyMembers;
        bplDemographicCounts.Total.households += 1;
        
        if (hs.caste === 'SC') {
          bplDemographicCounts.SC.population += familyMembers;
          bplDemographicCounts.SC.households += 1;
        } else if (hs.caste === 'ST') {
          bplDemographicCounts.ST.population += familyMembers;
          bplDemographicCounts.ST.households += 1;
        } else if (hs.caste === 'OBC') {
          bplDemographicCounts.OBC.population += familyMembers;
          bplDemographicCounts.OBC.households += 1;
        } else {
          // General caste maps to Others
          bplDemographicCounts.Others.population += familyMembers;
          bplDemographicCounts.Others.households += 1;
        }
        
        // Count minorities in BPL (regardless of caste)
        if (hs.minorityStatus === 'MINORITY') {
          bplDemographicCounts.Minorities.population += familyMembers;
          bplDemographicCounts.Minorities.households += 1;
        }
      }
      
      // Calculate women-headed household demographic distribution (only for households with female head status)
      if (hs.femaleHeadStatus) { // If femaleHeadStatus has any value (not null/undefined/empty)
        womenHeadedDemographicCounts.Total.population += familyMembers;
        womenHeadedDemographicCounts.Total.households += 1;
        
        if (hs.caste === 'SC') {
          womenHeadedDemographicCounts.SC.population += familyMembers;
          womenHeadedDemographicCounts.SC.households += 1;
        } else if (hs.caste === 'ST') {
          womenHeadedDemographicCounts.ST.population += familyMembers;
          womenHeadedDemographicCounts.ST.households += 1;
        } else if (hs.caste === 'OBC') {
          womenHeadedDemographicCounts.OBC.population += familyMembers;
          womenHeadedDemographicCounts.OBC.households += 1;
        } else {
          // General caste maps to Others
          womenHeadedDemographicCounts.Others.population += familyMembers;
          womenHeadedDemographicCounts.Others.households += 1;
        }
        
        // Count minorities in women-headed households (regardless of caste)
        if (hs.minorityStatus === 'MINORITY') {
          womenHeadedDemographicCounts.Minorities.population += familyMembers;
          womenHeadedDemographicCounts.Minorities.households += 1;
        }
      }
    });
    
    console.log(`[STATUS_SYNC] Calculated demographic population:`, demographicCounts);
    
    // Find the slum survey for this slum
    let slumSurvey = await SlumSurvey.findOne({ slum: slumId });
    
    if (!slumSurvey) {
      console.log(`[STATUS_SYNC] No slum survey found for slum: ${slumId}. Creating one if needed elsewhere.`);
      return true; // Don't fail if no slum survey exists yet
    }
    
    // Initialize demographicProfile if it doesn't exist
    if (!slumSurvey.demographicProfile) {
      slumSurvey.demographicProfile = {};
    }
    
    // Update the demographic profile with calculated values
    slumSurvey.demographicProfile.totalPopulation = {
      SC: demographicCounts.SC.population,
      ST: demographicCounts.ST.population,
      OBC: demographicCounts.OBC.population,
      Others: demographicCounts.Others.population,
      Total: demographicCounts.Total.population,
      Minorities: demographicCounts.Minorities.population
    };
    
    slumSurvey.demographicProfile.numberOfHouseholds = {
      SC: demographicCounts.SC.households,
      ST: demographicCounts.ST.households,
      OBC: demographicCounts.OBC.households,
      Others: demographicCounts.Others.households,
      Total: demographicCounts.Total.households,
      Minorities: demographicCounts.Minorities.households
    };
    
    // Update the BPL demographic profile with calculated values
    slumSurvey.demographicProfile.bplPopulation = {
      SC: bplDemographicCounts.SC.population,
      ST: bplDemographicCounts.ST.population,
      OBC: bplDemographicCounts.OBC.population,
      Others: bplDemographicCounts.Others.population,
      Total: bplDemographicCounts.Total.population,
      Minorities: bplDemographicCounts.Minorities.population
    };
    
    slumSurvey.demographicProfile.numberOfBplHouseholds = {
      SC: bplDemographicCounts.SC.households,
      ST: bplDemographicCounts.ST.households,
      OBC: bplDemographicCounts.OBC.households,
      Others: bplDemographicCounts.Others.households,
      Total: bplDemographicCounts.Total.households,
      Minorities: bplDemographicCounts.Minorities.households
    };
    
    // Update the women-headed household demographic profile with calculated values
    slumSurvey.demographicProfile.womenHeadedHouseholds = {
      SC: womenHeadedDemographicCounts.SC.population,
      ST: womenHeadedDemographicCounts.ST.population,
      OBC: womenHeadedDemographicCounts.OBC.population,
      Others: womenHeadedDemographicCounts.Others.population,
      Total: womenHeadedDemographicCounts.Total.population,
      Minorities: womenHeadedDemographicCounts.Minorities.population
    };
    
    slumSurvey.demographicProfile.numberOfWomenHeadedHouseholds = {
      SC: womenHeadedDemographicCounts.SC.households,
      ST: womenHeadedDemographicCounts.ST.households,
      OBC: womenHeadedDemographicCounts.OBC.households,
      Others: womenHeadedDemographicCounts.Others.households,
      Total: womenHeadedDemographicCounts.Total.households,
      Minorities: womenHeadedDemographicCounts.Minorities.households
    };
    
    // Save the updated slum survey
    await slumSurvey.save();
    
    console.log(`[STATUS_SYNC] Updated demographic population for slum survey: ${slumSurvey._id}`);
    console.log(`[STATUS_SYNC] Updated BPL demographic population:`, {
      bplPopulation: slumSurvey.demographicProfile.bplPopulation,
      numberOfBplHouseholds: slumSurvey.demographicProfile.numberOfBplHouseholds
    });
    console.log(`[STATUS_SYNC] Updated women-headed household demographic population:`, {
      womenHeadedHouseholds: slumSurvey.demographicProfile.womenHeadedHouseholds,
      numberOfWomenHeadedHouseholds: slumSurvey.demographicProfile.numberOfWomenHeadedHouseholds
    });
    
    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating slum demographic population from household surveys for slum ${slumId}:`, error);
    return false;
  }
}


module.exports = {
  updateSlumStatus,
  updateAssignmentStatusFromSlumSurvey,
  updateStatusesFromHouseholdSurvey,
  updateAssignmentMainStatus,
  initializeAssignmentStatus,
  updateHouseholdSurveyProgress,
  updateSlumPopulationFromHouseholdSurveys,
  updateSlumBplPopulationFromHouseholdSurveys,
  updateSlumDemographicPopulationFromHouseholdSurveys,
  autoSyncHouseholdCounts,
  getCanonicalSlumStatus,
  syncAllAssignmentsForSlum
};