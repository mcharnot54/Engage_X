"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface Goal {
  id: string;
  userId: string;
  type: "monthly" | "quarterly" | "annual";
  targetObservations: number;
  period: string;
  isActive: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    employeeId: string;
    department?: string;
  };
}

interface User {
  id: string;
  name: string;
  employeeId: string;
  department?: string;
  userRoles?: Array<{
    role: {
      name: string;
    };
  }>;
}

const managerRoles = [
  "President",
  "Senior Vice President",
  "Vice President",
  "Senior Director",
  "Director",
  "Senior Manager",
  "Manager",
  "Senior Lead",
  "Lead",
];

export default function GoalsAdminPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [goalType, setGoalType] = useState<"monthly" | "quarterly" | "annual">(
    "monthly",
  );
  const [targetObservations, setTargetObservations] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterUser, setFilterUser] = useState("");

  useEffect(() => {
    fetchGoals();
    fetchUsers();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      } else {
        setError("Failed to fetch goals");
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError("Failed to fetch goals");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        // Filter to only show users with manager roles
        const managerUsers = data.filter((user: User) =>
          user.userRoles?.some((userRole) =>
            managerRoles.includes(userRole.role.name),
          ),
        );
        setUsers(managerUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !targetObservations || !selectedPeriod) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser,
          type: goalType,
          targetObservations,
          period: selectedPeriod,
          isActive: true,
        }),
      });

      if (response.ok) {
        setSelectedUser("");
        setTargetObservations(0);
        setSelectedPeriod("");
        fetchGoals();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create goal");
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      setError("Failed to create goal");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchGoals();
      } else {
        setError("Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      setError("Failed to delete goal");
    }
  };

  const generatePeriodOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year <= currentYear + 2; year++) {
      if (goalType === "monthly") {
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, "0");
          options.push(`${year}-${monthStr}`);
        }
      } else if (goalType === "quarterly") {
        for (let quarter = 1; quarter <= 4; quarter++) {
          options.push(`${year}-Q${quarter}`);
        }
      } else {
        options.push(year.toString());
      }
    }

    return options;
  };

  const filteredGoals = goals.filter((goal) => {
    const matchesPeriod = !filterPeriod || goal.period === filterPeriod;
    const matchesUser = !filterUser || goal.userId === filterUser;
    return matchesPeriod && matchesUser;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner
        title="Guardian - Goals Management"
        subtitle="Set and manage observation goals for supervisors and managers"
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
                { label: "Goals", href: "/admin/goals", active: true },
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
              Goals Management
            </h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Create Goal Form */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Goal</h2>
            <form
              onSubmit={handleCreateGoal}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor/Manager
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.employeeId}) -{" "}
                      {user.userRoles?.[0]?.role?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Type
                </label>
                <select
                  value={goalType}
                  onChange={(e) => {
                    setGoalType(
                      e.target.value as "monthly" | "quarterly" | "annual",
                    );
                    setSelectedPeriod("");
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Period</option>
                  {generatePeriodOptions().map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Observations
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetObservations || ""}
                  onChange={(e) =>
                    setTargetObservations(parseInt(e.target.value) || 0)
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="bg-gray-100 rounded-lg p-4 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-3">Filter Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by User
                </label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Period
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2024-01, 2024-Q1, 2024"
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Goals List */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-300">
              <h3 className="text-lg font-semibold">Current Goals</h3>
            </div>

            {isLoading ? (
              <div className="p-6 text-center">Loading goals...</div>
            ) : filteredGoals.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No goals found. Create a goal to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Target
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredGoals.map((goal) => (
                      <tr key={goal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{goal.user?.name}</div>
                            <div className="text-sm text-gray-600">
                              {goal.user?.employeeId} • {goal.user?.department}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="capitalize">{goal.type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">{goal.period}</td>
                        <td className="px-6 py-4 text-sm">
                          {goal.targetObservations}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              goal.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {goal.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
