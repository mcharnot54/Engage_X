"use client";

import { useState, useEffect } from "react";
import { Banner } from "../../components/ui/Banner";
import { Sidebar } from "../../components/Sidebar";

interface Organization {
  id: number;
  name: string;
  code: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  facilities: any[];
}

export default function OrganizationsAdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrganization, setNewOrganization] = useState({
    name: "",
    code: "",
    logo: "",
  });
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      } else {
        setError("Failed to fetch organizations");
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setError("Failed to fetch organizations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrganization.name.trim() || !newOrganization.code.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newOrganization.name.trim(),
          code: newOrganization.code.trim(),
          logo: newOrganization.logo.trim() || undefined,
        }),
      });

      if (response.ok) {
        setNewOrganization({ name: "", code: "", logo: "" });
        fetchOrganizations();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add organization");
      }
    } catch (error) {
      console.error("Error adding organization:", error);
      setError("Failed to add organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrganization) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizations/${editingOrganization.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingOrganization.name.trim(),
            code: editingOrganization.code.trim(),
            logo: editingOrganization.logo?.trim() || undefined,
          }),
        },
      );

      if (response.ok) {
        setEditingOrganization(null);
        fetchOrganizations();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update organization");
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      setError("Failed to update organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrganization = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this organization? This will also delete all associated facilities.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/organizations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchOrganizations();
      } else {
        setError("Failed to delete organization");
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      setError("Failed to delete organization");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Guardian Admin" subtitle="Organization Management" />

      <div className="flex flex-row h-full">
        <Sidebar
          title="Guardian Admin"
          sections={[
            {
              title: "User Management",
              items: [
                { label: "Users", href: "/admin/users" },
                { label: "Roles & Permissions", href: "/admin/roles" },
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
                Organization Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage organizations and their settings
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

          {/* Add Organization Form */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Organization
            </h3>

            <form onSubmit={handleAddOrganization}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={newOrganization.name}
                    onChange={(e) =>
                      setNewOrganization({
                        ...newOrganization,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Acme Corporation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Code *
                  </label>
                  <input
                    type="text"
                    value={newOrganization.code}
                    onChange={(e) =>
                      setNewOrganization({
                        ...newOrganization,
                        code: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., ACME"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newOrganization.logo}
                    onChange={(e) =>
                      setNewOrganization({
                        ...newOrganization,
                        logo: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !newOrganization.name.trim() ||
                      !newOrganization.code.trim()
                    }
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Adding..." : "Add Organization"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Edit Modal */}
          {editingOrganization && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  Edit Organization
                </h3>
                <form onSubmit={handleEditOrganization}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        value={editingOrganization.name}
                        onChange={(e) =>
                          setEditingOrganization({
                            ...editingOrganization,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Code *
                      </label>
                      <input
                        type="text"
                        value={editingOrganization.code}
                        onChange={(e) =>
                          setEditingOrganization({
                            ...editingOrganization,
                            code: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={editingOrganization.logo || ""}
                        onChange={(e) =>
                          setEditingOrganization({
                            ...editingOrganization,
                            logo: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditingOrganization(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !editingOrganization.name.trim() ||
                        !editingOrganization.code.trim()
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Organizations List */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Organizations
              </h3>
              <div className="text-sm text-gray-600">
                Total Organizations: {organizations.length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading organizations...
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No organizations configured yet
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Facilities
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
                      {organizations.map((org) => (
                        <tr key={org.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {org.logo && (
                                <img
                                  src={org.logo}
                                  alt={`${org.name} logo`}
                                  className="w-8 h-8 rounded mr-3 object-cover"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {org.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {org.code}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {org.facilities?.length || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(org.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingOrganization(org)}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteOrganization(org.id)}
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
