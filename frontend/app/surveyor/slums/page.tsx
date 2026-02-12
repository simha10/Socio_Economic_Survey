"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SurveyorLayout from "@/components/SurveyorLayout";
import ModernTable from "@/components/ModernTable";
import apiService from "@/services/api";
import { useToast } from "@/components/Toast";

interface Slum {
  _id: string;
  slumId: string;
  slumName: string;
  ward?: {
    number: string;
    name: string;
  } | string;
  totalHouseholds?: number;
}

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
}

interface Assignment {
  _id: string;
  slum: Slum;
  surveyor: string;
  status: string;
  createdAt: string;
}

export default function SlumsPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [slums, setSlums] = useState<Slum[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user data
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }

    const loadSlums = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMyAssignments();
        if (response.success) {
          // Extract slum data from assignments
          const assignedSlums = (response.data || []).map((assignment: Assignment) => assignment.slum);
          setSlums(assignedSlums);
        } else {
          showToast("Failed to load assigned slums", "error");
        }
      } catch (error) {
        console.error("Error loading assigned slums:", error);
        showToast("Error loading assigned slums", "error");
      } finally {
        setLoading(false);
      }
    };

    loadSlums();
  }, []);

  const columns = [
    {
      header: "ID",
      accessorKey: "slumId" as keyof Slum,
      sortable: true,
      className: "font-medium text-white",
    },
    {
      header: "Name",
      accessorKey: "slumName" as keyof Slum,
      sortable: true,
      className: "font-medium text-white",
    },
    {
      header: "Ward",
      accessorKey: (row: Slum) => (row.ward ? (typeof row.ward === 'object' ? row.ward.number + " - " + row.ward.name : row.ward) : "-"),
      sortable: true,
    },
    {
      header: "Households",
      accessorKey: (row: Slum) => row.totalHouseholds?.toLocaleString() || "-",
    },
  ];

  if (loading) {
    return (
      <SurveyorLayout username={user?.name || user?.username}>
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SurveyorLayout>
    );
  }

  return (
    <SurveyorLayout username={user?.name || user?.username}>
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl font-bold text-white tracking-tight">My Assigned Slums</h1>
            </div>
            <div className="w-16"></div> {/* Spacer for alignment */}
        </div>

        <ModernTable
            data={slums}
            columns={columns}
            keyField="_id"
            searchPlaceholder="Search slums..."
        />
      </div>
    </SurveyorLayout>
  );
}
