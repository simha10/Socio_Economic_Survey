const Slum = require('../../models/Slum');
const State = require('../../models/State');
const District = require('../../models/District');

// Create a new slum
const createSlum = async (req, res) => {
  try {
    console.log('[DEBUG] Create slum request received:', {
      body: req.body,
      userId: req.user._id,
      userRole: req.user.role
    });
    
    const { name, location, state: stateId, district: districtId, city, ward, slumType, landOwnership, totalHouseholds } = req.body;

    // Validate that state and district exist
    const state = await State.findById(stateId);
    if (!state) {
      console.log('[DEBUG] Invalid state ID provided for creation:', stateId);
      return res.status(400).json({
        success: false,
        message: 'Invalid state ID.'
      });
    }

    const district = await District.findById(districtId);
    if (!district) {
      console.log('[DEBUG] Invalid district ID provided for creation:', districtId);
      return res.status(400).json({
        success: false,
        message: 'Invalid district ID.'
      });
    }

    // Check if district belongs to the specified state
    if (district.state.toString() !== stateId.toString()) {
      console.log('[DEBUG] District does not belong to state for creation:', { districtState: district.state, providedState: stateId });
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
    
    console.log('[DEBUG] Slum saved to database:', slum._id);

    // Populate the references before returning
    const populatedSlum = await Slum.findById(slum._id)
      .populate('state', 'name code')
      .populate('district', 'name code')
      .populate('createdBy', 'name username');
      
    console.log('[DEBUG] Created slum with populated data:', populatedSlum._id);

    res.status(201).json({
      success: true,
      message: 'Slum created successfully.',
      data: populatedSlum
    });
  } catch (error) {
    console.error('Create slum error:', error);
    console.error('Create slum error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating slum.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all slums
const getAllSlums = async (req, res) => {
  try {
    console.log('[DEBUG] Get all slums request received:', {
      query: req.query,
      userId: req.user._id,
      userRole: req.user.role
    });
    
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
    
    console.log('[DEBUG] Slums query filter:', filter);

    const slums = await Slum.find(filter)
      .populate('state', 'name code')
      .populate('district', 'name code')
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    console.log('[DEBUG] Retrieved slums count:', slums.length);

    const total = await Slum.countDocuments(filter);
    
    console.log('[DEBUG] Total slums count:', total);

    res.json({
      success: true,
      data: slums,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get all slums error:', error);
    console.error('Get all slums error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting slums.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get slum by ID
const getSlumById = async (req, res) => {
  try {
    console.log('[DEBUG] Get slum by ID request received:', {
      slumId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role
    });
    
    const slum = await Slum.findById(req.params.id)
      .populate('state', 'name code')
      .populate('district', 'name code')
      .populate('createdBy', 'name username');

    if (!slum) {
      console.log('[DEBUG] Slum not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Slum not found.'
      });
    }
    
    console.log('[DEBUG] Retrieved slum:', slum._id);

    res.json({
      success: true,
      data: slum
    });
  } catch (error) {
    console.error('Get slum by ID error:', error);
    console.error('Get slum by ID error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting slum.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update slum
const updateSlum = async (req, res) => {
  try {
    console.log('[DEBUG] Update slum request received:', {
      slumId: req.params.id,
      body: req.body,
      userId: req.user._id,
      userRole: req.user.role
    });
    
    const { name, location, state: stateId, district: districtId, city, ward, slumType, landOwnership, totalHouseholds } = req.body;

    const slum = await Slum.findById(req.params.id);
    if (!slum) {
      console.log('[DEBUG] Slum not found for update:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Slum not found.'
      });
    }
    
    console.log('[DEBUG] Found existing slum:', slum._id, 'with status:', slum.surveyStatus);

    // Prevent editing if slum survey is already submitted
    if (slum.surveyStatus === 'SUBMITTED') {
      console.log('[DEBUG] Attempt to update submitted slum blocked:', slum._id);
      return res.status(400).json({
        success: false,
        message: 'Cannot edit slum after survey has been submitted.'
      });
    }

    // Validate state and district if provided
    if (stateId) {
      console.log('[DEBUG] Validating state:', stateId);
      const state = await State.findById(stateId);
      if (!state) {
        console.log('[DEBUG] Invalid state ID provided:', stateId);
        return res.status(400).json({
          success: false,
          message: 'Invalid state ID.'
        });
      }
    }

    if (districtId) {
      console.log('[DEBUG] Validating district:', districtId);
      const district = await District.findById(districtId);
      if (!district) {
        console.log('[DEBUG] Invalid district ID provided:', districtId);
        return res.status(400).json({
          success: false,
          message: 'Invalid district ID.'
        });
      }

      if (stateId && district.state.toString() !== stateId.toString()) {
        console.log('[DEBUG] District does not belong to state:', { districtState: district.state, providedState: stateId });
        return res.status(400).json({
          success: false,
          message: 'District does not belong to the specified state.'
        });
      }
    }

    // Prepare update fields
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
    
    console.log('[DEBUG] Updating slum with fields:', updatedFields);

    const updatedSlum = await Slum.findByIdAndUpdate(
      req.params.id,
      { ...updatedFields },
      { new: true, runValidators: true }
    )
      .populate('state', 'name code')
      .populate('district', 'name code')
      .populate('createdBy', 'name username');
      
    console.log('[DEBUG] Successfully updated slum:', updatedSlum._id);

    res.json({
      success: true,
      message: 'Slum updated successfully.',
      data: updatedSlum
    });
  } catch (error) {
    console.error('Update slum error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating slum.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete slum (only if survey is in draft status)
const deleteSlum = async (req, res) => {
  try {
    console.log('[DEBUG] Delete slum request received:', {
      slumId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role
    });
    
    const slum = await Slum.findById(req.params.id);
    if (!slum) {
      console.log('[DEBUG] Slum not found for deletion:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Slum not found.'
      });
    }
    
    console.log('[DEBUG] Checking slum status for deletion:', { slumId: slum._id, status: slum.surveyStatus });

    // Only allow deletion if survey is in draft status
    if (slum.surveyStatus !== 'DRAFT') {
      console.log('[DEBUG] Cannot delete slum, survey already submitted:', slum._id);
      return res.status(400).json({
        success: false,
        message: 'Cannot delete slum after survey has been submitted.'
      });
    }

    await Slum.findByIdAndDelete(req.params.id);
    
    console.log('[DEBUG] Slum deleted successfully:', req.params.id);

    res.json({
      success: true,
      message: 'Slum deleted successfully.'
    });
  } catch (error) {
    console.error('Delete slum error:', error);
    console.error('Delete slum error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting slum.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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