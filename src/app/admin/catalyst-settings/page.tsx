"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

interface User {
  id: string;
  employeeId: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
  userType?: string;
  isNewEmployee: boolean;
  startDate?: string;
  newEmployeePeriodDays?: number;
  observationGoalPerDay?: number;
  observationGoalPerWeek?: number;
  observationGoalPerMonth?: number;
  observationGoalPerQuarter?: number;
  observationGoalPerYear?: number;
  observationReceiveGoalPeriod?: string;
  observationReceiveGoalCount?: number;
}

interface EditingUser extends User {
  isEditing: boolean;
}

export default function CatalystSettingsPage() {
  const [users, setUsers] = useState<EditingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const userData = await response.json();
      setUsers(userData.map((user: User) => ({ ...user, isEditing: false })));
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, isEditing: true } : user,
      ),
    );
  };

  const handleCancelEdit = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, isEditing: false } : user,
      ),
    );
    // Refresh to reset any changes
    fetchUsers();
  };

  const handleSaveUser = async (user: EditingUser) => {
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          userType: user.userType,
          isNewEmployee: user.isNewEmployee,
          startDate: user.startDate
            ? new Date(user.startDate).toISOString()
            : null,
          newEmployeePeriodDays: user.newEmployeePeriodDays,
          observationGoalPerDay: user.observationGoalPerDay,
          observationGoalPerWeek: user.observationGoalPerWeek,
          observationGoalPerMonth: user.observationGoalPerMonth,
          observationGoalPerQuarter: user.observationGoalPerQuarter,
          observationGoalPerYear: user.observationGoalPerYear,
          observationReceiveGoalPeriod: user.observationReceiveGoalPeriod,
          observationReceiveGoalCount: user.observationReceiveGoalCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...user, isEditing: false } : u,
        ),
      );
      setSuccess("User updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user");
      setTimeout(() => setError(null), 3000);
    }
  };

  const updateUserField = (
    userId: string,
    field: keyof EditingUser,
    value: string | number | boolean,
  ) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, [field]: value } : user,
      ),
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUserType =
      filterUserType === "all" || user.userType === filterUserType;

    return matchesSearch && matchesUserType;
  });

  const userTypes = [
    "Team Member",
    "Associate",
    "Employee",
    "Supervisor",
    "Manager",
    "Administrator",
  ];

  return (
    <div className="font-poppins text-black bg-gray-100 min-h-screen overflow-x-hidden">
      <Banner
        title="Catalyst Settings"
        subtitle="Manage user goals and new employee settings"
      />
      <div className="flex flex-col max-w-7xl mx-auto bg-gray-100 min-h-[calc(100vh-80px)] rounded-xl border border-gray-300 mt-5 p-5 overflow-y-auto">
        <div className="flex flex-row h-full">
          <Sidebar
            showLogo={true}
            sections={[
              {
                title: "Administration",
                items: [
                  { label: "Dashboard", href: "/admin" },
                  { label: "Users", href: "/admin/users" },
                  { label: "Roles", href: "/admin/roles" },
                  { label: "Organizations", href: "/admin/organizations" },
                  { label: "Facilities", href: "/admin/facilities" },
                  { label: "Departments", href: "/admin/departments" },
                  { label: "Areas", href: "/admin/areas" },
                  { label: "Standards", href: "/admin/standards" },
                  { label: "Observations", href: "/admin/observations" },
                  {
                    label: "Observation Reasons",
                    href: "/admin/observation-reasons",
                  },
                  { label: "Delay Reasons", href: "/admin/delay-reasons" },
                  { label: "User Roles", href: "/admin/user-roles" },
                  {
                    label: "Catalyst Settings",
                    href: "/admin/catalyst-settings",
                  },
                ],
              },
            ]}
            showUserProfile={true}
          />

          <main className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-red-600">
                Catalyst User Settings
              </h1>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {/* Filters */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, employee ID, department, or email..."
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by User Type
                  </label>
                  <select
                    value={filterUserType}
                    onChange={(e) => setFilterUserType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All User Types</option>
                    {userTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          User Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          New Employee
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Observation Goals
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Receive Goals
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {user.employeeId}
                              </div>
                              <div className="text-sm text-gray-600">
                                {user.department}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {user.isEditing ? (
                              <select
                                value={user.userType || "Team Member"}
                                onChange={(e) =>
                                  updateUserField(
                                    user.id,
                                    "userType",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-1 border border-gray-300 rounded text-sm"
                              >
                                {userTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-sm">
                                {user.userType || "Team Member"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {user.isEditing ? (
                              <div className="space-y-2">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={user.isNewEmployee}
                                    onChange={(e) =>
                                      updateUserField(
                                        user.id,
                                        "isNewEmployee",
                                        e.target.checked,
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  New Employee
                                </label>
                                {user.isNewEmployee && (
                                  <>
                                    <input
                                      type="date"
                                      value={user.startDate || ""}
                                      onChange={(e) =>
                                        updateUserField(
                                          user.id,
                                          "startDate",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full p-1 border border-gray-300 rounded text-sm"
                                      placeholder="Start Date"
                                    />
                                    <input
                                      type="number"
                                      value={user.newEmployeePeriodDays || 90}
                                      onChange={(e) =>
                                        updateUserField(
                                          user.id,
                                          "newEmployeePeriodDays",
                                          parseInt(e.target.value),
                                        )
                                      }
                                      className="w-full p-1 border border-gray-300 rounded text-sm"
                                      placeholder="New Employee Period (days)"
                                      min="1"
                                    />
                                  </>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span
                                  className={`px-2 py-1 text-xs rounded ${
                                    user.isNewEmployee
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {user.isNewEmployee
                                    ? "New Employee"
                                    : "Regular"}
                                </span>
                                {user.isNewEmployee && user.startDate && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Started:{" "}
                                    {new Date(
                                      user.startDate,
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {user.isEditing ? (
                              <div className="space-y-1 text-xs">
                                <input
                                  type="number"
                                  value={user.observationGoalPerDay || 0}
                                  onChange={(e) =>
                                    updateUserField(
                                      user.id,
                                      "observationGoalPerDay",
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full p-1 border border-gray-300 rounded"
                                  placeholder="Per Day"
                                  min="0"
                                />
                                <input
                                  type="number"
                                  value={user.observationGoalPerWeek || 0}
                                  onChange={(e) =>
                                    updateUserField(
                                      user.id,
                                      "observationGoalPerWeek",
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full p-1 border border-gray-300 rounded"
                                  placeholder="Per Week"
                                  min="0"
                                />
                                <input
                                  type="number"
                                  value={user.observationGoalPerMonth || 0}
                                  onChange={(e) =>
                                    updateUserField(
                                      user.id,
                                      "observationGoalPerMonth",
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full p-1 border border-gray-300 rounded"
                                  placeholder="Per Month"
                                  min="0"
                                />
                              </div>
                            ) : (
                              <div className="text-sm space-y-1">
                                {user.observationGoalPerDay ? (
                                  <div>Daily: {user.observationGoalPerDay}</div>
                                ) : null}
                                {user.observationGoalPerWeek ? (
                                  <div>
                                    Weekly: {user.observationGoalPerWeek}
                                  </div>
                                ) : null}
                                {user.observationGoalPerMonth ? (
                                  <div>
                                    Monthly: {user.observationGoalPerMonth}
                                  </div>
                                ) : null}
                                {!user.observationGoalPerDay &&
                                  !user.observationGoalPerWeek &&
                                  !user.observationGoalPerMonth && (
                                    <div className="text-gray-500">
                                      No goals set
                                    </div>
                                  )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {user.isEditing ? (
                              <div className="space-y-1">
                                <select
                                  value={
                                    user.observationReceiveGoalPeriod || "month"
                                  }
                                  onChange={(e) =>
                                    updateUserField(
                                      user.id,
                                      "observationReceiveGoalPeriod",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-1 border border-gray-300 rounded text-xs"
                                >
                                  <option value="week">Weekly</option>
                                  <option value="month">Monthly</option>
                                  <option value="quarter">Quarterly</option>
                                  <option value="year">Yearly</option>
                                </select>
                                <input
                                  type="number"
                                  value={user.observationReceiveGoalCount || 4}
                                  onChange={(e) =>
                                    updateUserField(
                                      user.id,
                                      "observationReceiveGoalCount",
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full p-1 border border-gray-300 rounded text-xs"
                                  placeholder="Count"
                                  min="0"
                                />
                              </div>
                            ) : (
                              <div className="text-sm">
                                {user.observationReceiveGoalCount || 4} per{" "}
                                {user.observationReceiveGoalPeriod || "month"}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {user.isEditing ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveUser(user)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => handleCancelEdit(user.id)}
                                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditUser(user.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your criteria.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
