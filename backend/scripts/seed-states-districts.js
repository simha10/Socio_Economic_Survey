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
      { name: 'ANANTAPUR', code: 'AP01', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'CHITTOOR', code: 'AP02', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'EAST GODAVARI', code: 'AP03', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'GUNTUR', code: 'AP04', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'KRISHNA', code: 'AP05', state: createdStates.find(s => s.code === 'AP')._id },
      { name: 'KURNOOL', code: 'AP06', state: createdStates.find(s => s.code === 'AP')._id },

      // Assam
      { name: 'KAMRUP METROPOLITAN', code: 'AS01', state: createdStates.find(s => s.code === 'AS')._id },
      { name: 'JORHAT', code: 'AS02', state: createdStates.find(s => s.code === 'AS')._id },
      { name: 'DIBRUGARH', code: 'AS03', state: createdStates.find(s => s.code === 'AS')._id },
      { name: 'GOALPARA', code: 'AS04', state: createdStates.find(s => s.code === 'AS')._id },

      // Bihar
      { name: 'PATNA', code: 'BR01', state: createdStates.find(s => s.code === 'BR')._id },
      { name: 'GOPALGANJ', code: 'BR02', state: createdStates.find(s => s.code === 'BR')._id },
      { name: 'MUZAFFARPUR', code: 'BR03', state: createdStates.find(s => s.code === 'BR')._id },
      { name: 'DARBHANGA', code: 'BR04', state: createdStates.find(s => s.code === 'BR')._id },

      // Gujarat
      { name: 'AHMEDABAD', code: 'GJ01', state: createdStates.find(s => s.code === 'GJ')._id },
      { name: 'SURAT', code: 'GJ02', state: createdStates.find(s => s.code === 'GJ')._id },
      { name: 'VADODARA', code: 'GJ03', state: createdStates.find(s => s.code === 'GJ')._id },
      { name: 'RAJKOT', code: 'GJ04', state: createdStates.find(s => s.code === 'GJ')._id },

      // Karnataka
      { name: 'BANGALORE URBAN', code: 'KA01', state: createdStates.find(s => s.code === 'KA')._id },
      { name: 'BANGALORE RURAL', code: 'KA02', state: createdStates.find(s => s.code === 'KA')._id },
      { name: 'MYSORE', code: 'KA03', state: createdStates.find(s => s.code === 'KA')._id },
      { name: 'DAVANGERE', code: 'KA04', state: createdStates.find(s => s.code === 'KA')._id },

      // Maharashtra
      { name: 'MUMBAI CITY', code: 'MH01', state: createdStates.find(s => s.code === 'MH')._id },
      { name: 'MUMBAI SUBURBAN', code: 'MH02', state: createdStates.find(s => s.code === 'MH')._id },
      { name: 'PUNE', code: 'MH03', state: createdStates.find(s => s.code === 'MH')._id },
      { name: 'THANE', code: 'MH04', state: createdStates.find(s => s.code === 'MH')._id },
      { name: 'NAGPUR', code: 'MH05', state: createdStates.find(s => s.code === 'MH')._id },

      // Tamil Nadu
      { name: 'CHENNAI', code: 'TN01', state: createdStates.find(s => s.code === 'TN')._id },
      { name: 'COIMBATORE', code: 'TN02', state: createdStates.find(s => s.code === 'TN')._id },
      { name: 'MADURAI', code: 'TN03', state: createdStates.find(s => s.code === 'TN')._id },
      { name: 'TIRUCHIRAPPALLI', code: 'TN04', state: createdStates.find(s => s.code === 'TN')._id },

      // Uttar Pradesh
      { name: 'LUCKNOW', code: 'UP01', state: createdStates.find(s => s.code === 'UP')._id },
      { name: 'KANPUR NAGAR', code: 'UP02', state: createdStates.find(s => s.code === 'UP')._id },
      { name: 'VARANASI', code: 'UP03', state: createdStates.find(s => s.code === 'UP')._id },
      { name: 'ALLAHABAD', code: 'UP04', state: createdStates.find(s => s.code === 'UP')._id },

      // West Bengal
      { name: 'KOLKATA', code: 'WB01', state: createdStates.find(s => s.code === 'WB')._id },
      { name: 'HOWRAH', code: 'WB02', state: createdStates.find(s => s.code === 'WB')._id },
      { name: 'NORTH 24 PARGANAS', code: 'WB03', state: createdStates.find(s => s.code === 'WB')._id },
      { name: 'SOUTH 24 PARGANAS', code: 'WB04', state: createdStates.find(s => s.code === 'WB')._id },

      // Delhi
      { name: 'CENTRAL DELHI', code: 'DL01', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'EAST DELHI', code: 'DL02', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'NEW DELHI', code: 'DL03', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'NORTH DELHI', code: 'DL04', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'SOUTH DELHI', code: 'DL05', state: createdStates.find(s => s.code === 'DL')._id },
      { name: 'WEST DELHI', code: 'DL06', state: createdStates.find(s => s.code === 'DL')._id }
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