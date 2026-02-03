const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Slum = require('../src/models/Slum');
const User = require('../src/models/User');
const Ward = require('../src/models/Ward');

// Load environment variables
require('dotenv').config();

const seedSlums = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socio_economic_survey');
    console.log('Connected to MongoDB');

    // Read SLUMS.js file
    const slumsDataPath = path.join(__dirname, '../../APIS/SLUMS.js');
    const slumsDataContent = fs.readFileSync(slumsDataPath, 'utf8');
    
    // Parse the JSON content (it's not a proper array, so we need to split and parse each object)
    const lines = slumsDataContent.split('\n');
    const slumsData = [];
    let currentObject = '';
    let inObject = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '{') {
        inObject = true;
        currentObject = '{';
      } else if (line === '},') {
        currentObject += '}';
        try {
          const obj = JSON.parse(currentObject);
          slumsData.push(obj);
        } catch (e) {
          console.error('Error parsing object at line', i, ':', e.message);
          console.error('Object content:', currentObject);
        }
        inObject = false;
        currentObject = '';
      } else if (line === '}' && inObject) {
        // Handle last object which might not have a comma
        currentObject += '}';
        try {
          const obj = JSON.parse(currentObject);
          slumsData.push(obj);
        } catch (e) {
          console.error('Error parsing last object at line', i, ':', e.message);
        }
        inObject = false;
        currentObject = '';
      } else if (inObject) {
        currentObject += line + '\n';
      }
    }
    
    console.log(`Parsed ${slumsData.length} slum objects from file`);

    // Find an admin user to set as createdBy
    const adminUser = await User.findOne({ role: 'ADMIN' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Get all wards to create mapping from ward number to ward ID
    const wards = await Ward.find({});
    const wardMap = {};
    wards.forEach(ward => {
      wardMap[ward.number] = ward._id;
    });
    console.log(`Loaded ${wards.length} wards for mapping`);

    // Transform and seed slums data - First pass: only unique SLUM_IDs
    const slumIdCounts = {};
    const slumsToInsert = [];
    const duplicateRecords = [];
    const problematicRecords = [];
        
    // First, identify all SLUM_IDs and their counts
    slumsData.forEach((slum, index) => {
      if (!slumIdCounts[slum.SLUM_ID]) {
        slumIdCounts[slum.SLUM_ID] = [];
      }
      slumIdCounts[slum.SLUM_ID].push({ ...slum, originalIndex: index });
    });
        
    // Separate unique records from duplicates
    Object.entries(slumIdCounts).forEach(([slumId, records]) => {
      if (records.length === 1) {
        // Unique record - add to main insertion list
        const slum = records[0];
        const wardId = wardMap[slum.WARD_NO?.toString()];
        
        if (!wardId) {
          console.warn(`Warning: Ward ${slum.WARD_NO} not found for slum ${slum.SLUM_NAME}`);
          problematicRecords.push(slum);
          return;
        }
        
        slumsToInsert.push({
          slumId: slum.SLUM_ID,
          slumName: slum.SLUM_NAME?.trim() || '',
          stateCode: slum.STATE_CODE?.toString() || '',
          distCode: slum.DIST_CODE?.toString() || '',
          ulbCode: slum.ULB_CODE?.toString() || '',
          ulbName: slum.ULB_NAME?.trim() || '',
          cityTownCode: slum.CITY_TOWN_CODE?.toString() || '',
          ward: wardId,
          slumType: slum.SLUM_TYPE?.trim().toUpperCase().replace(' ', '_').replace('-', '_') || 'NON_NOTIFIED',
          village: slum.VILLAGE?.trim() || '',
          area: slum.Area ? parseFloat(slum.Area) || 0 : 0,
          landOwnership: slum.LAND_OWNERSHIP?.trim() || '',
          totalHouseholds: slum.TOTAL_HOUSE_HOLDS ? parseInt(slum.TOTAL_HOUSE_HOLDS) || 0 : 0,
          createdBy: adminUser._id
      });
      } else {
        // Duplicate records - add to duplicate list for separate handling
        duplicateRecords.push(...records);
        console.log(`Duplicate SLUM_ID ${slumId} found (${records.length} records)`);
      }
    });
        
    console.log(`\n=== SEEDING REPORT ===`);
    console.log(`Unique records to insert: ${slumsToInsert.length}`);
    console.log(`Duplicate records found: ${duplicateRecords.length}`);
    console.log(`Problematic records (ward not found): ${problematicRecords.length}`);
    console.log(`Total source records: ${slumsData.length}`);
    console.log(`=====================\n`);
        
    // Clear existing slums
    await Slum.deleteMany({});
    console.log('Cleared existing slums data');
        
    // Insert unique records only
    if (slumsToInsert.length > 0) {
      const result = await Slum.insertMany(slumsToInsert);
      console.log(`Successfully seeded ${result.length} unique slums`);
    } else {
      console.log('No unique records to insert');
    }
        
    // Handle duplicate records separately (if any)
    if (duplicateRecords.length > 0) {
      console.log(`\n=== DUPLICATE RECORDS DETAIL ===`);
      console.log('These records have duplicate SLUM_IDs and were not inserted:');
          
      // Group duplicates by SLUM_ID for better reporting
      const duplicateGroups = {};
      duplicateRecords.forEach(record => {
        if (!duplicateGroups[record.SLUM_ID]) {
          duplicateGroups[record.SLUM_ID] = [];
        }
        duplicateGroups[record.SLUM_ID].push(record);
      });
          
      Object.entries(duplicateGroups).forEach(([slumId, records]) => {
        console.log(`\nSLUM_ID ${slumId} (${records.length} duplicates):`);
        records.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.SLUM_NAME} - Ward: ${record.WARD_NO}, Village: ${record.VILLAGE || 'N/A'}`);
        });
      });
      console.log(`========================\n`);
    }

    // Handle problematic records (ward not found)
    if (problematicRecords.length > 0) {
      console.log(`\n=== PROBLEMATIC RECORDS DETAIL ===`);
      console.log('These records have wards that could not be mapped:');
      problematicRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.SLUM_NAME} - Ward: ${record.WARD_NO}, District: ${record.DIST_CODE}`);
      });
      console.log(`==================================\n`);
    }

    // Verify the data
    const totalSlums = await Slum.countDocuments();
    console.log(`Total slums in database: ${totalSlums}`);

    mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding slums:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedSlums();