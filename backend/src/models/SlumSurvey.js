const mongoose = require('mongoose');

const slumSurveySchema = new mongoose.Schema({
  slum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slum',
    required: true
  },
  surveyor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // SECTION 1: Basic Information on Slum
  basicInformation: {
    slumName: String,
    slumCode: String,
    locationWardNo: String,
    ageOfSlumYears: Number,
    areaOfSlumSqMeters: String,
    locatedInCoreCityOrFringe: String, // Core City - 01, Fringe Area - 02
    typeOfAreaSurrounding: String, // Residential - 01, Industrial - 02, etc.
    physicalLocationOfSlum: String, // Along Nallah - 01, Along Other Drains - 02, etc.
    isSlumNotified: String, // Yes - 01, No - 02
    yearOfNotificationIfYes: String
  },

  // SECTION 2: Land Status
  landStatus: {
    ownershipOfLand: String, // Local Body - 01, State Government - 02, etc.
    specifyOwnership: String
  },

  // SECTION 3: Population & Health Demographics (by caste categories)
  populationAndHealth: {
    totalPopulation: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    bplPopulation: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    numberOfHouseholds: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    numberOfBplHouseholds: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    womenHeadedHouseholds: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    personsOlderThan65Years: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    childLabourers: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    physicallyChallengedPersons: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    mentallyChallengedPersons: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    personsWithHivAids: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    personsWithTuberculosis: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    personsWithRespiratoryDiseases: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    personsWithOtherChronicDiseases: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    }
  },

  // SECTION 4: Literacy & Education (by caste categories)
  literacyAndEducation: {
    totalIlliteratePerson: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    maleIlliterate: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    femaleIlliterate: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    bplIlliteratePerson: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    maleBplIlliterate: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    femaleBplIlliterate: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    schoolDropoutsMale: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    },
    schoolDropoutsFemale: {
      SC: Number,
      ST: Number,
      OBC: Number,
      Others: Number,
      Total: Number,
      Minorities: Number
    }
  },

  // SECTION 5: Employment & Occupation
  employmentAndOccupation: {
    mainOccupation: String,
    secondaryOccupation: String,
    percentageEmployment: Number,
    unemploymentRate: Number,
    majorIndustriesPresent: [String]
  },

  // SECTION 6: Water & Sanitation
  waterAndSanitation: {
    sourceOfDrinkingWater: String, // Tap - 01, Well - 02, etc.
    waterSupplyDuration: String,
    distanceToWaterSource: String,
    typeOfToilet: String, // Water Closet - 01, Pit Latrine - 02, etc.
    toiletAccessibility: String,
    bathingFacility: String,
    wastewaterDisposal: String,
    drainageSystem: String
  },

  // SECTION 7: Housing Conditions
  housingConditions: {
    typeOfStructure: String, // Permanent - 01, Semi-permanent - 02, etc.
    roofType: String, // Reinforced Concrete - 01, Tile - 02, etc.
    wallType: String, // Brick - 01, Stone - 02, etc.
    floorType: String, // Concrete - 01, Tile - 02, etc.
    averageHouseSize: String,
    overcrowding: String,
    damageAssessment: String
  },

  // SECTION 8: Utilities & Basic Services
  utilities: {
    electricityConnection: String, // Yes - 01, No - 02
    electricityType: String, // Permanent - 01, Temporary - 02
    gasConnection: String,
    wasteManagement: String,
    publicToilets: Number,
    publicBaths: Number,
    streetLights: String
  },

  // SECTION 9: Social Infrastructure
  socialInfrastructure: {
    schools: {
      primarySchools: Number,
      middleSchools: Number,
      secondarySchools: Number,
      anganwadiCenters: Number
    },
    healthFacilities: {
      healthCenters: Number,
      hospitals: Number,
      primaryHealthCenters: Number,
      subcenters: Number
    },
    communityHalls: Number,
    playgrounds: Number,
    communityCenter: String
  },

  // SECTION 10: Transportation & Accessibility
  transportationAndAccessibility: {
    roadCondition: String, // Paved - 01, Unpaved - 02, etc.
    publictransitAccess: String,
    roadWidth: String,
    mainTransportMode: [String],
    accessibilityForDisabled: String
  },

  // SECTION 11: Environmental Conditions
  environmentalConditions: {
    airQuality: String,
    waterPollution: String,
    soilContamination: String,
    noiseLevel: String,
    hazardousWaste: String,
    floodzoneProximity: String
  },

  // SECTION 12: Social Issues & Vulnerable Groups
  socialIssuesAndVulnerableGroups: {
    childLabourPresence: String,
    childMarriagePresence: String,
    humanTraffickingPresence: String,
    domesticViolenceReports: String,
    communityOrganizations: Number,
    NGOsOperating: Number,
    majorChallenges: [String]
  },

  // SECTION 13: Slum Improvement & Development Plans
  slumImprovementAndDevelopment: {
    slumRehabilitationScheme: String,
    housingSchemeAvailable: String,
    existingDevelopmentProjects: [String],
    plannedImprovements: [String],
    communicationWithGovernment: String,
    communityParticipation: String
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

module.exports = mongoose.model('SlumSurvey', slumSurveySchema);