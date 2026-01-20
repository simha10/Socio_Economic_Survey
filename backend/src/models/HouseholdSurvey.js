const mongoose = require('mongoose');

const householdSurveySchema = new mongoose.Schema({
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true
  },
  surveyor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // SECTION 1: General Information
  generalInformation: {
    slumName: String,
    locationWardNo: String,
    houseNo: String,
    dateOfSurvey: Date
  },

  // SECTION 2: Household Level General Information - Head of Family
  headOfFamily: {
    name: String,
    fatherName: String,
    sex: String, // Male - 01, Female - 02
    caste: String, // General - 01, SC - 02, ST - 03, OBC - 04
    religion: String, // Hindu - 01, Muslim - 02, etc.
    minorityStatus: String, // Non-minority - 01, Minority - 02
    femaleHeadStatus: String, // If female-headed: Married - 01, Widowed - 02, etc.
    maleHeadStatus: String // If male earning member is female
  },

  // SECTION 3: Family Composition
  familyComposition: {
    totalFamilyMembers: {
      male: Number,
      female: Number,
      total: Number
    },
    illiterateAdults: {
      male: Number,
      female: Number,
      total: Number
    },
    childrenNotInSchool: {
      male: Number,
      female: Number,
      total: Number
    },
    handicappedPersons: {
      physically: Number,
      mentally: Number,
      total: Number
    },
    majorEarningMemberIsFemale: String,
    femaleEarningMemberStatus: String
  },

  // SECTION 4: Poverty Status
  povertyStatus: {
    isBelowPovertyLine: String, // Yes - 01, No - 02, Don't know - 99
    hasBplCard: String, // Yes - 01, No - 02
    cardNumber: String
  },

  // SECTION 5: Housing Details
  housing: {
    landTenureStatus: String, // Patta - 01, Possession Certificate - 02, etc.
    houseStructure: String, // Pucca - 01, Semi-Pucca - 02, Katcha - 03
    roofType: String, // Grass/thatched - 01, Tarpaulin - 02, etc.
    flooringType: String, // Mud - 01, Brick - 02, Stone - 03, etc.
    lightingType: String, // Electricity - 01, Kerosene - 02, etc.
    cookingFuel: String, // Electricity - 01, Gas - 02, Firewood - 03, etc.
    numberOfRooms: Number,
    carpetArea: String,
    windowsAndVentilation: String
  },

  // SECTION 6: Water & Sanitation
  waterAndSanitation: {
    sourceOfDrinkingWater: String, // Tap - 01, Well - 02, Tanker - 03, etc.
    waterSupplyDuration: String, // 24 hours - 01, Some days - 02, etc.
    distanceToWaterSource: String, // < 100 meters - 01, 100-500 meters - 02, etc.
    toiletType: String, // Water Closet - 01, Pit Latrine - 02, Open Defecation - 03, etc.
    toiletAccessibility: String, // Within house - 01, Outside - 02
    bathroomFacility: String, // Yes - 01, No - 02
    wasteWaterDisposal: String // Open Channel - 01, Covered Drain - 02, etc.
  },

  // SECTION 7: Migration Details
  migration: {
    yearsOfStayInCity: String,
    hasMigrated: String, // Yes - 01, No - 02
    migratedFrom: String,
    migrationType: String, // Permanent - 01, Temporary - 02
    reasonForMigration: String // Employment - 01, Education - 02, etc.
  },

  // SECTION 8: Economic Activity & Earnings
  economicActivity: {
    adultEarningMembers: {
      male: Number,
      female: Number,
      total: Number
    },
    nonAdultEarningMembers: {
      male: Number,
      female: Number,
      total: Number
    },
    occupationType: String, // Regular - 01, Casual - 02, Self-employed - 03, etc.
    mainOccupation: String,
    secondaryOccupation: String
  },

  // SECTION 9: Financial Details & Assets
  financialDetails: {
    averageMonthlyIncome: Number,
    averageMonthlyExpenditure: Number,
    mainSourceOfIncome: String,
    secondarySourceOfIncome: String,
    debtOutstanding: Number,
    debtReason: String,
    hasSavings: String, // Yes - 01, No - 02
    savingsAmount: Number
  },

  // SECTION 10: Assets & Consumer Durables
  assets: {
    consumerDurables: [String], // TV, Refrigerator, Mobile, etc.
    livestock: [String], // Cow, Goat, Buffalo, etc.
    landOwnership: String,
    landArea: String,
    vehicleOwnership: String
  },

  // Survey Metadata
  surveyStatus: {
    type: String,
    enum: ['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED'],
    default: 'DRAFT'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: Date,
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: Date

}, {
  timestamps: true
});

module.exports = mongoose.model('HouseholdSurvey', householdSurveySchema);