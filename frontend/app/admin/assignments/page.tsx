"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import ModernTable from "@/components/ModernTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import AssignmentForm from "@/components/AssignmentForm";
import { useToast } from "@/components/Toast";
import { Plus } from "lucide-react";

interface Assignment {
  _id: string;
  surveyor: {
    _id: string;
    username: string;
    name: string;
  } | null;
  slum: {
    _id: string;
    slumName: string;
    slumId: number;
    ward?:
      | {
          _id: string;
          number: string;
          name: string;
          zone: string;
        }
      | string;
  } | null;
  status: string;
  slumSurveyStatus?: string;
  householdSurveyProgress?: {
    completed: number;
    total: number;
  };
  createdAt: string;
}

interface Surveyor {
  _id: string;
  username: string;
  name: string;
}

interface Slum {
  _id: string;
  slumName: string;
  slumId: number;
}

interface User {
  _id: string;
  username: string;
  name: string;
  role: "ADMIN" | "SUPERVISOR" | "SURVEYOR";
  isActive: boolean;
  createdAt: string;
}

interface AssignmentFormData {
  status: "PENDING" | "IN PROGRESS" | "COMPLETED";
  surveyor: string;
  slum: string;
  surveyor: string; // ID of the surveyor
  slum: string; // ID of the slum
}

interface MultiAssignmentFormData {
  slum: string; // ID of the slum
  surveyors: string[]; // Array of surveyor IDs
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(
    null,
  );
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          router.push("/login");
          return;
        }

        const userData = JSON.parse(userStr);
        if (userData?.role !== "ADMIN") {
          router.push(`/${userData?.role?.toLowerCase()}/dashboard`);
          return;
        }

        setUser(userData);

        const assignmentsRes = await apiService.getAllAssignments();
        if (assignmentsRes.success) {
          setAssignments((assignmentsRes.data as Assignment[]) || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please refresh the page.");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCreateMultipleAssignments = async () => {
    if (!multiAssignment.slum || multiAssignment.surveyors.length === 0) {
      setError("Please select a slum and at least one surveyor");
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      // Create assignments for each selected surveyor
      for (const surveyorId of multiAssignment.surveyors) {
        const response = await apiService.assignSlumToSurveyor(
          surveyorId,
          multiAssignment.slum,
        );

        if (!response.success) {
          console.error(
            `Failed to assign slum to surveyor ${surveyorId}:`,
            response.error,
          );
        }
      }

      // Refresh assignments list
      const assignmentsRes = await apiService.getAllAssignments();
      if (assignmentsRes.success) {
        setAssignments((assignmentsRes.data as Assignment[]) || []);
      }

      // Reset form
      setMultiAssignment({
        slum: "",
        surveyors: [],
      });
      showToast("Multiple assignments created successfully", "success", 3000);
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Error creating multiple assignments";
      console.error("Error creating multiple assignments:", error);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSurveyorSelection = (surveyorId: string) => {
    setMultiAssignment((prev) => {
      if (prev.surveyors.includes(surveyorId)) {
        return {
          ...prev,
          surveyors: prev.surveyors.filter((id) => id !== surveyorId),
        };
      } else {
        return {
          ...prev,
          surveyors: [...prev.surveyors, surveyorId],
        };
      }
    });
  };

  // Function to get already assigned surveyors for a slum
  const getAssignedSurveyorsForSlum = (slumId: string): string[] => {
    return assignments
      .filter((assignment) => assignment.slum?._id === slumId)
      .map((assignment) => assignment.surveyor?._id)
      .filter((id): id is string => id !== undefined);
  };

  // Filter available surveyors based on selected slum
  const getFilteredSurveyors = (): Surveyor[] => {
    if (!multiAssignment.slum) return availableUsers;

    const assignedSurveyorIds = getAssignedSurveyorsForSlum(
      multiAssignment.slum,
    );
    return availableUsers.filter(
      (surveyor) => !assignedSurveyorIds.includes(surveyor._id),
    );
  };

  // Show all slums in the dropdown (multiple assignments allowed)
  const availableSlums = [...slums].sort((a, b) => {
    const nameA = a.slumName || "";
    const nameB = b.slumName || "";
    return nameA.localeCompare(nameB);
  });

  const handleEditAssignment = (assignment: Assignment) => {
    setAssignmentToEdit(assignment);
    setShowEditConfirm(true);
  };

  const confirmEditAssignment = () => {
    if (assignmentToEdit) {
      setEditingAssignment(assignmentToEdit);
      setEditFormData({
        status: assignmentToEdit.status as
          | "PENDING"
          | "IN PROGRESS"
          | "COMPLETED",
        surveyor: assignmentToEdit.surveyor?._id || "",
        slum: assignmentToEdit.slum?._id || "", // Keep the slum constant
      });
      setShowEditConfirm(false);
      setAssignmentToEdit(null);
    }
  };

  const cancelEditAssignment = () => {
    setShowEditConfirm(false);
    setAssignmentToEdit(null);
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    // Show confirmation dialog
    setShowUpdateConfirm(true);
  };

  const confirmUpdateAssignment = async () => {
    if (!editingAssignment) return;

    setSubmitting(true);
    setShowUpdateConfirm(false);

    try {
      // Prepare update data - only include fields that can be changed (excluding slum)
      const updateData: Partial<AssignmentFormData> = {
        status: editFormData.status,
        surveyor: editFormData.surveyor,
        // Note: slum is intentionally excluded as it should remain constant
      };

      const response = await apiService.updateAssignment(
        editingAssignment._id,
        updateData,
      );
      if (response.success) {
        showToast("Assignment updated successfully", "success", 3000);
        setEditingAssignment(null);
        // Refresh assignments to show updated data
        const assignmentsRes = await apiService.getAllAssignments();
        if (assignmentsRes.success) {
          setAssignments((assignmentsRes.data as Assignment[]) || []);
        }
      } else {
        showToast(
          response.error || "Failed to update assignment",
          "error",
          3000,
        );
      }
    } catch (error: unknown) {
      showToast(
        error instanceof Error ? error.message : "Failed to update assignment",
        "error",
        3000,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancelUpdateAssignment = () => {
    setShowUpdateConfirm(false);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    setAssignmentToDelete(assignmentId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;

    setIsDeletingAssignment(true);
    try {
      const response = await apiService.deleteAssignment(assignmentToDelete);
      if (response.success) {
        const assignmentsRes = await apiService.getAllAssignments();
        if (assignmentsRes.success) {
          setAssignments((assignmentsRes.data as Assignment[]) || []);
        }
        setSuccessMessage("Assignment deleted successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.error || "Failed to delete assignment");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to delete assignment",
      );
    } finally {
      setIsDeletingAssignment(false);
      setShowDeleteConfirm(false);
      setAssignmentToDelete(null);
    }
  };

  const cancelDeleteAssignment = () => {
    setShowDeleteConfirm(false);
    setAssignmentToDelete(null);
  };

  // Modal-based assignment handlers
  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    setIsFormOpen(true);
  };

  const handleEditAssignmentModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAssignment(null);
  };

  const handleFormSuccess = () => {
    apiService.getAllAssignments().then((res) => {
      if (res.success) {
        setAssignments((res.data as Assignment[]) || []);
        setSuccessMessage(
          selectedAssignment
            ? "Assignment updated successfully"
            : "Assignment created successfully",
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    });
  };

  if (loading) {
    return (
      <SupervisorAdminLayout
        role="ADMIN"
        username={user?.name || user?.username}
      >
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </SupervisorAdminLayout>
    );
  }

  if (error) {
    return (
      <SupervisorAdminLayout
        role="ADMIN"
        username={user?.name || user?.username}
      >
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6">
          <h3 className="text-red-300 font-bold mb-2">Error</h3>
          <p className="text-red-400">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 cursor-pointer"
            variant="secondary"
          >
            Retry
          </Button>
        </div>
      </SupervisorAdminLayout>
    );
  }

  return (
    <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
      <div className="relative">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">
              Manage Assignments
            </h1>
            <Button
                onClick={handleCreateAssignment}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Assignment
            </Button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
              {error}
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          )}

          {/* Create Multiple Assignment Form */}
          <Card>
            <h2 className="text-lg font-bold text-primary mb-4">
              Create Assignments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfiniteScrollSelect
                label="Slum"
                value={multiAssignment.slum}
                onChange={(value) =>
                  setMultiAssignment({
                    ...multiAssignment,
                    slum: value,
                    surveyors: [],
                  })
                } // Reset surveyors when slum changes
                options={availableSlums.map((s) => ({
                  value: s._id,
                  label: `${s.slumName} (${s.slumId})`,
                }))}
                placeholder="Select a slum..."
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Surveyors
                </label>
                <div className="relative">
                  <div
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer min-h-10.5 flex items-center"
                    onClick={() =>
                      setShowSurveyorDropdown(!showSurveyorDropdown)
                    }
                  >
                    {multiAssignment.surveyors.length > 0 ? (
                      <span className="text-slate-300">
                        {multiAssignment.surveyors.length} surveyor
                        {multiAssignment.surveyors.length !== 1 ? "s" : ""}{" "}
                        selected
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Select surveyors...
                      </span>
                    )}
                    <svg
                      className={`ml-auto w-4 h-4 text-slate-400 transition-transform ${showSurveyorDropdown ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {showSurveyorDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {getFilteredSurveyors().length > 0 ? (
                        getFilteredSurveyors().map((surveyor) => (
                          <div
                            key={surveyor._id}
                            className="flex items-center p-3 hover:bg-slate-700 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSurveyorSelection(surveyor._id);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={multiAssignment.surveyors.includes(
                                surveyor._id,
                              )}
                              onChange={() =>
                                toggleSurveyorSelection(surveyor._id)
                              }
                              className="mr-3 h-4 w-4 text-cyan-600 rounded focus:ring-cyan-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label className="text-slate-300 cursor-pointer grow">
                              {surveyor.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-slate-400 italic">
                          All surveyors are already assigned to this slum
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="primary"
                className="cursor-pointer"
                onClick={handleCreateMultipleAssignments}
                disabled={
                  !multiAssignment.slum ||
                  multiAssignment.surveyors.length === 0
                }
              >
                Assign Selected Surveyor(s)
              </Button>
            </div>
          </Card>

          {/* Edit Assignment Form */}
          {editingAssignment && (
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">
                Edit Assignment: {editingAssignment.surveyor?.name || "N/A"} -{" "}
                {editingAssignment.slum?.slumName || "N/A"}
              </h2>
              <form onSubmit={handleUpdateAssignment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Surveyor
                    </label>
                    <select
                      value={editFormData.surveyor}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          surveyor: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    >
                      <option value="">Select a surveyor</option>
                      {availableUsers.map((usr) => (
                        <option key={usr._id} value={usr._id}>
                          {usr.name} ({usr.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Slum (Constant)
                    </label>
                    <input
                      type="text"
                      value={`${editingAssignment?.slum?.slumName || "N/A"}`}
                      readOnly
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value as
                            | "PENDING"
                            | "IN PROGRESS"
                            | "COMPLETED",
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Internal card messages removed in favor of global messages */}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setShowUpdateConfirm(true)}
                    disabled={submitting}
                    className="cursor-pointer"
                  >
                    {submitting ? "Updating..." : "Update Assignment"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelEdit}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Assignments List */}
          <div>
            <ModernTable
              data={assignments}
              keyField="_id"
              searchPlaceholder="Search assignments..."
              columns={[
                {
                  header: "Surveyor",
                  accessorKey: (row) => row.surveyor?.name || "Unknown",
                  sortable: true,
                  sortAccessor: (row) => row.surveyor?.name || "Unknown",
                  className: "font-medium text-white",
                },
                {
                  header: "Slum",
                  accessorKey: (row) =>
                    `${row.slum?.slumName || "Unknown"} (${row.slum?.slumId || "Unknown"})` as string,
                  sortable: true,
                  sortAccessor: (row) =>
                    `${row.slum?.slumName || "Unknown"} (${row.slum?.slumId || "Unknown"})`,
                },
                {
                  header: "Zone",
                  accessorKey: (row) => {
                    if (row.slum?.ward) {
                      if (typeof row.slum.ward === "object") {
                        return `${row.slum.ward.zone}`;
                      } else {
                        return "Unknown Zone";
                      }
                    }
                    return "Unknown Zone";
                  },
                  sortable: true,
                  sortAccessor: (row) => {
                    if (row.slum?.ward && typeof row.slum.ward === "object") {
                      return row.slum.ward.zone;
                    }
                    return "Unknown Zone";
                  },
                },
                {
                  header: "Ward",
                  accessorKey: (row) => {
                    if (row.slum?.ward) {
                      if (typeof row.slum.ward === "object") {
                        return `Ward ${row.slum.ward.number} (${row.slum.ward.name})`;
                      } else {
                        return "Unknown Ward";
                      }
                    }
                    return "Unknown Ward";
                  },
                  sortable: true,
                  sortAccessor: (row) => {
                    if (row.slum?.ward && typeof row.slum.ward === "object") {
                      return `Ward ${row.slum.ward.number} (${row.slum.ward.name})`;
                    }
                    return "Unknown Ward";
                  },
                },
                {
                  header: "Slum Survey\nStatus",
                  accessorKey: (row) => (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        row.slumSurveyStatus === "SUBMITTED"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : row.slumSurveyStatus === "IN PROGRESS"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {row.slumSurveyStatus || "NOT STARTED"}
                    </span>
                  ),
                  sortable: true,
                  sortAccessor: (row) => row.slumSurveyStatus || "NOT STARTED",
                },
                {
                  header: "Total\nHouseholds",
                  accessorKey: (row) => row.householdSurveyProgress?.total || 0,
                  sortable: true,
                  sortAccessor: (row) =>
                    row.householdSurveyProgress?.total || 0,
                  className: "text-center font-medium tabular-nums",
                },
                {
                  header: "Completed\nHouseholds",
                  accessorKey: (row) =>
                    row.householdSurveyProgress?.completed || 0,
                  sortable: true,
                  sortAccessor: (row) =>
                    row.householdSurveyProgress?.completed || 0,
                  className: "text-center font-medium tabular-nums",
                },
                {
                  header: "Assigned",
                  accessorKey: (row) =>
                    new Date(row.createdAt).toLocaleDateString(),
                  sortable: true,
                  sortAccessor: (row) => new Date(row.createdAt).getTime(),
                },
                {
                  header: "Actions",
                  accessorKey: (row) => (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAssignmentModal(row)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(row._id)}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Assignment Form Modal */}
      <AssignmentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        assignment={selectedAssignment}
      />
    </SupervisorAdminLayout>
  );
}
