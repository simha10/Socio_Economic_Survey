"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FileText, Download, BarChart3, PieChart, Calendar, Filter } from "lucide-react";
import apiService from "@/services/api";

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
}

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
  householdSurveyCount?: number;
  slumSurveyStatus?: string;
}

interface ReportData {
  totalAssignments: number;
  completedAssignments: number;
  inProgressAssignments: number;
  pendingAssignments: number;
  completionRate: number;
  progressRate: number;
  totalHouseholdSurveys: number;
  totalSlumSurveys: number;
  totalSlums: number;
  totalSurveyors: number;
  assignments: Assignment[];
}

export default function SupervisorReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const loadReportData = async () => {
    try {
      // Fetch comprehensive report data from API
      const assignmentsResponse = await apiService.getAllAssignments();
      const slumsResponse = await apiService.getAllSlums();
      const usersResponse = await apiService.getUsers();
      
      if (assignmentsResponse.success && assignmentsResponse.data) {
        const assignments: Assignment[] = assignmentsResponse.data;
        const totalAssignments = assignments.length;
        const completedAssignments = assignments.filter((a: Assignment) => a.status === 'COMPLETED').length;
        const inProgressAssignments = assignments.filter((a: Assignment) => a.status === 'IN_PROGRESS').length;
        const pendingAssignments = assignments.filter((a: Assignment) => a.status === 'PENDING' || a.status === 'ASSIGNED').length;
        
        // Calculate additional metrics
        let totalHouseholdSurveys = 0;
        let totalSlumSurveys = 0;
        
        for (const assignment of assignments) {
          if (assignment.householdSurveyCount) {
            totalHouseholdSurveys += assignment.householdSurveyCount;
          }
          if (assignment.slumSurveyStatus) {
            totalSlumSurveys++;
          }
        }
        
        // Calculate completion rates
        const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
        const progressRate = totalAssignments > 0 ? Math.round(((completedAssignments + inProgressAssignments) / totalAssignments) * 100) : 0;
        
        setReportData({
          totalAssignments,
          completedAssignments,
          inProgressAssignments,
          pendingAssignments,
          completionRate,
          progressRate,
          totalHouseholdSurveys,
          totalSlumSurveys,
          totalSlums: slumsResponse.success ? slumsResponse.data?.length || 0 : 0,
          totalSurveyors: usersResponse.success ? usersResponse.data?.filter((u: User) => u.role === 'SURVEYOR').length || 0 : 0,
          assignments
        });
      }
    } catch (error) {
      console.error('Failed to load report data:', error);
    }
  };

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

  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => {
        loadReportData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      // Placeholder for export functionality
      alert(`Exporting report as ${format.toUpperCase()}... (This would download the report)`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const reportTypes = [
    {
      title: "Assignment Summary",
      description: "Overview of all assignments with completion status",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: "Slum Survey Report",
      description: "Detailed slum-level survey findings",
      icon: <PieChart className="w-6 h-6" />,
      color: "from-purple-600 to-indigo-500"
    },
    {
      title: "Household Analysis",
      description: "Household survey data and demographics",
      icon: <FileText className="w-6 h-6" />,
      color: "from-emerald-600 to-teal-500"
    },
    {
      title: "Progress Timeline",
      description: "Chronological view of survey completion",
      icon: <Calendar className="w-6 h-6" />,
      color: "from-amber-600 to-orange-500"
    }
  ];

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading reports..." />;
  }

  return (
    <SupervisorAdminLayout
      role="SUPERVISOR"
      username={user?.name || user?.username}
    >
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Reports & Analytics
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
            Generate comprehensive reports and analyze survey data across all assignments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportReport('csv')}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-8 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-white">Filter Reports</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadReportData}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-white mb-6">Report Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              onClick={() => alert(`Generating ${report.title} report...`)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${report.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${report.color} mb-4`}>
                  <div className="text-white">
                    {report.icon}
                  </div>
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {report.title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Report Preview</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Total Assignments</p>
              <p className="text-2xl font-bold text-white">{reportData.totalAssignments}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-500">{reportData.completedAssignments}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-amber-500">{reportData.inProgressAssignments}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-blue-500">{reportData.completionRate}%</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Total Surveyors</p>
              <p className="text-2xl font-bold text-cyan-500">{reportData.totalSurveyors}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Total Slums</p>
              <p className="text-2xl font-bold text-purple-500">{reportData.totalSlums}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Household Surveys</p>
              <p className="text-2xl font-bold text-rose-500">{reportData.totalHouseholdSurveys}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Progress Rate</p>
              <p className="text-2xl font-bold text-emerald-500">{reportData.progressRate}%</p>
            </div>
          </div>
          
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-400 mb-2">Report data loaded successfully</p>
            <p className="text-sm text-slate-500">Select a report type above to generate detailed analysis</p>
          </div>
        </div>
      )}
    </SupervisorAdminLayout>
  );
}