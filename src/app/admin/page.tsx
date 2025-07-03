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
}

export default function AdminPage() {
  const [delayReasons, setDelayReasons] = useState<DelayReason[]>([]);
  const [newDelayReason, setNewDelayReason] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDelayReasons();
  }, []);

  const fetchDelayReasons = async () => {
    try {
      const response = await fetch("/api/delay-reasons");
      if (response.ok) {
        const data = await response.json();
        setDelayReasons(data);
      }
    } catch (error) {
      console.error("Error fetching delay reasons:", error);
      setError("Failed to fetch delay reasons");
    }
  };

  const handleAddDelayReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelayReason.name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/delay-reasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDelayReason),
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
      setIsLoading(false);
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
  return (
    <div className="min-h-screen bg-gray-50">
      <Banner
        title="Guardian"
        subtitle="System Administration and Management"
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
            <h1 className="text-2xl font-semibold text-red-600">
              System Administration
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                User Management
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Users:</span>
                  <span className="font-semibold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Sessions:</span>
                  <span className="font-semibold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin Users:</span>
                  <span className="font-semibold">--</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Database Status:</span>
                  <span className="font-semibold text-green-600">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Server Status:</span>
                  <span className="font-semibold text-green-600">Running</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup:</span>
                  <span className="font-semibold">--</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-gray-50 transition-colors">
                  Add New User
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-gray-50 transition-colors">
                  System Backup
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-gray-50 transition-colors">
                  View Logs
                </button>
              </div>
            </div>
          </div>

          {/* Delay Reason Management */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Delay Reason Management
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAddDelayReason} className="mb-6">
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
                    disabled={isLoading || !newDelayReason.name.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Adding..." : "Add Delay Reason"}
                  </button>
                </div>
              </div>
            </form>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h4 className="font-medium">Active Delay Reasons</h4>
              </div>
              <div className="divide-y divide-gray-200">
                {delayReasons.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No delay reasons configured yet
                  </div>
                ) : (
                  delayReasons.map((reason) => (
                    <div
                      key={reason.id}
                      className="px-4 py-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{reason.name}</div>
                        {reason.description && (
                          <div className="text-sm text-gray-500">
                            {reason.description}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteDelayReason(reason.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Deactivate
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Recent Activity
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">
                    No recent admin activity
                  </span>
                  <span className="text-xs text-gray-400">--</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                System Configuration
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-semibold">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-semibold">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maintenance Mode:</span>
                  <span className="font-semibold text-red-600">Disabled</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
