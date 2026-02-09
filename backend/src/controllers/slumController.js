const Slum = require('../models/Slum');

exports.createSlum = async (req, res) => {
  try {
    const { name, slumId, stateCode, distCode, cityTownCode, ward, slumType, village, landOwnership, totalHouseholds, area } = req.body;

    // Verify user is admin or supervisor
    if (!['ADMIN', 'SUPERVISOR'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and supervisors can create slums'
      });
    }

    const newSlum = new Slum({
      name,
      slumId,
      stateCode,
      distCode,
      cityTownCode,
      ward,
      slumType,
      village: village || '',
      landOwnership: landOwnership || '',
      totalHouseholds: totalHouseholds || 0,
      area: area || 0,
      surveyStatus: 'DRAFT',
      createdBy: req.user._id
    });

    await newSlum.save();

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
    const { stateCode, distCode, city, slumType, loadAll } = req.query;

    const query = {};
    if (stateCode) query.stateCode = stateCode;
    if (distCode) query.distCode = distCode;
    if (city) query.city = city;
    if (slumType) query.slumType = slumType;

    let slums;
    
    if (loadAll === 'true') {
      slums = await Slum.find(query).sort({ slumId: 1 });
    } else {
      slums = await Slum.find(query).sort({ createdAt: -1 });
    }

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

    const slum = await Slum.findById(slumId).populate('createdBy', 'name username role');

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
    const { name, stateCode, distCode, cityTownCode, ward, slumType, village, landOwnership, totalHouseholds, area } = req.body;

    // Verify user is admin or supervisor
    if (!['ADMIN', 'SUPERVISOR'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and supervisors can update slums'
      });
    }

    const slum = await Slum.findByIdAndUpdate(
      slumId,
      { name, stateCode, distCode, cityTownCode, ward, slumType, village, landOwnership, totalHouseholds, area },
      { new: true }
    );

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
