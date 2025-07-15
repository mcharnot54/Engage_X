"use client";

import { useState, useEffect } from "react";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface User {
  id: string;
  employeeId: string;
  name: string;
  email?: string;
  department?: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  organizationId?: number;
}

interface Organization {
  id: number;
  name: string;
  code: string;
}

interface UserRole {
  id: number;
  userid: string;
  roleid: string;
  organizationid?: number;
  createdat: string;
  users: User;
  roles: Role;
  organizations?: Organization;
}

export default function UserRolesAdminPage() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [filteredUserRoles, setFilteredUserRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterOrganization, setFilterOrganization] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [newUserRole, setNewUserRole] = useState({
    userId: "",
    roleId: "",
    organizationId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserRoles();
    fetchUsers();
    fetchRoles();
    fetchOrganizations();
  }, []);

  useEffect(() => {
    filterUserRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRoles, searchTerm, filterRole, filterOrganization]);

  const fetchUserRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/user-roles");
      if (response.ok) {
        const data = await response.json();
        setUserRoles(data);
      } else {
        setError("Failed to fetch user roles");
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
      setError("Failed to fetch user roles");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const filterUserRoles = () => {
    let filtered = userRoles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (userRole) =>
          userRole.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userRole.user.employeeId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          userRole.role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userRole.organization?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter(
        (userRole) => userRole.roleId.toString() === filterRole,
      );
    }

    // Organization filter
    if (filterOrganization !== "all") {
      filtered = filtered.filter(
        (userRole) =>
          userRole.organizationId?.toString() === filterOrganization,
      );
    }

    setFilteredUserRoles(filtered);
  };

  const handleAddUserRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserRole.userId || !newUserRole.roleId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/user-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: newUserRole.userId,
          roleId: parseInt(newUserRole.roleId),
          organizationId: newUserRole.organizationId
            ? parseInt(newUserRole.organizationId)
            : undefined,
        }),
      });

      if (response.ok) {
        setNewUserRole({ userId: "", roleId: "", organizationId: "" });
        setShowAddModal(false);
        fetchUserRoles();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to assign role to user");
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      setError("Failed to assign role to user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUserRole = async (id: number) => {
    try {
      const response = await fetch(`/api/user-roles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUserRoles();
        setShowDeleteConfirm(null);
      } else {
        throw new Error("Failed to remove user role");
      }
    } catch (error) {
      console.error("Error removing user role:", error);
      setError("Failed to remove user role");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Guardian Admin" subtitle="User Role Assignments" />

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
                User Role Assignments
              </h1>
              <p className="text-gray-600 mt-1">
                Manage which roles are assigned to users across organizations
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
                User Role Assignments
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                + Assign Role
              </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Search users, roles, or organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id.toString()}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterOrganization}
                  onChange={(e) => setFilterOrganization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Organizations</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id.toString()}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
              <div>
                Showing {filteredUserRoles.length} of {userRoles.length}{" "}
                assignments
              </div>
              <div className="flex space-x-4">
                <span>Total Users: {users.length}</span>
                <span>Total Roles: {roles.length}</span>
                <span>Organizations: {organizations.length}</span>
              </div>
            </div>

            {/* User Roles Table */}
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading user role assignments...
              </div>
            ) : filteredUserRoles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ||
                filterRole !== "all" ||
                filterOrganization !== "all"
                  ? "No assignments match your search criteria."
                  : "No user role assignments found. Assign roles to users to get started."}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Employee ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Organization
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Department
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Assigned Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUserRoles.map((userRole) => (
                        <tr key={userRole.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {userRole.user.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {userRole.user.employeeId}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {userRole.role.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {userRole.organization?.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {userRole.user.department || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(userRole.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => setShowDeleteConfirm(userRole.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Remove role assignment"
                            >
                              🗑️
                            </button>
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

      {/* Add User Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Assign Role to User
              </h2>
              <form onSubmit={handleAddUserRole}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User *
                    </label>
                    <select
                      value={newUserRole.userId}
                      onChange={(e) =>
                        setNewUserRole({
                          ...newUserRole,
                          userId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select a user</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={newUserRole.roleId}
                      onChange={(e) =>
                        setNewUserRole({
                          ...newUserRole,
                          roleId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id.toString()}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization (Optional)
                    </label>
                    <select
                      value={newUserRole.organizationId}
                      onChange={(e) =>
                        setNewUserRole({
                          ...newUserRole,
                          organizationId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">No specific organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id.toString()}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || !newUserRole.userId || !newUserRole.roleId
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Assigning..." : "Assign Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Remove Role Assignment
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this role assignment? This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUserRole(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
