const SlumSurvey = require('../../models/SlumSurvey');
const Slum = require('../../models/Slum');
const { sendSuccess, sendError } = require('../../utils/helpers/responseHelper');

/**
 * Create or initialize a slum survey
 */
exports.createOrGetSlumSurvey = async (req, res) => {
    try {
        const { slumId } = req.params;
        const userId = req.user.id || req.user._id;

        // Check if slum exists
        const slum = await Slum.findById(slumId);
        if (!slum) {
            return sendError(res, 'Slum not found', 404);
        }

        // Check if survey already exists
        let survey = await SlumSurvey.findOne({ slum: slumId, surveyor: userId });

        if (!survey) {
            // Create new survey with default values
            survey = new SlumSurvey({
                slum: slumId,
                surveyor: userId,
                surveyStatus: 'DRAFT',
            });
            await survey.save();
            console.log(`Created new slum survey for slum ${slumId}`);
        }

        await survey.populate([
            { path: 'slum', select: 'name location population' },
            { path: 'surveyor', select: 'name email' },
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
            { path: 'slum', select: 'name location population' },
            { path: 'surveyor', select: 'name email' },
        ]);

        if (!survey) {
            return sendError(res, 'Survey not found', 404);
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

        // Update survey fields
        Object.assign(survey, updateData);
        survey.lastModifiedBy = userId;
        survey.lastModifiedAt = new Date();
        survey.surveyStatus = updateData.surveyStatus || survey.surveyStatus;

        await survey.save();
        await survey.populate([
            { path: 'slum', select: 'name location population' },
            { path: 'surveyor', select: 'name email' },
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

        survey.surveyStatus = 'SUBMITTED';
        survey.submittedBy = userId;
        survey.submittedAt = new Date();
        survey.lastModifiedBy = userId;
        survey.lastModifiedAt = new Date();

        await survey.save();
        await survey.populate([
            { path: 'slum', select: 'name location population' },
            { path: 'surveyor', select: 'name email' },
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
            { path: 'slum', select: 'name location population' },
            { path: 'surveyor', select: 'name email' },
        ]);

        if (!survey) {
            return sendError(res, 'Survey not found for this slum', 404);
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

        // Define all survey sections
        const surveySections = [
            'basicInformation',
            'landStatus',
            'populationAndHealth',
            'literacyAndEducation',
            'employmentAndOccupation',
            'waterAndSanitation',
            'housingConditions',
            'utilities',
            'socialInfrastructure',
            'transportationAndAccessibility',
            'environmentalConditions',
            'socialIssuesAndVulnerableGroups',
            'slumImprovementAndDevelopment'
        ];

        // Update the specific section
        survey[section] = data;
        
        // Track completion explicitly
        // Add current section to completed sections if it has meaningful data
        if (!survey.completedSections.includes(section)) {
            // Check if the section has meaningful data before marking as completed
            const sectionData = survey[section];
            let hasMeaningfulData = false;
            
            if (sectionData && typeof sectionData === 'object' && sectionData !== null) {
                // Check if object has at least one non-empty value
                for (let key in sectionData) {
                    if (sectionData[key] !== null && sectionData[key] !== undefined && sectionData[key] !== '') {
                        hasMeaningfulData = true;
                        break;
                    }
                }
            } else if (sectionData !== null && sectionData !== undefined && sectionData !== '') {
                hasMeaningfulData = true;
            }
            
            if (hasMeaningfulData) {
                survey.completedSections.push(section);
            }
        }
        
        // Calculate completion percentage based on explicitly tracked completed sections
        // Each of the 13 sections contributes ~7.69% to the total completion (100/13)
        const completionPercentage = Math.min(100, Math.round((survey.completedSections.length / 13) * 100));
        survey.completionPercentage = completionPercentage;
        
        // Update survey status based on completion
        // Only set to COMPLETED after explicit submission, not just filling all sections
        if (completionPercentage === 0) {
            survey.surveyStatus = 'DRAFT';
        } else if (completionPercentage > 0 && completionPercentage < 100) {
            survey.surveyStatus = 'IN_PROGRESS';
        } else if (completionPercentage === 100 && survey.surveyStatus !== 'SUBMITTED' && survey.surveyStatus !== 'COMPLETED') {
            // When 100% complete but not yet submitted, keep as IN_PROGRESS
            survey.surveyStatus = 'IN_PROGRESS';
        }
        // If already SUBMITTED or COMPLETED, don't change the status
        
        survey.lastModifiedBy = userId;
        survey.lastModifiedAt = new Date();

        await survey.save();
        await survey.populate([
            { path: 'slum', select: 'name' },
            { path: 'surveyor', select: 'name email' },
        ]);

        console.log(`Updated survey section: ${section} for survey ${surveyId}. Completion: ${completionPercentage}%`);
        sendSuccess(res, {...survey.toObject(), completionPercentage}, `${section} updated successfully. Overall completion: ${completionPercentage}%`);
    } catch (error) {
        console.error('Error in updateSurveySection:', error.message);
        sendError(res, error.message || 'Failed to update survey section', 500);
    }
};
