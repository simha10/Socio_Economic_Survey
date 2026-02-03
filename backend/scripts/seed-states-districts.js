const mongoose = require('mongoose');
const State = require('../src/models/State');
const District = require('../src/models/District');
require('dotenv').config();

const seedStatesAndDistricts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Socio-Economic-Survey');
    console.log('Connected to MongoDB');

    // Clear existing data
    await State.deleteMany({});
    await District.deleteMany({});
    console.log('Cleared existing states and districts');

    // Indian States data
    const statesData = [
      { code: '23', name: 'MADHYA PRADESH' },
      { code: '9', name: 'UTTAR PRADESH' }
    ];

    // Create states
    const createdStates = await State.insertMany(statesData);
    console.log(`Created ${createdStates.length} states`);

    // Districts data for some major states (sample data)
    const districtsData = [
      // Madhya Pradesh
      { code: '407', name: 'GWALIOR', state: createdStates.find(s => s.code === '23')._id },
      // Uttar Pradesh
      { code: '162', name: 'LUCKNOW', state: createdStates.find(s => s.code === '9')._id }
    ];

    // Create districts
    const createdDistricts = await District.insertMany(districtsData);
    console.log(`Created ${createdDistricts.length} districts`);

    // Update states with district references
    for (const district of createdDistricts) {
      await State.findByIdAndUpdate(
        district.state,
        { $push: { districts: district._id } }
      );
    }

    console.log('\nSeed completed successfully!');
    console.log(`Total states: ${createdStates.length}`);
    console.log(`Total districts: ${createdDistricts.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding states and districts:', error);
    process.exit(1);
  }
};

// Run the seed function
seedStatesAndDistricts();