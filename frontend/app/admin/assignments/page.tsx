"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import ModernTable from "@/components/ModernTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Select from "@/components/Select";

interface Assignment {
  _id: string;
  surveyor: {
    _id: string;
    username: string;
    name: string;
  };
  slum: {
    _id: string;
    name: string;
    location: string;
  };
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
  name: string;
  location: string;
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

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [slums, setSlums] = useState<Slum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    surveyorId: "",
    slumId: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editFormData, setEditFormData] = useState<AssignmentFormData>({
    status: 'PENDING',
    surveyor: '',
    slum: '',
  });
  const [availableUsers, setAvailableUsers] = useState<{ _id: string; name: string; username: string; }[]>([]);
  const [availableSlums, setAvailableSlums] = useState<{ _id: string; name: string; }[]>([]);

  const loadUsers = async () => {
    try {
      const response = await apiService.listUsers();
      if (response.success && response.data) {
        // Filter for surveyors only
        const surveyors = response.data.filter((usr: any) => {
          if (usr && typeof usr.role === 'string') {
            return usr.role === 'SURVEYOR';
          }
          return false;
        }).map((usr: any) => ({
          _id: usr._id,
          name: usr.name || '',
          username: usr.username || ''
        }));
        setAvailableUsers(surveyors);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadSlums = async () => {
    try {
      const response = await apiService.getAllSlums();
      if (response.success && response.data) {
        setAvailableSlums(response.data);
      }
    } catch (error) {
      console.error('Failed to load slums:', error);
    }
  };

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

        // Load all data
        await Promise.all([
          loadAssignments(),
          loadUsers(),  // Load users for dropdown
          loadSlums()   // Load slums for dropdown
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        router.push('/login');
      }
    };

    fetchData();
  }, [router]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/surveys/assignments");
      if (response.success) {
        setAssignments(response.data || []);
      } else {
        setError(response.error || "Failed to load assignments");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const loadSurveyors = async () => {
    try {
      const response = await apiService.get("/admin/users?role=SURVEYOR");
      if (response.success) {
        setSurveyors(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load surveyors:", err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await apiService.post("/surveys/assignments", {
        surveyor: newAssignment.surveyorId,
        slum: newAssignment.slumId,
      });

      if (response.success) {
        setMessage("Assignment created successfully");
        setNewAssignment({
          surveyorId: "",
          slumId: "",
        });
        setShowForm(false);
        loadAssignments();
      } else {
        setMessage(`Error: ${response.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${(err as Error).message || "Failed to create assignment"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditFormData({
      status: assignment.status as "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED",
      
      surveyor: assignment.surveyor._id,
      slum: assignment.slum._id,
    });
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    setSubmitting(true);
    setMessage("");

    try {
      // Prepare update data - only include fields that changed
      const updateData: Partial<AssignmentFormData> = {
        status: editFormData.status,
        // Include surveyor and slum IDs if they changed
        surveyor: editFormData.surveyor,
        slum: editFormData.slum,
      };

      const response = await apiService.updateAssignment(editingAssignment._id, updateData);
      if (response.success) {
        setMessage("Assignment updated successfully");
        setEditingAssignment(null);
        loadAssignments(); // Reload assignments to show updated data
      } else {
        setMessage(`Error: ${response.error || "Failed to update assignment"}`);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message || "Failed to update assignment"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      const response = await apiService.deleteAssignment(assignmentId);
      if (response.success) {
        setMessage("Assignment deleted successfully");
        loadAssignments();
      } else {
        setMessage(`Error: ${response.error || "Failed to delete assignment"}`);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message || "Failed to delete assignment"}`);
    }
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
            onClick={loadAssignments}
            className="mt-4"
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Assignments</h1>
            <p className="text-slate-400 mt-2">
              Manage surveyor assignments to slums
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create Assignment"}
          </Button>
        </div>

        {/* Create Assignment Form */}
        {showForm && (
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">
              Create New Assignment
            </h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Surveyor
                  </label>
                  <Select
                    options={surveyors.map(surveyor => ({
                      value: surveyor._id,
                      label: `${surveyor.name} (${surveyor.username})`
                    }))}
                    value={newAssignment.surveyorId}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        surveyorId: e.target.value,
                      })
                    }
                    className="w-full"
                    placeholder="Select a surveyor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slum
                  </label>
                  <Select
                    options={slums.map(slum => ({
                      value: slum._id,
                      label: `${slum.name} - ${slum.location}`
                    }))}
                    value={newAssignment.slumId}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        slumId: e.target.value,
                      })
                    }
                    className="w-full"
                    placeholder="Select a slum"
                    required
                  />
                </div>

              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    message.includes("Error")
                      ? "bg-red-900/30 text-red-300"
                      : "bg-green-900/30 text-green-300"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Assignment"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Edit Assignment Form */}
        {editingAssignment && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Edit Assignment: {editingAssignment.surveyor.name} - {editingAssignment.slum.name}
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
                  >
                    {availableUsers.map((usr) => (
                      <option key={usr._id} value={usr._id}>
                        {usr.name} ({usr.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slum
                  </label>
                  <select
                    value={editFormData.slum}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, slum: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {availableSlums.map((slum) => (
                      <option key={slum._id} value={slum._id}>
                        {slum.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {message && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    message.includes("Error")
                      ? "bg-red-900/30 text-red-300"
                      : "bg-green-900/30 text-green-300"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 text-white py-2 px-6 rounded-lg font-medium transition-all"
                >
                  {submitting ? "Updating..." : "Update Assignment"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assignments Table */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Surveyor
                  </th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Slum
                  </th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Type
                  </th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Created
                  </th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr
                    key={assignment._id}
                    className="border-b border-slate-700 hover:bg-slate-800/50"
                  >
                    <td className="py-4 px-4 font-medium text-white">
                      {assignment.surveyor.name}
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {assignment.slum.name}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assignment.status === "ACTIVE"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditAssignment(assignment)}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
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
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SupervisorAdminLayout>
  );
}