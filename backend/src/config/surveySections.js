/**
 * Survey Sections Configuration
 * Defines the logical grouping of fields for both Slum Survey and Household Survey
 * Used for structured report exports and column selection UI
 */

module.exports = {
  // ============================================
  // SLUM SURVEY SECTIONS (14 Sections)
  // ============================================
  slumSurveySections: [
    {
      id: 'survey_metadata',
      label: 'Survey Metadata',
      order: 1,
      fields: [
        { key: 'surveyId', label: 'Survey ID' },
        { key: 'slumName', label: 'Slum Name' },
        { key: 'submittedAt', label: 'Submitted At' },
        { key: 'submittedBy', label: 'Submitted By' }
        // Excluded: slumId, location, city, wardNumber, wardName, zone (don't exist in model)
      ]
    },
    {
      id: 'general_information',
      label: 'SECTION 1: GENERAL INFORMATION - CITY/TOWN',
      order: 2,
      fields: [
        { key: 'stateCode', label: 'State Code' },
        { key: 'stateName', label: 'State Name' },
        { key: 'districtCode', label: 'District Code' },
        { key: 'districtName', label: 'District Name' },
        { key: 'ulbCode', label: 'ULB Code' },
        { key: 'ulbName', label: 'ULB Name' },
        { key: 'cityTownCode', label: 'City/Town Code' }
        // Excluded: cityTown (doesn't exist in model)
        , { key: 'cityTownNoHouseholds', label: 'City HH Count' }
      ]
    },
    {
      id: 'slum_profile',
      label: 'SECTION 2: CITY/TOWN SLUM PROFILE',
      order: 3,
      fields: [
        { key: 'slumType', label: 'Slum Type' },
        { key: 'slumIdField', label: 'Slum ID Field' },
        { key: 'areaSqMtrs', label: 'Area (sq m)' },
        { key: 'slumPopulation', label: 'Population' },
        { key: 'noSlumHouseholds', label: 'HH Count' },
        { key: 'bplPopulation', label: 'BPL Population' },
        { key: 'bplHouseholds', label: 'BPL Households' }
      ]
    },
    {
      id: 'survey_operation',
      label: 'SECTION 3: PARTICULARS OF SURVEY OPERATION',
      order: 4,
      fields: [
        { key: 'surveyorName', label: 'Surveyor Name (Op)' },
        { key: 'surveyDate', label: 'Survey Date' }
      ]
    },
    {
      id: 'basic_information',
      label: 'SECTION 4: BASIC INFORMATION ON SLUM',
      order: 5,
      fields: [
        { key: 'wardNumber', label: 'Ward Number' },
        { key: 'wardName', label: 'Ward Name' },
        { key: 'zoneNumber', label: 'Zone Number' },
        { key: 'ageSlumYears', label: 'Age (Years)' },
        { key: 'locationCoreOrFringe', label: 'Location Type' },
        { key: 'typeAreaSurrounding', label: 'Surrounding Area' },
        { key: 'physicalLocationSlum', label: 'Physical Location' }
        // Excluded: slumNameBasicInfo (doesn't exist in model)
      ]
    },
    {
      id: 'land_status',
      label: 'SECTION 5: LAND STATUS',
      order: 6,
      fields: [
        { key: 'ownershipLandDetail', label: 'Land Ownership' },
        { key: 'ownershipLandSpecify', label: 'Land Specify' }
      ]
    },
    {
      id: 'demographic_profile',
      label: 'SECTION 6: DEMOGRAPHIC PROFILE',
      order: 7,
      subSections: [
        {
          id: 'population_health',
          label: 'Population & Health Demographics',
          fields: [
            // Total Population
            { key: 'popSC', label: 'Total Population - SC' },
            { key: 'popST', label: 'Total Population - ST' },
            { key: 'popOBC', label: 'Total Population - OBC' },
            { key: 'popOthers', label: 'Total Population - Others' },
            { key: 'popTotal', label: 'Total Population - Total' },
            { key: 'popMinorities', label: 'Total Population - Minorities' },
            // BPL Population
            { key: 'bplSC', label: 'BPL Population - SC' },
            { key: 'bplST', label: 'BPL Population - ST' },
            { key: 'bplOBC', label: 'BPL Population - OBC' },
            { key: 'bplOthers', label: 'BPL Population - Others' },
            { key: 'bplTotal', label: 'BPL Population - Total' },
            { key: 'bplMinorities', label: 'BPL Population - Minorities' },
            // Households
            { key: 'hhSC', label: 'No. of Households - SC' },
            { key: 'hhST', label: 'No. of Households - ST' },
            { key: 'hhOBC', label: 'No. of Households - OBC' },
            { key: 'hhOthers', label: 'No. of Households - Others' },
            { key: 'hhTotal', label: 'No. of Households - Total' },
            { key: 'hhMinorities', label: 'No. of Households - Minorities' },
            // BPL Households
            { key: 'bplHhSC', label: 'No. of BPL Households - SC' },
            { key: 'bplHhST', label: 'No. of BPL Households - ST' },
            { key: 'bplHhOBC', label: 'No. of BPL Households - OBC' },
            { key: 'bplHhOthers', label: 'No. of BPL Households - Others' },
            { key: 'bplHhTotal', label: 'No. of BPL Households - Total' },
            { key: 'bplHhMinorities', label: 'No. of BPL Households - Minorities' },
            // Women Headed Households
            { key: 'whhSC', label: 'Women Headed Households - SC' },
            { key: 'whhST', label: 'Women Headed Households - ST' },
            { key: 'whhOBC', label: 'Women Headed Households - OBC' },
            { key: 'whhOthers', label: 'Women Headed Households - Others' },
            { key: 'whhTotal', label: 'Women Headed Households - Total' },
            { key: 'whhMinorities', label: 'Women Headed Households - Minorities' },
            // Persons > 65 Years
            { key: 'seniorSC', label: 'Persons > 65 Years - SC' },
            { key: 'seniorST', label: 'Persons > 65 Years - ST' },
            { key: 'seniorOBC', label: 'Persons > 65 Years - OBC' },
            { key: 'seniorOthers', label: 'Persons > 65 Years - Others' },
            { key: 'seniorTotal', label: 'Persons > 65 Years - Total' },
            { key: 'seniorMinorities', label: 'Persons > 65 Years - Minorities' },
            // Child Labourers
            { key: 'childLabourSC', label: 'Child Labourers - SC' },
            { key: 'childLabourST', label: 'Child Labourers - ST' },
            { key: 'childLabourOBC', label: 'Child Labourers - OBC' },
            { key: 'childLabourOthers', label: 'Child Labourers - Others' },
            { key: 'childLabourTotal', label: 'Child Labourers - Total' },
            { key: 'childLabourMinorities', label: 'Child Labourers - Minorities' },
            // Physically Challenged
            { key: 'physicallyChallengedSC', label: 'Physically Challenged - SC' },
            { key: 'physicallyChallengedST', label: 'Physically Challenged - ST' },
            { key: 'physicallyChallengedOBC', label: 'Physically Challenged - OBC' },
            { key: 'physicallyChallengedOthers', label: 'Physically Challenged - Others' },
            { key: 'physicallyChallengedTotal', label: 'Physically Challenged - Total' },
            { key: 'physicallyChallengedMinorities', label: 'Physically Challenged - Minorities' },
            // Mentally Challenged
            { key: 'mentallyChallengedSC', label: 'Mentally Challenged - SC' },
            { key: 'mentallyChallengedST', label: 'Mentally Challenged - ST' },
            { key: 'mentallyChallengedOBC', label: 'Mentally Challenged - OBC' },
            { key: 'mentallyChallengedOthers', label: 'Mentally Challenged - Others' },
            { key: 'mentallyChallengedTotal', label: 'Mentally Challenged - Total' },
            { key: 'mentallyChallengedMinorities', label: 'Mentally Challenged - Minorities' },
            // HIV/AIDS
            { key: 'hivAidsSC', label: 'Persons with HIV/AIDS - SC' },
            { key: 'hivAidsST', label: 'Persons with HIV/AIDS - ST' },
            { key: 'hivAidsOBC', label: 'Persons with HIV/AIDS - OBC' },
            { key: 'hivAidsOthers', label: 'Persons with HIV/AIDS - Others' },
            { key: 'hivAidsTotal', label: 'Persons with HIV/AIDS - Total' },
            { key: 'hivAidsMinorities', label: 'Persons with HIV/AIDS - Minorities' },
            // Tuberculosis
            { key: 'tuberculosisSC', label: 'Persons with Tuberculosis - SC' },
            { key: 'tuberculosisST', label: 'Persons with Tuberculosis - ST' },
            { key: 'tuberculosisOBC', label: 'Persons with Tuberculosis - OBC' },
            { key: 'tuberculosisOthers', label: 'Persons with Tuberculosis - Others' },
            { key: 'tuberculosisTotal', label: 'Persons with Tuberculosis - Total' },
            { key: 'tuberculosisMinorities', label: 'Persons with Tuberculosis - Minorities' },
            // Respiratory Diseases
            { key: 'respiratorySC', label: 'Persons with Respiratory Diseases - SC' },
            { key: 'respiratoryST', label: 'Persons with Respiratory Diseases - ST' },
            { key: 'respiratoryOBC', label: 'Persons with Respiratory Diseases - OBC' },
            { key: 'respiratoryOthers', label: 'Persons with Respiratory Diseases - Others' },
            { key: 'respiratoryTotal', label: 'Persons with Respiratory Diseases - Total' },
            { key: 'respiratoryMinorities', label: 'Persons with Respiratory Diseases - Minorities' },
            // Other Chronic Diseases
            { key: 'chronicSC', label: 'Persons with Other Chronic Diseases - SC' },
            { key: 'chronicST', label: 'Persons with Other Chronic Diseases - ST' },
            { key: 'chronicOBC', label: 'Persons with Other Chronic Diseases - OBC' },
            { key: 'chronicOthers', label: 'Persons with Other Chronic Diseases - Others' },
            { key: 'chronicTotal', label: 'Persons with Other Chronic Diseases - Total' },
            { key: 'chronicMinorities', label: 'Persons with Other Chronic Diseases - Minorities' }
          ]
        },
        {
          id: 'literacy_education',
          label: 'Literacy & Education',
          fields: [
            // Total Illiterate
            { key: 'illiterateTotal', label: 'Total Illiterate - Total' },
            { key: 'illiterateSC', label: 'Total Illiterate - SC' },
            { key: 'illiterateST', label: 'Total Illiterate - ST' },
            { key: 'illiterateOBC', label: 'Total Illiterate - OBC' },
            { key: 'illiterateOthers', label: 'Total Illiterate - Others' },
            { key: 'illiterateMinorities', label: 'Total Illiterate - Minorities' },
            // Male Illiterate
            { key: 'illiterateMale', label: 'Male Illiterate - Total' },
            { key: 'illiterateMaleSC', label: 'Male Illiterate - SC' },
            { key: 'illiterateMaleST', label: 'Male Illiterate - ST' },
            { key: 'illiterateMaleOBC', label: 'Male Illiterate - OBC' },
            { key: 'illiterateMaleOthers', label: 'Male Illiterate - Others' },
            { key: 'illiterateMaleMinorities', label: 'Male Illiterate - Minorities' },
            // Female Illiterate
            { key: 'illiterateFemale', label: 'Female Illiterate - Total' },
            { key: 'illiterateFemaleSC', label: 'Female Illiterate - SC' },
            { key: 'illiterateFemaleST', label: 'Female Illiterate - ST' },
            { key: 'illiterateFemaleOBC', label: 'Female Illiterate - OBC' },
            { key: 'illiterateFemaleOthers', label: 'Female Illiterate - Others' },
            { key: 'illiterateFemaleMinorities', label: 'Female Illiterate - Minorities' },
            // BPL Illiterate
            { key: 'bplIlliterateTotal', label: 'BPL Illiterate - Total' },
            { key: 'bplIlliterateSC', label: 'BPL Illiterate - SC' },
            { key: 'bplIlliterateST', label: 'BPL Illiterate - ST' },
            { key: 'bplIlliterateOBC', label: 'BPL Illiterate - OBC' },
            { key: 'bplIlliterateOthers', label: 'BPL Illiterate - Others' },
            { key: 'bplIlliterateMinorities', label: 'BPL Illiterate - Minorities' },
            // School Dropouts Male
            { key: 'childrenNSMale', label: 'School Dropouts Male - Total' },
            { key: 'schoolDropoutMaleSC', label: 'School Dropouts Male - SC' },
            { key: 'schoolDropoutMaleST', label: 'School Dropouts Male - ST' },
            { key: 'schoolDropoutMaleOBC', label: 'School Dropouts Male - OBC' },
            { key: 'schoolDropoutMaleOthers', label: 'School Dropouts Male - Others' },
            { key: 'schoolDropoutMaleMinorities', label: 'School Dropouts Male - Minorities' },
            // School Dropouts Female
            { key: 'childrenNSFemale', label: 'School Dropouts Female - Total' },
            { key: 'schoolDropoutFemaleSC', label: 'School Dropouts Female - SC' },
            { key: 'schoolDropoutFemaleST', label: 'School Dropouts Female - ST' },
            { key: 'schoolDropoutFemaleOBC', label: 'School Dropouts Female - OBC' },
            { key: 'schoolDropoutFemaleOthers', label: 'School Dropouts Female - Others' },
            { key: 'schoolDropoutFemaleMinorities', label: 'School Dropouts Female - Minorities' }
          ]
        }
      ]
    },
    {
      id: 'housing_status',
      label: 'SECTION 7: HOUSING STATUS',
      order: 8,
      fields: [
        { key: 'dwellingPucca', label: 'Dwelling Pucca' },
        { key: 'dwellingSemiPucca', label: 'Dwelling Semi-Pucca' },
        { key: 'dwellingKatcha', label: 'Dwelling Katcha' },
        { key: 'dwellingTotal', label: 'Dwelling Total' },
        { key: 'electricityPucca', label: 'Electricity Pucca' },
        { key: 'electricitySemiPucca', label: 'Electricity Semi-Pucca' },
        { key: 'electricityKatcha', label: 'Electricity Katcha' },
        { key: 'electricityTotal', label: 'Electricity Total' },
        { key: 'landPatta', label: 'Land with Patta' },
        { key: 'landPossession', label: 'Land Possession Cert' },
        { key: 'landEncroachedPrivate', label: 'Land Encroached Private' },
        { key: 'landEncroachedPublic', label: 'Land Encroached Public' },
        { key: 'landRented', label: 'Land Rented' },
        { key: 'landOther', label: 'Land Other' },
        { key: 'landTotal', label: 'Land Total' }
      ]
    },
    {
      id: 'economic_status',
      label: 'SECTION 8: ECONOMIC STATUS OF HOUSEHOLDS',
      order: 9,
      fields: [
        { key: 'incomeLessThan500', label: 'Income <500' },
        { key: 'income500to1000', label: 'Income 500-1000' },
        { key: 'income1000to1500', label: 'Income 1000-1500' },
        { key: 'income1500to2000', label: 'Income 1500-2000' },
        { key: 'income2000to3000', label: 'Income 2000-3000' },
        { key: 'incomeMoreThan3000', label: 'Income >3000' }
      ]
    },
    {
      id: 'employment_occupation',
      label: 'SECTION 9: EMPLOYMENT AND OCCUPATION STATUS',
      order: 10,
      fields: [
        { key: 'selfEmployed', label: 'Self Employed' },
        { key: 'salaried', label: 'Salaried' },
        { key: 'regularWage', label: 'Regular Wage' },
        { key: 'casualLabour', label: 'Casual Labour' },
        { key: 'employmentOthers', label: 'Others' }
      ]
    },
    {
      id: 'physical_infrastructure',
      label: 'SECTION 10: ACCESS TO PHYSICAL INFRASTRUCTURE',
      order: 11,
      fields: [
        { key: 'waterPipelines', label: 'Water Pipelines' },
        { key: 'waterTaps', label: 'Water Individual Taps' },
        { key: 'waterBorewells', label: 'Water Borewells' },
        { key: 'connectivityCityWater', label: 'City Water Supply' },
        { key: 'drainageSewerage', label: 'Drainage Facility' },
        { key: 'connectivityStorm', label: 'Storm Drainage' },
        { key: 'connectivitySewerage', label: 'Sewerage System' },
        { key: 'proneToFlooding', label: 'Flood Prone' },
        // Flattened Latrine Facility sub-fields
        { key: 'latrineOwnSepticFlush', label: 'Latrine - Own Septic Tank Flush' },
        { key: 'latrineOwnDry', label: 'Latrine - Own Dry Latrine' },
        { key: 'latrineSharedSepticFlush', label: 'Latrine - Shared Septic Tank Flush' },
        { key: 'latrineSharedDry', label: 'Latrine - Shared Dry Latrine' },
        { key: 'latrineCommunitySepticFlush', label: 'Latrine - Community Septic Tank Flush' },
        { key: 'latrineCommunityDry', label: 'Latrine - Community Dry Latrine' },
        { key: 'latrineOpenDefecation', label: 'Latrine - Open Defecation' },
        { key: 'wasteFreq', label: 'Waste Management Freq' },
        { key: 'wasteArrangement', label: 'Waste Disposal Arrangement' },
        { key: 'drainsClearance', label: 'Open Drains Clearance' },
        { key: 'approachRoadType', label: 'Approach Road Type' },
        { key: 'distanceMotorableRoad', label: 'Distance to Motorable Road' },
        { key: 'internalRoadType', label: 'Internal Road Type' },
        { key: 'streetLightAvailable', label: 'Street Light Available' }
      ]
    },
    {
      id: 'education_facilities',
      label: 'SECTION 11: EDUCATION FACILITIES',
      order: 12,
      fields: [
        { key: 'anganwadiOption', label: 'Anganwadi - Available' },
        { key: 'anganwadiDistance', label: 'Anganwadi - Distance' },
        { key: 'municipalPreschoolOption', label: 'Municipal Pre-school - Available' },
        { key: 'municipalPreschoolDistance', label: 'Municipal Pre-school - Distance' },
        { key: 'privatePreschoolOption', label: 'Private Pre-school - Available' },
        { key: 'privatePreschoolDistance', label: 'Private Pre-school - Distance' },
        { key: 'municipalPrimarySchoolOption', label: 'Municipal Primary School - Available' },
        { key: 'municipalPrimarySchoolDistance', label: 'Municipal Primary School - Distance' },
        { key: 'statePrimarySchoolOption', label: 'State Govt Primary School - Available' },
        { key: 'statePrimarySchoolDistance', label: 'State Govt Primary School - Distance' },
        { key: 'privatePrimarySchoolOption', label: 'Private Primary School - Available' },
        { key: 'privatePrimarySchoolDistance', label: 'Private Primary School - Distance' },
        { key: 'municipalHighSchoolOption', label: 'Municipal High School - Available' },
        { key: 'municipalHighSchoolDistance', label: 'Municipal High School - Distance' },
        { key: 'stateHighSchoolOption', label: 'State Govt High School - Available' },
        { key: 'stateHighSchoolDistance', label: 'State Govt High School - Distance' },
        { key: 'privateHighSchoolOption', label: 'Private High School - Available' },
        { key: 'privateHighSchoolDistance', label: 'Private High School - Distance' },
        { key: 'adultEducationOption', label: 'Adult Education Centre - Available' },
        { key: 'adultEducationDistance', label: 'Adult Education Centre - Distance' },
        { key: 'nonFormalEducationOption', label: 'Non-Formal Education Centre - Available' },
        { key: 'nonFormalEducationDistance', label: 'Non-Formal Education Centre - Distance' }
      ]
    },
    {
      id: 'health_facilities',
      label: 'SECTION 12: HEALTH FACILITIES',
      order: 13,
      fields: [
        { key: 'urbanHealthPost', label: 'Urban Health Post' },
        { key: 'primaryHealthCentre', label: 'Primary Health Centre' },
        { key: 'governmentHospital', label: 'Government Hospital' },
        { key: 'maternityCentre', label: 'Maternity Centre' },
        { key: 'privateClinic', label: 'Private Clinic' },
        { key: 'rmp', label: 'RMP' },
        { key: 'ayurvedicDoctor', label: 'Ayurvedic Doctor' }
      ]
    },
    {
      id: 'social_development',
      label: 'SECTION 13: SOCIAL DEVELOPMENT/WELFARE',
      order: 14,
      fields: [
        { key: 'communityHall', label: 'Community Hall' },
        { key: 'livelihoodProductionCentre', label: 'Livelihood Production Centre' },
        { key: 'vocationalTrainingCentre', label: 'Vocational Training Centre' },
        { key: 'streetChildrenRehabilitationCentre', label: 'Street Children Rehabilitation Centre' },
        { key: 'nightShelter', label: 'Night Shelter' },
        { key: 'oldAgeHome', label: 'Old Age Home' },
        { key: 'oldAgePensionsHolders', label: 'Old Age Pension Holders' },
        { key: 'widowPensionsHolders', label: 'Widow Pension Holders' },
        { key: 'disabledPensionsHolders', label: 'Disabled Pension Holders' },
        { key: 'generalInsuranceCovered', label: 'General Insurance Covered' },
        { key: 'healthInsuranceCovered', label: 'Health Insurance Covered' },
        { key: 'selfHelpGroups', label: 'Self Help Groups' },
        { key: 'thriftCreditSocieties', label: 'Thrift Credit Societies' },
        { key: 'slumDwellersAssociation', label: 'Slum Dwellers Association' },
        { key: 'youthAssociations', label: 'Youth Associations' },
        { key: 'womensAssociations', label: 'Womens Associations' }
      ]
    },
    {
      id: 'additional_infrastructure',
      label: 'SECTION 14: ADDITIONAL INFRASTRUCTURE REQUIREMENTS',
      order: 15,
      fields: [
        // Water Supply
        { key: 'waterPipelinesExisting', label: 'Water Pipelines - Existing' },
        { key: 'waterPipelinesAdditional', label: 'Water Pipelines - Additional' },
        { key: 'waterPipelinesCost', label: 'Water Pipelines - Cost' },
        { key: 'waterTapsExisting', label: 'Water Individual Taps - Existing' },
        { key: 'waterTapsAdditional', label: 'Water Individual Taps - Additional' },
        { key: 'waterTapsCost', label: 'Water Individual Taps - Cost' },
        { key: 'waterBorewellsExisting', label: 'Water Borewells - Existing' },
        { key: 'waterBorewellsAdditional', label: 'Water Borewells - Additional' },
        { key: 'waterBorewellsCost', label: 'Water Borewells - Cost' },
        { key: 'waterConnectivityExisting', label: 'Water Connectivity - Existing' },
        { key: 'waterConnectivityAdditional', label: 'Water Connectivity - Additional' },
        { key: 'waterConnectivityCost', label: 'Water Connectivity - Cost' },
        // Drainage/Sewerage
        { key: 'stormwaterDrainageExisting', label: 'Stormwater Drainage - Existing' },
        { key: 'stormwaterDrainageAdditional', label: 'Stormwater Drainage - Additional' },
        { key: 'stormwaterDrainageCost', label: 'Stormwater Drainage - Cost' },
        { key: 'mainDrainsConnectivityExisting', label: 'Main Drains Connectivity - Existing' },
        { key: 'mainDrainsConnectivityAdditional', label: 'Main Drains Connectivity - Additional' },
        { key: 'mainDrainsConnectivityCost', label: 'Main Drains Connectivity - Cost' },
        { key: 'sewerLinesExisting', label: 'Sewer Lines - Existing' },
        { key: 'sewerLinesAdditional', label: 'Sewer Lines - Additional' },
        { key: 'sewerLinesCost', label: 'Sewer Lines - Cost' },
        { key: 'trunkSewersConnectivityExisting', label: 'Trunk Sewers Connectivity - Existing' },
        { key: 'trunkSewersConnectivityAdditional', label: 'Trunk Sewers Connectivity - Additional' },
        { key: 'trunkSewersConnectivityCost', label: 'Trunk Sewers Connectivity - Cost' },
        // Roads
        { key: 'internalRoadsCCExisting', label: 'Internal Roads CC - Existing' },
        { key: 'internalRoadsCCAdditional', label: 'Internal Roads CC - Additional' },
        { key: 'internalRoadsCCCost', label: 'Internal Roads CC - Cost' },
        { key: 'internalRoadsBTExisting', label: 'Internal Roads BT - Existing' },
        { key: 'internalRoadsBTAdditional', label: 'Internal Roads BT - Additional' },
        { key: 'internalRoadsBTCost', label: 'Internal Roads BT - Cost' },
        { key: 'internalRoadsOthersExisting', label: 'Internal Roads Others - Existing' },
        { key: 'internalRoadsOthersAdditional', label: 'Internal Roads Others - Additional' },
        { key: 'internalRoadsOthersCost', label: 'Internal Roads Others - Cost' },
        { key: 'approachRoadsCCExisting', label: 'Approach Roads CC - Existing' },
        { key: 'approachRoadsCCAdditional', label: 'Approach Roads CC - Additional' },
        { key: 'approachRoadsCCCost', label: 'Approach Roads CC - Cost' },
        { key: 'approachRoadsOthersExisting', label: 'Approach Roads Others - Existing' },
        { key: 'approachRoadsOthersAdditional', label: 'Approach Roads Others - Additional' },
        { key: 'approachRoadsOthersCost', label: 'Approach Roads Others - Cost' },
        // Street Lighting
        { key: 'streetLightPolesExisting', label: 'Street Light Poles - Existing' },
        { key: 'streetLightPolesAdditional', label: 'Street Light Poles - Additional' },
        { key: 'streetLightPolesCost', label: 'Street Light Poles - Cost' },
        { key: 'streetLightLightsExisting', label: 'Street Lights - Existing' },
        { key: 'streetLightLightsAdditional', label: 'Street Lights - Additional' },
        { key: 'streetLightLightsCost', label: 'Street Lights - Cost' },
        // Sanitation
        { key: 'individualToiletsExisting', label: 'Individual Toilets - Existing' },
        { key: 'individualToiletsAdditional', label: 'Individual Toilets - Additional' },
        { key: 'individualToiletsCost', label: 'Individual Toilets - Cost' },
        { key: 'communityToiletsExisting', label: 'Community Toilets - Existing' },
        { key: 'communityToiletsAdditional', label: 'Community Toilets - Additional' },
        { key: 'communityToiletsCost', label: 'Community Toilets - Cost' },
        { key: 'communityToiletSeatsExisting', label: 'Community Toilet Seats - Existing' },
        { key: 'communityToiletSeatsAdditional', label: 'Community Toilet Seats - Additional' },
        { key: 'communityToiletSeatsCost', label: 'Community Toilet Seats - Cost' },
        { key: 'dumperBinsExisting', label: 'Dumper Bins - Existing' },
        { key: 'dumperBinsAdditional', label: 'Dumper Bins - Additional' },
        { key: 'dumperBinsCost', label: 'Dumper Bins - Cost' },
        // Community Facilities
        { key: 'communityHallsExisting', label: 'Community Halls - Existing' },
        { key: 'communityHallsAdditional', label: 'Community Halls - Additional' },
        { key: 'communityHallsCost', label: 'Community Halls - Cost' },
        { key: 'livelihoodCentresExisting', label: 'Livelihood Centres - Existing' },
        { key: 'livelihoodCentresAdditional', label: 'Livelihood Centres - Additional' },
        { key: 'livelihoodCentresCost', label: 'Livelihood Centres - Cost' },
        { key: 'anganwadisExisting', label: 'Anganwadis - Existing' },
        { key: 'anganwadisAdditional', label: 'Anganwadis - Additional' },
        { key: 'anganwadisCost', label: 'Anganwadis - Cost' },
        { key: 'primarySchoolsExisting', label: 'Primary Schools - Existing' },
        { key: 'primarySchoolsAdditional', label: 'Primary Schools - Additional' },
        { key: 'primarySchoolsCost', label: 'Primary Schools - Cost' },
        { key: 'healthCentresExisting', label: 'Health Centres - Existing' },
        { key: 'healthCentresAdditional', label: 'Health Centres - Additional' },
        { key: 'healthCentresCost', label: 'Health Centres - Cost' },
        { key: 'otherFacilitiesExisting', label: 'Other Facilities - Existing' },
        { key: 'otherFacilitiesAdditional', label: 'Other Facilities - Additional' },
        { key: 'otherFacilitiesCost', label: 'Other Facilities - Cost' },
        // Standalone Infrastructure
        { key: 'electricityExisting', label: 'Electricity - Existing' },
        { key: 'electricityAdditional', label: 'Electricity - Additional' },
        { key: 'electricityCost', label: 'Electricity - Cost' },
        { key: 'healthCareExisting', label: 'Health Care - Existing' },
        { key: 'healthCareAdditional', label: 'Health Care - Additional' },
        { key: 'healthCareCost', label: 'Health Care - Cost' },
        { key: 'toiletsExisting', label: 'Toilets - Existing' },
        { key: 'toiletsAdditional', label: 'Toilets - Additional' },
        { key: 'toiletsCost', label: 'Toilets - Cost' }
      ]
    }
  ],

  // ============================================
  // HOUSEHOLD SURVEY SECTIONS (6 Sections)
  // ============================================
  householdSurveySections: [
    {
      id: 'survey_metadata',
      label: 'Survey Metadata',
      order: 1,
      fields: [
        { key: '_id', label: 'Record ID' },
        { key: 'surveyStatus', label: 'Survey Status' },
        { key: 'submittedAt', label: 'Submitted At' },
        { key: 'submittedBy', label: 'Submitted By' }
      ]
    },
    {
      id: 'general_information',
      label: 'General Information',
      order: 2,
      fields: [
        { key: 'slumId', label: 'Slum ID' },
        { key: 'slumName', label: 'Slum Name' },
        { key: 'ward', label: 'Location - Ward No/Name' },
        { key: 'parcelId', label: 'Parcel ID' },
        { key: 'propertyNo', label: 'Property Number' },
        { key: 'houseDoorNo', label: 'House/Flat/Door No.' }
      ]
    },
    {
      id: 'household_details',
      label: 'Household Details',
      order: 3,
      fields: [
        { key: 'headName', label: 'Head of Household Name' },
        { key: 'fatherName', label: "Father/Husband/Guardian's Name" },
        { key: 'sex', label: 'Sex' },
        { key: 'caste', label: 'Caste' },
        { key: 'religion', label: 'Religion' },
        { key: 'minorityStatus', label: 'Minority Status' },
        { key: 'femaleHeadStatus', label: 'Female Head Status' },
        // Family Members
        { key: 'familyMembersMale', label: 'Number of Family Members (Male)' },
        { key: 'familyMembersFemale', label: 'Number of Family Members (Female)' },
        { key: 'familyMembersTotal', label: 'Number of Family Members (Total)' },
        // Illiterate Adults
        { key: 'illiterateAdultMale', label: 'Illiterate Adult Male Members (>14 yrs)' },
        { key: 'illiterateAdultFemale', label: 'Illiterate Adult Female Members (>14 yrs)' },
        { key: 'illiterateAdultTotal', label: 'Illiterate Adult Total Members (>14 yrs)' },
        // Children Not Attending School
        { key: 'childrenNotAttendingMale', label: 'Children Aged 6-14 Not Attending School (Male)' },
        { key: 'childrenNotAttendingFemale', label: 'Children Aged 6-14 Not Attending School (Female)' },
        { key: 'childrenNotAttendingTotal', label: 'Children Aged 6-14 Not Attending School (Total)' },
        // Handicapped Persons
        { key: 'handicappedPhysically', label: 'Handicapped Persons (Physically)' },
        { key: 'handicappedMentally', label: 'Handicapped Persons (Mentally)' },
        { key: 'handicappedTotal', label: 'Handicapped Persons (Total)' },
        // Economic Status
        { key: 'femaleEarningStatus', label: 'Major Earning Female Member Status' },
        { key: 'belowPovertyLine', label: 'Family Below Poverty Line?' },
        { key: 'bplCard', label: 'Has BPL Card?' }
      ]
    },
    {
      id: 'housing_infrastructure',
      label: 'Housing & Infrastructure',
      order: 4,
      fields: [
        // Housing
        { key: 'landTenureStatus', label: 'Land Tenure Status' },
        { key: 'houseStructure', label: 'House Structure/Type' },
        { key: 'roofType', label: 'Roof Type' },
        { key: 'flooringType', label: 'Flooring Type' },
        { key: 'houseLighting', label: 'House Lighting' },
        { key: 'cookingFuel', label: 'Cooking Fuel' },
        // Water
        { key: 'waterSource', label: 'Water Source' },
        { key: 'waterSupplyDuration', label: 'Water Supply Duration' },
        { key: 'waterSourceDistance', label: 'Water Source Distance' },
        // Sanitation
        { key: 'toiletFacility', label: 'Toilet Facility' },
        { key: 'bathroomFacility', label: 'Bathroom Facility' },
        { key: 'roadFrontType', label: 'Road Front Type' }
      ]
    },
    {
      id: 'facilities',
      label: 'Education & Health',
      order: 5,
      fields: [
        // Education
        { key: 'preschoolType', label: 'Pre-school Type' },
        { key: 'primarySchoolType', label: 'Primary School Type' },
        { key: 'highSchoolType', label: 'High School Type' },
        // Health
        { key: 'healthFacilityType', label: 'Health Facility Type' },
        // Welfare & Assets
        { key: 'welfareBenefits', label: 'Welfare Benefits' },
        { key: 'consumerDurables', label: 'Consumer Durables' },
        { key: 'livestock', label: 'Livestock' }
      ]
    },
    {
      id: 'migration',
      label: 'Migration Details',
      order: 6,
      fields: [
        { key: 'yearsInTown', label: 'No. of Years in Town' },
        { key: 'migrated', label: 'Migrated' },
        { key: 'migratedFrom', label: 'Migrated From' },
        { key: 'migrationType', label: 'Migration Type' },
        { key: 'migrationReasons', label: 'Migration Reasons' }
      ]
    },
    {
      id: 'income_expenditure',
      label: 'Income & Expenditure',
      order: 7,
      fields: [
        // Earning Adults
        { key: 'earningAdultMale', label: 'Earning Adult Male' },
        { key: 'earningAdultFemale', label: 'Earning Adult Female' },
        { key: 'earningAdultTotal', label: 'Earning Adult Total' },
        // Earning Non-Adults
        { key: 'earningNonAdultMale', label: 'Earning Non-Adult Male' },
        { key: 'earningNonAdultFemale', label: 'Earning Non-Adult Female' },
        { key: 'earningNonAdultTotal', label: 'Earning Non-Adult Total' },
        // Income & Expenses
        { key: 'monthlyIncome', label: 'Monthly Income' },
        { key: 'monthlyExpenditure', label: 'Monthly Expenditure' },
        { key: 'debtOutstanding', label: 'Debt Outstanding' },
        // Additional Info
        { key: 'notes', label: 'Notes' }
      ]
    }
  ]
};
