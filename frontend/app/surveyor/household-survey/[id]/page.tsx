'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SurveyorLayout from '@/components/SurveyorLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Checkbox from '@/components/Checkbox';
import apiService from '@/services/api';
import { useToast } from '@/components/Toast';

interface HouseholdSurveyForm {
  householdId: string;
  // Section I - General Information
  slumName?: string;
  locationWard?: string;
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

const SECTIONS = [
  { id: 'general', title: 'General Information', icon: '🏢' },
  { id: 'household', title: 'Household Details', icon: '👥' },
  { id: 'housing', title: 'Housing & Infrastructure', icon: '🏠' },
  { id: 'facilities', title: 'Education & Health', icon: '🏥' },
  { id: 'migration', title: 'Migration Details', icon: '✈️' },
  { id: 'income', title: 'Income & Expenditure', icon: '💰' },
  { id: 'additional', title: 'Additional Info', icon: '📝' },
];

const HOUSING_MATERIALS = [
  { id: 'STONE_BRICK', label: 'Stone/Brick' },
  { id: 'WOOD', label: 'Wood' },
  { id: 'METAL', label: 'Metal/Tin' },
  { id: 'CONCRETE', label: 'Concrete' },
  { id: 'MUD', label: 'Mud/Clay' },
];

const CONSUMER_DURABLES = [
  { id: 'ELECTRIC_FAN', label: 'Electric Fan' },
  { id: 'REFRIGERATOR', label: 'Refrigerator' },
  { id: 'COOLER', label: 'Cooler' },
  { id: 'RESIDENTIAL_PHONE', label: 'Residential Telephone' },
  { id: 'MOBILE_PHONE', label: 'Mobile Phone' },
  { id: 'BW_TELEVISION', label: 'B/W Television' },
  { id: 'COLOR_TELEVISION', label: 'Color Television' },
  { id: 'SEWING_MACHINE', label: 'Sewing Machine' },
  { id: 'FURNITURE', label: 'Furniture' },
  { id: 'BICYCLE', label: 'Bicycle' },
  { id: 'RICKSHAW', label: 'Rickshaw' },
  { id: 'PUSH_CART', label: 'Push Cart' },
  { id: 'BULLOCK_CART', label: 'Bullock Cart' },
  { id: 'TWO_WHEELER', label: 'Two-Wheeler' },
  { id: 'THREE_WHEELER', label: 'Three Wheeler' },
  { id: 'TAXI', label: 'Taxi' },
  { id: 'CAR', label: 'Car' },
];

const LIVESTOCK_OPTIONS = [
  { id: 'BUFFALO', label: 'Buffalo' },
  { id: 'COW', label: 'Cow' },
  { id: 'SHEEP_GOAT', label: 'Sheep/Goat' },
  { id: 'PIG', label: 'Pig' },
  { id: 'HEN_COCK', label: 'Hen/Cock' },
  { id: 'DONKEY', label: 'Donkey' },
];

const WELFARE_BENEFITS = [
  { id: 'OLD_AGE_PENSION', label: 'Old Age Pension' },
  { id: 'WIDOW_PENSION', label: 'Widow Pension' },
  { id: 'DISABLED_PENSION', label: 'Disabled Pension' },
  { id: 'HEALTH_INSURANCE', label: 'Health Insurance' },
  { id: 'GENERAL_INSURANCE', label: 'General Insurance' },
  { id: 'OTHER', label: 'Other' },
];

export default function HouseholdSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const { showToast } = useToast();

  const [slum, setSlum] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [households, setHouseholds] = useState<any[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [householdsLoading, setHouseholdsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['general', 'household'])
  );

  const [formData, setFormData] = useState<HouseholdSurveyForm>({
    householdId: '',
  });

  const loadHouseholdsForSlum = useCallback(async (slumId: string) => {
    try {
      setHouseholdsLoading(true);
      // TODO: Add API method to fetch households for a slum
      // const response = await apiService.getHouseholdsForSlum(slumId);
      // if (response.success) {
      //   setHouseholds(response.data);
      // }
    } catch (error) {
      console.error('Error loading households:', error);
      showToast('Failed to load households', 'error');
    } finally {
      setHouseholdsLoading(false);
    }
  }, [showToast]);

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
              slumName: slumData.name || "",
              locationWard: slumData.ward || "",
            }));
            
            // Load households for this slum
            await loadHouseholdsForSlum(slumId);
          }
        } else {
          showToast("Failed to load assignment details", "error");
          router.push("/surveyor/dashboard");
          return;
        }
      } catch (error) {
        console.error('Error loading assignment:', error);
        showToast("Failed to load assignment data", "error");
        router.push("/surveyor/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assignmentId, router, showToast]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
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
  }, []);

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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const response = await apiService.submitHouseholdSurvey(
        formData.householdId,
        formData
      );

      if (response.success) {
        showToast('Household survey submitted successfully', 'success');
        router.push(`/surveyor/dashboard`);
      } else {
        showToast(response.message || 'Failed to submit survey', 'error');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      showToast('Failed to submit survey', 'error');
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
              onClick={() => router.back()}
              className="mb-2 text-sm text-slate-400 hover:text-white flex items-center transition-colors"
            >
              <span className="mr-1">←</span> Back to Assignment
            </button>
            <h1 className="text-3xl font-bold text-white tracking-tight">Household Survey</h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {slum?.name}
            </p>
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-4 mb-6">
          {SECTIONS.map((section) => (
            <Card
              key={`section-${section.id}`}
              className="overflow-hidden cursor-pointer transition-colors"
              onClick={() => toggleSection(section.id)}
              padding="none"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 bg-slate-800 rounded-lg">{section.icon}</span>
                  <h3 className="font-bold text-slate-200">{section.title}</h3>
                </div>
                <span
                  className={`
                    text-slate-500 transform transition-transform duration-200
                    ${expandedSections.has(section.id) ? 'rotate-180' : ''}
                  `}
                >
                  ▼
                </span>
              </div>

            {/* Section Content */}
            {expandedSections.has(section.id) && (
              <div className="border-t border-slate-700 p-4 space-y-4">
                {section.id === 'general' && (
                  <>
                    <Input
                      label="Slum Name"
                      placeholder="Enter slum name"
                      value={formData.slumName || ''}
                      readOnly
                      className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                      label="Location - Ward No/Name"
                      placeholder="Enter ward"
                      value={formData.locationWard || ''}
                      readOnly
                      className="bg-slate-800/50 cursor-not-allowed opacity-75"
                    />
                    <Input
                      label="House/Flat/Door No."
                      placeholder="Enter door number"
                      value={formData.houseDoorNo || ''}
                      onChange={(e) =>
                        handleInputChange('houseDoorNo', e.target.value)
                      }
                    />
                  </>
                )}

                {section.id === 'household' && (
                  <>
                    <Input
                      label="Head of Household Name"
                      placeholder="Enter name"
                      value={formData.headName || ''}
                      onChange={(e) =>
                        handleInputChange('headName', e.target.value)
                      }
                    />
                    <Input
                      label="Father's Name"
                      placeholder="Enter father's name"
                      value={formData.fatherName || ''}
                      onChange={(e) =>
                        handleInputChange('fatherName', e.target.value)
                      }
                    />
                    <Select
                      label="Sex"
                      value={formData.sex || ''}
                      onChange={(value) =>
                        handleInputChange('sex', value)
                      }
                      options={[
                        { value: 'MALE', label: 'Male' },
                        { value: 'FEMALE', label: 'Female' },
                      ]}
                    />
                    <Select
                      label="Caste"
                      value={formData.caste || ''}
                      onChange={(value) =>
                        handleInputChange('caste', value)
                      }
                      options={[
                        { value: 'GENERAL', label: 'General' },
                        { value: 'SC', label: 'SC' },
                        { value: 'ST', label: 'ST' },
                        { value: 'OBC', label: 'OBC' },
                      ]}
                    />
                    <Select
                      label="Religion"
                      value={formData.religion || ''}
                      onChange={(value) =>
                        handleInputChange('religion', value)
                      }
                      options={[
                        { value: 'HINDU', label: 'Hindu' },
                        { value: 'MUSLIM', label: 'Muslim' },
                        { value: 'CHRISTIAN', label: 'Christian' },
                        { value: 'SIKH', label: 'Sikh' },
                        { value: 'JAINISM', label: 'Jainism' },
                        { value: 'BUDDHISM', label: 'Buddhism' },
                        { value: 'ZOROASTRIANISM', label: 'Zoroastrianism' },
                        { value: 'OTHERS', label: 'Others' },
                      ]}
                    />
                    <Select
                      label="Minority Status"
                      value={formData.minorityStatus || ''}
                      onChange={(value) =>
                        handleInputChange('minorityStatus', value)
                      }
                      options={[
                        { value: 'NON_MINORITY', label: 'Non-minority' },
                        { value: 'MINORITY', label: 'Minority' },
                      ]}
                    />
                    <Input
                      label="Number of Family Members (Male)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.familyMembersMale || ''}
                      onChange={(e) =>
                        handleInputChange('familyMembersMale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Family Members (Female)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.familyMembersFemale || ''}
                      onChange={(e) =>
                        handleInputChange('familyMembersFemale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Family Members (Total)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.familyMembersTotal || ''}
                      onChange={(e) =>
                        handleInputChange('familyMembersTotal', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Select
                      label="Female Head Status"
                      value={formData.femaleHeadStatus || ''}
                      onChange={(value) =>
                        handleInputChange('femaleHeadStatus', value)
                      }
                      options={[
                        { value: 'MARRIED', label: 'Married' },
                        { value: 'WIDOWED', label: 'Widowed' },
                        { value: 'ABANDONED_SINGLE', label: 'Abandoned/Single' },
                        { value: 'DIVORCED', label: 'Divorced' },
                        { value: 'UNWED_MOTHER', label: 'Unwed mother' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                    />
                    <Input
                      label="Number of Illiterate Adult Members (Male)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.illiterateAdultMale || ''}
                      onChange={(e) =>
                        handleInputChange('illiterateAdultMale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Illiterate Adult Members (Female)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.illiterateAdultFemale || ''}
                      onChange={(e) =>
                        handleInputChange('illiterateAdultFemale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Illiterate Adult Members (Total)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.illiterateAdultTotal || ''}
                      onChange={(e) =>
                        handleInputChange('illiterateAdultTotal', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Children Aged 6-14 Not Attending School (Male)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.childrenNotAttendingMale || ''}
                      onChange={(e) =>
                        handleInputChange('childrenNotAttendingMale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Children Aged 6-14 Not Attending School (Female)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.childrenNotAttendingFemale || ''}
                      onChange={(e) =>
                        handleInputChange('childrenNotAttendingFemale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Children Aged 6-14 Not Attending School (Total)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.childrenNotAttendingTotal || ''}
                      onChange={(e) =>
                        handleInputChange('childrenNotAttendingTotal', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Handicapped Persons (Physically)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.handicappedPhysically || ''}
                      onChange={(e) =>
                        handleInputChange('handicappedPhysically', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Handicapped Persons (Mentally)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.handicappedMentally || ''}
                      onChange={(e) =>
                        handleInputChange('handicappedMentally', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Handicapped Persons (Total)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.handicappedTotal || ''}
                      onChange={(e) =>
                        handleInputChange('handicappedTotal', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Select
                      label="If Major Earning Member is Female, Status"
                      value={formData.femaleEarningStatus || ''}
                      onChange={(value) =>
                        handleInputChange('femaleEarningStatus', value)
                      }
                      options={[
                        { value: 'MARRIED', label: 'Married' },
                        { value: 'WIDOWED', label: 'Widowed' },
                        { value: 'ABANDONED_SINGLE', label: 'Abandoned/Single' },
                        { value: 'DIVORCED', label: 'Divorced' },
                        { value: 'UNWED_MOTHER', label: 'Unwed mother' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="Is Your Family Below Poverty Line?"
                      value={formData.belowPovertyLine || ''}
                      onChange={(value) =>
                        handleInputChange('belowPovertyLine', value)
                      }
                      options={[
                        { value: 'YES', label: 'Yes' },
                        { value: 'NO', label: 'No' },
                        { value: 'DONT_KNOW', label: 'Don t know' },
                      ]}
                    />
                    <Select
                      label="If BPL, Does the Family Possess BPL Card?"
                      value={formData.bplCard || ''}
                      onChange={(value) =>
                        handleInputChange('bplCard', value)
                      }
                      options={[
                        { value: 'YES', label: 'Yes' },
                        { value: 'NO', label: 'No' },
                      ]}
                    />
                  </>
                )}

                {section.id === 'housing' && (
                  <>
                    <Select
                      label="Land Tenure Status"
                      value={formData.landTenureStatus || ''}
                      onChange={(value) =>
                        handleInputChange('landTenureStatus', value)
                      }
                      options={[
                        { value: 'PATTA', label: 'Patta' },
                        { value: 'POSSESSION_CERTIFICATE', label: 'Possession Certificate/Occupancy Right' },
                        { value: 'PRIVATE_LAND_ENCROACHED', label: 'Private Land Encroached' },
                        { value: 'PUBLIC_LAND_ENCROACHED', label: 'Public Land Encroached' },
                        { value: 'TENTED', label: 'Tented' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="House Structure"
                      value={formData.houseStructure || ''}
                      onChange={(value) =>
                        handleInputChange('houseStructure', value)
                      }
                      options={[
                        { value: 'PUCCA', label: 'Pucca' },
                        { value: 'SEMI_PUCCA', label: 'Semi-Pucca' },
                        { value: 'KATCHA', label: 'Katcha' },
                      ]}
                    />
                    <Select
                      label="Roof Type"
                      value={formData.roofType || ''}
                      onChange={(value) =>
                        handleInputChange('roofType', value)
                      }
                      options={[
                        { value: 'GRASS_THATCHED', label: 'Grass/thatched' },
                        { value: 'TARPAULIN', label: 'Tarpaulin' },
                        { value: 'WOODEN', label: 'Wooden' },
                        { value: 'ASBESTOS', label: 'Asbestos' },
                        { value: 'TILED', label: 'Tiled' },
                        { value: 'CEMENT_SLAB', label: 'Cement/Slab' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="Flooring Type"
                      value={formData.flooringType || ''}
                      onChange={(value) =>
                        handleInputChange('flooringType', value)
                      }
                      options={[
                        { value: 'MUD', label: 'Mud' },
                        { value: 'BRICK', label: 'Brick' },
                        { value: 'STONE', label: 'Stone' },
                        { value: 'CEMENT', label: 'Cement' },
                        { value: 'TILES', label: 'Tiles' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="House Lighting"
                      value={formData.houseLighting || ''}
                      onChange={(value) =>
                        handleInputChange('houseLighting', value)
                      }
                      options={[
                        { value: 'ELECTRICITY', label: 'Electricity connection' },
                        { value: 'KEROSENE', label: 'Kerosene' },
                        { value: 'FIREWOOD', label: 'Firewood' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="Cooking Fuel"
                      value={formData.cookingFuel || ''}
                      onChange={(value) =>
                        handleInputChange('cookingFuel', value)
                      }
                      options={[
                        { value: 'GAS', label: 'Gas' },
                        { value: 'ELECTRICITY', label: 'Electricity' },
                        { value: 'KEROSENE', label: 'Kerosene' },
                        { value: 'CHARCOAL', label: 'Charcoal' },
                        { value: 'FIREWOOD', label: 'Firewood' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="Water Source"
                      value={formData.waterSource || ''}
                      onChange={(value) =>
                        handleInputChange('waterSource', value)
                      }
                      options={[
                        { value: 'WITHIN_PREMISES_TAP', label: 'Within premises - Tap' },
                        { value: 'WITHIN_PREMISES_TUBEWELL', label: 'Within premises - Tubewell/handpump' },
                        { value: 'WITHIN_PREMISES_OPENWELL', label: 'Within premises - Open well' },
                        { value: 'OUTSIDE_PREMISES_PUBLIC_TAP', label: 'Outside premises - Public tap' },
                        { value: 'OUTSIDE_PREMISES_TUBE_BORE_WELL', label: 'Outside premises - Tube well/Bore well/Hand pump' },
                        { value: 'OUTSIDE_PREMISES_OPENWELL', label: 'Outside premises - Open well' },
                        { value: 'OUTSIDE_PREMISES_TANK_POND', label: 'Outside premises - Tank/pond' },
                        { value: 'OUTSIDE_PREMISES_RIVER', label: 'Outside premises - River/Canal/Lake/Spring' },
                        { value: 'WATER_TANKER', label: 'Water tanker' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                    />
                    <Select
                      label="Water Supply Duration"
                      value={formData.waterSupplyDuration || ''}
                      onChange={(value) =>
                        handleInputChange('waterSupplyDuration', value)
                      }
                      options={[
                        { value: 'LESS_THAN_1_HOUR', label: 'Less than 1 hour daily' },
                        { value: 'ONE_TWO_HOURS', label: '1-2 hrs daily' },
                        { value: 'MORE_THAN_2_HOURS', label: 'More than 2 hrs daily' },
                        { value: 'ONCE_WEEK', label: 'Once a week' },
                        { value: 'TWICE_WEEK', label: 'Twice a week' },
                        { value: 'NOT_REGULAR', label: 'Not regular' },
                        { value: 'NO_SUPPLY', label: 'No supply' },
                      ]}
                    />
                    <Select
                      label="Distance to Water Source"
                      value={formData.waterSourceDistance || ''}
                      onChange={(value) =>
                        handleInputChange('waterSourceDistance', value)
                      }
                      options={[
                        { value: 'LESS_THAN_HALF_KM', label: 'Less than 0.5 kms' },
                        { value: 'HALF_TO_ONE_KM', label: '0.5 to 1.0 km' },
                        { value: 'ONE_TO_TWO_KM', label: '1.0 km to 2.0 km' },
                        { value: 'TWO_TO_FIVE_KM', label: '2.0 km to 5.0 km' },
                        { value: 'MORE_THAN_FIVE_KM', label: 'More than 5.0 km' },
                      ]}
                    />
                    <Select
                      label="Toilet Facility"
                      value={formData.toiletFacility || ''}
                      onChange={(value) =>
                        handleInputChange('toiletFacility', value)
                      }
                      options={[
                        { value: 'OWN_SEPTIC_FLUSH', label: 'Own septic tank/flush latrine' },
                        { value: 'OWN_DRY_LATRINE', label: 'Own dry latrine' },
                        { value: 'SHARED_SEPTIC_FLUSH', label: 'Shared septic tank/flush latrine' },
                        { value: 'SHARED_DRY_LATRINE', label: 'Shared dry latrine' },
                        { value: 'COMMUNITY_SEPTIC_FLUSH', label: 'Community septic tank/flush latrine' },
                        { value: 'COMMUNITY_DRY_LATRINE', label: 'Community dry latrine' },
                        { value: 'OPEN_DEFECATION', label: 'Open defecation' },
                      ]}
                    />
                    <Select
                      label="Bathroom Facility"
                      value={formData.bathroomFacility || ''}
                      onChange={(value) =>
                        handleInputChange('bathroomFacility', value)
                      }
                      options={[
                        { value: 'WITHIN_PREMISES', label: 'Within premises' },
                        { value: 'OUTSIDE_PREMISES', label: 'Outside premises' },
                        { value: 'COMMUNITY_BATH', label: 'Community bath' },
                        { value: 'NO_BATHROOM', label: 'No bathroom' },
                      ]}
                    />
                    <Select
                      label="Road in Front of House"
                      value={formData.roadFrontType || ''}
                      onChange={(value) =>
                        handleInputChange('roadFrontType', value)
                      }
                      options={[
                        { value: 'MOTORABLE_PUCCA', label: 'Motorable pucca' },
                        { value: 'MOTORABLE_KATCHA', label: 'Motorable katcha' },
                        { value: 'NON_MOTORABLE_PUCCA', label: 'Non-motorable pucca' },
                        { value: 'NON_MOTORABLE_KATCHA', label: 'Non-motorable katcha' },
                      ]}
                    />
                  </>
                )}

                {section.id === 'facilities' && (
                  <>
                    <Select
                      label="Type of Pre-school Available"
                      value={formData.preschoolType || ''}
                      onChange={(value) =>
                        handleInputChange('preschoolType', value)
                      }
                      options={[
                        { value: 'MUNICIPAL', label: 'Municipal' },
                        { value: 'GOVERNMENT', label: 'Government' },
                        { value: 'PRIVATE', label: 'Private' },
                      ]}
                    />
                    <Select
                      label="Type of Primary School Available"
                      value={formData.primarySchoolType || ''}
                      onChange={(value) =>
                        handleInputChange('primarySchoolType', value)
                      }
                      options={[
                        { value: 'MUNICIPAL', label: 'Municipal' },
                        { value: 'GOVERNMENT', label: 'Government' },
                        { value: 'PRIVATE', label: 'Private' },
                      ]}
                    />
                    <Select
                      label="Type of High School Available"
                      value={formData.highSchoolType || ''}
                      onChange={(value) =>
                        handleInputChange('highSchoolType', value)
                      }
                      options={[
                        { value: 'MUNICIPAL', label: 'Municipal' },
                        { value: 'GOVERNMENT', label: 'Government' },
                        { value: 'PRIVATE', label: 'Private' },
                      ]}
                    />
                    <Select
                      label="Type of Health Facility Access"
                      value={formData.healthFacilityType || ''}
                      onChange={(value) =>
                        handleInputChange('healthFacilityType', value)
                      }
                      options={[
                        { value: 'PRIMARY_HEALTH_CENTRE', label: 'Primary Health Centre' },
                        { value: 'GOVT_HOSPITAL', label: 'Government Hospital' },
                        { value: 'MATERNITY_CENTRE', label: 'Maternity Centre' },
                        { value: 'PRIVATE_CLINIC', label: 'Private Clinic' },
                        { value: 'RMP', label: 'RMP' },
                        { value: 'AYURVEDIC', label: 'Ayurvedic Doctor/Vaidya' },
                      ]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">
                        Welfare Benefits
                      </label>
                      <div className="space-y-2">
                        {WELFARE_BENEFITS.map((benefit) => (
                          <Checkbox
                            key={benefit.id}
                            label={benefit.label}
                            checked={
                              (formData.welfareBenefits || []).includes(benefit.id)
                            }
                            onChange={() =>
                              handleCheckboxChange('welfareBenefits', benefit.id)
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">
                        Consumer Durables
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {CONSUMER_DURABLES.map((durable) => (
                          <Checkbox
                            key={durable.id}
                            label={durable.label}
                            checked={
                              (formData.consumerDurables || []).includes(durable.id)
                            }
                            onChange={() =>
                              handleCheckboxChange('consumerDurables', durable.id)
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">
                        Livestock
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {LIVESTOCK_OPTIONS.map((livestock) => (
                          <Checkbox
                            key={livestock.id}
                            label={livestock.label}
                            checked={
                              (formData.livestock || []).includes(livestock.id)
                            }
                            onChange={() =>
                              handleCheckboxChange('livestock', livestock.id)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {section.id === 'migration' && (
                  <>
                    <Select
                      label="Number of Years of Stay in this Town/City"
                      value={formData.yearsInTown || ''}
                      onChange={(value) =>
                        handleInputChange('yearsInTown', value)
                      }
                      options={[
                        { value: 'ZERO_TO_ONE_YEAR', label: '0 to 1 year' },
                        { value: 'ONE_TO_THREE_YEARS', label: '1 to 3 years' },
                        { value: 'THREE_TO_FIVE_YEARS', label: '3 to 5 years' },
                        { value: 'MORE_THAN_FIVE_YEARS', label: 'More than 5 years' },
                      ]}
                    />
                    <Select
                      label="Migrated"
                      value={formData.migrated || ''}
                      onChange={(value) =>
                        handleInputChange('migrated', value)
                      }
                      options={[
                        { value: 'YES', label: 'Yes' },
                        { value: 'NO', label: 'No' },
                      ]}
                    />
                    <Select
                      label="Whether Migrated From"
                      value={formData.migratedFrom || ''}
                      onChange={(value) =>
                        handleInputChange('migratedFrom', value)
                      }
                      options={[
                        { value: 'RURAL_TO_URBAN', label: 'Rural Area to Urban Area' },
                        { value: 'URBAN_TO_URBAN', label: 'Urban Area to Urban Area' },
                      ]}
                    />
                    <Select
                      label="Migration Type"
                      value={formData.migrationType || ''}
                      onChange={(value) =>
                        handleInputChange('migrationType', value)
                      }
                      options={[
                        { value: 'SEASONAL', label: 'Seasonal' },
                        { value: 'PERMANENT', label: 'Permanent' },
                      ]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">
                        Reasons for Migration
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'UNEMPLOYMENT', label: 'Unemployment' },
                          { id: 'LOW_WAGE', label: 'Low wage' },
                          { id: 'DEBT', label: 'Debt' },
                          { id: 'DROUGHT', label: 'Drought' },
                          { id: 'CONFLICT', label: 'Conflict' },
                          { id: 'EDUCATION', label: 'Education' },
                          { id: 'MARRIAGE', label: 'Marriage' },
                          { id: 'OTHERS', label: 'Others' },
                        ].map((reason) => (
                          <Checkbox
                            key={reason.id}
                            label={reason.label}
                            checked={
                              (formData.migrationReasons || []).includes(reason.id)
                            }
                            onChange={() =>
                              handleCheckboxChange('migrationReasons', reason.id)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {section.id === 'income' && (
                  <>
                    <Input
                      label="Number of Earning Adult Members (Male)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.earningAdultMale || ''}
                      onChange={(e) =>
                        handleInputChange('earningAdultMale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Earning Adult Members (Female)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.earningAdultFemale || ''}
                      onChange={(e) =>
                        handleInputChange('earningAdultFemale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Earning Adult Members (Total)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.earningAdultTotal || ''}
                      onChange={(e) =>
                        handleInputChange('earningAdultTotal', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Earning Non-Adult Members (Male)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.earningNonAdultMale || ''}
                      onChange={(e) =>
                        handleInputChange('earningNonAdultMale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Earning Non-Adult Members (Female)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.earningNonAdultFemale || ''}
                      onChange={(e) =>
                        handleInputChange('earningNonAdultFemale', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Number of Earning Non-Adult Members (Total)"
                      type="number"
                      placeholder="Enter number"
                      value={formData.earningNonAdultTotal || ''}
                      onChange={(e) =>
                        handleInputChange('earningNonAdultTotal', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Average Monthly Income of Household (in Rs.)"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.monthlyIncome || ''}
                      onChange={(e) =>
                        handleInputChange('monthlyIncome', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Average Monthly Expenditure of Household (in Rs.)"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.monthlyExpenditure || ''}
                      onChange={(e) =>
                        handleInputChange('monthlyExpenditure', parseInt(e.target.value) || undefined)
                      }
                    />
                    <Input
                      label="Debt Outstanding as on Date of Survey (in Rs.)"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.debtOutstanding || ''}
                      onChange={(e) =>
                        handleInputChange('debtOutstanding', parseInt(e.target.value) || undefined)
                      }
                    />
                  </>
                )}

                {section.id === 'additional' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        placeholder="Any observations or remarks..."
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
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
        className="w-full"
      >
        Submit Household Survey
      </Button>
      </div>
    </SurveyorLayout>
  );
}

