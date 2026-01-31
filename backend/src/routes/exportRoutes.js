const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');
const SlumSurvey = require('../models/SlumSurvey');
const HouseholdSurvey = require('../models/HouseholdSurvey');
const Slum = require('../models/Slum');

const router = express.Router();

// Export slum surveys to CSV
router.get('/slum-surveys', auth, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const { slumId } = req.query;
    
    let filter = {};
    if (slumId) {
      filter.slum = slumId;
    }

    const surveys = await SlumSurvey.find(filter)
      .populate('slum', 'name location city ward')
      .populate('surveyor', 'name username')
      .sort({ createdAt: -1 });

    if (surveys.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No slum surveys found.'
      });
    }

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '../temp/slum_surveys.csv'),
      header: [
        { id: 'slumName', title: 'Slum Name' },
        { id: 'location', title: 'Location' },
        { id: 'city', title: 'City' },
        { id: 'ward', title: 'Ward' },
        { id: 'surveyor', title: 'Surveyor' },
        { id: 'totalArea', title: 'Total Area' },
        { id: 'population', title: 'Population' },
        { id: 'households', title: 'Households' },
        { id: 'density', title: 'Density' },
        { id: 'waterSupply', title: 'Water Supply' },
        { id: 'drainage', title: 'Drainage' },
        { id: 'electricity', title: 'Electricity' },
        { id: 'roads', title: 'Roads' },
        { id: 'toilets', title: 'Toilets' },
        { id: 'literacyRate', title: 'Literacy Rate' },
        { id: 'employmentRate', title: 'Employment Rate' },
        { id: 'povertyLine', title: 'Poverty Line' },
        { id: 'majorOccupations', title: 'Major Occupations' },
        { id: 'surveyStatus', title: 'Survey Status' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'submittedAt', title: 'Submitted At' }
      ]
    });

    // Prepare data for CSV
    const csvData = surveys.map(survey => ({
      slumName: survey.slum?.name || '',
      location: survey.slum?.location || '',
      city: survey.slum?.city || '',
      ward: survey.slum?.ward || '',
      surveyor: survey.surveyor?.name || '',
      totalArea: survey.slumProfile?.totalArea || '',
      population: survey.slumProfile?.population || '',
      households: survey.slumProfile?.households || '',
      density: survey.slumProfile?.density || '',
      waterSupply: survey.infrastructure?.waterSupply || '',
      drainage: survey.infrastructure?.drainage || '',
      electricity: survey.infrastructure?.electricity || '',
      roads: survey.infrastructure?.roads || '',
      toilets: survey.infrastructure?.toilets || '',
      literacyRate: survey.socioEconomicConditions?.literacyRate || '',
      employmentRate: survey.socioEconomicConditions?.employmentRate || '',
      povertyLine: survey.socioEconomicConditions?.povertyLine || '',
      majorOccupations: survey.socioEconomicConditions?.majorOccupations?.join('; ') || '',
      surveyStatus: survey.surveyStatus,
      createdAt: survey.createdAt.toISOString(),
      submittedAt: survey.submittedAt ? survey.submittedAt.toISOString() : ''
    }));

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write to CSV
    await csvWriter.writeRecords(csvData);

    // Send file
    const filePath = path.join(__dirname, '../temp/slum_surveys.csv');
    res.download(filePath, `slum_surveys_${new Date().toISOString().split('T')[0]}.csv`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temp file after sending
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 1000);
    });

  } catch (error) {
    console.error('Export slum surveys error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error exporting slum surveys.'
    });
  }
});

// Export household surveys to CSV
router.get('/household-surveys/:slumId', auth, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const { slumId } = req.params;

    // Validate slum exists
    const slum = await Slum.findById(slumId);
    if (!slum) {
      return res.status(404).json({
        success: false,
        message: 'Slum not found.'
      });
    }

    // Get all surveys for this slum (direct slum reference)
    const surveys = await HouseholdSurvey.find({ slum: slumId })
      .populate('surveyor', 'name username')
      .sort({ createdAt: -1 });

    if (surveys.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No household surveys found for this slum.'
      });
    }

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '../temp/household_surveys.csv'),
      header: [
        { id: 'slumName', title: 'Slum Name' },
        { id: 'doorNo', title: 'Door No' },
        { id: 'headName', title: 'Head of Family' },
        { id: 'surveyor', title: 'Surveyor' },
        { id: 'headNameField', title: 'Head Name' },
        { id: 'fatherName', title: "Father's Name" },
        { id: 'sex', title: 'Sex' },
        { id: 'caste', title: 'Caste' },
        { id: 'religion', title: 'Religion' },
        { id: 'minorityStatus', title: 'Minority Status' },
        { id: 'adultMale', title: 'Adult Male Members' },
        { id: 'adultFemale', title: 'Adult Female Members' },
        { id: 'adultTotal', title: 'Total Adult Members' },
        { id: 'illiterateMale', title: 'Illiterate Adult Male' },
        { id: 'illiterateFemale', title: 'Illiterate Adult Female' },
        { id: 'illiterateTotal', title: 'Total Illiterate Adults' },
        { id: 'childrenMale', title: 'Children Male (6-14)' },
        { id: 'childrenFemale', title: 'Children Female (6-14)' },
        { id: 'childrenTotal', title: 'Total Children (6-14)' },
        { id: 'belowPovertyLine', title: 'Below Poverty Line' },
        { id: 'hasBplCard', title: 'Has BPL Card' },
        { id: 'houseStructure', title: 'House Structure' },
        { id: 'roofType', title: 'Roof Type' },
        { id: 'flooringType', title: 'Flooring Type' },
        { id: 'lightingType', title: 'Lighting Type' },
        { id: 'cookingFuel', title: 'Cooking Fuel' },
        { id: 'waterSource', title: 'Water Source' },
        { id: 'toiletFacility', title: 'Toilet Facility' },
        { id: 'yearsInCity', title: 'Years in City' },
        { id: 'hasMigrated', title: 'Has Migrated' },
        { id: 'migratedFrom', title: 'Migrated From' },
        { id: 'migrationType', title: 'Migration Type' },
        { id: 'reasonForMigration', title: 'Reason for Migration' },
        { id: 'adultEarningsMale', title: 'Adult Earnings Male' },
        { id: 'adultEarningsFemale', title: 'Adult Earnings Female' },
        { id: 'adultEarningsTotal', title: 'Total Adult Earnings' },
        { id: 'monthlyIncome', title: 'Average Monthly Income' },
        { id: 'monthlyExpenditure', title: 'Average Monthly Expenditure' },
        { id: 'debtOutstanding', title: 'Debt Outstanding' },
        { id: 'consumerDurables', title: 'Consumer Durables' },
        { id: 'livestock', title: 'Livestock' },
        { id: 'surveyStatus', title: 'Survey Status' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'submittedAt', title: 'Submitted At' }
      ]
    });

    // Prepare data for CSV
    const csvData = surveys.map(survey => ({
      slumName: slum.name,
      doorNo: survey.houseDoorNo || '',
      headName: survey.headOfFamily?.name || '',
      surveyor: survey.surveyor?.name || '',
      headNameField: survey.headOfFamily?.name || '',
      fatherName: survey.headOfFamily?.fatherName || '',
      sex: survey.headOfFamily?.sex || '',
      caste: survey.headOfFamily?.caste || '',
      religion: survey.headOfFamily?.religion || '',
      minorityStatus: survey.headOfFamily?.minorityStatus || '',
      adultMale: survey.familyComposition?.adultMembers?.male || 0,
      adultFemale: survey.familyComposition?.adultMembers?.female || 0,
      adultTotal: survey.familyComposition?.adultMembers?.total || 0,
      illiterateMale: survey.familyComposition?.illiterateAdults?.male || 0,
      illiterateFemale: survey.familyComposition?.illiterateAdults?.female || 0,
      illiterateTotal: survey.familyComposition?.illiterateAdults?.total || 0,
      childrenMale: survey.familyComposition?.childrenNotInSchool?.male || 0,
      childrenFemale: survey.familyComposition?.childrenNotInSchool?.female || 0,
      childrenTotal: survey.familyComposition?.childrenNotInSchool?.total || 0,
      belowPovertyLine: survey.povertyStatus?.isBelowPovertyLine || '',
      hasBplCard: survey.povertyStatus?.hasBplCard || '',
      houseStructure: survey.housing?.houseStructure || '',
      roofType: survey.housing?.roofType || '',
      flooringType: survey.housing?.flooringType || '',
      lightingType: survey.housing?.lightingType || '',
      cookingFuel: survey.housing?.cookingFuel || '',
      waterSource: survey.waterSanitation?.drinkingWaterSource || '',
      toiletFacility: survey.waterSanitation?.toiletFacility || '',
      yearsInCity: survey.migration?.yearsOfStayInCity || '',
      hasMigrated: survey.migration?.hasMigrated || '',
      migratedFrom: survey.migration?.migratedFrom || '',
      migrationType: survey.migration?.migrationType || '',
      reasonForMigration: survey.migration?.reasonForMigration || '',
      adultEarningsMale: survey.earnings?.adultMembers?.male || 0,
      adultEarningsFemale: survey.earnings?.adultMembers?.female || 0,
      adultEarningsTotal: survey.earnings?.adultMembers?.total || 0,
      monthlyIncome: survey.financialDetails?.averageMonthlyIncome || 0,
      monthlyExpenditure: survey.financialDetails?.averageMonthlyExpenditure || 0,
      debtOutstanding: survey.financialDetails?.debtOutstanding || 0,
      consumerDurables: survey.assets?.consumerDurables?.join('; ') || '',
      livestock: survey.assets?.livestock?.join('; ') || '',
      surveyStatus: survey.surveyStatus,
      createdAt: survey.createdAt.toISOString(),
      submittedAt: survey.submittedAt ? survey.submittedAt.toISOString() : ''
    }));

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write to CSV
    await csvWriter.writeRecords(csvData);

    // Send file
    const filePath = path.join(__dirname, '../temp/household_surveys.csv');
    res.download(filePath, `household_surveys_${slum.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temp file after sending
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 1000);
    });

  } catch (error) {
    console.error('Export household surveys error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error exporting household surveys.'
    });
  }
});

module.exports = router;