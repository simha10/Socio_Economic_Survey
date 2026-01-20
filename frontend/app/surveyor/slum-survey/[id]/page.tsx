"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SurveyorLayout from "@/components/SurveyorLayout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Checkbox from "@/components/Checkbox";
import apiService from "@/services/api";
import { useToast } from "@/components/Toast";

interface SlumSurveyForm {
  slumId: string;
  surveyed: boolean;
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
  urbanHealthPost?: string;
  primaryHealthCentre?: string;
  governmentHospital?: string;
  maternityCentre?: string;
  privateClinic?: string;
  rmp?: string;
  ayurvedicDoctor?: string;
  
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
  slumDwellersAssociation?: string; // Yes- 01, No- 02
  youthAssociations?: number;
  womensAssociations?: number;
  
  // General fields (some existing)
  generalPopulationAccess?: string;
  waterSupply?: string;
  drainageSystem?: string;
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState<SlumSurveyForm>({
    slumId: "",
    surveyed: false,
  });

  const steps = [
    { title: "General Info", id: "general" },
    { title: "Slum Profile", id: "profile" },
    { title: "Survey Operation", id: "operation" },
    { title: "Basic Info", id: "basic" },
    { title: "Land Status", id: "land" },
    { title: "Population & Health", id: "population" },
    { title: "Literacy & Education", id: "literacy" },
    { title: "Housing Status", id: "housing" },
    { title: "Economic Status", id: "economic" },
    { title: "Occupation Status", id: "occupation" },
    { title: "Infrastructure", id: "infrastructure" },
    { title: "Education", id: "education" },
    { title: "Health", id: "health" },
    { title: "Social Development", id: "social" },
    { title: "Review & Submit", id: "review" },
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
            setSlum(slumResponse.data);
          } else {
            showToast("Failed to load slum details", "error");
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
      const response = await apiService.submitSlumSurvey(formData.slumId, formData);

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
      {/* Header */}
      <Card className="mb-6 border-0 bg-gradient-primary text-white">
        <button
          onClick={() => router.back()}
          className="mb-3 text-sm hover:opacity-80"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Slum Survey</h1>
        <p className="text-sm opacity-90">{slum.name}</p>
      </Card>

      {/* Stepper */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${
                      index <= currentStep
                        ? "bg-primary text-white"
                        : "bg-slate-700 text-text-muted"
                    }
                  `}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? "bg-primary" : "bg-slate-700"
                    }`}
                  ></div>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1 text-center">
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="mb-6">
        {currentStep === 0 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Part A: General Information - City/Town
            </h2>
            <Input
              label="State Code"
              type="text"
              value={formData.stateCode || ""}
              onChange={(e) => handleInputChange("stateCode", e.target.value)}
            />
            <Input
              label="State Name"
              type="text"
              value={formData.stateName || ""}
              onChange={(e) => handleInputChange("stateName", e.target.value)}
            />
            <Input
              label="District Code"
              type="text"
              value={formData.districtCode || ""}
              onChange={(e) => handleInputChange("districtCode", e.target.value)}
            />
            <Input
              label="District Name"
              type="text"
              value={formData.districtName || ""}
              onChange={(e) => handleInputChange("districtName", e.target.value)}
            />
            <Input
              label="City/Town Code"
              type="text"
              value={formData.cityTownCode || ""}
              onChange={(e) => handleInputChange("cityTownCode", e.target.value)}
            />
            <Input
              label="City/Town Name"
              type="text"
              value={formData.cityTownName || ""}
              onChange={(e) => handleInputChange("cityTownName", e.target.value)}
            />
            <Input
              label="City/Town No. of Households (2011 Census)"
              type="number"
              value={formData.cityTownNoHouseholds || ""}
              onChange={(e) => handleInputChange("cityTownNoHouseholds", parseInt(e.target.value) || 0)}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Part B: City/Town Slum Profile
            </h2>
            <Select
              label="Slum Type (Notified / Non-Notified / New Identified)"
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
              type="text"
              value={formData.slumIdField || ""}
              onChange={(e) => handleInputChange("slumIdField", e.target.value)}
            />
            <Input
              label="Slum Name"
              type="text"
              value={formData.slumName || ""}
              onChange={(e) => handleInputChange("slumName", e.target.value)}
            />
            <Select
              label="Ownership of Land (Local Body -01, State Government - 02, Central Government – 03, Private -04, Other - 05)"
              value={formData.ownershipLand || ""}
              onChange={(value) => handleInputChange("ownershipLand", value)}
              options={[
                { value: "LOCAL_BODY", label: "Local Body (01)" },
                { value: "STATE_GOVERNMENT", label: "State Government (02)" },
                { value: "CENTRAL_GOVERNMENT", label: "Central Government (03)" },
                { value: "PRIVATE", label: "Private (04)" },
                { value: "OTHER", label: "Other (05)" },
              ]}
            />
            <Input
              label="Area in sq Mtrs"
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
              label="BPL (Below Poverty Line) Population"
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
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Part C: Particulars of Survey Operation
            </h2>
            <Input
              label="Surveyor Name"
              type="text"
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
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Remarks by Investigator/Surveyor
              </label>
              <textarea
                placeholder="Remarks by Investigator/Surveyor..."
                value={formData.remarksInvestigator || ""}
                onChange={(e) => handleInputChange("remarksInvestigator", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Comments by the Supervisor
              </label>
              <textarea
                placeholder="Comments by the Supervisor..."
                value={formData.commentsSupervisor || ""}
                onChange={(e) => handleInputChange("commentsSupervisor", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Part D: Basic Information on Slum
            </h2>
            <Input
              label="Slum Code"
              type="text"
              value={formData.slumCode || ""}
              onChange={(e) => handleInputChange("slumCode", e.target.value)}
            />
            <Input
              label="Location - Ward No/Name"
              type="text"
              value={formData.locationWard || ""}
              onChange={(e) => handleInputChange("locationWard", e.target.value)}
            />
            <Input
              label="Age of Slum in Years"
              type="number"
              value={formData.ageSlumYears || ""}
              onChange={(e) => handleInputChange("ageSlumYears", parseInt(e.target.value) || 0)}
            />
            <Input
              label="Area of Slum (Sq. metres)"
              type="number"
              value={formData.areaSlumSqMtrs || ""}
              onChange={(e) => handleInputChange("areaSlumSqMtrs", parseFloat(e.target.value) || 0)}
            />
            <Select
              label="Whether located in Core City/Town or Fringe area (Core City/Town - 01, Fringe Area -02)"
              value={formData.locationCoreOrFringe || ""}
              onChange={(value) => handleInputChange("locationCoreOrFringe", value)}
              options={[
                { value: "CORE_CITY", label: "Core City/Town (01)" },
                { value: "FRINGE_AREA", label: "Fringe Area (02)" },
              ]}
            />
            <Select
              label="Type of Area surrounding Slum (Residential - 01, Industrial - 02, Commercial - 03, Institutional-04, Other-49)"
              value={formData.typeAreaSurrounding || ""}
              onChange={(value) => handleInputChange("typeAreaSurrounding", value)}
              options={[
                { value: "RESIDENTIAL", label: "Residential (01)" },
                { value: "INDUSTRIAL", label: "Industrial (02)" },
                { value: "COMMERCIAL", label: "Commercial (03)" },
                { value: "INSTITUTIONAL", label: "Institutional (04)" },
                { value: "OTHER", label: "Other (49)" },
              ]}
            />
            <Select
              label="Physical Location of Slum (Along Nallah -01, Along Other Drains - 02, etc.)"
              value={formData.physicalLocationSlum || ""}
              onChange={(value) => handleInputChange("physicalLocationSlum", value)}
              options={[
                { value: "ALONG_NALLAH", label: "Along Nallah (01)" },
                { value: "ALONG_OTHER_DRAINS", label: "Along Other Drains (02)" },
                { value: "ALONG_RAILWAY_LINE", label: "Along Railway Line (03)" },
                { value: "ALONG_MAJOR_TRANSPORT_ALIGNMENT", label: "Along Major Transport Alignment (04)" },
                { value: "ALONG_RIVER_WATER_BANK", label: "Along River / Water Body Bank (05)" },
                { value: "ON_RIVER_WATER_BED", label: "On River/ Water Body Bed (06)" },
                { value: "HAZARDOUS_OBJECTIONABLE", label: "Others (Hazardous or Objectionable) (07)" },
                { value: "NON_HAZARDOUS", label: "Others (Non- Hazardous/Non-objectionable) (08)" },
              ]}
            />
            <Select
              label="Is the Slum Notified/Declared? (Yes-01, No-02)"
              value={formData.isSlumNotified || ""}
              onChange={(value) => handleInputChange("isSlumNotified", value)}
              options={[
                { value: "YES", label: "Yes (01)" },
                { value: "NO", label: "No (02)" },
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
        )}

        {currentStep === 13 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Part N: Social Development/Welfare
            </h2>
            <h3 className="text-md font-semibold text-text-primary mb-2">Availability of Facilities within Slum</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Input label="Community Hall" type="number" value={formData.communityHall || ""} onChange={(e) => handleInputChange("communityHall", parseInt(e.target.value) || 0)} />
              <Input label="Livelihood/Production Centre" type="number" value={formData.livelihoodProductionCentre || ""} onChange={(e) => handleInputChange("livelihoodProductionCentre", parseInt(e.target.value) || 0)} />
              <Input label="Vocational training/Training-cum-production Centre" type="number" value={formData.vocationalTrainingCentre || ""} onChange={(e) => handleInputChange("vocationalTrainingCentre", parseInt(e.target.value) || 0)} />
              <Input label="Street Children Rehabilitation Centre" type="number" value={formData.streetChildrenRehabilitationCentre || ""} onChange={(e) => handleInputChange("streetChildrenRehabilitationCentre", parseInt(e.target.value) || 0)} />
              <Input label="Night Shelter" type="number" value={formData.nightShelter || ""} onChange={(e) => handleInputChange("nightShelter", parseInt(e.target.value) || 0)} />
              <Input label="Old Age Home" type="number" value={formData.oldAgeHome || ""} onChange={(e) => handleInputChange("oldAgeHome", parseInt(e.target.value) || 0)} />
            </div>
            
            <h3 className="text-md font-semibold text-text-primary mb-2">Social Security Schemes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Input label="Old Age Pensions (No. of Holders)" type="number" value={formData.oldAgePensionsHolders || ""} onChange={(e) => handleInputChange("oldAgePensionsHolders", parseInt(e.target.value) || 0)} />
              <Input label="Widow Pensions (No. of Holders)" type="number" value={formData.widowPensionsHolders || ""} onChange={(e) => handleInputChange("widowPensionsHolders", parseInt(e.target.value) || 0)} />
              <Input label="Disabled Pensions (No. of Holders)" type="number" value={formData.disabledPensionsHolders || ""} onChange={(e) => handleInputChange("disabledPensionsHolders", parseInt(e.target.value) || 0)} />
              <Input label="General Insurance (No. covered)" type="number" value={formData.generalInsuranceCovered || ""} onChange={(e) => handleInputChange("generalInsuranceCovered", parseInt(e.target.value) || 0)} />
              <Input label="Health Insurance (No. covered)" type="number" value={formData.healthInsuranceCovered || ""} onChange={(e) => handleInputChange("healthInsuranceCovered", parseInt(e.target.value) || 0)} />
            </div>
            
            <h3 className="text-md font-semibold text-text-primary mb-2">Community Organizations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Input label="Self Help Groups/DWCUA Groups in Slum" type="number" value={formData.selfHelpGroups || ""} onChange={(e) => handleInputChange("selfHelpGroups", parseInt(e.target.value) || 0)} />
              <Input label="Thrift and Credit Societies in Slum" type="number" value={formData.thriftCreditSocieties || ""} onChange={(e) => handleInputChange("thriftCreditSocieties", parseInt(e.target.value) || 0)} />
            </div>
            
            <Select
              label="Slum-dwellers Association [Yes- 01, No- 02]"
              value={formData.slumDwellersAssociation || ""}
              onChange={(value) => handleInputChange("slumDwellersAssociation", value)}
              options={[
                { value: "YES", label: "Yes (01)" },
                { value: "NO", label: "No (02)" },
              ]}
            />
            
            <Input label="Youth Associations" type="number" value={formData.youthAssociations || ""} onChange={(e) => handleInputChange("youthAssociations", parseInt(e.target.value) || 0)} />
            <Input label="Women's Associations/ Mahila Samithis" type="number" value={formData.womensAssociations || ""} onChange={(e) => handleInputChange("womensAssociations", parseInt(e.target.value) || 0)} />
          </div>
        )}

        {currentStep === 14 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Review Survey
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Slum ID:</span>
                <span className="font-medium">{formData.slumId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Survey Status:</span>
                <span className="font-medium">{formData.surveyed ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Slum Name:</span>
                <span className="font-medium">{formData.slumName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Slum Type:</span>
                <span className="font-medium">{formData.slumType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Location:</span>
                <span className="font-medium">{formData.locationWard}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Surveyor:</span>
                <span className="font-medium">{formData.surveyorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Survey Date:</span>
                <span className="font-medium">{formData.surveyDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total Population:</span>
                <span className="font-medium">{formData.totalPopulationSlum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total Households:</span>
                <span className="font-medium">{formData.noSlumHouseholds}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button fullWidth onClick={() => setCurrentStep(currentStep + 1)}>
            Next
          </Button>
        ) : (
          <Button fullWidth disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting..." : "Submit Survey"}
          </Button>
        )}
      </div>
    </SurveyorLayout>
  );
}
