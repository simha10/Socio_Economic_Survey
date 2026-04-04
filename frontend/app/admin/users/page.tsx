"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import apiService from "@/services/api";
import { Plus, Trash2, Edit2 } from "lucide-react";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { useToast } from "@/components/Toast";

interface User {
  _id: string;
  username: string;
  name: string;
  role: "ADMIN" | "SUPERVISOR" | "SURVEYOR";
  isActive: boolean;
  createdAt: string;
}

interface UserFormData {
  name: string;
  username: string;
  password: string;
  role: "ADMIN" | "SUPERVISOR" | "SURVEYOR";
  isActive: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    role: "SURVEYOR",
  });
  const [editFormData, setEditFormData] = useState<UserFormData>({
    name: "",
    username: "",
    password: "",
    role: "SURVEYOR",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const roleWeights = { ADMIN: 1, SUPERVISOR: 2, SURVEYOR: 3 };

  const filteredUsers = users
    .filter((u) => {
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesSearch = u.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    })
    .sort((a, b) => {
      const roleDiff = roleWeights[a.role] - roleWeights[b.role];
      if (roleDiff !== 0) return roleDiff;
      return a.name.localeCompare(b.name);
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

    setUser(userData); // Set user data
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.listUsers();
      if (response.success && response.data) {
        setUsers(response.data as User[]);
      } else {
        console.error("Failed to load users:", response.error);
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiService.createUser(formData);
      if (response.success) {
        showToast("User created successfully", "success", 3000);
        setFormData({ username: "", name: "", password: "", role: "SURVEYOR" });
        setShowForm(false);
        loadUsers();
      } else {
        showToast(response.error || "Failed to create user", "error", 3000);
      }
    } catch (error) {
      showToast(
        (error as Error).message || "Failed to create user",
        "error",
        3000,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setEditFormData({
        name: userToEdit.name,
        username: userToEdit.username,
        password: "", // Don't expose existing password for security
        role: userToEdit.role,
        isActive: userToEdit.isActive,
      });
      setIsEditDialogOpen(false);
      setUserToEdit(null);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);

    try {
      // Prepare update data - only include fields that changed
      const updateData: Partial<UserFormData> & { password?: string } = {
        name: editFormData.name,
        username: editFormData.username,
        role: editFormData.role,
        isActive: editFormData.isActive,
      };

      // Only include password if it's been provided
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      const response = await apiService.updateUser(editingUser._id, updateData);
      if (response.success) {
        showToast("User updated successfully", "success", 3000);
        setEditingUser(null);
        loadUsers();
      } else {
        showToast(response.error || "Failed to update user", "error", 3000);
      }
    } catch (error) {
      showToast(
        (error as Error).message || "Failed to update user",
        "error",
        3000,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await apiService.deleteUser(userToDelete._id);
      if (response.success) {
        showToast("User deleted successfully", "success", 3000);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        loadUsers();
      } else {
        showToast(response.error || "Failed to delete user", "error", 3000);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    } catch (error) {
      showToast(
        (error as Error).message || "Failed to delete user",
        "error",
        3000,
      );
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ username: "", name: "", password: "", role: "SURVEYOR" });
    setEditingUser(null);
    setShowForm(false);
  };

  return (
    <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Create User
          </button>
        </div>

        {/* Create User Form Modal */}
        {showForm && !editingUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full overflow-y-auto max-h-[90vh] shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">
                Create New User
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as
                            | "ADMIN"
                            | "SUPERVISOR"
                            | "SURVEYOR",
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="SURVEYOR">Surveyor</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 text-white py-2 px-6 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    {submitting ? "Creating..." : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Form Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full overflow-y-auto max-h-[90vh] shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">
                Edit User: {editingUser.username}
              </h2>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          username: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password{" "}
                      <span className="text-xs text-slate-400">
                        (leave blank to keep)
                      </span>
                    </label>
                    <input
                      type="password"
                      value={editFormData.password}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          password: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter new password (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Role
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          role: e.target.value as
                            | "ADMIN"
                            | "SUPERVISOR"
                            | "SURVEYOR",
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="SURVEYOR">Surveyor</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          isActive: e.target.checked,
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-300">
                      Active User
                    </span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 text-white py-2 px-6 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    {submitting ? "Updating..." : "Update User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50">
            <h2 className="text-lg font-semibold text-white">Users List</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-50"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="SURVEYOR">Surveyor</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Role
                  </th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Name
                  </th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Username
                  </th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 px-4 text-center text-slate-400"
                    >
                      {users.length === 0
                        ? "No users yet. Create one to get started!"
                        : "No users found matching filters."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-700 hover:bg-slate-800/50"
                    >
                      <td className="py-4 px-4 text-sm">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-white">
                        {user.name}
                      </td>
                      <td className="py-4 px-4 text-sm text-white">
                        {user.username}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-900/30 text-green-300"
                              : "bg-red-900/30 text-red-300"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isEditDialogOpen}
          title="Edit User"
          message={`Are you sure you want to edit "${userToEdit?.name}"?`}
          onConfirm={handleConfirmEdit}
          onCancel={() => {
            setIsEditDialogOpen(false);
            setUserToEdit(null);
          }}
          loading={false}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Delete User"
          message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
          }}
          loading={deleteLoading}
        />
      </div>
    </SupervisorAdminLayout>
  );
}
