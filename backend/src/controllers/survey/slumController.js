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

    // Populate the references before returning
    const populatedSlum = await Slum.findById(slum._id)
      .populate('createdBy', 'name username')
      .populate('ward', 'number name zone');

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

    let slums, total;
    
    // If loadAll parameter is provided, load all slums
    if (loadAll === 'true') {
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
      
      slums = await Slum.find(filter)
        .populate('createdBy', 'name username')
        .populate('ward', 'number name zone')
        .sort({ slumId: 1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
        
      total = await Slum.countDocuments(filter);

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
    const slum = await Slum.findById(req.params.id)
      .populate('createdBy', 'name username')
      .populate('ward', 'number name zone');

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
    const { name, location, stateCode, distCode, city, ward, slumType, landOwnership, totalHouseholds, village, area, ulbCode, ulbName, surveyStatus } = req.body;

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

    // Admin can update surveyStatus
    if (req.user.role === 'ADMIN' && surveyStatus !== undefined && surveyStatus !== null && surveyStatus !== '') {
      updatedFields.surveyStatus = surveyStatus;
    }

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