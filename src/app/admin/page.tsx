"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface SystemStats {
  totalUsers: number;
  activeSessions: number;
  adminUsers: number;
}

export default function AdminPage() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeSessions: 0,
    adminUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const users = await response.json();
        setSystemStats({
          totalUsers: users.length,
          activeSessions: users.filter((user: any) => user.isActive).length,
          adminUsers: users.filter((user: any) =>
            user.userRole?.name?.toLowerCase().includes("admin"),
          ).length,
        });
      }
    } catch (error) {
      console.error("Error fetching system stats:", error);
    } finally {
      setIsLoading(false);
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
            <div
              className="bg-gray-100 rounded-lg p-6 border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => router.push("/admin/users")}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                User Management
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Users:</span>
                  <span className="font-semibold">
                    {isLoading ? "Loading..." : systemStats.totalUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users:</span>
                  <span className="font-semibold">
                    {isLoading ? "Loading..." : systemStats.activeSessions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin Users:</span>
                  <span className="font-semibold">
                    {isLoading ? "Loading..." : systemStats.adminUsers}
                  </span>
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-600 hover:text-blue-800">
                Click to manage users →
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
                  <span className="font-semibold">Today</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/admin/users")}
                  className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Add New User
                </button>
                <button
                  onClick={() => router.push("/admin/standards")}
                  className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Manage Standards
                </button>
                <button
                  onClick={() => router.push("/admin/organizations")}
                  className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  View Organizations
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div
              className="bg-gray-100 rounded-lg p-6 border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => router.push("/admin/organizations")}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Organizations & Facilities
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-600">
                  Manage organizational structure
                </div>
                <div className="text-blue-600 hover:text-blue-800">
                  → View Organizations
                </div>
                <div className="text-blue-600 hover:text-blue-800">
                  → Manage Facilities
                </div>
              </div>
            </div>

            <div
              className="bg-gray-100 rounded-lg p-6 border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => router.push("/admin/standards")}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Standards & Processes
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-600">Configure system standards</div>
                <div className="text-blue-600 hover:text-blue-800">
                  → Manage Standards
                </div>
                <div className="text-blue-600 hover:text-blue-800">
                  → Observation Reasons
                </div>
              </div>
            </div>

            <div
              className="bg-gray-100 rounded-lg p-6 border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => router.push("/admin/roles")}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Roles & Permissions
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-600">Manage user access control</div>
                <div className="text-blue-600 hover:text-blue-800">
                  → Manage Roles
                </div>
                <div className="text-blue-600 hover:text-blue-800">
                  → View Permissions
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="bg-gray-100 rounded-lg p-6 border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => router.push("/admin/observations")}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Recent Activity
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">
                    View recent observations and activities
                  </span>
                </div>
                <div className="text-blue-600 hover:text-blue-800">
                  Click to view observations →
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
