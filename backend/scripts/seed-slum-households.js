const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const HouseholdSurvey = require('../src/models/HouseholdSurvey');
const Slum = require('../src/models/Slum');
const User = require('../src/models/User');

// Load environment variables
require('dotenv').config();

/**
 * Seed household data for a specific slum from a JavaScript data file
 * @param {string} slumId - The slum ID to import data for
 * @param {string} filePath - Path to the JavaScript file containing HH_Data array
 * @param {string} surveyorId - Optional: Surveyor ID to assign to imported records
 */
async function seedSlumHouseholds(slumId, filePath, surveyorId = null) {
  let connection = null;
  
  try {
    // Connect to MongoDB
    connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socio_economic_survey', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Validate slum exists
    const slum = await Slum.findOne({ slumId: parseInt(slumId) });
    if (!slum) {
      console.error(`❌ Slum with ID ${slumId} not found in database.`);
      console.log('💡 Please ensure the slum exists. You can check existing slums with:');
      console.log('   node scripts/check-slums.js');
      process.exit(1);
    }
    
    console.log(`🏠 Found slum: ${slum.slumName} (ID: ${slum.slumId})`);
    console.log(`📍 Ward: ${slum.ward}, Total Households: ${slum.totalHouseholds}`);
    
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      console.log('💡 Please check the file path and try again.');
      process.exit(1);
    }
    
    // Read and parse the data file
    console.log(`📄 Reading data from: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract the HH_Data array from the file
    let HH_Data = [];
    try {
      // Find the array portion and extract it
      const arrayMatch = fileContent.match(/const\s+HH_Data\s*=\s*(\[[\s\S]*?\]);?/);
      if (arrayMatch && arrayMatch[1]) {
        // Clean the array string and parse it
        let arrayStr = arrayMatch[1];
        // Handle potential formatting issues
        arrayStr = arrayStr
          .replace(/,\s*]/g, ']') // Remove trailing commas
          .replace(/\s+/g, ' ')   // Normalize whitespace
          .trim();
        
        HH_Data = JSON.parse(arrayStr);
        console.log(`📊 Parsed ${HH_Data.length} records from file`);
      } else {
        console.error('❌ Could not find HH_Data array in file');
        console.log('💡 File format should be: const HH_Data = [ ... ];');
        process.exit(1);
      }
    } catch (parseError) {
      console.error('❌ Error parsing data file:', parseError.message);
      console.log('💡 Please ensure the file contains a valid HH_Data array');
      process.exit(1);
    }
    
    // Validate data structure
    console.log('🔍 Validating data structure...');
    const validationIssues = [];
    const validRecords = [];
    
    for (let i = 0; i < HH_Data.length; i++) {
      const item = HH_Data[i];
      const recordNum = i + 1;
      
      // Check required fields
      if (item.parcelId === undefined || item.parcelId === null) {
        validationIssues.push(`Record ${recordNum}: Missing parcelId`);
        continue;
      }
      
      if (item.propertyNo === undefined || item.propertyNo === null) {
        validationIssues.push(`Record ${recordNum}: Missing propertyNo`);
        continue;
      }
      
      if (item.headName === undefined || item.headName === null || item.headName === '') {
        validationIssues.push(`Record ${recordNum}: Missing or empty headName`);
        continue;
      }
      
      // Validate data types
      const parcelId = parseInt(item.parcelId);
      const propertyNo = parseInt(item.propertyNo);
      
      if (isNaN(parcelId)) {
        validationIssues.push(`Record ${recordNum}: Invalid parcelId (not a number)`);
        continue;
      }
      
      if (isNaN(propertyNo)) {
        validationIssues.push(`Record ${recordNum}: Invalid propertyNo (not a number)`);
        continue;
      }
      
      // Check if slumId matches
      if (item.slumId !== undefined && parseInt(item.slumId) !== parseInt(slumId)) {
        console.warn(`⚠️  Record ${recordNum}: slumId (${item.slumId}) doesn't match target slum (${slumId})`);
      }
      
      // Add validated record
      validRecords.push({
        originalIndex: recordNum,
        parcelId: parcelId,
        propertyNo: propertyNo,
        headName: item.headName.toString().trim(),
        fatherName: item.fatherName ? item.fatherName.toString().trim() : '',
        landTenureStatus: item.landTenureStatus ? item.landTenureStatus.toString().trim() : '',
        houseStructure: item.houseStructure ? item.houseStructure.toString().trim() : '',
        wardNumber: item.wardNumber ? parseInt(item.wardNumber) : null
      });
    }
    
    // Report validation results
    console.log(`\n📋 VALIDATION RESULTS:`);
    console.log(`✅ Valid records: ${validRecords.length}`);
    console.log(`❌ Invalid records: ${validationIssues.length}`);
    
    if (validationIssues.length > 0) {
      console.log('\n🔧 Validation Issues Found:');
      validationIssues.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
      if (validationIssues.length > 10) {
        console.log(`  ... and ${validationIssues.length - 10} more issues`);
      }
    }
    
    if (validRecords.length === 0) {
      console.log('❌ No valid records to import. Please fix the data issues above.');
      process.exit(1);
    }
    
    // Get surveyor (if not provided, use first available surveyor)
    let surveyor;
    if (surveyorId) {
      surveyor = await User.findById(surveyorId);
      if (!surveyor) {
        console.error(`❌ Surveyor with ID ${surveyorId} not found.`);
        process.exit(1);
      }
      if (surveyor.role !== 'SURVEYOR') {
        console.error(`❌ User ${surveyorId} is not a surveyor (role: ${surveyor.role})`);
        process.exit(1);
      }
    } else {
      // Find any surveyor
      surveyor = await User.findOne({ role: 'SURVEYOR' });
      if (!surveyor) {
        console.error('❌ No surveyors found in database.');
        console.log('💡 Please create a surveyor user first.');
        process.exit(1);
      }
    }
    
    console.log(`👤 Using surveyor: ${surveyor.name} (${surveyor.username})`);
    
    // Check for existing records
    console.log('🔍 Checking for existing records...');
    const existingRecords = await HouseholdSurvey.countDocuments({
      slum: slum._id,
      parcelId: { $in: validRecords.map(r => r.parcelId) },
      propertyNo: { $in: validRecords.map(r => r.propertyNo) }
    });
    
    if (existingRecords > 0) {
      console.log(`⚠️  Found ${existingRecords} existing records for this slum.`);
      console.log('💡 Existing records will be updated (upsert behavior)');
    }
    
    // Prepare bulk operations
    console.log('🔄 Preparing import operations...');
    const bulkOps = validRecords.map(record => ({
      updateOne: {
        filter: {
          slum: slum._id,
          parcelId: record.parcelId,
          propertyNo: record.propertyNo
        },
        update: {
          $set: {
            slum: slum._id,
            householdId: `${slum.slumId}_${record.parcelId}_${record.propertyNo}`,
            houseDoorNo: `${record.parcelId}-${record.propertyNo}`,
            parcelId: record.parcelId,
            propertyNo: record.propertyNo,
            source: 'IMPORTED',
            surveyStatus: 'DRAFT',
            surveyor: surveyor._id,
            headName: record.headName,
            fatherName: record.fatherName,
            landTenureStatus: record.landTenureStatus,
            houseStructure: record.houseStructure,
            slumName: slum.slumName,
            ward: record.wardNumber ? record.wardNumber.toString() : ''
          }
        },
        upsert: true
      }
    }));
    
    // Execute bulk import
    console.log(`🚀 Importing ${validRecords.length} records...`);
    const startTime = Date.now();
    
    const result = await HouseholdSurvey.bulkWrite(bulkOps, {
      ordered: false // Continue on errors
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Report results
    console.log(`\n🎉 IMPORT COMPLETED IN ${duration} SECONDS`);
    console.log(`📊 Results:`);
    console.log(`  ✅ Successfully processed: ${validRecords.length} records`);
    console.log(` ➕ records created: ${result.upsertedCount || 0}`);
    console.log(` 🔄 Existing records updated: ${result.modifiedCount || 0}`);
    console.log(` ❌ Failed operations: ${result.writeErrors?.length || 0}`);
    
    if (result.writeErrors && result.writeErrors.length > 0) {
      console.log(`\n🔧 Write Errors:`);
      result.writeErrors.slice(0, 5).forEach(error => {
        console.log(`  - Index ${error.index}: ${error.err.errmsg}`);
      });
      if (result.writeErrors.length > 5) {
        console.log(`  ... and ${result.writeErrors.length - 5} more errors`);
      }
    }
    
    // Verify import
    console.log('\n🔍 Verifying import...');
    const totalInSlum = await HouseholdSurvey.countDocuments({ slum: slum._id });
    const importedCount = await HouseholdSurvey.countDocuments({ 
      slum: slum._id, 
      source: 'IMPORTED' 
    });
    
    console.log(`📊 Verification Results:`);
    console.log(`  households in slum: ${totalInSlum}`);
    console.log(` 📥 households: ${importedCount}`);
    console.log(` 📈 success rate: ${((importedCount / validRecords.length) * 100).toFixed(1)}%`);
    
    // Show sample records
    const sampleRecords = await HouseholdSurvey.find({
      slum: slum._id,
      source: 'IMPORTED'
    }).limit(3);
    
    console.log('\n📋 Sample Imported Records:');
    sampleRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. Parcel: ${record.parcelId}, Property: ${record.propertyNo}`);
      console.log(`     Head: ${record.headName}`);
      console.log(`     Father: ${record.fatherName || 'N/A'}`);
      console.log(`     Status: ${record.surveyStatus}`);
      console.log(`     Structure: ${record.houseStructure || 'N/A'}`);
      console.log('');
    });
    
    // Update slum total households if needed
    const currentTotal = slum.totalHouseholds || 0;
    if (importedCount > currentTotal) {
      console.log(`🔄 Updating slum total households from ${currentTotal} to ${importedCount}`);
      await Slum.findByIdAndUpdate(slum._id, {
        totalHouseholds: importedCount
      });
    }
    
    console.log('✅ Import process completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Main execution
if (require.main === module) {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
📖 SLUM HOUSEHOLD DATA SEEDING SCRIPT
=====================================

This script imports household data from JavaScript files into the database.

📋 USAGE:
  node scripts/seed-slum-households.js <slumId> <filePath> [surveyorId]

🔧 PARAMETERS:
  slumId     - The numeric ID of the slum to import data for
  filePath   - Path to the JavaScript file containing HH_Data array
  surveyorId - (Optional) ID of surveyor to assign to records

📌 EXAMPLES:
  node scripts/seed-slum-households.js 69 "../APIS/Slum's_HH_Data/Slum_69.js"
  node scripts/seed-slum-households.js 69 "../APIS/Slum's_HH_Data/Slum_69.js" 507f1f77bcf86cd799439011

📚 REQUIREMENTS:
  1. Slum must already exist in database
  2. File must contain HH_Data array in correct format
  3. At least one surveyor user must exist
  4. MongoDB connection must be available

💡 TIPS:
  - Use check-slums.js to verify existing slums
  - Use seed-users.js to create surveyor users
  - Check file format before importing
  - Script will validate data and report issues
    `);
    process.exit(1);
  }
  
  const slumId = args[0];
  const filePath = path.resolve(args[1]);
  const surveyorId = args[2] || null;
  
  console.log(`🚀 Starting household data import...`);
  console.log(`🏠 Target Slum ID: ${slumId}`);
  console.log(`📄 Data File: ${filePath}`);
  console.log(`👤 Surveyor ID: ${surveyorId || 'Auto-select'}`);
  console.log('');
  
  seedSlumHouseholds(slumId, filePath, surveyorId).catch(console.error);
}

module.exports = seedSlumHouseholds;