# 📦 Household Data Seeding Scripts

This directory contains scripts for importing household survey data from JavaScript files into the Socio-Economic Survey System database.

## 📋 Available Scripts

### 1. `seed-slum-households.js` - Main Import Script
**Purpose**: Import household data from JavaScript files into the database
**Usage**: 
```bash
node scripts/seed-slum-households.js <slumId> <filePath> [surveyorId]
```
**Features**:
- Comprehensive data validation
- Bulk import with upsert capability
- Detailed progress reporting
- Error handling and recovery
- Automatic surveyor assignment

### 2. `test-data-parsing.js` - Data Validation Tool
**Purpose**: Validate JavaScript files before importing
**Usage**: 
```bash
node scripts/test-data-parsing.js <filePath>
```
**Features**:
- File format validation
- Data structure analysis
- Field presence statistics
- Issue detection and reporting
- Import readiness assessment

##🚀 Quick Start

### 1. Validate Your Data File
```bash
node scripts/test-data-parsing.js "../APIS/Slum's_HH_Data/Slum_69.js"
```

### 2. Import the Data
```bash
node scripts/seed-slum-households.js 69 "../APIS/Slum's_HH_Data/Slum_69.js"
```

## 📖 Documentation

For detailed usage instructions, see:
- **User Guide**: [`DOCS/SLUM_HOUSEHOLD_SEEDING_GUIDE.md`](../DOCS/SLUM_HOUSEHOLD_SEEDING_GUIDE.md)
- **API Reference**: [`DOCS/API_ENDPOINTS.md`](../DOCS/API_ENDPOINTS.md)

## Requirements

- Node.js v18+
- MongoDB connection
- Existing slum in database
- Surveyor user account
- Properly formatted HH_Data array

## 📝 Data Format

Files must contain a `HH_Data` array with objects having:
- **Required**: `parcelId`, `propertyNo`, `headName`
- **Optional**: `wardNumber`, `slumId`, `fatherName`, `landTenureStatus`, `houseStructure`

Example:
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
];
```

## 📊 Import Features

- **Validation**: Comprehensive data validation before import
- **Upsert**: Updates existing records, creates new ones
- **Tracking**: All imported records marked with `source: 'IMPORTED'`
- **Status**: Imported records start with `DRAFT` status
- **Assignment**: Automatic or specified surveyor assignment
- **Reporting**: Detailed success/failure statistics

##⚠ Importantant Notes

- Always validate data files before importing
- Existing records with same parcelId/propertyNo will be updated
- Imported records are marked as DRAFT status
- Surveyor assignment can be automatic or specified
- Large imports use bulk operations for efficiency

##bleshooting

Common issues and solutions are documented in the user guide.

---

**Last Updated**: February 2026  
**Version**: 1.0.0