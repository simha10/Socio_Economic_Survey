"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import apiService from "@/services/api";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import ModernTable from "@/components/ModernTable";
import Button from "@/components/Button";
import SlumForm from "@/components/SlumForm";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

interface Slum {
  _id: string;
  slumName: string;
  slumId: number;
  stateCode: string;
  distCode: string;
  city: string;
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

interface User {
  _id: string;
  username: string;
  name: string;
  role: "ADMIN" | "SUPERVISOR" | "SURVEYOR";
  isActive: boolean;
  createdAt: string;
}

export default function AdminSlumsPage() {
  const router = useRouter();
  const [slums, setSlums] = useState<Slum[]>([]);
  const [filteredSlums, setFilteredSlums] = useState<Slum[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlum, setSelectedSlum] = useState<Slum | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slumToDelete, setSlumToDelete] = useState<Slum | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [slumToEdit, setSlumToEdit] = useState<Slum | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState<User | null>(null); // Added user state

  const fetchSlums = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllSlums(1, 10, undefined, true); // Load all slums
      if (response.success) {
        setSlums(response.data || []);
        setFilteredSlums(response.data || []);
      } else {
        console.error("Failed to fetch slums:", response.error);
      }
    } catch (error) {
      console.error("Error fetching slums:", error);
    } finally {
      setLoading(false);
    }
  };

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

    setUser(userData); // Set user data
    fetchSlums();
  }, [router]);

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
    setSlumToEdit(slum);
    setIsEditDialogOpen(true);
  };

  const handleViewSlum = (slum: Slum) => {
    router.push(`/admin/slums/${slum._id}`);
  };

  const handleDeleteClick = (slum: Slum) => {
    setSlumToDelete(slum);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!slumToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await apiService.deleteSlum(slumToDelete._id);
      if (response.success) {
        setSuccessMessage("Slum deleted successfully");
        setIsDeleteDialogOpen(false);
        setSlumToDelete(null);
        await fetchSlums();
      } else {
        alert("Failed to delete slum: " + response.message);
      }
    } catch (error) {
      console.error("Error deleting slum:", error);
      alert("Error deleting slum");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmEdit = () => {
    if (slumToEdit) {
      setSelectedSlum(slumToEdit);
      setIsFormOpen(true);
      setIsEditDialogOpen(false);
      setSlumToEdit(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSlum(null);
  };

  const handleFormSuccess = () => {
    const action = selectedSlum ? "updated" : "created";
    setSuccessMessage(`Slum ${action} successfully`);
    fetchSlums();
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFilteredSlums(slums);
      return;
    }
    
    const filtered = slums.filter((slum) =>
      slum.slumName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slum.slumId.toString().includes(searchQuery) ||
      slum.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slum.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof slum.ward === 'object' && slum.ward !== null && 
        (slum.ward.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         slum.ward.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         slum.ward.zone?.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      slum.ward.toString().includes(searchQuery)
    );
    setFilteredSlums(filtered);
  };

  if (loading) {
    return (
      <SupervisorAdminLayout role="ADMIN" username={user?.username || user?.username}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-2xl font-semibold text-slate-400">
            Loading slums...
          </div>
        </div>
      </SupervisorAdminLayout>
    );
  }

  return (
    <SupervisorAdminLayout role="ADMIN" username={user?.username || user?.username}>
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
            className="flex items-center gap-2 cursor-pointer"
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

        {/* Empty State and Table */}
        <ModernTable
          data={filteredSlums}
          keyField="_id"
          searchPlaceholder="Search by name, ID, city, village, zone, or ward..."
          columns={[
            {
              header: "Slum ID",
              accessorKey: "slumId",
              sortable: true,
              className: "font-medium text-white text-left",
            },
            {
              header: "Name",
              accessorKey: "slumName",
              sortable: true,
              className: "w-40",
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
              className: "text-left",
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
              className: "text-left w-50",
            },
            {
              header: "Village",
              accessorKey: "village",
              sortable: true,
              className: "w-40",
            },
            {
              header: "Type",
              accessorKey: (row) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
              className: "text-center font-medium tabular-nums align-middle",
            },
            {
              header: "Area (sq.m)",
              accessorKey: (row) => row.area?.toFixed(2) || "0",
              sortable: true,
              className: "text-right font-medium tabular-nums align-middle",
            },
            {
              header: "Actions",
              accessorKey: (row) => (
                <div className="flex gap-2 justify-left" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleViewSlum(row)}
                    className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors cursor-pointer"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSlum(row);
                    }}
                    className="p-1.5 text-cyan-400 hover:bg-cyan-500/20 rounded-md transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(row);
                    }}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
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
          role={user?.role} // Pass the user's role to determine permissions
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Slum"
          message={`Are you sure you want to delete "${slumToDelete?.slumName}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setSlumToDelete(null);
          }}
          loading={deleteLoading}
        />

        <DeleteConfirmationDialog
          isOpen={isEditDialogOpen}
          title="Edit Slum"
          message={`Are you sure you want to edit "${slumToEdit?.slumName}"?`}
          onConfirm={handleConfirmEdit}
          onCancel={() => {
            setIsEditDialogOpen(false);
            setSlumToEdit(null);
          }}
          loading={false}
        />
      </div>
    </SupervisorAdminLayout>
  );
}
