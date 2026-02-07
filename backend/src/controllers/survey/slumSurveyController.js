const SlumSurvey = require('../../models/SlumSurvey');
const Slum = require('../../models/Slum');
const Ward = require('../../models/Ward');
const District = require('../../models/District');
const State = require('../../models/State');
const Assignment = require('../../models/Assignment');
const { updateSlumStatus, updateAssignmentStatusFromSlumSurvey, updateAssignmentMainStatus } = require('../../utils/statusSyncHelper');
const { sendSuccess, sendError } = require('../../utils/helpers/responseHelper');

/**
 * Create or initialize a slum survey
 */
exports.createOrGetSlumSurvey = async (req, res) => {
    try {
        const { slumId } = req.params;
        const userId = req.user.id || req.user._id;

        // Check if slum exists and populate ward information
        const slum = await Slum.findById(slumId).populate('ward', 'district');
        if (!slum) {
            return sendError(res, 'Slum not found', 404);
        }

        // If ward is populated but doesn't have district info, fetch it separately
        let wardData = slum.ward;
        if (wardData && typeof wardData === 'object' && !wardData.district) {
            // Re-fetch the ward with district populated
            const fullWard = await Ward.findById(slum.ward._id).populate('district', 'state');
            wardData = fullWard;
        } else if (wardData && typeof wardData === 'object' && wardData.district && typeof wardData.district === 'string') {
            // If district is just an ID, populate it
            const fullDistrict = await District.findById(wardData.district).populate('state');
            wardData = {
                _id: wardData._id,
                district: fullDistrict
            };
        }

        // Check if survey already exists
        let survey = await SlumSurvey.findOne({ slum: slumId, surveyor: userId });

        if (!survey) {
            // Validate that slum has required ward reference
            if (!wardData) {
                return sendError(res, 'Slum is missing ward information. Please contact administrator.', 400);
            }

            // Attempt to populate ward data if not already populated
            let finalWardData = wardData;
            if (typeof wardData === 'string' || !wardData.district) {
                // If ward is just an ID or doesn't have district info, fetch the full ward document
                const fullWard = await Ward.findById(wardData);
                if (!fullWard) {
                    return sendError(res, 'Ward information not found. Please contact administrator.', 400);
                }
                
                // Fetch the district for this ward
                if (!fullWard.district) {
                    return sendError(res, 'Ward is missing district information. Please contact administrator.', 400);
                }
                
                finalWardData = fullWard;
            }

            if (!finalWardData.district) {
                return sendError(res, 'Ward is missing district information. Please contact administrator.', 400);
            }

            // Try to get the district document to access the state
            let districtData = finalWardData.district;
            if (typeof finalWardData.district === 'string') {
                // If district is just an ID, fetch the full district document
                districtData = await District.findById(finalWardData.district);
                if (!districtData) {
                    return sendError(res, 'District information not found. Please contact administrator.', 400);
                }
            }

            if (!districtData.state) {
                // Try to find the state using the slum's stateCode as a fallback
                console.log(`[DEBUG] District ${districtData._id} is missing state information. Attempting to find state using slum's stateCode: ${slum.stateCode}`);
                
                // First, try to find state by code
                const stateByCode = await State.findOne({ code: slum.stateCode });
                if (stateByCode) {
                    console.log(`[DEBUG] Found state by code: ${stateByCode._id}`);
                    
                    // Update the district with the state reference
                    districtData.state = stateByCode._id;
                    await District.findByIdAndUpdate(districtData._id, { state: stateByCode._id });
                } else {
                    // If we still can't find the state, try to find it by matching the district
                    const stateForDistrict = await State.findOne({ districts: districtData._id });
                    if (stateForDistrict) {
                        console.log(`[DEBUG] Found state by district reference: ${stateForDistrict._id}`);
                        
                        // Update the district with the state reference
                        districtData.state = stateForDistrict._id;
                        await District.findByIdAndUpdate(districtData._id, { state: stateForDistrict._id });
                    } else {
                        return sendError(res, 'Unable to determine state for district. Please contact administrator to fix data integrity.', 400);
                    }
                }
            }

            // Create new survey with default values and populate required references
            survey = new SlumSurvey({
                slum: slumId,
                surveyor: userId,
                ward: finalWardData._id,
                district: districtData._id,
                state: districtData.state,
                surveyStatus: 'DRAFT',
                // Initialize all sections to prevent validation errors
                economicStatus: {},
                employmentAndOccupation: {},
                healthFacilities: {},
                socialDevelopment: {},
                physicalInfrastructure: {
                    sourceDrinkingWater: {},
                    solidWasteManagement: {}
                },
                demographicProfile: {},
                educationFacilities: {},
                additionalInfrastructure: {
                    waterSupply: {},
                    drainageSewerage: {},
                    roads: {},
                    streetLighting: {},
                    sanitation: {},
                    communityFacilities: {},
                    standaloneInfrastructureRequirements: {}
                }
            });
            await survey.save();
            console.log(`Created new slum survey for slum ${slumId}`);
        }
         
        // Ensure nested objects are properly initialized to prevent validation errors
        if (survey.physicalInfrastructure) {
            if (survey.physicalInfrastructure.sourceDrinkingWater === undefined) {
                survey.physicalInfrastructure.sourceDrinkingWater = {};
            }
            if (survey.physicalInfrastructure.solidWasteManagement === undefined) {
                survey.physicalInfrastructure.solidWasteManagement = {};
            }
        }
        
        if (survey.demographicProfile) {
            const demographicFields = [
                'totalPopulation', 'bplPopulation', 'numberOfHouseholds', 'numberOfBplHouseholds',
                'womenHeadedHouseholds', 'personsOlderThan65Years', 'childLabourers',
                'physicallyChallengedPersons', 'mentallyChallengedPersons', 'personsWithHivAids',
                'personsWithTuberculosis', 'personsWithRespiratoryDiseases', 'personsWithOtherChronicDiseases',
                'totalIlliteratePerson', 'maleIlliterate', 'femaleIlliterate', 'bplIlliteratePerson',
                'maleBplIlliterate', 'femaleBplIlliterate', 'schoolDropoutsMale', 'schoolDropoutsFemale'
            ];
            
            demographicFields.forEach(field => {
                if (survey.demographicProfile[field] === undefined) {
                    survey.demographicProfile[field] = {};
                }
            });
        }
        
        if (survey.educationFacilities) {
            const educationFields = [
                'anganwadiUnderIcds', 'municipalPreschool', 'privatePreschool', 'municipalPrimarySchool',
                'stateGovtPrimarySchool', 'privatePrimarySchool', 'municipalHighSchool',
                'stateGovtHighSchool', 'privateHighSchool', 'adultEducationCentre', 'nonFormalEducationCentre'
            ];
            
            educationFields.forEach(field => {
                if (survey.educationFacilities[field] === undefined) {
                    survey.educationFacilities[field] = {};
                }
            });
        }
        
        if (survey.additionalInfrastructure) {
            if (survey.additionalInfrastructure.waterSupply === undefined) {
                survey.additionalInfrastructure.waterSupply = {};
            }
            if (survey.additionalInfrastructure.drainageSewerage === undefined) {
                survey.additionalInfrastructure.drainageSewerage = {};
            }
            if (survey.additionalInfrastructure.roads === undefined) {
                survey.additionalInfrastructure.roads = {};
            }
            if (survey.additionalInfrastructure.streetLighting === undefined) {
                survey.additionalInfrastructure.streetLighting = {};
            }
            if (survey.additionalInfrastructure.sanitation === undefined) {
                survey.additionalInfrastructure.sanitation = {};
            }
            if (survey.additionalInfrastructure.communityFacilities === undefined) {
                survey.additionalInfrastructure.communityFacilities = {};
            }
            if (survey.additionalInfrastructure.standaloneInfrastructureRequirements === undefined) {
                survey.additionalInfrastructure.standaloneInfrastructureRequirements = {};
            }
        }
        
        // Ensure sections 8-14 are properly initialized
        if (survey.economicStatus === undefined) {
            survey.economicStatus = {};
        }
        
        if (survey.employmentAndOccupation === undefined) {
            survey.employmentAndOccupation = {};
        }
        
        if (survey.healthFacilities === undefined) {
            survey.healthFacilities = {};
        }
        
        if (survey.socialDevelopment === undefined) {
            survey.socialDevelopment = {};
        }
        
        await survey.populate([
            { path: 'slum', select: 'slumName population' },
            { path: 'surveyor', select: 'name ' },
        ]);
         
        sendSuccess(res, survey, 'Slum survey retrieved/created successfully');
    } catch (error) {
        console.error('Error in createOrGetSlumSurvey:', error.message);
        sendError(res, error.message || 'Failed to create/get slum survey', 500);
    }
};

/**
 * Get slum survey by ID
 */
exports.getSlumSurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;

        const survey = await SlumSurvey.findById(surveyId).populate([
            { path: 'slum', select: 'slumName population' },
            { path: 'surveyor', select: 'name ' },
        ]);

        if (!survey) {
            return sendError(res, 'Survey not found', 404);
        }

        // Ensure nested objects are properly initialized to prevent validation errors
        if (survey.physicalInfrastructure) {
            if (survey.physicalInfrastructure.sourceDrinkingWater === undefined) {
                survey.physicalInfrastructure.sourceDrinkingWater = {};
            }
            if (survey.physicalInfrastructure.solidWasteManagement === undefined) {
                survey.physicalInfrastructure.solidWasteManagement = {};
            }
        }
        
        if (survey.demographicProfile) {
            const demographicFields = [
                'totalPopulation', 'bplPopulation', 'numberOfHouseholds', 'numberOfBplHouseholds',
                'womenHeadedHouseholds', 'personsOlderThan65Years', 'childLabourers',
                'physicallyChallengedPersons', 'mentallyChallengedPersons', 'personsWithHivAids',
                'personsWithTuberculosis', 'personsWithRespiratoryDiseases', 'personsWithOtherChronicDiseases',
                'totalIlliteratePerson', 'maleIlliterate', 'femaleIlliterate', 'bplIlliteratePerson',
                'maleBplIlliterate', 'femaleBplIlliterate', 'schoolDropoutsMale', 'schoolDropoutsFemale'
            ];
            
            demographicFields.forEach(field => {
                if (survey.demographicProfile[field] === undefined) {
                    survey.demographicProfile[field] = {};
                }
            });
        }
        
        if (survey.educationFacilities) {
            const educationFields = [
                'anganwadiUnderIcds', 'municipalPreschool', 'privatePreschool', 'municipalPrimarySchool',
                'stateGovtPrimarySchool', 'privatePrimarySchool', 'municipalHighSchool',
                'stateGovtHighSchool', 'privateHighSchool', 'adultEducationCentre', 'nonFormalEducationCentre'
            ];
            
            educationFields.forEach(field => {
                if (survey.educationFacilities[field] === undefined) {
                    survey.educationFacilities[field] = {};
                }
            });
        }
        
        if (survey.additionalInfrastructure) {
            if (survey.additionalInfrastructure.waterSupply === undefined) {
                survey.additionalInfrastructure.waterSupply = {};
            }
            if (survey.additionalInfrastructure.drainageSewerage === undefined) {
                survey.additionalInfrastructure.drainageSewerage = {};
            }
            if (survey.additionalInfrastructure.roads === undefined) {
                survey.additionalInfrastructure.roads = {};
            }
            if (survey.additionalInfrastructure.streetLighting === undefined) {
                survey.additionalInfrastructure.streetLighting = {};
            }
            if (survey.additionalInfrastructure.sanitation === undefined) {
                survey.additionalInfrastructure.sanitation = {};
            }
            if (survey.additionalInfrastructure.communityFacilities === undefined) {
                survey.additionalInfrastructure.communityFacilities = {};
            }
            if (survey.additionalInfrastructure.standaloneInfrastructureRequirements === undefined) {
                survey.additionalInfrastructure.standaloneInfrastructureRequirements = {};
            }
        }
        
        // Ensure sections 8-14 are properly initialized
        if (survey.economicStatus === undefined) {
            survey.economicStatus = {};
        }
        
        if (survey.employmentAndOccupation === undefined) {
            survey.employmentAndOccupation = {};
        }
        
        if (survey.healthFacilities === undefined) {
            survey.healthFacilities = {};
        }
        
        if (survey.socialDevelopment === undefined) {
            survey.socialDevelopment = {};
        }
        
        // Ensure sections 8-14 are properly initialized
        if (survey.economicStatus === undefined) {
            survey.economicStatus = {};
        }
        
        if (survey.employmentAndOccupation === undefined) {
            survey.employmentAndOccupation = {};
        }
        
        if (survey.healthFacilities === undefined) {
            survey.healthFacilities = {};
        }
        
        if (survey.socialDevelopment === undefined) {
            survey.socialDevelopment = {};
        }
        
        sendSuccess(res, survey, 'Survey retrieved successfully');
    } catch (error) {
        console.error('Error in getSlumSurvey:', error.message);
        sendError(res, error.message || 'Failed to get survey', 500);
    }
};

/**
 * Update slum survey (partial update for form sections)
 */
exports.updateSlumSurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const updateData = req.body;
        const userId = req.user.id || req.user._id;

        // Find survey
        const survey = await SlumSurvey.findById(surveyId);
        if (!survey) {
            return sendError(res, 'Survey not found', 404);
        }

        // Check authorization
        if (survey.surveyor.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return sendError(res, 'Not authorized to update this survey', 403);
        }

        // Update survey fields - preserve surveyor name in surveyOperation
        if (updateData.surveyOperation) {
            survey.surveyOperation = { 
                ...survey.surveyOperation, 
                ...updateData.surveyOperation 
            };
            delete updateData.surveyOperation;
        }
        
        // Handle nested objects to prevent validation errors
        Object.assign(survey, updateData);
        
        // Ensure nested objects are properly initialized to prevent validation errors
        if (survey.physicalInfrastructure) {
            if (survey.physicalInfrastructure.sourceDrinkingWater === undefined) {
                survey.physicalInfrastructure.sourceDrinkingWater = {};
            }
            if (survey.physicalInfrastructure.solidWasteManagement === undefined) {
                survey.physicalInfrastructure.solidWasteManagement = {};
            }
        }
        
        if (survey.demographicProfile) {
            const demographicFields = [
                'totalPopulation', 'bplPopulation', 'numberOfHouseholds', 'numberOfBplHouseholds',
                'womenHeadedHouseholds', 'personsOlderThan65Years', 'childLabourers',
                'physicallyChallengedPersons', 'mentallyChallengedPersons', 'personsWithHivAids',
                'personsWithTuberculosis', 'personsWithRespiratoryDiseases', 'personsWithOtherChronicDiseases',
                'totalIlliteratePerson', 'maleIlliterate', 'femaleIlliterate', 'bplIlliteratePerson',
                'maleBplIlliterate', 'femaleBplIlliterate', 'schoolDropoutsMale', 'schoolDropoutsFemale'
            ];
            
            demographicFields.forEach(field => {
                if (survey.demographicProfile[field] === undefined) {
                    survey.demographicProfile[field] = {};
                }
            });
        }
        
        if (survey.educationFacilities) {
            const educationFields = [
                'anganwadiUnderIcds', 'municipalPreschool', 'privatePreschool', 'municipalPrimarySchool',
                'stateGovtPrimarySchool', 'privatePrimarySchool', 'municipalHighSchool',
                'stateGovtHighSchool', 'privateHighSchool', 'adultEducationCentre', 'nonFormalEducationCentre'
            ];
            
            educationFields.forEach(field => {
                if (survey.educationFacilities[field] === undefined) {
                    survey.educationFacilities[field] = {};
                }
            });
        }
        
        if (survey.additionalInfrastructure) {
            if (survey.additionalInfrastructure.waterSupply === undefined) {
                survey.additionalInfrastructure.waterSupply = {};
            }
            if (survey.additionalInfrastructure.drainageSewerage === undefined) {
                survey.additionalInfrastructure.drainageSewerage = {};
            }
            if (survey.additionalInfrastructure.roads === undefined) {
                survey.additionalInfrastructure.roads = {};
            }
            if (survey.additionalInfrastructure.streetLighting === undefined) {
                survey.additionalInfrastructure.streetLighting = {};
            }
            if (survey.additionalInfrastructure.sanitation === undefined) {
                survey.additionalInfrastructure.sanitation = {};
            }
            if (survey.additionalInfrastructure.communityFacilities === undefined) {
                survey.additionalInfrastructure.communityFacilities = {};
            }
            if (survey.additionalInfrastructure.standaloneInfrastructureRequirements === undefined) {
                survey.additionalInfrastructure.standaloneInfrastructureRequirements = {};
            }
        }
        
        // Ensure sections 8-14 are properly initialized
        if (survey.economicStatus === undefined) {
            survey.economicStatus = {};
        }
        
        if (survey.employmentAndOccupation === undefined) {
            survey.employmentAndOccupation = {};
        }
        
        if (survey.healthFacilities === undefined) {
            survey.healthFacilities = {};
        }
        
        if (survey.socialDevelopment === undefined) {
            survey.socialDevelopment = {};
        }
        
        survey.lastModifiedBy = userId;
        survey.lastModifiedAt = new Date();
        survey.surveyStatus = updateData.surveyStatus || survey.surveyStatus;

        await survey.save();
        await survey.populate([
            { path: 'slum', select: 'slumName population' },
            { path: 'surveyor', select: 'name ' },
        ]);

        console.log(`Updated slum survey ${surveyId}`);
        sendSuccess(res, survey, 'Survey updated successfully');
    } catch (error) {
        console.error('Error in updateSlumSurvey:', error.message);
        sendError(res, error.message || 'Failed to update survey', 500);
    }
};

/**
 * Submit slum survey (mark as SUBMITTED)
 */
exports.submitSlumSurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const userId = req.user.id || req.user._id;

        const survey = await SlumSurvey.findById(surveyId);
        if (!survey) {
            return sendError(res, 'Survey not found', 404);
        }

        // Check authorization
        if (survey.surveyor.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return sendError(res, 'Not authorized to submit this survey', 403);
        }

        // Ensure all sections are marked as completed when submitting
        const allSections = [
            'generalInformation',
            'cityTownSlumProfile',
            'surveyOperation',
            'basicInformation',
            'landStatus',
            'demographicProfile',
            'housingStatus',
            'economicStatus',
            'employmentAndOccupation',
            'physicalInfrastructure',
            'educationFacilities',
            'healthFacilities',
            'socialDevelopment',
            'additionalInfrastructure'
        ];
        
        // Add all sections to completed sections
        allSections.forEach(section => {
            if (!survey.completedSections.includes(section)) {
                survey.completedSections.push(section);
                console.log(`Section ${section} marked as completed during submission`);
            }
        });
        
        // Calculate final completion percentage
        survey.completionPercentage = Math.min(100, Math.round((survey.completedSections.length / 14) * 100));
        
        survey.surveyStatus = 'SUBMITTED';
        survey.submittedBy = userId;
        survey.submittedAt = new Date();
        // Ensure nested objects are properly initialized to prevent validation errors
        if (survey.physicalInfrastructure) {
            if (survey.physicalInfrastructure.sourceDrinkingWater === undefined) {
                survey.physicalInfrastructure.sourceDrinkingWater = {};
            }
            if (survey.physicalInfrastructure.solidWasteManagement === undefined) {
                survey.physicalInfrastructure.solidWasteManagement = {};
            }
        }
                
        if (survey.demographicProfile) {
            const demographicFields = [
                'totalPopulation', 'bplPopulation', 'numberOfHouseholds', 'numberOfBplHouseholds',
                'womenHeadedHouseholds', 'personsOlderThan65Years', 'childLabourers',
                'physicallyChallengedPersons', 'mentallyChallengedPersons', 'personsWithHivAids',
                'personsWithTuberculosis', 'personsWithRespiratoryDiseases', 'personsWithOtherChronicDiseases',
                'totalIlliteratePerson', 'maleIlliterate', 'femaleIlliterate', 'bplIlliteratePerson',
                'maleBplIlliterate', 'femaleBplIlliterate', 'schoolDropoutsMale', 'schoolDropoutsFemale'
            ];
                    
            demographicFields.forEach(field => {
                if (survey.demographicProfile[field] === undefined) {
                    survey.demographicProfile[field] = {};
                }
            });
        }
                
        if (survey.educationFacilities) {
            const educationFields = [
                'anganwadiUnderIcds', 'municipalPreschool', 'privatePreschool', 'municipalPrimarySchool',
                'stateGovtPrimarySchool', 'privatePrimarySchool', 'municipalHighSchool',
                'stateGovtHighSchool', 'privateHighSchool', 'adultEducationCentre', 'nonFormalEducationCentre'
            ];
                    
            educationFields.forEach(field => {
                if (survey.educationFacilities[field] === undefined) {
                    survey.educationFacilities[field] = {};
                }
            });
        }
                
        if (survey.additionalInfrastructure) {
            if (survey.additionalInfrastructure.waterSupply === undefined) {
                survey.additionalInfrastructure.waterSupply = {};
            }
            if (survey.additionalInfrastructure.drainageSewerage === undefined) {
                survey.additionalInfrastructure.drainageSewerage = {};
            }
            if (survey.additionalInfrastructure.roads === undefined) {
                survey.additionalInfrastructure.roads = {};
            }
            if (survey.additionalInfrastructure.streetLighting === undefined) {
                survey.additionalInfrastructure.streetLighting = {};
            }
            if (survey.additionalInfrastructure.sanitation === undefined) {
                survey.additionalInfrastructure.sanitation = {};
            }
            if (survey.additionalInfrastructure.communityFacilities === undefined) {
                survey.additionalInfrastructure.communityFacilities = {};
            }
            if (survey.additionalInfrastructure.standaloneInfrastructureRequirements === undefined) {
                survey.additionalInfrastructure.standaloneInfrastructureRequirements = {};
            }
        }
                
        // Ensure sections 8-14 are properly initialized
        if (survey.economicStatus === undefined) {
            survey.economicStatus = {};
        }
                
        if (survey.employmentAndOccupation === undefined) {
            survey.employmentAndOccupation = {};
        }
                
        if (survey.healthFacilities === undefined) {
            survey.healthFacilities = {};
        }
                
        if (survey.socialDevelopment === undefined) {
            survey.socialDevelopment = {};
        }
                
        survey.lastModifiedBy = userId;
        survey.lastModifiedAt = new Date();
                
        // Final validation check before saving
        console.log('[DEBUG] Final validation before save - survey data:', {
            physicalInfrastructure: survey.physicalInfrastructure,
            hasSourceDrinkingWater: !!survey.physicalInfrastructure?.sourceDrinkingWater,
            hasSolidWasteManagement: !!survey.physicalInfrastructure?.solidWasteManagement
        });
                
        // Add validation error handling
        try {
            await survey.save();
        } catch (saveError) {
            console.error('[ERROR] Failed to save survey:', saveError.message);
            console.error('[ERROR] Section data:', JSON.stringify(survey[section], null, 2));
            throw saveError;
        }
                
        // Update all statuses based on slum survey status after submission
        await updateAssignmentStatusFromSlumSurvey(surveyId);
                
        console.log(`Final completion after submission: ${survey.completedSections.length}/16 = ${survey.completionPercentage}%`);
        await survey.populate([
            { path: 'slum', select: 'slumName population' },
            { path: 'surveyor', select: 'name ' },
        ]);
                
        console.log(`Submitted slum survey ${surveyId}`);
        sendSuccess(res, survey, 'Survey submitted successfully', 200);
    } catch (error) {
        console.error('Error in submitSlumSurvey:', error.message);
        sendError(res, error.message || 'Failed to submit survey', 500);
    }
};

/**
 * Get survey by slum ID (for a specific surveyor)
 */
exports.getSlumSurveyBySlumId = async (req, res) => {
    try {
        const { slumId } = req.params;
        const userId = req.user.id || req.user._id;

        const survey = await SlumSurvey.findOne({
            slum: slumId,
            surveyor: userId,
        }).populate([
            { path: 'slum', select: 'slumName population' },
            { path: 'surveyor', select: 'name ' },
        ]);

        if (!survey) {
            return sendError(res, 'Survey not found for this slum', 404);
        }

        // Ensure nested objects are properly initialized to prevent validation errors
        if (survey.physicalInfrastructure) {
            if (survey.physicalInfrastructure.sourceDrinkingWater === undefined) {
                survey.physicalInfrastructure.sourceDrinkingWater = {};
            }
            if (survey.physicalInfrastructure.solidWasteManagement === undefined) {
                survey.physicalInfrastructure.solidWasteManagement = {};
            }
        }
        
        if (survey.demographicProfile) {
            const demographicFields = [
                'totalPopulation', 'bplPopulation', 'numberOfHouseholds', 'numberOfBplHouseholds',
                'womenHeadedHouseholds', 'personsOlderThan65Years', 'childLabourers',
                'physicallyChallengedPersons', 'mentallyChallengedPersons', 'personsWithHivAids',
                'personsWithTuberculosis', 'personsWithRespiratoryDiseases', 'personsWithOtherChronicDiseases',
                'totalIlliteratePerson', 'maleIlliterate', 'femaleIlliterate', 'bplIlliteratePerson',
                'maleBplIlliterate', 'femaleBplIlliterate', 'schoolDropoutsMale', 'schoolDropoutsFemale'
            ];
            
            demographicFields.forEach(field => {
                if (survey.demographicProfile[field] === undefined) {
                    survey.demographicProfile[field] = {};
                }
            });
        }
        
        if (survey.educationFacilities) {
            const educationFields = [
                'anganwadiUnderIcds', 'municipalPreschool', 'privatePreschool', 'municipalPrimarySchool',
                'stateGovtPrimarySchool', 'privatePrimarySchool', 'municipalHighSchool',
                'stateGovtHighSchool', 'privateHighSchool', 'adultEducationCentre', 'nonFormalEducationCentre'
            ];
            
            educationFields.forEach(field => {
                if (survey.educationFacilities[field] === undefined) {
                    survey.educationFacilities[field] = {};
                }
            });
        }
        
        if (survey.additionalInfrastructure) {
            if (survey.additionalInfrastructure.waterSupply === undefined) {
                survey.additionalInfrastructure.waterSupply = {};
            }
            if (survey.additionalInfrastructure.drainageSewerage === undefined) {
                survey.additionalInfrastructure.drainageSewerage = {};
            }
            if (survey.additionalInfrastructure.roads === undefined) {
                survey.additionalInfrastructure.roads = {};
            }
            if (survey.additionalInfrastructure.streetLighting === undefined) {
                survey.additionalInfrastructure.streetLighting = {};
            }
            if (survey.additionalInfrastructure.sanitation === undefined) {
                survey.additionalInfrastructure.sanitation = {};
            }
            if (survey.additionalInfrastructure.communityFacilities === undefined) {
                survey.additionalInfrastructure.communityFacilities = {};
            }
            if (survey.additionalInfrastructure.standaloneInfrastructureRequirements === undefined) {
                survey.additionalInfrastructure.standaloneInfrastructureRequirements = {};
            }
        }
        
        // Ensure sections 8-14 are properly initialized
        if (survey.economicStatus === undefined) {
            survey.economicStatus = {};
        }
        
        if (survey.employmentAndOccupation === undefined) {
            survey.employmentAndOccupation = {};
        }
        
        if (survey.healthFacilities === undefined) {
            survey.healthFacilities = {};
        }
        
        if (survey.socialDevelopment === undefined) {
            survey.socialDevelopment = {};
        }
        
        // Ensure sections 8-14 are properly initialized
        if (survey.economicStatus === undefined) {
            survey.economicStatus = {};
        }
        
        if (survey.employmentAndOccupation === undefined) {
            survey.employmentAndOccupation = {};
        }
        
        if (survey.healthFacilities === undefined) {
            survey.healthFacilities = {};
        }
        
        if (survey.socialDevelopment === undefined) {
            survey.socialDevelopment = {};
        }
        
        sendSuccess(res, survey, 'Survey retrieved successfully');
    } catch (error) {
        console.error('Error in getSlumSurveyBySlumId:', error.message);
        sendError(res, error.message || 'Failed to get survey', 500);
    }
};

/**
 * Delete slum survey (only for DRAFT status)
 */
exports.deleteSlumSurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const userId = req.user.id || req.user._id;

        const survey = await SlumSurvey.findById(surveyId);
        if (!survey) {
            return sendError(res, 'Survey not found', 404);
        }

        // Only allow deletion of DRAFT surveys
        if (survey.surveyStatus !== 'DRAFT') {
            return sendError(res, 'Can only delete DRAFT surveys', 400);
        }

        // Check authorization
        if (survey.surveyor.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return sendError(res, 'Not authorized to delete this survey', 403);
        }

        await SlumSurvey.findByIdAndDelete(surveyId);
        console.log(`Deleted slum survey ${surveyId}`);
        sendSuccess(res, null, 'Survey deleted successfully');
    } catch (error) {
        console.error('Error in deleteSlumSurvey:', error.message);
        sendError(res, error.message || 'Failed to delete survey', 500);
    }
};

// Helper function for deep merging objects
function deepMerge(target, source) {
  // Initialize target as an empty object if it's not an object
  const result = target && typeof target === 'object' && !Array.isArray(target) ? { ...target } : {};
  
  // Process all properties from source
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        // Recursively merge nested objects
        // If target has a property with the same key, use it; otherwise use empty object
        const targetValue = result.hasOwnProperty(key) ? result[key] : {};
        result[key] = deepMerge(targetValue, source[key]);
      } else {
        // For primitive values or arrays, directly assign
        result[key] = source[key];
      }
    }
  }
  
  // Also include properties from target that aren't in source
  for (const key in target) {
    if (target.hasOwnProperty(key) && !result.hasOwnProperty(key)) {
      result[key] = target[key];
    }
  }
  
  return result;
}

/**
 * Update specific survey section (for incremental saves)
 */
exports.updateSurveySection = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const { section, data } = req.body;
        const userId = req.user.id || req.user._id;

        if (!section || !data) {
            return sendError(res, 'Section and data are required', 400);
        }

        const survey = await SlumSurvey.findById(surveyId);
        if (!survey) {
            return sendError(res, 'Survey not found', 404);
        }

        // Check authorization
        if (survey.surveyor.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return sendError(res, 'Not authorized to update this survey', 403);
        }

        // Handle the data structure properly - extract nested data if it exists
        let processedData = data;
        
        // If data has a nested structure (like data.physicalInfrastructure), extract it
        if (data && typeof data === 'object' && data[section] && typeof data[section] === 'object') {
            processedData = data[section];
            console.log(`[DEBUG] Extracted nested data for section ${section}:`, processedData);
        }
        
        // Add debug logging
        console.log('[DEBUG] Processing section:', section);
        console.log('[DEBUG] Raw data received:', data);
        console.log('[DEBUG] Processed data:', processedData);

        // Define all survey sections
        const surveySections = [
            'generalInformation',
            'cityTownSlumProfile',
            'surveyOperation',
            'basicInformation',
            'landStatus',
            'demographicProfile',
            'housingStatus',
            'economicStatus',
            'employmentAndOccupation',
            'physicalInfrastructure',
            'educationFacilities',
            'healthFacilities',
            'socialDevelopment',
            'additionalInfrastructure'
        ];
        
        // Preprocess data to handle nested objects properly for sections with nested schemas
        if (section === 'physicalInfrastructure' && data) {
            // Ensure nested objects exist to prevent validation errors
            if (data.sourceDrinkingWater === undefined) {
                data.sourceDrinkingWater = {};
            }
            if (data.solidWasteManagement === undefined) {
                data.solidWasteManagement = {};
            }
            
            // Ensure all sourceDrinkingWater fields exist
            const drinkingWaterFields = [
                'individualTap', 'tubewellBorewellHandpump', 'publicTap', 'openwell', 
                'tankPond', 'riverCanalLakeSpring', 'waterTanker', 'others'
            ];
            
            drinkingWaterFields.forEach(field => {
                if (data.sourceDrinkingWater[field] === undefined || data.sourceDrinkingWater[field] === null) {
                    data.sourceDrinkingWater[field] = 0;
                } else if (typeof data.sourceDrinkingWater[field] === 'string') {
                    // Convert string values to numbers
                    data.sourceDrinkingWater[field] = parseInt(data.sourceDrinkingWater[field]) || 0;
                }
            });
            
            // Ensure all solidWasteManagement fields exist
            const solidWasteFields = [
                'frequencyOfGarbageDisposal', 'arrangementForGarbageDisposal', 'frequencyOfClearanceOfOpenDrains'
            ];
            
            solidWasteFields.forEach(field => {
                if (data.solidWasteManagement[field] === undefined || data.solidWasteManagement[field] === null) {
                    data.solidWasteManagement[field] = "";
                }
            });
            
            // Ensure all other physical infrastructure fields exist
            const otherFields = [
                'connectivityCityWaterSupply', 'drainageSewerageFacility', 'connectivityStormWaterDrainage',
                'connectivitySewerageSystem', 'proneToFlooding', 'latrineFacility', 'approachRoadType',
                'distanceToNearestMotorableRoad', 'internalRoadType', 'streetLightAvailable'
            ];
            
            otherFields.forEach(field => {
                if (data[field] === undefined || data[field] === null) {
                    data[field] = "";
                }
            });
            
            // Add debug logging
            console.log('[DEBUG] Processing physicalInfrastructure section');
            console.log('[DEBUG] sourceDrinkingWater:', typeof data.sourceDrinkingWater, data.sourceDrinkingWater);
            console.log('[DEBUG] solidWasteManagement:', typeof data.solidWasteManagement, data.solidWasteManagement);
        }
        
        // Initialize section in survey if it doesn't exist yet
        if (!survey[section]) {
            survey[section] = {};
        }
        
        // Add debug logging for all sections
        console.log(`[DEBUG] Processing section: ${section}`);
        console.log(`[DEBUG] Data received:`, JSON.stringify(data, null, 2));
        
        // Preprocess data to ensure proper initialization for all sections
        if (section === 'economicStatus' && data) {
            // Ensure economicStatus has proper defaults to prevent validation issues
            // Preprocess the data to ensure all numeric fields have proper values
            const economicFields = [
                'lessThan500', 'rs500to1000', 'rs1000to1500', 'rs1500to2000', 'rs2000to3000', 'moreThan3000'
            ];
            
            economicFields.forEach(field => {
                if (data[field] === undefined || data[field] === null) {
                    data[field] = 0;
                } else if (typeof data[field] === 'string') {
                    // Convert string values to numbers
                    data[field] = parseInt(data[field]) || 0;
                }
            });
        }
        
        if (section === 'employmentAndOccupation' && data) {
            // Preprocess the data to ensure all numeric fields have proper values
            const occupationFields = [
                'selfEmployed', 'salaried', 'regularWage', 'casualLabour', 'others'
            ];
            
            occupationFields.forEach(field => {
                if (data[field] === undefined || data[field] === null) {
                    data[field] = 0;
                } else if (typeof data[field] === 'string') {
                    // Convert string values to numbers
                    data[field] = parseInt(data[field]) || 0;
                }
            });
        }
        
        if (section === 'healthFacilities' && data) {
            // Health facilities has string fields, no special preprocessing needed
        }
        
        if (section === 'socialDevelopment' && data) {
            // Social development has numeric fields
        }
        
        if (section === 'physicalInfrastructure' && data) {
            // Preprocess to ensure all nested objects exist to prevent validation errors
            data.sourceDrinkingWater = data.sourceDrinkingWater || {};
            data.solidWasteManagement = data.solidWasteManagement || {};
            
            // Ensure all nested objects within sourceDrinkingWater exist
            data.sourceDrinkingWater.individualTap = data.sourceDrinkingWater.individualTap || 0;
            data.sourceDrinkingWater.tubewellBorewellHandpump = data.sourceDrinkingWater.tubewellBorewellHandpump || 0;
            data.sourceDrinkingWater.publicTap = data.sourceDrinkingWater.publicTap || 0;
            data.sourceDrinkingWater.openwell = data.sourceDrinkingWater.openwell || 0;
            data.sourceDrinkingWater.tankPond = data.sourceDrinkingWater.tankPond || 0;
            data.sourceDrinkingWater.riverCanalLakeSpring = data.sourceDrinkingWater.riverCanalLakeSpring || 0;
            data.sourceDrinkingWater.waterTanker = data.sourceDrinkingWater.waterTanker || 0;
            data.sourceDrinkingWater.others = data.sourceDrinkingWater.others || 0;
            
            // Ensure all nested objects within solidWasteManagement exist
            data.solidWasteManagement.frequencyOfGarbageDisposal = data.solidWasteManagement.frequencyOfGarbageDisposal || "";
            data.solidWasteManagement.arrangementForGarbageDisposal = data.solidWasteManagement.arrangementForGarbageDisposal || "";
            data.solidWasteManagement.frequencyOfClearanceOfOpenDrains = data.solidWasteManagement.frequencyOfClearanceOfOpenDrains || "";
        }
        
        if (section === 'demographicProfile' && data) {
            // Ensure all demographic sub-objects exist to prevent validation errors
            const demographicFields = [
                'totalPopulation', 'bplPopulation', 'numberOfHouseholds', 'numberOfBplHouseholds',
                'womenHeadedHouseholds', 'personsOlderThan65Years', 'childLabourers',
                'physicallyChallengedPersons', 'mentallyChallengedPersons', 'personsWithHivAids',
                'personsWithTuberculosis', 'personsWithRespiratoryDiseases', 'personsWithOtherChronicDiseases',
                'totalIlliteratePerson', 'maleIlliterate', 'femaleIlliterate', 'bplIlliteratePerson',
                'maleBplIlliterate', 'femaleBplIlliterate', 'schoolDropoutsMale', 'schoolDropoutsFemale'
            ];
            
            demographicFields.forEach(field => {
                if (data[field] === undefined) {
                    data[field] = {};
                }
            });
        }
        
        if (section === 'educationFacilities' && data) {
            // Ensure all education facility sub-objects exist to prevent validation errors
            const educationFields = [
                'anganwadiUnderIcds', 'municipalPreschool', 'privatePreschool', 'municipalPrimarySchool',
                'stateGovtPrimarySchool', 'privatePrimarySchool', 'municipalHighSchool',
                'stateGovtHighSchool', 'privateHighSchool', 'adultEducationCentre', 'nonFormalEducationCentre'
            ];
            
            educationFields.forEach(field => {
                if (data[field] === undefined) {
                    data[field] = {};
                }
            });
        }
        
        if (section === 'additionalInfrastructure' && data) {
            // Preprocess to ensure all nested objects exist to prevent validation errors
            data.waterSupply = data.waterSupply || {};
            data.drainageSewerage = data.drainageSewerage || {};
            data.roads = data.roads || {};
            data.streetLighting = data.streetLighting || {};
            data.sanitation = data.sanitation || {};
            data.communityFacilities = data.communityFacilities || {};
            data.standaloneInfrastructureRequirements = data.standaloneInfrastructureRequirements || {};
            
            // Ensure all nested objects within waterSupply exist
            data.waterSupply.pipelines = data.waterSupply.pipelines || {};
            data.waterSupply.individualTaps = data.waterSupply.individualTaps || {};
            data.waterSupply.borewells = data.waterSupply.borewells || {};
            data.waterSupply.connectivityToTrunkLines = data.waterSupply.connectivityToTrunkLines || {};
            
            // Ensure all nested objects within drainageSewerage exist
            data.drainageSewerage.stormwaterDrainage = data.drainageSewerage.stormwaterDrainage || {};
            data.drainageSewerage.connectivityToMainDrains = data.drainageSewerage.connectivityToMainDrains || {};
            data.drainageSewerage.sewerLines = data.drainageSewerage.sewerLines || {};
            data.drainageSewerage.connectivityToTrunkSewers = data.drainageSewerage.connectivityToTrunkSewers || {};
            
            // Ensure all nested objects within roads exist
            data.roads.internalRoadsCC = data.roads.internalRoadsCC || {};
            data.roads.internalRoadsBT = data.roads.internalRoadsBT || {};
            data.roads.internalRoadsOthers = data.roads.internalRoadsOthers || {};
            data.roads.approachRoadsCC = data.roads.approachRoadsCC || {};
            data.roads.approachRoadsOthers = data.roads.approachRoadsOthers || {};
            
            // Ensure all nested objects within streetLighting exist
            data.streetLighting.poles = data.streetLighting.poles || {};
            data.streetLighting.lights = data.streetLighting.lights || {};
            
            // Ensure all nested objects within sanitation exist
            data.sanitation.individualToilets = data.sanitation.individualToilets || {};
            data.sanitation.communityToilets = data.sanitation.communityToilets || {};
            data.sanitation.seatsInCommunityToilets = data.sanitation.seatsInCommunityToilets || {};
            data.sanitation.dumperBins = data.sanitation.dumperBins || {};
            
            // Ensure all nested objects within communityFacilities exist
            data.communityFacilities.communityHalls = data.communityFacilities.communityHalls || {};
            data.communityFacilities.livelihoodCentres = data.communityFacilities.livelihoodCentres || {};
            data.communityFacilities.anganwadis = data.communityFacilities.anganwadis || {};
            data.communityFacilities.primarySchools = data.communityFacilities.primarySchools || {};
            data.communityFacilities.healthCentres = data.communityFacilities.healthCentres || {};
            data.communityFacilities.others = data.communityFacilities.others || {};
            
            // Ensure all nested objects within standaloneInfrastructureRequirements exist
            data.standaloneInfrastructureRequirements.electricity = data.standaloneInfrastructureRequirements.electricity || {};
            data.standaloneInfrastructureRequirements.healthCare = data.standaloneInfrastructureRequirements.healthCare || {};
            data.standaloneInfrastructureRequirements.toilets = data.standaloneInfrastructureRequirements.toilets || {};
            
            // Preserve existing data by merging objects
            if (survey[section] && typeof survey[section] === 'object' && data && typeof data === 'object') {
                // Use deep merge for additionalInfrastructure to preserve nested data properly
                survey[section] = deepMerge(survey[section], data);
            } else {
                survey[section] = data;
            }
        }
        
        if (section === 'surveyOperation' && data) {
            // Ensure surveyOperation has proper defaults to prevent validation issues
            if (data.surveyorName === undefined) {
                // Preserve the surveyor's name from the user object
                data.surveyorName = req.user.name || req.user.username || "";
            }
        }
        
        if (section === 'housingStatus' && data) {
            // Ensure housingStatus has proper defaults to prevent validation issues
            // Preprocess the data to ensure all numeric fields have proper values
            const housingFields = [
                'dwellingUnitsPucca', 'dwellingUnitsSemiPucca', 'dwellingUnitsKatcha', 'dwellingUnitsTotal',
                'dwellingUnitsWithElectricityPucca', 'dwellingUnitsWithElectricitySemiPucca', 'dwellingUnitsWithElectricityKatcha', 'dwellingUnitsWithElectricityTotal',
                'landTenureWithPatta', 'landTenurePossessionCertificate', 'landTenureEncroachedPrivate', 'landTenureEncroachedPublic',
                'landTenureOnRent', 'landTenureOther', 'landTenureTotal'
            ];
            
            housingFields.forEach(field => {
                if (data[field] === undefined || data[field] === null) {
                    data[field] = 0;
                } else if (typeof data[field] === 'string') {
                    // Convert string values to numbers
                    data[field] = parseInt(data[field]) || 0;
                }
            });
        }

        // Ensure the section exists in the survey before merging
        if (!survey[section]) {
            survey[section] = {};
        }
        
        // Preserve existing data by merging objects
        if (survey[section] && typeof survey[section] === 'object' && data && typeof data === 'object') {
            // Handle nested objects properly to prevent undefined values breaking schema validation
            
            // Add debug logging
            console.log('[DEBUG] Before merge - survey[section]:', survey[section]);
            console.log('[DEBUG] Data to merge:', data);
            
            // Use deep merge to properly handle nested objects
            survey[section] = deepMerge(survey[section], data);
            
            // Add debug logging
            console.log('[DEBUG] After merge - survey[section]:', survey[section]);
            
            // Log the final data being saved
            console.log(`[DEBUG] Final data for section ${section}:`, JSON.stringify(survey[section], null, 2));
            
            // Ensure nested objects conform to schema - prevent undefined values
            if (section === 'physicalInfrastructure') {
                survey[section].sourceDrinkingWater = survey[section].sourceDrinkingWater || {};
                survey[section].solidWasteManagement = survey[section].solidWasteManagement || {};
            }
            
            if (section === 'demographicProfile') {
                const demographicFields = [
                    'totalPopulation', 'bplPopulation', 'numberOfHouseholds', 'numberOfBplHouseholds',
                    'womenHeadedHouseholds', 'personsOlderThan65Years', 'childLabourers',
                    'physicallyChallengedPersons', 'mentallyChallengedPersons', 'personsWithHivAids',
                    'personsWithTuberculosis', 'personsWithRespiratoryDiseases', 'personsWithOtherChronicDiseases',
                    'totalIlliteratePerson', 'maleIlliterate', 'femaleIlliterate', 'bplIlliteratePerson',
                    'maleBplIlliterate', 'femaleBplIlliterate', 'schoolDropoutsMale', 'schoolDropoutsFemale'
                ];
                
                demographicFields.forEach(field => {
                    survey[section][field] = survey[section][field] || {};
                });
            }
            
            if (section === 'educationFacilities') {
                const educationFields = [
                    'anganwadiUnderIcds', 'municipalPreschool', 'privatePreschool', 'municipalPrimarySchool',
                    'stateGovtPrimarySchool', 'privatePrimarySchool', 'municipalHighSchool',
                    'stateGovtHighSchool', 'privateHighSchool', 'adultEducationCentre', 'nonFormalEducationCentre'
                ];
                
                educationFields.forEach(field => {
                    survey[section][field] = survey[section][field] || {};
                });
            }
            
            if (section === 'additionalInfrastructure') {
                // Use deep merge to ensure all nested objects exist
                survey[section].waterSupply = survey[section].waterSupply || {};
                survey[section].drainageSewerage = survey[section].drainageSewerage || {};
                survey[section].roads = survey[section].roads || {};
                survey[section].streetLighting = survey[section].streetLighting || {};
                survey[section].sanitation = survey[section].sanitation || {};
                survey[section].communityFacilities = survey[section].communityFacilities || {};
                survey[section].standaloneInfrastructureRequirements = survey[section].standaloneInfrastructureRequirements || {};
                
                // Ensure all nested objects within waterSupply exist
                survey[section].waterSupply.pipelines = survey[section].waterSupply.pipelines || {};
                survey[section].waterSupply.individualTaps = survey[section].waterSupply.individualTaps || {};
                survey[section].waterSupply.borewells = survey[section].waterSupply.borewells || {};
                survey[section].waterSupply.connectivityToTrunkLines = survey[section].waterSupply.connectivityToTrunkLines || {};
                
                // Ensure all nested objects within drainageSewerage exist
                survey[section].drainageSewerage.stormwaterDrainage = survey[section].drainageSewerage.stormwaterDrainage || {};
                survey[section].drainageSewerage.connectivityToMainDrains = survey[section].drainageSewerage.connectivityToMainDrains || {};
                survey[section].drainageSewerage.sewerLines = survey[section].drainageSewerage.sewerLines || {};
                survey[section].drainageSewerage.connectivityToTrunkSewers = survey[section].drainageSewerage.connectivityToTrunkSewers || {};
                
                // Ensure all nested objects within roads exist
                survey[section].roads.internalRoadsCC = survey[section].roads.internalRoadsCC || {};
                survey[section].roads.internalRoadsBT = survey[section].roads.internalRoadsBT || {};
                survey[section].roads.internalRoadsOthers = survey[section].roads.internalRoadsOthers || {};
                survey[section].roads.approachRoadsCC = survey[section].roads.approachRoadsCC || {};
                survey[section].roads.approachRoadsOthers = survey[section].roads.approachRoadsOthers || {};
                
                // Ensure all nested objects within streetLighting exist
                survey[section].streetLighting.poles = survey[section].streetLighting.poles || {};
                survey[section].streetLighting.lights = survey[section].streetLighting.lights || {};
                
                // Ensure all nested objects within sanitation exist
                survey[section].sanitation.individualToilets = survey[section].sanitation.individualToilets || {};
                survey[section].sanitation.communityToilets = survey[section].sanitation.communityToilets || {};
                survey[section].sanitation.seatsInCommunityToilets = survey[section].sanitation.seatsInCommunityToilets || {};
                survey[section].sanitation.dumperBins = survey[section].sanitation.dumperBins || {};
                
                // Ensure all nested objects within communityFacilities exist
                survey[section].communityFacilities.communityHalls = survey[section].communityFacilities.communityHalls || {};
                survey[section].communityFacilities.livelihoodCentres = survey[section].communityFacilities.livelihoodCentres || {};
                survey[section].communityFacilities.anganwadis = survey[section].communityFacilities.anganwadis || {};
                survey[section].communityFacilities.primarySchools = survey[section].communityFacilities.primarySchools || {};
                survey[section].communityFacilities.healthCentres = survey[section].communityFacilities.healthCentres || {};
                survey[section].communityFacilities.others = survey[section].communityFacilities.others || {};
                
                // Ensure all nested objects within standaloneInfrastructureRequirements exist
                survey[section].standaloneInfrastructureRequirements.electricity = survey[section].standaloneInfrastructureRequirements.electricity || {};
                survey[section].standaloneInfrastructureRequirements.healthCare = survey[section].standaloneInfrastructureRequirements.healthCare || {};
                survey[section].standaloneInfrastructureRequirements.toilets = survey[section].standaloneInfrastructureRequirements.toilets || {};
            }
            
            // Also handle other sections that might have nested objects
            if (section === 'healthFacilities' && survey[section]) {
                // healthFacilities has string fields, no special handling needed
            }
            
            if (section === 'socialDevelopment' && survey[section]) {
                // socialDevelopment has numeric fields, ensure no undefined values
                const socialDevFields = [
                    'communityHall', 'livelihoodProductionCentre', 'vocationalTrainingCentre', 'streetChildrenRehabilitationCentre',
                    'nightShelter', 'oldAgeHome', 'oldAgePensionsHolders', 'widowPensionsHolders', 'disabledPensionsHolders',
                    'generalInsuranceCovered', 'healthInsuranceCovered', 'selfHelpGroups', 'thriftCreditSocieties',
                    'youthAssociations', 'womensAssociations'
                ];
                
                socialDevFields.forEach(field => {
                    if (survey[section][field] === undefined) {
                        survey[section][field] = 0; // Default to 0 for numeric fields
                    }
                });
            }
            
            if (section === 'economicStatus' && survey[section]) {
                // economicStatus has numeric fields, ensure no undefined values
                const economicFields = [
                    'lessThan500', 'rs500to1000', 'rs1000to1500', 'rs1500to2000', 'rs2000to3000', 'moreThan3000'
                ];
                
                economicFields.forEach(field => {
                    if (survey[section][field] === undefined) {
                        survey[section][field] = 0; // Default to 0 for numeric fields
                    }
                });
            }
            
            if (section === 'employmentAndOccupation' && survey[section]) {
                // employmentAndOccupation has numeric fields, ensure no undefined values
                const employmentFields = [
                    'selfEmployed', 'salaried', 'regularWage', 'casualLabour', 'others'
                ];
                
                employmentFields.forEach(field => {
                    if (survey[section][field] === undefined) {
                        survey[section][field] = 0; // Default to 0 for numeric fields
                    }
                });
            }
            
            // Also handle the surveyOperation section which might have nested objects
            if (section === 'surveyOperation' && survey[section]) {
                // Ensure surveyorName is properly maintained
                if (data.surveyorName && !survey[section].surveyorName) {
                    survey[section].surveyorName = data.surveyorName;
                }
            }
            
            // Ensure proper handling of other sections with potential nested objects
            if (section === 'housingStatus' && survey[section]) {
                // housingStatus has numeric fields, make sure no undefined values are present
                const housingFields = [
                    'dwellingUnitsPucca', 'dwellingUnitsSemiPucca', 'dwellingUnitsKatcha', 'dwellingUnitsTotal',
                    'dwellingUnitsWithElectricityPucca', 'dwellingUnitsWithElectricitySemiPucca', 'dwellingUnitsWithElectricityKatcha', 'dwellingUnitsWithElectricityTotal',
                    'landTenureWithPatta', 'landTenurePossessionCertificate', 'landTenureEncroachedPrivate', 'landTenureEncroachedPublic',
                    'landTenureOnRent', 'landTenureOther', 'landTenureTotal'
                ];
                
                housingFields.forEach(field => {
                    if (survey[section][field] === undefined) {
                        survey[section][field] = 0; // Default to 0 for numeric fields
                    }
                });
            }
        } else {
            survey[section] = data;
        }
        
        // Track completion explicitly
        // Add current section to completed sections - all sections should be marked as completed when saved
        if (!survey.completedSections.includes(section)) {
            survey.completedSections.push(section);
            console.log(`Section ${section} marked as completed. Total completed: ${survey.completedSections.length}`);
            console.log(`Completed sections:`, survey.completedSections);
        } else {
            console.log(`Section ${section} already marked as completed`);
        }
        
        // Calculate completion percentage based on explicitly tracked completed sections
        // Each of the 14 sections contributes ~7.14% to the total completion (100/14)
        const completionPercentage = Math.min(100, Math.round((survey.completedSections.length / 14) * 100));
        console.log(`Completion calculation: ${survey.completedSections.length}/14 sections = ${completionPercentage}%`);
        survey.completionPercentage = completionPercentage;
        
        // Update survey status based on completion
        // Only set to COMPLETED after explicit submission, not just filling all sections
        if (completionPercentage === 0) {
            survey.surveyStatus = 'DRAFT';
        } else if (completionPercentage > 0 && completionPercentage < 100) {
            survey.surveyStatus = 'IN PROGRESS';
        } else if (completionPercentage === 100 && survey.surveyStatus !== 'SUBMITTED' && survey.surveyStatus !== 'COMPLETED') {
            // When 100% complete but not yet submitted, keep as IN PROGRESS
            survey.surveyStatus = 'IN PROGRESS';
        }
        // If already SUBMITTED or COMPLETED, don't change the status
        
        survey.lastModifiedBy = userId;
        survey.lastModifiedAt = new Date();

        // Ensure nested objects are properly initialized to prevent validation errors
        if (survey.physicalInfrastructure) {
            // Initialize nested objects
            survey.physicalInfrastructure.sourceDrinkingWater = survey.physicalInfrastructure.sourceDrinkingWater || {};
            survey.physicalInfrastructure.solidWasteManagement = survey.physicalInfrastructure.solidWasteManagement || {};
            
            // Validate sourceDrinkingWater fields
            const drinkingWaterFields = [
                'individualTap', 'tubewellBorewellHandpump', 'publicTap', 'openwell', 
                'tankPond', 'riverCanalLakeSpring', 'waterTanker', 'others'
            ];
            
            drinkingWaterFields.forEach(field => {
                if (survey.physicalInfrastructure.sourceDrinkingWater[field] === undefined) {
                    survey.physicalInfrastructure.sourceDrinkingWater[field] = 0; // Default to 0 for numeric fields
                }
            });
            
            // Validate solidWasteManagement fields
            const solidWasteFields = [
                'frequencyOfGarbageDisposal', 'arrangementForGarbageDisposal', 'frequencyOfClearanceOfOpenDrains'
            ];
            
            solidWasteFields.forEach(field => {
                if (survey.physicalInfrastructure.solidWasteManagement[field] === undefined) {
                    survey.physicalInfrastructure.solidWasteManagement[field] = ""; // Default to empty string for string fields
                }
            });
            
            // Validate other physical infrastructure fields
            const otherFields = [
                'connectivityCityWaterSupply', 'drainageSewerageFacility', 'connectivityStormWaterDrainage',
                'connectivitySewerageSystem', 'proneToFlooding', 'latrineFacility', 'approachRoadType',
                'distanceToNearestMotorableRoad', 'internalRoadType', 'streetLightAvailable'
            ];
            
            otherFields.forEach(field => {
                if (survey.physicalInfrastructure[field] === undefined) {
                    survey.physicalInfrastructure[field] = ""; // Default to empty string for string fields
                }
            });
        }
        
        if (survey.demographicProfile) {
            const demographicFields = [
                'totalPopulation', 'bplPopulation', 'numberOfHouseholds', 'numberOfBplHouseholds',
                'womenHeadedHouseholds', 'personsOlderThan65Years', 'childLabourers',
                'physicallyChallengedPersons', 'mentallyChallengedPersons', 'personsWithHivAids',
                'personsWithTuberculosis', 'personsWithRespiratoryDiseases', 'personsWithOtherChronicDiseases',
                'totalIlliteratePerson', 'maleIlliterate', 'femaleIlliterate', 'bplIlliteratePerson',
                'maleBplIlliterate', 'femaleBplIlliterate', 'schoolDropoutsMale', 'schoolDropoutsFemale'
            ];
            
            demographicFields.forEach(field => {
                survey.demographicProfile[field] = survey.demographicProfile[field] || {};
            });
        }
        
        if (survey.educationFacilities) {
            const educationFields = [
                'anganwadiUnderIcds', 'municipalPreschool', 'privatePreschool', 'municipalPrimarySchool',
                'stateGovtPrimarySchool', 'privatePrimarySchool', 'municipalHighSchool',
                'stateGovtHighSchool', 'privateHighSchool', 'adultEducationCentre', 'nonFormalEducationCentre'
            ];
            
            educationFields.forEach(field => {
                survey.educationFacilities[field] = survey.educationFacilities[field] || {};
            });
        }
        
        if (survey.additionalInfrastructure) {
            survey.additionalInfrastructure.waterSupply = survey.additionalInfrastructure.waterSupply || {};
            survey.additionalInfrastructure.drainageSewerage = survey.additionalInfrastructure.drainageSewerage || {};
            survey.additionalInfrastructure.roads = survey.additionalInfrastructure.roads || {};
            survey.additionalInfrastructure.streetLighting = survey.additionalInfrastructure.streetLighting || {};
            survey.additionalInfrastructure.sanitation = survey.additionalInfrastructure.sanitation || {};
            survey.additionalInfrastructure.communityFacilities = survey.additionalInfrastructure.communityFacilities || {};
            survey.additionalInfrastructure.standaloneInfrastructureRequirements = survey.additionalInfrastructure.standaloneInfrastructureRequirements || {};
        }
        
        // Ensure sections 8-14 are properly initialized
        if (survey.economicStatus === undefined) {
            survey.economicStatus = {};
        }
        
        // Validate economicStatus fields after merge
        if (section === 'economicStatus' && survey.economicStatus) {
            const economicFields = [
                'lessThan500', 'rs500to1000', 'rs1000to1500', 'rs1500to2000', 'rs2000to3000', 'moreThan3000'
            ];
            
            economicFields.forEach(field => {
                if (survey.economicStatus[field] === undefined) {
                    survey.economicStatus[field] = 0; // Default to 0 for numeric fields
                }
            });
        }
        
        // Validate employmentAndOccupation fields after merge
        if (section === 'employmentAndOccupation' && survey.employmentAndOccupation) {
            const occupationFields = [
                'selfEmployed', 'salaried', 'regularWage', 'casualLabour', 'others'
            ];
            
            occupationFields.forEach(field => {
                if (survey.employmentAndOccupation[field] === undefined) {
                    survey.employmentAndOccupation[field] = 0; // Default to 0 for numeric fields
                }
            });
        }
        
        if (survey.employmentAndOccupation === undefined) {
            survey.employmentAndOccupation = {};
        }
        
        if (survey.healthFacilities === undefined) {
            survey.healthFacilities = {};
        }
        
        if (survey.socialDevelopment === undefined) {
            survey.socialDevelopment = {};
        }
        
        await survey.save();
        await survey.populate([
            { path: 'slum', select: 'slumName' },
            { path: 'surveyor', select: 'name' },
        ]);

        // Update all statuses based on slum survey status
        await updateAssignmentStatusFromSlumSurvey(surveyId);

        console.log(`Updated survey section: ${section} for survey ${surveyId}. Completion: ${completionPercentage}%`);
        console.log(`Section data saved:`, JSON.stringify(survey[section], null, 2));
        console.log(`All sections status:`, survey.completedSections);
        sendSuccess(res, {...survey.toObject(), completionPercentage}, `${section} updated successfully. Overall completion: ${completionPercentage}%`);
    } catch (error) {
        console.error('Error in updateSurveySection:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Section:', section);
        console.error('Data:', data);
        sendError(res, error.message || 'Failed to update survey section', 500);
    }
};
