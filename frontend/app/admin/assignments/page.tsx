"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import ModernTable from "@/components/ModernTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import Card from "@/components/Card";
import Button from "@/components/Button";
import InfiniteScrollSelect from "@/components/InfiniteScrollSelect";

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
    ward?: {
      _id: string;
      number: string;
      name: string;
      zone: string;
    } | string;
  } | null;
  status: string;
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
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  surveyor: string;  // ID of the surveyor
  slum: string;      // ID of the slum
}

interface MultiAssignmentFormData {
  slum: string;      // ID of the slum
  surveyors: string[]; // Array of surveyor IDs
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [slums, setSlums] = useState<Slum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [multiAssignment, setMultiAssignment] = useState<MultiAssignmentFormData>({
    slum: "",
    surveyors: [],
  });
  const [showSurveyorDropdown, setShowSurveyorDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editFormData, setEditFormData] = useState<AssignmentFormData>({
    status: 'PENDING',
    surveyor: '',
    slum: '',
  });
  const [availableUsers, setAvailableUsers] = useState<Surveyor[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user from localStorage
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

        // Load all data using the same API calls as Supervisor Panel
        const [surveyorsRes, slumsRes, assignmentsRes] = await Promise.all([
          apiService.getUsers("SURVEYOR"),
          apiService.getAllSlums(1, 10, undefined, true), // Load all slums
          apiService.getAllAssignments(),
        ]);

        if (assignmentsRes.success) {
          setAssignments(assignmentsRes.data as Assignment[] || []);
        }
        if (surveyorsRes.success) {
          setAvailableUsers(surveyorsRes.data as Surveyor[] || []);
        }
        if (slumsRes.success) {
          const sortedSlums = [...(slumsRes.data as Slum[] || [])].sort((a, b) => {
            const nameA = a.slumName || '';
            const nameB = b.slumName || '';
            return nameA.localeCompare(nameB);
          });
          setSlums(sortedSlums);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError("Failed to load data. Please refresh the page.");
        router.push('/login');
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
          console.error(`Failed to assign slum to surveyor ${surveyorId}:`, response.error);
        }
      }

      // Refresh assignments list
      const assignmentsRes = await apiService.getAllAssignments();
      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.data as Assignment[] || []);
      }
      
      // Reset form
      setMultiAssignment({
        slum: "",
        surveyors: [],
      });
      setMessage("Multiple assignments created successfully");
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Error creating multiple assignments";
      console.error("Error creating multiple assignments:", error);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSurveyorSelection = (surveyorId: string) => {
    setMultiAssignment(prev => {
      if (prev.surveyors.includes(surveyorId)) {
        return {
          ...prev,
          surveyors: prev.surveyors.filter(id => id !== surveyorId)
        };
      } else {
        return {
          ...prev,
          surveyors: [...prev.surveyors, surveyorId]
        };
      }
    });
  };

  // Function to get already assigned surveyors for a slum
  const getAssignedSurveyorsForSlum = (slumId: string): string[] => {
    return assignments
      .filter(assignment => assignment.slum?._id === slumId)
      .map(assignment => assignment.surveyor?._id)
      .filter((id): id is string => id !== undefined);
  };

  // Filter available surveyors based on selected slum
  const getFilteredSurveyors = (): Surveyor[] => {
    if (!multiAssignment.slum) return availableUsers;
    
    const assignedSurveyorIds = getAssignedSurveyorsForSlum(multiAssignment.slum);
    return availableUsers.filter(surveyor => !assignedSurveyorIds.includes(surveyor._id));
  };

  // Show all slums in the dropdown (multiple assignments allowed)
  const availableSlums = [...slums].sort((a, b) => {
    const nameA = a.slumName || '';
    const nameB = b.slumName || '';
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
        status: assignmentToEdit.status as "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED",
        surveyor: assignmentToEdit.surveyor?._id || '',
        slum: assignmentToEdit.slum?._id || '', // Keep the slum constant
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
    setMessage("");
    setShowUpdateConfirm(false);

    try {
      // Prepare update data - only include fields that can be changed (excluding slum)
      const updateData: Partial<AssignmentFormData> = {
        status: editFormData.status,
        surveyor: editFormData.surveyor,
        // Note: slum is intentionally excluded as it should remain constant
      };

      const response = await apiService.updateAssignment(editingAssignment._id, updateData);
      if (response.success) {
        setMessage("Assignment updated successfully");
        setEditingAssignment(null);
        // Refresh assignments to show updated data
        const assignmentsRes = await apiService.getAllAssignments();
        if (assignmentsRes.success) {
          setAssignments(assignmentsRes.data as Assignment[] || []);
        }
      } else {
        setMessage(`Error: ${response.error || "Failed to update assignment"}`);
      }
    } catch (error: unknown) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Failed to update assignment"}`);
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

    try {
      console.log('Confirming delete for assignment ID:', assignmentToDelete);
      const response = await apiService.deleteAssignment(assignmentToDelete);
      if (response.success) {
        setMessage("Assignment deleted successfully");
        setError(null);
        // Refresh assignments to show updated data
        const assignmentsRes = await apiService.getAllAssignments();
        if (assignmentsRes.success) {
          setAssignments(assignmentsRes.data as Assignment[] || []);
        }
      } else {
        const errorMsg = response.error || "Failed to delete assignment";
        setError(`Error: ${errorMsg}`);
        setMessage("");
      }
    } catch (error: unknown) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Failed to delete assignment"}`);
    } finally {
      setShowDeleteConfirm(false);
      setAssignmentToDelete(null);
    }
  };

  const cancelDeleteAssignment = () => {
    setShowDeleteConfirm(false);
    setAssignmentToDelete(null);
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setMessage("");
  };

  if (loading) {
    return (
      <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </SupervisorAdminLayout>
    );
  }

  if (error) {
    return (
      <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
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
        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-slate-300 mb-6">Are you sure you want to delete this assignment? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDeleteAssignment}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAssignment}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Confirmation Dialog */}
        {showUpdateConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Confirm Update</h3>
              <p className="text-slate-300 mb-6">Are you sure you want to update this assignment? Please review the changes before proceeding.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelUpdateAssignment}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdateAssignment}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Confirmation Dialog */}
        {showEditConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Confirm Edit</h3>
              <p className="text-slate-300 mb-6">Are you sure you want to edit this assignment?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelEditAssignment}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEditAssignment}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">
              Manage Assignments
            </h1>
          </div>

          {/* Status Messages */}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{message}</span>
              <button
                onClick={() => setMessage("")}
                className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError(null)}
                className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              >
                <span className="text-2xl leading-none">&times;</span>
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
                onChange={(value) => setMultiAssignment({ ...multiAssignment, slum: value, surveyors: [] })} // Reset surveyors when slum changes
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
                    onClick={() => setShowSurveyorDropdown(!showSurveyorDropdown)}
                  >
                    {multiAssignment.surveyors.length > 0 ? (
                      <span className="text-slate-300">
                        {multiAssignment.surveyors.length} surveyor{multiAssignment.surveyors.length !== 1 ? 's' : ''} selected
                      </span>
                    ) : (
                      <span className="text-slate-400">Select surveyors...</span>
                    )}
                    <svg 
                      className={`ml-auto w-4 h-4 text-slate-400 transition-transform ${showSurveyorDropdown ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                              checked={multiAssignment.surveyors.includes(surveyor._id)}
                              onChange={() => toggleSurveyorSelection(surveyor._id)}
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
                disabled={!multiAssignment.slum || multiAssignment.surveyors.length === 0}
              >
                Assign Selected Surveyor(s)
              </Button>
            </div>
          </Card>

          {/* Edit Assignment Form */}
          {editingAssignment && (
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">
                Edit Assignment: {editingAssignment.surveyor?.name || 'N/A'} - {editingAssignment.slum?.slumName || 'N/A'}
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
                        setEditFormData({ ...editFormData, surveyor: e.target.value })
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
                      value={`${editingAssignment?.slum?.slumName || 'N/A'}`}
                      readOnly
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, status: e.target.value as "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Internal card messages removed in favor of global messages */}

                <div className="flex gap-4">
                  <Button type="button" onClick={() => setShowUpdateConfirm(true)} disabled={submitting} className="cursor-pointer">
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
            <h2 className="text-xl font-bold text-white mb-4">
              Current Assignments
            </h2>
            <ModernTable
              data={assignments}
              keyField="_id"
              searchPlaceholder="Search assignments..."
              columns={[
                {
                  header: "Surveyor",
                  accessorKey: (row) => row.surveyor?.name || "Unknown",
                  sortable: true,
                  className: "font-medium text-white",
                },
                {
                  header: "Slum",
                  accessorKey: (row) => `${row.slum?.slumName || "Unknown"} (${row.slum?.slumId || "Unknown"})` as string,
                  sortable: true,
                },
                {
                  header: "Zone",
                  accessorKey: (row) => {
                    if (row.slum?.ward) {
                      if (typeof row.slum.ward === 'object') {
                        return `${row.slum.ward.zone}`;
                      } else {
                        return "Unknown Zone";
                      }
                    }
                    return "Unknown Zone";
                  },
                  sortable: true,
                },
                {
                  header: "Ward",
                  accessorKey: (row) => {
                    if (row.slum?.ward) {
                      if (typeof row.slum.ward === 'object') {
                        return `Ward ${row.slum.ward.number} (${row.slum.ward.name})`;
                      } else {
                        return "Unknown Ward";
                      }
                    }
                    return "Unknown Ward";
                  },
                  sortable: true,
                },
                {
                  header: "Status",
                  accessorKey: (row) => (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "COMPLETED"
                        ? "bg-green-500/20 text-green-400"
                        : row.status === "IN PROGRESS"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                        }`}
                    >
                      {row.status}
                    </span>
                  ),
                },
                {
                  header: "Assigned",
                  accessorKey: (row) => new Date(row.createdAt).toLocaleDateString(),
                  sortable: true,
                },
                {
                  header: "Actions",
                  accessorKey: (row) => (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAssignment(row);
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Delete clicked for row:', row._id);
                          handleDeleteAssignment(row._id);
                        }}
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
                }
              ]}
            />
          </div>
        </div>
      </div>
    </SupervisorAdminLayout>
  );
}
