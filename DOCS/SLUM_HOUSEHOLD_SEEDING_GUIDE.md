# 📖 Slum Household Data Seeding User Guide

##🎯 Overview

This guide explains how to use the household data seeding script to import household survey data from JavaScript files into the Socio-Economic Survey System database.

## 📋 Prerequisites

Before running the script, ensure you have:

1. **Database Connection**: MongoDB server running and accessible
2. **Existing Slum**: The target slum must already exist in the database
3. **Surveyor User**: At least one user with SURVEYOR role must exist
4. **Data File**: JavaScript file with properly formatted HH_Data array

##🚀 Quick Start

### Basic Usage

```bash
# Navigate to backend directory
cd backend

# Import data for slum ID 69
node scripts/seed-slum-households.js 69 "../APIS/Slum's_HH_Data/Slum_69.js"
```

### With Specific Surveyor

```bash
# Import data and assign to specific surveyor
node scripts/seed-slum-households.js 69 "../APIS/Slum's_HH_Data/Slum_69.js" 507f1f77bcf86cd799439011
```

## 📂 Supported Data Formats

### Required File Structure

The script expects JavaScript files with the following structure:

```javascript
const HH_Data = [
  {
    "wardNumber": 12,
    "slumId": 69,
    "parcelId": 743,
    "propertyNo": 1,
    "headName": "Lilavati",
    "fatherName": "Late Shri Bhagwand",
    "landTenureStatus": "PUBLIC_LAND_ENCROACHED",
    "houseStructure": "SEMI_PUCCA"
  },
  // ... more records
];
```

### Required Fields

Each household record must contain:
- `parcelId` (Number) - Parcel identifier
- `propertyNo` (Number) - Property number within parcel
- `headName` (String) - Household head's name

### Optional Fields

- `wardNumber` - Ward number for reference
- `slumId` - Slum identifier (for cross-validation)
- `fatherName` - Father's/Guardian's name
- `landTenureStatus` - Land tenure status
- `houseStructure` - House structure type

##🔧 Script Features

### Data Validation

The script performs comprehensive validation:
- ✅ Checks for required fields
- ✅ Validates data types (numbers, strings)
- ✅ Ensures unique parcelId/propertyNo combinations
- ✅ Verifies slum exists in database
- ✅ Checks for existing records (upsert behavior)

### Error Handling

- error reporting
-⚠️ Warning for potential issues
-📊 tracking
-🔄 retry on recoverable errors

### Import Behavior

-➕New records**: Created with DRAFT status
-🔄 **Existing records**: Updated with new data
-📝 **Source tracking**: All imported records marked as "IMPORTED"
-👤Surveyor assignment**: Can specify or auto-select surveyor

##📊 Workflow

### 1. Verify Prerequisites

```bash
# Check existing slums
node scripts/check-slums.js

# Check existing users
node scripts/seed-users.js
```

### 2. Prepare Data File

Ensure your JavaScript file follows the correct format:

```javascript
const HH_Data = [
  {
    "wardNumber": 12,
    "slumId": 69,
    "parcelId": 421,
    "propertyNo": 1,
    "headName": "Savitri",
    "fatherName": "Nand Kishore",
    "landTenureStatus": "PUBLIC_LAND_ENCROACHED",
    "houseStructure": "SEMI_PUCCA"
  }
  // Add more records as needed
];
```

### 3. Run Import Script

```bash
# Basic import
node scripts/seed-slum-households.js 69 "../APIS/Slum's_HH_Data/Slum_69.js"

# With specific surveyor
node scripts/seed-slum-households.js 69 "../APIS/Slum's_HH_Data/Slum_69.js" [SURVEYOR_ID]
```

### 4. Verify Results

The script provides detailed output including:
- Validation results
- Import statistics
- Sample records
- Success/failure counts

## 📈 Output Explanation

### Success Output

```
✅ Connected to MongoDB
🏠 Found slum: Slum Name (ID: 69)
📄 Reading data from: ../APIS/Slum's_HH_Data/Slum_69.js
📊 Parsed 100 records from file
🔍 Validating data structure...
📋 VALIDATION RESULTS:
✅ Valid records: 95
❌ Invalid records: 5

🚀 Importing 95 records...
🎉 IMPORT COMPLETED IN 2.34 SECONDS
📊 Results:
  ✅ Successfully processed: 95 records
  ➕ records created: 85
 🔄 Existing records updated: 10
 ❌ Failed operations: 0

📊 Verification Results:
  households in slum: 150
  📥 households: 85
 📈 success rate: 89.5%
```

### Error Output

```
❌ Slum with ID 69 not found in database.
💡 Please ensure the slum exists. You can check existing slums with:
   node scripts/check-slums.js
```

##🛠️ Troubleshooting

### Common Issues

#### 1. "Slum not found"
**Problem**: Target slum doesn't exist in database
**Solution**: 
```bash
# Check existing slums
node scripts/check-slums.js

# Create slum if needed
node scripts/seed-slums.js
```

#### 2. "No surveyors found"
**Problem**: No users with SURVEYOR role exist
**Solution**:
```bash
# Create surveyor user
node scripts/seed-users.js
```

#### 3. "File not found"
**Problem**: Incorrect file path
**Solution**: 
- Use absolute path or correct relative path
- Ensure file exists and is accessible

#### 4. "Invalid data format"
**Problem**: HH_Data array not properly formatted
**Solution**:
- Check file structure matches required format
- Ensure proper JSON syntax
- Validate all required fields are present

#### 5. "Data validation errors"
**Problem**: Missing required fields or invalid data types
**Solution**:
- Review validation error messages
- Fix data issues in source file
- Re-run import after corrections

### Data Validation Issues

#### Missing Required Fields
```javascript
//❌ Invalid - missing parcelId
{
  "propertyNo": 1,
  "headName": "John Doe"
}

//✅ Valid
{
  "parcelId": 421,
  "propertyNo": 1,
  "headName": "John Doe"
}
```

#### Invalid Data Types
```javascript
// ❌ Invalid - string instead of number
{
  "parcelId": "421",  // Should be number
  "propertyNo": "1"   // Should be number
}

//✅ Valid
{
  "parcelId": 421,
  "propertyNo": 1
}
```

##🔍 Advanced Usage

### Batch Processing Multiple Slums

Create a batch script to process multiple slum files:

```bash
#!/bin/bash
# batch-import.sh

slums=(
  "69:../APIS/Slum's_HH_Data/Slum_69.js"
  "70:../APIS/Slum's_HH_Data/Slum_70.js"
  "71:../APIS/Slum's_HH_Data/Slum_71.js"
)

for slum_file in "${slums[@]}"; do
  IFS=':' read -r slum_id file_path <<< "$slum_file"
  echo "Processing slum $slum_id from $file_path"
  node scripts/seed-slum-households.js "$slum_id" "$file_path"
  echo "Completed slum $slum_id"
  echo "------------------------"
done
```

### Custom Surveyor Assignment

```bash
# Get surveyor IDs
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User');
  const surveyors = await User.find({ role: 'SURVEYOR' });
  surveyors.forEach(s => console.log(`${s._id}: ${s.name} (${s.username})`));
  process.exit(0);
});
" 

# Use specific surveyor ID
node scripts/seed-slum-households.js 69 "../APIS/Slum's_HH_Data/Slum_69.js" 507f1f77bcf86cd799439011
```

## 📊 Data Verification

### Check Import Results

```bash
# Count total households in a slum
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const HouseholdSurvey = require('./src/models/HouseholdSurvey');
  const Slum = require('./src/models/Slum');
  
  const slum = await Slum.findOne({ slumId: 69 });
  const count = await HouseholdSurvey.countDocuments({ slum: slum._id });
  const imported = await HouseholdSurvey.countDocuments({ slum: slum._id, source: 'IMPORTED' });
  
  console.log(`Total households: ${count}`);
  console.log(`Imported households: ${imported}`);
  process.exit(0);
});
"
```

### View Sample Records

```bash
# View first 5 imported records
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const HouseholdSurvey = require('./src/models/HouseholdSurvey');
  const records = await HouseholdSurvey.find({ source: 'IMPORTED' }).limit(5);
  records.forEach((record, i) => {
    console.log(`${i+1}. Parcel: ${record.parcelId}, Property: ${record.propertyNo}`);
    console.log(`   Head: ${record.headName}, Status: ${record.surveyStatus}`);
  });
  process.exit(0);
});
"
```

##⚠ Important Notes

### Data Integrity
- **Unique Constraints**: Each parcelId/propertyNo combination must be unique within a slum
- **Status Management**: Imported records start with DRAFT status
- **Source Tracking**: All imported records are marked with source: 'IMPORTED'

### Performance Considerations
- **Large Datasets**: Script uses bulk operations for efficiency
- **Memory Usage**: Processes data in batches to minimize memory footprint
- **Database Indexes**: Ensure proper indexes exist for optimal performance

### Security
- **Authentication**: Script requires valid database connection
- **Authorization**: Only users with appropriate database access can run script
- **Data Validation**: Comprehensive input validation prevents data corruption

##🆘 Support

### Getting Help

If you encounter issues:
1. Check the error messages carefully
2. Verify all prerequisites are met
3. Review the troubleshooting section above
4. Test with a small sample dataset first
5. Contact system administrator for persistent issues

### Reporting Issues

When reporting problems, include:
- Complete error message
- Command used
- Sample of data file
- System environment details
- Steps to reproduce

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Compatible With**: Socio-Economic Survey System v1.1.0