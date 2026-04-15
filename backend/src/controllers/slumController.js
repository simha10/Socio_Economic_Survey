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
      surveyStatus: 'PENDING',
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
    const { name, stateCode, distCode, cityTownCode, ward, slumType, village, landOwnership, totalHouseholds, area, surveyStatus } = req.body;

    console.log("\n========== [SLUM UPDATE CONTROLLER] START ==========");
    console.log("[SLUM UPDATE] Request params - slumId:", slumId);
    console.log("[SLUM UPDATE] Request body:", JSON.stringify(req.body, null, 2));
    console.log("[SLUM UPDATE] User role:", req.user.role);
    console.log("[SLUM UPDATE] surveyStatus from request:", surveyStatus);

    // Verify user is admin or supervisor
    if (!['ADMIN', 'SUPERVISOR'].includes(req.user.role)) {
      console.log("[SLUM UPDATE] ❌ Access denied - insufficient role");
      return res.status(403).json({
        success: false,
        message: 'Only admins and supervisors can update slums'
      });
    }

    // Map frontend field names to model field names
    const updateData = { 
      slumName: name, // Map 'name' to 'slumName'
      stateCode, 
      distCode, 
      cityTownCode, 
      ward, 
      slumType, 
      village, 
      landOwnership, 
      totalHouseholds, 
      area 
    };
    
    // Admin can update surveyStatus - check if surveyStatus is provided in the request
    if (req.user.role === 'ADMIN' && surveyStatus !== undefined && surveyStatus !== null && surveyStatus !== '') {
      updateData.surveyStatus = surveyStatus;
      console.log('[SLUM UPDATE] ✅ Admin updating surveyStatus to:', surveyStatus);
      console.log('[SLUM UPDATE] User role check - req.user.role:', req.user.role);
      console.log('[SLUM UPDATE] Is ADMIN?', req.user.role === 'ADMIN');
    } else {
      console.log('[SLUM UPDATE] ❌ surveyStatus NOT included in update');
      console.log('[SLUM UPDATE] Reason: role =', req.user.role, ', surveyStatus =', surveyStatus);
      console.log('[SLUM UPDATE] Condition check:');
      console.log('  - Is ADMIN?', req.user.role === 'ADMIN');
      console.log('  - surveyStatus !== undefined?', surveyStatus !== undefined);
      console.log('  - surveyStatus !== null?', surveyStatus !== null);
      console.log('  - surveyStatus !== empty?', surveyStatus !== '');
    }

    console.log('[SLUM UPDATE] Final updateData being sent to MongoDB:', JSON.stringify(updateData, null, 2));

    // Check if surveyStatus is in the updateData
    if (updateData.surveyStatus) {
      console.log('[SLUM UPDATE] ✅ surveyStatus IS in updateData:', updateData.surveyStatus);
      console.log('[SLUM UPDATE] surveyStatus type:', typeof updateData.surveyStatus);
      console.log('[SLUM UPDATE] surveyStatus length:', updateData.surveyStatus.length);
    } else {
      console.log('[SLUM UPDATE] ❌ surveyStatus is NOT in updateData');
    }

    console.log('[SLUM UPDATE] Finding slum by ID...');
    const slum = await Slum.findById(slumId);
    
    if (!slum) {
      console.log('[SLUM UPDATE] ❌ Slum not found');
      return res.status(404).json({
        success: false,
        message: 'Slum not found'
      });
    }

    console.log('[SLUM UPDATE] Current slum surveyStatus:', slum.surveyStatus);
    console.log('[SLUM UPDATE] Applying updates...');
    
    // Apply updates manually
    Object.keys(updateData).forEach(key => {
      console.log(`[SLUM UPDATE] Setting ${key} =`, updateData[key]);
      slum[key] = updateData[key];
    });

    console.log('[SLUM UPDATE] Saving slum to database...');
    await slum.save();
    console.log('[SLUM UPDATE] Save completed successfully');
    console.log('[SLUM UPDATE] Updated slum surveyStatus:', slum.surveyStatus);
    console.log("========== [SLUM UPDATE CONTROLLER] END ==========\n");

    res.json({
      success: true,
      message: 'Slum updated successfully',
      data: slum
    });
  } catch (error) {
    console.error('[SLUM UPDATE] ❌ Error:', error);
    console.log("========== [SLUM UPDATE CONTROLLER] END (ERROR) ==========\n");
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
