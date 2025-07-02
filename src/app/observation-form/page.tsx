"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

type Row = {
  id: number;
  uom: string;
  description: string;
  quantity: number;
  samValue: number;
  tags?: string[];
  originalIndex: number; // Track original position for restoration
};

type Standard = {
  id: number;
  name: string;
  facility: { name: string };
  department: { name: string };
  area: { name: string };
  uomEntries: {
    id: number;
    uom: string;
    description: string;
    samValue: number;
    tags?: string[];
  }[];
  bestPractices: string[];
  processOpportunities: string[];
};

type Delay = {
  reason: string;
  duration: number;
  timestamp: string;
};

type PreviousObservation = {
  date: string;
  observedPerf: string;
  gradeFactorPerf: string;
};

export default function GazeObservationApp() {
  // Database state
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStandardData, setSelectedStandardData] =
    useState<Standard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Observation tracking
  const [isObserving, setIsObserving] = useState(false);
  const [timeObserved, setTimeObserved] = useState(0);
  const [totalSams, setTotalSams] = useState(0);
  const [employeeId, setEmployeeId] = useState("");
  const [observationReason, setObservationReason] = useState("");
  const [standard, setStandard] = useState("");

  // Multi-level standard selection state
  const [showStandardDropdown, setShowStandardDropdown] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [observedPerformance, setObservedPerformance] = useState(0);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [observationStartTime, setObservationStartTime] = useState<
    number | null
  >(null);
  const [observationEndTime, setObservationEndTime] = useState<number | null>(
    null,
  );

  // PUMP scoring (Grade Factor %)
  const [pace, setPace] = useState(100);
  const [utilization, setUtilization] = useState(100);
  const [methods, setMethods] = useState(100);
  const [pumpScore, setPumpScore] = useState(0);

  // Form data
  const [comments, setComments] = useState("");
  const [supervisorSignature, setSupervisorSignature] = useState("");
  const [teamMemberSignature, setTeamMemberSignature] = useState("");
  const [aiNotes, setAiNotes] = useState("");

  // Delay tracking with timer functionality
  const [isDelayActive, setIsDelayActive] = useState(false);
  const [delayStartTime, setDelayStartTime] = useState<number | null>(null);
  const [delayReason, setDelayReason] = useState("");
  const [delays, setDelays] = useState<Delay[]>([]);

  // Best practices and process adherence
  const [bestPracticesChecked, setBestPracticesChecked] = useState<string[]>(
    [],
  );
  const [processAdherenceChecked, setProcessAdherenceChecked] = useState<
    string[]
  >([]);

  // Data rows for operations (dynamically populated from selected standard)
  const [rows, setRows] = useState<Row[]>([]);
  const [originalRowOrder, setOriginalRowOrder] = useState<Row[]>([]);

  // Dynamic grouping state
  const [activeRowIds, setActiveRowIds] = useState<Set<number>>(new Set());
  const [isDynamicGroupingActive, setIsDynamicGroupingActive] = useState(false);

  // UI state
  const [showPreviousObservations, setShowPreviousObservations] =
    useState(false);
  const [showReasonInstructions, setShowReasonInstructions] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "Employee Previous Observed Performance",
    "Observed Standard Variation",
    "Grade Factor vs. Observed Standard Variation",
    "Supervisor Grade Factor Variation",
    "Observed, System, and Grade Factor Performance Control Chart",
    "Employee compared to population in Observed performance",
    "Distribution trend of Observed Performance vs. Standard",
    "Distribution trend of System performance vs. Standard",
  ];

  // Previous observations data for popup
  const previousObservations: Record<
    string,
    Record<string, PreviousObservation[]>
  > = {
    emp001: {
      std1: [
        { date: "2024-01-15", observedPerf: "95.2", gradeFactorPerf: "98.1" },
        { date: "2024-01-10", observedPerf: "92.8", gradeFactorPerf: "96.5" },
        { date: "2024-01-05", observedPerf: "98.1", gradeFactorPerf: "102.3" },
        { date: "2023-12-28", observedPerf: "89.8", gradeFactorPerf: "94.2" },
        { date: "2023-12-20", observedPerf: "101.5", gradeFactorPerf: "105.8" },
      ],
    },
    emp002: {
      std2: [
        { date: "2024-01-12", observedPerf: "88.5", gradeFactorPerf: "91.2" },
        { date: "2024-01-08", observedPerf: "93.1", gradeFactorPerf: "97.8" },
      ],
    },
    emp003: {
      std3: [
        { date: "2024-01-14", observedPerf: "102.3", gradeFactorPerf: "106.1" },
      ],
    },
  };

  // Smart UOM grouping logic
  const getActiveTagsForRows = useCallback(
    (activeIds: Set<number>) => {
      const activeTags = new Set<string>();
      rows.forEach((row) => {
        if (activeIds.has(row.id) && row.tags) {
          row.tags.forEach((tag) => activeTags.add(tag));
        }
      });
      return activeTags;
    },
    [rows],
  );

  const getRowsWithSharedTags = useCallback(
    (activeIds: Set<number>) => {
      const activeTags = getActiveTagsForRows(activeIds);
      if (activeTags.size === 0) return activeIds;

      const rowsWithSharedTags = new Set<number>();
      rows.forEach((row) => {
        if (row.tags && row.tags.some((tag) => activeTags.has(tag))) {
          rowsWithSharedTags.add(row.id);
        }
      });
      return rowsWithSharedTags;
    },
    [rows, getActiveTagsForRows],
  );

  // Dynamic row ordering based on active state and tags
  const organizedRows = useMemo(() => {
    if (!isDynamicGroupingActive || activeRowIds.size === 0) {
      // Return original order when not actively grouping
      return originalRowOrder.length > 0 ? originalRowOrder : rows;
    }

    const rowsWithSharedTags = getRowsWithSharedTags(activeRowIds);
    const activeGroupedRows: Row[] = [];
    const inactiveRows: Row[] = [];

    rows.forEach((row) => {
      if (rowsWithSharedTags.has(row.id)) {
        activeGroupedRows.push(row);
      } else {
        inactiveRows.push(row);
      }
    });

    // Sort active grouped rows by their shared tags for better organization
    activeGroupedRows.sort((a, b) => {
      const aHasActiveTags = a.tags?.some((tag) =>
        getActiveTagsForRows(activeRowIds).has(tag),
      );
      const bHasActiveTags = b.tags?.some((tag) =>
        getActiveTagsForRows(activeRowIds).has(tag),
      );

      if (aHasActiveTags && !bHasActiveTags) return -1;
      if (!aHasActiveTags && bHasActiveTags) return 1;
      return a.originalIndex - b.originalIndex;
    });

    return [...activeGroupedRows, ...inactiveRows];
  }, [
    rows,
    originalRowOrder,
    activeRowIds,
    isDynamicGroupingActive,
    getRowsWithSharedTags,
    getActiveTagsForRows,
  ]);

  // Helper functions for multi-level dropdown
  const getUniqueOrganizations = () => {
    const organizations = new Set();
    standards.forEach((std) => {
      // Assuming facility has organization info, or we can extract from facility name
      organizations.add(std.facility.name.split(" - ")[0] || std.facility.name);
    });
    return Array.from(organizations) as string[];
  };

  const getUniqueFacilities = (organization?: string) => {
    return standards
      .filter(
        (std) => !organization || std.facility.name.includes(organization),
      )
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
        (!selectedDepartment || std.department.name === selectedDepartment) &&
        (!selectedArea || std.area.name === selectedArea),
    );
  };

  const resetStandardSelection = () => {
    setStandard("");
    setSelectedOrganization("");
    setSelectedFacility("");
    setSelectedDepartment("");
    setSelectedArea("");
    setShowStandardDropdown(false);
  };

  const getSelectedStandardDisplay = () => {
    if (standard && standards.length > 0) {
      const selectedStd = standards.find((s) => s.id === Number(standard));
      if (selectedStd) {
        return `${selectedStd.name} (${selectedStd.facility.name} / ${selectedStd.department.name} / ${selectedStd.area.name})`;
      }
    }
    return "Select Standard";
  };

  // Database operations via API
  const loadStandards = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/standards");
      if (!response.ok) {
        throw new Error("Failed to fetch standards");
      }
      const data = await response.json();
      setStandards(data);
    } catch (error) {
      console.error("Error loading standards:", error);
      setError("Failed to load standards");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedStandard = async (standardId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/standards/${standardId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch standard details");
      }
      const data = await response.json();
      if (data) {
        setSelectedStandardData(data);
        // Update rows with UOM entries from the selected standard
        const newRows = data.uomEntries.map((entry, index) => ({
          id: index + 1,
          uom: entry.uom,
          description: entry.description,
          quantity: 0,
          samValue: entry.samValue,
          tags: entry.tags || [],
          originalIndex: index,
        }));
        setRows(newRows);
        setOriginalRowOrder([...newRows]);

        // Reset dynamic grouping state
        setActiveRowIds(new Set());
        setIsDynamicGroupingActive(false);

        // Reset checkboxes when standard changes
        setBestPracticesChecked([]);
        setProcessAdherenceChecked([]);
      }
    } catch (error) {
      console.error("Error loading standard details:", error);
      setError("Failed to load standard details");
    } finally {
      setIsLoading(false);
    }
  };

  // Methods
  const startObservation = () => {
    if (!isObserving && !isFinalized) {
      setIsObserving(true);
      setObservationStartTime(Date.now());
      const interval = setInterval(() => {
        setTimeObserved((prev) => {
          const newTime = prev + 1 / 60;
          return newTime;
        });
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const stopObservation = () => {
    if (isObserving) {
      setIsObserving(false);
      setIsFinalized(true);
      setObservationEndTime(Date.now());
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // When observation stops, return to original order
      setIsDynamicGroupingActive(false);
      setActiveRowIds(new Set());
    }
  };

  const calculatePerformance = () => {
    if (timeObserved > 0) {
      const performance = (totalSams / timeObserved) * 100;
      setObservedPerformance(Number(performance.toFixed(2)));
    }
    // Calculate PUMP score and round to nearest 5% increment
    const score = (pace * utilization * methods) / 10000;
    const roundedScore = Math.round(score / 5) * 5;
    setPumpScore(roundedScore);
  };

  const updateQuantity = (id: number, value: number) => {
    setRows((prevRows) => {
      const newRows = prevRows.map((row) =>
        row.id === id ? { ...row, quantity: Math.max(0, value) } : row,
      );
      return newRows;
    });

    // Handle dynamic grouping logic
    const newActiveRowIds = new Set(activeRowIds);
    if (value > 0) {
      newActiveRowIds.add(id);
      setIsDynamicGroupingActive(true);
    } else {
      newActiveRowIds.delete(id);
      if (newActiveRowIds.size === 0) {
        setIsDynamicGroupingActive(false);
      }
    }
    setActiveRowIds(newActiveRowIds);
  };

  const calculateTotalSams = () => {
    const total = rows.reduce(
      (sum, row) => sum + row.quantity * row.samValue,
      0,
    );
    setTotalSams(total);
  };

  // Delay timer functionality
  const startDelay = () => {
    if (!isDelayActive && delayReason) {
      setIsDelayActive(true);
      setDelayStartTime(Date.now());
    }
  };

  const stopDelay = () => {
    if (isDelayActive && delayStartTime) {
      const duration = (Date.now() - delayStartTime) / 1000;
      setDelays((prev) => [
        ...prev,
        {
          reason: delayReason,
          duration: duration,
          timestamp: new Date().toLocaleString(),
        },
      ]);
      setIsDelayActive(false);
      setDelayReason("");
      setDelayStartTime(null);
    }
  };

  // Best practices tracking
  const toggleBestPractice = (practice: string) => {
    setBestPracticesChecked((prev) => {
      const index = prev.indexOf(practice);
      if (index > -1) {
        return prev.filter((p) => p !== practice);
      } else {
        return [...prev, practice];
      }
    });
  };

  // Process adherence tracking
  const toggleProcessAdherence = (opportunity: string) => {
    setProcessAdherenceChecked((prev) => {
      const index = prev.indexOf(opportunity);
      if (index > -1) {
        return prev.filter((p) => p !== opportunity);
      } else {
        return [...prev, opportunity];
      }
    });
  };

  const generateAINotes = () => {
    const performanceLevel = Number(observedPerformance) >= 95;
    const perfDiff = Math.abs(Number(observedPerformance) - Number(pumpScore));

    const highPerformanceFeedback =
      "Your consistent high performance is impressive. You demonstrate excellent understanding of the standard procedures and maintain quality while achieving strong productivity metrics.";
    const improvementFeedback =
      "I see great potential in your work. Focus on maintaining consistent pace while ensuring all safety and quality protocols are followed.";

    const feedback = performanceLevel
      ? highPerformanceFeedback
      : improvementFeedback;

    const validationNote =
      perfDiff > 25
        ? " Note: Due to the significant difference between observed performance and PUMP Grade Factor Performance, additional observations will be conducted to validate standard alignment with expectations."
        : "";

    const observationDetails =
      "During today's observation, I noticed your attention to detail and commitment to following established procedures. Your work demonstrates understanding of the process flow and safety requirements. ";

    setAiNotes(`${observationDetails}${feedback}${validationNote}`);
  };

  const validateObservation = () => {
    if (!employeeId) return "Employee ID is required";
    if (!observationReason) return "Observation reason is required";
    if (!standard) return "Standard is required";
    if (!selectedStandardData) return "Selected standard data not loaded";
    if (!timeObserved) return "No time observed recorded";
    if (!totalSams) return "No SAMs recorded";
    if (!pace || pace <= 0) return "Valid Pace percentage is required";
    if (!utilization || utilization <= 0)
      return "Valid Utilization percentage is required";
    if (!methods || methods <= 0)
      return "Valid Methods and Procedures percentage is required";
    if (!supervisorSignature) return "Supervisor signature required";
    if (isObserving) return "Please stop the observation before submitting";
    return null;
  };

  const submitObservation = async () => {
    if (isSubmitting) return;

    const validationError = validateObservation();
    if (validationError) {
      setSubmissionError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");
    setSubmissionSuccess(false);

    try {
      // Find or create user
      let user;
      try {
        const userResponse = await fetch(`/api/users?employeeId=${employeeId}`);
        if (userResponse.ok) {
          user = await userResponse.json();
        }
      } catch (error) {
        // User not found, will create below
      }

      if (!user) {
        // Get employee name from the select option
        const employeeName =
          employeeId === "emp001"
            ? "John Smith"
            : employeeId === "emp002"
              ? "Sarah Johnson"
              : "Michael Brown";

        const createUserResponse = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId,
            name: employeeName,
            department: selectedStandardData?.department.name,
          }),
        });

        if (!createUserResponse.ok) {
          throw new Error("Failed to create user");
        }
        user = await createUserResponse.json();
      }

      if (!selectedStandardData) {
        throw new Error("No standard selected");
      }

      // Prepare observation data
      const observationData = rows.map((row) => ({
        uom: row.uom,
        description: row.description,
        quantity: row.quantity,
        samValue: row.samValue,
        totalSams: row.quantity * row.samValue,
      }));

      // Create observation
      const observationResponse = await fetch("/api/observations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          standardId: selectedStandardData.id,
          timeObserved,
          totalSams,
          observedPerformance,
          pumpScore,
          pace,
          utilization,
          methods,
          comments,
          aiNotes,
          supervisorSignature,
          teamMemberSignature,
          bestPracticesChecked,
          processAdherenceChecked,
          delays,
          observationReason,
          observationStartTime: observationStartTime
            ? new Date(observationStartTime)
            : undefined,
          observationEndTime: observationEndTime
            ? new Date(observationEndTime)
            : undefined,
          isFinalized,
          observationData,
        }),
      });

      if (!observationResponse.ok) {
        throw new Error("Failed to create observation");
      }

      setSubmissionSuccess(true);
      resetForm();

      setTimeout(() => {
        setSubmissionSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting observation:", error);
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Failed to submit observation. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmployeeId("");
    setObservationReason("");
    setStandard("");
    resetStandardSelection();
    setSelectedStandardData(null);
    setRows([]);
    setOriginalRowOrder([]);
    setActiveRowIds(new Set());
    setIsDynamicGroupingActive(false);
    setTimeObserved(0);
    setPace(100);
    setUtilization(100);
    setMethods(100);
    setPumpScore(0);
    setBestPracticesChecked([]);
    setProcessAdherenceChecked([]);
    setComments("");
    setSupervisorSignature("");
    setTeamMemberSignature("");
    setObservedPerformance(0);
    setAiNotes("");
    setIsFinalized(false);
    setIsObserving(false);
    setShowPreviousObservations(false);
    setDelays([]);
  };

  // Slide navigation for performance trends
  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  // Effects
  useEffect(() => {
    loadStandards();
  }, []);

  useEffect(() => {
    if (standard && standards.length > 0) {
      const selectedStd = standards.find((s) => s.id === Number(standard));
      if (selectedStd) {
        loadSelectedStandard(selectedStd.id);
      }
    }
  }, [standard, standards]);

  useEffect(() => {
    calculateTotalSams();
  }, [rows]);

  useEffect(() => {
    calculatePerformance();
  }, [timeObserved, totalSams, pace, utilization, methods]);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showStandardDropdown && !target.closest(".standard-dropdown")) {
        setShowStandardDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStandardDropdown]);

  // Helper function to get tag color
  const getTagColor = (tag: string, isActive: boolean) => {
    if (isActive) {
      return "bg-green-100 text-green-700 border-green-300";
    }
    return "bg-blue-100 text-blue-700 border-blue-300";
  };

  return (
    <div className="font-poppins text-black bg-gray-100 min-h-screen overflow-x-hidden">
      <div className="flex flex-col max-w-7xl mx-auto bg-gray-100 min-h-[calc(100vh-80px)] rounded-xl border border-gray-300 mt-5 p-5 overflow-y-auto">
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
                  Gaze Observation
                </span>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-red-600">
                Gaze Observation Application
              </h1>
              {isLoading && (
                <div className="text-blue-600 text-sm">Loading...</div>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Observation Details */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Observation Details
              </h3>

              {/* Standard Selection - Multi-level Dropdown */}
              <div className="mb-4 relative standard-dropdown">
                <button
                  onClick={() => setShowStandardDropdown(!showStandardDropdown)}
                  disabled={isObserving}
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white disabled:opacity-70 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className={standard ? "text-black" : "text-gray-500"}>
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
                            setSelectedDepartment("");
                            setSelectedArea("");
                            setStandard("");
                          }}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Choose Facility</option>
                          {getUniqueFacilities().map((facility) => (
                            <option key={facility.id} value={facility.name}>
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
                            value={selectedDepartment}
                            onChange={(e) => {
                              setSelectedDepartment(e.target.value);
                              setSelectedArea("");
                              setStandard("");
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
                      {selectedDepartment && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            3. Select Area
                          </label>
                          <select
                            value={selectedArea}
                            onChange={(e) => {
                              setSelectedArea(e.target.value);
                              setStandard("");
                            }}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Choose Area</option>
                            {getUniqueAreas(
                              selectedFacility,
                              selectedDepartment,
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
                            value={standard}
                            onChange={(e) => {
                              setStandard(e.target.value);
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

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    if (e.target.value) {
                      setShowPreviousObservations(true);
                    }
                  }}
                  disabled={isObserving}
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white disabled:opacity-70"
                >
                  <option value="">Select Employee</option>
                  <option value="emp001">John Smith (emp001)</option>
                  <option value="emp002">Sarah Johnson (emp002)</option>
                  <option value="emp003">Michael Brown (emp003)</option>
                </select>

                <select
                  value={observationReason}
                  onChange={(e) => {
                    setObservationReason(e.target.value);
                    if (e.target.value) {
                      setShowReasonInstructions(true);
                    }
                  }}
                  disabled={isObserving}
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white disabled:opacity-70"
                >
                  <option value="">Select Observation Reason</option>
                  <option value="performance">Performance Review</option>
                  <option value="training">Training Assessment</option>
                  <option value="incident">Incident Follow-up</option>
                  <option value="routine">Routine Check</option>
                </select>
              </div>
            </div>

            {/* Observation Timer and Controls */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {timeObserved.toFixed(2)}
                  </div>
                  <div className="text-gray-600">Minutes Observed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {totalSams.toFixed(2)}
                  </div>
                  <div className="text-gray-600">Total SAMs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {observedPerformance.toFixed(1)}%
                  </div>
                  <div className="text-gray-600">Observed Performance</div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={startObservation}
                  disabled={isObserving || isFinalized || !selectedStandardData}
                  className="px-6 py-3 bg-green-500 text-white border-none rounded-lg cursor-pointer font-medium disabled:opacity-70"
                >
                  Start Observation
                </button>
                <button
                  onClick={stopObservation}
                  disabled={!isObserving}
                  className="px-6 py-3 bg-red-500 text-white border-none rounded-lg cursor-pointer font-medium disabled:opacity-70"
                >
                  Stop Observation
                </button>
              </div>
            </div>

            {/* Standards Form */}
            {selectedStandardData && (
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
                <h3 className="text-lg font-semibold mb-6">Standards Form</h3>

                {/* UOM Operations Table */}
                <div className="bg-white rounded-lg p-6 border border-gray-300 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold">Operations</h4>
                    {isDynamicGroupingActive && (
                      <div className="text-sm text-green-600 font-medium">
                        🏷️ Smart grouping active - UOMs with shared tags are
                        grouped together
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="p-3 text-left font-semibold">UOM</th>
                          <th className="p-3 text-left font-semibold">
                            Description
                          </th>
                          <th className="p-3 text-left font-semibold">Tags</th>
                          <th className="p-3 text-center font-semibold">
                            Quantity
                          </th>
                          <th className="p-3 text-right font-semibold">
                            SAM Value
                          </th>
                          <th className="p-3 text-right font-semibold">
                            Total SAMs
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {organizedRows.map((row, index) => {
                          const isActive = activeRowIds.has(row.id);
                          const sharedTaggedRows = getRowsWithSharedTags(
                            new Set([row.id]),
                          );
                          const hasActiveSharedTags =
                            isDynamicGroupingActive &&
                            sharedTaggedRows.size > 1 &&
                            Array.from(sharedTaggedRows).some((id) =>
                              activeRowIds.has(id),
                            );

                          return (
                            <tr
                              key={row.id}
                              className={`border-b border-gray-300 transition-all duration-300 ${
                                isActive
                                  ? "bg-green-50"
                                  : hasActiveSharedTags
                                    ? "bg-blue-50"
                                    : ""
                              }`}
                            >
                              <td className="p-3 font-medium">{row.uom}</td>
                              <td className="p-3">{row.description}</td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {(row.tags || []).map((tag, tagIndex) => {
                                    const activeTags =
                                      getActiveTagsForRows(activeRowIds);
                                    const isTagActive = activeTags.has(tag);
                                    return (
                                      <span
                                        key={tagIndex}
                                        className={`px-2 py-1 rounded-full text-xs border ${getTagColor(tag, isTagActive)}`}
                                      >
                                        {tag}
                                      </span>
                                    );
                                  })}
                                  {(row.tags || []).length === 0 && (
                                    <span className="text-gray-400 text-xs italic">
                                      No tags
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    disabled={!isObserving}
                                    onClick={() =>
                                      updateQuantity(row.id, row.quantity - 1)
                                    }
                                    className="px-2 py-1 border border-gray-300 rounded bg-white cursor-pointer disabled:opacity-50 hover:bg-gray-50"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.quantity}
                                    disabled={!isObserving}
                                    onChange={(e) =>
                                      updateQuantity(
                                        row.id,
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="w-16 text-center p-1 border border-gray-300 rounded disabled:opacity-50"
                                  />
                                  <button
                                    disabled={!isObserving}
                                    onClick={() =>
                                      updateQuantity(row.id, row.quantity + 1)
                                    }
                                    className="px-2 py-1 border border-gray-300 rounded bg-white cursor-pointer disabled:opacity-50 hover:bg-gray-50"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                {row.samValue.toFixed(4)}
                              </td>
                              <td className="p-3 text-right font-medium">
                                {(row.quantity * row.samValue).toFixed(4)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Delay Tracking */}
                <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Delay Tracking</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Delay reason..."
                      value={delayReason}
                      onChange={(e) => setDelayReason(e.target.value)}
                      disabled={!isObserving || isDelayActive}
                      className="w-full p-3 rounded-lg border border-gray-300 disabled:opacity-50"
                    />
                    <button
                      onClick={startDelay}
                      disabled={!isObserving || isDelayActive || !delayReason}
                      className="px-6 py-3 bg-red-500 text-white border-none rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      Start Delay
                    </button>
                    <button
                      onClick={stopDelay}
                      disabled={!isDelayActive}
                      className="px-6 py-3 bg-green-500 text-white border-none rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      Stop Delay
                    </button>
                  </div>

                  {delays.length > 0 && (
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium mb-3">Recorded Delays</h4>
                      <div className="space-y-2">
                        {delays.map((delay, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span>{delay.reason}</span>
                            <span className="text-gray-600">
                              {delay.duration.toFixed(1)}s at {delay.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PUMP Grade Factor */}
                <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    PUMP Grade Factor (%) Assessment
                  </h3>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block mb-2 font-medium">Pace</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={pace}
                        onChange={(e) =>
                          setPace(parseInt(e.target.value) || 100)
                        }
                        disabled={!isObserving}
                        className="w-full p-3 rounded-lg border border-gray-300 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium">
                        Utilization
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={utilization}
                        onChange={(e) =>
                          setUtilization(parseInt(e.target.value) || 100)
                        }
                        disabled={!isObserving}
                        className="w-full p-3 rounded-lg border border-gray-300 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium">
                        Methods and Procedures
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={methods}
                        onChange={(e) =>
                          setMethods(parseInt(e.target.value) || 100)
                        }
                        disabled={!isObserving}
                        className="w-full p-3 rounded-lg border border-gray-300 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* PUMP Score Display */}
                  <div className="text-center bg-white rounded-lg p-4 border border-gray-300">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {pumpScore.toFixed(1)}%
                    </div>
                    <div className="text-gray-600 font-medium">
                      PUMP Score %
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Pace × Utilization × Methods
                    </div>
                  </div>
                </div>

                {/* Best Practices and Process Adherence */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-300">
                    <h4 className="text-md font-semibold mb-4">
                      Best Practices
                    </h4>
                    <div className="space-y-3">
                      {selectedStandardData.bestPractices.map(
                        (practice, index) => (
                          <label key={index} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={bestPracticesChecked.includes(practice)}
                              onChange={() => toggleBestPractice(practice)}
                              disabled={!isObserving}
                              className="mt-1 disabled:opacity-50"
                            />
                            <span className="text-sm">{practice}</span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-gray-300">
                    <h4 className="text-md font-semibold mb-4">
                      Process Adherence Opportunities
                    </h4>
                    <div className="space-y-3">
                      {selectedStandardData.processOpportunities.map(
                        (opportunity, index) => (
                          <label key={index} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={processAdherenceChecked.includes(
                                opportunity,
                              )}
                              onChange={() =>
                                toggleProcessAdherence(opportunity)
                              }
                              disabled={!isObserving}
                              className="mt-1 disabled:opacity-50"
                            />
                            <span className="text-sm">{opportunity}</span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="p-5 bg-white rounded-lg border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Observation Comments
              </h3>
              <textarea
                placeholder="Enter your observation comments here..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full min-h-[120px] p-3 rounded-lg border border-gray-300 resize-vertical"
              />
            </div>

            {/* AI Notes Section */}
            <div className="p-5 bg-white rounded-lg border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>Engage.X Leader Notes</span>
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                  AI Generated
                </div>
              </h3>

              <div className="bg-yellow-100 p-5 rounded-lg mb-4 leading-relaxed">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={generateAINotes}
                    className="px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer"
                  >
                    Generate AI Feedback
                  </button>
                </div>
                <div className="whitespace-pre-wrap">{aiNotes}</div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 text-sm mb-6">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5ZM8.75 11.5H7.25V7.25H8.75V11.5ZM8.75 5.75H7.25V4.25H8.75V5.75Z"
                    fill="currentColor"
                  />
                </svg>
                <span>
                  AI-generated insights based on current observation and
                  historical performance data
                </span>
              </div>

              {/* Signatures */}
              <div className="flex gap-6 mt-6">
                <div className="flex-1">
                  <label className="block mb-2 font-medium">
                    Supervisor Signature
                  </label>
                  <input
                    type="text"
                    placeholder="Type or sign here"
                    value={supervisorSignature}
                    onChange={(e) => setSupervisorSignature(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-2 font-medium">
                    Team Member Signature
                  </label>
                  <input
                    type="text"
                    placeholder="Type or sign here"
                    value={teamMemberSignature}
                    onChange={(e) => setTeamMemberSignature(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex justify-end items-center gap-4">
              {submissionError && (
                <div className="text-red-600 text-sm">{submissionError}</div>
              )}

              {submissionSuccess && (
                <div className="text-green-600 text-sm">
                  Observation submitted successfully!
                </div>
              )}

              <button
                disabled={isSubmitting}
                onClick={() => {
                  if (isObserving) {
                    stopObservation();
                  }
                  submitObservation();
                }}
                className="px-6 py-3 bg-blue-500 text-white border-none rounded-lg cursor-pointer font-medium disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit Observation"}
              </button>
            </div>

            {/* Performance Trends Section */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6 mt-6">
              <div className="flex mb-6 items-center justify-between border-b border-gray-300 pb-4">
                <div className="text-lg font-semibold">Performance Trends</div>
                <div className="flex gap-3 items-center">
                  <select className="px-3 py-2 rounded border border-gray-300 bg-white">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                  <div className="flex gap-1">
                    <button
                      onClick={prevSlide}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white cursor-pointer"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextSlide}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white cursor-pointer"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative w-full h-96 overflow-hidden">
                {slides.map((title, index) => (
                  <div
                    key={index}
                    className="absolute w-full h-full bg-white rounded-lg p-4 border border-gray-300 transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(${(index - currentSlide) * 100}%)`,
                    }}
                  >
                    <h3 className="text-base font-medium mb-4">{title}</h3>
                    <div className="h-full flex items-center justify-center text-gray-600">
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        Chart: {title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="w-2 h-2 rounded-full border-none p-0 cursor-pointer transition-colors duration-300"
                    style={{
                      backgroundColor: currentSlide === i ? "#666" : "#e2e2e2",
                    }}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* Previous Observations Popup */}
        {showPreviousObservations && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-11/12 max-w-5xl max-h-[85vh] overflow-y-auto relative">
              <button
                onClick={() => setShowPreviousObservations(false)}
                className="absolute right-6 top-6 bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
              <h2 className="text-2xl mb-6 pr-10 text-blue-600">
                {employeeId === "emp001"
                  ? "John Smith"
                  : employeeId === "emp002"
                    ? "Sarah Johnson"
                    : "Michael Brown"}
                's Performance History
              </h2>

              {(() => {
                // Get all observations for the employee across all standards
                const allObservations =
                  employeeId && previousObservations[employeeId]
                    ? Object.values(previousObservations[employeeId]).flat()
                    : [];

                // Sort by date (newest first) and take the last 5
                const recentObservations = allObservations
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .slice(0, 5);

                if (recentObservations.length > 0) {
                  // Calculate statistics
                  const performances = recentObservations.map((obs) =>
                    parseFloat(obs.observedPerf),
                  );
                  const avgPerformance =
                    performances.reduce((sum, perf) => sum + perf, 0) /
                    performances.length;
                  const maxPerformance = Math.max(...performances);
                  const minPerformance = Math.min(...performances);
                  const trend =
                    performances.length > 1
                      ? performances[0] - performances[performances.length - 1]
                      : 0;

                  return (
                    <div>
                      {/* Performance Summary Cards */}
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">
                            {avgPerformance.toFixed(1)}%
                          </div>
                          <div className="text-blue-700 text-sm font-medium">
                            Average Performance
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {maxPerformance.toFixed(1)}%
                          </div>
                          <div className="text-green-700 text-sm font-medium">
                            Best Performance
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg text-center border border-orange-200">
                          <div className="text-2xl font-bold text-orange-600">
                            {minPerformance.toFixed(1)}%
                          </div>
                          <div className="text-orange-700 text-sm font-medium">
                            Lowest Performance
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">
                            {trend > 0 ? "+" : ""}
                            {trend.toFixed(1)}%
                          </div>
                          <div className="text-purple-700 text-sm font-medium">
                            Recent Trend
                          </div>
                        </div>
                      </div>

                      {/* Performance Chart Visualization */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">
                          Performance Trend (Last 5 Observations)
                        </h3>
                        <div className="flex items-end justify-between h-32 bg-white rounded p-4 border">
                          {recentObservations.reverse().map((obs, index) => {
                            const performance = parseFloat(obs.observedPerf);
                            const height = Math.max(
                              (performance / 120) * 100,
                              10,
                            ); // Scale to chart height
                            const color =
                              performance >= 100
                                ? "bg-green-500"
                                : performance >= 90
                                  ? "bg-yellow-500"
                                  : "bg-red-500";

                            return (
                              <div
                                key={index}
                                className="flex flex-col items-center flex-1"
                              >
                                <div className="text-xs text-gray-600 mb-1 font-medium">
                                  {performance}%
                                </div>
                                <div
                                  className={`w-8 ${color} rounded-t transition-all hover:opacity-80`}
                                  style={{ height: `${height}%` }}
                                ></div>
                                <div className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                                  {new Date(obs.date).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" },
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Detailed History Table */}
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">
                        Recent Observations
                      </h3>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 font-semibold text-gray-700 border-b">
                          <div>Date</div>
                          <div>Observed Performance</div>
                          <div>Grade Factor Performance</div>
                          <div>Status</div>
                        </div>
                        {recentObservations.reverse().map((obs, index) => {
                          const performance = parseFloat(obs.observedPerf);
                          const status =
                            performance >= 100
                              ? "Excellent"
                              : performance >= 90
                                ? "Good"
                                : "Needs Improvement";
                          const statusColor =
                            performance >= 100
                              ? "text-green-600 bg-green-50"
                              : performance >= 90
                                ? "text-yellow-600 bg-yellow-50"
                                : "text-red-600 bg-red-50";

                          return (
                            <div
                              key={index}
                              className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50"
                            >
                              <div className="font-medium">
                                {new Date(obs.date).toLocaleDateString()}
                              </div>
                              <div className="font-semibold">
                                {obs.observedPerf}%
                              </div>
                              <div>{obs.gradeFactorPerf}%</div>
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                              >
                                {status}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-4xl text-gray-400 mb-4">📊</div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No Previous Observations
                      </h3>
                      <p className="text-gray-500">
                        This will be the first observation for{" "}
                        {employeeId === "emp001"
                          ? "John Smith"
                          : employeeId === "emp002"
                            ? "Sarah Johnson"
                            : "Michael Brown"}
                        .
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {/* Reason Instructions Popup */}
        {showReasonInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto relative">
              <button
                onClick={() => setShowReasonInstructions(false)}
                className="absolute right-6 top-6 bg-transparent border-none text-2xl cursor-pointer"
              >
                ×
              </button>
              <h2 className="text-2xl mb-6 text-red-600">
                {observationReason === "performance" &&
                  "Performance Review Instructions"}
                {observationReason === "training" &&
                  "Training Assessment Instructions"}
                {observationReason === "incident" &&
                  "Incident Follow-up Instructions"}
                {observationReason === "routine" &&
                  "Routine Check Instructions"}
              </h2>

              <div className="flex flex-col gap-6">
                {observationReason === "performance" && (
                  <div>
                    <h3 className="text-lg mb-4">Purpose:</h3>
                    <ul className="pl-5 leading-relaxed">
                      <li>
                        Evaluate current performance levels against established
                        standards
                      </li>
                      <li>
                        Identify areas of excellence and opportunities for
                        improvement
                      </li>
                      <li>Document performance trends and patterns</li>
                      <li>Provide basis for coaching and development plans</li>
                    </ul>
                    <h3 className="text-lg my-4">
                      Leader Interaction Guidelines:
                    </h3>
                    <ul className="pl-5 leading-relaxed">
                      <li>
                        Begin with a brief explanation of the observation
                        purpose
                      </li>
                      <li>
                        Maintain a neutral, professional demeanor throughout
                      </li>
                      <li>
                        Take detailed notes on specific behaviors and actions
                      </li>
                      <li>
                        Schedule immediate follow-up discussion to share
                        feedback
                      </li>
                      <li>Focus on objective data and specific examples</li>
                    </ul>
                  </div>
                )}

                {observationReason === "training" && (
                  <div>
                    <h3 className="text-lg mb-4">Purpose:</h3>
                    <ul className="pl-5 leading-relaxed">
                      <li>Assess understanding and application of training</li>
                      <li>Identify knowledge gaps or skill deficiencies</li>
                      <li>Validate training effectiveness</li>
                      <li>Determine need for additional support or practice</li>
                    </ul>
                    <h3 className="text-lg my-4">
                      Leader Interaction Guidelines:
                    </h3>
                    <ul className="pl-5 leading-relaxed">
                      <li>Create a supportive, learning-focused environment</li>
                      <li>
                        Ask questions to gauge understanding of procedures
                      </li>
                      <li>
                        Provide immediate coaching when opportunities arise
                      </li>
                      <li>Document specific training needs identified</li>
                      <li>Encourage questions and open dialogue</li>
                    </ul>
                  </div>
                )}

                {observationReason === "incident" && (
                  <div>
                    <h3 className="text-lg mb-4">Purpose:</h3>
                    <ul className="pl-5 leading-relaxed">
                      <li>Verify corrective actions have been implemented</li>
                      <li>Ensure safe work practices are being followed</li>
                      <li>Monitor for recurring issues or concerns</li>
                      <li>Provide additional support if needed</li>
                    </ul>
                    <h3 className="text-lg my-4">
                      Leader Interaction Guidelines:
                    </h3>
                    <ul className="pl-5 leading-relaxed">
                      <li>Approach with empathy and understanding</li>
                      <li>Focus on safety and procedural compliance</li>
                      <li>Document adherence to corrective actions</li>
                      <li>Address any concerns or barriers immediately</li>
                      <li>Reinforce positive behaviors observed</li>
                    </ul>
                  </div>
                )}

                {observationReason === "routine" && (
                  <div>
                    <h3 className="text-lg mb-4">Purpose:</h3>
                    <ul className="pl-5 leading-relaxed">
                      <li>Maintain regular oversight of operations</li>
                      <li>Identify emerging trends or issues</li>
                      <li>Ensure consistent application of standards</li>
                      <li>Recognize excellent performance</li>
                    </ul>
                    <h3 className="text-lg my-4">
                      Leader Interaction Guidelines:
                    </h3>
                    <ul className="pl-5 leading-relaxed">
                      <li>Maintain routine, non-intrusive observation</li>
                      <li>Document both positive and improvement areas</li>
                      <li>Use opportunity for informal coaching</li>
                      <li>
                        Build rapport and trust through regular interaction
                      </li>
                      <li>Celebrate achievements and progress</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
