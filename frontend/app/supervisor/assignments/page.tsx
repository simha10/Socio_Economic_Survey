"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
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
  assignmentType: string;
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

export default function SupervisorAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [slums, setSlums] = useState<Slum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    surveyorId: "",
    slumId: "",
    assignmentType: "FULL_SLUM",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignments, surveyors, and slums
        const [surveyorsRes, slumsRes, assignmentsRes] = await Promise.all([
          apiService.getUsers("SURVEYOR"),
          apiService.getAllSlums(),
          apiService.getAllAssignments(), // Use getAllAssignments for supervisors to see all assignments they created
        ]);

        if (assignmentsRes.success) {
          console.log("Assignments data:", assignmentsRes.data);
          setAssignments(assignmentsRes.data || []);
        }
        if (surveyorsRes.success) setSurveyors(surveyorsRes.data || []);
        if (slumsRes.success) setSlums(slumsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateAssignment = async () => {
    try {
      setError(null);
      const response = await apiService.assignSlumToSurveyor(
        newAssignment.surveyorId,
        newAssignment.slumId,
      );

      if (response.success) {
        // Refresh assignments list using getAllAssignments
        const assignmentsRes = await apiService.getAllAssignments();
        if (assignmentsRes.success) {
          console.log(
            "Updated assignments after creation:",
            assignmentsRes.data,
          );
          setAssignments(assignmentsRes.data || []);
        }
        // Reset form
        setNewAssignment({
          surveyorId: "",
          slumId: "",
          assignmentType: "FULL_SLUM",
        });
      } else {
        const errorMsg = response.error || "Unknown error occurred";
        console.error("Failed to create assignment:", errorMsg);
        setError(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Error creating assignment";
      console.error("Error creating assignment:", error);
      setError(errorMsg);
    }
  };

  // Get list of already assigned slum IDs
  const assignedSlumIds = new Set(assignments.map((a) => a.slum._id));

  // Filter slums to only show those not yet assigned
  const availableSlums = slums.filter((slum) => !assignedSlumIds.has(slum._id));

  if (loading) {
    return (
      <SupervisorAdminLayout role="SUPERVISOR">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-2xl font-semibold">Loading assignments...</div>
        </div>
      </SupervisorAdminLayout>
    );
  }

  return (
    <SupervisorAdminLayout role="SUPERVISOR">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            Manage Assignments
          </h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>
        )}

        {/* Create Assignment Form */}
        <Card>
          <h2 className="text-lg font-bold text-primary mb-4">
            Create New Assignment
          </h2>
          {availableSlums.length === 0 ? (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <p>
                ✓ All slums have been assigned! Every slum is now assigned to a
                surveyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Surveyor"
                value={newAssignment.surveyorId}
                onChange={(e) =>
                  setNewAssignment({
                    ...newAssignment,
                    surveyorId: e.target.value,
                  })
                }
                options={[
                  { value: "", label: "Select Surveyor" },
                  ...surveyors.map((s) => ({
                    value: s._id,
                    label: `${s.name} (${s.username})`,
                  })),
                ]}
              />
              <Select
                label="Slum"
                value={newAssignment.slumId}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, slumId: e.target.value })
                }
                options={[
                  {
                    value: "",
                    label:
                      availableSlums.length === 0
                        ? "All slums assigned"
                        : "Select Slum",
                  },
                  ...availableSlums.map((s) => ({
                    value: s._id,
                    label: `${s.name} - ${s.location}`,
                  })),
                ]}
                disabled={availableSlums.length === 0}
              />
              <div className="flex items-end">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleCreateAssignment}
                  disabled={!newAssignment.surveyorId || !newAssignment.slumId}
                >
                  Assign
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Assignments List */}
        <Card>
          <h2 className="text-lg font-bold text-primary mb-4">
            Current Assignments
          </h2>
          <div className="overflow-x-auto">
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>
                  No assignments created yet. Create one using the form above.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4">Surveyor</th>
                    <th className="text-left py-3 px-4">Slum</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr
                      key={assignment._id}
                      className="border-b border-slate-800 last:border-b-0"
                    >
                      <td className="py-3 px-4">{assignment.surveyor.name}</td>
                      <td className="py-3 px-4">{assignment.slum.name}</td>
                      <td className="py-3 px-4">{assignment.assignmentType}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            assignment.status === "COMPLETED"
                              ? "bg-green-500/20 text-green-400"
                              : assignment.status === "IN_PROGRESS"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </SupervisorAdminLayout>
  );
}
