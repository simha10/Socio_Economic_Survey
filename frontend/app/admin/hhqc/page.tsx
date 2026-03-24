"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import Button from "@/components/Button";
import Card from "@/components/Card";
import InfiniteScrollSelect from "@/components/InfiniteScrollSelect";
import { HouseholdSurvey } from "@/types/householdSurvey";
// Icons for edit and delete
import { Edit3 as EditIcon, Trash2 as DeleteIcon } from "lucide-react";
import ConfirmationDialog from "@/components/DeleteConfirmationDialog";
import EditConfirmationDialog from "@/components/EditConfirmationDialog";

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

interface Assignment {
  _id: string;
  status: string;
  surveyor: {
    _id: string;
    name: string;
    username: string;
  };
  slum: Slum;
  householdSurveyProgress?: {
    completed: number;
    total: number;
  };
}

export default function HHQCPage() {
  const router = useRouter();
  const isFirstMount = useRef(true);

  const handleBack = () => {
    router.push("/admin/dashboard");
  };
  const [loading, setLoading] = useState(true);
  const [slums, setSlums] = useState<Slum[]>([]);
  const [selectedSlum, setSelectedSlum] = useState<string>("");
  const [householdSurveys, setHouseholdSurveys] = useState<HouseholdSurvey[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingSurveyId, setDeletingSurveyId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<HouseholdSurvey | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Load slums and assignments when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load slums
        const slumsResponse = await apiService.get("/admin/slums");
        // Sort slums alphabetically by name
        const sortedSlums = [...(slumsResponse.data as Slum[] || [])].sort((a, b) => {
          const nameA = a.slumName || '';
          const nameB = b.slumName || '';
          return nameA.localeCompare(nameB);
        });
        setSlums(sortedSlums);

        // Load all assignments for admin to find the correct assignment later
        const assignmentsResponse = await apiService.getAllAssignments();
        if (assignmentsResponse.success) {
          setAssignments(assignmentsResponse.data as Assignment[] || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Restore selected slum from localStorage after slums are loaded
  useEffect(() => {
    // Only restore on first mount if no slum is currently selected AND slums have been loaded
    if (isFirstMount.current && !selectedSlum && slums.length > 0) {
      const savedSlumId = localStorage.getItem('hhqc-selected-slum');
      console.log('Restoring slum selection on first mount:', savedSlumId, 'Current slums:', slums.length);
      if (savedSlumId) {
        // Verify the saved slum ID exists in the loaded slums
        const slumExists = slums.some(slum => slum._id === savedSlumId);
        if (slumExists) {
          console.log('Restoring slum:', savedSlumId);
          setSelectedSlum(savedSlumId);
          // Only clear the localStorage if we successfully restored the slum
          localStorage.removeItem('hhqc-selected-slum');
        } else {
          console.log('Saved slum ID not found in loaded slums, clearing selection');
          localStorage.removeItem('hhqc-selected-slum');
        }
      }
      // Mark that the first mount has been handled
      isFirstMount.current = false;
    }
  }, [slums, selectedSlum]); // Depend on slums and selectedSlum

  // Load household surveys when slum is selected
  useEffect(() => {
    const fetchHouseholdSurveys = async () => {
      if (!selectedSlum) {
        setHouseholdSurveys([]);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getHouseholdSurveysBySlum(selectedSlum);
        setHouseholdSurveys(Array.isArray(response.data) ? response.data as HouseholdSurvey[] : []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching household surveys:", err);
        setError("Failed to load household surveys");
        setLoading(false);
      }
    };

    fetchHouseholdSurveys();
  }, [selectedSlum]);

  const handleEditRecord = (survey: HouseholdSurvey) => {
    setEditingSurvey(survey);
    setShowEditConfirm(true);
  };

  const handleDeleteClick = (surveyId: string) => {
    // This function is only called for DRAFT surveys now
    // Non-DRAFT surveys are handled in the button onClick
    setDeletingSurveyId(surveyId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingSurveyId) return;

    setIsDeleting(true);
    try {
      const response = await apiService.deleteHouseholdSurvey(deletingSurveyId);
      
      if (response.success) {
        // Remove the deleted survey from the local state
        setHouseholdSurveys(prev => prev.filter(survey => survey._id !== deletingSurveyId));
        // Show success message could be added here if needed
      } else {
        setError(response.error || 'Failed to delete household survey');
      }
    } catch (err) {
      console.error('Error deleting household survey:', err);
      setError('Failed to delete household survey');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeletingSurveyId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingSurveyId(null);
  };

  const confirmEditSurvey = () => {
    if (editingSurvey && selectedSlum) {
      // Store the selected slum in localStorage before navigating
      console.log('Saving selected slum to localStorage:', selectedSlum);
      localStorage.setItem('hhqc-selected-slum', selectedSlum);
      // Navigate to admin HHQC edit page
      router.push(`/admin/hhqc/${editingSurvey._id}`);
    }
    setShowEditConfirm(false);
    setEditingSurvey(null);
  };

  const cancelEditSurvey = () => {
    setShowEditConfirm(false);
    setEditingSurvey(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="secondary" onClick={handleBack}>
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-white">HHQC - Household Quality Control</h1>
        </div>
      </div>

      {error && (
        <Card className="bg-red-500/20 border-red-500 text-red-200">
          {error}
        </Card>
      )}

      <Card className="p-6">
        <div className="mb-6">
          <InfiniteScrollSelect
            label="Select Slum"
            value={selectedSlum}
            onChange={(value) => setSelectedSlum(value)}
            options={slums.map((slum) => ({
              value: slum._id,
              label: `${slum.slumName} (${slum.slumId})`,
            }))}
            placeholder="Select a slum..."
          />
        </div>

        {selectedSlum && (
          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : householdSurveys.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">
                  No records available. Survey may not have been started yet for this slum.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Door No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Head of Family
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Family Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Submission Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/50 divide-y divide-slate-700">
                    {householdSurveys.map((survey) => (
                      <tr key={survey._id} className="hover:bg-slate-800/70">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {survey.houseDoorNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {survey.headName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {survey.familyMembersTotal || 0} (M: {survey.familyMembersMale || 0}, F: {survey.familyMembersFemale || 0})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {survey.submittedAt ? new Date(survey.submittedAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            survey.surveyStatus === 'SUBMITTED' 
                              ? 'bg-yellow-500/20 text-yellow-300' 
                              : survey.surveyStatus === 'COMPLETED'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {survey.surveyStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center space-x-2">
                          <button
                            onClick={() => handleEditRecord(survey)}
                            disabled={!survey._id}
                            className={`p-2 rounded-md ${survey._id ? 'text-blue-400 hover:bg-blue-500/20 hover:text-blue-300' : 'text-gray-500 cursor-not-allowed'}`}
                            title="Edit Record"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => {
                              // Non-DRAFT surveys are disabled, so this won't be called for them
                              handleDeleteClick(survey._id!);
                            }}
                            disabled={survey.surveyStatus !== 'DRAFT'}
                            className={`p-2 rounded-md ${survey.surveyStatus === 'DRAFT' 
                              ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer' 
                              : 'text-gray-500 cursor-not-allowed opacity-50'}`}
                            title={survey.surveyStatus === 'DRAFT' ? "Delete Record" : "Cannot delete Submitted surveys"}
                          >
                            <DeleteIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Delete Household Survey"
        message="Are you sure you want to delete this household survey record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Edit Confirmation Dialog */}
      <EditConfirmationDialog
        isOpen={showEditConfirm}
        surveyType="household"
        entityIdentifier={editingSurvey ? 
          `${editingSurvey.parcelId || 'N/A'}-${editingSurvey.propertyNo || 'N/A'}` : 
          'Unknown Household'}
        onConfirm={confirmEditSurvey}
        onCancel={cancelEditSurvey}
      />
    </div>
  );
}