"use client";

import { useState, useEffect, useMemo } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";
import { useDropdownMemory, createDropdownKey } from "@/hooks/useDropdownMemory";

type User = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
};

type Standard = {
  id: number;
  name: string;
  facility: { name: string };
  department: { name: string };
  area: { name: string };
};

type Observation = {
  id: string;
  userId: string;
  user: User;
  standardId: number;
  standard: Standard;
  observedPerformance: number;
  pumpScore: number;
  pace: number;
  utilization: number;
  methods: number;
  timeObserved: number;
  totalSams: number;
  comments?: string;
  supervisorSignature: string;
  createdAt: string;
};

type DashboardData = {
  observations: Observation[];
  users: User[];
  standards: Standard[];
  summary: {
    totalObservations: number;
    avgObservedPerformance: number;
    avgPumpScore: number;
    totalUsers: number;
    totalStandards: number;
  };
};

type FilterState = {
  selectedEmployee: string;
  selectedStandard: string;
  selectedSupervisor: string;
  dateRange: {
    start: string;
    end: string;
  };
};

const dashboards = [
  {
    id: "employee-vs-mean",
    title: "Employee vs Mean Standard Observed Performance (Distribution)",
    description:
      "Compare individual employee performance against the mean observed performance for selected standards",
  },
  {
    id: "standard-variation",
    title: "Observed Standard Variation",
    description:
      "Analysis of performance variation across standards within selected date range",
  },
  {
    id: "grade-factor-variation",
    title: "Grade Factor vs. Observed Standard Variation",
    description:
      "Correlation analysis between grade factor (PUMP) scores and observed performance variation",
  },
  {
    id: "supervisor-variation",
    title: "Supervisor Grade Factor Variation",
    description:
      "Performance variation analysis by supervisor within selected date range",
  },
  {
    id: "control-chart",
    title: "Observed and Grade Factor Performance Control Chart",
    description:
      "Statistical process control chart showing performance trends over time",
  },
  {
    id: "distribution-trend",
    title: "Distribution trend of Observed Performance vs. Grade Factor",
    description:
      "Distribution analysis comparing observed performance with grade factor scores",
  },
  {
    id: "employee-distribution",
    title: "Distribution of Observed Performance vs. All employees",
    description:
      "Performance distribution showing all employees as data points for comparison",
  },
];

export default function ReportingPage() {
  const [currentDashboard, setCurrentDashboard] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown memory hooks for filters
  const employeeFilterMemory = useDropdownMemory({ key: createDropdownKey('reporting', 'employee') });
  const standardFilterMemory = useDropdownMemory({ key: createDropdownKey('reporting', 'standard') });
  const supervisorFilterMemory = useDropdownMemory({ key: createDropdownKey('reporting', 'supervisor') });

  const [filters, setFilters] = useState<FilterState>({
    selectedEmployee: employeeFilterMemory.value,
    selectedStandard: standardFilterMemory.value,
    selectedSupervisor: supervisorFilterMemory.value,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days ago
      end: new Date().toISOString().split("T")[0], // today
    },
  });

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    if (!dashboardData) return null;

    let filtered = dashboardData.observations.filter((obs) => {
      const obsDate = new Date(obs.createdAt);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day

      return obsDate >= startDate && obsDate <= endDate;
    });

    if (filters.selectedEmployee) {
      filtered = filtered.filter(
        (obs) => obs.userId === filters.selectedEmployee,
      );
    }

    if (filters.selectedStandard) {
      filtered = filtered.filter(
        (obs) => obs.standardId.toString() === filters.selectedStandard,
      );
    }

    if (filters.selectedSupervisor) {
      filtered = filtered.filter(
        (obs) => obs.supervisorSignature === filters.selectedSupervisor,
      );
    }

    return filtered;
  }, [dashboardData, filters]);

  // Get unique supervisors from observations
  const supervisors = useMemo(() => {
    if (!dashboardData) return [];
    const uniqueSupervisors = [
      ...new Set(
        dashboardData.observations.map((obs) => obs.supervisorSignature),
      ),
    ];
    return uniqueSupervisors.filter(Boolean);
  }, [dashboardData]);

  // Navigation functions
  const nextDashboard = () => {
    setCurrentDashboard((currentDashboard + 1) % dashboards.length);
  };

  const prevDashboard = () => {
    setCurrentDashboard(
      (currentDashboard - 1 + dashboards.length) % dashboards.length,
    );
  };

  // Dashboard-specific calculations
  const calculateDashboardData = (dashboardId: string) => {
    if (!filteredData || filteredData.length === 0) return null;

    switch (dashboardId) {
      case "employee-vs-mean":
        return calculateEmployeeVsMean();
      case "standard-variation":
        return calculateStandardVariation();
      case "grade-factor-variation":
        return calculateGradeFactorVariation();
      case "supervisor-variation":
        return calculateSupervisorVariation();
      case "control-chart":
        return calculateControlChart();
      case "distribution-trend":
        return calculateDistributionTrend();
      case "employee-distribution":
        return calculateEmployeeDistribution();
      default:
        return null;
    }
  };

  const calculateEmployeeVsMean = () => {
    if (!filters.selectedStandard)
      return { error: "Please select a standard to view this analysis" };

    const standardData =
      filteredData?.filter(
        (obs) => obs.standardId.toString() === filters.selectedStandard,
      ) || [];
    if (standardData.length === 0)
      return { error: "No data available for selected standard" };

    const meanPerformance =
      standardData.reduce((sum, obs) => sum + obs.observedPerformance, 0) /
      standardData.length;

    const employeeStats = standardData.reduce((acc, obs) => {
      if (!acc[obs.userId]) {
        acc[obs.userId] = {
          user: obs.user,
          performances: [],
          avgPerformance: 0,
        };
      }
      acc[obs.userId].performances.push(obs.observedPerformance);
      return acc;
    }, {} as any);

    Object.keys(employeeStats).forEach((userId) => {
      const stats = employeeStats[userId];
      stats.avgPerformance =
        stats.performances.reduce(
          (sum: number, perf: number) => sum + perf,
          0,
        ) / stats.performances.length;
      stats.varianceFromMean = stats.avgPerformance - meanPerformance;
    });

    return {
      meanPerformance,
      employeeStats: Object.values(employeeStats),
      totalObservations: standardData.length,
    };
  };

  const calculateStandardVariation = () => {
    if (!filters.selectedStandard)
      return { error: "Please select a standard to view this analysis" };

    const standardData =
      filteredData?.filter(
        (obs) => obs.standardId.toString() === filters.selectedStandard,
      ) || [];
    if (standardData.length === 0)
      return { error: "No data available for selected standard" };

    const performances = standardData.map((obs) => obs.observedPerformance);
    const mean =
      performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
    const variance =
      performances.reduce((sum, perf) => sum + Math.pow(perf - mean, 2), 0) /
      performances.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      variance,
      standardDeviation: stdDev,
      min: Math.min(...performances),
      max: Math.max(...performances),
      range: Math.max(...performances) - Math.min(...performances),
      dataPoints: standardData.map((obs) => ({
        date: obs.createdAt,
        performance: obs.observedPerformance,
        employee: obs.user.name,
      })),
    };
  };

  const calculateGradeFactorVariation = () => {
    if (!filters.selectedStandard)
      return { error: "Please select a standard to view this analysis" };

    const standardData =
      filteredData?.filter(
        (obs) => obs.standardId.toString() === filters.selectedStandard,
      ) || [];
    if (standardData.length === 0)
      return { error: "No data available for selected standard" };

    const dataPoints = standardData.map((obs) => ({
      observedPerformance: obs.observedPerformance,
      gradeFactor: obs.pumpScore,
      employee: obs.user.name,
      date: obs.createdAt,
      variance: Math.abs(obs.observedPerformance - obs.pumpScore),
    }));

    const avgVariance =
      dataPoints.reduce((sum, point) => sum + point.variance, 0) /
      dataPoints.length;

    return {
      dataPoints,
      averageVariance: avgVariance,
      correlation: calculateCorrelation(
        dataPoints.map((p) => p.observedPerformance),
        dataPoints.map((p) => p.gradeFactor),
      ),
    };
  };

  const calculateSupervisorVariation = () => {
    if (!filters.selectedSupervisor)
      return { error: "Please select a supervisor to view this analysis" };

    const supervisorData =
      filteredData?.filter(
        (obs) => obs.supervisorSignature === filters.selectedSupervisor,
      ) || [];
    if (supervisorData.length === 0)
      return { error: "No data available for selected supervisor" };

    const gradeFactors = supervisorData.map((obs) => obs.pumpScore);
    const mean =
      gradeFactors.reduce((sum, score) => sum + score, 0) / gradeFactors.length;
    const variance =
      gradeFactors.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      gradeFactors.length;

    return {
      mean,
      variance,
      standardDeviation: Math.sqrt(variance),
      dataPoints: supervisorData.map((obs) => ({
        date: obs.createdAt,
        gradeFactor: obs.pumpScore,
        employee: obs.user.name,
        standard: obs.standard.name,
      })),
    };
  };

  const calculateControlChart = () => {
    if (!filters.selectedStandard)
      return { error: "Please select a standard to view this analysis" };

    const standardData =
      filteredData?.filter(
        (obs) => obs.standardId.toString() === filters.selectedStandard,
      ) || [];
    if (standardData.length === 0)
      return { error: "No data available for selected standard" };

    const sortedData = standardData.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const observedPerformances = sortedData.map(
      (obs) => obs.observedPerformance,
    );
    const gradeFactors = sortedData.map((obs) => obs.pumpScore);

    const obsAvg =
      observedPerformances.reduce((sum, perf) => sum + perf, 0) /
      observedPerformances.length;
    const gradeAvg =
      gradeFactors.reduce((sum, grade) => sum + grade, 0) / gradeFactors.length;

    const obsStdDev = Math.sqrt(
      observedPerformances.reduce(
        (sum, perf) => sum + Math.pow(perf - obsAvg, 2),
        0,
      ) / observedPerformances.length,
    );
    const gradeStdDev = Math.sqrt(
      gradeFactors.reduce(
        (sum, grade) => sum + Math.pow(grade - gradeAvg, 2),
        0,
      ) / gradeFactors.length,
    );

    return {
      dataPoints: sortedData.map((obs) => ({
        date: obs.createdAt,
        observedPerformance: obs.observedPerformance,
        gradeFactor: obs.pumpScore,
        employee: obs.user.name,
      })),
      observedStats: {
        average: obsAvg,
        upperControlLimit: obsAvg + 3 * obsStdDev,
        lowerControlLimit: obsAvg - 3 * obsStdDev,
      },
      gradeFactorStats: {
        average: gradeAvg,
        upperControlLimit: gradeAvg + 3 * gradeStdDev,
        lowerControlLimit: gradeAvg - 3 * gradeStdDev,
      },
    };
  };

  const calculateDistributionTrend = () => {
    if (!filters.selectedStandard)
      return { error: "Please select a standard to view this analysis" };

    const standardData =
      filteredData?.filter(
        (obs) => obs.standardId.toString() === filters.selectedStandard,
      ) || [];
    if (standardData.length === 0)
      return { error: "No data available for selected standard" };

    const dataPoints = standardData.map((obs) => ({
      observedPerformance: obs.observedPerformance,
      gradeFactor: obs.pumpScore,
      employee: obs.user.name,
      date: obs.createdAt,
    }));

    // Create distribution buckets
    const buckets = {
      "80-90": { observed: 0, gradeFactor: 0 },
      "90-100": { observed: 0, gradeFactor: 0 },
      "100-110": { observed: 0, gradeFactor: 0 },
      "110+": { observed: 0, gradeFactor: 0 },
    };

    dataPoints.forEach((point) => {
      const obsBucket =
        point.observedPerformance < 90
          ? "80-90"
          : point.observedPerformance < 100
            ? "90-100"
            : point.observedPerformance < 110
              ? "100-110"
              : "110+";

      const gradeBucket =
        point.gradeFactor < 90
          ? "80-90"
          : point.gradeFactor < 100
            ? "90-100"
            : point.gradeFactor < 110
              ? "100-110"
              : "110+";

      buckets[obsBucket as keyof typeof buckets].observed++;
      buckets[gradeBucket as keyof typeof buckets].gradeFactor++;
    });

    return {
      buckets,
      dataPoints,
      totalPoints: dataPoints.length,
    };
  };

  const calculateEmployeeDistribution = () => {
    if (!filters.selectedStandard)
      return { error: "Please select a standard to view this analysis" };

    const standardData =
      filteredData?.filter(
        (obs) => obs.standardId.toString() === filters.selectedStandard,
      ) || [];
    if (standardData.length === 0)
      return { error: "No data available for selected standard" };

    const employeeData = standardData.reduce((acc, obs) => {
      if (!acc[obs.userId]) {
        acc[obs.userId] = {
          user: obs.user,
          performances: [],
        };
      }
      acc[obs.userId].performances.push(obs.observedPerformance);
      return acc;
    }, {} as any);

    const employeePoints = Object.values(employeeData).map((emp: any) => ({
      employee: emp.user.name,
      avgPerformance:
        emp.performances.reduce((sum: number, perf: number) => sum + perf, 0) /
        emp.performances.length,
      observationCount: emp.performances.length,
      performances: emp.performances,
    }));

    const overallMean =
      standardData.reduce((sum, obs) => sum + obs.observedPerformance, 0) /
      standardData.length;

    return {
      employeePoints,
      overallMean,
      totalEmployees: employeePoints.length,
      totalObservations: standardData.length,
    };
  };

  // Helper function to calculate correlation coefficient
  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
    );

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const renderDashboard = () => {
    const currentDashboardId = dashboards[currentDashboard].id;
    const dashboardCalcData = calculateDashboardData(currentDashboardId);

    if (!dashboardCalcData) {
      return (
        <div className="h-96 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">No data available</p>
            <p>Please adjust your filters or date range</p>
          </div>
        </div>
      );
    }

    if (dashboardCalcData.error) {
      return (
        <div className="h-96 flex items-center justify-center text-red-500">
          <div className="text-center">
            <p className="text-lg mb-2">Configuration Required</p>
            <p>{dashboardCalcData.error}</p>
          </div>
        </div>
      );
    }

    switch (currentDashboardId) {
      case "employee-vs-mean":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-semibold">
                Mean Performance:{" "}
                {dashboardCalcData.meanPerformance?.toFixed(1)}%
              </h4>
              <p className="text-sm text-gray-600">
                Based on {dashboardCalcData.totalObservations} observations
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardCalcData.employeeStats?.map(
                (emp: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded border border-gray-200"
                  >
                    <h5 className="font-medium">{emp.user.name}</h5>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Performance:</span>
                        <span className="font-semibold">
                          {emp.avgPerformance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>vs Mean:</span>
                        <span
                          className={`font-semibold ${emp.varianceFromMean >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {emp.varianceFromMean >= 0 ? "+" : ""}
                          {emp.varianceFromMean.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Observations:</span>
                        <span>{emp.performances.length}</span>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        );

      case "standard-variation":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.mean?.toFixed(1)}%
                </h5>
                <p className="text-sm text-gray-600">Mean Performance</p>
              </div>
              <div className="bg-green-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.standardDeviation?.toFixed(1)}%
                </h5>
                <p className="text-sm text-gray-600">Standard Deviation</p>
              </div>
              <div className="bg-orange-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.range?.toFixed(1)}%
                </h5>
                <p className="text-sm text-gray-600">Range</p>
              </div>
              <div className="bg-purple-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.dataPoints?.length}
                </h5>
                <p className="text-sm text-gray-600">Data Points</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4">
              <h5 className="font-medium mb-3">Recent Performance Data</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardCalcData.dataPoints
                  ?.slice(0, 10)
                  .map((point: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100"
                    >
                      <span className="text-sm">{point.employee}</span>
                      <span className="text-sm">
                        {new Date(point.date).toLocaleDateString()}
                      </span>
                      <span className="font-semibold">
                        {point.performance.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case "grade-factor-variation":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.averageVariance?.toFixed(1)}%
                </h5>
                <p className="text-sm text-gray-600">Average Variance</p>
              </div>
              <div className="bg-green-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.correlation?.toFixed(3)}
                </h5>
                <p className="text-sm text-gray-600">Correlation Coefficient</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4">
              <h5 className="font-medium mb-3">
                Performance vs Grade Factor Comparison
              </h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardCalcData.dataPoints
                  ?.slice(0, 10)
                  .map((point: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 text-sm"
                    >
                      <span>{point.employee}</span>
                      <span>{point.observedPerformance.toFixed(1)}%</span>
                      <span>{point.gradeFactor.toFixed(1)}%</span>
                      <span
                        className={`font-semibold ${point.variance < 10 ? "text-green-600" : point.variance < 20 ? "text-orange-600" : "text-red-600"}`}
                      >
                        Δ {point.variance.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case "supervisor-variation":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.mean?.toFixed(1)}%
                </h5>
                <p className="text-sm text-gray-600">Mean Grade Factor</p>
              </div>
              <div className="bg-green-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.standardDeviation?.toFixed(1)}%
                </h5>
                <p className="text-sm text-gray-600">Standard Deviation</p>
              </div>
              <div className="bg-orange-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.dataPoints?.length}
                </h5>
                <p className="text-sm text-gray-600">Observations</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4">
              <h5 className="font-medium mb-3">Supervisor Performance Data</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardCalcData.dataPoints
                  ?.slice(0, 10)
                  .map((point: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 text-sm"
                    >
                      <span>{point.employee}</span>
                      <span>{point.standard}</span>
                      <span>{new Date(point.date).toLocaleDateString()}</span>
                      <span className="font-semibold">
                        {point.gradeFactor.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case "control-chart":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h5 className="font-medium mb-2">
                  Observed Performance Control Limits
                </h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>UCL:</span>
                    <span className="font-semibold">
                      {dashboardCalcData.observedStats?.upperControlLimit.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-semibold">
                      {dashboardCalcData.observedStats?.average.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>LCL:</span>
                    <span className="font-semibold">
                      {dashboardCalcData.observedStats?.lowerControlLimit.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h5 className="font-medium mb-2">
                  Grade Factor Control Limits
                </h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>UCL:</span>
                    <span className="font-semibold">
                      {dashboardCalcData.gradeFactorStats?.upperControlLimit.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-semibold">
                      {dashboardCalcData.gradeFactorStats?.average.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>LCL:</span>
                    <span className="font-semibold">
                      {dashboardCalcData.gradeFactorStats?.lowerControlLimit.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4">
              <h5 className="font-medium mb-3">Control Chart Data Points</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardCalcData.dataPoints
                  ?.slice(0, 10)
                  .map((point: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 text-sm"
                    >
                      <span>{point.employee}</span>
                      <span>{new Date(point.date).toLocaleDateString()}</span>
                      <span>Obs: {point.observedPerformance.toFixed(1)}%</span>
                      <span>GF: {point.gradeFactor.toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case "distribution-trend":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(dashboardCalcData.buckets || {}).map(
                ([range, data]: [string, any]) => (
                  <div
                    key={range}
                    className="bg-gray-50 p-4 rounded text-center"
                  >
                    <h5 className="font-semibold text-lg">{range}%</h5>
                    <div className="text-sm space-y-1">
                      <div>Observed: {data.observed}</div>
                      <div>Grade Factor: {data.gradeFactor}</div>
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded p-4">
              <h5 className="font-medium mb-3">
                Distribution Analysis ({dashboardCalcData.totalPoints} points)
              </h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardCalcData.dataPoints
                  ?.slice(0, 10)
                  .map((point: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 text-sm"
                    >
                      <span>{point.employee}</span>
                      <span>{new Date(point.date).toLocaleDateString()}</span>
                      <span>Obs: {point.observedPerformance.toFixed(1)}%</span>
                      <span>GF: {point.gradeFactor.toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case "employee-distribution":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.overallMean?.toFixed(1)}%
                </h5>
                <p className="text-sm text-gray-600">Overall Mean</p>
              </div>
              <div className="bg-green-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.totalEmployees}
                </h5>
                <p className="text-sm text-gray-600">Employees</p>
              </div>
              <div className="bg-orange-50 p-4 rounded text-center">
                <h5 className="font-semibold text-lg">
                  {dashboardCalcData.totalObservations}
                </h5>
                <p className="text-sm text-gray-600">Total Observations</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4">
              <h5 className="font-medium mb-3">
                Employee Performance Distribution
              </h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardCalcData.employeePoints?.map(
                  (emp: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100"
                    >
                      <span className="text-sm font-medium">
                        {emp.employee}
                      </span>
                      <div className="flex gap-4 text-sm">
                        <span>Avg: {emp.avgPerformance.toFixed(1)}%</span>
                        <span>Obs: {emp.observationCount}</span>
                        <span
                          className={`font-semibold ${emp.avgPerformance >= dashboardCalcData.overallMean ? "text-green-600" : "text-red-600"}`}
                        >
                          {emp.avgPerformance >= dashboardCalcData.overallMean
                            ? "↑"
                            : "↓"}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-96 flex items-center justify-center text-gray-500">
            Dashboard not implemented
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Banner title="Insight" subtitle="Analytics and Reporting Dashboard" />
        <div className="flex justify-center items-center h-96">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner title="Insight" subtitle="Analytics and Reporting Dashboard" />

      <div className="flex flex-row h-full">
        <Sidebar
          title="Insight Reporting"
          sections={[
            {
              title: "Performance Analytics",
              items: [
                { label: "Employee Performance" },
                { label: "Standard Analysis" },
                { label: "Supervisor Analytics" },
                { label: "Trend Analysis" },
              ],
            },
            {
              title: "Reports",
              items: [
                { label: "Control Charts" },
                { label: "Distribution Analysis" },
                { label: "Variance Reports" },
                { label: "Export Data" },
              ],
            },
          ]}
        />

        <main className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4">Dashboard Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <select
                  value={filters.selectedEmployee}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      selectedEmployee: e.target.value,
                    }));
                    employeeFilterMemory.setValue(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Employees</option>
                  {dashboardData?.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard
                </label>
                <select
                  value={filters.selectedStandard}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      selectedStandard: e.target.value,
                    }));
                    standardFilterMemory.setValue(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Standards</option>
                  {dashboardData?.standards.map((standard) => (
                    <option key={standard.id} value={standard.id.toString()}>
                      {standard.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor
                </label>
                <select
                  value={filters.selectedSupervisor}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      selectedSupervisor: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Supervisors</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor} value={supervisor}>
                      {supervisor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value },
                      }))
                    }
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value },
                      }))
                    }
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Carousel */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {dashboards[currentDashboard].title}
                </h3>
                <p className="text-sm text-gray-600">
                  {dashboards[currentDashboard].description}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-600">
                  {currentDashboard + 1} of {dashboards.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={prevDashboard}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white cursor-pointer hover:bg-gray-50"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextDashboard}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white cursor-pointer hover:bg-gray-50"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="bg-white rounded-lg p-6 border border-gray-300 min-h-[400px]">
              {renderDashboard()}
            </div>

            {/* Dashboard Navigation Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {dashboards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentDashboard(i)}
                  className="w-3 h-3 rounded-full border-none p-0 cursor-pointer transition-colors duration-300"
                  style={{
                    backgroundColor:
                      currentDashboard === i ? "#666" : "#e2e2e2",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Summary Statistics */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 text-center">
                <h3 className="text-2xl font-bold text-blue-600">
                  {dashboardData.summary.totalObservations}
                </h3>
                <p className="text-sm text-gray-600">Total Observations</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 text-center">
                <h3 className="text-2xl font-bold text-green-600">
                  {dashboardData.summary.avgObservedPerformance.toFixed(1)}%
                </h3>
                <p className="text-sm text-gray-600">
                  Avg Observed Performance
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 text-center">
                <h3 className="text-2xl font-bold text-orange-600">
                  {dashboardData.summary.avgPumpScore.toFixed(1)}%
                </h3>
                <p className="text-sm text-gray-600">Avg Grade Factor</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 text-center">
                <h3 className="text-2xl font-bold text-purple-600">
                  {dashboardData.summary.totalUsers}
                </h3>
                <p className="text-sm text-gray-600">Active Employees</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 text-center">
                <h3 className="text-2xl font-bold text-red-600">
                  {dashboardData.summary.totalStandards}
                </h3>
                <p className="text-sm text-gray-600">Standards in Use</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
