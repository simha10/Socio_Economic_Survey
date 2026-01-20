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
      { name: 'ANDHRA PRADESH', code: 'AP' },
      { name: 'ARUNACHAL PRADESH', code: 'AR' },
      { name: 'ASSAM', code: 'AS' },
      { name: 'BIHAR', code: 'BR' },
      { name: 'CHHATTISGARH', code: 'CT' },
      { name: 'GOA', code: 'GA' },
      { name: 'GUJARAT', code: 'GJ' },
      { name: 'HARYANA', code: 'HR' },
      { name: 'HIMACHAL PRADESH', code: 'HP' },
      { name: 'JHARKHAND', code: 'JH' },
      { name: 'KARNATAKA', code: 'KA' },
      { name: 'KERALA', code: 'KL' },
      { name: 'MADHYA PRADESH', code: 'MP' },
      { name: 'MAHARASHTRA', code: 'MH' },
      { name: 'MANIPUR', code: 'MN' },
      { name: 'MEGHALAYA', code: 'ML' },
      { name: 'MIZORAM', code: 'MZ' },
      { name: 'NAGALAND', code: 'NL' },
      { name: 'ODISHA', code: 'OR' },
      { name: 'PUNJAB', code: 'PB' },
      { name: 'RAJASTHAN', code: 'RJ' },
      { name: 'SIKKIM', code: 'SK' },
      { name: 'TAMIL NADU', code: 'TN' },
      { name: 'TELANGANA', code: 'TG' },
      { name: 'TRIPURA', code: 'TR' },
      { name: 'UTTAR PRADESH', code: 'UP' },
      { name: 'UTTARAKHAND', code: 'UK' },
      { name: 'WEST BENGAL', code: 'WB' },
      { name: 'DELHI', code: 'DL' },
      { name: 'JAMMU AND KASHMIR', code: 'JK' },
      { name: 'LADAKH', code: 'LA' },
      { name: 'PUDUCHERRY', code: 'PY' }
    ];

    // Create states
    const createdStates = await State.insertMany(statesData);
    console.log(`Created ${createdStates.length} states`);

    // Districts data for some major states (sample data)
    const districtsData = [
      // Andhra Pradesh
      { name: 'ANANTAPUR', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'CHITTOOR', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'EAST GODAVARI', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'GUNTUR', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'KRISHNA', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'KURNOOL', state: createdStates.find(s => s.code === 'AP')._id },

      // Assam
      { name: 'KAMRUP METROPOLITAN', state: createdStates.find(s => s.code === 'AS')._id },
      { name: 'JORHAT', state: createdStates.find(s => s.code === 'AS')._id },
      { name: 'DIBRUGARH', state: createdStates.find(s => s.code === 'AS')._id },
      { name: 'GOALPARA', state: createdStates.find(s => s.code === 'AS')._id },

      // Bihar
      { name: 'PATNA', state: createdStates.find(s => s.code === 'BR')._id },
      { name: 'GOPALGANJ', state: createdStates.find(s => s.code === 'BR')._id },
      { name: 'MUZAFFARPUR', state: createdStates.find(s => s.code === 'BR')._id },
      { name: 'DARBHANGA', state: createdStates.find(s => s.code === 'BR')._id },

      // Gujarat
      { name: 'AHMEDABAD', state: createdStates.find(s => s.code === 'GJ')._id },
      { name: 'SURAT', state: createdStates.find(s => s.code === 'GJ')._id },
      { name: 'VADODARA', state: createdStates.find(s => s.code === 'GJ')._id },
      { name: 'RAJKOT', state: createdStates.find(s => s.code === 'GJ')._id },

      // Karnataka
      { name: 'BANGALORE URBAN', state: createdStates.find(s => s.code === 'KA')._id },
      { name: 'BANGALORE RURAL', state: createdStates.find(s => s.code === 'KA')._id },
      { name: 'MYSORE', state: createdStates.find(s => s.code === 'KA')._id },
      { name: 'DAVANGERE', state: createdStates.find(s => s.code === 'KA')._id },

      // Maharashtra
      { name: 'MUMBAI CITY', state: createdStates.find(s => s.code === 'MH')._id },
      { name: 'MUMBAI SUBURBAN', state: createdStates.find(s => s.code === 'MH')._id },
      { name: 'PUNE', state: createdStates.find(s => s.code === 'MH')._id },
      { name: 'THANE', state: createdStates.find(s => s.code === 'MH')._id },
      { name: 'NAGPUR', state: createdStates.find(s => s.code === 'MH')._id },

      // Tamil Nadu
      { name: 'CHENNAI', state: createdStates.find(s => s.code === 'TN')._id },
      { name: 'COIMBATORE', state: createdStates.find(s => s.code === 'TN')._id },
      { name: 'MADURAI', state: createdStates.find(s => s.code === 'TN')._id },
      { name: 'TIRUCHIRAPPALLI', state: createdStates.find(s => s.code === 'TN')._id },

      // Uttar Pradesh
      { name: 'LUCKNOW', state: createdStates.find(s => s.code === 'UP')._id },
      { name: 'KANPUR NAGAR', state: createdStates.find(s => s.code === 'UP')._id },
      { name: 'VARANASI', state: createdStates.find(s => s.code === 'UP')._id },
      { name: 'ALLAHABAD', state: createdStates.find(s => s.code === 'UP')._id },

      // West Bengal
      { name: 'KOLKATA', state: createdStates.find(s => s.code === 'WB')._id },
      { name: 'HOWRAH', state: createdStates.find(s => s.code === 'WB')._id },
      { name: 'NORTH 24 PARGANAS', state: createdStates.find(s => s.code === 'WB')._id },
      { name: 'SOUTH 24 PARGANAS', state: createdStates.find(s => s.code === 'WB')._id },

      // Delhi
      { name: 'CENTRAL DELHI', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'EAST DELHI', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'NEW DELHI', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'NORTH DELHI', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'SOUTH DELHI', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'WEST DELHI', state: createdStates.find(s => s.code === 'DL')._id }
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