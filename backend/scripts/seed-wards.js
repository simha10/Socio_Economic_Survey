const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Ward = require('../src/models/Ward');
const District = require('../src/models/District');

// Load environment variables
require('dotenv').config();

const seedWards = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socio_economic_survey');
    console.log('Connected to MongoDB');

    // Read WARDS.js file
    const wardsDataPath = path.join(__dirname, '../../APIS/WARDS.js');
    const wardsDataContent = fs.readFileSync(wardsDataPath, 'utf8');
    
    // Extract the WARDS array from the file
    // Remove the 'const WARDS = ' part and get the array
    const startIndex = wardsDataContent.indexOf('[');
    const endIndex = wardsDataContent.lastIndexOf(']') + 1;
    
    if (startIndex === -1 || endIndex === 0) {
      console.error('Could not find WARDS array in file');
      process.exit(1);
    }
    
    const wardsArrayString = wardsDataContent.substring(startIndex, endIndex);
    const wardsData = JSON.parse(wardsArrayString.replace(/(\w+):/g, '"$1":')); // Convert to valid JSON
    console.log(`Parsed ${wardsData.length} ward objects from file`);

    // Find the district document (assuming all wards belong to district code 407)
    const districtDoc = await District.findOne({ code: '407' });
    if (!districtDoc) {
      console.log('District with code 407 not found. Please seed districts first.');
      process.exit(1);
    }
    console.log(`Found district: ${districtDoc.name} (Code: ${districtDoc.code})`);

    // Transform and seed wards data - First pass: only unique WardNo combinations
    const wardNoCounts = {};
    const wardsToInsert = [];
    const duplicateRecords = [];
        
    // First, identify all WardNo and their counts
    wardsData.forEach((ward, index) => {
      if (!wardNoCounts[ward.WardNo]) {
        wardNoCounts[ward.WardNo] = [];
      }
      wardNoCounts[ward.WardNo].push({ ...ward, originalIndex: index });
    });
        
    // Separate unique records from duplicates
    Object.entries(wardNoCounts).forEach(([wardNo, records]) => {
      if (records.length === 1) {
        // Unique record - add to main insertion list
        const ward = records[0];
        wardsToInsert.push({
          district: districtDoc._id,
          zone: `ZONE-${ward.ZoneNo}`,
          number: ward.WardNo.toString(),
          name: ward.WardName?.trim() || `WARD ${ward.WardNo}`
        });
      } else {
        // Duplicate records - add to duplicate list for separate handling
        duplicateRecords.push(...records);
        console.log(`Duplicate WardNo ${wardNo} found (${records.length} records)`);
      }
    });
        
    console.log(`\n=== SEEDING REPORT ===`);
    console.log(`Unique records to insert: ${wardsToInsert.length}`);
    console.log(`Duplicate records found: ${duplicateRecords.length}`);
    console.log(`Total source records: ${wardsData.length}`);
    console.log(`=====================\n`);
        
    // Clear existing wards
    await Ward.deleteMany({});
    console.log('Cleared existing wards data');
        
    // Insert unique records only
    if (wardsToInsert.length > 0) {
      const result = await Ward.insertMany(wardsToInsert);
      console.log(`Successfully seeded ${result.length} unique wards`);
    } else {
      console.log('No unique records to insert');
    }
        
    // Handle duplicate records separately (if any)
    if (duplicateRecords.length > 0) {
      console.log(`\n=== DUPLICATE RECORDS DETAIL ===`);
      console.log('These records have duplicate WardNo and were not inserted:');
          
      // Group duplicates by WardNo for better reporting
      const duplicateGroups = {};
      duplicateRecords.forEach(record => {
        if (!duplicateGroups[record.WardNo]) {
          duplicateGroups[record.WardNo] = [];
        }
        duplicateGroups[record.WardNo].push(record);
      });
          
      Object.entries(duplicateGroups).forEach(([wardNo, records]) => {
        console.log(`\nWardNo ${wardNo} (${records.length} duplicates):`);
        records.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.WardName} - Zone: ${record.ZoneNo}, District: ${record.District}`);
        });
      });
      console.log(`========================\n`);
    }

    // Verify the data
    const totalWards = await Ward.countDocuments();
    console.log(`Total wards in database: ${totalWards}`);

    mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding wards:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedWards();