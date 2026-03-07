"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiService from "@/services/api";
import Card from "@/components/Card";
import Button from "@/components/Button";
import InfiniteScrollSelect from "@/components/InfiniteScrollSelect";

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
}

interface Slum {
  _id: string;
  slumName: string;
  slumId: number;
  stateCode: string;
  distCode: string;
  cityTownCode: string;
  location?: string;
  ulbCode?: string;
  ulbName?: string;
  ward: {
    _id: string;
    number: string;
    name: string;
    zone: string;
  } | string;
  slumType: string;
  village: string;
  landOwnership: string;
  totalHouseholds: number;
  area: number;
}

interface SlumSurveyData {
  _id: string;
  surveyStatus: 'DRAFT' | 'IN PROGRESS' | 'SUBMITTED' | 'COMPLETED';
  completionPercentage: number;
  submittedAt?: string;
  createdAt: string;
  slum?: {
    slumName: string;
    slumId: number;
    location?: string;
    city?: string;
    ward?: {
      number: string;
      name: string;
    } | string;
  };
  slumProfile?: {
    totalArea?: number;
    population?: number;
    households?: number;
    density?: number;
  };
  infrastructure?: {
    waterSupply?: string;
    drainage?: string;
    electricity?: string;
    roads?: string;
    toilets?: string;
  };
  socioEconomicConditions?: {
    literacyRate?: string;
    employmentRate?: string;
    povertyLine?: string;
    majorOccupations?: string[];
  };
  surveyor?: {
    name: string;
    username: string;
  };
}

// ============================================
// SECTION-BASED COLUMN DEFINITIONS
// ============================================

// Household Survey Sections
const HOUSEHOLD_SURVEY_SECTIONS = [
  {
    id: 'survey_metadata',
    label: 'Survey Metadata',
    columns: [
      '_id', 'surveyStatus', 'submittedAt', 'submittedBy'
    ]
  },
  {
    id: 'general_information',
    label: 'General Information',
    columns: [
      'slumName', 'ward', 'houseDoorNo'
    ]
  },
  {
    id: 'household_details',
    label: 'Household Details',
    columns: [
      // Head info
      'headName', 'fatherName', 'sex', 'caste', 'religion', 'minorityStatus', 'femaleHeadStatus',
      // Family Members
      'familyMembersMale', 'familyMembersFemale', 'familyMembersTotal',
      // Illiterate Adults
      'illiterateAdultMale', 'illiterateAdultFemale', 'illiterateAdultTotal',
      // Children Not Attending School
      'childrenNotAttendingMale', 'childrenNotAttendingFemale', 'childrenNotAttendingTotal',
      // Handicapped Persons
      'handicappedPhysically', 'handicappedMentally', 'handicappedTotal',
      // Economic Status
      'femaleEarningStatus', 'belowPovertyLine', 'bplCard'
    ]
  },
  {
    id: 'housing_infrastructure',
    label: 'Housing & Infrastructure',
    columns: [
      // Housing
      'landTenureStatus', 'houseStructure', 'roofType', 'flooringType',
      'houseLighting', 'cookingFuel',
      // Water
      'waterSource', 'waterSupplyDuration', 'waterSourceDistance',
      // Sanitation
      'toiletFacility', 'bathroomFacility', 'roadFrontType'
    ]
  },
  {
    id: 'facilities',
    label: 'Education & Health',
    columns: [
      // Education
      'preschoolType', 'primarySchoolType', 'highSchoolType',
      // Health
      'healthFacilityType',
      // Welfare & Assets
      'welfareBenefits', 'consumerDurables', 'livestock'
    ]
  },
  {
    id: 'migration',
    label: 'Migration Details',
    columns: [
      'yearsInTown', 'migrated', 'migratedFrom', 'migrationType', 'migrationReasons'
    ]
  },
  {
    id: 'income_expenditure',
    label: 'Income & Expenditure',
    columns: [
      // Earning Adults
      'earningAdultMale', 'earningAdultFemale', 'earningAdultTotal',
      // Earning Non-Adults
      'earningNonAdultMale', 'earningNonAdultFemale', 'earningNonAdultTotal',
      // Income & Expenses
      'monthlyIncome', 'monthlyExpenditure', 'debtOutstanding',
      // Additional Info
      'notes'
    ]
  }
];

// Slum Survey Sections
const SLUM_SURVEY_SECTIONS = [
  {
    id: 'survey_metadata',
    label: 'Survey Metadata',
    columns: [
      'surveyId', 'slumName', 'submittedAt', 'submittedBy'
      // Excluded: slumId, location, city, wardNumber, wardName, zone (don't exist in model)
    ]
  },
  {
    id: 'general_information',
    label: 'SECTION 1: GENERAL INFORMATION - CITY/TOWN',
    columns: [
      'stateCode', 'stateName', 'districtCode', 'districtName',
      'ulbCode', 'ulbName', 'cityTownCode'
      // Excluded: cityTown (doesn't exist in model)
      , 'cityTownNoHouseholds'
    ]
  },
  {
    id: 'slum_profile',
    label: 'SECTION 2: CITY/TOWN SLUM PROFILE',
    columns: [
      'slumType', 'slumIdField', 'areaSqMtrs', 'slumPopulation',
      'noSlumHouseholds', 'bplPopulation', 'bplHouseholds'
    ]
  },
  {
    id: 'survey_operation',
    label: 'SECTION 3: PARTICULARS OF SURVEY OPERATION',
    columns: [
      'surveyorName', 'surveyDate'
    ]
  },
  {
    id: 'basic_information',
    label: 'SECTION 4: BASIC INFORMATION ON SLUM',
    columns: [
      'wardNumber', 'wardName', 'zoneNumber',
      'ageSlumYears', 'locationCoreOrFringe', 'typeAreaSurrounding', 'physicalLocationSlum'
      // Excluded: slumNameBasicInfo (doesn't exist in model)
    ]
  },
  {
    id: 'land_status',
    label: 'SECTION 5: LAND STATUS',
    columns: [
      'ownershipLandDetail', 'ownershipLandSpecify'
    ]
  },
  {
    id: 'demographic_profile',
    label: 'SECTION 6: DEMOGRAPHIC PROFILE',
    subSections: [
      {
        id: 'population_health',
        label: 'Population & Health Demographics',
        columns: [
          'popSC', 'popST', 'popOBC', 'popOthers', 'popTotal', 'popMinorities',
          'bplSC', 'bplST', 'bplOBC', 'bplOthers', 'bplTotal', 'bplMinorities',
          'hhSC', 'hhST', 'hhOBC', 'hhOthers', 'hhTotal', 'hhMinorities',
          'bplHhSC', 'bplHhST', 'bplHhOBC', 'bplHhOthers', 'bplHhTotal', 'bplHhMinorities',
          'whhSC', 'whhST', 'whhOBC', 'whhOthers', 'whhTotal', 'whhMinorities',
          'seniorSC', 'seniorST', 'seniorOBC', 'seniorOthers', 'seniorTotal', 'seniorMinorities',
          'childLabourSC', 'childLabourST', 'childLabourOBC', 'childLabourOthers', 'childLabourTotal', 'childLabourMinorities',
          'physicallyChallengedSC', 'physicallyChallengedST', 'physicallyChallengedOBC', 'physicallyChallengedOthers', 'physicallyChallengedTotal', 'physicallyChallengedMinorities',
          'mentallyChallengedSC', 'mentallyChallengedST', 'mentallyChallengedOBC', 'mentallyChallengedOthers', 'mentallyChallengedTotal', 'mentallyChallengedMinorities',
          'hivAidsSC', 'hivAidsST', 'hivAidsOBC', 'hivAidsOthers', 'hivAidsTotal', 'hivAidsMinorities',
          'tuberculosisSC', 'tuberculosisST', 'tuberculosisOBC', 'tuberculosisOthers', 'tuberculosisTotal', 'tuberculosisMinorities',
          'respiratorySC', 'respiratoryST', 'respiratoryOBC', 'respiratoryOthers', 'respiratoryTotal', 'respiratoryMinorities',
          'chronicSC', 'chronicST', 'chronicOBC', 'chronicOthers', 'chronicTotal', 'chronicMinorities'
        ]
      },
      {
        id: 'literacy_education',
        label: 'Literacy & Education',
        columns: [
          'illiterateTotal', 'illiterateSC', 'illiterateST', 'illiterateOBC', 'illiterateOthers', 'illiterateMinorities',
          'illiterateMale', 'illiterateMaleSC', 'illiterateMaleST', 'illiterateMaleOBC', 'illiterateMaleOthers', 'illiterateMaleMinorities',
          'illiterateFemale', 'illiterateFemaleSC', 'illiterateFemaleST', 'illiterateFemaleOBC', 'illiterateFemaleOthers', 'illiterateFemaleMinorities',
          'bplIlliterateTotal', 'bplIlliterateSC', 'bplIlliterateST', 'bplIlliterateOBC', 'bplIlliterateOthers', 'bplIlliterateMinorities',
          'schoolDropoutMale', 'schoolDropoutMaleSC', 'schoolDropoutMaleST', 'schoolDropoutMaleOBC', 'schoolDropoutMaleOthers', 'schoolDropoutMaleMinorities',
          'schoolDropoutFemale', 'schoolDropoutFemaleSC', 'schoolDropoutFemaleST', 'schoolDropoutFemaleOBC', 'schoolDropoutFemaleOthers', 'schoolDropoutFemaleMinorities'
        ]
      }
    ],
    // Flatten all columns for easy checking
    columns: []
  },
  {
    id: 'housing_status',
    label: 'SECTION 7: HOUSING STATUS',
    columns: [
      'dwellingPucca', 'dwellingSemiPucca', 'dwellingKatcha', 'dwellingTotal',
      'electricityPucca', 'electricitySemiPucca', 'electricityKatcha', 'electricityTotal',
      'landPatta', 'landPossession', 'landEncroachedPrivate', 'landEncroachedPublic',
      'landRented', 'landOther', 'landTotal'
    ]
  },
  {
    id: 'economic_status',
    label: 'SECTION 8: ECONOMIC STATUS OF HOUSEHOLDS',
    columns: [
      'incomeLessThan500', 'income500to1000', 'income1000to1500',
      'income1500to2000', 'income2000to3000', 'incomeMoreThan3000'
    ]
  },
  {
    id: 'employment_occupation',
    label: 'SECTION 9: EMPLOYMENT AND OCCUPATION STATUS',
    columns: [
      'selfEmployed', 'salaried', 'regularWage', 'casualLabour', 'employmentOthers'
    ]
  },
  {
    id: 'physical_infrastructure',
    label: 'SECTION 10: ACCESS TO PHYSICAL INFRASTRUCTURE',
    columns: [
      'waterPipelines', 'waterTaps', 'waterBorewells',
      'connectivityCityWater', 'drainageSewerage', 'connectivityStorm',
      'connectivitySewerage', 'proneToFlooding',
      // Flattened Latrine Facility sub-fields
      'latrineOwnSepticFlush', 'latrineOwnDry', 'latrineSharedSepticFlush', 'latrineSharedDry',
      'latrineCommunitySepticFlush', 'latrineCommunityDry', 'latrineOpenDefecation',
      'wasteFreq', 'wasteArrangement', 'drainsClearance',
      'approachRoadType', 'distanceMotorableRoad', 'internalRoadType', 'streetLightAvailable'
    ]
  },
  {
    id: 'education_facilities',
    label: 'SECTION 11: EDUCATION FACILITIES',
    columns: [
      'anganwadiOption', 'anganwadiDistance',
      'municipalPreschoolOption', 'municipalPreschoolDistance',
      'privatePreschoolOption', 'privatePreschoolDistance',
      'municipalPrimarySchoolOption', 'municipalPrimarySchoolDistance',
      'statePrimarySchoolOption', 'statePrimarySchoolDistance',
      'privatePrimarySchoolOption', 'privatePrimarySchoolDistance',
      'municipalHighSchoolOption', 'municipalHighSchoolDistance',
      'stateHighSchoolOption', 'stateHighSchoolDistance',
      'privateHighSchoolOption', 'privateHighSchoolDistance',
      'adultEducationOption', 'adultEducationDistance',
      'nonFormalEducationOption', 'nonFormalEducationDistance'
    ]
  },
  {
    id: 'health_facilities',
    label: 'SECTION 12: HEALTH FACILITIES',
    columns: [
      'urbanHealthPost', 'primaryHealthCentre', 'governmentHospital',
      'maternityCentre', 'privateClinic', 'rmp', 'ayurvedicDoctor'
    ]
  },
  {
    id: 'social_development',
    label: 'SECTION 13: SOCIAL DEVELOPMENT/WELFARE',
    columns: [
      'communityHall', 'livelihoodProductionCentre', 'vocationalTrainingCentre',
      'streetChildrenRehabilitationCentre', 'nightShelter', 'oldAgeHome',
      'oldAgePensionsHolders', 'widowPensionsHolders', 'disabledPensionsHolders',
      'generalInsuranceCovered', 'healthInsuranceCovered', 'selfHelpGroups',
      'thriftCreditSocieties', 'slumDwellersAssociation', 'youthAssociations', 'womensAssociations'
    ]
  },
  {
    id: 'additional_infrastructure',
    label: 'SECTION 14: ADDITIONAL INFRASTRUCTURE REQUIREMENTS',
    columns: [
      'waterPipelinesExisting', 'waterPipelinesAdditional', 'waterPipelinesCost',
      'waterTapsExisting', 'waterTapsAdditional', 'waterTapsCost',
      'waterBorewellsExisting', 'waterBorewellsAdditional', 'waterBorewellsCost',
      'stormwaterDrainageExisting', 'stormwaterDrainageAdditional', 'stormwaterDrainageCost',
      'sewerLinesExisting', 'sewerLinesAdditional', 'sewerLinesCost',
      'internalRoadsCCExisting', 'internalRoadsCCAdditional', 'internalRoadsCCCost',
      'streetLightPolesExisting', 'streetLightPolesAdditional', 'streetLightPolesCost',
      'individualToiletsExisting', 'individualToiletsAdditional', 'individualToiletsCost',
      'communityHallsExisting', 'communityHallsAdditional', 'communityHallsCost',
      'electricityExisting', 'electricityAdditional', 'electricityCost',
      'healthCareExisting', 'healthCareAdditional', 'healthCareCost'
    ]
  }
];

// Flatten demographic profile columns
const demographicProfileColumns: string[] = [];
SLUM_SURVEY_SECTIONS.find(s => s.id === 'demographic_profile')?.subSections?.forEach(sub => {
  demographicProfileColumns.push(...sub.columns);
});
const demoSection = SLUM_SURVEY_SECTIONS.find(s => s.id === 'demographic_profile');
if (demoSection) {
  demoSection.columns = demographicProfileColumns;
}

// Helper: Get all columns from sections
const getAllColumns = (sections: typeof SLUM_SURVEY_SECTIONS): string[] => {
  const columns: string[] = [];
  sections.forEach(section => {
    if (section.subSections) {
      section.subSections.forEach(sub => {
        columns.push(...sub.columns);
      });
    } else {
      columns.push(...section.columns);
    }
  });
  return columns;
};

const HOUSEHOLD_ALL_COLUMNS = getAllColumns(HOUSEHOLD_SURVEY_SECTIONS);
const SLUM_ALL_COLUMNS = getAllColumns(SLUM_SURVEY_SECTIONS);

// Column label mapping - Match Excel field labels exactly
const COLUMN_LABELS: Record<string, string> = {
  // Household Survey - Survey Metadata
  _id: 'Record ID',
  surveyStatus: 'Survey Status',
  submittedAt: 'Submitted At',
  submittedBy: 'Submitted By',
  
  // Household Survey - General Information
  slumName: 'Slum Name',
  ward: 'Location - Ward No/Name',
  houseDoorNo: 'House/Flat/Door No.',
  
  // Household Survey - Household Details
  headName: 'Head of Household Name',
  fatherName: "Father/Husband/Guardian's Name",
  sex: 'Sex',
  caste: 'Caste',
  religion: 'Religion',
  minorityStatus: 'Minority Status',
  femaleHeadStatus: 'Female Head Status',
  familyMembersMale: 'Number of Family Members (Male)',
  familyMembersFemale: 'Number of Family Members (Female)',
  familyMembersTotal: 'Number of Family Members (Total)',
  illiterateAdultMale: 'Illiterate Adult Male Members (>14 yrs)',
  illiterateAdultFemale: 'Illiterate Adult Female Members (>14 yrs)',
  illiterateAdultTotal: 'Illiterate Adult Total Members (>14 yrs)',
  childrenNotAttendingMale: 'Children Aged 6-14 Not Attending School (Male)',
  childrenNotAttendingFemale: 'Children Aged 6-14 Not Attending School (Female)',
  childrenNotAttendingTotal: 'Children Aged 6-14 Not Attending School (Total)',
  handicappedPhysically: 'Handicapped Persons (Physically)',
  handicappedMentally: 'Handicapped Persons (Mentally)',
  handicappedTotal: 'Handicapped Persons (Total)',
  femaleEarningStatus: 'Major Earning Female Member Status',
  belowPovertyLine: 'Family Below Poverty Line?',
  bplCard: 'Has BPL Card?',
  
  // Household Survey - Housing & Infrastructure
  landTenureStatus: 'Land Tenure Status',
  houseStructure: 'House Structure/Type',
  roofType: 'Roof Type',
  flooringType: 'Flooring Type',
  houseLighting: 'House Lighting',
  cookingFuel: 'Cooking Fuel',
  waterSource: 'Water Source',
  waterSupplyDuration: 'Water Supply Duration',
  waterSourceDistance: 'Water Source Distance',
  toiletFacility: 'Toilet Facility',
  bathroomFacility: 'Bathroom Facility',
  roadFrontType: 'Road Front Type',
  
  // Household Survey - Education & Health
  preschoolType: 'Pre-school Type',
  primarySchoolType: 'Primary School Type',
  highSchoolType: 'High School Type',
  healthFacilityType: 'Health Facility Type',
  welfareBenefits: 'Welfare Benefits',
  consumerDurables: 'Consumer Durables',
  livestock: 'Livestock',
  
  // Household Survey - Migration Details
  yearsInTown: 'No. of Years in Town',
  migrated: 'Migrated',
  migratedFrom: 'Migrated From',
  migrationType: 'Migration Type',
  migrationReasons: 'Migration Reasons',
  
  // Household Survey - Income & Expenditure
  earningAdultMale: 'Earning Adult Male',
  earningAdultFemale: 'Earning Adult Female',
  earningAdultTotal: 'Earning Adult Total',
  earningNonAdultMale: 'Earning Non-Adult Male',
  earningNonAdultFemale: 'Earning Non-Adult Female',
  earningNonAdultTotal: 'Earning Non-Adult Total',
  monthlyIncome: 'Monthly Income',
  monthlyExpenditure: 'Monthly Expenditure',
  debtOutstanding: 'Debt Outstanding',
  notes: 'Notes',
  
  // Slum Survey - Metadata (separate from household)
  slumSurveyId: 'Survey ID',
  slumSurveySubmittedAt: 'Submitted At',
  slumSurveySubmittedBy: 'Submitted By',
  
  // Section 1
  stateCode: 'State Code',
  stateName: 'State Name',
  districtCode: 'District Code',
  districtName: 'District Name',
  ulbCode: 'ULB Code',
  ulbName: 'ULB Name',
  cityTownCode: 'City/Town Code',
  cityTownNoHouseholds: 'City HH Count',
  
  // Section 2
  slumType: 'Slum Type',
  slumIdField: 'Slum ID Field',
  areaSqMtrs: 'Area (sq m)',
  slumPopulation: 'Population',
  noSlumHouseholds: 'HH Count',
  bplPopulation: 'BPL Population',
  bplHouseholds: 'BPL Households',
  
  // Section 3
  surveyorName: 'Surveyor Name (Op)',
  surveyDate: 'Survey Date',
  
  // Section 4 - FIXED: Use basicInformation paths
  wardNumber: 'Ward Number',
  wardName: 'Ward Name',
  zoneNumber: 'Zone Number',
  ageSlumYears: 'Age (Years)',
  locationCoreOrFringe: 'Location Type',
  typeAreaSurrounding: 'Surrounding Area',
  physicalLocationSlum: 'Physical Location',
  
  // Section 5
  ownershipLandDetail: 'Land Ownership',
  ownershipLandSpecify: 'Land Specify',
  
  // Section 6 - Population & Health
  popSC: 'Total Population - SC',
  popST: 'Total Population - ST',
  popOBC: 'Total Population - OBC',
  popOthers: 'Total Population - Others',
  popTotal: 'Total Population - Total',
  popMinorities: 'Total Population - Minorities',
  bplSC: 'BPL Population - SC',
  bplST: 'BPL Population - ST',
  bplOBC: 'BPL Population - OBC',
  bplOthers: 'BPL Population - Others',
  bplTotal: 'BPL Population - Total',
  bplMinorities: 'BPL Population - Minorities',
  hhSC: 'No. of Households - SC',
  hhST: 'No. of Households - ST',
  hhOBC: 'No. of Households - OBC',
  hhOthers: 'No. of Households - Others',
  hhTotal: 'No. of Households - Total',
  hhMinorities: 'No. of Households - Minorities',
  bplHhSC: 'BPL Households - SC',
  bplHhST: 'BPL Households - ST',
  bplHhOBC: 'BPL Households - OBC',
  bplHhOthers: 'BPL Households - Others',
  bplHhTotal: 'BPL Households - Total',
  bplHhMinorities: 'BPL Households - Minorities',
  whhSC: 'Women Headed Households - SC',
  whhST: 'Women Headed Households - ST',
  whhOBC: 'Women Headed Households - OBC',
  whhOthers: 'Women Headed Households - Others',
  whhTotal: 'Women Headed Households - Total',
  whhMinorities: 'Women Headed Households - Minorities',
  seniorSC: 'Senior Citizens - SC',
  seniorST: 'Senior Citizens - ST',
  seniorOBC: 'Senior Citizens - OBC',
  seniorOthers: 'Senior Citizens - Others',
  seniorTotal: 'Senior Citizens - Total',
  seniorMinorities: 'Senior Citizens - Minorities',
  childLabourSC: 'Child Labourers - SC',
  childLabourST: 'Child Labourers - ST',
  childLabourOBC: 'Child Labourers - OBC',
  childLabourOthers: 'Child Labourers - Others',
  childLabourTotal: 'Child Labourers - Total',
  childLabourMinorities: 'Child Labourers - Minorities',
  physicallyChallengedSC: 'Physically Challenged - SC',
  physicallyChallengedST: 'Physically Challenged - ST',
  physicallyChallengedOBC: 'Physically Challenged - OBC',
  physicallyChallengedOthers: 'Physically Challenged - Others',
  physicallyChallengedTotal: 'Physically Challenged - Total',
  physicallyChallengedMinorities: 'Physically Challenged - Minorities',
  mentallyChallengedSC: 'Mentally Challenged - SC',
  mentallyChallengedST: 'Mentally Challenged - ST',
  mentallyChallengedOBC: 'Mentally Challenged - OBC',
  mentallyChallengedOthers: 'Mentally Challenged - Others',
  mentallyChallengedTotal: 'Mentally Challenged - Total',
  mentallyChallengedMinorities: 'Mentally Challenged - Minorities',
  hivAidsSC: 'HIV/AIDS - SC',
  hivAidsST: 'HIV/AIDS - ST',
  hivAidsOBC: 'HIV/AIDS - OBC',
  hivAidsOthers: 'HIV/AIDS - Others',
  hivAidsTotal: 'HIV/AIDS - Total',
  hivAidsMinorities: 'HIV/AIDS - Minorities',
  tuberculosisSC: 'Tuberculosis - SC',
  tuberculosisST: 'Tuberculosis - ST',
  tuberculosisOBC: 'Tuberculosis - OBC',
  tuberculosisOthers: 'Tuberculosis - Others',
  tuberculosisTotal: 'Tuberculosis - Total',
  tuberculosisMinorities: 'Tuberculosis - Minorities',
  respiratorySC: 'Respiratory Diseases - SC',
  respiratoryST: 'Respiratory Diseases - ST',
  respiratoryOBC: 'Respiratory Diseases - OBC',
  respiratoryOthers: 'Respiratory Diseases - Others',
  respiratoryTotal: 'Respiratory Diseases - Total',
  respiratoryMinorities: 'Respiratory Diseases - Minorities',
  chronicSC: 'Chronic Diseases - SC',
  chronicST: 'Chronic Diseases - ST',
  chronicOBC: 'Chronic Diseases - OBC',
  chronicOthers: 'Chronic Diseases - Others',
  chronicTotal: 'Chronic Diseases - Total',
  chronicMinorities: 'Chronic Diseases - Minorities',
  
  // Section 6 - Literacy & Education
  illiterateTotal: 'Total Illiterate - Total',
  illiterateSC: 'Total Illiterate - SC',
  illiterateST: 'Total Illiterate - ST',
  illiterateOBC: 'Total Illiterate - OBC',
  illiterateOthers: 'Total Illiterate - Others',
  illiterateMinorities: 'Total Illiterate - Minorities',
  illiterateMale: 'Male Illiterate - Total',
  illiterateMaleSC: 'Male Illiterate - SC',
  illiterateMaleST: 'Male Illiterate - ST',
  illiterateMaleOBC: 'Male Illiterate - OBC',
  illiterateMaleOthers: 'Male Illiterate - Others',
  illiterateMaleMinorities: 'Male Illiterate - Minorities',
  illiterateFemale: 'Female Illiterate - Total',
  illiterateFemaleSC: 'Female Illiterate - SC',
  illiterateFemaleST: 'Female Illiterate - ST',
  illiterateFemaleOBC: 'Female Illiterate - OBC',
  illiterateFemaleOthers: 'Female Illiterate - Others',
  illiterateFemaleMinorities: 'Female Illiterate - Minorities',
  bplIlliterateTotal: 'BPL Illiterate - Total',
  bplIlliterateSC: 'BPL Illiterate - SC',
  bplIlliterateST: 'BPL Illiterate - ST',
  bplIlliterateOBC: 'BPL Illiterate - OBC',
  bplIlliterateOthers: 'BPL Illiterate - Others',
  bplIlliterateMinorities: 'BPL Illiterate - Minorities',
  schoolDropoutMale: 'School Dropout Male - Total',
  schoolDropoutMaleSC: 'School Dropout Male - SC',
  schoolDropoutMaleST: 'School Dropout Male - ST',
  schoolDropoutMaleOBC: 'School Dropout Male - OBC',
  schoolDropoutMaleOthers: 'School Dropout Male - Others',
  schoolDropoutMaleMinorities: 'School Dropout Male - Minorities',
  schoolDropoutFemale: 'School Dropout Female - Total',
  schoolDropoutFemaleSC: 'School Dropout Female - SC',
  schoolDropoutFemaleST: 'School Dropout Female - ST',
  schoolDropoutFemaleOBC: 'School Dropout Female - OBC',
  schoolDropoutFemaleOthers: 'School Dropout Female - Others',
  schoolDropoutFemaleMinorities: 'School Dropout Female - Minorities',
  
  // Section 7: Housing Status
  dwellingPucca: 'Dwelling Units - Pucca',
  dwellingSemiPucca: 'Dwelling Units - Semi-Pucca',
  dwellingKatcha: 'Dwelling Units - Katcha',
  dwellingTotal: 'Dwelling Units - Total',
  electricityPucca: 'Electricity Connection - Pucca',
  electricitySemiPucca: 'Electricity Connection - Semi-Pucca',
  electricityKatcha: 'Electricity Connection - Katcha',
  electricityTotal: 'Electricity Connection - Total',
  landPatta: 'Land Tenure - With Patta',
  landPossession: 'Land Tenure - Possession Certificate',
  landEncroachedPrivate: 'Land Tenure - Encroached Private',
  landEncroachedPublic: 'Land Tenure - Encroached Public',
  landRented: 'Land Tenure - On Rent',
  landOther: 'Land Tenure - Other',
  landTotal: 'Land Tenure - Total',
  
  // Section 8: Economic Status
  incomeLessThan500: 'Monthly Income < Rs.500',
  income500to1000: 'Monthly Income Rs.500-1000',
  income1000to1500: 'Monthly Income Rs.1000-1500',
  income1500to2000: 'Monthly Income Rs.1500-2000',
  income2000to3000: 'Monthly Income Rs.2000-3000',
  incomeMoreThan3000: 'Monthly Income > Rs.3000',
  
  // Section 9: Employment and Occupation
  selfEmployed: 'Self Employed',
  salaried: 'Salaried',
  regularWage: 'Regular Wage',
  casualLabour: 'Casual Labour',
  employmentOthers: 'Others',
  
  // Section 10: Physical Infrastructure
  waterPipelines: 'Water Supply - Pipelines',
  waterTaps: 'Water Supply - Individual Taps',
  waterBorewells: 'Water Supply - Borewells/Handpumps',
  connectivityCityWater: 'City Water Supply Connectivity',
  drainageSewerage: 'Drainage & Sewerage Facility',
  connectivityStorm: 'Storm Water Drainage Connectivity',
  connectivitySewerage: 'Sewerage System Connectivity',
  proneToFlooding: 'Flood Prone Area',
  // Latrine Facility - Flattened sub-fields with hardcoded labels
  latrineOwnSepticFlush: 'Latrine - Own Septic Tank Flush',
  latrineOwnDry: 'Latrine - Own Dry Latrine',
  latrineSharedSepticFlush: 'Latrine - Shared Septic Tank Flush',
  latrineSharedDry: 'Latrine - Shared Dry Latrine',
  latrineCommunitySepticFlush: 'Latrine - Community Septic Tank Flush',
  latrineCommunityDry: 'Latrine - Community Dry Latrine',
  latrineOpenDefecation: 'Latrine - Open Defecation',
  wasteFreq: 'Garbage Disposal Frequency',
  wasteArrangement: 'Garbage Disposal Arrangement',
  drainsClearance: 'Open Drains Clearance Frequency',
  approachRoadType: 'Approach Road Type',
  distanceMotorableRoad: 'Distance to Motorable Road (mtrs)',
  internalRoadType: 'Internal Road Type',
  streetLightAvailable: 'Street Lights Available',
  
  // Section 11: Education Facilities
  anganwadiOption: 'Anganwadi Center - Option',
  anganwadiDistance: 'Anganwadi Center - Distance (mtrs)',
  municipalPreschoolOption: 'Municipal Pre-School - Option',
  municipalPreschoolDistance: 'Municipal Pre-School - Distance (mtrs)',
  privatePreschoolOption: 'Private Pre-School - Option',
  privatePreschoolDistance: 'Private Pre-School - Distance (mtrs)',
  municipalPrimarySchoolOption: 'Municipal Primary School - Option',
  municipalPrimarySchoolDistance: 'Municipal Primary School - Distance (mtrs)',
  statePrimarySchoolOption: 'State Primary School - Option',
  statePrimarySchoolDistance: 'State Primary School - Distance (mtrs)',
  privatePrimarySchoolOption: 'Private Primary School - Option',
  privatePrimarySchoolDistance: 'Private Primary School - Distance (mtrs)',
  municipalHighSchoolOption: 'Municipal High School - Option',
  municipalHighSchoolDistance: 'Municipal High School - Distance (mtrs)',
  stateHighSchoolOption: 'State High School - Option',
  stateHighSchoolDistance: 'State High School - Distance (mtrs)',
  privateHighSchoolOption: 'Private High School - Option',
  privateHighSchoolDistance: 'Private High School - Distance (mtrs)',
  adultEducationOption: 'Adult Education Center - Option',
  adultEducationDistance: 'Adult Education Center - Distance (mtrs)',
  nonFormalEducationOption: 'Non-Formal Education - Option',
  nonFormalEducationDistance: 'Non-Formal Education - Distance (mtrs)',
  
  // Section 12: Health Facilities
  urbanHealthPost: 'Urban Health Post',
  primaryHealthCentre: 'Primary Health Centre',
  governmentHospital: 'Government Hospital',
  maternityCentre: 'Maternity Centre',
  privateClinic: 'Private Clinic',
  rmp: 'RMP (Rural Medical Practitioner)',
  ayurvedicDoctor: 'Ayurvedic Doctor',
  
  // Section 13: Social Development/Welfare
  communityHall: 'Community Hall',
  livelihoodProductionCentre: 'Livelihood Production Centre',
  vocationalTrainingCentre: 'Vocational Training Centre',
  streetChildrenRehabilitationCentre: 'Street Children Rehabilitation Centre',
  nightShelter: 'Night Shelter',
  oldAgeHome: 'Old Age Home',
  oldAgePensionsHolders: 'Old Age Pension Holders',
  widowPensionsHolders: 'Widow Pension Holders',
  disabledPensionsHolders: 'Disabled Pension Holders',
  generalInsuranceCovered: 'General Insurance Covered',
  healthInsuranceCovered: 'Health Insurance Covered',
  selfHelpGroups: 'Self Help Groups',
  thriftCreditSocieties: 'Thrift & Credit Societies',
  slumDwellersAssociation: 'Slum Dwellers Association',
  youthAssociations: 'Youth Associations',
  womensAssociations: "Women's Associations",
  
  // Section 14: Additional Infrastructure Requirements
  waterPipelinesExisting: 'Water Pipelines - Existing',
  waterPipelinesAdditional: 'Water Pipelines - Additional Required',
  waterPipelinesCost: 'Water Pipelines - Estimated Cost (Rs.)',
  waterTapsExisting: 'Individual Water Taps - Existing',
  waterTapsAdditional: 'Individual Water Taps - Additional Required',
  waterTapsCost: 'Individual Water Taps - Estimated Cost (Rs.)',
  waterBorewellsExisting: 'Borewells/Handpumps - Existing',
  waterBorewellsAdditional: 'Borewells/Handpumps - Additional Required',
  waterBorewellsCost: 'Borewells/Handpumps - Estimated Cost (Rs.)',
  stormwaterDrainageExisting: 'Storm Water Drainage - Existing',
  stormwaterDrainageAdditional: 'Storm Water Drainage - Additional Required',
  stormwaterDrainageCost: 'Storm Water Drainage - Estimated Cost (Rs.)',
  sewerLinesExisting: 'Sewer Lines - Existing',
  sewerLinesAdditional: 'Sewer Lines - Additional Required',
  sewerLinesCost: 'Sewer Lines - Estimated Cost (Rs.)',
  internalRoadsCCExisting: 'Internal Roads (CC) - Existing',
  internalRoadsCCAdditional: 'Internal Roads (CC) - Additional Required',
  internalRoadsCCCost: 'Internal Roads (CC) - Estimated Cost (Rs.)',
  streetLightPolesExisting: 'Street Light Poles - Existing',
  streetLightPolesAdditional: 'Street Light Poles - Additional Required',
  streetLightPolesCost: 'Street Light Poles - Estimated Cost (Rs.)',
  individualToiletsExisting: 'Individual Toilets - Existing',
  individualToiletsAdditional: 'Individual Toilets - Additional Required',
  individualToiletsCost: 'Individual Toilets - Estimated Cost (Rs.)',
  communityHallsExisting: 'Community Halls - Existing',
  communityHallsAdditional: 'Community Halls - Additional Required',
  communityHallsCost: 'Community Halls - Estimated Cost (Rs.)',
  electricityExisting: 'Electricity - Existing Coverage',
  electricityAdditional: 'Electricity - Additional Required',
  electricityCost: 'Electricity - Estimated Cost (Rs.)',
  healthCareExisting: 'Health Care Facility - Existing',
  healthCareAdditional: 'Health Care Facility - Additional Required',
  healthCareCost: 'Health Care Facility - Estimated Cost (Rs.)',
};

interface HouseholdSurveyData {
  slumName: string;
  doorNo: string;
  headName: string;
  surveyor: string;
  headNameField: string;
  fatherName: string;
  sex: string;
  caste: string;
  religion: string;
  minorityStatus: string;
  adultMale: number;
  adultFemale: number;
  adultTotal: number;
  illiterateMale: number;
  illiterateFemale: number;
  illiterateTotal: number;
  childrenMale: number;
  childrenFemale: number;
  childrenTotal: number;
  belowPovertyLine: string;
  hasBplCard: string;
  houseStructure: string;
  roofType: string;
  flooringType: string;
  lightingType: string;
  cookingFuel: string;
  waterSource: string;
  toiletFacility: string;
  yearsInCity: string;
  hasMigrated: string;
  migratedFrom: string;
  migrationType: string;
  reasonForMigration: string;
  adultEarningsMale: number;
  adultEarningsFemale: number;
  adultEarningsTotal: number;
  monthlyIncome: number;
  monthlyExpenditure: number;
  debtOutstanding: number;
  consumerDurables: string;
  livestock: string;
  surveyStatus: string;
  createdAt: string;
  submittedAt: string;
}

interface ApiResponseData {
  count?: number;
  data?: HouseholdSurveyData[];
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Report state
  const [selectedSlum, setSelectedSlum] = useState<Slum | null>(null);
  const [slums, setSlums] = useState<Slum[]>([]);
  const [slumSurvey, setSlumSurvey] = useState<SlumSurveyData | null>(null);
  const [householdSurveyCount, setHouseholdSurveyCount] = useState<number>(0);
  const [loadingSlumSurvey, setLoadingSlumSurvey] = useState(false);
  const [loadingHouseholdCount, setLoadingHouseholdCount] = useState(false);
  const [downloading, setDownloading] = useState<'slum-excel' | 'hh-excel' | null>(null);
  
  // Column selection state
  const [showSlumColumns, setShowSlumColumns] = useState(false);
  const [showHouseholdColumns, setShowHouseholdColumns] = useState(false);
  const [selectedSlumColumns, setSelectedSlumColumns] = useState<string[]>(SLUM_ALL_COLUMNS);
  const [selectedHouseholdColumns, setSelectedHouseholdColumns] = useState<string[]>(HOUSEHOLD_ALL_COLUMNS);
  
  // Temporary state for tracking changes while modal is open
  const [tempSlumColumns, setTempSlumColumns] = useState<string[]>(SLUM_ALL_COLUMNS);
  const [tempHouseholdColumns, setTempHouseholdColumns] = useState<string[]>(HOUSEHOLD_ALL_COLUMNS);
  
  // Section expansion state for column selection modal
  const [expandedSlumSections, setExpandedSlumSections] = useState<string[]>(['survey_metadata', 'general_information']);
  const [expandedHouseholdSections, setExpandedHouseholdSections] = useState<string[]>(['core_identification']);
  
  // Validation error state
  const [showSlumValidationError, setShowSlumValidationError] = useState(false);
  const [showHouseholdValidationError, setShowHouseholdValidationError] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper: Get section for a column key
  const getSlumSectionForColumn = (columnKey: string) => {
    return SLUM_SURVEY_SECTIONS.find(section => {
      if (section.subSections) {
        return section.subSections.some(sub => sub.columns.includes(columnKey));
      }
      return section.columns.includes(columnKey);
    });
  };

  const getHouseholdSectionForColumn = (columnKey: string) => {
    return HOUSEHOLD_SURVEY_SECTIONS.find(section => 
      section.columns.includes(columnKey)
    );
  };

  // Section expansion toggle
  const toggleSlumSection = (sectionId: string) => {
    setExpandedSlumSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleHouseholdSection = (sectionId: string) => {
    setExpandedHouseholdSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Column selection handlers
  const toggleSlumColumn = (columnKey: string) => {
    setTempSlumColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const toggleHouseholdColumn = (columnKey: string) => {
    setTempHouseholdColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  // Select/Deselect all columns in a section
  const toggleSlumSectionColumns = (section: typeof SLUM_SURVEY_SECTIONS[0], select: boolean) => {
    const columnsToToggle = section.subSections 
      ? section.subSections.flatMap(sub => sub.columns)
      : section.columns;
    
    setTempSlumColumns(prev => {
      if (select) {
        // Add all columns from this section
        const newColumns = [...prev];
        columnsToToggle.forEach(col => {
          if (!newColumns.includes(col)) {
            newColumns.push(col);
          }
        });
        return newColumns;
      } else {
        // Remove all columns from this section
        return prev.filter(col => !columnsToToggle.includes(col));
      }
    });
  };

  const toggleHouseholdSectionColumns = (section: typeof HOUSEHOLD_SURVEY_SECTIONS[0], select: boolean) => {
    const columnsToToggle = section.columns;
    
    setTempHouseholdColumns(prev => {
      if (select) {
        const newColumns = [...prev];
        columnsToToggle.forEach(col => {
          if (!newColumns.includes(col)) {
            newColumns.push(col);
          }
        });
        return newColumns;
      } else {
        return prev.filter(col => !columnsToToggle.includes(col));
      }
    });
  };

  const selectAllSlumColumns = () => {
    setTempSlumColumns(SLUM_ALL_COLUMNS);
  };

  const deselectAllSlumColumns = () => {
    setTempSlumColumns([]);
  };

  const selectAllHouseholdColumns = () => {
    setTempHouseholdColumns(HOUSEHOLD_ALL_COLUMNS);
  };

  const deselectAllHouseholdColumns = () => {
    setTempHouseholdColumns([]);
  };

  // Apply changes when Done is clicked
  const handleApplySlumColumns = () => {
    if (tempSlumColumns.length < 2) {
      setShowSlumValidationError(true);
      return;
    }
    setSelectedSlumColumns(tempSlumColumns);
    setShowSlumColumns(false);
  };

  const handleApplyHouseholdColumns = () => {
    if (tempHouseholdColumns.length < 2) {
      setShowHouseholdValidationError(true);
      return;
    }
    setSelectedHouseholdColumns(tempHouseholdColumns);
    setShowHouseholdColumns(false);
  };

  // Cancel - revert to saved state
  const handleCancelSlumColumns = () => {
    setTempSlumColumns(selectedSlumColumns); // Reset to saved state
    setShowSlumColumns(false);
  };

  const handleCancelHouseholdColumns = () => {
    setTempHouseholdColumns(selectedHouseholdColumns); // Reset to saved state
    setShowHouseholdColumns(false);
  };

  // Open modal - initialize temp state with current saved state
  const handleOpenSlumColumns = () => {
    setTempSlumColumns(selectedSlumColumns);
    setShowSlumColumns(true);
  };

  const handleOpenHouseholdColumns = () => {
    setTempHouseholdColumns(selectedHouseholdColumns);
    setShowHouseholdColumns(true);
  };

  // Helper function to get IST timestamp for file names
  const getISTTimestamp = (): string => {
    // Get current UTC time
    const now = new Date();
    
    // Convert to IST (UTC+5:30)
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (3600000 * 5.5));
    
    // Format: YYYY-MM-DD_HH-MM-SS
    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const day = String(istTime.getDate()).padStart(2, '0');
    const hours = String(istTime.getHours()).padStart(2, '0');
    const minutes = String(istTime.getMinutes()).padStart(2, '0');
    const seconds = String(istTime.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  };

  // Load all slums for dropdown
  const loadSlums = async () => {
    try {
      const response = await apiService.getAllSlums(1, 0, undefined, true);
      if (response.success && response.data) {
        setSlums(response.data as Slum[]);
      }
    } catch (error) {
      console.error('Failed to load slums:', error);
      showToast('Failed to load slums', 'error');
    }
  };

  // Load slum survey data
  const loadSlumSurveyData = async (slumId: string) => {
    setLoadingSlumSurvey(true);
    try {
      const response = await apiService.getSlumSurveyBySlumId(slumId);
      if (response.success && response.data) {
        setSlumSurvey(response.data as SlumSurveyData);
      } else {
        // No survey found - set to null to indicate "NOT STARTED"
        setSlumSurvey(null);
      }
    } catch (error) {
      console.error('Failed to load slum survey:', error);
      setSlumSurvey(null);
    } finally {
      setLoadingSlumSurvey(false);
    }
  };

  // Load household survey count
  const loadHouseholdSurveyCount = async (slumId: string) => {
    setLoadingHouseholdCount(true);
    try {
      const response = await apiService.getHouseholdSurveyCount(slumId);
      if (response.success && response.data) {
        const data = response.data as ApiResponseData;
        setHouseholdSurveyCount(data.count || 0);
      } else {
        setHouseholdSurveyCount(0);
      }
    } catch (error) {
      console.error('Failed to load household survey count:', error);
      setHouseholdSurveyCount(0);
    } finally {
      setLoadingHouseholdCount(false);
    }
  };

  // Handle slum selection change
  const handleSlumChange = (slumId: string) => {
    if (!slumId) {
      setSelectedSlum(null);
      setSlumSurvey(null);
      setHouseholdSurveyCount(0);
      return;
    }

    const slum = slums.find(s => s._id === slumId) || null;
    setSelectedSlum(slum);
    
    if (slum) {
      loadSlumSurveyData(slum._id);
      loadHouseholdSurveyCount(slum._id);
    }
  };

  // Download Slum Survey Excel
  const handleDownloadSlumExcel = async () => {
    if (!selectedSlum) return;
    
    // Validate column selection
    if (selectedSlumColumns.length < 2) {
      showToast('At least 2 columns must be selected to generate a report', 'error');
      return;
    }
    
    setDownloading('slum-excel');
    try {
      const columnsParam = selectedSlumColumns.length > 0 ? selectedSlumColumns.join(',') : '';
      const blob = await apiService.downloadSlumSurveyExcel(selectedSlum._id, columnsParam);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Slum_Survey_${selectedSlum.slumName.replace(/\s+/g, '_')}_${selectedSlum.slumId}_${getISTTimestamp()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Slum survey downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to download slum survey:', error);
      showToast('Failed to download slum survey', 'error');
    } finally {
      setDownloading(null);
    }
  };

  // Preview Slum Survey
  const [showSlumPreview, setShowSlumPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const handlePreviewSlum = async () => {
    if (!selectedSlum) return;
    
    if (selectedSlumColumns.length < 2) {
      showToast('At least 2 columns must be selected to generate a preview', 'error');
      return;
    }
    
    setLoadingPreview(true);
    try {
      // Get the survey data directly from API
      const response = await apiService.getSlumSurveyBySlumId(selectedSlum._id);
      
      if (response.success && response.data) {
        // Transform the survey data into preview format based on selected columns
        const survey = response.data;
        const transformedData = transformSlumSurveyToPreview(survey, selectedSlumColumns);
        setPreviewData([transformedData]);
        setShowSlumPreview(true);
      } else {
        showToast('Failed to load survey data', 'error');
      }
    } catch (error) {
      console.error('Failed to load preview:', error);
      showToast('Failed to load preview', 'error');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Helper function to transform slum survey data to preview format
  const transformSlumSurveyToPreview = (survey: any, columns: string[]) => {
    const data: any = {};
    
    SLUM_ALL_COLUMNS.forEach(key => {
      if (columns.includes(key)) {
        // Map column keys to actual data fields
        const value = getNestedValue(survey, key);
        data[key] = value !== null && value !== undefined ? value : '';
      }
    });
    
    return data;
  };

  // Helper function to get nested values from object
  const getNestedValue = (obj: any, path: string): any => {
    const mapping: { [key: string]: string } = {
      'surveyId': '_id',
      'slumName': 'slum.slumName',
      'submittedAt': 'submittedAt',
      'submittedBy': 'submittedBy.name',
      'stateCode': 'generalInformation.stateCode',
      'stateName': 'generalInformation.stateName',
      'districtCode': 'generalInformation.districtCode',
      'districtName': 'generalInformation.districtName',
      'ulbCode': 'generalInformation.ulbCode',
      'ulbName': 'generalInformation.ulbName',
      'cityTownCode': 'generalInformation.cityTownCode',
      'cityTownNoHouseholds': 'generalInformation.cityTownNoHouseholds',
      'slumType': 'cityTownSlumProfile.slumType',
      'slumIdField': 'cityTownSlumProfile.slumIdField',
      'areaSqMtrs': 'cityTownSlumProfile.areaSqMtrs',
      'slumPopulation': 'cityTownSlumProfile.slumPopulation',
      'noSlumHouseholds': 'cityTownSlumProfile.noSlumHouseholds',
      'bplPopulation': 'cityTownSlumProfile.bplPopulation',
      'bplHouseholds': 'cityTownSlumProfile.bplHouseholds',
      'surveyorName': 'surveyOperation.surveyorName',
      'surveyDate': 'surveyOperation.surveyDate',
      // Section 4 - FIXED: Use basicInformation paths instead of slum.ward
      'wardNumber': 'basicInformation.wardNumber',
      'wardName': 'basicInformation.wardName',
      'zoneNumber': 'basicInformation.zoneNumber',
      'ageSlumYears': 'basicInformation.ageSlumYears',
      'locationCoreOrFringe': 'basicInformation.locationCoreOrFringe',
      'typeAreaSurrounding': 'basicInformation.typeAreaSurrounding',
      'physicalLocationSlum': 'basicInformation.physicalLocationSlum',
      'ownershipLandDetail': 'landStatus.ownershipLandDetail',
      'ownershipLandSpecify': 'landStatus.ownershipLandSpecify',
      'popSC': 'demographicProfile.totalPopulation.SC',
      'popST': 'demographicProfile.totalPopulation.ST',
      'popOBC': 'demographicProfile.totalPopulation.OBC',
      'popOthers': 'demographicProfile.totalPopulation.Others',
      'popTotal': 'demographicProfile.totalPopulation.Total',
      'popMinorities': 'demographicProfile.totalPopulation.Minorities',
      'bplSC': 'demographicProfile.bplPopulation.SC',
      'bplST': 'demographicProfile.bplPopulation.ST',
      'bplOBC': 'demographicProfile.bplPopulation.OBC',
      'bplOthers': 'demographicProfile.bplPopulation.Others',
      'bplTotal': 'demographicProfile.bplPopulation.Total',
      'bplMinorities': 'demographicProfile.bplPopulation.Minorities',
      'hhSC': 'demographicProfile.numberOfHouseholds.SC',
      'hhST': 'demographicProfile.numberOfHouseholds.ST',
      'hhOBC': 'demographicProfile.numberOfHouseholds.OBC',
      'hhOthers': 'demographicProfile.numberOfHouseholds.Others',
      'hhTotal': 'demographicProfile.numberOfHouseholds.Total',
      'hhMinorities': 'demographicProfile.numberOfHouseholds.Minorities',
      'bplHhSC': 'demographicProfile.numberOfBplHouseholds.SC',
      'bplHhST': 'demographicProfile.numberOfBplHouseholds.ST',
      'bplHhOBC': 'demographicProfile.numberOfBplHouseholds.OBC',
      'bplHhOthers': 'demographicProfile.numberOfBplHouseholds.Others',
      'bplHhTotal': 'demographicProfile.numberOfBplHouseholds.Total',
      'bplHhMinorities': 'demographicProfile.numberOfBplHouseholds.Minorities',
      'whhSC': 'demographicProfile.womenHeadedHouseholds.SC',
      'whhST': 'demographicProfile.womenHeadedHouseholds.ST',
      'whhOBC': 'demographicProfile.womenHeadedHouseholds.OBC',
      'whhOthers': 'demographicProfile.womenHeadedHouseholds.Others',
      'whhTotal': 'demographicProfile.womenHeadedHouseholds.Total',
      'whhMinorities': 'demographicProfile.womenHeadedHouseholds.Minorities',
      'seniorSC': 'demographicProfile.personsOlderThan65Years.SC',
      'seniorST': 'demographicProfile.personsOlderThan65Years.ST',
      'seniorOBC': 'demographicProfile.personsOlderThan65Years.OBC',
      'seniorOthers': 'demographicProfile.personsOlderThan65Years.Others',
      'seniorTotal': 'demographicProfile.personsOlderThan65Years.Total',
      'seniorMinorities': 'demographicProfile.personsOlderThan65Years.Minorities',
      'childLabourSC': 'demographicProfile.childLabourers.SC',
      'childLabourST': 'demographicProfile.childLabourers.ST',
      'childLabourOBC': 'demographicProfile.childLabourers.OBC',
      'childLabourOthers': 'demographicProfile.childLabourers.Others',
      'childLabourTotal': 'demographicProfile.childLabourers.Total',
      'childLabourMinorities': 'demographicProfile.childLabourers.Minorities',
      'physicallyChallengedSC': 'demographicProfile.physicallyChallengedPersons.SC',
      'physicallyChallengedST': 'demographicProfile.physicallyChallengedPersons.ST',
      'physicallyChallengedOBC': 'demographicProfile.physicallyChallengedPersons.OBC',
      'physicallyChallengedOthers': 'demographicProfile.physicallyChallengedPersons.Others',
      'physicallyChallengedTotal': 'demographicProfile.physicallyChallengedPersons.Total',
      'physicallyChallengedMinorities': 'demographicProfile.physicallyChallengedPersons.Minorities',
      'mentallyChallengedSC': 'demographicProfile.mentallyChallengedPersons.SC',
      'mentallyChallengedST': 'demographicProfile.mentallyChallengedPersons.ST',
      'mentallyChallengedOBC': 'demographicProfile.mentallyChallengedPersons.OBC',
      'mentallyChallengedOthers': 'demographicProfile.mentallyChallengedPersons.Others',
      'mentallyChallengedTotal': 'demographicProfile.mentallyChallengedPersons.Total',
      'mentallyChallengedMinorities': 'demographicProfile.mentallyChallengedPersons.Minorities',
      'hivAidsSC': 'demographicProfile.personsWithHivAids.SC',
      'hivAidsST': 'demographicProfile.personsWithHivAids.ST',
      'hivAidsOBC': 'demographicProfile.personsWithHivAids.OBC',
      'hivAidsOthers': 'demographicProfile.personsWithHivAids.Others',
      'hivAidsTotal': 'demographicProfile.personsWithHivAids.Total',
      'hivAidsMinorities': 'demographicProfile.personsWithHivAids.Minorities',
      'tuberculosisSC': 'demographicProfile.personsWithTuberculosis.SC',
      'tuberculosisST': 'demographicProfile.personsWithTuberculosis.ST',
      'tuberculosisOBC': 'demographicProfile.personsWithTuberculosis.OBC',
      'tuberculosisOthers': 'demographicProfile.personsWithTuberculosis.Others',
      'tuberculosisTotal': 'demographicProfile.personsWithTuberculosis.Total',
      'tuberculosisMinorities': 'demographicProfile.personsWithTuberculosis.Minorities',
      'respiratorySC': 'demographicProfile.personsWithRespiratoryDiseases.SC',
      'respiratoryST': 'demographicProfile.personsWithRespiratoryDiseases.ST',
      'respiratoryOBC': 'demographicProfile.personsWithRespiratoryDiseases.OBC',
      'respiratoryOthers': 'demographicProfile.personsWithRespiratoryDiseases.Others',
      'respiratoryTotal': 'demographicProfile.personsWithRespiratoryDiseases.Total',
      'respiratoryMinorities': 'demographicProfile.personsWithRespiratoryDiseases.Minorities',
      'chronicSC': 'demographicProfile.personsWithOtherChronicDiseases.SC',
      'chronicST': 'demographicProfile.personsWithOtherChronicDiseases.ST',
      'chronicOBC': 'demographicProfile.personsWithOtherChronicDiseases.OBC',
      'chronicOthers': 'demographicProfile.personsWithOtherChronicDiseases.Others',
      'chronicTotal': 'demographicProfile.personsWithOtherChronicDiseases.Total',
      'chronicMinorities': 'demographicProfile.personsWithOtherChronicDiseases.Minorities',
      'schoolDropoutMale': 'demographicProfile.schoolDropoutsMale.Total',
      'schoolDropoutMaleSC': 'demographicProfile.schoolDropoutsMale.SC',
      'schoolDropoutMaleST': 'demographicProfile.schoolDropoutsMale.ST',
      'schoolDropoutMaleOBC': 'demographicProfile.schoolDropoutsMale.OBC',
      'schoolDropoutMaleOthers': 'demographicProfile.schoolDropoutsMale.Others',
      'schoolDropoutMaleMinorities': 'demographicProfile.schoolDropoutsMale.Minorities',
      'schoolDropoutFemale': 'demographicProfile.schoolDropoutsFemale.Total',
      'schoolDropoutFemaleSC': 'demographicProfile.schoolDropoutsFemale.SC',
      'schoolDropoutFemaleST': 'demographicProfile.schoolDropoutsFemale.ST',
      'schoolDropoutFemaleOBC': 'demographicProfile.schoolDropoutsFemale.OBC',
      'schoolDropoutFemaleOthers': 'demographicProfile.schoolDropoutsFemale.Others',
      'schoolDropoutFemaleMinorities': 'demographicProfile.schoolDropoutsFemale.Minorities',
      'childrenNSTotal': 'demographicProfile.childrenNotInSchoolTotal',
      // Illiterate persons - all fields with proper mappings
      'illiterateTotal': 'demographicProfile.totalIlliteratePerson.Total',
      'illiterateSC': 'demographicProfile.totalIlliteratePerson.SC',
      'illiterateST': 'demographicProfile.totalIlliteratePerson.ST',
      'illiterateOBC': 'demographicProfile.totalIlliteratePerson.OBC',
      'illiterateOthers': 'demographicProfile.totalIlliteratePerson.Others',
      'illiterateMinorities': 'demographicProfile.totalIlliteratePerson.Minorities',
      'illiterateMale': 'demographicProfile.maleIlliterate.Total',
      'illiterateMaleSC': 'demographicProfile.maleIlliterate.SC',
      'illiterateMaleST': 'demographicProfile.maleIlliterate.ST',
      'illiterateMaleOBC': 'demographicProfile.maleIlliterate.OBC',
      'illiterateMaleOthers': 'demographicProfile.maleIlliterate.Others',
      'illiterateMaleMinorities': 'demographicProfile.maleIlliterate.Minorities',
      'illiterateFemale': 'demographicProfile.femaleIlliterate.Total',
      'illiterateFemaleSC': 'demographicProfile.femaleIlliterate.SC',
      'illiterateFemaleST': 'demographicProfile.femaleIlliterate.ST',
      'illiterateFemaleOBC': 'demographicProfile.femaleIlliterate.OBC',
      'illiterateFemaleOthers': 'demographicProfile.femaleIlliterate.Others',
      'illiterateFemaleMinorities': 'demographicProfile.femaleIlliterate.Minorities',
      'bplIlliterateTotal': 'demographicProfile.bplIlliteratePerson.Total',
      'bplIlliterateSC': 'demographicProfile.bplIlliteratePerson.SC',
      'bplIlliterateST': 'demographicProfile.bplIlliteratePerson.ST',
      'bplIlliterateOBC': 'demographicProfile.bplIlliteratePerson.OBC',
      'bplIlliterateOthers': 'demographicProfile.bplIlliteratePerson.Others',
      'bplIlliterateMinorities': 'demographicProfile.bplIlliteratePerson.Minorities',
      'dwellingPucca': 'housingStatus.dwellingUnitsPucca',
      'dwellingSemiPucca': 'housingStatus.dwellingUnitsSemiPucca',
      'dwellingKatcha': 'housingStatus.dwellingUnitsKatcha',
      'dwellingTotal': 'housingStatus.dwellingUnitsTotal',
      'electricityPucca': 'housingStatus.dwellingUnitsWithElectricityPucca',
      'electricitySemiPucca': 'housingStatus.dwellingUnitsWithElectricitySemiPucca',
      'electricityKatcha': 'housingStatus.dwellingUnitsWithElectricityKatcha',
      'electricityTotal': 'housingStatus.dwellingUnitsWithElectricityTotal',
      'landPatta': 'housingStatus.landTenureWithPatta',
      'landPossession': 'housingStatus.landTenurePossessionCertificate',
      'landEncroachedPrivate': 'housingStatus.landTenureEncroachedPrivate',
      'landEncroachedPublic': 'housingStatus.landTenureEncroachedPublic',
      'landRented': 'housingStatus.landTenureOnRent',
      'landOther': 'housingStatus.landTenureOther',
      'landTotal': 'housingStatus.landTenureTotal',
      'incomeLessThan500': 'economicStatus.lessThan500',
      'income500to1000': 'economicStatus.rs500to1000',
      'income1000to1500': 'economicStatus.rs1000to1500',
      'income1500to2000': 'economicStatus.rs1500to2000',
      'income2000to3000': 'economicStatus.rs2000to3000',
      'incomeMoreThan3000': 'economicStatus.moreThan3000',
      'selfEmployed': 'employmentAndOccupation.selfEmployed',
      'salaried': 'employmentAndOccupation.salaried',
      'regularWage': 'employmentAndOccupation.regularWage',
      'casualLabour': 'employmentAndOccupation.casualLabour',
      'employmentOthers': 'employmentAndOccupation.others',
      'waterPipelines': 'physicalInfrastructure.sourceDrinkingWater.tankPond',
      'waterTaps': 'physicalInfrastructure.sourceDrinkingWater.individualTap',
      'waterBorewells': 'physicalInfrastructure.sourceDrinkingWater.tubewellBorewellHandpump',
      'connectivityCityWater': 'physicalInfrastructure.connectivityCityWaterSupply',
      'drainageSewerage': 'physicalInfrastructure.drainageSewerageFacility',
      'connectivityStorm': 'physicalInfrastructure.connectivityStormWaterDrainage',
      'connectivitySewerage': 'physicalInfrastructure.connectivitySewerageSystem',
      'proneToFlooding': 'physicalInfrastructure.proneToFlooding',
      // Flattened Latrine Facility sub-fields
      'latrineOwnSepticFlush': 'physicalInfrastructure.latrineFacility.ownSepticTankFlushLatrine',
      'latrineOwnDry': 'physicalInfrastructure.latrineFacility.ownDryLatrine',
      'latrineSharedSepticFlush': 'physicalInfrastructure.latrineFacility.sharedSepticTankFlushLatrine',
      'latrineSharedDry': 'physicalInfrastructure.latrineFacility.sharedDryLatrine',
      'latrineCommunitySepticFlush': 'physicalInfrastructure.latrineFacility.communitySepticTankFlushLatrine',
      'latrineCommunityDry': 'physicalInfrastructure.latrineFacility.communityDryLatrine',
      'latrineOpenDefecation': 'physicalInfrastructure.latrineFacility.openDefecation',
      'wasteFreq': 'physicalInfrastructure.solidWasteManagement.frequencyOfGarbageDisposal',
      'wasteArrangement': 'physicalInfrastructure.solidWasteManagement.arrangementForGarbageDisposal',
      'drainsClearance': 'physicalInfrastructure.solidWasteManagement.frequencyOfClearanceOfOpenDrains',
      'approachRoadType': 'physicalInfrastructure.approachRoadType',
      'distanceMotorableRoad': 'physicalInfrastructure.distanceToNearestMotorableRoad',
      'internalRoadType': 'physicalInfrastructure.internalRoadType',
      'streetLightAvailable': 'physicalInfrastructure.streetLightAvailable',
      'anganwadiOption': 'educationFacilities.anganwadiUnderIcds.option',
      'anganwadiDistance': 'educationFacilities.anganwadiUnderIcds.distance',
      'municipalPreschoolOption': 'educationFacilities.municipalPreschool.option',
      'municipalPreschoolDistance': 'educationFacilities.municipalPreschool.distance',
      'privatePreschoolOption': 'educationFacilities.privatePreschool.option',
      'privatePreschoolDistance': 'educationFacilities.privatePreschool.distance',
      'municipalPrimarySchoolOption': 'educationFacilities.municipalPrimarySchool.option',
      'municipalPrimarySchoolDistance': 'educationFacilities.municipalPrimarySchool.distance',
      'statePrimarySchoolOption': 'educationFacilities.stateGovtPrimarySchool.option',
      'statePrimarySchoolDistance': 'educationFacilities.stateGovtPrimarySchool.distance',
      'privatePrimarySchoolOption': 'educationFacilities.privatePrimarySchool.option',
      'privatePrimarySchoolDistance': 'educationFacilities.privatePrimarySchool.distance',
      'municipalHighSchoolOption': 'educationFacilities.municipalHighSchool.option',
      'municipalHighSchoolDistance': 'educationFacilities.municipalHighSchool.distance',
      'stateHighSchoolOption': 'educationFacilities.stateGovtHighSchool.option',
      'stateHighSchoolDistance': 'educationFacilities.stateGovtHighSchool.distance',
      'privateHighSchoolOption': 'educationFacilities.privateHighSchool.option',
      'privateHighSchoolDistance': 'educationFacilities.privateHighSchool.distance',
      'adultEducationOption': 'educationFacilities.adultEducationCentre.option',
      'adultEducationDistance': 'educationFacilities.adultEducationCentre.distance',
      'nonFormalEducationOption': 'educationFacilities.nonFormalEducationCentre.option',
      'nonFormalEducationDistance': 'educationFacilities.nonFormalEducationCentre.distance',
      'urbanHealthPost': 'healthFacilities.urbanHealthPost',
      'primaryHealthCentre': 'healthFacilities.primaryHealthCentre',
      'governmentHospital': 'healthFacilities.governmentHospital',
      'maternityCentre': 'healthFacilities.maternityCentre',
      'privateClinic': 'healthFacilities.privateClinic',
      'rmp': 'healthFacilities.rmp',
      'ayurvedicDoctor': 'healthFacilities.ayurvedicDoctor',
      'communityHall': 'socialDevelopment.communityHall',
      'livelihoodProductionCentre': 'socialDevelopment.livelihoodProductionCentre',
      'vocationalTrainingCentre': 'socialDevelopment.vocationalTrainingCentre',
      'streetChildrenRehabilitationCentre': 'socialDevelopment.streetChildrenRehabilitationCentre',
      'nightShelter': 'socialDevelopment.nightShelter',
      'oldAgeHome': 'socialDevelopment.oldAgeHome',
      'oldAgePensionsHolders': 'socialDevelopment.oldAgePensionsHolders',
      'widowPensionsHolders': 'socialDevelopment.widowPensionsHolders',
      'disabledPensionsHolders': 'socialDevelopment.disabledPensionsHolders',
      'generalInsuranceCovered': 'socialDevelopment.generalInsuranceCovered',
      'healthInsuranceCovered': 'socialDevelopment.healthInsuranceCovered',
      'selfHelpGroups': 'socialDevelopment.selfHelpGroups',
      'thriftCreditSocieties': 'socialDevelopment.thriftCreditSocieties',
      'slumDwellersAssociation': 'socialDevelopment.slumDwellersAssociation',
      'youthAssociations': 'socialDevelopment.youthAssociations',
      'womensAssociations': 'socialDevelopment.womensAssociations',
      'waterPipelinesExisting': 'additionalInfrastructure.waterSupply.pipelines.existing',
      'waterPipelinesAdditional': 'additionalInfrastructure.waterSupply.pipelines.additionalRequirement',
      'waterPipelinesCost': 'additionalInfrastructure.waterSupply.pipelines.estimatedCost',
      'waterTapsExisting': 'additionalInfrastructure.waterSupply.individualTaps.existing',
      'waterTapsAdditional': 'additionalInfrastructure.waterSupply.individualTaps.additionalRequirement',
      'waterTapsCost': 'additionalInfrastructure.waterSupply.individualTaps.estimatedCost',
      'waterBorewellsExisting': 'additionalInfrastructure.waterSupply.borewells.existing',
      'waterBorewellsAdditional': 'additionalInfrastructure.waterSupply.borewells.additionalRequirement',
      'waterBorewellsCost': 'additionalInfrastructure.waterSupply.borewells.estimatedCost',
      'stormwaterDrainageExisting': 'additionalInfrastructure.drainageSewerage.stormwaterDrainage.existing',
      'stormwaterDrainageAdditional': 'additionalInfrastructure.drainageSewerage.stormwaterDrainage.additionalRequirement',
      'stormwaterDrainageCost': 'additionalInfrastructure.drainageSewerage.stormwaterDrainage.estimatedCost',
      'sewerLinesExisting': 'additionalInfrastructure.drainageSewerage.sewerLines.existing',
      'sewerLinesAdditional': 'additionalInfrastructure.drainageSewerage.sewerLines.additionalRequirement',
      'sewerLinesCost': 'additionalInfrastructure.drainageSewerage.sewerLines.estimatedCost',
      'internalRoadsCCExisting': 'additionalInfrastructure.roads.internalRoadsCC.existing',
      'internalRoadsCCAdditional': 'additionalInfrastructure.roads.internalRoadsCC.additionalRequirement',
      'internalRoadsCCCost': 'additionalInfrastructure.roads.internalRoadsCC.estimatedCost',
      'streetLightPolesExisting': 'additionalInfrastructure.streetLighting.poles.existing',
      'streetLightPolesAdditional': 'additionalInfrastructure.streetLighting.poles.additionalRequirement',
      'streetLightPolesCost': 'additionalInfrastructure.streetLighting.poles.estimatedCost',
      'individualToiletsExisting': 'additionalInfrastructure.sanitation.individualToilets.existing',
      'individualToiletsAdditional': 'additionalInfrastructure.sanitation.individualToilets.additionalRequirement',
      'individualToiletsCost': 'additionalInfrastructure.sanitation.individualToilets.estimatedCost',
      'communityHallsExisting': 'additionalInfrastructure.communityFacilities.communityHalls.existing',
      'communityHallsAdditional': 'additionalInfrastructure.communityFacilities.communityHalls.additionalRequirement',
      'communityHallsCost': 'additionalInfrastructure.communityFacilities.communityHalls.estimatedCost',
      'electricityExisting': 'additionalInfrastructure.standaloneInfrastructureRequirements.electricity.existing',
      'electricityAdditional': 'additionalInfrastructure.standaloneInfrastructureRequirements.electricity.additionalRequirement',
      'electricityCost': 'additionalInfrastructure.standaloneInfrastructureRequirements.electricity.estimatedCost',
      'healthCareExisting': 'additionalInfrastructure.standaloneInfrastructureRequirements.healthCare.existing',
      'healthCareAdditional': 'additionalInfrastructure.standaloneInfrastructureRequirements.healthCare.additionalRequirement',
      'healthCareCost': 'additionalInfrastructure.standaloneInfrastructureRequirements.healthCare.estimatedCost'
    };
    
    const fieldPath = mapping[path] || path;
    const value = fieldPath.split('.').reduce((acc, part) => acc?.[part], obj);
    return value !== null && value !== undefined ? value : '';
  };

  // Download Household Survey Excel
  const handleDownloadHouseholdExcel = async () => {
    if (!selectedSlum) return;
    
    // Validate column selection
    if (selectedHouseholdColumns.length < 2) {
      showToast('At least 2 columns must be selected to generate a report', 'error');
      return;
    }
    
    setDownloading('hh-excel');
    try {
      const columnsParam = selectedHouseholdColumns.length > 0 ? selectedHouseholdColumns.join(',') : '';
      const blob = await apiService.exportHouseholdSurveys(selectedSlum._id, columnsParam);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Household_Surveys_${selectedSlum.slumName.replace(/\s+/g, '_')}_${selectedSlum.slumId}_${getISTTimestamp()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Household surveys downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to download household surveys:', error);
      showToast('Failed to download household surveys', 'error');
    } finally {
      setDownloading(null);
    }
  };

  // Preview Household Survey
  const [showHouseholdPreview, setShowHouseholdPreview] = useState(false);
  const [householdPreviewData, setHouseholdPreviewData] = useState<any[]>([]);
  const [loadingHouseholdPreview, setLoadingHouseholdPreview] = useState(false);

  const handlePreviewHousehold = async () => {
    if (!selectedSlum) return;
    
    if (selectedHouseholdColumns.length < 2) {
      showToast('At least 2 columns must be selected to generate a preview', 'error');
      return;
    }
    
    setLoadingHouseholdPreview(true);
    try {
      // Get household surveys from API
      const response = await apiService.getHouseholdSurveysBySlum(selectedSlum._id, 'SUBMITTED');
      
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        // Transform household survey data based on selected columns (max 3 samples)
        const surveys = response.data.slice(0, 3); // Limit to first 3 records
        const transformedData = surveys.map((survey: any) => 
          transformHouseholdSurveyToPreview(survey, selectedHouseholdColumns)
        );
        setHouseholdPreviewData(transformedData);
        setShowHouseholdPreview(true);
      } else {
        showToast('No household surveys found', 'error');
      }
    } catch (error) {
      console.error('Failed to load household preview:', error);
      showToast('Failed to load preview', 'error');
    } finally {
      setLoadingHouseholdPreview(false);
    }
  };

  // Helper function to transform household survey data to preview format
  const transformHouseholdSurveyToPreview = (survey: any, columns: string[]) => {
    const data: any = {};
    
    HOUSEHOLD_ALL_COLUMNS.forEach(key => {
      if (columns.includes(key)) {
        const value = getHouseholdNestedValue(survey, key);
        data[key] = value !== null && value !== undefined ? value : '';
      }
    });
    
    return data;
  };

  // Helper function to get nested values from household survey object
  const getHouseholdNestedValue = (obj: any, path: string): any => {
    const mapping: { [key: string]: string } = {
      'surveyId': '_id',
      'householdId': 'householdId',
      'slumName': 'slum.slumName',
      'doorNo': 'houseDoorNo',
      'parcelId': 'parcelId',
      'propertyNo': 'propertyNo',
      'source': 'source',
      'surveyor': 'surveyor.name',
      'ward': 'ward',
      'headName': 'headName',
      "father's Name": 'fatherName',
      'sex': 'sex',
      'caste': 'caste',
      'religion': 'religion',
      'minorityStatus': 'minorityStatus',
      'femaleHeadStatus': 'femaleHeadStatus',
      'maleMembers': 'familyMembersMale',
      'femaleMembers': 'familyMembersFemale',
      'totalMembers': 'familyMembersTotal',
      'illiterateMale': 'illiterateAdultMale',
      'illiterateFemale': 'illiterateAdultFemale',
      'illiterateTotal': 'illiterateAdultTotal',
      'childrenNSMale': 'childrenNotAttendingMale',
      'childrenNSFemale': 'childrenNotAttendingFemale',
      'childrenNSTotal': 'childrenNotAttendingTotal',
      'physicallyHandicapped': 'handicappedPhysically',
      'mentallyHandicapped': 'handicappedMentally',
      'handicappedTotal': 'handicappedTotal',
      'femaleEarningStatus': 'femaleEarningStatus',
      'belowPovertyLine': 'belowPovertyLine',
      'bplCard': 'bplCard',
      'landTenure': 'landTenureStatus',
      'houseStructure': 'houseStructure',
      'roofType': 'roofType',
      'flooringType': 'flooringType',
      'houseLighting': 'houseLighting',
      'cookingFuel': 'cookingFuel',
      'waterSource': 'waterSource',
      'waterSupplyDuration': 'waterSupplyDuration',
      'waterSourceDistance': 'waterSourceDistance',
      'toiletFacility': 'toiletFacility',
      'bathroomFacility': 'bathroomFacility',
      'roadType': 'roadFrontType',
      'preschoolType': 'preschoolType',
      'primarySchoolType': 'primarySchoolType',
      'highSchoolType': 'highSchoolType',
      'healthFacilityType': 'healthFacilityType',
      'welfareBenefits': 'welfareBenefits',
      'consumerDurables': 'consumerDurables',
      'livestock': 'livestock',
      'yearsInTown': 'yearsInTown',
      'migrated': 'migrated',
      'migratedFrom': 'migratedFrom',
      'migrationType': 'migrationType',
      'migrationReasons': 'migrationReasons',
      'earningMale': 'earningAdultMale',
      'earningFemale': 'earningAdultFemale',
      'earningTotal': 'earningAdultTotal',
      'earningNonAdultMale': 'earningNonAdultMale',
      'earningNonAdultFemale': 'earningNonAdultFemale',
      'earningNonAdultTotal': 'earningNonAdultTotal',
      'monthlyIncome': 'monthlyIncome',
      'monthlyExpenditure': 'monthlyExpenditure',
      'debtOutstanding': 'debtOutstanding',
      'notes': 'notes',
      'surveyStatus': 'surveyStatus',
      'submittedAt': 'submittedAt',
      'submittedBy': 'submittedBy.name'
    };
    
    const fieldPath = mapping[path] || path;
    const value = fieldPath.split('.').reduce((acc, part) => acc?.[part], obj);
    
    // Handle array fields
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    return value !== null && value !== undefined ? value : 'N/A';
  };



  useEffect(() => {
    // Verify user is admin
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData?.role !== "ADMIN") {
      router.push(`/${userData?.role?.toLowerCase()}/dashboard`);
      return;
    }

    // Use setTimeout to prevent synchronous state updates in effects
    const timer = setTimeout(() => {
      setUser(userData);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!loading && user) {
      loadSlums();
    }
  }, [loading, user]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading reports..." />;
  }

  return (
    <SupervisorAdminLayout
      role="ADMIN"
      username={user?.name || user?.username}
    >
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        </div>

        {/* Toast Notification - Inline */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white font-medium animate-pulse`}>
            {toast.message}
          </div>
        )}

        {/* Slum Selection Dropdown */}
        <Card>
          <InfiniteScrollSelect
            label="Select Slum"
            value={selectedSlum?._id || ''}
            onChange={handleSlumChange}
            options={slums.map(slum => ({
                value: slum._id,
                label: `${slum.slumName} (${slum.slumId})`
              }))
            }
            placeholder="Select a slum..."
            disabled={slums.length === 0}
          />
          {slums.length === 0 && (
            <p className="text-text-muted text-sm mt-2">No slums found in the system.</p>
          )}
        </Card>

        {/* Show sections only when slum is selected */}
        {selectedSlum && (
          <>
            {/* Slum Survey Section */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary flex items-center">
                  <span className="mr-2">🏙️</span>
                  Slum Survey
                </h2>
                <div className="flex items-center gap-2">
                  {(slumSurvey?.surveyStatus === 'COMPLETED' || slumSurvey?.surveyStatus === 'SUBMITTED') && (
                    <Button
                      onClick={handleOpenSlumColumns}
                      variant="secondary"
                      size="sm"
                      className="cursor-pointer text-sm"
                    >
                      📋 Select Columns ({selectedSlumColumns.length}/{SLUM_ALL_COLUMNS.length})
                    </Button>
                  )}
                  {loadingSlumSurvey && <LoadingSpinner size="sm" />}
                </div>
              </div>

              {/* Status Display */}
              <div className="mb-4">
                <p className="text-sm text-text-secondary mb-2">Status:</p>
                {slumSurvey?.surveyStatus === 'COMPLETED' || slumSurvey?.surveyStatus === 'SUBMITTED' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/50 text-green-300 border border-green-700">
                    ✓ Completed
                  </span>
                ) : slumSurvey?.surveyStatus === 'IN PROGRESS' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-900/50 text-amber-300 border border-amber-700">
                    ⏳ In Progress
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-900/50 text-red-300 border border-red-700">
                    ✗ Not Started
                  </span>
                )}
              </div>

              {/* Show Column Selector and Download Buttons only if COMPLETED/SUBMITTED */}
              {(slumSurvey?.surveyStatus === 'COMPLETED' || slumSurvey?.surveyStatus === 'SUBMITTED') && (
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={handlePreviewSlum}
                    disabled={loadingPreview}
                    variant="primary"
                    className="cursor-pointer"
                  >
                    {loadingPreview ? 'Loading...' : '👁️ Preview'}
                  </Button>
                  <Button
                    onClick={handleDownloadSlumExcel}
                    disabled={downloading === 'slum-excel'}
                    variant="success"
                    className="cursor-pointer"
                  >
                    {downloading === 'slum-excel' ? 'Downloading...' : '📊 Download Excel'}
                  </Button>
                </div>
              )}

              {/* Edge case: No slum survey yet */}
              {!slumSurvey && !loadingSlumSurvey && (
                <p className="text-text-muted text-sm">Slum survey not started.</p>
              )}
            </Card>

            {/* Household Survey Section */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary flex items-center">
                  <span className="mr-2">🏠</span>
                  Household Survey
                </h2>
                <div className="flex items-center gap-2">
                  {householdSurveyCount > 0 && (
                    <Button
                      onClick={handleOpenHouseholdColumns}
                      variant="secondary"
                      size="sm"
                      className="cursor-pointer text-sm"
                    >
                      📋 Select Columns ({selectedHouseholdColumns.length}/{HOUSEHOLD_ALL_COLUMNS.length})
                    </Button>
                  )}
                  {loadingHouseholdCount && <LoadingSpinner size="sm" />}
                </div>
              </div>

              {/* Count Display */}
              <div className="mb-4">
                <p className="text-sm text-text-secondary mb-2">Submitted Surveys:</p>
                <p className="text-2xl font-bold text-text-primary">
                  {householdSurveyCount}
                </p>
              </div>

              {/* Show Download Buttons only if at least 1 submitted HH survey */}
              {householdSurveyCount > 0 && (
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={handlePreviewHousehold}
                    disabled={loadingHouseholdPreview}
                    variant="primary"
                    className="cursor-pointer"
                  >
                    {loadingHouseholdPreview ? 'Loading...' : '👁️ Preview'}
                  </Button>
                  <Button
                    onClick={handleDownloadHouseholdExcel}
                    disabled={downloading === 'hh-excel'}
                    variant="success"
                    className="cursor-pointer"
                  >
                    {downloading === 'hh-excel' ? 'Downloading...' : '📊 Download Excel'}
                  </Button>
                </div>
              )}

              {/* Edge case: Zero surveys */}
              {householdSurveyCount === 0 && !loadingHouseholdCount && (
                <p className="text-text-muted text-sm mt-3">
                  No household surveys submitted for this slum yet.
                </p>
              )}
            </Card>
          </>
        )}

        {/* Preview Section */}
        {(showSlumPreview || showHouseholdPreview) && (
          <Card className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center">
                <span className="mr-2">👁️</span>
                Report Preview
              </h2>
              <Button
                onClick={() => {
                  setShowSlumPreview(false);
                  setShowHouseholdPreview(false);
                  setPreviewData([]);
                  setHouseholdPreviewData([]);
                }}
                variant="danger"
                size="sm"
                className="cursor-pointer"
              >
                ✕ Close Preview
              </Button>
            </div>

            {/* Slum Survey Preview */}
            {showSlumPreview && previewData.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold text-white mb-3">Slum Survey Data</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    {/* Multi-level headers */}
                    <thead>
                      {/* Row 1: Section Headers (Teal Blue) */}
                      <tr className="bg-teal-600">
                        {(() => {
                          const sectionCells = [];
                          let currentSection: string | null = null;
                          let colSpan = 0;
                          
                          for (let i = 0; i < selectedSlumColumns.length; i++) {
                            const columnKey = selectedSlumColumns[i];
                            const section = getSlumSectionForColumn(columnKey);
                            
                            if (section?.id !== currentSection) {
                              // Push previous section cell
                              if (currentSection !== null) {
                                sectionCells.push({ label: SLUM_SURVEY_SECTIONS.find(s => s.id === currentSection)?.label || '', span: colSpan });
                              }
                              currentSection = section?.id || null;
                              colSpan = 1;
                            } else {
                              colSpan++;
                            }
                            
                            // Handle last column
                            if (i === selectedSlumColumns.length - 1 && currentSection !== null) {
                              sectionCells.push({ label: SLUM_SURVEY_SECTIONS.find(s => s.id === currentSection)?.label || '', span: colSpan });
                            }
                          }
                          
                          return sectionCells.map((cell, idx) => (
                            <th 
                              key={idx} 
                              colSpan={cell.span}
                              rowSpan={cell.label !== 'SECTION 6: DEMOGRAPHIC PROFILE' ? 2 : 1}
                              className="px-3 py-2 text-center text-white font-bold border border-slate-600 bg-teal-600"
                              style={{ minWidth: `${cell.span * 120}px` }}
                            >
                              {cell.label}
                            </th>
                          ));
                        })()}
                      </tr>
                      
                      {/* Row 2: Subsection Headers (only for Demographic Profile - Medium Teal) */}
                      {(() => {
                        const hasDemographicProfile = selectedSlumColumns.some(col => {
                          const section = getSlumSectionForColumn(col);
                          return section?.id === 'demographic_profile';
                        });
                        
                        if (!hasDemographicProfile) return null;
                        
                        return (
                          <tr className="bg-blue-500">
                            {(() => {
                              const subSectionCells = [];
                              let currentSubSection: string | null = null;
                              let colSpan = 0;
                              let lastDemographicIndex = -1;
                              
                              // First pass: find the last demographic column index
                              for (let i = selectedSlumColumns.length - 1; i >= 0; i--) {
                                const section = getSlumSectionForColumn(selectedSlumColumns[i]);
                                if (section?.id === 'demographic_profile') {
                                  lastDemographicIndex = i;
                                  break;
                                }
                              }
                              
                              // Second pass: build subsection cells
                              for (let i = 0; i < selectedSlumColumns.length; i++) {
                                const columnKey = selectedSlumColumns[i];
                                const section = getSlumSectionForColumn(columnKey);
                                
                                // Only process columns in Demographic Profile
                                if (section?.id !== 'demographic_profile') continue;
                                
                                // Find subsection for this column
                                let subSectionLabel: string | null = null;
                                
                                if (section?.subSections) {
                                  section.subSections.forEach(sub => {
                                    if (sub.columns.includes(columnKey)) {
                                      subSectionLabel = sub.label;
                                    }
                                  });
                                }
                                
                                // Start new subsection group OR initialize first one
                                if (currentSubSection === null) {
                                  currentSubSection = subSectionLabel;
                                  colSpan = 1;
                                } else if (subSectionLabel !== currentSubSection) {
                                  // Subsection changed - push previous and start new
                                  subSectionCells.push({ label: currentSubSection, span: colSpan });
                                  currentSubSection = subSectionLabel;
                                  colSpan = 1;
                                } else {
                                  // Same subsection - increment span
                                  colSpan++;
                                }
                                
                                // Check if this is the LAST demographic column - ALWAYS push
                                if (i === lastDemographicIndex) {
                                  if (currentSubSection !== null) {
                                    subSectionCells.push({ label: currentSubSection, span: colSpan });
                                  }
                                  break;
                                }
                              }
                              
                              // Render all subsection cells
                              return subSectionCells.map((cell, idx) => (
                                <th 
                                  key={idx} 
                                  colSpan={cell.span}
                                  className="px-3 py-2 text-center text-white font-bold italic border border-slate-600 bg-blue-500"
                                >
                                  {cell.label || '\u00A0'}
                                </th>
                              ));
                            })()}
                          </tr>
                        );
                      })()}
                      
                      {/* Row 3: Column Labels (Very Light Blue with dark text for contrast) */}
                      <tr className="bg-cyan-50">
                        {selectedSlumColumns.map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-gray-800 font-semibold border border-slate-600 bg-cyan-50" style={{ textAlign: 'left', verticalAlign: 'middle' }}>
                            {COLUMN_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Data row */}
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="border-t border-slate-700 hover:bg-slate-800">
                          {selectedSlumColumns.map((key) => (
                            <td key={key} className="px-4 py-2 text-slate-300 border border-slate-700">
                              {row[key] === null || row[key] === undefined ? '' : String(row[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Household Survey Preview */}
            {showHouseholdPreview && householdPreviewData.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-white">Household Survey Data</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    {/* Multi-level headers */}
                    <thead>
                      {/* Row 1: Section Headers (Teal Blue - merged vertically with Row 2) */}
                      <tr className="bg-teal-600">
                        {(() => {
                          const sectionCells = [];
                          let currentSection: string | null = null;
                          let colSpan = 0;
                          
                          for (let i = 0; i < selectedHouseholdColumns.length; i++) {
                            const columnKey = selectedHouseholdColumns[i];
                            const section = getHouseholdSectionForColumn(columnKey);
                            
                            if (section?.id !== currentSection) {
                              if (currentSection !== null) {
                                sectionCells.push({ label: HOUSEHOLD_SURVEY_SECTIONS.find(s => s.id === currentSection)?.label || '', span: colSpan });
                              }
                              currentSection = section?.id || null;
                              colSpan = 1;
                            } else {
                              colSpan++;
                            }
                            
                            // Handle last column
                            if (i === selectedHouseholdColumns.length - 1 && currentSection !== null) {
                              sectionCells.push({ label: HOUSEHOLD_SURVEY_SECTIONS.find(s => s.id === currentSection)?.label || '', span: colSpan });
                            }
                          }
                          
                          return sectionCells.map((cell, idx) => (
                            <th 
                              key={idx} 
                              colSpan={cell.span}
                              // Section headers only span horizontally, not vertically
                              className="px-3 py-2 text-center text-white font-bold border border-slate-600 bg-teal-600"
                              style={{ minWidth: `${cell.span * 120}px` }}
                            >
                              {cell.label}
                            </th>
                          ));
                        })()}
                      </tr>
                      
                      {/* Row 2: Column Labels (Very Light Blue with contrasting text) */}
                      <tr className="bg-cyan-100">
                        {selectedHouseholdColumns.map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-gray-900 font-semibold border border-slate-600 bg-cyan-100" style={{ textAlign: 'left', verticalAlign: 'middle' }}>
                            {COLUMN_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Data row */}
                      {householdPreviewData.map((row, idx) => (
                        <tr key={idx} className="border-t border-slate-700 hover:bg-slate-800">
                          {selectedHouseholdColumns.map((key) => (
                            <td key={key} className="px-4 py-2 text-slate-300 border border-slate-700">
                              {row[key] === null || row[key] === undefined ? '' : String(row[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!previewData.length && !householdPreviewData.length) && (
              <p className="text-slate-400 text-center py-8">No preview data available</p>
            )}
          </Card>
        )}
        
        {/* Slum Survey Column Selection Modal */}
        {showSlumColumns && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Select Columns - Slum Survey Report</h3>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={selectAllSlumColumns} variant="success" size="sm" className="cursor-pointer">
                    Select All
                  </Button>
                  <Button onClick={deselectAllSlumColumns} variant="danger" size="sm" className="cursor-pointer">
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                {SLUM_SURVEY_SECTIONS.map(section => (
                  <div key={section.id} className="border border-slate-700 rounded">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSlumSection(section.id)}
                      className="w-full flex justify-between items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      <span className="font-semibold text-white">{section.label}</span>
                      <span className="text-white">{expandedSlumSections.includes(section.id) ? '▼' : '▶'}</span>
                    </button>
                    
                    {/* Expanded Section Content */}
                    {expandedSlumSections.includes(section.id) && (
                      <div className="p-4">
                        {/* Section-level Select/Deselect */}
                        <div className="mb-2 flex gap-2">
                          <button
                            onClick={() => toggleSlumSectionColumns(section, true)}
                            className="text-xs text-green-400 hover:text-green-300"
                          >
                            Select All in Section
                          </button>
                          <button
                            onClick={() => toggleSlumSectionColumns(section, false)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Deselect All in Section
                          </button>
                        </div>
                        
                        {/* Subsections if available */}
                        {section.subSections ? (
                          section.subSections.map(subSection => (
                            <div key={subSection.id} className="mb-3 ml-2">
                              <h4 className="text-sm font-medium text-slate-300 mb-2 italic">{subSection.label}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {subSection.columns.map(columnKey => (
                                  <label key={columnKey} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-slate-700 rounded">
                                    <input
                                      type="checkbox"
                                      checked={tempSlumColumns.includes(columnKey)}
                                      onChange={() => toggleSlumColumn(columnKey)}
                                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-300">{COLUMN_LABELS[columnKey] || columnKey}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          /* Regular columns */
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {section.columns.map(columnKey => (
                              <label key={columnKey} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-slate-700 rounded">
                                <input
                                  type="checkbox"
                                  checked={tempSlumColumns.includes(columnKey)}
                                  onChange={() => toggleSlumColumn(columnKey)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-sm text-slate-300">{COLUMN_LABELS[columnKey] || columnKey}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                <Button onClick={handleCancelSlumColumns} variant="danger" className="cursor-pointer">
                  Cancel
                </Button>
                <Button onClick={handleApplySlumColumns} className="cursor-pointer">
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Household Survey Column Selection Modal */}
        {showHouseholdColumns && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Select Columns - Household Survey Report</h3>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={selectAllHouseholdColumns} variant="success" size="sm" className="cursor-pointer">
                    Select All
                  </Button>
                  <Button onClick={deselectAllHouseholdColumns} variant="danger" size="sm" className="cursor-pointer">
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                {HOUSEHOLD_SURVEY_SECTIONS.map(section => (
                  <div key={section.id} className="border border-slate-700 rounded">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleHouseholdSection(section.id)}
                      className="w-full flex justify-between items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      <span className="font-semibold text-white">{section.label}</span>
                      <span className="text-white">{expandedHouseholdSections.includes(section.id) ? '▼' : '▶'}</span>
                    </button>
                    
                    {/* Expanded Section Content */}
                    {expandedHouseholdSections.includes(section.id) && (
                      <div className="p-4">
                        {/* Section-level Select/Deselect */}
                        <div className="mb-2 flex gap-2">
                          <button
                            onClick={() => toggleHouseholdSectionColumns(section, true)}
                            className="text-xs text-green-400 hover:text-green-300"
                          >
                            Select All in Section
                          </button>
                          <button
                            onClick={() => toggleHouseholdSectionColumns(section, false)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Deselect All in Section
                          </button>
                        </div>
                        
                        {/* Regular columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {section.columns.map(columnKey => (
                            <label key={columnKey} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-slate-700 rounded">
                              <input
                                type="checkbox"
                                checked={tempHouseholdColumns.includes(columnKey)}
                                onChange={() => toggleHouseholdColumn(columnKey)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-sm text-slate-300">{COLUMN_LABELS[columnKey] || columnKey}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                <Button onClick={handleCancelHouseholdColumns} variant="danger" className="cursor-pointer">
                  Cancel
                </Button>
                <Button onClick={handleApplyHouseholdColumns} className="cursor-pointer">
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Slum Survey Validation Error Modal */}
        {showSlumValidationError && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg max-w-md w-full border border-slate-700">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Validation Required</h3>
                </div>
                
                <p className="text-slate-300 mb-6">
                  At least <span className="text-white font-semibold">2 columns</span> must be selected to generate a report. Please select more columns to continue.
                </p>
                
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowSlumValidationError(false)}
                    variant="secondary"
                    className="cursor-pointer"
                  >
                    OK, I'll Select More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Household Survey Validation Error Modal */}
        {showHouseholdValidationError && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg max-w-md w-full border border-slate-700">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Validation Required</h3>
                </div>
                
                <p className="text-slate-300 mb-6">
                  At least <span className="text-white font-semibold">2 columns</span> must be selected to generate a report. Please select more columns to continue.
                </p>
                
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowHouseholdValidationError(false)}
                    variant="secondary"
                    className="cursor-pointer"
                  >
                    OK, I'll Select More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SupervisorAdminLayout>
  );
}
