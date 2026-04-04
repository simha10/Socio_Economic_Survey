"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import DashboardStats from "@/components/DashboardStats";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Users,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";
import apiService from "@/services/api";

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
}

interface Assignment {
  status: string;
  slum?: {
    _id: string;
    totalHouseholds?: number;
  };
  slumSurveyStatus?: string;
  householdSurveyCount?: number;
  householdSurveyProgress?: {
    completed: number;
    total: number;
  };
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

interface DashboardStats {
  totalSlums: number;
  totalAssignments: number;
  completedAssignments: number;
  inProgressAssignments: number;
  pendingAssignments: number;
  totalSurveyors: number;
  completedSlumSurveys: number;
  totalHouseholdSurveys: number;
  totalHouseholds: number;
  inProgressSlumSurveys: number;
}

export default function SupervisorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSlums: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    inProgressAssignments: 0,
    pendingAssignments: 0,
    totalSurveyors: 0,
    completedSlumSurveys: 0,
    totalHouseholdSurveys: 0,
    totalHouseholds: 0,
    inProgressSlumSurveys: 0,
  });

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
    setLoading(false);
  }, [router]);

  const loadDashboardStats = async () => {
    setStatsLoading(true);
    try {
      // Fetch ALL assignments with high limit to get complete data
      const assignmentsResponse = await apiService.getAllAssignments(1, 1000);
      const usersResponse = await apiService.getUsers();
      // Fetch slums with a default page size to avoid potential API issues
      const slumsResponse = await apiService.getAllSlums(
        1,
        100,
        undefined,
        true,
      ); // Load all slums for count

      // Initialize default values
      let totalSlumsAssigned = 0;
      let completedAssignments = 0;
      let inProgressAssignments = 0;
      let pendingAssignments = 0;
      let completedSlumSurveys = 0;
      let inProgressSlumSurveys = 0;
      let totalHouseholdsCount = 0;
      let totalCompletedHouseholdSurveys = 0;
      let totalSurveyors = 0;

      if (assignmentsResponse.success && assignmentsResponse.data) {
        const assignments: Assignment[] =
          assignmentsResponse.data as Assignment[];

        // Group assignments by slum to handle multiple assignments per slum
        const uniqueSlums = new Map<string, Assignment[]>();
        for (const assignment of assignments) {
          const slumId = assignment.slum?._id;
          if (slumId) {
            if (!uniqueSlums.has(slumId)) {
              uniqueSlums.set(slumId, []);
            }
            uniqueSlums.get(slumId)!.push(assignment);
          }
        }

        // Count total unique slums assigned
        totalSlumsAssigned = uniqueSlums.size;

        // Count assignments by status (based on unique slums)
        for (const [slumId, slumAssignments] of uniqueSlums) {
          // For assignment status, we can take the status from any assignment for the slum
          // since they should be synchronized
          const firstAssignment = slumAssignments[0];
          if (firstAssignment.status === "COMPLETED") {
            completedAssignments++;
          } else if (firstAssignment.status === "IN PROGRESS") {
            inProgressAssignments++;
          } else if (
            firstAssignment.status === "ASSIGNED" ||
            firstAssignment.status === "PENDING"
          ) {
            pendingAssignments++;
          }
        }

        // Count slum survey statuses and households (from first assignment per slum to avoid duplication)
        for (const [slumId, slumAssignments] of uniqueSlums) {
          const firstAssignment = slumAssignments[0];

          // Get total households from the slum data in the assignment
          if (firstAssignment.slum?.totalHouseholds) {
            totalHouseholdsCount += firstAssignment.slum.totalHouseholds;
          }

          // Get completed households from householdSurveyProgress
          if (firstAssignment.householdSurveyProgress) {
            totalCompletedHouseholdSurveys +=
              firstAssignment.householdSurveyProgress.completed;
          }

          // Count slum survey statuses
          if (
            firstAssignment.slumSurveyStatus === "SUBMITTED" ||
            firstAssignment.slumSurveyStatus === "COMPLETED"
          ) {
            completedSlumSurveys++;
          } else if (firstAssignment.slumSurveyStatus === "IN PROGRESS") {
            inProgressSlumSurveys++;
          }
        }
      }

      if (usersResponse.success) {
        totalSurveyors =
          (usersResponse.data as User[])?.filter(
            (u: User) => u.role === "SURVEYOR",
          ).length || 0;
      }

      // Get slums count from the response
      const slumsCount = slumsResponse.success
        ? (slumsResponse.data as Slum[])?.length || 0
        : 0;

      setDashboardStats({
        totalSlums: slumsCount, // Use the actual count from slums API
        totalAssignments: totalSlumsAssigned, // Total unique slums assigned
        completedAssignments,
        inProgressAssignments,
        pendingAssignments,
        totalSurveyors,
        completedSlumSurveys,
        totalHouseholdSurveys: totalCompletedHouseholdSurveys,
        totalHouseholds: totalHouseholdsCount,
        inProgressSlumSurveys,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading supervisor dashboard..." />;
  }

  return (
    <SupervisorAdminLayout
      role="SUPERVISOR"
      username={user?.name || user?.username}
    >
      {/* Dashboard Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Supervisor Dashboard
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadDashboardStats}
            disabled={statsLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {statsLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Overview
        </h3>
        <DashboardStats
          stats={[
            {
              label: "Total Slums",
              value: dashboardStats.totalSlums,
              icon: <MapPin className="w-5 h-5" />,
              colorClass: "text-blue-500 bg-blue-500/20",
            },
            {
              label: "Total Slum Assignments",
              value: dashboardStats.totalAssignments,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-purple-500 bg-purple-500/20",
            },
            {
              label: "Surveyors",
              value: dashboardStats.totalSurveyors,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-cyan-500 bg-cyan-500/20",
            },
            {
              label: "Completed Slum Assignments",
              value: dashboardStats.completedAssignments,
              icon: <CheckCircle className="w-5 h-5" />,
              colorClass: "text-green-500 bg-green-500/20",
              change:
                dashboardStats.totalAssignments > 0
                  ? `${Math.round((dashboardStats.completedAssignments / dashboardStats.totalAssignments) * 100)}% completion rate`
                  : "0% completion rate",
              trend: "up",
            },
          ]}
        />
      </div>

      {/* Survey Progress Stats */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          Survey Progress
        </h3>
        <DashboardStats
          stats={[
            {
              label: "Completed Slum Surveys",
              value: dashboardStats.completedSlumSurveys,
              icon: <CheckCircle className="w-5 h-5" />,
              colorClass: "text-emerald-500 bg-emerald-500/20",
            },
            {
              label: "In Progress Slum Surveys",
              value: dashboardStats.inProgressSlumSurveys,
              icon: <Clock className="w-5 h-5" />,
              colorClass: "text-amber-500 bg-amber-500/20",
            },
            {
              label: "Total Households",
              value: dashboardStats.totalHouseholds,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-slate-500 bg-slate-500/20",
            },
            {
              label: "Completed Household Surveys",
              value: dashboardStats.totalHouseholdSurveys,
              icon: <CheckCircle className="w-5 h-5" />,
              colorClass: "text-emerald-500 bg-emerald-500/20",
            },
          ]}
        />
      </div>
    </SupervisorAdminLayout>
  );
}
