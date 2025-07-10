"use client";

import { useState, useEffect } from "react";

// Force dynamic rendering to avoid SSG issues
export const dynamic = "force-dynamic";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface Department {
  id: number;
  name: string;
  facility: {
    name: string;
    organization: {
      name: string;
    };
  };
}

interface Area {
  id: number;
  name: string;
  departmentId: number;
  department: {
    id: number;
    name: string;
    facility: {
      name: string;
      organization: {
        name: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function AreasAdminPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newArea, setNewArea] = useState({
    name: "",
    departmentId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAreas();
    fetchDepartments();
  }, []);

  const fetchAreas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/areas");
      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      } else {
        setError("Failed to fetch areas");
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      setError("Failed to fetch areas");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea.name.trim() || !newArea.departmentId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/areas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newArea.name.trim(),
          departmentId: parseInt(newArea.departmentId),
        }),
      });

      if (response.ok) {
        setNewArea({ name: "", departmentId: "" });
        fetchAreas();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add area");
      }
    } catch (error) {
      console.error("Error adding area:", error);
      setError("Failed to add area");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArea = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this area? This will also delete all associated standards.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/areas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAreas();
      } else {
        setError("Failed to delete area");
      }
    } catch (error) {
      console.error("Error deleting area:", error);
      setError("Failed to delete area");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Guardian Admin" subtitle="Area Management" />

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
                Area Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage areas within departments
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

          {/* Add Area Form */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Area
            </h3>

            <form onSubmit={handleAddArea}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={newArea.departmentId}
                    onChange={(e) =>
                      setNewArea({
                        ...newArea,
                        departmentId: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.facility.organization.name} -{" "}
                        {department.facility.name} - {department.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area Name *
                  </label>
                  <input
                    type="text"
                    value={newArea.name}
                    onChange={(e) =>
                      setNewArea({
                        ...newArea,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Assembly Line A"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !newArea.name.trim() ||
                      !newArea.departmentId
                    }
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Adding..." : "Add Area"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Areas List */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Areas</h3>
              <div className="text-sm text-gray-600">
                Total Areas: {areas.length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading areas...
              </div>
            ) : areas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No areas configured yet
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
                          Department
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Facility
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Organization
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
                      {areas.map((area) => (
                        <tr key={area.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {area.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {area.department.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {area.department.facility.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {area.department.facility.organization.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(area.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleDeleteArea(area.id)}
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
