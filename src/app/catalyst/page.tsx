"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

type TeamMember = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  lastObservationDate: string | null;
  daysSinceLastObservation: number;
  needsObservation: boolean;
  observationGoal: number;
  completedObservations: number;
  isNewEmployee: boolean;
  startDate: string;
};

type Standard = {
  id: number;
  name: string;
  facility: { name: string };
  department: { name: string };
  area: { name: string };
};

type ObservationReason = {
  id: string;
  name: string;
  description?: string;
  purpose?: string;
  leaderActionGuidelines?: string;
};

type GoalMetrics = {
  totalObservations: number;
  goalObservations: number;
  remainingObservations: number;
  completionPercentage: number;
  period: string;
  periodStart: string;
};

type GoalSettings = {
  goalType: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  goalValue: number;
  calculatedAnnualGoal: number;
};

type GoalAttainmentData = {
  period: string;
  target: number;
  actual: number;
  percentage: number;
  date: string;
};

type PerformanceMetrics = {
  averageGradeFactor: number;
  averageObservedPerformance: number;
  totalObservationsCompleted: number;
  trend: "up" | "down" | "stable";
};

export default function CatalystPage() {
  const [goalMetrics, setGoalMetrics] = useState<GoalMetrics>({
    totalObservations: 0,
    goalObservations: 100,
    remainingObservations: 100,
    completionPercentage: 0,
    period: "monthly",
    periodStart: new Date().toISOString(),
  });

  const [goalSettings, setGoalSettings] = useState<GoalSettings>({
    goalType: "monthly",
    goalValue: 20,
    calculatedAnnualGoal: 260,
  });

  const [goalAttainmentHistory, setGoalAttainmentHistory] = useState<
    GoalAttainmentData[]
  >([]);
  const [showGoalSettings, setShowGoalSettings] = useState(false);

  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      averageGradeFactor: 0,
      averageObservedPerformance: 0,
      totalObservationsCompleted: 0,
      trend: "stable",
    });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredTeamMembers, setFilteredTeamMembers] = useState<TeamMember[]>(
    [],
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [departments, setDepartments] = useState<string[]>([]);

  // Calendar/Scheduler state
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedStandard, setSelectedStandard] = useState<string>("");
  const [selectedObservationReason, setSelectedObservationReason] =
    useState<string>("");
  const [schedulerNotes, setSchedulerNotes] = useState<string>("");

  // Standards and observation reasons from database
  const [standards, setStandards] = useState<Standard[]>([]);
  const [observationReasons, setObservationReasons] = useState<
    ObservationReason[]
  >([]);

  // Multi-level standard selection state
  const [showStandardDropdown, setShowStandardDropdown] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedStandardDepartment, setSelectedStandardDepartment] =
    useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // Employee search state
  const [employees, setEmployees] = useState<
    Array<{
      id: string;
      name: string;
      employeeId: string;
    }>
  >([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Load initial data
  useEffect(() => {
    loadGoalMetrics();
    loadPerformanceMetrics();
    loadTeamMembers();
    loadStandards();
    loadObservationReasons();
    loadEmployees();
    loadGoalAttainmentHistory();
  }, []);

  // Reload goals when settings change
  useEffect(() => {
    loadGoalMetrics();
  }, [goalSettings]);

  // Filter team members by department
  useEffect(() => {
    if (selectedDepartment === "all") {
      setFilteredTeamMembers(teamMembers);
    } else {
      setFilteredTeamMembers(
        teamMembers.filter(
          (member) => member.department === selectedDepartment,
        ),
      );
    }
  }, [selectedDepartment, teamMembers]);

  const calculateWorkDaysPerYear = () => {
    // 52 weeks per year, 5 work days per week
    return 52 * 5;
  };

  const calculateGoalFromSettings = (goalType: string, goalValue: number) => {
    const workDaysPerYear = calculateWorkDaysPerYear();

    switch (goalType) {
      case "daily":
        return goalValue * workDaysPerYear;
      case "weekly":
        return goalValue * 52;
      case "monthly":
        return goalValue * 12;
      case "quarterly":
        return goalValue * 4;
      case "annual":
        return goalValue;
      default:
        return goalValue;
    }
  };

  const getPeriodForGoalType = (goalType: string) => {
    switch (goalType) {
      case "daily":
        return "day";
      case "weekly":
        return "week";
      case "monthly":
        return "month";
      case "quarterly":
        return "quarter";
      case "annual":
        return "year";
      default:
        return "month";
    }
  };

  const loadGoalMetrics = async () => {
    try {
      // Get current user ID (for now using a default supervisor)
      const currentUserId = "admin-001"; // This should come from auth context
      const period = getPeriodForGoalType(goalSettings.goalType);
      const response = await fetch(
        `/api/catalyst/goals?userId=${currentUserId}&period=${period}`,
      );

      if (response.ok) {
        const data = await response.json();
        // Update goal target based on current settings
        const adjustedData = {
          ...data,
          goalObservations: goalSettings.goalValue,
          remainingObservations: Math.max(
            0,
            goalSettings.goalValue - data.totalObservations,
          ),
          completionPercentage:
            goalSettings.goalValue > 0
              ? Math.round(
                  (data.totalObservations / goalSettings.goalValue) * 100,
                )
              : 0,
        };
        setGoalMetrics(adjustedData);
      } else {
        // Fallback to mock data if API fails
        const mockGoals = {
          totalObservations: 15,
          goalObservations: goalSettings.goalValue,
          remainingObservations: Math.max(0, goalSettings.goalValue - 15),
          completionPercentage:
            goalSettings.goalValue > 0
              ? Math.round((15 / goalSettings.goalValue) * 100)
              : 0,
          period: period,
          periodStart: new Date().toISOString(),
        };
        setGoalMetrics(mockGoals);
      }
    } catch (error) {
      console.error("Error loading goal metrics:", error);
      // Fallback to mock data
      const mockGoals = {
        totalObservations: 15,
        goalObservations: goalSettings.goalValue,
        remainingObservations: Math.max(0, goalSettings.goalValue - 15),
        completionPercentage:
          goalSettings.goalValue > 0
            ? Math.round((15 / goalSettings.goalValue) * 100)
            : 0,
        period: getPeriodForGoalType(goalSettings.goalType),
        periodStart: new Date().toISOString(),
      };
      setGoalMetrics(mockGoals);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      // Get current user ID (for now using a default supervisor)
      const currentUserId = "admin-001"; // This should come from auth context
      const response = await fetch(
        `/api/catalyst/supervisor-performance?supervisorId=${currentUserId}&period=month`,
      );

      if (response.ok) {
        const data = await response.json();
        setPerformanceMetrics(data);
      } else {
        // Fallback to mock data if API fails
        const mockPerformance = {
          averageGradeFactor: 94.2,
          averageObservedPerformance: 97.1,
          totalObservationsCompleted: 75,
          trend: "up" as const,
        };
        setPerformanceMetrics(mockPerformance);
      }
    } catch (error) {
      console.error("Error loading performance metrics:", error);
      // Fallback to mock data
      const mockPerformance = {
        averageGradeFactor: 94.2,
        averageObservedPerformance: 97.1,
        totalObservationsCompleted: 75,
        trend: "up" as const,
      };
      setPerformanceMetrics(mockPerformance);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const response = await fetch("/api/catalyst/team-members");

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers);
        setDepartments(data.departments);
      } else {
        // Fallback to mock data if API fails
        const mockTeamMembers: TeamMember[] = [
          {
            id: "1",
            name: "John Smith",
            employeeId: "EMP001",
            department: "Manufacturing",
            lastObservationDate: "2024-01-10",
            daysSinceLastObservation: 5,
            needsObservation: true,
            observationGoal: 4,
            completedObservations: 3,
            isNewEmployee: false,
            startDate: "2023-06-15",
          },
          {
            id: "2",
            name: "Sarah Johnson",
            employeeId: "EMP002",
            department: "Quality",
            lastObservationDate: "2024-01-12",
            daysSinceLastObservation: 3,
            needsObservation: false,
            observationGoal: 4,
            completedObservations: 4,
            isNewEmployee: false,
            startDate: "2022-03-20",
          },
          {
            id: "3",
            name: "Michael Brown",
            employeeId: "EMP003",
            department: "Manufacturing",
            lastObservationDate: null,
            daysSinceLastObservation: 14,
            needsObservation: true,
            observationGoal: 8,
            completedObservations: 1,
            isNewEmployee: true,
            startDate: "2024-01-01",
          },
        ];

        setTeamMembers(mockTeamMembers);
        const uniqueDepartments = [
          ...new Set(mockTeamMembers.map((member) => member.department)),
        ];
        setDepartments(uniqueDepartments);
      }
    } catch (error) {
      console.error("Error loading team members:", error);
      // Fallback to mock data
      const mockTeamMembers: TeamMember[] = [
        {
          id: "1",
          name: "John Smith",
          employeeId: "EMP001",
          department: "Manufacturing",
          lastObservationDate: "2024-01-10",
          daysSinceLastObservation: 5,
          needsObservation: true,
          observationGoal: 4,
          completedObservations: 3,
          isNewEmployee: false,
          startDate: "2023-06-15",
        },
        {
          id: "2",
          name: "Sarah Johnson",
          employeeId: "EMP002",
          department: "Quality",
          lastObservationDate: "2024-01-12",
          daysSinceLastObservation: 3,
          needsObservation: false,
          observationGoal: 4,
          completedObservations: 4,
          isNewEmployee: false,
          startDate: "2022-03-20",
        },
        {
          id: "3",
          name: "Michael Brown",
          employeeId: "EMP003",
          department: "Manufacturing",
          lastObservationDate: null,
          daysSinceLastObservation: 14,
          needsObservation: true,
          observationGoal: 8,
          completedObservations: 1,
          isNewEmployee: true,
          startDate: "2024-01-01",
        },
      ];

      setTeamMembers(mockTeamMembers);
      const uniqueDepartments = [
        ...new Set(mockTeamMembers.map((member) => member.department)),
      ];
      setDepartments(uniqueDepartments);
    }
  };

  const exportToCalendar = (type: "outlook" | "google" | "apple") => {
    const startDate = new Date(`${selectedDate}T${selectedTime}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const event = {
      title: `Observation: ${teamMembers.find((m) => m.id === selectedEmployee)?.name || "Team Member"}`,
      description: `Standard: ${selectedStandard}\nNotes: ${schedulerNotes}`,
      location: "Workplace",
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };

    switch (type) {
      case "outlook":
        const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(event.description)}&startdt=${event.startTime}&enddt=${event.endTime}`;
        window.open(outlookUrl, "_blank");
        break;
      case "google":
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&dates=${startDate
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "")}/${endDate
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "")}`;
        window.open(googleUrl, "_blank");
        break;
      case "apple":
        // For Apple Calendar, we'll create an ICS file
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Catalyst//Observation Scheduler//EN
BEGIN:VEVENT
UID:${Date.now()}@catalyst.com
DTSTAMP:${new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "")}Z
DTSTART:${startDate
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "")}Z
DTEND:${endDate
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "")}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "observation.ics";
        link.click();
        URL.revokeObjectURL(url);
        break;
    }
  };

  const scheduleObservation = async () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !selectedEmployee ||
      !selectedStandard ||
      !selectedObservationReason
    ) {
      alert("Please fill in all required fields including observation reason");
      return;
    }

    try {
      const response = await fetch("/api/catalyst/scheduled-observations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedEmployee,
          standardId: selectedStandard,
          scheduledDate: selectedDate,
          scheduledTime: selectedTime,
          notes: schedulerNotes,
          observationReason: selectedObservationReason,
          createdBy: "admin-001", // This should come from auth context
        }),
      });

      if (response.ok) {
        alert("Observation scheduled successfully!");
        setShowScheduler(false);
        resetSchedulerForm();
      } else {
        const errorData = await response.json();
        alert(`Failed to schedule observation: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error scheduling observation:", error);
      alert("Failed to schedule observation. Please try again.");
    }
  };

  const resetSchedulerForm = () => {
    setSelectedDate("");
    setSelectedTime("");
    setSelectedEmployee("");
    setSelectedStandard("");
    setSelectedObservationReason("");
    setSchedulerNotes("");
    setSelectedFacility("");
    setSelectedStandardDepartment("");
    setSelectedArea("");
    setEmployeeSearch("");
  };

  // Database loading functions
  const loadStandards = async () => {
    try {
      const response = await fetch("/api/standards");
      if (response.ok) {
        const data = await response.json();
        setStandards(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error loading standards:", error);
    }
  };

  const loadObservationReasons = async () => {
    try {
      const response = await fetch("/api/observation-reasons");
      if (response.ok) {
        const data = await response.json();
        setObservationReasons(data);
      }
    } catch (error) {
      console.error("Error loading observation reasons:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      // Load all users, not just team members, but filter for those who can be observed
      const response = await fetch("/api/users-tenant");
      if (response.ok) {
        const data = await response.json();
        const allUsers = data.users
          .filter(
            (user: { userType?: string; isActive?: boolean }) =>
              user.isActive !== false &&
              (!user.userType ||
                user.userType === "Team Member" ||
                user.userType === "Employee"),
          )
          .map(
            (user: {
              id: string;
              name: string;
              employeeId?: string;
              department?: string;
            }) => ({
              id: user.id,
              name: user.name,
              employeeId: user.employeeId || user.id,
              department: user.department || "Unknown",
            }),
          );
        setEmployees(allUsers);
      } else {
        // Fallback to demo employees if API fails
        const fallbackEmployees = [
          {
            id: "emp001",
            name: "John Smith",
            employeeId: "emp001",
            department: "Manufacturing",
          },
          {
            id: "emp002",
            name: "Sarah Johnson",
            employeeId: "emp002",
            department: "Quality",
          },
          {
            id: "emp003",
            name: "Michael Brown",
            employeeId: "emp003",
            department: "Manufacturing",
          },
          {
            id: "emp004",
            name: "Lisa Davis",
            employeeId: "emp004",
            department: "Operations",
          },
          {
            id: "emp005",
            name: "Robert Wilson",
            employeeId: "emp005",
            department: "Maintenance",
          },
          {
            id: "emp006",
            name: "Jennifer Martinez",
            employeeId: "emp006",
            department: "Quality",
          },
          {
            id: "emp007",
            name: "David Lee",
            employeeId: "emp007",
            department: "Manufacturing",
          },
          {
            id: "emp008",
            name: "Amanda Taylor",
            employeeId: "emp008",
            department: "Operations",
          },
        ];
        setEmployees(fallbackEmployees);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      // Use fallback data
      const fallbackEmployees = [
        {
          id: "emp001",
          name: "John Smith",
          employeeId: "emp001",
          department: "Manufacturing",
        },
        {
          id: "emp002",
          name: "Sarah Johnson",
          employeeId: "emp002",
          department: "Quality",
        },
        {
          id: "emp003",
          name: "Michael Brown",
          employeeId: "emp003",
          department: "Manufacturing",
        },
        {
          id: "emp004",
          name: "Lisa Davis",
          employeeId: "emp004",
          department: "Operations",
        },
        {
          id: "emp005",
          name: "Robert Wilson",
          employeeId: "emp005",
          department: "Maintenance",
        },
      ];
      setEmployees(fallbackEmployees);
    }
  };

  const loadGoalAttainmentHistory = async () => {
    try {
      // Mock historical data for now - in practice this would come from the API
      const mockHistory: GoalAttainmentData[] = [];
      const currentDate = new Date();

      // Generate last 12 periods of data based on goal type
      for (let i = 11; i >= 0; i--) {
        const periodDate = new Date(currentDate);
        let periodLabel = "";

        switch (goalSettings.goalType) {
          case "daily":
            periodDate.setDate(periodDate.getDate() - i);
            periodLabel = periodDate.toLocaleDateString();
            break;
          case "weekly":
            periodDate.setDate(periodDate.getDate() - i * 7);
            periodLabel = `Week of ${periodDate.toLocaleDateString()}`;
            break;
          case "monthly":
            periodDate.setMonth(periodDate.getMonth() - i);
            periodLabel = periodDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            });
            break;
          case "quarterly":
            periodDate.setMonth(periodDate.getMonth() - i * 3);
            const quarter = Math.floor(periodDate.getMonth() / 3) + 1;
            periodLabel = `Q${quarter} ${periodDate.getFullYear()}`;
            break;
          case "annual":
            periodDate.setFullYear(periodDate.getFullYear() - i);
            periodLabel = periodDate.getFullYear().toString();
            break;
        }

        // Simulate performance data with some variance
        const basePerformance = 0.75 + Math.random() * 0.4; // 75-115% performance
        const actual = Math.floor(goalSettings.goalValue * basePerformance);
        const percentage = Math.round((actual / goalSettings.goalValue) * 100);

        mockHistory.push({
          period: periodLabel,
          target: goalSettings.goalValue,
          actual: actual,
          percentage: percentage,
          date: periodDate.toISOString(),
        });
      }

      setGoalAttainmentHistory(mockHistory);
    } catch (error) {
      console.error("Error loading goal attainment history:", error);
    }
  };

  const updateGoalSettings = async (newSettings: Partial<GoalSettings>) => {
    const updatedSettings = { ...goalSettings, ...newSettings };

    // Calculate annual goal based on new settings
    updatedSettings.calculatedAnnualGoal = calculateGoalFromSettings(
      updatedSettings.goalType,
      updatedSettings.goalValue,
    );

    setGoalSettings(updatedSettings);
    setShowGoalSettings(false);

    // Reload attainment history with new settings
    setTimeout(() => {
      loadGoalAttainmentHistory();
    }, 100);
  };

  // Helper functions for multi-level dropdown
  const getUniqueFacilities = () => {
    return standards
      .map((std) => ({ name: std.facility.name, id: std.facility.name }))
      .filter(
        (facility, index, arr) =>
          arr.findIndex((f) => f.name === facility.name) === index,
      );
  };

  const getUniqueDepartments = (facility?: string) => {
    return standards
      .filter((std) => !facility || std.facility.name === facility)
      .map((std) => ({ name: std.department.name, id: std.department.name }))
      .filter(
        (dept, index, arr) =>
          arr.findIndex((d) => d.name === dept.name) === index,
      );
  };

  const getUniqueAreas = (facility?: string, department?: string) => {
    return standards
      .filter(
        (std) =>
          (!facility || std.facility.name === facility) &&
          (!department || std.department.name === department),
      )
      .map((std) => ({ name: std.area.name, id: std.area.name }))
      .filter(
        (area, index, arr) =>
          arr.findIndex((a) => a.name === area.name) === index,
      );
  };

  const getFilteredStandards = () => {
    return standards.filter(
      (std) =>
        (!selectedFacility || std.facility.name === selectedFacility) &&
        (!selectedStandardDepartment ||
          std.department.name === selectedStandardDepartment) &&
        (!selectedArea || std.area.name === selectedArea),
    );
  };

  const getSelectedStandardDisplay = () => {
    if (selectedStandard && standards.length > 0) {
      const selectedStd = standards.find(
        (s) => s.id === Number(selectedStandard),
      );
      if (selectedStd) {
        return `${selectedStd.name} (${selectedStd.facility.name} / ${selectedStd.department.name} / ${selectedStd.area.name})`;
      }
    }
    return "Select Standard";
  };

  const resetStandardSelection = () => {
    setSelectedStandard("");
    setSelectedFacility("");
    setSelectedStandardDepartment("");
    setSelectedArea("");
    setShowStandardDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showStandardDropdown && !target.closest(".standard-dropdown")) {
        setShowStandardDropdown(false);
      }
      if (showEmployeeDropdown && !target.closest(".employee-dropdown")) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStandardDropdown, showEmployeeDropdown]);

  return (
    <div className="font-poppins text-black bg-gray-100 min-h-screen overflow-x-hidden">
      <Banner
        title="Catalyst - Leader Dashboard"
        subtitle="Track team performance, schedule observations, and monitor goals"
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-red-600">
                Catalyst - Leadership Dashboard
              </h1>
            </div>

            {/* Goal Settings and Progress Section */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Goal Progress</h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Current Goal: {goalSettings.goalValue}{" "}
                    {goalSettings.goalType} | Annual Equivalent:{" "}
                    {goalSettings.calculatedAnnualGoal}
                  </div>
                  <button
                    onClick={() => setShowGoalSettings(!showGoalSettings)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Goal Settings
                  </button>
                </div>
              </div>

              {/* Goal Settings Panel */}
              {showGoalSettings && (
                <div className="bg-white p-4 rounded-lg border mb-4">
                  <h4 className="font-semibold mb-3">
                    Configure Observation Goals
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Goal Type
                      </label>
                      <select
                        value={goalSettings.goalType}
                        onChange={(e) =>
                          updateGoalSettings({
                            goalType: e.target
                              .value as GoalSettings["goalType"],
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Goal Value
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={goalSettings.goalValue}
                        onChange={(e) =>
                          updateGoalSettings({
                            goalValue: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Work Day Calculation:</strong> Based on 5 work
                      days per week, 52 weeks per year (260 work days annually)
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Annual Goal Equivalent:{" "}
                      {calculateGoalFromSettings(
                        goalSettings.goalType,
                        goalSettings.goalValue,
                      )}{" "}
                      observations/year
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {goalMetrics.totalObservations}
                  </div>
                  <div className="text-sm text-gray-600">
                    Observations Completed
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {goalMetrics.goalObservations}
                  </div>
                  <div className="text-sm text-gray-600">
                    Goal Target ({goalSettings.goalType})
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">
                    {goalMetrics.remainingObservations}
                  </div>
                  <div className="text-sm text-gray-600">Remaining to Goal</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">
                    {goalMetrics.completionPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, goalMetrics.completionPercentage)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0</span>
                  <span>{goalMetrics.goalObservations}</span>
                </div>
              </div>
            </div>

            {/* Goal Attainment Report Section */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Goal Attainment Report
              </h3>
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                      Historical Performance -{" "}
                      {goalSettings.goalType.charAt(0).toUpperCase() +
                        goalSettings.goalType.slice(1)}{" "}
                      Goals
                    </h4>
                    <div className="text-sm text-gray-600">
                      Target: {goalSettings.goalValue} observations per{" "}
                      {goalSettings.goalType.slice(0, -2) ||
                        goalSettings.goalType}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Period
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Target
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Actual
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Achievement %
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {goalAttainmentHistory.slice(-8).map((period, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {period.period}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {period.target}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {period.actual}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`font-semibold ${
                                period.percentage >= 100
                                  ? "text-green-600"
                                  : period.percentage >= 80
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {period.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                period.percentage >= 100
                                  ? "bg-green-100 text-green-800"
                                  : period.percentage >= 80
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {period.percentage >= 100
                                ? "Achieved"
                                : period.percentage >= 80
                                  ? "Near Target"
                                  : "Below Target"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-gray-50 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {
                          goalAttainmentHistory.filter(
                            (p) => p.percentage >= 100,
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        Periods Achieved
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {goalAttainmentHistory.length > 0
                          ? Math.round(
                              goalAttainmentHistory.reduce(
                                (sum, p) => sum + p.percentage,
                                0,
                              ) / goalAttainmentHistory.length,
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        Average Achievement
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">
                        {goalAttainmentHistory.length > 0
                          ? (
                              (goalAttainmentHistory.filter(
                                (p) => p.percentage >= 100,
                              ).length /
                                goalAttainmentHistory.length) *
                              100
                            ).toFixed(0)
                          : 0}
                        %
                      </div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Tables */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3">
                    Grade Factor Performance
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-green-600">
                      {performanceMetrics.averageGradeFactor}%
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        performanceMetrics.trend === "up"
                          ? "bg-green-100 text-green-800"
                          : performanceMetrics.trend === "down"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {performanceMetrics.trend === "up"
                        ? "↗ Trending Up"
                        : performanceMetrics.trend === "down"
                          ? "↘ Trending Down"
                          : "→ Stable"}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3">Observed Performance</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-blue-600">
                      {performanceMetrics.averageObservedPerformance}%
                    </span>
                    <span className="text-sm text-gray-600">
                      From {performanceMetrics.totalObservationsCompleted}{" "}
                      observations
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduler Section */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Observation Scheduler</h3>
                <button
                  onClick={() => setShowScheduler(!showScheduler)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {showScheduler ? "Hide Scheduler" : "Schedule Observation"}
                </button>
              </div>

              {showScheduler && (
                <div className="bg-white p-4 rounded-lg border standard-dropdown">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="relative employee-dropdown">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Employee
                      </label>
                      <div
                        onClick={() =>
                          setShowEmployeeDropdown(!showEmployeeDropdown)
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer flex justify-between items-center bg-white hover:bg-gray-50"
                      >
                        <span
                          className={
                            selectedEmployee ? "text-black" : "text-gray-500"
                          }
                        >
                          {selectedEmployee
                            ? employees.find(
                                (emp) => emp.id === selectedEmployee,
                              )?.name +
                              ` (${employees.find((emp) => emp.id === selectedEmployee)?.employeeId})`
                            : "Select Employee"}
                        </span>
                        <span
                          className={`transform transition-transform ${showEmployeeDropdown ? "rotate-180" : ""}`}
                        >
                          ▼
                        </span>
                      </div>

                      {showEmployeeDropdown && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                          <div className="p-3">
                            <input
                              type="text"
                              placeholder="Search by name or employee ID..."
                              value={employeeSearch}
                              onChange={(e) =>
                                setEmployeeSearch(e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {employees
                              .filter(
                                (employee) =>
                                  employeeSearch === "" ||
                                  employee.name
                                    .toLowerCase()
                                    .includes(employeeSearch.toLowerCase()) ||
                                  employee.employeeId
                                    .toLowerCase()
                                    .includes(employeeSearch.toLowerCase()),
                              )
                              .map((employee) => (
                                <div
                                  key={employee.id}
                                  onClick={() => {
                                    setSelectedEmployee(employee.id);
                                    setShowEmployeeDropdown(false);
                                    setEmployeeSearch("");
                                  }}
                                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium">
                                    {employee.name}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {employee.employeeId}
                                  </div>
                                </div>
                              ))}
                            {employees.filter(
                              (employee) =>
                                employeeSearch === "" ||
                                employee.name
                                  .toLowerCase()
                                  .includes(employeeSearch.toLowerCase()) ||
                                employee.employeeId
                                  .toLowerCase()
                                  .includes(employeeSearch.toLowerCase()),
                            ).length === 0 && (
                              <div className="p-3 text-gray-500 text-center">
                                No employees found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Standard
                      </label>
                      <button
                        onClick={() =>
                          setShowStandardDropdown(!showStandardDropdown)
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-left flex justify-between items-center hover:bg-gray-50 transition-colors bg-white"
                      >
                        <span
                          className={
                            selectedStandard ? "text-black" : "text-gray-500"
                          }
                        >
                          {getSelectedStandardDisplay()}
                        </span>
                        <span
                          className={`transform transition-transform ${showStandardDropdown ? "rotate-180" : ""}`}
                        >
                          ▼
                        </span>
                      </button>

                      {showStandardDropdown && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                          <div className="p-4 space-y-4">
                            {/* Facility Selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                1. Select Facility
                              </label>
                              <select
                                value={selectedFacility}
                                onChange={(e) => {
                                  setSelectedFacility(e.target.value);
                                  setSelectedStandardDepartment("");
                                  setSelectedArea("");
                                  setSelectedStandard("");
                                }}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Choose Facility</option>
                                {getUniqueFacilities().map((facility) => (
                                  <option
                                    key={facility.id}
                                    value={facility.name}
                                  >
                                    {facility.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Department Selection */}
                            {selectedFacility && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  2. Select Department
                                </label>
                                <select
                                  value={selectedStandardDepartment}
                                  onChange={(e) => {
                                    setSelectedStandardDepartment(
                                      e.target.value,
                                    );
                                    setSelectedArea("");
                                    setSelectedStandard("");
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Choose Department</option>
                                  {getUniqueDepartments(selectedFacility).map(
                                    (dept) => (
                                      <option key={dept.id} value={dept.name}>
                                        {dept.name}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </div>
                            )}

                            {/* Area Selection */}
                            {selectedStandardDepartment && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  3. Select Area
                                </label>
                                <select
                                  value={selectedArea}
                                  onChange={(e) => {
                                    setSelectedArea(e.target.value);
                                    setSelectedStandard("");
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Choose Area</option>
                                  {getUniqueAreas(
                                    selectedFacility,
                                    selectedStandardDepartment,
                                  ).map((area) => (
                                    <option key={area.id} value={area.name}>
                                      {area.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Standard Selection */}
                            {selectedArea && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  4. Select Standard
                                </label>
                                <select
                                  value={selectedStandard}
                                  onChange={(e) => {
                                    setSelectedStandard(e.target.value);
                                    setShowStandardDropdown(false);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Choose Standard</option>
                                  {getFilteredStandards().map((std) => (
                                    <option key={std.id} value={std.id}>
                                      {std.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-between pt-3 border-t border-gray-200">
                              <button
                                onClick={resetStandardSelection}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                              >
                                Clear Selection
                              </button>
                              <button
                                onClick={() => setShowStandardDropdown(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Observation Reason
                    </label>
                    <select
                      value={selectedObservationReason}
                      onChange={(e) =>
                        setSelectedObservationReason(e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Observation Reason</option>
                      {observationReasons.map((reason) => (
                        <option key={reason.id} value={reason.name}>
                          {reason.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={schedulerNotes}
                      onChange={(e) => setSchedulerNotes(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Optional notes for this observation..."
                    />
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportToCalendar("outlook")}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Export to Outlook
                      </button>
                      <button
                        onClick={() => exportToCalendar("google")}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Export to Google
                      </button>
                      <button
                        onClick={() => exportToCalendar("apple")}
                        className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        Export to Apple
                      </button>
                    </div>
                    <button
                      onClick={scheduleObservation}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Schedule Observation
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Team Members Section */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Filter by Department:
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Last Observation
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Days Since
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTeamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span className="font-medium">{member.name}</span>
                            {member.isNewEmployee && (
                              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                New Employee
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {member.employeeId}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {member.department}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {member.lastObservationDate || "Never"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {member.daysSinceLastObservation}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              member.needsObservation
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {member.needsObservation
                              ? "Needs Observation"
                              : "Up to Date"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(100, (member.completedObservations / member.observationGoal) * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {member.completedObservations}/
                              {member.observationGoal}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
