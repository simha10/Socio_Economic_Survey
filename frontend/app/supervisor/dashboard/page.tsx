"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import DashboardStats from "@/components/DashboardStats";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Users, CheckCircle, Clock, MapPin, FileText, BarChart3, Plus, Eye, TrendingUp, Calendar } from "lucide-react";
import apiService from "@/services/api";

export default function SupervisorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalSlums: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    inProgressAssignments: 0,
    pendingAssignments: 0,
    totalSurveyors: 0,
    completedSlumSurveys: 0,
    totalHouseholdSurveys: 0,
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
      const slumsResponse = await apiService.getAllSlums();
      const usersResponse = await apiService.getUsers();
      
      if (assignmentsResponse.success && assignmentsResponse.data) {
        const assignments = assignmentsResponse.data;
        const totalAssignments = assignments.length;
        const completedAssignments = assignments.filter((a: any) => a.status === 'COMPLETED').length;
        const inProgressAssignments = assignments.filter((a: any) => a.status === 'IN_PROGRESS').length;
        const pendingAssignments = assignments.filter((a: any) => a.status === 'ASSIGNED').length;
        
        // Count unique slums with assignments
        const uniqueSlums = new Set(assignments.map((a: any) => a.slum?._id)).size;
        
        // Count completed slum surveys
        const completedSlumSurveys = assignments.filter((a: any) => 
          a.slumSurveyStatus === 'COMPLETED'
        ).length;
        
        // Count total household surveys
        let totalHouseholdSurveys = 0;
        for (const assignment of assignments) {
          if (assignment.householdSurveyCount) {
            totalHouseholdSurveys += assignment.householdSurveyCount;
          }
        }
        
        setDashboardStats({
          totalSlums: uniqueSlums,
          totalAssignments,
          completedAssignments,
          inProgressAssignments,
          pendingAssignments,
          totalSurveyors: usersResponse.success ? 
            usersResponse.data?.filter((u: any) => u.role === 'SURVEYOR').length : 0,
          completedSlumSurveys,
          totalHouseholdSurveys,
        });
      }
      
      if (slumsResponse.success && !dashboardStats.totalSlums) {
        setDashboardStats(prev => ({
          ...prev,
          totalSlums: slumsResponse.data?.length || 0
        }));
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const navigationCards = [
    {
      title: "Manage Slums",
      description: "Create and manage slum locations",
      icon: <MapPin className="w-8 h-8" />,
      color: "from-blue-600 to-cyan-500",
      action: () => router.push("/supervisor/slums"),
      buttonText: "View Slums"
    },
    {
      title: "Assign Surveys",
      description: "Assign slums to surveyors for data collection",
      icon: <Plus className="w-8 h-8" />,
      color: "from-purple-600 to-indigo-500",
      action: () => router.push("/supervisor/assignments"),
      buttonText: "Create Assignment"
    },
    {
      title: "Track Progress",
      description: "Monitor survey completion and progress",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "from-emerald-600 to-teal-500",
      action: () => router.push("/supervisor/progress"),
      buttonText: "View Progress"
    },
    {
      title: "View Reports",
      description: "Generate and export survey reports",
      icon: <FileText className="w-8 h-8" />,
      color: "from-amber-600 to-orange-500",
      action: () => router.push("/supervisor/reports"),
      buttonText: "Generate Report"
    }
  ];

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
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
            Monitor system-wide survey progress, manage assignments, and track team performance
          </p>
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
          System Overview
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
              label: "Completed Surveys",
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
              label: "Total Household Surveys",
              value: dashboardStats.totalHouseholdSurveys,
              icon: <Users className="w-5 h-5" />,
              colorClass: "text-rose-500 bg-rose-500/20",
            },
            {
              label: "In Progress",
              value: dashboardStats.inProgressAssignments,
              icon: <Clock className="w-5 h-5" />,
              colorClass: "text-amber-500 bg-amber-500/20",
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

      {/* Quick Actions Navigation */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {navigationCards.map((card, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              onClick={card.action}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${card.color} mb-4`}>
                  <div className="text-white">
                    {card.icon}
                  </div>
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {card.title}
                </h4>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  {card.description}
                </p>
                <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${card.color} text-white text-sm font-medium hover:shadow-lg transition-all duration-300`}>
                  <Eye className="w-4 h-4" />
                  {card.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-700 rounded-lg">
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-slate-400 mb-4">No recent activity to display</p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Activity feed will show recent assignments, completions, and system events as they occur.
          </p>
        </div>
      </div>
    </SupervisorAdminLayout>
  );
}

// Add RefreshCw icon
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
