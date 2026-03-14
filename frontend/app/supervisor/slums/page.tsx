"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Eye } from "lucide-react";
import apiService from "@/services/api";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import ModernTable from "@/components/ModernTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import SlumForm from "@/components/SlumForm";
import EditConfirmationDialog from "@/components/EditConfirmationDialog";

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
}

interface Slum {
  _id: string;
  slumName: string;
  slumId: number;
  stateCode: string;
  distCode: string;
  cityTownCode: string;
  ward: {
    _id: string;
    number: string;
    name: string;
    zone: string;
  } | number;
  slumType: string;
  village: string;
  landOwnership: string;
  totalHouseholds: number;
  area: number;
  surveyStatus: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupervisorSlumsPage() {
  const router = useRouter();
  const [slums, setSlums] = useState<Slum[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlum, setSelectedSlum] = useState<Slum | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [slumToEdit, setSlumToEdit] = useState<Slum | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchSlums = async () => {
    console.log('SupervisorSlumsPage: Starting fetchSlums');
    try {
      setLoading(true);
      const response = await apiService.getAllSlums(1, 10, undefined, true); // Load all slums
      console.log('SupervisorSlumsPage: Fetched slums response', response);
      if (response.success) {
        setSlums(response.data as Slum[] || []);
        console.log('SupervisorSlumsPage: Set slums state with', (response.data as Slum[])?.length, 'items');
      } else {
        console.error("Failed to fetch slums:", response.error);
      }
    } catch (error) {
      console.error("Error fetching slums:", error);
    } finally {
      setLoading(false);
      console.log('SupervisorSlumsPage: Loading state set to false');
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
    fetchSlums();
  }, [router]); // Include router in dependency array

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleEditSlum = (slum: Slum) => {
    console.log('SupervisorSlumsPage: Opening edit confirmation for slum', slum);
    setSlumToEdit(slum);
    setIsEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    console.log('SupervisorSlumsPage: Confirming edit for slum', slumToEdit);
    if (!slumToEdit) return;
    
    setSelectedSlum(slumToEdit);
    setIsFormOpen(true);
    setIsEditDialogOpen(false);
    setSlumToEdit(null);
  };

  const handleViewSlum = (slum: Slum) => {
    console.log('SupervisorSlumsPage: Redirecting to view slum', slum._id);
    router.push(`/supervisor/slums/${slum._id}`);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSlum(null);
  };

  const handleFormSuccess = () => {
    console.log('SupervisorSlumsPage: Form success callback called', { selectedSlum });
    const action = selectedSlum ? "updated" : "created";
    setSuccessMessage(`Slum ${action} successfully`);
    setTimeout(() => {
      console.log('SupervisorSlumsPage: Fetching slums after', action);
      fetchSlums();
    }, 300); // Small delay to prevent race conditions
  };

  if (loading) {
    return (
      <SupervisorAdminLayout role="SUPERVISOR" username={user?.name || user?.username}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading slums data..." />
        </div>
      </SupervisorAdminLayout>
    );
  }

  return (
    <SupervisorAdminLayout role="SUPERVISOR" username={user?.name || user?.username}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Slums</h1>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <ModernTable
          data={slums}
          keyField="_id"
          searchPlaceholder="Search slums by ID, Name, Village..."
          columns={[
            {
              header: "Slum ID",
              accessorKey: "slumId",
              sortable: true,
              className: "font-medium text-white align-middle",
            },
            {
              header: "Name",
              accessorKey: "slumName",
              sortable: true,
              className: "align-left w-50",
            },
            {
              header: "Zone",
              accessorKey: (row) => {
                if (typeof row.ward === 'object' && row.ward !== null) {
                  return row.ward.zone || 'N/A';
                }
                return 'N/A';
              },
              sortable: true,
              className: "align-left",
            },
            {
              header: "Ward",
              accessorKey: (row) => {
                if (typeof row.ward === 'object' && row.ward !== null) {
                  return `${row.ward.number} - ${row.ward.name}`;
                }
                return row.ward?.toString() || 'N/A';
              },
              sortable: true,
              className: "align-left w-60",
            },
            {
              header: "Village",
              accessorKey: "village",
              sortable: true,
              className: "align-middle w-40",
            },
            {
              header: "Type",
              accessorKey: (row) => (
                <span
                  className={`px-1 py-1 rounded-full align-middle text-xs whitespace-nowrap w-20 ${
                    row.slumType === "NOTIFIED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {row.slumType.replace('_', ' ')}
                </span>
              ),
            },
            {
              header: "Households",
              accessorKey: (row) => row.totalHouseholds?.toString() || "0",
              sortable: true,
              className: "text-center font-medium tabular-nums align-left w-4",
            },
            {
              header: "Area (sq.m)",
              accessorKey: (row) => row.area?.toFixed(2) || "0",
              className: "text-center font-medium tabular-nums",
            },
            {
              header: "Actions",
              accessorKey: (row) => (
                <div className="flex gap-2 justify-left" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleViewSlum(row)}
                    className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditSlum(row)}
                    className="p-1.5 text-cyan-400 hover:bg-cyan-500/20 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ),
              className: "text-center align-middle",
            },
          ]}
        />

        {/* Modals */}
        <SlumForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          slum={selectedSlum}
        />

        <EditConfirmationDialog
          isOpen={isEditDialogOpen}
          surveyType="slum"
          entityIdentifier={slumToEdit?.slumName || ''}
          onConfirm={handleConfirmEdit}
          onCancel={() => {
            setIsEditDialogOpen(false);
            setSlumToEdit(null);
          }}
        />
      </div>
    </SupervisorAdminLayout>
  );
}
