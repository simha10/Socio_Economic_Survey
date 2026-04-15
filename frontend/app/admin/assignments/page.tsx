"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import ModernTable from "@/components/ModernTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import AssignmentForm from "@/components/AssignmentForm";
import AssignmentStatusModal from "@/components/AssignmentStatusModal";
import ConfirmEditOpenModal from "@/components/ConfirmEditOpenModal";
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);
  const [selectedAssignmentForStatus, setSelectedAssignmentForStatus] =
    useState<Assignment | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState("");

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

  const handleUpdateStatus = (assignment: Assignment) => {
    setSelectedAssignmentForStatus(assignment);
    setShowConfirmEditModal(true);
  };

  const confirmEditOpen = () => {
    setShowConfirmEditModal(false);
    setShowStatusModal(true);
  };

  const cancelEditOpen = () => {
    setShowConfirmEditModal(false);
    setSelectedAssignmentForStatus(null);
  };

  const handleStatusUpdateSuccess = () => {
    // Refresh assignments list
    apiService.getAllAssignments().then((res) => {
      if (res.success) {
        setAssignments((res.data as Assignment[]) || []);
        setStatusUpdateSuccess("Status updated successfully");
        setTimeout(() => setStatusUpdateSuccess(""), 3000);
      }
    });
  };

  const handleDeleteAssignment = (assignmentId: string) => {
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

          {/* Success Message for Status Update */}
          {statusUpdateSuccess && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
              {statusUpdateSuccess}
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
                        onClick={() => handleUpdateStatus(row)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Edit Status"
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

      {/* Confirm Edit Open Modal */}
      <ConfirmEditOpenModal
        isOpen={showConfirmEditModal}
        onClose={cancelEditOpen}
        onConfirm={confirmEditOpen}
        assignment={selectedAssignmentForStatus}
      />

      {/* Assignment Status Update Modal */}
      <AssignmentStatusModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedAssignmentForStatus(null);
        }}
        onSuccess={handleStatusUpdateSuccess}
        assignment={selectedAssignmentForStatus}
      />
    </SupervisorAdminLayout>
  );
}
