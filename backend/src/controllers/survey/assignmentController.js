const Assignment = require('../../models/Assignment');
const User = require('../../models/User');
const Slum = require('../../models/Slum');
const SlumSurvey = require('../../models/SlumSurvey');
const { initializeAssignmentStatus, getCanonicalSlumStatus, syncAllAssignmentsForSlum } = require('../../utils/statusSyncHelper');

// Assign slum to surveyor
const assignSlumToSurveyor = async (req, res) => {
  try {
    const { surveyorId, slumId } = req.body;

    // Validate surveyor exists and is a surveyor
    const surveyor = await User.findById(surveyorId);
    if (!surveyor) {
      return res.status(400).json({
        success: false,
        message: 'Surveyor not found.'
      });
    }

    if (surveyor.role !== 'SURVEYOR') {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a surveyor.'
      });
    }

    // Validate slum exists
    const slum = await Slum.findById(slumId);
    if (!slum) {
      return res.status(400).json({
        success: false,
        message: 'Slum not found.'
      });
    }

    // Check if assignment already exists for this surveyor and slum
    const existingAssignment = await Assignment.findOne({
      surveyor: surveyorId,
      slum: slumId
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This slum is already assigned to this surveyor.'
      });
    }

    // Check if slum already has assignments
    const existingAssignments = await Assignment.find({ slum: slumId });
    
    let initialStatusData = {};
    if (existingAssignments.length > 0) {
      // Get the canonical status from existing assignments
      initialStatusData = await getCanonicalSlumStatus(slumId);
    } else {
      // Use default initial values for new slum assignment
      initialStatusData = {
        status: 'PENDING',
        slumSurveyStatus: 'NOT STARTED',
        householdSurveyProgress: { completed: 0, total: 0 } // to be updated with actual total
      };
    }

    // Create assignment with proper initial values
    const assignment = new Assignment({
      surveyor: surveyorId,
      slum: slumId,
      assignedBy: req.user._id,
      status: initialStatusData.status,
      slumSurveyStatus: initialStatusData.slumSurveyStatus,
      householdSurveyProgress: initialStatusData.householdSurveyProgress
    });

    await assignment.save();

    // Update with actual household count
    if (slum) {
      assignment.householdSurveyProgress.total = slum.totalHouseholds || 0;
      await assignment.save();
    }

    // Populate references before returning
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('surveyor', 'name username role')
      .populate('slum', 'name village ward slumType totalHouseholds')
      .populate('assignedBy', 'name username role');

    res.status(201).json({
      success: true,
      message: 'Slum assigned to surveyor successfully.',
      data: populatedAssignment
    });
  } catch (error) {
    console.error('Assign slum error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error assigning slum.'
    });
  }
};

// Get all assignments
const getAllAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, surveyor, slum } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (surveyor) {
      filter.surveyor = surveyor;
    }

    if (slum) {
      filter.slum = slum;
    }

    const assignments = await Assignment.find(filter)
      .populate('surveyor', 'name username role')
      .populate({
        path: 'slum',
        select: 'slumName slumId village ward slumType totalHouseholds area',
        populate: {
          path: 'ward',
          select: 'number name zone'
        }
      })
      .populate('assignedBy', 'name username role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(filter);

    res.json({
      success: true,
      data: assignments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting assignments.'
    });
  }
};

// Get assignment by ID
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('surveyor', 'name username role')
      .populate({
        path: 'slum',
        select: 'slumName slumId village ward slumType totalHouseholds area',
        populate: {
          path: 'ward',
          select: 'number name zone'
        }
      })
      .populate('assignedBy', 'name username role');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Get assignment by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting assignment.'
    });
  }
};

// Get assignments for current user (surveyor) with formatted data
const getMyAssignmentsFormatted = async (req, res) => {
  try {
    const assignments = await Assignment.find({ surveyor: req.user._id })
      .populate('slum')
      .sort({ createdAt: -1 });

    // Format assignments for surveyor dashboard
    const formattedAssignments = assignments.map((assignment) => ({
      _id: assignment._id,
      slumId: assignment.slum._id,
      slumName: assignment.slum.name,
      householdCount: assignment.slum.totalHouseholds || 0,
      surveyStatus: assignment.slumSurveyStatus, // Now this will be properly synchronized
      householdProgress: assignment.householdSurveyProgress || { completed: 0, total: 0 }
    }));

    res.json({
      success: true,
      data: formattedAssignments
    });
  } catch (error) {
    console.error('Get my assignments formatted error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting assignments.'
    });
  }
};

// Get assignments for a specific surveyor
const getMyAssignments = async (req, res) => {
  try {
    const SlumSurvey = require('../../models/SlumSurvey');
    const HouseholdSurvey = require('../../models/HouseholdSurvey');
    const Slum = require('../../models/Slum');

    const assignments = await Assignment.find({ surveyor: req.user._id })
      .populate({
        path: 'slum',
        select: 'slumName slumId village ward slumType totalHouseholds area',
        populate: {
          path: 'ward',
          select: 'number name zone'
        }
      })
      .sort({ createdAt: -1 });

    // Calculate survey progress for each assignment
    const assignmentsWithProgress = await Promise.all(assignments.map(async (assignment) => {
      let slumSurveyStatus = 'NOT_STARTED';
      let householdSurveyProgress = { completed: 0, total: 0 };

      // Check Slum Survey status and completion
      const slumSurvey = await SlumSurvey.findOne({
        slum: assignment.slum._id,
        surveyor: req.user._id
      });

      let slumSurveyCompletion = 0;
      if (slumSurvey) {
        slumSurveyStatus = slumSurvey.surveyStatus || 'DRAFT';
        slumSurveyCompletion = slumSurvey.completionPercentage || 0;

        // Use the assignment's stored status which should be kept in sync
        // This ensures we use the authoritative status from the assignment record
        slumSurveyStatus = assignment.slumSurveyStatus || slumSurveyStatus;
      }

      // Calculate progress for this specific assignment (for display purposes in response)
      // but don't update the assignment record here - that's managed by sync functions
      const householdSurveys = await HouseholdSurvey.find({
        slum: assignment.slum._id
      });

      // Get total households in the slum
      const totalHouseholds = assignment.slum?.totalHouseholds || 0;

      // Count only household surveys with SUBMITTED or COMPLETED status across ALL surveyors
      const submittedHouseholdSurveys = householdSurveys.filter(hs =>
        hs.surveyStatus === 'SUBMITTED' || hs.surveyStatus === 'COMPLETED'
      );

      householdSurveyProgress = {
        completed: submittedHouseholdSurveys.length,
        total: totalHouseholds
      };

      // Note: We don't save this progress to the assignment record here
      // because it's just for display purposes in the response
      // The assignment record's progress is managed by sync functions
      
      // Get all surveyors assigned to this slum for inter-communication
      const allAssignmentsForSlum = await Assignment.find({ slum: assignment.slum._id })
        .populate('surveyor', 'name username');
      
      const assignedSurveyors = allAssignmentsForSlum.map(a => ({
        _id: a.surveyor._id,
        name: a.surveyor.name,
        username: a.surveyor.username
      }));

      return {
        ...assignment.toObject(),
        slumSurveyStatus,
        slumSurveyCompletion,
        householdSurveyProgress,
        assignedSurveyors
      };
    }));

    res.json({
      success: true,
      data: assignmentsWithProgress
    });
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting assignments.'
    });
  }
};

// Update assignment slum survey status
const updateSlumSurveyStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    assignment.slumSurveyStatus = status;
    await assignment.save();

    // Synchronize status across all assignments for this slum
    await syncAllAssignmentsForSlum(assignment.slum, { slumSurveyStatus: status });

    res.json({
      success: true,
      message: 'Slum survey status updated',
      data: assignment
    });
  } catch (error) {
    console.error('Update slum survey status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating survey status'
    });
  }
};

// Update household survey progress
const updateHouseholdProgress = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { completed, total } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    assignment.householdSurveyProgress = { completed, total };
    await assignment.save();

    // Synchronize progress across all assignments for this slum
    await syncAllAssignmentsForSlum(assignment.slum, { householdSurveyProgress: { completed, total } });

    res.json({
      success: true,
      message: 'Household progress updated',
      data: assignment
    });
  } catch (error) {
    console.error('Update household progress error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating progress'
    });
  }
};


// Get assignments for a specific surveyor
const getAssignmentsForSurveyor = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists and is a surveyor
    const user = await User.findById(userId);
    if (!user || user.role !== 'SURVEYOR') {
      return res.status(400).json({
        success: false,
        message: 'User not found or is not a surveyor.'
      });
    }

    const assignments = await Assignment.find({ surveyor: userId })
      .populate({
        path: 'slum',
        select: 'slumName slumId village ward slumType totalHouseholds area',
        populate: {
          path: 'ward',
          select: 'number name zone'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get assignments for surveyor error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting assignments.'
    });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, surveyor, slum } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.'
      });
    }

    // Update fields if provided
    if (status) {
      assignment.status = status;
      if (status === 'COMPLETED') {
        assignment.completedAt = new Date();
      } else if (status === 'PENDING') {
        assignment.completedAt = null;
      }
    }


    if (surveyor) {
      assignment.surveyor = surveyor;
    }

    if (slum) {
      assignment.slum = slum;
    }

    await assignment.save();

    // Synchronize status across all assignments for this slum if status was updated
    if (status) {
      await syncAllAssignmentsForSlum(assignment.slum, { status: status });
    }

    // Populate the updated assignment with user and slum data
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('surveyor', 'name username role')
      .populate('slum', 'name village ward slumType totalHouseholds')
      .populate('assignedBy', 'name username role');

    res.json({
      success: true,
      message: 'Assignment updated successfully.',
      data: populatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating assignment.'
    });
  }
};



const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.'
      });
    }

    await Assignment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Assignment deleted successfully.'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting assignment.'
    });
  }
};

// Update assignment status
const updateAssignmentStatus = async (req, res) => {
  try {
    const { status, progress } = req.body;
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.'
      });
    }

    // Update status and progress if provided
    if (status) {
      assignment.status = status;
      if (status === 'COMPLETED') {
        assignment.completedAt = new Date();
      } else if (status === 'PENDING') {
        assignment.completedAt = null;
      }
    }

    if (progress !== undefined) {
      assignment.progress = Math.min(100, Math.max(0, progress)); // Ensure progress is between 0-100
    }

    await assignment.save();

    // Synchronize status across all assignments for this slum if status was updated
    if (status) {
      await syncAllAssignmentsForSlum(assignment.slum, { status: status });
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully.',
      data: assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating assignment.'
    });
  }
};

/**
 * Manual status update by Supervisor/Admin
 * Allows explicit status changes for assignments and slum surveys
 */
const updateAssignmentManualStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      assignmentStatus, // 'PENDING' | 'IN PROGRESS' | 'COMPLETED'
      slumSurveyStatus, // 'NOT STARTED' | 'IN PROGRESS' | 'SUBMITTED'
      completedAt, // Optional: custom completion date
    } = req.body;

    // Validate input
    if (!assignmentStatus && !slumSurveyStatus) {
      return res.status(400).json({
        success: false,
        message: 'At least one status field (assignmentStatus or slumSurveyStatus) must be provided.'
      });
    }

    // Validate assignment status values
    const validAssignmentStatuses = ['PENDING', 'IN PROGRESS', 'COMPLETED'];
    if (assignmentStatus && !validAssignmentStatuses.includes(assignmentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid assignment status. Must be one of: ${validAssignmentStatuses.join(', ')}`
      });
    }

    // Validate slum survey status values
    const validSlumSurveyStatuses = ['NOT STARTED', 'IN PROGRESS', 'SUBMITTED'];
    if (slumSurveyStatus && !validSlumSurveyStatuses.includes(slumSurveyStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid slum survey status. Must be one of: ${validSlumSurveyStatuses.join(', ')}`
      });
    }

    // Find assignment
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.'
      });
    }

    // Track what changed for sync
    const syncData = {};

    // Update assignment status if provided
    if (assignmentStatus) {
      assignment.status = assignmentStatus;
      assignment.completedAt = assignmentStatus === 'COMPLETED' ? completedAt || new Date() : null;
      syncData.status = assignmentStatus;
    }

    // Update slum survey status if provided
    if (slumSurveyStatus) {
      assignment.slumSurveyStatus = slumSurveyStatus;
      syncData.slumSurveyStatus = slumSurveyStatus;

      // Also update the actual SlumSurvey model to keep it in sync
      const slumSurvey = await SlumSurvey.findOne({ slum: assignment.slum });

      if (slumSurvey) {
        // Map assignment slumSurveyStatus to slum survey surveyStatus
        if (slumSurveyStatus === 'SUBMITTED') {
          slumSurvey.surveyStatus = 'SUBMITTED';
        } else if (slumSurveyStatus === 'IN PROGRESS') {
          slumSurvey.surveyStatus = 'IN PROGRESS';
        } else if (slumSurveyStatus === 'NOT STARTED') {
          slumSurvey.surveyStatus = 'DRAFT';
        }

        await slumSurvey.save();
      }
    }

    // Save assignment
    await assignment.save();

    // Sync status across all assignments for this slum
    if (Object.keys(syncData).length > 0) {
      await syncAllAssignmentsForSlum(assignment.slum, syncData);
    }

    // Populate and return updated assignment
    const populatedAssignment = await Assignment.findById(id)
      .populate('surveyor', 'name username role')
      .populate({
        path: 'slum',
        select: 'slumName slumId village ward slumType totalHouseholds area',
        populate: {
          path: 'ward',
          select: 'number name zone'
        }
      })
      .populate('assignedBy', 'name username role');

    res.json({
      success: true,
      message: 'Assignment status updated successfully.',
      data: populatedAssignment
    });
  } catch (error) {
    console.error('Manual status update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating assignment status.'
    });
  }
};

module.exports = {
  assignSlumToSurveyor,
  getAllAssignments,
  getAssignmentById,
  getMyAssignments,
  getAssignmentsForSurveyor,
  getMyAssignmentsFormatted,
  updateSlumSurveyStatus,
  updateHouseholdProgress,
  updateAssignmentStatus,
  updateAssignment,
  deleteAssignment,
  updateAssignmentManualStatus
};