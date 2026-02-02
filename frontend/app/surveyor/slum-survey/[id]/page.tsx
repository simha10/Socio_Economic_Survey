"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import SurveyorLayout from "@/components/SurveyorLayout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Checkbox from '@/components/Checkbox';
import Stepper from '@/components/Stepper';
import BackNavigationDialog from '@/components/BackNavigationDialog';
import EditConfirmationDialog from '@/components/EditConfirmationDialog';
import apiService from '@/services/api';
import { useToast } from '@/components/Toast';

interface SlumSurveyForm {
  slumId: string;
  surveyed: boolean;
  completionPercentage?: number;
  
  // PART-A: I. GENERAL INFORMATION -CITY/TOWN
  stateCode?: string; // 1(a)
  stateName?: string; // 1(b)
  districtCode?: string; // 2(a)
  districtName?: string; // 2(b)
  cityTownCode?: string; // 3(a)
  cityTownName?: string; // 3(b)
  cityTown?: string; // 4(a)
  cityTownNoHouseholds?: number; // 4(b)
  
  // PART-B: II. CITY/TOWN SLUM PROFILE
  slumType?: string; // 5 - Notified / Non-Notified / New Identified
  slumIdField?: string; // 6 - Slum ID
  slumName?: string; // 7 - Slum Name
  ownershipLand?: string; // 8 - Local Body -01, State Government - 02, Central Government – 03, Private -04, Other - 05
  areaSqMtrs?: number; // 9 - Area in sq Mtrs
  slumPopulation?: number; // 10 - Slum population
  noSlumHouseholds?: number; // 11 - No. of slum House Holds
  bplPopulation?: number; // 12 - BPL(Below Poverty Line) population
  noBplHouseholdsCityTown?: number; // 13 - No. of BPL House Holds
  
  // PART-C: III. PARTICULARS OF SURVEY OPERATION
  surveyorName?: string; // 7 - Name
  surveyDate?: string; // 8(a) - Date(s) of Survey
  receiptQuestionnaireDate?: string; // 8(b) - Date(s) of Receipt of Questionnaire
  scrutinyDate?: string; // 8(c) - Date(s) of Scrutiny
  receiptByNodalCellDate?: string; // 8(d) - Date(s) of Receipt by Nodal Cell in Urban Local Body
  remarksInvestigator?: string; // 10 - Remarks by Investigator/Surveyor
  commentsSupervisor?: string; // 11 - Comments by the Supervisor
  
  // PART-D: I. BASIC INFORMATION ON SLUM
  slumNameBasicInfo?: string; // 1 - Name of Slum
  slumCode?: string; // 1a - Slum Code
  locationWard?: string; // 2 - Location - Ward No/Name
  ageSlumYears?: number; // 3 - Age of Slum in Years
  areaSlumSqMtrs?: number; // 4 - Area of Slum (Sq. metres)
  locationCoreOrFringe?: string; // 5 - Whether located in Core City/Town or Fringe area (Core City/Town - 01, Fringe Area -02)
  typeAreaSurrounding?: string; // 6 - Type of Area surrounding Slum (Residential - 01, Industrial - 02, Commercial - 03, Institutional-04, Other-49)
  physicalLocationSlum?: string; // 7 - Physical Location of Slum (Along Nallah -01, Along Other Drains - 02, etc.)
  isSlumNotified?: string; // 8 - Is the Slum Notified/Declared? (Yes-01, No-02)
  yearOfNotification?: number; // 9 - If Yes (01) in 8, state Year of Notification
  
  // PART-E: II. LAND STATUS
  ownershipLandDetail?: string; // 10 - Ownership of Land where Slum is located (Public: Local Body -01, State Government - 02, etc.)
  ownershipLandSpecify?: string; // 11 - Please specify Ownership of Land (To whom land belongs)
  
  // PART-F: III. DEMOGRAPHIC PROFILE
  // 12. Population & Health: 
  totalPopulationSlum?: number;
  totalPopulationSlumSC?: number;
  totalPopulationSlumST?: number;
  totalPopulationSlumOBC?: number;
  totalPopulationSlumOthers?: number;
  totalPopulationSlumTotal?: number;
  totalPopulationSlumMinorities?: number;
  
  bplPopulationSlum?: number;
  bplPopulationSlumSC?: number;
  bplPopulationSlumST?: number;
  bplPopulationSlumOBC?: number;
  bplPopulationSlumOthers?: number;
  bplPopulationSlumTotal?: number;
  bplPopulationSlumMinorities?: number;
  
  noHouseholdsSlum?: number;
  noHouseholdsSlumSC?: number;
  noHouseholdsSlumST?: number;
  noHouseholdsSlumOBC?: number;
  noHouseholdsSlumOthers?: number;
  noHouseholdsSlumTotal?: number;
  noHouseholdsSlumMinorities?: number;
  
  noBplHouseholdsSlum?: number;
  noBplHouseholdsSC?: number;
  noBplHouseholdsST?: number;
  noBplHouseholdsOBC?: number;
  noBplHouseholdsOthers?: number;
  noBplHouseholdsTotal?: number;
  noBplHouseholdsMinorities?: number;
  
  noWomenHeadedHouseholds?: number;
  noWomenHeadedHouseholdsSC?: number;
  noWomenHeadedHouseholdsST?: number;
  noWomenHeadedHouseholdsOBC?: number;
  noWomenHeadedHouseholdsOthers?: number;
  noWomenHeadedHouseholdsTotal?: number;
  noWomenHeadedHouseholdsMinorities?: number;
  
  noPersonsOlder65?: number;
  noPersonsOlder65SC?: number;
  noPersonsOlder65ST?: number;
  noPersonsOlder65OBC?: number;
  noPersonsOlder65Others?: number;
  noPersonsOlder65Total?: number;
  noPersonsOlder65Minorities?: number;
  
  noChildLabourers?: number;
  noChildLabourersSC?: number;
  noChildLabourersST?: number;
  noChildLabourersOBC?: number;
  noChildLabourersOthers?: number;
  noChildLabourersTotal?: number;
  noChildLabourersMinorities?: number;
  
  noPhysicallyChallenged?: number;
  noPhysicallyChallengedSC?: number;
  noPhysicallyChallengedST?: number;
  noPhysicallyChallengedOBC?: number;
  noPhysicallyChallengedOthers?: number;
  noPhysicallyChallengedTotal?: number;
  noPhysicallyChallengedMinorities?: number;
  
  noMentallyChallenged?: number;
  noMentallyChallengedSC?: number;
  noMentallyChallengedST?: number;
  noMentallyChallengedOBC?: number;
  noMentallyChallengedOthers?: number;
  noMentallyChallengedTotal?: number;
  noMentallyChallengedMinorities?: number;
  
  noPersonsHivaids?: number;
  noPersonsHivaidsSC?: number;
  noPersonsHivaidsST?: number;
  noPersonsHivaidsOBC?: number;
  noPersonsHivaidsOthers?: number;
  noPersonsHivaidsTotal?: number;
  noPersonsHivaidsMinorities?: number;
  
  noPersonsTuberculosis?: number;
  noPersonsTuberculosisSC?: number;
  noPersonsTuberculosisST?: number;
  noPersonsTuberculosisOBC?: number;
  noPersonsTuberculosisOthers?: number;
  noPersonsTuberculosisTotal?: number;
  noPersonsTuberculosisMinorities?: number;
  
  noPersonsRespiratory?: number;
  noPersonsRespiratorySC?: number;
  noPersonsRespiratoryST?: number;
  noPersonsRespiratoryOBC?: number;
  noPersonsRespiratoryOthers?: number;
  noPersonsRespiratoryTotal?: number;
  noPersonsRespiratoryMinorities?: number;
  
  noPersonsOtherChronic?: number;
  noPersonsOtherChronicSC?: number;
  noPersonsOtherChronicST?: number;
  noPersonsOtherChronicOBC?: number;
  noPersonsOtherChronicOthers?: number;
  noPersonsOtherChronicTotal?: number;
  noPersonsOtherChronicMinorities?: number;
  
  // 13. Literacy - Education
  totalIlliteratePersons?: number;
  totalIlliteratePersonsSC?: number;
  totalIlliteratePersonsST?: number;
  totalIlliteratePersonsOBC?: number;
  totalIlliteratePersonsOthers?: number;
  totalIlliteratePersonsTotal?: number;
  totalIlliteratePersonsMinorities?: number;
  
  noMaleIlliterate?: number;
  noMaleIlliterateSC?: number;
  noMaleIlliterateST?: number;
  noMaleIlliterateOBC?: number;
  noMaleIlliterateOthers?: number;
  noMaleIlliterateTotal?: number;
  noMaleIlliterateMinorities?: number;
  
  noFemaleIlliterate?: number;
  noFemaleIlliterateSC?: number;
  noFemaleIlliterateST?: number;
  noFemaleIlliterateOBC?: number;
  noFemaleIlliterateOthers?: number;
  noFemaleIlliterateTotal?: number;
  noFemaleIlliterateMinorities?: number;
  
  noBplIlliteratePersons?: number;
  noBplIlliteratePersonsSC?: number;
  noBplIlliteratePersonsST?: number;
  noBplIlliteratePersonsOBC?: number;
  noBplIlliteratePersonsOthers?: number;
  noBplIlliteratePersonsTotal?: number;
  noBplIlliteratePersonsMinorities?: number;
  
  noMaleBplIlliterate?: number;
  noMaleBplIlliterateSC?: number;
  noMaleBplIlliterateST?: number;
  noMaleBplIlliterateOBC?: number;
  noMaleBplIlliterateOthers?: number;
  noMaleBplIlliterateTotal?: number;
  noMaleBplIlliterateMinorities?: number;
  
  noFemaleBplIlliterate?: number;
  noFemaleBplIlliterateSC?: number;
  noFemaleBplIlliterateST?: number;
  noFemaleBplIlliterateOBC?: number;
  noFemaleBplIlliterateOthers?: number;
  noFemaleBplIlliterateTotal?: number;
  noFemaleBplIlliterateMinorities?: number;
  
  schoolDropoutsMale?: number;
  schoolDropoutsMaleSC?: number;
  schoolDropoutsMaleST?: number;
  schoolDropoutsMaleOBC?: number;
  schoolDropoutsMaleOthers?: number;
  schoolDropoutsMaleTotal?: number;
  schoolDropoutsMaleMinorities?: number;
  
  schoolDropoutsFemale?: number;
  schoolDropoutsFemaleSC?: number;
  schoolDropoutsFemaleST?: number;
  schoolDropoutsFemaleOBC?: number;
  schoolDropoutsFemaleOthers?: number;
  schoolDropoutsFemaleTotal?: number;
  schoolDropoutsFemaleMinorities?: number;
  
  // PART-G: IV. HOUSING STATUS
  // 14. Dwelling Units Structure
  dwellingUnitsPucca?: number;
  dwellingUnitsSemiPucca?: number;
  dwellingUnitsKatcha?: number;
  dwellingUnitsTotal?: number;
  
  dwellingUnitsWithElectricityPucca?: number;
  dwellingUnitsWithElectricitySemiPucca?: number;
  dwellingUnitsWithElectricityKatcha?: number;
  dwellingUnitsWithElectricityTotal?: number;
  
  // 15. Land Tenure Status (Dwelling Unit Nos)
  landTenureWithPatta?: number;
  landTenurePossessionCertificate?: number;
  landTenureEncroachedPrivate?: number;
  landTenureEncroachedPublic?: number;
  landTenureOnRent?: number;
  landTenureOther?: number;
  landTenureTotal?: number;
  
  // PART-H: V. ECONOMIC STATUS OF HOUSEHOLDS
  // 16. Economic Status (Monthly income of HHs)
  economicStatus?: {
    lessThan500?: number;
    rs500to1000?: number;
    rs1000to1500?: number;
    rs1500to2000?: number;
    rs2000to3000?: number;
    moreThan3000?: number;
  };
  
  // PART-I: VI. OCCUPATION STATUS OF HOUSEHOLDS
  // 17. Occupational Status
  occupationalStatus?: {
    selfEmployed?: number;
    salaried?: number;
    regularWage?: number;
    casualLabour?: number;
    others?: number;
  };
  
  // PART-J: VII. ACCESS TO PHYSICAL INFRASTRUCTURE
  // 18a. Source of Drinking Water (No. of HHs covered)
  sourceDrinkingWater?: {
    individualTap?: number;
    tubewellBorewellHandpump?: number;
    publicTap?: number;
    openwell?: number;
    tankPond?: number;
    riverCanalLakeSpring?: number;
    waterTanker?: number;
    others?: number;
  };
  
  // 18b. Connectivity to City-wide Water Supply System
  connectivityCityWaterSupply?: string; // Fully connected 01, Partially connected 02, Not connected 03
  
  // 19a. Drainage & Sewerage Facility
  drainageSewerageFacility?: string; // YES/NO
  
  // 19b. Connectivity to City-wide Storm-water Drainage System
  connectivityStormWaterDrainage?: string; // Fully connected 01, Partially connected 02, Not connected 03
  
  // 19c. Connectivity to City-wide Sewerage System
  connectivitySewerageSystem?: string; // Fully connected 01, Partially connected 02, Not connected 03
  
  // 19d. Whether the Slum is prone to flooding due to rains
  proneToFlooding?: string; // Not prone - 01, Upto 15 days - 02, 15-30 Days - 03, More than a Month - 04
  
  // 20. Latrine facility used by Households
  latrineFacility?: string; // Public Latrine/ Shared latrine/ own latrine
  
  // 21. Solid Waste Management
  // 21a. Frequency of Garbage Disposal
  frequencyOfGarbageDisposal?: string; // Daily -01, Once in 2 days - 02, Once in a week - 03, Once in 15 days - 04, No collection- 99
  
  // 21b. Arrangement for Garbage Disposal
  arrangementForGarbageDisposal?: string; // Municipal staff - 01, Municipal Contractor - 02, Residents themselves - 03, Others - 04,No arrangement - 99
  
  // 21c. Frequency of Clearance of Open Drains
  frequencyOfClearanceOfOpenDrains?: string; // Daily-01, Once in 2 days - 02, Once in a week - 03, Once in 15 days - 04, No clearance-99
  
  // 22. Approach Road/Lane/Constructed Path to the Slum
  approachRoadType?: string; // Motorable pucca -01, Motorable katcha -02, Non-motorable pucca -03, Non-motorable kaccha-04
  
  // 23. Distance from the nearest Motorable Road
  distanceToNearestMotorableRoad?: string; // Less than 0.5 kms -01, 0.5 to 1.0 km .- 02, 1.0 km to 2.0 km. -03, 2.0 km to 5.0 km. - 04,more than 5.0 km-05
  
  // 24. Internal Road
  internalRoadType?: string; // Motorable pucca-01, Motorable kutcha-02, Non-motorable pucca-03, Non-motorable katcha-04
  
  // 25. Whether Street light facility is available in the Slum
  streetLightAvailable?: string; // Yes-01, No-02
  
  // 26. Pre-primary School
  anganwadiUnderIcds?: {
    option: string;
    distance: number | null;
  }; // 26a. Anganwadi under ICDS
  municipalPreschool?: {
    option: string;
    distance: number | null;
  }; // 26b. Municipal pre-school
  privatePreschool?: {
    option: string;
    distance: number | null;
  }; // 26c. Private pre-school
  
  // 27. Primary School
  municipalPrimarySchool?: {
    option: string;
    distance: number | null;
  }; // 27a. Municipal
  stateGovtPrimarySchool?: {
    option: string;
    distance: number | null;
  }; // 27b. State Government
  privatePrimarySchool?: {
    option: string;
    distance: number | null;
  }; // 27c. Private
  
  // 28. High School
  municipalHighSchool?: {
    option: string;
    distance: number | null;
  }; // 28a. Municipal
  stateGovtHighSchool?: {
    option: string;
    distance: number | null;
  }; // 28b. State Government
  privateHighSchool?: {
    option: string;
    distance: number | null;
  }; // 28c. Private
  
  // 29. Adult Education Centre
  adultEducationCentre?: {
    option: string;
    distance: number | null;
  }; // If 01, then number
  
  // 30. Non-formal Education Centre
  nonFormalEducationCentre?: {
    option: string;
    distance: number | null;
  }; // If 01, then number
  
  // PART-K: IX. Health Facilities
  // 31. Existence of Health Facilities
  urbanHealthPost?: string;
  primaryHealthCentre?: string;
  governmentHospital?: string;
  maternityCentre?: string;
  privateClinic?: string;
  rmp?: string; // Registered Medical Practitioner (RMP)
  ayurvedicDoctor?: string; // Ayurvedic Doctor/Vaidya
  
  // PART-L: X. Social Development/Welfare
  // 32. Availability of Facilities within Slum
  communityHall?: number; // Community Hall
  livelihoodProductionCentre?: number; // Livelihood/Production Centre
  vocationalTrainingCentre?: number; // Vocational training/Training-cum-production Centre
  streetChildrenRehabilitationCentre?: number; // Street Children Rehabilitation Centre
  nightShelter?: number; // Night Shelter
  oldAgeHome?: number; // Old Age Home
  
  // 33a. Old Age Pensions (No. of Holders)
  oldAgePensionsHolders?: number;
  // 33b. Widow Pensions (No. of Holders)
  widowPensionsHolders?: number;
  // 33c. Disabled Pensions (No. of Holders)
  disabledPensionsHolders?: number;
  // 33d. General Insurance (No. covered)
  generalInsuranceCovered?: number;
  // 33e. Health Insurance (No. covered)
  healthInsuranceCovered?: number;
  
  // 34. Self Help Groups/DWCUA Groups in Slum
  selfHelpGroups?: number; // Specify Distance: 0, 01, 02, 03 ....
  
  // 35. Thrift and Credit Societies in Slum
  thriftCreditSocieties?: number; // Specify Distance: 0, 01, 02, 03 ....
  
  // 36a. Slum-dwellers Association
  slumDwellersAssociation?: string; // [Yes- 01, No- 02]
  // 36b. Youth Associations
  youthAssociations?: number; // Specify Distance: 0, 01,02,03
  // 36c. Women's Associations/ Mahila Samithis
  womensAssociations?: number; // Specify Distance: 0, 01,02,03
  
  // Employment and occupation related fields
  majorIndustriesPresent?: string[];
  
  // PART-XII: XI. ADDITIONAL INFRASTRUCTURE REQUIREMENTS
  // Water Supply
  waterSupplyPipelinesExisting?: string; // 37 - Water Supply: Pipelines (Rmts) - Existing
  waterSupplyPipelinesAdditional?: string; // 37 - Water Supply: Pipelines (Rmts) - Additional Requirement
  waterSupplyPipelinesCost?: number; // 37 - Water Supply: Pipelines (Rmts) - Estimated Cost
  
  waterSupplyIndividualTapsExisting?: string; // Individual Taps (Nos.) - Existing
  waterSupplyIndividualTapsAdditional?: string; // Individual Taps (Nos.) - Additional Requirement
  waterSupplyIndividualTapsCost?: number; // Individual Taps (Nos.) - Estimated Cost
  
  waterSupplyBorewellsExisting?: string; // Borewells (Nos.) - Existing
  waterSupplyBorewellsAdditional?: string; // Borewells (Nos.) - Additional Requirement
  waterSupplyBorewellsCost?: number; // Borewells (Nos.) - Estimated Cost
  
  waterSupplyConnectivityTrunkLinesExisting?: string; // Connectivity to Trunk Lines (Rmts) - Existing
  waterSupplyConnectivityTrunkLinesAdditional?: string; // Connectivity to Trunk Lines (Rmts) - Additional Requirement
  waterSupplyConnectivityTrunkLinesCost?: number; // Connectivity to Trunk Lines (Rmts) - Estimated Cost
  
  // Drainage/Sewerage
  drainageStormwaterDrainageExisting?: string; // 38 - Stormwater Drainage (Rmts.) - Existing
  drainageStormwaterDrainageAdditional?: string; // 38 - Stormwater Drainage (Rmts.) - Additional Requirement
  drainageStormwaterDrainageCost?: number; // 38 - Stormwater Drainage (Rmts.) - Estimated Cost
  
  drainageConnectivityMainDrainsExisting?: string; // Connectivity to Main Drains (Rmts) - Existing
  drainageConnectivityMainDrainsAdditional?: string; // Connectivity to Main Drains (Rmts) - Additional Requirement
  drainageConnectivityMainDrainsCost?: number; // Connectivity to Main Drains (Rmts) - Estimated Cost
  
  drainageSewerLinesExisting?: string; // Sewer Lines (Rmts) - Existing
  drainageSewerLinesAdditional?: string; // Sewer Lines (Rmts) - Additional Requirement
  drainageSewerLinesCost?: number; // Sewer Lines (Rmts) - Estimated Cost
  
  drainageConnectivityTrunkSewersExisting?: string; // Connectivity to Trunk Sewers (Rmts) - Existing
  drainageConnectivityTrunkSewersAdditional?: string; // Connectivity to Trunk Sewers (Rmts) - Additional Requirement
  drainageConnectivityTrunkSewersCost?: number; // Connectivity to Trunk Sewers (Rmts) - Estimated Cost
  
  // Roads
  roadsInternalRoadsCCExisting?: string; // 39 - Internal Roads -CC (Rmts) - Existing
  roadsInternalRoadsCCAdditional?: string; // 39 - Internal Roads -CC (Rmts) - Additional Requirement
  roadsInternalRoadsCCCost?: number; // 39 - Internal Roads -CC (Rmts) - Estimated Cost
  
  roadsInternalRoadsBTExisting?: string; // Internal Roads - BT (Rmts.) - Existing
  roadsInternalRoadsBTAdditional?: string; // Internal Roads - BT (Rmts.) - Additional Requirement
  roadsInternalRoadsBTCost?: number; // Internal Roads - BT (Rmts.) - Estimated Cost
  
  roadsInternalRoadsOthersExisting?: string; // Internal Roads - Others (Rmts) - Existing
  roadsInternalRoadsOthersAdditional?: string; // Internal Roads - Others (Rmts) - Additional Requirement
  roadsInternalRoadsOthersCost?: number; // Internal Roads - Others (Rmts) - Estimated Cost
  
  roadsApproachRoadsCCExisting?: string; // Approach Roads -CC (Rmts) - Existing
  roadsApproachRoadsCCAdditional?: string; // Approach Roads -CC (Rmts) - Additional Requirement
  roadsApproachRoadsCCCost?: number; // Approach Roads -CC (Rmts) - Estimated Cost
  
  roadsApproachRoadsOthersExisting?: string; // Approach Roads - Others (Rmts) - Existing
  roadsApproachRoadsOthersAdditional?: string; // Approach Roads - Others (Rmts) - Additional Requirement
  roadsApproachRoadsOthersCost?: number; // Approach Roads - Others (Rmts) - Estimated Cost
  
  // Street Lighting
  streetLightingPolesExisting?: string; // 40 - Street Light Poles (Nos.) - Existing
  streetLightingPolesAdditional?: string; // 40 - Street Light Poles (Nos.) - Additional Requirement
  streetLightingPolesCost?: number; // 40 - Street Light Poles (Nos.) - Estimated Cost
  
  streetLightingLightsExisting?: string; // Street Lights (Nos) - Existing
  streetLightingLightsAdditional?: string; // Street Lights (Nos) - Additional Requirement
  streetLightingLightsCost?: number; // Street Lights (Nos) - Estimated Cost
  
  // Sanitation
  sanitationIndividualToiletsExisting?: string; // 41 - Individual Toilets (Nos) - Existing
  sanitationIndividualToiletsAdditional?: string; // 41 - Individual Toilets (Nos) - Additional Requirement
  sanitationIndividualToiletsCost?: number; // 41 - Individual Toilets (Nos) - Estimated Cost
  
  sanitationCommunityToiletsExisting?: string; // Community Toilets (Nos) - Existing
  sanitationCommunityToiletsAdditional?: string; // Community Toilets (Nos) - Additional Requirement
  sanitationCommunityToiletsCost?: number; // Community Toilets (Nos) - Estimated Cost
  
  sanitationSeatsCommunityToiletsExisting?: string; // Seats in Community Toilets (Nos.) - Existing
  sanitationSeatsCommunityToiletsAdditional?: string; // Seats in Community Toilets (Nos.) - Additional Requirement
  sanitationSeatsCommunityToiletsCost?: number; // Seats in Community Toilets (Nos.) - Estimated Cost
  
  sanitationDumperBinsExisting?: string; // Dumper Bins (Nos) - Existing
  sanitationDumperBinsAdditional?: string; // Dumper Bins (Nos) - Additional Requirement
  sanitationDumperBinsCost?: number; // Dumper Bins (Nos) - Estimated Cost
  
  // Community Facilities
  communityHallsExisting?: string; // 42 - Community Halls (No of Rooms) - Existing
  communityHallsAdditional?: string; // 42 - Community Halls (No of Rooms) - Additional Requirement
  communityHallsCost?: number; // 42 - Community Halls (No of Rooms) - Estimated Cost
  
  communityLivelihoodCentresExisting?: string; // Livelihood / Production Centres (Noof Rooms) - Existing
  communityLivelihoodCentresAdditional?: string; // Livelihood / Production Centres (Noof Rooms) - Additional Requirement
  communityLivelihoodCentresCost?: number; // Livelihood / Production Centres (Noof Rooms) - Estimated Cost
  
  communityAnganwadisExisting?: string; // Anganwadis /Pre-schools (No ofRooms) - Existing
  communityAnganwadisAdditional?: string; // Anganwadis /Pre-schools (No ofRooms) - Additional Requirement
  communityAnganwadisCost?: number; // Anganwadis /Pre-schools (No ofRooms) - Estimated Cost
  
  communityPrimarySchoolsExisting?: string; // Primary Schools (No of Class Rooms) - Existing
  communityPrimarySchoolsAdditional?: string; // Primary Schools (No of Class Rooms) - Additional Requirement
  communityPrimarySchoolsCost?: number; // Primary Schools (No of Class Rooms) - Estimated Cost
  
  communityHealthCentresExisting?: string; // Health Centres (No. of Rooms) - Existing
  communityHealthCentresAdditional?: string; // Health Centres (No. of Rooms) - Additional Requirement
  communityHealthCentresCost?: number; // Health Centres (No. of Rooms) - Estimated Cost
  
  communityOthersExisting?: string; // Others (Specify) - Existing
  communityOthersAdditional?: string; // Others (Specify) - Additional Requirement
  communityOthersCost?: number; // Others (Specify) - Estimated Cost
  
  // Additional fields that may be used
  // Infrastructure and services
  waterSupplyDuration?: string;
  waterSupplyHours?: number;
  waterSupplySource?: string;
  electricityConnection?: string;
  electricityHours?: number;
  streetLights?: string;
  pavedRoads?: string;
  unpavedRoads?: string;
  dustbins?: string;
  drainsCovered?: string;
  drainsOpen?: string;
  drainsAbsent?: string;
  drainsType?: string;
  roadsType?: string;
  garbageDisposal?: string;
  
  // Education facilities
  primarySchoolGovt?: number;
  primarySchoolPrivate?: number;
  secondarySchoolGovt?: number;
  secondarySchoolPrivate?: number;
  higherSecondarySchoolGovt?: number;
  higherSecondarySchoolPrivate?: number;
  anganwadiCenterGovt?: number;
  anganwadiCenterPrivate?: number;
  distanceToPrimarySchool?: string;
  distanceToSecondarySchool?: string;
  
  // Health facilities
  dispensaryGovt?: number;
  dispensaryPrivate?: number;
  hospitalGovt?: number;
  hospitalPrivate?: number;
  distanceToDispensary?: string;
  distanceToHospital?: string;
  medicalStoreGovt?: number;
  medicalStorePrivate?: number;
  phcGovt?: number;
  phcPrivate?: number;
  chcGovt?: number;
  chcPrivate?: number;
  
  // Social welfare schemes
  nrhmScheme?: string;
  nrhmBeneficiaries?: number;
  icdsScheme?: string;
  icdsBeneficiaries?: number;
  nirmalBharatAbhiyan?: string;
  nbaBeneficiaries?: number;
  midDayMeal?: string;
  mdmBeneficiaries?: number;
  sablaScheme?: string;
  sablaBeneficiaries?: number;
  rashtriyaSwasthyaBimaYojana?: string;
  rsbyBeneficiaries?: number;
  ayushmanBharat?: string;
  ayushmanBeneficiaries?: number;
  otherSchemes?: string;
  otherSchemesBeneficiaries?: number;
  
  // Additional infrastructure
  // Additional Infrastructure standalone fields
  electricityExisting?: string;
  electricityAdditional?: string;
  electricityCost?: number;
  
  healthcareExisting?: string;
  healthcareAdditional?: string;
  healthcareCost?: number;
  
  toiletsExisting?: string;
  toiletsAdditional?: string;
  toiletsCost?: number;
  
  additionalInfrastructure?: {
    waterSupply?: {
      existing?: string;
      additionalRequirement?: string;
      estimatedCost?: number;
    };
    electricity?: {
      existing?: string;
      additionalRequirement?: string;
      estimatedCost?: number;
    };
    drainage?: {
      existing?: string;
      additionalRequirement?: string;
      estimatedCost?: number;
    };
    roads?: {
      existing?: string;
      additionalRequirement?: string;
      estimatedCost?: number;
    };
    streetLighting?: {
      existing?: string;
      additionalRequirement?: string;
      estimatedCost?: number;
    };
    sanitation?: {
      existing?: string;
      additionalRequirement?: string;
      estimatedCost?: number;
    };
    toilets?: {
      existing?: string;
      additionalRequirement?: string;
      estimatedCost?: number;
    };
    healthcare?: {
      existing?: string;
      additionalRequirement?: string;
      estimatedCost?: number;
    };
    communityFacilities?: {
      existing?: string;
      additionalRequirement?: string;
      estimatedCost?: number;
    };
  };
  
  distanceToWaterSource?: string;
  typeOfToilet?: string;
  toiletAccessibility?: string;
  bathingFacility?: string;
  wastewaterDisposal?: string;
  drainageSystem?: string;

};

const SANITATION_OPTIONS = [
  { id: "PUBLIC_TOILETS", label: "Public Toilets" },
  { id: "PRIVATE_TOILETS", label: "Private Toilets" },
  { id: "COMMUNITY_TOILETS", label: "Community Toilets" },
  { id: "OPEN_DEFECATION", label: "Open Defecation" },
  { id: "SEPTIC_TANKS", label: "Septic Tanks" },
];

export default function SlumSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = params.id as string;
  
  // Unwrap searchParams Promise for Next.js 16.1.5 with Turbopack
  const unwrappedSearchParams = React.useMemo(() => searchParams, [searchParams]);
  const isEditMode = unwrappedSearchParams?.get('edit') === 'true';
  const { showToast } = useToast();

  const [slum, setSlum] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [slumSurvey, setSlumSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [tempFormData, setTempFormData] = useState<Partial<SlumSurveyForm>>({}); // Temporary storage for edit mode changes
  const [isPreviewMode, setIsPreviewMode] = useState(false); // Track if we're in actual preview mode
  
  // Debug logging for state values
  useEffect(() => {
    console.log("State values:", {
      currentStep,
      isPreviewMode,
      isEditMode,
      submitting,
      saving,
      slumSurveyId: slumSurvey?._id
    });
  }, [currentStep, isPreviewMode, isEditMode, submitting, saving, slumSurvey]);

  // Validation state
  interface FieldError {
    field: string;
    message: string;
  }
  const [errors, setErrors] = useState<FieldError[]>([]);

  const [formData, setFormData] = useState<SlumSurveyForm>({
    slumId: "",
    surveyed: false,
    slumType: "",
    ownershipLand: "",
    locationCoreOrFringe: "",
    typeAreaSurrounding: "",
    physicalLocationSlum: "",
    isSlumNotified: "",
    connectivityCityWaterSupply: "",
    drainageSewerageFacility: "",
    connectivityStormWaterDrainage: "",
    connectivitySewerageSystem: "",
    proneToFlooding: "",
    latrineFacility: "",
    frequencyOfGarbageDisposal: "",
    arrangementForGarbageDisposal: "",
    frequencyOfClearanceOfOpenDrains: "",
    approachRoadType: "",
    distanceToNearestMotorableRoad: "",
    internalRoadType: "",
    streetLightAvailable: "",
    urbanHealthPost: "",
    primaryHealthCentre: "",
    governmentHospital: "",
    maternityCentre: "",
    privateClinic: "",
    rmp: "",
    ayurvedicDoctor: "",
    slumDwellersAssociation: "",
    
    // Additional Infrastructure Requirements
    // Water Supply
    waterSupplyPipelinesExisting: "",
    waterSupplyPipelinesAdditional: "",
    waterSupplyPipelinesCost: undefined,
    
    waterSupplyIndividualTapsExisting: "",
    waterSupplyIndividualTapsAdditional: "",
    waterSupplyIndividualTapsCost: undefined,
    
    waterSupplyBorewellsExisting: "",
    waterSupplyBorewellsAdditional: "",
    waterSupplyBorewellsCost: undefined,
    
    waterSupplyConnectivityTrunkLinesExisting: "",
    waterSupplyConnectivityTrunkLinesAdditional: "",
    waterSupplyConnectivityTrunkLinesCost: undefined,
    
    // Drainage/Sewerage
    drainageStormwaterDrainageExisting: "",
    drainageStormwaterDrainageAdditional: "",
    drainageStormwaterDrainageCost: undefined,
    
    drainageConnectivityMainDrainsExisting: "",
    drainageConnectivityMainDrainsAdditional: "",
    drainageConnectivityMainDrainsCost: undefined,
    
    drainageSewerLinesExisting: "",
    drainageSewerLinesAdditional: "",
    drainageSewerLinesCost: undefined,
    
    drainageConnectivityTrunkSewersExisting: "",
    drainageConnectivityTrunkSewersAdditional: "",
    drainageConnectivityTrunkSewersCost: undefined,
    
    // Roads
    roadsInternalRoadsCCExisting: "",
    roadsInternalRoadsCCAdditional: "",
    roadsInternalRoadsCCCost: undefined,
    
    roadsInternalRoadsBTExisting: "",
    roadsInternalRoadsBTAdditional: "",
    roadsInternalRoadsBTCost: undefined,
    
    roadsInternalRoadsOthersExisting: "",
    roadsInternalRoadsOthersAdditional: "",
    roadsInternalRoadsOthersCost: undefined,
    
    roadsApproachRoadsCCExisting: "",
    roadsApproachRoadsCCAdditional: "",
    roadsApproachRoadsCCCost: undefined,
    
    roadsApproachRoadsOthersExisting: "",
    roadsApproachRoadsOthersAdditional: "",
    roadsApproachRoadsOthersCost: undefined,
    
    // Street Lighting
    streetLightingPolesExisting: "",
    streetLightingPolesAdditional: "",
    streetLightingPolesCost: undefined,
    
    streetLightingLightsExisting: "",
    streetLightingLightsAdditional: "",
    streetLightingLightsCost: undefined,
    
    // Sanitation
    sanitationIndividualToiletsExisting: "",
    sanitationIndividualToiletsAdditional: "",
    sanitationIndividualToiletsCost: undefined,
    
    sanitationCommunityToiletsExisting: "",
    sanitationCommunityToiletsAdditional: "",
    sanitationCommunityToiletsCost: undefined,
    
    sanitationSeatsCommunityToiletsExisting: "",
    sanitationSeatsCommunityToiletsAdditional: "",
    sanitationSeatsCommunityToiletsCost: undefined,
    
    sanitationDumperBinsExisting: "",
    sanitationDumperBinsAdditional: "",
    sanitationDumperBinsCost: undefined,
    
    // Community Facilities
    communityHallsExisting: "",
    communityHallsAdditional: "",
    communityHallsCost: undefined,
    
    communityLivelihoodCentresExisting: "",
    communityLivelihoodCentresAdditional: "",
    communityLivelihoodCentresCost: undefined,
    
    communityAnganwadisExisting: "",
    communityAnganwadisAdditional: "",
    communityAnganwadisCost: undefined,
    
    communityPrimarySchoolsExisting: "",
    communityPrimarySchoolsAdditional: "",
    communityPrimarySchoolsCost: undefined,
    
    communityHealthCentresExisting: "",
    communityHealthCentresAdditional: "",
    communityHealthCentresCost: undefined,
    
    communityOthersExisting: "",
    communityOthersAdditional: "",
    communityOthersCost: undefined,
    
    // Standalone infrastructure fields
    electricityExisting: "",
    electricityAdditional: "",
    electricityCost: undefined,
    
    healthcareExisting: "",
    healthcareAdditional: "",
    healthcareCost: undefined,
    
    toiletsExisting: "",
    toiletsAdditional: "",
    toiletsCost: undefined,
    majorIndustriesPresent: [],
  });

  const steps = [
    { title: "General Information", id: "generalInformation" },
    { title: "City/Town Slum Profile", id: "cityTownSlumProfile" },
    { title: "Survey Operation", id: "surveyOperation" },
    { title: "Basic Information", id: "basicInformation" },
    { title: "Land Status", id: "landStatus" },
    { title: "Demographic Profile", id: "demographicProfile" },
    { title: "Housing Status", id: "housingStatus" },
    { title: "Economic Status", id: "economicStatus" },
    { title: "Occupation Status", id: "occupationStatus" },
    { title: "Physical Infrastructure", id: "physicalInfrastructure" },
    { title: "Education Facilities", id: "educationFacilities" },
    { title: "Health Facilities", id: "healthFacilities" },
    { title: "Social Development", id: "socialDevelopment" },
    { title: "Additional Infrastructure", id: "additionalInfrastructure" },
    { title: isEditMode ? "Edit & Submit" : "Review & Submit", id: "reviewAndSubmit" },
  ];

  useEffect(() => {
    // Load user data
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // First, fetch the assignment to get the slum ID
        const assignmentResponse = await apiService.getAssignment(assignmentId);
        if (assignmentResponse.success && assignmentResponse.data) {
          setAssignment(assignmentResponse.data);
          const slumId = assignmentResponse.data.slum._id;

          // Update form data with the actual slum ID
          setFormData((prev) => ({
            ...prev,
            slumId: slumId,
          }));

          // Now fetch the slum details
          const slumResponse = await apiService.getSlum(slumId);
          if (slumResponse.success) {
            const slumData = slumResponse.data;
            setSlum(slumData);
            
            // Auto-fill slum details
            setFormData((prev) => ({
              ...prev,
              slumName: slumData.name || "",
              stateName: slumData.state?.name || "",
              stateCode: slumData.state?.code || "",
              districtName: slumData.district?.name || "",
              districtCode: slumData.district?.code || "",
              locationWard: slumData.ward || "",
              slumType: slumData.slumType || "",
              ownershipLand: slumData.landOwnership || "",
              noSlumHouseholds: slumData.totalHouseholds || 0,
            }));
          } else {
            showToast("Failed to load slum details", "error");
          }

          // Create or get the slum survey
          const surveyResponse = await apiService.createOrGetSlumSurvey(slumId);
          if (surveyResponse.success) {
            const surveyData = surveyResponse.data;
            setSlumSurvey(surveyData);
            
            // Set completion percentage from existing survey data
            if (surveyData.completionPercentage !== undefined) {
              setFormData(prev => ({
                ...prev,
                completionPercentage: surveyData.completionPercentage
              }));
            }
            
            // Navigate to the correct section based on completion percentage and survey status
            if (surveyData.completionPercentage !== undefined) {
              let sectionIndex;
              let previewMode = false;
              
              // If survey is submitted, check if we're in edit mode
              if (surveyData.surveyStatus === 'SUBMITTED') {
                if (isEditMode) {
                  sectionIndex = 0; // Start from first section for editing
                  previewMode = false;
                } else {
                  sectionIndex = 14; // Preview section
                  previewMode = true;
                }
              } else {
                // Calculate section based on completion percentage
                // Each section represents ~6.67% (100/15), so we divide by 6.67 and round down
                sectionIndex = Math.floor(surveyData.completionPercentage / (100 / 15));
                
                // Cap at 13 (the last data section index)
                if (surveyData.completionPercentage >= 100) {
                  sectionIndex = 13; // Last data section (Additional Infrastructure)
                } else if (surveyData.completionPercentage === 0) {
                  sectionIndex = 0; // First section
                } else {
                  // For intermediate percentages, use the calculated value but cap at 13
                  sectionIndex = Math.min(13, sectionIndex);
                }
                previewMode = false;
              }
              
              setCurrentStep(sectionIndex);
              setIsPreviewMode(previewMode);
            }
            
            // Skip permission check here since it should be handled at the assignment level
            
            // If survey has existing data, populate the form
            console.log("Loading basicInformation data:", surveyData.basicInformation);
            if (surveyData.basicInformation) {
              setFormData(prev => ({
                ...prev,
                slumCode: surveyData.basicInformation.slumCode || "",
                locationWard: surveyData.basicInformation.locationWard || "",
                ageSlumYears: surveyData.basicInformation.ageSlumYears || undefined,
                areaSlumSqMtrs: surveyData.basicInformation.areaSlumSqMtrs ? parseFloat(surveyData.basicInformation.areaSlumSqMtrs) : undefined,
                locationCoreOrFringe: surveyData.basicInformation.locationCoreOrFringe || "",
                typeAreaSurrounding: surveyData.basicInformation.typeAreaSurrounding || "",
                physicalLocationSlum: surveyData.basicInformation.physicalLocationSlum || "",
                isSlumNotified: surveyData.basicInformation.isSlumNotified || "",
                yearOfNotification: surveyData.basicInformation.yearOfNotification ? parseInt(surveyData.basicInformation.yearOfNotification) : undefined,
              }));
            }
            
            if (surveyData.landStatus) {
              setFormData(prev => ({
                ...prev,
                ownershipLandDetail: surveyData.landStatus.ownershipLandDetail || "",
                ownershipLandSpecify: surveyData.landStatus.ownershipLandSpecify || "",
              }));
            }
            
            // Handle demographic profile data
            console.log("Loading demographicProfile data:", surveyData.demographicProfile);
            if (surveyData.demographicProfile) {
              setFormData(prev => ({
                ...prev,
                // Population data
                totalPopulationSlumSC: surveyData.demographicProfile.totalPopulation?.SC || 0,
                totalPopulationSlumST: surveyData.demographicProfile.totalPopulation?.ST || 0,
                totalPopulationSlumOBC: surveyData.demographicProfile.totalPopulation?.OBC || 0,
                totalPopulationSlumOthers: surveyData.demographicProfile.totalPopulation?.Others || 0,
                totalPopulationSlum: surveyData.demographicProfile.totalPopulation?.Total || 0,
                totalPopulationSlumMinorities: surveyData.demographicProfile.totalPopulation?.Minorities || 0,
                
                // BPL Population
                bplPopulationSlumSC: surveyData.demographicProfile.bplPopulation?.SC || 0,
                bplPopulationSlumST: surveyData.demographicProfile.bplPopulation?.ST || 0,
                bplPopulationSlumOBC: surveyData.demographicProfile.bplPopulation?.OBC || 0,
                bplPopulationSlumOthers: surveyData.demographicProfile.bplPopulation?.Others || 0,
                bplPopulationSlum: surveyData.demographicProfile.bplPopulation?.Total || 0,
                bplPopulationSlumMinorities: surveyData.demographicProfile.bplPopulation?.Minorities || 0,
                
                // Illiteracy data
                totalIlliteratePersonsSC: surveyData.demographicProfile.totalIlliteratePerson?.SC || 0,
                totalIlliteratePersonsST: surveyData.demographicProfile.totalIlliteratePerson?.ST || 0,
                totalIlliteratePersonsOBC: surveyData.demographicProfile.totalIlliteratePerson?.OBC || 0,
                totalIlliteratePersonsOthers: surveyData.demographicProfile.totalIlliteratePerson?.Others || 0,
                totalIlliteratePersonsTotal: surveyData.demographicProfile.totalIlliteratePerson?.Total || 0,
                totalIlliteratePersonsMinorities: surveyData.demographicProfile.totalIlliteratePerson?.Minorities || 0,
              }));
            }
            
            // Handle infrastructure data
            if (surveyData.physicalInfrastructure) {
              setFormData(prev => ({
                ...prev,
                connectivityCityWaterSupply: surveyData.physicalInfrastructure.connectivityCityWaterSupply || "",
                drainageSewerageFacility: surveyData.physicalInfrastructure.drainageSewerageFacility || "",
                connectivityStormWaterDrainage: surveyData.physicalInfrastructure.connectivityStormWaterDrainage || "",
                connectivitySewerageSystem: surveyData.physicalInfrastructure.connectivitySewerageSystem || "",
                proneToFlooding: surveyData.physicalInfrastructure.proneToFlooding || "",
                latrineFacility: surveyData.physicalInfrastructure.latrineFacility || "",
                frequencyOfGarbageDisposal: surveyData.physicalInfrastructure.solidWasteManagement?.frequencyOfGarbageDisposal || "",
                arrangementForGarbageDisposal: surveyData.physicalInfrastructure.solidWasteManagement?.arrangementForGarbageDisposal || "",
                frequencyOfClearanceOfOpenDrains: surveyData.physicalInfrastructure.solidWasteManagement?.frequencyOfClearanceOfOpenDrains || "",
                streetLightAvailable: surveyData.physicalInfrastructure.streetLightAvailable || "",
                approachRoadType: surveyData.physicalInfrastructure.approachRoadType || "",
                distanceToNearestMotorableRoad: surveyData.physicalInfrastructure.distanceToNearestMotorableRoad || "",
                internalRoadType: surveyData.physicalInfrastructure.internalRoadType || "",
              }));
            }
            
            // Handle health facilities data
            if (surveyData.healthFacilities) {
              setFormData(prev => ({
                ...prev,
                urbanHealthPost: surveyData.healthFacilities.urbanHealthPost || "",
                primaryHealthCentre: surveyData.healthFacilities.primaryHealthCentre || "",
                governmentHospital: surveyData.healthFacilities.governmentHospital || "",
                maternityCentre: surveyData.healthFacilities.maternityCentre || "",
                privateClinic: surveyData.healthFacilities.privateClinic || "",
                rmp: surveyData.healthFacilities.rmp || "",
                ayurvedicDoctor: surveyData.healthFacilities.ayurvedicDoctor || "",
              }));
            }
            
            if (surveyData.socialDevelopment) {
              setFormData(prev => ({
                ...prev,
                communityHall: surveyData.socialDevelopment.communityHall || 0,
                livelihoodProductionCentre: surveyData.socialDevelopment.livelihoodProductionCentre || 0,
                vocationalTrainingCentre: surveyData.socialDevelopment.vocationalTrainingCentre || 0,
                streetChildrenRehabilitationCentre: surveyData.socialDevelopment.streetChildrenRehabilitationCentre || 0,
                nightShelter: surveyData.socialDevelopment.nightShelter || 0,
                oldAgeHome: surveyData.socialDevelopment.oldAgeHome || 0,
                oldAgePensionsHolders: surveyData.socialDevelopment.oldAgePensionsHolders || 0,
                widowPensionsHolders: surveyData.socialDevelopment.widowPensionsHolders || 0,
                disabledPensionsHolders: surveyData.socialDevelopment.disabledPensionsHolders || 0,
                generalInsuranceCovered: surveyData.socialDevelopment.generalInsuranceCovered || 0,
                healthInsuranceCovered: surveyData.socialDevelopment.healthInsuranceCovered || 0,
                selfHelpGroups: surveyData.socialDevelopment.selfHelpGroups || 0,
                thriftCreditSocieties: surveyData.socialDevelopment.thriftCreditSocieties || 0,
                slumDwellersAssociation: surveyData.socialDevelopment.slumDwellersAssociation || "",
                youthAssociations: surveyData.socialDevelopment.youthAssociations || 0,
                womensAssociations: surveyData.socialDevelopment.womensAssociations || 0,
              }));
            }
            
            // Load additional sections that may not have been covered
            if (surveyData.economicStatus) {
              setFormData(prev => ({
                ...prev,
                economicStatus: surveyData.economicStatus.economicStatusData || {}
              }));
            }
            
            if (surveyData.housingStatus) {
              setFormData(prev => ({
                ...prev,
                dwellingUnitsPucca: surveyData.housingStatus.dwellingUnitsPucca || 0,
                dwellingUnitsSemiPucca: surveyData.housingStatus.dwellingUnitsSemiPucca || 0,
                dwellingUnitsKatcha: surveyData.housingStatus.dwellingUnitsKatcha || 0,
                dwellingUnitsTotal: surveyData.housingStatus.dwellingUnitsTotal || 0,
                dwellingUnitsWithElectricityPucca: surveyData.housingStatus.dwellingUnitsWithElectricityPucca || 0,
                dwellingUnitsWithElectricitySemiPucca: surveyData.housingStatus.dwellingUnitsWithElectricitySemiPucca || 0,
                dwellingUnitsWithElectricityKatcha: surveyData.housingStatus.dwellingUnitsWithElectricityKatcha || 0,
                dwellingUnitsWithElectricityTotal: surveyData.housingStatus.dwellingUnitsWithElectricityTotal || 0,
                landTenureWithPatta: surveyData.housingStatus.landTenureWithPatta || 0,
                landTenurePossessionCertificate: surveyData.housingStatus.landTenurePossessionCertificate || 0,
                landTenureEncroachedPrivate: surveyData.housingStatus.landTenureEncroachedPrivate || 0,
                landTenureEncroachedPublic: surveyData.housingStatus.landTenureEncroachedPublic || 0,
                landTenureOnRent: surveyData.housingStatus.landTenureOnRent || 0,
                landTenureOther: surveyData.housingStatus.landTenureOther || 0,
                landTenureTotal: surveyData.housingStatus.landTenureTotal || 0,
              }));
            }
            
            if (surveyData.educationFacilities) {
              setFormData(prev => ({
                ...prev,
                anganwadiUnderIcds: surveyData.educationFacilities.anganwadiUnderIcds || { option: '', distance: null },
                municipalPreschool: surveyData.educationFacilities.municipalPreschool || { option: '', distance: null },
                privatePreschool: surveyData.educationFacilities.privatePreschool || { option: '', distance: null },
                municipalPrimarySchool: surveyData.educationFacilities.municipalPrimarySchool || { option: '', distance: null },
                stateGovtPrimarySchool: surveyData.educationFacilities.stateGovtPrimarySchool || { option: '', distance: null },
                privatePrimarySchool: surveyData.educationFacilities.privatePrimarySchool || { option: '', distance: null },
                municipalHighSchool: surveyData.educationFacilities.municipalHighSchool || { option: '', distance: null },
                stateGovtHighSchool: surveyData.educationFacilities.stateGovtHighSchool || { option: '', distance: null },
                privateHighSchool: surveyData.educationFacilities.privateHighSchool || { option: '', distance: null },
                adultEducationCentre: surveyData.educationFacilities.adultEducationCentre || { option: '', distance: null },
                nonFormalEducationCentre: surveyData.educationFacilities.nonFormalEducationCentre || { option: '', distance: null },
              }));
            }
            
            // Handle literacy and education data (embedded within demographicProfile)
            if (surveyData.demographicProfile) {
              // Load literacy data from demographicProfile section
              setFormData(prev => ({
                ...prev,
                // Total Illiterate Persons
                totalIlliteratePersonsSC: surveyData.demographicProfile.totalIlliteratePerson?.SC || 0,
                totalIlliteratePersonsST: surveyData.demographicProfile.totalIlliteratePerson?.ST || 0,
                totalIlliteratePersonsOBC: surveyData.demographicProfile.totalIlliteratePerson?.OBC || 0,
                totalIlliteratePersonsOthers: surveyData.demographicProfile.totalIlliteratePerson?.Others || 0,
                totalIlliteratePersonsTotal: surveyData.demographicProfile.totalIlliteratePerson?.Total || 0,
                totalIlliteratePersonsMinorities: surveyData.demographicProfile.totalIlliteratePerson?.Minorities || 0,
                
                // Male Illiterate
                noMaleIlliterateSC: surveyData.demographicProfile.maleIlliterate?.SC || 0,
                noMaleIlliterateST: surveyData.demographicProfile.maleIlliterate?.ST || 0,
                noMaleIlliterateOBC: surveyData.demographicProfile.maleIlliterate?.OBC || 0,
                noMaleIlliterateOthers: surveyData.demographicProfile.maleIlliterate?.Others || 0,
                noMaleIlliterateTotal: surveyData.demographicProfile.maleIlliterate?.Total || 0,
                noMaleIlliterateMinorities: surveyData.demographicProfile.maleIlliterate?.Minorities || 0,
                
                // Female Illiterate
                noFemaleIlliterateSC: surveyData.demographicProfile.femaleIlliterate?.SC || 0,
                noFemaleIlliterateST: surveyData.demographicProfile.femaleIlliterate?.ST || 0,
                noFemaleIlliterateOBC: surveyData.demographicProfile.femaleIlliterate?.OBC || 0,
                noFemaleIlliterateOthers: surveyData.demographicProfile.femaleIlliterate?.Others || 0,
                noFemaleIlliterateTotal: surveyData.demographicProfile.femaleIlliterate?.Total || 0,
                noFemaleIlliterateMinorities: surveyData.demographicProfile.femaleIlliterate?.Minorities || 0,
                
                // BPL Illiterate Persons
                noBplIlliteratePersonsSC: surveyData.demographicProfile.bplIlliteratePerson?.SC || 0,
                noBplIlliteratePersonsST: surveyData.demographicProfile.bplIlliteratePerson?.ST || 0,
                noBplIlliteratePersonsOBC: surveyData.demographicProfile.bplIlliteratePerson?.OBC || 0,
                noBplIlliteratePersonsOthers: surveyData.demographicProfile.bplIlliteratePerson?.Others || 0,
                noBplIlliteratePersonsTotal: surveyData.demographicProfile.bplIlliteratePerson?.Total || 0,
                noBplIlliteratePersonsMinorities: surveyData.demographicProfile.bplIlliteratePerson?.Minorities || 0,
                
                // Male BPL Illiterate
                noMaleBplIlliterateSC: surveyData.demographicProfile.maleBplIlliterate?.SC || 0,
                noMaleBplIlliterateST: surveyData.demographicProfile.maleBplIlliterate?.ST || 0,
                noMaleBplIlliterateOBC: surveyData.demographicProfile.maleBplIlliterate?.OBC || 0,
                noMaleBplIlliterateOthers: surveyData.demographicProfile.maleBplIlliterate?.Others || 0,
                noMaleBplIlliterateTotal: surveyData.demographicProfile.maleBplIlliterate?.Total || 0,
                noMaleBplIlliterateMinorities: surveyData.demographicProfile.maleBplIlliterate?.Minorities || 0,
                
                // Female BPL Illiterate
                noFemaleBplIlliterateSC: surveyData.demographicProfile.femaleBplIlliterate?.SC || 0,
                noFemaleBplIlliterateST: surveyData.demographicProfile.femaleBplIlliterate?.ST || 0,
                noFemaleBplIlliterateOBC: surveyData.demographicProfile.femaleBplIlliterate?.OBC || 0,
                noFemaleBplIlliterateOthers: surveyData.demographicProfile.femaleBplIlliterate?.Others || 0,
                noFemaleBplIlliterateTotal: surveyData.demographicProfile.femaleBplIlliterate?.Total || 0,
                noFemaleBplIlliterateMinorities: surveyData.demographicProfile.femaleBplIlliterate?.Minorities || 0,
                
                // School Dropouts Male
                schoolDropoutsMaleSC: surveyData.demographicProfile.schoolDropoutsMale?.SC || 0,
                schoolDropoutsMaleST: surveyData.demographicProfile.schoolDropoutsMale?.ST || 0,
                schoolDropoutsMaleOBC: surveyData.demographicProfile.schoolDropoutsMale?.OBC || 0,
                schoolDropoutsMaleOthers: surveyData.demographicProfile.schoolDropoutsMale?.Others || 0,
                schoolDropoutsMaleTotal: surveyData.demographicProfile.schoolDropoutsMale?.Total || 0,
                schoolDropoutsMaleMinorities: surveyData.demographicProfile.schoolDropoutsMale?.Minorities || 0,
                
                // School Dropouts Female
                schoolDropoutsFemaleSC: surveyData.demographicProfile.schoolDropoutsFemale?.SC || 0,
                schoolDropoutsFemaleST: surveyData.demographicProfile.schoolDropoutsFemale?.ST || 0,
                schoolDropoutsFemaleOBC: surveyData.demographicProfile.schoolDropoutsFemale?.OBC || 0,
                schoolDropoutsFemaleOthers: surveyData.demographicProfile.schoolDropoutsFemale?.Others || 0,
                schoolDropoutsFemaleTotal: surveyData.demographicProfile.schoolDropoutsFemale?.Total || 0,
                schoolDropoutsFemaleMinorities: surveyData.demographicProfile.schoolDropoutsFemale?.Minorities || 0,

                // Number of BPL Households (from demographicProfile.numberOfBplHouseholds)
                noBplHouseholdsSC: surveyData.demographicProfile.numberOfBplHouseholds?.SC || 0,
                noBplHouseholdsST: surveyData.demographicProfile.numberOfBplHouseholds?.ST || 0,
                noBplHouseholdsOBC: surveyData.demographicProfile.numberOfBplHouseholds?.OBC || 0,
                noBplHouseholdsOthers: surveyData.demographicProfile.numberOfBplHouseholds?.Others || 0,
                noBplHouseholdsTotal: surveyData.demographicProfile.numberOfBplHouseholds?.Total || 0,
                noBplHouseholdsMinorities: surveyData.demographicProfile.numberOfBplHouseholds?.Minorities || 0,
                
                // Number of Households (from demographicProfile.numberOfHouseholds)
                noHouseholdsSlumSC: surveyData.demographicProfile.numberOfHouseholds?.SC || 0,
                noHouseholdsSlumST: surveyData.demographicProfile.numberOfHouseholds?.ST || 0,
                noHouseholdsSlumOBC: surveyData.demographicProfile.numberOfHouseholds?.OBC || 0,
                noHouseholdsSlumOthers: surveyData.demographicProfile.numberOfHouseholds?.Others || 0,
                noHouseholdsSlum: surveyData.demographicProfile.numberOfHouseholds?.Total || 0,
                noHouseholdsSlumMinorities: surveyData.demographicProfile.numberOfHouseholds?.Minorities || 0,
                
                // Women Headed Households
                noWomenHeadedHouseholds: surveyData.demographicProfile.womenHeadedHouseholds?.Total || 0,
                noWomenHeadedHouseholdsSC: surveyData.demographicProfile.womenHeadedHouseholds?.SC || 0,
                noWomenHeadedHouseholdsST: surveyData.demographicProfile.womenHeadedHouseholds?.ST || 0,
                noWomenHeadedHouseholdsOBC: surveyData.demographicProfile.womenHeadedHouseholds?.OBC || 0,
                noWomenHeadedHouseholdsOthers: surveyData.demographicProfile.womenHeadedHouseholds?.Others || 0,
                noWomenHeadedHouseholdsTotal: surveyData.demographicProfile.womenHeadedHouseholds?.Total || 0,
                noWomenHeadedHouseholdsMinorities: surveyData.demographicProfile.womenHeadedHouseholds?.Minorities || 0,
                
                // Persons Older Than 65 Years
                noPersonsOlder65: surveyData.demographicProfile.personsOlderThan65Years?.Total || 0,
                noPersonsOlder65SC: surveyData.demographicProfile.personsOlderThan65Years?.SC || 0,
                noPersonsOlder65ST: surveyData.demographicProfile.personsOlderThan65Years?.ST || 0,
                noPersonsOlder65OBC: surveyData.demographicProfile.personsOlderThan65Years?.OBC || 0,
                noPersonsOlder65Others: surveyData.demographicProfile.personsOlderThan65Years?.Others || 0,
                noPersonsOlder65Total: surveyData.demographicProfile.personsOlderThan65Years?.Total || 0,
                noPersonsOlder65Minorities: surveyData.demographicProfile.personsOlderThan65Years?.Minorities || 0,
                
                // Child Labourers
                noChildLabourers: surveyData.demographicProfile.childLabourers?.Total || 0,
                noChildLabourersSC: surveyData.demographicProfile.childLabourers?.SC || 0,
                noChildLabourersST: surveyData.demographicProfile.childLabourers?.ST || 0,
                noChildLabourersOBC: surveyData.demographicProfile.childLabourers?.OBC || 0,
                noChildLabourersOthers: surveyData.demographicProfile.childLabourers?.Others || 0,
                noChildLabourersTotal: surveyData.demographicProfile.childLabourers?.Total || 0,
                noChildLabourersMinorities: surveyData.demographicProfile.childLabourers?.Minorities || 0,
                
                // Physically Challenged Persons
                noPhysicallyChallenged: surveyData.demographicProfile.physicallyChallengedPersons?.Total || 0,
                noPhysicallyChallengedSC: surveyData.demographicProfile.physicallyChallengedPersons?.SC || 0,
                noPhysicallyChallengedST: surveyData.demographicProfile.physicallyChallengedPersons?.ST || 0,
                noPhysicallyChallengedOBC: surveyData.demographicProfile.physicallyChallengedPersons?.OBC || 0,
                noPhysicallyChallengedOthers: surveyData.demographicProfile.physicallyChallengedPersons?.Others || 0,
                noPhysicallyChallengedTotal: surveyData.demographicProfile.physicallyChallengedPersons?.Total || 0,
                noPhysicallyChallengedMinorities: surveyData.demographicProfile.physicallyChallengedPersons?.Minorities || 0,
                
                // Mentally Challenged Persons
                noMentallyChallenged: surveyData.demographicProfile.mentallyChallengedPersons?.Total || 0,
                noMentallyChallengedSC: surveyData.demographicProfile.mentallyChallengedPersons?.SC || 0,
                noMentallyChallengedST: surveyData.demographicProfile.mentallyChallengedPersons?.ST || 0,
                noMentallyChallengedOBC: surveyData.demographicProfile.mentallyChallengedPersons?.OBC || 0,
                noMentallyChallengedOthers: surveyData.demographicProfile.mentallyChallengedPersons?.Others || 0,
                noMentallyChallengedTotal: surveyData.demographicProfile.mentallyChallengedPersons?.Total || 0,
                noMentallyChallengedMinorities: surveyData.demographicProfile.mentallyChallengedPersons?.Minorities || 0,
                
                // HIV/AIDS
                noPersonsHivaids: surveyData.demographicProfile.personsWithHivAids?.Total || 0,
                noPersonsHivaidsSC: surveyData.demographicProfile.personsWithHivAids?.SC || 0,
                noPersonsHivaidsST: surveyData.demographicProfile.personsWithHivAids?.ST || 0,
                noPersonsHivaidsOBC: surveyData.demographicProfile.personsWithHivAids?.OBC || 0,
                noPersonsHivaidsOthers: surveyData.demographicProfile.personsWithHivAids?.Others || 0,
                noPersonsHivaidsTotal: surveyData.demographicProfile.personsWithHivAids?.Total || 0,
                noPersonsHivaidsMinorities: surveyData.demographicProfile.personsWithHivAids?.Minorities || 0,
                
                // Tuberculosis
                noPersonsTuberculosis: surveyData.demographicProfile.personsWithTuberculosis?.Total || 0,
                noPersonsTuberculosisSC: surveyData.demographicProfile.personsWithTuberculosis?.SC || 0,
                noPersonsTuberculosisST: surveyData.demographicProfile.personsWithTuberculosis?.ST || 0,
                noPersonsTuberculosisOBC: surveyData.demographicProfile.personsWithTuberculosis?.OBC || 0,
                noPersonsTuberculosisOthers: surveyData.demographicProfile.personsWithTuberculosis?.Others || 0,
                noPersonsTuberculosisTotal: surveyData.demographicProfile.personsWithTuberculosis?.Total || 0,
                noPersonsTuberculosisMinorities: surveyData.demographicProfile.personsWithTuberculosis?.Minorities || 0,
                
                // Respiratory Diseases
                noPersonsRespiratory: surveyData.demographicProfile.personsWithRespiratoryDiseases?.Total || 0,
                noPersonsRespiratorySC: surveyData.demographicProfile.personsWithRespiratoryDiseases?.SC || 0,
                noPersonsRespiratoryST: surveyData.demographicProfile.personsWithRespiratoryDiseases?.ST || 0,
                noPersonsRespiratoryOBC: surveyData.demographicProfile.personsWithRespiratoryDiseases?.OBC || 0,
                noPersonsRespiratoryOthers: surveyData.demographicProfile.personsWithRespiratoryDiseases?.Others || 0,
                noPersonsRespiratoryTotal: surveyData.demographicProfile.personsWithRespiratoryDiseases?.Total || 0,
                noPersonsRespiratoryMinorities: surveyData.demographicProfile.personsWithRespiratoryDiseases?.Minorities || 0,
                
                // Other Chronic Diseases
                noPersonsOtherChronic: surveyData.demographicProfile.personsWithOtherChronicDiseases?.Total || 0,
                noPersonsOtherChronicSC: surveyData.demographicProfile.personsWithOtherChronicDiseases?.SC || 0,
                noPersonsOtherChronicST: surveyData.demographicProfile.personsWithOtherChronicDiseases?.ST || 0,
                noPersonsOtherChronicOBC: surveyData.demographicProfile.personsWithOtherChronicDiseases?.OBC || 0,
                noPersonsOtherChronicOthers: surveyData.demographicProfile.personsWithOtherChronicDiseases?.Others || 0,
                noPersonsOtherChronicTotal: surveyData.demographicProfile.personsWithOtherChronicDiseases?.Total || 0,
                noPersonsOtherChronicMinorities: surveyData.demographicProfile.personsWithOtherChronicDiseases?.Minorities || 0,
              }));
            }
            
            // Load employment and occupation data
            if (surveyData.employmentAndOccupation) {
              setFormData(prev => ({
                ...prev,
                occupationalStatus: {
                  selfEmployed: surveyData.employmentAndOccupation.selfEmployed || 0,
                  salaried: surveyData.employmentAndOccupation.salaried || 0,
                  regularWage: surveyData.employmentAndOccupation.regularWage || 0,
                  casualLabour: surveyData.employmentAndOccupation.casualLabour || 0,
                  others: surveyData.employmentAndOccupation.others || 0,
                },
                majorIndustriesPresent: surveyData.employmentAndOccupation.majorIndustriesPresent || [],
              }));
            }
            
            if (surveyData.additionalInfrastructure) {
              setFormData(prev => ({
                ...prev,
                // Water Supply
                waterSupplyPipelinesExisting: surveyData.additionalInfrastructure.waterSupply?.pipelines?.existing || "",
                waterSupplyPipelinesAdditional: surveyData.additionalInfrastructure.waterSupply?.pipelines?.additionalRequirement || "",
                waterSupplyPipelinesCost: surveyData.additionalInfrastructure.waterSupply?.pipelines?.estimatedCost || 0,
                
                waterSupplyIndividualTapsExisting: surveyData.additionalInfrastructure.waterSupply?.individualTaps?.existing || "",
                waterSupplyIndividualTapsAdditional: surveyData.additionalInfrastructure.waterSupply?.individualTaps?.additionalRequirement || "",
                waterSupplyIndividualTapsCost: surveyData.additionalInfrastructure.waterSupply?.individualTaps?.estimatedCost || 0,
                
                waterSupplyBorewellsExisting: surveyData.additionalInfrastructure.waterSupply?.borewells?.existing || "",
                waterSupplyBorewellsAdditional: surveyData.additionalInfrastructure.waterSupply?.borewells?.additionalRequirement || "",
                waterSupplyBorewellsCost: surveyData.additionalInfrastructure.waterSupply?.borewells?.estimatedCost || 0,
                
                waterSupplyConnectivityTrunkLinesExisting: surveyData.additionalInfrastructure.waterSupply?.connectivityToTrunkLines?.existing || "",
                waterSupplyConnectivityTrunkLinesAdditional: surveyData.additionalInfrastructure.waterSupply?.connectivityToTrunkLines?.additionalRequirement || "",
                waterSupplyConnectivityTrunkLinesCost: surveyData.additionalInfrastructure.waterSupply?.connectivityToTrunkLines?.estimatedCost || 0,
                
                // Drainage/Sewerage
                drainageStormwaterDrainageExisting: surveyData.additionalInfrastructure.drainageSewerage?.stormwaterDrainage?.existing || "",
                drainageStormwaterDrainageAdditional: surveyData.additionalInfrastructure.drainageSewerage?.stormwaterDrainage?.additionalRequirement || "",
                drainageStormwaterDrainageCost: surveyData.additionalInfrastructure.drainageSewerage?.stormwaterDrainage?.estimatedCost || 0,
                
                drainageConnectivityMainDrainsExisting: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToMainDrains?.existing || "",
                drainageConnectivityMainDrainsAdditional: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToMainDrains?.additionalRequirement || "",
                drainageConnectivityMainDrainsCost: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToMainDrains?.estimatedCost || 0,
                
                drainageSewerLinesExisting: surveyData.additionalInfrastructure.drainageSewerage?.sewerLines?.existing || "",
                drainageSewerLinesAdditional: surveyData.additionalInfrastructure.drainageSewerage?.sewerLines?.additionalRequirement || "",
                drainageSewerLinesCost: surveyData.additionalInfrastructure.drainageSewerage?.sewerLines?.estimatedCost || 0,
                
                drainageConnectivityTrunkSewersExisting: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToTrunkSewers?.existing || "",
                drainageConnectivityTrunkSewersAdditional: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToTrunkSewers?.additionalRequirement || "",
                drainageConnectivityTrunkSewersCost: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToTrunkSewers?.estimatedCost || 0,
                
                // Roads
                roadsInternalRoadsCCExisting: surveyData.additionalInfrastructure.roads?.internalRoadsCC?.existing || "",
                roadsInternalRoadsCCAdditional: surveyData.additionalInfrastructure.roads?.internalRoadsCC?.additionalRequirement || "",
                roadsInternalRoadsCCCost: surveyData.additionalInfrastructure.roads?.internalRoadsCC?.estimatedCost || 0,
                
                roadsInternalRoadsBTExisting: surveyData.additionalInfrastructure.roads?.internalRoadsBT?.existing || "",
                roadsInternalRoadsBTAdditional: surveyData.additionalInfrastructure.roads?.internalRoadsBT?.additionalRequirement || "",
                roadsInternalRoadsBTCost: surveyData.additionalInfrastructure.roads?.internalRoadsBT?.estimatedCost || 0,
                
                roadsInternalRoadsOthersExisting: surveyData.additionalInfrastructure.roads?.internalRoadsOthers?.existing || "",
                roadsInternalRoadsOthersAdditional: surveyData.additionalInfrastructure.roads?.internalRoadsOthers?.additionalRequirement || "",
                roadsInternalRoadsOthersCost: surveyData.additionalInfrastructure.roads?.internalRoadsOthers?.estimatedCost || 0,
                
                roadsApproachRoadsCCExisting: surveyData.additionalInfrastructure.roads?.approachRoadsCC?.existing || "",
                roadsApproachRoadsCCAdditional: surveyData.additionalInfrastructure.roads?.approachRoadsCC?.additionalRequirement || "",
                roadsApproachRoadsCCCost: surveyData.additionalInfrastructure.roads?.approachRoadsCC?.estimatedCost || 0,
                
                roadsApproachRoadsOthersExisting: surveyData.additionalInfrastructure.roads?.approachRoadsOthers?.existing || "",
                roadsApproachRoadsOthersAdditional: surveyData.additionalInfrastructure.roads?.approachRoadsOthers?.additionalRequirement || "",
                roadsApproachRoadsOthersCost: surveyData.additionalInfrastructure.roads?.approachRoadsOthers?.estimatedCost || 0,
                
                // Street Lighting
                streetLightingPolesExisting: surveyData.additionalInfrastructure.streetLighting?.poles?.existing || "",
                streetLightingPolesAdditional: surveyData.additionalInfrastructure.streetLighting?.poles?.additionalRequirement || "",
                streetLightingPolesCost: surveyData.additionalInfrastructure.streetLighting?.poles?.estimatedCost || 0,
                
                streetLightingLightsExisting: surveyData.additionalInfrastructure.streetLighting?.lights?.existing || "",
                streetLightingLightsAdditional: surveyData.additionalInfrastructure.streetLighting?.lights?.additionalRequirement || "",
                streetLightingLightsCost: surveyData.additionalInfrastructure.streetLighting?.lights?.estimatedCost || 0,
                
                // Sanitation
                sanitationIndividualToiletsExisting: surveyData.additionalInfrastructure.sanitation?.individualToilets?.existing || "",
                sanitationIndividualToiletsAdditional: surveyData.additionalInfrastructure.sanitation?.individualToilets?.additionalRequirement || "",
                sanitationIndividualToiletsCost: surveyData.additionalInfrastructure.sanitation?.individualToilets?.estimatedCost || 0,
                
                sanitationCommunityToiletsExisting: surveyData.additionalInfrastructure.sanitation?.communityToilets?.existing || "",
                sanitationCommunityToiletsAdditional: surveyData.additionalInfrastructure.sanitation?.communityToilets?.additionalRequirement || "",
                sanitationCommunityToiletsCost: surveyData.additionalInfrastructure.sanitation?.communityToilets?.estimatedCost || 0,
                
                sanitationSeatsCommunityToiletsExisting: surveyData.additionalInfrastructure.sanitation?.seatsInCommunityToilets?.existing || "",
                sanitationSeatsCommunityToiletsAdditional: surveyData.additionalInfrastructure.sanitation?.seatsInCommunityToilets?.additionalRequirement || "",
                sanitationSeatsCommunityToiletsCost: surveyData.additionalInfrastructure.sanitation?.seatsInCommunityToilets?.estimatedCost || 0,
                
                sanitationDumperBinsExisting: surveyData.additionalInfrastructure.sanitation?.dumperBins?.existing || "",
                sanitationDumperBinsAdditional: surveyData.additionalInfrastructure.sanitation?.dumperBins?.additionalRequirement || "",
                sanitationDumperBinsCost: surveyData.additionalInfrastructure.sanitation?.dumperBins?.estimatedCost || 0,
                
                // Community Facilities
                communityHallsExisting: surveyData.additionalInfrastructure.communityFacilities?.communityHalls?.existing || "",
                communityHallsAdditional: surveyData.additionalInfrastructure.communityFacilities?.communityHalls?.additionalRequirement || "",
                communityHallsCost: surveyData.additionalInfrastructure.communityFacilities?.communityHalls?.estimatedCost || 0,
                
                communityLivelihoodCentresExisting: surveyData.additionalInfrastructure.communityFacilities?.livelihoodCentres?.existing || "",
                communityLivelihoodCentresAdditional: surveyData.additionalInfrastructure.communityFacilities?.livelihoodCentres?.additionalRequirement || "",
                communityLivelihoodCentresCost: surveyData.additionalInfrastructure.communityFacilities?.livelihoodCentres?.estimatedCost || 0,
                
                communityAnganwadisExisting: surveyData.additionalInfrastructure.communityFacilities?.anganwadis?.existing || "",
                communityAnganwadisAdditional: surveyData.additionalInfrastructure.communityFacilities?.anganwadis?.additionalRequirement || "",
                communityAnganwadisCost: surveyData.additionalInfrastructure.communityFacilities?.anganwadis?.estimatedCost || 0,
                
                communityPrimarySchoolsExisting: surveyData.additionalInfrastructure.communityFacilities?.primarySchools?.existing || "",
                communityPrimarySchoolsAdditional: surveyData.additionalInfrastructure.communityFacilities?.primarySchools?.additionalRequirement || "",
                communityPrimarySchoolsCost: surveyData.additionalInfrastructure.communityFacilities?.primarySchools?.estimatedCost || 0,
                
                communityHealthCentresExisting: surveyData.additionalInfrastructure.communityFacilities?.healthCentres?.existing || "",
                communityHealthCentresAdditional: surveyData.additionalInfrastructure.communityFacilities?.healthCentres?.additionalRequirement || "",
                communityHealthCentresCost: surveyData.additionalInfrastructure.communityFacilities?.healthCentres?.estimatedCost || 0,
                
                communityOthersExisting: surveyData.additionalInfrastructure.communityFacilities?.others?.existing || "",
                communityOthersAdditional: surveyData.additionalInfrastructure.communityFacilities?.others?.additionalRequirement || "",
                communityOthersCost: surveyData.additionalInfrastructure.communityFacilities?.others?.estimatedCost || 0,
              }));
            }
            
            if (surveyData.generalInformation) {
              setFormData(prev => ({
                ...prev,
                stateCode: surveyData.generalInformation.stateCode || "",
                stateName: surveyData.generalInformation.stateName || "",
                districtCode: surveyData.generalInformation.districtCode || "",
                districtName: surveyData.generalInformation.districtName || "",
                cityTownCode: surveyData.generalInformation.cityTownCode || "",
                cityTownName: surveyData.generalInformation.cityTownName || "",
                cityTown: surveyData.generalInformation.cityTown || "",
                cityTownNoHouseholds: surveyData.generalInformation.cityTownNoHouseholds || 0,
              }));
            }
            
            if (surveyData.cityTownSlumProfile) {
              setFormData(prev => ({
                ...prev,
                slumType: surveyData.cityTownSlumProfile.slumType || "",
                slumIdField: surveyData.cityTownSlumProfile.slumIdField || "",
                slumName: surveyData.cityTownSlumProfile.slumName || "",
                ownershipLand: surveyData.cityTownSlumProfile.ownershipLand || "",
                areaSqMtrs: surveyData.cityTownSlumProfile.areaSqMtrs || 0,
                slumPopulation: surveyData.cityTownSlumProfile.slumPopulation || 0,
                noSlumHouseholds: surveyData.cityTownSlumProfile.noSlumHouseholds || 0,
                bplPopulation: surveyData.cityTownSlumProfile.bplPopulation || 0,
                noBplHouseholdsCityTown: surveyData.cityTownSlumProfile.noBplHouseholdsCityTown || 0,
              }));
            }
            
            if (surveyData.surveyOperation) {
              setFormData(prev => ({
                ...prev,
                surveyorName: surveyData.surveyOperation.surveyorName || "",
                surveyDate: surveyData.surveyOperation.surveyDate || "",
                receiptQuestionnaireDate: surveyData.surveyOperation.receiptQuestionnaireDate || "",
                scrutinyDate: surveyData.surveyOperation.scrutinyDate || "",
                receiptByNodalCellDate: surveyData.surveyOperation.receiptByNodalCellDate || "",
                remarksInvestigator: surveyData.surveyOperation.remarksInvestigator || "",
                commentsSupervisor: surveyData.surveyOperation.commentsSupervisor || "",
              }));
            }
          } else {
            showToast("Failed to load/create slum survey", "error");
          }
        } else {
          showToast("Failed to load assignment details", "error");
          router.push("/surveyor/dashboard");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        showToast("Failed to load data", "error");
        router.push("/surveyor/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) loadData();
  }, [assignmentId, router, showToast]);



  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof SlumSurveyForm] as any || {}),
        [childField]: value,
      },
    }));
  };

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData((prev) => {
      const current = prev[field as keyof SlumSurveyForm] as string[];
      if (current?.includes(value)) {
        return {
          ...prev,
          [field]: current.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [field]: [...(current || []), value],
        };
      }
    });
  };

  // Validation functions
  const validateForm = (): FieldError[] => {
    const newErrors: FieldError[] = [];
    
    // Part A - General Information - City/Town
    if (!formData.cityTownCode?.trim()) {
      newErrors.push({ field: 'cityTownCode', message: 'City/Town Code is required' });
    }
    if (!formData.cityTownName?.trim()) {
      newErrors.push({ field: 'cityTownName', message: 'City/Town Name is required' });
    }
    if (formData.cityTownNoHouseholds === undefined || formData.cityTownNoHouseholds === null || isNaN(formData.cityTownNoHouseholds) || formData.cityTownNoHouseholds < 0) {
      newErrors.push({ field: 'cityTownNoHouseholds', message: 'City/Town No. of Households is required' });
    }
    
    // Part B - City/Town Slum Profile
    if (!formData.slumType) {
      newErrors.push({ field: 'slumType', message: 'Slum Type is required' });
    }
    if (!formData.slumIdField?.trim()) {
      newErrors.push({ field: 'slumIdField', message: 'Slum ID is required' });
    }
    if (!formData.ownershipLand) {
      newErrors.push({ field: 'ownershipLand', message: 'Ownership of Land is required' });
    }
    if (formData.areaSqMtrs === undefined || formData.areaSqMtrs === null || isNaN(formData.areaSqMtrs) || formData.areaSqMtrs < 0) {
      newErrors.push({ field: 'areaSqMtrs', message: 'Area (sq Mtrs) is required' });
    }
    if (formData.slumPopulation === undefined || formData.slumPopulation === null || isNaN(formData.slumPopulation) || formData.slumPopulation < 0) {
      newErrors.push({ field: 'slumPopulation', message: 'Slum Population is required' });
    }
    if (formData.noSlumHouseholds === undefined || formData.noSlumHouseholds === null || isNaN(formData.noSlumHouseholds) || formData.noSlumHouseholds < 0) {
      newErrors.push({ field: 'noSlumHouseholds', message: 'No. of Slum Households is required' });
    }
    if (formData.bplPopulation === undefined || formData.bplPopulation === null || isNaN(formData.bplPopulation) || formData.bplPopulation < 0) {
      newErrors.push({ field: 'bplPopulation', message: 'BPL Population is required' });
    }
    if (formData.noBplHouseholdsSlum === undefined || formData.noBplHouseholdsSlum === null || isNaN(formData.noBplHouseholdsSlum) || formData.noBplHouseholdsSlum < 0) {
      newErrors.push({ field: 'noBplHouseholdsSlum', message: 'No. of BPL Households is required' });
    }
    
    // Part C - Particulars of Survey Operation
    if (!formData.surveyorName?.trim()) {
      newErrors.push({ field: 'surveyorName', message: 'Surveyor Name is required' });
    }
    if (!formData.surveyDate) {
      newErrors.push({ field: 'surveyDate', message: 'Survey Date is required' });
    }
    if (!formData.receiptQuestionnaireDate) {
      newErrors.push({ field: 'receiptQuestionnaireDate', message: 'Receipt of Questionnaire Date is required' });
    }
    if (!formData.scrutinyDate) {
      newErrors.push({ field: 'scrutinyDate', message: 'Scrutiny Date is required' });
    }
    if (!formData.receiptByNodalCellDate) {
      newErrors.push({ field: 'receiptByNodalCellDate', message: 'Receipt by Nodal Cell Date is required' });
    }
    
    // Part D - Basic Information on Slum
    if (!formData.slumCode?.trim()) {
      newErrors.push({ field: 'slumCode', message: 'Slum Code is required' });
    }
    if (!formData.locationWard?.trim()) {
      newErrors.push({ field: 'locationWard', message: 'Location Ward is required' });
    }
    if (formData.ageSlumYears === undefined || formData.ageSlumYears === null || isNaN(formData.ageSlumYears) || formData.ageSlumYears < 0) {
      newErrors.push({ field: 'ageSlumYears', message: 'Age of Slum (Years) is required' });
    }
    if (formData.areaSlumSqMtrs === undefined || formData.areaSlumSqMtrs === null || isNaN(formData.areaSlumSqMtrs) || formData.areaSlumSqMtrs < 0) {
      newErrors.push({ field: 'areaSlumSqMtrs', message: 'Area of Slum (sq Mtrs) is required' });
    }
    if (!formData.locationCoreOrFringe) {
      newErrors.push({ field: 'locationCoreOrFringe', message: 'Location - Core City/Town or Fringe Area is required' });
    }
    if (!formData.typeAreaSurrounding) {
      newErrors.push({ field: 'typeAreaSurrounding', message: 'Type of Area Surrounding is required' });
    }
    if (!formData.physicalLocationSlum) {
      newErrors.push({ field: 'physicalLocationSlum', message: 'Physical Location of Slum is required' });
    }
    if (!formData.isSlumNotified) {
      newErrors.push({ field: 'isSlumNotified', message: 'Is Slum Notified? is required' });
    }
    if (formData.isSlumNotified === 'YES' && (formData.yearOfNotification === undefined || formData.yearOfNotification === null || isNaN(formData.yearOfNotification) || formData.yearOfNotification < 0)) {
      newErrors.push({ field: 'yearOfNotification', message: 'Year of Notification is required when Slum is Notified' });
    }
    
    // Part E - Land Status
    if (!formData.ownershipLandDetail) {
      newErrors.push({ field: 'ownershipLandDetail', message: 'Ownership of Land is required' });
    }
    if (!formData.ownershipLandSpecify?.trim()) {
      newErrors.push({ field: 'ownershipLandSpecify', message: 'Specify Ownership (if Other) is required' });
    }
    
    // Part F - Demographic Profile
    if (formData.totalPopulationSlumSC === undefined || formData.totalPopulationSlumSC === null || isNaN(formData.totalPopulationSlumSC) || formData.totalPopulationSlumSC < 0) {
      newErrors.push({ field: 'totalPopulationSlumSC', message: 'Total Population SC is required' });
    }
    if (formData.totalPopulationSlumST === undefined || formData.totalPopulationSlumST === null || isNaN(formData.totalPopulationSlumST) || formData.totalPopulationSlumST < 0) {
      newErrors.push({ field: 'totalPopulationSlumST', message: 'Total Population ST is required' });
    }
    if (formData.totalPopulationSlumOBC === undefined || formData.totalPopulationSlumOBC === null || isNaN(formData.totalPopulationSlumOBC) || formData.totalPopulationSlumOBC < 0) {
      newErrors.push({ field: 'totalPopulationSlumOBC', message: 'Total Population OBC is required' });
    }
    if (formData.totalPopulationSlumOthers === undefined || formData.totalPopulationSlumOthers === null || isNaN(formData.totalPopulationSlumOthers) || formData.totalPopulationSlumOthers < 0) {
      newErrors.push({ field: 'totalPopulationSlumOthers', message: 'Total Population Others is required' });
    }
    if (formData.totalPopulationSlum === undefined || formData.totalPopulationSlum === null || isNaN(formData.totalPopulationSlum) || formData.totalPopulationSlum < 0) {
      newErrors.push({ field: 'totalPopulationSlum', message: 'Total Population is required' });
    }
    if (formData.totalPopulationSlumMinorities === undefined || formData.totalPopulationSlumMinorities === null || isNaN(formData.totalPopulationSlumMinorities) || formData.totalPopulationSlumMinorities < 0) {
      newErrors.push({ field: 'totalPopulationSlumMinorities', message: 'Total Population Minorities is required' });
    }
    
    if (formData.bplPopulationSlumSC === undefined || formData.bplPopulationSlumSC === null || isNaN(formData.bplPopulationSlumSC) || formData.bplPopulationSlumSC < 0) {
      newErrors.push({ field: 'bplPopulationSlumSC', message: 'BPL Population SC is required' });
    }
    if (formData.bplPopulationSlumST === undefined || formData.bplPopulationSlumST === null || isNaN(formData.bplPopulationSlumST) || formData.bplPopulationSlumST < 0) {
      newErrors.push({ field: 'bplPopulationSlumST', message: 'BPL Population ST is required' });
    }
    if (formData.bplPopulationSlumOBC === undefined || formData.bplPopulationSlumOBC === null || isNaN(formData.bplPopulationSlumOBC) || formData.bplPopulationSlumOBC < 0) {
      newErrors.push({ field: 'bplPopulationSlumOBC', message: 'BPL Population OBC is required' });
    }
    if (formData.bplPopulationSlumOthers === undefined || formData.bplPopulationSlumOthers === null || isNaN(formData.bplPopulationSlumOthers) || formData.bplPopulationSlumOthers < 0) {
      newErrors.push({ field: 'bplPopulationSlumOthers', message: 'BPL Population Others is required' });
    }
    if (formData.bplPopulationSlum === undefined || formData.bplPopulationSlum === null || isNaN(formData.bplPopulationSlum) || formData.bplPopulationSlum < 0) {
      newErrors.push({ field: 'bplPopulationSlum', message: 'BPL Population is required' });
    }
    if (formData.bplPopulationSlumMinorities === undefined || formData.bplPopulationSlumMinorities === null || isNaN(formData.bplPopulationSlumMinorities) || formData.bplPopulationSlumMinorities < 0) {
      newErrors.push({ field: 'bplPopulationSlumMinorities', message: 'BPL Population Minorities is required' });
    }
    
    if (formData.noHouseholdsSlumSC === undefined || formData.noHouseholdsSlumSC === null || isNaN(formData.noHouseholdsSlumSC) || formData.noHouseholdsSlumSC < 0) {
      newErrors.push({ field: 'noHouseholdsSlumSC', message: 'No. of Households SC is required' });
    }
    if (formData.noHouseholdsSlumST === undefined || formData.noHouseholdsSlumST === null || isNaN(formData.noHouseholdsSlumST) || formData.noHouseholdsSlumST < 0) {
      newErrors.push({ field: 'noHouseholdsSlumST', message: 'No. of Households ST is required' });
    }
    if (formData.noHouseholdsSlumOBC === undefined || formData.noHouseholdsSlumOBC === null || isNaN(formData.noHouseholdsSlumOBC) || formData.noHouseholdsSlumOBC < 0) {
      newErrors.push({ field: 'noHouseholdsSlumOBC', message: 'No. of Households OBC is required' });
    }
    if (formData.noHouseholdsSlumOthers === undefined || formData.noHouseholdsSlumOthers === null || isNaN(formData.noHouseholdsSlumOthers) || formData.noHouseholdsSlumOthers < 0) {
      newErrors.push({ field: 'noHouseholdsSlumOthers', message: 'No. of Households Others is required' });
    }
    if (formData.noHouseholdsSlum === undefined || formData.noHouseholdsSlum === null || isNaN(formData.noHouseholdsSlum) || formData.noHouseholdsSlum < 0) {
      newErrors.push({ field: 'noHouseholdsSlum', message: 'No. of Households is required' });
    }
    if (formData.noHouseholdsSlumMinorities === undefined || formData.noHouseholdsSlumMinorities === null || isNaN(formData.noHouseholdsSlumMinorities) || formData.noHouseholdsSlumMinorities < 0) {
      newErrors.push({ field: 'noHouseholdsSlumMinorities', message: 'No. of Households Minorities is required' });
    }
    
    // Part H - Housing Status
    if (formData.dwellingUnitsPucca === undefined || formData.dwellingUnitsPucca === null || isNaN(formData.dwellingUnitsPucca) || formData.dwellingUnitsPucca < 0) {
      newErrors.push({ field: 'dwellingUnitsPucca', message: 'Dwelling Units - Pucca is required' });
    }
    if (formData.dwellingUnitsSemiPucca === undefined || formData.dwellingUnitsSemiPucca === null || isNaN(formData.dwellingUnitsSemiPucca) || formData.dwellingUnitsSemiPucca < 0) {
      newErrors.push({ field: 'dwellingUnitsSemiPucca', message: 'Dwelling Units - Semi-Pucca is required' });
    }
    if (formData.dwellingUnitsKatcha === undefined || formData.dwellingUnitsKatcha === null || isNaN(formData.dwellingUnitsKatcha) || formData.dwellingUnitsKatcha < 0) {
      newErrors.push({ field: 'dwellingUnitsKatcha', message: 'Dwelling Units - Katcha is required' });
    }
    if (formData.dwellingUnitsTotal === undefined || formData.dwellingUnitsTotal === null || isNaN(formData.dwellingUnitsTotal) || formData.dwellingUnitsTotal < 0) {
      newErrors.push({ field: 'dwellingUnitsTotal', message: 'Dwelling Units - Total is required' });
    }
    if (formData.landTenureWithPatta === undefined || formData.landTenureWithPatta === null || isNaN(formData.landTenureWithPatta) || formData.landTenureWithPatta < 0) {
      newErrors.push({ field: 'landTenureWithPatta', message: 'Land Tenure With Patta is required' });
    }
    
    // Additional Infrastructure Requirements
    // Water Supply
    if (!formData.waterSupplyPipelinesExisting) {
      newErrors.push({ field: 'waterSupplyPipelinesExisting', message: 'Water Supply Pipelines - Existing is required' });
    }
    if (!formData.waterSupplyPipelinesAdditional) {
      newErrors.push({ field: 'waterSupplyPipelinesAdditional', message: 'Water Supply Pipelines - Additional Requirement is required' });
    }
    if (formData.waterSupplyPipelinesAdditional === 'Yes' && (formData.waterSupplyPipelinesCost === undefined || formData.waterSupplyPipelinesCost === null || isNaN(formData.waterSupplyPipelinesCost) || formData.waterSupplyPipelinesCost < 0)) {
      newErrors.push({ field: 'waterSupplyPipelinesCost', message: 'Water Supply Pipelines - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.waterSupplyIndividualTapsExisting) {
      newErrors.push({ field: 'waterSupplyIndividualTapsExisting', message: 'Water Supply Individual Taps - Existing is required' });
    }
    if (!formData.waterSupplyIndividualTapsAdditional) {
      newErrors.push({ field: 'waterSupplyIndividualTapsAdditional', message: 'Water Supply Individual Taps - Additional Requirement is required' });
    }
    if (formData.waterSupplyIndividualTapsAdditional === 'Yes' && (formData.waterSupplyIndividualTapsCost === undefined || formData.waterSupplyIndividualTapsCost === null || isNaN(formData.waterSupplyIndividualTapsCost) || formData.waterSupplyIndividualTapsCost < 0)) {
      newErrors.push({ field: 'waterSupplyIndividualTapsCost', message: 'Water Supply Individual Taps - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.waterSupplyBorewellsExisting) {
      newErrors.push({ field: 'waterSupplyBorewellsExisting', message: 'Water Supply Borewells - Existing is required' });
    }
    if (!formData.waterSupplyBorewellsAdditional) {
      newErrors.push({ field: 'waterSupplyBorewellsAdditional', message: 'Water Supply Borewells - Additional Requirement is required' });
    }
    if (formData.waterSupplyBorewellsAdditional === 'Yes' && (formData.waterSupplyBorewellsCost === undefined || formData.waterSupplyBorewellsCost === null || isNaN(formData.waterSupplyBorewellsCost) || formData.waterSupplyBorewellsCost < 0)) {
      newErrors.push({ field: 'waterSupplyBorewellsCost', message: 'Water Supply Borewells - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.waterSupplyConnectivityTrunkLinesExisting) {
      newErrors.push({ field: 'waterSupplyConnectivityTrunkLinesExisting', message: 'Water Supply Connectivity to Trunk Lines - Existing is required' });
    }
    if (!formData.waterSupplyConnectivityTrunkLinesAdditional) {
      newErrors.push({ field: 'waterSupplyConnectivityTrunkLinesAdditional', message: 'Water Supply Connectivity to Trunk Lines - Additional Requirement is required' });
    }
    if (formData.waterSupplyConnectivityTrunkLinesAdditional === 'Yes' && (formData.waterSupplyConnectivityTrunkLinesCost === undefined || formData.waterSupplyConnectivityTrunkLinesCost === null || isNaN(formData.waterSupplyConnectivityTrunkLinesCost) || formData.waterSupplyConnectivityTrunkLinesCost < 0)) {
      newErrors.push({ field: 'waterSupplyConnectivityTrunkLinesCost', message: 'Water Supply Connectivity to Trunk Lines - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Drainage/Sewerage
    if (!formData.drainageStormwaterDrainageExisting) {
      newErrors.push({ field: 'drainageStormwaterDrainageExisting', message: 'Drainage Stormwater Drainage - Existing is required' });
    }
    if (!formData.drainageStormwaterDrainageAdditional) {
      newErrors.push({ field: 'drainageStormwaterDrainageAdditional', message: 'Drainage Stormwater Drainage - Additional Requirement is required' });
    }
    if (formData.drainageStormwaterDrainageAdditional === 'Yes' && (formData.drainageStormwaterDrainageCost === undefined || formData.drainageStormwaterDrainageCost === null || isNaN(formData.drainageStormwaterDrainageCost) || formData.drainageStormwaterDrainageCost < 0)) {
      newErrors.push({ field: 'drainageStormwaterDrainageCost', message: 'Drainage Stormwater Drainage - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.drainageConnectivityMainDrainsExisting) {
      newErrors.push({ field: 'drainageConnectivityMainDrainsExisting', message: 'Drainage Connectivity to Main Drains - Existing is required' });
    }
    if (!formData.drainageConnectivityMainDrainsAdditional) {
      newErrors.push({ field: 'drainageConnectivityMainDrainsAdditional', message: 'Drainage Connectivity to Main Drains - Additional Requirement is required' });
    }
    if (formData.drainageConnectivityMainDrainsAdditional === 'Yes' && (formData.drainageConnectivityMainDrainsCost === undefined || formData.drainageConnectivityMainDrainsCost === null || isNaN(formData.drainageConnectivityMainDrainsCost) || formData.drainageConnectivityMainDrainsCost < 0)) {
      newErrors.push({ field: 'drainageConnectivityMainDrainsCost', message: 'Drainage Connectivity to Main Drains - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.drainageSewerLinesExisting) {
      newErrors.push({ field: 'drainageSewerLinesExisting', message: 'Drainage Sewer Lines - Existing is required' });
    }
    if (!formData.drainageSewerLinesAdditional) {
      newErrors.push({ field: 'drainageSewerLinesAdditional', message: 'Drainage Sewer Lines - Additional Requirement is required' });
    }
    if (formData.drainageSewerLinesAdditional === 'Yes' && (formData.drainageSewerLinesCost === undefined || formData.drainageSewerLinesCost === null || isNaN(formData.drainageSewerLinesCost) || formData.drainageSewerLinesCost < 0)) {
      newErrors.push({ field: 'drainageSewerLinesCost', message: 'Drainage Sewer Lines - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.drainageConnectivityTrunkSewersExisting) {
      newErrors.push({ field: 'drainageConnectivityTrunkSewersExisting', message: 'Drainage Connectivity to Trunk Sewers - Existing is required' });
    }
    if (!formData.drainageConnectivityTrunkSewersAdditional) {
      newErrors.push({ field: 'drainageConnectivityTrunkSewersAdditional', message: 'Drainage Connectivity to Trunk Sewers - Additional Requirement is required' });
    }
    if (formData.drainageConnectivityTrunkSewersAdditional === 'Yes' && (formData.drainageConnectivityTrunkSewersCost === undefined || formData.drainageConnectivityTrunkSewersCost === null || isNaN(formData.drainageConnectivityTrunkSewersCost) || formData.drainageConnectivityTrunkSewersCost < 0)) {
      newErrors.push({ field: 'drainageConnectivityTrunkSewersCost', message: 'Drainage Connectivity to Trunk Sewers - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Roads
    if (!formData.roadsInternalRoadsCCExisting) {
      newErrors.push({ field: 'roadsInternalRoadsCCExisting', message: 'Roads Internal Roads CC - Existing is required' });
    }
    if (!formData.roadsInternalRoadsCCAdditional) {
      newErrors.push({ field: 'roadsInternalRoadsCCAdditional', message: 'Roads Internal Roads CC - Additional Requirement is required' });
    }
    if (formData.roadsInternalRoadsCCAdditional === 'Yes' && (formData.roadsInternalRoadsCCCost === undefined || formData.roadsInternalRoadsCCCost === null || isNaN(formData.roadsInternalRoadsCCCost) || formData.roadsInternalRoadsCCCost < 0)) {
      newErrors.push({ field: 'roadsInternalRoadsCCCost', message: 'Roads Internal Roads CC - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.roadsInternalRoadsBTExisting) {
      newErrors.push({ field: 'roadsInternalRoadsBTExisting', message: 'Roads Internal Roads BT - Existing is required' });
    }
    if (!formData.roadsInternalRoadsBTAdditional) {
      newErrors.push({ field: 'roadsInternalRoadsBTAdditional', message: 'Roads Internal Roads BT - Additional Requirement is required' });
    }
    if (formData.roadsInternalRoadsBTAdditional === 'Yes' && (formData.roadsInternalRoadsBTCost === undefined || formData.roadsInternalRoadsBTCost === null || isNaN(formData.roadsInternalRoadsBTCost) || formData.roadsInternalRoadsBTCost < 0)) {
      newErrors.push({ field: 'roadsInternalRoadsBTCost', message: 'Roads Internal Roads BT - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.roadsInternalRoadsOthersExisting) {
      newErrors.push({ field: 'roadsInternalRoadsOthersExisting', message: 'Roads Internal Roads Others - Existing is required' });
    }
    if (!formData.roadsInternalRoadsOthersAdditional) {
      newErrors.push({ field: 'roadsInternalRoadsOthersAdditional', message: 'Roads Internal Roads Others - Additional Requirement is required' });
    }
    if (formData.roadsInternalRoadsOthersAdditional === 'Yes' && (formData.roadsInternalRoadsOthersCost === undefined || formData.roadsInternalRoadsOthersCost === null || isNaN(formData.roadsInternalRoadsOthersCost) || formData.roadsInternalRoadsOthersCost < 0)) {
      newErrors.push({ field: 'roadsInternalRoadsOthersCost', message: 'Roads Internal Roads Others - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.roadsApproachRoadsCCExisting) {
      newErrors.push({ field: 'roadsApproachRoadsCCExisting', message: 'Roads Approach Roads CC - Existing is required' });
    }
    if (!formData.roadsApproachRoadsCCAdditional) {
      newErrors.push({ field: 'roadsApproachRoadsCCAdditional', message: 'Roads Approach Roads CC - Additional Requirement is required' });
    }
    if (formData.roadsApproachRoadsCCAdditional === 'Yes' && (formData.roadsApproachRoadsCCCost === undefined || formData.roadsApproachRoadsCCCost === null || isNaN(formData.roadsApproachRoadsCCCost) || formData.roadsApproachRoadsCCCost < 0)) {
      newErrors.push({ field: 'roadsApproachRoadsCCCost', message: 'Roads Approach Roads CC - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.roadsApproachRoadsOthersExisting) {
      newErrors.push({ field: 'roadsApproachRoadsOthersExisting', message: 'Roads Approach Roads Others - Existing is required' });
    }
    if (!formData.roadsApproachRoadsOthersAdditional) {
      newErrors.push({ field: 'roadsApproachRoadsOthersAdditional', message: 'Roads Approach Roads Others - Additional Requirement is required' });
    }
    if (formData.roadsApproachRoadsOthersAdditional === 'Yes' && (formData.roadsApproachRoadsOthersCost === undefined || formData.roadsApproachRoadsOthersCost === null || isNaN(formData.roadsApproachRoadsOthersCost) || formData.roadsApproachRoadsOthersCost < 0)) {
      newErrors.push({ field: 'roadsApproachRoadsOthersCost', message: 'Roads Approach Roads Others - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Street Lighting
    if (!formData.streetLightingPolesExisting) {
      newErrors.push({ field: 'streetLightingPolesExisting', message: 'Street Lighting Poles - Existing is required' });
    }
    if (!formData.streetLightingPolesAdditional) {
      newErrors.push({ field: 'streetLightingPolesAdditional', message: 'Street Lighting Poles - Additional Requirement is required' });
    }
    if (formData.streetLightingPolesAdditional === 'Yes' && (formData.streetLightingPolesCost === undefined || formData.streetLightingPolesCost === null || isNaN(formData.streetLightingPolesCost) || formData.streetLightingPolesCost < 0)) {
      newErrors.push({ field: 'streetLightingPolesCost', message: 'Street Lighting Poles - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.streetLightingLightsExisting) {
      newErrors.push({ field: 'streetLightingLightsExisting', message: 'Street Lighting Lights - Existing is required' });
    }
    if (!formData.streetLightingLightsAdditional) {
      newErrors.push({ field: 'streetLightingLightsAdditional', message: 'Street Lighting Lights - Additional Requirement is required' });
    }
    if (formData.streetLightingLightsAdditional === 'Yes' && (formData.streetLightingLightsCost === undefined || formData.streetLightingLightsCost === null || isNaN(formData.streetLightingLightsCost) || formData.streetLightingLightsCost < 0)) {
      newErrors.push({ field: 'streetLightingLightsCost', message: 'Street Lighting Lights - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Sanitation
    if (!formData.sanitationIndividualToiletsExisting) {
      newErrors.push({ field: 'sanitationIndividualToiletsExisting', message: 'Sanitation Individual Toilets - Existing is required' });
    }
    if (!formData.sanitationIndividualToiletsAdditional) {
      newErrors.push({ field: 'sanitationIndividualToiletsAdditional', message: 'Sanitation Individual Toilets - Additional Requirement is required' });
    }
    if (formData.sanitationIndividualToiletsAdditional === 'Yes' && (formData.sanitationIndividualToiletsCost === undefined || formData.sanitationIndividualToiletsCost === null || isNaN(formData.sanitationIndividualToiletsCost) || formData.sanitationIndividualToiletsCost < 0)) {
      newErrors.push({ field: 'sanitationIndividualToiletsCost', message: 'Sanitation Individual Toilets - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.sanitationCommunityToiletsExisting) {
      newErrors.push({ field: 'sanitationCommunityToiletsExisting', message: 'Sanitation Community Toilets - Existing is required' });
    }
    if (!formData.sanitationCommunityToiletsAdditional) {
      newErrors.push({ field: 'sanitationCommunityToiletsAdditional', message: 'Sanitation Community Toilets - Additional Requirement is required' });
    }
    if (formData.sanitationCommunityToiletsAdditional === 'Yes' && (formData.sanitationCommunityToiletsCost === undefined || formData.sanitationCommunityToiletsCost === null || isNaN(formData.sanitationCommunityToiletsCost) || formData.sanitationCommunityToiletsCost < 0)) {
      newErrors.push({ field: 'sanitationCommunityToiletsCost', message: 'Sanitation Community Toilets - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.sanitationSeatsCommunityToiletsExisting) {
      newErrors.push({ field: 'sanitationSeatsCommunityToiletsExisting', message: 'Sanitation Seats in Community Toilets - Existing is required' });
    }
    if (!formData.sanitationSeatsCommunityToiletsAdditional) {
      newErrors.push({ field: 'sanitationSeatsCommunityToiletsAdditional', message: 'Sanitation Seats in Community Toilets - Additional Requirement is required' });
    }
    if (formData.sanitationSeatsCommunityToiletsAdditional === 'Yes' && (formData.sanitationSeatsCommunityToiletsCost === undefined || formData.sanitationSeatsCommunityToiletsCost === null || isNaN(formData.sanitationSeatsCommunityToiletsCost) || formData.sanitationSeatsCommunityToiletsCost < 0)) {
      newErrors.push({ field: 'sanitationSeatsCommunityToiletsCost', message: 'Sanitation Seats in Community Toilets - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.sanitationDumperBinsExisting) {
      newErrors.push({ field: 'sanitationDumperBinsExisting', message: 'Sanitation Dumper Bins - Existing is required' });
    }
    if (!formData.sanitationDumperBinsAdditional) {
      newErrors.push({ field: 'sanitationDumperBinsAdditional', message: 'Sanitation Dumper Bins - Additional Requirement is required' });
    }
    if (formData.sanitationDumperBinsAdditional === 'Yes' && (formData.sanitationDumperBinsCost === undefined || formData.sanitationDumperBinsCost === null || isNaN(formData.sanitationDumperBinsCost) || formData.sanitationDumperBinsCost < 0)) {
      newErrors.push({ field: 'sanitationDumperBinsCost', message: 'Sanitation Dumper Bins - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Community Facilities
    if (!formData.communityHallsExisting) {
      newErrors.push({ field: 'communityHallsExisting', message: 'Community Halls - Existing is required' });
    }
    if (!formData.communityHallsAdditional) {
      newErrors.push({ field: 'communityHallsAdditional', message: 'Community Halls - Additional Requirement is required' });
    }
    if (formData.communityHallsAdditional === 'Yes' && (formData.communityHallsCost === undefined || formData.communityHallsCost === null || isNaN(formData.communityHallsCost) || formData.communityHallsCost < 0)) {
      newErrors.push({ field: 'communityHallsCost', message: 'Community Halls - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityLivelihoodCentresExisting) {
      newErrors.push({ field: 'communityLivelihoodCentresExisting', message: 'Community Livelihood Centres - Existing is required' });
    }
    if (!formData.communityLivelihoodCentresAdditional) {
      newErrors.push({ field: 'communityLivelihoodCentresAdditional', message: 'Community Livelihood Centres - Additional Requirement is required' });
    }
    if (formData.communityLivelihoodCentresAdditional === 'Yes' && (formData.communityLivelihoodCentresCost === undefined || formData.communityLivelihoodCentresCost === null || isNaN(formData.communityLivelihoodCentresCost) || formData.communityLivelihoodCentresCost < 0)) {
      newErrors.push({ field: 'communityLivelihoodCentresCost', message: 'Community Livelihood Centres - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityAnganwadisExisting) {
      newErrors.push({ field: 'communityAnganwadisExisting', message: 'Community Anganwadis - Existing is required' });
    }
    if (!formData.communityAnganwadisAdditional) {
      newErrors.push({ field: 'communityAnganwadisAdditional', message: 'Community Anganwadis - Additional Requirement is required' });
    }
    if (formData.communityAnganwadisAdditional === 'Yes' && (formData.communityAnganwadisCost === undefined || formData.communityAnganwadisCost === null || isNaN(formData.communityAnganwadisCost) || formData.communityAnganwadisCost < 0)) {
      newErrors.push({ field: 'communityAnganwadisCost', message: 'Community Anganwadis - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityPrimarySchoolsExisting) {
      newErrors.push({ field: 'communityPrimarySchoolsExisting', message: 'Community Primary Schools - Existing is required' });
    }
    if (!formData.communityPrimarySchoolsAdditional) {
      newErrors.push({ field: 'communityPrimarySchoolsAdditional', message: 'Community Primary Schools - Additional Requirement is required' });
    }
    if (formData.communityPrimarySchoolsAdditional === 'Yes' && (formData.communityPrimarySchoolsCost === undefined || formData.communityPrimarySchoolsCost === null || isNaN(formData.communityPrimarySchoolsCost) || formData.communityPrimarySchoolsCost < 0)) {
      newErrors.push({ field: 'communityPrimarySchoolsCost', message: 'Community Primary Schools - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityHealthCentresExisting) {
      newErrors.push({ field: 'communityHealthCentresExisting', message: 'Community Health Centres - Existing is required' });
    }
    if (!formData.communityHealthCentresAdditional) {
      newErrors.push({ field: 'communityHealthCentresAdditional', message: 'Community Health Centres - Additional Requirement is required' });
    }
    if (formData.communityHealthCentresAdditional === 'Yes' && (formData.communityHealthCentresCost === undefined || formData.communityHealthCentresCost === null || isNaN(formData.communityHealthCentresCost) || formData.communityHealthCentresCost < 0)) {
      newErrors.push({ field: 'communityHealthCentresCost', message: 'Community Health Centres - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityOthersExisting) {
      newErrors.push({ field: 'communityOthersExisting', message: 'Community Others - Existing is required' });
    }
    if (!formData.communityOthersAdditional) {
      newErrors.push({ field: 'communityOthersAdditional', message: 'Community Others - Additional Requirement is required' });
    }
    if (formData.communityOthersAdditional === 'Yes' && (formData.communityOthersCost === undefined || formData.communityOthersCost === null || isNaN(formData.communityOthersCost) || formData.communityOthersCost < 0)) {
      newErrors.push({ field: 'communityOthersCost', message: 'Community Others - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    return newErrors;
  };
  
  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(err => err.field === fieldName);
    return error ? error.message : undefined;
  };
  
  const scrollToFirstError = () => {
    if (errors.length > 0) {
      const firstErrorField = errors[0].field;
      // Wait for the DOM to update before scrolling
      setTimeout(() => {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (element as HTMLElement).focus();
        }
      }, 100);
    }
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called");
    console.log("Current step:", currentStep);
    console.log("Is edit mode:", isEditMode);
    console.log("Slum survey ID:", slumSurvey?._id);
    
    // Perform validation
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      console.log("Validation errors:", validationErrors);
      // Scroll to first error
      scrollToFirstError();
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (!slumSurvey?._id) {
        showToast("Survey not initialized properly", "error");
        return;
      }
      
      // Merge temporary form data with current form data if in edit mode
      const finalFormData = isEditMode ? { ...formData, ...tempFormData } : formData;
      
      // Transform form data to match backend model structure
      const surveyData = {
        // PART-A: I. GENERAL INFORMATION -CITY/TOWN
        generalInformation: {
          stateCode: finalFormData.stateCode || "",
          stateName: finalFormData.stateName || "",
          districtCode: finalFormData.districtCode || "",
          districtName: finalFormData.districtName || "",
          cityTownCode: finalFormData.cityTownCode || "",
          cityTownName: finalFormData.cityTownName || "",
          cityTown: finalFormData.cityTown || "",
          cityTownNoHouseholds: finalFormData.cityTownNoHouseholds || 0
        },
        
        // PART-B: II. CITY/TOWN SLUM PROFILE
        cityTownSlumProfile: {
          slumType: finalFormData.slumType || "",
          slumIdField: finalFormData.slumIdField || "",
          slumName: finalFormData.slumName || "",
          ownershipLand: finalFormData.ownershipLand || "",
          areaSqMtrs: finalFormData.areaSqMtrs || 0,
          slumPopulation: finalFormData.slumPopulation || 0,
          noSlumHouseholds: finalFormData.noSlumHouseholds || 0,
          bplPopulation: finalFormData.bplPopulation || 0,
          noBplHouseholdsSlum: finalFormData.noBplHouseholdsSlum || 0
        },
        
        // PART-C: III. PARTICULARS OF SURVEY OPERATION
        surveyOperation: {
          surveyorName: finalFormData.surveyorName || "",
          surveyDate: finalFormData.surveyDate || "",
          receiptQuestionnaireDate: finalFormData.receiptQuestionnaireDate || "",
          scrutinyDate: finalFormData.scrutinyDate || "",
          receiptByNodalCellDate: finalFormData.receiptByNodalCellDate || "",
          remarksInvestigator: finalFormData.remarksInvestigator || "",
          commentsSupervisor: finalFormData.commentsSupervisor || ""
        },
        
        // PART-D: I. BASIC INFORMATION ON SLUM
        basicInformation: {
          slumNameBasicInfo: finalFormData.slumNameBasicInfo || "",
          slumCode: finalFormData.slumCode || "",
          locationWard: finalFormData.locationWard || "",
          ageSlumYears: finalFormData.ageSlumYears || 0,
          areaSlumSqMtrs: finalFormData.areaSlumSqMtrs || 0,
          locationCoreOrFringe: finalFormData.locationCoreOrFringe || "",
          typeAreaSurrounding: finalFormData.typeAreaSurrounding || "",
          physicalLocationSlum: finalFormData.physicalLocationSlum || "",
          isSlumNotified: finalFormData.isSlumNotified || "",
          yearOfNotification: finalFormData.yearOfNotification || 0
        },
        
        // PART-E: II. LAND STATUS
        landStatus: {
          ownershipLandDetail: finalFormData.ownershipLandDetail || "",
          ownershipLandSpecify: finalFormData.ownershipLandSpecify || ""
        },
        
        // SECTION 6: DEMOGRAPHIC PROFILE (Population & Health + Literacy & Education)
        demographicProfile: {
          // Population & Health Demographics
          totalPopulation: {
            SC: finalFormData.totalPopulationSlumSC || 0,
            ST: finalFormData.totalPopulationSlumST || 0,
            OBC: finalFormData.totalPopulationSlumOBC || 0,
            Others: finalFormData.totalPopulationSlumOthers || 0,
            Total: finalFormData.totalPopulationSlum || 0,
            Minorities: finalFormData.totalPopulationSlumMinorities || 0
          },
          bplPopulation: {
            SC: finalFormData.bplPopulationSlumSC || 0,
            ST: finalFormData.bplPopulationSlumST || 0,
            OBC: finalFormData.bplPopulationSlumOBC || 0,
            Others: finalFormData.bplPopulationSlumOthers || 0,
            Total: finalFormData.bplPopulationSlum || 0,
            Minorities: finalFormData.bplPopulationSlumMinorities || 0
          },
          numberOfHouseholds: {
            SC: finalFormData.noHouseholdsSlumSC || 0,
            ST: finalFormData.noHouseholdsSlumST || 0,
            OBC: finalFormData.noHouseholdsSlumOBC || 0,
            Others: finalFormData.noHouseholdsSlumOthers || 0,
            Total: finalFormData.noHouseholdsSlum || 0,
            Minorities: finalFormData.noHouseholdsSlumMinorities || 0
          },
          numberOfBplHouseholds: {
            SC: finalFormData.noBplHouseholdsSC || 0,
            ST: finalFormData.noBplHouseholdsST || 0,
            OBC: finalFormData.noBplHouseholdsOBC || 0,
            Others: finalFormData.noBplHouseholdsOthers || 0,
            Total: finalFormData.noBplHouseholdsTotal || 0,
            Minorities: finalFormData.noBplHouseholdsMinorities || 0
          },
          womenHeadedHouseholds: {
            SC: finalFormData.noWomenHeadedHouseholdsSC || 0,
            ST: finalFormData.noWomenHeadedHouseholdsST || 0,
            OBC: finalFormData.noWomenHeadedHouseholdsOBC || 0,
            Others: finalFormData.noWomenHeadedHouseholdsOthers || 0,
            Total: finalFormData.noWomenHeadedHouseholdsTotal || 0,
            Minorities: finalFormData.noWomenHeadedHouseholdsMinorities || 0
          },
          personsOlderThan65Years: {
            SC: finalFormData.noPersonsOlder65SC || 0,
            ST: finalFormData.noPersonsOlder65ST || 0,
            OBC: finalFormData.noPersonsOlder65OBC || 0,
            Others: finalFormData.noPersonsOlder65Others || 0,
            Total: finalFormData.noPersonsOlder65Total || 0,
            Minorities: finalFormData.noPersonsOlder65Minorities || 0
          },
          childLabourers: {
            SC: finalFormData.noChildLabourersSC || 0,
            ST: finalFormData.noChildLabourersST || 0,
            OBC: finalFormData.noChildLabourersOBC || 0,
            Others: finalFormData.noChildLabourersOthers || 0,
            Total: finalFormData.noChildLabourersTotal || 0,
            Minorities: finalFormData.noChildLabourersMinorities || 0
          },
          physicallyChallengedPersons: {
            SC: finalFormData.noPhysicallyChallengedSC || 0,
            ST: finalFormData.noPhysicallyChallengedST || 0,
            OBC: finalFormData.noPhysicallyChallengedOBC || 0,
            Others: finalFormData.noPhysicallyChallengedOthers || 0,
            Total: finalFormData.noPhysicallyChallengedTotal || 0,
            Minorities: finalFormData.noPhysicallyChallengedMinorities || 0
          },
          mentallyChallengedPersons: {
            SC: finalFormData.noMentallyChallengedSC || 0,
            ST: finalFormData.noMentallyChallengedST || 0,
            OBC: finalFormData.noMentallyChallengedOBC || 0,
            Others: finalFormData.noMentallyChallengedOthers || 0,
            Total: finalFormData.noMentallyChallengedTotal || 0,
            Minorities: finalFormData.noMentallyChallengedMinorities || 0
          },
          personsWithHivAids: {
            SC: finalFormData.noPersonsHivaidsSC || 0,
            ST: finalFormData.noPersonsHivaidsST || 0,
            OBC: finalFormData.noPersonsHivaidsOBC || 0,
            Others: finalFormData.noPersonsHivaidsOthers || 0,
            Total: finalFormData.noPersonsHivaidsTotal || 0,
            Minorities: finalFormData.noPersonsHivaidsMinorities || 0
          },
          personsWithTuberculosis: {
            SC: finalFormData.noPersonsTuberculosisSC || 0,
            ST: finalFormData.noPersonsTuberculosisST || 0,
            OBC: finalFormData.noPersonsTuberculosisOBC || 0,
            Others: finalFormData.noPersonsTuberculosisOthers || 0,
            Total: finalFormData.noPersonsTuberculosisTotal || 0,
            Minorities: finalFormData.noPersonsTuberculosisMinorities || 0
          },
          personsWithRespiratoryDiseases: {
            SC: finalFormData.noPersonsRespiratorySC || 0,
            ST: finalFormData.noPersonsRespiratoryST || 0,
            OBC: finalFormData.noPersonsRespiratoryOBC || 0,
            Others: finalFormData.noPersonsRespiratoryOthers || 0,
            Total: finalFormData.noPersonsRespiratoryTotal || 0,
            Minorities: finalFormData.noPersonsRespiratoryMinorities || 0
          },
          personsWithOtherChronicDiseases: {
            SC: finalFormData.noPersonsOtherChronicSC || 0,
            ST: finalFormData.noPersonsOtherChronicST || 0,
            OBC: finalFormData.noPersonsOtherChronicOBC || 0,
            Others: finalFormData.noPersonsOtherChronicOthers || 0,
            Total: finalFormData.noPersonsOtherChronicTotal || 0,
            Minorities: finalFormData.noPersonsOtherChronicMinorities || 0
          },
          // Literacy & Education
          totalIlliteratePerson: {
            SC: finalFormData.totalIlliteratePersonsSC || 0,
            ST: finalFormData.totalIlliteratePersonsST || 0,
            OBC: finalFormData.totalIlliteratePersonsOBC || 0,
            Others: finalFormData.totalIlliteratePersonsOthers || 0,
            Total: finalFormData.totalIlliteratePersonsTotal || 0,
            Minorities: finalFormData.totalIlliteratePersonsMinorities || 0
          },
          maleIlliterate: {
            SC: finalFormData.noMaleIlliterateSC || 0,
            ST: finalFormData.noMaleIlliterateST || 0,
            OBC: finalFormData.noMaleIlliterateOBC || 0,
            Others: finalFormData.noMaleIlliterateOthers || 0,
            Total: finalFormData.noMaleIlliterateTotal || 0,
            Minorities: finalFormData.noMaleIlliterateMinorities || 0
          },
          femaleIlliterate: {
            SC: finalFormData.noFemaleIlliterateSC || 0,
            ST: finalFormData.noFemaleIlliterateST || 0,
            OBC: finalFormData.noFemaleIlliterateOBC || 0,
            Others: finalFormData.noFemaleIlliterateOthers || 0,
            Total: finalFormData.noFemaleIlliterateTotal || 0,
            Minorities: finalFormData.noFemaleIlliterateMinorities || 0
          },
          bplIlliteratePerson: {
            SC: finalFormData.noBplIlliteratePersonsSC || 0,
            ST: finalFormData.noBplIlliteratePersonsST || 0,
            OBC: finalFormData.noBplIlliteratePersonsOBC || 0,
            Others: finalFormData.noBplIlliteratePersonsOthers || 0,
            Total: finalFormData.noBplIlliteratePersonsTotal || 0,
            Minorities: finalFormData.noBplIlliteratePersonsMinorities || 0
          },
          maleBplIlliterate: {
            SC: finalFormData.noMaleBplIlliterateSC || 0,
            ST: finalFormData.noMaleBplIlliterateST || 0,
            OBC: finalFormData.noMaleBplIlliterateOBC || 0,
            Others: finalFormData.noMaleBplIlliterateOthers || 0,
            Total: finalFormData.noMaleBplIlliterateTotal || 0,
            Minorities: finalFormData.noMaleBplIlliterateMinorities || 0
          },
          femaleBplIlliterate: {
            SC: finalFormData.noFemaleBplIlliterateSC || 0,
            ST: finalFormData.noFemaleBplIlliterateST || 0,
            OBC: finalFormData.noFemaleBplIlliterateOBC || 0,
            Others: finalFormData.noFemaleBplIlliterateOthers || 0,
            Total: finalFormData.noFemaleBplIlliterateTotal || 0,
            Minorities: finalFormData.noFemaleBplIlliterateMinorities || 0
          },
          schoolDropoutsMale: {
            SC: finalFormData.schoolDropoutsMaleSC || 0,
            ST: finalFormData.schoolDropoutsMaleST || 0,
            OBC: finalFormData.schoolDropoutsMaleOBC || 0,
            Others: finalFormData.schoolDropoutsMaleOthers || 0,
            Total: finalFormData.schoolDropoutsMaleTotal || 0,
            Minorities: finalFormData.schoolDropoutsMaleMinorities || 0
          },
          schoolDropoutsFemale: {
            SC: finalFormData.schoolDropoutsFemaleSC || 0,
            ST: finalFormData.schoolDropoutsFemaleST || 0,
            OBC: finalFormData.schoolDropoutsFemaleOBC || 0,
            Others: finalFormData.schoolDropoutsFemaleOthers || 0,
            Total: finalFormData.schoolDropoutsFemaleTotal || 0,
            Minorities: finalFormData.schoolDropoutsFemaleMinorities || 0
          }
        },
        
        // PART-H: IV. HOUSING STATUS
        housingStatus: {
          dwellingUnitsPucca: finalFormData.dwellingUnitsPucca || 0,
          dwellingUnitsSemiPucca: finalFormData.dwellingUnitsSemiPucca || 0,
          dwellingUnitsKatcha: finalFormData.dwellingUnitsKatcha || 0,
          dwellingUnitsTotal: finalFormData.dwellingUnitsTotal || 0,
          dwellingUnitsWithElectricityPucca: finalFormData.dwellingUnitsWithElectricityPucca || 0,
          dwellingUnitsWithElectricitySemiPucca: finalFormData.dwellingUnitsWithElectricitySemiPucca || 0,
          dwellingUnitsWithElectricityKatcha: finalFormData.dwellingUnitsWithElectricityKatcha || 0,
          dwellingUnitsWithElectricityTotal: finalFormData.dwellingUnitsWithElectricityTotal || 0,
          landTenureWithPatta: finalFormData.landTenureWithPatta || 0,
          landTenurePossessionCertificate: finalFormData.landTenurePossessionCertificate || 0,
          landTenureEncroachedPrivate: finalFormData.landTenureEncroachedPrivate || 0,
          landTenureEncroachedPublic: finalFormData.landTenureEncroachedPublic || 0,
          landTenureOnRent: finalFormData.landTenureOnRent || 0,
          landTenureOther: finalFormData.landTenureOther || 0,
          landTenureTotal: finalFormData.landTenureTotal || 0
        },
        
        // PART-I: V. ECONOMIC STATUS OF HOUSEHOLDS
        economicStatus: {
          economicStatusData: {
            lessThan500: finalFormData.economicStatus?.lessThan500 || 0,
            rs500to1000: finalFormData.economicStatus?.rs500to1000 || 0,
            rs1000to1500: finalFormData.economicStatus?.rs1000to1500 || 0,
            rs1500to2000: finalFormData.economicStatus?.rs1500to2000 || 0,
            rs2000to3000: finalFormData.economicStatus?.rs2000to3000 || 0,
            moreThan3000: finalFormData.economicStatus?.moreThan3000 || 0
          }
        },
        
        // Employment and Occupation Status
        employmentAndOccupation: {
          majorIndustriesPresent: finalFormData.majorIndustriesPresent || [],
          selfEmployed: finalFormData.occupationalStatus?.selfEmployed || 0,
          salaried: finalFormData.occupationalStatus?.salaried || 0,
          regularWage: finalFormData.occupationalStatus?.regularWage || 0,
          casualLabour: finalFormData.occupationalStatus?.casualLabour || 0,
          others: finalFormData.occupationalStatus?.others || 0
        },
        
        // Transportation and Accessibility
        transportationAndAccessibility: {
          mainTransportMode: [] // Will be populated from form data if available
        },
        
        // Environmental Conditions
        environmentalConditions: {},
        
        // Social Issues and Vulnerable Groups
        socialIssuesAndVulnerableGroups: {
          majorChallenges: [],
          slumDwellersAssociation: finalFormData.slumDwellersAssociation || "NO"
        },
        
        // Slum Improvement and Development
        slumImprovementAndDevelopment: {
          existingDevelopmentProjects: [],
          plannedImprovements: []
        },
        
        // PART-J: VII. ACCESS TO PHYSICAL INFRASTRUCTURE
        physicalInfrastructure: {
          sourceDrinkingWater: {
            individualTap: finalFormData.sourceDrinkingWater?.individualTap || 0,
            tubewellBorewellHandpump: finalFormData.sourceDrinkingWater?.tubewellBorewellHandpump || 0,
            publicTap: finalFormData.sourceDrinkingWater?.publicTap || 0,
            openwell: finalFormData.sourceDrinkingWater?.openwell || 0,
            tankPond: finalFormData.sourceDrinkingWater?.tankPond || 0,
            riverCanalLakeSpring: finalFormData.sourceDrinkingWater?.riverCanalLakeSpring || 0,
            waterTanker: finalFormData.sourceDrinkingWater?.waterTanker || 0,
            others: finalFormData.sourceDrinkingWater?.others || 0
          },
          connectivityCityWaterSupply: finalFormData.connectivityCityWaterSupply || "",
          drainageSewerageFacility: finalFormData.drainageSewerageFacility || "",
          connectivityStormWaterDrainage: finalFormData.connectivityStormWaterDrainage || "",
          connectivitySewerageSystem: finalFormData.connectivitySewerageSystem || "",
          proneToFlooding: finalFormData.proneToFlooding || "",
          latrineFacility: finalFormData.latrineFacility || "",
          solidWasteManagement: {
            frequencyOfGarbageDisposal: finalFormData.frequencyOfGarbageDisposal || "",
            arrangementForGarbageDisposal: finalFormData.arrangementForGarbageDisposal || "",
            frequencyOfClearanceOfOpenDrains: finalFormData.frequencyOfClearanceOfOpenDrains || ""
          },
          approachRoadType: finalFormData.approachRoadType || "",
          distanceToNearestMotorableRoad: finalFormData.distanceToNearestMotorableRoad || "",
          internalRoadType: finalFormData.internalRoadType || "",
          streetLightAvailable: finalFormData.streetLightAvailable || ""
        },
        
        // PART-K: VIII. EDUCATION FACILITIES
        educationFacilities: {
          anganwadiUnderIcds: finalFormData.anganwadiUnderIcds || 0,
          municipalPreschool: finalFormData.municipalPreschool || 0,
          privatePreschool: finalFormData.privatePreschool || 0,
          municipalPrimarySchool: finalFormData.municipalPrimarySchool || 0,
          stateGovtPrimarySchool: finalFormData.stateGovtPrimarySchool || 0,
          privatePrimarySchool: finalFormData.privatePrimarySchool || 0,
          municipalHighSchool: finalFormData.municipalHighSchool || 0,
          stateGovtHighSchool: finalFormData.stateGovtHighSchool || 0,
          privateHighSchool: finalFormData.privateHighSchool || 0,
          adultEducationCentre: finalFormData.adultEducationCentre || 0,
          nonFormalEducationCentre: finalFormData.nonFormalEducationCentre || 0
        },
        
        // PART-L: IX. Health Facilities
        healthFacilities: {
          urbanHealthPost: finalFormData.urbanHealthPost || "",
          primaryHealthCentre: finalFormData.primaryHealthCentre || "",
          governmentHospital: finalFormData.governmentHospital || "",
          maternityCentre: finalFormData.maternityCentre || "",
          privateClinic: finalFormData.privateClinic || "",
          rmp: finalFormData.rmp || "",
          ayurvedicDoctor: finalFormData.ayurvedicDoctor || ""
        },
        
        // PART-M: X. Social Development/Welfare
        socialDevelopment: {
          communityHall: finalFormData.communityHall || 0,
          livelihoodProductionCentre: finalFormData.livelihoodProductionCentre || 0,
          vocationalTrainingCentre: finalFormData.vocationalTrainingCentre || 0,
          streetChildrenRehabilitationCentre: finalFormData.streetChildrenRehabilitationCentre || 0,
          nightShelter: finalFormData.nightShelter || 0,
          oldAgeHome: finalFormData.oldAgeHome || 0,
          oldAgePensionsHolders: finalFormData.oldAgePensionsHolders || 0,
          widowPensionsHolders: finalFormData.widowPensionsHolders || 0,
          disabledPensionsHolders: finalFormData.disabledPensionsHolders || 0,
          generalInsuranceCovered: finalFormData.generalInsuranceCovered || 0,
          healthInsuranceCovered: finalFormData.healthInsuranceCovered || 0,
          selfHelpGroups: finalFormData.selfHelpGroups || 0,
          thriftCreditSocieties: finalFormData.thriftCreditSocieties || 0,
          slumDwellersAssociation: finalFormData.slumDwellersAssociation || "",
          youthAssociations: finalFormData.youthAssociations || 0,
          womensAssociations: finalFormData.womensAssociations || 0
        },
        
        // PART-N: XI. ADDITIONAL INFRASTRUCTURE REQUIREMENTS
        additionalInfrastructure: {
          // Water Supply
          waterSupply: {
            pipelines: {
              existing: finalFormData.waterSupplyPipelinesExisting || "",
              additionalRequirement: finalFormData.waterSupplyPipelinesAdditional || "",
              estimatedCost: finalFormData.waterSupplyPipelinesCost || 0
            },
            individualTaps: {
              existing: finalFormData.waterSupplyIndividualTapsExisting || "",
              additionalRequirement: finalFormData.waterSupplyIndividualTapsAdditional || "",
              estimatedCost: finalFormData.waterSupplyIndividualTapsCost || 0
            },
            borewells: {
              existing: finalFormData.waterSupplyBorewellsExisting || "",
              additionalRequirement: finalFormData.waterSupplyBorewellsAdditional || "",
              estimatedCost: finalFormData.waterSupplyBorewellsCost || 0
            },
            connectivityToTrunkLines: {
              existing: finalFormData.waterSupplyConnectivityTrunkLinesExisting || "",
              additionalRequirement: finalFormData.waterSupplyConnectivityTrunkLinesAdditional || "",
              estimatedCost: finalFormData.waterSupplyConnectivityTrunkLinesCost || 0
            }
          },
          // Drainage/Sewerage
          drainageSewerage: {
            stormwaterDrainage: {
              existing: finalFormData.drainageStormwaterDrainageExisting || "",
              additionalRequirement: finalFormData.drainageStormwaterDrainageAdditional || "",
              estimatedCost: finalFormData.drainageStormwaterDrainageCost || 0
            },
            connectivityToMainDrains: {
              existing: finalFormData.drainageConnectivityMainDrainsExisting || "",
              additionalRequirement: finalFormData.drainageConnectivityMainDrainsAdditional || "",
              estimatedCost: finalFormData.drainageConnectivityMainDrainsCost || 0
            },
            sewerLines: {
              existing: finalFormData.drainageSewerLinesExisting || "",
              additionalRequirement: finalFormData.drainageSewerLinesAdditional || "",
              estimatedCost: finalFormData.drainageSewerLinesCost || 0
            },
            connectivityToTrunkSewers: {
              existing: finalFormData.drainageConnectivityTrunkSewersExisting || "",
              additionalRequirement: finalFormData.drainageConnectivityTrunkSewersAdditional || "",
              estimatedCost: finalFormData.drainageConnectivityTrunkSewersCost || 0
            }
          },
          // Roads
          roads: {
            internalRoadsCC: {
              existing: finalFormData.roadsInternalRoadsCCExisting || "",
              additionalRequirement: finalFormData.roadsInternalRoadsCCAdditional || "",
              estimatedCost: finalFormData.roadsInternalRoadsCCCost || 0
            },
            internalRoadsBT: {
              existing: finalFormData.roadsInternalRoadsBTExisting || "",
              additionalRequirement: finalFormData.roadsInternalRoadsBTAdditional || "",
              estimatedCost: finalFormData.roadsInternalRoadsBTCost || 0
            },
            internalRoadsOthers: {
              existing: finalFormData.roadsInternalRoadsOthersExisting || "",
              additionalRequirement: finalFormData.roadsInternalRoadsOthersAdditional || "",
              estimatedCost: finalFormData.roadsInternalRoadsOthersCost || 0
            },
            approachRoadsCC: {
              existing: finalFormData.roadsApproachRoadsCCExisting || "",
              additionalRequirement: finalFormData.roadsApproachRoadsCCAdditional || "",
              estimatedCost: finalFormData.roadsApproachRoadsCCCost || 0
            },
            approachRoadsOthers: {
              existing: finalFormData.roadsApproachRoadsOthersExisting || "",
              additionalRequirement: finalFormData.roadsApproachRoadsOthersAdditional || "",
              estimatedCost: finalFormData.roadsApproachRoadsOthersCost || 0
            }
          },
          // Street Lighting
          streetLighting: {
            poles: {
              existing: finalFormData.streetLightingPolesExisting || "",
              additionalRequirement: finalFormData.streetLightingPolesAdditional || "",
              estimatedCost: finalFormData.streetLightingPolesCost || 0
            },
            lights: {
              existing: finalFormData.streetLightingLightsExisting || "",
              additionalRequirement: finalFormData.streetLightingLightsAdditional || "",
              estimatedCost: finalFormData.streetLightingLightsCost || 0
            }
          },
          // Sanitation
          sanitation: {
            individualToilets: {
              existing: finalFormData.sanitationIndividualToiletsExisting || "",
              additionalRequirement: finalFormData.sanitationIndividualToiletsAdditional || "",
              estimatedCost: finalFormData.sanitationIndividualToiletsCost || 0
            },
            communityToilets: {
              existing: finalFormData.sanitationCommunityToiletsExisting || "",
              additionalRequirement: finalFormData.sanitationCommunityToiletsAdditional || "",
              estimatedCost: finalFormData.sanitationCommunityToiletsCost || 0
            },
            seatsInCommunityToilets: {
              existing: finalFormData.sanitationSeatsCommunityToiletsExisting || "",
              additionalRequirement: finalFormData.sanitationSeatsCommunityToiletsAdditional || "",
              estimatedCost: finalFormData.sanitationSeatsCommunityToiletsCost || 0
            },
            dumperBins: {
              existing: finalFormData.sanitationDumperBinsExisting || "",
              additionalRequirement: finalFormData.sanitationDumperBinsAdditional || "",
              estimatedCost: finalFormData.sanitationDumperBinsCost || 0
            }
          },
          // Community Facilities
          communityFacilities: {
            communityHalls: {
              existing: finalFormData.communityHallsExisting || "",
              additionalRequirement: finalFormData.communityHallsAdditional || "",
              estimatedCost: finalFormData.communityHallsCost || 0
            },
            livelihoodCentres: {
              existing: finalFormData.communityLivelihoodCentresExisting || "",
              additionalRequirement: finalFormData.communityLivelihoodCentresAdditional || "",
              estimatedCost: finalFormData.communityLivelihoodCentresCost || 0
            },
            anganwadis: {
              existing: finalFormData.communityAnganwadisExisting || "",
              additionalRequirement: finalFormData.communityAnganwadisAdditional || "",
              estimatedCost: finalFormData.communityAnganwadisCost || 0
            },
            primarySchools: {
              existing: finalFormData.communityPrimarySchoolsExisting || "",
              additionalRequirement: finalFormData.communityPrimarySchoolsAdditional || "",
              estimatedCost: finalFormData.communityPrimarySchoolsCost || 0
            },
            healthCentres: {
              existing: finalFormData.communityHealthCentresExisting || "",
              additionalRequirement: finalFormData.communityHealthCentresAdditional || "",
              estimatedCost: finalFormData.communityHealthCentresCost || 0
            },
            others: {
              existing: finalFormData.communityOthersExisting || "",
              additionalRequirement: finalFormData.communityOthersAdditional || "",
              estimatedCost: finalFormData.communityOthersCost || 0
            }
          }
        }
      };

      // In edit mode, we don't need to save the current section separately
      // as the data is already captured in tempFormData
      if (!isEditMode) {
        await saveSection();
      }
      
      const response = await apiService.submitSlumSurvey(slumSurvey._id, surveyData);

      if (response.success) {
        showToast("Slum survey submitted successfully", "success");
        // Redirect to dashboard after successful submission
        router.push('/surveyor/dashboard');
      } else {
        showToast(response.message || "Failed to submit survey", "error");
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      showToast("Failed to submit survey", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    // Validation for back navigation - check if current section is saved
    if (currentStep > 0) {
      setCurrentStep((prev) => Math.max(0, prev - 1));
    }
  };

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleBackToDashboard = () => {
    // Show confirmation dialog before navigating back to dashboard
    setShowLeaveConfirm(true);
  };

  const confirmLeave = () => {
    setShowLeaveConfirm(false);
    router.back();
  };

  const cancelLeave = () => {
    setShowLeaveConfirm(false);
  };

  const saveSection = async () => {
    try {
      setSaving(true);
      
      // Map current step to section name (14 data sections + 1 review section)
      // Only steps 0-13 correspond to actual data sections that get saved
      // Step 14 (review) is just a summary view and doesn't need to be saved
      const sectionMap: Record<number, string> = {
        0: 'generalInformation',
        1: 'cityTownSlumProfile',
        2: 'surveyOperation',
        3: 'basicInformation',
        4: 'landStatus',
        5: 'demographicProfile',
        6: 'housingStatus',
        7: 'economicStatus',
        8: 'employmentAndOccupation',
        9: 'physicalInfrastructure',
        10: 'educationFacilities',
        11: 'healthFacilities',
        12: 'socialDevelopment',
        13: 'additionalInfrastructure'
        // Note: Step 14 (reviewAndSubmit) is just a summary view, not a data section
      };
      
      // Extract data for current section
      // If we're at step 14 (review section), there's no data to save
      if (currentStep >= 14) {
        // No need to save the review section
        showToast("Review section does not require saving", "info");
        // Move to next step (which would wrap around or stay at 14)
        setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
        return;
      }
      
      const sectionName = sectionMap[currentStep];
      if (!sectionName) {
        showToast("Invalid section", "error");
        return;
      }
      
      // Extract data for current section based on the step
      const extractSectionData = () => {
        const data: any = {};
        
        switch(sectionName) {
          case 'generalInformation':
            data.stateCode = formData.stateCode;
            data.stateName = formData.stateName;
            data.districtCode = formData.districtCode;
            data.districtName = formData.districtName;
            data.cityTownCode = formData.cityTownCode;
            data.cityTownName = formData.cityTownName;
            data.cityTown = formData.cityTown;
            data.cityTownNoHouseholds = formData.cityTownNoHouseholds;
            break;
          case 'cityTownSlumProfile':
            data.slumType = formData.slumType;
            data.slumIdField = formData.slumIdField;
            data.slumName = formData.slumName;
            data.ownershipLand = formData.ownershipLand;
            data.areaSqMtrs = formData.areaSqMtrs;
            data.slumPopulation = formData.slumPopulation;
            data.noSlumHouseholds = formData.noSlumHouseholds;
            data.bplPopulation = formData.bplPopulation;
            data.noBplHouseholdsCityTown = formData.noBplHouseholdsSlum;
            break;
          case 'surveyOperation':
            data.surveyorName = formData.surveyorName;
            data.surveyDate = formData.surveyDate;
            data.receiptQuestionnaireDate = formData.receiptQuestionnaireDate;
            data.scrutinyDate = formData.scrutinyDate;
            data.receiptByNodalCellDate = formData.receiptByNodalCellDate;
            data.remarksInvestigator = formData.remarksInvestigator;
            data.commentsSupervisor = formData.commentsSupervisor;
            break;
          case 'basicInformation':
            data.slumNameBasicInfo = formData.slumNameBasicInfo;
            data.slumCode = formData.slumCode;
            data.locationWard = formData.locationWard;
            data.ageSlumYears = formData.ageSlumYears;
            data.areaSlumSqMtrs = formData.areaSlumSqMtrs;
            data.locationCoreOrFringe = formData.locationCoreOrFringe;
            data.typeAreaSurrounding = formData.typeAreaSurrounding;
            data.physicalLocationSlum = formData.physicalLocationSlum;
            data.isSlumNotified = formData.isSlumNotified;
            data.yearOfNotification = formData.yearOfNotification;
            break;
          case 'landStatus':
            data.ownershipLandDetail = formData.ownershipLandDetail;
            data.ownershipLandSpecify = formData.ownershipLandSpecify;
            break;
          case 'demographicProfile':
            // Population & Health Demographics (by caste categories)
            data.totalPopulation = {
              SC: formData.totalPopulationSlumSC || 0,
              ST: formData.totalPopulationSlumST || 0,
              OBC: formData.totalPopulationSlumOBC || 0,
              Others: formData.totalPopulationSlumOthers || 0,
              Total: formData.totalPopulationSlum || 0,
              Minorities: formData.totalPopulationSlumMinorities || 0
            };
            data.bplPopulation = {
              SC: formData.bplPopulationSlumSC || 0,
              ST: formData.bplPopulationSlumST || 0,
              OBC: formData.bplPopulationSlumOBC || 0,
              Others: formData.bplPopulationSlumOthers || 0,
              Total: formData.bplPopulationSlum || 0,
              Minorities: formData.bplPopulationSlumMinorities || 0
            };
            data.numberOfHouseholds = {
              SC: formData.noHouseholdsSlumSC || 0,
              ST: formData.noHouseholdsSlumST || 0,
              OBC: formData.noHouseholdsSlumOBC || 0,
              Others: formData.noHouseholdsSlumOthers || 0,
              Total: formData.noHouseholdsSlum || 0,
              Minorities: formData.noHouseholdsSlumMinorities || 0
            };
            data.numberOfBplHouseholds = {
              SC: formData.noBplHouseholdsSC || 0,
              ST: formData.noBplHouseholdsST || 0,
              OBC: formData.noBplHouseholdsOBC || 0,
              Others: formData.noBplHouseholdsOthers || 0,
              Total: formData.noBplHouseholdsTotal || 0,
              Minorities: formData.noBplHouseholdsMinorities || 0
            };
            data.womenHeadedHouseholds = {
              SC: formData.noWomenHeadedHouseholdsSC || 0,
              ST: formData.noWomenHeadedHouseholdsST || 0,
              OBC: formData.noWomenHeadedHouseholdsOBC || 0,
              Others: formData.noWomenHeadedHouseholdsOthers || 0,
              Total: formData.noWomenHeadedHouseholdsTotal || 0,
              Minorities: formData.noWomenHeadedHouseholdsMinorities || 0
            };
            data.personsOlderThan65Years = {
              SC: formData.noPersonsOlder65SC || 0,
              ST: formData.noPersonsOlder65ST || 0,
              OBC: formData.noPersonsOlder65OBC || 0,
              Others: formData.noPersonsOlder65Others || 0,
              Total: formData.noPersonsOlder65Total || 0,
              Minorities: formData.noPersonsOlder65Minorities || 0
            };
            data.childLabourers = {
              SC: formData.noChildLabourersSC || 0,
              ST: formData.noChildLabourersST || 0,
              OBC: formData.noChildLabourersOBC || 0,
              Others: formData.noChildLabourersOthers || 0,
              Total: formData.noChildLabourersTotal || 0,
              Minorities: formData.noChildLabourersMinorities || 0
            };
            data.physicallyChallengedPersons = {
              SC: formData.noPhysicallyChallengedSC || 0,
              ST: formData.noPhysicallyChallengedST || 0,
              OBC: formData.noPhysicallyChallengedOBC || 0,
              Others: formData.noPhysicallyChallengedOthers || 0,
              Total: formData.noPhysicallyChallengedTotal || 0,
              Minorities: formData.noPhysicallyChallengedMinorities || 0
            };
            data.mentallyChallengedPersons = {
              SC: formData.noMentallyChallengedSC || 0,
              ST: formData.noMentallyChallengedST || 0,
              OBC: formData.noMentallyChallengedOBC || 0,
              Others: formData.noMentallyChallengedOthers || 0,
              Total: formData.noMentallyChallengedTotal || 0,
              Minorities: formData.noMentallyChallengedMinorities || 0
            };
            data.personsWithHivAids = {
              SC: formData.noPersonsHivaidsSC || 0,
              ST: formData.noPersonsHivaidsST || 0,
              OBC: formData.noPersonsHivaidsOBC || 0,
              Others: formData.noPersonsHivaidsOthers || 0,
              Total: formData.noPersonsHivaidsTotal || 0,
              Minorities: formData.noPersonsHivaidsMinorities || 0
            };
            data.personsWithTuberculosis = {
              SC: formData.noPersonsTuberculosisSC || 0,
              ST: formData.noPersonsTuberculosisST || 0,
              OBC: formData.noPersonsTuberculosisOBC || 0,
              Others: formData.noPersonsTuberculosisOthers || 0,
              Total: formData.noPersonsTuberculosisTotal || 0,
              Minorities: formData.noPersonsTuberculosisMinorities || 0
            };
            data.personsWithRespiratoryDiseases = {
              SC: formData.noPersonsRespiratorySC || 0,
              ST: formData.noPersonsRespiratoryST || 0,
              OBC: formData.noPersonsRespiratoryOBC || 0,
              Others: formData.noPersonsRespiratoryOthers || 0,
              Total: formData.noPersonsRespiratoryTotal || 0,
              Minorities: formData.noPersonsRespiratoryMinorities || 0
            };
            data.personsWithOtherChronicDiseases = {
              SC: formData.noPersonsOtherChronicSC || 0,
              ST: formData.noPersonsOtherChronicST || 0,
              OBC: formData.noPersonsOtherChronicOBC || 0,
              Others: formData.noPersonsOtherChronicOthers || 0,
              Total: formData.noPersonsOtherChronicTotal || 0,
              Minorities: formData.noPersonsOtherChronicMinorities || 0
            };
            
            // Literacy & Education (by caste categories)
            data.totalIlliteratePerson = {
              SC: formData.totalIlliteratePersonsSC || 0,
              ST: formData.totalIlliteratePersonsST || 0,
              OBC: formData.totalIlliteratePersonsOBC || 0,
              Others: formData.totalIlliteratePersonsOthers || 0,
              Total: formData.totalIlliteratePersonsTotal || 0,
              Minorities: formData.totalIlliteratePersonsMinorities || 0
            };
            data.maleIlliterate = {
              SC: formData.noMaleIlliterateSC || 0,
              ST: formData.noMaleIlliterateST || 0,
              OBC: formData.noMaleIlliterateOBC || 0,
              Others: formData.noMaleIlliterateOthers || 0,
              Total: formData.noMaleIlliterateTotal || 0,
              Minorities: formData.noMaleIlliterateMinorities || 0
            };
            data.femaleIlliterate = {
              SC: formData.noFemaleIlliterateSC || 0,
              ST: formData.noFemaleIlliterateST || 0,
              OBC: formData.noFemaleIlliterateOBC || 0,
              Others: formData.noFemaleIlliterateOthers || 0,
              Total: formData.noFemaleIlliterateTotal || 0,
              Minorities: formData.noFemaleIlliterateMinorities || 0
            };
            data.bplIlliteratePerson = {
              SC: formData.noBplIlliteratePersonsSC || 0,
              ST: formData.noBplIlliteratePersonsST || 0,
              OBC: formData.noBplIlliteratePersonsOBC || 0,
              Others: formData.noBplIlliteratePersonsOthers || 0,
              Total: formData.noBplIlliteratePersonsTotal || 0,
              Minorities: formData.noBplIlliteratePersonsMinorities || 0
            };
            data.maleBplIlliterate = {
              SC: formData.noMaleBplIlliterateSC || 0,
              ST: formData.noMaleBplIlliterateST || 0,
              OBC: formData.noMaleBplIlliterateOBC || 0,
              Others: formData.noMaleBplIlliterateOthers || 0,
              Total: formData.noMaleBplIlliterateTotal || 0,
              Minorities: formData.noMaleBplIlliterateMinorities || 0
            };
            data.femaleBplIlliterate = {
              SC: formData.noFemaleBplIlliterateSC || 0,
              ST: formData.noFemaleBplIlliterateST || 0,
              OBC: formData.noFemaleBplIlliterateOBC || 0,
              Others: formData.noFemaleBplIlliterateOthers || 0,
              Total: formData.noFemaleBplIlliterateTotal || 0,
              Minorities: formData.noFemaleBplIlliterateMinorities || 0
            };
            data.schoolDropoutsMale = {
              SC: formData.schoolDropoutsMaleSC || 0,
              ST: formData.schoolDropoutsMaleST || 0,
              OBC: formData.schoolDropoutsMaleOBC || 0,
              Others: formData.schoolDropoutsMaleOthers || 0,
              Total: formData.schoolDropoutsMaleTotal || 0,
              Minorities: formData.schoolDropoutsMaleMinorities || 0
            };
            data.schoolDropoutsFemale = {
              SC: formData.schoolDropoutsFemaleSC || 0,
              ST: formData.schoolDropoutsFemaleST || 0,
              OBC: formData.schoolDropoutsFemaleOBC || 0,
              Others: formData.schoolDropoutsFemaleOthers || 0,
              Total: formData.schoolDropoutsFemaleTotal || 0,
              Minorities: formData.schoolDropoutsFemaleMinorities || 0
            };
            break;
          case 'housingStatus':
            data.housingStatus = {
              dwellingUnitsPucca: formData.dwellingUnitsPucca || 0,
              dwellingUnitsSemiPucca: formData.dwellingUnitsSemiPucca || 0,
              dwellingUnitsKatcha: formData.dwellingUnitsKatcha || 0,
              dwellingUnitsTotal: formData.dwellingUnitsTotal || 0,
              dwellingUnitsWithElectricityPucca: formData.dwellingUnitsWithElectricityPucca || 0,
              dwellingUnitsWithElectricitySemiPucca: formData.dwellingUnitsWithElectricitySemiPucca || 0,
              dwellingUnitsWithElectricityKatcha: formData.dwellingUnitsWithElectricityKatcha || 0,
              dwellingUnitsWithElectricityTotal: formData.dwellingUnitsWithElectricityTotal || 0,
              landTenureWithPatta: formData.landTenureWithPatta || 0,
              landTenurePossessionCertificate: formData.landTenurePossessionCertificate || 0,
              landTenureEncroachedPrivate: formData.landTenureEncroachedPrivate || 0,
              landTenureEncroachedPublic: formData.landTenureEncroachedPublic || 0,
              landTenureOnRent: formData.landTenureOnRent || 0,
              landTenureOther: formData.landTenureOther || 0,
              landTenureTotal: formData.landTenureTotal || 0
            };
            break;
          case 'economicStatus':
            data.economicStatus = {
              economicStatusData: {
                lessThan500: formData.economicStatus?.lessThan500 || 0,
                rs500to1000: formData.economicStatus?.rs500to1000 || 0,
                rs1000to1500: formData.economicStatus?.rs1000to1500 || 0,
                rs1500to2000: formData.economicStatus?.rs1500to2000 || 0,
                rs2000to3000: formData.economicStatus?.rs2000to3000 || 0,
                moreThan3000: formData.economicStatus?.moreThan3000 || 0
              }
            };
            break;
          case 'employmentAndOccupation':
            data.employmentAndOccupation = {
              majorIndustriesPresent: formData.majorIndustriesPresent || [],
              selfEmployed: formData.occupationalStatus?.selfEmployed || 0,
              salaried: formData.occupationalStatus?.salaried || 0,
              regularWage: formData.occupationalStatus?.regularWage || 0,
              casualLabour: formData.occupationalStatus?.casualLabour || 0,
              others: formData.occupationalStatus?.others || 0
            };
            break;
          case 'physicalInfrastructure':
            data.physicalInfrastructure = {
              sourceDrinkingWater: {
                individualTap: formData.sourceDrinkingWater?.individualTap || 0,
                tubewellBorewellHandpump: formData.sourceDrinkingWater?.tubewellBorewellHandpump || 0,
                publicTap: formData.sourceDrinkingWater?.publicTap || 0,
                openwell: formData.sourceDrinkingWater?.openwell || 0,
                tankPond: formData.sourceDrinkingWater?.tankPond || 0,
                riverCanalLakeSpring: formData.sourceDrinkingWater?.riverCanalLakeSpring || 0,
                waterTanker: formData.sourceDrinkingWater?.waterTanker || 0,
                others: formData.sourceDrinkingWater?.others || 0
              },
              connectivityCityWaterSupply: formData.connectivityCityWaterSupply || "",
              drainageSewerageFacility: formData.drainageSewerageFacility || "",
              connectivityStormWaterDrainage: formData.connectivityStormWaterDrainage || "",
              connectivitySewerageSystem: formData.connectivitySewerageSystem || "",
              proneToFlooding: formData.proneToFlooding || "",
              latrineFacility: formData.latrineFacility || "",
              solidWasteManagement: {
                frequencyOfGarbageDisposal: formData.frequencyOfGarbageDisposal || "",
                arrangementForGarbageDisposal: formData.arrangementForGarbageDisposal || "",
                frequencyOfClearanceOfOpenDrains: formData.frequencyOfClearanceOfOpenDrains || ""
              },
              approachRoadType: formData.approachRoadType || "",
              distanceToNearestMotorableRoad: formData.distanceToNearestMotorableRoad || "",
              internalRoadType: formData.internalRoadType || "",
              streetLightAvailable: formData.streetLightAvailable || ""
            };
            break;
          case 'educationFacilities':
            data.educationFacilities = {
              anganwadiUnderIcds: {
                option: formData.anganwadiUnderIcds?.option || '',
                distance: formData.anganwadiUnderIcds?.distance || null
              },
              municipalPreschool: {
                option: formData.municipalPreschool?.option || '',
                distance: formData.municipalPreschool?.distance || null
              },
              privatePreschool: {
                option: formData.privatePreschool?.option || '',
                distance: formData.privatePreschool?.distance || null
              },
              municipalPrimarySchool: {
                option: formData.municipalPrimarySchool?.option || '',
                distance: formData.municipalPrimarySchool?.distance || null
              },
              stateGovtPrimarySchool: {
                option: formData.stateGovtPrimarySchool?.option || '',
                distance: formData.stateGovtPrimarySchool?.distance || null
              },
              privatePrimarySchool: {
                option: formData.privatePrimarySchool?.option || '',
                distance: formData.privatePrimarySchool?.distance || null
              },
              municipalHighSchool: {
                option: formData.municipalHighSchool?.option || '',
                distance: formData.municipalHighSchool?.distance || null
              },
              stateGovtHighSchool: {
                option: formData.stateGovtHighSchool?.option || '',
                distance: formData.stateGovtHighSchool?.distance || null
              },
              privateHighSchool: {
                option: formData.privateHighSchool?.option || '',
                distance: formData.privateHighSchool?.distance || null
              },
              adultEducationCentre: {
                option: formData.adultEducationCentre?.option || '',
                distance: formData.adultEducationCentre?.distance || null
              },
              nonFormalEducationCentre: {
                option: formData.nonFormalEducationCentre?.option || '',
                distance: formData.nonFormalEducationCentre?.distance || null
              }
            };
            break;
          case 'healthFacilities':
            data.healthFacilities = {
              urbanHealthPost: formData.urbanHealthPost || "",
              primaryHealthCentre: formData.primaryHealthCentre || "",
              governmentHospital: formData.governmentHospital || "",
              maternityCentre: formData.maternityCentre || "",
              privateClinic: formData.privateClinic || "",
              rmp: formData.rmp || "",
              ayurvedicDoctor: formData.ayurvedicDoctor || ""
            };
            break;
          case 'socialDevelopment':
            data.socialDevelopment = {
              communityHall: formData.communityHall || 0,
              livelihoodProductionCentre: formData.livelihoodProductionCentre || 0,
              vocationalTrainingCentre: formData.vocationalTrainingCentre || 0,
              streetChildrenRehabilitationCentre: formData.streetChildrenRehabilitationCentre || 0,
              nightShelter: formData.nightShelter || 0,
              oldAgeHome: formData.oldAgeHome || 0,
              oldAgePensionsHolders: formData.oldAgePensionsHolders || 0,
              widowPensionsHolders: formData.widowPensionsHolders || 0,
              disabledPensionsHolders: formData.disabledPensionsHolders || 0,
              generalInsuranceCovered: formData.generalInsuranceCovered || 0,
              healthInsuranceCovered: formData.healthInsuranceCovered || 0,
              selfHelpGroups: formData.selfHelpGroups || 0,
              thriftCreditSocieties: formData.thriftCreditSocieties || 0,
              slumDwellersAssociation: formData.slumDwellersAssociation || "",
              youthAssociations: formData.youthAssociations || 0,
              womensAssociations: formData.womensAssociations || 0
            };
            break;
          case 'additionalInfrastructure':
            data.additionalInfrastructure = {
              // Water Supply
              waterSupply: {
                pipelines: {
                  existing: formData.waterSupplyPipelinesExisting || '',
                  additionalRequirement: formData.waterSupplyPipelinesAdditional || '',
                  estimatedCost: formData.waterSupplyPipelinesCost || 0
                },
                individualTaps: {
                  existing: formData.waterSupplyIndividualTapsExisting || '',
                  additionalRequirement: formData.waterSupplyIndividualTapsAdditional || '',
                  estimatedCost: formData.waterSupplyIndividualTapsCost || 0
                },
                borewells: {
                  existing: formData.waterSupplyBorewellsExisting || '',
                  additionalRequirement: formData.waterSupplyBorewellsAdditional || '',
                  estimatedCost: formData.waterSupplyBorewellsCost || 0
                },
                connectivityToTrunkLines: {
                  existing: formData.waterSupplyConnectivityTrunkLinesExisting || '',
                  additionalRequirement: formData.waterSupplyConnectivityTrunkLinesAdditional || '',
                  estimatedCost: formData.waterSupplyConnectivityTrunkLinesCost || 0
                }
              },
              
              // Drainage/Sewerage
              drainageSewerage: {
                stormwaterDrainage: {
                  existing: formData.drainageStormwaterDrainageExisting || '',
                  additionalRequirement: formData.drainageStormwaterDrainageAdditional || '',
                  estimatedCost: formData.drainageStormwaterDrainageCost || 0
                },
                connectivityToMainDrains: {
                  existing: formData.drainageConnectivityMainDrainsExisting || '',
                  additionalRequirement: formData.drainageConnectivityMainDrainsAdditional || '',
                  estimatedCost: formData.drainageConnectivityMainDrainsCost || 0
                },
                sewerLines: {
                  existing: formData.drainageSewerLinesExisting || '',
                  additionalRequirement: formData.drainageSewerLinesAdditional || '',
                  estimatedCost: formData.drainageSewerLinesCost || 0
                },
                connectivityToTrunkSewers: {
                  existing: formData.drainageConnectivityTrunkSewersExisting || '',
                  additionalRequirement: formData.drainageConnectivityTrunkSewersAdditional || '',
                  estimatedCost: formData.drainageConnectivityTrunkSewersCost || 0
                }
              },
              
              // Roads
              roads: {
                internalRoadsCC: {
                  existing: formData.roadsInternalRoadsCCExisting || '',
                  additionalRequirement: formData.roadsInternalRoadsCCAdditional || '',
                  estimatedCost: formData.roadsInternalRoadsCCCost || 0
                },
                internalRoadsBT: {
                  existing: formData.roadsInternalRoadsBTExisting || '',
                  additionalRequirement: formData.roadsInternalRoadsBTAdditional || '',
                  estimatedCost: formData.roadsInternalRoadsBTCost || 0
                },
                internalRoadsOthers: {
                  existing: formData.roadsInternalRoadsOthersExisting || '',
                  additionalRequirement: formData.roadsInternalRoadsOthersAdditional || '',
                  estimatedCost: formData.roadsInternalRoadsOthersCost || 0
                },
                approachRoadsCC: {
                  existing: formData.roadsApproachRoadsCCExisting || '',
                  additionalRequirement: formData.roadsApproachRoadsCCAdditional || '',
                  estimatedCost: formData.roadsApproachRoadsCCCost || 0
                },
                approachRoadsOthers: {
                  existing: formData.roadsApproachRoadsOthersExisting || '',
                  additionalRequirement: formData.roadsApproachRoadsOthersAdditional || '',
                  estimatedCost: formData.roadsApproachRoadsOthersCost || 0
                }
              },
              
              // Street Lighting
              streetLighting: {
                poles: {
                  existing: formData.streetLightingPolesExisting || '',
                  additionalRequirement: formData.streetLightingPolesAdditional || '',
                  estimatedCost: formData.streetLightingPolesCost || 0
                },
                lights: {
                  existing: formData.streetLightingLightsExisting || '',
                  additionalRequirement: formData.streetLightingLightsAdditional || '',
                  estimatedCost: formData.streetLightingLightsCost || 0
                }
              },
              
              // Sanitation
              sanitation: {
                individualToilets: {
                  existing: formData.sanitationIndividualToiletsExisting || '',
                  additionalRequirement: formData.sanitationIndividualToiletsAdditional || '',
                  estimatedCost: formData.sanitationIndividualToiletsCost || 0
                },
                communityToilets: {
                  existing: formData.sanitationCommunityToiletsExisting || '',
                  additionalRequirement: formData.sanitationCommunityToiletsAdditional || '',
                  estimatedCost: formData.sanitationCommunityToiletsCost || 0
                },
                seatsInCommunityToilets: {
                  existing: formData.sanitationSeatsCommunityToiletsExisting || '',
                  additionalRequirement: formData.sanitationSeatsCommunityToiletsAdditional || '',
                  estimatedCost: formData.sanitationSeatsCommunityToiletsCost || 0
                },
                dumperBins: {
                  existing: formData.sanitationDumperBinsExisting || '',
                  additionalRequirement: formData.sanitationDumperBinsAdditional || '',
                  estimatedCost: formData.sanitationDumperBinsCost || 0
                }
              },
              
              // Community Facilities
              communityFacilities: {
                communityHalls: {
                  existing: formData.communityHallsExisting || '',
                  additionalRequirement: formData.communityHallsAdditional || '',
                  estimatedCost: formData.communityHallsCost || 0
                },
                livelihoodCentres: {
                  existing: formData.communityLivelihoodCentresExisting || '',
                  additionalRequirement: formData.communityLivelihoodCentresAdditional || '',
                  estimatedCost: formData.communityLivelihoodCentresCost || 0
                },
                anganwadis: {
                  existing: formData.communityAnganwadisExisting || '',
                  additionalRequirement: formData.communityAnganwadisAdditional || '',
                  estimatedCost: formData.communityAnganwadisCost || 0
                },
                primarySchools: {
                  existing: formData.communityPrimarySchoolsExisting || '',
                  additionalRequirement: formData.communityPrimarySchoolsAdditional || '',
                  estimatedCost: formData.communityPrimarySchoolsCost || 0
                },
                healthCentres: {
                  existing: formData.communityHealthCentresExisting || '',
                  additionalRequirement: formData.communityHealthCentresAdditional || '',
                  estimatedCost: formData.communityHealthCentresCost || 0
                },
                others: {
                  existing: formData.communityOthersExisting || '',
                  additionalRequirement: formData.communityOthersAdditional || '',
                  estimatedCost: formData.communityOthersCost || 0
                }
              }
            };
            break;
          case 'reviewAndSubmit':
            // For the review and submit section, we'll include all form data
            Object.keys(formData).forEach(key => {
              if (formData[key as keyof SlumSurveyForm] !== undefined && 
                  formData[key as keyof SlumSurveyForm] !== null && 
                  formData[key as keyof SlumSurveyForm] !== '') {
                data[key] = formData[key as keyof SlumSurveyForm];
              }
            });
            break;
          default:
            // For unknown sections, return empty object
            break;
        }
        return data;
      };
      
      const sectionData = extractSectionData();
      
      // If in edit mode, store changes temporarily but don't update DB yet
      if (isEditMode) {
        setTempFormData(prev => ({
          ...prev,
          [sectionName]: sectionData
        }));
        
        showToast(`${steps[currentStep].title} saved locally`, "info");
        
        // Move to next step
        setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
      } else {
        // Original behavior for non-edit mode
        const response = await apiService.updateSurveySection(
          slumSurvey._id,
          sectionName,
          sectionData
        );
        
        if (response.success) {
          showToast(`Section saved successfully! (${response.data?.completionPercentage || 0}% complete)`, "success");
          // Update local state with new completion percentage
          if (response.data?.completionPercentage !== undefined) {
            setFormData(prev => ({
              ...prev,
              completionPercentage: response.data.completionPercentage
            }));
          }
          // Move to next step
          setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
        } else {
          showToast(response.error || "Failed to save section", "error");
        }
      }
    } catch (error) {
      console.error("Save section error:", error);
      showToast("Failed to save section", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SurveyorLayout username={user?.name || user?.username} fullScreen>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SurveyorLayout>
    );
  }

  if (!slum) {
    return (
      <SurveyorLayout username={user?.name || user?.username} fullScreen>
        <Card className="text-center py-8">
          <p className="text-error">Slum not found</p>
        </Card>
      </SurveyorLayout>
    );
  }

  return (
    <SurveyorLayout username={user?.name || user?.username} fullScreen>
      <div className="max-w-3xl mx-auto w-full pb-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
           <div>
              <button
                onClick={handleBackToDashboard}
                className="mb-2 text-sm text-slate-400 hover:text-white flex items-center transition-colors"
               >
                <span className="mr-1">←</span> Back to Dashboard
              </button>
              
              {/* Back Navigation Dialog for Leaving Survey */}
              <BackNavigationDialog
                isOpen={showLeaveConfirm}
                title="Leave Survey?"
                message="Are you sure you want to leave the survey? Your progress will be saved."
                onConfirm={confirmLeave}
                onCancel={cancelLeave}
              />
              

              <h1 className="text-3xl font-bold text-white tracking-tight">
                              {isEditMode ? "Edit Slum Survey" : "Slum Survey"}
                              {isEditMode && (
                                <span className="ml-3 text-sm font-normal bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                                  Edit Mode
                                </span>
                              )}
                            </h1>
              <p className="text-slate-400 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {slum.name}
              </p>
           </div>
        </div>

        {/* Stepper */}
        <Stepper 
            steps={steps.map(s => s.title)} 
            currentStep={currentStep} 
            completionPercentage={formData.completionPercentage || 0}
        />

        {/* Form Container */}
        <Card className="animate-slide-up">
            {currentStep === 0 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part A: General Information - City/Town
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label="State Code"
                    value={formData.stateCode || ""}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                    label="State Name"
                    value={formData.stateName || ""}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                    label="District Code"
                    value={formData.districtCode || ""}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                    label="District Name"
                    value={formData.districtName || ""}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                    label="City/Town Code"
                    value={formData.cityTownCode || ""}
                    onChange={(e) => handleInputChange("cityTownCode", e.target.value)}
                    required
                    name="cityTownCode"
                    error={getFieldError('cityTownCode')}
                    />
                    <Input
                    label="City/Town Name"
                    value={formData.cityTownName || ""}
                    onChange={(e) => handleInputChange("cityTownName", e.target.value)}
                    required
                    name="cityTownName"
                    error={getFieldError('cityTownName')}
                    />
                    <div className="md:col-span-2">
                        <Input
                        label="City/Town No. of Households (2011 Census)"
                        type="number"
                        value={formData.cityTownNoHouseholds || ""}
                        onChange={(e) => handleInputChange("cityTownNoHouseholds", parseInt(e.target.value) || 0)}
                        required
                        name="cityTownNoHouseholds"
                        error={getFieldError('cityTownNoHouseholds')}
                        />
                    </div>
                </div>
            </div>
            )}

            {currentStep === 1 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part B: City/Town Slum Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                    label="Slum Type"
                    value={formData.slumType || ""}
                    onChange={(e) => handleInputChange("slumType", e.target.value)}
                    required
                    name="slumType"
                    error={getFieldError('slumType')}
                    options={[
                        { value: "NOTIFIED", label: "Notified" },
                        { value: "NON_NOTIFIED", label: "Non-Notified" },
                        { value: "NEW_IDENTIFIED", label: "New Identified" },
                    ]}
                    />
                    <Input
                    label="Slum ID"
                    value={formData.slumIdField || ""}
                    onChange={(e) => handleInputChange("slumIdField", e.target.value)}
                    required
                    name="slumIdField"
                    error={getFieldError('slumIdField')}
                    />
                    <div className="md:col-span-2">
                        <Input
                        label="Slum Name"
                        value={formData.slumName || ""}
                        readOnly
                        className="bg-slate-800/50 cursor-not-allowed opacity-75"
                        />
                    </div>
                    <Select
                    label="Ownership of Land"
                    value={formData.ownershipLand || ""}
                    onChange={(e) => handleInputChange("ownershipLand", e.target.value)}
                    required
                    name="ownershipLand"
                    error={getFieldError('ownershipLand')}
                    options={[
                        { value: "LOCAL_BODY", label: "Local Body" },
                        { value: "STATE_GOVERNMENT", label: "State Government" },
                        { value: "CENTRAL_GOVERNMENT", label: "Central Government" },
                        { value: "PRIVATE", label: "Private" },
                        { value: "OTHER", label: "Other" },
                    ]}
                    />
                    <Input
                    label="Area (sq Mtrs)"
                    type="number"
                    value={formData.areaSqMtrs || ""}
                    onChange={(e) => handleInputChange("areaSqMtrs", parseFloat(e.target.value) || 0)}
                    required
                    name="areaSqMtrs"
                    error={getFieldError('areaSqMtrs')}
                    />
                    <Input
                    label="Slum Population"
                    type="number"
                    value={formData.slumPopulation || ""}
                    onChange={(e) => handleInputChange("slumPopulation", parseInt(e.target.value) || 0)}
                    required
                    name="slumPopulation"
                    error={getFieldError('slumPopulation')}
                    />
                    <Input
                    label="No. of Slum Households"
                    type="number"
                    value={formData.noSlumHouseholds || ""}
                    onChange={(e) => handleInputChange("noSlumHouseholds", parseInt(e.target.value) || 0)}
                    required
                    name="noSlumHouseholds"
                    error={getFieldError('noSlumHouseholds')}
                    />
                    <Input
                    label="BPL Population"
                    type="number"
                    value={formData.bplPopulation || ""}
                    onChange={(e) => handleInputChange("bplPopulation", parseInt(e.target.value) || 0)}
                    required
                    name="bplPopulation"
                    error={getFieldError('bplPopulation')}
                    />
                    <Input
                    label="No. of BPL Households"
                    type="number"
                    value={formData.noBplHouseholdsSlum || ""}
                    onChange={(e) => handleInputChange("noBplHouseholdsSlum", parseInt(e.target.value) || 0)}
                    required
                    name="noBplHouseholdsSlum"
                    error={getFieldError('noBplHouseholdsSlum')}
                    />
                </div>
            </div>
            )}
            
            {currentStep === 2 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part C: Particulars of Survey Operation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label="Surveyor Name"
                    value={formData.surveyorName || user?.name || ""}
                    onChange={(e) => handleInputChange("surveyorName", e.target.value)}
                    required
                    />
                    <Input
                    label="Survey Date"
                    type="date"
                    value={formData.surveyDate || ""}
                    onChange={(e) => handleInputChange("surveyDate", e.target.value)}
                    required
                    name="surveyDate"
                    error={getFieldError('surveyDate')}
                    />
                    <Input
                    label="Receipt of Questionnaire Date"
                    type="date"
                    value={formData.receiptQuestionnaireDate || ""}
                    onChange={(e) => handleInputChange("receiptQuestionnaireDate", e.target.value)}
                    required
                    name="receiptQuestionnaireDate"
                    error={getFieldError('receiptQuestionnaireDate')}
                    />
                    <Input
                    label="Scrutiny Date"
                    type="date"
                    value={formData.scrutinyDate || ""}
                    onChange={(e) => handleInputChange("scrutinyDate", e.target.value)}
                    required
                    name="scrutinyDate"
                    error={getFieldError('scrutinyDate')}
                    />
                    <Input
                    label="Receipt by Nodal Cell Date"
                    type="date"
                    value={formData.receiptByNodalCellDate || ""}
                    onChange={(e) => handleInputChange("receiptByNodalCellDate", e.target.value)}
                    required
                    name="receiptByNodalCellDate"
                    error={getFieldError('receiptByNodalCellDate')}
                    />
                    <div className="md:col-span-2">
                        <Input
                        label="Remarks by Investigator"
                        value={formData.remarksInvestigator || ""}
                        onChange={(e) => handleInputChange("remarksInvestigator", e.target.value)}
                        placeholder="Enter remarks by investigator..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Input
                        label="Comments by Supervisor"
                        value={formData.commentsSupervisor || ""}
                        onChange={(e) => handleInputChange("commentsSupervisor", e.target.value)}
                        placeholder="Enter comments by supervisor..."
                        />
                    </div>
                </div>
            </div>
            )}

            {currentStep === 3 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part D: Basic Information on Slum
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label="Slum Code"
                    value={formData.slumCode || ""}
                    onChange={(e) => handleInputChange("slumCode", e.target.value)}
                    required
                    name="slumCode"
                    error={getFieldError('slumCode')}
                    />
                    <Input
                    label="Location Ward"
                    value={formData.locationWard || ""}
                    onChange={(e) => handleInputChange("locationWard", e.target.value)}
                    required
                    name="locationWard"
                    error={getFieldError('locationWard')}
                    />
                    <Input
                    label="Age of Slum (Years)"
                    type="number"
                    value={formData.ageSlumYears || ""}
                    onChange={(e) => handleInputChange("ageSlumYears", parseInt(e.target.value) || 0)}
                    required
                    name="ageSlumYears"
                    error={getFieldError('ageSlumYears')}
                    />
                    <Input
                    label="Area of Slum (sq Mtrs)"
                    type="number"
                    value={formData.areaSlumSqMtrs || ""}
                    onChange={(e) => handleInputChange("areaSlumSqMtrs", parseFloat(e.target.value) || 0)}
                    required
                    name="areaSlumSqMtrs"
                    error={getFieldError('areaSlumSqMtrs')}
                    />
                    <Select
                    label="Location - Core City/Town or Fringe Area"
                    value={formData.locationCoreOrFringe || ""}
                    onChange={(e) => handleInputChange("locationCoreOrFringe", e.target.value)}
                    required
                    name="locationCoreOrFringe"
                    error={getFieldError('locationCoreOrFringe')}
                    options={[
                        { value: "CORE_CITY", label: "Core City/Town" },
                        { value: "FRINGE_AREA", label: "Fringe Area" },
                    ]}
                    />
                    <Select
                    label="Type of Area Surrounding"
                    value={formData.typeAreaSurrounding || ""}
                    onChange={(e) => handleInputChange("typeAreaSurrounding", e.target.value)}
                    required
                    name="typeAreaSurrounding"
                    error={getFieldError('typeAreaSurrounding')}
                    options={[
                        { value: "RESIDENTIAL", label: "Residential" },
                        { value: "INDUSTRIAL", label: "Industrial" },
                        { value: "COMMERCIAL", label: "Commercial" },
                        { value: "INSTITUTIONAL", label: "Institutional" },
                        { value: "OTHER", label: "Other" },
                    ]}
                    />
                    <Select
                    label="Physical Location of Slum"
                    value={formData.physicalLocationSlum || ""}
                    onChange={(e) => handleInputChange("physicalLocationSlum", e.target.value)}
                    required
                    name="physicalLocationSlum"
                    error={getFieldError('physicalLocationSlum')}
                    options={[
                        { value: "ALONG_NALLAH", label: "Along Nallah (Major Stormwater Drain) -01" },
                        { value: "ALONG_OTHER_DRAINS", label: "Along Other Drains - 02" },
                        { value: "ALONG_RAILWAY_LINE", label: "Along Railway Line - 03" },
                        { value: "ALONG_MAJOR_TRANSPORT", label: "Along Major Transport Alignment -04" },
                        { value: "ALONG_RIVER_BANK", label: "Along River / Water Body Bank -05" },
                        { value: "ON_RIVER_BED", label: "On River/ Water Body Bed -06" },
                        { value: "OTHERS_HAZARDOUS", label: "Others (Hazardous or Objectionable) - 07" },
                        { value: "OTHERS_NON_HAZARDOUS", label: "Others (Non-Hazardous/Non-objectionable) - 08" },
                    ]}
                    />
                    <Select
                    label="Is Slum Notified?"
                    value={formData.isSlumNotified || ""}
                    onChange={(e) => handleInputChange("isSlumNotified", e.target.value)}
                    required
                    name="isSlumNotified"
                    error={getFieldError('isSlumNotified')}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    {formData.isSlumNotified === "YES" && (
                    <Input
                        label="Year of Notification"
                        type="number"
                        value={formData.yearOfNotification || ""}
                        onChange={(e) => handleInputChange("yearOfNotification", parseInt(e.target.value) || 0)}
                        required
                        name="yearOfNotification"
                        error={getFieldError('yearOfNotification')}
                    />
                    )}
                </div>
            </div>
            )}

            {currentStep === 4 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part E: Land Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                    label="Ownership of Land"
                    value={formData.ownershipLandDetail || ""}
                    onChange={(e) => handleInputChange("ownershipLandDetail", e.target.value)}
                    required
                    name="ownershipLandDetail"
                    error={getFieldError('ownershipLandDetail')}
                    options={[
                        { value: "LOCAL_BODY", label: "Public: Local Body" },
                        { value: "STATE_GOVERNMENT", label: "Public: State Government" },
                        { value: "RAILWAYS", label: "Public: Railways" },
                        { value: "DEFENSE", label: "Public: Defense" },
                        { value: "AIRPORT", label: "Public: Airport" },
                        { value: "PUBLIC_OTHER", label: "Public: Other" },
                        { value: "PRIVATE", label: "Private" },
                        { value: "OTHER", label: "Other" },
                        { value: "NOT KNOWN", label: "Not Known" },
                    ]}
                    />
                    <div className="md:col-span-2">
                        <Input
                        label="Specify Ownership (if Other)"
                        value={formData.ownershipLandSpecify || ""}
                        onChange={(e) => handleInputChange("ownershipLandSpecify", e.target.value)}
                        placeholder="Specify ownership details..."
                        name="ownershipLandSpecify"
                        error={getFieldError('ownershipLandSpecify')}
                        />
                    </div>
                </div>
            </div>
            )}

            {currentStep === 5 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part F: Demographic Profile
                </h2>
                <div className="space-y-6">

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12. Population & Health</h3>
                    </div>

                    {/* Question 12 - Population & Health */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12a. Total Population in Slum</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.totalPopulationSlumSC || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumSC", parseInt(e.target.value) || 0)}
                            name="totalPopulationSlumSC"
                            error={getFieldError('totalPopulationSlumSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.totalPopulationSlumST || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumST", parseInt(e.target.value) || 0)}
                            name="totalPopulationSlumST"
                            error={getFieldError('totalPopulationSlumST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.totalPopulationSlumOBC || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumOBC", parseInt(e.target.value) || 0)}
                            name="totalPopulationSlumOBC"
                            error={getFieldError('totalPopulationSlumOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.totalPopulationSlumOthers || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumOthers", parseInt(e.target.value) || 0)}
                            name="totalPopulationSlumOthers"
                            error={getFieldError('totalPopulationSlumOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.totalPopulationSlumMinorities || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumMinorities", parseInt(e.target.value) || 0)}
                            name="totalPopulationSlumMinorities"
                            error={getFieldError('totalPopulationSlumMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.totalPopulationSlum || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlum", parseInt(e.target.value) || 0)}
                            name="totalPopulationSlum"
                            error={getFieldError('totalPopulationSlum')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - BPL Population in Slum */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12b. BPL Population in Slum</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.bplPopulationSlumSC || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumSC", parseInt(e.target.value) || 0)}
                            name="bplPopulationSlumSC"
                            error={getFieldError('bplPopulationSlumSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.bplPopulationSlumST || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumST", parseInt(e.target.value) || 0)}
                            name="bplPopulationSlumST"
                            error={getFieldError('bplPopulationSlumST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.bplPopulationSlumOBC || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumOBC", parseInt(e.target.value) || 0)}
                            name="bplPopulationSlumOBC"
                            error={getFieldError('bplPopulationSlumOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.bplPopulationSlumOthers || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumOthers", parseInt(e.target.value) || 0)}
                            name="bplPopulationSlumOthers"
                            error={getFieldError('bplPopulationSlumOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.bplPopulationSlumMinorities || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumMinorities", parseInt(e.target.value) || 0)}
                            name="bplPopulationSlumMinorities"
                            error={getFieldError('bplPopulationSlumMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.bplPopulationSlum || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlum", parseInt(e.target.value) || 0)}
                            name="bplPopulationSlum"
                            error={getFieldError('bplPopulationSlum')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No. of Households in Slum */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12c. No. of Households in Slum</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noHouseholdsSlumSC || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumSC", parseInt(e.target.value) || 0)}
                            name="noHouseholdsSlumSC"
                            error={getFieldError('noHouseholdsSlumSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noHouseholdsSlumST || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumST", parseInt(e.target.value) || 0)}
                            name="noHouseholdsSlumST"
                            error={getFieldError('noHouseholdsSlumST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noHouseholdsSlumOBC || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumOBC", parseInt(e.target.value) || 0)}
                            name="noHouseholdsSlumOBC"
                            error={getFieldError('noHouseholdsSlumOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noHouseholdsSlumOthers || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumOthers", parseInt(e.target.value) || 0)}
                            name="noHouseholdsSlumOthers"
                            error={getFieldError('noHouseholdsSlumOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noHouseholdsSlumMinorities || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumMinorities", parseInt(e.target.value) || 0)}
                            name="noHouseholdsSlumMinorities"
                            error={getFieldError('noHouseholdsSlumMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noHouseholdsSlum || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlum", parseInt(e.target.value) || 0)}
                            name="noHouseholdsSlum"
                            error={getFieldError('noHouseholdsSlum')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No. of BPL Households */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12d. No. of BPL Households</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noBplHouseholdsSC || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsSC", parseInt(e.target.value) || 0)}
                            name="noBplHouseholdsSC"
                            error={getFieldError('noBplHouseholdsSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noBplHouseholdsST || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsST", parseInt(e.target.value) || 0)}
                            name="noBplHouseholdsST"
                            error={getFieldError('noBplHouseholdsST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noBplHouseholdsOBC || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsOBC", parseInt(e.target.value) || 0)}
                            name="noBplHouseholdsOBC"
                            error={getFieldError('noBplHouseholdsOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noBplHouseholdsOthers || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsOthers", parseInt(e.target.value) || 0)}
                            name="noBplHouseholdsOthers"
                            error={getFieldError('noBplHouseholdsOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noBplHouseholdsMinorities || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsMinorities", parseInt(e.target.value) || 0)}
                            name="noBplHouseholdsMinorities"
                            error={getFieldError('noBplHouseholdsMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noBplHouseholdsTotal || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsTotal", parseInt(e.target.value) || 0)}
                            name="noBplHouseholdsTotal"
                            error={getFieldError('noBplHouseholdsTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No. of Women-headed Households */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12e. No. of Women-headed Households</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsSC || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsSC", parseInt(e.target.value) || 0)}
                            name="noWomenHeadedHouseholdsSC"
                            error={getFieldError('noWomenHeadedHouseholdsSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsST || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsST", parseInt(e.target.value) || 0)}
                            name="noWomenHeadedHouseholdsST"
                            error={getFieldError('noWomenHeadedHouseholdsST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsOBC || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsOBC", parseInt(e.target.value) || 0)}
                            name="noWomenHeadedHouseholdsOBC"
                            error={getFieldError('noWomenHeadedHouseholdsOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsOthers || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsOthers", parseInt(e.target.value) || 0)}
                            name="noWomenHeadedHouseholdsOthers"
                            error={getFieldError('noWomenHeadedHouseholdsOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsMinorities || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsMinorities", parseInt(e.target.value) || 0)}
                            name="noWomenHeadedHouseholdsMinorities"
                            error={getFieldError('noWomenHeadedHouseholdsMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsTotal || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsTotal", parseInt(e.target.value) || 0)}
                            name="noWomenHeadedHouseholdsTotal"
                            error={getFieldError('noWomenHeadedHouseholdsTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No of Persons older than 65 Years */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12f. No of Persons older than 65 Years</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noPersonsOlder65SC || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65SC", parseInt(e.target.value) || 0)}
                            name="noPersonsOlder65SC"
                            error={getFieldError('noPersonsOlder65SC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsOlder65ST || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65ST", parseInt(e.target.value) || 0)}
                            name="noPersonsOlder65ST"
                            error={getFieldError('noPersonsOlder65ST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsOlder65OBC || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65OBC", parseInt(e.target.value) || 0)}
                            name="noPersonsOlder65OBC"
                            error={getFieldError('noPersonsOlder65OBC')}  
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsOlder65Others || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65Others", parseInt(e.target.value) || 0)}
                            name="noPersonsOlder65Others"
                            error={getFieldError('noPersonsOlder65Others')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsOlder65Minorities || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65Minorities", parseInt(e.target.value) || 0)}
                            name="noPersonsOlder65Minorities"
                            error={getFieldError('noPersonsOlder65Minorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsOlder65Total || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65Total", parseInt(e.target.value) || 0)}
                            name="noPersonsOlder65Total"
                            error={getFieldError('noPersonsOlder65Total')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No of Child Labourers */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12g. No of Child Labourers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noChildLabourersSC || ""}
                            onChange={(e) => handleInputChange("noChildLabourersSC", parseInt(e.target.value) || 0)}
                            name="noChildLabourersSC"
                            error={getFieldError('noChildLabourersSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noChildLabourersST || ""}
                            onChange={(e) => handleInputChange("noChildLabourersST", parseInt(e.target.value) || 0)}
                            name="noChildLabourersST"
                            error={getFieldError('noChildLabourersST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noChildLabourersOBC || ""}
                            onChange={(e) => handleInputChange("noChildLabourersOBC", parseInt(e.target.value) || 0)}
                            name="noChildLabourersOBC"
                            error={getFieldError('noChildLabourersOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noChildLabourersOthers || ""}
                            onChange={(e) => handleInputChange("noChildLabourersOthers", parseInt(e.target.value) || 0)}
                            name="noChildLabourersOthers"
                            error={getFieldError('noChildLabourersOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noChildLabourersMinorities || ""}
                            onChange={(e) => handleInputChange("noChildLabourersMinorities", parseInt(e.target.value) || 0)}
                            name="noChildLabourersMinorities"
                            error={getFieldError('noChildLabourersMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noChildLabourersTotal || ""}
                            onChange={(e) => handleInputChange("noChildLabourersTotal", parseInt(e.target.value) || 0)}
                            name="noChildLabourersTotal"
                            error={getFieldError('noChildLabourersTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No. of Physically Challenged Persons */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12h. No. of Physically Challenged Persons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noPhysicallyChallengedSC || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedSC", parseInt(e.target.value) || 0)}
                            name="noPhysicallyChallengedSC"
                            error={getFieldError('noPhysicallyChallengedSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPhysicallyChallengedST || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedST", parseInt(e.target.value) || 0)}
                            name="noPhysicallyChallengedST"
                            error={getFieldError('noPhysicallyChallengedST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPhysicallyChallengedOBC || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedOBC", parseInt(e.target.value) || 0)}
                            name="noPhysicallyChallengedOBC"
                            error={getFieldError('noPhysicallyChallengedOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPhysicallyChallengedOthers || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedOthers", parseInt(e.target.value) || 0)}
                            name="noPhysicallyChallengedOthers"
                            error={getFieldError('noPhysicallyChallengedOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPhysicallyChallengedMinorities || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedMinorities", parseInt(e.target.value) || 0)}
                            name="noPhysicallyChallengedMinorities"
                            error={getFieldError('noPhysicallyChallengedMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPhysicallyChallengedTotal || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedTotal", parseInt(e.target.value) || 0)}
                            name="noPhysicallyChallengedTotal"
                            error={getFieldError('noPhysicallyChallengedTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No. of Mentally Challenged Persons */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12i. No. of Mentally Challenged Persons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noMentallyChallengedSC || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedSC", parseInt(e.target.value) || 0)}
                            name="noMentallyChallengedSC"
                            error={getFieldError('noMentallyChallengedSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noMentallyChallengedST || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedST", parseInt(e.target.value) || 0)}
                            name="noMentallyChallengedST"
                            error={getFieldError('noMentallyChallengedST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noMentallyChallengedOBC || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedOBC", parseInt(e.target.value) || 0)}
                            name="noMentallyChallengedOBC"
                            error={getFieldError('noMentallyChallengedOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noMentallyChallengedOthers || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedOthers", parseInt(e.target.value) || 0)}
                            name="noMentallyChallengedOthers"
                            error={getFieldError('noMentallyChallengedOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noMentallyChallengedMinorities || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedMinorities", parseInt(e.target.value) || 0)}
                            name="noMentallyChallengedMinorities"
                            error={getFieldError('noMentallyChallengedMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noMentallyChallengedTotal || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedTotal", parseInt(e.target.value) || 0)}
                            name="noMentallyChallengedTotal"
                            error={getFieldError('noMentallyChallengedTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No.of Persons with HIV-AIDs */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12j. No.of Persons with HIV-AIDs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noPersonsHivaidsSC || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsSC", parseInt(e.target.value) || 0)}
                            name="noPersonsHivaidsSC"
                            error={getFieldError('noPersonsHivaidsSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsHivaidsST || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsST", parseInt(e.target.value) || 0)}
                            name="noPersonsHivaidsST"
                            error={getFieldError('noPersonsHivaidsST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsHivaidsOBC || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsOBC", parseInt(e.target.value) || 0)}
                            name="noPersonsHivaidsOBC"
                            error={getFieldError('noPersonsHivaidsOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsHivaidsOthers || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsOthers", parseInt(e.target.value) || 0)}
                            name="noPersonsHivaidsOthers"
                            error={getFieldError('noPersonsHivaidsOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsHivaidsMinorities || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsMinorities", parseInt(e.target.value) || 0)}
                            name="noPersonsHivaidsMinorities"
                            error={getFieldError('noPersonsHivaidsMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsHivaidsTotal || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsTotal", parseInt(e.target.value) || 0)}
                            name="noPersonsHivaidsTotal"
                            error={getFieldError('noPersonsHivaidsTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No. of Persons with Tuberculosis */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12k. No. of Persons with Tuberculosis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noPersonsTuberculosisSC || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisSC", parseInt(e.target.value) || 0)}
                            name="noPersonsTuberculosisSC"
                            error={getFieldError('noPersonsTuberculosisSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsTuberculosisST || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisST", parseInt(e.target.value) || 0)}
                            name="noPersonsTuberculosisST"
                            error={getFieldError('noPersonsTuberculosisST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsTuberculosisOBC || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisOBC", parseInt(e.target.value) || 0)}
                            name="noPersonsTuberculosisOBC"
                            error={getFieldError('noPersonsTuberculosisOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsTuberculosisOthers || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisOthers", parseInt(e.target.value) || 0)}
                            name="noPersonsTuberculosisOthers"
                            error={getFieldError('noPersonsTuberculosisOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsTuberculosisMinorities || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisMinorities", parseInt(e.target.value) || 0)}
                            name="noPersonsTuberculosisMinorities"
                            error={getFieldError('noPersonsTuberculosisMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsTuberculosisTotal || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisTotal", parseInt(e.target.value) || 0)}
                            name="noPersonsTuberculosisTotal"
                            error={getFieldError('noPersonsTuberculosisTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No. of Persons with Respiratory Diseases including Asthma */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12l. No. of Persons with Respiratory Diseases including Asthma</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noPersonsRespiratorySC || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratorySC", parseInt(e.target.value) || 0)}
                            name="noPersonsRespiratorySC"
                            error={getFieldError('noPersonsRespiratorySC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsRespiratoryST || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryST", parseInt(e.target.value) || 0)}
                            name="noPersonsRespiratoryST"
                            error={getFieldError('noPersonsRespiratoryST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsRespiratoryOBC || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryOBC", parseInt(e.target.value) || 0)}
                            name="noPersonsRespiratoryOBC"
                            error={getFieldError('noPersonsRespiratoryOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsRespiratoryOthers || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryOthers", parseInt(e.target.value) || 0)}
                            name="noPersonsRespiratoryOthers"
                            error={getFieldError('noPersonsRespiratoryOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsRespiratoryMinorities || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryMinorities", parseInt(e.target.value) || 0)}
                            name="noPersonsRespiratoryMinorities"
                            error={getFieldError('noPersonsRespiratoryMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsRespiratoryTotal || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryTotal", parseInt(e.target.value) || 0)}
                            name="noPersonsRespiratoryTotal"
                            error={getFieldError('noPersonsRespiratoryTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 12 - No. of Persons with Other Chronic Diseases */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12m. No. of Persons with Other Chronic Diseases</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noPersonsOtherChronicSC || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicSC", parseInt(e.target.value) || 0)}
                            name="noPersonsOtherChronicSC"
                            error={getFieldError('noPersonsOtherChronicSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsOtherChronicST || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicST", parseInt(e.target.value) || 0)}
                            name="noPersonsOtherChronicST"
                            error={getFieldError('noPersonsOtherChronicST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsOtherChronicOBC || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicOBC", parseInt(e.target.value) || 0)}
                            name="noPersonsOtherChronicOBC"
                            error={getFieldError('noPersonsOtherChronicOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsOtherChronicOthers || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicOthers", parseInt(e.target.value) || 0)}
                            name="noPersonsOtherChronicOthers"
                            error={getFieldError('noPersonsOtherChronicOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsOtherChronicMinorities || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicMinorities", parseInt(e.target.value) || 0)}
                            name="noPersonsOtherChronicMinorities"
                            error={getFieldError('noPersonsOtherChronicMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsOtherChronicTotal || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicTotal", parseInt(e.target.value) || 0)}
                            name="noPersonsOtherChronicTotal"
                            error={getFieldError('noPersonsOtherChronicTotal')}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">13. Literacy - Education</h3>
                    </div>

                    {/* Question 13 - Total No of Illiterate Persons */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">13a. Total No of Illiterate Persons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.totalIlliteratePersonsSC || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsSC", parseInt(e.target.value) || 0)}
                            name="totalIlliteratePersonsSC"
                            error={getFieldError('totalIlliteratePersonsSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.totalIlliteratePersonsST || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsST", parseInt(e.target.value) || 0)}
                            name="totalIlliteratePersonsST"
                            error={getFieldError('totalIlliteratePersonsST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.totalIlliteratePersonsOBC || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsOBC", parseInt(e.target.value) || 0)}
                            name="totalIlliteratePersonsOBC"
                            error={getFieldError('totalIlliteratePersonsOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.totalIlliteratePersonsOthers || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsOthers", parseInt(e.target.value) || 0)}
                            name="totalIlliteratePersonsOthers"
                            error={getFieldError('totalIlliteratePersonsOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.totalIlliteratePersonsMinorities || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsMinorities", parseInt(e.target.value) || 0)}
                            name="totalIlliteratePersonsMinorities"
                            error={getFieldError('totalIlliteratePersonsMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.totalIlliteratePersonsTotal || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsTotal", parseInt(e.target.value) || 0)}
                            name="totalIlliteratePersonsTotal"
                            error={getFieldError('totalIlliteratePersonsTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 13 - No. of Male Illiterate */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">13b. No. of Male Illiterate</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noMaleIlliterateSC || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateSC", parseInt(e.target.value) || 0)}
                            name="noMaleIlliterateSC"
                            error={getFieldError('noMaleIlliterateSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noMaleIlliterateST || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateST", parseInt(e.target.value) || 0)}
                            name="noMaleIlliterateST"
                            error={getFieldError('noMaleIlliterateST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noMaleIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateOBC", parseInt(e.target.value) || 0)}
                            name="noMaleIlliterateOBC"
                            error={getFieldError('noMaleIlliterateOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noMaleIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateOthers", parseInt(e.target.value) || 0)}
                            name="noMaleIlliterateOthers"
                            error={getFieldError('noMaleIlliterateOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noMaleIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateMinorities", parseInt(e.target.value) || 0)}
                            name="noMaleIlliterateMinorities"
                            error={getFieldError('noMaleIlliterateMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noMaleIlliterateTotal || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateTotal", parseInt(e.target.value) || 0)}
                            name="noMaleIlliterateTotal"
                            error={getFieldError('noMaleIlliterateTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 13 - No. of Female Illiterate */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">13c. No. of Female Illiterate</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noFemaleIlliterateSC || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateSC", parseInt(e.target.value) || 0)}
                            name="noFemaleIlliterateSC"
                            error={getFieldError('noFemaleIlliterateSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noFemaleIlliterateST || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateST", parseInt(e.target.value) || 0)}
                            name="noFemaleIlliterateST"
                            error={getFieldError('noFemaleIlliterateST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noFemaleIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateOBC", parseInt(e.target.value) || 0)}
                            name="noFemaleIlliterateOBC"
                            error={getFieldError('noFemaleIlliterateOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noFemaleIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateOthers", parseInt(e.target.value) || 0)}
                            name="noFemaleIlliterateOthers"
                            error={getFieldError('noFemaleIlliterateOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noFemaleIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateMinorities", parseInt(e.target.value) || 0)}
                            name="noFemaleIlliterateMinorities"
                            error={getFieldError('noFemaleIlliterateMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noFemaleIlliterateTotal || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateTotal", parseInt(e.target.value) || 0)}
                            name="noFemaleIlliterateTotal"
                            error={getFieldError('noFemaleIlliterateTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 13 - No. of BPL Illiterate Persons */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">13d. No. of BPL Illiterate Persons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noBplIlliteratePersonsSC || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsSC", parseInt(e.target.value) || 0)}
                            name="noBplIlliteratePersonsSC"
                            error={getFieldError('noBplIlliteratePersonsSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noBplIlliteratePersonsST || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsST", parseInt(e.target.value) || 0)}
                            name="noBplIlliteratePersonsST"
                            error={getFieldError('noBplIlliteratePersonsST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noBplIlliteratePersonsOBC || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsOBC", parseInt(e.target.value) || 0)}
                            name="noBplIlliteratePersonsOBC"
                            error={getFieldError('noBplIlliteratePersonsOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noBplIlliteratePersonsOthers || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsOthers", parseInt(e.target.value) || 0)}
                            name="noBplIlliteratePersonsOthers"
                            error={getFieldError('noBplIlliteratePersonsOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noBplIlliteratePersonsMinorities || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsMinorities", parseInt(e.target.value) || 0)}
                            name="noBplIlliteratePersonsMinorities"
                            error={getFieldError('noBplIlliteratePersonsMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noBplIlliteratePersonsTotal || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsTotal", parseInt(e.target.value) || 0)}
                            name="noBplIlliteratePersonsTotal"
                            error={getFieldError('noBplIlliteratePersonsTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 13 - No. of Male BPL Illiterate */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">13e. No. of Male BPL Illiterate</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noMaleBplIlliterateSC || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateSC", parseInt(e.target.value) || 0)}
                            name="noMaleBplIlliterateSC"
                            error={getFieldError('noMaleBplIlliterateSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noMaleBplIlliterateST || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateST", parseInt(e.target.value) || 0)}
                            name="noMaleBplIlliterateST"
                            error={getFieldError('noMaleBplIlliterateST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noMaleBplIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateOBC", parseInt(e.target.value) || 0)}
                            name="noMaleBplIlliterateOBC"
                            error={getFieldError('noMaleBplIlliterateOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noMaleBplIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateOthers", parseInt(e.target.value) || 0)}
                            name="noMaleBplIlliterateOthers"
                            error={getFieldError('noMaleBplIlliterateOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noMaleBplIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateMinorities", parseInt(e.target.value) || 0)}
                            name="noMaleBplIlliterateMinorities"
                            error={getFieldError('noMaleBplIlliterateMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noMaleBplIlliterateTotal || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateTotal", parseInt(e.target.value) || 0)}
                            name="noMaleBplIlliterateTotal"
                            error={getFieldError('noMaleBplIlliterateTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 13 - No. of Female BPL Illiterate */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">13f. No. of Female BPL Illiterate</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.noFemaleBplIlliterateSC || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateSC", parseInt(e.target.value) || 0)}
                            name="noFemaleBplIlliterateSC"
                            error={getFieldError('noFemaleBplIlliterateSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noFemaleBplIlliterateST || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateST", parseInt(e.target.value) || 0)}
                            name="noFemaleBplIlliterateST"
                            error={getFieldError('noFemaleBplIlliterateST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noFemaleBplIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateOBC", parseInt(e.target.value) || 0)}
                            name="noFemaleBplIlliterateOBC"
                            error={getFieldError('noFemaleBplIlliterateOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noFemaleBplIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateOthers", parseInt(e.target.value) || 0)}
                            name="noFemaleBplIlliterateOthers"
                            error={getFieldError('noFemaleBplIlliterateOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noFemaleBplIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateMinorities", parseInt(e.target.value) || 0)}
                            name="noFemaleBplIlliterateMinorities"
                            error={getFieldError('noFemaleBplIlliterateMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noFemaleBplIlliterateTotal || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateTotal", parseInt(e.target.value) || 0)}
                            name="noFemaleBplIlliterateTotal"
                            error={getFieldError('noFemaleBplIlliterateTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 13 - School Dropouts – Male */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">13g. School Dropouts – Male</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.schoolDropoutsMaleSC || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleSC", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsMaleSC"
                            error={getFieldError('schoolDropoutsMaleSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.schoolDropoutsMaleST || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleST", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsMaleST"
                            error={getFieldError('schoolDropoutsMaleST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.schoolDropoutsMaleOBC || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleOBC", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsMaleOBC"
                            error={getFieldError('schoolDropoutsMaleOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.schoolDropoutsMaleOthers || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleOthers", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsMaleOthers"
                            error={getFieldError('schoolDropoutsMaleOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.schoolDropoutsMaleMinorities || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleMinorities", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsMaleMinorities"
                            error={getFieldError('schoolDropoutsMaleMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.schoolDropoutsMaleTotal || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleTotal", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsMaleTotal"
                            error={getFieldError('schoolDropoutsMaleTotal')}
                            />
                        </div>
                    </div>
                    
                    {/* Question 13 - School Dropouts – Female */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">13h. School Dropouts – Female</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.schoolDropoutsFemaleSC || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleSC", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsFemaleSC"
                            error={getFieldError('schoolDropoutsFemaleSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.schoolDropoutsFemaleST || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleST", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsFemaleST"
                            error={getFieldError('schoolDropoutsFemaleST')}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.schoolDropoutsFemaleOBC || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleOBC", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsFemaleOBC"
                            error={getFieldError('schoolDropoutsFemaleOBC')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.schoolDropoutsFemaleOthers || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleOthers", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsFemaleOthers"
                            error={getFieldError('schoolDropoutsFemaleOthers')}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.schoolDropoutsFemaleMinorities || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleMinorities", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsFemaleMinorities"
                            error={getFieldError('schoolDropoutsFemaleMinorities')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.schoolDropoutsFemaleTotal || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleTotal", parseInt(e.target.value) || 0)}
                            name="schoolDropoutsFemaleTotal"
                            error={getFieldError('schoolDropoutsFemaleTotal')}
                            />
                        </div>
                    </div>
                </div>
            </div>
            )}

            {currentStep === 6 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part G: Housing Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label="Dwelling Units - Pucca"
                    type="number"
                    value={formData.dwellingUnitsPucca || ""}
                    onChange={(e) => handleInputChange("dwellingUnitsPucca", parseInt(e.target.value) || 0)}
                    required
                    name="dwellingUnitsPucca"
                    error={getFieldError('dwellingUnitsPucca')}
                    />
                    <Input
                    label="Dwelling Units - Semi-Pucca"
                    type="number"
                    value={formData.dwellingUnitsSemiPucca || ""}
                    onChange={(e) => handleInputChange("dwellingUnitsSemiPucca", parseInt(e.target.value) || 0)}
                    required
                    name="dwellingUnitsSemiPucca"
                    error={getFieldError('dwellingUnitsSemiPucca')}
                    />
                    <Input
                    label="Dwelling Units - Katcha"
                    type="number"
                    value={formData.dwellingUnitsKatcha || ""}
                    onChange={(e) => handleInputChange("dwellingUnitsKatcha", parseInt(e.target.value) || 0)}
                    required
                    name="dwellingUnitsKatcha"
                    error={getFieldError('dwellingUnitsKatcha')}
                    />
                    <Input
                    label="Dwelling Units - Total"
                    type="number"
                    value={formData.dwellingUnitsTotal || ""}
                    onChange={(e) => handleInputChange("dwellingUnitsTotal", parseInt(e.target.value) || 0)}
                    required
                    name="dwellingUnitsTotal"
                    error={getFieldError('dwellingUnitsTotal')}
                    />
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4">Land Tenure</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="With Patta"
                            type="number"
                            value={formData.landTenureWithPatta || ""}
                            onChange={(e) => handleInputChange("landTenureWithPatta", parseInt(e.target.value) || 0)}
                            required
                            name="landTenureWithPatta"
                            error={getFieldError('landTenureWithPatta')}
                            />
                            <Input
                            label="Possession Certificate"
                            type="number"
                            value={formData.landTenurePossessionCertificate || ""}
                            onChange={(e) => handleInputChange("landTenurePossessionCertificate", parseInt(e.target.value) || 0)}
                            required
                            name="landTenurePossessionCertificate"
                            error={getFieldError('landTenurePossessionCertificate')}
                            />
                            <Input
                            label="Encroached Private"
                            type="number"
                            value={formData.landTenureEncroachedPrivate || ""}
                            onChange={(e) => handleInputChange("landTenureEncroachedPrivate", parseInt(e.target.value) || 0)}
                            required
                            name="landTenureEncroachedPrivate"
                            error={getFieldError('landTenureEncroachedPrivate')}
                            />
                            <Input
                            label="Encroached Public"
                            type="number"
                            value={formData.landTenureEncroachedPublic || ""}
                            onChange={(e) => handleInputChange("landTenureEncroachedPublic", parseInt(e.target.value) || 0)}
                            required
                            name="landTenureEncroachedPublic"
                            error={getFieldError('landTenureEncroachedPublic')}
                            />
                            <Input
                            label="On Rent"
                            type="number"
                            value={formData.landTenureOnRent || ""}
                            onChange={(e) => handleInputChange("landTenureOnRent", parseInt(e.target.value) || 0)}
                            required
                            name="landTenureOnRent"
                            error={getFieldError('landTenureOnRent')}
                            />
                            <Input
                            label="Other"
                            type="number"
                            value={formData.landTenureOther || ""}
                            onChange={(e) => handleInputChange("landTenureOther", parseInt(e.target.value) || 0)}
                            required
                            name="landTenureOther"
                            error={getFieldError('landTenureOther')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.landTenureTotal || ""}
                            onChange={(e) => handleInputChange("landTenureTotal", parseInt(e.target.value) || 0)}
                            required
                            name="landTenureTotal"
                            error={getFieldError('landTenureTotal')}
                            />
                        </div>
                    </div>
                </div>
            </div>
            )}

            {currentStep === 7 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part H: Economic Status of Households
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label="Less than ₹500"
                    type="number"
                    value={formData.economicStatus?.lessThan500 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "lessThan500", parseInt(e.target.value) || 0)}
                    required
                    name="economicStatus.lessThan500"
                    error={getFieldError('economicStatus.lessThan500')}
                    />
                    <Input
                    label="₹500 to ₹1000"
                    type="number"
                    value={formData.economicStatus?.rs500to1000 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "rs500to1000", parseInt(e.target.value) || 0)}
                    required
                    name="economicStatus.rs500to1000"
                    error={getFieldError('economicStatus.rs500to1000')}
                    />
                    <Input
                    label="₹1000 to ₹1500"
                    type="number"
                    value={formData.economicStatus?.rs1000to1500 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "rs1000to1500", parseInt(e.target.value) || 0)}
                    required
                    name="economicStatus.rs1000to1500"
                    error={getFieldError('economicStatus.rs1000to1500')}
                    />
                    <Input
                    label="₹1500 to ₹2000"
                    type="number"
                    value={formData.economicStatus?.rs1500to2000 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "rs1500to2000", parseInt(e.target.value) || 0)}
                    required
                    name="economicStatus.rs1500to2000"
                    error={getFieldError('economicStatus.rs1500to2000')}
                    />
                    <Input
                    label="₹2000 to ₹3000"
                    type="number"
                    value={formData.economicStatus?.rs2000to3000 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "rs2000to3000", parseInt(e.target.value) || 0)}
                    required
                    name="economicStatus.rs2000to3000"
                    error={getFieldError('economicStatus.rs2000to3000')}
                    />
                    <Input
                    label="More than ₹3000"
                    type="number"
                    value={formData.economicStatus?.moreThan3000 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "moreThan3000", parseInt(e.target.value) || 0)}
                    required
                    name="economicStatus.moreThan3000"
                    error={getFieldError('economicStatus.moreThan3000')}
                    />
                </div>
            </div>
            )}

            {currentStep === 8 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part I: Occupation Status of Households
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label="Self Employed"
                    type="number"
                    value={formData.occupationalStatus?.selfEmployed || ""}
                    onChange={(e) => handleNestedInputChange("occupationalStatus", "selfEmployed", parseInt(e.target.value) || 0)}
                    required
                    name="occupationalStatus.selfEmployed"
                    error={getFieldError('occupationalStatus.selfEmployed')}
                    />
                    <Input
                    label="Salaried"
                    type="number"
                    value={formData.occupationalStatus?.salaried || ""}
                    onChange={(e) => handleNestedInputChange("occupationalStatus", "salaried", parseInt(e.target.value) || 0)}
                    required
                    name="occupationalStatus.salaried"
                    error={getFieldError('occupationalStatus.salaried')}
                    />
                    <Input
                    label="Regular Wage"
                    type="number"
                    value={formData.occupationalStatus?.regularWage || ""}
                    onChange={(e) => handleNestedInputChange("occupationalStatus", "regularWage", parseInt(e.target.value) || 0)}
                    required
                    name="occupationalStatus.regularWage"
                    error={getFieldError('occupationalStatus.regularWage')}
                    />
                    <Input
                    label="Casual Labour"
                    type="number"
                    value={formData.occupationalStatus?.casualLabour || ""}
                    onChange={(e) => handleNestedInputChange("occupationalStatus", "casualLabour", parseInt(e.target.value) || 0)}
                    required
                    name="occupationalStatus.casualLabour"
                    error={getFieldError('occupationalStatus.casualLabour')}
                    />
                    <Input
                    label="Others"
                    type="number"
                    value={formData.occupationalStatus?.others || ""}
                    onChange={(e) => handleNestedInputChange("occupationalStatus", "others", parseInt(e.target.value) || 0)}
                    required
                    name="occupationalStatus.others"
                    error={getFieldError('occupationalStatus.others')}
                    />
                </div>
            </div>
            )}

            {currentStep === 9 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part J: Access to Physical Infrastructure
                </h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Source of Drinking Water</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="Individual Tap"
                            type="number"
                            value={formData.sourceDrinkingWater?.individualTap || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "individualTap", parseInt(e.target.value) || 0)}
                            required
                            name="sourceDrinkingWater.individualTap"
                            error={getFieldError('sourceDrinkingWater.individualTap')}
                            />
                            <Input
                            label="Tube-well/Borewell/Handpump"
                            type="number"
                            value={formData.sourceDrinkingWater?.tubewellBorewellHandpump || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "tubewellBorewellHandpump", parseInt(e.target.value) || 0)}
                            required
                            name="sourceDrinkingWater.tubewellBorewellHandpump"
                            error={getFieldError('sourceDrinkingWater.tubewellBorewellHandpump')}
                            />
                            <Input
                            label="Public Tap"
                            type="number"
                            value={formData.sourceDrinkingWater?.publicTap || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "publicTap", parseInt(e.target.value) || 0)}
                            required
                            name="sourceDrinkingWater.publicTap"
                            error={getFieldError('sourceDrinkingWater.publicTap')}
                            />  
                            <Input
                            label="Open-well"
                            type="number"
                            value={formData.sourceDrinkingWater?.openwell || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "openwell", parseInt(e.target.value) || 0)}
                            required
                            name="sourceDrinkingWater.openwell"
                            error={getFieldError('sourceDrinkingWater.openwell')}
                            />
                            <Input
                            label="Tank/Pond"
                            type="number"
                            value={formData.sourceDrinkingWater?.tankPond || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "tankPond", parseInt(e.target.value) || 0)}
                            required
                            name="sourceDrinkingWater.tankPond"
                            error={getFieldError('sourceDrinkingWater.tankPond')}
                            />
                            <Input
                            label="River/Canal/Lake/Spring"
                            type="number"
                            value={formData.sourceDrinkingWater?.riverCanalLakeSpring || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "riverCanalLakeSpring", parseInt(e.target.value) || 0)}
                            required
                            name="sourceDrinkingWater.riverCanalLakeSpring"
                            error={getFieldError('sourceDrinkingWater.riverCanalLakeSpring')}
                            />
                            <Input
                            label="Water Tanker"
                            type="number"
                            value={formData.sourceDrinkingWater?.waterTanker || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "waterTanker", parseInt(e.target.value) || 0)}
                            required
                            name="sourceDrinkingWater.waterTanker"
                            error={getFieldError('sourceDrinkingWater.waterTanker')}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.sourceDrinkingWater?.others || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "others", parseInt(e.target.value) || 0)}
                            required
                            name="sourceDrinkingWater.others"
                            error={getFieldError('sourceDrinkingWater.others')}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                        label="Connectivity to City Water Supply"
                        value={formData.connectivityCityWaterSupply || ""}
                        onChange={(e) => handleInputChange("connectivityCityWaterSupply", e.target.value)}
                        required
                        options={[
                            { value: "FULLY_CONNECTED", label: "Fully Connected" },
                            { value: "PARTIALLY_CONNECTED", label: "Partially Connected" },
                            { value: "NOT_CONNECTED", label: "Not Connected" },
                        ]}
                        />
                        <Select
                        label="Drainage/Sewerage Facility"
                        value={formData.drainageSewerageFacility || ""}
                        onChange={(e) => handleInputChange("drainageSewerageFacility", e.target.value)}
                        required
                        options={[
                            { value: "YES", label: "Yes" },
                            { value: "NO", label: "No" },
                        ]}
                        />
                        <Select
                        label="Connectivity to Storm Water Drainage"
                        value={formData.connectivityStormWaterDrainage || ""}
                        onChange={(e) => handleInputChange("connectivityStormWaterDrainage", e.target.value)}
                        required
                        options={[
                            { value: "FULLY_CONNECTED", label: "Fully Connected" },
                            { value: "PARTIALLY_CONNECTED", label: "Partially Connected" },
                            { value: "NOT_CONNECTED", label: "Not Connected" },
                        ]}
                        />
                        <Select
                        label="Connectivity to Sewerage System"
                        value={formData.connectivitySewerageSystem || ""}
                        onChange={(e) => handleInputChange("connectivitySewerageSystem", e.target.value)}
                        required
                        options={[
                            { value: "FULLY_CONNECTED", label: "Fully Connected" },
                            { value: "PARTIALLY_CONNECTED", label: "Partially Connected" },
                            { value: "NOT_CONNECTED", label: "Not Connected" },
                        ]}
                        />
                        <Select
                        label="Prone to Flooding"
                        value={formData.proneToFlooding || ""}
                        onChange={(e) => handleInputChange("proneToFlooding", e.target.value)}
                        required
                        options={[
                            { value: "NOT_PRONE", label: "Not Prone" },
                            { value: "UPTO_15_DAYS", label: "Up to 15 Days" },
                            { value: "DAYS_15_TO_30", label: "15-30 Days" },
                            { value: "MORE_THAN_MONTH", label: "More than a Month" },
                        ]}
                        />
                    </div>
                    
                    {/* Question 20 - Latrine facility used by Households */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">20. Latrine facility used by Households</h3>
                        <Select
                        label="Latrine Facility"
                        value={formData.latrineFacility || ""}
                        onChange={(e) => handleInputChange("latrineFacility", e.target.value)}
                        required
                        options={[
                            { value: "PUBLIC_LATRINE", label: "Public Latrine" },
                            { value: "SHARED_LATRINE", label: "Shared Latrine" },
                            { value: "OWN_LATRINE", label: "Own Latrine" },
                        ]}
                        />
                    </div>
                    
                    {/* Solid Waste Management Section (Questions 21a-21c) */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Solid Waste Management</h3>
                        
                        {/* Question 21a - Frequency of Garbage Disposal */}
                        <div className="mb-6">
                            <h4 className="text-md font-medium text-white mb-2">21a. Frequency of Garbage Disposal</h4>
                            <Select
                            label="Frequency"
                            value={formData.frequencyOfGarbageDisposal || ""}
                            onChange={(e) => handleInputChange("frequencyOfGarbageDisposal", e.target.value)}
                            required
                            options={[
                                { value: "DAILY", label: "Daily" },
                                { value: "ONCE_IN_2_DAYS", label: "Once in 2 days" },
                                { value: "ONCE_IN_WEEK", label: "Once in a week" },
                                { value: "ONCE_IN_15_DAYS", label: "Once in 15 days" },
                                { value: "NO_COLLECTION", label: "No collection" },
                            ]}
                            />
                        </div>
                        
                        {/* Question 21b - Arrangement for Garbage Disposal */}
                        <div className="mb-6">
                            <h4 className="text-md font-medium text-white mb-2">21b. Arrangement for Garbage Disposal</h4>
                            <Select
                            label="Arrangement"
                            value={formData.arrangementForGarbageDisposal || ""}
                            onChange={(e) => handleInputChange("arrangementForGarbageDisposal", e.target.value)}
                            required
                            options={[
                                { value: "MUNICIPAL_STAFF", label: "Municipal staff" },
                                { value: "MUNICIPAL_CONTRACTOR", label: "Municipal Contractor" },
                                { value: "RESIDENTS_THEMSELVES", label: "Residents themselves" },
                                { value: "OTHERS", label: "Others" },
                                { value: "NO_ARRANGEMENT", label: "No arrangement" },
                            ]}
                            />
                        </div>
                        
                        {/* Question 21c - Frequency of Clearance of Open Drains */}
                        <div>
                            <h4 className="text-md font-medium text-white mb-2">21c. Frequency of Clearance of Open Drains</h4>
                            <Select
                            label="Frequency"
                            value={formData.frequencyOfClearanceOfOpenDrains || ""}
                            onChange={(e) => handleInputChange("frequencyOfClearanceOfOpenDrains", e.target.value)}
                            required
                            options={[
                                { value: "DAILY", label: "Daily" },
                                { value: "ONCE_IN_2_DAYS", label: "Once in 2 days" },
                                { value: "ONCE_IN_WEEK", label: "Once in a week" },
                                { value: "ONCE_IN_15_DAYS", label: "Once in 15 days" },
                                { value: "NO_CLEARANCE", label: "No clearance" },
                            ]}
                            />
                        </div>
                    </div>
                    
                    {/* Additional Physical Infrastructure (Questions 22-25) */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Additional Physical Infrastructure</h3>
                        
                        {/* Question 22 - Approach Road/Lane/Constructed Path */}
                        <div className="mb-4">
                            <h4 className="text-md font-medium text-white mb-2">22. Approach Road/Lane/Constructed Path to the Slum</h4>
                            <Select
                            label="Road Type"
                            value={formData.approachRoadType || ""}
                            onChange={(e) => handleInputChange("approachRoadType", e.target.value)}
                            required
                            options={[
                                { value: "MOTORABLE_PUCCA", label: "Motorable pucca" },
                                { value: "MOTORABLE_KATCHA", label: "Motorable katcha" },
                                { value: "NON_MOTORABLE_PUCCA", label: "Non-motorable pucca" },
                                { value: "NON_MOTORABLE_KATCHA", label: "Non-motorable katcha" },
                            ]}
                            />
                        </div>
                        
                        {/* Question 23 - Distance from the nearest Motorable Road */}
                        <div className="mb-4">
                            <h4 className="text-md font-medium text-white mb-2">23. Distance from the nearest Motorable Road</h4>
                            <Select
                            label="Distance"
                            value={formData.distanceToNearestMotorableRoad || ""}
                            required
                            onChange={(e) => handleInputChange("distanceToNearestMotorableRoad", e.target.value)}
                            options={[
                                { value: "LESS_THAN_0_5_KMS", label: "Less than 0.5 kms" },
                                { value: "0_5_TO_1_0_KM", label: "0.5 to 1.0 km" },
                                { value: "1_0_TO_2_0_KM", label: "1.0 km to 2.0 km" },
                                { value: "2_0_TO_5_0_KM", label: "2.0 km to 5.0 km" },
                                { value: "MORE_THAN_5_0_KM", label: "More than 5.0 km" },
                            ]}
                            />
                        </div>
                        
                        {/* Question 24 - Internal Road */}
                        <div className="mb-4">
                            <h4 className="text-md font-medium text-white mb-2">24. Internal Road</h4>
                            <Select
                            label="Road Type"
                            value={formData.internalRoadType || ""}
                            required
                            onChange={(e) => handleInputChange("internalRoadType", e.target.value)}
                            options={[
                                { value: "MOTORABLE_PUCCA", label: "Motorable pucca" },
                                { value: "MOTORABLE_KATCHA", label: "Motorable kutcha" },
                                { value: "NON_MOTORABLE_PUCCA", label: "Non-motorable pucca" },
                                { value: "NON_MOTORABLE_KATCHA", label: "Non-motorable katcha" },
                            ]}
                            />
                        </div>
                        
                        {/* Question 25 - Street light facility */}
                        <div>
                            <h4 className="text-md font-medium text-white mb-2">25. Whether Street light facility is available in the Slum</h4>
                            <Select
                            label="Street Light Available"
                            value={formData.streetLightAvailable || ""}
                            required
                            onChange={(e) => handleInputChange("streetLightAvailable", e.target.value)}
                            options={[
                                { value: "YES", label: "Yes" },
                                { value: "NO", label: "No" },
                            ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
            )}

            {currentStep === 10 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part K: Education Facilities (Questions 26-30)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Select
                        label="26a. Anganwadi under ICDS"
                        value={formData.anganwadiUnderIcds?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('anganwadiUnderIcds', 'option', value);
                          // Clear distance if option is not 'Within the slum area'
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('anganwadiUnderIcds', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.anganwadiUnderIcds?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.anganwadiUnderIcds?.distance || ''}
                          onChange={(e) => handleNestedInputChange('anganwadiUnderIcds', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="26b. Municipal pre-school"
                        value={formData.municipalPreschool?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('municipalPreschool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('municipalPreschool', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.municipalPreschool?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.municipalPreschool?.distance || ''}
                          onChange={(e) => handleNestedInputChange('municipalPreschool', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="26c. Private pre-school"
                        value={formData.privatePreschool?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('privatePreschool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('privatePreschool', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.privatePreschool?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.privatePreschool?.distance || ''}
                          onChange={(e) => handleNestedInputChange('privatePreschool', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="27a. Municipal Primary School"
                        value={formData.municipalPrimarySchool?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('municipalPrimarySchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('municipalPrimarySchool', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.municipalPrimarySchool?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.municipalPrimarySchool?.distance || ''}
                          onChange={(e) => handleNestedInputChange('municipalPrimarySchool', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="27b. State Government Primary School"
                        value={formData.stateGovtPrimarySchool?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('stateGovtPrimarySchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('stateGovtPrimarySchool', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.stateGovtPrimarySchool?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.stateGovtPrimarySchool?.distance || ''}
                          onChange={(e) => handleNestedInputChange('stateGovtPrimarySchool', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="27c. Private Primary School"
                        value={formData.privatePrimarySchool?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('privatePrimarySchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('privatePrimarySchool', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.privatePrimarySchool?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.privatePrimarySchool?.distance || ''}
                          onChange={(e) => handleNestedInputChange('privatePrimarySchool', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="28a. Municipal High School"
                        value={formData.municipalHighSchool?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('municipalHighSchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('municipalHighSchool', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.municipalHighSchool?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.municipalHighSchool?.distance || ''}
                          onChange={(e) => handleNestedInputChange('municipalHighSchool', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="28b. State Government High School"
                        value={formData.stateGovtHighSchool?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('stateGovtHighSchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('stateGovtHighSchool', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.stateGovtHighSchool?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.stateGovtHighSchool?.distance || ''}
                          onChange={(e) => handleNestedInputChange('stateGovtHighSchool', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="28c. Private High School"
                        value={formData.privateHighSchool?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('privateHighSchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('privateHighSchool', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.privateHighSchool?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.privateHighSchool?.distance || ''}
                          onChange={(e) => handleNestedInputChange('privateHighSchool', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="29. Adult Education Centre"
                        value={formData.adultEducationCentre?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('adultEducationCentre', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('adultEducationCentre', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.adultEducationCentre?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.adultEducationCentre?.distance || ''}
                          onChange={(e) => handleNestedInputChange('adultEducationCentre', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                    <div>
                      <Select
                        label="30. Non-formal Education Centre"
                        value={formData.nonFormalEducationCentre?.option || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('nonFormalEducationCentre', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('nonFormalEducationCentre', 'distance', null);
                          }
                        }}
                        options={[{ value: '', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
                      />
                      {formData.nonFormalEducationCentre?.option === 'Within the slum area' && (
                        <Input
                          label="Distance within slum area"
                          type="number"
                          value={formData.nonFormalEducationCentre?.distance || ''}
                          onChange={(e) => handleNestedInputChange('nonFormalEducationCentre', 'distance', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                        />
                      )}
                    </div>
                </div>
            </div>
            )}

            {currentStep === 11 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part L: Health Facilities (Question 31)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                    label="31a. Urban Health Post"
                    value={formData.urbanHealthPost || ""}
                    required
                    onChange={(e) => handleInputChange("urbanHealthPost", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31b. Primary Health Centre"
                    value={formData.primaryHealthCentre || ""}
                    required
                    onChange={(e) => handleInputChange("primaryHealthCentre", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31c. Government Hospital"
                    value={formData.governmentHospital || ""}
                    required
                    onChange={(e) => handleInputChange("governmentHospital", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31d. Maternity Centre"
                    value={formData.maternityCentre || ""}
                    required
                    onChange={(e) => handleInputChange("maternityCentre", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31e. Private Clinic"
                    value={formData.privateClinic || ""}
                    required
                    onChange={(e) => handleInputChange("privateClinic", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31f. Registered Medical Practitioner (RMP)"
                    value={formData.rmp || ""}
                    required
                    onChange={(e) => handleInputChange("rmp", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31g. Ayurvedic Doctor/Vaidya"
                    value={formData.ayurvedicDoctor || ""}
                    required
                    onChange={(e) => handleInputChange("ayurvedicDoctor", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                </div>
            </div>
            )}

            {currentStep === 12 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part M: Social Development/Welfare (Questions 32-36c)
                </h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">32. Availability of Facilities within Slum:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="32a. Community Hall"
                            type="number"
                            value={formData.communityHall || ""}
                            required
                            onChange={(e) => handleInputChange("communityHall", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32b. Livelihood/Production Centre"
                            type="number"
                            value={formData.livelihoodProductionCentre || ""}
                            required
                            onChange={(e) => handleInputChange("livelihoodProductionCentre", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32c. Vocational training/Training-cum-production Centre"
                            type="number"
                            value={formData.vocationalTrainingCentre || ""}
                            required
                            onChange={(e) => handleInputChange("vocationalTrainingCentre", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32d. Street Children Rehabilitation Centre"
                            type="number"
                            value={formData.streetChildrenRehabilitationCentre || ""}
                            required
                            onChange={(e) => handleInputChange("streetChildrenRehabilitationCentre", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32e. Night Shelter"
                            type="number"
                            value={formData.nightShelter || ""}
                            required
                            onChange={(e) => handleInputChange("nightShelter", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32f. Old Age Home"
                            type="number"
                            value={formData.oldAgeHome || ""}
                            required
                            onChange={(e) => handleInputChange("oldAgeHome", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">33. Social Security Schemes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="33a. Old Age Pension Holders"
                            type="number"
                            value={formData.oldAgePensionsHolders || ""}
                            required
                            onChange={(e) => handleInputChange("oldAgePensionsHolders", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="33b. Widow Pension Holders"
                            type="number"
                            value={formData.widowPensionsHolders || ""}
                            required
                            onChange={(e) => handleInputChange("widowPensionsHolders", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="33c. Disabled Pension Holders"
                            type="number"
                            value={formData.disabledPensionsHolders || ""}
                            required
                            onChange={(e) => handleInputChange("disabledPensionsHolders", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="33d. General Insurance Covered"
                            type="number"
                            value={formData.generalInsuranceCovered || ""}
                            required
                            onChange={(e) => handleInputChange("generalInsuranceCovered", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="33e. Health Insurance Covered"
                            type="number"
                            value={formData.healthInsuranceCovered || ""}
                            required
                            onChange={(e) => handleInputChange("healthInsuranceCovered", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Community Organizations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="34. Self Help Groups"
                            type="number"
                            value={formData.selfHelpGroups || ""}
                            required
                            onChange={(e) => handleInputChange("selfHelpGroups", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="35. Thrift & Credit Societies"
                            type="number"
                            value={formData.thriftCreditSocieties || ""}
                            required
                            onChange={(e) => handleInputChange("thriftCreditSocieties", parseInt(e.target.value) || 0)}
                            />
                            <Select
                            label="36a. Slum Dwellers Association"
                            value={formData.slumDwellersAssociation || ""}
                            required
                            onChange={(e) => handleInputChange("slumDwellersAssociation", e.target.value)}
                            options={[
                                { value: "YES", label: "Yes" },
                                { value: "NO", label: "No" },
                            ]}
                            />
                            <Input
                            label="36b. Youth Associations"
                            type="number"
                            value={formData.youthAssociations || ""}
                            required
                            onChange={(e) => handleInputChange("youthAssociations", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="36c. Women's Associations"
                            type="number"
                            value={formData.womensAssociations || ""}
                            required
                            onChange={(e) => handleInputChange("womensAssociations", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            )}

            {currentStep === 13 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part N: Additional Infrastructure Requirements
                </h2>
                <div className="space-y-8">
                    
                    {/* Water Supply Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">37. Water Supply</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                            label="Pipelines (Rmts) - Existing"
                            value={formData.waterSupplyPipelinesExisting || ""}
                            onChange={(e) => handleInputChange("waterSupplyPipelinesExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="waterSupplyPipelinesExisting"
                            error={getFieldError("waterSupplyPipelinesExisting")}
                            />
                            <Select
                            label="Pipelines (Rmts) - Additional Requirement"
                            value={formData.waterSupplyPipelinesAdditional || ""}
                            onChange={(e) => handleInputChange("waterSupplyPipelinesAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="waterSupplyPipelinesAdditional"
                            error={getFieldError("waterSupplyPipelinesAdditional")}
                            />
                            {formData.waterSupplyPipelinesAdditional === "Yes" && (
                            <Input
                            label="Pipelines (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.waterSupplyPipelinesCost || ""}
                            onChange={(e) => handleInputChange("waterSupplyPipelinesCost", parseInt(e.target.value) || 0)}
                            name="waterSupplyPipelinesCost"
                            error={getFieldError("waterSupplyPipelinesCost")}
                            />
                            )}
                            
                            <Select
                            label="Individual Taps (Nos.) - Existing"
                            value={formData.waterSupplyIndividualTapsExisting || ""}
                            onChange={(e) => handleInputChange("waterSupplyIndividualTapsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="waterSupplyIndividualTapsExisting"
                            error={getFieldError("waterSupplyIndividualTapsExisting")}
                            />
                            <Select
                            label="Individual Taps (Nos.) - Additional Requirement"
                            value={formData.waterSupplyIndividualTapsAdditional || ""}
                            onChange={(e) => handleInputChange("waterSupplyIndividualTapsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="waterSupplyIndividualTapsAdditional"
                            error={getFieldError("waterSupplyIndividualTapsAdditional")}
                            />
                            {formData.waterSupplyIndividualTapsAdditional === "Yes" && (
                            <Input
                            label="Individual Taps (Nos.) - Estimated Cost"
                            type="number"
                            value={formData.waterSupplyIndividualTapsCost || ""}
                            onChange={(e) => handleInputChange("waterSupplyIndividualTapsCost", parseInt(e.target.value) || 0)}
                            name="waterSupplyIndividualTapsCost"
                            error={getFieldError("waterSupplyIndividualTapsCost")}
                            />
                            )}
                            
                            <Select
                            label="Borewells (Nos.) - Existing"
                            value={formData.waterSupplyBorewellsExisting || ""}
                            onChange={(e) => handleInputChange("waterSupplyBorewellsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="waterSupplyBorewellsExisting"
                            error={getFieldError("waterSupplyBorewellsExisting")}
                            />
                            <Select
                            label="Borewells (Nos.) - Additional Requirement"
                            value={formData.waterSupplyBorewellsAdditional || ""}
                            onChange={(e) => handleInputChange("waterSupplyBorewellsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="waterSupplyBorewellsAdditional"
                            error={getFieldError("waterSupplyBorewellsAdditional")}
                            />
                            {formData.waterSupplyBorewellsAdditional === "Yes" && (
                            <Input
                            label="Borewells (Nos.) - Estimated Cost"
                            type="number"
                            value={formData.waterSupplyBorewellsCost || ""}
                            onChange={(e) => handleInputChange("waterSupplyBorewellsCost", parseInt(e.target.value) || 0)}
                            name="waterSupplyBorewellsCost"
                            error={getFieldError("waterSupplyBorewellsCost")}
                            />
                            )}
                            
                            <Select
                            label="Connectivity to Trunk Lines (Rmts) - Existing"
                            value={formData.waterSupplyConnectivityTrunkLinesExisting || ""}
                            onChange={(e) => handleInputChange("waterSupplyConnectivityTrunkLinesExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="waterSupplyConnectivityTrunkLinesExisting"
                            error={getFieldError("waterSupplyConnectivityTrunkLinesExisting")}
                            />
                            <Select
                            label="Connectivity to Trunk Lines (Rmts) - Additional Requirement"
                            value={formData.waterSupplyConnectivityTrunkLinesAdditional || ""}
                            onChange={(e) => handleInputChange("waterSupplyConnectivityTrunkLinesAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="waterSupplyConnectivityTrunkLinesAdditional"
                            error={getFieldError("waterSupplyConnectivityTrunkLinesAdditional")}
                            />
                            {formData.waterSupplyConnectivityTrunkLinesAdditional === "Yes" && (
                            <Input
                            label="Connectivity to Trunk Lines (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.waterSupplyConnectivityTrunkLinesCost || ""}
                            onChange={(e) => handleInputChange("waterSupplyConnectivityTrunkLinesCost", parseInt(e.target.value) || 0)}
                            name="waterSupplyConnectivityTrunkLinesCost"
                            error={getFieldError("waterSupplyConnectivityTrunkLinesCost")}
                            />
                            )}
                        </div>
                    </div>
                    
                    {/* Drainage/Sewerage Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">38. Drainage/Sewerage</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                            label="Stormwater Drainage (Rmts.) - Existing"
                            value={formData.drainageStormwaterDrainageExisting || ""}
                            onChange={(e) => handleInputChange("drainageStormwaterDrainageExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="drainageStormwaterDrainageExisting"
                            error={getFieldError("drainageStormwaterDrainageExisting")}
                            />
                            <Select
                            label="Stormwater Drainage (Rmts.) - Additional Requirement"
                            value={formData.drainageStormwaterDrainageAdditional || ""}
                            onChange={(e) => handleInputChange("drainageStormwaterDrainageAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="drainageStormwaterDrainageAdditional"
                            error={getFieldError("drainageStormwaterDrainageAdditional")}
                            />
                            {formData.drainageStormwaterDrainageAdditional === "Yes" && (
                            <Input
                            label="Stormwater Drainage (Rmts.) - Estimated Cost"
                            type="number"
                            value={formData.drainageStormwaterDrainageCost || ""}
                            onChange={(e) => handleInputChange("drainageStormwaterDrainageCost", parseInt(e.target.value) || 0)}
                            name="drainageStormwaterDrainageCost"
                            error={getFieldError("drainageStormwaterDrainageCost")}
                            />
                            )}
                            
                            <Select
                            label="Connectivity to Main Drains (Rmts) - Existing"
                            value={formData.drainageConnectivityMainDrainsExisting || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityMainDrainsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="drainageConnectivityMainDrainsExisting"
                            error={getFieldError("drainageConnectivityMainDrainsExisting")}
                            />
                            <Select
                            label="Connectivity to Main Drains (Rmts) - Additional Requirement"
                            value={formData.drainageConnectivityMainDrainsAdditional || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityMainDrainsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="drainageConnectivityMainDrainsAdditional"
                            error={getFieldError("drainageConnectivityMainDrainsAdditional")}
                            />
                            {formData.drainageConnectivityMainDrainsAdditional === "Yes" && (
                            <Input
                            label="Connectivity to Main Drains (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.drainageConnectivityMainDrainsCost || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityMainDrainsCost", parseInt(e.target.value) || 0)}
                            name="drainageConnectivityMainDrainsCost"
                            error={getFieldError("drainageConnectivityMainDrainsCost")}
                            />
                            )}
                            
                            <Select
                            label="Sewer Lines (Rmts) - Existing"
                            value={formData.drainageSewerLinesExisting || ""}
                            onChange={(e) => handleInputChange("drainageSewerLinesExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="drainageSewerLinesExisting"
                            error={getFieldError("drainageSewerLinesExisting")}
                            />
                            <Select
                            label="Sewer Lines (Rmts) - Additional Requirement"
                            value={formData.drainageSewerLinesAdditional || ""}
                            onChange={(e) => handleInputChange("drainageSewerLinesAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="drainageSewerLinesAdditional"
                            error={getFieldError("drainageSewerLinesAdditional")}
                            />
                            {formData.drainageSewerLinesAdditional === "Yes" && (
                            <Input
                            label="Sewer Lines (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.drainageSewerLinesCost || ""}
                            onChange={(e) => handleInputChange("drainageSewerLinesCost", parseInt(e.target.value) || 0)}
                            name="drainageSewerLinesCost"
                            error={getFieldError("drainageSewerLinesCost")}
                            />
                            )}
                            
                            <Select
                            label="Connectivity to Trunk Sewers (Rmts) - Existing"
                            value={formData.drainageConnectivityTrunkSewersExisting || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityTrunkSewersExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="drainageConnectivityTrunkSewersExisting"
                            error={getFieldError("drainageConnectivityTrunkSewersExisting")}
                            />
                            <Select
                            label="Connectivity to Trunk Sewers (Rmts) - Additional Requirement"
                            value={formData.drainageConnectivityTrunkSewersAdditional || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityTrunkSewersAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="drainageConnectivityTrunkSewersAdditional"
                            error={getFieldError("drainageConnectivityTrunkSewersAdditional")}
                            />
                            {formData.drainageConnectivityTrunkSewersAdditional === "Yes" && (
                            <Input
                            label="Connectivity to Trunk Sewers (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.drainageConnectivityTrunkSewersCost || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityTrunkSewersCost", parseInt(e.target.value) || 0)}
                            name="drainageConnectivityTrunkSewersCost"
                            error={getFieldError("drainageConnectivityTrunkSewersCost")}
                            />
                            )}
                        </div>
                    </div>
                    
                    {/* Roads Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">39. Roads</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                            label="Internal Roads -CC (Rmts) - Existing"
                            value={formData.roadsInternalRoadsCCExisting || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsCCExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsInternalRoadsCCExisting"
                            error={getFieldError("roadsInternalRoadsCCExisting")}
                            />
                            <Select
                            label="Internal Roads -CC (Rmts) - Additional Requirement"
                            value={formData.roadsInternalRoadsCCAdditional || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsCCAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsInternalRoadsCCAdditional"
                            error={getFieldError("roadsInternalRoadsCCAdditional")}
                            />
                            {formData.roadsInternalRoadsCCAdditional === "Yes" && (
                            <Input
                            label="Internal Roads -CC (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.roadsInternalRoadsCCCost || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsCCCost", parseInt(e.target.value) || 0)}
                            name="roadsInternalRoadsCCCost"
                            error={getFieldError("roadsInternalRoadsCCCost")}
                            />
                            )}
                            
                            <Select
                            label="Internal Roads - BT (Rmts.) - Existing"
                            value={formData.roadsInternalRoadsBTExisting || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsBTExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsInternalRoadsBTExisting"
                            error={getFieldError("roadsInternalRoadsBTExisting")}
                            />
                            <Select
                            label="Internal Roads - BT (Rmts.) - Additional Requirement"
                            value={formData.roadsInternalRoadsBTAdditional || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsBTAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsInternalRoadsBTAdditional"
                            error={getFieldError("roadsInternalRoadsBTAdditional")}
                            />
                            {formData.roadsInternalRoadsBTAdditional === "Yes" && (
                            <Input
                            label="Internal Roads - BT (Rmts.) - Estimated Cost"
                            type="number"
                            value={formData.roadsInternalRoadsBTCost || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsBTCost", parseInt(e.target.value) || 0)}
                            name="roadsInternalRoadsBTCost"
                            error={getFieldError("roadsInternalRoadsBTCost")}
                            />
                            )}
                            
                            <Select
                            label="Internal Roads - Others (Rmts) - Existing"
                            value={formData.roadsInternalRoadsOthersExisting || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsOthersExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsInternalRoadsOthersExisting"
                            error={getFieldError("roadsInternalRoadsOthersExisting")}
                            />
                            <Select
                            label="Internal Roads - Others (Rmts) - Additional Requirement"
                            value={formData.roadsInternalRoadsOthersAdditional || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsOthersAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsInternalRoadsOthersAdditional"
                            error={getFieldError("roadsInternalRoadsOthersAdditional")}
                            />
                            {formData.roadsInternalRoadsOthersAdditional === "Yes" && (
                            <Input
                            label="Internal Roads - Others (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.roadsInternalRoadsOthersCost || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsOthersCost", parseInt(e.target.value) || 0)}
                            name="roadsInternalRoadsOthersCost"
                            error={getFieldError("roadsInternalRoadsOthersCost")}
                            />
                            )}
                            
                            <Select
                            label="Approach Roads -CC (Rmts) - Existing"
                            value={formData.roadsApproachRoadsCCExisting || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsCCExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsApproachRoadsCCExisting"
                            error={getFieldError("roadsApproachRoadsCCExisting")}
                            />
                            <Select
                            label="Approach Roads -CC (Rmts) - Additional Requirement"
                            value={formData.roadsApproachRoadsCCAdditional || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsCCAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsApproachRoadsCCAdditional"
                            error={getFieldError("roadsApproachRoadsCCAdditional")}
                            />
                            {formData.roadsApproachRoadsCCAdditional === "Yes" && (
                            <Input
                            label="Approach Roads -CC (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.roadsApproachRoadsCCCost || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsCCCost", parseInt(e.target.value) || 0)}
                            name="roadsApproachRoadsCCCost"
                            error={getFieldError("roadsApproachRoadsCCCost")}
                            />
                            )}
                            
                            <Select
                            label="Approach Roads - Others (Rmts) - Existing"
                            value={formData.roadsApproachRoadsOthersExisting || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsOthersExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsApproachRoadsOthersExisting"
                            error={getFieldError("roadsApproachRoadsOthersExisting")}
                            />
                            <Select
                            label="Approach Roads - Others (Rmts) - Additional Requirement"
                            value={formData.roadsApproachRoadsOthersAdditional || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsOthersAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="roadsApproachRoadsOthersAdditional"
                            error={getFieldError("roadsApproachRoadsOthersAdditional")}
                            />
                            {formData.roadsApproachRoadsOthersAdditional === "Yes" && (
                            <Input
                            label="Approach Roads - Others (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.roadsApproachRoadsOthersCost || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsOthersCost", parseInt(e.target.value) || 0)}
                            name="roadsApproachRoadsOthersCost"
                            error={getFieldError("roadsApproachRoadsOthersCost")}
                            />
                            )}
                        </div>
                    </div>
                    
                    {/* Street Lighting Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">40. Street Lighting</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                            label="Street Light Poles (Nos.) - Existing"
                            value={formData.streetLightingPolesExisting || ""}
                            onChange={(e) => handleInputChange("streetLightingPolesExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="streetLightingPolesExisting"
                            error={getFieldError("streetLightingPolesExisting")}
                            />
                            <Select
                            label="Street Light Poles (Nos.) - Additional Requirement"
                            value={formData.streetLightingPolesAdditional || ""}
                            onChange={(e) => handleInputChange("streetLightingPolesAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="streetLightingPolesAdditional"
                            error={getFieldError("streetLightingPolesAdditional")}
                            />
                            {formData.streetLightingPolesAdditional === "Yes" && (
                            <Input
                            label="Street Light Poles (Nos.) - Estimated Cost"
                            type="number"
                            value={formData.streetLightingPolesCost || ""}
                            onChange={(e) => handleInputChange("streetLightingPolesCost", parseInt(e.target.value) || 0)}
                            name="streetLightingPolesCost"
                            error={getFieldError("streetLightingPolesCost")}
                            />
                            )}
                            
                            <Select
                            label="Street Lights (Nos) - Existing"
                            value={formData.streetLightingLightsExisting || ""}
                            onChange={(e) => handleInputChange("streetLightingLightsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="streetLightingLightsExisting"
                            error={getFieldError("streetLightingLightsExisting")}
                            />
                            <Select
                            label="Street Lights (Nos) - Additional Requirement"
                            value={formData.streetLightingLightsAdditional || ""}
                            onChange={(e) => handleInputChange("streetLightingLightsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="streetLightingLightsAdditional"
                            error={getFieldError("streetLightingLightsAdditional")}
                            />
                            {formData.streetLightingLightsAdditional === "Yes" && (
                            <Input
                            label="Street Lights (Nos) - Estimated Cost"
                            type="number"
                            value={formData.streetLightingLightsCost || ""}
                            onChange={(e) => handleInputChange("streetLightingLightsCost", parseInt(e.target.value) || 0)}
                            name="streetLightingLightsCost"
                            error={getFieldError("streetLightingLightsCost")}
                            />
                            )}
                        </div>
                    </div>
                    
                    {/* Sanitation Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">41. Sanitation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                            label="Individual Toilets (Nos) - Existing"
                            value={formData.sanitationIndividualToiletsExisting || ""}
                            onChange={(e) => handleInputChange("sanitationIndividualToiletsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="sanitationIndividualToiletsExisting"
                            error={getFieldError("sanitationIndividualToiletsExisting")}
                            />
                            <Select
                            label="Individual Toilets (Nos) - Additional Requirement"
                            value={formData.sanitationIndividualToiletsAdditional || ""}
                            onChange={(e) => handleInputChange("sanitationIndividualToiletsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="sanitationIndividualToiletsAdditional"
                            error={getFieldError("sanitationIndividualToiletsAdditional")}
                            />
                            {formData.sanitationIndividualToiletsAdditional === "Yes" && (
                            <Input
                            label="Individual Toilets (Nos) - Estimated Cost"
                            type="number"
                            value={formData.sanitationIndividualToiletsCost || ""}
                            onChange={(e) => handleInputChange("sanitationIndividualToiletsCost", parseInt(e.target.value) || 0)}
                            name="sanitationIndividualToiletsCost"
                            error={getFieldError("sanitationIndividualToiletsCost")}
                            />
                            )}
                            
                            <Select
                            label="Community Toilets (Nos) - Existing"
                            value={formData.sanitationCommunityToiletsExisting || ""}
                            onChange={(e) => handleInputChange("sanitationCommunityToiletsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="sanitationCommunityToiletsExisting"
                            error={getFieldError("sanitationCommunityToiletsExisting")}
                            />
                            <Select
                            label="Community Toilets (Nos) - Additional Requirement"
                            value={formData.sanitationCommunityToiletsAdditional || ""}
                            onChange={(e) => handleInputChange("sanitationCommunityToiletsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="sanitationCommunityToiletsAdditional"
                            error={getFieldError("sanitationCommunityToiletsAdditional")}
                            />
                            {formData.sanitationCommunityToiletsAdditional === "Yes" && (
                            <Input
                            label="Community Toilets (Nos) - Estimated Cost"
                            type="number"
                            value={formData.sanitationCommunityToiletsCost || ""}
                            onChange={(e) => handleInputChange("sanitationCommunityToiletsCost", parseInt(e.target.value) || 0)}
                            name="sanitationCommunityToiletsCost"
                            error={getFieldError("sanitationCommunityToiletsCost")}
                            />
                            )}
                            
                            <Select
                            label="Seats in Community Toilets (Nos.) - Existing"
                            value={formData.sanitationSeatsCommunityToiletsExisting || ""}
                            onChange={(e) => handleInputChange("sanitationSeatsCommunityToiletsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="sanitationSeatsCommunityToiletsExisting"
                            error={getFieldError("sanitationSeatsCommunityToiletsExisting")}
                            />
                            <Select
                            label="Seats in Community Toilets (Nos.) - Additional Requirement"
                            value={formData.sanitationSeatsCommunityToiletsAdditional || ""}
                            onChange={(e) => handleInputChange("sanitationSeatsCommunityToiletsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="sanitationSeatsCommunityToiletsAdditional"
                            error={getFieldError("sanitationSeatsCommunityToiletsAdditional")}
                            />
                            {formData.sanitationSeatsCommunityToiletsAdditional === "Yes" && (
                            <Input
                            label="Seats in Community Toilets (Nos.) - Estimated Cost"
                            type="number"
                            value={formData.sanitationSeatsCommunityToiletsCost || ""}
                            onChange={(e) => handleInputChange("sanitationSeatsCommunityToiletsCost", parseInt(e.target.value) || 0)}
                            name="sanitationSeatsCommunityToiletsCost"
                            error={getFieldError("sanitationSeatsCommunityToiletsCost")}
                            />
                            )}
                            
                            <Select
                            label="Dumper Bins (Nos) - Existing"
                            value={formData.sanitationDumperBinsExisting || ""}
                            onChange={(e) => handleInputChange("sanitationDumperBinsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="sanitationDumperBinsExisting"
                            error={getFieldError("sanitationDumperBinsExisting")}
                            />
                            <Select
                            label="Dumper Bins (Nos) - Additional Requirement"
                            value={formData.sanitationDumperBinsAdditional || ""}
                            onChange={(e) => handleInputChange("sanitationDumperBinsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="sanitationDumperBinsAdditional"
                            error={getFieldError("sanitationDumperBinsAdditional")}
                            />
                            {formData.sanitationDumperBinsAdditional === "Yes" && (
                            <Input
                            label="Dumper Bins (Nos) - Estimated Cost"
                            type="number"
                            value={formData.sanitationDumperBinsCost || ""}
                            onChange={(e) => handleInputChange("sanitationDumperBinsCost", parseInt(e.target.value) || 0)}
                            name="sanitationDumperBinsCost"
                            error={getFieldError("sanitationDumperBinsCost")}
                            />
                            )}
                        </div>
                    </div>
                     
                    {/* Community Facilities Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">42. Community Facilities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                            label="Community Halls (No of Rooms) - Existing"
                            value={formData.communityHallsExisting || ""}
                            onChange={(e) => handleInputChange("communityHallsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityHallsExisting"
                            error={getFieldError("communityHallsExisting")}
                            />
                            <Select
                            label="Community Halls (No of Rooms) - Additional Requirement"
                            value={formData.communityHallsAdditional || ""}
                            onChange={(e) => handleInputChange("communityHallsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityHallsAdditional"
                            error={getFieldError("communityHallsAdditional")}
                            />
                            {formData.communityHallsAdditional === "Yes" && (
                            <Input
                            label="Community Halls (No of Rooms) - Estimated Cost"
                            type="number"
                            value={formData.communityHallsCost || ""}
                            onChange={(e) => handleInputChange("communityHallsCost", parseInt(e.target.value) || 0)}
                            name="communityHallsCost"
                            error={getFieldError("communityHallsCost")}
                            />
                            )}
                            
                            <Select
                            label="Livelihood / Production Centres (Noof Rooms) - Existing"
                            value={formData.communityLivelihoodCentresExisting || ""}
                            onChange={(e) => handleInputChange("communityLivelihoodCentresExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityLivelihoodCentresExisting"
                            error={getFieldError("communityLivelihoodCentresExisting")}
                            />
                            <Select
                            label="Livelihood / Production Centres (Noof Rooms) - Additional Requirement"
                            value={formData.communityLivelihoodCentresAdditional || ""}
                            onChange={(e) => handleInputChange("communityLivelihoodCentresAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityLivelihoodCentresAdditional"
                            error={getFieldError("communityLivelihoodCentresAdditional")}
                            />
                            {formData.communityLivelihoodCentresAdditional === "Yes" && (
                            <Input
                            label="Livelihood / Production Centres (Noof Rooms) - Estimated Cost"
                            type="number"
                            value={formData.communityLivelihoodCentresCost || ""}
                            onChange={(e) => handleInputChange("communityLivelihoodCentresCost", parseInt(e.target.value) || 0)}
                            name="communityLivelihoodCentresCost"
                            error={getFieldError("communityLivelihoodCentresCost")}
                            />
                            )}
                            
                            <Select
                            label="Anganwadis /Pre-schools (No ofRooms) - Existing"
                            value={formData.communityAnganwadisExisting || ""}
                            onChange={(e) => handleInputChange("communityAnganwadisExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityAnganwadisExisting"
                            error={getFieldError("communityAnganwadisExisting")}
                            />
                            <Select
                            label="Anganwadis /Pre-schools (No ofRooms) - Additional Requirement"
                            value={formData.communityAnganwadisAdditional || ""}
                            onChange={(e) => handleInputChange("communityAnganwadisAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityAnganwadisAdditional"
                            error={getFieldError("communityAnganwadisAdditional")}
                            />
                            {formData.communityAnganwadisAdditional === "Yes" && (
                            <Input
                            label="Anganwadis /Pre-schools (No ofRooms) - Estimated Cost"
                            type="number"
                            value={formData.communityAnganwadisCost || ""}
                            onChange={(e) => handleInputChange("communityAnganwadisCost", parseInt(e.target.value) || 0)}
                            name="communityAnganwadisCost"
                            error={getFieldError("communityAnganwadisCost")}
                            />
                            )}
                            
                            <Select
                            label="Primary Schools (No of Class Rooms) - Existing"
                            value={formData.communityPrimarySchoolsExisting || ""}
                            onChange={(e) => handleInputChange("communityPrimarySchoolsExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityPrimarySchoolsExisting"
                            error={getFieldError("communityPrimarySchoolsExisting")}
                            />
                            <Select
                            label="Primary Schools (No of Class Rooms) - Additional Requirement"
                            value={formData.communityPrimarySchoolsAdditional || ""}
                            onChange={(e) => handleInputChange("communityPrimarySchoolsAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityPrimarySchoolsAdditional"
                            error={getFieldError("communityPrimarySchoolsAdditional")}
                            />
                            {formData.communityPrimarySchoolsAdditional === "Yes" && (
                            <Input
                            label="Primary Schools (No of Class Rooms) - Estimated Cost"
                            type="number"
                            value={formData.communityPrimarySchoolsCost || ""}
                            onChange={(e) => handleInputChange("communityPrimarySchoolsCost", parseInt(e.target.value) || 0)}
                            name="communityPrimarySchoolsCost"
                            error={getFieldError("communityPrimarySchoolsCost")}
                            />
                            )}
                            
                            <Select
                            label="Health Centres (No. of Rooms) - Existing"
                            value={formData.communityHealthCentresExisting || ""}
                            onChange={(e) => handleInputChange("communityHealthCentresExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityHealthCentresExisting"
                            error={getFieldError("communityHealthCentresExisting")}
                            />
                            <Select
                            label="Health Centres (No. of Rooms) - Additional Requirement"
                            value={formData.communityHealthCentresAdditional || ""}
                            onChange={(e) => handleInputChange("communityHealthCentresAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityHealthCentresAdditional"
                            error={getFieldError("communityHealthCentresAdditional")}
                            />
                            {formData.communityHealthCentresAdditional === "Yes" && (
                            <Input
                            label="Health Centres (No. of Rooms) - Estimated Cost"
                            type="number"
                            value={formData.communityHealthCentresCost || ""}
                            onChange={(e) => handleInputChange("communityHealthCentresCost", parseInt(e.target.value) || 0)}
                            name="communityHealthCentresCost"
                            error={getFieldError("communityHealthCentresCost")}
                            />
                            )}
                            
                            <Select
                            label="Others (Specify) - Existing"
                            value={formData.communityOthersExisting || ""}
                            onChange={(e) => handleInputChange("communityOthersExisting", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityOthersExisting"
                            error={getFieldError("communityOthersExisting")}
                            />
                            <Select
                            label="Others (Specify) - Additional Requirement"
                            value={formData.communityOthersAdditional || ""}
                            onChange={(e) => handleInputChange("communityOthersAdditional", e.target.value)}
                            options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                            ]}
                            required
                            name="communityOthersAdditional"
                            error={getFieldError("communityOthersAdditional")}
                            />
                            {formData.communityOthersAdditional === "Yes" && (
                            <Input
                            label="Others (Specify) - Estimated Cost"
                            type="number"
                            value={formData.communityOthersCost || ""}
                            onChange={(e) => handleInputChange("communityOthersCost", parseInt(e.target.value) || 0)}
                            name="communityOthersCost"
                            error={getFieldError("communityOthersCost")}
                            />
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Standalone Infrastructure Requirements */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">43. Standalone Infrastructure Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Electricity */}
                        <Select
                        label="Electricity - Existing"
                        value={formData.electricityExisting || ""}
                        onChange={(e) => handleInputChange("electricityExisting", e.target.value)}
                        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
                        required
                        name="electricityExisting"
                        error={getFieldError("electricityExisting")}
                        />
                        <Select
                        label="Electricity - Additional Requirement"
                        value={formData.electricityAdditional || ""}
                        onChange={(e) => handleInputChange("electricityAdditional", e.target.value)}
                        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
                        required
                        name="electricityAdditional"
                        error={getFieldError("electricityAdditional")}
                        />
                        {formData.electricityAdditional === "Yes" && (
                        <Input
                        label="Electricity - Estimated Cost"
                        type="number"
                        value={formData.electricityCost || ""}
                        onChange={(e) => handleInputChange("electricityCost", parseInt(e.target.value) || 0)}
                        name="electricityCost"
                        error={getFieldError("electricityCost")}
                        />
                        )}
                        
                        {/* Healthcare */}
                        <Select
                        label="Healthcare - Existing"
                        value={formData.healthcareExisting || ""}
                        onChange={(e) => handleInputChange("healthcareExisting", e.target.value)}
                        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
                        required
                        name="healthcareExisting"
                        error={getFieldError("healthcareExisting")}
                        />
                        <Select
                        label="Healthcare - Additional Requirement"
                        value={formData.healthcareAdditional || ""}
                        onChange={(e) => handleInputChange("healthcareAdditional", e.target.value)}
                        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
                        required
                        name="healthcareAdditional"
                        error={getFieldError("healthcareAdditional")}
                        />
                        {formData.healthcareAdditional === "Yes" && (
                        <Input
                        label="Healthcare - Estimated Cost"
                        type="number"
                        value={formData.healthcareCost || ""}
                        onChange={(e) => handleInputChange("healthcareCost", parseInt(e.target.value) || 0)}
                        name="healthcareCost"
                        error={getFieldError("healthcareCost")}
                        />
                        )}
                        
                        {/* Toilets */}
                        <Select
                        label="Toilets - Existing"
                        value={formData.toiletsExisting || ""}
                        onChange={(e) => handleInputChange("toiletsExisting", e.target.value)}
                        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
                        required
                        name="toiletsExisting"
                        error={getFieldError("toiletsExisting")}
                        />
                        <Select
                        label="Toilets - Additional Requirement"
                        value={formData.toiletsAdditional || ""}
                        onChange={(e) => handleInputChange("toiletsAdditional", e.target.value)}
                        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
                        required
                        name="toiletsAdditional"
                        error={getFieldError("toiletsAdditional")}
                        />
                        {formData.toiletsAdditional === "Yes" && (
                        <Input
                        label="Toilets - Estimated Cost"
                        type="number"
                        value={formData.toiletsCost || ""}
                        onChange={(e) => handleInputChange("toiletsCost", parseInt(e.target.value) || 0)}
                        name="toiletsCost"
                        error={getFieldError("toiletsCost")}
                        />
                        )}
                    </div>
                </div>
            </div>
            )}

            {currentStep === 14 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part O: Review & Submit
                </h2>
                <p className="text-gray-300 mb-6">Please review all the data entered in the survey before submitting. You can go back to any section to make changes if needed.</p>
                
                {/* General Information */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">1. General Information - City/Town</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>State Code:</strong> {formData.stateCode || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>State Name:</strong> {formData.stateName || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>District Code:</strong> {formData.districtCode || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>District Name:</strong> {formData.districtName || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>City/Town Code:</strong> {formData.cityTownCode || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>City/Town Name:</strong> {formData.cityTownName || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>City/Town:</strong> {formData.cityTownName || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households in City/Town:</strong> {formData.cityTownNoHouseholds || 'N/A'}</div>
                    </div>
                </div>
                
                {/* City/Town Slum Profile */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">2. City/Town Slum Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Type:</strong> {formData.slumType || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum ID:</strong> {formData.slumIdField || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Name:</strong> {formData.slumName || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Ownership of Land:</strong> {formData.ownershipLand || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Area (sq mtrs):</strong> {formData.areaSqMtrs || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Population:</strong> {formData.slumPopulation || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Slum Households:</strong> {formData.noSlumHouseholds || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population:</strong> {formData.bplPopulation || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households:</strong> {formData.noBplHouseholdsSlum || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Survey Operation */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">3. Particulars of Survey Operation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Surveyor Name:</strong> {formData.surveyorName || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Survey Date:</strong> {formData.surveyDate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Receipt of Questionnaire:</strong> {formData.receiptQuestionnaireDate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Scrutiny Date:</strong> {formData.scrutinyDate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Receipt by Nodal Cell:</strong> {formData.receiptByNodalCellDate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Remarks by Investigator:</strong> {formData.remarksInvestigator || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Comments by Supervisor:</strong> {formData.commentsSupervisor || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Basic Information */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">4. Basic Information of Slum</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Name:</strong> {formData.slumNameBasicInfo || formData.slumName || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Code:</strong> {formData.slumCode || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Location Ward:</strong> {formData.locationWard || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Age of Slum (years):</strong> {formData.ageSlumYears || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Area of Slum (sq mtrs):</strong> {formData.areaSlumSqMtrs || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Location (Core/Fringe):</strong> {formData.locationCoreOrFringe || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Type of Area Surrounding:</strong> {formData.typeAreaSurrounding || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Physical Location of Slum:</strong> {formData.physicalLocationSlum || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Is Slum Notified:</strong> {formData.isSlumNotified || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Year of Notification:</strong> {formData.yearOfNotification || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Land Status */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">5. Land Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Ownership of Land Detail:</strong> {formData.ownershipLandDetail || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Specify Ownership:</strong> {formData.ownershipLandSpecify || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Population & Health */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">6. Population & Health Demographics</h3>
                    <h3 className="text-lg font-medium mb-3 p-2 bg-blue-500 rounded text-black-800">Population & Health</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population SC:</strong> {formData.totalPopulationSlumSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population ST:</strong> {formData.totalPopulationSlumST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population OBC:</strong> {formData.totalPopulationSlumOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population Others:</strong> {formData.totalPopulationSlumOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population:</strong> {formData.totalPopulationSlum || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population Minorities:</strong> {formData.totalPopulationSlumMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population SC:</strong> {formData.bplPopulationSlumSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population ST:</strong> {formData.bplPopulationSlumST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population OBC:</strong> {formData.bplPopulationSlumOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population Others:</strong> {formData.bplPopulationSlumOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population:</strong> {formData.bplPopulationSlum || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population Minorities:</strong> {formData.bplPopulationSlumMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households SC:</strong> {formData.noHouseholdsSlumSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households ST:</strong> {formData.noHouseholdsSlumST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households OBC:</strong> {formData.noHouseholdsSlumOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households Others:</strong> {formData.noHouseholdsSlumOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households:</strong> {formData.noHouseholdsSlum || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households Minorities:</strong> {formData.noHouseholdsSlumMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households SC:</strong> {formData.noBplHouseholdsSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households ST:</strong> {formData.noBplHouseholdsST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households OBC:</strong> {formData.noBplHouseholdsOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households Others:</strong> {formData.noBplHouseholdsOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households Total:</strong> {formData.noBplHouseholdsTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households Minorities:</strong> {formData.noBplHouseholdsMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households:</strong> {formData.noWomenHeadedHouseholds || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households SC:</strong> {formData.noWomenHeadedHouseholdsSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households ST:</strong> {formData.noWomenHeadedHouseholdsST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households OBC:</strong> {formData.noWomenHeadedHouseholdsOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households Others:</strong> {formData.noWomenHeadedHouseholdsOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households Total:</strong> {formData.noWomenHeadedHouseholdsTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households Minorities:</strong> {formData.noWomenHeadedHouseholdsMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65:</strong> {formData.noPersonsOlder65 || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 SC:</strong> {formData.noPersonsOlder65SC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 ST:</strong> {formData.noPersonsOlder65ST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 OBC:</strong> {formData.noPersonsOlder65OBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 Others:</strong> {formData.noPersonsOlder65Others || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 Total:</strong> {formData.noPersonsOlder65Total || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 Minorities:</strong> {formData.noPersonsOlder65Minorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers:</strong> {formData.noChildLabourers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers SC:</strong> {formData.noChildLabourersSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers ST:</strong> {formData.noChildLabourersST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers OBC:</strong> {formData.noChildLabourersOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers Others:</strong> {formData.noChildLabourersOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers Total:</strong> {formData.noChildLabourersTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers Minorities:</strong> {formData.noChildLabourersMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged:</strong> {formData.noPhysicallyChallenged || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged SC:</strong> {formData.noPhysicallyChallengedSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged ST:</strong> {formData.noPhysicallyChallengedST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged OBC:</strong> {formData.noPhysicallyChallengedOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged Others:</strong> {formData.noPhysicallyChallengedOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged Total:</strong> {formData.noPhysicallyChallengedTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged Minorities:</strong> {formData.noPhysicallyChallengedMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged:</strong> {formData.noMentallyChallenged || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged SC:</strong> {formData.noMentallyChallengedSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged ST:</strong> {formData.noMentallyChallengedST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged OBC:</strong> {formData.noMentallyChallengedOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged Others:</strong> {formData.noMentallyChallengedOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged Total:</strong> {formData.noMentallyChallengedTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged Minorities:</strong> {formData.noMentallyChallengedMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS:</strong> {formData.noPersonsHivaids || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS SC:</strong> {formData.noPersonsHivaidsSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS ST:</strong> {formData.noPersonsHivaidsST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS OBC:</strong> {formData.noPersonsHivaidsOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS Others:</strong> {formData.noPersonsHivaidsOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS Total:</strong> {formData.noPersonsHivaidsTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS Minorities:</strong> {formData.noPersonsHivaidsMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis:</strong> {formData.noPersonsTuberculosis || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis SC:</strong> {formData.noPersonsTuberculosisSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis ST:</strong> {formData.noPersonsTuberculosisST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis OBC:</strong> {formData.noPersonsTuberculosisOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis Others:</strong> {formData.noPersonsTuberculosisOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis Total:</strong> {formData.noPersonsTuberculosisTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis Minorities:</strong> {formData.noPersonsTuberculosisMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory:</strong> {formData.noPersonsRespiratory || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory SC:</strong> {formData.noPersonsRespiratorySC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory ST:</strong> {formData.noPersonsRespiratoryST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory OBC:</strong> {formData.noPersonsRespiratoryOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory Others:</strong> {formData.noPersonsRespiratoryOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory Total:</strong> {formData.noPersonsRespiratoryTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory Minorities:</strong> {formData.noPersonsRespiratoryMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic:</strong> {formData.noPersonsOtherChronic || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic SC:</strong> {formData.noPersonsOtherChronicSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic ST:</strong> {formData.noPersonsOtherChronicST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic OBC:</strong> {formData.noPersonsOtherChronicOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic Others:</strong> {formData.noPersonsOtherChronicOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic Total:</strong> {formData.noPersonsOtherChronicTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic Minorities:</strong> {formData.noPersonsOtherChronicMinorities || 'N/A'}</div>
                    </div>

                    <h3 className="text-lg font-medium mt-3 mb-3 bg-blue-500 p-2 rounded text-black-800">Literacy & Education</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons SC:</strong> {formData.totalIlliteratePersonsSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons ST:</strong> {formData.totalIlliteratePersonsST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons OBC:</strong> {formData.totalIlliteratePersonsOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons Others:</strong> {formData.totalIlliteratePersonsOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons Total:</strong> {formData.totalIlliteratePersonsTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons Minorities:</strong> {formData.totalIlliteratePersonsMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate SC:</strong> {formData.noMaleIlliterateSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate ST:</strong> {formData.noMaleIlliterateST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate OBC:</strong> {formData.noMaleIlliterateOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate Others:</strong> {formData.noMaleIlliterateOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate Total:</strong> {formData.noMaleIlliterateTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate Minorities:</strong> {formData.noMaleIlliterateMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate SC:</strong> {formData.noFemaleIlliterateSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate ST:</strong> {formData.noFemaleIlliterateST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate OBC:</strong> {formData.noFemaleIlliterateOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate Others:</strong> {formData.noFemaleIlliterateOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate Total:</strong> {formData.noFemaleIlliterateTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate Minorities:</strong> {formData.noFemaleIlliterateMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons SC:</strong> {formData.noBplIlliteratePersonsSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons ST:</strong> {formData.noBplIlliteratePersonsST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons OBC:</strong> {formData.noBplIlliteratePersonsOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons Others:</strong> {formData.noBplIlliteratePersonsOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons Total:</strong> {formData.noBplIlliteratePersonsTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons Minorities:</strong> {formData.noBplIlliteratePersonsMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate SC:</strong> {formData.noMaleBplIlliterateSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate ST:</strong> {formData.noMaleBplIlliterateST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate OBC:</strong> {formData.noMaleBplIlliterateOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate Others:</strong> {formData.noMaleBplIlliterateOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate Total:</strong> {formData.noMaleBplIlliterateTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate Minorities:</strong> {formData.noMaleBplIlliterateMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate SC:</strong> {formData.noFemaleBplIlliterateSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate ST:</strong> {formData.noFemaleBplIlliterateST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate OBC:</strong> {formData.noFemaleBplIlliterateOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate Others:</strong> {formData.noFemaleBplIlliterateOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate Total:</strong> {formData.noFemaleBplIlliterateTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate Minorities:</strong> {formData.noFemaleBplIlliterateMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male SC:</strong> {formData.schoolDropoutsMaleSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male ST:</strong> {formData.schoolDropoutsMaleST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male OBC:</strong> {formData.schoolDropoutsMaleOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male Others:</strong> {formData.schoolDropoutsMaleOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male Total:</strong> {formData.schoolDropoutsMaleTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male Minorities:</strong> {formData.schoolDropoutsMaleMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female SC:</strong> {formData.schoolDropoutsFemaleSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female ST:</strong> {formData.schoolDropoutsFemaleST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female OBC:</strong> {formData.schoolDropoutsFemaleOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female Others:</strong> {formData.schoolDropoutsFemaleOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female Total:</strong> {formData.schoolDropoutsFemaleTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female Minorities:</strong> {formData.schoolDropoutsFemaleMinorities || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Housing Status */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">7. Housing Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units Pucca:</strong> {formData.dwellingUnitsPucca || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units Semi-Pucca:</strong> {formData.dwellingUnitsSemiPucca || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units Katcha:</strong> {formData.dwellingUnitsKatcha || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units Total:</strong> {formData.dwellingUnitsTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units with Electricity Pucca:</strong> {formData.dwellingUnitsWithElectricityPucca || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units with Electricity Semi-Pucca:</strong> {formData.dwellingUnitsWithElectricitySemiPucca || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units with Electricity Katcha:</strong> {formData.dwellingUnitsWithElectricityKatcha || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units with Electricity Total:</strong> {formData.dwellingUnitsWithElectricityTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure with Patta:</strong> {formData.landTenureWithPatta || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Possession Certificate:</strong> {formData.landTenurePossessionCertificate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Encroached Private:</strong> {formData.landTenureEncroachedPrivate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Encroached Public:</strong> {formData.landTenureEncroachedPublic || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure On Rent:</strong> {formData.landTenureOnRent || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Other:</strong> {formData.landTenureOther || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Total:</strong> {formData.landTenureTotal || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Economic Status */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">8. Economic Status of Households</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>&lt; Rs 500:</strong> {formData.economicStatus?.lessThan500 || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Rs 500-1000:</strong> {formData.economicStatus?.rs500to1000 || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Rs 1000-1500:</strong> {formData.economicStatus?.rs1000to1500 || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Rs 1500-2000:</strong> {formData.economicStatus?.rs1500to2000 || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Rs 2000-3000:</strong> {formData.economicStatus?.rs2000to3000 || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>&gt; Rs 3000:</strong> {formData.economicStatus?.moreThan3000 || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Employment and Occupation Status */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">9. Employment and Occupation Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Self Employed:</strong> {formData.occupationalStatus?.selfEmployed || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Salaried:</strong> {formData.occupationalStatus?.salaried || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Regular Wage:</strong> {formData.occupationalStatus?.regularWage || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Casual Labour:</strong> {formData.occupationalStatus?.casualLabour || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Others:</strong> {formData.occupationalStatus?.others || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Physical Infrastructure */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">10. Access to Physical Infrastructure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Source of Drinking Water:</strong> {formData.sourceDrinkingWater ? Object.entries(formData.sourceDrinkingWater).map(([key, value]) => value > 0 ? `${key}: ${value}` : '').filter(Boolean).join(', ') || 'N/A' : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Connectivity City Water Supply:</strong> {formData.connectivityCityWaterSupply || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Drainage Sewerage Facility:</strong> {formData.drainageSewerageFacility || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Connectivity Storm Water Drainage:</strong> {formData.connectivityStormWaterDrainage || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Connectivity Sewerage System:</strong> {formData.connectivitySewerageSystem || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Prone to Flooding:</strong> {formData.proneToFlooding || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Latrine Facility:</strong> {formData.latrineFacility || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Frequency of Garbage Disposal:</strong> {formData.frequencyOfGarbageDisposal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Arrangement for Garbage Disposal:</strong> {formData.arrangementForGarbageDisposal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Frequency of Clearance of Open Drains:</strong> {formData.frequencyOfClearanceOfOpenDrains || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Street Light Available:</strong> {formData.streetLightAvailable || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Approach Road Type:</strong> {formData.approachRoadType || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Distance to Nearest Motorable Road:</strong> {formData.distanceToNearestMotorableRoad || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Internal Road Type:</strong> {formData.internalRoadType || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Education Facilities */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">11. Education Facilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Anganwadi under ICDS:</strong> {formData.anganwadiUnderIcds?.option ? `${formData.anganwadiUnderIcds.option}${formData.anganwadiUnderIcds.option === 'Within the slum area' && formData.anganwadiUnderIcds.distance !== null ? ` (${formData.anganwadiUnderIcds.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Municipal Preschool:</strong> {formData.municipalPreschool?.option ? `${formData.municipalPreschool.option}${formData.municipalPreschool.option === 'Within the slum area' && formData.municipalPreschool.distance !== null ? ` (${formData.municipalPreschool.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Private Preschool:</strong> {formData.privatePreschool?.option ? `${formData.privatePreschool.option}${formData.privatePreschool.option === 'Within the slum area' && formData.privatePreschool.distance !== null ? ` (${formData.privatePreschool.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Municipal Primary School:</strong> {formData.municipalPrimarySchool?.option ? `${formData.municipalPrimarySchool.option}${formData.municipalPrimarySchool.option === 'Within the slum area' && formData.municipalPrimarySchool.distance !== null ? ` (${formData.municipalPrimarySchool.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>State Government Primary School:</strong> {formData.stateGovtPrimarySchool?.option ? `${formData.stateGovtPrimarySchool.option}${formData.stateGovtPrimarySchool.option === 'Within the slum area' && formData.stateGovtPrimarySchool.distance !== null ? ` (${formData.stateGovtPrimarySchool.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Private Primary School:</strong> {formData.privatePrimarySchool?.option ? `${formData.privatePrimarySchool.option}${formData.privatePrimarySchool.option === 'Within the slum area' && formData.privatePrimarySchool.distance !== null ? ` (${formData.privatePrimarySchool.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Municipal High School:</strong> {formData.municipalHighSchool?.option ? `${formData.municipalHighSchool.option}${formData.municipalHighSchool.option === 'Within the slum area' && formData.municipalHighSchool.distance !== null ? ` (${formData.municipalHighSchool.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>State Government High School:</strong> {formData.stateGovtHighSchool?.option ? `${formData.stateGovtHighSchool.option}${formData.stateGovtHighSchool.option === 'Within the slum area' && formData.stateGovtHighSchool.distance !== null ? ` (${formData.stateGovtHighSchool.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Private High School:</strong> {formData.privateHighSchool?.option ? `${formData.privateHighSchool.option}${formData.privateHighSchool.option === 'Within the slum area' && formData.privateHighSchool.distance !== null ? ` (${formData.privateHighSchool.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Adult Education Centre:</strong> {formData.adultEducationCentre?.option ? `${formData.adultEducationCentre.option}${formData.adultEducationCentre.option === 'Within the slum area' && formData.adultEducationCentre.distance !== null ? ` (${formData.adultEducationCentre.distance})` : ''}` : 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Non-formal Education Centre:</strong> {formData.nonFormalEducationCentre?.option ? `${formData.nonFormalEducationCentre.option}${formData.nonFormalEducationCentre.option === 'Within the slum area' && formData.nonFormalEducationCentre.distance !== null ? ` (${formData.nonFormalEducationCentre.distance})` : ''}` : 'N/A'}</div>
                    </div>
                </div>
                
                {/* Health Facilities */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">12. Health Facilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Urban Health Post:</strong> {formData.urbanHealthPost || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Primary Health Centre:</strong> {formData.primaryHealthCentre || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Government Hospital:</strong> {formData.governmentHospital || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Maternity Centre:</strong> {formData.maternityCentre || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Private Clinic:</strong> {formData.privateClinic || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>RMP:</strong> {formData.rmp || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Ayurvedic Doctor:</strong> {formData.ayurvedicDoctor || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Social Development */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">13. Social Development/Welfare</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Community Hall:</strong> {formData.communityHall || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Livelihood/Production Centre:</strong> {formData.livelihoodProductionCentre || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Vocational Training Centre:</strong> {formData.vocationalTrainingCentre || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Street Children Rehabilitation Centre:</strong> {formData.streetChildrenRehabilitationCentre || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Night Shelter:</strong> {formData.nightShelter || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Old Age Home:</strong> {formData.oldAgeHome || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Old Age Pension Holders:</strong> {formData.oldAgePensionsHolders || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Widow Pension Holders:</strong> {formData.widowPensionsHolders || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Disabled Pension Holders:</strong> {formData.disabledPensionsHolders || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>General Insurance Covered:</strong> {formData.generalInsuranceCovered || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Health Insurance Covered:</strong> {formData.healthInsuranceCovered || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Self Help Groups:</strong> {formData.selfHelpGroups || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Thrift & Credit Societies:</strong> {formData.thriftCreditSocieties || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Dwellers Association:</strong> {formData.slumDwellersAssociation || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Youth Associations:</strong> {formData.youthAssociations || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Women&apos;s Associations:</strong> {formData.womensAssociations || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Additional Infrastructure */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">14. Additional Infrastructure Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Water Supply */}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Water Supply</strong></div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Pipelines Existing:</strong> {formData.waterSupplyPipelinesExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Pipelines Additional:</strong> {formData.waterSupplyPipelinesAdditional || 'N/A'}</div>
                        {formData.waterSupplyPipelinesAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Pipelines Estimated Cost:</strong> {formData.waterSupplyPipelinesCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Individual Taps Existing:</strong> {formData.waterSupplyIndividualTapsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Individual Taps Additional:</strong> {formData.waterSupplyIndividualTapsAdditional || 'N/A'}</div>
                        {formData.waterSupplyIndividualTapsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Individual Taps Estimated Cost:</strong> {formData.waterSupplyIndividualTapsCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Borewells Existing:</strong> {formData.waterSupplyBorewellsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Borewells Additional:</strong> {formData.waterSupplyBorewellsAdditional || 'N/A'}</div>
                        {formData.waterSupplyBorewellsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Borewells Estimated Cost:</strong> {formData.waterSupplyBorewellsCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Connectivity Trunk Lines Existing:</strong> {formData.waterSupplyConnectivityTrunkLinesExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Connectivity Trunk Lines Additional:</strong> {formData.waterSupplyConnectivityTrunkLinesAdditional || 'N/A'}</div>
                        {formData.waterSupplyConnectivityTrunkLinesAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Trunk Lines Estimated Cost:</strong> {formData.waterSupplyConnectivityTrunkLinesCost || 'N/A'}</div>}
                        
                        {/* Drainage/Sewerage */}
                        <div className="p-2 bg-slate-800 rounded col-span-2 mt-4"><strong>Drainage/Sewerage</strong></div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Stormwater Drainage Existing:</strong> {formData.drainageStormwaterDrainageExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Stormwater Drainage Additional:</strong> {formData.drainageStormwaterDrainageAdditional || 'N/A'}</div>
                        {formData.drainageStormwaterDrainageAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Stormwater Drainage Estimated Cost:</strong> {formData.drainageStormwaterDrainageCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Connectivity Main Drains Existing:</strong> {formData.drainageConnectivityMainDrainsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Connectivity Main Drains Additional:</strong> {formData.drainageConnectivityMainDrainsAdditional || 'N/A'}</div>
                        {formData.drainageConnectivityMainDrainsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Main Drains Estimated Cost:</strong> {formData.drainageConnectivityMainDrainsCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Sewer Lines Existing:</strong> {formData.drainageSewerLinesExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Sewer Lines Additional:</strong> {formData.drainageSewerLinesAdditional || 'N/A'}</div>
                        {formData.drainageSewerLinesAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Sewer Lines Estimated Cost:</strong> {formData.drainageSewerLinesCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Connectivity Trunk Sewers Existing:</strong> {formData.drainageConnectivityTrunkSewersExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Connectivity Trunk Sewers Additional:</strong> {formData.drainageConnectivityTrunkSewersAdditional || 'N/A'}</div>
                        {formData.drainageConnectivityTrunkSewersAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Trunk Sewers Estimated Cost:</strong> {formData.drainageConnectivityTrunkSewersCost || 'N/A'}</div>}
                        
                        {/* Roads */}
                        <div className="p-2 bg-slate-800 rounded col-span-2 mt-4"><strong>Roads</strong></div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Internal Roads CC Existing:</strong> {formData.roadsInternalRoadsCCExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Internal Roads CC Additional:</strong> {formData.roadsInternalRoadsCCAdditional || 'N/A'}</div>
                        {formData.roadsInternalRoadsCCAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads CC Estimated Cost:</strong> {formData.roadsInternalRoadsCCCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Internal Roads BT Existing:</strong> {formData.roadsInternalRoadsBTExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Internal Roads BT Additional:</strong> {formData.roadsInternalRoadsBTAdditional || 'N/A'}</div>
                        {formData.roadsInternalRoadsBTAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads BT Estimated Cost:</strong> {formData.roadsInternalRoadsBTCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Internal Roads Others Existing:</strong> {formData.roadsInternalRoadsOthersExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Internal Roads Others Additional:</strong> {formData.roadsInternalRoadsOthersAdditional || 'N/A'}</div>
                        {formData.roadsInternalRoadsOthersAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads Others Estimated Cost:</strong> {formData.roadsInternalRoadsOthersCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Approach Roads CC Existing:</strong> {formData.roadsApproachRoadsCCExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Approach Roads CC Additional:</strong> {formData.roadsApproachRoadsCCAdditional || 'N/A'}</div>
                        {formData.roadsApproachRoadsCCAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Approach Roads CC Estimated Cost:</strong> {formData.roadsApproachRoadsCCCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Approach Roads Others Existing:</strong> {formData.roadsApproachRoadsOthersExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Approach Roads Others Additional:</strong> {formData.roadsApproachRoadsOthersAdditional || 'N/A'}</div>
                        {formData.roadsApproachRoadsOthersAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Approach Roads Others Estimated Cost:</strong> {formData.roadsApproachRoadsOthersCost || 'N/A'}</div>}
                        
                        {/* Street Lighting */}
                        <div className="p-2 bg-slate-800 rounded col-span-2 mt-4"><strong>Street Lighting</strong></div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Poles Existing:</strong> {formData.streetLightingPolesExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Poles Additional:</strong> {formData.streetLightingPolesAdditional || 'N/A'}</div>
                        {formData.streetLightingPolesAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Poles Estimated Cost:</strong> {formData.streetLightingPolesCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Lights Existing:</strong> {formData.streetLightingLightsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Lights Additional:</strong> {formData.streetLightingLightsAdditional || 'N/A'}</div>
                        {formData.streetLightingLightsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Lights Estimated Cost:</strong> {formData.streetLightingLightsCost || 'N/A'}</div>}
                        
                        {/* Sanitation */}
                        <div className="p-2 bg-slate-800 rounded col-span-2 mt-4"><strong>Sanitation</strong></div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Individual Toilets Existing:</strong> {formData.sanitationIndividualToiletsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Individual Toilets Additional:</strong> {formData.sanitationIndividualToiletsAdditional || 'N/A'}</div>
                        {formData.sanitationIndividualToiletsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Individual Toilets Estimated Cost:</strong> {formData.sanitationIndividualToiletsCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Community Toilets Existing:</strong> {formData.sanitationCommunityToiletsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Community Toilets Additional:</strong> {formData.sanitationCommunityToiletsAdditional || 'N/A'}</div>
                        {formData.sanitationCommunityToiletsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Community Toilets Estimated Cost:</strong> {formData.sanitationCommunityToiletsCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Seats in Community Toilets Existing:</strong> {formData.sanitationSeatsCommunityToiletsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Seats in Community Toilets Additional:</strong> {formData.sanitationSeatsCommunityToiletsAdditional || 'N/A'}</div>
                        {formData.sanitationSeatsCommunityToiletsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Seats in Community Toilets Estimated Cost:</strong> {formData.sanitationSeatsCommunityToiletsCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Dumper Bins Existing:</strong> {formData.sanitationDumperBinsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dumper Bins Additional:</strong> {formData.sanitationDumperBinsAdditional || 'N/A'}</div>
                        {formData.sanitationDumperBinsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Dumper Bins Estimated Cost:</strong> {formData.sanitationDumperBinsCost || 'N/A'}</div>}
                        
                        {/* Community Facilities */}
                        <div className="p-2 bg-slate-800 rounded col-span-2 mt-4"><strong>Community Facilities</strong></div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Community Halls Existing:</strong> {formData.communityHallsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Community Halls Additional:</strong> {formData.communityHallsAdditional || 'N/A'}</div>
                        {formData.communityHallsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Community Halls Estimated Cost:</strong> {formData.communityHallsCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Livelihood Centres Existing:</strong> {formData.communityLivelihoodCentresExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Livelihood Centres Additional:</strong> {formData.communityLivelihoodCentresAdditional || 'N/A'}</div>
                        {formData.communityLivelihoodCentresAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Livelihood Centres Estimated Cost:</strong> {formData.communityLivelihoodCentresCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Anganwadis Existing:</strong> {formData.communityAnganwadisExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Anganwadis Additional:</strong> {formData.communityAnganwadisAdditional || 'N/A'}</div>
                        {formData.communityAnganwadisAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Anganwadis Estimated Cost:</strong> {formData.communityAnganwadisCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Primary Schools Existing:</strong> {formData.communityPrimarySchoolsExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Primary Schools Additional:</strong> {formData.communityPrimarySchoolsAdditional || 'N/A'}</div>
                        {formData.communityPrimarySchoolsAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Primary Schools Estimated Cost:</strong> {formData.communityPrimarySchoolsCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Health Centres Existing:</strong> {formData.communityHealthCentresExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Health Centres Additional:</strong> {formData.communityHealthCentresAdditional || 'N/A'}</div>
                        {formData.communityHealthCentresAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Health Centres Estimated Cost:</strong> {formData.communityHealthCentresCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Others Existing:</strong> {formData.communityOthersExisting || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Others Additional:</strong> {formData.communityOthersAdditional || 'N/A'}</div>
                        {formData.communityOthersAdditional === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Others Estimated Cost:</strong> {formData.communityOthersCost || 'N/A'}</div>}
                    </div>
                </div>
            </div>
            )}
             
             {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 mt-8 pt-6 border-t border-slate-800">
                <Button
                    variant="secondary"
                    size="md"
                    onClick={handlePrevious}
                    disabled={currentStep === 0 || submitting || saving || (isPreviewMode && !isEditMode)}
                    className="w-full sm:w-auto"
                >
                    Previous
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {currentStep < steps.length - 1 ? (
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={saveSection}
                            disabled={saving || submitting || (isPreviewMode && !isEditMode)}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 w-full sm:w-auto"
                        >
                            {saving ? "Saving..." : (isEditMode ? "Update & Next" : "Save & Next")}
                        </Button>
                    ) : (
                        <Button
                            size="md"
                            onClick={() => {
                              console.log("Submit button clicked");
                              console.log("Button disabled:", submitting || saving || (isPreviewMode && !isEditMode));
                              handleSubmit();
                            }}
                            disabled={submitting || saving || (isPreviewMode && !isEditMode)}
                            className="bg-green-600 hover:bg-green-500 w-full sm:w-auto"
                        >
                            {submitting ? "Submitting..." : (isEditMode ? "Update Survey" : "Submit Survey")}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
      </div>


    </SurveyorLayout>
  );
}
