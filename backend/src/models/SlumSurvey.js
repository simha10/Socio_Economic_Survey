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

  // SECTION 1: GENERAL INFORMATION -CITY/TOWN
  generalInformation: {
    stateCode: String,
    stateName: String,
    districtCode: String,
    districtName: String,
    cityTownCode: String,
    cityTownName: String,
    cityTown: String,
    cityTownNoHouseholds: Number
  },

  // SECTION 2: CITY/TOWN SLUM PROFILE
  cityTownSlumProfile: {
    slumType: String,
    slumIdField: String,
    slumName: String,
    ownershipLand: String,
    areaSqMtrs: Number,
    slumPopulation: Number,
    noSlumHouseholds: Number,
    bplPopulation: Number,
    noBplHouseholdsCityTown: Number
  },

  // SECTION 3: PARTICULARS OF SURVEY OPERATION
  surveyOperation: {
    surveyorName: String,
    surveyDate: String,
    receiptQuestionnaireDate: String,
    scrutinyDate: String,
    receiptByNodalCellDate: String,
    remarksInvestigator: String,
    commentsSupervisor: String
  },

  // SECTION 4: BASIC INFORMATION ON SLUM
  basicInformation: {
    slumNameBasicInfo: String,
    slumCode: String,
    locationWard: String,
    ageSlumYears: Number,
    areaSlumSqMtrs: Number,
    locationCoreOrFringe: String,
    typeAreaSurrounding: String,
    physicalLocationSlum: String,
    isSlumNotified: String,
    yearOfNotification: Number
  },

  // SECTION 5: LAND STATUS
  landStatus: {
    ownershipLandDetail: String,
    ownershipLandSpecify: String
  },

  // SECTION 6: DEMOGRAPHIC PROFILE
  demographicProfile: {
    // Population & Health Demographics
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
    },
    
    // Literacy & Education
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

  // SECTION 7: HOUSING STATUS
  housingStatus: {
    dwellingUnitsPucca: Number,
    dwellingUnitsSemiPucca: Number,
    dwellingUnitsKatcha: Number,
    dwellingUnitsTotal: Number,
    dwellingUnitsWithElectricityPucca: Number,
    dwellingUnitsWithElectricitySemiPucca: Number,
    dwellingUnitsWithElectricityKatcha: Number,
    dwellingUnitsWithElectricityTotal: Number,
    landTenureWithPatta: Number,
    landTenurePossessionCertificate: Number,
    landTenureEncroachedPrivate: Number,
    landTenureEncroachedPublic: Number,
    landTenureOnRent: Number,
    landTenureOther: Number,
    landTenureTotal: Number
  },

  // SECTION 8: ECONOMIC STATUS OF HOUSEHOLDS
  economicStatus: {
    economicStatusData: {
      lessThan500: Number,
      rs500to1000: Number,
      rs1000to1500: Number,
      rs1500to2000: Number,
      rs2000to3000: Number,
      moreThan3000: Number
    }
  },

  // SECTION 9: EMPLOYMENT AND OCCUPATION STATUS
  employmentAndOccupation: {
    majorIndustriesPresent: [String]
  },

  // SECTION 10: ACCESS TO PHYSICAL INFRASTRUCTURE
  physicalInfrastructure: {
    sourceDrinkingWater: {
      individualTap: Number,
      tubewellBorewellHandpump: Number,
      publicTap: Number,
      openwell: Number,
      tankPond: Number,
      riverCanalLakeSpring: Number,
      waterTanker: Number,
      others: Number
    },
    connectivityCityWaterSupply: String,
    drainageSewerageFacility: String,
    connectivityStormWaterDrainage: String,
    connectivitySewerageSystem: String,
    proneToFlooding: String,
    latrineFacility: String,
    solidWasteManagement: {
      frequencyOfGarbageDisposal: String,
      arrangementForGarbageDisposal: String,
      frequencyOfClearanceOfOpenDrains: String
    },
    approachRoadType: String,
    distanceToNearestMotorableRoad: String,
    internalRoadType: String,
    streetLightAvailable: String
  },

  // SECTION 11: EDUCATION FACILITIES
  educationFacilities: {
    anganwadiUnderIcds: Number,
    municipalPreschool: Number,
    privatePreschool: Number,
    municipalPrimarySchool: Number,
    stateGovtPrimarySchool: Number,
    privatePrimarySchool: Number,
    municipalHighSchool: Number,
    stateGovtHighSchool: Number,
    privateHighSchool: Number,
    adultEducationCentre: Number,
    nonFormalEducationCentre: Number
  },

  // SECTION 12: HEALTH FACILITIES
  healthFacilities: {
    urbanHealthPost: String,
    primaryHealthCentre: String,
    governmentHospital: String,
    maternityCentre: String,
    privateClinic: String,
    rmp: String,
    ayurvedicDoctor: String
  },

  // SECTION 13: SOCIAL DEVELOPMENT/WELFARE
  socialDevelopment: {
    communityHall: Number,
    livelihoodProductionCentre: Number,
    vocationalTrainingCentre: Number,
    streetChildrenRehabilitationCentre: Number,
    nightShelter: Number,
    oldAgeHome: Number,
    oldAgePensionsHolders: Number,
    widowPensionsHolders: Number,
    disabledPensionsHolders: Number,
    generalInsuranceCovered: Number,
    healthInsuranceCovered: Number,
    selfHelpGroups: Number,
    thriftCreditSocieties: Number,
    slumDwellersAssociation: String,
    youthAssociations: Number,
    womensAssociations: Number
  },

  // SECTION 14: ADDITIONAL INFRASTRUCTURE REQUIREMENTS
  additionalInfrastructure: {
    // Water Supply
    waterSupply: {
      pipelines: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      individualTaps: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      borewells: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      connectivityToTrunkLines: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      }
    },
    // Drainage/Sewerage
    drainageSewerage: {
      stormwaterDrainage: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      connectivityToMainDrains: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      sewerLines: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      connectivityToTrunkSewers: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      }
    },
    // Roads
    roads: {
      internalRoadsCC: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      internalRoadsBT: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      internalRoadsOthers: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      approachRoadsCC: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      approachRoadsOthers: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      }
    },
    // Street Lighting
    streetLighting: {
      poles: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      lights: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      }
    },
    // Sanitation
    sanitation: {
      individualToilets: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      communityToilets: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      seatsInCommunityToilets: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      dumperBins: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      }
    },
    // Community Facilities
    communityFacilities: {
      communityHalls: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      livelihoodCentres: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      anganwadis: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      primarySchools: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      healthCentres: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      },
      others: {
        existing: String,
        additionalRequirement: String,
        estimatedCost: Number
      }
    }
  },

  // Survey Metadata
  surveyStatus: {
    type: String,
    enum: ['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED'],
    default: 'DRAFT'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedSections: {
    type: [String],
    default: []
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