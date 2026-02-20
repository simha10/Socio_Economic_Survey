const mongoose = require('mongoose');
const HouseholdSurvey = require('../src/models/HouseholdSurvey');
const SlumSurvey = require('../src/models/SlumSurvey');
const Slum = require('../src/models/Slum');

// Load environment variables
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socio-economic-survey';

async function validateDemographicData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all slums
    const slums = await Slum.find({});
    console.log(`\nFound ${slums.length} slums in the database`);

    // Check each slum's household surveys
    for (const slum of slums) {
      console.log(`\n=== SLUM: ${slum.slumName} (${slum._id}) ===`);
      
      // Get household surveys for this slum
      const householdSurveys = await HouseholdSurvey.find({ slum: slum._id });
      console.log(`Household surveys found: ${householdSurveys.length}`);
      
      if (householdSurveys.length === 0) {
        console.log('No household surveys found for this slum');
        continue;
      }
      
      // Initialize counters
      let casteCounts = {
        SC: { count: 0, population: 0, households: 0 },
        ST: { count: 0, population: 0, households: 0 },
        OBC: { count: 0, population: 0, households: 0 },
        GENERAL: { count: 0, population: 0, households: 0 },
        UNKNOWN: { count: 0, population: 0, households: 0 }
      };
      
      let minorityCounts = {
        MINORITY: { count: 0, population: 0, households: 0 },
        NON_MINORITY: { count: 0, population: 0, households: 0 },
        UNKNOWN: { count: 0, population: 0, households: 0 }
      };
      
      let totalPopulation = 0;
      let totalHouseholds = 0;
      
      // Analyze each household survey
      for (const survey of householdSurveys) {
        totalHouseholds++;
        
        // Check caste data
        const caste = survey.caste || 'UNKNOWN';
        if (casteCounts[caste]) {
          casteCounts[caste].count++;
          casteCounts[caste].households++;
        } else {
          casteCounts.UNKNOWN.count++;
          casteCounts.UNKNOWN.households++;
        }
        
        // Check minority status
        const minorityStatus = survey.minorityStatus || 'UNKNOWN';
        if (minorityCounts[minorityStatus]) {
          minorityCounts[minorityStatus].count++;
          minorityCounts[minorityStatus].households++;
        } else {
          minorityCounts.UNKNOWN.count++;
          minorityCounts.UNKNOWN.households++;
        }
        
        // Check family members
        const familyMembers = survey.familyMembersTotal || 0;
        totalPopulation += familyMembers;
        
        if (casteCounts[caste]) {
          casteCounts[caste].population += familyMembers;
        } else {
          casteCounts.UNKNOWN.population += familyMembers;
        }
        
        if (minorityCounts[minorityStatus]) {
          minorityCounts[minorityStatus].population += familyMembers;
        } else {
          minorityCounts.UNKNOWN.population += familyMembers;
        }
      }
      
      // Display results
      console.log('\nCASTE DISTRIBUTION:');
      console.log('SC:', casteCounts.SC);
      console.log('ST:', casteCounts.ST);
      console.log('OBC:', casteCounts.OBC);
      console.log('GENERAL:', casteCounts.GENERAL);
      console.log('UNKNOWN:', casteCounts.UNKNOWN);
      
      console.log('\nMINORITY STATUS DISTRIBUTION:');
      console.log('MINORITY:', minorityCounts.MINORITY);
      console.log('NON_MINORITY:', minorityCounts.NON_MINORITY);
      console.log('UNKNOWN:', minorityCounts.UNKNOWN);
      
      console.log('\nTOTALS:');
      console.log('Total Population:', totalPopulation);
      console.log('Total Households:', totalHouseholds);
      
      // Check slum survey data
      const slumSurvey = await SlumSurvey.findOne({ slum: slum._id });
      if (slumSurvey && slumSurvey.demographicProfile) {
        console.log('\nCURRENT SLUM SURVEY DEMOGRAPHIC DATA:');
        console.log('Total Population:', slumSurvey.demographicProfile.totalPopulation);
        console.log('Number of Households:', slumSurvey.demographicProfile.numberOfHouseholds);
      } else {
        console.log('\nNo slum survey found or no demographic profile data');
      }
      
      // Test the calculation function
      console.log('\nTESTING CALCULATION FUNCTION:');
      await testDemographicCalculation(slum._id);
    }
    
    console.log('\n=== VALIDATION COMPLETE ===');
    
  } catch (error) {
    console.error('Error during validation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

async function testDemographicCalculation(slumId) {
  try {
    // Import the calculation function
    const { updateSlumDemographicPopulationFromHouseholdSurveys } = require('../src/utils/statusSyncHelper');
    
    // Run the calculation
    const result = await updateSlumDemographicPopulationFromHouseholdSurveys(slumId);
    console.log('Calculation function result:', result ? 'SUCCESS' : 'FAILED');
    
    // Check the updated data
    const slumSurvey = await SlumSurvey.findOne({ slum: slumId });
    if (slumSurvey && slumSurvey.demographicProfile) {
      console.log('Updated demographic data:');
      console.log('Total Population:', slumSurvey.demographicProfile.totalPopulation);
      console.log('Number of Households:', slumSurvey.demographicProfile.numberOfHouseholds);
    }
  } catch (error) {
    console.error('Error testing calculation:', error);
  }
}

// Run the validation
validateDemographicData();