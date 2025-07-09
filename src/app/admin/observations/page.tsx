"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface Observation {
  id: string;
  observationReason: string;
  timeObserved: number;
  totalSams: number;
  observedPerformance: number;
  pumpScore: number;
  pace: number;
  utilization: number;
  methods: number;
  isFinalized: boolean;
  comments?: string;
  aiNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    employeeId: string;
  };
  standard: {
    id: number;
    name: string;
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
  };
  observationData: {
    id: string;
    uom: string;
    description: string;
    quantity: number;
    samValue: number;
    totalSams: number;
  }[];
}

export default function ObservationsAdminPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedObservation, setSelectedObservation] =
    useState<Observation | null>(null);

  useEffect(() => {
    fetchObservations();
  }, []);

  const fetchObservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/observations");
      if (response.ok) {
        const data = await response.json();
        setObservations(data);
      } else {
        setError("Failed to fetch observations");
      }
    } catch (error) {
      console.error("Error fetching observations:", error);
      setError("Failed to fetch observations");
    } finally {
      setIsLoading(false);
    }
  };

  const finalizedObservations = observations.filter((obs) => obs.isFinalized);
  const draftObservations = observations.filter((obs) => !obs.isFinalized);

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Guardian Admin" subtitle="Observations Management" />

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
                Observations Management
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage all system observations
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/observation-form"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                New Observation
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Total Observations
              </h3>
              <div className="text-3xl font-bold text-blue-600">
                {observations.length}
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Finalized
              </h3>
              <div className="text-3xl font-bold text-green-600">
                {finalizedObservations.length}
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Draft
              </h3>
              <div className="text-3xl font-bold text-orange-600">
                {draftObservations.length}
              </div>
            </div>
          </div>

          {/* Observations List */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                All Observations
              </h3>
              <div className="text-sm text-gray-600">
                Total: {observations.length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading observations...
              </div>
            ) : observations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No observations found.</p>
                <a
                  href="/observation-form"
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create First Observation
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Observer
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Standard
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Performance
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
                      {observations.map((observation) => (
                        <tr key={observation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {observation.user.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {observation.user.employeeId}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {observation.standard.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div>
                              <div>
                                {
                                  observation.standard.facility.organization
                                    .name
                                }
                              </div>
                              <div className="text-xs">
                                {observation.standard.facility.name} -{" "}
                                {observation.standard.department.name} -{" "}
                                {observation.standard.area.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div>
                              <div className="font-medium">
                                {observation.observedPerformance.toFixed(1)}%
                              </div>
                              <div className="text-xs">
                                Pump: {observation.pumpScore.toFixed(1)}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                observation.isFinalized
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {observation.isFinalized ? "Finalized" : "Draft"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(
                              observation.createdAt,
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() =>
                                setSelectedObservation(observation)
                              }
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              View Details
                            </button>
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

      {/* Observation Detail Modal */}
      {selectedObservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Observation Details
                </h2>
                <button
                  onClick={() => setSelectedObservation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Observation Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Observer:</strong> {selectedObservation.user.name}{" "}
                      ({selectedObservation.user.employeeId})
                    </div>
                    <div>
                      <strong>Standard:</strong>{" "}
                      {selectedObservation.standard.name}
                    </div>
                    <div>
                      <strong>Reason:</strong>{" "}
                      {selectedObservation.observationReason}
                    </div>
                    <div>
                      <strong>Time Observed:</strong>{" "}
                      {selectedObservation.timeObserved} minutes
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <span
                        className={`ml-1 px-2 py-1 text-xs rounded ${
                          selectedObservation.isFinalized
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {selectedObservation.isFinalized
                          ? "Finalized"
                          : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Performance Metrics
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Observed Performance:</strong>{" "}
                      {selectedObservation.observedPerformance.toFixed(1)}%
                    </div>
                    <div>
                      <strong>Pump Score:</strong>{" "}
                      {selectedObservation.pumpScore.toFixed(1)}
                    </div>
                    <div>
                      <strong>Pace:</strong> {selectedObservation.pace}%
                    </div>
                    <div>
                      <strong>Utilization:</strong>{" "}
                      {selectedObservation.utilization}%
                    </div>
                    <div>
                      <strong>Methods:</strong> {selectedObservation.methods}%
                    </div>
                    <div>
                      <strong>Total SAMs:</strong>{" "}
                      {selectedObservation.totalSams.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {selectedObservation.observationData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Observation Data
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">UOM</th>
                          <th className="px-3 py-2 text-left">Description</th>
                          <th className="px-3 py-2 text-left">Quantity</th>
                          <th className="px-3 py-2 text-left">SAM Value</th>
                          <th className="px-3 py-2 text-left">Total SAMs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedObservation.observationData.map((data) => (
                          <tr
                            key={data.id}
                            className="border-t border-gray-200"
                          >
                            <td className="px-3 py-2">{data.uom}</td>
                            <td className="px-3 py-2">{data.description}</td>
                            <td className="px-3 py-2">{data.quantity}</td>
                            <td className="px-3 py-2">
                              {data.samValue.toFixed(3)}
                            </td>
                            <td className="px-3 py-2">
                              {data.totalSams.toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedObservation.comments && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Comments</h3>
                  <div className="bg-gray-50 p-3 rounded border text-sm">
                    {selectedObservation.comments}
                  </div>
                </div>
              )}

              {selectedObservation.aiNotes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">AI Notes</h3>
                  <div className="bg-blue-50 p-3 rounded border text-sm">
                    {selectedObservation.aiNotes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
