"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import SurveyorLayout from "@/components/SurveyorLayout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Stepper from '@/components/Stepper';
import BackNavigationDialog from '@/components/BackNavigationDialog';
import apiService from '@/services/api';
import { useToast } from '@/components/Toast';

// Slum Survey Form Interface
interface SlumSurveyForm {
  slumId: string;
  surveyed: boolean;
  completionPercentage?: number;
  
  // PART-A: I. GENERAL INFORMATION -CITY/TOWN
  stateCode?: string; // 1(a)
  stateName?: string; // 1(b)
  districtCode?: string; // 2(a)
  districtName?: string; // 2(b)
  ulbCode?: string; // 3(a)
  ulbName?: string; // 3(b)
  cityTownCode?: string;
  cityTown?: string; // 4(a)
  cityTownNoHouseholds?: number; // 4(b)
  
  // PART-B: II. CITY/TOWN SLUM PROFILE
  slumType?: string; // 5 - Notified / Non-Notified / New Identified
  slumIdField?: string; // 6 - Slum ID
  slumName?: string; // 7 - Slum Name
  ownershipLand?: string; // 8 - Municipal Corporation -01, State Government - 02, Central Government – 03, Private -04, Other - 05
  areaSqMtrs?: number; // 9 - Area in sq Mtrs
  slumPopulation?: number; // 10 - Slum population
  noSlumHouseholds?: number; // 11 - No. of slum House Holds
  bplPopulation?: number; // 12 - BPL(Below Poverty Line) population
  bplHouseholds?: number; // 13 - No. of BPL House Holds
  
  // PART-C: III. PARTICULARS OF SURVEY OPERATION
  surveyorName?: string; // 7 - Name
  surveyDate?: string; // 8(a) - Date(s) of Survey
  
  // PART-D: I. BASIC INFORMATION ON SLUM
  slumNameBasicInfo?: string; // 1 - Name of Slum (Note: backend uses slumName in cityTownSlumProfile)
  wardNumber?: string; // 2 - Location - Ward No/Name
  wardName?: string; // 2 - Location - Ward Name (Note: backend uses wardNumber for both)
  zone?: string; // 2 - Location - Ward No/Name (Note: backend has zoneNumber)
  ageSlumYears?: number; // 3 - Age of Slum in Years
  locationCoreOrFringe?: string; // 5 - Whether located in Core City/Town or Fringe area (Core City/Town - 01, Fringe Area -02)
  typeAreaSurrounding?: string; // 6 - Type of Area surrounding Slum (Residential - 01, Industrial - 02, Commercial - 03, Institutional-04, Other-49)
  physicalLocationSlum?: string; // 7 - Physical Location of Slum (Along Nallah -01, Along Other Drains - 02, etc.)
  
  // PART-E: II. LAND STATUS
  ownershipLandDetail?: string; // 10 - Ownership of Land where Slum is located (Public: Municipal Corporation -01, State Government - 02, etc.)
  ownershipLandSpecify?: string; // 11 - Please specify Ownership of Land (To whom land belongs)
  
  // PART-F: III. DEMOGRAPHIC PROFILE
  // 12. Population & Health: 
  totalPopulationSlumSC?: number;
  totalPopulationSlumST?: number;
  totalPopulationSlumOBC?: number;
  totalPopulationSlumOthers?: number;
  totalPopulationSlumTotal?: number;
  totalPopulationSlumMinorities?: number;
  
  bplPopulationSlumSC?: number;
  bplPopulationSlumST?: number;
  bplPopulationSlumOBC?: number;
  bplPopulationSlumOthers?: number;
  bplPopulationSlumTotal?: number;
  bplPopulationSlumMinorities?: number;
  
  noHouseholdsSlumSC?: number;
  noHouseholdsSlumST?: number;
  noHouseholdsSlumOBC?: number;
  noHouseholdsSlumOthers?: number;
  noHouseholdsSlumTotal?: number;
  noHouseholdsSlumMinorities?: number;
  
  noBplHouseholdsSC?: number;
  noBplHouseholdsST?: number;
  noBplHouseholdsOBC?: number;
  noBplHouseholdsOthers?: number;
  noBplHouseholdsTotal?: number;
  noBplHouseholdsMinorities?: number;
  
  noWomenHeadedHouseholdsSC?: number;
  noWomenHeadedHouseholdsST?: number;
  noWomenHeadedHouseholdsOBC?: number;
  noWomenHeadedHouseholdsOthers?: number;
  noWomenHeadedHouseholdsTotal?: number;
  noWomenHeadedHouseholdsMinorities?: number;
  
  noPersonsOlder65SC?: number;
  noPersonsOlder65ST?: number;
  noPersonsOlder65OBC?: number;
  noPersonsOlder65Others?: number;
  noPersonsOlder65Total?: number;
  noPersonsOlder65Minorities?: number;
  
  noChildLabourersSC?: number;
  noChildLabourersST?: number;
  noChildLabourersOBC?: number;
  noChildLabourersOthers?: number;
  noChildLabourersTotal?: number;
  noChildLabourersMinorities?: number;
  
  noPhysicallyChallengedSC?: number;
  noPhysicallyChallengedST?: number;
  noPhysicallyChallengedOBC?: number;
  noPhysicallyChallengedOthers?: number;
  noPhysicallyChallengedTotal?: number;
  noPhysicallyChallengedMinorities?: number;
  
  noMentallyChallengedSC?: number;
  noMentallyChallengedST?: number;
  noMentallyChallengedOBC?: number;
  noMentallyChallengedOthers?: number;
  noMentallyChallengedTotal?: number;
  noMentallyChallengedMinorities?: number;
  
  noPersonsHivaidsSC?: number;
  noPersonsHivaidsST?: number;
  noPersonsHivaidsOBC?: number;
  noPersonsHivaidsOthers?: number;
  noPersonsHivaidsTotal?: number;
  noPersonsHivaidsMinorities?: number;
  
  noPersonsTuberculosisSC?: number;
  noPersonsTuberculosisST?: number;
  noPersonsTuberculosisOBC?: number;
  noPersonsTuberculosisOthers?: number;
  noPersonsTuberculosisTotal?: number;
  noPersonsTuberculosisMinorities?: number;
  
  noPersonsRespiratorySC?: number;
  noPersonsRespiratoryST?: number;
  noPersonsRespiratoryOBC?: number;
  noPersonsRespiratoryOthers?: number;
  noPersonsRespiratoryTotal?: number;
  noPersonsRespiratoryMinorities?: number;
  
  noPersonsOtherChronicSC?: number;
  noPersonsOtherChronicST?: number;
  noPersonsOtherChronicOBC?: number;
  noPersonsOtherChronicOthers?: number;
  noPersonsOtherChronicTotal?: number;
  noPersonsOtherChronicMinorities?: number;
  
  // 13. Literacy - Education
  totalIlliteratePersonsSC?: number;
  totalIlliteratePersonsST?: number;
  totalIlliteratePersonsOBC?: number;
  totalIlliteratePersonsOthers?: number;
  totalIlliteratePersonsTotal?: number;
  totalIlliteratePersonsMinorities?: number;
  
  noMaleIlliterateSC?: number;
  noMaleIlliterateST?: number;
  noMaleIlliterateOBC?: number;
  noMaleIlliterateOthers?: number;
  noMaleIlliterateTotal?: number;
  noMaleIlliterateMinorities?: number;
  
  noFemaleIlliterateSC?: number;
  noFemaleIlliterateST?: number;
  noFemaleIlliterateOBC?: number;
  noFemaleIlliterateOthers?: number;
  noFemaleIlliterateTotal?: number;
  noFemaleIlliterateMinorities?: number;
  
  noBplIlliteratePersonsSC?: number;
  noBplIlliteratePersonsST?: number;
  noBplIlliteratePersonsOBC?: number;
  noBplIlliteratePersonsOthers?: number;
  noBplIlliteratePersonsTotal?: number;
  noBplIlliteratePersonsMinorities?: number;
  
  noMaleBplIlliterateSC?: number;
  noMaleBplIlliterateST?: number;
  noMaleBplIlliterateOBC?: number;
  noMaleBplIlliterateOthers?: number;
  noMaleBplIlliterateTotal?: number;
  noMaleBplIlliterateMinorities?: number;
  
  noFemaleBplIlliterateSC?: number;
  noFemaleBplIlliterateST?: number;
  noFemaleBplIlliterateOBC?: number;
  noFemaleBplIlliterateOthers?: number;
  noFemaleBplIlliterateTotal?: number;
  noFemaleBplIlliterateMinorities?: number;
  
  schoolDropoutsMaleSC?: number;
  schoolDropoutsMaleST?: number;
  schoolDropoutsMaleOBC?: number;
  schoolDropoutsMaleOthers?: number;
  schoolDropoutsMaleTotal?: number;
  schoolDropoutsMaleMinorities?: number;
  
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
  
  // PART-XII: XI. ADDITIONAL INFRASTRUCTURE REQUIREMENTS
  // Additional Infrastructure - flat structure fields
  waterSupplyPipelinesExisting?: number;
  waterSupplyPipelinesAdditional?: number;
  waterSupplyPipelinesCost?: number;
  
  waterSupplyIndividualTapsExisting?: number;
  waterSupplyIndividualTapsAdditional?: number;
  waterSupplyIndividualTapsCost?: number;
  
  waterSupplyBorewellsExisting?: number;
  waterSupplyBorewellsAdditional?: number;
  waterSupplyBorewellsCost?: number;
  
  waterSupplyConnectivityTrunkLinesExisting?: number;
  waterSupplyConnectivityTrunkLinesAdditional?: number;
  waterSupplyConnectivityTrunkLinesCost?: number;
  
  drainageStormwaterDrainageExisting?: number;
  drainageStormwaterDrainageAdditional?: number;
  drainageStormwaterDrainageCost?: number;
  
  drainageConnectivityMainDrainsExisting?: number;
  drainageConnectivityMainDrainsAdditional?: number;
  drainageConnectivityMainDrainsCost?: number;
  
  drainageSewerLinesExisting?: number;
  drainageSewerLinesAdditional?: number;
  drainageSewerLinesCost?: number;
  
  drainageConnectivityTrunkSewersExisting?: number;
  drainageConnectivityTrunkSewersAdditional?: number;
  drainageConnectivityTrunkSewersCost?: number;
  
  roadsInternalRoadsCCExisting?: number;
  roadsInternalRoadsCCAdditional?: number;
  roadsInternalRoadsCCCost?: number;
  
  roadsInternalRoadsBTExisting?: number;
  roadsInternalRoadsBTAdditional?: number;
  roadsInternalRoadsBTCost?: number;
  
  roadsInternalRoadsOthersExisting?: number;
  roadsInternalRoadsOthersAdditional?: number;
  roadsInternalRoadsOthersCost?: number;
  
  roadsApproachRoadsCCExisting?: number;
  roadsApproachRoadsCCAdditional?: number;
  roadsApproachRoadsCCCost?: number;
  
  roadsApproachRoadsOthersExisting?: number;
  roadsApproachRoadsOthersAdditional?: number;
  roadsApproachRoadsOthersCost?: number;
  
  streetLightingPolesExisting?: number;
  streetLightingPolesAdditional?: number;
  streetLightingPolesCost?: number;
  
  streetLightingLightsExisting?: number;
  streetLightingLightsAdditional?: number;
  streetLightingLightsCost?: number;
  
  sanitationIndividualToiletsExisting?: number;
  sanitationIndividualToiletsAdditional?: number;
  sanitationIndividualToiletsCost?: number;
  
  sanitationCommunityToiletsExisting?: number;
  sanitationCommunityToiletsAdditional?: number;
  sanitationCommunityToiletsCost?: number;
  
  sanitationSeatsCommunityToiletsExisting?: number;
  sanitationSeatsCommunityToiletsAdditional?: number;
  sanitationSeatsCommunityToiletsCost?: number;
  
  sanitationDumperBinsExisting?: number;
  sanitationDumperBinsAdditional?: number;
  sanitationDumperBinsCost?: number;
  
  communityHallsExisting?: number;
  communityHallsAdditional?: number;
  communityHallsCost?: number;
  
  communityLivelihoodCentresExisting?: number;
  communityLivelihoodCentresAdditional?: number;
  communityLivelihoodCentresCost?: number;
  
  communityAnganwadisExisting?: number;
  communityAnganwadisAdditional?: number;
  communityAnganwadisCost?: number;
  
  communityPrimarySchoolsExisting?: number;
  communityPrimarySchoolsAdditional?: number;
  communityPrimarySchoolsCost?: number;
  
  communityHealthCentresExisting?: number;
  communityHealthCentresAdditional?: number;
  communityHealthCentresCost?: number;
  
  communityOthersExisting?: number;
  communityOthersAdditional?: number;
  communityOthersCost?: number;
  
  electricityExisting?: number;
  electricityAdditional?: number;
  electricityCost?: number;
  
  healthcareExisting?: number;
  healthcareAdditional?: number;
  healthcareCost?: number;
  
  toiletsExisting?: number;
  toiletsAdditional?: number;
  toiletsCost?: number;
};

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

  // Helper function to render values: show 0 for numeric fields when undefined/null, 'N/A' for others
  const renderValue = (value: any, isNumeric: boolean = false) => {
    if (isNumeric) {
      if (value === undefined || value === null || value === '') {
        return 0;
      }
      return value;
    } else {
      if (value === undefined || value === null || value === '') {
        return 'N/A';
      }
      return value;
    }
  };

  const [formData, setFormData] = useState<SlumSurveyForm>({
    slumId: "",
    surveyed: false,
    surveyorName: user?.name || "", // Pre-populate with user name
    surveyDate: "", // Will be set after user data is loaded
    slumType: "",
    ownershipLand: "",
    ownershipLandDetail: "",
    ownershipLandSpecify: "",
    locationCoreOrFringe: "",
    typeAreaSurrounding: "",
    physicalLocationSlum: "",
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

    // Initialize nested objects to prevent undefined errors
    economicStatus: {
      lessThan500: 0,
      rs500to1000: 0,
      rs1000to1500: 0,
      rs1500to2000: 0,
      rs2000to3000: 0,
      moreThan3000: 0
    },
    
    sourceDrinkingWater: {
      individualTap: 0,
      tubewellBorewellHandpump: 0,
      publicTap: 0,
      openwell: 0,
      tankPond: 0,
      riverCanalLakeSpring: 0,
      waterTanker: 0,
      others: 0
    },
    
    occupationalStatus: {
      selfEmployed: 0,
      salaried: 0,
      regularWage: 0,
      casualLabour: 0,
      others: 0
    },
    
    // Additional Infrastructure Requirements - using flat structure to match interface
    waterSupplyPipelinesExisting: 0,
    waterSupplyPipelinesAdditional: 0,
    waterSupplyPipelinesCost: 0,
        
    waterSupplyIndividualTapsExisting: 0,
    waterSupplyIndividualTapsAdditional: 0,
    waterSupplyIndividualTapsCost: 0,
        
    waterSupplyBorewellsExisting: 0,
    waterSupplyBorewellsAdditional: 0,
    waterSupplyBorewellsCost: 0,
        
    waterSupplyConnectivityTrunkLinesExisting: 0,
    waterSupplyConnectivityTrunkLinesAdditional: 0,
    waterSupplyConnectivityTrunkLinesCost: 0,
        
    drainageStormwaterDrainageExisting: 0,
    drainageStormwaterDrainageAdditional: 0,
    drainageStormwaterDrainageCost: 0,
        
    drainageConnectivityMainDrainsExisting: 0,
    drainageConnectivityMainDrainsAdditional: 0,
    drainageConnectivityMainDrainsCost: 0,
        
    drainageSewerLinesExisting: 0,
    drainageSewerLinesAdditional: 0,
    drainageSewerLinesCost: 0,
        
    drainageConnectivityTrunkSewersExisting: 0,
    drainageConnectivityTrunkSewersAdditional: 0,
    drainageConnectivityTrunkSewersCost: 0,
        
    roadsInternalRoadsCCExisting: 0,
    roadsInternalRoadsCCAdditional: 0,
    roadsInternalRoadsCCCost: 0,
        
    roadsInternalRoadsBTExisting: 0,
    roadsInternalRoadsBTAdditional: 0,
    roadsInternalRoadsBTCost: 0,
        
    roadsInternalRoadsOthersExisting: 0,
    roadsInternalRoadsOthersAdditional: 0,
    roadsInternalRoadsOthersCost: 0,
        
    roadsApproachRoadsCCExisting: 0,
    roadsApproachRoadsCCAdditional: 0,
    roadsApproachRoadsCCCost: 0,
        
    roadsApproachRoadsOthersExisting: 0,
    roadsApproachRoadsOthersAdditional: 0,
    roadsApproachRoadsOthersCost: 0,
        
    streetLightingPolesExisting: 0,
    streetLightingPolesAdditional: 0,
    streetLightingPolesCost: 0,
        
    streetLightingLightsExisting: 0,
    streetLightingLightsAdditional: 0,
    streetLightingLightsCost: 0,
        
    sanitationIndividualToiletsExisting: 0,
    sanitationIndividualToiletsAdditional: 0,
    sanitationIndividualToiletsCost: 0,
        
    sanitationCommunityToiletsExisting: 0,
    sanitationCommunityToiletsAdditional: 0,
    sanitationCommunityToiletsCost: 0,
        
    sanitationSeatsCommunityToiletsExisting: 0,
    sanitationSeatsCommunityToiletsAdditional: 0,
    sanitationSeatsCommunityToiletsCost: 0,
        
    sanitationDumperBinsExisting: 0,
    sanitationDumperBinsAdditional: 0,
    sanitationDumperBinsCost: 0,
        
    communityHallsExisting: 0,
    communityHallsAdditional: 0,
    communityHallsCost: 0,
        
    communityLivelihoodCentresExisting: 0,
    communityLivelihoodCentresAdditional: 0,
    communityLivelihoodCentresCost: 0,
        
    communityAnganwadisExisting: 0,
    communityAnganwadisAdditional: 0,
    communityAnganwadisCost: 0,
        
    communityPrimarySchoolsExisting: 0,
    communityPrimarySchoolsAdditional: 0,
    communityPrimarySchoolsCost: 0,
        
    communityHealthCentresExisting: 0,
    communityHealthCentresAdditional: 0,
    communityHealthCentresCost: 0,
        
    communityOthersExisting: 0,
    communityOthersAdditional: 0,
    communityOthersCost: 0,
        
    electricityExisting: 0,
    electricityAdditional: 0,
    electricityCost: 0,
        
    healthcareExisting: 0,
    healthcareAdditional: 0,
    healthcareCost: 0,
        
    toiletsExisting: 0,
    toiletsAdditional: 0,
    toiletsCost: 0
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
    let userData = null;
    if (userStr) {
      userData = JSON.parse(userStr);
      setUser(userData);
    }
    
    // Set survey date when component mounts and user data is available
    if (userData && !formData.surveyDate) {
      setFormData(prev => ({
        ...prev,
        surveyDate: new Date().toISOString().split('T')[0]
      }));
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

          // First, get the assignment again to access the populated ward information
          // The assignment controller populates the slum with ward details
          let assignmentWardData = null;
          
          if (assignmentResponse.success && assignmentResponse.data?.slum?.ward) {
            assignmentWardData = assignmentResponse.data.slum.ward;
          }

          // Now fetch the slum details
          const slumResponse = await apiService.getSlum(slumId);
          if (slumResponse.success) {
            const slumData = slumResponse.data;
            setSlum(slumData);
            
            // Auto-fill slum details with initial values from slum data
            setFormData((prev) => ({
              ...prev,
              slumName: slumData.slumName || "",
              slumIdField: slumData.slumId?.toString() || "",
              areaSqMtrs: slumData.area || 0,
              stateCode: slumData.stateCode || "",
              districtCode: slumData.distCode || "",
              ulbCode: slumData.ulbCode || "",
              ulbName: slumData.ulbName || "",
              cityTownCode: slumData.cityTownCode || "",
              slumType: slumData.slumType || "",
              ownershipLand: slumData.landOwnership || "",
              noSlumHouseholds: slumData.totalHouseholds || 0,
              
              // Populate ward information from assignment if available
              wardNumber: assignmentWardData?.number || assignmentWardData?.wardNumber || "",
              wardName: assignmentWardData?.name || "",
              zone: assignmentWardData?.zone || ""
            }));

            // Now fetch additional data to get state and district names
            // Get state by code to populate state name
            if (slumData.stateCode) {
              try {
                const statesResponse = await apiService.getStates();
                if (statesResponse.success) {
                  const state = statesResponse.data.find((s: any) => s.code === slumData.stateCode);
                  if (state) {
                    setFormData(prev => ({
                      ...prev,
                      stateName: state.name || ""
                    }));
                  }
                }
              } catch (error) {
                console.error("Error fetching state data:", error);
              }
            }

            // Get district by code to populate district name
            if (slumData.distCode) {
              try {
                const districtsResponse = await apiService.getDistricts();
                if (districtsResponse.success) {
                  const district = districtsResponse.data.find((d: any) => d.code === slumData.distCode);
                  if (district) {
                    setFormData(prev => ({
                      ...prev,
                      districtName: district.name || ""
                    }));
                  }
                }
              } catch (error) {
                console.error("Error fetching district data:", error);
              }
            }

            // If ward information wasn't populated from the assignment, try to fetch it separately
            if (slumData.ward && !(assignmentWardData && (assignmentWardData.number || assignmentWardData.name))) {
              try {
                const wardResponse = await apiService.get(`/admin/wards/${slumData.ward}`);
                if (wardResponse.success) {
                  const wardData = wardResponse.data;
                  setFormData(prev => ({
                    ...prev,
                    wardNumber: wardData.number || "",
                    wardName: wardData.name || "",
                    zone: wardData.zone || ""
                  }));
                }
              } catch (error) {
                console.error("Error fetching ward data separately:", error);
              }
            }
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
                locationCoreOrFringe: surveyData.basicInformation.locationCoreOrFringe || "",
                typeAreaSurrounding: surveyData.basicInformation.typeAreaSurrounding || "",
                physicalLocationSlum: surveyData.basicInformation.physicalLocationSlum || "",
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
                totalPopulationSlumTotal: surveyData.demographicProfile.totalPopulation?.Total || 0,
                totalPopulationSlumMinorities: surveyData.demographicProfile.totalPopulation?.Minorities || 0,
                
                // BPL Population
                bplPopulationSlumSC: surveyData.demographicProfile.bplPopulation?.SC || 0,
                bplPopulationSlumST: surveyData.demographicProfile.bplPopulation?.ST || 0,
                bplPopulationSlumOBC: surveyData.demographicProfile.bplPopulation?.OBC || 0,
                bplPopulationSlumOthers: surveyData.demographicProfile.bplPopulation?.Others || 0,
                bplPopulationSlumTotal: surveyData.demographicProfile.bplPopulation?.Total || 0,
                bplPopulationSlumMinorities: surveyData.demographicProfile.bplPopulation?.Minorities || 0,

                // No. of Households
                noHouseholdsSlumSC: surveyData.demographicProfile.noHouseholds?.SC || 0,
                noHouseholdsSlumST: surveyData.demographicProfile.noHouseholds?.ST || 0,
                noHouseholdsSlumOBC: surveyData.demographicProfile.noHouseholds?.OBC || 0,
                noHouseholdsSlumOthers: surveyData.demographicProfile.noHouseholds?.Others || 0,
                noHouseholdsSlumTotal: surveyData.demographicProfile.noHouseholds?.Total || 0,
                noHouseholdsSlumMinorities: surveyData.demographicProfile.noHouseholds?.Minorities || 0,

                // No. of BPL Households
                noBplHouseholdsSC: surveyData.demographicProfile.noBplHouseholds?.SC || 0,
                noBplHouseholdsST: surveyData.demographicProfile.noBplHouseholds?.ST || 0,
                noBplHouseholdsOBC: surveyData.demographicProfile.noBplHouseholds?.OBC || 0,
                noBplHouseholdsOthers: surveyData.demographicProfile.noBplHouseholds?.Others || 0,
                noBplHouseholdsTotal: surveyData.demographicProfile.noBplHouseholds?.Total || 0,
                noBplHouseholdsMinorities: surveyData.demographicProfile.noBplHouseholds?.Minorities || 0,

                // Np. of Women-headed Households
                noWomenHeadedHouseholdsSC: surveyData.demographicProfile.noWomenHeadedHouseholds?.SC || 0,
                noWomenHeadedHouseholdsST: surveyData.demographicProfile.noWomenHeadedHouseholds?.ST || 0,
                noWomenHeadedHouseholdsOBC: surveyData.demographicProfile.noWomenHeadedHouseholds?.OBC || 0,
                noWomenHeadedHouseholdsOthers: surveyData.demographicProfile.noWomenHeadedHouseholds?.Others || 0,
                noWomenHeadedHouseholdsTotal: surveyData.demographicProfile.noWomenHeadedHouseholds?.Total || 0,
                noWomenHeadedHouseholdsMinorities: surveyData.demographicProfile.noWomenHeadedHouseholds?.Minorities || 0,

                // No. of Persons older than 65 Years
                noPersonsOlder65SC: surveyData.demographicProfile.noPersonsOlder65?.SC || 0,
                noPersonsOlder65ST: surveyData.demographicProfile.noPersonsOlder65?.ST || 0,
                noPersonsOlder65OBC: surveyData.demographicProfile.noPersonsOlder65?.OBC || 0,
                noPersonsOlder65Others: surveyData.demographicProfile.noPersonsOlder65?.Others || 0,
                noPersonsOlder65Total: surveyData.demographicProfile.noPersonsOlder65?.Total || 0,
                noPersonsOlder65Minorities: surveyData.demographicProfile.noPersonsOlder65?.Minorities || 0,

                // No. of Child Labourers
                noChildLabourersSC: surveyData.demographicProfile.noChildLabourers?.SC || 0,
                noChildLabourersST: surveyData.demographicProfile.noChildLabourers?.ST || 0,
                noChildLabourersOBC: surveyData.demographicProfile.noChildLabourers?.OBC || 0,
                noChildLabourersOthers: surveyData.demographicProfile.noChildLabourers?.Others || 0,
                noChildLabourersTotal: surveyData.demographicProfile.noChildLabourers?.Total || 0,
                noChildLabourersMinorities: surveyData.demographicProfile.noChildLabourers?.Minorities || 0,

                // No. of Physically Challenged Persons
                noPhysicallyChallengedSC: surveyData.demographicProfile.noPhysicallyChallenged?.SC || 0,
                noPhysicallyChallengedST: surveyData.demographicProfile.noPhysicallyChallenged?.ST || 0,
                noPhysicallyChallengedOBC: surveyData.demographicProfile.noPhysicallyChallenged?.OBC || 0,
                noPhysicallyChallengedOthers: surveyData.demographicProfile.noPhysicallyChallenged?.Others || 0,
                noPhysicallyChallengedTotal: surveyData.demographicProfile.noPhysicallyChallenged?.Total || 0,
                noPhysicallyChallengedMinorities: surveyData.demographicProfile.noPhysicallyChallenged?.Minorities || 0,
                
                // No. of Mentally Challenged Persons
                noMentallyChallengedSC: surveyData.demographicProfile.noMentallyChallenged?.SC || 0,
                noMentallyChallengedST: surveyData.demographicProfile.noMentallyChallenged?.ST || 0,
                noMentallyChallengedOBC: surveyData.demographicProfile.noMentallyChallenged?.OBC || 0,
                noMentallyChallengedOthers: surveyData.demographicProfile.noMentallyChallenged?.Others || 0,
                noMentallyChallengedTotal: surveyData.demographicProfile.noMentallyChallenged?.Total || 0,
                noMentallyChallengedMinorities: surveyData.demographicProfile.noMentallyChallenged?.Minorities || 0,

                // No. of Persons with HIV-AIDS
                noHivAidsSC: surveyData.demographicProfile.noHivAids?.SC || 0,
                noHivAidsST: surveyData.demographicProfile.noHivAids?.ST || 0,
                noHivAidsOBC: surveyData.demographicProfile.noHivAids?.OBC || 0,
                noHivAidsOthers: surveyData.demographicProfile.noHivAids?.Others || 0,
                noHivAidsTotal: surveyData.demographicProfile.noHivAids?.Total || 0,
                noHivAidsMinorities: surveyData.demographicProfile.noHivAids?.Minorities || 0,

                // No. of Persons with Tuberculosis
                noTuberculosisSC: surveyData.demographicProfile.noTuberculosis?.SC || 0,
                noTuberculosisST: surveyData.demographicProfile.noTuberculosis?.ST || 0,
                noTuberculosisOBC: surveyData.demographicProfile.noTuberculosis?.OBC || 0,
                noTuberculosisOthers: surveyData.demographicProfile.noTuberculosis?.Others || 0,
                noTuberculosisTotal: surveyData.demographicProfile.noTuberculosis?.Total || 0,
                noTuberculosisMinorities: surveyData.demographicProfile.noTuberculosis?.Minorities || 0,

                // No. of Persons with Respiratory Diseases including Asthma
                noRespiratoryDiseasesSC: surveyData.demographicProfile.noRespiratoryDiseases?.SC || 0,
                noRespiratoryDiseasesST: surveyData.demographicProfile.noRespiratoryDiseases?.ST || 0,
                noRespiratoryDiseasesOBC: surveyData.demographicProfile.noRespiratoryDiseases?.OBC || 0,
                noRespiratoryDiseasesOthers: surveyData.demographicProfile.noRespiratoryDiseases?.Others || 0,
                noRespiratoryDiseasesTotal: surveyData.demographicProfile.noRespiratoryDiseases?.Total || 0,
                noRespiratoryDiseasesMinorities: surveyData.demographicProfile.noRespiratoryDiseases?.Minorities || 0,

                // No. of Persons with Other Chronic Diseases
                noOtherChronicDiseasesSC: surveyData.demographicProfile.noOtherChronicDiseases?.SC || 0,
                noOtherChronicDiseasesST: surveyData.demographicProfile.noOtherChronicDiseases?.ST || 0,
                noOtherChronicDiseasesOBC: surveyData.demographicProfile.noOtherChronicDiseases?.OBC || 0,
                noOtherChronicDiseasesOthers: surveyData.demographicProfile.noOtherChronicDiseases?.Others || 0,
                noOtherChronicDiseasesTotal: surveyData.demographicProfile.noOtherChronicDiseases?.Total || 0,
                noOtherChronicDiseasesMinorities: surveyData.demographicProfile.noOtherChronicDiseases?.Minorities || 0,

                // Total No. of Illiterte Persons
                totalIlliteratePersonsSC: surveyData.demographicProfile.totalIlliteratePerson?.SC || 0,
                totalIlliteratePersonsST: surveyData.demographicProfile.totalIlliteratePerson?.ST || 0,
                totalIlliteratePersonsOBC: surveyData.demographicProfile.totalIlliteratePerson?.OBC || 0,
                totalIlliteratePersonsOthers: surveyData.demographicProfile.totalIlliteratePerson?.Others || 0,
                totalIlliteratePersonsTotal: surveyData.demographicProfile.totalIlliteratePerson?.Total || 0,
                totalIlliteratePersonsMinorities: surveyData.demographicProfile.totalIlliteratePerson?.Minorities || 0,

                // No. of Male Illiterate
                noMaleIlliterateSC: surveyData.demographicProfile.noMaleIlliterate?.SC || 0,
                noMaleIlliterateST: surveyData.demographicProfile.noMaleIlliterate?.ST || 0,
                noMaleIlliterateOBC: surveyData.demographicProfile.noMaleIlliterate?.OBC || 0,
                noMaleIlliterateOthers: surveyData.demographicProfile.noMaleIlliterate?.Others || 0,
                noMaleIlliterateTotal: surveyData.demographicProfile.noMaleIlliterate?.Total || 0,
                noMaleIlliterateMinorities: surveyData.demographicProfile.noMaleIlliterate?.Minorities || 0,

                // No. of Female Illiterate
                noFemaleIlliterateSC: surveyData.demographicProfile.noFemaleIlliterate?.SC || 0,
                noFemaleIlliterateST: surveyData.demographicProfile.noFemaleIlliterate?.ST || 0,
                noFemaleIlliterateOBC: surveyData.demographicProfile.noFemaleIlliterate?.OBC || 0,
                noFemaleIlliterateOthers: surveyData.demographicProfile.noFemaleIlliterate?.Others || 0,
                noFemaleIlliterateTotal: surveyData.demographicProfile.noFemaleIlliterate?.Total || 0,
                noFemaleIlliterateMinorities: surveyData.demographicProfile.noFemaleIlliterate?.Minorities || 0,

                // No. of BPL Illiterate Persons
                noBplIlliteratePersonsSC: surveyData.demographicProfile.noBplIlliteratePersons?.SC || 0,
                noBplIlliteratePersonsST: surveyData.demographicProfile.noBplIlliteratePersons?.ST || 0,
                noBplIlliteratePersonsOBC: surveyData.demographicProfile.noBplIlliteratePersons?.OBC || 0,
                noBplIlliteratePersonsOthers: surveyData.demographicProfile.noBplIlliteratePersons?.Others || 0,
                noBplIlliteratePersonsTotal: surveyData.demographicProfile.noBplIlliteratePersons?.Total || 0,
                noBplIlliteratePersonsMinorities: surveyData.demographicProfile.noBplIlliteratePersons?.Minorities || 0,

                // No. of Male BPL Illiterate
                noMaleBplIlliterateSC: surveyData.demographicProfile.noMaleBplIlliterate?.SC || 0,
                noMaleBplIlliterateST: surveyData.demographicProfile.noMaleBplIlliterate?.ST || 0,
                noMaleBplIlliterateOBC: surveyData.demographicProfile.noMaleBplIlliterate?.OBC || 0,
                noMaleBplIlliterateOthers: surveyData.demographicProfile.noMaleBplIlliterate?.Others || 0,
                noMaleBplIlliterateTotal: surveyData.demographicProfile.noMaleBplIlliterate?.Total || 0,
                noMaleBplIlliterateMinorities: surveyData.demographicProfile.noMaleBplIlliterate?.Minorities || 0,

                // No. of Female BPL Illiterate
                noFemaleBplIlliterateSC: surveyData.demographicProfile.noFemaleBplIlliterate?.SC || 0,
                noFemaleBplIlliterateST: surveyData.demographicProfile.noFemaleBplIlliterate?.ST || 0,
                noFemaleBplIlliterateOBC: surveyData.demographicProfile.noFemaleBplIlliterate?.OBC || 0,
                noFemaleBplIlliterateOthers: surveyData.demographicProfile.noFemaleBplIlliterate?.Others || 0,
                noFemaleBplIlliterateTotal: surveyData.demographicProfile.noFemaleBplIlliterate?.Total || 0,
                noFemaleBplIlliterateMinorities: surveyData.demographicProfile.noFemaleBplIlliterate?.Minorities || 0,

                // School Dropouts - Male
                noMaleSchoolDropoutsSC: surveyData.demographicProfile.noMaleSchoolDropouts?.SC || 0,
                noMaleSchoolDropoutsST: surveyData.demographicProfile.noMaleSchoolDropouts?.ST || 0,
                noMaleSchoolDropoutsOBC: surveyData.demographicProfile.noMaleSchoolDropouts?.OBC || 0,
                noMaleSchoolDropoutsOthers: surveyData.demographicProfile.noMaleSchoolDropouts?.Others || 0,
                noMaleSchoolDropoutsTotal: surveyData.demographicProfile.noMaleSchoolDropouts?.Total || 0,
                noMaleSchoolDropoutsMinorities: surveyData.demographicProfile.noMaleSchoolDropouts?.Minorities || 0,

                // School Dropouts - Female
                noFemaleSchoolDropoutsSC: surveyData.demographicProfile.noFemaleSchoolDropouts?.SC || 0,
                noFemaleSchoolDropoutsST: surveyData.demographicProfile.noFemaleSchoolDropouts?.ST || 0,
                noFemaleSchoolDropoutsOBC: surveyData.demographicProfile.noFemaleSchoolDropouts?.OBC || 0,
                noFemaleSchoolDropoutsOthers: surveyData.demographicProfile.noFemaleSchoolDropouts?.Others || 0,
                noFemaleSchoolDropoutsTotal: surveyData.demographicProfile.noFemaleSchoolDropouts?.Total || 0,
                noFemaleSchoolDropoutsMinorities: surveyData.demographicProfile.noFemaleSchoolDropouts?.Minorities || 0,

              }));
            }
            
            // Handle infrastructure data
            if (surveyData.physicalInfrastructure) {
              setFormData(prev => ({
                ...prev,
                // Source of Drinking Water - 8 fields
                sourceDrinkingWater: {
                  individualTap: surveyData.physicalInfrastructure.sourceDrinkingWater?.individualTap || 0,
                  tubewellBorewellHandpump: surveyData.physicalInfrastructure.sourceDrinkingWater?.tubewellBorewellHandpump || 0,
                  publicTap: surveyData.physicalInfrastructure.sourceDrinkingWater?.publicTap || 0,
                  openwell: surveyData.physicalInfrastructure.sourceDrinkingWater?.openwell || 0,
                  tankPond: surveyData.physicalInfrastructure.sourceDrinkingWater?.tankPond || 0,
                  riverCanalLakeSpring: surveyData.physicalInfrastructure.sourceDrinkingWater?.riverCanalLakeSpring || 0,
                  waterTanker: surveyData.physicalInfrastructure.sourceDrinkingWater?.waterTanker || 0,
                  others: surveyData.physicalInfrastructure.sourceDrinkingWater?.others || 0
                },
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
                economicStatus: {
                  lessThan500: surveyData.economicStatus.lessThan500 || 0,
                  rs500to1000: surveyData.economicStatus.rs500to1000 || 0,
                  rs1000to1500: surveyData.economicStatus.rs1000to1500 || 0,
                  rs1500to2000: surveyData.economicStatus.rs1500to2000 || 0,
                  rs2000to3000: surveyData.economicStatus.rs2000to3000 || 0,
                  moreThan3000: surveyData.economicStatus.moreThan3000 || 0
                }
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
                noHouseholdsSlumTotal: surveyData.demographicProfile.numberOfHouseholds?.Total || 0,
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
              }));
            }
            
            if (surveyData.additionalInfrastructure) {
              setFormData(prev => ({
                ...prev,
                // Water Supply
                waterSupplyPipelinesExisting: surveyData.additionalInfrastructure?.waterSupply?.pipelines?.existing || 0,
                waterSupplyPipelinesAdditional: surveyData.additionalInfrastructure.waterSupply?.pipelines?.additionalRequirement || 0,
                waterSupplyPipelinesCost: surveyData.additionalInfrastructure.waterSupply?.pipelines?.estimatedCost || 0,
                
                waterSupplyIndividualTapsExisting: surveyData.additionalInfrastructure.waterSupply?.individualTaps?.existing || 0,
                waterSupplyIndividualTapsAdditional: surveyData.additionalInfrastructure.waterSupply?.individualTaps?.additionalRequirement || 0,
                waterSupplyIndividualTapsCost: surveyData.additionalInfrastructure.waterSupply?.individualTaps?.estimatedCost || 0,
                
                waterSupplyBorewellsExisting: surveyData.additionalInfrastructure.waterSupply?.borewells?.existing || 0,
                waterSupplyBorewellsAdditional: surveyData.additionalInfrastructure.waterSupply?.borewells?.additionalRequirement || 0,
                waterSupplyBorewellsCost: surveyData.additionalInfrastructure.waterSupply?.borewells?.estimatedCost || 0,
                
                waterSupplyConnectivityTrunkLinesExisting: surveyData.additionalInfrastructure.waterSupply?.connectivityToTrunkLines?.existing || 0,
                waterSupplyConnectivityTrunkLinesAdditional: surveyData.additionalInfrastructure.waterSupply?.connectivityToTrunkLines?.additionalRequirement || 0,
                waterSupplyConnectivityTrunkLinesCost: surveyData.additionalInfrastructure.waterSupply?.connectivityToTrunkLines?.estimatedCost || 0,
                
                // Drainage/Sewerage
                drainageStormwaterDrainageExisting: surveyData.additionalInfrastructure.drainageewerage?.stormwaterDrainage?.existing || 0,
                drainageStormwaterDrainageAdditional: surveyData.additionalInfrastructure.drainageSewerage?.stormwaterDrainage?.additionalRequirement || 0,
                drainageStormwaterDrainageCost: surveyData.additionalInfrastructure.drainageSewerage?.stormwaterDrainage?.estimatedCost || 0,
                
                drainageConnectivityMainDrainsExisting: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToMainDrains?.existing || 0,
                drainageConnectivityMainDrainsAdditional: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToMainDrains?.additionalRequirement || 0,
                drainageConnectivityMainDrainsCost: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToMainDrains?.estimatedCost || 0,
                
                drainageSewerLinesExisting: surveyData.additionalInfrastructure.drainageSewerage?.sewerLines?.existing || 0,
                drainageSewerLinesAdditional: surveyData.additionalInfrastructure.drainageSewerage?.sewerLines?.additionalRequirement || 0,
                drainageSewerLinesCost: surveyData.additionalInfrastructure.drainageSewerage?.sewerLines?.estimatedCost || 0,
                
                drainageConnectivityTrunkSewersExisting: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToTrunkSewers?.existing || 0,
                drainageConnectivityTrunkSewersAdditional: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToTrunkSewers?.additionalRequirement || 0,
                drainageConnectivityTrunkSewersCost: surveyData.additionalInfrastructure.drainageSewerage?.connectivityToTrunkSewers?.estimatedCost || 0,
                
                // Roads
                roadsInternalRoadsCCExisting: surveyData.additionalInfrastructure.roads?.internalRoadsCC?.existing || 0,
                roadsInternalRoadsCCAdditional: surveyData.additionalInfrastructure.roads?.internalRoadsCC?.additionalRequirement || 0,
                roadsInternalRoadsCCCost: surveyData.additionalInfrastructure.roads?.internalRoadsCC?.estimatedCost || 0,
                
                roadsInternalRoadsBTExisting: surveyData.additionalInfrastructure.roads?.internalRoadsBT?.existing || 0,
                roadsInternalRoadsBTAdditional: surveyData.additionalInfrastructure.roads?.internalRoadsBT?.additionalRequirement || 0,
                roadsInternalRoadsBTCost: surveyData.additionalInfrastructure.roads?.internalRoadsBT?.estimatedCost || 0,
                
                roadsInternalRoadsOthersExisting: surveyData.additionalInfrastructure.roads?.internalRoadsOthers?.existing || 0,
                roadsInternalRoadsOthersAdditional: surveyData.additionalInfrastructure.roads?.internalRoadsOthers?.additionalRequirement || 0,
                roadsInternalRoadsOthersCost: surveyData.additionalInfrastructure.roads?.internalRoadsOthers?.estimatedCost || 0,
                
                roadsApproachRoadsCCExisting: surveyData.additionalInfrastructure.roads?.approachRoadsCC?.existing || 0,
                roadsApproachRoadsCCAdditional: surveyData.additionalInfrastructure.roads?.approachRoadsCC?.additionalRequirement || 0,
                roadsApproachRoadsCCCost: surveyData.additionalInfrastructure.roads?.approachRoadsCC?.estimatedCost || 0,
                
                roadsApproachRoadsOthersExisting: surveyData.additionalInfrastructure.roads?.approachRoadsOthers?.existing || 0,
                roadsApproachRoadsOthersAdditional: surveyData.additionalInfrastructure.roads?.approachRoadsOthers?.additionalRequirement || 0,
                roadsApproachRoadsOthersCost: surveyData.additionalInfrastructure.roads?.approachRoadsOthers?.estimatedCost || 0,
                
                // Street Lighting
                streetLightingPolesExisting: surveyData.additionalInfrastructure.streetLighting?.poles?.existing || 0,
                streetLightingPolesAdditional: surveyData.additionalInfrastructure.streetLighting?.poles?.additionalRequirement || 0,
                streetLightingPolesCost: surveyData.additionalInfrastructure.streetLighting?.poles?.estimatedCost || 0,
                
                streetLightingLightsExisting: surveyData.additionalInfrastructure.streetLighting?.lights?.existing || 0,
                streetLightingLightsAdditional: surveyData.additionalInfrastructure.streetLighting?.lights?.additionalRequirement || 0,
                streetLightingLightsCost: surveyData.additionalInfrastructure.streetLighting?.lights?.estimatedCost || 0,
                
                // Sanitation
                sanitationIndividualToiletsExisting: surveyData.additionalInfrastructure.sanitation?.individualToilets?.existing || 0,
                sanitationIndividualToiletsAdditional: surveyData.additionalInfrastructure.sanitation?.individualToilets?.additionalRequirement || 0,
                sanitationIndividualToiletsCost: surveyData.additionalInfrastructure.sanitation?.individualToilets?.estimatedCost || 0,
                
                sanitationCommunityToiletsExisting: surveyData.additionalInfrastructure.sanitation?.communityToilets?.existing || 0,
                sanitationCommunityToiletsAdditional: surveyData.additionalInfrastructure.sanitation?.communityToilets?.additionalRequirement || 0,
                sanitationCommunityToiletsCost: surveyData.additionalInfrastructure.sanitation?.communityToilets?.estimatedCost || 0,
                
                sanitationSeatsCommunityToiletsExisting: surveyData.additionalInfrastructure.sanitation?.seatsInCommunityToilets?.existing || 0,
                sanitationSeatsCommunityToiletsAdditional: surveyData.additionalInfrastructure.sanitation?.seatsInCommunityToilets?.additionalRequirement || 0,
                sanitationSeatsCommunityToiletsCost: surveyData.additionalInfrastructure.sanitation?.seatsInCommunityToilets?.estimatedCost || 0,
                
                sanitationDumperBinsExisting: surveyData.additionalInfrastructure.sanitation?.dumperBins?.existing || 0,
                sanitationDumperBinsAdditional: surveyData.additionalInfrastructure.sanitation?.dumperBins?.additionalRequirement || 0,
                sanitationDumperBinsCost: surveyData.additionalInfrastructure.sanitation?.dumperBins?.estimatedCost || 0,
                
                // Community Facilities
                communityHallsExisting: surveyData.additionalInfrastructure.communityFacilities?.communityHalls?.existing || 0,
                communityHallsAdditional: surveyData.additionalInfrastructure.communityFacilities?.communityHalls?.additionalRequirement || 0,
                communityHallsCost: surveyData.additionalInfrastructure.communityFacilities?.communityHalls?.estimatedCost || 0,
                
                communityLivelihoodCentresExisting: surveyData.additionalInfrastructure.communityFacilities?.livelihoodCentres?.existing || 0,
                communityLivelihoodCentresAdditional: surveyData.additionalInfrastructure.communityFacilities?.livelihoodCentres?.additionalRequirement || 0,
                communityLivelihoodCentresCost: surveyData.additionalInfrastructure.communityFacilities?.livelihoodCentres?.estimatedCost || 0,
                
                communityAnganwadisExisting: surveyData.additionalInfrastructure.communityFacilities?.anganwadis?.existing || 0,
                communityAnganwadisAdditional: surveyData.additionalInfrastructure.communityFacilities?.anganwadis?.additionalRequirement || 0 ,
                communityAnganwadisCost: surveyData.additionalInfrastructure.communityFacilities?.anganwadis?.estimatedCost || 0,
                
                communityPrimarySchoolsExisting: surveyData.additionalInfrastructure.communityFacilities?.primarySchools?.existing || 0,
                communityPrimarySchoolsAdditional: surveyData.additionalInfrastructure.communityFacilities?.primarySchools?.additionalRequirement || 0,
                communityPrimarySchoolsCost: surveyData.additionalInfrastructure.communityFacilities?.primarySchools?.estimatedCost || 0,
                
                communityHealthCentresExisting: surveyData.additionalInfrastructure.communityFacilities?.healthCentres?.existing || 0,
                communityHealthCentresAdditional: surveyData.additionalInfrastructure.communityFacilities?.healthCentres?.additionalRequirement || 0,
                communityHealthCentresCost: surveyData.additionalInfrastructure.communityFacilities?.healthCentres?.estimatedCost || 0,
                
                communityOthersExisting: surveyData.additionalInfrastructure.communityFacilities?.others?.existing || 0,
                communityOthersAdditional: surveyData.additionalInfrastructure.communityFacilities?.others?.additionalRequirement || 0,
                communityOthersCost: surveyData.additionalInfrastructure.communityFacilities?.others?.estimatedCost || 0,

                // Standalone Infrastructure Requirements
                electricityExisting: surveyData.additionalInfrastructure?.standaloneInfrastructureRequirements?.electricity?.existing || 0,
                electricityAdditional: surveyData.additionalInfrastructure?.standaloneInfrastructureRequirements?.electricity?.additionalRequirement || 0,
                electricityCost: surveyData.additionalInfrastructure?.standaloneInfrastructureRequirements?.electricity?.estimatedCost || 0,
                healthcareExisting: surveyData.additionalInfrastructure?.standaloneInfrastructureRequirements?.healthCare?.existing || 0,
                healthcareAdditional: surveyData.additionalInfrastructure?.standaloneInfrastructureRequirements?.healthCare?.additionalRequirement || 0,
                healthcareCost: surveyData.additionalInfrastructure?.standaloneInfrastructureRequirements?.healthCare?.estimatedCost || 0,
                toiletsExisting: surveyData.additionalInfrastructure?.standaloneInfrastructureRequirements?.toilets?.existing || 0,
                toiletsAdditional: surveyData.additionalInfrastructure?.standaloneInfrastructureRequirements?.toilets?.additionalRequirement || 0,
                toiletsCost: surveyData.additionalInfrastructure?.standaloneInfrastructureRequirements?.toilets?.estimatedCost || 0,
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
                bplHouseholds: surveyData.cityTownSlumProfile.bplHouseholds || 0,
              }));
            }
            
            if (surveyData.surveyOperation) {
              setFormData(prev => ({
                ...prev,
                surveyorName: user?.name || surveyData.surveyOperation.surveyorName || "",
                surveyDate: surveyData.surveyOperation.surveyDate || "",
              }));
            } else {
              // For new surveys, populate surveyor name from user data
              setFormData(prev => ({
                ...prev,
                surveyorName: user?.name || "",
                surveyDate: new Date().toISOString().split('T')[0] // Set current date as default
              }));
            }

            // Also populate city/town code from general information if available
            if (surveyData.generalInformation) {
              setFormData(prev => ({
                ...prev,
                cityTownCode: surveyData.generalInformation.cityTownCode || "",
                cityTownNoHouseholds: surveyData.generalInformation.cityTownNoHouseholds || 0
              }));
            }

            // Ensure areaSqMtrs is also populated from cityTownSlumProfile if not already set
            if (surveyData.cityTownSlumProfile) {
              setFormData(prev => ({
                ...prev,
                areaSqMtrs: surveyData.cityTownSlumProfile.areaSqMtrs || prev.areaSqMtrs || 0
              }));
            }

          } else {
            showToast("Failed to load/create slum survey", "error");
          }
        } else {
          showToast("Failed to load assignment details", "error");
          router.push("/surveyor/dashboard");
        }
      } catch (error: unknown) {
        console.error("Error loading data:", error);
        showToast("Failed to load data", "error");
        router.push("/surveyor/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) loadData();
  }, [assignmentId, router, showToast, isEditMode, user?.name]);


  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof SlumSurveyForm] as unknown as Record<string, string | number | boolean> || {}),
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
    if (formData.cityTownNoHouseholds === undefined || formData.cityTownNoHouseholds === null || isNaN(formData.cityTownNoHouseholds) || formData.cityTownNoHouseholds < 0) {
      newErrors.push({ field: 'cityTownNoHouseholds', message: 'City/Town No. of Households is required' });
    }
    
    // Part B - City/Town Slum Profile
    if (!formData.ownershipLand) {
      newErrors.push({ field: 'ownershipLand', message: 'Ownership of Land is required' });
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
    if (formData.bplHouseholds=== undefined || formData.bplHouseholds=== null || isNaN(formData.bplHouseholds) || formData.bplHouseholds< 0) {
      newErrors.push({ field: 'bplHouseholds', message: 'No. of BPL Households is required' });
    }
    
    // Part C - Particulars of Survey Operation
    if (!formData.surveyDate) {
      newErrors.push({ field: 'surveyDate', message: 'Survey Date is required' });
    }
    
    // Part D - Basic Information on Slum
    if (formData.ageSlumYears === undefined || formData.ageSlumYears === null || isNaN(formData.ageSlumYears) || formData.ageSlumYears < 0) {
      newErrors.push({ field: 'ageSlumYears', message: 'Age of Slum (Years) is required' });
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
    
    // Part E - Land Status
    if (!formData.ownershipLandDetail) {
      newErrors.push({ field: 'ownershipLandDetail', message: 'Ownership of Land is required' });
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
    if (formData.landTenurePossessionCertificate === undefined || formData.landTenurePossessionCertificate === null || isNaN(formData.landTenurePossessionCertificate) || formData.landTenurePossessionCertificate < 0) {
      newErrors.push({ field: 'landTenurePossessionCertificate', message: 'Land Tenure With Possession Certificate is required' });
    }
    if (formData.landTenureEncroachedPrivate === undefined || formData.landTenureEncroachedPrivate === null || isNaN(formData.landTenureEncroachedPrivate) || formData.landTenureEncroachedPrivate < 0) {
      newErrors.push({ field: 'landTenureEncroachedPrivate', message: 'Land Tenure Encroached on Private Property is required' });
    }
    if (formData.landTenureEncroachedPublic === undefined || formData.landTenureEncroachedPublic === null || isNaN(formData.landTenureEncroachedPublic) || formData.landTenureEncroachedPublic < 0) {
      newErrors.push({ field: 'landTenureEncroachedPublic', message: 'Land Tenure Encroached on Public Property is required' });
    }
    if (formData.landTenureOnRent === undefined || formData.landTenureOnRent === null || isNaN(formData.landTenureOnRent) || formData.landTenureOnRent < 0) {
      newErrors.push({ field: 'landTenureOnRent', message: 'Land Tenure On Rent is required' });
    }


    
    // Additional Infrastructure Requirements
    // Water Supply
    if (!formData.waterSupplyPipelinesExisting) {
      newErrors.push({ field: 'waterSupplyPipelinesExisting', message: 'Water Supply Pipelines - Existing is required' });
    }
    if (!formData.waterSupplyPipelinesAdditional) {
      newErrors.push({ field: 'waterSupplyPipelinesAdditional', message: 'Water Supply Pipelines - Additional Requirement is required' });
    }
    if ((formData.waterSupplyPipelinesAdditional || 0) > 0 && (formData.waterSupplyPipelinesCost === undefined || formData.waterSupplyPipelinesCost === null || isNaN(formData.waterSupplyPipelinesCost) || (formData.waterSupplyPipelinesCost || 0) < 0)) {
      newErrors.push({ field: 'waterSupplyPipelinesCost', message: 'Water Supply Pipelines - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.waterSupplyIndividualTapsExisting) {
      newErrors.push({ field: 'waterSupplyIndividualTapsExisting', message: 'Water Supply Individual Taps - Existing is required' });
    }
    if (!formData.waterSupplyIndividualTapsAdditional) {
      newErrors.push({ field: 'waterSupplyIndividualTapsAdditional', message: 'Water Supply Individual Taps - Additional Requirement is required' });
    }
    if ((formData.waterSupplyIndividualTapsAdditional || 0) > 0 && (formData.waterSupplyIndividualTapsCost === undefined || formData.waterSupplyIndividualTapsCost === null || isNaN(formData.waterSupplyIndividualTapsCost) || (formData.waterSupplyIndividualTapsCost || 0) < 0)) {
      newErrors.push({ field: 'waterSupplyIndividualTapsCost', message: 'Water Supply Individual Taps - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.waterSupplyBorewellsExisting) {
      newErrors.push({ field: 'waterSupplyBorewellsExisting', message: 'Water Supply Borewells - Existing is required' });
    }
    if (!formData.waterSupplyBorewellsAdditional) {
      newErrors.push({ field: 'waterSupplyBorewellsAdditional', message: 'Water Supply Borewells - Additional Requirement is required' });
    }
    if ((formData.waterSupplyBorewellsAdditional || 0) > 0 && (formData.waterSupplyBorewellsCost === undefined || formData.waterSupplyBorewellsCost === null || isNaN(formData.waterSupplyBorewellsCost) || (formData.waterSupplyBorewellsCost || 0) < 0)) {
      newErrors.push({ field: 'waterSupplyBorewellsCost', message: 'Water Supply Borewells - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.waterSupplyConnectivityTrunkLinesExisting) {
      newErrors.push({ field: 'waterSupplyConnectivityTrunkLinesExisting', message: 'Water Supply Connectivity to Trunk Lines - Existing is required' });
    }
    if (!formData.waterSupplyConnectivityTrunkLinesAdditional) {
      newErrors.push({ field: 'waterSupplyConnectivityTrunkLinesAdditional', message: 'Water Supply Connectivity to Trunk Lines - Additional Requirement is required' });
    }
    if ((formData.waterSupplyConnectivityTrunkLinesAdditional || 0) > 0 && (formData.waterSupplyConnectivityTrunkLinesCost === undefined || formData.waterSupplyConnectivityTrunkLinesCost === null || isNaN(formData.waterSupplyConnectivityTrunkLinesCost) || (formData.waterSupplyConnectivityTrunkLinesCost || 0) < 0)) {
      newErrors.push({ field: 'waterSupplyConnectivityTrunkLinesCost', message: 'Water Supply Connectivity to Trunk Lines - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Drainage/Sewerage
    if (!formData.drainageStormwaterDrainageExisting) {
      newErrors.push({ field: 'drainageStormwaterDrainageExisting', message: 'Drainage Stormwater Drainage - Existing is required' });
    }
    if (!formData.drainageStormwaterDrainageAdditional) {
      newErrors.push({ field: 'drainageStormwaterDrainageAdditional', message: 'Drainage Stormwater Drainage - Additional Requirement is required' });
    }
    if ((formData.drainageStormwaterDrainageAdditional || 0) > 0 && (formData.drainageStormwaterDrainageCost === undefined || formData.drainageStormwaterDrainageCost === null || isNaN(formData.drainageStormwaterDrainageCost) || (formData.drainageStormwaterDrainageCost || 0) < 0)) {
      newErrors.push({ field: 'drainageStormwaterDrainageCost', message: 'Drainage Stormwater Drainage - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.drainageConnectivityMainDrainsExisting) {
      newErrors.push({ field: 'drainageConnectivityMainDrainsExisting', message: 'Drainage Connectivity to Main Drains - Existing is required' });
    }
    if (!formData.drainageConnectivityMainDrainsAdditional) {
      newErrors.push({ field: 'drainageConnectivityMainDrainsAdditional', message: 'Drainage Connectivity to Main Drains - Additional Requirement is required' });
    }
    if ((formData.drainageConnectivityMainDrainsAdditional || 0) > 0 && (formData.drainageConnectivityMainDrainsCost === undefined || formData.drainageConnectivityMainDrainsCost === null || isNaN(formData.drainageConnectivityMainDrainsCost) || (formData.drainageConnectivityMainDrainsCost || 0) < 0)) {
      newErrors.push({ field: 'drainageConnectivityMainDrainsCost', message: 'Drainage Connectivity to Main Drains - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.drainageSewerLinesExisting) {
      newErrors.push({ field: 'drainageSewerLinesExisting', message: 'Drainage Sewer Lines - Existing is required' });
    }
    if (!(formData.drainageSewerLinesAdditional || 0)) {
      newErrors.push({ field: 'drainageSewerLinesAdditional', message: 'Drainage Sewer Lines - Additional Requirement is required' });
    }
    if ((formData.drainageSewerLinesAdditional || 0) > 0 && (formData.drainageSewerLinesCost === undefined || formData.drainageSewerLinesCost === null || isNaN(formData.drainageSewerLinesCost) || (formData.drainageSewerLinesCost || 0) < 0)) {
      newErrors.push({ field: 'drainageSewerLinesCost', message: 'Drainage Sewer Lines - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.drainageConnectivityTrunkSewersExisting) {
      newErrors.push({ field: 'drainageConnectivityTrunkSewersExisting', message: 'Drainage Connectivity to Trunk Sewers - Existing is required' });
    }
    if (!(formData.drainageConnectivityTrunkSewersAdditional || 0)) {
      newErrors.push({ field: 'drainageConnectivityTrunkSewersAdditional', message: 'Drainage Connectivity to Trunk Sewers - Additional Requirement is required' });
    }
    if ((formData.drainageConnectivityTrunkSewersAdditional || 0) > 0 && (formData.drainageConnectivityTrunkSewersCost === undefined || formData.drainageConnectivityTrunkSewersCost === null || isNaN(formData.drainageConnectivityTrunkSewersCost) || (formData.drainageConnectivityTrunkSewersCost || 0) < 0)) {
      newErrors.push({ field: 'drainageConnectivityTrunkSewersCost', message: 'Drainage Connectivity to Trunk Sewers - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Roads
    if (!formData.roadsInternalRoadsCCExisting) {
      newErrors.push({ field: 'roadsInternalRoadsCCExisting', message: 'Roads Internal Roads CC - Existing is required' });
    }
    if (!(formData.roadsInternalRoadsCCAdditional || 0)) {
      newErrors.push({ field: 'roadsInternalRoadsCCAdditional', message: 'Roads Internal Roads CC - Additional Requirement is required' });
    }
    if ((formData.roadsInternalRoadsCCAdditional || 0) > 0 && (formData.roadsInternalRoadsCCCost === undefined || formData.roadsInternalRoadsCCCost === null || isNaN(formData.roadsInternalRoadsCCCost) || (formData.roadsInternalRoadsCCCost || 0) < 0)) {
      newErrors.push({ field: 'roadsInternalRoadsCCCost', message: 'Roads Internal Roads CC - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.roadsInternalRoadsBTExisting) {
      newErrors.push({ field: 'roadsInternalRoadsBTExisting', message: 'Roads Internal Roads BT - Existing is required' });
    }
    if (!(formData.roadsInternalRoadsBTAdditional || 0)) {
      newErrors.push({ field: 'roadsInternalRoadsBTAdditional', message: 'Roads Internal Roads BT - Additional Requirement is required' });
    }
    if ((formData.roadsInternalRoadsBTAdditional || 0) > 0 && (formData.roadsInternalRoadsBTCost === undefined || formData.roadsInternalRoadsBTCost === null || isNaN(formData.roadsInternalRoadsBTCost) || (formData.roadsInternalRoadsBTCost || 0) < 0)) {
      newErrors.push({ field: 'roadsInternalRoadsBTCost', message: 'Roads Internal Roads BT - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.roadsInternalRoadsOthersExisting) {
      newErrors.push({ field: 'roadsInternalRoadsOthersExisting', message: 'Roads Internal Roads Others - Existing is required' });
    }
    if (!(formData.roadsInternalRoadsOthersAdditional || 0)) {
      newErrors.push({ field: 'roadsInternalRoadsOthersAdditional', message: 'Roads Internal Roads Others - Additional Requirement is required' });
    }
    if ((formData.roadsInternalRoadsOthersAdditional || 0) > 0 && (formData.roadsInternalRoadsOthersCost === undefined || formData.roadsInternalRoadsOthersCost === null || isNaN(formData.roadsInternalRoadsOthersCost) || (formData.roadsInternalRoadsOthersCost || 0) < 0)) {
      newErrors.push({ field: 'roadsInternalRoadsOthersCost', message: 'Roads Internal Roads Others - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.roadsApproachRoadsCCExisting) {
      newErrors.push({ field: 'roadsApproachRoadsCCExisting', message: 'Roads Approach Roads CC - Existing is required' });
    }
    if (!(formData.roadsApproachRoadsCCAdditional || 0)) {
      newErrors.push({ field: 'roadsApproachRoadsCCAdditional', message: 'Roads Approach Roads CC - Additional Requirement is required' });
    }
    if ((formData.roadsApproachRoadsCCAdditional || 0) > 0 && (formData.roadsApproachRoadsCCCost === undefined || formData.roadsApproachRoadsCCCost === null || isNaN(formData.roadsApproachRoadsCCCost) || (formData.roadsApproachRoadsCCCost || 0) < 0)) {
      newErrors.push({ field: 'roadsApproachRoadsCCCost', message: 'Roads Approach Roads CC - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.roadsApproachRoadsOthersExisting) {
      newErrors.push({ field: 'roadsApproachRoadsOthersExisting', message: 'Roads Approach Roads Others - Existing is required' });
    }
    if (!(formData.roadsApproachRoadsOthersAdditional || 0)) {
      newErrors.push({ field: 'roadsApproachRoadsOthersAdditional', message: 'Roads Approach Roads Others - Additional Requirement is required' });
    }
    if ((formData.roadsApproachRoadsOthersAdditional || 0) > 0 && (formData.roadsApproachRoadsOthersCost === undefined || formData.roadsApproachRoadsOthersCost === null || isNaN(formData.roadsApproachRoadsOthersCost) || (formData.roadsApproachRoadsOthersCost || 0) < 0)) {
      newErrors.push({ field: 'roadsApproachRoadsOthersCost', message: 'Roads Approach Roads Others - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Street Lighting
    if (!formData.streetLightingPolesExisting) {
      newErrors.push({ field: 'streetLightingPolesExisting', message: 'Street Lighting Poles - Existing is required' });
    }
    if (!(formData.streetLightingPolesAdditional || 0)) {
      newErrors.push({ field: 'streetLightingPolesAdditional', message: 'Street Lighting Poles - Additional Requirement is required' });
    }
    if ((formData.streetLightingPolesAdditional || 0) > 0 && (formData.streetLightingPolesCost === undefined || formData.streetLightingPolesCost === null || isNaN(formData.streetLightingPolesCost) || (formData.streetLightingPolesCost || 0) < 0)) {
      newErrors.push({ field: 'streetLightingPolesCost', message: 'Street Lighting Poles - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.streetLightingLightsExisting) {
      newErrors.push({ field: 'streetLightingLightsExisting', message: 'Street Lighting Lights - Existing is required' });
    }
    if (!(formData.streetLightingLightsAdditional || 0)) {
      newErrors.push({ field: 'streetLightingLightsAdditional', message: 'Street Lighting Lights - Additional Requirement is required' });
    }
    if ((formData.streetLightingLightsAdditional || 0) > 0 && (formData.streetLightingLightsCost === undefined || formData.streetLightingLightsCost === null || isNaN(formData.streetLightingLightsCost) || (formData.streetLightingLightsCost || 0) < 0)) {
      newErrors.push({ field: 'streetLightingLightsCost', message: 'Street Lighting Lights - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Sanitation
    if (!formData.sanitationIndividualToiletsExisting) {
      newErrors.push({ field: 'sanitationIndividualToiletsExisting', message: 'Sanitation Individual Toilets - Existing is required' });
    }
    if (!(formData.sanitationIndividualToiletsAdditional || 0)) {
      newErrors.push({ field: 'sanitationIndividualToiletsAdditional', message: 'Sanitation Individual Toilets - Additional Requirement is required' });
    }
    if ((formData.sanitationIndividualToiletsAdditional || 0) > 0 && (formData.sanitationIndividualToiletsCost === undefined || formData.sanitationIndividualToiletsCost === null || isNaN(formData.sanitationIndividualToiletsCost) || (formData.sanitationIndividualToiletsCost || 0) < 0)) {
      newErrors.push({ field: 'sanitationIndividualToiletsCost', message: 'Sanitation Individual Toilets - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.sanitationCommunityToiletsExisting) {
      newErrors.push({ field: 'sanitationCommunityToiletsExisting', message: 'Sanitation Community Toilets - Existing is required' });
    }
    if (!formData.sanitationCommunityToiletsAdditional) {
      newErrors.push({ field: 'sanitationCommunityToiletsAdditional', message: 'Sanitation Community Toilets - Additional Requirement is required' });
    }
    if ((formData.sanitationCommunityToiletsAdditional || 0) > 0 && (formData.sanitationCommunityToiletsCost === undefined || formData.sanitationCommunityToiletsCost === null || isNaN(formData.sanitationCommunityToiletsCost) || (formData.sanitationCommunityToiletsCost || 0) < 0)) {
      newErrors.push({ field: 'sanitationCommunityToiletsCost', message: 'Sanitation Community Toilets - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.sanitationSeatsCommunityToiletsExisting) {
      newErrors.push({ field: 'sanitationSeatsCommunityToiletsExisting', message: 'Sanitation Seats in Community Toilets - Existing is required' });
    }
    if (!formData.sanitationSeatsCommunityToiletsAdditional) {
      newErrors.push({ field: 'sanitationSeatsCommunityToiletsAdditional', message: 'Sanitation Seats in Community Toilets - Additional Requirement is required' });
    }
    if ((formData.sanitationSeatsCommunityToiletsAdditional || 0) > 0 && (formData.sanitationSeatsCommunityToiletsCost === undefined || formData.sanitationSeatsCommunityToiletsCost === null || isNaN(formData.sanitationSeatsCommunityToiletsCost) || (formData.sanitationSeatsCommunityToiletsCost || 0) < 0)) {
      newErrors.push({ field: 'sanitationSeatsCommunityToiletsCost', message: 'Sanitation Seats in Community Toilets - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.sanitationDumperBinsExisting) {
      newErrors.push({ field: 'sanitationDumperBinsExisting', message: 'Sanitation Dumper Bins - Existing is required' });
    }
    if (!formData.sanitationDumperBinsAdditional) {
      newErrors.push({ field: 'sanitationDumperBinsAdditional', message: 'Sanitation Dumper Bins - Additional Requirement is required' });
    }
    if ((formData.sanitationDumperBinsAdditional || 0) > 0 && (formData.sanitationDumperBinsCost === undefined || formData.sanitationDumperBinsCost === null || isNaN(formData.sanitationDumperBinsCost) || (formData.sanitationDumperBinsCost || 0) < 0)) {
      newErrors.push({ field: 'sanitationDumperBinsCost', message: 'Sanitation Dumper Bins - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    // Community Facilities
    if (!formData.communityHallsExisting) {
      newErrors.push({ field: 'communityHallsExisting', message: 'Community Halls - Existing is required' });
    }
    if (!formData.communityHallsAdditional) {
      newErrors.push({ field: 'communityHallsAdditional', message: 'Community Halls - Additional Requirement is required' });
    }
    if ((formData.communityHallsAdditional || 0) > 0 && (formData.communityHallsCost === undefined || formData.communityHallsCost === null || isNaN(formData.communityHallsCost) || (formData.communityHallsCost || 0) < 0)) {
      newErrors.push({ field: 'communityHallsCost', message: 'Community Halls - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityLivelihoodCentresExisting) {
      newErrors.push({ field: 'communityLivelihoodCentresExisting', message: 'Community Livelihood Centres - Existing is required' });
    }
    if (!formData.communityLivelihoodCentresAdditional) {
      newErrors.push({ field: 'communityLivelihoodCentresAdditional', message: 'Community Livelihood Centres - Additional Requirement is required' });
    }
    if ((formData.communityLivelihoodCentresAdditional || 0) > 0 && (formData.communityLivelihoodCentresCost === undefined || formData.communityLivelihoodCentresCost === null || isNaN(formData.communityLivelihoodCentresCost) || (formData.communityLivelihoodCentresCost || 0) < 0)) {
      newErrors.push({ field: 'communityLivelihoodCentresCost', message: 'Community Livelihood Centres - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityAnganwadisExisting) {
      newErrors.push({ field: 'communityAnganwadisExisting', message: 'Community Anganwadis - Existing is required' });
    }
    if (!formData.communityAnganwadisAdditional) {
      newErrors.push({ field: 'communityAnganwadisAdditional', message: 'Community Anganwadis - Additional Requirement is required' });
    }
    if ((formData.communityAnganwadisAdditional || 0) > 0 && (formData.communityAnganwadisCost === undefined || formData.communityAnganwadisCost === null || isNaN(formData.communityAnganwadisCost) || (formData.communityAnganwadisCost || 0) < 0)) {
      newErrors.push({ field: 'communityAnganwadisCost', message: 'Community Anganwadis - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityPrimarySchoolsExisting) {
      newErrors.push({ field: 'communityPrimarySchoolsExisting', message: 'Community Primary Schools - Existing is required' });
    }
    if (!formData.communityPrimarySchoolsAdditional) {
      newErrors.push({ field: 'communityPrimarySchoolsAdditional', message: 'Community Primary Schools - Additional Requirement is required' });
    }
    if ((formData.communityPrimarySchoolsAdditional || 0) > 0 && (formData.communityPrimarySchoolsCost === undefined || formData.communityPrimarySchoolsCost === null || isNaN(formData.communityPrimarySchoolsCost) || (formData.communityPrimarySchoolsCost || 0) < 0)) {
      newErrors.push({ field: 'communityPrimarySchoolsCost', message: 'Community Primary Schools - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityHealthCentresExisting) {
      newErrors.push({ field: 'communityHealthCentresExisting', message: 'Community Health Centres - Existing is required' });
    }
    if (!formData.communityHealthCentresAdditional) {
      newErrors.push({ field: 'communityHealthCentresAdditional', message: 'Community Health Centres - Additional Requirement is required' });
    }
    if ((formData.communityHealthCentresAdditional || 0) > 0 && (formData.communityHealthCentresCost === undefined || formData.communityHealthCentresCost === null || isNaN(formData.communityHealthCentresCost) || (formData.communityHealthCentresCost || 0) < 0)) {
      newErrors.push({ field: 'communityHealthCentresCost', message: 'Community Health Centres - Estimated Cost is required when Additional Requirement is Yes' });
    }
    
    if (!formData.communityOthersExisting) {
      newErrors.push({ field: 'communityOthersExisting', message: 'Community Others - Existing is required' });
    }
    if (!formData.communityOthersAdditional) {
      newErrors.push({ field: 'communityOthersAdditional', message: 'Community Others - Additional Requirement is required' });
    }
    if ((formData.communityOthersAdditional || 0) > 0 && (formData.communityOthersCost === undefined || formData.communityOthersCost === null || isNaN(formData.communityOthersCost) || (formData.communityOthersCost || 0) < 0)) {
      newErrors.push({ field: 'communityOthersCost', message: 'Community Others - Estimated Cost is required when Additional Requirement is Yes' });
    }
    if (!formData.electricityExisting) {
      newErrors.push({ field: 'electricityExisting', message: 'Electricity - Existing is required' });
    }
    if (!formData.electricityAdditional) {
      newErrors.push({ field: 'electricityAdditional', message: 'Electricity - Additional Requirement is required' });
    }
    if ((formData.electricityAdditional || 0) > 0 && (formData.electricityCost === undefined || formData.electricityCost === null || isNaN(formData.electricityCost) || (formData.electricityCost || 0) < 0)) {
      newErrors.push({ field: 'electricityCost', message: 'Electricity - Estimated Cost is required when Additional Requirement is Yes' });
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
          bplHouseholds: finalFormData.bplHouseholds || 0
        },
        
        // PART-C: III. PARTICULARS OF SURVEY OPERATION
        surveyOperation: {
          surveyorName: finalFormData.surveyorName || "",
          surveyDate: finalFormData.surveyDate || ""
        },
        
        // PART-D: I. BASIC INFORMATION ON SLUM
        basicInformation: {
          slumNameBasicInfo: finalFormData.slumNameBasicInfo || "",
          wardNumber: finalFormData.wardNumber || "",
          zoneNumber: finalFormData.zone || "",  // Note: frontend uses 'zone', backend uses 'zoneNumber'
          ageSlumYears: finalFormData.ageSlumYears || 0,
          locationCoreOrFringe: finalFormData.locationCoreOrFringe || "",
          typeAreaSurrounding: finalFormData.typeAreaSurrounding || "",
          physicalLocationSlum: finalFormData.physicalLocationSlum || ""
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
            Total: finalFormData.totalPopulationSlumTotal || 0,
            Minorities: finalFormData.totalPopulationSlumMinorities || 0
          },
          bplPopulation: {
            SC: finalFormData.bplPopulationSlumSC || 0,
            ST: finalFormData.bplPopulationSlumST || 0,
            OBC: finalFormData.bplPopulationSlumOBC || 0,
            Others: finalFormData.bplPopulationSlumOthers || 0,
            Total: finalFormData.bplPopulationSlumTotal || 0,
            Minorities: finalFormData.bplPopulationSlumMinorities || 0
          },
          numberOfHouseholds: {
            SC: finalFormData.noHouseholdsSlumSC || 0,
            ST: finalFormData.noHouseholdsSlumST || 0,
            OBC: finalFormData.noHouseholdsSlumOBC || 0,
            Others: finalFormData.noHouseholdsSlumOthers || 0,
            Total: finalFormData.noHouseholdsSlumTotal || 0,
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
        
        // SECTION 7: HOUSING STATUS
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
        
        // SECTION 8: ECONOMIC STATUS OF HOUSEHOLDS
        economicStatus: {
          lessThan500: finalFormData.economicStatus?.lessThan500 || 0,
          rs500to1000: finalFormData.economicStatus?.rs500to1000 || 0,
          rs1000to1500: finalFormData.economicStatus?.rs1000to1500 || 0,
          rs1500to2000: finalFormData.economicStatus?.rs1500to2000 || 0,
          rs2000to3000: finalFormData.economicStatus?.rs2000to3000 || 0,
          moreThan3000: finalFormData.economicStatus?.moreThan3000 || 0
        },
        
        // SECTION 9: EMPLOYMENT AND OCCUPATION STATUS
        employmentAndOccupation: {
          selfEmployed: finalFormData.occupationalStatus?.selfEmployed || 0,
          salaried: finalFormData.occupationalStatus?.salaried || 0,
          regularWage: finalFormData.occupationalStatus?.regularWage || 0,
          casualLabour: finalFormData.occupationalStatus?.casualLabour || 0,
          others: finalFormData.occupationalStatus?.others || 0
        },
        
        // SECTION 10: ACCESS TO PHYSICAL INFRASTRUCTURE
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
          frequencyOfGarbageDisposal: finalFormData.frequencyOfGarbageDisposal || "",
          arrangementForGarbageDisposal: finalFormData.arrangementForGarbageDisposal || "",
          frequencyOfClearanceOfOpenDrains: finalFormData.frequencyOfClearanceOfOpenDrains || "",
          approachRoadType: finalFormData.approachRoadType || "",
          distanceToNearestMotorableRoad: finalFormData.distanceToNearestMotorableRoad || "",
          internalRoadType: finalFormData.internalRoadType || "",
          streetLightAvailable: finalFormData.streetLightAvailable || ""
        },
        
        // SECTION 11: EDUCATION FACILITIES
        educationFacilities: {
          anganwadiUnderIcds: {
            option: finalFormData.anganwadiUnderIcds?.option || '',
            distance: finalFormData.anganwadiUnderIcds?.distance || null
          },
          municipalPreschool: {
            option: finalFormData.municipalPreschool?.option || '',
            distance: finalFormData.municipalPreschool?.distance || null
          },
          privatePreschool: {
            option: finalFormData.privatePreschool?.option || '',
            distance: finalFormData.privatePreschool?.distance || null
          },
          municipalPrimarySchool: {
            option: finalFormData.municipalPrimarySchool?.option || '',
            distance: finalFormData.municipalPrimarySchool?.distance || null
          },
          stateGovtPrimarySchool: {
            option: finalFormData.stateGovtPrimarySchool?.option || '',
            distance: finalFormData.stateGovtPrimarySchool?.distance || null
          },
          privatePrimarySchool: {
            option: finalFormData.privatePrimarySchool?.option || '',
            distance: finalFormData.privatePrimarySchool?.distance || null
          },
          municipalHighSchool: {
            option: finalFormData.municipalHighSchool?.option || '',
            distance: finalFormData.municipalHighSchool?.distance || null
          },
          stateGovtHighSchool: {
            option: finalFormData.stateGovtHighSchool?.option || '',
            distance: finalFormData.stateGovtHighSchool?.distance || null
          },
          privateHighSchool: {
            option: finalFormData.privateHighSchool?.option || '',
            distance: finalFormData.privateHighSchool?.distance || null
          },
          adultEducationCentre: {
            option: finalFormData.adultEducationCentre?.option || '',
            distance: finalFormData.adultEducationCentre?.distance || null
          },
          nonFormalEducationCentre: {
            option: finalFormData.nonFormalEducationCentre?.option || '',
            distance: finalFormData.nonFormalEducationCentre?.distance || null
          }
        },
        
        // SECTION 12: HEALTH FACILITIES
        healthFacilities: {
          urbanHealthPost: finalFormData.urbanHealthPost || "",
          primaryHealthCentre: finalFormData.primaryHealthCentre || "",
          governmentHospital: finalFormData.governmentHospital || "",
          maternityCentre: finalFormData.maternityCentre || "",
          privateClinic: finalFormData.privateClinic || "",
          rmp: finalFormData.rmp || "",
          ayurvedicDoctor: finalFormData.ayurvedicDoctor || ""
        },
        
        // SECTION 13: SOCIAL DEVELOPMENT/WELFARE
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
        
        // SECTION 14: ADDITIONAL INFRASTRUCTURE REQUIREMENTS
        additionalInfrastructure: {
          // Water Supply
          waterSupply: {
            pipelines: {
              existing: finalFormData.waterSupplyPipelinesExisting !== undefined ? Number(finalFormData.waterSupplyPipelinesExisting) : 0,
              additionalRequirement: finalFormData.waterSupplyPipelinesAdditional !== undefined ? Number(finalFormData.waterSupplyPipelinesAdditional) : 0,
              estimatedCost: finalFormData.waterSupplyPipelinesCost || 0
            },
            individualTaps: {
              existing: finalFormData.waterSupplyIndividualTapsExisting !== undefined ? Number(finalFormData.waterSupplyIndividualTapsExisting) : 0,
              additionalRequirement: finalFormData.waterSupplyIndividualTapsAdditional !== undefined ? Number(finalFormData.waterSupplyIndividualTapsAdditional) : 0,
              estimatedCost: finalFormData.waterSupplyIndividualTapsCost || 0
            },
            borewells: {
              existing: finalFormData.waterSupplyBorewellsExisting !== undefined ? Number(finalFormData.waterSupplyBorewellsExisting) : 0,
              additionalRequirement: finalFormData.waterSupplyBorewellsAdditional !== undefined ? Number(finalFormData.waterSupplyBorewellsAdditional) : 0,
              estimatedCost: finalFormData.waterSupplyBorewellsCost || 0
            },
            connectivityToTrunkLines: {
              existing: finalFormData.waterSupplyConnectivityTrunkLinesExisting !== undefined ? Number(finalFormData.waterSupplyConnectivityTrunkLinesExisting) : 0,
              additionalRequirement: finalFormData.waterSupplyConnectivityTrunkLinesAdditional !== undefined ? Number(finalFormData.waterSupplyConnectivityTrunkLinesAdditional) : 0,
              estimatedCost: finalFormData.waterSupplyConnectivityTrunkLinesCost || 0
            }
          },
          // Drainage/Sewerage
          drainageSewerage: {
            stormwaterDrainage: {
              existing: finalFormData.drainageStormwaterDrainageExisting !== undefined ? Number(finalFormData.drainageStormwaterDrainageExisting) : 0,
              additionalRequirement: finalFormData.drainageStormwaterDrainageAdditional !== undefined ? Number(finalFormData.drainageStormwaterDrainageAdditional) : 0,
              estimatedCost: finalFormData.drainageStormwaterDrainageCost || 0
            },
            connectivityToMainDrains: {
              existing: finalFormData.drainageConnectivityMainDrainsExisting !== undefined ? Number(finalFormData.drainageConnectivityMainDrainsExisting) : 0,
              additionalRequirement: finalFormData.drainageConnectivityMainDrainsAdditional !== undefined ? Number(finalFormData.drainageConnectivityMainDrainsAdditional) : 0,
              estimatedCost: finalFormData.drainageConnectivityMainDrainsCost || 0
            },
            sewerLines: {
              existing: finalFormData.drainageSewerLinesExisting !== undefined ? Number(finalFormData.drainageSewerLinesExisting) : 0,
              additionalRequirement: finalFormData.drainageSewerLinesAdditional !== undefined ? Number(finalFormData.drainageSewerLinesAdditional) : 0,
              estimatedCost: finalFormData.drainageSewerLinesCost || 0
            },
            connectivityToTrunkSewers: {
              existing: finalFormData.drainageConnectivityTrunkSewersExisting !== undefined ? Number(finalFormData.drainageConnectivityTrunkSewersExisting) : 0,
              additionalRequirement: finalFormData.drainageConnectivityTrunkSewersAdditional !== undefined ? Number(finalFormData.drainageConnectivityTrunkSewersAdditional) : 0,
              estimatedCost: finalFormData.drainageConnectivityTrunkSewersCost || 0
            }
          },
          // Roads
          roads: {
            internalRoadsCC: {
              existing: finalFormData.roadsInternalRoadsCCExisting !== undefined ? Number(finalFormData.roadsInternalRoadsCCExisting) : 0,
              additionalRequirement: finalFormData.roadsInternalRoadsCCAdditional !== undefined ? Number(finalFormData.roadsInternalRoadsCCAdditional) : 0,
              estimatedCost: finalFormData.roadsInternalRoadsCCCost || 0
            },
            internalRoadsBT: {
              existing: finalFormData.roadsInternalRoadsBTExisting !== undefined ? Number(finalFormData.roadsInternalRoadsBTExisting) : 0,
              additionalRequirement: finalFormData.roadsInternalRoadsBTAdditional !== undefined ? Number(finalFormData.roadsInternalRoadsBTAdditional) : 0,
              estimatedCost: finalFormData.roadsInternalRoadsBTCost || 0
            },
            internalRoadsOthers: {
              existing: finalFormData.roadsInternalRoadsOthersExisting !== undefined ? Number(finalFormData.roadsInternalRoadsOthersExisting) : 0,
              additionalRequirement: finalFormData.roadsInternalRoadsOthersAdditional !== undefined ? Number(finalFormData.roadsInternalRoadsOthersAdditional) : 0,
              estimatedCost: finalFormData.roadsInternalRoadsOthersCost || 0
            },
            approachRoadsCC: {
              existing: finalFormData.roadsApproachRoadsCCExisting !== undefined ? Number(finalFormData.roadsApproachRoadsCCExisting) : 0,
              additionalRequirement: finalFormData.roadsApproachRoadsCCAdditional !== undefined ? Number(finalFormData.roadsApproachRoadsCCAdditional) : 0,
              estimatedCost: finalFormData.roadsApproachRoadsCCCost || 0
            },
            approachRoadsOthers: {
              existing: finalFormData.roadsApproachRoadsOthersExisting !== undefined ? Number(finalFormData.roadsApproachRoadsOthersExisting) : 0,
              additionalRequirement: finalFormData.roadsApproachRoadsOthersAdditional !== undefined ? Number(finalFormData.roadsApproachRoadsOthersAdditional) : 0,
              estimatedCost: finalFormData.roadsApproachRoadsOthersCost || 0
            }
          },
          // Street Lighting
          streetLighting: {
            poles: {
              existing: finalFormData.streetLightingPolesExisting !== undefined ? Number(finalFormData.streetLightingPolesExisting) : 0,
              additionalRequirement: finalFormData.streetLightingPolesAdditional !== undefined ? Number(finalFormData.streetLightingPolesAdditional) : 0,
              estimatedCost: finalFormData.streetLightingPolesCost || 0
            },
            lights: {
              existing: finalFormData.streetLightingLightsExisting !== undefined ? Number(finalFormData.streetLightingLightsExisting) : 0,
              additionalRequirement: finalFormData.streetLightingLightsAdditional !== undefined ? Number(finalFormData.streetLightingLightsAdditional) : 0,
              estimatedCost: finalFormData.streetLightingLightsCost || 0
            }
          },
          // Sanitation
          sanitation: {
            individualToilets: {
              existing: finalFormData.sanitationIndividualToiletsExisting !== undefined ? Number(finalFormData.sanitationIndividualToiletsExisting) : 0,
              additionalRequirement: finalFormData.sanitationIndividualToiletsAdditional !== undefined ? Number(finalFormData.sanitationIndividualToiletsAdditional) : 0,
              estimatedCost: finalFormData.sanitationIndividualToiletsCost || 0
            },
            communityToilets: {
              existing: finalFormData.sanitationCommunityToiletsExisting !== undefined ? Number(finalFormData.sanitationCommunityToiletsExisting) : 0,
              additionalRequirement: finalFormData.sanitationCommunityToiletsAdditional !== undefined ? Number(finalFormData.sanitationCommunityToiletsAdditional) : 0,
              estimatedCost: finalFormData.sanitationCommunityToiletsCost || 0
            },
            seatsInCommunityToilets: {
              existing: finalFormData.sanitationSeatsCommunityToiletsExisting !== undefined ? Number(finalFormData.sanitationSeatsCommunityToiletsExisting) : 0,
              additionalRequirement: finalFormData.sanitationSeatsCommunityToiletsAdditional !== undefined ? Number(finalFormData.sanitationSeatsCommunityToiletsAdditional) : 0,
              estimatedCost: finalFormData.sanitationSeatsCommunityToiletsCost || 0
            },
            dumperBins: {
              existing: finalFormData.sanitationDumperBinsExisting !== undefined ? Number(finalFormData.sanitationDumperBinsExisting) : 0,
              additionalRequirement: finalFormData.sanitationDumperBinsAdditional !== undefined ? Number(finalFormData.sanitationDumperBinsAdditional) : 0,
              estimatedCost: finalFormData.sanitationDumperBinsCost || 0
            }
          },
          // Community Facilities
          communityFacilities: {
            communityHalls: {
              existing: finalFormData.communityHallsExisting !== undefined ? Number(finalFormData.communityHallsExisting) : 0,
              additionalRequirement: finalFormData.communityHallsAdditional !== undefined ? Number(finalFormData.communityHallsAdditional) : 0,
              estimatedCost: finalFormData.communityHallsCost || 0
            },
            livelihoodCentres: {
              existing: finalFormData.communityLivelihoodCentresExisting !== undefined ? Number(finalFormData.communityLivelihoodCentresExisting) : 0,
              additionalRequirement: finalFormData.communityLivelihoodCentresAdditional !== undefined ? Number(finalFormData.communityLivelihoodCentresAdditional) : 0,
              estimatedCost: finalFormData.communityLivelihoodCentresCost || 0
            },
            anganwadis: {
              existing: finalFormData.communityAnganwadisExisting !== undefined ? Number(finalFormData.communityAnganwadisExisting) : 0,
              additionalRequirement: finalFormData.communityAnganwadisAdditional !== undefined ? Number(finalFormData.communityAnganwadisAdditional) : 0,
              estimatedCost: finalFormData.communityAnganwadisCost || 0
            },
            primarySchools: {
              existing: finalFormData.communityPrimarySchoolsExisting !== undefined ? Number(finalFormData.communityPrimarySchoolsExisting) : 0,
              additionalRequirement: finalFormData.communityPrimarySchoolsAdditional !== undefined ? Number(finalFormData.communityPrimarySchoolsAdditional) : 0,
              estimatedCost: finalFormData.communityPrimarySchoolsCost || 0
            },
            healthCentres: {
              existing: finalFormData.communityHealthCentresExisting !== undefined ? Number(finalFormData.communityHealthCentresExisting) : 0,
              additionalRequirement: finalFormData.communityHealthCentresAdditional !== undefined ? Number(finalFormData.communityHealthCentresAdditional) : 0,
              estimatedCost: finalFormData.communityHealthCentresCost || 0
            },
            others: {
              existing: finalFormData.communityOthersExisting !== undefined ? Number(finalFormData.communityOthersExisting) : 0,
              additionalRequirement: finalFormData.communityOthersAdditional !== undefined ? Number(finalFormData.communityOthersAdditional) : 0,
              estimatedCost: finalFormData.communityOthersCost || 0
            }
          },
          
          // Standalone Infrastructure Requirements
          standaloneInfrastructureRequirements: {
            electricity: {
              existing: finalFormData.electricityExisting || 0,
              additionalRequirement: finalFormData.electricityAdditional || 0,
              estimatedCost: finalFormData.electricityCost || 0
            },
            healthCare: {
              existing: finalFormData.healthcareExisting || 0,
              additionalRequirement: finalFormData.healthcareAdditional || 0,
              estimatedCost: finalFormData.healthcareCost || 0
            },
            toilets: {
              existing: finalFormData.toiletsExisting || 0,
              additionalRequirement: finalFormData.toiletsAdditional || 0,
              estimatedCost: finalFormData.toiletsCost || 0
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
            data.ulbCode = formData.ulbCode;
            data.ulbName = formData.ulbName;
            data.cityTownCode = formData.cityTownCode;
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
            data.bplHouseholds = formData.bplHouseholds;
            break;
          case 'surveyOperation':
            data.surveyorName = formData.surveyorName;
            data.surveyDate = formData.surveyDate;
            break;
          case 'basicInformation':
            data.slumNameBasicInfo = formData.slumNameBasicInfo;
            data.wardNumber = formData.wardNumber;
            data.wardName = formData.wardName;
            data.zoneNumber = formData.zone;  // Note: frontend uses 'zone', backend uses 'zoneNumber'
            data.ageSlumYears = formData.ageSlumYears;
            data.locationCoreOrFringe = formData.locationCoreOrFringe;
            data.typeAreaSurrounding = formData.typeAreaSurrounding;
            data.physicalLocationSlum = formData.physicalLocationSlum;
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
              Total: formData.totalPopulationSlumTotal || 0,
              Minorities: formData.totalPopulationSlumMinorities || 0
            };
            data.bplPopulation = {
              SC: formData.bplPopulationSlumSC || 0,
              ST: formData.bplPopulationSlumST || 0,
              OBC: formData.bplPopulationSlumOBC || 0,
              Others: formData.bplPopulationSlumOthers || 0,
              Total: formData.bplPopulationSlumTotal || 0,
              Minorities: formData.bplPopulationSlumMinorities || 0
            };
            data.numberOfHouseholds = {
              SC: formData.noHouseholdsSlumSC || 0,
              ST: formData.noHouseholdsSlumST || 0,
              OBC: formData.noHouseholdsSlumOBC || 0,
              Others: formData.noHouseholdsSlumOthers || 0,
              Total: formData.noHouseholdsSlumTotal || 0,
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
            data.dwellingUnitsPucca = formData.dwellingUnitsPucca || 0;
            data.dwellingUnitsSemiPucca = formData.dwellingUnitsSemiPucca || 0;
            data.dwellingUnitsKatcha = formData.dwellingUnitsKatcha || 0;
            data.dwellingUnitsTotal = formData.dwellingUnitsTotal || 0;
            data.dwellingUnitsWithElectricityPucca = formData.dwellingUnitsWithElectricityPucca || 0;
            data.dwellingUnitsWithElectricitySemiPucca = formData.dwellingUnitsWithElectricitySemiPucca || 0;
            data.dwellingUnitsWithElectricityKatcha = formData.dwellingUnitsWithElectricityKatcha || 0;
            data.dwellingUnitsWithElectricityTotal = formData.dwellingUnitsWithElectricityTotal || 0;
            data.landTenureWithPatta = formData.landTenureWithPatta || 0;
            data.landTenurePossessionCertificate = formData.landTenurePossessionCertificate || 0;
            data.landTenureEncroachedPrivate = formData.landTenureEncroachedPrivate || 0;
            data.landTenureEncroachedPublic = formData.landTenureEncroachedPublic || 0;
            data.landTenureOnRent = formData.landTenureOnRent || 0;
            data.landTenureOther = formData.landTenureOther || 0;
            data.landTenureTotal = formData.landTenureTotal || 0;
            break;
          case 'economicStatus':
            data.lessThan500 = formData.economicStatus?.lessThan500 || 0;
            data.rs500to1000 = formData.economicStatus?.rs500to1000 || 0;
            data.rs1000to1500 = formData.economicStatus?.rs1000to1500 || 0;
            data.rs1500to2000 = formData.economicStatus?.rs1500to2000 || 0;
            data.rs2000to3000 = formData.economicStatus?.rs2000to3000 || 0;
            data.moreThan3000 = formData.economicStatus?.moreThan3000 || 0;
            break;
          case 'employmentAndOccupation':
            data.selfEmployed = formData.occupationalStatus?.selfEmployed || 0;
            data.salaried = formData.occupationalStatus?.salaried || 0;
            data.regularWage = formData.occupationalStatus?.regularWage || 0;
            data.casualLabour = formData.occupationalStatus?.casualLabour || 0;
            data.others = formData.occupationalStatus?.others || 0;
            break;
          case 'physicalInfrastructure':
            data.sourceDrinkingWater = {
              individualTap: formData.sourceDrinkingWater?.individualTap || 0,
              tubewellBorewellHandpump: formData.sourceDrinkingWater?.tubewellBorewellHandpump || 0,
              publicTap: formData.sourceDrinkingWater?.publicTap || 0,
              openwell: formData.sourceDrinkingWater?.openwell || 0,
              tankPond: formData.sourceDrinkingWater?.tankPond || 0,
              riverCanalLakeSpring: formData.sourceDrinkingWater?.riverCanalLakeSpring || 0,
              waterTanker: formData.sourceDrinkingWater?.waterTanker || 0,
              others: formData.sourceDrinkingWater?.others || 0
            };
            data.connectivityCityWaterSupply = formData.connectivityCityWaterSupply || "";
            data.drainageSewerageFacility = formData.drainageSewerageFacility || "";
            data.connectivityStormWaterDrainage = formData.connectivityStormWaterDrainage || "";
            data.connectivitySewerageSystem = formData.connectivitySewerageSystem || "";
            data.proneToFlooding = formData.proneToFlooding || "";
            data.latrineFacility = formData.latrineFacility || "";
            data.solidWasteManagement = {
              frequencyOfGarbageDisposal: formData.frequencyOfGarbageDisposal || "",
              arrangementForGarbageDisposal: formData.arrangementForGarbageDisposal || "",
              frequencyOfClearanceOfOpenDrains: formData.frequencyOfClearanceOfOpenDrains || ""
            };
            data.approachRoadType = formData.approachRoadType || "";
            data.distanceToNearestMotorableRoad = formData.distanceToNearestMotorableRoad || "";
            data.internalRoadType = formData.internalRoadType || "";
            data.streetLightAvailable = formData.streetLightAvailable || "";
            break;
          case 'educationFacilities':
            data.anganwadiUnderIcds = {
              option: formData.anganwadiUnderIcds?.option || '',
              distance: formData.anganwadiUnderIcds?.distance || ''
            };
            data.municipalPreschool = {
              option: formData.municipalPreschool?.option || '',
              distance: formData.municipalPreschool?.distance || ''
            };
            data.privatePreschool = {
              option: formData.privatePreschool?.option || '',
              distance: formData.privatePreschool?.distance || ''
            };
            data.municipalPrimarySchool = {
              option: formData.municipalPrimarySchool?.option || '',
              distance: formData.municipalPrimarySchool?.distance || ''
            };
            data.stateGovtPrimarySchool = {
              option: formData.stateGovtPrimarySchool?.option || '',
              distance: formData.stateGovtPrimarySchool?.distance || ''
            };
            data.privatePrimarySchool = {
              option: formData.privatePrimarySchool?.option || '',
              distance: formData.privatePrimarySchool?.distance || ''
            };
            data.municipalHighSchool = {
              option: formData.municipalHighSchool?.option || '',
              distance: formData.municipalHighSchool?.distance || ''
            };
            data.stateGovtHighSchool = {
              option: formData.stateGovtHighSchool?.option || '',
              distance: formData.stateGovtHighSchool?.distance || ''
            };
            data.privateHighSchool = {
              option: formData.privateHighSchool?.option || '',
              distance: formData.privateHighSchool?.distance || ''
            };
            data.adultEducationCentre = {
              option: formData.adultEducationCentre?.option || '',
              distance: formData.adultEducationCentre?.distance || ''
            };
            data.nonFormalEducationCentre = {
              option: formData.nonFormalEducationCentre?.option || '',
              distance: formData.nonFormalEducationCentre?.distance || ''
            };
            break;
          case 'healthFacilities':
            data.urbanHealthPost = formData.urbanHealthPost || "";
            data.primaryHealthCentre = formData.primaryHealthCentre || "";
            data.governmentHospital = formData.governmentHospital || "";
            data.maternityCentre = formData.maternityCentre || "";
            data.privateClinic = formData.privateClinic || "";
            data.rmp = formData.rmp || "";
            data.ayurvedicDoctor = formData.ayurvedicDoctor || "";
            break;
          case 'socialDevelopment':
            data.communityHall = formData.communityHall || 0;
            data.livelihoodProductionCentre = formData.livelihoodProductionCentre || 0;
            data.vocationalTrainingCentre = formData.vocationalTrainingCentre || 0;
            data.streetChildrenRehabilitationCentre = formData.streetChildrenRehabilitationCentre || 0;
            data.nightShelter = formData.nightShelter || 0;
            data.oldAgeHome = formData.oldAgeHome || 0;
            data.oldAgePensionsHolders = formData.oldAgePensionsHolders || 0;
            data.widowPensionsHolders = formData.widowPensionsHolders || 0;
            data.disabledPensionsHolders = formData.disabledPensionsHolders || 0;
            data.generalInsuranceCovered = formData.generalInsuranceCovered || 0;
            data.healthInsuranceCovered = formData.healthInsuranceCovered || 0;
            data.selfHelpGroups = formData.selfHelpGroups || 0;
            data.thriftCreditSocieties = formData.thriftCreditSocieties || 0;
            data.slumDwellersAssociation = formData.slumDwellersAssociation || "";
            data.youthAssociations = formData.youthAssociations || 0;
            data.womensAssociations = formData.womensAssociations || 0;
            break;
          case 'additionalInfrastructure':
            data.waterSupply = {
              pipelines: {
                existing: formData.waterSupplyPipelinesExisting !== undefined ? Number(formData.waterSupplyPipelinesExisting) : 0,
                additionalRequirement: formData.waterSupplyPipelinesAdditional !== undefined ? Number(formData.waterSupplyPipelinesAdditional) : 0,
                estimatedCost: formData.waterSupplyPipelinesCost || 0
              },
              individualTaps: {
                existing: formData.waterSupplyIndividualTapsExisting !== undefined ? Number(formData.waterSupplyIndividualTapsExisting) : 0,
                additionalRequirement: formData.waterSupplyIndividualTapsAdditional !== undefined ? Number(formData.waterSupplyIndividualTapsAdditional) : 0,
                estimatedCost: formData.waterSupplyIndividualTapsCost || 0
              },
              borewells: {
                existing: formData.waterSupplyBorewellsExisting !== undefined ? Number(formData.waterSupplyBorewellsExisting) : 0,
                additionalRequirement: formData.waterSupplyBorewellsAdditional !== undefined ? Number(formData.waterSupplyBorewellsAdditional) : 0,
                estimatedCost: formData.waterSupplyBorewellsCost || 0
              },
              connectivityToTrunkLines: {
                existing: formData.waterSupplyConnectivityTrunkLinesExisting !== undefined ? Number(formData.waterSupplyConnectivityTrunkLinesExisting) : 0,
                additionalRequirement: formData.waterSupplyConnectivityTrunkLinesAdditional !== undefined ? Number(formData.waterSupplyConnectivityTrunkLinesAdditional) : 0,
                estimatedCost: formData.waterSupplyConnectivityTrunkLinesCost || 0
              }
            };

            data.drainageSewerage = {
              stormwaterDrainage: {
                existing: formData.drainageStormwaterDrainageExisting !== undefined ? Number(formData.drainageStormwaterDrainageExisting) : 0,
                additionalRequirement: formData.drainageStormwaterDrainageAdditional !== undefined ? Number(formData.drainageStormwaterDrainageAdditional) : 0,
                estimatedCost: formData.drainageStormwaterDrainageCost || 0
              },
              connectivityToMainDrains: {
                existing: formData.drainageConnectivityMainDrainsExisting !== undefined ? Number(formData.drainageConnectivityMainDrainsExisting) : 0,
                additionalRequirement: formData.drainageConnectivityMainDrainsAdditional !== undefined ? Number(formData.drainageConnectivityMainDrainsAdditional) : 0,
                estimatedCost: formData.drainageConnectivityMainDrainsCost || 0
              },
              sewerLines: {
                existing: formData.drainageSewerLinesExisting !== undefined ? Number(formData.drainageSewerLinesExisting) : 0,
                additionalRequirement: formData.drainageSewerLinesAdditional !== undefined ? Number(formData.drainageSewerLinesAdditional) : 0,
                estimatedCost: formData.drainageSewerLinesCost || 0
              },
              connectivityToTrunkSewers: {
                existing: formData.drainageConnectivityTrunkSewersExisting !== undefined ? Number(formData.drainageConnectivityTrunkSewersExisting) : 0,
                additionalRequirement: formData.drainageConnectivityTrunkSewersAdditional !== undefined ? Number(formData.drainageConnectivityTrunkSewersAdditional) : 0,
                estimatedCost: formData.drainageConnectivityTrunkSewersCost || 0
              }
            };

            data.roads = {
              internalRoadsCC: {
                existing: formData.roadsInternalRoadsCCExisting !== undefined ? Number(formData.roadsInternalRoadsCCExisting) : 0,
                additionalRequirement: formData.roadsInternalRoadsCCAdditional !== undefined ? Number(formData.roadsInternalRoadsCCAdditional) : 0,
                estimatedCost: formData.roadsInternalRoadsCCCost || 0
              },
              internalRoadsBT: {
                existing: formData.roadsInternalRoadsBTExisting !== undefined ? Number(formData.roadsInternalRoadsBTExisting) : 0,
                additionalRequirement: formData.roadsInternalRoadsBTAdditional !== undefined ? Number(formData.roadsInternalRoadsBTAdditional) : 0,
                estimatedCost: formData.roadsInternalRoadsBTCost || 0
              },
              internalRoadsOthers: {
                existing: formData.roadsInternalRoadsOthersExisting !== undefined ? Number(formData.roadsInternalRoadsOthersExisting) : 0,
                additionalRequirement: formData.roadsInternalRoadsOthersAdditional !== undefined ? Number(formData.roadsInternalRoadsOthersAdditional) : 0,
                estimatedCost: formData.roadsInternalRoadsOthersCost || 0
              },
              approachRoadsCC: {
                existing: formData.roadsApproachRoadsCCExisting !== undefined ? Number(formData.roadsApproachRoadsCCExisting) : 0,
                additionalRequirement: formData.roadsApproachRoadsCCAdditional !== undefined ? Number(formData.roadsApproachRoadsCCAdditional) : 0,
                estimatedCost: formData.roadsApproachRoadsCCCost || 0
              },
              approachRoadsOthers: {
                existing: formData.roadsApproachRoadsOthersExisting !== undefined ? Number(formData.roadsApproachRoadsOthersExisting) : 0,
                additionalRequirement: formData.roadsApproachRoadsOthersAdditional !== undefined ? Number(formData.roadsApproachRoadsOthersAdditional) : 0,
                estimatedCost: formData.roadsApproachRoadsOthersCost || 0
              }
            };

            data.streetLighting = {
              poles: {
                existing: formData.streetLightingPolesExisting !== undefined ? Number(formData.streetLightingPolesExisting) : 0,
                additionalRequirement: formData.streetLightingPolesAdditional !== undefined ? Number(formData.streetLightingPolesAdditional) : 0,
                estimatedCost: formData.streetLightingPolesCost || 0
              },
              lights: {
                existing: formData.streetLightingLightsExisting !== undefined ? Number(formData.streetLightingLightsExisting) : 0,
                additionalRequirement: formData.streetLightingLightsAdditional !== undefined ? Number(formData.streetLightingLightsAdditional) : 0,
                estimatedCost: formData.streetLightingLightsCost || 0
              }
            };

            data.sanitation = {
              individualToilets: {
                existing: formData.sanitationIndividualToiletsExisting !== undefined ? Number(formData.sanitationIndividualToiletsExisting) : 0,
                additionalRequirement: formData.sanitationIndividualToiletsAdditional !== undefined ? Number(formData.sanitationIndividualToiletsAdditional) : 0,
                estimatedCost: formData.sanitationIndividualToiletsCost || 0
              },
              communityToilets: {
                existing: formData.sanitationCommunityToiletsExisting !== undefined ? Number(formData.sanitationCommunityToiletsExisting) : 0,
                additionalRequirement: formData.sanitationCommunityToiletsAdditional !== undefined ? Number(formData.sanitationCommunityToiletsAdditional) : 0,
                estimatedCost: formData.sanitationCommunityToiletsCost || 0
              },
              seatsInCommunityToilets: {
                existing: formData.sanitationSeatsCommunityToiletsExisting !== undefined ? Number(formData.sanitationSeatsCommunityToiletsExisting) : 0,
                additionalRequirement: formData.sanitationSeatsCommunityToiletsAdditional !== undefined ? Number(formData.sanitationSeatsCommunityToiletsAdditional) : 0,
                estimatedCost: formData.sanitationSeatsCommunityToiletsCost || 0
              },
              dumperBins: {
                existing: formData.sanitationDumperBinsExisting !== undefined ? Number(formData.sanitationDumperBinsExisting) : 0,
                additionalRequirement: formData.sanitationDumperBinsAdditional !== undefined ? Number(formData.sanitationDumperBinsAdditional) : 0,
                estimatedCost: formData.sanitationDumperBinsCost || 0
              }
            };

            data.communityFacilities = {
              communityHalls: {
                existing: formData.communityHallsExisting !== undefined ? Number(formData.communityHallsExisting) : 0,
                additionalRequirement: formData.communityHallsAdditional !== undefined ? Number(formData.communityHallsAdditional) : 0,
                estimatedCost: formData.communityHallsCost || 0
              },
              livelihoodCentres: {
                existing: formData.communityLivelihoodCentresExisting !== undefined ? Number(formData.communityLivelihoodCentresExisting) : 0,
                additionalRequirement: formData.communityLivelihoodCentresAdditional !== undefined ? Number(formData.communityLivelihoodCentresAdditional) : 0,
                estimatedCost: formData.communityLivelihoodCentresCost || 0
              },
              anganwadis: {
                existing: formData.communityAnganwadisExisting !== undefined ? Number(formData.communityAnganwadisExisting) : 0,
                additionalRequirement: formData.communityAnganwadisAdditional !== undefined ? Number(formData.communityAnganwadisAdditional) : 0,
                estimatedCost: formData.communityAnganwadisCost || 0
              },
              primarySchools: {
                existing: formData.communityPrimarySchoolsExisting !== undefined ? Number(formData.communityPrimarySchoolsExisting) : 0,
                additionalRequirement: formData.communityPrimarySchoolsAdditional !== undefined ? Number(formData.communityPrimarySchoolsAdditional) : 0,
                estimatedCost: formData.communityPrimarySchoolsCost || 0
              },
              healthCentres: {
                existing: formData.communityHealthCentresExisting !== undefined ? Number(formData.communityHealthCentresExisting) : 0,
                additionalRequirement: formData.communityHealthCentresAdditional !== undefined ? Number(formData.communityHealthCentresAdditional) : 0,
                estimatedCost: formData.communityHealthCentresCost || 0
              },
              others: {
                existing: formData.communityOthersExisting !== undefined ? Number(formData.communityOthersExisting) : 0,
                additionalRequirement: formData.communityOthersAdditional !== undefined ? Number(formData.communityOthersAdditional) : 0,
                estimatedCost: formData.communityOthersCost || 0
              }
            };

            data.standaloneInfrastructureRequirements = {
              electricity: {
                existing: formData.electricityExisting || 0,
                additionalRequirement: formData.electricityAdditional || 0,
                estimatedCost: formData.electricityCost || 0
              },
              healthCare: {
                existing: formData.healthcareExisting || 0,
                additionalRequirement: formData.healthcareAdditional || 0,
                estimatedCost: formData.healthcareCost || 0
              },
              toilets: {
                existing: formData.toiletsExisting || 0,
                additionalRequirement: formData.toiletsAdditional || 0,
                estimatedCost: formData.toiletsCost || 0
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
                className="mb-2 text-sm text-slate-400 hover:text-white flex items-center transition-colors cursor-pointer"
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
                {slum.slumName}
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
                    label="ULB Code"
                    value={formData.ulbCode || ""}
                    onChange={(e) => handleInputChange("ulbCode", e.target.value)}
                    required
                    name="ulbCode"
                    error={getFieldError('ulbCode')}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                    label="ULB Name"
                    value={formData.ulbName || ""}
                    onChange={(e) => handleInputChange("ulbName", e.target.value)}
                    required
                    name="ulbName"
                    error={getFieldError('ulbName')}
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
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
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
            )}

            {currentStep === 1 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part B: City/Town Slum Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label="Slum Type"
                    value={formData.slumType || ""}
                    onChange={(e) => handleInputChange("slumType", e.target.value)}
                    required
                    name="slumType"
                    error={getFieldError('slumType')}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                    label="Slum ID"
                    value={formData.slumIdField || ""}
                    onChange={(e) => handleInputChange("slumIdField", e.target.value)}
                    required
                    name="slumIdField"
                    error={getFieldError('slumIdField')}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
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
                        { value: "MUNICIPAL_CORPORATION", label: "Municipal Corporation" },
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
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
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
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
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
                    value={formData.bplHouseholds|| ""}
                    onChange={(e) => handleInputChange("bplHouseholds", parseInt(e.target.value) || 0)}
                    required
                    name="bplHouseholds"
                    error={getFieldError('bplHouseholds')}
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
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
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
                    label="Ward Number"
                    value={formData.wardNumber || ""}
                    onChange={(e) => handleInputChange("wardNumber", e.target.value)}
                    required
                    name="wardNumber"
                    error={getFieldError('wardNumber')}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                    label="Ward Name"
                    value={formData.wardName || ""}
                    onChange={(e) => handleInputChange("wardName", e.target.value)}
                    required
                    name="wardName"
                    error={getFieldError('wardName')}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                    label="Zone"
                    value={formData.zone || ""}
                    onChange={(e) => handleInputChange("zone", e.target.value)}
                    required
                    name="zone"
                    error={getFieldError('zone')}
                    readOnly
                    className="bg-slate-800/50 cursor-not-allowed opacity-75"
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
                        { value: "MUNICIPAL_CORPORATION", label: "Public: Municipal Corporation" },
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
                        {formData.ownershipLandDetail === "OTHER" && (
                        <Input
                        label="Specify Ownership (if Other)"
                        value={formData.ownershipLandSpecify || ""}
                        onChange={(e) => handleInputChange("ownershipLandSpecify", e.target.value)}
                        placeholder="Specify ownership details..."
                        name="ownershipLandSpecify"
                        error={getFieldError('ownershipLandSpecify')}
                        />
                        )}
                    </div>
                </div>
            </div>
            )}

            {currentStep === 5 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part F: Demographic Profile (Population)
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
                            value={formData.totalPopulationSlumTotal || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumTotal", parseInt(e.target.value) || 0)}
                            name="totalPopulationSlumTotal"
                            error={getFieldError('totalPopulationSlumTotal')}
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
                            value={formData.bplPopulationSlumTotal || ""}
                            onChange={(e) => handleInputChange("bplPopulationSlumTotal", parseInt(e.target.value) || 0)}
                            name="bplPopulationSlumTotal"
                            error={getFieldError('bplPopulationSlumTotal')}
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
                            value={formData.noHouseholdsSlumTotal || ""}
                            onChange={(e) => handleInputChange("noHouseholdsSlumTotal", parseInt(e.target.value) || 0)}
                            name="noHouseholdsSlumTotal"
                            error={getFieldError('noHouseholdsSlumTotal')}
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
                    
                    {/* Question 12 - No. of Persons with HIV/AIDS */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">12j. No.of Persons with HIV-AIDS</h3>
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
                Part G: Housing Status (No. of Households)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4">Dwelling Units</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="Pucca"
                            type="number"
                            value={formData.dwellingUnitsPucca || ""}
                            onChange={(e) => handleInputChange("dwellingUnitsPucca", parseInt(e.target.value) || 0)}
                            required
                            name="dwellingUnitsPucca"
                            error={getFieldError('dwellingUnitsPucca')}
                            />
                            <Input
                            label="Semi Pucca"
                            type="number"
                            value={formData.dwellingUnitsSemiPucca || ""}
                            onChange={(e) => handleInputChange("dwellingUnitsSemiPucca", parseInt(e.target.value) || 0)}
                            required
                            name="dwellingUnitsSemiPucca"
                            error={getFieldError('dwellingUnitsSemiPucca')}
                            />
                            <Input
                            label="Katcha"
                            type="number"
                            value={formData.dwellingUnitsKatcha || ""}
                            onChange={(e) => handleInputChange("dwellingUnitsKatcha", parseInt(e.target.value) || 0)}
                            required
                            name="dwellingUnitsKatcha"
                            error={getFieldError('dwellingUnitsKatcha')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.dwellingUnitsTotal || ""}
                            onChange={(e) => handleInputChange("dwellingUnitsTotal", parseInt(e.target.value) || 0)}
                            required
                            name="dwellingUnitsTotal"
                            error={getFieldError('dwellingUnitsTotal')}
                            />
                            <Input
                            label="Electricity Pucca"
                            type="number"
                            value={formData.dwellingUnitsWithElectricityPucca || ""}
                            onChange={(e) => handleInputChange("dwellingUnitsWithElectricityPucca", parseInt(e.target.value) || 0)}
                            required
                            name="dwellingUnitsWithElectricityPucca"
                            error={getFieldError('dwellingUnitsWithElectricityPucca')}
                            />
                            <Input
                            label="Electricity Semi Pucca"
                            type="number"
                            value={formData.dwellingUnitsWithElectricitySemiPucca || ""}
                            onChange={(e) => handleInputChange("dwellingUnitsWithElectricitySemiPucca", parseInt(e.target.value) || 0)}
                            required
                            name="dwellingUnitsWithElectricitySemiPucca"
                            error={getFieldError('dwellingUnitsWithElectricitySemiPucca')}
                            />
                            <Input
                            label="Electricity Katcha"
                            type="number"
                            value={formData.dwellingUnitsWithElectricityKatcha || ""}
                            onChange={(e) => handleInputChange("dwellingUnitsWithElectricityKatcha", parseInt(e.target.value) || 0)}
                            required
                            name="dwellingUnitsWithElectricityKatcha"
                            error={getFieldError('dwellingUnitsWithElectricityKatcha')}
                            />
                            <Input
                            label="Total"
                            type="number"
                            value={formData.dwellingUnitsWithElectricityTotal || ""}
                            onChange={(e) => handleInputChange("dwellingUnitsWithElectricityTotal", parseInt(e.target.value) || 0)}
                            required
                            name="dwellingUnitsWithElectricityTotal"
                            error={getFieldError('dwellingUnitsWithElectricityTotal')}
                            />
                        </div>
                    </div>
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
                Part H: Economic Status of Households (No. of Households)
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
                Part I: Occupation Status of Households (No. of Households)
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
                            { value: "FULLY CONNECTED", label: "Fully Connected" },
                            { value: "PARTIALLY CONNECTED", label: "Partially Connected" },
                            { value: "NOT CONNECTED", label: "Not Connected" },
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
                            { value: "FULLY CONNECTED", label: "Fully Connected" },
                            { value: "PARTIALLY CONNECTED", label: "Partially Connected" },
                            { value: "NOT CONNECTED", label: "Not Connected" },
                        ]}
                        />
                        <Select
                        label="Connectivity to Sewerage System"
                        value={formData.connectivitySewerageSystem || ""}
                        onChange={(e) => handleInputChange("connectivitySewerageSystem", e.target.value)}
                        required
                        options={[
                            { value: "FULLY CONNECTED", label: "Fully Connected" },
                            { value: "PARTIALLY CONNECTED", label: "Partially Connected" },
                            { value: "NOT CONNECTED", label: "Not Connected" },
                        ]}
                        />
                        <Select
                        label="Prone to Flooding"
                        value={formData.proneToFlooding || ""}
                        onChange={(e) => handleInputChange("proneToFlooding", e.target.value)}
                        required
                        options={[
                            { value: "NOT PRONE", label: "Not Prone" },
                            { value: "UPTO 15 DAYS", label: "Up to 15 Days" },
                            { value: "15-30 DAYS", label: "15-30 Days" },
                            { value: "MORE THAN MONTH", label: "More than a Month" },
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
                            { value: "PUBLIC LATRINE", label: "Public Latrine" },
                            { value: "SHARED LATRINE", label: "Shared Latrine" },
                            { value: "OWN LATRINE", label: "Own Latrine" },
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
                                { value: "ONCE IN 2 DAYS", label: "Once in 2 days" },
                                { value: "ONCE IN WEEK", label: "Once in a week" },
                                { value: "ONCE IN 15 DAYS", label: "Once in 15 days" },
                                { value: "NO COLLECTION", label: "No collection" },
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
                                { value: "MUNICIPAL STAFF", label: "Municipal staff" },
                                { value: "MUNICIPAL CONTRACTOR", label: "Municipal Contractor" },
                                { value: "RESIDENTS THEMSELVES", label: "Residents themselves" },
                                { value: "OTHERS", label: "Others" },
                                { value: "NO ARRANGEMENT", label: "No arrangement" },
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
                                { value: "ONCE IN 2 DAYS", label: "Once in 2 days" },
                                { value: "ONCE IN WEEK", label: "Once in a week" },
                                { value: "ONCE IN 15 DAYS", label: "Once in 15 days" },
                                { value: "NO CLEARANCE", label: "No clearance" },
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
                                { value: "MOTORABLE PUCCA", label: "Motorable pucca" },
                                { value: "MOTORABLE KATCHA", label: "Motorable katcha" },
                                { value: "NON-MOTORABLE PUCCA", label: "Non-motorable pucca" },
                                { value: "NON-MOTORABLE KATCHA", label: "Non-motorable katcha" },
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
                                { value: "LESS THAN 0.5 KMS", label: "Less than 0.5 kms" },
                                { value: "0.5 TO 1.0 KM", label: "0.5 to 1.0 km" },
                                { value: "1.0 TO 2.0 KM", label: "1.0 km to 2.0 km" },
                                { value: "2.0 TO 5.0 KM", label: "2.0 km to 5.0 km" },
                                { value: "MORE THAN 5.0 KMS", label: "More than 5.0 kms" },
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
                                { value: "MOTORABLE PUCCA", label: "Motorable pucca" },
                                { value: "MOTORABLE KATCHA", label: "Motorable katcha" },
                                { value: "NON-MOTORABLE PUCCA", label: "Non-motorable pucca" },
                                { value: "NON-MOTORABLE KATCHA", label: "Non-motorable katcha" },
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
                Part K: Education Facilities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Select
                        label="26a. Anganwadi under ICDS"
                        value={formData.anganwadiUnderIcds?.option || ''}
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('anganwadiUnderIcds', 'option', value);
                          // Clear distance if option is not 'Within the slum area'
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('anganwadiUnderIcds', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('municipalPreschool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('municipalPreschool', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('privatePreschool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('privatePreschool', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('municipalPrimarySchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('municipalPrimarySchool', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('stateGovtPrimarySchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('stateGovtPrimarySchool', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('privatePrimarySchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('privatePrimarySchool', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('municipalHighSchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('municipalHighSchool', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('stateGovtHighSchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('stateGovtHighSchool', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('privateHighSchool', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('privateHighSchool', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('adultEducationCentre', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('adultEducationCentre', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedInputChange('nonFormalEducationCentre', 'option', value);
                          if (value !== 'Within the slum area') {
                            handleNestedInputChange('nonFormalEducationCentre', 'distance', '');
                          }
                        }}
                        options={[{ value: 'No', label: 'No' }, { value: 'Within the slum area', label: 'Within the slum area' }, { value: 'Outside the slum area: with distance Less than 0.5 kms', label: 'Outside the slum area: with distance Less than 0.5 kms' }, { value: 'Outside the slum area: with distance 0.5 to 1.0 km', label: 'Outside the slum area: with distance 0.5 to 1.0 km' }, { value: 'Outside the slum area: with distance 1.0 to 2.0 km', label: 'Outside the slum area: with distance 1.0 to 2.0 km' }, { value: 'Outside the slum area: with distance 2.0 to 5.0 km', label: 'Outside the slum area: with distance 2.0 to 5.0 km' }, { value: 'Outside the slum area: with distance more than 5.0 km', label: 'Outside the slum area: with distance more than 5.0 km' }]}
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
                Part L: Health Facilities
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
                Part M: Social Development/Welfare
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
                            <Input
                            label="Pipelines (Rmts) - Existing"
                            type="number"
                            value={formData.waterSupplyPipelinesExisting || ""}
                            onChange={(e) => handleInputChange("waterSupplyPipelinesExisting", e.target.value)}
                            required
                            name="waterSupplyPipelinesExisting"
                            error={getFieldError("waterSupplyPipelinesExisting")}
                            />
                            <Input
                            label="Pipelines (Rmts) - Additional Requirement"
                            type="number"
                            value={formData.waterSupplyPipelinesAdditional || ""}
                            onChange={(e) => handleInputChange("waterSupplyPipelinesAdditional", e.target.value)}
                            required
                            name="waterSupplyPipelinesAdditional"
                            error={getFieldError("waterSupplyPipelinesAdditional")}
                            />
                            {(formData.waterSupplyPipelinesAdditional || 0) > 0 && (
                            <Input
                            label="Pipelines (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.waterSupplyPipelinesCost || ""}
                            onChange={(e) => handleInputChange("waterSupplyPipelinesCost", parseInt(e.target.value) || 0)}
                            name="waterSupplyPipelinesCost"
                            error={getFieldError("waterSupplyPipelinesCost")}
                            />
                            )}
                            
                            <Input
                            label="Individual Taps (Nos.) - Existing"
                            type="number"
                            value={formData.waterSupplyIndividualTapsExisting || ""}
                            onChange={(e) => handleInputChange("waterSupplyIndividualTapsExisting", e.target.value)}
                            required
                            name="waterSupplyIndividualTapsExisting"
                            error={getFieldError("waterSupplyIndividualTapsExisting")}
                            />
                            <Input
                            label="Individual Taps (Nos.) - Additional Requirement"
                            type="number"
                            value={formData.waterSupplyIndividualTapsAdditional || ""}
                            onChange={(e) => handleInputChange("waterSupplyIndividualTapsAdditional", e.target.value)}
                            required
                            name="waterSupplyIndividualTapsAdditional"
                            error={getFieldError("waterSupplyIndividualTapsAdditional")}
                            />
                            {(formData.waterSupplyIndividualTapsAdditional || 0) > 0 && (
                            <Input
                            label="Individual Taps (Nos.) - Estimated Cost"
                            type="number"
                            value={formData.waterSupplyIndividualTapsCost || ""}
                            onChange={(e) => handleInputChange("waterSupplyIndividualTapsCost", parseInt(e.target.value) || 0)}
                            name="waterSupplyIndividualTapsCost"
                            error={getFieldError("waterSupplyIndividualTapsCost")}
                            />
                            )}
                            
                            <Input
                            label="Borewells (Nos.) - Existing"
                            type="number"
                            value={formData.waterSupplyBorewellsExisting || ""}
                            onChange={(e) => handleInputChange("waterSupplyBorewellsExisting", e.target.value)}
                            required
                            name="waterSupplyBorewellsExisting"
                            error={getFieldError("waterSupplyBorewellsExisting")}
                            />
                            <Input
                            label="Borewells (Nos.) - Additional Requirement"
                            type="number"
                            value={formData.waterSupplyBorewellsAdditional || ""}
                            onChange={(e) => handleInputChange("waterSupplyBorewellsAdditional", e.target.value)}
                            required
                            name="waterSupplyBorewellsAdditional"
                            error={getFieldError("waterSupplyBorewellsAdditional")}
                            />
                            {(formData.waterSupplyBorewellsAdditional || 0) > 0 && (
                            <Input
                            label="Borewells (Nos.) - Estimated Cost"
                            type="number"
                            value={formData.waterSupplyBorewellsCost || ""}
                            onChange={(e) => handleInputChange("waterSupplyBorewellsCost", parseInt(e.target.value) || 0)}
                            name="waterSupplyBorewellsCost"
                            error={getFieldError("waterSupplyBorewellsCost")}
                            />
                            )}
                            
                            <Input
                            label="Connectivity to Trunk Lines (Rmts) - Existing"
                            type="number"
                            value={formData.waterSupplyConnectivityTrunkLinesExisting || ""}
                            onChange={(e) => handleInputChange("waterSupplyConnectivityTrunkLinesExisting", e.target.value)}
                            required
                            name="waterSupplyConnectivityTrunkLinesExisting"
                            error={getFieldError("waterSupplyConnectivityTrunkLinesExisting")}
                            />
                            <Input
                            label="Connectivity to Trunk Lines (Rmts) - Additional Requirement"
                            type="number"
                            value={formData.waterSupplyConnectivityTrunkLinesAdditional || ""}
                            onChange={(e) => handleInputChange("waterSupplyConnectivityTrunkLinesAdditional", e.target.value)}
                            required
                            name="waterSupplyConnectivityTrunkLinesAdditional"
                            error={getFieldError("waterSupplyConnectivityTrunkLinesAdditional")}
                            />
                            {(formData.waterSupplyConnectivityTrunkLinesAdditional || 0) > 0 && (
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
                            <Input
                            label="Stormwater Drainage (Rmts.) - Existing"
                            type="number"
                            value={formData.drainageStormwaterDrainageExisting || ""}
                            onChange={(e) => handleInputChange("drainageStormwaterDrainageExisting", e.target.value)}
                            required
                            name="drainageStormwaterDrainageExisting"
                            error={getFieldError("drainageStormwaterDrainageExisting")}
                            />
                            <Input
                            label="Stormwater Drainage (Rmts.) - Additional Requirement"
                            type="number"
                            value={formData.drainageStormwaterDrainageAdditional || ""}
                            onChange={(e) => handleInputChange("drainageStormwaterDrainageAdditional", e.target.value)}
                            required
                            name="drainageStormwaterDrainageAdditional"
                            error={getFieldError("drainageStormwaterDrainageAdditional")}
                            />
                            {(formData.drainageStormwaterDrainageAdditional || 0) > 0 && (
                            <Input
                            label="Stormwater Drainage (Rmts.) - Estimated Cost"
                            type="number"
                            value={formData.drainageStormwaterDrainageCost || ""}
                            onChange={(e) => handleInputChange("drainageStormwaterDrainageCost", parseInt(e.target.value) || 0)}
                            name="drainageStormwaterDrainageCost"
                            error={getFieldError("drainageStormwaterDrainageCost")}
                            />
                            )}
                            
                            <Input
                            label="Connectivity to Main Drains (Rmts) - Existing"
                            type="number"
                            value={formData.drainageConnectivityMainDrainsExisting || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityMainDrainsExisting", e.target.value)}
                            required
                            name="drainageConnectivityMainDrainsExisting"
                            error={getFieldError("drainageConnectivityMainDrainsExisting")}
                            />
                            <Input
                            label="Connectivity to Main Drains (Rmts) - Additional Requirement"
                            type="number"
                            value={formData.drainageConnectivityMainDrainsAdditional || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityMainDrainsAdditional", e.target.value)}
                            required
                            name="drainageConnectivityMainDrainsAdditional"
                            error={getFieldError("drainageConnectivityMainDrainsAdditional")}
                            />
                            {(formData.drainageConnectivityMainDrainsAdditional || 0) > 0 && (
                            <Input
                            label="Connectivity to Main Drains (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.drainageConnectivityMainDrainsCost || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityMainDrainsCost", parseInt(e.target.value) || 0)}
                            name="drainageConnectivityMainDrainsCost"
                            error={getFieldError("drainageConnectivityMainDrainsCost")}
                            />
                            )}
                            
                            <Input
                            label="Sewer Lines (Rmts) - Existing"
                            type="number"
                            value={formData.drainageSewerLinesExisting || ""}
                            onChange={(e) => handleInputChange("drainageSewerLinesExisting", e.target.value)}
                            required
                            name="drainageSewerLinesExisting"
                            error={getFieldError("drainageSewerLinesExisting")}
                            />
                            <Input
                            label="Sewer Lines (Rmts) - Additional Requirement"
                            type="number"
                            value={formData.drainageSewerLinesAdditional || ""}
                            onChange={(e) => handleInputChange("drainageSewerLinesAdditional", e.target.value)}
                            required
                            name="drainageSewerLinesAdditional"
                            error={getFieldError("drainageSewerLinesAdditional")}
                            />
                            {(formData.drainageSewerLinesAdditional || 0) > 0 && (
                            <Input
                            label="Sewer Lines (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.drainageSewerLinesCost || ""}
                            onChange={(e) => handleInputChange("drainageSewerLinesCost", parseInt(e.target.value) || 0)}
                            name="drainageSewerLinesCost"
                            error={getFieldError("drainageSewerLinesCost")}
                            />
                            )}
                            
                            <Input
                            label="Connectivity to Trunk Sewers (Rmts) - Existing"
                            type="number"
                            value={formData.drainageConnectivityTrunkSewersExisting || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityTrunkSewersExisting", e.target.value)}
                            required
                            name="drainageConnectivityTrunkSewersExisting"
                            error={getFieldError("drainageConnectivityTrunkSewersExisting")}
                            />
                            <Input
                            label="Connectivity to Trunk Sewers (Rmts) - Additional Requirement"
                            type="number"
                            value={formData.drainageConnectivityTrunkSewersAdditional || ""}
                            onChange={(e) => handleInputChange("drainageConnectivityTrunkSewersAdditional", e.target.value)}
                            required
                            name="drainageConnectivityTrunkSewersAdditional"
                            error={getFieldError("drainageConnectivityTrunkSewersAdditional")}
                            />
                            {(formData.drainageConnectivityTrunkSewersAdditional || 0) > 0 && (
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
                            <Input
                            label="Internal Roads -CC (Rmts) - Existing"
                            type="number"
                            value={formData.roadsInternalRoadsCCExisting || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsCCExisting", e.target.value)}
                            required
                            name="roadsInternalRoadsCCExisting"
                            error={getFieldError("roadsInternalRoadsCCExisting")}
                            />
                            <Input
                            label="Internal Roads -CC (Rmts) - Additional Requirement"
                            type="number"
                            value={formData.roadsInternalRoadsCCAdditional || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsCCAdditional", e.target.value)}
                            required
                            name="roadsInternalRoadsCCAdditional"
                            error={getFieldError("roadsInternalRoadsCCAdditional")}
                            />
                            {(formData.roadsInternalRoadsCCAdditional || 0) > 0 && (
                            <Input
                            label="Internal Roads -CC (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.roadsInternalRoadsCCCost || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsCCCost", parseInt(e.target.value) || 0)}
                            name="roadsInternalRoadsCCCost"
                            error={getFieldError("roadsInternalRoadsCCCost")}
                            />
                            )}
                            
                            <Input
                            label="Internal Roads - BT (Rmts.) - Existing"
                            type="number"
                            value={formData.roadsInternalRoadsBTExisting || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsBTExisting", e.target.value)}
                            required
                            name="roadsInternalRoadsBTExisting"
                            error={getFieldError("roadsInternalRoadsBTExisting")}
                            />
                            <Input
                            label="Internal Roads - BT (Rmts.) - Additional Requirement"
                            type="number"
                            value={formData.roadsInternalRoadsBTAdditional || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsBTAdditional", e.target.value)}
                            required
                            name="roadsInternalRoadsBTAdditional"
                            error={getFieldError("roadsInternalRoadsBTAdditional")}
                            />
                            {(formData.roadsInternalRoadsBTAdditional || 0) > 0 && (
                            <Input
                            label="Internal Roads - BT (Rmts.) - Estimated Cost"
                            type="number"
                            value={formData.roadsInternalRoadsBTCost || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsBTCost", parseInt(e.target.value) || 0)}
                            name="roadsInternalRoadsBTCost"
                            error={getFieldError("roadsInternalRoadsBTCost")}
                            />
                            )}
                            
                            <Input
                            label="Internal Roads - Others (Rmts) - Existing"
                            type="number"
                            value={formData.roadsInternalRoadsOthersExisting || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsOthersExisting", e.target.value)}
                            required
                            name="roadsInternalRoadsOthersExisting"
                            error={getFieldError("roadsInternalRoadsOthersExisting")}
                            />
                            <Input
                            label="Internal Roads - Others (Rmts) - Additional Requirement"
                            type="number"
                            value={formData.roadsInternalRoadsOthersAdditional || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsOthersAdditional", e.target.value)}
                            required
                            name="roadsInternalRoadsOthersAdditional"
                            error={getFieldError("roadsInternalRoadsOthersAdditional")}
                            />
                            {(formData.roadsInternalRoadsOthersAdditional || 0) > 0 && (
                            <Input
                            label="Internal Roads - Others (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.roadsInternalRoadsOthersCost || ""}
                            onChange={(e) => handleInputChange("roadsInternalRoadsOthersCost", parseInt(e.target.value) || 0)}
                            name="roadsInternalRoadsOthersCost"
                            error={getFieldError("roadsInternalRoadsOthersCost")}
                            />
                            )}
                            
                            <Input
                            label="Approach Roads -CC (Rmts) - Existing"
                            type="number"
                            value={formData.roadsApproachRoadsCCExisting || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsCCExisting", e.target.value)}
                            required
                            name="roadsApproachRoadsCCExisting"
                            error={getFieldError("roadsApproachRoadsCCExisting")}
                            />
                            <Input
                            label="Approach Roads -CC (Rmts) - Additional Requirement"
                            type="number"
                            value={formData.roadsApproachRoadsCCAdditional || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsCCAdditional", e.target.value)}
                            required
                            name="roadsApproachRoadsCCAdditional"
                            error={getFieldError("roadsApproachRoadsCCAdditional")}
                            />
                            {(formData.roadsApproachRoadsCCAdditional || 0) > 0 && (
                            <Input
                            label="Approach Roads -CC (Rmts) - Estimated Cost"
                            type="number"
                            value={formData.roadsApproachRoadsCCCost || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsCCCost", parseInt(e.target.value) || 0)}
                            name="roadsApproachRoadsCCCost"
                            error={getFieldError("roadsApproachRoadsCCCost")}
                            />
                            )}
                            
                            <Input
                            label="Approach Roads - Others (Rmts) - Existing"
                            type="number"
                            value={formData.roadsApproachRoadsOthersExisting || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsOthersExisting", e.target.value)}
                            required
                            name="roadsApproachRoadsOthersExisting"
                            error={getFieldError("roadsApproachRoadsOthersExisting")}
                            />
                            <Input
                            label="Approach Roads - Others (Rmts) - Additional Requirement"
                            type="number"
                            value={formData.roadsApproachRoadsOthersAdditional || ""}
                            onChange={(e) => handleInputChange("roadsApproachRoadsOthersAdditional", e.target.value)}
                            required
                            name="roadsApproachRoadsOthersAdditional"
                            error={getFieldError("roadsApproachRoadsOthersAdditional")}
                            />
                            {(formData.roadsApproachRoadsOthersAdditional || 0) > 0 && (
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
                            <Input
                            label="Street Light Poles (Nos.) - Existing"
                            type="number"
                            value={formData.streetLightingPolesExisting || ""}
                            onChange={(e) => handleInputChange("streetLightingPolesExisting", e.target.value)}
                            required
                            name="streetLightingPolesExisting"
                            error={getFieldError("streetLightingPolesExisting")}
                            />
                            <Input
                            label="Street Light Poles (Nos.) - Additional Requirement"
                            type="number"
                            value={formData.streetLightingPolesAdditional || ""}
                            onChange={(e) => handleInputChange("streetLightingPolesAdditional", e.target.value)}
                            required
                            name="streetLightingPolesAdditional"
                            error={getFieldError("streetLightingPolesAdditional")}
                            />
                            {(formData.streetLightingPolesAdditional || 0) > 0 && (
                            <Input
                            label="Street Light Poles (Nos.) - Estimated Cost"
                            type="number"
                            value={formData.streetLightingPolesCost || ""}
                            onChange={(e) => handleInputChange("streetLightingPolesCost", parseInt(e.target.value) || 0)}
                            name="streetLightingPolesCost"
                            error={getFieldError("streetLightingPolesCost")}
                            />
                            )}
                            
                            <Input
                            label="Street Lights (Nos) - Existing"
                            type="number"
                            value={formData.streetLightingLightsExisting || ""}
                            onChange={(e) => handleInputChange("streetLightingLightsExisting", e.target.value)}
                            required
                            name="streetLightingLightsExisting"
                            error={getFieldError("streetLightingLightsExisting")}
                            />
                            <Input
                            label="Street Lights (Nos) - Additional Requirement"
                            type="number"
                            value={formData.streetLightingLightsAdditional || ""}
                            onChange={(e) => handleInputChange("streetLightingLightsAdditional", e.target.value)}
                            required
                            name="streetLightingLightsAdditional"
                            error={getFieldError("streetLightingLightsAdditional")}
                            />
                            {(formData.streetLightingLightsAdditional || 0) > 0 && (
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
                            <Input
                            label="Individual Toilets (Nos) - Existing"
                            type="number"
                            value={formData.sanitationIndividualToiletsExisting || ""}
                            onChange={(e) => handleInputChange("sanitationIndividualToiletsExisting", e.target.value)}
                            required
                            name="sanitationIndividualToiletsExisting"
                            error={getFieldError("sanitationIndividualToiletsExisting")}
                            />
                            <Input
                            label="Individual Toilets (Nos) - Additional Requirement"
                            type="number"
                            value={formData.sanitationIndividualToiletsAdditional || ""}
                            onChange={(e) => handleInputChange("sanitationIndividualToiletsAdditional", e.target.value)}
                            required
                            name="sanitationIndividualToiletsAdditional"
                            error={getFieldError("sanitationIndividualToiletsAdditional")}
                            />
                            {(formData.sanitationIndividualToiletsAdditional || 0) > 0 && (
                            <Input
                            label="Individual Toilets (Nos) - Estimated Cost"
                            type="number"
                            value={formData.sanitationIndividualToiletsCost || ""}
                            onChange={(e) => handleInputChange("sanitationIndividualToiletsCost", parseInt(e.target.value) || 0)}
                            name="sanitationIndividualToiletsCost"
                            error={getFieldError("sanitationIndividualToiletsCost")}
                            />
                            )}
                            
                            <Input
                            label="Community Toilets (Nos) - Existing"
                            value={formData.sanitationCommunityToiletsExisting || ""}
                            type="number"
                            onChange={(e) => handleInputChange("sanitationCommunityToiletsExisting", e.target.value)}
                            required
                            name="sanitationCommunityToiletsExisting"
                            error={getFieldError("sanitationCommunityToiletsExisting")}
                            />
                            <Input
                            label="Community Toilets (Nos) - Additional Requirement"
                            type="number"
                            value={formData.sanitationCommunityToiletsAdditional || ""}
                            onChange={(e) => handleInputChange("sanitationCommunityToiletsAdditional", e.target.value)}
                            required
                            name="sanitationCommunityToiletsAdditional"
                            error={getFieldError("sanitationCommunityToiletsAdditional")}
                            />
                            {(formData.sanitationCommunityToiletsAdditional || 0) > 0 && (
                            <Input
                            label="Community Toilets (Nos) - Estimated Cost"
                            type="number"
                            value={formData.sanitationCommunityToiletsCost || ""}
                            onChange={(e) => handleInputChange("sanitationCommunityToiletsCost", parseInt(e.target.value) || 0)}
                            name="sanitationCommunityToiletsCost"
                            error={getFieldError("sanitationCommunityToiletsCost")}
                            />
                            )}
                            
                            <Input
                            label="Seats in Community Toilets (Nos.) - Existing"
                            type="number"
                            value={formData.sanitationSeatsCommunityToiletsExisting || ""}
                            onChange={(e) => handleInputChange("sanitationSeatsCommunityToiletsExisting", e.target.value)}
                            required
                            name="sanitationSeatsCommunityToiletsExisting"
                            error={getFieldError("sanitationSeatsCommunityToiletsExisting")}
                            />
                            <Input
                            label="Seats in Community Toilets (Nos.) - Additional Requirement"
                            type="number"
                            value={formData.sanitationSeatsCommunityToiletsAdditional || ""}
                            onChange={(e) => handleInputChange("sanitationSeatsCommunityToiletsAdditional", e.target.value)}
                            required
                            name="sanitationSeatsCommunityToiletsAdditional"
                            error={getFieldError("sanitationSeatsCommunityToiletsAdditional")}
                            />
                            {(formData.sanitationSeatsCommunityToiletsAdditional || 0) > 0 && (
                            <Input
                            label="Seats in Community Toilets (Nos.) - Estimated Cost"
                            type="number"
                            value={formData.sanitationSeatsCommunityToiletsCost || ""}
                            onChange={(e) => handleInputChange("sanitationSeatsCommunityToiletsCost", parseInt(e.target.value) || 0)}
                            name="sanitationSeatsCommunityToiletsCost"
                            error={getFieldError("sanitationSeatsCommunityToiletsCost")}
                            />
                            )}
                            
                            <Input
                            label="Dumper Bins (Nos) - Existing"
                            type="number"
                            value={formData.sanitationDumperBinsExisting || ""}
                            onChange={(e) => handleInputChange("sanitationDumperBinsExisting", e.target.value)}
                            required
                            name="sanitationDumperBinsExisting"
                            error={getFieldError("sanitationDumperBinsExisting")}
                            />
                            <Input
                            label="Dumper Bins (Nos) - Additional Requirement"
                            type="number"
                            value={formData.sanitationDumperBinsAdditional || ""}
                            onChange={(e) => handleInputChange("sanitationDumperBinsAdditional", e.target.value)}
                            required
                            name="sanitationDumperBinsAdditional"
                            error={getFieldError("sanitationDumperBinsAdditional")}
                            />
                            {(formData.sanitationDumperBinsAdditional || 0) > 0 && (
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
                            <Input
                            label="Community Halls (No of Rooms) - Existing"
                            type="number"
                            value={formData.communityHallsExisting || ""}
                            onChange={(e) => handleInputChange("communityHallsExisting", e.target.value)}
                            required
                            name="communityHallsExisting"
                            error={getFieldError("communityHallsExisting")}
                            />
                            <Input
                            label="Community Halls (No of Rooms) - Additional Requirement"
                            type="number"
                            value={formData.communityHallsAdditional || ""}
                            onChange={(e) => handleInputChange("communityHallsAdditional", e.target.value)}
                            required
                            name="communityHallsAdditional"
                            error={getFieldError("communityHallsAdditional")}
                            />
                            {(formData.communityHallsAdditional || 0) > 0 && (
                            <Input
                            label="Community Halls (No of Rooms) - Estimated Cost"
                            type="number"
                            value={formData.communityHallsCost || ""}
                            onChange={(e) => handleInputChange("communityHallsCost", parseInt(e.target.value) || 0)}
                            name="communityHallsCost"
                            error={getFieldError("communityHallsCost")}
                            />
                            )}
                            
                            <Input
                            label="Livelihood / Production Centres (Noof Rooms) - Existing"
                            type="number"
                            value={formData.communityLivelihoodCentresExisting || ""}
                            onChange={(e) => handleInputChange("communityLivelihoodCentresExisting", e.target.value)}
                            required
                            name="communityLivelihoodCentresExisting"
                            error={getFieldError("communityLivelihoodCentresExisting")}
                            />
                            <Input
                            label="Livelihood / Production Centres (Noof Rooms) - Additional Requirement"
                            type="number"
                            value={formData.communityLivelihoodCentresAdditional || ""}
                            onChange={(e) => handleInputChange("communityLivelihoodCentresAdditional", e.target.value)}
                            required
                            name="communityLivelihoodCentresAdditional"
                            error={getFieldError("communityLivelihoodCentresAdditional")}
                            />
                            {(formData.communityLivelihoodCentresAdditional || 0) > 0 && (
                            <Input
                            label="Livelihood / Production Centres (Noof Rooms) - Estimated Cost"
                            type="number"
                            value={formData.communityLivelihoodCentresCost || ""}
                            onChange={(e) => handleInputChange("communityLivelihoodCentresCost", parseInt(e.target.value) || 0)}
                            name="communityLivelihoodCentresCost"
                            error={getFieldError("communityLivelihoodCentresCost")}
                            />
                            )}
                            
                            <Input
                            label="Anganwadis /Pre-schools (No ofRooms) - Existing"
                            type="number"
                            value={formData.communityAnganwadisExisting || ""}
                            onChange={(e) => handleInputChange("communityAnganwadisExisting", e.target.value)}
                            required
                            name="communityAnganwadisExisting"
                            error={getFieldError("communityAnganwadisExisting")}
                            />
                            <Input
                            label="Anganwadis /Pre-schools (No ofRooms) - Additional Requirement"
                            type="number"
                            value={formData.communityAnganwadisAdditional || ""}
                            onChange={(e) => handleInputChange("communityAnganwadisAdditional", e.target.value)}
                            required
                            name="communityAnganwadisAdditional"
                            error={getFieldError("communityAnganwadisAdditional")}
                            />
                            {(formData.communityAnganwadisAdditional || 0) > 0 && (
                            <Input
                            label="Anganwadis /Pre-schools (No ofRooms) - Estimated Cost"
                            type="number"
                            value={formData.communityAnganwadisCost || ""}
                            onChange={(e) => handleInputChange("communityAnganwadisCost", parseInt(e.target.value) || 0)}
                            name="communityAnganwadisCost"
                            error={getFieldError("communityAnganwadisCost")}
                            />
                            )}
                            
                            <Input
                            label="Primary Schools (No of Class Rooms) - Existing"
                            type="number"
                            value={formData.communityPrimarySchoolsExisting || ""}
                            onChange={(e) => handleInputChange("communityPrimarySchoolsExisting", e.target.value)}
                            required
                            name="communityPrimarySchoolsExisting"
                            error={getFieldError("communityPrimarySchoolsExisting")}
                            />
                            <Input
                            label="Primary Schools (No of Class Rooms) - Additional Requirement"
                            type="number"
                            value={formData.communityPrimarySchoolsAdditional || ""}
                            onChange={(e) => handleInputChange("communityPrimarySchoolsAdditional", e.target.value)}
                            required
                            name="communityPrimarySchoolsAdditional"
                            error={getFieldError("communityPrimarySchoolsAdditional")}
                            />
                            {(formData.communityPrimarySchoolsAdditional || 0) > 0 && (
                            <Input
                            label="Primary Schools (No of Class Rooms) - Estimated Cost"
                            type="number"
                            value={formData.communityPrimarySchoolsCost || ""}
                            onChange={(e) => handleInputChange("communityPrimarySchoolsCost", parseInt(e.target.value) || 0)}
                            name="communityPrimarySchoolsCost"
                            error={getFieldError("communityPrimarySchoolsCost")}
                            />
                            )}
                            
                            <Input
                            label="Health Centres (No. of Rooms) - Existing"
                            type="number"
                            value={formData.communityHealthCentresExisting || ""}
                            onChange={(e) => handleInputChange("communityHealthCentresExisting", e.target.value)}
                            required
                            name="communityHealthCentresExisting"
                            error={getFieldError("communityHealthCentresExisting")}
                            />
                            <Input
                            label="Health Centres (No. of Rooms) - Additional Requirement"
                            type="number"
                            value={formData.communityHealthCentresAdditional || ""}
                            onChange={(e) => handleInputChange("communityHealthCentresAdditional", e.target.value)}
                            required
                            name="communityHealthCentresAdditional"
                            error={getFieldError("communityHealthCentresAdditional")}
                            />
                            {(formData.communityHealthCentresAdditional || 0) > 0 && (
                            <Input
                            label="Health Centres (No. of Rooms) - Estimated Cost"
                            type="number"
                            value={formData.communityHealthCentresCost || ""}
                            onChange={(e) => handleInputChange("communityHealthCentresCost", parseInt(e.target.value) || 0)}
                            name="communityHealthCentresCost"
                            error={getFieldError("communityHealthCentresCost")}
                            />
                            )}
                            
                            <Input
                            label="Others (Specify) - Existing"
                            type="number"
                            value={formData.communityOthersExisting || ""}
                            onChange={(e) => handleInputChange("communityOthersExisting", e.target.value)}
                            required
                            name="communityOthersExisting"
                            error={getFieldError("communityOthersExisting")}
                            />
                            <Input
                            label="Others (Specify) - Additional Requirement"
                            type="number"
                            value={formData.communityOthersAdditional || ""}
                            onChange={(e) => handleInputChange("communityOthersAdditional", e.target.value)}
                            required
                            name="communityOthersAdditional"
                            error={getFieldError("communityOthersAdditional")}
                            />
                            {(formData.communityOthersAdditional || 0) > 0 && (
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
                        <Input
                        label="Electricity - Existing"
                        type="number"
                        value={formData.electricityExisting || ""}
                        onChange={(e) => handleInputChange("electricityExisting", e.target.value)}
                        required
                        name="electricityExisting"
                        error={getFieldError("electricityExisting")}
                        />
                        <Input
                        label="Electricity - Additional Requirement"
                        type="number"
                        value={formData.electricityAdditional || ""}
                        onChange={(e) => handleInputChange("electricityAdditional", e.target.value)}
                        required
                        name="electricityAdditional"
                        error={getFieldError("electricityAdditional")}
                        />
                        {(formData.electricityAdditional || 0) > 0 && (
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
                        <Input
                        label="Healthcare - Existing"
                        type="number"
                        value={formData.healthcareExisting || ""}
                        onChange={(e) => handleInputChange("healthcareExisting", e.target.value)}
                        required
                        name="healthcareExisting"
                        error={getFieldError("healthcareExisting")}
                        />
                        <Input
                        label="Healthcare - Additional Requirement"
                        type="number"
                        value={formData.healthcareAdditional || ""}
                        onChange={(e) => handleInputChange("healthcareAdditional", e.target.value)}
                        required
                        name="healthcareAdditional"
                        error={getFieldError("healthcareAdditional")}
                        />
                        {(formData.healthcareAdditional || 0) > 0 && (
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
                        <Input
                        label="Toilets - Existing"
                        type="number"
                        value={formData.toiletsExisting || ""}
                        onChange={(e) => handleInputChange("toiletsExisting", e.target.value)}
                        required
                        name="toiletsExisting"
                        error={getFieldError("toiletsExisting")}
                        />
                        <Input
                        label="Toilets - Additional Requirement"
                        type="number"
                        value={formData.toiletsAdditional || ""}
                        onChange={(e) => handleInputChange("toiletsAdditional", e.target.value)}
                        required
                        name="toiletsAdditional"
                        error={getFieldError("toiletsAdditional")}
                        />
                        {(formData.toiletsAdditional || 0) > 0 && (
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
                        <div className="p-2 bg-slate-800 rounded"><strong>State Code:</strong> {renderValue(formData.stateCode)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>State Name:</strong> {renderValue(formData.stateName)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>District Code:</strong> {renderValue(formData.districtCode)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>District Name:</strong> {renderValue(formData.districtName)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>ULB Code:</strong> {renderValue(formData.ulbCode)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>ULB Name:</strong> {renderValue(formData.ulbName)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>City/Town Code:</strong> {renderValue(formData.cityTownCode)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households in City/Town:</strong> {renderValue(formData.cityTownNoHouseholds, true)}</div>
                    </div>
                </div>
                
                {/* City/Town Slum Profile */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">2. City/Town Slum Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Type:</strong> {renderValue(formData.slumType)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum ID:</strong> {renderValue(formData.slumIdField)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Name:</strong> {renderValue(formData.slumName)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Ownership of Land:</strong> {renderValue(formData.ownershipLand)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Area (sq mtrs):</strong> {renderValue(formData.areaSqMtrs, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Slum Population:</strong> {renderValue(formData.slumPopulation, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Slum Households:</strong> {renderValue(formData.noSlumHouseholds, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population:</strong> {renderValue(formData.bplPopulation, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households:</strong> {renderValue(formData.bplHouseholds, true)}</div>
                    </div>
                </div>
                
                {/* Survey Operation */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">3. Particulars of Survey Operation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Surveyor Name:</strong> {renderValue(formData.surveyorName)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Survey Date:</strong> {renderValue(formData.surveyDate)}</div>
                    </div>
                </div>
                
                {/* Basic Information */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">4. Basic Information of Slum</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Ward Number:</strong> {renderValue(formData.wardNumber)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Ward Name:</strong> {renderValue(formData.wardName)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Zone Number:</strong> {renderValue(formData.zone)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Age of Slum (years):</strong> {renderValue(formData.ageSlumYears, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Location (Core/Fringe):</strong> {renderValue(formData.locationCoreOrFringe)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Type of Area Surrounding:</strong> {renderValue(formData.typeAreaSurrounding)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Physical Location of Slum:</strong> {renderValue(formData.physicalLocationSlum)}</div>
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
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population SC:</strong> {renderValue(formData.totalPopulationSlumSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population ST:</strong> {renderValue(formData.totalPopulationSlumST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population OBC:</strong> {renderValue(formData.totalPopulationSlumOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population Others:</strong> {renderValue(formData.totalPopulationSlumOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population:</strong> {renderValue(formData.totalPopulationSlumTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Population Minorities:</strong> {renderValue(formData.totalPopulationSlumMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population SC:</strong> {renderValue(formData.bplPopulationSlumSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population ST:</strong> {renderValue(formData.bplPopulationSlumST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population OBC:</strong> {renderValue(formData.bplPopulationSlumOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population Others:</strong> {renderValue(formData.bplPopulationSlumOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population:</strong> {renderValue(formData.bplPopulationSlumTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>BPL Population Minorities:</strong> {renderValue(formData.bplPopulationSlumMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households SC:</strong> {renderValue(formData.noHouseholdsSlumSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households ST:</strong> {renderValue(formData.noHouseholdsSlumST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households OBC:</strong> {renderValue(formData.noHouseholdsSlumOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households Others:</strong> {renderValue(formData.noHouseholdsSlumOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households:</strong> {renderValue(formData.noHouseholdsSlumTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Households Minorities:</strong> {renderValue(formData.noHouseholdsSlumMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households SC:</strong> {renderValue(formData.noBplHouseholdsSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households ST:</strong> {renderValue(formData.noBplHouseholdsST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households OBC:</strong> {renderValue(formData.noBplHouseholdsOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households Others:</strong> {renderValue(formData.noBplHouseholdsOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households Total:</strong> {renderValue(formData.noBplHouseholdsTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Households Minorities:</strong> {renderValue(formData.noBplHouseholdsMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households SC:</strong> {renderValue(formData.noWomenHeadedHouseholdsSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households ST:</strong> {renderValue(formData.noWomenHeadedHouseholdsST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households OBC:</strong> {renderValue(formData.noWomenHeadedHouseholdsOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households Others:</strong> {renderValue(formData.noWomenHeadedHouseholdsOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households Total:</strong> {renderValue(formData.noWomenHeadedHouseholdsTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Women Headed Households Minorities:</strong> {renderValue(formData.noWomenHeadedHouseholdsMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 SC:</strong> {renderValue(formData.noPersonsOlder65SC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 ST:</strong> {renderValue(formData.noPersonsOlder65ST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 OBC:</strong> {renderValue(formData.noPersonsOlder65OBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 Others:</strong> {renderValue(formData.noPersonsOlder65Others, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 Total:</strong> {renderValue(formData.noPersonsOlder65Total, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Older 65 Minorities:</strong> {renderValue(formData.noPersonsOlder65Minorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers SC:</strong> {renderValue(formData.noChildLabourersSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers ST:</strong> {renderValue(formData.noChildLabourersST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers OBC:</strong> {renderValue(formData.noChildLabourersOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers Others:</strong> {renderValue(formData.noChildLabourersOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers Total:</strong> {renderValue(formData.noChildLabourersTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Child Labourers Minorities:</strong> {renderValue(formData.noChildLabourersMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged SC:</strong> {renderValue(formData.noPhysicallyChallengedSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged ST:</strong> {renderValue(formData.noPhysicallyChallengedST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged OBC:</strong> {renderValue(formData.noPhysicallyChallengedOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged Others:</strong> {renderValue(formData.noPhysicallyChallengedOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged Total:</strong> {renderValue(formData.noPhysicallyChallengedTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Physically Challenged Minorities:</strong> {renderValue(formData.noPhysicallyChallengedMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged SC:</strong> {renderValue(formData.noMentallyChallengedSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged ST:</strong> {renderValue(formData.noMentallyChallengedST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged OBC:</strong> {renderValue(formData.noMentallyChallengedOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged Others:</strong> {renderValue(formData.noMentallyChallengedOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged Total:</strong> {renderValue(formData.noMentallyChallengedTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Mentally Challenged Minorities:</strong> {renderValue(formData.noMentallyChallengedMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS SC:</strong> {renderValue(formData.noPersonsHivaidsSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS ST:</strong> {renderValue(formData.noPersonsHivaidsST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS OBC:</strong> {renderValue(formData.noPersonsHivaidsOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS Others:</strong> {renderValue(formData.noPersonsHivaidsOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS Total:</strong> {renderValue(formData.noPersonsHivaidsTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons HIV/AIDS Minorities:</strong> {renderValue(formData.noPersonsHivaidsMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis SC:</strong> {renderValue(formData.noPersonsTuberculosisSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis ST:</strong> {renderValue(formData.noPersonsTuberculosisST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis OBC:</strong> {renderValue(formData.noPersonsTuberculosisOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis Others:</strong> {renderValue(formData.noPersonsTuberculosisOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis Total:</strong> {renderValue(formData.noPersonsTuberculosisTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Tuberculosis Minorities:</strong> {renderValue(formData.noPersonsTuberculosisMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory SC:</strong> {renderValue(formData.noPersonsRespiratorySC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory ST:</strong> {renderValue(formData.noPersonsRespiratoryST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory OBC:</strong> {renderValue(formData.noPersonsRespiratoryOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory Others:</strong> {renderValue(formData.noPersonsRespiratoryOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory Total:</strong> {renderValue(formData.noPersonsRespiratoryTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Respiratory Minorities:</strong> {renderValue(formData.noPersonsRespiratoryMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic SC:</strong> {renderValue(formData.noPersonsOtherChronicSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic ST:</strong> {renderValue(formData.noPersonsOtherChronicST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic OBC:</strong> {renderValue(formData.noPersonsOtherChronicOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic Others:</strong> {renderValue(formData.noPersonsOtherChronicOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic Total:</strong> {renderValue(formData.noPersonsOtherChronicTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Persons Other Chronic Minorities:</strong> {renderValue(formData.noPersonsOtherChronicMinorities, true)}</div>
                    </div>

                    <h3 className="text-lg font-medium mt-3 mb-3 bg-blue-500 p-2 rounded text-black-800">Literacy & Education</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons SC:</strong> {renderValue(formData.totalIlliteratePersonsSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons ST:</strong> {renderValue(formData.totalIlliteratePersonsST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons OBC:</strong> {renderValue(formData.totalIlliteratePersonsOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons Others:</strong> {renderValue(formData.totalIlliteratePersonsOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons Total:</strong> {renderValue(formData.totalIlliteratePersonsTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Total Illiterate Persons Minorities:</strong> {renderValue(formData.totalIlliteratePersonsMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate SC:</strong> {renderValue(formData.noMaleIlliterateSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate ST:</strong> {renderValue(formData.noMaleIlliterateST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate OBC:</strong> {renderValue(formData.noMaleIlliterateOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate Others:</strong> {renderValue(formData.noMaleIlliterateOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate Total:</strong> {renderValue(formData.noMaleIlliterateTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male Illiterate Minorities:</strong> {renderValue(formData.noMaleIlliterateMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate SC:</strong> {renderValue(formData.noFemaleIlliterateSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate ST:</strong> {renderValue(formData.noFemaleIlliterateST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate OBC:</strong> {renderValue(formData.noFemaleIlliterateOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate Others:</strong> {renderValue(formData.noFemaleIlliterateOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate Total:</strong> {renderValue(formData.noFemaleIlliterateTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female Illiterate Minorities:</strong> {renderValue(formData.noFemaleIlliterateMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons SC:</strong> {renderValue(formData.noBplIlliteratePersonsSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons ST:</strong> {renderValue(formData.noBplIlliteratePersonsST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons OBC:</strong> {renderValue(formData.noBplIlliteratePersonsOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons Others:</strong> {renderValue(formData.noBplIlliteratePersonsOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons Total:</strong> {renderValue(formData.noBplIlliteratePersonsTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of BPL Illiterate Persons Minorities:</strong> {renderValue(formData.noBplIlliteratePersonsMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate SC:</strong> {renderValue(formData.noMaleBplIlliterateSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate ST:</strong> {renderValue(formData.noMaleBplIlliterateST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate OBC:</strong> {renderValue(formData.noMaleBplIlliterateOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate Others:</strong> {renderValue(formData.noMaleBplIlliterateOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate Total:</strong> {renderValue(formData.noMaleBplIlliterateTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Male BPL Illiterate Minorities:</strong> {renderValue(formData.noMaleBplIlliterateMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate SC:</strong> {renderValue(formData.noFemaleBplIlliterateSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate ST:</strong> {renderValue(formData.noFemaleBplIlliterateST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate OBC:</strong> {renderValue(formData.noFemaleBplIlliterateOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate Others:</strong> {renderValue(formData.noFemaleBplIlliterateOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate Total:</strong> {renderValue(formData.noFemaleBplIlliterateTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>No. of Female BPL Illiterate Minorities:</strong> {renderValue(formData.noFemaleBplIlliterateMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male SC:</strong> {renderValue(formData.schoolDropoutsMaleSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male ST:</strong> {renderValue(formData.schoolDropoutsMaleST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male OBC:</strong> {renderValue(formData.schoolDropoutsMaleOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male Others:</strong> {renderValue(formData.schoolDropoutsMaleOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male Total:</strong> {renderValue(formData.schoolDropoutsMaleTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Male Minorities:</strong> {renderValue(formData.schoolDropoutsMaleMinorities, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female SC:</strong> {renderValue(formData.schoolDropoutsFemaleSC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female ST:</strong> {renderValue(formData.schoolDropoutsFemaleST, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female OBC:</strong> {renderValue(formData.schoolDropoutsFemaleOBC, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female Others:</strong> {renderValue(formData.schoolDropoutsFemaleOthers, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female Total:</strong> {renderValue(formData.schoolDropoutsFemaleTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>School Dropouts Female Minorities:</strong> {renderValue(formData.schoolDropoutsFemaleMinorities, true)}</div>
                    </div>
                </div>
                
                {/* Housing Status */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">7. Housing Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units Pucca:</strong> {renderValue(formData.dwellingUnitsPucca, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units Semi-Pucca:</strong> {renderValue(formData.dwellingUnitsSemiPucca, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units Katcha:</strong> {renderValue(formData.dwellingUnitsKatcha, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units Total:</strong> {renderValue(formData.dwellingUnitsTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units with Electricity Pucca:</strong> {renderValue(formData.dwellingUnitsWithElectricityPucca, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units with Electricity Semi-Pucca:</strong> {renderValue(formData.dwellingUnitsWithElectricitySemiPucca, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units with Electricity Katcha:</strong> {renderValue(formData.dwellingUnitsWithElectricityKatcha, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Dwelling Units with Electricity Total:</strong> {renderValue(formData.dwellingUnitsWithElectricityTotal, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure with Patta:</strong> {renderValue(formData.landTenureWithPatta, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Possession Certificate:</strong> {renderValue(formData.landTenurePossessionCertificate, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Encroached Private:</strong> {renderValue(formData.landTenureEncroachedPrivate, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Encroached Public:</strong> {renderValue(formData.landTenureEncroachedPublic, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure On Rent:</strong> {renderValue(formData.landTenureOnRent, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Other:</strong> {renderValue(formData.landTenureOther, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Land Tenure Total:</strong> {renderValue(formData.landTenureTotal, true)}</div>
                    </div>
                </div>
                
                {/* Economic Status */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">8. Economic Status of Households</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>&lt; Rs 500:</strong> {renderValue(formData.economicStatus?.lessThan500, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Rs 500-1000:</strong> {renderValue(formData.economicStatus?.rs500to1000, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Rs 1000-1500:</strong> {renderValue(formData.economicStatus?.rs1000to1500, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Rs 1500-2000:</strong> {renderValue(formData.economicStatus?.rs1500to2000, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Rs 2000-3000:</strong> {renderValue(formData.economicStatus?.rs2000to3000, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>&gt; Rs 3000:</strong> {renderValue(formData.economicStatus?.moreThan3000, true)}</div>
                    </div>
                </div>
                
                {/* Employment and Occupation Status */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">9. Employment and Occupation Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Self Employed:</strong> {renderValue(formData.occupationalStatus?.selfEmployed, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Salaried:</strong> {renderValue(formData.occupationalStatus?.salaried, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Regular Wage:</strong> {renderValue(formData.occupationalStatus?.regularWage, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Casual Labour:</strong> {renderValue(formData.occupationalStatus?.casualLabour, true)}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Others:</strong> {renderValue(formData.occupationalStatus?.others, true)}</div>
                    </div>
                </div>
                
                {/* Physical Infrastructure */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-gray-500 p-2 rounded text-black-800">10. Access to Physical Infrastructure</h3>
                    <h3 className="text-lg font-medium mb-3 bg-blue-500 p-2 rounded text-black-800">Source of Drinking Water</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><strong>Individual Tap:</strong> {formData.sourceDrinkingWater?.individualTap || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Tubewell/Borewell/Handpump:</strong> {formData.sourceDrinkingWater?.tubewellBorewellHandpump || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Public Tap:</strong> {formData.sourceDrinkingWater?.publicTap || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Open Well:</strong> {formData.sourceDrinkingWater?.openwell || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Tank/Pond:</strong> {formData.sourceDrinkingWater?.tankPond || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>River/Canal/Lake/Spring:</strong> {formData.sourceDrinkingWater?.riverCanalLakeSpring || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Water Tanker:</strong> {formData.sourceDrinkingWater?.waterTanker || 'N/A'}</div>
                        <div className="p-2 bg-slate-800 rounded"><strong>Others:</strong> {formData.sourceDrinkingWater?.others || 'N/A'}</div>
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
                        <div className="p-2 bg-slate-800 rounded"><strong>Street Light Availability:</strong> {formData.streetLightAvailable || 'N/A'}</div>
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
                        <div className="p-2 bg-blue-500 rounded col-span-2"><strong>Water Supply</strong></div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Pipelines Existing:</strong> {renderValue(formData.waterSupplyPipelinesExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Pipelines Additional:</strong> {renderValue(formData.waterSupplyPipelinesAdditional, true)}</div>
                        {renderValue(formData.waterSupplyPipelinesAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Pipelines Estimated Cost:</strong> {renderValue(formData.waterSupplyPipelinesCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Individual Taps Existing:</strong> {renderValue(formData.waterSupplyIndividualTapsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Individual Taps Additional:</strong> {renderValue(formData.waterSupplyIndividualTapsAdditional, true)}</div>
                        {renderValue(formData.waterSupplyIndividualTapsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Individual Taps Estimated Cost:</strong> {renderValue(formData.waterSupplyIndividualTapsCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Borewells Existing:</strong> {renderValue(formData.waterSupplyBorewellsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Borewells Additional:</strong> {renderValue(formData.waterSupplyBorewellsAdditional, true)}</div>
                        {renderValue(formData.waterSupplyBorewellsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Borewells Estimated Cost:</strong> {renderValue(formData.waterSupplyBorewellsCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Trunk Lines Existing:</strong> {renderValue(formData.waterSupplyConnectivityTrunkLinesExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Trunk Lines Additional:</strong> {renderValue(formData.waterSupplyConnectivityTrunkLinesAdditional, true)}</div>
                        {renderValue(formData.waterSupplyConnectivityTrunkLinesAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Trunk Lines Estimated Cost:</strong> {renderValue(formData.waterSupplyConnectivityTrunkLinesCost, true)}</div> : null}
                        
                        {/* Drainage/Sewerage */}
                        <div className="p-2 bg-blue-500 rounded col-span-2 mt-4"><strong>Drainage/Sewerage</strong></div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Stormwater Drainage Existing:</strong> {renderValue(formData.drainageStormwaterDrainageExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Stormwater Drainage Additional:</strong> {renderValue(formData.drainageStormwaterDrainageAdditional, true)}</div>
                        {renderValue(formData.drainageStormwaterDrainageAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Stormwater Drainage Estimated Cost:</strong> {renderValue(formData.drainageStormwaterDrainageCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Main Drains Existing:</strong> {renderValue(formData.drainageConnectivityMainDrainsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Main Drains Additional:</strong> {renderValue(formData.drainageConnectivityMainDrainsAdditional, true)}</div>
                        {renderValue(formData.drainageConnectivityMainDrainsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Main Drains Estimated Cost:</strong> {renderValue(formData.drainageConnectivityMainDrainsCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Sewer Lines Existing:</strong> {renderValue(formData.drainageSewerLinesExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Sewer Lines Additional:</strong> {renderValue(formData.drainageSewerLinesAdditional, true)}</div>
                        {renderValue(formData.drainageSewerLinesAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Sewer Lines Estimated Cost:</strong> {renderValue(formData.drainageSewerLinesCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Trunk Sewers Existing:</strong> {renderValue(formData.drainageConnectivityTrunkSewersExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Trunk Sewers Additional:</strong> {renderValue(formData.drainageConnectivityTrunkSewersAdditional, true)}</div>
                        {renderValue(formData.drainageConnectivityTrunkSewersAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Connectivity Trunk Sewers Estimated Cost:</strong> {renderValue(formData.drainageConnectivityTrunkSewersCost, true)}</div> : null}
                        
                        {/* Roads */}
                        <div className="p-2 bg-blue-500 rounded col-span-2 mt-4"><strong>Roads</strong></div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads CC Existing:</strong> {renderValue(formData.roadsInternalRoadsCCExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads CC Additional:</strong> {renderValue(formData.roadsInternalRoadsCCAdditional, true)}</div>
                        {renderValue(formData.roadsInternalRoadsCCAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads CC Estimated Cost:</strong> {renderValue(formData.roadsInternalRoadsCCCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads BT Existing:</strong> {renderValue(formData.roadsInternalRoadsBTExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads BT Additional:</strong> {renderValue(formData.roadsInternalRoadsBTAdditional, true)}</div>
                        {renderValue(formData.roadsInternalRoadsBTAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads BT Estimated Cost:</strong> {renderValue(formData.roadsInternalRoadsBTCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads Others Existing:</strong> {renderValue(formData.roadsInternalRoadsOthersExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads Others Additional:</strong> {renderValue(formData.roadsInternalRoadsOthersAdditional, true)}</div>
                        {renderValue(formData.roadsInternalRoadsOthersAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Internal Roads Others Estimated Cost:</strong> {renderValue(formData.roadsInternalRoadsOthersCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Approach Roads CC Existing:</strong> {renderValue(formData.roadsApproachRoadsCCExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Approach Roads CC Additional:</strong> {renderValue(formData.roadsApproachRoadsCCAdditional, true)}</div>
                        {renderValue(formData.roadsApproachRoadsCCAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Approach Roads CC Estimated Cost:</strong> {renderValue(formData.roadsApproachRoadsCCCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Approach Roads Others Existing:</strong> {renderValue(formData.roadsApproachRoadsOthersExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Approach Roads Others Additional:</strong> {renderValue(formData.roadsApproachRoadsOthersAdditional, true)}</div>
                        {renderValue(formData.roadsApproachRoadsOthersAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Approach Roads Others Estimated Cost:</strong> {renderValue(formData.roadsApproachRoadsOthersCost, true)}</div> : null}
                        
                        {/* Street Lighting */}
                        <div className="p-2 bg-blue-500 rounded col-span-2 mt-4"><strong>Street Lighting</strong></div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Poles Existing:</strong> {renderValue(formData.streetLightingPolesExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Poles Additional:</strong> {renderValue(formData.streetLightingPolesAdditional, true)}</div>
                        {renderValue(formData.streetLightingPolesAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Poles Estimated Cost:</strong> {renderValue(formData.streetLightingPolesCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Lights Existing:</strong> {renderValue(formData.streetLightingLightsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Lights Additional:</strong> {renderValue(formData.streetLightingLightsAdditional, true)}</div>
                        {renderValue(formData.streetLightingLightsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Lights Estimated Cost:</strong> {renderValue(formData.streetLightingLightsCost, true)}</div> : null}
                        
                        {/* Sanitation */}
                        <div className="p-2 bg-blue-500 rounded col-span-2 mt-4"><strong>Sanitation</strong></div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Individual Toilets Existing:</strong> {renderValue(formData.sanitationIndividualToiletsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Individual Toilets Additional:</strong> {renderValue(formData.sanitationIndividualToiletsAdditional, true)}</div>
                        {renderValue(formData.sanitationIndividualToiletsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Individual Toilets Estimated Cost:</strong> {renderValue(formData.sanitationIndividualToiletsCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Community Toilets Existing:</strong> {renderValue(formData.sanitationCommunityToiletsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Community Toilets Additional:</strong> {renderValue(formData.sanitationCommunityToiletsAdditional, true)}</div>
                        {renderValue(formData.sanitationCommunityToiletsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Community Toilets Estimated Cost:</strong> {renderValue(formData.sanitationCommunityToiletsCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Seats in Community Toilets Existing:</strong> {renderValue(formData.sanitationSeatsCommunityToiletsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Seats in Community Toilets Additional:</strong> {renderValue(formData.sanitationSeatsCommunityToiletsAdditional, true)}</div>
                        {renderValue(formData.sanitationSeatsCommunityToiletsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Seats in Community Toilets Estimated Cost:</strong> {renderValue(formData.sanitationSeatsCommunityToiletsCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Dumper Bins Existing:</strong> {renderValue(formData.sanitationDumperBinsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Dumper Bins Additional:</strong> {renderValue(formData.sanitationDumperBinsAdditional, true)}</div>
                        {renderValue(formData.sanitationDumperBinsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Dumper Bins Estimated Cost:</strong> {renderValue(formData.sanitationDumperBinsCost, true)}</div> : null}
                        
                        {/* Community Facilities */}
                        <div className="p-2 bg-blue-500 rounded col-span-2 mt-4"><strong>Community Facilities</strong></div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Community Halls Existing:</strong> {renderValue(formData.communityHallsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Community Halls Additional:</strong> {renderValue(formData.communityHallsAdditional, true)}</div>
                        {renderValue(formData.communityHallsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Community Halls Estimated Cost:</strong> {renderValue(formData.communityHallsCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Livelihood Centres Existing:</strong> {renderValue(formData.communityLivelihoodCentresExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Livelihood Centres Additional:</strong> {renderValue(formData.communityLivelihoodCentresAdditional, true)}</div>
                        {renderValue(formData.communityLivelihoodCentresAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Livelihood Centres Estimated Cost:</strong> {renderValue(formData.communityLivelihoodCentresCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Anganwadis Existing:</strong> {renderValue(formData.communityAnganwadisExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Anganwadis Additional:</strong> {renderValue(formData.communityAnganwadisAdditional, true)}</div>
                        {renderValue(formData.communityAnganwadisAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Anganwadis Estimated Cost:</strong> {renderValue(formData.communityAnganwadisCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Primary Schools Existing:</strong> {renderValue(formData.communityPrimarySchoolsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Primary Schools Additional:</strong> {renderValue(formData.communityPrimarySchoolsAdditional, true)}</div>
                        {renderValue(formData.communityPrimarySchoolsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Primary Schools Estimated Cost:</strong> {renderValue(formData.communityPrimarySchoolsCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Health Centres Existing:</strong> {renderValue(formData.communityHealthCentresExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Health Centres Additional:</strong> {renderValue(formData.communityHealthCentresAdditional, true)}</div>
                        {renderValue(formData.communityHealthCentresAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Health Centres Estimated Cost:</strong> {renderValue(formData.communityHealthCentresCost, true)}</div> : null}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Others Existing:</strong> {renderValue(formData.communityOthersExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Others Additional:</strong> {renderValue(formData.communityOthersAdditional, true)}</div>
                        {renderValue(formData.communityOthersAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Others Estimated Cost:</strong> {renderValue(formData.communityOthersCost, true)}</div> : null}
                    </div>
                </div>
                
                {/* Standalone Infrastructure Requirements */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 bg-blue-500 p-2 rounded text-black-800">Standalone Infrastructure Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Electricity */}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Electricity Existing:</strong> {renderValue(formData.electricityExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Electricity Additional:</strong> {renderValue(formData.electricityAdditional, true)}</div>
                        {renderValue(formData.electricityAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Electricity Estimated Cost:</strong> {renderValue(formData.electricityCost, true)}</div> : null}
                        
                        {/* Healthcare */}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Healthcare Existing:</strong> {renderValue(formData.healthcareExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Healthcare Additional:</strong> {renderValue(formData.healthcareAdditional, true)}</div>
                        {renderValue(formData.healthcareAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Healthcare Estimated Cost:</strong> {renderValue(formData.healthcareCost, true)}</div> : null}
                        
                        {/* Toilets */}
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Toilets Existing:</strong> {renderValue(formData.toiletsExisting, true)}</div>
                        <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Toilets Additional:</strong> {renderValue(formData.toiletsAdditional, true)}</div>
                        {renderValue(formData.toiletsAdditional, true) > 0 ? <div className="p-2 bg-slate-800 rounded col-span-2"><strong>Toilets Estimated Cost:</strong> {renderValue(formData.toiletsCost, true)}</div> : null}
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
                    className="w-full sm:w-auto cursor-pointer"
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
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 w-full sm:w-auto cursor-pointer"
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
                            className="bg-green-600 hover:bg-green-500 w-full sm:w-auto cursor-pointer"
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
