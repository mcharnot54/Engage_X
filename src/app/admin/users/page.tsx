"use client";

import { useState, useEffect, useCallback } from "react";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";
import { UserManagementModal } from "@/components/UserManagementModal";
import { ExternalSyncModal } from "@/components/ExternalSyncModal";

interface User {
  id: string;
  employeeId: string;
  employeeNumber?: string;
  name: string;
  email?: string;
  department?: string;
  departments?: string[];
  role?: string;
  roleId?: string;
  isActive: boolean;
  externalSource?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  organizationid?: number;
  facilityId?: number;
  departmentId?: number;
  areaId?: number;
  primaryRole?: {
    id: string;
    name: string;
    description?: string;
  };
  user_roles?: {
    id: number;
    roles: {
      id: string;
      name: string;
      description?: string;
    };
  }[];
  organization?: {
    id: number;
    name: string;
    code: string;
  };
  facility?: {
    id: number;
    name: string;
  };
  userDepartment?: {
    id: number;
    name: string;
  };
  area?: {
    id: number;
    name: string;
  };
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Active/Inactive filter
    if (filterActive !== "all") {
      filtered = filtered.filter((user) =>
        filterActive === "active" ? user.isActive : !user.isActive,
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterActive]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      let response;

      if (modalMode === "create") {
        response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      } else {
        response = await fetch(`/api/users/${selectedUser?.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      }

      if (response.ok) {
        // Clear modal state first
        setSelectedUser(null);
        setIsModalOpen(false);

        // Force a complete refresh of the data
        setRefreshKey((prev) => prev + 1);
        await fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save user");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUsers();
        setShowDeleteConfirm(null);
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user");
    }
  };

  const handleExternalSync = async () => {
    await fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Guardian Admin" subtitle="User Management" />

      <div className="flex flex-row h-full">
        <Sidebar
          title="Guardian Admin"
          sections={[
            {
              title: "User Management",
              items: [
                { label: "Users", href: "/admin/users" },
                { label: "Roles & Permissions", href: "/admin/roles" },
                { label: "User Role Assignments", href: "/admin/user-roles" },
                { label: "Observations", href: "/admin/observations" },
              ],
            },
            {
              title: "System Settings",
              items: [
                { label: "Organizations", href: "/admin/organizations" },
                { label: "Facilities", href: "/admin/facilities" },
                { label: "Departments", href: "/admin/departments" },
                { label: "Areas", href: "/admin/areas" },
              ],
            },
            {
              title: "Standards & Process",
              items: [
                { label: "Standards", href: "/admin/standards" },
                { label: "Delay Reasons", href: "/admin/delay-reasons" },
                {
                  label: "Observation Reasons",
                  href: "/admin/observation-reasons",
                },
              ],
            },
          ]}
        />

        <main className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-red-600">
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage system users, roles, and external integrations
              </p>
            </div>
            <a
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              ← Back to Admin
            </a>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
            {/* Header and Controls */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                System Users
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🔄 External Sync
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  + Add User
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users by name, employee ID, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select
                value={filterActive}
                onChange={(e) =>
                  setFilterActive(
                    e.target.value as "all" | "active" | "inactive",
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
              <div>
                Showing {filteredUsers.length} of {users.length} users
              </div>
              <div className="flex space-x-4">
                <span>Active: {users.filter((u) => u.isActive).length}</span>
                <span>Inactive: {users.filter((u) => !u.isActive).length}</span>
                <span>
                  External: {users.filter((u) => u.externalSource).length}
                </span>
              </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || filterActive !== "all"
                  ? "No users match your search criteria."
                  : "No users found. Add users manually or sync from external sources."}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Employee ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Employee #
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Department
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                          Primary Role
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                          Additional Roles
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                          Organization
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Source
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {user.employeeId}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.employeeNumber || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.email || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.department || "���"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.primaryRole ? (
                              <div className="flex flex-wrap gap-1">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {user.primaryRole.name} (Primary)
                                </span>
                                {user.user_roles && user.user_roles.length > 0 && (
                                  user.user_roles.map((userRole) => (
                                    <span
                                      key={userRole.id}
                                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                                    >
                                      {userRole.roles?.name} (Additional)
                                    </span>
                                  ))
                                )}
                              </div>
                            ) : user.user_roles && user.user_roles.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {user.user_roles.map((userRole) => (
                                  <span
                                    key={userRole.id}
                                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                                  >
                                    {userRole.roles?.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">
                                No roles assigned
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.organization ? (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {user.organization.name} (
                                {user.organization.code})
                              </span>
                            ) : (
                              <span className="text-red-500">
                                No Organization
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <span
                              className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                user.externalSource
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.externalSource === "active_directory"
                                ? "AD"
                                : user.externalSource === "sailpoint"
                                  ? "SP"
                                  : user.externalSource || "Manual"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit user"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(user.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete user"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        mode={modalMode}
      />

      {/* External Sync Modal */}
      <ExternalSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSync={handleExternalSync}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Delete User
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
