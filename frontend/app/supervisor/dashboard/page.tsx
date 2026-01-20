"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import { Users, Building2, GitBranch, ArrowRight } from "lucide-react";

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function SupervisorDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // For now, we'll set placeholder stats. These will be replaced with API calls
      setStats([
        {
          title: "Active Surveyors",
          value: 0,
          icon: <Users className="w-6 h-6" />,
          color: "from-blue-600 to-blue-700",
        },
        {
          title: "Total Slums",
          value: 0,
          icon: <Building2 className="w-6 h-6" />,
          color: "from-purple-600 to-purple-700",
        },
        {
          title: "Active Assignments",
          value: 0,
          icon: <GitBranch className="w-6 h-6" />,
          color: "from-cyan-600 to-cyan-700",
        },
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupervisorAdminLayout
      role="SUPERVISOR"
      username={user?.name || user?.username}
    >
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#E5E7EB] mb-2">
          Dashboard
        </h2>
        <p className="text-[#9CA3AF] text-sm">
          Overview of your survey assignments and progress
        </p>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Assignments */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5">
          <p className="text-[#E5E7EB] text-xs font-medium mb-1">
            Total Assignments
          </p>
          <h3 className="text-3xl font-bold text-white">0</h3>
        </div>

        {/* Completed */}
        <div className="bg-gradient-to-br from-[#22C55E] to-green-700 rounded-xl p-5">
          <p className="text-[#E5E7EB] text-xs font-medium mb-1">
            Completed
          </p>
          <h3 className="text-3xl font-bold text-white">0</h3>
        </div>

        {/* In Progress */}
        <div className="bg-gradient-to-br from-[#F59E0B] to-amber-700 rounded-xl p-5">
          <p className="text-[#E5E7EB] text-xs font-medium mb-1">
            In Progress
          </p>
          <h3 className="text-3xl font-bold text-white">0</h3>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-[#38BDF8] to-cyan-700 rounded-xl p-5">
          <p className="text-[#E5E7EB] text-xs font-medium mb-1">
            Pending
          </p>
          <h3 className="text-3xl font-bold text-white">0</h3>
        </div>
      </div>

      {/* Action Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/supervisor/slums")}
            className="p-4 bg-[#111827] border border-slate-700 text-[#E5E7EB] rounded-xl font-medium transition-all hover:bg-slate-700"
          >
            View Slums
          </button>
          <button
            onClick={() => router.push("/supervisor/assignments")}
            className="p-4 bg-[#111827] border border-slate-700 text-[#E5E7EB] rounded-xl font-medium transition-all hover:bg-slate-700"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Content Area / Empty State */}
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🏠</div>
        <h3 className="text-xl font-bold text-[#E5E7EB] mb-2">
          No Assignments Yet
        </h3>
        <p className="text-[#9CA3AF] text-sm">
          Your supervisor has not assigned any surveys yet.
        </p>
      </div>
    </SupervisorAdminLayout>
  );
}
