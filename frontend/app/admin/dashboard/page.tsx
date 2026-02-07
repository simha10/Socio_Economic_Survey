"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import DashboardStats from "@/components/DashboardStats";
import {
  BarChart3,
  Users,
  Building2,
  GitBranch,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  MapPin,
  CheckCircle,
  Clock,
} from "lucide-react";
import apiService from "@/services/api";

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface User {
  _id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface Slum {
  _id: string;
  name: string;
  location: string;
  city: string;
  ward: string;
  surveyStatus?: string;
  totalHouseholds?: number;
}

interface Assignment {
  _id: string;
  status: string;
  surveyor: { _id: string; name: string; username: string; };
  slum: Slum;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalSlums: 0,
    totalAssignments: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    inProgressAssignments: 0,
    pendingAssignments: 0,
    totalSurveyors: 0,
    completedSlumSurveys: 0,
    totalHouseholdSurveys: 0,
  });

  useEffect(() => {
    // Verify user is admin
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
    setLoading(false);
    loadDashboardStats();
  }, [router]);

  const loadDashboardStats = async () => {
    setStatsLoading(true);
    try {
      // Fetch users count
      const usersResponse = await apiService.listUsers();
      const usersCount = usersResponse.success && usersResponse.data ? usersResponse.data.length : 0;
      const surveyorsCount = usersResponse.success && usersResponse.data 
        ? usersResponse.data.filter((user: User) => user.role === 'SURVEYOR').length 
        : 0;

      // Fetch slums count
      const slumsResponse = await apiService.getAllSlums(1, 10, undefined, true); // Load all slums for count
      const slumsCount = slumsResponse.success && slumsResponse.data ? slumsResponse.data.length : 0;

      // Fetch assignments count
      const assignmentsResponse = await apiService.getAllAssignments();
      let totalAssignments = 0;
      let activeAssignmentsCount = 0;
      let completedAssignmentsCount = 0;
      let inProgressAssignmentsCount = 0;
      let pendingAssignmentsCount = 0;
      let uniqueSlumsCount = 0;
      let completedSlumSurveysCount = 0;
      let totalHouseholdSurveysCount = 0;
      
      if (assignmentsResponse.success && assignmentsResponse.data) {
        const assignments = assignmentsResponse.data;
        totalAssignments = assignments.length;
        activeAssignmentsCount = assignments.filter((a: Assignment) => a.status === 'ACTIVE').length;
        completedAssignmentsCount = assignments.filter((a: Assignment) => a.status === 'COMPLETED').length;
        inProgressAssignmentsCount = assignments.filter((a: Assignment) => a.status === 'IN PROGRESS').length;
        pendingAssignmentsCount = assignments.filter((a: Assignment) => a.status === 'PENDING' || a.status === 'ASSIGNED').length;
        
        // Count unique slums with assignments
        uniqueSlumsCount = new Set(assignments.map((a: Assignment) => a.slum?._id)).size;
        
        // Count completed slum surveys
        completedSlumSurveysCount = assignments.filter((a: Assignment) => 
          a.slum && a.slum.surveyStatus === 'COMPLETED'
        ).length;
        
        // Count total household surveys
        for (const assignment of assignments) {
          if (assignment.slum && assignment.slum.totalHouseholds) {
            totalHouseholdSurveysCount += assignment.slum.totalHouseholds;
          }
        }
      }

      setDashboardStats({
        totalUsers: usersCount,
        totalSlums: slumsCount, // Use actual database count
        totalAssignments: totalAssignments,
        activeAssignments: activeAssignmentsCount,
        completedAssignments: completedAssignmentsCount,
        inProgressAssignments: inProgressAssignmentsCount,
        pendingAssignments: pendingAssignmentsCount,
        totalSurveyors: surveyorsCount,
        completedSlumSurveys: completedSlumSurveysCount,
        totalHouseholdSurveys: totalHouseholdSurveysCount,
      });

      // Set placeholder stats for backward compatibility
      setStats([
        {
          title: "Total Users",
          value: usersCount,
          icon: <Users className="w-6 h-6" />,
          color: "from-blue-600 to-blue-700",
        },
        {
          title: "Total Slums",
          value: slumsCount, // Use actual database count
          icon: <Building2 className="w-6 h-6" />,
          color: "from-purple-600 to-purple-700",
        },
        {
          title: "Active Assignments",
          value: activeAssignmentsCount,
          icon: <GitBranch className="w-6 h-6" />,
          color: "from-cyan-600 to-cyan-700",
        },
        {
          title: "Surveys Completed",
          value: completedAssignmentsCount,
          icon: <BarChart3 className="w-6 h-6" />,
          color: "from-green-600 to-green-700",
        },
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
      {/* Dashboard Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Dashboard
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
                <div className="w-2 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
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
        <DashboardStats
          stats={[
            {
              label: "Total Users",
              value: dashboardStats.totalUsers,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-blue-500 bg-blue-500/20",
            },
            {
              label: "Total Slums",
              value: dashboardStats.totalSlums,
              icon: <MapPin className="w-5 h-5" />,
              colorClass: "text-purple-500 bg-purple-500/20",
            },
            {
              label: "Total Assignments",
              value: dashboardStats.totalAssignments,
              icon: <GitBranch className="w-5 h-5" />,
              colorClass: "text-cyan-500 bg-cyan-500/20",
            },
            {
              label: "Surveyors",
              value: dashboardStats.totalSurveyors,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-indigo-500 bg-indigo-500/20",
            },
          ]}
        />
      </div>

      {/* Survey Progress Stats */}
      <div className="mb-10">
        <DashboardStats
          stats={[
            {
              label: "Active Assignments",
              value: dashboardStats.activeAssignments,
              icon: <GitBranch className="w-5 h-5" />,
              colorClass: "text-amber-500 bg-amber-500/20",
            },
            {
              label: "Completed Assignments",
              value: dashboardStats.completedAssignments,
              icon: <CheckCircle className="w-5 h-5" />,
              colorClass: "text-green-500 bg-green-500/20",
              change: dashboardStats.totalAssignments > 0 
                ? `${Math.round((dashboardStats.completedAssignments / dashboardStats.totalAssignments) * 100)}% completion rate`
                : "0% completion rate",
              trend: "up"
            },
            {
              label: "In Progress",
              value: dashboardStats.inProgressAssignments,
              icon: <Clock className="w-5 h-5" />,
              colorClass: "text-yellow-500 bg-yellow-500/20",
            },
            {
              label: "Pending Assignments",
              value: dashboardStats.pendingAssignments,
              icon: <Clock className="w-5 h-5" />,
              colorClass: "text-slate-500 bg-slate-500/20",
            },
          ]}
        />
      </div>

      {/* Survey Metrics */}
      <div className="mb-10">
        <DashboardStats
          stats={[
            {
              label: "Completed Slum Surveys",
              value: dashboardStats.completedSlumSurveys,
              icon: <CheckCircle className="w-5 h-5" />,
              colorClass: "text-emerald-500 bg-emerald-500/20",
            },
            {
              label: "Total Household Surveys",
              value: dashboardStats.totalHouseholdSurveys,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-rose-500 bg-rose-500/20",
            },
            {
              label: "Survey Completion Rate",
              value: dashboardStats.totalAssignments > 0 
                ? Math.round((dashboardStats.completedAssignments / dashboardStats.totalAssignments) * 100)
                : 0,
              icon: <BarChart3 className="w-5 h-5" />,
              colorClass: "text-blue-500 bg-blue-500/20",
            },
            {
              label: "Average Households per Slum",
              value: dashboardStats.totalSlums > 0 
                ? Math.round(dashboardStats.totalHouseholdSurveys / dashboardStats.totalSlums)
                : 0,
              icon: <Building2 className="w-5 h-5" />,
              colorClass: "text-violet-500 bg-violet-500/20",
            },
          ]}
        />
      </div>
    </SupervisorAdminLayout>
  );
}