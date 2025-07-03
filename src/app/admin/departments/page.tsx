"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface Facility {
  id: number;
  name: string;
  organization: {
    name: string;
  };
}

interface Department {
  id: number;
  name: string;
  facilityId: number;
  facility: {
    id: number;
    name: string;
    organization: {
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function DepartmentsAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    facilityId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
    fetchFacilities();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        setError("Failed to fetch departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to fetch departments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await fetch("/api/facilities");
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.name.trim() || !newDepartment.facilityId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDepartment.name.trim(),
          facilityId: parseInt(newDepartment.facilityId),
        }),
      });

      if (response.ok) {
        setNewDepartment({ name: "", facilityId: "" });
        fetchDepartments();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add department");
      }
    } catch (error) {
      console.error("Error adding department:", error);
      setError("Failed to add department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this department? This will also delete all associated areas.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDepartments();
      } else {
        setError("Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      setError("Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Guardian Admin" subtitle="Department Management" />

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
                Department Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage departments within facilities
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

          {/* Add Department Form */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Department
            </h3>

            <form onSubmit={handleAddDepartment}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility *
                  </label>
                  <select
                    value={newDepartment.facilityId}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        facilityId: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.organization.name} - {facility.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Manufacturing"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !newDepartment.name.trim() ||
                      !newDepartment.facilityId
                    }
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Adding..." : "Add Department"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Departments List */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Departments
              </h3>
              <div className="text-sm text-gray-600">
                Total Departments: {departments.length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading departments...
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No departments configured yet
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
                      {departments.map((department) => (
                        <tr key={department.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {department.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {department.facility.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {department.facility.organization.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(
                              department.createdAt,
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() =>
                                handleDeleteDepartment(department.id)
                              }
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
