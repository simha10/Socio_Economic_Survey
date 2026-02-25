const fs = require('fs');
const path = require('path');

/**
 * Test script to validate HH_Data parsing from JavaScript files
 * This helps verify the data format before running the main import script
 */

function testDataParsing(filePath) {
  try {
    console.log(`🔍 Testing data parsing for: ${filePath}`);
    console.log('=====================================\n');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }
    
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ File loaded successfully (${fileContent.length} characters)`);
    
    // Extract HH_Data array
    const arrayMatch = fileContent.match(/const\s+HH_Data\s*=\s*(\[[\s\S]*?\]);?/);
    
    if (!arrayMatch || !arrayMatch[1]) {
      console.error('❌ Could not find HH_Data array in file');
      console.log('💡 Expected format: const HH_Data = [ ... ];');
      return false;
    }
    
    console.log('✅ HH_Data array found');
    
    // Parse the array
    let arrayStr = arrayMatch[1];
    arrayStr = arrayStr
      .replace(/,\s*]/g, ']') // Remove trailing commas
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .trim();
    
    let HH_Data;
    try {
      HH_Data = JSON.parse(arrayStr);
      console.log(`✅ Successfully parsed ${HH_Data.length} records`);
    } catch (parseError) {
      console.error('❌ Error parsing HH_Data array:', parseError.message);
      console.log('Array content preview:');
      console.log(arrayStr.substring(0, 200) + '...');
      return false;
    }
    
    // Validate data structure
    console.log('\n📋 Data Structure Validation:');
    console.log('=============================');
    
    const requiredFields = ['parcelId', 'propertyNo', 'headName'];
    const optionalFields = ['wardNumber', 'slumId', 'fatherName', 'landTenureStatus', 'houseStructure'];
    
    let validRecords = 0;
    let invalidRecords = 0;
    const fieldStats = {};
    const issues = [];
    
    // Initialize field statistics
    [...requiredFields, ...optionalFields].forEach(field => {
      fieldStats[field] = { present: 0, missing: 0, empty: 0 };
    });
    
    // Validate each record
    HH_Data.forEach((record, index) => {
      const recordNum = index + 1;
      let recordValid = true;
      
      // Check required fields
      requiredFields.forEach(field => {
        if (record[field] === undefined || record[field] === null) {
          fieldStats[field].missing++;
          issues.push(`Record ${recordNum}: Missing ${field}`);
          recordValid = false;
        } else {
          fieldStats[field].present++;
          if (record[field] === '') {
            fieldStats[field].empty++;
            issues.push(`Record ${recordNum}: Empty ${field}`);
          }
        }
      });
      
      // Check optional fields
      optionalFields.forEach(field => {
        if (record[field] !== undefined && record[field] !== null) {
          fieldStats[field].present++;
          if (record[field] === '') {
            fieldStats[field].empty++;
          }
        } else {
          fieldStats[field].missing++;
        }
      });
      
      // Validate data types
      if (record.parcelId !== undefined) {
        const parcelId = parseInt(record.parcelId);
        if (isNaN(parcelId)) {
          issues.push(`Record ${recordNum}: Invalid parcelId (not a number)`);
          recordValid = false;
        }
      }
      
      if (record.propertyNo !== undefined) {
        const propertyNo = parseInt(record.propertyNo);
        if (isNaN(propertyNo)) {
          issues.push(`Record ${recordNum}: Invalid propertyNo (not a number)`);
          recordValid = false;
        }
      }
      
      if (recordValid) {
        validRecords++;
      } else {
        invalidRecords++;
      }
    });
    
    // Display results
    console.log(`\n📊 VALIDATION RESULTS:`);
    console.log(`✅ Valid records: ${validRecords}`);
    console.log(`❌ Invalid records: ${invalidRecords}`);
    console.log(`📈 Success rate: ${((validRecords / HH_Data.length) * 100).toFixed(1)}%`);
    
    console.log(`\n📋 Field Presence Statistics:`);
    console.log('==============================');
    [...requiredFields, ...optionalFields].forEach(field => {
      const stats = fieldStats[field];
      const presenceRate = ((stats.present / HH_Data.length) * 100).toFixed(1);
      console.log(`${field.padEnd(20)}: ${stats.present.toString().padEnd(4)} present (${presenceRate}%)`);
      if (stats.empty > 0) {
        console.log(`  ${''.padEnd(20)}  ${stats.empty.toString().padEnd(4)} empty`);
      }
    });
    
    // Show sample records
    console.log(`\n📋 Sample Records (first 3):`);
    console.log('===========================');
    HH_Data.slice(0, 3).forEach((record, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  Parcel ID: ${record.parcelId}`);
      console.log(`  Property No: ${record.propertyNo}`);
      console.log(`  Head Name: ${record.headName}`);
      console.log(`  Father Name: ${record.fatherName || 'N/A'}`);
      console.log(`  Land Tenure: ${record.landTenureStatus || 'N/A'}`);
      console.log(`  House Structure: ${record.houseStructure || 'N/A'}`);
      console.log('');
    });
    
    // Show unique values for key fields
    console.log(`📊 Data Diversity Analysis:`);
    console.log('==========================');
    
    const uniqueParcels = new Set(HH_Data.map(r => r.parcelId));
    const uniquePropertyNos = new Set(HH_Data.map(r => r.propertyNo));
    const uniqueHouseStructures = new Set(HH_Data.map(r => r.houseStructure).filter(Boolean));
    const uniqueLandTenure = new Set(HH_Data.map(r => r.landTenureStatus).filter(Boolean));
    
    console.log(`Unique Parcel IDs: ${uniqueParcels.size}`);
    console.log(`Unique Property Numbers: ${uniquePropertyNos.size}`);
    console.log(`House Structure Types: ${uniqueHouseStructures.size}`);
    console.log(`Land Tenure Status Types: ${uniqueLandTenure.size}`);
    
    if (uniqueHouseStructures.size > 0) {
      console.log(`House Structures: ${Array.from(uniqueHouseStructures).join(', ')}`);
    }
    
    if (uniqueLandTenure.size > 0) {
      console.log(`Land Tenure Status: ${Array.from(uniqueLandTenure).join(', ')}`);
    }
    
    // Show issues if any
    if (issues.length > 0) {
      console.log(`\n🔧 Issues Found (${issues.length} total):`);
      console.log('====================');
      issues.slice(0, 15).forEach(issue => console.log(`❌ ${issue}`));
      if (issues.length > 15) {
        console.log(`... and ${issues.length - 15} more issues`);
      }
    }
    
    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    console.log('==================');
    if (validRecords === HH_Data.length) {
      console.log('✅ All records are valid - ready for import!');
      console.log('📋 Next step: Run the seeding script:');
      console.log(`   node scripts/seed-slum-households.js 69 "${filePath}"`);
    } else {
      console.log('⚠️  Data issues found. Please fix before importing:');
      if (fieldStats.parcelId.missing > 0) {
        console.log('   - Add missing parcelId values');
      }
      if (fieldStats.propertyNo.missing > 0) {
        console.log('   - Add missing propertyNo values');
      }
      if (fieldStats.headName.missing > 0) {
        console.log('   - Add missing headName values');
      }
      if (fieldStats.parcelId.empty > 0 || fieldStats.propertyNo.empty > 0) {
        console.log('   - Remove empty parcelId/propertyNo values');
      }
    }
    
    return validRecords === HH_Data.length;
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    return false;
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📋 HH_DATA FILE VALIDATION TOOL
===============================

This tool validates JavaScript files containing HH_Data arrays before importing.

📋 USAGE:
  node scripts/test-data-parsing.js <filePath>

📌 EXAMPLE:
  node scripts/test-data-parsing.js "../APIS/Slum's_HH_Data/Slum_69.js"

📝 This tool will:
  - Check if the file exists
  - Parse the HH_Data array
  - Validate required fields
  - Report data statistics
  - Identify potential issues
  - Provide import recommendations
    `);
    process.exit(1);
  }
  
  const filePath = path.resolve(args[0]);
  
  console.log(`🔍 Testing file: ${filePath}\n`);
  
  const isValid = testDataParsing(filePath);
  
  if (isValid) {
    console.log('\n✅ File validation PASSED - Ready for import');
    process.exit(0);
  } else {
    console.log('\n❌ File validation FAILED - Issues found');
    process.exit(1);
  }
}

module.exports = testDataParsing;