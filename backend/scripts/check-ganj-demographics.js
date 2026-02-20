require('dotenv').config();
const mongoose = require('mongoose');
const Slum = require('../src/models/Slum');
const HouseholdSurvey = require('../src/models/HouseholdSurvey');
const SlumSurvey = require('../src/models/SlumSurvey');

async function checkGanjData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the GANJ slum
    const slum = await Slum.findOne({ 
      slumName: 'GANJ'
    });
    
    if (!slum) {
      console.log('GANJ slum not found');
      await mongoose.connection.close();
      return;
    }
    
    console.log('Testing BPL calculation for slum:', slum.slumName, 'ID:', slum._id);
    
    // Get all household surveys for this slum to see BPL data
    const householdSurveys = await HouseholdSurvey.find({ slum: slum._id });
    console.log(`Found ${householdSurveys.length} household surveys`);
    
    console.log('Household survey BPL data:');
    householdSurveys.forEach(hs => {
      console.log(`  HH: caste=${hs.caste}, belowPovertyLine=${hs.belowPovertyLine}, familyMembers=${hs.familyMembersTotal}`);
    });
    
    // Update the demographic population using our enhanced function
    const { updateSlumDemographicPopulationFromHouseholdSurveys } = require('../src/utils/statusSyncHelper');
    await updateSlumDemographicPopulationFromHouseholdSurveys(slum._id);
    
    // Check the updated data
    const slumSurvey = await SlumSurvey.findOne({ slum: slum._id });
    if (slumSurvey && slumSurvey.demographicProfile) {
      console.log('Updated demographic profile totalPopulation:', slumSurvey.demographicProfile.totalPopulation);
      console.log('Updated demographic profile bplPopulation:', slumSurvey.demographicProfile.bplPopulation);
      console.log('Updated demographic profile numberOfBplHouseholds:', slumSurvey.demographicProfile.numberOfBplHouseholds);
    } else {
      console.log('No slum survey or demographic profile found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

checkGanjData();