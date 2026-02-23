const mongoose = require('mongoose');
const Slum = require('../../models/Slum');
const State = require('../../models/State');
const District = require('../../models/District');
const Ward = require('../../models/Ward');

// Create a new slum
const createSlum = async (req, res) => {
  try {

    
    const { name, slumId, location, stateCode, distCode, city, ward, slumType, landOwnership, totalHouseholds, village, area, ulbCode, ulbName } = req.body;

    // Validate required fields
    if (!stateCode) {
      
      return res.status(400).json({
        success: false,
        message: 'State code is required.'
      });
    }

    if (!distCode) {
      
      return res.status(400).json({
        success: false,
        message: 'District code is required.'
      });
    }

    // Handle ward field - if it's provided as a number/string, find the corresponding Ward document
    let wardId = ward;
    if (ward) {
      let wardDoc;
      if (mongoose.Types.ObjectId.isValid(ward)) {
        // If ward is already an ObjectId, use it directly
        wardDoc = await Ward.findById(ward);
      } else {
        // If ward is a number or string, search by the number field
        wardDoc = await Ward.findOne({ number: ward.toString() });
      }
      
      if (wardDoc) {
        wardId = wardDoc._id;
      } else {
        // If no ward is found, return an error
        return res.status(400).json({
          success: false,
          message: 'Ward not found. Please provide a valid ward number.'
        });
      }
    }

    // Create new slum
    const slum = new Slum({
      name,
      slumId,
      location,
      stateCode,
      distCode,
      ulbCode: ulbCode || '',
      ulbName: ulbName || '',
      city,
      ward: wardId,
      slumType,
      landOwnership,
      village: village || '',
      area: area || 0,
      totalHouseholds: totalHouseholds || 0,
      createdBy: req.user._id
    });

    await slum.save();
    
    console.log('[DEBUG] Slum saved to database:', slum._id);

    // Populate the references before returning
    const populatedSlum = await Slum.findById(slum._id)
      .populate('createdBy', 'name username')
      .populate('ward', 'number name zone');
      
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
    
    const { page = 1, limit = 10, stateCode, distCode, search, loadAll } = req.query;
    
    let filter = {};
    
    if (stateCode) {
      filter.stateCode = stateCode;
    }
    
    if (distCode) {
      filter.distCode = distCode;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { slumId: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { ward: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('[DEBUG] Slums query filter:', filter);

    let slums, total;
    
    // If loadAll parameter is provided, load all slums
    if (loadAll === 'true') {
      console.log('[DEBUG] Loading all slums without pagination');
      slums = await Slum.find(filter)
        .populate('createdBy', 'name username')
        .populate('ward', 'number name zone')
        .sort({ slumId: 1 });
        
      total = slums.length;
      
      res.json({
        success: true,
        data: slums,
        total,
        loadAll: true
      });
    } else {
      // Use pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10; // Default to 10 items per page
      
      console.log('[DEBUG] Loading slums with pagination:', { page: pageNum, limit: limitNum });
      
      slums = await Slum.find(filter)
        .populate('createdBy', 'name username')
        .populate('ward', 'number name zone')
        .sort({ slumId: 1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
        
      total = await Slum.countDocuments(filter);
      
      console.log('[DEBUG] Retrieved slums count:', slums.length);
      console.log('[DEBUG] Total slums count:', total);

      res.json({
        success: true,
        data: slums,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        total,
        loadAll: false
      });
    }
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
      .populate('createdBy', 'name username')
      .populate('ward', 'number name zone');

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
    
    const { name, location, stateCode, distCode, city, ward, slumType, landOwnership, totalHouseholds, village, area, ulbCode, ulbName } = req.body;

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

    // Prepare update fields
    const updatedFields = {
      name,
      location,
      city,
      slumType,
      landOwnership,
      totalHouseholds,
      village: village || slum.village,
      area: area !== undefined ? area : slum.area
    };

    // Handle ward field - if it's provided as a number/string, find the corresponding Ward document
    if (ward) {
      // Try to find the Ward by number or ObjectId
      let wardDoc;
      if (mongoose.Types.ObjectId.isValid(ward)) {
        // If ward is already an ObjectId, use it directly
        wardDoc = await Ward.findById(ward);
      } else {
        // If ward is a number or string, search by the number field
        wardDoc = await Ward.findOne({ number: ward.toString() });
      }
      
      if (wardDoc) {
        updatedFields.ward = wardDoc._id;
      } else {
        // If no ward is found, return an error
        return res.status(400).json({
          success: false,
          message: 'Ward not found. Please provide a valid ward number.'
        });
      }
    }

    // Add optional fields if they exist
    if (ulbCode) updatedFields.ulbCode = ulbCode;
    if (ulbName) updatedFields.ulbName = ulbName;

    if (stateCode) updatedFields.stateCode = stateCode;
    if (distCode) updatedFields.distCode = distCode;
    


    const updatedSlum = await Slum.findByIdAndUpdate(
      req.params.id,
      { ...updatedFields },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name username')
      .populate('ward', 'number name zone');
      
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