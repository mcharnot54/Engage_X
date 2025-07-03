"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface Standard {
  id: number;
  name: string;
  facilityId: number;
  departmentId: number;
  areaId: number;
  version: number;
  isActive: boolean;
  isCurrentVersion: boolean;
  bestPractices: string[];
  processOpportunities: string[];
  createdAt: string;
  updatedAt: string;
  facility: {
    name: string;
    organization: {
      name: string;
    };
  };
  department: {
    name: string;
  };
  area: {
    name: string;
  };
  uomEntries: {
    id: number;
    uom: string;
    description: string;
    samValue: number;
    tags: string[];
  }[];
}

export default function StandardsAdminPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/standards");
      if (response.ok) {
        const data = await response.json();
        setStandards(data);
      } else {
        setError("Failed to fetch standards");
      }
    } catch (error) {
      console.error("Error fetching standards:", error);
      setError("Failed to fetch standards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateStandard = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this standard?")) return;

    try {
      const response = await fetch(`/api/standards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (response.ok) {
        fetchStandards();
      } else {
        setError("Failed to deactivate standard");
      }
    } catch (error) {
      console.error("Error deactivating standard:", error);
      setError("Failed to deactivate standard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Guardian Admin" subtitle="Standards Management" />

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
                Standards Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage work standards and their specifications
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/standards"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Standard
              </a>
              <a
                href="/admin"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                ← Back to Admin
              </a>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Standards List */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Active Standards
              </h3>
              <div className="text-sm text-gray-600">
                Total Standards: {standards.length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading standards...
              </div>
            ) : standards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No standards found.</p>
                <a
                  href="/standards"
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create First Standard
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Standard
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Version
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          UOM Entries
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Status
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
                      {standards.map((standard) => (
                        <tr key={standard.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {standard.name}
                              </div>
                              {standard.bestPractices.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {standard.bestPractices.length} best practices
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div>
                              <div>{standard.facility.organization.name}</div>
                              <div className="text-xs">
                                {standard.facility.name} -{" "}
                                {standard.department.name} -{" "}
                                {standard.area.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="mr-1">v{standard.version}</span>
                              {standard.isCurrentVersion && (
                                <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {standard.uomEntries.length}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                standard.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {standard.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(standard.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <a
                                href={`/standards?edit=${standard.id}`}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                Edit
                              </a>
                              {standard.isActive && (
                                <button
                                  onClick={() =>
                                    handleDeactivateStandard(standard.id)
                                  }
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  Deactivate
                                </button>
                              )}
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
