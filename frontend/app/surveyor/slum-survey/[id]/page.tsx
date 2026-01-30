"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  anganwadiUnderIcds?: number; // 26a. Anganwadi under ICDS
  municipalPreschool?: number; // 26b. Municipal pre-school
  privatePreschool?: number; // 26c. Private pre-school
  
  // 27. Primary School
  municipalPrimarySchool?: number; // 27a. Municipal
  stateGovtPrimarySchool?: number; // 27b. State Government
  privatePrimarySchool?: number; // 27c. Private
  
  // 28. High School
  municipalHighSchool?: number; // 28a. Municipal
  stateGovtHighSchool?: number; // 28b. State Government
  privateHighSchool?: number; // 28c. Private
  
  // 29. Adult Education Centre
  adultEducationCentre?: number; // If 01, then number
  
  // 30. Non-formal Education Centre
  nonFormalEducationCentre?: number; // If 01, then number
  
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
  selfHelpGroups?: number; // Specify Number: 0, 01, 02, 03 ....
  
  // 35. Thrift and Credit Societies in Slum
  thriftCreditSocieties?: number; // Specify Number: 0, 01, 02, 03 ....
  
  // 36a. Slum-dwellers Association
  slumDwellersAssociation?: string; // [Yes- 01, No- 02]
  // 36b. Youth Associations
  youthAssociations?: number; // Specify Number: 0, 01,02,03
  // 36c. Women's Associations/ Mahila Samithis
  womensAssociations?: number; // Specify Number: 0, 01,02,03
  
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
  waterSupplyDuration?: string;
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
  const assignmentId = params.id as string;
  const { showToast } = useToast();

  const [slum, setSlum] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [slumSurvey, setSlumSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<any>(null);

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
    { title: "Review & Submit", id: "reviewAndSubmit" },
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
            
            // Navigate to the correct section based on completion percentage
            if (surveyData.completionPercentage !== undefined) {
              // Calculate section based on completion percentage
              // Each section represents ~7.14% (100/14), so we divide by 7.14 and round down
              // If completion is 100%, we should be on the last section (index 13)
              let sectionIndex = Math.floor(surveyData.completionPercentage / (100 / 14));
              // Cap at 13 (the last section index) but if it's 100%, we should be at the review section
              // If completion is 100%, we're at the end (last section)
              if (surveyData.completionPercentage >= 100) {
                sectionIndex = 13; // Last section (Additional Infrastructure)
              } else if (surveyData.completionPercentage === 0) {
                sectionIndex = 0; // First section
              } else {
                // For intermediate percentages, use the calculated value but cap at 13
                sectionIndex = Math.min(13, sectionIndex);
              }
              setCurrentStep(sectionIndex);
            }
            
            // Skip permission check here since it should be handled at the assignment level
            
            // If survey has existing data, populate the form
            if (surveyData.basicInformation) {
              setFormData(prev => ({
                ...prev,
                slumCode: surveyData.basicInformation.slumCode || "",
                locationWard: surveyData.basicInformation.locationWardNo || "",
                ageSlumYears: surveyData.basicInformation.ageOfSlumYears || undefined,
                areaSlumSqMtrs: surveyData.basicInformation.areaOfSlumSqMeters ? parseFloat(surveyData.basicInformation.areaOfSlumSqMeters) : undefined,
                locationCoreOrFringe: surveyData.basicInformation.locatedInCoreCityOrFringe || "",
                typeAreaSurrounding: surveyData.basicInformation.typeOfAreaSurrounding || "",
                physicalLocationSlum: surveyData.basicInformation.physicalLocationOfSlum || "",
                isSlumNotified: surveyData.basicInformation.isSlumNotified || "",
                yearOfNotification: surveyData.basicInformation.yearOfNotificationIfYes ? parseInt(surveyData.basicInformation.yearOfNotificationIfYes) : undefined,
              }));
            }
            
            if (surveyData.landStatus) {
              setFormData(prev => ({
                ...prev,
                ownershipLandDetail: surveyData.landStatus.ownershipOfLand || "",
                ownershipLandSpecify: surveyData.landStatus.specifyOwnership || "",
              }));
            }
            
            // Handle infrastructure data
            if (surveyData.waterAndSanitation) {
              setFormData(prev => ({
                ...prev,
                connectivityCityWaterSupply: surveyData.waterAndSanitation.connectivityToCityWaterSupply || "",
                drainageSewerageFacility: surveyData.waterAndSanitation.drainageSewerageFacility || "",
                connectivityStormWaterDrainage: surveyData.waterAndSanitation.connectivityToStormWaterDrainage || "",
                connectivitySewerageSystem: surveyData.waterAndSanitation.connectivityToSewerageSystem || "",
                proneToFlooding: surveyData.waterAndSanitation.proneToFlooding || "",
                latrineFacility: surveyData.waterAndSanitation.latrineFacility || [],
                solidWasteManagement: surveyData.waterAndSanitation.solidWasteManagement || "",
                frequencyGarbageDisposal: surveyData.waterAndSanitation.frequencyGarbageDisposal || "",
                arrangementGarbageDisposal: surveyData.waterAndSanitation.arrangementGarbageDisposal || "",
                frequencyClearanceOpenDrains: surveyData.waterAndSanitation.frequencyClearanceOpenDrains || "",
                streetLightAvailable: surveyData.waterAndSanitation.streetLightAvailable || "",
              }));
            }
            
            // Handle health facilities data
            if (surveyData.socialInfrastructure && surveyData.socialInfrastructure.healthFacilities) {
              setFormData(prev => ({
                ...prev,
                urbanHealthPost: surveyData.socialInfrastructure.healthFacilities?.healthCenters ? (surveyData.socialInfrastructure.healthFacilities.healthCenters > 0 ? "YES" : "NO") : "",
                primaryHealthCentre: surveyData.socialInfrastructure.healthFacilities?.primaryHealthCenters ? (surveyData.socialInfrastructure.healthFacilities.primaryHealthCenters > 0 ? "YES" : "NO") : "",
                governmentHospital: surveyData.socialInfrastructure.healthFacilities?.hospitals ? (surveyData.socialInfrastructure.healthFacilities.hospitals > 0 ? "YES" : "NO") : "",
              }));
            }
            
            // Handle other health facility fields that might be stored separately
            if (surveyData.maternityCentre !== undefined) {
              setFormData(prev => ({
                ...prev,
                maternityCentre: surveyData.maternityCentre || "",
                privateClinic: surveyData.privateClinic || "",
                rmp: surveyData.rmp || "",
                ayurvedicDoctor: surveyData.ayurvedicDoctor || "",
              }));
            }
            
            if (surveyData.socialIssuesAndVulnerableGroups) {
              setFormData(prev => ({
                ...prev,
                slumDwellersAssociation: surveyData.socialIssuesAndVulnerableGroups.slumDwellersAssociation || "",
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
    // Validate the form
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
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
      
      // Transform form data to match backend model structure
      const surveyData = {
        // PART-A: I. GENERAL INFORMATION -CITY/TOWN
        generalInformation: {
          stateCode: formData.stateCode || "",
          stateName: formData.stateName || "",
          districtCode: formData.districtCode || "",
          districtName: formData.districtName || "",
          cityTownCode: formData.cityTownCode || "",
          cityTownName: formData.cityTownName || "",
          cityTown: formData.cityTown || "",
          cityTownNoHouseholds: formData.cityTownNoHouseholds || 0
        },
        
        // PART-B: II. CITY/TOWN SLUM PROFILE
        cityTownSlumProfile: {
          slumType: formData.slumType || "",
          slumIdField: formData.slumIdField || "",
          slumName: formData.slumName || "",
          ownershipLand: formData.ownershipLand || "",
          areaSqMtrs: formData.areaSqMtrs || 0,
          slumPopulation: formData.slumPopulation || 0,
          noSlumHouseholds: formData.noSlumHouseholds || 0,
          bplPopulation: formData.bplPopulation || 0,
          noBplHouseholdsCityTown: formData.noBplHouseholdsCityTown || 0
        },
        
        // PART-C: III. PARTICULARS OF SURVEY OPERATION
        surveyOperation: {
          surveyorName: formData.surveyorName || "",
          surveyDate: formData.surveyDate || "",
          receiptQuestionnaireDate: formData.receiptQuestionnaireDate || "",
          scrutinyDate: formData.scrutinyDate || "",
          receiptByNodalCellDate: formData.receiptByNodalCellDate || "",
          remarksInvestigator: formData.remarksInvestigator || "",
          commentsSupervisor: formData.commentsSupervisor || ""
        },
        
        // PART-B: II. CITY/TOWN SLUM PROFILE
        cityTownSlumProfile: {
          slumType: formData.slumType || "",
          slumIdField: formData.slumIdField || "",
          slumName: formData.slumName || "",
          ownershipLand: formData.ownershipLand || "",
          areaSqMtrs: formData.areaSqMtrs || 0,
          slumPopulation: formData.slumPopulation || 0,
          noSlumHouseholds: formData.noSlumHouseholds || 0,
          bplPopulation: formData.bplPopulation || 0,
          noBplHouseholdsCityTown: formData.noBplHouseholdsCityTown || 0
        },
        
        // PART-C: III. PARTICULARS OF SURVEY OPERATION
        surveyOperation: {
          surveyorName: formData.surveyorName || "",
          surveyDate: formData.surveyDate || "",
          receiptQuestionnaireDate: formData.receiptQuestionnaireDate || "",
          scrutinyDate: formData.scrutinyDate || "",
          receiptByNodalCellDate: formData.receiptByNodalCellDate || "",
          remarksInvestigator: formData.remarksInvestigator || "",
          commentsSupervisor: formData.commentsSupervisor || ""
        },
        
        // PART-D: I. BASIC INFORMATION ON SLUM
        basicInformation: {
          slumNameBasicInfo: formData.slumNameBasicInfo || "",
          slumCode: formData.slumCode || "",
          locationWard: formData.locationWard || "",
          ageSlumYears: formData.ageSlumYears || 0,
          areaSlumSqMtrs: formData.areaSlumSqMtrs || 0,
          locationCoreOrFringe: formData.locationCoreOrFringe || "",
          typeAreaSurrounding: formData.typeAreaSurrounding || "",
          physicalLocationSlum: formData.physicalLocationSlum || "",
          isSlumNotified: formData.isSlumNotified || "",
          yearOfNotification: formData.yearOfNotification || 0
        },
        
        // PART-E: II. LAND STATUS
        landStatus: {
          ownershipLandDetail: formData.ownershipLandDetail || "",
          ownershipLandSpecify: formData.ownershipLandSpecify || ""
        },
        populationAndHealth: {
          totalPopulation: {
            SC: formData.totalPopulationSlumSC || 0,
            ST: formData.totalPopulationSlumST || 0,
            OBC: formData.totalPopulationSlumOBC || 0,
            Others: formData.totalPopulationSlumOthers || 0,
            Total: formData.totalPopulationSlum || 0,
            Minorities: formData.totalPopulationSlumMinorities || 0
          },
          bplPopulation: {
            SC: formData.bplPopulationSlumSC || 0,
            ST: formData.bplPopulationSlumST || 0,
            OBC: formData.bplPopulationSlumOBC || 0,
            Others: formData.bplPopulationSlumOthers || 0,
            Total: formData.bplPopulationSlum || 0,
            Minorities: formData.bplPopulationSlumMinorities || 0
          },
          numberOfHouseholds: {
            SC: formData.noHouseholdsSlumSC || 0,
            ST: formData.noHouseholdsSlumST || 0,
            OBC: formData.noHouseholdsSlumOBC || 0,
            Others: formData.noHouseholdsSlumOthers || 0,
            Total: formData.noHouseholdsSlum || 0,
            Minorities: formData.noHouseholdsSlumMinorities || 0
          },
          numberOfBplHouseholds: {
            SC: formData.noBplHouseholdsSC || 0,
            ST: formData.noBplHouseholdsST || 0,
            OBC: formData.noBplHouseholdsOBC || 0,
            Others: formData.noBplHouseholdsOthers || 0,
            Total: formData.noBplHouseholdsTotal || 0,
            Minorities: formData.noBplHouseholdsMinorities || 0
          },
          womenHeadedHouseholds: {
            SC: formData.noWomenHeadedHouseholdsSC || 0,
            ST: formData.noWomenHeadedHouseholdsST || 0,
            OBC: formData.noWomenHeadedHouseholdsOBC || 0,
            Others: formData.noWomenHeadedHouseholdsOthers || 0,
            Total: formData.noWomenHeadedHouseholdsTotal || 0,
            Minorities: formData.noWomenHeadedHouseholdsMinorities || 0
          },
          personsOlderThan65Years: {
            SC: formData.noPersonsOlder65SC || 0,
            ST: formData.noPersonsOlder65ST || 0,
            OBC: formData.noPersonsOlder65OBC || 0,
            Others: formData.noPersonsOlder65Others || 0,
            Total: formData.noPersonsOlder65Total || 0,
            Minorities: formData.noPersonsOlder65Minorities || 0
          },
          childLabourers: {
            SC: formData.noChildLabourersSC || 0,
            ST: formData.noChildLabourersST || 0,
            OBC: formData.noChildLabourersOBC || 0,
            Others: formData.noChildLabourersOthers || 0,
            Total: formData.noChildLabourersTotal || 0,
            Minorities: formData.noChildLabourersMinorities || 0
          },
          physicallyChallengedPersons: {
            SC: formData.noPhysicallyChallengedSC || 0,
            ST: formData.noPhysicallyChallengedST || 0,
            OBC: formData.noPhysicallyChallengedOBC || 0,
            Others: formData.noPhysicallyChallengedOthers || 0,
            Total: formData.noPhysicallyChallengedTotal || 0,
            Minorities: formData.noPhysicallyChallengedMinorities || 0
          },
          mentallyChallengedPersons: {
            SC: formData.noMentallyChallengedSC || 0,
            ST: formData.noMentallyChallengedST || 0,
            OBC: formData.noMentallyChallengedOBC || 0,
            Others: formData.noMentallyChallengedOthers || 0,
            Total: formData.noMentallyChallengedTotal || 0,
            Minorities: formData.noMentallyChallengedMinorities || 0
          },
          personsWithHivAids: {
            SC: formData.noPersonsHivaidsSC || 0,
            ST: formData.noPersonsHivaidsST || 0,
            OBC: formData.noPersonsHivaidsOBC || 0,
            Others: formData.noPersonsHivaidsOthers || 0,
            Total: formData.noPersonsHivaidsTotal || 0,
            Minorities: formData.noPersonsHivaidsMinorities || 0
          },
          personsWithTuberculosis: {
            SC: formData.noPersonsTuberculosisSC || 0,
            ST: formData.noPersonsTuberculosisST || 0,
            OBC: formData.noPersonsTuberculosisOBC || 0,
            Others: formData.noPersonsTuberculosisOthers || 0,
            Total: formData.noPersonsTuberculosisTotal || 0,
            Minorities: formData.noPersonsTuberculosisMinorities || 0
          },
          personsWithRespiratoryDiseases: {
            SC: formData.noPersonsRespiratorySC || 0,
            ST: formData.noPersonsRespiratoryST || 0,
            OBC: formData.noPersonsRespiratoryOBC || 0,
            Others: formData.noPersonsRespiratoryOthers || 0,
            Total: formData.noPersonsRespiratoryTotal || 0,
            Minorities: formData.noPersonsRespiratoryMinorities || 0
          },
          personsWithOtherChronicDiseases: {
            SC: formData.noPersonsOtherChronicSC || 0,
            ST: formData.noPersonsOtherChronicST || 0,
            OBC: formData.noPersonsOtherChronicOBC || 0,
            Others: formData.noPersonsOtherChronicOthers || 0,
            Total: formData.noPersonsOtherChronicTotal || 0,
            Minorities: formData.noPersonsOtherChronicMinorities || 0
          }
        },
        literacyAndEducation: {
          totalIlliteratePerson: {
            SC: formData.totalIlliteratePersonsSC || 0,
            ST: formData.totalIlliteratePersonsST || 0,
            OBC: formData.totalIlliteratePersonsOBC || 0,
            Others: formData.totalIlliteratePersonsOthers || 0,
            Total: formData.totalIlliteratePersonsTotal || 0,
            Minorities: formData.totalIlliteratePersonsMinorities || 0
          },
          maleIlliterate: {
            SC: formData.noMaleIlliterateSC || 0,
            ST: formData.noMaleIlliterateST || 0,
            OBC: formData.noMaleIlliterateOBC || 0,
            Others: formData.noMaleIlliterateOthers || 0,
            Total: formData.noMaleIlliterateTotal || 0,
            Minorities: formData.noMaleIlliterateMinorities || 0
          },
          femaleIlliterate: {
            SC: formData.noFemaleIlliterateSC || 0,
            ST: formData.noFemaleIlliterateST || 0,
            OBC: formData.noFemaleIlliterateOBC || 0,
            Others: formData.noFemaleIlliterateOthers || 0,
            Total: formData.noFemaleIlliterateTotal || 0,
            Minorities: formData.noFemaleIlliterateMinorities || 0
          },
          bplIlliteratePerson: {
            SC: formData.noBplIlliteratePersonsSC || 0,
            ST: formData.noBplIlliteratePersonsST || 0,
            OBC: formData.noBplIlliteratePersonsOBC || 0,
            Others: formData.noBplIlliteratePersonsOthers || 0,
            Total: formData.noBplIlliteratePersonsTotal || 0,
            Minorities: formData.noBplIlliteratePersonsMinorities || 0
          },
          maleBplIlliterate: {
            SC: formData.noMaleBplIlliterateSC || 0,
            ST: formData.noMaleBplIlliterateST || 0,
            OBC: formData.noMaleBplIlliterateOBC || 0,
            Others: formData.noMaleBplIlliterateOthers || 0,
            Total: formData.noMaleBplIlliterateTotal || 0,
            Minorities: formData.noMaleBplIlliterateMinorities || 0
          },
          femaleBplIlliterate: {
            SC: formData.noFemaleBplIlliterateSC || 0,
            ST: formData.noFemaleBplIlliterateST || 0,
            OBC: formData.noFemaleBplIlliterateOBC || 0,
            Others: formData.noFemaleBplIlliterateOthers || 0,
            Total: formData.noFemaleBplIlliterateTotal || 0,
            Minorities: formData.noFemaleBplIlliterateMinorities || 0
          },
          schoolDropoutsMale: {
            SC: formData.schoolDropoutsMaleSC || 0,
            ST: formData.schoolDropoutsMaleST || 0,
            OBC: formData.schoolDropoutsMaleOBC || 0,
            Others: formData.schoolDropoutsMaleOthers || 0,
            Total: formData.schoolDropoutsMaleTotal || 0,
            Minorities: formData.schoolDropoutsMaleMinorities || 0
          },
          schoolDropoutsFemale: {
            SC: formData.schoolDropoutsFemaleSC || 0,
            ST: formData.schoolDropoutsFemaleST || 0,
            OBC: formData.schoolDropoutsFemaleOBC || 0,
            Others: formData.schoolDropoutsFemaleOthers || 0,
            Total: formData.schoolDropoutsFemaleTotal || 0,
            Minorities: formData.schoolDropoutsFemaleMinorities || 0
          }
        },
        // PART-I: V. ECONOMIC STATUS OF HOUSEHOLDS
        economicStatus: {
          economicStatusData: {
            lessThan500: formData.economicStatus?.lessThan500 || 0,
            rs500to1000: formData.economicStatus?.rs500to1000 || 0,
            rs1000to1500: formData.economicStatus?.rs1000to1500 || 0,
            rs1500to2000: formData.economicStatus?.rs1500to2000 || 0,
            rs2000to3000: formData.economicStatus?.rs2000to3000 || 0,
            moreThan3000: formData.economicStatus?.moreThan3000 || 0
          }
        },
        
        // PART-J: VI. OCCUPATION STATUS OF HOUSEHOLDS
        occupationStatus: {
          occupationalStatusData: {
            selfEmployed: formData.occupationalStatus?.selfEmployed || 0,
            salaried: formData.occupationalStatus?.salaried || 0,
            regularWage: formData.occupationalStatus?.regularWage || 0,
            casualLabour: formData.occupationalStatus?.casualLabour || 0,
            others: formData.occupationalStatus?.others || 0
          }
        },
        
        // PART-K: VII. ACCESS TO PHYSICAL INFRASTRUCTURE
        physicalInfrastructure: {
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
        },
        
        // PART-H: IV. HOUSING STATUS
        housingStatus: {
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
        },
        
        // PART-L: VIII. Education Facilities
        educationFacilities: {
          anganwadiUnderIcds: formData.anganwadiUnderIcds || 0,
          municipalPreschool: formData.municipalPreschool || 0,
          privatePreschool: formData.privatePreschool || 0,
          municipalPrimarySchool: formData.municipalPrimarySchool || 0,
          stateGovtPrimarySchool: formData.stateGovtPrimarySchool || 0,
          privatePrimarySchool: formData.privatePrimarySchool || 0,
          municipalHighSchool: formData.municipalHighSchool || 0,
          stateGovtHighSchool: formData.stateGovtHighSchool || 0,
          privateHighSchool: formData.privateHighSchool || 0,
          adultEducationCentre: formData.adultEducationCentre || 0,
          nonFormalEducationCentre: formData.nonFormalEducationCentre || 0
        },
        
        // PART-M: IX. Health Facilities
        healthFacilities: {
          urbanHealthPost: formData.urbanHealthPost || "",
          primaryHealthCentre: formData.primaryHealthCentre || "",
          governmentHospital: formData.governmentHospital || "",
          maternityCentre: formData.maternityCentre || "",
          privateClinic: formData.privateClinic || "",
          rmp: formData.rmp || "",
          ayurvedicDoctor: formData.ayurvedicDoctor || ""
        },
        
        // PART-XII: XI. ADDITIONAL INFRASTRUCTURE REQUIREMENTS
        additionalInfrastructure: {
          // Water Supply
          waterSupply: {
            pipelines: {
              existing: formData.waterSupplyPipelinesExisting || "",
              additionalRequirement: formData.waterSupplyPipelinesAdditional || "",
              estimatedCost: formData.waterSupplyPipelinesCost || 0
            },
            individualTaps: {
              existing: formData.waterSupplyIndividualTapsExisting || "",
              additionalRequirement: formData.waterSupplyIndividualTapsAdditional || "",
              estimatedCost: formData.waterSupplyIndividualTapsCost || 0
            },
            borewells: {
              existing: formData.waterSupplyBorewellsExisting || "",
              additionalRequirement: formData.waterSupplyBorewellsAdditional || "",
              estimatedCost: formData.waterSupplyBorewellsCost || 0
            },
            connectivityToTrunkLines: {
              existing: formData.waterSupplyConnectivityTrunkLinesExisting || "",
              additionalRequirement: formData.waterSupplyConnectivityTrunkLinesAdditional || "",
              estimatedCost: formData.waterSupplyConnectivityTrunkLinesCost || 0
            }
          },
          // Drainage/Sewerage
          drainageSewerage: {
            stormwaterDrainage: {
              existing: formData.drainageStormwaterDrainageExisting || "",
              additionalRequirement: formData.drainageStormwaterDrainageAdditional || "",
              estimatedCost: formData.drainageStormwaterDrainageCost || 0
            },
            connectivityToMainDrains: {
              existing: formData.drainageConnectivityMainDrainsExisting || "",
              additionalRequirement: formData.drainageConnectivityMainDrainsAdditional || "",
              estimatedCost: formData.drainageConnectivityMainDrainsCost || 0
            },
            sewerLines: {
              existing: formData.drainageSewerLinesExisting || "",
              additionalRequirement: formData.drainageSewerLinesAdditional || "",
              estimatedCost: formData.drainageSewerLinesCost || 0
            },
            connectivityToTrunkSewers: {
              existing: formData.drainageConnectivityTrunkSewersExisting || "",
              additionalRequirement: formData.drainageConnectivityTrunkSewersAdditional || "",
              estimatedCost: formData.drainageConnectivityTrunkSewersCost || 0
            }
          },
          // Roads
          roads: {
            internalRoadsCC: {
              existing: formData.roadsInternalRoadsCCExisting || "",
              additionalRequirement: formData.roadsInternalRoadsCCAdditional || "",
              estimatedCost: formData.roadsInternalRoadsCCCost || 0
            },
            internalRoadsBT: {
              existing: formData.roadsInternalRoadsBTExisting || "",
              additionalRequirement: formData.roadsInternalRoadsBTAdditional || "",
              estimatedCost: formData.roadsInternalRoadsBTCost || 0
            },
            internalRoadsOthers: {
              existing: formData.roadsInternalRoadsOthersExisting || "",
              additionalRequirement: formData.roadsInternalRoadsOthersAdditional || "",
              estimatedCost: formData.roadsInternalRoadsOthersCost || 0
            },
            approachRoadsCC: {
              existing: formData.roadsApproachRoadsCCExisting || "",
              additionalRequirement: formData.roadsApproachRoadsCCAdditional || "",
              estimatedCost: formData.roadsApproachRoadsCCCost || 0
            },
            approachRoadsOthers: {
              existing: formData.roadsApproachRoadsOthersExisting || "",
              additionalRequirement: formData.roadsApproachRoadsOthersAdditional || "",
              estimatedCost: formData.roadsApproachRoadsOthersCost || 0
            }
          },
          // Street Lighting
          streetLighting: {
            poles: {
              existing: formData.streetLightingPolesExisting || "",
              additionalRequirement: formData.streetLightingPolesAdditional || "",
              estimatedCost: formData.streetLightingPolesCost || 0
            },
            lights: {
              existing: formData.streetLightingLightsExisting || "",
              additionalRequirement: formData.streetLightingLightsAdditional || "",
              estimatedCost: formData.streetLightingLightsCost || 0
            }
          },
          // Sanitation
          sanitation: {
            individualToilets: {
              existing: formData.sanitationIndividualToiletsExisting || "",
              additionalRequirement: formData.sanitationIndividualToiletsAdditional || "",
              estimatedCost: formData.sanitationIndividualToiletsCost || 0
            },
            communityToilets: {
              existing: formData.sanitationCommunityToiletsExisting || "",
              additionalRequirement: formData.sanitationCommunityToiletsAdditional || "",
              estimatedCost: formData.sanitationCommunityToiletsCost || 0
            },
            seatsInCommunityToilets: {
              existing: formData.sanitationSeatsCommunityToiletsExisting || "",
              additionalRequirement: formData.sanitationSeatsCommunityToiletsAdditional || "",
              estimatedCost: formData.sanitationSeatsCommunityToiletsCost || 0
            },
            dumperBins: {
              existing: formData.sanitationDumperBinsExisting || "",
              additionalRequirement: formData.sanitationDumperBinsAdditional || "",
              estimatedCost: formData.sanitationDumperBinsCost || 0
            }
          },
          // Community Facilities
          communityFacilities: {
            communityHalls: {
              existing: formData.communityHallsExisting || "",
              additionalRequirement: formData.communityHallsAdditional || "",
              estimatedCost: formData.communityHallsCost || 0
            },
            livelihoodCentres: {
              existing: formData.communityLivelihoodCentresExisting || "",
              additionalRequirement: formData.communityLivelihoodCentresAdditional || "",
              estimatedCost: formData.communityLivelihoodCentresCost || 0
            },
            anganwadis: {
              existing: formData.communityAnganwadisExisting || "",
              additionalRequirement: formData.communityAnganwadisAdditional || "",
              estimatedCost: formData.communityAnganwadisCost || 0
            },
            primarySchools: {
              existing: formData.communityPrimarySchoolsExisting || "",
              additionalRequirement: formData.communityPrimarySchoolsAdditional || "",
              estimatedCost: formData.communityPrimarySchoolsCost || 0
            },
            healthCentres: {
              existing: formData.communityHealthCentresExisting || "",
              additionalRequirement: formData.communityHealthCentresAdditional || "",
              estimatedCost: formData.communityHealthCentresCost || 0
            },
            others: {
              existing: formData.communityOthersExisting || "",
              additionalRequirement: formData.communityOthersAdditional || "",
              estimatedCost: formData.communityOthersCost || 0
            }
          }
        },
        
        // PART-N: X. Social Development/Welfare
        socialDevelopment: {
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
        }
      };

      // First, save the current section to ensure completion percentage is accurate
      await saveSection();
      
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
      
      // Map current step to section name (15 sections total)
      const sectionMap: Record<number, string> = {
        0: 'generalInformation',
        1: 'cityTownSlumProfile',
        2: 'surveyOperation',
        3: 'basicInformation',
        4: 'landStatus',
        5: 'demographicProfile',
        6: 'housingStatus',
        7: 'economicStatus',
        8: 'occupationStatus',
        9: 'physicalInfrastructure',
        10: 'educationFacilities',
        11: 'healthFacilities',
        12: 'socialDevelopment',
        13: 'additionalInfrastructure',
        14: 'reviewAndSubmit'
      };
      
      // Extract data for current section
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
            data.noBplHouseholdsCityTown = formData.noBplHouseholdsCityTown;
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
            // Population & Health (Questions 12a-12m)
            data.totalPopulationSlumSC = formData.totalPopulationSlumSC;
            data.totalPopulationSlumST = formData.totalPopulationSlumST;
            data.totalPopulationSlumOBC = formData.totalPopulationSlumOBC;
            data.totalPopulationSlumOthers = formData.totalPopulationSlumOthers;
            data.totalPopulationSlum = formData.totalPopulationSlum;
            data.totalPopulationSlumMinorities = formData.totalPopulationSlumMinorities;
            data.bplPopulationSlumSC = formData.bplPopulationSlumSC;
            data.bplPopulationSlumST = formData.bplPopulationSlumST;
            data.bplPopulationSlumOBC = formData.bplPopulationSlumOBC;
            data.bplPopulationSlumOthers = formData.bplPopulationSlumOthers;
            data.bplPopulationSlum = formData.bplPopulationSlum;
            data.bplPopulationSlumMinorities = formData.bplPopulationSlumMinorities;
            data.noHouseholdsSlumSC = formData.noHouseholdsSlumSC;
            data.noHouseholdsSlumST = formData.noHouseholdsSlumST;
            data.noHouseholdsSlumOBC = formData.noHouseholdsSlumOBC;
            data.noHouseholdsSlumOthers = formData.noHouseholdsSlumOthers;
            data.noHouseholdsSlum = formData.noHouseholdsSlum;
            data.noHouseholdsSlumMinorities = formData.noHouseholdsSlumMinorities;
            data.noBplHouseholdsSC = formData.noBplHouseholdsSC;
            data.noBplHouseholdsST = formData.noBplHouseholdsST;
            data.noBplHouseholdsOBC = formData.noBplHouseholdsOBC;
            data.noBplHouseholdsOthers = formData.noBplHouseholdsOthers;
            data.noBplHouseholdsTotal = formData.noBplHouseholdsTotal;
            data.noBplHouseholdsMinorities = formData.noBplHouseholdsMinorities;
            data.noWomenHeadedHouseholdsSC = formData.noWomenHeadedHouseholdsSC;
            data.noWomenHeadedHouseholdsST = formData.noWomenHeadedHouseholdsST;
            data.noWomenHeadedHouseholdsOBC = formData.noWomenHeadedHouseholdsOBC;
            data.noWomenHeadedHouseholdsOthers = formData.noWomenHeadedHouseholdsOthers;
            data.noWomenHeadedHouseholdsTotal = formData.noWomenHeadedHouseholdsTotal;
            data.noWomenHeadedHouseholdsMinorities = formData.noWomenHeadedHouseholdsMinorities;
            data.noPersonsOlder65SC = formData.noPersonsOlder65SC;
            data.noPersonsOlder65ST = formData.noPersonsOlder65ST;
            data.noPersonsOlder65OBC = formData.noPersonsOlder65OBC;
            data.noPersonsOlder65Others = formData.noPersonsOlder65Others;
            data.noPersonsOlder65Total = formData.noPersonsOlder65Total;
            data.noPersonsOlder65Minorities = formData.noPersonsOlder65Minorities;
            data.noChildLabourersSC = formData.noChildLabourersSC;
            data.noChildLabourersST = formData.noChildLabourersST;
            data.noChildLabourersOBC = formData.noChildLabourersOBC;
            data.noChildLabourersOthers = formData.noChildLabourersOthers;
            data.noChildLabourersTotal = formData.noChildLabourersTotal;
            data.noChildLabourersMinorities = formData.noChildLabourersMinorities;
            data.noPhysicallyChallengedSC = formData.noPhysicallyChallengedSC;
            data.noPhysicallyChallengedST = formData.noPhysicallyChallengedST;
            data.noPhysicallyChallengedOBC = formData.noPhysicallyChallengedOBC;
            data.noPhysicallyChallengedOthers = formData.noPhysicallyChallengedOthers;
            data.noPhysicallyChallengedTotal = formData.noPhysicallyChallengedTotal;
            data.noPhysicallyChallengedMinorities = formData.noPhysicallyChallengedMinorities;
            data.noMentallyChallengedSC = formData.noMentallyChallengedSC;
            data.noMentallyChallengedST = formData.noMentallyChallengedST;
            data.noMentallyChallengedOBC = formData.noMentallyChallengedOBC;
            data.noMentallyChallengedOthers = formData.noMentallyChallengedOthers;
            data.noMentallyChallengedTotal = formData.noMentallyChallengedTotal;
            data.noMentallyChallengedMinorities = formData.noMentallyChallengedMinorities;
            data.noPersonsHivaidsSC = formData.noPersonsHivaidsSC;
            data.noPersonsHivaidsST = formData.noPersonsHivaidsST;
            data.noPersonsHivaidsOBC = formData.noPersonsHivaidsOBC;
            data.noPersonsHivaidsOthers = formData.noPersonsHivaidsOthers;
            data.noPersonsHivaidsTotal = formData.noPersonsHivaidsTotal;
            data.noPersonsHivaidsMinorities = formData.noPersonsHivaidsMinorities;
            data.noPersonsTuberculosisSC = formData.noPersonsTuberculosisSC;
            data.noPersonsTuberculosisST = formData.noPersonsTuberculosisST;
            data.noPersonsTuberculosisOBC = formData.noPersonsTuberculosisOBC;
            data.noPersonsTuberculosisOthers = formData.noPersonsTuberculosisOthers;
            data.noPersonsTuberculosisTotal = formData.noPersonsTuberculosisTotal;
            data.noPersonsTuberculosisMinorities = formData.noPersonsTuberculosisMinorities;
            data.noPersonsRespiratorySC = formData.noPersonsRespiratorySC;
            data.noPersonsRespiratoryST = formData.noPersonsRespiratoryST;
            data.noPersonsRespiratoryOBC = formData.noPersonsRespiratoryOBC;
            data.noPersonsRespiratoryOthers = formData.noPersonsRespiratoryOthers;
            data.noPersonsRespiratoryTotal = formData.noPersonsRespiratoryTotal;
            data.noPersonsRespiratoryMinorities = formData.noPersonsRespiratoryMinorities;
            data.noPersonsOtherChronicSC = formData.noPersonsOtherChronicSC;
            data.noPersonsOtherChronicST = formData.noPersonsOtherChronicST;
            data.noPersonsOtherChronicOBC = formData.noPersonsOtherChronicOBC;
            data.noPersonsOtherChronicOthers = formData.noPersonsOtherChronicOthers;
            data.noPersonsOtherChronicTotal = formData.noPersonsOtherChronicTotal;
            data.noPersonsOtherChronicMinorities = formData.noPersonsOtherChronicMinorities;
            
            // Literacy & Education (Questions 13a-13h)
            data.totalIlliteratePersonsSC = formData.totalIlliteratePersonsSC;
            data.totalIlliteratePersonsST = formData.totalIlliteratePersonsST;
            data.totalIlliteratePersonsOBC = formData.totalIlliteratePersonsOBC;
            data.totalIlliteratePersonsOthers = formData.totalIlliteratePersonsOthers;
            data.totalIlliteratePersonsTotal = formData.totalIlliteratePersonsTotal;
            data.totalIlliteratePersonsMinorities = formData.totalIlliteratePersonsMinorities;
            data.noMaleIlliterateSC = formData.noMaleIlliterateSC;
            data.noMaleIlliterateST = formData.noMaleIlliterateST;
            data.noMaleIlliterateOBC = formData.noMaleIlliterateOBC;
            data.noMaleIlliterateOthers = formData.noMaleIlliterateOthers;
            data.noMaleIlliterateTotal = formData.noMaleIlliterateTotal;
            data.noMaleIlliterateMinorities = formData.noMaleIlliterateMinorities;
            data.noFemaleIlliterateSC = formData.noFemaleIlliterateSC;
            data.noFemaleIlliterateST = formData.noFemaleIlliterateST;
            data.noFemaleIlliterateOBC = formData.noFemaleIlliterateOBC;
            data.noFemaleIlliterateOthers = formData.noFemaleIlliterateOthers;
            data.noFemaleIlliterateTotal = formData.noFemaleIlliterateTotal;
            data.noFemaleIlliterateMinorities = formData.noFemaleIlliterateMinorities;
            data.noBplIlliteratePersonsSC = formData.noBplIlliteratePersonsSC;
            data.noBplIlliteratePersonsST = formData.noBplIlliteratePersonsST;
            data.noBplIlliteratePersonsOBC = formData.noBplIlliteratePersonsOBC;
            data.noBplIlliteratePersonsOthers = formData.noBplIlliteratePersonsOthers;
            data.noBplIlliteratePersonsTotal = formData.noBplIlliteratePersonsTotal;
            data.noBplIlliteratePersonsMinorities = formData.noBplIlliteratePersonsMinorities;
            data.noMaleBplIlliterateSC = formData.noMaleBplIlliterateSC;
            data.noMaleBplIlliterateST = formData.noMaleBplIlliterateST;
            data.noMaleBplIlliterateOBC = formData.noMaleBplIlliterateOBC;
            data.noMaleBplIlliterateOthers = formData.noMaleBplIlliterateOthers;
            data.noMaleBplIlliterateTotal = formData.noMaleBplIlliterateTotal;
            data.noMaleBplIlliterateMinorities = formData.noMaleBplIlliterateMinorities;
            data.noFemaleBplIlliterateSC = formData.noFemaleBplIlliterateSC;
            data.noFemaleBplIlliterateST = formData.noFemaleBplIlliterateST;
            data.noFemaleBplIlliterateOBC = formData.noFemaleBplIlliterateOBC;
            data.noFemaleBplIlliterateOthers = formData.noFemaleBplIlliterateOthers;
            data.noFemaleBplIlliterateTotal = formData.noFemaleBplIlliterateTotal;
            data.noFemaleBplIlliterateMinorities = formData.noFemaleBplIlliterateMinorities;
            data.schoolDropoutsMaleSC = formData.schoolDropoutsMaleSC;
            data.schoolDropoutsMaleST = formData.schoolDropoutsMaleST;
            data.schoolDropoutsMaleOBC = formData.schoolDropoutsMaleOBC;
            data.schoolDropoutsMaleOthers = formData.schoolDropoutsMaleOthers;
            data.schoolDropoutsMaleTotal = formData.schoolDropoutsMaleTotal;
            data.schoolDropoutsMaleMinorities = formData.schoolDropoutsMaleMinorities;
            data.schoolDropoutsFemaleSC = formData.schoolDropoutsFemaleSC;
            data.schoolDropoutsFemaleST = formData.schoolDropoutsFemaleST;
            data.schoolDropoutsFemaleOBC = formData.schoolDropoutsFemaleOBC;
            data.schoolDropoutsFemaleOthers = formData.schoolDropoutsFemaleOthers;
            data.schoolDropoutsFemaleTotal = formData.schoolDropoutsFemaleTotal;
            data.schoolDropoutsFemaleMinorities = formData.schoolDropoutsFemaleMinorities;
            break;
          case 'housingStatus':
            data.dwellingUnitsPucca = formData.dwellingUnitsPucca;
            data.dwellingUnitsSemiPucca = formData.dwellingUnitsSemiPucca;
            data.dwellingUnitsKatcha = formData.dwellingUnitsKatcha;
            data.dwellingUnitsTotal = formData.dwellingUnitsTotal;
            data.dwellingUnitsWithElectricityPucca = formData.dwellingUnitsWithElectricityPucca;
            data.dwellingUnitsWithElectricitySemiPucca = formData.dwellingUnitsWithElectricitySemiPucca;
            data.dwellingUnitsWithElectricityKatcha = formData.dwellingUnitsWithElectricityKatcha;
            data.dwellingUnitsWithElectricityTotal = formData.dwellingUnitsWithElectricityTotal;
            data.landTenureWithPatta = formData.landTenureWithPatta;
            data.landTenurePossessionCertificate = formData.landTenurePossessionCertificate;
            data.landTenureEncroachedPrivate = formData.landTenureEncroachedPrivate;
            data.landTenureEncroachedPublic = formData.landTenureEncroachedPublic;
            data.landTenureOnRent = formData.landTenureOnRent;
            data.landTenureOther = formData.landTenureOther;
            data.landTenureTotal = formData.landTenureTotal;
            break;
          case 'economicStatus':
            data.lessThan500 = formData.economicStatus?.lessThan500;
            data.rs500to1000 = formData.economicStatus?.rs500to1000;
            data.rs1000to1500 = formData.economicStatus?.rs1000to1500;
            data.rs1500to2000 = formData.economicStatus?.rs1500to2000;
            data.rs2000to3000 = formData.economicStatus?.rs2000to3000;
            data.moreThan3000 = formData.economicStatus?.moreThan3000;
            break;
          case 'occupationStatus':
            data.selfEmployed = formData.occupationalStatus?.selfEmployed;
            data.salaried = formData.occupationalStatus?.salaried;
            data.regularWage = formData.occupationalStatus?.regularWage;
            data.casualLabour = formData.occupationalStatus?.casualLabour;
            data.others = formData.occupationalStatus?.others;
            break;
          case 'physicalInfrastructure':
            data.sourceDrinkingWater = formData.sourceDrinkingWater;
            data.connectivityCityWaterSupply = formData.connectivityCityWaterSupply;
            data.drainageSewerageFacility = formData.drainageSewerageFacility;
            data.connectivityStormWaterDrainage = formData.connectivityStormWaterDrainage;
            data.connectivitySewerageSystem = formData.connectivitySewerageSystem;
            data.proneToFlooding = formData.proneToFlooding;
            data.latrineFacility = formData.latrineFacility;
            data.frequencyOfGarbageDisposal = formData.frequencyOfGarbageDisposal;
            data.arrangementForGarbageDisposal = formData.arrangementForGarbageDisposal;
            data.frequencyOfClearanceOfOpenDrains = formData.frequencyOfClearanceOfOpenDrains;
            data.approachRoadType = formData.approachRoadType;
            data.distanceToNearestMotorableRoad = formData.distanceToNearestMotorableRoad;
            data.internalRoadType = formData.internalRoadType;
            data.streetLightAvailable = formData.streetLightAvailable;
            break;
          case 'educationFacilities':
            data.anganwadiUnderIcds = formData.anganwadiUnderIcds;
            data.municipalPreschool = formData.municipalPreschool;
            data.privatePreschool = formData.privatePreschool;
            data.municipalPrimarySchool = formData.municipalPrimarySchool;
            data.stateGovtPrimarySchool = formData.stateGovtPrimarySchool;
            data.privatePrimarySchool = formData.privatePrimarySchool;
            data.municipalHighSchool = formData.municipalHighSchool;
            data.stateGovtHighSchool = formData.stateGovtHighSchool;
            data.privateHighSchool = formData.privateHighSchool;
            data.adultEducationCentre = formData.adultEducationCentre;
            data.nonFormalEducationCentre = formData.nonFormalEducationCentre;
            break;
          case 'healthFacilities':
            data.urbanHealthPost = formData.urbanHealthPost;
            data.primaryHealthCentre = formData.primaryHealthCentre;
            data.governmentHospital = formData.governmentHospital;
            data.maternityCentre = formData.maternityCentre;
            data.privateClinic = formData.privateClinic;
            data.rmp = formData.rmp;
            data.ayurvedicDoctor = formData.ayurvedicDoctor;
            break;
          case 'socialDevelopment':
            data.communityHall = formData.communityHall;
            data.livelihoodProductionCentre = formData.livelihoodProductionCentre;
            data.vocationalTrainingCentre = formData.vocationalTrainingCentre;
            data.streetChildrenRehabilitationCentre = formData.streetChildrenRehabilitationCentre;
            data.nightShelter = formData.nightShelter;
            data.oldAgeHome = formData.oldAgeHome;
            data.oldAgePensionsHolders = formData.oldAgePensionsHolders;
            data.widowPensionsHolders = formData.widowPensionsHolders;
            data.disabledPensionsHolders = formData.disabledPensionsHolders;
            data.generalInsuranceCovered = formData.generalInsuranceCovered;
            data.healthInsuranceCovered = formData.healthInsuranceCovered;
            data.selfHelpGroups = formData.selfHelpGroups;
            data.thriftCreditSocieties = formData.thriftCreditSocieties;
            data.slumDwellersAssociation = formData.slumDwellersAssociation;
            data.youthAssociations = formData.youthAssociations;
            data.womensAssociations = formData.womensAssociations;
            break;
          case 'additionalInfrastructure':
            // Water Supply
            data.waterSupplyPipelinesExisting = formData.waterSupplyPipelinesExisting;
            data.waterSupplyPipelinesAdditional = formData.waterSupplyPipelinesAdditional;
            data.waterSupplyPipelinesCost = formData.waterSupplyPipelinesCost;
            data.waterSupplyIndividualTapsExisting = formData.waterSupplyIndividualTapsExisting;
            data.waterSupplyIndividualTapsAdditional = formData.waterSupplyIndividualTapsAdditional;
            data.waterSupplyIndividualTapsCost = formData.waterSupplyIndividualTapsCost;
            data.waterSupplyBorewellsExisting = formData.waterSupplyBorewellsExisting;
            data.waterSupplyBorewellsAdditional = formData.waterSupplyBorewellsAdditional;
            data.waterSupplyBorewellsCost = formData.waterSupplyBorewellsCost;
            data.waterSupplyConnectivityTrunkLinesExisting = formData.waterSupplyConnectivityTrunkLinesExisting;
            data.waterSupplyConnectivityTrunkLinesAdditional = formData.waterSupplyConnectivityTrunkLinesAdditional;
            data.waterSupplyConnectivityTrunkLinesCost = formData.waterSupplyConnectivityTrunkLinesCost;
            // Drainage/Sewerage
            data.drainageStormwaterDrainageExisting = formData.drainageStormwaterDrainageExisting;
            data.drainageStormwaterDrainageAdditional = formData.drainageStormwaterDrainageAdditional;
            data.drainageStormwaterDrainageCost = formData.drainageStormwaterDrainageCost;
            data.drainageConnectivityMainDrainsExisting = formData.drainageConnectivityMainDrainsExisting;
            data.drainageConnectivityMainDrainsAdditional = formData.drainageConnectivityMainDrainsAdditional;
            data.drainageConnectivityMainDrainsCost = formData.drainageConnectivityMainDrainsCost;
            data.drainageSewerLinesExisting = formData.drainageSewerLinesExisting;
            data.drainageSewerLinesAdditional = formData.drainageSewerLinesAdditional;
            data.drainageSewerLinesCost = formData.drainageSewerLinesCost;
            data.drainageConnectivityTrunkSewersExisting = formData.drainageConnectivityTrunkSewersExisting;
            data.drainageConnectivityTrunkSewersAdditional = formData.drainageConnectivityTrunkSewersAdditional;
            data.drainageConnectivityTrunkSewersCost = formData.drainageConnectivityTrunkSewersCost;
            // Roads
            data.roadsInternalRoadsCCExisting = formData.roadsInternalRoadsCCExisting;
            data.roadsInternalRoadsCCAdditional = formData.roadsInternalRoadsCCAdditional;
            data.roadsInternalRoadsCCCost = formData.roadsInternalRoadsCCCost;
            data.roadsInternalRoadsBTExisting = formData.roadsInternalRoadsBTExisting;
            data.roadsInternalRoadsBTAdditional = formData.roadsInternalRoadsBTAdditional;
            data.roadsInternalRoadsBTCost = formData.roadsInternalRoadsBTCost;
            data.roadsInternalRoadsOthersExisting = formData.roadsInternalRoadsOthersExisting;
            data.roadsInternalRoadsOthersAdditional = formData.roadsInternalRoadsOthersAdditional;
            data.roadsInternalRoadsOthersCost = formData.roadsInternalRoadsOthersCost;
            data.roadsApproachRoadsCCExisting = formData.roadsApproachRoadsCCExisting;
            data.roadsApproachRoadsCCAdditional = formData.roadsApproachRoadsCCAdditional;
            data.roadsApproachRoadsCCCost = formData.roadsApproachRoadsCCCost;
            data.roadsApproachRoadsOthersExisting = formData.roadsApproachRoadsOthersExisting;
            data.roadsApproachRoadsOthersAdditional = formData.roadsApproachRoadsOthersAdditional;
            data.roadsApproachRoadsOthersCost = formData.roadsApproachRoadsOthersCost;
            // Street Lighting
            data.streetLightingPolesExisting = formData.streetLightingPolesExisting;
            data.streetLightingPolesAdditional = formData.streetLightingPolesAdditional;
            data.streetLightingPolesCost = formData.streetLightingPolesCost;
            data.streetLightingLightsExisting = formData.streetLightingLightsExisting;
            data.streetLightingLightsAdditional = formData.streetLightingLightsAdditional;
            data.streetLightingLightsCost = formData.streetLightingLightsCost;
            // Sanitation
            data.sanitationIndividualToiletsExisting = formData.sanitationIndividualToiletsExisting;
            data.sanitationIndividualToiletsAdditional = formData.sanitationIndividualToiletsAdditional;
            data.sanitationIndividualToiletsCost = formData.sanitationIndividualToiletsCost;
            data.sanitationCommunityToiletsExisting = formData.sanitationCommunityToiletsExisting;
            data.sanitationCommunityToiletsAdditional = formData.sanitationCommunityToiletsAdditional;
            data.sanitationCommunityToiletsCost = formData.sanitationCommunityToiletsCost;
            data.sanitationSeatsCommunityToiletsExisting = formData.sanitationSeatsCommunityToiletsExisting;
            data.sanitationSeatsCommunityToiletsAdditional = formData.sanitationSeatsCommunityToiletsAdditional;
            data.sanitationSeatsCommunityToiletsCost = formData.sanitationSeatsCommunityToiletsCost;
            data.sanitationDumperBinsExisting = formData.sanitationDumperBinsExisting;
            data.sanitationDumperBinsAdditional = formData.sanitationDumperBinsAdditional;
            data.sanitationDumperBinsCost = formData.sanitationDumperBinsCost;
            // Community Facilities
            data.communityHallsExisting = formData.communityHallsExisting;
            data.communityHallsAdditional = formData.communityHallsAdditional;
            data.communityHallsCost = formData.communityHallsCost;
            data.communityLivelihoodCentresExisting = formData.communityLivelihoodCentresExisting;
            data.communityLivelihoodCentresAdditional = formData.communityLivelihoodCentresAdditional;
            data.communityLivelihoodCentresCost = formData.communityLivelihoodCentresCost;
            data.communityAnganwadisExisting = formData.communityAnganwadisExisting;
            data.communityAnganwadisAdditional = formData.communityAnganwadisAdditional;
            data.communityAnganwadisCost = formData.communityAnganwadisCost;
            data.communityPrimarySchoolsExisting = formData.communityPrimarySchoolsExisting;
            data.communityPrimarySchoolsAdditional = formData.communityPrimarySchoolsAdditional;
            data.communityPrimarySchoolsCost = formData.communityPrimarySchoolsCost;
            data.communityHealthCentresExisting = formData.communityHealthCentresExisting;
            data.communityHealthCentresAdditional = formData.communityHealthCentresAdditional;
            data.communityHealthCentresCost = formData.communityHealthCentresCost;
            data.communityOthersExisting = formData.communityOthersExisting;
            data.communityOthersAdditional = formData.communityOthersAdditional;
            data.communityOthersCost = formData.communityOthersCost;
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
            // Fallback to send all form data
            Object.keys(formData).forEach(key => {
              if (formData[key as keyof SlumSurveyForm] !== undefined && 
                  formData[key as keyof SlumSurveyForm] !== null && 
                  formData[key as keyof SlumSurveyForm] !== '') {
                data[key] = formData[key as keyof SlumSurveyForm];
              }
            });
            break;
        }
        return data;
      };
      
      const sectionData = extractSectionData();
      
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
              

              <h1 className="text-3xl font-bold text-white tracking-tight">Slum Survey</h1>
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
                        required
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
                            required
                            name="totalPopulationSlumSC"
                            error={getFieldError('totalPopulationSlumSC')}
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.totalPopulationSlumST || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.totalPopulationSlumOBC || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.totalPopulationSlumOthers || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.totalPopulationSlumMinorities || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.totalPopulationSlum || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlum", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.bplPopulationSlumST || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.bplPopulationSlumOBC || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.bplPopulationSlumOthers || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.bplPopulationSlumMinorities || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.bplPopulationSlum || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlum", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noHouseholdsSlumST || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noHouseholdsSlumOBC || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noHouseholdsSlumOthers || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noHouseholdsSlumMinorities || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noHouseholdsSlum || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlum", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noBplHouseholdsST || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noBplHouseholdsOBC || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noBplHouseholdsOthers || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noBplHouseholdsMinorities || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noBplHouseholdsTotal || ""}
                            onChange={(e) => handleInputChange("noBplHouseholdsTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsST || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsOBC || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsOthers || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsMinorities || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noWomenHeadedHouseholdsTotal || ""}
                            onChange={(e) => handleInputChange("noWomenHeadedHouseholdsTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsOlder65ST || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65ST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsOlder65OBC || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65OBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsOlder65Others || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65Others", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsOlder65Minorities || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65Minorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsOlder65Total || ""}
                            onChange={(e) => handleInputChange("noPersonsOlder65Total", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noChildLabourersST || ""}
                            onChange={(e) => handleInputChange("noChildLabourersST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noChildLabourersOBC || ""}
                            onChange={(e) => handleInputChange("noChildLabourersOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noChildLabourersOthers || ""}
                            onChange={(e) => handleInputChange("noChildLabourersOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noChildLabourersMinorities || ""}
                            onChange={(e) => handleInputChange("noChildLabourersMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noChildLabourersTotal || ""}
                            onChange={(e) => handleInputChange("noChildLabourersTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPhysicallyChallengedST || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPhysicallyChallengedOBC || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPhysicallyChallengedOthers || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPhysicallyChallengedMinorities || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPhysicallyChallengedTotal || ""}
                            onChange={(e) => handleInputChange("noPhysicallyChallengedTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noMentallyChallengedST || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noMentallyChallengedOBC || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noMentallyChallengedOthers || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noMentallyChallengedMinorities || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noMentallyChallengedTotal || ""}
                            onChange={(e) => handleInputChange("noMentallyChallengedTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsHivaidsST || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsHivaidsOBC || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsHivaidsOthers || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsHivaidsMinorities || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsHivaidsTotal || ""}
                            onChange={(e) => handleInputChange("noPersonsHivaidsTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsTuberculosisST || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsTuberculosisOBC || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsTuberculosisOthers || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsTuberculosisMinorities || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsTuberculosisTotal || ""}
                            onChange={(e) => handleInputChange("noPersonsTuberculosisTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsRespiratoryST || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsRespiratoryOBC || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsRespiratoryOthers || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsRespiratoryMinorities || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsRespiratoryTotal || ""}
                            onChange={(e) => handleInputChange("noPersonsRespiratoryTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noPersonsOtherChronicST || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noPersonsOtherChronicOBC || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noPersonsOtherChronicOthers || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noPersonsOtherChronicMinorities || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noPersonsOtherChronicTotal || ""}
                            onChange={(e) => handleInputChange("noPersonsOtherChronicTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.totalIlliteratePersonsST || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.totalIlliteratePersonsOBC || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.totalIlliteratePersonsOthers || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.totalIlliteratePersonsMinorities || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.totalIlliteratePersonsTotal || ""}
                            onChange={(e) => handleInputChange("totalIlliteratePersonsTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noMaleIlliterateST || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noMaleIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noMaleIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noMaleIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noMaleIlliterateTotal || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noFemaleIlliterateST || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noFemaleIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noFemaleIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noFemaleIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noFemaleIlliterateTotal || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noBplIlliteratePersonsST || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noBplIlliteratePersonsOBC || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noBplIlliteratePersonsOthers || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noBplIlliteratePersonsMinorities || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noBplIlliteratePersonsTotal || ""}
                            onChange={(e) => handleInputChange("noBplIlliteratePersonsTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noMaleBplIlliterateST || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noMaleBplIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noMaleBplIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noMaleBplIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noMaleBplIlliterateTotal || ""}
                            onChange={(e) => handleInputChange("noMaleBplIlliterateTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.noFemaleBplIlliterateST || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.noFemaleBplIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.noFemaleBplIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.noFemaleBplIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.noFemaleBplIlliterateTotal || ""}
                            onChange={(e) => handleInputChange("noFemaleBplIlliterateTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.schoolDropoutsMaleST || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.schoolDropoutsMaleOBC || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.schoolDropoutsMaleOthers || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.schoolDropoutsMaleMinorities || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.schoolDropoutsMaleTotal || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsMaleTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="ST"
                            type="number"
                            value={formData.schoolDropoutsFemaleST || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC"
                            type="number"
                            value={formData.schoolDropoutsFemaleOBC || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.schoolDropoutsFemaleOthers || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities"
                            type="number"
                            value={formData.schoolDropoutsFemaleMinorities || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.schoolDropoutsFemaleTotal || ""}
                            onChange={(e) => handleInputChange("schoolDropoutsFemaleTotal", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="Encroached Private"
                            type="number"
                            value={formData.landTenureEncroachedPrivate || ""}
                            onChange={(e) => handleInputChange("landTenureEncroachedPrivate", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Encroached Public"
                            type="number"
                            value={formData.landTenureEncroachedPublic || ""}
                            onChange={(e) => handleInputChange("landTenureEncroachedPublic", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="On Rent"
                            type="number"
                            value={formData.landTenureOnRent || ""}
                            onChange={(e) => handleInputChange("landTenureOnRent", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Other"
                            type="number"
                            value={formData.landTenureOther || ""}
                            onChange={(e) => handleInputChange("landTenureOther", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.landTenureTotal || ""}
                            onChange={(e) => handleInputChange("landTenureTotal", parseInt(e.target.value) || 0)}
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
                    />
                    <Input
                    label="₹500 to ₹1000"
                    type="number"
                    value={formData.economicStatus?.rs500to1000 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "rs500to1000", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="₹1000 to ₹1500"
                    type="number"
                    value={formData.economicStatus?.rs1000to1500 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "rs1000to1500", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="₹1500 to ₹2000"
                    type="number"
                    value={formData.economicStatus?.rs1500to2000 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "rs1500to2000", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="₹2000 to ₹3000"
                    type="number"
                    value={formData.economicStatus?.rs2000to3000 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "rs2000to3000", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="More than ₹3000"
                    type="number"
                    value={formData.economicStatus?.moreThan3000 || ""}
                    onChange={(e) => handleNestedInputChange("economicStatus", "moreThan3000", parseInt(e.target.value) || 0)}
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
                    />
                    <Input
                    label="Salaried"
                    type="number"
                    value={formData.occupationalStatus?.salaried || ""}
                    onChange={(e) => handleNestedInputChange("occupationalStatus", "salaried", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Regular Wage"
                    type="number"
                    value={formData.occupationalStatus?.regularWage || ""}
                    onChange={(e) => handleNestedInputChange("occupationalStatus", "regularWage", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Casual Labour"
                    type="number"
                    value={formData.occupationalStatus?.casualLabour || ""}
                    onChange={(e) => handleNestedInputChange("occupationalStatus", "casualLabour", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Others"
                    type="number"
                    value={formData.occupationalStatus?.others || ""}
                    onChange={(e) => handleNestedInputChange("occupationalStatus", "others", parseInt(e.target.value) || 0)}
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
                            />
                            <Input
                            label="Tube-well/Borewell/Handpump"
                            type="number"
                            value={formData.sourceDrinkingWater?.tubewellBorewellHandpump || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "tubewellBorewellHandpump", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Public Tap"
                            type="number"
                            value={formData.sourceDrinkingWater?.publicTap || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "publicTap", parseInt(e.target.value) || 0)}
                            />  
                            <Input
                            label="Open-well"
                            type="number"
                            value={formData.sourceDrinkingWater?.openwell || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "openwell", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Tank/Pond"
                            type="number"
                            value={formData.sourceDrinkingWater?.tankPond || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "tankPond", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="River/Canal/Lake/Spring"
                            type="number"
                            value={formData.sourceDrinkingWater?.riverCanalLakeSpring || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "riverCanalLakeSpring", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Water Tanker"
                            type="number"
                            value={formData.sourceDrinkingWater?.waterTanker || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "waterTanker", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others"
                            type="number"
                            value={formData.sourceDrinkingWater?.others || ""}
                            onChange={(e) => handleNestedInputChange("sourceDrinkingWater", "others", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                        label="Connectivity to City Water Supply"
                        value={formData.connectivityCityWaterSupply || ""}
                        onChange={(e) => handleInputChange("connectivityCityWaterSupply", e.target.value)}
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
                        options={[
                            { value: "YES", label: "Yes" },
                            { value: "NO", label: "No" },
                        ]}
                        />
                        <Select
                        label="Connectivity to Storm Water Drainage"
                        value={formData.connectivityStormWaterDrainage || ""}
                        onChange={(e) => handleInputChange("connectivityStormWaterDrainage", e.target.value)}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                    label="26a. Anganwadi under ICDS"
                    type="number"
                    value={formData.anganwadiUnderIcds || ""}
                    onChange={(e) => handleInputChange("anganwadiUnderIcds", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="26b. Municipal pre-school"
                    type="number"
                    value={formData.municipalPreschool || ""}
                    onChange={(e) => handleInputChange("municipalPreschool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="26c. Private pre-school"
                    type="number"
                    value={formData.privatePreschool || ""}
                    onChange={(e) => handleInputChange("privatePreschool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="27a. Municipal"
                    type="number"
                    value={formData.municipalPrimarySchool || ""}
                    onChange={(e) => handleInputChange("municipalPrimarySchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="27b. State Government"
                    type="number"
                    value={formData.stateGovtPrimarySchool || ""}
                    onChange={(e) => handleInputChange("stateGovtPrimarySchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="27c. Private"
                    type="number"
                    value={formData.privatePrimarySchool || ""}
                    onChange={(e) => handleInputChange("privatePrimarySchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="28a. Municipal"
                    type="number"
                    value={formData.municipalHighSchool || ""}
                    onChange={(e) => handleInputChange("municipalHighSchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="28b. State Government"
                    type="number"
                    value={formData.stateGovtHighSchool || ""}
                    onChange={(e) => handleInputChange("stateGovtHighSchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="28c. Private"
                    type="number"
                    value={formData.privateHighSchool || ""}
                    onChange={(e) => handleInputChange("privateHighSchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="29. Adult Education Centre"
                    type="number"
                    value={formData.adultEducationCentre || ""}
                    onChange={(e) => handleInputChange("adultEducationCentre", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="30. Non-formal Education Centre"
                    type="number"
                    value={formData.nonFormalEducationCentre || ""}
                    onChange={(e) => handleInputChange("nonFormalEducationCentre", parseInt(e.target.value) || 0)}
                    />
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
                    onChange={(e) => handleInputChange("urbanHealthPost", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31b. Primary Health Centre"
                    value={formData.primaryHealthCentre || ""}
                    onChange={(e) => handleInputChange("primaryHealthCentre", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31c. Government Hospital"
                    value={formData.governmentHospital || ""}
                    onChange={(e) => handleInputChange("governmentHospital", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31d. Maternity Centre"
                    value={formData.maternityCentre || ""}
                    onChange={(e) => handleInputChange("maternityCentre", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31e. Private Clinic"
                    value={formData.privateClinic || ""}
                    onChange={(e) => handleInputChange("privateClinic", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31f. Registered Medical Practitioner (RMP)"
                    value={formData.rmp || ""}
                    onChange={(e) => handleInputChange("rmp", e.target.value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="31g. Ayurvedic Doctor/Vaidya"
                    value={formData.ayurvedicDoctor || ""}
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
                            onChange={(e) => handleInputChange("communityHall", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32b. Livelihood/Production Centre"
                            type="number"
                            value={formData.livelihoodProductionCentre || ""}
                            onChange={(e) => handleInputChange("livelihoodProductionCentre", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32c. Vocational training/Training-cum-production Centre"
                            type="number"
                            value={formData.vocationalTrainingCentre || ""}
                            onChange={(e) => handleInputChange("vocationalTrainingCentre", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32d. Street Children Rehabilitation Centre"
                            type="number"
                            value={formData.streetChildrenRehabilitationCentre || ""}
                            onChange={(e) => handleInputChange("streetChildrenRehabilitationCentre", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32e. Night Shelter"
                            type="number"
                            value={formData.nightShelter || ""}
                            onChange={(e) => handleInputChange("nightShelter", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="32f. Old Age Home"
                            type="number"
                            value={formData.oldAgeHome || ""}
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
                            onChange={(e) => handleInputChange("oldAgePensionsHolders", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="33b. Widow Pension Holders"
                            type="number"
                            value={formData.widowPensionsHolders || ""}
                            onChange={(e) => handleInputChange("widowPensionsHolders", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="33c. Disabled Pension Holders"
                            type="number"
                            value={formData.disabledPensionsHolders || ""}
                            onChange={(e) => handleInputChange("disabledPensionsHolders", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="33d. General Insurance Covered"
                            type="number"
                            value={formData.generalInsuranceCovered || ""}
                            onChange={(e) => handleInputChange("generalInsuranceCovered", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="33e. Health Insurance Covered"
                            type="number"
                            value={formData.healthInsuranceCovered || ""}
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
                            onChange={(e) => handleInputChange("selfHelpGroups", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="35. Thrift & Credit Societies"
                            type="number"
                            value={formData.thriftCreditSocieties || ""}
                            onChange={(e) => handleInputChange("thriftCreditSocieties", parseInt(e.target.value) || 0)}
                            />
                            <Select
                            label="36a. Slum Dwellers Association"
                            value={formData.slumDwellersAssociation || ""}
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
                            onChange={(e) => handleInputChange("youthAssociations", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="36c. Women's Associations"
                            type="number"
                            value={formData.womensAssociations || ""}
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
                            name="communityOthersCost"
                            error={getFieldError("communityOthersCost")}
                            />
                            )}
                        </div>
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
                        <div className="p-2 bg-slate-800 rounded"><strong>City/Town:</strong> {formData.cityTown || 'N/A'}</div>
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
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households:</strong> {formData.noBplHouseholdsCityTown || 'N/A'}</div>
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
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Name:</strong> {formData.slumNameBasicInfo || 'N/A'}</div>
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
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">6. Demographic Profile</h3>
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
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households SC:</strong> {formData.noWomenHeadedHouseholdsSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households ST:</strong> {formData.noWomenHeadedHouseholdsST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households OBC:</strong> {formData.noWomenHeadedHouseholdsOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households Others:</strong> {formData.noWomenHeadedHouseholdsOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households Total:</strong> {formData.noWomenHeadedHouseholdsTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households Minorities:</strong> {formData.noWomenHeadedHouseholdsMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 SC:</strong> {formData.noPersonsOlder65SC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 ST:</strong> {formData.noPersonsOlder65ST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 OBC:</strong> {formData.noPersonsOlder65OBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 Others:</strong> {formData.noPersonsOlder65Others || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 Total:</strong> {formData.noPersonsOlder65Total || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 Minorities:</strong> {formData.noPersonsOlder65Minorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers SC:</strong> {formData.noChildLabourersSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers ST:</strong> {formData.noChildLabourersST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers OBC:</strong> {formData.noChildLabourersOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers Others:</strong> {formData.noChildLabourersOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers Total:</strong> {formData.noChildLabourersTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers Minorities:</strong> {formData.noChildLabourersMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged SC:</strong> {formData.noPhysicallyChallengedSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged ST:</strong> {formData.noPhysicallyChallengedST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged OBC:</strong> {formData.noPhysicallyChallengedOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged Others:</strong> {formData.noPhysicallyChallengedOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged Total:</strong> {formData.noPhysicallyChallengedTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged Minorities:</strong> {formData.noPhysicallyChallengedMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged SC:</strong> {formData.noMentallyChallengedSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged ST:</strong> {formData.noMentallyChallengedST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged OBC:</strong> {formData.noMentallyChallengedOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged Others:</strong> {formData.noMentallyChallengedOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged Total:</strong> {formData.noMentallyChallengedTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged Minorities:</strong> {formData.noMentallyChallengedMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS SC:</strong> {formData.noPersonsHivaidsSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS ST:</strong> {formData.noPersonsHivaidsST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS OBC:</strong> {formData.noPersonsHivaidsOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS Others:</strong> {formData.noPersonsHivaidsOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS Total:</strong> {formData.noPersonsHivaidsTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS Minorities:</strong> {formData.noPersonsHivaidsMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis SC:</strong> {formData.noPersonsTuberculosisSC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis ST:</strong> {formData.noPersonsTuberculosisST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis OBC:</strong> {formData.noPersonsTuberculosisOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis Others:</strong> {formData.noPersonsTuberculosisOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis Total:</strong> {formData.noPersonsTuberculosisTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis Minorities:</strong> {formData.noPersonsTuberculosisMinorities || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory SC:</strong> {formData.noPersonsRespiratorySC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory ST:</strong> {formData.noPersonsRespiratoryST || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory OBC:</strong> {formData.noPersonsRespiratoryOBC || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory Others:</strong> {formData.noPersonsRespiratoryOthers || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory Total:</strong> {formData.noPersonsRespiratoryTotal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory Minorities:</strong> {formData.noPersonsRespiratoryMinorities || 'N/A'}</div>
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
                
                {/* Occupation Status */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">9. Occupation Status of Households</h3>
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
                        <div className="p-2 bg-slate-800 rounded"><strong>Water Supply (hrs/day):</strong> {formData.waterSupplyHours || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Water Supply Source:</strong> {formData.waterSupplySource || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Electricity Connection:</strong> {formData.electricityConnection || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Electricity Hours:</strong> {formData.electricityHours || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Drainage System:</strong> {formData.drainsType || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Roads Type:</strong> {formData.roadsType || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Garbage Disposal:</strong> {formData.garbageDisposal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Street Lights:</strong> {formData.streetLights || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Paved Roads:</strong> {formData.pavedRoads || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Unpaved Roads:</strong> {formData.unpavedRoads || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dustbins:</strong> {formData.dustbins || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Drainage Covered:</strong> {formData.drainsCovered || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Drainage Open:</strong> {formData.drainsOpen || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Drainage Absent:</strong> {formData.drainsAbsent || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Education Facilities */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">11. Education Facilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Primary School Government:</strong> {formData.primarySchoolGovt || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Primary School Private:</strong> {formData.primarySchoolPrivate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Secondary School Government:</strong> {formData.secondarySchoolGovt || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Secondary School Private:</strong> {formData.secondarySchoolPrivate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Higher Secondary Government:</strong> {formData.higherSecondarySchoolGovt || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Higher Secondary Private:</strong> {formData.higherSecondarySchoolPrivate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Anganwadi Center Government:</strong> {formData.anganwadiCenterGovt || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Anganwadi Center Private:</strong> {formData.anganwadiCenterPrivate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Distance to Primary School:</strong> {formData.distanceToPrimarySchool || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Distance to Secondary School:</strong> {formData.distanceToSecondarySchool || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Health Facilities */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">12. Health Facilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Dispensary Government:</strong> {formData.dispensaryGovt || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dispensary Private:</strong> {formData.dispensaryPrivate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Hospital Government:</strong> {formData.hospitalGovt || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Hospital Private:</strong> {formData.hospitalPrivate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Distance to Dispensary:</strong> {formData.distanceToDispensary || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Distance to Hospital:</strong> {formData.distanceToHospital || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Medical Store Government:</strong> {formData.medicalStoreGovt || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Medical Store Private:</strong> {formData.medicalStorePrivate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>PHC Government:</strong> {formData.phcGovt || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>PHC Private:</strong> {formData.phcPrivate || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>CHC Government:</strong> {formData.chcGovt || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>CHC Private:</strong> {formData.chcPrivate || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Social Development */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">13. Social Development/Welfare</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>NRHM Scheme:</strong> {formData.nrhmScheme || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>NRHM Beneficiaries:</strong> {formData.nrhmBeneficiaries || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>ICDS Scheme:</strong> {formData.icdsScheme || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>ICDS Beneficiaries:</strong> {formData.icdsBeneficiaries || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Nirmal Bharat Abhiyan:</strong> {formData.nirmalBharatAbhiyan || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>NBA Beneficiaries:</strong> {formData.nbaBeneficiaries || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Mid Day Meal:</strong> {formData.midDayMeal || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>MDM Beneficiaries:</strong> {formData.mdmBeneficiaries || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>SABLA Scheme:</strong> {formData.sablaScheme || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>SABLA Beneficiaries:</strong> {formData.sablaBeneficiaries || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Rashtriya Swasthya Bima Yojana:</strong> {formData.rashtriyaSwasthyaBimaYojana || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>RSBY Beneficiaries:</strong> {formData.rsbyBeneficiaries || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>AYUSHMAN Bharat:</strong> {formData.ayushmanBharat || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>AYUSHMAN Beneficiaries:</strong> {formData.ayushmanBeneficiaries || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Other Schemes:</strong> {formData.otherSchemes || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Other Schemes Beneficiaries:</strong> {formData.otherSchemesBeneficiaries || 'N/A'}</div>
                    </div>
                </div>
                
                {/* Additional Infrastructure */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">14. Additional Infrastructure Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Water Supply Existing:</strong> {formData.additionalInfrastructure?.waterSupply?.existing || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Water Supply Additional:</strong> {formData.additionalInfrastructure?.waterSupply?.additionalRequirement || 'N/A'}</div>
                        {formData.additionalInfrastructure?.waterSupply?.additionalRequirement === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-1 md:col-span-2"><strong>Water Supply Estimated Cost:</strong> {formData.additionalInfrastructure?.waterSupply?.estimatedCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Electricity Existing:</strong> {formData.additionalInfrastructure?.electricity?.existing || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Electricity Additional:</strong> {formData.additionalInfrastructure?.electricity?.additionalRequirement || 'N/A'}</div>
                        {formData.additionalInfrastructure?.electricity?.additionalRequirement === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-1 md:col-span-2"><strong>Electricity Estimated Cost:</strong> {formData.additionalInfrastructure?.electricity?.estimatedCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Drainage Existing:</strong> {formData.additionalInfrastructure?.drainage?.existing || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Drainage Additional:</strong> {formData.additionalInfrastructure?.drainage?.additionalRequirement || 'N/A'}</div>
                        {formData.additionalInfrastructure?.drainage?.additionalRequirement === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-1 md:col-span-2"><strong>Drainage Estimated Cost:</strong> {formData.additionalInfrastructure?.drainage?.estimatedCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Roads Existing:</strong> {formData.additionalInfrastructure?.roads?.existing || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Roads Additional:</strong> {formData.additionalInfrastructure?.roads?.additionalRequirement || 'N/A'}</div>
                        {formData.additionalInfrastructure?.roads?.additionalRequirement === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-1 md:col-span-2"><strong>Roads Estimated Cost:</strong> {formData.additionalInfrastructure?.roads?.estimatedCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Toilets Existing:</strong> {formData.additionalInfrastructure?.toilets?.existing || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Toilets Additional:</strong> {formData.additionalInfrastructure?.toilets?.additionalRequirement || 'N/A'}</div>
                        {formData.additionalInfrastructure?.toilets?.additionalRequirement === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-1 md:col-span-2"><strong>Toilets Estimated Cost:</strong> {formData.additionalInfrastructure?.toilets?.estimatedCost || 'N/A'}</div>}
                        <div className="p-2 bg-slate-800 rounded"><strong>Healthcare Existing:</strong> {formData.additionalInfrastructure?.healthcare?.existing || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Healthcare Additional:</strong> {formData.additionalInfrastructure?.healthcare?.additionalRequirement || 'N/A'}</div>
                        {formData.additionalInfrastructure?.healthcare?.additionalRequirement === 'Yes' && <div className="p-2 bg-slate-800 rounded col-span-1 md:col-span-2"><strong>Healthcare Estimated Cost:</strong> {formData.additionalInfrastructure?.healthcare?.estimatedCost || 'N/A'}</div>}
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
                    disabled={currentStep === 0 || submitting || saving}
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
                            disabled={saving || submitting}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 w-full sm:w-auto"
                        >
                            {saving ? "Saving..." : "Save & Next"}
                        </Button>
                    ) : (
                        <Button
                            size="md"
                            onClick={handleSubmit}
                            disabled={submitting || saving}
                            className="bg-green-600 hover:bg-green-500 w-full sm:w-auto"
                        >
                            {submitting ? "Submitting..." : "Submit Survey"}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
      </div>
    </SurveyorLayout>
  );
}
