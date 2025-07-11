"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

interface RolePermission {
  id: number;
  permissionId: number;
  permission: Permission;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  rolePermissions: RolePermission[];
  _count?: {
    userRoles: number;
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
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
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
    setSelectedPermissions(
      role.permissions.filter((rp) => rp.granted).map((rp) => rp.permissionId),
    );
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

  const activeRoles = roles.filter((role) => role.isActive);
  const inactiveRoles = roles.filter((role) => !role.isActive);
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

        <main className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-red-600">
                Roles & Permissions Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage user roles and their permissions for system access
                control
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

          {/* Add Role Form */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Role
            </h3>

            <form onSubmit={handleAddRole}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Site Administrator"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Optional description"
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
                                onChange={() => togglePermission(permission.id)}
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

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newRole.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Role"}
                </button>
              </div>
            </form>
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

          {/* Active Roles */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Active Roles
              </h3>
              <div className="text-sm text-gray-600">
                Active: {activeRoles.length}
              </div>
            </div>

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
                            {role.permissions.filter((rp) => rp.granted).length}{" "}
                            permissions
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {role._count?.users || 0} users
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(role.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(role)}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRole(role.id)}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                              >
                                Delete
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
    </div>
  );
}
