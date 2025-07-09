"use client";

import { useState, useEffect } from "react";
import { Banner } from "../../components/ui/Banner";
import { Sidebar } from "../../components/Sidebar";

interface ObservationReason {
  id: string;
  name: string;
  description?: string;
  externalApiUrl?: string;
  apiConfiguration?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ObservationReasonsAdminPage() {
  const [observationReasons, setObservationReasons] = useState<
    ObservationReason[]
  >([]);
  const [newObservationReason, setNewObservationReason] = useState({
    name: "",
    description: "",
    externalApiUrl: "",
  });
  const [editingReason, setEditingReason] = useState<ObservationReason | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchObservationReasons();
  }, []);

  const fetchObservationReasons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/observation-reasons");
      if (response.ok) {
        const data = await response.json();
        setObservationReasons(data);
      } else {
        setError("Failed to fetch observation reasons");
      }
    } catch (error) {
      console.error("Error fetching observation reasons:", error);
      setError("Failed to fetch observation reasons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddObservationReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObservationReason.name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/observation-reasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newObservationReason.name.trim(),
          description: newObservationReason.description.trim() || undefined,
          externalApiUrl:
            newObservationReason.externalApiUrl.trim() || undefined,
        }),
      });

      if (response.ok) {
        setNewObservationReason({
          name: "",
          description: "",
          externalApiUrl: "",
        });
        fetchObservationReasons();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add observation reason");
      }
    } catch (error) {
      console.error("Error adding observation reason:", error);
      setError("Failed to add observation reason");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditObservationReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReason) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/observation-reasons/${editingReason.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingReason.name.trim(),
            description: editingReason.description?.trim() || undefined,
            externalApiUrl: editingReason.externalApiUrl?.trim() || undefined,
          }),
        },
      );

      if (response.ok) {
        setEditingReason(null);
        fetchObservationReasons();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update observation reason");
      }
    } catch (error) {
      console.error("Error updating observation reason:", error);
      setError("Failed to update observation reason");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteObservationReason = async (id: string) => {
    if (
      !confirm("Are you sure you want to deactivate this observation reason?")
    )
      return;

    try {
      const response = await fetch(`/api/observation-reasons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchObservationReasons();
      } else {
        setError("Failed to deactivate observation reason");
      }
    } catch (error) {
      console.error("Error deactivating observation reason:", error);
      setError("Failed to deactivate observation reason");
    }
  };

  const handleReactivateObservationReason = async (id: string) => {
    if (
      !confirm("Are you sure you want to reactivate this observation reason?")
    )
      return;

    try {
      const response = await fetch(`/api/observation-reasons/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: true }),
      });

      if (response.ok) {
        fetchObservationReasons();
      } else {
        setError("Failed to reactivate observation reason");
      }
    } catch (error) {
      console.error("Error reactivating observation reason:", error);
      setError("Failed to reactivate observation reason");
    }
  };

  const activeReasons = observationReasons.filter((reason) => reason.isActive);
  const inactiveReasons = observationReasons.filter(
    (reason) => !reason.isActive,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner
        title="Guardian Admin"
        subtitle="Observation Reasons Management"
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
                Observation Reasons Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage observation reasons used in the system
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

          {/* Add Observation Reason Form */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Observation Reason
            </h3>

            <form onSubmit={handleAddObservationReason}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observation Reason Name *
                  </label>
                  <input
                    type="text"
                    value={newObservationReason.name}
                    onChange={(e) =>
                      setNewObservationReason({
                        ...newObservationReason,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Performance Review"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newObservationReason.description}
                    onChange={(e) =>
                      setNewObservationReason({
                        ...newObservationReason,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Optional description"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External API URL
                    <span className="text-xs text-gray-500 ml-1">
                      (for future client integrations)
                    </span>
                  </label>
                  <input
                    type="url"
                    value={newObservationReason.externalApiUrl}
                    onChange={(e) =>
                      setNewObservationReason({
                        ...newObservationReason,
                        externalApiUrl: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="https://api.client.com/observations/performance"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newObservationReason.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Observation Reason"}
                </button>
              </div>
            </form>
          </div>

          {/* Edit Modal */}
          {editingReason && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  Edit Observation Reason
                </h3>
                <form onSubmit={handleEditObservationReason}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observation Reason Name *
                      </label>
                      <input
                        type="text"
                        value={editingReason.name}
                        onChange={(e) =>
                          setEditingReason({
                            ...editingReason,
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
                        value={editingReason.description || ""}
                        onChange={(e) =>
                          setEditingReason({
                            ...editingReason,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        External API URL
                        <span className="text-xs text-gray-500 ml-1">
                          (for future client integrations)
                        </span>
                      </label>
                      <input
                        type="url"
                        value={editingReason.externalApiUrl || ""}
                        onChange={(e) =>
                          setEditingReason({
                            ...editingReason,
                            externalApiUrl: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="https://api.client.com/observations/performance"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditingReason(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !editingReason.name.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Active Observation Reasons */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Active Observation Reasons
              </h3>
              <div className="text-sm text-gray-600">
                Active: {activeReasons.length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading observation reasons...
              </div>
            ) : activeReasons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active observation reasons configured yet
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
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          External API
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
                      {activeReasons.map((reason) => (
                        <tr key={reason.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {reason.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {reason.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {reason.externalApiUrl ? (
                              <a
                                href={reason.externalApiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline truncate block max-w-48"
                                title={reason.externalApiUrl}
                              >
                                {reason.externalApiUrl}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(reason.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingReason(reason)}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteObservationReason(reason.id)
                                }
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                              >
                                Deactivate
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

          {/* Inactive Observation Reasons */}
          {inactiveReasons.length > 0 && (
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Inactive Observation Reasons
                </h3>
                <div className="text-sm text-gray-600">
                  Inactive: {inactiveReasons.length}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Deactivated
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inactiveReasons.map((reason) => (
                        <tr
                          key={reason.id}
                          className="hover:bg-gray-50 opacity-75"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {reason.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {reason.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(reason.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() =>
                                handleReactivateObservationReason(reason.id)
                              }
                              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                            >
                              Reactivate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
