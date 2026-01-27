"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import apiService from "@/services/api";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import SlumForm from "@/components/SlumForm";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

interface LocationReference {
  _id: string;
  name: string;
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
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlum, setSelectedSlum] = useState<Slum | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slumToDelete, setSlumToDelete] = useState<Slum | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState<User | null>(null); // Added user state

  const fetchSlums = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllSlums();
      if (response.success) {
        setSlums(response.data || []);
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
    setSelectedSlum(slum);
    setIsFormOpen(true);
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

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSlum(null);
  };

  const handleFormSuccess = () => {
    const action = selectedSlum ? "updated" : "created";
    setSuccessMessage(`Slum ${action} successfully`);
    fetchSlums();
  };

  if (loading) {
    return (
      <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-2xl font-semibold text-slate-400">
            Loading slums...
          </div>
        </div>
      </SupervisorAdminLayout>
    );
  }

  return (
    <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
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

        {/* Empty State */}
        {slums.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 7v5m0 0v3m0-3h3m-3 0H9"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Slums Found
              </h3>
              <p className="text-slate-400 mb-4">
                Get started by creating your first slum
              </p>
              <Button
                onClick={handleCreateSlum}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Slum
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800 border-b border-slate-700">
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      Name
                    </th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      Location
                    </th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      State
                    </th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      District
                    </th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      Type
                    </th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      Households
                    </th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slums.map((slum) => (
                    <tr
                      key={slum._id}
                      className="border-b border-slate-700 hover:bg-slate-800/50"
                    >
                      <td className="py-4 px-4 font-medium text-white">
                        {slum.name}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {slum.location}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {typeof slum.state === 'string' ? slum.state : slum.state?.name || ''}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {typeof slum.district === 'string' ? slum.district : slum.district?.name || ''}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            slum.slumType === 'NOTIFIED'
                              ? 'bg-blue-500/20 text-blue-400'
                              : slum.slumType === 'DECLARED'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {slum.slumType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {slum.totalHouseholds}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSlum(slum)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(slum)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

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
