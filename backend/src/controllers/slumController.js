const Slum = require('../models/Slum');
const State = require('../models/State');
const District = require('../models/District');

exports.createSlum = async (req, res) => {
  try {
    const { name, location, state, district, city, ward, slumType, landOwnership, totalHouseholds } = req.body;

    // Verify user is admin or supervisor
    if (!['ADMIN', 'SUPERVISOR'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and supervisors can create slums'
      });
    }

    // Validate state and district exist
    const stateDoc = await State.findById(state);
    if (!stateDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state ID'
      });
    }

    const districtDoc = await District.findById(district);
    if (!districtDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid district ID'
      });
    }

    const newSlum = new Slum({
      name,
      location,
      state,
      district,
      city,
      ward,
      slumType,
      landOwnership,
      totalHouseholds: totalHouseholds || 0,
      surveyStatus: 'DRAFT',
      createdBy: req.user._id
    });

    await newSlum.save();
    await newSlum.populate([
      { path: 'state', select: 'name code' },
      { path: 'district', select: 'name code' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Slum created successfully',
      data: newSlum
    });
  } catch (error) {
    console.error('Error creating slum:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating slum',
      error: error.message
    });
  }
};

exports.listSlums = async (req, res) => {
  try {
    const { state, district, city } = req.query;

    const query = {};
    if (state) query.state = state;
    if (district) query.district = district;
    if (city) query.city = city;

    const slums = await Slum.find(query)
      .populate('state', 'name code')
      .populate('district', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: slums
    });
  } catch (error) {
    console.error('Error listing slums:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing slums',
      error: error.message
    });
  }
};

exports.getSlumById = async (req, res) => {
  try {
    const { slumId } = req.params;

    const slum = await Slum.findById(slumId)
      .populate('state', 'name code')
      .populate('district', 'name code')
      .populate('createdBy', 'name username role');

    if (!slum) {
      return res.status(404).json({
        success: false,
        message: 'Slum not found'
      });
    }

    res.json({
      success: true,
      data: slum
    });
  } catch (error) {
    console.error('Error getting slum:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting slum',
      error: error.message
    });
  }
};

exports.updateSlum = async (req, res) => {
  try {
    const { slumId } = req.params;
    const { name, location, city, ward, slumType, landOwnership, totalHouseholds } = req.body;

    // Verify user is admin or supervisor
    if (!['ADMIN', 'SUPERVISOR'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and supervisors can update slums'
      });
    }

    const slum = await Slum.findByIdAndUpdate(
      slumId,
      { name, location, city, ward, slumType, landOwnership, totalHouseholds },
      { new: true }
    ).populate('state', 'name code').populate('district', 'name code');

    if (!slum) {
      return res.status(404).json({
        success: false,
        message: 'Slum not found'
      });
    }

    res.json({
      success: true,
      message: 'Slum updated successfully',
      data: slum
    });
  } catch (error) {
    console.error('Error updating slum:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating slum',
      error: error.message
    });
  }
};

exports.deleteSlum = async (req, res) => {
  try {
    const { slumId } = req.params;

    // Verify user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete slums'
      });
    }

    const slum = await Slum.findByIdAndDelete(slumId);
    if (!slum) {
      return res.status(404).json({
        success: false,
        message: 'Slum not found'
      });
    }

    res.json({
      success: true,
      message: 'Slum deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting slum:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting slum',
      error: error.message
    });
  }
};
