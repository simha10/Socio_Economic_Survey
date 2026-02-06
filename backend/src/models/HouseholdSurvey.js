const mongoose = require('mongoose');

// Define enums for all select fields
const SEX_ENUM = ['MALE', 'FEMALE'];
const CASTE_ENUM = ['GENERAL', 'SC', 'ST', 'OBC'];
const RELIGION_ENUM = ['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'JAINISM', 'BUDDHISM', 'ZOROASTRIANISM', 'OTHERS'];
const MINORITY_STATUS_ENUM = ['NON_MINORITY', 'MINORITY'];
const FEMALE_HEAD_STATUS_ENUM = ['MARRIED', 'WIDOWED', 'ABANDONED_SINGLE', 'DIVORCED', 'UNWED_MOTHER', 'OTHER'];
const BELOW_POVERTY_LINE_ENUM = ['YES', 'NO', 'DONT_KNOW'];
const BPL_CARD_ENUM = ['YES', 'NO'];
const LAND_TENURE_STATUS_ENUM = ['PATTA', 'POSSESSION_CERTIFICATE', 'PRIVATE_LAND_ENCROACHED', 'PUBLIC_LAND_ENCROACHED', 'TENTED', 'OTHER'];
const HOUSE_STRUCTURE_ENUM = ['PUCCA', 'SEMI_PUCCA', 'KATCHA'];
const ROOF_TYPE_ENUM = ['GRASS_THATCHED', 'TARPAULIN', 'WOODEN', 'ASBESTOS', 'TILED', 'CEMENT_SLAB', 'OTHER'];
const FLOORING_TYPE_ENUM = ['MUD', 'BRICK', 'STONE', 'CEMENT', 'TILES', 'OTHER'];
const HOUSE_LIGHTING_ENUM = ['ELECTRICITY', 'KEROSENE', 'FIREWOOD', 'OTHER'];
const COOKING_FUEL_ENUM = ['GAS', 'ELECTRICITY', 'KEROSENE', 'CHARCOAL', 'FIREWOOD', 'OTHER'];
const WATER_SOURCE_ENUM = [
  'WITHIN_PREMISES_TAP',
  'WITHIN_PREMISES_TUBEWELL',
  'WITHIN_PREMISES_OPENWELL',
  'OUTSIDE_PREMISES_PUBLIC_TAP',
  'OUTSIDE_PREMISES_TUBE_BORE_WELL',
  'OUTSIDE_PREMISES_OPENWELL',
  'OUTSIDE_PREMISES_TANK_POND',
  'OUTSIDE_PREMISES_RIVER',
  'WATER_TANKER',
  'OTHER'
];
const WATER_SUPPLY_DURATION_ENUM = [
  'LESS_THAN_1_HOUR',
  'ONE_TWO_HOURS',
  'MORE_THAN_2_HOURS',
  'ONCE_WEEK',
  'TWICE_WEEK',
  'NOT_REGULAR',
  'NO_SUPPLY'
];
const WATER_SOURCE_DISTANCE_ENUM = [
  'LESS_THAN_HALF_KM',
  'HALF_TO_ONE_KM',
  'ONE_TO_TWO_KM',
  'TWO_TO_FIVE_KM',
  'MORE_THAN_FIVE_KM'
];
const TOILET_FACILITY_ENUM = [
  'OWN_SEPTIC_FLUSH',
  'OWN_DRY_LATRINE',
  'SHARED_SEPTIC_FLUSH',
  'SHARED_DRY_LATRINE',
  'COMMUNITY_SEPTIC_FLUSH',
  'COMMUNITY_DRY_LATRINE',
  'OPEN_DEFECATION'
];
const BATHROOM_FACILITY_ENUM = [
  'WITHIN_PREMISES',
  'OUTSIDE_PREMISES',
  'COMMUNITY_BATH',
  'NO_BATHROOM'
];
const ROAD_FRONT_TYPE_ENUM = [
  'MOTORABLE_PUCCA',
  'MOTORABLE_KATCHA',
  'NON_MOTORABLE_PUCCA',
  'NON_MOTORABLE_KATCHA'
];
const SCHOOL_TYPE_ENUM = ['MUNICIPAL', 'GOVERNMENT', 'PRIVATE'];
const HEALTH_FACILITY_TYPE_ENUM = [
  'PRIMARY_HEALTH_CENTRE',
  'GOVT_HOSPITAL',
  'MATERNITY_CENTRE',
  'PRIVATE_CLINIC',
  'RMP',
  'AYURVEDIC'
];
const WELFARE_BENEFITS_ENUM = [
  'OLD_AGE_PENSION',
  'WIDOW_PENSION',
  'DISABLED_PENSION',
  'HEALTH_INSURANCE',
  'GENERAL_INSURANCE',
  'OTHER'
];
const CONSUMER_DURABLES_ENUM = [
  'ELECTRIC_FAN',
  'REFRIGERATOR',
  'COOLER',
  'RESIDENTIAL_PHONE',
  'MOBILE_PHONE',
  'BW_TELEVISION',
  'COLOR_TELEVISION',
  'SEWING_MACHINE',
  'FURNITURE',
  'BICYCLE',
  'RICKSHAW',
  'PUSH_CART',
  'BULLOCK_CART',
  'TWO_WHEELER',
  'THREE_WHEELER',
  'TAXI',
  'CAR'
];
const LIVESTOCK_ENUM = [
  'BUFFALO',
  'COW',
  'SHEEP_GOAT',
  'PIG',
  'HEN_COCK',
  'DONKEY'
];
const YEARS_IN_TOWN_ENUM = [
  'ZERO_TO_ONE_YEAR',
  'ONE_TO_THREE_YEARS',
  'THREE_TO_FIVE_YEARS',
  'MORE_THAN_FIVE_YEARS'
];
const MIGRATED_ENUM = ['YES', 'NO'];
const MIGRATED_FROM_ENUM = ['RURAL_TO_URBAN', 'URBAN_TO_URBAN'];
const MIGRATION_TYPE_ENUM = ['SEASONAL', 'PERMANENT'];
const MIGRATION_REASONS_ENUM = [
  'UNEMPLOYMENT',
  'LOW_WAGE',
  'DEBT',
  'DROUGHT',
  'CONFLICT',
  'EDUCATION',
  'MARRIAGE',
  'OTHERS'
];

const householdSurveySchema = new mongoose.Schema({
  // Core References
  slum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slum',
    required: true
  },
  householdId: {
    type: String,
    required: true,
    unique: true
  },
  houseDoorNo: {
    type: String,
    required: true
  },
  surveyor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // SECTION I: General Information
  slumName: String,
  locationWard: String,

  // SECTION II: Household Level General Information
  headName: String,
  fatherName: String,
  sex: {
    type: String,
    enum: SEX_ENUM
  },
  caste: {
    type: String,
    enum: CASTE_ENUM
  },
  religion: {
    type: String,
    enum: RELIGION_ENUM
  },
  minorityStatus: {
    type: String,
    enum: MINORITY_STATUS_ENUM
  },
  femaleHeadStatus: {
    type: String,
    enum: FEMALE_HEAD_STATUS_ENUM
  },

  // Family Members Count
  familyMembersMale: Number,
  familyMembersFemale: Number,
  familyMembersTotal: Number,

  // Illiterate Adult Members
  illiterateAdultMale: Number,
  illiterateAdultFemale: Number,
  illiterateAdultTotal: Number,

  // Children Not Attending School (6-14 years)
  childrenNotAttendingMale: Number,
  childrenNotAttendingFemale: Number,
  childrenNotAttendingTotal: Number,

  // Handicapped Persons
  handicappedPhysically: Number,
  handicappedMentally: Number,
  handicappedTotal: Number,

  // Economic Status
  femaleEarningStatus: {
    type: String,
    enum: FEMALE_HEAD_STATUS_ENUM
  },
  belowPovertyLine: {
    type: String,
    enum: BELOW_POVERTY_LINE_ENUM
  },
  bplCard: {
    type: String,
    enum: BPL_CARD_ENUM
  },

  // SECTION III: Housing & Infrastructure
  landTenureStatus: {
    type: String,
    enum: LAND_TENURE_STATUS_ENUM
  },
  houseStructure: {
    type: String,
    enum: HOUSE_STRUCTURE_ENUM
  },
  roofType: {
    type: String,
    enum: ROOF_TYPE_ENUM
  },
  flooringType: {
    type: String,
    enum: FLOORING_TYPE_ENUM
  },
  houseLighting: {
    type: String,
    enum: HOUSE_LIGHTING_ENUM
  },
  cookingFuel: {
    type: String,
    enum: COOKING_FUEL_ENUM
  },

  // Water & Sanitation
  waterSource: {
    type: String,
    enum: WATER_SOURCE_ENUM
  },
  waterSupplyDuration: {
    type: String,
    enum: WATER_SUPPLY_DURATION_ENUM
  },
  waterSourceDistance: {
    type: String,
    enum: WATER_SOURCE_DISTANCE_ENUM
  },
  toiletFacility: {
    type: String,
    enum: TOILET_FACILITY_ENUM
  },
  bathroomFacility: {
    type: String,
    enum: BATHROOM_FACILITY_ENUM
  },
  roadFrontType: {
    type: String,
    enum: ROAD_FRONT_TYPE_ENUM
  },

  // SECTION IV: Education & Health Facilities
  preschoolType: {
    type: String,
    enum: SCHOOL_TYPE_ENUM
  },
  primarySchoolType: {
    type: String,
    enum: SCHOOL_TYPE_ENUM
  },
  highSchoolType: {
    type: String,
    enum: SCHOOL_TYPE_ENUM
  },
  healthFacilityType: {
    type: String,
    enum: HEALTH_FACILITY_TYPE_ENUM
  },
  welfareBenefits: [{
    type: String,
    enum: WELFARE_BENEFITS_ENUM
  }],
  consumerDurables: [{
    type: String,
    enum: CONSUMER_DURABLES_ENUM
  }],
  livestock: [{
    type: String,
    enum: LIVESTOCK_ENUM
  }],

  // SECTION V: Migration Details
  yearsInTown: {
    type: String,
    enum: YEARS_IN_TOWN_ENUM
  },
  migrated: {
    type: String,
    enum: MIGRATED_ENUM
  },
  migratedFrom: {
    type: String,
    enum: { values: [...MIGRATED_FROM_ENUM, ''], message: '{VALUE} is not a valid migration source' }
  },
  migrationType: {
    type: String,
    enum: { values: [...MIGRATION_TYPE_ENUM, ''], message: '{VALUE} is not a valid migration type' }
  },
  migrationReasons: [{
    type: String,
    enum: MIGRATION_REASONS_ENUM
  }],

  // SECTION VI: Income & Expenditure
  earningAdultMale: Number,
  earningAdultFemale: Number,
  earningAdultTotal: Number,
  earningNonAdultMale: Number,
  earningNonAdultFemale: Number,
  earningNonAdultTotal: Number,
  monthlyIncome: Number,
  monthlyExpenditure: Number,
  debtOutstanding: Number,

  // Additional Information
  notes: String,

  // Survey Status
  surveyStatus: {
    type: String,
    enum: ['DRAFT', 'IN PROGRESS', 'SUBMITTED', 'COMPLETED'],
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

// Compound indexes for uniqueness
householdSurveySchema.index({ slum: 1, householdId: 1 }, { unique: true });
householdSurveySchema.index({ slum: 1, houseDoorNo: 1 }, { unique: true });

module.exports = mongoose.model('HouseholdSurvey', householdSurveySchema);