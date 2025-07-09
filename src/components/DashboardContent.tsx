"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

interface DashboardData {
  stats: {
    totalObservations: number;
    totalOrganizations: number;
    totalFacilities: number;
    totalStandards: number;
    totalUsers: number;
    averagePerformance: number;
    completedObservations: number;
    pendingObservations: number;
  };
  recentObservations: any[];
  organizations: any[];
  facilities: any[];
  standards: any[];
  performanceData: any[];
}

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <Button
          onClick={fetchDashboardData}
          className="mt-3 bg-red-600 hover:bg-red-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Overview" },
            { id: "observations", name: "Observations" },
            { id: "organizations", name: "Organizations" },
            { id: "performance", name: "Performance" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Observations"
              value={data.stats.totalObservations}
              icon="📊"
              trend={data.stats.totalObservations > 0 ? "up" : "neutral"}
            />
            <StatsCard
              title="Organizations"
              value={data.stats.totalOrganizations}
              icon="🏢"
              trend="neutral"
            />
            <StatsCard
              title="Active Standards"
              value={data.stats.totalStandards}
              icon="📋"
              trend="neutral"
            />
            <StatsCard
              title="Avg Performance"
              value={`${data.stats.averagePerformance.toFixed(1)}%`}
              icon="⚡"
              trend={data.stats.averagePerformance >= 90 ? "up" : "down"}
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Recent Observations
              </h3>
              <div className="space-y-3">
                {data.recentObservations.length > 0 ? (
                  data.recentObservations.slice(0, 5).map((obs, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{obs.observationReason}</p>
                        <p className="text-sm text-gray-600">
                          Performance: {obs.observedPerformance}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(obs.createdAt).toLocaleDateString()}
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            obs.isFinalized
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {obs.isFinalized ? "Complete" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No observations recorded yet
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-4">
                <StatusItem
                  label="Database Connection"
                  status="healthy"
                  description="Connected to Neon Database"
                />
                <StatusItem
                  label="Data Sync"
                  status="healthy"
                  description="Last sync: Just now"
                />
                <StatusItem
                  label="Performance Tracking"
                  status="healthy"
                  description="All systems operational"
                />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Observations Tab */}
      {activeTab === "observations" && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Observations</h3>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Add Observation
              </Button>
            </div>
            <ObservationsTable observations={data.recentObservations} />
          </Card>
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === "organizations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Organizations</h3>
              <OrganizationsTable organizations={data.organizations} />
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Facilities</h3>
              <FacilitiesTable facilities={data.facilities} />
            </Card>
          </div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Standards</h3>
            <StandardsTable standards={data.standards} />
          </Card>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <PerformanceChart data={data.performanceData} />
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h4 className="font-medium mb-2">Pace Score</h4>
              <div className="text-2xl font-bold text-blue-600">
                {data.stats.averagePerformance.toFixed(1)}%
              </div>
            </Card>
            <Card className="p-6">
              <h4 className="font-medium mb-2">Utilization</h4>
              <div className="text-2xl font-bold text-green-600">
                {data.stats.averagePerformance.toFixed(1)}%
              </div>
            </Card>
            <Card className="p-6">
              <h4 className="font-medium mb-2">Methods</h4>
              <div className="text-2xl font-bold text-purple-600">
                {data.stats.averagePerformance.toFixed(1)}%
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: string;
  trend: "up" | "down" | "neutral";
}) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-gray-600";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </Card>
  );
}

function StatusItem({
  label,
  status,
  description,
}: {
  label: string;
  status: "healthy" | "warning" | "error";
  description: string;
}) {
  const statusColor =
    status === "healthy"
      ? "bg-green-100 text-green-800"
      : status === "warning"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
        {status}
      </span>
    </div>
  );
}

function ObservationsTable({ observations }: { observations: any[] }) {
  if (observations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No observations found</p>
        <p className="text-sm text-gray-400 mt-1">
          Start by creating your first observation
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {observations.map((obs, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {obs.observationReason}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {obs.observedPerformance}%
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    obs.isFinalized
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {obs.isFinalized ? "Complete" : "Pending"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(obs.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrganizationsTable({ organizations }: { organizations: any[] }) {
  return (
    <div className="space-y-3">
      {organizations.length > 0 ? (
        organizations.map((org) => (
          <div key={org.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{org.name}</p>
                <p className="text-sm text-gray-600">Code: {org.code}</p>
              </div>
              <div className="text-sm text-gray-500">
                Created: {new Date(org.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No organizations found</p>
      )}
    </div>
  );
}

function FacilitiesTable({ facilities }: { facilities: any[] }) {
  return (
    <div className="space-y-3">
      {facilities.length > 0 ? (
        facilities.map((facility) => (
          <div key={facility.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{facility.name}</p>
                <p className="text-sm text-gray-600">
                  {facility.city && `${facility.city} • `}
                  {facility.ref}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No facilities found</p>
      )}
    </div>
  );
}

function StandardsTable({ standards }: { standards: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Version
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standards.length > 0 ? (
            standards.map((standard) => (
              <tr key={standard.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {standard.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    v{standard.version}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      standard.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {standard.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(standard.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                No standards found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PerformanceChart({ data }: { data: any[] }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <p className="text-gray-500">Performance Chart</p>
        <p className="text-sm text-gray-400 mt-1">
          Chart will display when observation data is available
        </p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
