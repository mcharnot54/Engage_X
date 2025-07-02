"use client";

import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

export default function AdminPage() {
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
                { label: "Users" },
                { label: "Roles & Permissions" },
                { label: "Access Control" },
              ],
            },
            {
              title: "System Settings",
              items: [
                { label: "Organizations" },
                { label: "Facilities" },
                { label: "Departments" },
                { label: "Configuration" },
              ],
            },
            {
              title: "Maintenance",
              items: [
                { label: "System Logs" },
                { label: "Data Backup" },
                { label: "Database Tools" },
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
