"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
  action: string;
}

interface RolePermission {
  id: string;
  permissionId: string;
  permission: Permission;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  rolePermissions: RolePermission[];
  _count?: {
    user_roles: number;
  };
}

export default function RolesAdminPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
  });
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        setError("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError("Failed to fetch roles");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/permissions");
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      } else {
        console.error("Failed to fetch permissions:", response.statusText);
        setError("Failed to load permissions. Please refresh the page.");
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setError("Failed to load permissions. Please check your connection.");
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRole.name.trim(),
          description: newRole.description.trim() || undefined,
          permissionIds: selectedPermissions,
        }),
      });

      if (response.ok) {
        setNewRole({ name: "", description: "" });
        setSelectedPermissions([]);
        fetchRoles();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add role");
      }
    } catch (error) {
      console.error("Error adding role:", error);
      setError("Failed to add role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingRole.name.trim(),
          description: editingRole.description?.trim() || undefined,
          permissionIds: selectedPermissions,
        }),
      });

      if (response.ok) {
        setEditingRole(null);
        setSelectedPermissions([]);
        fetchRoles();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this role? Users with this role will need to be reassigned.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/roles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRoles();
      } else {
        setError("Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      setError("Failed to delete role");
    }
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.rolePermissions.map((rp) => rp.permissionId));
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const groupPermissionsByModule = (permissions: Permission[]) => {
    return permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );
  };

  const activeRoles = roles.filter((role) => role.isActive !== false);
  const groupedPermissions = groupPermissionsByModule(permissions);

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner
        title="Guardian Admin"
        subtitle="Roles & Permissions Management"
      />

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

        <main className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-red-600">
                Roles & Permissions Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage user roles and their permissions for system access
                control
              </p>
            </div>
            <a
              href="/admin"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ← Back to Admin
            </a>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-r-lg mb-6 shadow-sm">
              <div className="flex items-center">
                <span className="text-red-500 mr-3">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Page Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 inline-flex">
            <div className="px-4 py-2 bg-white text-gray-900 rounded-md shadow-sm font-medium">
              Role Management
            </div>
            <a
              href="/admin/user-roles"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-md font-medium transition-colors"
            >
              User Assignments
            </a>
          </div>

          {/* Create New Role Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                Create New Role
              </h3>
              <p className="text-blue-100 mt-1">
                Define a new role with specific permissions
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddRole}>
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📝</span> Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        value={newRole.name}
                        onChange={(e) =>
                          setNewRole({
                            ...newRole,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Site Administrator"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newRole.description}
                        onChange={(e) =>
                          setNewRole({
                            ...newRole,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Optional description"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions Selection */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🔒</span> Permissions Assignment
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Select the permissions this role should have access to
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedPermissions).map(
                      ([module, modulePermissions]) => (
                        <div
                          key={module}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <h5 className="font-semibold text-gray-800 mb-3 capitalize flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {module}
                          </h5>
                          <div className="space-y-2">
                            {modulePermissions.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-center hover:bg-gray-50 p-1 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(
                                    permission.id,
                                  )}
                                  onChange={() =>
                                    togglePermission(permission.id)
                                  }
                                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm capitalize font-medium">
                                  {permission.action}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Selected Permissions:{" "}
                    <span className="font-semibold text-blue-600">
                      {selectedPermissions.length}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setNewRole({ name: "", description: "" });
                        setSelectedPermissions([]);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newRole.name.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <span>➕</span>
                          Create Role
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Edit Modal */}
          {editingRole && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Edit Role</h3>
                <form onSubmit={handleEditRole}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        value={editingRole.name}
                        onChange={(e) =>
                          setEditingRole({
                            ...editingRole,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={editingRole.description || ""}
                        onChange={(e) =>
                          setEditingRole({
                            ...editingRole,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  {/* Permissions Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(groupedPermissions).map(
                        ([module, modulePermissions]) => (
                          <div
                            key={module}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <h4 className="font-medium text-gray-800 mb-2 capitalize">
                              {module}
                            </h4>
                            <div className="space-y-2">
                              {modulePermissions.map((permission) => (
                                <label
                                  key={permission.id}
                                  className="flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(
                                      permission.id,
                                    )}
                                    onChange={() =>
                                      togglePermission(permission.id)
                                    }
                                    className="mr-2"
                                  />
                                  <span className="text-sm capitalize">
                                    {permission.action}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRole(null);
                        setSelectedPermissions([]);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !editingRole.name.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Existing Roles Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    Existing Roles
                  </h3>
                  <p className="text-green-100 mt-1">
                    Manage and monitor current system roles
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{activeRoles.length}</div>
                  <div className="text-green-100 text-sm">Active Roles</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading roles...
                </div>
              ) : activeRoles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active roles configured yet
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Role Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Permissions
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Users
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Created
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {activeRoles.map((role) => (
                          <tr key={role.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {role.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {role.description || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {role.rolePermissions.length} permissions
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {role._count?.user_roles || 0} users
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(role.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditModal(role)}
                                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                >
                                  🗑️ Delete
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
          </div>
        </main>
      </div>
    </div>
  );
}
