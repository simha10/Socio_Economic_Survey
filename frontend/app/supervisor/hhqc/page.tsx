"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import apiService from "@/services/api";
import InfiniteScrollSelect from "@/components/InfiniteScrollSelect";
import { HouseholdSurvey } from "@/types/householdSurvey";
import { Edit3 as EditIcon, Trash2 as DeleteIcon } from "lucide-react";
import ConfirmationDialog from "@/components/DeleteConfirmationDialog";
import EditConfirmationDialog from "@/components/EditConfirmationDialog";
import { useToast } from "@/components/Toast";
import ModernTable from "@/components/ModernTable";
import LoadingSpinner from "@/components/LoadingSpinner";

interface User {
  _id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
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
  ward:
    | {
        _id: string;
        number: string;
        name: string;
        zone: string;
      }
    | string;
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
  const { showToast } = useToast();
  const isFirstMount = useRef(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [slums, setSlums] = useState<Slum[]>([]);
  const [selectedSlum, setSelectedSlum] = useState<string>("");
  const [householdSurveys, setHouseholdSurveys] = useState<HouseholdSurvey[]>(
    [],
  );
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingSurveyId, setDeletingSurveyId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<HouseholdSurvey | null>(
    null,
  );
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Load slums and assignments when component mounts
  useEffect(() => {
    // Verify user is supervisor
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData?.role !== "SUPERVISOR") {
      router.push(`/${userData?.role?.toLowerCase()}/dashboard`);
      return;
    }

    setUser(userData);

    const fetchData = async () => {
      try {
        // Load slums
        const slumsResponse = await apiService.get("/admin/slums");
        // Sort slums alphabetically by name
        const sortedSlums = [...((slumsResponse.data as Slum[]) || [])].sort(
          (a, b) => {
            const nameA = a.slumName || "";
            const nameB = b.slumName || "";
            return nameA.localeCompare(nameB);
          },
        );
        setSlums(sortedSlums);

        // Load all assignments for supervisor to find the correct assignment later
        const assignmentsResponse = await apiService.getAllAssignments();
        if (assignmentsResponse.success) {
          setAssignments((assignmentsResponse.data as Assignment[]) || []);
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
      const savedSlumId = localStorage.getItem("hhqc-selected-slum");
      console.log(
        "Restoring slum selection on first mount:",
        savedSlumId,
        "Current slums:",
        slums.length,
      );
      if (savedSlumId) {
        // Verify the saved slum ID exists in the loaded slums
        const slumExists = slums.some((slum) => slum._id === savedSlumId);
        if (slumExists) {
          console.log("Restoring slum:", savedSlumId);
          setSelectedSlum(savedSlumId);
          // Only clear the localStorage if we successfully restored the slum
          localStorage.removeItem("hhqc-selected-slum");
        } else {
          console.log(
            "Saved slum ID not found in loaded slums, clearing selection",
          );
          localStorage.removeItem("hhqc-selected-slum");
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
        const response =
          await apiService.getHouseholdSurveysBySlum(selectedSlum);
        setHouseholdSurveys(
          Array.isArray(response.data)
            ? (response.data as HouseholdSurvey[])
            : [],
        );
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
        setHouseholdSurveys((prev) =>
          prev.filter((survey) => survey._id !== deletingSurveyId),
        );
        showToast("Household survey deleted successfully", "success", 3000);
      } else {
        showToast(
          response.error || "Failed to delete household survey",
          "error",
          3000,
        );
      }
    } catch (err) {
      console.error("Error deleting household survey:", err);
      showToast("Failed to delete household survey", "error", 3000);
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
      console.log("Saving selected slum to localStorage:", selectedSlum);
      localStorage.setItem("hhqc-selected-slum", selectedSlum);
      // Navigate to supervisor HHQC edit page
      router.push(`/supervisor/hhqc/${editingSurvey._id}`);
    }
    setShowEditConfirm(false);
    setEditingSurvey(null);
  };

  const cancelEditSurvey = () => {
    setShowEditConfirm(false);
    setEditingSurvey(null);
  };

  if (loading && !selectedSlum) {
    return (
      <SupervisorAdminLayout
        role="SUPERVISOR"
        username={user?.name || user?.username}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading HHQC data..." />
        </div>
      </SupervisorAdminLayout>
    );
  }

  return (
    <SupervisorAdminLayout
      role="SUPERVISOR"
      username={user?.name || user?.username}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              HHQC - Household Quality Control
            </h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
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
              {householdSurveys.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">
                    No records available. Survey may not have been started yet
                    for this slum.
                  </p>
                </div>
              ) : (
                <ModernTable
                  data={householdSurveys}
                  keyField="_id"
                  searchPlaceholder="Search by door no, head name..."
                  isLoading={loading}
                  columns={[
                    {
                      header: "Door No",
                      accessorKey: "houseDoorNo",
                      sortable: true,
                      className: "font-medium text-white",
                    },
                    {
                      header: "Head of\nFamily",
                      accessorKey: "headName",
                      sortable: true,
                    },
                    {
                      header: "Family\nMembers",
                      accessorKey: (row) => (
                        <span>
                          {row.familyMembersTotal || 0} (M:{" "}
                          {row.familyMembersMale || 0}, F:{" "}
                          {row.familyMembersFemale || 0})
                        </span>
                      ),
                      sortable: true,
                      sortAccessor: "familyMembersTotal",
                    },
                    {
                      header: "Submission\nDate",
                      accessorKey: (row) =>
                        row.submittedAt
                          ? new Date(row.submittedAt).toLocaleDateString()
                          : "N/A",
                      sortable: true,
                      sortAccessor: "submittedAt",
                    },
                    {
                      header: "Status",
                      accessorKey: (row) => (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            row.surveyStatus === "SUBMITTED"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : row.surveyStatus === "COMPLETED"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {row.surveyStatus}
                        </span>
                      ),
                      sortable: true,
                      sortAccessor: "surveyStatus",
                    },
                    {
                      header: "Actions",
                      accessorKey: (row: HouseholdSurvey) => (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditRecord(row)}
                            disabled={!row._id}
                            className={`p-2 rounded-md ${row._id ? "text-blue-400 hover:bg-blue-500/20 hover:text-blue-300" : "text-gray-500 cursor-not-allowed"}`}
                            title="Edit Record"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteClick(row._id!);
                            }}
                            disabled={row.surveyStatus !== "DRAFT"}
                            className={`p-2 rounded-md ${
                              row.surveyStatus === "DRAFT"
                                ? "text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                                : "text-gray-500 cursor-not-allowed opacity-50"
                            }`}
                            title={
                              row.surveyStatus === "DRAFT"
                                ? "Delete Record"
                                : "Cannot delete Submitted surveys"
                            }
                          >
                            <DeleteIcon size={16} />
                          </button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          )}
        </div>
      </div>

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
        entityIdentifier={
          editingSurvey
            ? `${editingSurvey.parcelId || "N/A"}-${editingSurvey.propertyNo || "N/A"}`
            : "Unknown Household"
        }
        onConfirm={confirmEditSurvey}
        onCancel={cancelEditSurvey}
      />
    </SupervisorAdminLayout>
  );
}
