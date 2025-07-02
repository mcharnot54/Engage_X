"use client";

import { useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

export default function ReportingPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Insight" subtitle="Analytics and Reporting Dashboard" />

      <div className="flex flex-row h-full">
        <div
          className="bg-white border-r border-gray-300 transition-all duration-300 flex flex-col justify-between relative shadow-md"
          style={{
            width: isSidebarCollapsed ? "80px" : "300px",
            padding: isSidebarCollapsed ? "24px 12px" : "24px",
          }}
        >
          <div>
            <div
              className="flex items-center gap-3 mb-8"
              style={{
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
              }}
            >
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-gray-300 bg-white cursor-pointer flex items-center justify-center transition-transform duration-300"
                style={{
                  transform: isSidebarCollapsed
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 2L4 8L10 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <span
                className="text-xl font-semibold"
                style={{ display: isSidebarCollapsed ? "none" : "block" }}
              >
                Insight Reporting
              </span>
            </div>

            {!isSidebarCollapsed && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <h3 className="font-semibold mb-2">Reports</h3>
                  <ul className="space-y-2">
                    <li className="cursor-pointer hover:text-red-600 transition-colors">
                      Performance Analytics
                    </li>
                    <li className="cursor-pointer hover:text-red-600 transition-colors">
                      Standards Compliance
                    </li>
                    <li className="cursor-pointer hover:text-red-600 transition-colors">
                      Observation Trends
                    </li>
                    <li className="cursor-pointer hover:text-red-600 transition-colors">
                      Department Metrics
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <main className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-red-600">
              Reporting Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Performance Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Observations:</span>
                  <span className="font-semibold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Performance:</span>
                  <span className="font-semibold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Standards Reviewed:</span>
                  <span className="font-semibold">--</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Recent Activity
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>No recent activity to display</p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-gray-50 transition-colors">
                  Generate Report
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-gray-50 transition-colors">
                  Export Data
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-gray-50 transition-colors">
                  Schedule Report
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Detailed Analytics
            </h3>
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Analytics Dashboard</p>
              <p>Charts and detailed reports will be displayed here</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
