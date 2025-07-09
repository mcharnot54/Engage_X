"use client";

import { Suspense, useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import DashboardContent from "../../components/DashboardContent";
import { Banner } from "../../components/ui/Banner";
import { Sidebar } from "../../components/Sidebar";

export default function DashboardPage() {
  const user = useUser();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Allow dashboard to show regardless of auth status for demo purposes
    setShowDashboard(true);
  }, []);

  if (!showDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins text-black bg-gray-100 min-h-screen overflow-x-hidden">
      <Banner
        title="Dashboard"
        subtitle="Performance guidance and observation management system"
      />
      <div className="flex flex-col max-w-7xl mx-auto bg-gray-100 min-h-[calc(100vh-80px)] rounded-xl border border-gray-300 mt-5 p-5 overflow-y-auto">
        <div className="flex flex-row h-full">
          <Sidebar
            showLogo={true}
            applications={[
              "Labor.X",
              "Clock.X",
              "Engage.X",
              "Staff.X",
              "Dash.X",
              "Report.X",
              "Incent.X",
              "Perform.X",
              "Plan.X",
            ]}
            showUserProfile={true}
          />

          <main className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0">
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardContent />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 m-6 mb-4"></div>
        <div className="space-y-3 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
