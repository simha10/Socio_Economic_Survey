"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";
import apiService from "@/services/api";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import ModernTable from "@/components/ModernTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import SlumForm from "@/components/SlumForm";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

interface LocationReference {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
}

interface Slum {
  _id: string;
  name: string;
  location: string;
  district: string | LocationReference;
  state: string | LocationReference;
  slumType: string;
  totalHouseholds: number;
  city?: string;
  ward?: string;
}

export default function SupervisorSlumsPage() {
  const router = useRouter();
  const [slums, setSlums] = useState<Slum[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlum, setSelectedSlum] = useState<Slum | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slumToDelete, setSlumToDelete] = useState<Slum | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchSlums = async () => {
    console.log('SupervisorSlumsPage: Starting fetchSlums');
    try {
      setLoading(true);
      const response = await apiService.getAllSlums();
      console.log('SupervisorSlumsPage: Fetched slums response', response);
      if (response.success) {
        setSlums(response.data || []);
        console.log('SupervisorSlumsPage: Set slums state with', response.data?.length, 'items');
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

  const handleCreateSlum = () => {
    setSelectedSlum(null);
    setIsFormOpen(true);
  };

  const handleEditSlum = (slum: Slum) => {
    console.log('SupervisorSlumsPage: Opening edit form for slum', slum);
    setSelectedSlum(slum);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (slum: Slum) => {
    setSlumToDelete(slum);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    console.log('SupervisorSlumsPage: Confirming delete for slum', slumToDelete);
    if (!slumToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await apiService.deleteSlum(slumToDelete._id);
      console.log('SupervisorSlumsPage: Delete response received', response);
      if (response.success) {
        setSuccessMessage("Slum deleted successfully");
        setIsDeleteDialogOpen(false);
        setSlumToDelete(null);
        setTimeout(() => {
          console.log('SupervisorSlumsPage: Fetching slums after deletion');
          fetchSlums();
        }, 300); // Delay to prevent race conditions
      } else {
        console.log('SupervisorSlumsPage: Delete failed', response.message);
        alert("Failed to delete slum: " + response.message);
      }
    } catch (error) {
      console.error("Error deleting slum:", error);
      alert("Error deleting slum");
    } finally {
      setDeleteLoading(false);
      console.log('SupervisorSlumsPage: Delete loading state set to false');
    }
  };

  const handleViewSlum = (id: string) => {
    router.push(`/supervisor/slums/${id}`);
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
            <p className="text-slate-400 mt-2">
              Create, edit, and manage slum information
            </p>
          </div>
          <Button
            onClick={handleCreateSlum}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Slum
          </Button>
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
          searchPlaceholder="Search slums by name, location..."
          onRowClick={(row) => handleViewSlum(row._id)}
          columns={[
            {
              header: "Name",
              accessorKey: "name",
              sortable: true,
              className: "font-medium text-white",
            },
            {
              header: "Location",
              accessorKey: "location",
              sortable: true,
            },
            {
              header: "State",
              accessorKey: (row: Slum) => typeof row.state === 'string' ? row.state : row.state?.name || "N/A",
              sortable: true,
            },
            {
              header: "District",
              accessorKey: (row: Slum) => typeof row.district === 'string' ? row.district : row.district?.name || "N/A",
            },
            {
              header: "Type",
              accessorKey: (row) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    row.slumType === "NOTIFIED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {row.slumType}
                </span>
              ),
            },
            {
              header: "Households",
              accessorKey: (row) => row.totalHouseholds,
              sortable: true,
              className: "text-right",
            },
            {
              header: "Actions",
              accessorKey: (row) => (
                <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEditSlum(row)}
                    className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(row)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
              className: "text-right",
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

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Slum"
          message={`Are you sure you want to delete "${slumToDelete?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setSlumToDelete(null);
          }}
          loading={deleteLoading}
        />
      </div>
    </SupervisorAdminLayout>
  );
}
