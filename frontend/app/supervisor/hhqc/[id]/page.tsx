"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import apiService from "@/services/api";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { HouseholdSurvey } from "@/types/householdSurvey";
import SuccessModal from "@/components/SuccessModal";

interface HouseholdSurveyForm {
  householdId: string;
  surveyStatus?: string;
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

export default function HHQCEditPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<HouseholdSurveyForm>({
    householdId: "",
    houseDoorNo: "",
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
    bplCard: "NO",
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
    notes: "",
  });
  const [errors, setErrors] = useState<{field: string, message: string}[]>([]);
  const [originalData, setOriginalData] = useState<HouseholdSurvey | null>(null);

  // Monitor formData changes
  useEffect(() => {
    console.log("formData state updated:", formData);
  }, [formData]);

  // Debug: Log when data is fully loaded
  useEffect(() => {
    if (dataLoaded) {
      console.log("Form data fully loaded and ready", formData);
    }
  }, [dataLoaded, formData]);

  // Load existing household survey data
  useEffect(() => {
    console.log("HHQC Edit Page - params:", params);
    console.log("HHQC Edit Page - params.id:", params.id);
    console.log("HHQC Edit Page - typeof params.id:", typeof params.id);
    
    if (!params.id) {
      console.error("No survey ID provided in params");
      setLoading(false);
      setDataLoaded(true);
      return;
    }
    
    // Reset form data to initial state before loading new data
    setFormData({
      householdId: "",
      houseDoorNo: "",
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
      bplCard: "NO",
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
      notes: "",
    });
    setDataLoaded(false);
    
    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching survey data for ID: ${params.id}`);
        const response = await apiService.get(`/surveys/household-surveys/${params.id}`);
        
        if (response.success && response.data) {
          const surveyData = response.data as HouseholdSurvey;
          setOriginalData(surveyData);
          
          // Populate form data with all survey fields
          console.log("Setting formData with survey data:", surveyData);
          setFormData({
            householdId: surveyData.householdId || "",
            houseDoorNo: surveyData.houseDoorNo || "",
            headName: surveyData.headName || "",
            fatherName: surveyData.fatherName || "",
            sex: surveyData.sex || "",
            caste: surveyData.caste || "",
            religion: surveyData.religion || "",
            minorityStatus: surveyData.minorityStatus || "",
            femaleHeadStatus: surveyData.femaleHeadStatus || "",
            familyMembersMale: surveyData.familyMembersMale,
            familyMembersFemale: surveyData.familyMembersFemale,
            familyMembersTotal: surveyData.familyMembersTotal,
            illiterateAdultMale: surveyData.illiterateAdultMale,
            illiterateAdultFemale: surveyData.illiterateAdultFemale,
            illiterateAdultTotal: surveyData.illiterateAdultTotal,
            childrenNotAttendingMale: surveyData.childrenNotAttendingMale,
            childrenNotAttendingFemale: surveyData.childrenNotAttendingFemale,
            childrenNotAttendingTotal: surveyData.childrenNotAttendingTotal,
            handicappedPhysically: surveyData.handicappedPhysically,
            handicappedMentally: surveyData.handicappedMentally,
            handicappedTotal: surveyData.handicappedTotal,
            femaleEarningStatus: surveyData.femaleEarningStatus || "",
            belowPovertyLine: surveyData.belowPovertyLine || "",
            bplCard: surveyData.bplCard || "NO",
            landTenureStatus: surveyData.landTenureStatus || "",
            houseStructure: surveyData.houseStructure || "",
            roofType: surveyData.roofType || "",
            flooringType: surveyData.flooringType || "",
            houseLighting: surveyData.houseLighting || "",
            cookingFuel: surveyData.cookingFuel || "",
            waterSource: surveyData.waterSource || "",
            waterSupplyDuration: surveyData.waterSupplyDuration || "",
            waterSourceDistance: surveyData.waterSourceDistance || "",
            toiletFacility: surveyData.toiletFacility || "",
            bathroomFacility: surveyData.bathroomFacility || "",
            roadFrontType: surveyData.roadFrontType || "",
            preschoolType: surveyData.preschoolType || "",
            primarySchoolType: surveyData.primarySchoolType || "",
            highSchoolType: surveyData.highSchoolType || "",
            healthFacilityType: surveyData.healthFacilityType || "",
            welfareBenefits: surveyData.welfareBenefits || [],
            consumerDurables: surveyData.consumerDurables || [],
            livestock: surveyData.livestock || [],
            yearsInTown: surveyData.yearsInTown || "",
            migrated: surveyData.migrated || "",
            migratedFrom: surveyData.migratedFrom || "",
            migrationType: surveyData.migrationType || "",
            migrationReasons: surveyData.migrationReasons || [],
            earningAdultMale: surveyData.earningAdultMale,
            earningAdultFemale: surveyData.earningAdultFemale,
            earningAdultTotal: surveyData.earningAdultTotal,
            earningNonAdultMale: surveyData.earningNonAdultMale,
            earningNonAdultFemale: surveyData.earningNonAdultFemale,
            earningNonAdultTotal: surveyData.earningNonAdultTotal,
            monthlyIncome: surveyData.monthlyIncome,
            monthlyExpenditure: surveyData.monthlyExpenditure,
            debtOutstanding: surveyData.debtOutstanding,
            notes: surveyData.notes || "",
          });
        }
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching survey data:", error);
        console.error("Request URL was:", `/surveys/household-surveys/${params.id}`);
        alert("Failed to load survey data. Please check the console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [params.id]);

  const handleInputChange = useCallback(
    (field: string, value: string | number | undefined | string[]) => {
      // Clear error for the field being modified
      setErrors((prev) => prev.filter((e) => e.field !== field));
      setFormData((prev) => {
        // Auto-calculate totals
        const updatedData = { ...prev, [field]: value };
        
        if (field === "familyMembersMale" || field === "familyMembersFemale") {
          const male = field === "familyMembersMale" ? value : prev.familyMembersMale;
          const female = field === "familyMembersFemale" ? value : prev.familyMembersFemale;
          updatedData.familyMembersTotal = (Number(male) || 0) + (Number(female) || 0);
        }
        
        if (field === "illiterateAdultMale" || field === "illiterateAdultFemale") {
          const male = field === "illiterateAdultMale" ? value : prev.illiterateAdultMale;
          const female = field === "illiterateAdultFemale" ? value : prev.illiterateAdultFemale;
          updatedData.illiterateAdultTotal = (Number(male) || 0) + (Number(female) || 0);
        }
        
        if (field === "childrenNotAttendingMale" || field === "childrenNotAttendingFemale") {
          const male = field === "childrenNotAttendingMale" ? value : prev.childrenNotAttendingMale;
          const female = field === "childrenNotAttendingFemale" ? value : prev.childrenNotAttendingFemale;
          updatedData.childrenNotAttendingTotal = (Number(male) || 0) + (Number(female) || 0);
        }
        
        if (field === "handicappedPhysically" || field === "handicappedMentally") {
          const physical = field === "handicappedPhysically" ? value : prev.handicappedPhysically;
          const mental = field === "handicappedMentally" ? value : prev.handicappedMentally;
          updatedData.handicappedTotal = (Number(physical) || 0) + (Number(mental) || 0);
        }
        
        if (field === "earningAdultMale" || field === "earningAdultFemale") {
          const male = field === "earningAdultMale" ? value : prev.earningAdultMale;
          const female = field === "earningAdultFemale" ? value : prev.earningAdultFemale;
          updatedData.earningAdultTotal = (Number(male) || 0) + (Number(female) || 0);
        }
        
        if (field === "earningNonAdultMale" || field === "earningNonAdultFemale") {
          const male = field === "earningNonAdultMale" ? value : prev.earningNonAdultMale;
          const female = field === "earningNonAdultFemale" ? value : prev.earningNonAdultFemale;
          updatedData.earningNonAdultTotal = (Number(male) || 0) + (Number(female) || 0);
        }
        
        return updatedData;
      });
    },
    []
  );
  
  // Get error message for a field
  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find((e) => e.field === fieldName);
    return error ? error.message : undefined;
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiService.put(`/surveys/household-surveys/${params.id}`, {
        ...formData,
        lastModifiedBy: "supervisor" // Indicate this was modified by supervisor
      });
      
      if (response.success) {
        console.log('Clearing selected slum from localStorage after save');
        localStorage.removeItem('hhqc-selected-slum');
        setShowSuccessModal(true);
      } else {
        if (response.error && (response.error as any).validationErrors) {
          const validationErrs = (response.error as any).validationErrors;
          setErrors(validationErrs);
          const firstErrorField = validationErrs[0].field;
          const element = document.getElementsByName(firstErrorField)[0] || document.getElementById(firstErrorField);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
          alert("Validation failed for some fields. Please check the highlighted fields.");
        } else {
          alert("Failed to update record: " + (typeof response.error === 'string' ? response.error : "Unknown error"));
        }
      }
    } catch (error: unknown) {
      console.error("Error updating survey:", error);
      alert("Failed to update record: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    console.log('Clearing selected slum from localStorage');
    // Clear the selected slum from localStorage when navigating back
    localStorage.removeItem('hhqc-selected-slum');
    router.push("/supervisor/hhqc");
  };

  if (loading || !dataLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" key={`hhqc-form-${params.id}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="secondary" onClick={handleBack}>
            ← Back to HHQC Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-white">HHQC - Edit Household Record</h1>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={handleBack}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {/* SECTION II: Household Level General Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Household Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="House/Door No."
              value={formData.houseDoorNo || ""}
              onChange={(e) => handleInputChange("houseDoorNo", e.target.value)}
            />
            <Input
              label="Head of Household Name"
              value={formData.headName || ""}
              onChange={(e) => handleInputChange("headName", e.target.value)}
            />
            <Input
              label="Father/Husband/Guardian Name"
              value={formData.fatherName || ""}
              onChange={(e) => handleInputChange("fatherName", e.target.value)}
            />
            <Select
              label="Sex"
              value={formData.sex || ""}
              onChange={(e) => handleInputChange("sex", e.target.value)}
              options={[
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
              ]}
            />
            <Select
              label="Caste"
              value={formData.caste || ""}
              onChange={(e) => handleInputChange("caste", e.target.value)}
              options={[
                { value: "GENERAL", label: "General" },
                { value: "SC", label: "SC" },
                { value: "ST", label: "ST" },
                { value: "OBC", label: "OBC" },
              ]}
            />
            <Select
              label="Religion"
              value={formData.religion || ""}
              onChange={(e) => handleInputChange("religion", e.target.value)}
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
            />
            <Select
              label="Minority Status"
              value={formData.minorityStatus || ""}
              onChange={(e) => handleInputChange("minorityStatus", e.target.value)}
              options={[
                { value: "NON_MINORITY", label: "Non-minority" },
                { value: "MINORITY", label: "Minority" },
              ]}
            />
            <Select
              label="Female Head Status (if applicable)"
              value={formData.femaleHeadStatus || ""}
              onChange={(e) => handleInputChange("femaleHeadStatus", e.target.value)}
              options={[
                { value: "", label: "Not Applicable" },
                { value: "MARRIED", label: "Married" },
                { value: "WIDOWED", label: "Widowed" },
                { value: "ABANDONED_SINGLE", label: "Abandoned/Single" },
                { value: "DIVORCED", label: "Divorced" },
                { value: "UNWED_MOTHER", label: "Unwed mother" },
                { value: "OTHER", label: "Other" },
              ]}
            />
          </div>
        </div>

        {/* Family Composition */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Family Composition</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Family Members (Male)"
              type="number"
              value={formData.familyMembersMale ?? ""}
              onChange={(e) => handleInputChange("familyMembersMale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Family Members (Female)"
              type="number"
              value={formData.familyMembersFemale ?? ""}
              onChange={(e) => handleInputChange("familyMembersFemale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Family Members (Total)"
              type="number"
              value={formData.familyMembersTotal ?? ""}
              disabled
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              label="Illiterate Adults (Male)"
              type="number"
              value={formData.illiterateAdultMale ?? ""}
              onChange={(e) => handleInputChange("illiterateAdultMale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Illiterate Adults (Female)"
              type="number"
              value={formData.illiterateAdultFemale ?? ""}
              onChange={(e) => handleInputChange("illiterateAdultFemale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Illiterate Adults (Total)"
              type="number"
              value={formData.illiterateAdultTotal ?? ""}
              disabled
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              label="Children Not Attending (Male)"
              type="number"
              value={formData.childrenNotAttendingMale ?? ""}
              onChange={(e) => handleInputChange("childrenNotAttendingMale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Children Not Attending (Female)"
              type="number"
              value={formData.childrenNotAttendingFemale ?? ""}
              onChange={(e) => handleInputChange("childrenNotAttendingFemale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Children Not Attending (Total)"
              type="number"
              value={formData.childrenNotAttendingTotal ?? ""}
              disabled
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              label="Handicapped (Physically)"
              type="number"
              value={formData.handicappedPhysically ?? ""}
              onChange={(e) => handleInputChange("handicappedPhysically", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Handicapped (Mentally)"
              type="number"
              value={formData.handicappedMentally ?? ""}
              onChange={(e) => handleInputChange("handicappedMentally", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Handicapped (Total)"
              type="number"
              value={formData.handicappedTotal ?? ""}
              disabled
            />
            <Select
              label="If Major Earning Member is Female, Status"
              value={formData.femaleEarningStatus || ""}
              onChange={(e) => handleInputChange("femaleEarningStatus", e.target.value)}
              name="femaleEarningStatus"
              error={getFieldError("femaleEarningStatus")}
              options={[{ value: "MARRIED", label: "Married" }, { value: "WIDOWED", label: "Widowed" }, { value: "ABANDONED_SINGLE", label: "Abandoned/Single" }, { value: "DIVORCED", label: "Divorced" }, { value: "UNWED_MOTHER", label: "Unwed mother" }, { value: "OTHER", label: "Other" }]}
            />
            <Select
              label="Is Family Below Poverty Line?"
              value={formData.belowPovertyLine || ""}
              onChange={(e) => handleInputChange("belowPovertyLine", e.target.value)}
              name="belowPovertyLine"
              options={[{ value: "YES", label: "Yes" }, { value: "NO", label: "No" }, { value: "DONT_KNOW", label: "Don't Know" }]}
            />
            {formData.belowPovertyLine === "YES" && (
              <Select
                label="BPL card"
                value={formData.bplCard || ""}
                onChange={(e) => handleInputChange("bplCard", e.target.value)}
                name="bplCard"
                options={[{ value: "YES", label: "Yes" }, { value: "NO", label: "No" }]}
              />
            )}
          </div>
        </div>

        {/* Welfare Benefits */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Welfare Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.welfareBenefits?.includes('OLD_AGE_PENSION') || false}
                onChange={(e) => {
                  const newBenefits = e.target.checked 
                    ? [...(formData.welfareBenefits || []), 'OLD_AGE_PENSION']
                    : formData.welfareBenefits?.filter(item => item !== 'OLD_AGE_PENSION') || [];
                  handleInputChange('welfareBenefits', newBenefits);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Old Age Pension</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.welfareBenefits?.includes('WIDOW_PENSION') || false}
                onChange={(e) => {
                  const newBenefits = e.target.checked 
                    ? [...(formData.welfareBenefits || []), 'WIDOW_PENSION']
                    : formData.welfareBenefits?.filter(item => item !== 'WIDOW_PENSION') || [];
                  handleInputChange('welfareBenefits', newBenefits);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Widow Pension</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.welfareBenefits?.includes('DISABLED_PENSION') || false}
                onChange={(e) => {
                  const newBenefits = e.target.checked 
                    ? [...(formData.welfareBenefits || []), 'DISABLED_PENSION']
                    : formData.welfareBenefits?.filter(item => item !== 'DISABLED_PENSION') || [];
                  handleInputChange('welfareBenefits', newBenefits);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Disabled Pension</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.welfareBenefits?.includes('HEALTH_INSURANCE') || false}
                onChange={(e) => {
                  const newBenefits = e.target.checked 
                    ? [...(formData.welfareBenefits || []), 'HEALTH_INSURANCE']
                    : formData.welfareBenefits?.filter(item => item !== 'HEALTH_INSURANCE') || [];
                  handleInputChange('welfareBenefits', newBenefits);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Health Insurance</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.welfareBenefits?.includes('GENERAL_INSURANCE') || false}
                onChange={(e) => {
                  const newBenefits = e.target.checked 
                    ? [...(formData.welfareBenefits || []), 'GENERAL_INSURANCE']
                    : formData.welfareBenefits?.filter(item => item !== 'GENERAL_INSURANCE') || [];
                  handleInputChange('welfareBenefits', newBenefits);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">General Insurance</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.welfareBenefits?.includes('OTHER') || false}
                onChange={(e) => {
                  const newBenefits = e.target.checked 
                    ? [...(formData.welfareBenefits || []), 'OTHER']
                    : formData.welfareBenefits?.filter(item => item !== 'OTHER') || [];
                  handleInputChange('welfareBenefits', newBenefits);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Other</span>
            </label>
          </div>
        </div>

        {/* Consumer Durables */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Consumer Durables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('ELECTRIC_FAN') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'ELECTRIC_FAN']
                    : formData.consumerDurables?.filter(item => item !== 'ELECTRIC_FAN') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Electric Fan</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('REFRIGERATOR') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'REFRIGERATOR']
                    : formData.consumerDurables?.filter(item => item !== 'REFRIGERATOR') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Refrigerator</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('COOLER') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'COOLER']
                    : formData.consumerDurables?.filter(item => item !== 'COOLER') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Cooler</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('RESIDENTIAL_TELEPHONE') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'RESIDENTIAL_TELEPHONE']
                    : formData.consumerDurables?.filter(item => item !== 'RESIDENTIAL_TELEPHONE') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Residential Telephone</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('MOBILE_PHONE') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'MOBILE_PHONE']
                    : formData.consumerDurables?.filter(item => item !== 'MOBILE_PHONE') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Mobile Phone</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('BLACK_WHITE_TELEVISION') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'BLACK_WHITE_TELEVISION']
                    : formData.consumerDurables?.filter(item => item !== 'BLACK_WHITE_TELEVISION') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">B/W Television</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('COLOR_TELEVISION') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'COLOR_TELEVISION']
                    : formData.consumerDurables?.filter(item => item !== 'COLOR_TELEVISION') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Color Television</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('SEWING_MACHINE') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'SEWING_MACHINE']
                    : formData.consumerDurables?.filter(item => item !== 'SEWING_MACHINE') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Sewing Machine</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('FURNITURE') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'FURNITURE']
                    : formData.consumerDurables?.filter(item => item !== 'FURNITURE') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Furniture</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('BICYCLE') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'BICYCLE']
                    : formData.consumerDurables?.filter(item => item !== 'BICYCLE') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Bicycle</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('RICKSHAW') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'RICKSHAW']
                    : formData.consumerDurables?.filter(item => item !== 'RICKSHAW') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Rickshaw</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('PUSH_CART') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'PUSH_CART']
                    : formData.consumerDurables?.filter(item => item !== 'PUSH_CART') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Push Cart</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('BULLOCK_CART') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'BULLOCK_CART']
                    : formData.consumerDurables?.filter(item => item !== 'BULLOCK_CART') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Bullock Cart</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('TWO_WHEELER') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'TWO_WHEELER']
                    : formData.consumerDurables?.filter(item => item !== 'TWO_WHEELER') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Two-Wheeler</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('THREE_WHEELER') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'THREE_WHEELER']
                    : formData.consumerDurables?.filter(item => item !== 'THREE_WHEELER') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Three Wheeler</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('TAXI') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'TAXI']
                    : formData.consumerDurables?.filter(item => item !== 'TAXI') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Taxi</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.consumerDurables?.includes('CAR') || false}
                onChange={(e) => {
                  const newDurables = e.target.checked 
                    ? [...(formData.consumerDurables || []), 'CAR']
                    : formData.consumerDurables?.filter(item => item !== 'CAR') || [];
                  handleInputChange('consumerDurables', newDurables);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Car</span>
            </label>
          </div>
        </div>

        {/* Livestock */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Livestock</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.livestock?.includes('BUFFALO') || false}
                onChange={(e) => {
                  const newLivestock = e.target.checked 
                    ? [...(formData.livestock || []), 'BUFFALO']
                    : formData.livestock?.filter(item => item !== 'BUFFALO') || [];
                  handleInputChange('livestock', newLivestock);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Buffalo</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.livestock?.includes('COW') || false}
                onChange={(e) => {
                  const newLivestock = e.target.checked 
                    ? [...(formData.livestock || []), 'COW']
                    : formData.livestock?.filter(item => item !== 'COW') || [];
                  handleInputChange('livestock', newLivestock);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Cow</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.livestock?.includes('SHEEP_GOAT') || false}
                onChange={(e) => {
                  const newLivestock = e.target.checked 
                    ? [...(formData.livestock || []), 'SHEEP_GOAT']
                    : formData.livestock?.filter(item => item !== 'SHEEP_GOAT') || [];
                  handleInputChange('livestock', newLivestock);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Sheep/Goat</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.livestock?.includes('PIG') || false}
                onChange={(e) => {
                  const newLivestock = e.target.checked 
                    ? [...(formData.livestock || []), 'PIG']
                    : formData.livestock?.filter(item => item !== 'PIG') || [];
                  handleInputChange('livestock', newLivestock);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Pig</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.livestock?.includes('HEN_COCK') || false}
                onChange={(e) => {
                  const newLivestock = e.target.checked 
                    ? [...(formData.livestock || []), 'HEN_COCK']
                    : formData.livestock?.filter(item => item !== 'HEN_COCK') || [];
                  handleInputChange('livestock', newLivestock);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Hen/Cock</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.livestock?.includes('DONKEY') || false}
                onChange={(e) => {
                  const newLivestock = e.target.checked 
                    ? [...(formData.livestock || []), 'DONKEY']
                    : formData.livestock?.filter(item => item !== 'DONKEY') || [];
                  handleInputChange('livestock', newLivestock);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Donkey</span>
            </label>
          </div>
        </div>

        {/* SECTION III: Housing & Infrastructure */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Housing & Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Land Tenure Status"
              value={formData.landTenureStatus || ""}
              onChange={(e) => handleInputChange("landTenureStatus", e.target.value)}
              options={[
                { value: "PATTA", label: "Patta" },
                { value: "POSSESSION_CERTIFICATE", label: "Possession Certificate" },
                { value: "PRIVATE_LAND_ENCROACHED", label: "Private Land Encroached" },
                { value: "PUBLIC_LAND_ENCROACHED", label: "Public Land Encroached" },
                { value: "RENTED", label: "Rented" },
                { value: "OTHER", label: "Other" },
              ]}
            />
            <Select
              label="House Structure"
              value={formData.houseStructure || ""}
              onChange={(e) => handleInputChange("houseStructure", e.target.value)}
              options={[
                { value: "PUCCA", label: "Pucca" },
                { value: "SEMI_PUCCA", label: "Semi-Pucca" },
                { value: "KATCHA", label: "Katcha" },
              ]}
            />
            <Select
              label="Roof Type"
              value={formData.roofType || ""}
              onChange={(e) => handleInputChange("roofType", e.target.value)}
              options={[
                { value: "GRASS_THATCHED", label: "Grass Thatched" },
                { value: "TARPAULIN", label: "Tarpaulin" },
                { value: "WOODEN", label: "Wooden" },
                { value: "ASBESTOS", label: "Asbestos" },
                { value: "TILED", label: "Tiled" },
                { value: "CEMENT_SLAB", label: "Cement Slab" },
                { value: "OTHER", label: "Other" },
              ]}
            />
            <Select
              label="Flooring Type"
              value={formData.flooringType || ""}
              onChange={(e) => handleInputChange("flooringType", e.target.value)}
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
              label="House Lighting"
              value={formData.houseLighting || ""}
              onChange={(e) => handleInputChange("houseLighting", e.target.value)}
              options={[
                { value: "ELECTRICITY", label: "Electricity" },
                { value: "KEROSENE", label: "Kerosene" },
                { value: "FIREWOOD", label: "Firewood" },
                { value: "OTHER", label: "Other" },
              ]}
            />
            <Select
              label="Cooking Fuel"
              value={formData.cookingFuel || ""}
              onChange={(e) => handleInputChange("cookingFuel", e.target.value)}
              options={[
                { value: "GAS", label: "Gas" },
                { value: "ELECTRICITY", label: "Electricity" },
                { value: "KEROSENE", label: "Kerosene" },
                { value: "CHARCOAL", label: "Charcoal" },
                { value: "FIREWOOD", label: "Firewood" },
                { value: "OTHER", label: "Other" },
              ]}
            />
          </div>
        </div>

        {/* Water & Sanitation */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Water & Sanitation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Water Source"
              value={formData.waterSource || ""}
              onChange={(e) => handleInputChange("waterSource", e.target.value)}
              options={[
                { value: "WITHIN_PREMISES_TAP", label: "Within Premises Tap" },
                { value: "WITHIN_PREMISES_TUBEWELL", label: "Within Premises Tubewell" },
                { value: "WITHIN_PREMISES_OPENWELL", label: "Within Premises Openwell" },
                { value: "OUTSIDE_PREMISES_PUBLIC_TAP", label: "Outside Premises Public Tap" },
                { value: "OUTSIDE_PREMISES_TUBE_BORE_WELL", label: "Outside Premises Tube/Bore Well" },
                { value: "OUTSIDE_PREMISES_OPENWELL", label: "Outside Premises Openwell" },
                { value: "OUTSIDE_PREMISES_TANK_POND", label: "Outside Premises Tank/Pond" },
                { value: "OUTSIDE_PREMISES_RIVER", label: "Outside Premises River" },
                { value: "WATER_TANKER", label: "Water Tanker" },
                { value: "OTHER", label: "Other" },
              ]}
            />
            <Select
              label="Water Supply Duration"
              value={formData.waterSupplyDuration || ""}
              onChange={(e) => handleInputChange("waterSupplyDuration", e.target.value)}
              options={[
                { value: "LESS_THAN_1_HOUR", label: "Less than 1 hour" },
                { value: "ONE_TWO_HOURS", label: "1-2 hours" },
                { value: "MORE_THAN_2_HOURS", label: "More than 2 hours" },
                { value: "ONCE_WEEK", label: "Once a week" },
                { value: "TWICE_WEEK", label: "Twice a week" },
                { value: "NOT_REGULAR", label: "Not regular" },
                { value: "NO_SUPPLY", label: "No supply" },
              ]}
            />
            <Select
              label="Water Source Distance"
              value={formData.waterSourceDistance || ""}
              onChange={(e) => handleInputChange("waterSourceDistance", e.target.value)}
              options={[
                { value: "LESS_THAN_HALF_KM", label: "Less than 0.5 km" },
                { value: "HALF_TO_ONE_KM", label: "0.5-1 km" },
                { value: "ONE_TO_TWO_KM", label: "1-2 km" },
                { value: "TWO_TO_FIVE_KM", label: "2-5 km" },
                { value: "MORE_THAN_FIVE_KM", label: "More than 5 km" },
              ]}
            />
            <Select
              label="Toilet Facility"
              value={formData.toiletFacility || ""}
              onChange={(e) => handleInputChange("toiletFacility", e.target.value)}
              options={[
                { value: "OWN_SEPTIC_FLUSH", label: "Own Septic Flush" },
                { value: "OWN_DRY_LATRINE", label: "Own Dry Latrine" },
                { value: "SHARED_SEPTIC_FLUSH", label: "Shared Septic Flush" },
                { value: "SHARED_DRY_LATRINE", label: "Shared Dry Latrine" },
                { value: "COMMUNITY_SEPTIC_FLUSH", label: "Community Septic Flush" },
                { value: "COMMUNITY_DRY_LATRINE", label: "Community Dry Latrine" },
                { value: "OPEN_DEFECATION", label: "Open Defecation" },
              ]}
            />
            <Select
              label="Bathroom Facility"
              value={formData.bathroomFacility || ""}
              onChange={(e) => handleInputChange("bathroomFacility", e.target.value)}
              options={[
                { value: "WITHIN_PREMISES", label: "Within Premises" },
                { value: "OUTSIDE_PREMISES", label: "Outside Premises" },
                { value: "COMMUNITY_BATH", label: "Community Bath" },
                { value: "NO_BATHROOM", label: "No Bathroom" },
              ]}
            />
            <Select
              label="Road Front Type"
              value={formData.roadFrontType || ""}
              onChange={(e) => handleInputChange("roadFrontType", e.target.value)}
              options={[
                { value: "MOTORABLE_PUCCA", label: "Motorable Pucca" },
                { value: "MOTORABLE_KATCHA", label: "Motorable Katcha" },
                { value: "NON_MOTORABLE_PUCCA", label: "Non-Motorable Pucca" },
                { value: "NON_MOTORABLE_KATCHA", label: "Non-Motorable Katcha" },
              ]}
            />
          </div>
        </div>

        {/* Education & Health Facilities */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Education & Health Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Preschool Type"
              value={formData.preschoolType || ""}
              onChange={(e) => handleInputChange("preschoolType", e.target.value)}
              options={[
                { value: "MUNICIPAL", label: "Municipal" },
                { value: "GOVERNMENT", label: "Government" },
                { value: "PRIVATE", label: "Private" },
              ]}
            />
            <Select
              label="Primary School Type"
              value={formData.primarySchoolType || ""}
              onChange={(e) => handleInputChange("primarySchoolType", e.target.value)}
              options={[
                { value: "MUNICIPAL", label: "Municipal" },
                { value: "GOVERNMENT", label: "Government" },
                { value: "PRIVATE", label: "Private" },
              ]}
            />
            <Select
              label="High School Type"
              value={formData.highSchoolType || ""}
              onChange={(e) => handleInputChange("highSchoolType", e.target.value)}
              options={[
                { value: "MUNICIPAL", label: "Municipal" },
                { value: "GOVERNMENT", label: "Government" },
                { value: "PRIVATE", label: "Private" },
              ]}
            />
            <Select
              label="Health Facility Type"
              value={formData.healthFacilityType || ""}
              onChange={(e) => handleInputChange("healthFacilityType", e.target.value)}
              options={[
                { value: "PRIMARY_HEALTH_CENTRE", label: "Primary Health Centre" },
                { value: "GOVT_HOSPITAL", label: "Government Hospital" },
                { value: "MATERNITY_CENTRE", label: "Maternity Centre" },
                { value: "PRIVATE_CLINIC", label: "Private Clinic" },
                { value: "RMP", label: "RMP" },
                { value: "AYURVEDIC", label: "Ayurvedic" },
              ]}
            />
          </div>
        </div>

        {/* SECTION IV: Migration Details */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Migration Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Years in Town"
              value={formData.yearsInTown || ""}
              onChange={(e) => handleInputChange("yearsInTown", e.target.value)}
              options={[
                { value: "ZERO_TO_ONE_YEAR", label: "0-1 year" },
                { value: "ONE_TO_THREE_YEARS", label: "1-3 years" },
                { value: "THREE_TO_FIVE_YEARS", label: "3-5 years" },
                { value: "MORE_THAN_FIVE_YEARS", label: "More than 5 years" },
              ]}
            />
            <Select
              label="Migrated"
              value={formData.migrated || ""}
              onChange={(e) => handleInputChange("migrated", e.target.value)}
              options={[
                { value: "YES", label: "Yes" },
                { value: "NO", label: "No" },
              ]}
            />
            <Select
              label="Migrated From"
              value={formData.migratedFrom || ""}
              onChange={(e) => handleInputChange("migratedFrom", e.target.value)}
              options={[
                { value: "RURAL_TO_URBAN", label: "Rural to Urban" },
                { value: "URBAN_TO_URBAN", label: "Urban to Urban" },
              ]}
            />
            <Select
              label="Migration Type"
              value={formData.migrationType || ""}
              onChange={(e) => handleInputChange("migrationType", e.target.value)}
              options={[
                { value: "SEASONAL", label: "Seasonal" },
                { value: "PERMANENT", label: "Permanent" },
              ]}
            />
          </div>
        </div>

        {/* Reasons for Migration */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Reasons for Migration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.migrationReasons?.includes('UNEMPLOYMENT') || false}
                onChange={(e) => {
                  const newReasons = e.target.checked 
                    ? [...(formData.migrationReasons || []), 'UNEMPLOYMENT']
                    : formData.migrationReasons?.filter(item => item !== 'UNEMPLOYMENT') || [];
                  handleInputChange('migrationReasons', newReasons);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Unemployment</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.migrationReasons?.includes('LOW_WAGE') || false}
                onChange={(e) => {
                  const newReasons = e.target.checked 
                    ? [...(formData.migrationReasons || []), 'LOW_WAGE']
                    : formData.migrationReasons?.filter(item => item !== 'LOW_WAGE') || [];
                  handleInputChange('migrationReasons', newReasons);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Low wage</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.migrationReasons?.includes('DEBT') || false}
                onChange={(e) => {
                  const newReasons = e.target.checked 
                    ? [...(formData.migrationReasons || []), 'DEBT']
                    : formData.migrationReasons?.filter(item => item !== 'DEBT') || [];
                  handleInputChange('migrationReasons', newReasons);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Debt</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.migrationReasons?.includes('DROUGHT') || false}
                onChange={(e) => {
                  const newReasons = e.target.checked 
                    ? [...(formData.migrationReasons || []), 'DROUGHT']
                    : formData.migrationReasons?.filter(item => item !== 'DROUGHT') || [];
                  handleInputChange('migrationReasons', newReasons);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Drought</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.migrationReasons?.includes('CONFLICT') || false}
                onChange={(e) => {
                  const newReasons = e.target.checked 
                    ? [...(formData.migrationReasons || []), 'CONFLICT']
                    : formData.migrationReasons?.filter(item => item !== 'CONFLICT') || [];
                  handleInputChange('migrationReasons', newReasons);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Conflict</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.migrationReasons?.includes('EDUCATION') || false}
                onChange={(e) => {
                  const newReasons = e.target.checked 
                    ? [...(formData.migrationReasons || []), 'EDUCATION']
                    : formData.migrationReasons?.filter(item => item !== 'EDUCATION') || [];
                  handleInputChange('migrationReasons', newReasons);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Education</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.migrationReasons?.includes('MARRIAGE') || false}
                onChange={(e) => {
                  const newReasons = e.target.checked 
                    ? [...(formData.migrationReasons || []), 'MARRIAGE']
                    : formData.migrationReasons?.filter(item => item !== 'MARRIAGE') || [];
                  handleInputChange('migrationReasons', newReasons);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Marriage</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.migrationReasons?.includes('OTHERS') || false}
                onChange={(e) => {
                  const newReasons = e.target.checked 
                    ? [...(formData.migrationReasons || []), 'OTHERS']
                    : formData.migrationReasons?.filter(item => item !== 'OTHERS') || [];
                  handleInputChange('migrationReasons', newReasons);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Others</span>
            </label>
          </div>
        </div>

        {/* SECTION V: Income & Expenditure */}
        <div className="mb-8 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Income & Expenditure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Earning Adults (Male)"
              type="number"
              value={formData.earningAdultMale ?? ""}
              onChange={(e) => handleInputChange("earningAdultMale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Earning Adults (Female)"
              type="number"
              value={formData.earningAdultFemale ?? ""}
              onChange={(e) => handleInputChange("earningAdultFemale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Earning Adults (Total)"
              type="number"
              value={formData.earningAdultTotal ?? ""}
              disabled
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              label="Earning Non-Adults (Male)"
              type="number"
              value={formData.earningNonAdultMale ?? ""}
              onChange={(e) => handleInputChange("earningNonAdultMale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Earning Non-Adults (Female)"
              type="number"
              value={formData.earningNonAdultFemale ?? ""}
              onChange={(e) => handleInputChange("earningNonAdultFemale", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Earning Non-Adults (Total)"
              type="number"
              value={formData.earningNonAdultTotal ?? ""}
              disabled
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              label="Monthly Income"
              type="number"
              value={formData.monthlyIncome ?? ""}
              onChange={(e) => handleInputChange("monthlyIncome", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Monthly Expenditure"
              type="number"
              value={formData.monthlyExpenditure ?? ""}
              onChange={(e) => handleInputChange("monthlyExpenditure", e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Debt Outstanding"
              type="number"
              value={formData.debtOutstanding ?? ""}
              onChange={(e) => handleInputChange("debtOutstanding", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="pt-6 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
          <textarea
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Add any additional notes about this household..."
            value={formData.notes || ""}
            onChange={(e) => handleInputChange("notes", e.target.value)}
          />
        </div>
      </Card>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Record Updated"
        message="The household record has been updated successfully."
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/supervisor/hhqc");
        }}
      />
    </div>
  );
}