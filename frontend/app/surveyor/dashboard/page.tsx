"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SurveyorLayout from "@/components/SurveyorLayout";
import apiService from "@/services/api";
import { MapPin, Users, CheckCircle, Clock, ArrowRight } from "lucide-react";

interface Assignment {
  _id: string;
  slum: {
    _id: string;
    name: string;
    location: string;
    totalHouseholds?: number;
  };
  surveyor: {
    _id: string;
    name: string;
    username: string;
  };
  assignmentType: string;
  status: string;
  createdAt: string;
  slumSurveyStatus?: string;
  householdSurveyProgress?: {
    completed: number;
    total: number;
  };
}

export default function SurveyorDashboard() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verify user is surveyor
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData?.role !== "SURVEYOR") {
      router.push(`/${userData?.role?.toLowerCase()}/dashboard`);
      return;
    }

    setUser(userData);
    loadAssignments();
  }, [router]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      // Fetch surveyor's assignments from the API
      const response = await apiService.getMyAssignments();
      if (response.success) {
        console.log("Assignments loaded:", response.data);
        setAssignments(response.data || []);
      } else {
        console.error("Failed to load assignments:", response.error);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Failed to load assignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats based on assignment status
  const totalAssignments = assignments.length;
  const completedSurveys = assignments.filter(
    (a) => a.status === "COMPLETED",
  ).length;
  const pendingSurveys = assignments.filter(
    (a) => a.status === "PENDING",
  ).length;
  const inProgressSurveys = assignments.filter(
    (a) => a.status === "IN_PROGRESS",
  ).length;
  return (
    <SurveyorLayout username={user?.name || user?.username}>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Dashboard
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Overview of your survey assignments and progress
          </p>
        </div>
        <button
          onClick={() => router.push("/surveyor/dashboard")}
          className="self-start md:self-center flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Clock className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Assignments */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 transition-all hover:bg-slate-800/80">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">
            Total Assignments
          </p>
          <h3 className="text-3xl font-bold text-white">{totalAssignments}</h3>
        </div>

        {/* Completed */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 transition-all hover:bg-slate-800/80">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Completed</p>
          <h3 className="text-3xl font-bold text-white">{completedSurveys}</h3>
        </div>

        {/* In Progress */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 transition-all hover:bg-slate-800/80">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">In Progress</p>
          <h3 className="text-3xl font-bold text-white">{inProgressSurveys}</h3>
        </div>

        {/* Pending */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 transition-all hover:bg-slate-800/80">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Pending</p>
          <h3 className="text-3xl font-bold text-white">{pendingSurveys}</h3>
        </div>
      </div>

      {/* Content Area */}
      {assignments.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden group">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 p-20 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 p-20 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="text-6xl md:text-7xl mb-6 opacity-80 transform group-hover:scale-110 transition-transform duration-500">
              🏘️
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              No Assignments Yet
            </h2>
            <p className="text-slate-400 text-base md:text-lg max-w-lg leading-relaxed mb-8">
              You don't have any slums assigned yet. Your supervisor will assign
              you slums to survey. Check back soon.
            </p>

            <div className="absolute bottom-6 right-6 text-slate-700 animate-pulse">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        /* Assignments List */
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Active Assignments</h3>
            <button
              onClick={() => router.push("/surveyor/slums")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View all slums →
            </button>
          </div>

          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-blue-900/10 group"
            >
              {/* Card Header */}
              <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {assignment.slum?.name || "Unknown Slum"}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {assignment.slum?.location || "Unknown Location"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      assignment.status === "COMPLETED"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : assignment.status === "IN_PROGRESS"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-slate-700/50 text-slate-400 border-slate-600"
                    }`}
                  >
                    {assignment.status?.replace("_", " ") || "PENDING"}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Info Section */}
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">
                      <span className="font-medium text-white">
                        Assignment Type:
                      </span>{" "}
                      {assignment.assignmentType}
                    </p>
                    <p className="text-slate-400 text-sm mb-1">
                      <span className="font-medium text-white">
                        Total Households:
                      </span>{" "}
                      {assignment.slum?.totalHouseholds || "N/A"}
                    </p>
                    <p className="text-slate-400 text-sm">
                      <span className="font-medium text-white">
                        Assigned On:
                      </span>{" "}
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Survey Status Section */}
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          Slum Survey
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            assignment.slumSurveyStatus === "COMPLETED"
                              ? "text-green-400"
                              : "text-amber-400"
                          }`}
                        >
                          {assignment.slumSurveyStatus === "COMPLETED"
                            ? "✓ Completed"
                            : "Not Started"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          Household Survey
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {assignment.householdSurveyProgress?.completed || 0} /{" "}
                          {assignment.householdSurveyProgress?.total || 0}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              assignment.householdSurveyProgress?.total
                                ? (
                                    (assignment.householdSurveyProgress
                                      .completed /
                                      assignment.householdSurveyProgress
                                        .total) *
                                    100
                                  ).toFixed(0)
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() =>
                      router.push(`/surveyor/slum-survey/${assignment._id}`)
                    }
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-all"
                  >
                    Slum Survey
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/surveyor/household-survey/${assignment._id}`,
                      )
                    }
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
                  >
                    Household Survey
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SurveyorLayout>
  );
}
