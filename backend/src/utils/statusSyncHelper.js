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

    // Case 1: Slum survey is submitted or completed AND all household surveys are submitted
    if ((slumSurvey.surveyStatus === 'SUBMITTED' || slumSurvey.surveyStatus === 'COMPLETED') 
        && submittedHouseholdCount > 0 && submittedHouseholdCount === totalHouseholds) {
      newStatus = 'COMPLETED';
    }
    // Case 2: Either slum survey is in progress OR at least one household survey is submitted
    else if (slumSurvey.surveyStatus === 'IN PROGRESS' || submittedHouseholdCount > 0) {
      newStatus = 'IN PROGRESS';
    }
    // Case 3: Slum survey is submitted but not all household surveys are done
    else if (slumSurvey.surveyStatus === 'SUBMITTED' || slumSurvey.surveyStatus === 'COMPLETED') {
      newStatus = 'IN PROGRESS';
    }
    // Case 4: Slum survey is draft and no household surveys submitted
    else if (slumSurvey.surveyStatus === 'DRAFT') {
      newStatus = 'DRAFT';
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
 * Update householdSurveyProgress in Assignment model
 * @param {string} slumId - The ID of the slum
 * @param {string} surveyorId - The ID of the surveyor
 * @returns {Promise<boolean>} - Whether the update was successful
 */
async function updateHouseholdSurveyProgress(slumId, surveyorId) {
  try {
    console.log(`[STATUS_SYNC] Updating household survey progress for slum: ${slumId}, surveyor: ${surveyorId}`);

    // Find the assignment
    const assignment = await Assignment.findOne({
      slum: slumId,
      surveyor: surveyorId
    });

    if (!assignment) {
      console.error(`[STATUS_SYNC] Assignment not found for slum: ${slumId} and surveyor: ${surveyorId}`);
      return false;
    }

    // Get the slum to get totalHouseholds
    const slum = await Slum.findById(slumId);
    if (!slum) {
      console.error(`[STATUS_SYNC] Slum not found: ${slumId}`);
      return false;
    }

    // Count submitted/completed household surveys for this slum and surveyor
    const householdSurveys = await HouseholdSurvey.find({
      slum: slumId,
      surveyor: surveyorId
    });

    const completedCount = householdSurveys.filter(hs =>
      hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
    ).length;

    const totalCount = slum.totalHouseholds || 0;

    // Update the householdSurveyProgress in Assignment
    assignment.householdSurveyProgress = {
      completed: completedCount,
      total: totalCount
    };

    await assignment.save();

    console.log(`[STATUS_SYNC] Updated householdSurveyProgress: ${completedCount}/${totalCount} for assignment: ${assignment._id}`);

    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error updating household survey progress:`, error);
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

    if (!slumSurvey && completedHouseholdCount === 0) {
      // No surveys started yet
      newMainStatus = 'PENDING';
      console.log(`[STATUS_SYNC] Condition 1: No surveys started - Status: PENDING`);
    } else if (
      slumSurvey?.surveyStatus === 'IN PROGRESS' || 
      completedHouseholdCount > 0
    ) {
      // Work has started (either slum survey in progress or at least one household survey is submitted)
      newMainStatus = 'IN PROGRESS';
      console.log(`[STATUS_SYNC] Condition 2: Work started - Status: IN PROGRESS`);
      console.log(`[STATUS_SYNC]   Slum survey IN PROGRESS: ${slumSurvey?.surveyStatus === 'IN PROGRESS'}`);
      console.log(`[STATUS_SYNC]   Has submitted household surveys: ${completedHouseholdCount > 0}`);
    } else if (
      (slumSurvey?.surveyStatus === 'SUBMITTED' || slumSurvey?.surveyStatus === 'COMPLETED') &&
      completedHouseholdCount > 0 && 
      completedHouseholdCount === totalHouseholds
    ) {
      // Both slum survey is submitted and all household surveys are completed
      newMainStatus = 'COMPLETED';
      console.log(`[STATUS_SYNC] Condition 3: All surveys completed - Status: COMPLETED`);
    } else if (
      slumSurvey?.surveyStatus === 'SUBMITTED' || slumSurvey?.surveyStatus === 'COMPLETED'
    ) {
      // Slum survey completed but not all household surveys are done
      newMainStatus = 'IN PROGRESS';
      console.log(`[STATUS_SYNC] Condition 4: Slum survey done, HH pending - Status: IN PROGRESS`);
    } else if (slumSurvey?.surveyStatus === 'DRAFT' && completedHouseholdCount === 0) {
      // Slum survey is draft and no household surveys submitted
      newMainStatus = 'PENDING';
      console.log(`[STATUS_SYNC] Condition 5: Draft with no HH surveys - Status: PENDING`);
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
    // Initialize household survey progress with total households from slum
    assignment.householdSurveyProgress = {
      completed: 0,
      total: assignment.slum?.totalHouseholds || 0
    };
    await assignment.save();
    
    console.log(`[STATUS_SYNC] Assignment initialized with slumSurveyStatus: NOT STARTED, status: PENDING, householdSurveyProgress: 0/${assignment.slum?.totalHouseholds || 0}`);
    return true;
  } catch (error) {
    console.error(`[STATUS_SYNC] Error initializing assignment status ${assignmentId}:`, error);
    return false;
  }
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
    } else {
      // Initialize cityTownSlumProfile if it doesn't exist
      slumSurvey.cityTownSlumProfile = {
        bplPopulation: bplPopulation,
        bplHouseholds: bplHouseholds
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
    
    // Save the updated slum survey
    await slumSurvey.save();
    
    console.log(`[STATUS_SYNC] Updated demographic population for slum survey: ${slumSurvey._id}`);
    console.log(`[STATUS_SYNC] Updated BPL demographic population:`, {
      bplPopulation: slumSurvey.demographicProfile.bplPopulation,
      numberOfBplHouseholds: slumSurvey.demographicProfile.numberOfBplHouseholds
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
  updateSlumDemographicPopulationFromHouseholdSurveys
};