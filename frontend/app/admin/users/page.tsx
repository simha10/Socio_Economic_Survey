"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import apiService from "@/services/api";
import { Plus, Trash2, Eye } from "lucide-react";

interface User {
  _id: string;
  username: string;
  name: string;
  role: "ADMIN" | "SUPERVISOR" | "SURVEYOR";
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    role: "SURVEYOR",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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

    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // This would call the backend API to list users
      // For now, showing empty list
      setUsers([]);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      // Call backend to create user
      // const response = await apiService.post('/admin/users', formData);
      // if (response.success) {
      //   setMessage('User created successfully');
      //   setFormData({ username: '', name: '', password: '', role: 'SURVEYOR' });
      //   setShowForm(false);
      //   loadUsers();
      // }
      setMessage("User creation endpoint coming soon");
    } catch (error: any) {
      setMessage(`Error: ${error.message || "Failed to create user"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="flex-1 w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                👥 User Management
              </h1>
              <p className="text-slate-400">Create and manage system users</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" /> Create User
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Create User Form */}
          {showForm && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                ➕ Create New User
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        setFormData({ ...formData, role: e.target.value })
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
                    className={`p-4 rounded-lg text-sm ${message.includes("Error") ? "bg-red-900/30 text-red-300" : "bg-green-900/30 text-green-300"}`}
                  >
                    {message}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 text-white py-2 px-6 rounded-lg font-medium transition-all"
                  >
                    {submitting ? "Creating..." : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-400"
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
                        <td className="px-6 py-4 text-sm text-white">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-300 transition-colors">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
