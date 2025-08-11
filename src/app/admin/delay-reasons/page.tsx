"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface DelayReason {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DelayReasonsAdminPage() {
  const [delayReasons, setDelayReasons] = useState<DelayReason[]>([]);
  const [newDelayReason, setNewDelayReason] = useState({
    name: "",
    description: "",
  });
  const [editingReason, setEditingReason] = useState<DelayReason | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDelayReasons();
  }, []);

  const fetchDelayReasons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/delay-reasons");
      if (response.ok) {
        const data = await response.json();
        setDelayReasons(data);
      } else {
        setError("Failed to fetch delay reasons");
      }
    } catch (error) {
      console.error("Error fetching delay reasons:", error);
      setError("Failed to fetch delay reasons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDelayReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelayReason.name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/delay-reasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDelayReason.name.trim(),
          description: newDelayReason.description.trim() || undefined,
        }),
      });

      if (response.ok) {
        setNewDelayReason({ name: "", description: "" });
        fetchDelayReasons();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add delay reason");
      }
    } catch (error) {
      console.error("Error adding delay reason:", error);
      setError("Failed to add delay reason");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDelayReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReason) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/delay-reasons/${editingReason.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingReason.name.trim(),
          description: editingReason.description?.trim() || undefined,
        }),
      });

      if (response.ok) {
        setEditingReason(null);
        fetchDelayReasons();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update delay reason");
      }
    } catch (error) {
      console.error("Error updating delay reason:", error);
      setError("Failed to update delay reason");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDelayReason = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this delay reason?"))
      return;

    try {
      const response = await fetch(`/api/delay-reasons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDelayReasons();
      } else {
        setError("Failed to deactivate delay reason");
      }
    } catch (error) {
      console.error("Error deactivating delay reason:", error);
      setError("Failed to deactivate delay reason");
    }
  };

  const handleReactivateDelayReason = async (id: string) => {
    if (!confirm("Are you sure you want to reactivate this delay reason?"))
      return;

    try {
      const response = await fetch(`/api/delay-reasons/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: true }),
      });

      if (response.ok) {
        fetchDelayReasons();
      } else {
        setError("Failed to reactivate delay reason");
      }
    } catch (error) {
      console.error("Error reactivating delay reason:", error);
      setError("Failed to reactivate delay reason");
    }
  };

  const activeReasons = delayReasons.filter((reason) => reason.isActive);
  const inactiveReasons = delayReasons.filter((reason) => !reason.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Guardian Admin" subtitle="Delay Reasons Management" />

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
                Delay Reasons Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage delay reasons used in observations
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

          {/* Add Delay Reason Form */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Delay Reason
            </h3>

            <form onSubmit={handleAddDelayReason}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delay Reason Name *
                  </label>
                  <input
                    type="text"
                    value={newDelayReason.name}
                    onChange={(e) =>
                      setNewDelayReason({
                        ...newDelayReason,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Equipment Failure"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newDelayReason.description}
                    onChange={(e) =>
                      setNewDelayReason({
                        ...newDelayReason,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newDelayReason.name.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Adding..." : "Add Delay Reason"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Edit Modal */}
          {editingReason && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  Edit Delay Reason
                </h3>
                <form onSubmit={handleEditDelayReason}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delay Reason Name *
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

          {/* Active Delay Reasons */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Active Delay Reasons
              </h3>
              <div className="text-sm text-gray-600">
                Active: {activeReasons.length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading delay reasons...
              </div>
            ) : activeReasons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active delay reasons configured yet
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
                                  handleDeleteDelayReason(reason.id)
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

          {/* Inactive Delay Reasons */}
          {inactiveReasons.length > 0 && (
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Inactive Delay Reasons
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
                                handleReactivateDelayReason(reason.id)
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
