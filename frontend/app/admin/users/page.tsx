"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorAdminLayout from "@/components/SupervisorAdminLayout";
import apiService from "@/services/api";
import { Plus, Trash2, Edit2} from "lucide-react";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

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
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        setUsers(response.data);
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
    setMessage("");

    try {
      const response = await apiService.createUser(formData);
      if (response.success) {
        setMessage("User created successfully");
        setFormData({ username: "", name: "", password: "", role: "SURVEYOR" });
        setShowForm(false);
        loadUsers();
      } else {
        setMessage(`Error: ${response.error || "Failed to create user"}`);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message || "Failed to create user"}`);
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
        password: '', // Don't expose existing password for security
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
    setMessage("");

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
        setMessage("User updated successfully");
        setEditingUser(null);
        loadUsers();
      } else {
        setMessage(`Error: ${response.error || "Failed to update user"}`);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message || "Failed to update user"}`);
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
        setMessage("User deleted successfully");
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        loadUsers();
      } else {
        setMessage(`Error: ${response.error || "Failed to delete user"}`);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message || "Failed to delete user"}`);
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
    setMessage("");
  };

  return (
    <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-slate-400 mt-2">
              Create and manage system users
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" /> Create User
          </button>
        </div>

        {/* Create User Form */}
        {showForm && !editingUser && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Create New User
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      setFormData({ ...formData, role: e.target.value as "ADMIN" | "SUPERVISOR" | "SURVEYOR" })
                    }
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"

                  >
                    <option value="SURVEYOR">Surveyor</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    message.includes("Error")
                      ? "bg-red-900/30 text-red-300"
                      : "bg-green-900/30 text-green-300"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 text-white py-2 px-6 rounded-lg font-medium transition-all"
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit User Form */}
        {editingUser && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Edit User: {editingUser.username}
            </h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
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
                      setEditFormData({ ...editFormData, username: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password (Leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, password: e.target.value })
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
                      setEditFormData({ ...editFormData, role: e.target.value as "ADMIN" | "SUPERVISOR" | "SURVEYOR" })
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
                      setEditFormData({ ...editFormData, isActive: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-300">Active User</span>
                </label>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    message.includes("Error")
                      ? "bg-red-900/30 text-red-300"
                      : "bg-green-900/30 text-green-300"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 text-white py-2 px-6 rounded-lg font-medium transition-all"
                >
                  {submitting ? "Updating..." : "Update User"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
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
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 px-4 text-center text-slate-400"
                    >
                      No users yet. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
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
                            user.isActive ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"
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
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
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
