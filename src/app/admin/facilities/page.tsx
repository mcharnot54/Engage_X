"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface Organization {
  id: number;
  name: string;
  code: string;
}

interface Facility {
  id: number;
  name: string;
  ref?: string;
  city?: string;
  organizationId: number;
  organization: Organization;
  createdAt: string;
  updatedAt: string;
}

export default function FacilitiesAdminPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newFacility, setNewFacility] = useState({
    name: "",
    ref: "",
    city: "",
    organizationId: "",
  });
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFacilities();
    fetchOrganizations();
  }, []);

  const fetchFacilities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/facilities");
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
      } else {
        setError("Failed to fetch facilities");
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
      setError("Failed to fetch facilities");
    } finally {
      setIsLoading(false);
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

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacility.name.trim() || !newFacility.organizationId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/facilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFacility.name.trim(),
          ref: newFacility.ref.trim() || undefined,
          city: newFacility.city.trim() || undefined,
          organizationId: parseInt(newFacility.organizationId),
        }),
      });

      if (response.ok) {
        setNewFacility({ name: "", ref: "", city: "", organizationId: "" });
        fetchFacilities();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add facility");
      }
    } catch (error) {
      console.error("Error adding facility:", error);
      setError("Failed to add facility");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/facilities/${editingFacility.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingFacility.name.trim(),
          ref: editingFacility.ref?.trim() || undefined,
          city: editingFacility.city?.trim() || undefined,
          organizationId: editingFacility.organizationId,
        }),
      });

      if (response.ok) {
        setEditingFacility(null);
        fetchFacilities();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update facility");
      }
    } catch (error) {
      console.error("Error updating facility:", error);
      setError("Failed to update facility");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFacility = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this facility? This will also delete all associated departments.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/facilities/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFacilities();
      } else {
        setError("Failed to delete facility");
      }
    } catch (error) {
      console.error("Error deleting facility:", error);
      setError("Failed to delete facility");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Guardian Admin" subtitle="Facility Management" />

      <div className="flex flex-row h-full">
        <Sidebar
          title="Guardian Admin"
          sections={[
            {
              title: "User Management",
              items: [
                { label: "Users", href: "/admin/users" },
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
              ],
            },
          ]}
        />

        <main className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-red-600">
                Facility Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage facilities within organizations
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

          {/* Add Facility Form */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Facility
            </h3>

            <form onSubmit={handleAddFacility}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization *
                  </label>
                  <select
                    value={newFacility.organizationId}
                    onChange={(e) =>
                      setNewFacility({
                        ...newFacility,
                        organizationId: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    value={newFacility.name}
                    onChange={(e) =>
                      setNewFacility({
                        ...newFacility,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Main Plant"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Code
                  </label>
                  <input
                    type="text"
                    value={newFacility.ref}
                    onChange={(e) =>
                      setNewFacility({
                        ...newFacility,
                        ref: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., MP001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newFacility.city}
                    onChange={(e) =>
                      setNewFacility({
                        ...newFacility,
                        city: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., New York"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !newFacility.name.trim() ||
                      !newFacility.organizationId
                    }
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Adding..." : "Add Facility"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Facilities List */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Facilities
              </h3>
              <div className="text-sm text-gray-600">
                Total Facilities: {facilities.length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading facilities...
              </div>
            ) : facilities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No facilities configured yet
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
                          Organization
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Reference
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          City
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
                      {facilities.map((facility) => (
                        <tr key={facility.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {facility.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {facility.organization.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {facility.ref ? (
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {facility.ref}
                              </code>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {facility.city || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(facility.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleDeleteFacility(facility.id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                            >
                              Delete
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
    </div>
  );
}
