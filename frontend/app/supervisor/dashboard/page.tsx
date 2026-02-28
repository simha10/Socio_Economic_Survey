"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import DashboardStats from "@/components/DashboardStats";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Users, CheckCircle, Clock, MapPin, TrendingUp, Calendar, RefreshCw } from "lucide-react";
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
  const [statsLoading, setStatsLoading] = useState(true);
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
    loadDashboardStats();
  }, [router]);

  const loadDashboardStats = async () => {
    setStatsLoading(true);
    try {
      // Fetch all assignments to calculate statistics
      const assignmentsResponse = await apiService.getAllAssignments();
      const slumsResponse = await apiService.getAllSlums(1, 10, undefined, true); // Load all slums for count
      const usersResponse = await apiService.getUsers();
      
      if (assignmentsResponse.success && assignmentsResponse.data) {
        const assignments: Assignment[] = assignmentsResponse.data as Assignment[];
        const totalAssignments = assignments.length;
        const completedAssignments = assignments.filter((a: Assignment) => a.status === 'COMPLETED').length;
        const inProgressAssignments = assignments.filter((a: Assignment) => a.status === 'IN PROGRESS').length;
        const pendingAssignments = assignments.filter((a: Assignment) => a.status === 'ASSIGNED').length;
        
        // Count unique slums with assignments
        const uniqueSlums = new Set(assignments.map((a: Assignment) => a.slum?._id)).size;
        
        // Count completed slum surveys (Submitted or Completed)
        const completedSlumSurveys = assignments.filter((a: Assignment) => 
          a.slumSurveyStatus === 'SUBMITTED' || a.slumSurveyStatus === 'COMPLETED'
        ).length;
        
        // Count in-progress slum surveys
        const inProgressSlumSurveys = assignments.filter((a: Assignment) => 
          a.slumSurveyStatus === 'IN PROGRESS'
        ).length;
        
        // Count completed household surveys and total households
        let totalCompletedHouseholdSurveys = 0;
        let totalHouseholdsCount = 0;
        for (const assignment of assignments) {
          if (assignment.householdSurveyProgress) {
            totalCompletedHouseholdSurveys += assignment.householdSurveyProgress.completed;
            totalHouseholdsCount += assignment.householdSurveyProgress.total;
          } else if (assignment.householdSurveyCount) {
            totalCompletedHouseholdSurveys += assignment.householdSurveyCount;
          }
        }
        
        setDashboardStats({
          totalSlums: uniqueSlums,
          totalAssignments,
          completedAssignments,
          inProgressAssignments,
          pendingAssignments,
          totalSurveyors: usersResponse.success ? 
            (usersResponse.data as User[])?.filter((u: User) => u.role === 'SURVEYOR').length : 0,
          completedSlumSurveys,
          totalHouseholdSurveys: totalCompletedHouseholdSurveys,
          totalHouseholds: totalHouseholdsCount,
          inProgressSlumSurveys,
        });
      }
      
      if (slumsResponse.success) {
        setDashboardStats(prev => ({
          ...prev,
          totalSlums: (slumsResponse.data as Slum[])?.length || 0
        }));
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
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
              label: "Active Assignments",
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
              label: "Completed Slums",
              value: dashboardStats.completedAssignments,
              icon: <CheckCircle className="w-5 h-5" />,
              colorClass: "text-green-500 bg-green-500/20",
              change: dashboardStats.totalAssignments > 0 
                ? `${Math.round((dashboardStats.completedAssignments / dashboardStats.totalAssignments) * 100)}% completion rate`
                : "0% completion rate",
              trend: "up"
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
