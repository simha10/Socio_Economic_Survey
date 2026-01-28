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
import apiService from '@/services/api';
import { useToast } from '@/components/Toast';

interface SlumSurveyForm {
  slumId: string;
  surveyed: boolean;
  completionPercentage?: number;
  // Part A - General Information - City/Town
  stateCode?: string;
  stateName?: string;
  districtCode?: string;
  districtName?: string;
  cityTownCode?: string;
  cityTownName?: string;
  cityTownNoHouseholds?: number;
  
  // Part B - City/Town Slum Profile
  slumType?: string; // Notified / Non-Notified / New Identified
  slumIdField?: string;
  slumName?: string;
  ownershipLand?: string; // Local Body -01, State Government - 02, Central Government – 03, Private -04, Other - 05
  areaSqMtrs?: number;
  slumPopulation?: number;
  noSlumHouseholds?: number;
  bplPopulation?: number;
  noBplHouseholds?: number;
  
  // Part C - Particulars of Survey Operation
  surveyorName?: string;
  surveyDate?: string;
  receiptQuestionnaireDate?: string;
  scrutinyDate?: string;
  receiptByNodalCellDate?: string;
  remarksInvestigator?: string;
  commentsSupervisor?: string;
  
  // Part D - Basic Information on Slum
  slumCode?: string;
  locationWard?: string;
  ageSlumYears?: number;
  areaSlumSqMtrs?: number;
  locationCoreOrFringe?: string; // Core City/Town - 01, Fringe Area -02
  typeAreaSurrounding?: string; // Residential - 01, Industrial - 02, Commercial - 03, Institutional-04, Other-49
  physicalLocationSlum?: string; // Along Nallah -01, Along Other Drains - 02, etc.
  isSlumNotified?: string; // Yes-01, No-02
  yearOfNotification?: number;
  
  // Part E - Land Status
  ownershipLandDetail?: string; // Public: Local Body -01, State Government - 02, etc.
  ownershipLandSpecify?: string;
  
  // Part K - Access to Physical Infrastructure (dropdowns)
  connectivityCityWaterSupply?: string; // Fully connected 01, Partially connected 02, Not connected 03
  drainageSewerageFacility?: string; // YES/NO
  connectivityStormWaterDrainage?: string; // Fully connected 01, Partially connected 02, Not connected 03
  connectivitySewerageSystem?: string; // Fully connected 01, Partially connected 02, Not connected 03
  proneToFlooding?: string; // Not prone - 01, Upto 15 days - 02, 15-30 Days - 03, More than a Month - 04
  latrineFacility?: string[]; // Public Latrine, Shared latrine, own latrine
  solidWasteManagement?: string;
  frequencyGarbageDisposal?: string; // Daily -01, Once in 2 days - 02, etc.
  arrangementGarbageDisposal?: string; // Municipal staff - 01, Municipal Contractor - 02, etc.
  frequencyClearanceOpenDrains?: string; // Daily-01, Once in 2 days - 02, etc.
  approachRoadType?: string; // Motorable pucca -01, Motorable katcha -02, etc.
  distanceNearestMotorableRoad?: string; // Less than 0.5 kms -01, 0.5 to 1.0 km .- 02, etc.
  internalRoadType?: string; // Motorable pucca-01, Motorable kutcha-02, etc.
  streetLightAvailable?: string; // Yes-01, No-02
  
  // Water and Sanitation fields
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
  waterSupplyDuration?: string;
  distanceToWaterSource?: string;
  typeOfToilet?: string;
  toiletAccessibility?: string;
  bathingFacility?: string;
  wastewaterDisposal?: string;
  drainageSystem?: string;
  
  // Part M - Health Facilities (dropdowns)
  urbanHealthPost?: string;
  primaryHealthCentre?: string;
  governmentHospital?: string;
  maternityCentre?: string;
  privateClinic?: string;
  rmp?: string;
  ayurvedicDoctor?: string;
  
  // Part N - Social Development/Welfare (dropdowns)
  slumDwellersAssociation?: string; // Yes- 01, No- 02
  
  // Housing conditions
  typeOfStructure?: string;
  
  // Part F - Population & Health
  totalPopulationSlum?: number;
  totalPopulationSlumSC?: number;
  totalPopulationSlumST?: number;
  totalPopulationSlumOBC?: number;
  totalPopulationSlumOthers?: number;
  totalPopulationSlumMinorities?: number;
  
  bplPopulationSlum?: number;
  bplPopulationSlumSC?: number;
  bplPopulationSlumST?: number;
  bplPopulationSlumOBC?: number;
  bplPopulationSlumOthers?: number;
  bplPopulationSlumMinorities?: number;
  
  noHouseholdsSlum?: number;
  noHouseholdsSlumSC?: number;
  noHouseholdsSlumST?: number;
  noHouseholdsSlumOBC?: number;
  noHouseholdsSlumOthers?: number;
  noHouseholdsSlumMinorities?: number;
  
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
  
  // Part G - Literacy - Education
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
  
  // Part H - Housing Status
  dwellingUnitsPucca?: number;
  dwellingUnitsSemiPucca?: number;
  dwellingUnitsKatcha?: number;
  dwellingUnitsTotal?: number;
  
  dwellingUnitsWithElectricityPucca?: number;
  dwellingUnitsWithElectricitySemiPucca?: number;
  dwellingUnitsWithElectricityKatcha?: number;
  dwellingUnitsWithElectricityTotal?: number;
  
  landTenureWithPatta?: number;
  landTenurePossessionCertificate?: number;
  landTenureEncroachedPrivate?: number;
  landTenureEncroachedPublic?: number;
  landTenureOnRent?: number;
  landTenureOther?: number;
  landTenureTotal?: number;
  
  // Part I - Economic Status of Households
  economicStatus?: {
    lessThan500?: number;
    rs500to1000?: number;
    rs1000to1500?: number;
    rs1500to2000?: number;
    rs2000to3000?: number;
    moreThan3000?: number;
  };
  
  // Part J - Occupation Status of Households
  occupationalStatus?: {
    selfEmployed?: number;
    salaried?: number;
    regularWage?: number;
    casualLabour?: number;
    others?: number;
  };
  
  // Part K - Access to Physical Infrastructure
  
  // Part L - Education Facilities
  anganwadiUnderIcds?: number;
  municipalPreschool?: number;
  privatePreschool?: number;
  municipalPrimarySchool?: number;
  stateGovtPrimarySchool?: number;
  privatePrimarySchool?: number;
  municipalHighSchool?: number;
  stateGovtHighSchool?: number;
  privateHighSchool?: number;
  adultEducationCentre?: number;
  nonFormalEducationCentre?: number;
  
  // Part M - Health Facilities
  
  // Part N - Social Development/Welfare
  communityHall?: number;
  livelihoodProductionCentre?: number;
  vocationalTrainingCentre?: number;
  streetChildrenRehabilitationCentre?: number;
  nightShelter?: number;
  oldAgeHome?: number;
  
  oldAgePensionsHolders?: number;
  widowPensionsHolders?: number;
  disabledPensionsHolders?: number;
  generalInsuranceCovered?: number;
  healthInsuranceCovered?: number;
  
  selfHelpGroups?: number;
  thriftCreditSocieties?: number;
  youthAssociations?: number;
  womensAssociations?: number;
  
  // General fields (some existing)
  generalPopulationAccess?: string;
  waterSupply?: string;
  waterLoggingArea?: string;
  wastePlacement?: string;
  sanitationFacilities?: string[];
  notes?: string;
}

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
    latrineFacility: [],
    solidWasteManagement: "",
    frequencyGarbageDisposal: "",
    arrangementGarbageDisposal: "",
    frequencyClearanceOpenDrains: "",
    approachRoadType: "",
    distanceNearestMotorableRoad: "",
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
  });

  const steps = [
    { title: "Basic Information", id: "basicInformation" },
    { title: "Land Status", id: "landStatus" },
    { title: "Population & Health", id: "populationAndHealth" },
    { title: "Literacy & Education", id: "literacyAndEducation" },
    { title: "Employment & Occupation", id: "employmentAndOccupation" },
    { title: "Water & Sanitation", id: "waterAndSanitation" },
    { title: "Housing Conditions", id: "housingConditions" },
    { title: "Utilities", id: "utilities" },
    { title: "Social Infrastructure", id: "socialInfrastructure" },
    { title: "Transportation", id: "transportationAndAccessibility" },
    { title: "Environmental Conditions", id: "environmentalConditions" },
    { title: "Social Issues", id: "socialIssuesAndVulnerableGroups" },
    { title: "Slum Improvement", id: "slumImprovementAndDevelopment" },
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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (!slumSurvey?._id) {
        showToast("Survey not initialized properly", "error");
        return;
      }
      
      // Transform form data to match backend model structure
      const surveyData = {
        basicInformation: {
          slumName: formData.slumName || "",
          slumCode: formData.slumCode || "",
          locationWardNo: formData.locationWard || "",
          ageOfSlumYears: formData.ageSlumYears || 0,
          areaOfSlumSqMeters: formData.areaSlumSqMtrs?.toString() || "",
          locatedInCoreCityOrFringe: formData.locationCoreOrFringe || "",
          typeOfAreaSurrounding: formData.typeAreaSurrounding || "",
          physicalLocationOfSlum: formData.physicalLocationSlum || "",
          isSlumNotified: formData.isSlumNotified || "",
          yearOfNotificationIfYes: formData.yearOfNotification?.toString() || ""
        },
        landStatus: {
          ownershipOfLand: formData.ownershipLandDetail || "",
          specifyOwnership: formData.ownershipLandSpecify || ""
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
        employmentAndOccupation: {
          mainOccupation: '', // Need to add field for this
          secondaryOccupation: '', // Need to add field for this
          percentageEmployment: 0, // Need to add field for this
          unemploymentRate: 0, // Need to add field for this
          majorIndustriesPresent: [] // Need to add field for this
        },
        waterAndSanitation: {
          sourceOfDrinkingWater: formData.sourceDrinkingWater || {},
          waterSupplyDuration: formData.waterSupplyDuration || '',
          distanceToWaterSource: formData.distanceToWaterSource || '',
          typeOfToilet: formData.typeOfToilet || '',
          toiletAccessibility: formData.toiletAccessibility || '',
          bathingFacility: formData.bathingFacility || '',
          wastewaterDisposal: formData.wastewaterDisposal || '',
          drainageSystem: formData.drainageSystem || '',
          connectivityToCityWaterSupply: formData.connectivityCityWaterSupply || "",
          drainageSewerageFacility: formData.drainageSewerageFacility || "",
          connectivityToStormWaterDrainage: formData.connectivityStormWaterDrainage || "",
          connectivityToSewerageSystem: formData.connectivitySewerageSystem || "",
          proneToFlooding: formData.proneToFlooding || "",
          latrineFacility: formData.latrineFacility || [],
          solidWasteManagement: formData.solidWasteManagement || "",
          frequencyGarbageDisposal: formData.frequencyGarbageDisposal || "",
          arrangementGarbageDisposal: formData.arrangementGarbageDisposal || "",
          frequencyClearanceOpenDrains: formData.frequencyClearanceOpenDrains || "",
          streetLightAvailable: formData.streetLightAvailable || "",
        },
        housingConditions: {
          typeOfStructure: formData.typeOfToilet || '', // Using existing field temporarily
          roofType: '', // Need to add field for this
          wallType: '', // Need to add field for this
          floorType: '', // Need to add field for this
          averageHouseSize: '', // Need to add field for this
          overcrowding: '', // Need to add field for this
          damageAssessment: '', // Need to add field for this
          approachRoadType: formData.approachRoadType || '',
          distanceNearestMotorableRoad: formData.distanceNearestMotorableRoad || '',
          internalRoadType: formData.internalRoadType || ''
        },
        utilities: {
          electricityConnection: '', // Need to add field for this
          electricityType: '', // Need to add field for this
          gasConnection: '', // Need to add field for this
          wasteManagement: '', // Need to add field for this
          publicToilets: 0, // Need to add field for this
          publicBaths: 0, // Need to add field for this
          streetLights: '' // Need to add field for this
        },
        socialInfrastructure: {
          schools: {
            primarySchools: formData.municipalPrimarySchool || 0,
            middleSchools: formData.municipalHighSchool || 0,
            secondarySchools: formData.stateGovtHighSchool || 0,
            anganwadiCenters: formData.anganwadiUnderIcds || 0
          },
          healthFacilities: {
            healthCenters: formData.urbanHealthPost ? (formData.urbanHealthPost === "YES" ? 1 : 0) : 0,
            hospitals: formData.governmentHospital ? (formData.governmentHospital === "YES" ? 1 : 0) : 0,
            primaryHealthCenters: formData.primaryHealthCentre ? (formData.primaryHealthCentre === "YES" ? 1 : 0) : 0,
            subcenters: 0, // Need to add field for this
            maternityCentre: formData.maternityCentre || "",
            privateClinic: formData.privateClinic || "",
            rmp: formData.rmp || "",
            ayurvedicDoctor: formData.ayurvedicDoctor || ""
          },
          communityHalls: formData.communityHall || 0,
          playgrounds: 0, // Need to add field for this
          communityCenter: '' // Need to add field for this
        },
        // Social development section
        socialIssuesAndVulnerableGroups: {
          slumDwellersAssociation: formData.slumDwellersAssociation || "",
          childLabourPresence: '', // Need to add field for this
          childMarriagePresence: '', // Need to add field for this
          humanTraffickingPresence: '', // Need to add field for this
          domesticViolenceReports: '', // Need to add field for this
          communityOrganizations: 0, // Need to add field for this
          NGOsOperating: 0, // Need to add field for this
          majorChallenges: [] // Need to add field for this
        },
        transportationAndAccessibility: {
          roadCondition: '', // Need to add field for this
          publictransitAccess: '', // Need to add field for this
          roadWidth: '', // Need to add field for this
          mainTransportMode: [], // Need to add field for this
          accessibilityForDisabled: '' // Need to add field for this
        },
        environmentalConditions: {
          airQuality: '', // Need to add field for this
          waterPollution: '', // Need to add field for this
          soilContamination: '', // Need to add field for this
          noiseLevel: '', // Need to add field for this
          hazardousWaste: '', // Need to add field for this
          floodzoneProximity: '' // Need to add field for this
        },
        slumImprovementAndDevelopment: {
          slumRehabilitationScheme: '', // Need to add field for this
          housingSchemeAvailable: '', // Need to add field for this
          existingDevelopmentProjects: [], // Need to add field for this
          plannedImprovements: [], // Need to add field for this
          communicationWithGovernment: '', // Need to add field for this
          communityParticipation: '' // Need to add field for this
        }
      };

      const response = await apiService.submitSlumSurvey(slumSurvey._id, surveyData);

      if (response.success) {
        showToast("Slum survey submitted successfully", "success");
        router.push(`/surveyor/slums/${formData.slumId}`);
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
      
      // Map current step to section name
      const sectionMap: Record<number, string> = {
        0: 'basicInformation',
        1: 'landStatus',
        2: 'surveyOperation',
        3: 'basicInformation', // This overlaps with step 0, need to adjust
        4: 'landStatus',      // This overlaps with step 1, need to adjust
        5: 'populationAndHealth',
        6: 'literacyAndEducation',
        7: 'housingConditions',
        8: 'economicStatus',
        9: 'employmentAndOccupation',
        10: 'infrastructure',
        11: 'education',
        12: 'health',
        13: 'socialDevelopment',
        14: 'review'
      };
      
      // Extract data for current section
      const sectionName = sectionMap[currentStep];
      if (!sectionName) {
        showToast("Invalid section", "error");
        return;
      }
      
      // Extract data for current section based on the step
      // This is a simplified mapping - in reality, you'd need to map
      // form fields to the appropriate section structure
      const extractSectionData = () => {
        const data: any = {};
        // Add logic to extract only the fields relevant to the current section
        // For now, we'll send all form data but in a real implementation,
        // you would filter based on the current step
        Object.keys(formData).forEach(key => {
          if (formData[key as keyof SlumSurveyForm] !== undefined && 
              formData[key as keyof SlumSurveyForm] !== null && 
              formData[key as keyof SlumSurveyForm] !== '') {
            data[key] = formData[key as keyof SlumSurveyForm];
          }
        });
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
                    />
                    <Input
                    label="City/Town Name"
                    value={formData.cityTownName || ""}
                    onChange={(e) => handleInputChange("cityTownName", e.target.value)}
                    />
                    <div className="md:col-span-2">
                        <Input
                        label="City/Town No. of Households (2011 Census)"
                        type="number"
                        value={formData.cityTownNoHouseholds || ""}
                        onChange={(e) => handleInputChange("cityTownNoHouseholds", parseInt(e.target.value) || 0)}
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
                    onChange={(value) => handleInputChange("slumType", value)}
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
                    onChange={(value) => handleInputChange("ownershipLand", value)}
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
                    />
                    <Input
                    label="Slum Population"
                    type="number"
                    value={formData.slumPopulation || ""}
                    onChange={(e) => handleInputChange("slumPopulation", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="No. of Slum Households"
                    type="number"
                    value={formData.noSlumHouseholds || ""}
                    onChange={(e) => handleInputChange("noSlumHouseholds", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="BPL Population"
                    type="number"
                    value={formData.bplPopulation || ""}
                    onChange={(e) => handleInputChange("bplPopulation", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="No. of BPL Households"
                    type="number"
                    value={formData.noBplHouseholds || ""}
                    onChange={(e) => handleInputChange("noBplHouseholds", parseInt(e.target.value) || 0)}
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
                    value={formData.surveyorName || ""}
                    onChange={(e) => handleInputChange("surveyorName", e.target.value)}
                    />
                    <Input
                    label="Survey Date"
                    type="date"
                    value={formData.surveyDate || ""}
                    onChange={(e) => handleInputChange("surveyDate", e.target.value)}
                    />
                    <Input
                    label="Receipt of Questionnaire Date"
                    type="date"
                    value={formData.receiptQuestionnaireDate || ""}
                    onChange={(e) => handleInputChange("receiptQuestionnaireDate", e.target.value)}
                    />
                    <Input
                    label="Scrutiny Date"
                    type="date"
                    value={formData.scrutinyDate || ""}
                    onChange={(e) => handleInputChange("scrutinyDate", e.target.value)}
                    />
                    <Input
                    label="Receipt by Nodal Cell Date"
                    type="date"
                    value={formData.receiptByNodalCellDate || ""}
                    onChange={(e) => handleInputChange("receiptByNodalCellDate", e.target.value)}
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
                    />
                    <Input
                    label="Location Ward"
                    value={formData.locationWard || ""}
                    onChange={(e) => handleInputChange("locationWard", e.target.value)}
                    />
                    <Input
                    label="Age of Slum (Years)"
                    type="number"
                    value={formData.ageSlumYears || ""}
                    onChange={(e) => handleInputChange("ageSlumYears", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Area of Slum (sq Mtrs)"
                    type="number"
                    value={formData.areaSlumSqMtrs || ""}
                    onChange={(e) => handleInputChange("areaSlumSqMtrs", parseFloat(e.target.value) || 0)}
                    />
                    <Select
                    label="Location - Core City/Town or Fringe Area"
                    value={formData.locationCoreOrFringe || ""}
                    onChange={(value) => handleInputChange("locationCoreOrFringe", value)}
                    options={[
                        { value: "CORE_CITY", label: "Core City/Town" },
                        { value: "FRINGE_AREA", label: "Fringe Area" },
                    ]}
                    />
                    <Select
                    label="Type of Area Surrounding"
                    value={formData.typeAreaSurrounding || ""}
                    onChange={(value) => handleInputChange("typeAreaSurrounding", value)}
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
                    onChange={(value) => handleInputChange("physicalLocationSlum", value)}
                    options={[
                        { value: "ALONG_NALLAH", label: "Along Nallah" },
                        { value: "ALONG_OTHER_DRAINS", label: "Along Other Drains" },
                        { value: "LOW_LYING_AREA", label: "Low Lying Area" },
                        { value: "HILL_SIDE", label: "Hill Side" },
                        { value: "OTHER", label: "Other" },
                    ]}
                    />
                    <Select
                    label="Is Slum Notified?"
                    value={formData.isSlumNotified || ""}
                    onChange={(value) => handleInputChange("isSlumNotified", value)}
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
                    onChange={(value) => handleInputChange("ownershipLandDetail", value)}
                    options={[
                        { value: "LOCAL_BODY", label: "Public: Local Body" },
                        { value: "STATE_GOVERNMENT", label: "Public: State Government" },
                        { value: "CENTRAL_GOVERNMENT", label: "Public: Central Government" },
                        { value: "PRIVATE", label: "Private" },
                        { value: "OTHER", label: "Other" },
                    ]}
                    />
                    <div className="md:col-span-2">
                        <Input
                        label="Specify Ownership (if Other)"
                        value={formData.ownershipLandSpecify || ""}
                        onChange={(e) => handleInputChange("ownershipLandSpecify", e.target.value)}
                        placeholder="Specify ownership details..."
                        />
                    </div>
                </div>
            </div>
            )}

            {currentStep === 5 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part F: Population & Health
                </h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Total Population</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC"
                            type="number"
                            value={formData.totalPopulationSlumSC || ""}
                            onChange={(e) => handleInputChange("totalPopulationSlumSC", parseInt(e.target.value) || 0)}
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
                    
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">BPL Population</h3>
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
                    
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Number of Households</h3>
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
                </div>
            </div>
            )}

            {currentStep === 6 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part G: Literacy & Education
                </h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Total Illiterate Persons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC Male"
                            type="number"
                            value={formData.noMaleIlliterateSC || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateSC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="ST Male"
                            type="number"
                            value={formData.noMaleIlliterateST || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC Male"
                            type="number"
                            value={formData.noMaleIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others Male"
                            type="number"
                            value={formData.noMaleIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities Male"
                            type="number"
                            value={formData.noMaleIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterateMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total Male"
                            type="number"
                            value={formData.noMaleIlliterate || ""}
                            onChange={(e) => handleInputChange("noMaleIlliterate", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Female Illiterate Persons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="SC Female"
                            type="number"
                            value={formData.noFemaleIlliterateSC || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateSC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="ST Female"
                            type="number"
                            value={formData.noFemaleIlliterateST || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateST", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="OBC Female"
                            type="number"
                            value={formData.noFemaleIlliterateOBC || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateOBC", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Others Female"
                            type="number"
                            value={formData.noFemaleIlliterateOthers || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateOthers", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Minorities Female"
                            type="number"
                            value={formData.noFemaleIlliterateMinorities || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterateMinorities", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Total Female"
                            type="number"
                            value={formData.noFemaleIlliterate || ""}
                            onChange={(e) => handleInputChange("noFemaleIlliterate", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            )}

            {currentStep === 7 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part H: Housing Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label="Dwelling Units - Pucca"
                    type="number"
                    value={formData.dwellingUnitsPucca || ""}
                    onChange={(e) => handleInputChange("dwellingUnitsPucca", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Dwelling Units - Semi-Pucca"
                    type="number"
                    value={formData.dwellingUnitsSemiPucca || ""}
                    onChange={(e) => handleInputChange("dwellingUnitsSemiPucca", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Dwelling Units - Katcha"
                    type="number"
                    value={formData.dwellingUnitsKatcha || ""}
                    onChange={(e) => handleInputChange("dwellingUnitsKatcha", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Dwelling Units - Total"
                    type="number"
                    value={formData.dwellingUnitsTotal || ""}
                    onChange={(e) => handleInputChange("dwellingUnitsTotal", parseInt(e.target.value) || 0)}
                    />
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4">Land Tenure</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="With Patta"
                            type="number"
                            value={formData.landTenureWithPatta || ""}
                            onChange={(e) => handleInputChange("landTenureWithPatta", parseInt(e.target.value) || 0)}
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

            {currentStep === 8 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part I: Economic Status of Households
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

            {currentStep === 9 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part J: Occupation Status of Households
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

            {currentStep === 10 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part K: Access to Physical Infrastructure
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
                        onChange={(value) => handleInputChange("connectivityCityWaterSupply", value)}
                        options={[
                            { value: "FULLY_CONNECTED", label: "Fully Connected" },
                            { value: "PARTIALLY_CONNECTED", label: "Partially Connected" },
                            { value: "NOT_CONNECTED", label: "Not Connected" },
                        ]}
                        />
                        <Select
                        label="Drainage/Sewerage Facility"
                        value={formData.drainageSewerageFacility || ""}
                        onChange={(value) => handleInputChange("drainageSewerageFacility", value)}
                        options={[
                            { value: "YES", label: "Yes" },
                            { value: "NO", label: "No" },
                        ]}
                        />
                        <Select
                        label="Connectivity to Storm Water Drainage"
                        value={formData.connectivityStormWaterDrainage || ""}
                        onChange={(value) => handleInputChange("connectivityStormWaterDrainage", value)}
                        options={[
                            { value: "FULLY_CONNECTED", label: "Fully Connected" },
                            { value: "PARTIALLY_CONNECTED", label: "Partially Connected" },
                            { value: "NOT_CONNECTED", label: "Not Connected" },
                        ]}
                        />
                        <Select
                        label="Connectivity to Sewerage System"
                        value={formData.connectivitySewerageSystem || ""}
                        onChange={(value) => handleInputChange("connectivitySewerageSystem", value)}
                        options={[
                            { value: "FULLY_CONNECTED", label: "Fully Connected" },
                            { value: "PARTIALLY_CONNECTED", label: "Partially Connected" },
                            { value: "NOT_CONNECTED", label: "Not Connected" },
                        ]}
                        />
                        <Select
                        label="Prone to Flooding"
                        value={formData.proneToFlooding || ""}
                        onChange={(value) => handleInputChange("proneToFlooding", value)}
                        options={[
                            { value: "NOT_PRONE", label: "Not Prone" },
                            { value: "UPTO_15_DAYS", label: "Up to 15 Days" },
                            { value: "DAYS_15_TO_30", label: "15-30 Days" },
                            { value: "MORE_THAN_MONTH", label: "More than a Month" },
                        ]}
                        />
                        <Select
                        label="Street Light Available"
                        value={formData.streetLightAvailable || ""}
                        onChange={(value) => handleInputChange("streetLightAvailable", value)}
                        options={[
                            { value: "YES", label: "Yes" },
                            { value: "NO", label: "No" },
                        ]}
                        />
                    </div>
                </div>
            </div>
            )}

            {currentStep === 11 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part L: Education Facilities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                    label="Anganwadi under ICDS"
                    type="number"
                    value={formData.anganwadiUnderIcds || ""}
                    onChange={(e) => handleInputChange("anganwadiUnderIcds", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Municipal Pre-school"
                    type="number"
                    value={formData.municipalPreschool || ""}
                    onChange={(e) => handleInputChange("municipalPreschool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Private Pre-school"
                    type="number"
                    value={formData.privatePreschool || ""}
                    onChange={(e) => handleInputChange("privatePreschool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Municipal Primary School"
                    type="number"
                    value={formData.municipalPrimarySchool || ""}
                    onChange={(e) => handleInputChange("municipalPrimarySchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="State Govt. Primary School"
                    type="number"
                    value={formData.stateGovtPrimarySchool || ""}
                    onChange={(e) => handleInputChange("stateGovtPrimarySchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Private Primary School"
                    type="number"
                    value={formData.privatePrimarySchool || ""}
                    onChange={(e) => handleInputChange("privatePrimarySchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Municipal High School"
                    type="number"
                    value={formData.municipalHighSchool || ""}
                    onChange={(e) => handleInputChange("municipalHighSchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="State Govt. High School"
                    type="number"
                    value={formData.stateGovtHighSchool || ""}
                    onChange={(e) => handleInputChange("stateGovtHighSchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Private High School"
                    type="number"
                    value={formData.privateHighSchool || ""}
                    onChange={(e) => handleInputChange("privateHighSchool", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Adult Education Centre"
                    type="number"
                    value={formData.adultEducationCentre || ""}
                    onChange={(e) => handleInputChange("adultEducationCentre", parseInt(e.target.value) || 0)}
                    />
                    <Input
                    label="Non-formal Education Centre"
                    type="number"
                    value={formData.nonFormalEducationCentre || ""}
                    onChange={(e) => handleInputChange("nonFormalEducationCentre", parseInt(e.target.value) || 0)}
                    />
                </div>
            </div>
            )}

            {currentStep === 12 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part M: Health Facilities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                    label="Urban Health Post"
                    value={formData.urbanHealthPost || ""}
                    onChange={(value) => handleInputChange("urbanHealthPost", value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="Primary Health Centre"
                    value={formData.primaryHealthCentre || ""}
                    onChange={(value) => handleInputChange("primaryHealthCentre", value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="Government Hospital"
                    value={formData.governmentHospital || ""}
                    onChange={(value) => handleInputChange("governmentHospital", value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="Maternity Centre"
                    value={formData.maternityCentre || ""}
                    onChange={(value) => handleInputChange("maternityCentre", value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="Private Clinic"
                    value={formData.privateClinic || ""}
                    onChange={(value) => handleInputChange("privateClinic", value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="RMP (Registered Medical Practitioner)"
                    value={formData.rmp || ""}
                    onChange={(value) => handleInputChange("rmp", value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                    <Select
                    label="Ayurvedic Doctor"
                    value={formData.ayurvedicDoctor || ""}
                    onChange={(value) => handleInputChange("ayurvedicDoctor", value)}
                    options={[
                        { value: "YES", label: "Yes" },
                        { value: "NO", label: "No" },
                    ]}
                    />
                </div>
            </div>
            )}

            {currentStep === 13 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Part N: Social Development/Welfare
                </h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Community Facilities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="Community Hall"
                            type="number"
                            value={formData.communityHall || ""}
                            onChange={(e) => handleInputChange("communityHall", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Livelihood Production Centre"
                            type="number"
                            value={formData.livelihoodProductionCentre || ""}
                            onChange={(e) => handleInputChange("livelihoodProductionCentre", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Vocational Training Centre"
                            type="number"
                            value={formData.vocationalTrainingCentre || ""}
                            onChange={(e) => handleInputChange("vocationalTrainingCentre", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Street Children Rehabilitation Centre"
                            type="number"
                            value={formData.streetChildrenRehabilitationCentre || ""}
                            onChange={(e) => handleInputChange("streetChildrenRehabilitationCentre", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Night Shelter"
                            type="number"
                            value={formData.nightShelter || ""}
                            onChange={(e) => handleInputChange("nightShelter", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Old Age Home"
                            type="number"
                            value={formData.oldAgeHome || ""}
                            onChange={(e) => handleInputChange("oldAgeHome", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Social Security Schemes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                            label="Old Age Pension Holders"
                            type="number"
                            value={formData.oldAgePensionsHolders || ""}
                            onChange={(e) => handleInputChange("oldAgePensionsHolders", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Widow Pension Holders"
                            type="number"
                            value={formData.widowPensionsHolders || ""}
                            onChange={(e) => handleInputChange("widowPensionsHolders", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Disabled Pension Holders"
                            type="number"
                            value={formData.disabledPensionsHolders || ""}
                            onChange={(e) => handleInputChange("disabledPensionsHolders", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="General Insurance Covered"
                            type="number"
                            value={formData.generalInsuranceCovered || ""}
                            onChange={(e) => handleInputChange("generalInsuranceCovered", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Health Insurance Covered"
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
                            label="Self Help Groups"
                            type="number"
                            value={formData.selfHelpGroups || ""}
                            onChange={(e) => handleInputChange("selfHelpGroups", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Thrift & Credit Societies"
                            type="number"
                            value={formData.thriftCreditSocieties || ""}
                            onChange={(e) => handleInputChange("thriftCreditSocieties", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Youth Associations"
                            type="number"
                            value={formData.youthAssociations || ""}
                            onChange={(e) => handleInputChange("youthAssociations", parseInt(e.target.value) || 0)}
                            />
                            <Input
                            label="Women's Associations"
                            type="number"
                            value={formData.womensAssociations || ""}
                            onChange={(e) => handleInputChange("womensAssociations", parseInt(e.target.value) || 0)}
                            />
                            <Select
                            label="Slum Dwellers Association"
                            value={formData.slumDwellersAssociation || ""}
                            onChange={(value) => handleInputChange("slumDwellersAssociation", value)}
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

            {currentStep === 14 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Review & Submit
                </h2>
                <div className="space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-3">Survey Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-300"><span className="font-medium">Slum:</span> {formData.slumName}</p>
                                <p className="text-slate-300"><span className="font-medium">Surveyor:</span> {formData.surveyorName || user?.name}</p>
                                <p className="text-slate-300"><span className="font-medium">Survey Date:</span> {formData.surveyDate || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-slate-300"><span className="font-medium">Slum Type:</span> {formData.slumType || 'Not specified'}</p>
                                <p className="text-slate-300"><span className="font-medium">Households:</span> {formData.noSlumHouseholds || 0}</p>
                                <p className="text-slate-300"><span className="font-medium">Population:</span> {formData.slumPopulation || 0}</p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="bg-slate-800/50 border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-3">Important Notes</h3>
                        <ul className="text-sm text-slate-300 space-y-2">
                            <li>• Ensure all required fields are filled before submission</li>
                            <li>• Data cannot be modified after submission</li>
                            <li>• Review all entries carefully</li>
                            <li>• Contact supervisor if you need assistance</li>
                        </ul>
                    </Card>
                </div>
            </div>
            )}
             
             {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
                <Button
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={currentStep === 0 || submitting || saving}
                >
                    Previous
                </Button>
                
                <div className="flex gap-3">
                    {currentStep < steps.length - 1 ? (
                        <Button
                            variant="secondary"
                            onClick={saveSection}
                            disabled={saving || submitting}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save & Next"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || saving}
                            className="bg-green-600 hover:bg-green-500"
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
