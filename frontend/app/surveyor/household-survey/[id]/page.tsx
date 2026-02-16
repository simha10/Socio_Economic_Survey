"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import SurveyorLayout from "@/components/SurveyorLayout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Checkbox from "@/components/Checkbox";
import apiService from "@/services/api";
import { useToast } from "@/components/Toast";
import BackNavigationDialog from "@/components/BackNavigationDialog";
import { HouseholdSurveyModal } from "@/components/HouseholdSurveyModal";

interface HouseholdSurveyForm {
  householdId: string;
  // Section I - General Information
  slumName?: string;
  ward?: string;
  houseDoorNo?: string;

  // Section II - Household Level General Information
  headName?: string;
  fatherName?: string;
  sex?: string;
  caste?: string;
  religion?: string;
  minorityStatus?: string;
  femaleHeadStatus?: string;

  // Number of family members
  familyMembersMale?: number;
  familyMembersFemale?: number;
  familyMembersTotal?: number;

  // Number of illiterate adult members
  illiterateAdultMale?: number;
  illiterateAdultFemale?: number;
  illiterateAdultTotal?: number;

  // Number of children aged 6-14 not attending school
  childrenNotAttendingMale?: number;
  childrenNotAttendingFemale?: number;
  childrenNotAttendingTotal?: number;

  // Number of handicapped persons
  handicappedPhysically?: number;
  handicappedMentally?: number;
  handicappedTotal?: number;

  femaleEarningStatus?: string;
  belowPovertyLine?: string;
  bplCard?: string;

  // Section III - Detailed Information
  landTenureStatus?: string;
  houseStructure?: string;
  roofType?: string;
  flooringType?: string;
  houseLighting?: string;
  cookingFuel?: string;

  // Water source
  waterSource?: string;
  waterSupplyDuration?: string;
  waterSourceDistance?: string;

  toiletFacility?: string;
  bathroomFacility?: string;
  roadFrontType?: string;
  preschoolType?: string;
  primarySchoolType?: string;
  highSchoolType?: string;
  healthFacilityType?: string;
  welfareBenefits?: string[];
  consumerDurables?: string[];
  livestock?: string[];

  // Section IV - Migration Details
  yearsInTown?: string;
  migrated?: string;
  migratedFrom?: string;
  migrationType?: string;
  migrationReasons?: string[];

  // Section V - Income-Expenditure Details
  earningAdultMale?: number;
  earningAdultFemale?: number;
  earningAdultTotal?: number;
  earningNonAdultMale?: number;
  earningNonAdultFemale?: number;
  earningNonAdultTotal?: number;
  monthlyIncome?: number;
  monthlyExpenditure?: number;
  debtOutstanding?: number;

  // Additional notes
  notes?: string;
}

interface FieldError {
  field: string;
  message: string;
}

const SECTIONS = [
  { id: "general", title: "General Information", icon: "🏢" },
  { id: "household", title: "Household Details", icon: "👥" },
  { id: "housing", title: "Housing & Infrastructure", icon: "🏠" },
  { id: "facilities", title: "Education & Health", icon: "🏥" },
  { id: "migration", title: "Migration Details", icon: "✈️" },
  { id: "income", title: "Income & Expenditure", icon: "💰" },
  { id: "additional", title: "Additional Info", icon: "📝" },
];

const CONSUMER_DURABLES = [
  { id: "ELECTRIC_FAN", label: "Electric Fan" },
  { id: "REFRIGERATOR", label: "Refrigerator" },
  { id: "COOLER", label: "Cooler" },
  { id: "RESIDENTIAL_PHONE", label: "Residential Telephone" },
  { id: "MOBILE_PHONE", label: "Mobile Phone" },
  { id: "BW_TELEVISION", label: "B/W Television" },
  { id: "COLOR_TELEVISION", label: "Color Television" },
  { id: "SEWING_MACHINE", label: "Sewing Machine" },
  { id: "FURNITURE", label: "Furniture" },
  { id: "BICYCLE", label: "Bicycle" },
  { id: "RICKSHAW", label: "Rickshaw" },
  { id: "PUSH_CART", label: "Push Cart" },
  { id: "BULLOCK_CART", label: "Bullock Cart" },
  { id: "TWO_WHEELER", label: "Two-Wheeler" },
  { id: "THREE_WHEELER", label: "Three Wheeler" },
  { id: "TAXI", label: "Taxi" },
  { id: "CAR", label: "Car" },
];

const LIVESTOCK_OPTIONS = [
  { id: "BUFFALO", label: "Buffalo" },
  { id: "COW", label: "Cow" },
  { id: "SHEEP_GOAT", label: "Sheep/Goat" },
  { id: "PIG", label: "Pig" },
  { id: "HEN_COCK", label: "Hen/Cock" },
  { id: "DONKEY", label: "Donkey" },
];

const WELFARE_BENEFITS = [
  { id: "OLD_AGE_PENSION", label: "Old Age Pension" },
  { id: "WIDOW_PENSION", label: "Widow Pension" },
  { id: "DISABLED_PENSION", label: "Disabled Pension" },
  { id: "HEALTH_INSURANCE", label: "Health Insurance" },
  { id: "GENERAL_INSURANCE", label: "General Insurance" },
  { id: "OTHER", label: "Other" },
];

export default function HouseholdSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const { showToast } = useToast();

  const [slum, setSlum] = useState<{ 
    slumName: string; 
    ward?: {
      number: string;
      name: string;
      _id: string;
      zone: string;
    } 
  } | null>(null);
  const [assignment, setAssignment] = useState<{
    _id: string;
    slum: { _id: string; slumName: string; ward: { _id: string; number: string; name: string; zone: string } };
    householdSurveyProgress?: { completed: number; total: number };
  }| null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["general", "household"]),
  );

  const [formData, setFormData] = useState<HouseholdSurveyForm>({
    householdId: "",
  });

  // Validation state
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Back navigation confirmation
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [backDestination, setBackDestination] = useState<string>("");
  
  // Submit confirmation
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [lastSubmittedHouseNo, setLastSubmittedHouseNo] = useState("");
  
  // Completion Modal State
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [householdProgress, setHouseholdProgress] = useState({ completed: 0, total: 0 });

  const fetchProgress = useCallback(async () => {
    try {
      const response = await apiService.getMyAssignments();
      if (response.success && response.data) {
        const currentAssignment = response.data.find((a: { 
          _id: string; 
          householdSurveyProgress?: { completed: number; total: number } 
        }) => a._id === assignmentId);
        if (currentAssignment && currentAssignment.householdSurveyProgress) {
          setHouseholdProgress(currentAssignment.householdSurveyProgress);
        }
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  }, [assignmentId]);

  const loadHouseholdsForSlum = useCallback(
    async (slumId: string) => {
      try {
        // TODO: Add API method to fetch households for a slum
        // const response = await apiService.getHouseholdsForSlum(slumId);
        // if (response.success) {
        //   setHouseholds(response.data);
        // }
      } catch (error) {
        console.error(`Error loading households for Slum with ID ${slumId}:`, error);
        showToast("Failed to load households", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // First, fetch the assignment to get the slum ID
        const assignmentResponse = await apiService.getAssignment(assignmentId);
        if (assignmentResponse.success && assignmentResponse.data) {
          setAssignment(assignmentResponse.data);
          const slumId = assignmentResponse.data.slum._id;

          // Fetch slum details
          const slumResponse = await apiService.getSlum(slumId);
          if (slumResponse.success) {
            const slumData = slumResponse.data;
            setSlum(slumData);

            // Auto-fill slum details
            setFormData((prev) => ({
              ...prev,
              slumName: slumData.slumName || "",
              ward: typeof slumData.ward === 'object' ? `${slumData.ward.number} - ${slumData.ward.name}` : slumData.ward || "",
            }));

            // Load households for this slum
            await loadHouseholdsForSlum(slumId);
            
            // Fetch initial progress
            await fetchProgress();
          }
        } else {
          showToast("Failed to load assignment details", "error");
          router.push("/surveyor/dashboard");
          return;
        }
      } catch (error) {
        console.error(`Error loading assignment with ID ${assignmentId}:`, error);
        showToast("Failed to load assignment data", "error");
        router.push("/surveyor/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assignmentId, router, showToast, fetchProgress, loadHouseholdsForSlum]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  }, []);

  const handleInputChange = useCallback(
    (field: string, value: string | number | undefined) => {
      setFormData((prev) => {
        // Only update if the value actually changed to prevent unnecessary re-renders
        if (prev[field as keyof HouseholdSurveyForm] === value) {
          return prev;
        }
        return {
          ...prev,
          [field]: value,
        };
      });
    },
    [],
  );

  const handleCheckboxChange = useCallback((field: string, value: string) => {
    setFormData((prev) => {
      const current = prev[field as keyof HouseholdSurveyForm] as string[];
      const currentArray = current || [];

      if (currentArray.includes(value)) {
        const newArray = currentArray.filter((v) => v !== value);
        return {
          ...prev,
          [field]: newArray,
        };
      } else {
        const newArray = [...currentArray, value];
        return {
          ...prev,
          [field]: newArray,
        };
      }
    });
  }, []);

  // Validation function
  const validateForm = (): FieldError[] => {
    const newErrors: FieldError[] = [];

    // General Information (except Additional Notes)
    if (!formData.houseDoorNo?.trim()) {
      newErrors.push({
        field: "houseDoorNo",
        message: "House/Flat/Door No. is required",
      });
    }

    // Household Details
    if (!formData.headName?.trim()) {
      newErrors.push({
        field: "headName",
        message: "Head of Household Name is required",
      });
    }
    if (!formData.fatherName?.trim()) {
      newErrors.push({
        field: "fatherName",
        message: "Father's Name is required",
      });
    }
    if (!formData.sex) {
      newErrors.push({ field: "sex", message: "Sex is required" });
    }
    if (!formData.caste) {
      newErrors.push({ field: "caste", message: "Caste is required" });
    }
    if (!formData.religion) {
      newErrors.push({ field: "religion", message: "Religion is required" });
    }
    if (!formData.minorityStatus) {
      newErrors.push({
        field: "minorityStatus",
        message: "Minority Status is required",
      });
    }
    if (
      formData.familyMembersMale === undefined ||
      formData.familyMembersMale === null ||
      isNaN(formData.familyMembersMale) ||
      formData.familyMembersMale < 0
    ) {
      newErrors.push({
        field: "familyMembersMale",
        message: "Number of Family Members (Male) is required",
      });
    }
    if (
      formData.familyMembersFemale === undefined ||
      formData.familyMembersFemale === null ||
      isNaN(formData.familyMembersFemale) ||
      formData.familyMembersFemale < 0
    ) {
      newErrors.push({
        field: "familyMembersFemale",
        message: "Number of Family Members (Female) is required",
      });
    }
    if (
      formData.familyMembersTotal === undefined ||
      formData.familyMembersTotal === null ||
      isNaN(formData.familyMembersTotal) ||
      formData.familyMembersTotal < 0
    ) {
      newErrors.push({
        field: "familyMembersTotal",
        message: "Number of Family Members (Total) is required",
      });
    }
    if (
      formData.illiterateAdultMale === undefined ||
      formData.illiterateAdultMale === null ||
      isNaN(formData.illiterateAdultMale) ||
      formData.illiterateAdultMale < 0
    ) {
      newErrors.push({
        field: "illiterateAdultMale",
        message: "Number of Illiterate Adult Members (Male) is required",
      });
    }
    if (
      formData.illiterateAdultFemale === undefined ||
      formData.illiterateAdultFemale === null ||
      isNaN(formData.illiterateAdultFemale) ||
      formData.illiterateAdultFemale < 0
    ) {
      newErrors.push({
        field: "illiterateAdultFemale",
        message: "Number of Illiterate Adult Members (Female) is required",
      });
    }
    if (
      formData.illiterateAdultTotal === undefined ||
      formData.illiterateAdultTotal === null ||
      isNaN(formData.illiterateAdultTotal) ||
      formData.illiterateAdultTotal < 0
    ) {
      newErrors.push({
        field: "illiterateAdultTotal",
        message: "Number of Illiterate Adult Members (Total) is required",
      });
    }
    if (
      formData.childrenNotAttendingMale === undefined ||
      formData.childrenNotAttendingMale === null ||
      isNaN(formData.childrenNotAttendingMale) ||
      formData.childrenNotAttendingMale < 0
    ) {
      newErrors.push({
        field: "childrenNotAttendingMale",
        message:
          "Number of Children Aged 6-14 Not Attending School (Male) is required",
      });
    }
    if (
      formData.childrenNotAttendingFemale === undefined ||
      formData.childrenNotAttendingFemale === null ||
      isNaN(formData.childrenNotAttendingFemale) ||
      formData.childrenNotAttendingFemale < 0
    ) {
      newErrors.push({
        field: "childrenNotAttendingFemale",
        message:
          "Number of Children Aged 6-14 Not Attending School (Female) is required",
      });
    }
    if (
      formData.childrenNotAttendingTotal === undefined ||
      formData.childrenNotAttendingTotal === null ||
      isNaN(formData.childrenNotAttendingTotal) ||
      formData.childrenNotAttendingTotal < 0
    ) {
      newErrors.push({
        field: "childrenNotAttendingTotal",
        message:
          "Number of Children Aged 6-14 Not Attending School (Total) is required",
      });
    }
    if (
      formData.handicappedPhysically === undefined ||
      formData.handicappedPhysically === null ||
      isNaN(formData.handicappedPhysically) ||
      formData.handicappedPhysically < 0
    ) {
      newErrors.push({
        field: "handicappedPhysically",
        message: "Number of Handicapped Persons (Physically) is required",
      });
    }
    if (
      formData.handicappedMentally === undefined ||
      formData.handicappedMentally === null ||
      isNaN(formData.handicappedMentally) ||
      formData.handicappedMentally < 0
    ) {
      newErrors.push({
        field: "handicappedMentally",
        message: "Number of Handicapped Persons (Mentally) is required",
      });
    }
    if (
      formData.handicappedTotal === undefined ||
      formData.handicappedTotal === null ||
      isNaN(formData.handicappedTotal) ||
      formData.handicappedTotal < 0
    ) {
      newErrors.push({
        field: "handicappedTotal",
        message: "Number of Handicapped Persons (Total) is required",
      });
    }
    if (!formData.femaleEarningStatus) {
      newErrors.push({
        field: "femaleEarningStatus",
        message: "If Major Earning Member is Female, Status is required",
      });
    }
    if (!formData.belowPovertyLine) {
      newErrors.push({
        field: "belowPovertyLine",
        message: "Is Your Family Below Poverty Line? is required",
      });
    }
    if (formData.belowPovertyLine === "YES" && !formData.bplCard) {
      newErrors.push({
        field: "bplCard",
        message: "If BPL, Does the Family Possess BPL Card? is required",
      });
    }

    // Housing & Infrastructure
    if (!formData.landTenureStatus) {
      newErrors.push({
        field: "landTenureStatus",
        message: "Land Tenure Status is required",
      });
    }
    if (!formData.houseStructure) {
      newErrors.push({
        field: "houseStructure",
        message: "House Structure is required",
      });
    }
    if (!formData.roofType) {
      newErrors.push({ field: "roofType", message: "Roof Type is required" });
    }
    if (!formData.flooringType) {
      newErrors.push({
        field: "flooringType",
        message: "Flooring Type is required",
      });
    }
    if (!formData.houseLighting) {
      newErrors.push({
        field: "houseLighting",
        message: "House Lighting is required",
      });
    }
    if (!formData.cookingFuel) {
      newErrors.push({
        field: "cookingFuel",
        message: "Cooking Fuel is required",
      });
    }
    if (!formData.waterSource) {
      newErrors.push({
        field: "waterSource",
        message: "Water Source is required",
      });
    }
    if (!formData.waterSupplyDuration) {
      newErrors.push({
        field: "waterSupplyDuration",
        message: "Water Supply Duration is required",
      });
    }
    if (!formData.waterSourceDistance) {
      newErrors.push({
        field: "waterSourceDistance",
        message: "Distance to Water Source is required",
      });
    }
    if (!formData.toiletFacility) {
      newErrors.push({
        field: "toiletFacility",
        message: "Toilet Facility is required",
      });
    }
    if (!formData.bathroomFacility) {
      newErrors.push({
        field: "bathroomFacility",
        message: "Bathroom Facility is required",
      });
    }
    if (!formData.roadFrontType) {
      newErrors.push({
        field: "roadFrontType",
        message: "Road in Front of House is required",
      });
    }

    // Education & Health
    if (!formData.preschoolType) {
      newErrors.push({
        field: "preschoolType",
        message: "Type of Pre-school Available is required",
      });
    }
    if (!formData.primarySchoolType) {
      newErrors.push({
        field: "primarySchoolType",
        message: "Type of Primary School Available is required",
      });
    }
    if (!formData.highSchoolType) {
      newErrors.push({
        field: "highSchoolType",
        message: "Type of High School Available is required",
      });
    }
    if (!formData.healthFacilityType) {
      newErrors.push({
        field: "healthFacilityType",
        message: "Type of Health Facility Access is required",
      });
    }

    // Migration Details
    if (!formData.yearsInTown) {
      newErrors.push({
        field: "yearsInTown",
        message: "Number of Years of Stay in this Town/City is required",
      });
    }
    if (!formData.migrated) {
      newErrors.push({ field: "migrated", message: "Migrated is required" });
    }
    if (formData.migrated === "YES" && !formData.migratedFrom) {
      newErrors.push({
        field: "migratedFrom",
        message: "Whether Migrated From is required when Migrated is YES",
      });
    }
    if (formData.migrated === "YES" && !formData.migrationType) {
      newErrors.push({
        field: "migrationType",
        message: "Migration Type is required when Migrated is YES",
      });
    }

    // Income & Expenditure
    if (
      formData.earningAdultMale === undefined ||
      formData.earningAdultMale === null ||
      isNaN(formData.earningAdultMale) ||
      formData.earningAdultMale < 0
    ) {
      newErrors.push({
        field: "earningAdultMale",
        message: "Number of Earning Adult Members (Male) is required",
      });
    }
    if (
      formData.earningAdultFemale === undefined ||
      formData.earningAdultFemale === null ||
      isNaN(formData.earningAdultFemale) ||
      formData.earningAdultFemale < 0
    ) {
      newErrors.push({
        field: "earningAdultFemale",
        message: "Number of Earning Adult Members (Female) is required",
      });
    }
    if (
      formData.earningAdultTotal === undefined ||
      formData.earningAdultTotal === null ||
      isNaN(formData.earningAdultTotal) ||
      formData.earningAdultTotal < 0
    ) {
      newErrors.push({
        field: "earningAdultTotal",
        message: "Number of Earning Adult Members (Total) is required",
      });
    }
    if (
      formData.earningNonAdultMale === undefined ||
      formData.earningNonAdultMale === null ||
      isNaN(formData.earningNonAdultMale) ||
      formData.earningNonAdultMale < 0
    ) {
      newErrors.push({
        field: "earningNonAdultMale",
        message: "Number of Earning Non-Adult Members (Male) is required",
      });
    }
    if (
      formData.earningNonAdultFemale === undefined ||
      formData.earningNonAdultFemale === null ||
      isNaN(formData.earningNonAdultFemale) ||
      formData.earningNonAdultFemale < 0
    ) {
      newErrors.push({
        field: "earningNonAdultFemale",
        message: "Number of Earning Non-Adult Members (Female) is required",
      });
    }
    if (
      formData.earningNonAdultTotal === undefined ||
      formData.earningNonAdultTotal === null ||
      isNaN(formData.earningNonAdultTotal) ||
      formData.earningNonAdultTotal < 0
    ) {
      newErrors.push({
        field: "earningNonAdultTotal",
        message: "Number of Earning Non-Adult Members (Total) is required",
      });
    }
    if (
      formData.monthlyIncome === undefined ||
      formData.monthlyIncome === null ||
      isNaN(formData.monthlyIncome) ||
      formData.monthlyIncome < 0
    ) {
      newErrors.push({
        field: "monthlyIncome",
        message: "Average Monthly Income of Household (in Rs.) is required",
      });
    }
    if (
      formData.monthlyExpenditure === undefined ||
      formData.monthlyExpenditure === null ||
      isNaN(formData.monthlyExpenditure) ||
      formData.monthlyExpenditure < 0
    ) {
      newErrors.push({
        field: "monthlyExpenditure",
        message:
          "Average Monthly Expenditure of Household (in Rs.) is required",
      });
    }
    if (
      formData.debtOutstanding === undefined ||
      formData.debtOutstanding === null ||
      isNaN(formData.debtOutstanding) ||
      formData.debtOutstanding < 0
    ) {
      newErrors.push({
        field: "debtOutstanding",
        message: "Debt Outstanding as on Date of Survey (in Rs.) is required",
      });
    }

    return newErrors;
  };

  // Get error message for a field
  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find((err) => err.field === fieldName);
    return error?.message;
  };

  // Scroll to first invalid field
  const scrollToFirstError = () => {
    if (errors.length > 0) {
      const firstErrorField = errors[0].field;
      // Wait for the DOM to update before scrolling
      setTimeout(() => {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          (element as HTMLElement).focus();
        }
      }, 100);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      const validationErrors = validateForm();
      setErrors(validationErrors);

      if (validationErrors.length > 0) {
        showToast("Please fill all required fields", "error");
        scrollToFirstError();
        return;
      }

      // Show confirmation dialog
      setShowSubmitConfirm(true);
    } catch (error) {
      console.error("Error preparing submission:", error);
      showToast("Failed to prepare submission", "error");
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      setShowSubmitConfirm(false);

      // Clear previous errors
      setErrors([]);

      // Create or get household survey
      const surveyResponse = await apiService.createOrGetHouseholdSurvey(
        assignment?.slum?._id || "",
        formData.houseDoorNo || "",
      );

      if (!surveyResponse.success) {
        showToast(
          surveyResponse.message || "Failed to initialize survey",
          "error",
        );
        return;
      }

      const surveyId = surveyResponse.data._id;

      // Submit the survey
      const response = await apiService.submitHouseholdSurvey(
        surveyId,
        formData,
      );

      if (response.success) {
        showToast("Household survey submitted successfully", "success");
        
        // Save house number for modal
        setLastSubmittedHouseNo(formData.houseDoorNo || "");

        // Reset form for next household
        setFormData({
          householdId: "",
          houseDoorNo: "",
          slumName: slum?.slumName || "",
          ward: typeof slum?.ward === 'object' ? `${slum?.ward.number} - ${slum?.ward.name}` : slum?.ward || "",
          // Reset all other fields to empty/default values
          headName: "",
          fatherName: "",
          sex: "",
          caste: "",
          religion: "",
          minorityStatus: "",
          femaleHeadStatus: "",
          familyMembersMale: undefined,
          familyMembersFemale: undefined,
          familyMembersTotal: undefined,
          illiterateAdultMale: undefined,
          illiterateAdultFemale: undefined,
          illiterateAdultTotal: undefined,
          childrenNotAttendingMale: undefined,
          childrenNotAttendingFemale: undefined,
          childrenNotAttendingTotal: undefined,
          handicappedPhysically: undefined,
          handicappedMentally: undefined,
          handicappedTotal: undefined,
          femaleEarningStatus: "",
          belowPovertyLine: "",
          bplCard: "",
          landTenureStatus: "",
          houseStructure: "",
          roofType: "",
          flooringType: "",
          houseLighting: "",
          cookingFuel: "",
          waterSource: "",
          waterSupplyDuration: "",
          waterSourceDistance: "",
          toiletFacility: "",
          bathroomFacility: "",
          roadFrontType: "",
          preschoolType: "",
          primarySchoolType: "",
          highSchoolType: "",
          healthFacilityType: "",
          welfareBenefits: [],
          consumerDurables: [],
          livestock: [],
          yearsInTown: "",
          migrated: "",
          migratedFrom: "",
          migrationType: "",
          migrationReasons: [],
          earningAdultMale: undefined,
          earningAdultFemale: undefined,
          earningAdultTotal: undefined,
          earningNonAdultMale: undefined,
          earningNonAdultFemale: undefined,
          earningNonAdultTotal: undefined,
          monthlyIncome: undefined,
          monthlyExpenditure: undefined,
          debtOutstanding: undefined,
          notes: ""
        });
        
        // Reset expanded sections
        setExpandedSections(new Set(["general", "household"]));
        
        // Show completion modal instead of browser alert
        await fetchProgress(); // Fetch updated progress
        setShowCompletionModal(true);
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
      <SurveyorLayout fullScreen>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SurveyorLayout>
    );
  }

  if (!slum) {
    return (
      <SurveyorLayout fullScreen>
        <Card className="text-center py-8">
          <p className="text-error">Slum not found</p>
        </Card>
      </SurveyorLayout>
    );
  }

  return (
    <SurveyorLayout fullScreen>
      <div className="max-w-3xl mx-auto w-full pb-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => {
                setBackDestination("/surveyor/dashboard");
                setShowBackConfirm(true);
              }}
              className="mb-2 text-sm text-slate-400 hover:text-white flex items-center transition-colors"
            >
              <span className="mr-1">←</span> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Household Survey
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {slum?.slumName}
            </p>
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-4 mb-6">
          {SECTIONS.map((section) => (
            <Card
              key={`section-${section.id}`}
              className="overflow-hidden transition-colors"
              padding="none"
            >
              {/* Section Header */}
              <div
                className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 bg-slate-800 rounded-lg">
                    {section.icon}
                  </span>
                  <h3 className="font-bold text-slate-200">{section.title}</h3>
                </div>
                <span
                  className={`
                    text-slate-500 transform transition-transform duration-200
                    ${expandedSections.has(section.id) ? "rotate-180" : ""}
                  `}
                >
                  ▼
                </span>
              </div>

              {/* Section Content */}
              {expandedSections.has(section.id) && (
                <div className="border-t border-slate-700 p-4 space-y-4">
                  {section.id === "general" && (
                    <>
                      <Input
                        label="1. Slum Name"
                        placeholder="Enter slum name"
                        value={formData.slumName || ""}
                        readOnly
                        className="bg-slate-800/50 cursor-not-allowed opacity-75"
                      />
                      <Input
                        label="2. Location - Ward No/Name"
                        placeholder="Enter ward"
                        value={formData.ward || ""}
                        readOnly
                        className="bg-slate-800/50 cursor-not-allowed opacity-75"
                      />
                      <Input
                        label="3. House/Flat/Door No."
                        placeholder="Enter door number"
                        value={formData.houseDoorNo || ""}
                        onChange={(e) =>
                          handleInputChange("houseDoorNo", e.target.value)
                        }
                        name="houseDoorNo"
                        required
                        error={getFieldError("houseDoorNo")}
                      />
                    </>
                  )}

                  {section.id === "household" && (
                    <>
                      <Input
                        label="4. Head of Household Name"
                        placeholder="Enter name"
                        value={formData.headName || ""}
                        onChange={(e) =>
                          handleInputChange("headName", e.target.value)
                        }
                        name="headName"
                        required
                        error={getFieldError("headName")}
                      />
                      <Input
                        label="5. Father's Name"
                        placeholder="Enter father's name"
                        value={formData.fatherName || ""}
                        onChange={(e) =>
                          handleInputChange("fatherName", e.target.value)
                        }
                        name="fatherName"
                        required
                        error={getFieldError("fatherName")}
                      />
                      <Select
                        label="6. Sex"
                        value={formData.sex || ""}
                        onChange={(e) =>
                          handleInputChange("sex", e.target.value)
                        }
                        name="sex"
                        error={getFieldError("sex")}
                        required
                        options={[
                          { value: "MALE", label: "Male" },
                          { value: "FEMALE", label: "Female" },
                        ]}
                      />
                      <Select
                        label="7. Caste"
                        value={formData.caste || ""}
                        onChange={(e) =>
                          handleInputChange("caste", e.target.value)
                        }
                        name="caste"
                        error={getFieldError("caste")}
                        required
                        options={[
                          { value: "GENERAL", label: "General" },
                          { value: "SC", label: "SC" },
                          { value: "ST", label: "ST" },
                          { value: "OBC", label: "OBC" },
                        ]}
                      />
                      <Select
                        label="8. Religion"
                        value={formData.religion || ""}
                        onChange={(e) =>
                          handleInputChange("religion", e.target.value)
                        }
                        name="religion"
                        error={getFieldError("religion")}
                        options={[
                          { value: "HINDU", label: "Hindu" },
                          { value: "MUSLIM", label: "Muslim" },
                          { value: "CHRISTIAN", label: "Christian" },
                          { value: "SIKH", label: "Sikh" },
                          { value: "JAINISM", label: "Jainism" },
                          { value: "BUDDHISM", label: "Buddhism" },
                          { value: "ZOROASTRIANISM", label: "Zoroastrianism" },
                          { value: "OTHERS", label: "Others" },
                        ]}
                        required
                      />
                      <Select
                        label="9. Minority Status"
                        value={formData.minorityStatus || ""}
                        onChange={(e) =>
                          handleInputChange("minorityStatus", e.target.value)
                        }
                        name="minorityStatus"
                        error={getFieldError("minorityStatus")}
                        required
                        options={[
                          { value: "NON_MINORITY", label: "Non-minority" },
                          { value: "MINORITY", label: "Minority" },
                        ]}
                      />
                      <Select
                        label="10. Female Head Status (if Female Headed Household)"
                        value={formData.femaleHeadStatus || ""}
                        onChange={(e) =>
                          handleInputChange("femaleHeadStatus", e.target.value)
                        }
                        name="femaleHeadStatus"
                        error={getFieldError("femaleHeadStatus")}
                        options={[
                          { value: "MARRIED", label: "Married" },
                          { value: "WIDOWED", label: "Widowed" },
                          {
                            value: "ABANDONED_SINGLE",
                            label: "Abandoned/Single",
                          },
                          { value: "DIVORCED", label: "Divorced" },
                          { value: "UNWED_MOTHER", label: "Unwed mother" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      />
                      <Input
                        label="11a. Number of Family Members (male)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.familyMembersMale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "familyMembersMale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="familyMembersMale"
                        required
                        error={getFieldError("familyMembersMale")}
                      />
                      <Input
                        label="11b. Number of Family Members (Female)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.familyMembersFemale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "familyMembersFemale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="familyMembersFemale"
                        required
                        error={getFieldError("familyMembersFemale")}
                      />
                      <Input
                        label="11c. Number of Family Members (Total)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.familyMembersTotal ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "familyMembersTotal",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="familyMembersTotal"
                        required
                        error={getFieldError("familyMembersTotal")}
                      />
                      <Input
                        label="12a. Number of Illiterate Adult Male Members (>14 yrs old)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.illiterateAdultMale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "illiterateAdultMale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="illiterateAdultMale"
                        required
                        error={getFieldError("illiterateAdultMale")}
                      />
                      <Input
                        label="12b. Number of Illiterate Adult Female Members (>14 yrs old)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.illiterateAdultFemale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "illiterateAdultFemale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="illiterateAdultFemale"
                        required
                        error={getFieldError("illiterateAdultFemale")}
                      />
                      <Input
                        label="12c. Number of Illiterate Adult Total Members (>14 yrs old)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.illiterateAdultTotal ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "illiterateAdultTotal",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="illiterateAdultTotal"
                        required
                        error={getFieldError("illiterateAdultTotal")}
                      />
                      <Input
                        label="13a. Number of Children Aged 6-14 Not Attending School (Male)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.childrenNotAttendingMale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "childrenNotAttendingMale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="childrenNotAttendingMale"
                        required
                        error={getFieldError("childrenNotAttendingMale")}
                      />
                      <Input
                        label="13b. Number of Children Aged 6-14 Not Attending School (Female)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.childrenNotAttendingFemale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "childrenNotAttendingFemale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="childrenNotAttendingFemale"
                        required
                        error={getFieldError("childrenNotAttendingFemale")}
                      />
                      <Input
                        label="13c. Number of Children Aged 6-14 Not Attending School (Total)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.childrenNotAttendingTotal ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "childrenNotAttendingTotal",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="childrenNotAttendingTotal"
                        required
                        error={getFieldError("childrenNotAttendingTotal")}
                      />
                      <Input
                        label="14a. Number of Handicapped Persons (Physically)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.handicappedPhysically ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "handicappedPhysically",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="handicappedPhysically"
                        required
                        error={getFieldError("handicappedPhysically")}
                      />
                      <Input
                        label="14b. Number of Handicapped Persons (Mentally)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.handicappedMentally ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "handicappedMentally",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="handicappedMentally"
                        required
                        error={getFieldError("handicappedMentally")}
                      />
                      <Input
                        label="14c. Number of Handicapped Persons (Total)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.handicappedTotal ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "handicappedTotal",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="handicappedTotal"
                        required
                        error={getFieldError("handicappedTotal")}
                      />
                      <Select
                        label="15. If Major Earning Member is Female, Status"
                        value={formData.femaleEarningStatus || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "femaleEarningStatus",
                            e.target.value,
                          )
                        }
                        name="femaleEarningStatus"
                        error={getFieldError("femaleEarningStatus")}
                        required
                        options={[
                          { value: "MARRIED", label: "Married" },
                          { value: "WIDOWED", label: "Widowed" },
                          {
                            value: "ABANDONED_SINGLE",
                            label: "Abandoned/Single",
                          },
                          { value: "DIVORCED", label: "Divorced" },
                          { value: "UNWED_MOTHER", label: "Unwed mother" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      />
                      <Select
                        label="16. Is Your Family Below Poverty Line?"
                        value={formData.belowPovertyLine || ""}
                        onChange={(e) =>
                          handleInputChange("belowPovertyLine", e.target.value)
                        }
                        name="belowPovertyLine"
                        error={getFieldError("belowPovertyLine")}
                        required
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                          { value: "DONT_KNOW", label: "Don t know" },
                        ]}
                      />
                      <Select
                        label="17. If BPL, Does the Family Possess BPL Card?"
                        value={formData.bplCard || ""}
                        onChange={(e) =>
                          handleInputChange("bplCard", e.target.value)
                        }
                        name="bplCard"
                        error={getFieldError("bplCard")}
                        required
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </>
                  )}

                  {section.id === "housing" && (
                    <>
                      <Select
                        label="18. Land Tenure Status"
                        value={formData.landTenureStatus || ""}
                        onChange={(e) =>
                          handleInputChange("landTenureStatus", e.target.value)
                        }
                        name="landTenureStatus"
                        error={getFieldError("landTenureStatus")}
                        required
                        options={[
                          { value: "PATTA", label: "Patta" },
                          {
                            value: "POSSESSION_CERTIFICATE",
                            label: "Possession Certificate/Occupancy Right",
                          },
                          {
                            value: "PRIVATE_LAND_ENCROACHED",
                            label: "Private Land Encroached",
                          },
                          {
                            value: "PUBLIC_LAND_ENCROACHED",
                            label: "Public Land Encroached",
                          },
                          { value: "TENTED", label: "Tented" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      />
                      <Select
                        label="19. House Structure/Type"
                        value={formData.houseStructure || ""}
                        onChange={(e) =>
                          handleInputChange("houseStructure", e.target.value)
                        }
                        name="houseStructure"
                        error={getFieldError("houseStructure")}
                        required
                        options={[
                          { value: "PUCCA", label: "Pucca" },
                          { value: "SEMI_PUCCA", label: "Semi-Pucca" },
                          { value: "KATCHA", label: "Katcha" },
                        ]}
                      />
                      <Select
                        label="20. Roof Type"
                        value={formData.roofType || ""}
                        onChange={(e) =>
                          handleInputChange("roofType", e.target.value)
                        }
                        name="roofType"
                        error={getFieldError("roofType")}
                        required
                        options={[
                          { value: "GRASS_THATCHED", label: "Grass/thatched" },
                          { value: "TARPAULIN", label: "Tarpaulin" },
                          { value: "WOODEN", label: "Wooden" },
                          { value: "ASBESTOS", label: "Asbestos" },
                          { value: "TILED", label: "Tiled" },
                          { value: "CEMENT_SLAB", label: "Cement/Slab" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      />
                      <Select
                        label="21. Flooring Type"
                        value={formData.flooringType || ""}
                        onChange={(e) =>
                          handleInputChange("flooringType", e.target.value)
                        }
                        name="flooringType"
                        error={getFieldError("flooringType")}
                        required
                        options={[
                          { value: "MUD", label: "Mud" },
                          { value: "BRICK", label: "Brick" },
                          { value: "STONE", label: "Stone" },
                          { value: "CEMENT", label: "Cement" },
                          { value: "TILES", label: "Tiles" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      />
                      <Select
                        label="22. House Lighting"
                        value={formData.houseLighting || ""}
                        onChange={(e) =>
                          handleInputChange("houseLighting", e.target.value)
                        }
                        name="houseLighting"
                        error={getFieldError("houseLighting")}
                        required
                        options={[
                          {
                            value: "ELECTRICITY",
                            label: "Electricity connection",
                          },
                          { value: "KEROSENE", label: "Kerosene" },
                          { value: "FIREWOOD", label: "Firewood" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      />
                      <Select
                        label="23. Cooking Fuel"
                        value={formData.cookingFuel || ""}
                        onChange={(e) =>
                          handleInputChange("cookingFuel", e.target.value)
                        }
                        name="cookingFuel"
                        error={getFieldError("cookingFuel")}
                        required
                        options={[
                          { value: "GAS", label: "Gas" },
                          { value: "ELECTRICITY", label: "Electricity" },
                          { value: "KEROSENE", label: "Kerosene" },
                          { value: "CHARCOAL", label: "Charcoal" },
                          { value: "FIREWOOD", label: "Firewood" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      />
                      <Select
                        label="24a. Water Source"
                        value={formData.waterSource || ""}
                        onChange={(e) =>
                          handleInputChange("waterSource", e.target.value)
                        }
                        name="waterSource"
                        error={getFieldError("waterSource")}
                        required
                        options={[
                          {
                            value: "WITHIN_PREMISES_TAP",
                            label: "Within premises - Tap",
                          },
                          {
                            value: "WITHIN_PREMISES_TUBEWELL",
                            label: "Within premises - Tubewell/handpump",
                          },
                          {
                            value: "WITHIN_PREMISES_OPENWELL",
                            label: "Within premises - Open well",
                          },
                          {
                            value: "OUTSIDE_PREMISES_PUBLIC_TAP",
                            label: "Outside premises - Public tap",
                          },
                          {
                            value: "OUTSIDE_PREMISES_TUBE_BORE_WELL",
                            label:
                              "Outside premises - Tube well/Bore well/Hand pump",
                          },
                          {
                            value: "OUTSIDE_PREMISES_OPENWELL",
                            label: "Outside premises - Open well",
                          },
                          {
                            value: "OUTSIDE_PREMISES_TANK_POND",
                            label: "Outside premises - Tank/pond",
                          },
                          {
                            value: "OUTSIDE_PREMISES_RIVER",
                            label: "Outside premises - River/Canal/Lake/Spring",
                          },
                          { value: "WATER_TANKER", label: "Water tanker" },
                          { value: "OTHER", label: "Other" },
                        ]}
                      />
                      <Select
                        label="24b. Water Supply Duration"
                        value={formData.waterSupplyDuration || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "waterSupplyDuration",
                            e.target.value,
                          )
                        }
                        name="waterSupplyDuration"
                        error={getFieldError("waterSupplyDuration")}
                        required
                        options={[
                          {
                            value: "LESS_THAN_1_HOUR",
                            label: "Less than 1 hour daily",
                          },
                          { value: "ONE_TWO_HOURS", label: "1-2 hrs daily" },
                          {
                            value: "MORE_THAN_2_HOURS",
                            label: "More than 2 hrs daily",
                          },
                          { value: "ONCE_WEEK", label: "Once a week" },
                          { value: "TWICE_WEEK", label: "Twice a week" },
                          { value: "NOT_REGULAR", label: "Not regular" },
                          { value: "NO_SUPPLY", label: "No supply" },
                        ]}
                      />
                      <Select
                        label="25. Distance to Water Source"
                        value={formData.waterSourceDistance || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "waterSourceDistance",
                            e.target.value,
                          )
                        }
                        name="waterSourceDistance"
                        error={getFieldError("waterSourceDistance")}
                        required
                        options={[
                          {
                            value: "LESS_THAN_HALF_KM",
                            label: "Less than 0.5 kms",
                          },
                          { value: "HALF_TO_ONE_KM", label: "0.5 to 1.0 km" },
                          { value: "ONE_TO_TWO_KM", label: "1.0 km to 2.0 km" },
                          {
                            value: "TWO_TO_FIVE_KM",
                            label: "2.0 km to 5.0 km",
                          },
                          {
                            value: "MORE_THAN_FIVE_KM",
                            label: "More than 5.0 km",
                          },
                        ]}
                      />
                      <Select
                        label="26. Toilet Facility"
                        value={formData.toiletFacility || ""}
                        onChange={(e) =>
                          handleInputChange("toiletFacility", e.target.value)
                        }
                        name="toiletFacility"
                        error={getFieldError("toiletFacility")}
                        required
                        options={[
                          {
                            value: "OWN_SEPTIC_FLUSH",
                            label: "Own septic tank/flush latrine",
                          },
                          {
                            value: "OWN_DRY_LATRINE",
                            label: "Own dry latrine",
                          },
                          {
                            value: "SHARED_SEPTIC_FLUSH",
                            label: "Shared septic tank/flush latrine",
                          },
                          {
                            value: "SHARED_DRY_LATRINE",
                            label: "Shared dry latrine",
                          },
                          {
                            value: "COMMUNITY_SEPTIC_FLUSH",
                            label: "Community septic tank/flush latrine",
                          },
                          {
                            value: "COMMUNITY_DRY_LATRINE",
                            label: "Community dry latrine",
                          },
                          {
                            value: "OPEN_DEFECATION",
                            label: "Open defecation",
                          },
                        ]}
                      />
                      <Select
                        label="27. Bathroom Facility"
                        value={formData.bathroomFacility || ""}
                        onChange={(e) =>
                          handleInputChange("bathroomFacility", e.target.value)
                        }
                        name="bathroomFacility"
                        error={getFieldError("bathroomFacility")}
                        required
                        options={[
                          {
                            value: "WITHIN_PREMISES",
                            label: "Within premises",
                          },
                          {
                            value: "OUTSIDE_PREMISES",
                            label: "Outside premises",
                          },
                          { value: "COMMUNITY_BATH", label: "Community bath" },
                          { value: "NO_BATHROOM", label: "No bathroom" },
                        ]}
                      />
                      <Select
                        label="28. Road in Front of House"
                        value={formData.roadFrontType || ""}
                        onChange={(e) =>
                          handleInputChange("roadFrontType", e.target.value)
                        }
                        name="roadFrontType"
                        error={getFieldError("roadFrontType")}
                        required
                        options={[
                          {
                            value: "MOTORABLE_PUCCA",
                            label: "Motorable pucca",
                          },
                          {
                            value: "MOTORABLE_KATCHA",
                            label: "Motorable katcha",
                          },
                          {
                            value: "NON_MOTORABLE_PUCCA",
                            label: "Non-motorable pucca",
                          },
                          {
                            value: "NON_MOTORABLE_KATCHA",
                            label: "Non-motorable katcha",
                          },
                        ]}
                      />
                    </>
                  )}

                  {section.id === "facilities" && (
                    <>
                      <Select
                        label="29. Type of Pre-school Available"
                        value={formData.preschoolType || ""}
                        onChange={(e) =>
                          handleInputChange("preschoolType", e.target.value)
                        }
                        name="preschoolType"
                        error={getFieldError("preschoolType")}
                        required
                        options={[
                          { value: "MUNICIPAL", label: "Municipal" },
                          { value: "GOVERNMENT", label: "Government" },
                          { value: "PRIVATE", label: "Private" },
                        ]}
                      />
                      <Select
                        label="30. Type of Primary School Available"
                        value={formData.primarySchoolType || ""}
                        onChange={(e) =>
                          handleInputChange("primarySchoolType", e.target.value)
                        }
                        name="primarySchoolType"
                        error={getFieldError("primarySchoolType")}
                        required
                        options={[
                          { value: "MUNICIPAL", label: "Municipal" },
                          { value: "GOVERNMENT", label: "Government" },
                          { value: "PRIVATE", label: "Private" },
                        ]}
                      />
                      <Select
                        label="31. Type of High School Available"
                        value={formData.highSchoolType || ""}
                        onChange={(e) =>
                          handleInputChange("highSchoolType", e.target.value)
                        }
                        name="highSchoolType"
                        error={getFieldError("highSchoolType")}
                        required
                        options={[
                          { value: "MUNICIPAL", label: "Municipal" },
                          { value: "GOVERNMENT", label: "Government" },
                          { value: "PRIVATE", label: "Private" },
                        ]}
                      />
                      <Select
                        label="32. Type of Health Facility Access"
                        value={formData.healthFacilityType || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "healthFacilityType",
                            e.target.value,
                          )
                        }
                        name="healthFacilityType"
                        error={getFieldError("healthFacilityType")}
                        required
                        options={[
                          {
                            value: "PRIMARY_HEALTH_CENTRE",
                            label: "Primary Health Centre",
                          },
                          {
                            value: "GOVT_HOSPITAL",
                            label: "Government Hospital",
                          },
                          {
                            value: "MATERNITY_CENTRE",
                            label: "Maternity Centre",
                          },
                          { value: "PRIVATE_CLINIC", label: "Private Clinic" },
                          { value: "RMP", label: "RMP" },
                          {
                            value: "AYURVEDIC",
                            label: "Ayurvedic Doctor/Vaidya",
                          },
                        ]}
                      />
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-3">
                          33. Welfare Benefits
                        </label>
                        <div className="space-y-2">
                          {WELFARE_BENEFITS.map((benefit) => (
                            <Checkbox
                              key={benefit.id}
                              label={benefit.label}
                              checked={(
                                formData.welfareBenefits || []
                              ).includes(benefit.id)}
                              onChange={() =>
                                handleCheckboxChange(
                                  "welfareBenefits",
                                  benefit.id,
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-3">
                          34. Consumer Durables
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {CONSUMER_DURABLES.map((durable) => (
                            <Checkbox
                              key={durable.id}
                              label={durable.label}
                              checked={(
                                formData.consumerDurables || []
                              ).includes(durable.id)}
                              onChange={() =>
                                handleCheckboxChange(
                                  "consumerDurables",
                                  durable.id,
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-3">
                          35. Livestock
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {LIVESTOCK_OPTIONS.map((livestock) => (
                            <Checkbox
                              key={livestock.id}
                              label={livestock.label}
                              checked={(formData.livestock || []).includes(
                                livestock.id,
                              )}
                              onChange={() =>
                                handleCheckboxChange("livestock", livestock.id)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === "migration" && (
                    <>
                      <Select
                        label="36. Number of Years of Stay in this Town/City"
                        value={formData.yearsInTown || ""}
                        onChange={(e) =>
                          handleInputChange("yearsInTown", e.target.value)
                        }
                        name="yearsInTown"
                        error={getFieldError("yearsInTown")}
                        required
                        options={[
                          { value: "ZERO_TO_ONE_YEAR", label: "0 to 1 year" },
                          {
                            value: "ONE_TO_THREE_YEARS",
                            label: "1 to 3 years",
                          },
                          {
                            value: "THREE_TO_FIVE_YEARS",
                            label: "3 to 5 years",
                          },
                          {
                            value: "MORE_THAN_FIVE_YEARS",
                            label: "More than 5 years",
                          },
                        ]}
                      />
                      <Select
                        label="Migrated"
                        value={formData.migrated || ""}
                        onChange={(e) =>
                          handleInputChange("migrated", e.target.value)
                        }
                        name="37a. Migrated"
                        error={getFieldError("migrated")}
                        required
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                      <Select
                        label="37b. Whether Migrated From"
                        value={formData.migratedFrom || ""}
                        onChange={(e) =>
                          handleInputChange("migratedFrom", e.target.value)
                        }
                        name="migratedFrom"
                        error={getFieldError("migratedFrom")}
                        required
                        options={[
                          {
                            value: "RURAL_TO_URBAN",
                            label: "Rural Area to Urban Area",
                          },
                          {
                            value: "URBAN_TO_URBAN",
                            label: "Urban Area to Urban Area",
                          },
                        ]}
                      />
                      <Select
                        label="38. Migration Type"
                        value={formData.migrationType || ""}
                        onChange={(e) =>
                          handleInputChange("migrationType", e.target.value)
                        }
                        name="migrationType"
                        error={getFieldError("migrationType")}
                        required
                        options={[
                          { value: "SEASONAL", label: "Seasonal" },
                          { value: "PERMANENT", label: "Permanent" },
                        ]}
                      />
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-3">
                          39. Reasons for Migration
                        </label>
                        <div className="space-y-2">
                          {[
                            { id: "UNEMPLOYMENT", label: "Unemployment" },
                            { id: "LOW_WAGE", label: "Low wage" },
                            { id: "DEBT", label: "Debt" },
                            { id: "DROUGHT", label: "Drought" },
                            { id: "CONFLICT", label: "Conflict" },
                            { id: "EDUCATION", label: "Education" },
                            { id: "MARRIAGE", label: "Marriage" },
                            { id: "OTHERS", label: "Others" },
                          ].map((reason) => (
                            <Checkbox
                              key={reason.id}
                              label={reason.label}
                              checked={(
                                formData.migrationReasons || []
                              ).includes(reason.id)}
                              onChange={() =>
                                handleCheckboxChange(
                                  "migrationReasons",
                                  reason.id,
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === "income" && (
                    <>
                      <Input
                        label="40a. Number of Earning Adult Members (Male)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.earningAdultMale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "earningAdultMale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="earningAdultMale"
                        required
                        error={getFieldError("earningAdultMale")}
                      />
                      <Input
                        label="40b. Number of Earning Adult Members (Female)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.earningAdultFemale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "earningAdultFemale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="earningAdultFemale"
                        required
                        error={getFieldError("earningAdultFemale")}
                      />
                      <Input
                        label="40c. Number of Earning Adult Members (Total)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.earningAdultTotal ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "earningAdultTotal",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="earningAdultTotal"
                        required
                        error={getFieldError("earningAdultTotal")}
                      />
                      <Input
                        label="41a. Number of Earning Non-Adult Members (Male)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.earningNonAdultMale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "earningNonAdultMale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="earningNonAdultMale"
                        required
                        error={getFieldError("earningNonAdultMale")}
                      />
                      <Input
                        label="41b. Number of Earning Non-Adult Members (Female)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.earningNonAdultFemale ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "earningNonAdultFemale",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="earningNonAdultFemale"
                        required
                        error={getFieldError("earningNonAdultFemale")}
                      />
                      <Input
                        label="41c. Number of Earning Non-Adult Members (Total)"
                        type="number"
                        placeholder="Enter number"
                        value={formData.earningNonAdultTotal ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "earningNonAdultTotal",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="earningNonAdultTotal"
                        required
                        error={getFieldError("earningNonAdultTotal")}
                      />
                      <Input
                        label="42. Average Monthly Income of Household (in Rs.)"
                        type="number"
                        placeholder="Enter amount"
                        value={formData.monthlyIncome ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "monthlyIncome",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="monthlyIncome"
                        required
                        error={getFieldError("monthlyIncome")}
                      />
                      <Input
                        label="43. Average Monthly Expenditure of Household (in Rs.)"
                        type="number"
                        placeholder="Enter amount"
                        value={formData.monthlyExpenditure ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "monthlyExpenditure",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="monthlyExpenditure"
                        required
                        error={getFieldError("monthlyExpenditure")}
                      />
                      <Input
                        label="44. Debt Outstanding as on Date of Survey (in Rs.)"
                        type="number"
                        placeholder="Enter amount"
                        value={formData.debtOutstanding ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "debtOutstanding",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        name="debtOutstanding"
                        required
                        error={getFieldError("debtOutstanding")}
                      />
                    </>
                  )}

                  {section.id === "additional" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Additional Notes
                        </label>
                        <textarea
                          placeholder="Any observations or remarks..."
                          value={formData.notes || ""}
                          onChange={(e) =>
                            handleInputChange("notes", e.target.value)
                          }
                          rows={4}
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <Button
          fullWidth
          loading={submitting}
          onClick={handleSubmit}
          className="w-full cursor-pointer"
        >
          Submit Household Survey
        </Button>

        {/* Back Navigation Confirmation Dialog */}
        <BackNavigationDialog
          isOpen={showBackConfirm}
          title="Leave Household Survey?"
          message="Are you sure you want to leave this household survey? Your progress will be saved."
          onConfirm={() => {
            setShowBackConfirm(false);
            router.push(backDestination);
          }}
          onCancel={() => setShowBackConfirm(false)}
        />

        {/* Submit Confirmation Dialog */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Confirm Submission</h3>
                <p className="text-slate-300 mb-6">
                  Are you sure you want to submit this household survey? Once submitted, you won&#39;t be able to edit it.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => setShowSubmitConfirm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="cursor-pointer"
                    onClick={handleConfirmSubmit}
                    loading={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Survey"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    <HouseholdSurveyModal
        isOpen={showCompletionModal}
        onClose={() => router.push("/surveyor/dashboard")}
        onSubmit={() => setShowCompletionModal(false)}
        houseDoorNo={lastSubmittedHouseNo}
        slumName={slum?.slumName || ""}
        completedCount={householdProgress.completed}
        totalCount={householdProgress.total}
      />
    </SurveyorLayout>
  );
}
