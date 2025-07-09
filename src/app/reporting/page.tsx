"use client";

import { useState } from "react";
import { Banner } from "../components/ui/Banner";
import { Sidebar } from "../components/Sidebar";

export default function ReportingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Insight" subtitle="Analytics and Reporting Dashboard" />

      <div className="flex flex-row h-full">
        <Sidebar
          title="Insight Reporting"
          sections={[
            {
              title: "Reports",
              items: [
                { label: "Performance Analytics" },
                { label: "Standards Compliance" },
                { label: "Observation Trends" },
                { label: "Department Metrics" },
              ],
            },
          ]}
        />

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
