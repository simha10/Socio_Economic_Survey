const State = require('../models/State');
const District = require('../models/District');
const Ward = require('../models/Ward');

// Get all states
const getStates = async (req, res) => {
  try {
    const states = await State.find({}).sort({ name: 1 });

    res.json({
      success: true,
      data: states
    });
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting states.'
    });
  }
};

// Get state by ID
const getStateById = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'State not found.'
      });
    }

    res.json({
      success: true,
      data: state
    });
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting state.'
    });
  }
};

// Get all districts
const getDistricts = async (req, res) => {
  try {
    const { stateId } = req.query;
    let districts;

    if (stateId) {
      districts = await District.find({ state: stateId }).populate('state').sort({ name: 1 });
    } else {
      districts = await District.find({}).populate('state').sort({ name: 1 });
    }

    res.json({
      success: true,
      data: districts
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting districts.'
    });
  }
};

// Get district by ID
const getDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id).populate('state');

    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'District not found.'
      });
    }

    res.json({
      success: true,
      data: district
    });
  } catch (error) {
    console.error('Get district error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting district.'
    });
  }
};

// Get districts by state ID
const getDistrictsByState = async (req, res) => {
  try {
    const { stateId } = req.params;

    let query = { state: stateId };

    // Check if stateId is a valid ObjectId
    const mongoose = require('mongoose');
    const isValidObjectId = mongoose.Types.ObjectId.isValid(stateId);

    if (!isValidObjectId) {
      // If not a valid ObjectId, try to find state by code or name
      const state = await State.findOne({
        $or: [
          { code: stateId.toUpperCase() },
          { name: stateId.toUpperCase() }
        ]
      });

      if (state) {
        query = { state: state._id };
      } else {
        // If state not found by code/name, return empty list or 404
        // Returning empty list to be safe, or we could error out
        return res.status(404).json({
          success: false,
          message: 'State not found.'
        });
      }
    }

    const districts = await District.find(query).sort({ name: 1 });

    res.json({
      success: true,
      data: districts
    });
  } catch (error) {
    console.error('Get districts by state error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting districts by state.'
    });
  }
};

// Get all wards
const getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find({})
      .populate('district', 'name code')
      .sort({ number: 1 });

    res.json({
      success: true,
      data: wards
    });
  } catch (error) {
    console.error('Get wards error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting wards.'
    });
  }
};

module.exports = {
  getStates,
  getStateById,
  getDistricts,
  getDistrictById,
  getDistrictsByState,
  getAllWards
};