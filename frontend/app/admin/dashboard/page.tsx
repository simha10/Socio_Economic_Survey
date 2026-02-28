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
  RefreshCw,
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
  cityTownCode: string;
  surveyStatus?: string;
  totalHouseholds?: number;
}

interface Assignment {
  _id: string;
  status: string;
  surveyor: { _id: string; name: string; username: string; };
  slum: Slum;
  slumSurveyStatus?: string;
  householdSurveyProgress?: {
    completed: number;
    total: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalSupervisors: 0,
    totalSurveyors: 0,
    totalSlums: 0,
    totalAssignments: 0,
    activeAssignments: 0,  // Add this for In Progress assignments
    pendingAssignments: 0,
    completedAssignments: 0,
    inProgressSlumSurveys: 0,
    completedSlumSurveys: 0,
    totalHouseholds: 0,
    completedHouseholds: 0,
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
      const usersData = usersResponse.data as User[] || [];
      const usersCount = usersResponse.success && usersData ? usersData.length : 0;
      const surveyorsCount = usersResponse.success && usersData 
        ? usersData.filter((user: User) => user.role === 'SURVEYOR').length 
        : 0;
      const supervisorsCount = usersResponse.success && usersData
        ? usersData.filter((user: User) => user.role === 'SUPERVISOR').length
        : 0;

      // Fetch slums count
      const slumsResponse = await apiService.getAllSlums(1, 10, undefined, true); // Load all slums for count
      const slumsData = slumsResponse.data as Slum[] || [];
      const slumsCount = slumsResponse.success && slumsData ? slumsData.length : 0;

      // Fetch assignments count
      const assignmentsResponse = await apiService.getAllAssignments();
      let totalAssignments = 0;
      let completedAssignmentsCount = 0;
      let activeAssignmentsCount = 0;  // Active = not completed
      let completedHouseholdsCount = 0;
      let completedSlumSurveysCount = 0;
      let inProgressSlumSurveysCount = 0;
      let pendingAssignmentsCount = 0; // Unassigned slums
      
      if (assignmentsResponse.success && assignmentsResponse.data) {
        const assignments = assignmentsResponse.data as Assignment[];
        totalAssignments = assignments.length;
        completedAssignmentsCount = assignments.filter((a: Assignment) => a.status === 'COMPLETED').length;
        activeAssignmentsCount = assignments.filter((a: Assignment) => a.status !== 'COMPLETED').length;  // Active = not completed
        
        // Calculate completed households from assignments
        for (const assignment of assignments) {
          if (assignment.householdSurveyProgress) {
            completedHouseholdsCount += assignment.householdSurveyProgress.completed;
          }
        }
      }
      
      // Calculate pending assignments (unassigned slums)
      pendingAssignmentsCount = Math.max(0, slumsCount - totalAssignments);

      // Process assignments for slum survey status counts and household counts
      if (assignmentsResponse.success && assignmentsResponse.data) {
        const assignments = assignmentsResponse.data as Assignment[];
        
        // Count slum survey statuses from assignments
        for (const assignment of assignments) {
          if (assignment.slumSurveyStatus === 'IN PROGRESS') {
            inProgressSlumSurveysCount++;
          } else if (assignment.slumSurveyStatus === 'SUBMITTED' || assignment.slumSurveyStatus === 'COMPLETED') {
            completedSlumSurveysCount++;
          }
        }
      }
      
      // Calculate total households from slums
      let totalHouseholdsCount = 0;
      if (slumsResponse.success && slumsResponse.data) {
        const slums = slumsResponse.data as Slum[];
        for (const slum of slums) {
          if (slum.totalHouseholds) {
            totalHouseholdsCount += slum.totalHouseholds;
          }
        }
      }

      setDashboardStats({
        totalUsers: usersCount,
        totalSupervisors: supervisorsCount,
        totalSurveyors: surveyorsCount,
        totalSlums: slumsCount,
        totalAssignments: totalAssignments,
        activeAssignments: activeAssignmentsCount,
        pendingAssignments: pendingAssignmentsCount,
        completedAssignments: completedAssignmentsCount,
        inProgressSlumSurveys: inProgressSlumSurveysCount,
        completedSlumSurveys: completedSlumSurveysCount,
        totalHouseholds: totalHouseholdsCount,
        completedHouseholds: completedHouseholdsCount,
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
          title: "Total Assignments",
          value: totalAssignments,
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
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
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
              label: "Total Supervisors",
              value: dashboardStats.totalSupervisors,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-purple-500 bg-purple-500/20",
            },
            {
              label: "Total Surveyors",
              value: dashboardStats.totalSurveyors,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-indigo-500 bg-indigo-500/20",
            },
            {
              label: "Total Slums",
              value: dashboardStats.totalSlums,
              icon: <MapPin className="w-5 h-5" />,
              colorClass: "text-cyan-500 bg-cyan-500/20",
            },
          ]}
        />
      </div>

      {/* Survey Progress Stats */}
      <div className="mb-10">
        <DashboardStats
          stats={[
            {
              label: "Total Assignments",
              value: dashboardStats.totalAssignments,
              icon: <GitBranch className="w-5 h-5" />,
              colorClass: "text-amber-500 bg-amber-500/20",
            },
            {
              label: "Active Assignments",
              value: dashboardStats.activeAssignments,
              icon: <Clock className="w-5 h-5" />,
              colorClass: "text-yellow-500 bg-yellow-500/20",
            },
            {
              label: "Pending Assignments",
              value: dashboardStats.pendingAssignments,
              icon: <Clock className="w-5 h-5" />,
              colorClass: "text-slate-500 bg-slate-500/20",
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
          ]}
        />
      </div>

      {/* Survey Metrics */}
      <div className="mb-10">
        <DashboardStats
          stats={[
            {
              label: "In Progress Slum Surveys",
              value: dashboardStats.inProgressSlumSurveys,
              icon: <Clock className="w-5 h-5" />,
              colorClass: "text-yellow-500 bg-yellow-500/20",
            },
            {
              label: "Completed Slum Surveys",
              value: dashboardStats.completedSlumSurveys,
              icon: <CheckCircle className="w-5 h-5" />,
              colorClass: "text-emerald-500 bg-emerald-500/20",
            },
            {
              label: "Total Households",
              value: dashboardStats.totalHouseholds,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-rose-500 bg-rose-500/20",
            },
            {
              label: "Completed Households",
              value: dashboardStats.completedHouseholds,
              icon: <CheckCircle className="w-5 h-5" />,
              colorClass: "text-violet-500 bg-violet-500/20",
            },
          ]}
        />
      </div>
    </SupervisorAdminLayout>
  );
}
