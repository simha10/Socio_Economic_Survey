const Slum = require('../../models/Slum');
const State = require('../../models/State');
const District = require('../../models/District');

// Create a new slum
const createSlum = async (req, res) => {
  try {
    const { name, location, state: stateId, district: districtId, city, ward, slumType, landOwnership, totalHouseholds } = req.body;

    // Validate that state and district exist
    const state = await State.findById(stateId);
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state ID.'
      });
    }

    const district = await District.findById(districtId);
    if (!district) {
      return res.status(400).json({
        success: false,
        message: 'Invalid district ID.'
      });
    }

    // Check if district belongs to the specified state
    if (district.state.toString() !== stateId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'District does not belong to the specified state.'
      });
    }

    // Create new slum
    const slum = new Slum({
      name,
      location,
      state: stateId,
      district: districtId,
      city,
      ward,
      slumType,
      landOwnership,
      totalHouseholds: totalHouseholds || 0,
      createdBy: req.user._id
    });

    await slum.save();

    // Populate the references before returning
    const populatedSlum = await Slum.findById(slum._id)
      .populate('state', 'name code')
      .populate('district', 'name')
      .populate('createdBy', 'name username');

    res.status(201).json({
      success: true,
      message: 'Slum created successfully.',
      data: populatedSlum
    });
  } catch (error) {
    console.error('Create slum error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating slum.'
    });
  }
};

// Get all slums
const getAllSlums = async (req, res) => {
  try {
    const { page = 1, limit = 10, state, district, search } = req.query;
    
    let filter = {};
    
    if (state) {
      filter.state = state;
    }
    
    if (district) {
      filter.district = district;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const slums = await Slum.find(filter)
      .populate('state', 'name code')
      .populate('district', 'name')
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Slum.countDocuments(filter);

    res.json({
      success: true,
      data: slums,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get all slums error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting slums.'
    });
  }
};

// Get slum by ID
const getSlumById = async (req, res) => {
  try {
    const slum = await Slum.findById(req.params.id)
      .populate('state', 'name code')
      .populate('district', 'name')
      .populate('createdBy', 'name username');

    if (!slum) {
      return res.status(404).json({
        success: false,
        message: 'Slum not found.'
      });
    }

    res.json({
      success: true,
      data: slum
    });
  } catch (error) {
    console.error('Get slum by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting slum.'
    });
  }
};

// Update slum
const updateSlum = async (req, res) => {
  try {
    const { name, location, state: stateId, district: districtId, city, ward, slumType, landOwnership, totalHouseholds } = req.body;

    const slum = await Slum.findById(req.params.id);
    if (!slum) {
      return res.status(404).json({
        success: false,
        message: 'Slum not found.'
      });
    }

    // Prevent editing if slum survey is already submitted
    if (slum.surveyStatus === 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit slum after survey has been submitted.'
      });
    }

    // Validate state and district if provided
    if (stateId) {
      const state = await State.findById(stateId);
      if (!state) {
        return res.status(400).json({
          success: false,
          message: 'Invalid state ID.'
        });
      }
    }

    if (districtId) {
      const district = await District.findById(districtId);
      if (!district) {
        return res.status(400).json({
          success: false,
          message: 'Invalid district ID.'
        });
      }

      if (stateId && district.state.toString() !== stateId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'District does not belong to the specified state.'
        });
      }
    }

    // Update slum
    const updatedFields = {
      name,
      location,
      city,
      ward,
      slumType,
      landOwnership,
      totalHouseholds
    };

    if (stateId) updatedFields.state = stateId;
    if (districtId) updatedFields.district = districtId;

    const updatedSlum = await Slum.findByIdAndUpdate(
      req.params.id,
      { ...updatedFields },
      { new: true, runValidators: true }
    )
      .populate('state', 'name code')
      .populate('district', 'name')
      .populate('createdBy', 'name username');

    res.json({
      success: true,
      message: 'Slum updated successfully.',
      data: updatedSlum
    });
  } catch (error) {
    console.error('Update slum error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating slum.'
    });
  }
};

// Delete slum (only if survey is in draft status)
const deleteSlum = async (req, res) => {
  try {
    const slum = await Slum.findById(req.params.id);
    if (!slum) {
      return res.status(404).json({
        success: false,
        message: 'Slum not found.'
      });
    }

    // Only allow deletion if survey is in draft status
    if (slum.surveyStatus !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete slum after survey has been submitted.'
      });
    }

    await Slum.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Slum deleted successfully.'
    });
  } catch (error) {
    console.error('Delete slum error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting slum.'
    });
  }
};

module.exports = {
  createSlum,
  getAllSlums,
  getSlumById,
  updateSlum,
  deleteSlum
};