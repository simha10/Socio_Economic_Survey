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

  // PART-D: I. BASIC INFORMATION ON SLUM
  basicInformation: {
    slumNameBasicInfo: String, // 1 - Name of Slum
    slumCode: String, // 1a - Slum Code
    locationWard: String, // 2 - Location - Ward No/Name
    ageSlumYears: Number, // 3 - Age of Slum in Years
    areaSlumSqMtrs: Number, // 4 - Area of Slum (Sq. metres)
    locationCoreOrFringe: String, // 5 - Whether located in Core City/Town or Fringe area (Core City/Town - 01, Fringe Area -02)
    typeAreaSurrounding: String, // 6 - Type of Area surrounding Slum (Residential - 01, Industrial - 02, Commercial - 03, Institutional-04, Other-49)
    physicalLocationSlum: String, // 7 - Physical Location of Slum (Along Nallah -01, Along Other Drains - 02, etc.)
    isSlumNotified: String, // 8 - Is the Slum Notified/Declared? (Yes-01, No-02)
    yearOfNotification: Number // 9 - If Yes (01) in 8, state Year of Notification
  },

  // PART-E: II. LAND STATUS
  landStatus: {
    ownershipLandDetail: String, // 10 - Ownership of Land where Slum is located (Public: Local Body -01, State Government - 02, etc.)
    ownershipLandSpecify: String // 11 - Please specify Ownership of Land (To whom land belongs)
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

  // PART-I: V. ECONOMIC STATUS OF HOUSEHOLDS
  economicStatus: {
    // 16. Economic Status (Monthly income of HHs)
    economicStatusData: {
      lessThan500: Number,
      rs500to1000: Number,
      rs1000to1500: Number,
      rs1500to2000: Number,
      rs2000to3000: Number,
      moreThan3000: Number
    }
  },

  // PART-K: VII. ACCESS TO PHYSICAL INFRASTRUCTURE
  physicalInfrastructure: {
    // 18a. Source of Drinking Water (No. of HHs covered)
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
    // 18b. Connectivity to City-wide Water Supply System
    connectivityCityWaterSupply: String, // Fully connected 01, Partially connected 02, Not connected 03
    // 19a. Drainage & Sewerage Facility
    drainageSewerageFacility: String, // YES/NO
    // 19b. Connectivity to City-wide Storm-water Drainage System
    connectivityStormWaterDrainage: String, // Fully connected 01, Partially connected 02, Not connected 03
    // 19c. Connectivity to City-wide Sewerage System
    connectivitySewerageSystem: String, // Fully connected 01, Partially connected 02, Not connected 03
    // 19d. Whether the Slum is prone to flooding due to rains
    proneToFlooding: String, // Not prone - 01, Upto 15 days - 02, 15-30 Days - 03, More than a Month - 04
    // 20. Latrine facility used by Households
    latrineFacility: String, // Public Latrine/ Shared latrine/ own latrine
    // 21. Solid Waste Management
    solidWasteManagement: {
      // 21a. Frequency of Garbage Disposal
      frequencyOfGarbageDisposal: String, // Daily -01, Once in 2 days - 02, Once in a week - 03, Once in 15 days - 04, No collection- 99
      // 21b. Arrangement for Garbage Disposal
      arrangementForGarbageDisposal: String, // Municipal staff - 01, Municipal Contractor - 02, Residents themselves - 03, Others - 04,No arrangement - 99
      // 21c. Frequency of Clearance of Open Drains
      frequencyOfClearanceOfOpenDrains: String // Daily-01, Once in 2 days - 02, Once in a week - 03, Once in 15 days - 04, No clearance-99
    },
    // 22. Approach Road/Lane/Constructed Path to the Slum
    approachRoadType: String, // Motorable pucca -01, Motorable katcha -02, Non-motorable pucca -03, Non-motorable kaccha-04
    // 23. Distance from the nearest Motorable Road
    distanceToNearestMotorableRoad: String, // Less than 0.5 kms -01, 0.5 to 1.0 km .- 02, 1.0 km to 2.0 km. -03, 2.0 km to 5.0 km. - 04,more than 5.0 km-05
    // 24. Internal Road
    internalRoadType: String, // Motorable pucca-01, Motorable kutcha-02, Non-motorable pucca-03, Non-motorable katcha-04
    // 25. Whether Street light facility is available in the Slum
    streetLightAvailable: String // Yes-01, No-02
  },



  // PART-H: IV. HOUSING STATUS
  housingStatus: {
    // 14. Dwelling Units Structure
    dwellingUnitsPucca: Number,
    dwellingUnitsSemiPucca: Number,
    dwellingUnitsKatcha: Number,
    dwellingUnitsTotal: Number,
    dwellingUnitsWithElectricityPucca: Number,
    dwellingUnitsWithElectricitySemiPucca: Number,
    dwellingUnitsWithElectricityKatcha: Number,
    dwellingUnitsWithElectricityTotal: Number,
    // 15. Land Tenure Status (Dwelling Unit Nos)
    landTenureWithPatta: Number,
    landTenurePossessionCertificate: Number,
    landTenureEncroachedPrivate: Number,
    landTenureEncroachedPublic: Number,
    landTenureOnRent: Number,
    landTenureOther: Number,
    landTenureTotal: Number
  },

  // PART-L: VIII. Education Facilities
  educationFacilities: {
    // 26. Pre-primary School
    anganwadiUnderIcds: Number, // 26a. Anganwadi under ICDS
    municipalPreschool: Number, // 26b. Municipal pre-school
    privatePreschool: Number, // 26c. Private pre-school
    // 27. Primary School
    municipalPrimarySchool: Number, // 27a. Municipal
    stateGovtPrimarySchool: Number, // 27b. State Government
    privatePrimarySchool: Number, // 27c. Private
    // 28. High School
    municipalHighSchool: Number, // 28a. Municipal
    stateGovtHighSchool: Number, // 28b. State Government
    privateHighSchool: Number, // 28c. Private
    // 29. Adult Education Centre
    adultEducationCentre: Number, // If 01, then number
    // 30. Non-formal Education Centre
    nonFormalEducationCentre: Number // If 01, then number
  },

  // PART-M: IX. Health Facilities
  healthFacilities: {
    // 31. Existence of Health Facilities
    urbanHealthPost: String,
    primaryHealthCentre: String,
    governmentHospital: String,
    maternityCentre: String,
    privateClinic: String,
    rmp: String, // Registered Medical Practitioner (RMP)
    ayurvedicDoctor: String // Ayurvedic Doctor/Vaidya
  },

  // PART-XII: XI. ADDITIONAL INFRASTRUCTURE REQUIREMENTS
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

  // PART-N: X. Social Development/Welfare
  socialDevelopment: {
    // 32. Availability of Facilities within Slum
    communityHall: Number, // Community Hall
    livelihoodProductionCentre: Number, // Livelihood/Production Centre
    vocationalTrainingCentre: Number, // Vocational training/Training-cum-production Centre
    streetChildrenRehabilitationCentre: Number, // Street Children Rehabilitation Centre
    nightShelter: Number, // Night Shelter
    oldAgeHome: Number, // Old Age Home
    // 33a. Old Age Pensions (No. of Holders)
    oldAgePensionsHolders: Number,
    // 33b. Widow Pensions (No. of Holders)
    widowPensionsHolders: Number,
    // 33c. Disabled Pensions (No. of Holders)
    disabledPensionsHolders: Number,
    // 33d. General Insurance (No. covered)
    generalInsuranceCovered: Number,
    // 33e. Health Insurance (No. covered)
    healthInsuranceCovered: Number,
    // 34. Self Help Groups/DWCUA Groups in Slum
    selfHelpGroups: Number, // Specify Number: 0, 01, 02, 03 ....
    // 35. Thrift and Credit Societies in Slum
    thriftCreditSocieties: Number, // Specify Number: 0, 01, 02, 03 ....
    // 36a. Slum-dwellers Association
    slumDwellersAssociation: String, // [Yes- 01, No- 02]
    // 36b. Youth Associations
    youthAssociations: Number, // Specify Number: 0, 01,02,03
    // 36c. Women's Associations/ Mahila Samithis
    womensAssociations: Number // Specify Number: 0, 01,02,03
  },

  // PART-A: I. GENERAL INFORMATION -CITY/TOWN
  generalInformation: {
    stateCode: String, // 1(a) State Code
    stateName: String, // 1(b) Name of State
    districtCode: String, // 2(a) District Code
    districtName: String, // 2(b) Name of District
    cityTownCode: String, // 3(a) City/Town Code
    cityTownName: String, // 3(b) Name of City/Town
    cityTown: String, // 4(a) City/Town
    cityTownNoHouseholds: Number // 4(b) City/Town No. of Households (2011 Census)
  },

  // PART-B: II. CITY/TOWN SLUM PROFILE
  cityTownSlumProfile: {
    slumType: String, // 5. Slum Type : Summary of Basic Information on Slums - 2011
    slumIdField: String, // 6. Slum ID
    slumName: String, // 7. Slum Name
    ownershipLand: String, // 8. Ownership of Land where Slum is located
    areaSqMtrs: Number, // 9. Area in sq Mtrs
    slumPopulation: Number, // 10. Slum population
    noSlumHouseholds: Number, // 11. No. of slum House Holds
    bplPopulation: Number, // 12. BPL(Below Poverty Line) population
    noBplHouseholdsCityTown: Number // 13. No. of BPL House Holds
  },

  // PART-C: III. PARTICULARS OF SURVEY OPERATION
  surveyOperation: {
    surveyorName: String, // 7. Name
    surveyDate: String, // 8. Date(s) of Survey
    receiptQuestionnaireDate: String, // 8(b) Receipt of Questionnaire
    scrutinyDate: String, // 8(c) Scrutiny
    receiptByNodalCellDate: String, // 8(d) Receipt by Nodal Cell in Urban Local Body
    remarksInvestigator: String, // 10. Remarks by Investigator/Surveyor
    commentsSupervisor: String // 11. Comments by the Supervisor
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