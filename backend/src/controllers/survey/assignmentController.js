const Assignment = require('../../models/Assignment');
const User = require('../../models/User');
const Slum = require('../../models/Slum');

// Assign slum to surveyor
const assignSlumToSurveyor = async (req, res) => {
  try {
    const { surveyorId, slumId, assignmentType = 'FULL_SLUM' } = req.body;

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

    // Check if slum is already assigned to ANY surveyor
    const slumAlreadyAssigned = await Assignment.findOne({
      slum: slumId
    });

    if (slumAlreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: 'This slum is already assigned to another surveyor. A slum can only be assigned to one surveyor.'
      });
    }

    // Create assignment
    const assignment = new Assignment({
      surveyor: surveyorId,
      slum: slumId,
      assignmentType,
      assignedBy: req.user._id
    });

    await assignment.save();

    // Populate references before returning
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('surveyor', 'name username role')
      .populate('slum', 'name location city ward')
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
      .populate('slum', 'name location city ward')
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
      .populate('slum', 'name location city ward')
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
      surveyStatus: assignment.slumSurveyStatus,
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
      .populate('slum', 'name location city ward slumType totalHouseholds')
      .sort({ createdAt: -1 });

    // Calculate survey progress for each assignment
    const assignmentsWithProgress = await Promise.all(assignments.map(async (assignment) => {
      let slumSurveyStatus = 'NOT_STARTED';
      let householdSurveyProgress = { completed: 0, total: 0 };

      // Check Slum Survey status
      const slumSurvey = await SlumSurvey.findOne({
        slum: assignment.slum._id,
        surveyor: req.user._id
      });

      if (slumSurvey) {
        slumSurveyStatus = 'COMPLETED';
      }

      // Check Household Survey progress
      const householdSurveys = await HouseholdSurvey.find({
        surveyor: req.user._id
      }).populate('household', 'slum');

      // Filter household surveys for this slum
      const slumHouseholdSurveys = householdSurveys.filter(
        hs => hs.household?.slum?.toString() === assignment.slum._id.toString()
      );

      // Get total households in the slum
      const totalHouseholds = assignment.slum?.totalHouseholds || 0;

      householdSurveyProgress = {
        completed: slumHouseholdSurveys.length,
        total: totalHouseholds
      };

      return {
        ...assignment.toObject(),
        slumSurveyStatus,
        householdSurveyProgress
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
      .populate('slum', 'name location city ward slumType')
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
    const { status, assignmentType, surveyor, slum } = req.body;

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

    if (assignmentType) {
      assignment.assignmentType = assignmentType;
    }

    if (surveyor) {
      assignment.surveyor = surveyor;
    }

    if (slum) {
      assignment.slum = slum;
    }

    await assignment.save();

    // Populate the updated assignment with user and slum data
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('surveyor', 'name username role')
      .populate('slum', 'name location city ward')
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

module.exports = {
  assignSlumToSurveyor,
  getAllAssignments,
  getAssignmentById,
  getMyAssignments,
  getAssignmentsForSurveyor,
  getMyAssignmentsFormatted,
  updateSlumSurveyStatus,
  updateAssignmentStatus,
  updateAssignment,
  deleteAssignment
};