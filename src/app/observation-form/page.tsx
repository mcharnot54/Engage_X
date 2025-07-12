"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Banner } from "@/components/ui/Banner";
import { Sidebar } from "@/components/Sidebar";

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
  notes: string;
  versions?: {
    id: number;
    version: number;
    versionNotes?: string;
    createdAt: string;
  }[];
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

  // Temporary quantity inputs for each row
  const [tempQuantities, setTempQuantities] = useState<Record<number, number>>(
    {},
  );

  // Track submitted quantities separately from ticker quantities
  const [submittedQuantities, setSubmittedQuantities] = useState<
    Record<number, number>
  >({});

  // Track individual quantity submission history for hover tooltip
  const [quantitySubmissionHistory, setQuantitySubmissionHistory] = useState<
    Record<number, Array<{ amount: number; timestamp: string }>>
  >({});

  // Hover state for quantity tooltip
  const [hoveredQuantityRowId, setHoveredQuantityRowId] = useState<
    number | null
  >(null);
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
  const [isPumpAssessmentActive, setIsPumpAssessmentActive] = useState(false);
  const [showPumpFinalizationModal, setShowPumpFinalizationModal] =
    useState(false);
  const [showStandardNotes, setShowStandardNotes] = useState(false);
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

  // Dynamic employee loading
  const [employees, setEmployees] = useState<
    Array<{
      id: string;
      name: string;
      employeeId: string;
    }>
  >([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Delay tracking with timer functionality
  const [isDelayActive, setIsDelayActive] = useState(false);
  const [delayStartTime, setDelayStartTime] = useState<number | null>(null);
  const [delayReason, setDelayReason] = useState("");
  const [delays, setDelays] = useState<Delay[]>([]);
  const [delayReasons, setDelayReasons] = useState<
    { id: string; name: string; description?: string }[]
  >([]);
  const [observationReasons, setObservationReasons] = useState<
    { id: string; name: string; description?: string }[]
  >([]);
  const [employeePerformanceData, setEmployeePerformanceData] = useState<
    Record<string, PreviousObservation[]>
  >({});

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
  const [highlightedTagGroup, setHighlightedTagGroup] = useState<Set<string>>(
    new Set(),
  );

  // Pastel colors for tag group differentiation
  const pastelColors = [
    { bg: "bg-rose-50", border: "border-l-rose-200", text: "text-rose-700" },
    { bg: "bg-blue-50", border: "border-l-blue-200", text: "text-blue-700" },
    { bg: "bg-green-50", border: "border-l-green-200", text: "text-green-700" },
    {
      bg: "bg-purple-50",
      border: "border-l-purple-200",
      text: "text-purple-700",
    },
    {
      bg: "bg-indigo-50",
      border: "border-l-indigo-200",
      text: "text-indigo-700",
    },
    { bg: "bg-pink-50", border: "border-l-pink-200", text: "text-pink-700" },
    { bg: "bg-cyan-50", border: "border-l-cyan-200", text: "text-cyan-700" },
    { bg: "bg-amber-50", border: "border-l-amber-200", text: "text-amber-700" },
    {
      bg: "bg-emerald-50",
      border: "border-l-emerald-200",
      text: "text-emerald-700",
    },
    {
      bg: "bg-violet-50",
      border: "border-l-violet-200",
      text: "text-violet-700",
    },
  ];

  // Helper function to get tag group color
  const getTagGroupColor = useCallback((tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    // Use the first tag to determine group identity, create a simple hash
    const firstTag = tags[0];
    const hash = firstTag.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colorIndex = Math.abs(hash) % pastelColors.length;
    return pastelColors[colorIndex];
  }, []);

  // UI state
  const [showPreviousObservations, setShowPreviousObservations] =
    useState(false);
  const [showReasonInstructions, setShowReasonInstructions] = useState(false);
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

  // Load employee performance data dynamically
  const loadEmployeePerformanceData = async (employeeId: string) => {
    try {
      const response = await fetch(
        `/api/observations?userId=${employeeId}&limit=5`,
      );
      if (response.ok) {
        const observations = await response.json();
        const performanceData = observations.map((obs: any) => ({
          date: new Date(obs.createdAt).toISOString().split("T")[0],
          observedPerf: obs.observedPerformance.toFixed(1),
          gradeFactorPerf: obs.pumpScore.toFixed(1),
        }));

        setEmployeePerformanceData((prev) => ({
          ...prev,
          [employeeId]: performanceData,
        }));
      }
    } catch (error) {
      console.error("Error loading employee performance data:", error);
      // Set fallback data if API fails
      const fallbackData = [
        { date: "2024-01-15", observedPerf: "95.2", gradeFactorPerf: "98.1" },
        { date: "2024-01-10", observedPerf: "92.8", gradeFactorPerf: "96.5" },
        { date: "2024-01-05", observedPerf: "98.1", gradeFactorPerf: "102.3" },
      ];
      setEmployeePerformanceData((prev) => ({
        ...prev,
        [employeeId]: fallbackData,
      }));
    }
  };

  // Helper function to sync active row IDs based on quantities
  const syncActiveRowIds = useCallback(() => {
    const newActiveRowIds = new Set<number>();
    rows.forEach((row) => {
      const hasTickerQuantity = row.quantity > 0;
      const hasSubmittedQuantity = (submittedQuantities[row.id] || 0) > 0;
      if (hasTickerQuantity || hasSubmittedQuantity) {
        newActiveRowIds.add(row.id);
      }
    });

    setActiveRowIds(newActiveRowIds);
    setIsDynamicGroupingActive(newActiveRowIds.size > 0);
  }, [rows, submittedQuantities]);

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

  // Enhanced dynamic row ordering with highlighted tag group prioritization
  const organizedRows = useMemo(() => {
    // If we have a highlighted tag group, prioritize those rows
    if (highlightedTagGroup.size > 0) {
      const highlightedGroupRows: Row[] = [];
      const otherRows: Row[] = [];

      rows.forEach((row) => {
        const hasHighlightedTag = row.tags?.some((tag) =>
          highlightedTagGroup.has(tag),
        );
        if (hasHighlightedTag) {
          highlightedGroupRows.push(row);
        } else {
          otherRows.push(row);
        }
      });

      // Sort highlighted group rows by original index
      highlightedGroupRows.sort((a, b) => a.originalIndex - b.originalIndex);
      otherRows.sort((a, b) => a.originalIndex - b.originalIndex);

      return [...highlightedGroupRows, ...otherRows];
    }

    if (!isDynamicGroupingActive || activeRowIds.size === 0) {
      // Return original order when not actively grouping
      return originalRowOrder.length > 0 ? originalRowOrder : rows;
    }

    const activeTags = getActiveTagsForRows(activeRowIds);
    const rowsWithSharedTags = getRowsWithSharedTags(activeRowIds);

    // Categorize rows based on their relationship to active tags
    const currentlyActiveRows: Row[] = []; // Rows that are actively being modified
    const activeTagGroupRows: Row[] = []; // Rows in the same tag group as active rows
    const inactiveRows: Row[] = [];

    rows.forEach((row) => {
      if (activeRowIds.has(row.id)) {
        // Currently active rows (being modified) go to the very top
        currentlyActiveRows.push(row);
      } else if (
        rowsWithSharedTags.has(row.id) &&
        row.tags?.some((tag) => activeTags.has(tag))
      ) {
        // Rows with shared tags in the active group go next
        activeTagGroupRows.push(row);
      } else {
        // All other rows go to the bottom
        inactiveRows.push(row);
      }
    });

    // Sort each category for better organization
    const sortByTagPriority = (a: Row, b: Row) => {
      const aActiveTagCount =
        a.tags?.filter((tag) => activeTags.has(tag)).length || 0;
      const bActiveTagCount =
        b.tags?.filter((tag) => activeTags.has(tag)).length || 0;

      // Prioritize by number of matching active tags, then by original order
      if (aActiveTagCount !== bActiveTagCount) {
        return bActiveTagCount - aActiveTagCount;
      }
      return a.originalIndex - b.originalIndex;
    };

    currentlyActiveRows.sort(sortByTagPriority);
    activeTagGroupRows.sort(sortByTagPriority);
    inactiveRows.sort((a, b) => a.originalIndex - b.originalIndex);

    return [...currentlyActiveRows, ...activeTagGroupRows, ...inactiveRows];
  }, [
    rows,
    originalRowOrder,
    activeRowIds,
    isDynamicGroupingActive,
    getRowsWithSharedTags,
    getActiveTagsForRows,
    highlightedTagGroup,
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
    // Clear highlighted tag group when standard is changed
    setHighlightedTagGroup(new Set());
    setActiveRowIds(new Set());
    setIsDynamicGroupingActive(false);
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
  const loadStandards = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const timeoutId = setTimeout(() => {
        if (!signal?.aborted) {
          console.warn("Standards request timed out after 10 seconds");
        }
      }, 10000);

      const response = await fetch("/api/standards", {
        signal: signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (
          errorData.error &&
          errorData.error.includes("Database connection failed")
        ) {
          throw new Error(
            "Database not configured. Please check your DATABASE_URL environment variable.",
          );
        }
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to fetch standards`,
        );
      }
      const data = await response.json();
      // Handle both direct array and nested {data: [...]} response formats
      const standards = Array.isArray(data) ? data : data.data || [];
      setStandards(standards);
      setError(""); // Clear any previous errors
    } catch (error) {
      // Don't show errors for aborted requests during component unmount
      if (error instanceof Error && error.name === "AbortError") {
        if (!signal?.aborted) {
          console.warn("Standards request was aborted");
        }
        return; // Silently return for component unmount
      }

      console.error("Error loading standards:", error);
      let errorMessage = "Failed to load standards";

      if (error instanceof Error) {
        if (error.message.includes("does not exist")) {
          errorMessage =
            "Database schema issue detected. Please check if migrations have been applied properly.";
        } else if (error.message.includes("DATABASE_URL")) {
          errorMessage =
            "Database connection error: Please configure DATABASE_URL in .env.local file";
        } else if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setStandards([]); // Set empty array as fallback
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
        setHighlightedTagGroup(new Set());

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
      setIsPumpAssessmentActive(true);
      setShowPumpFinalizationModal(true);
      setObservationEndTime(Date.now());
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // When observation stops, return to original order
      setIsDynamicGroupingActive(false);
      setActiveRowIds(new Set());
      setHighlightedTagGroup(new Set());
    }
  };

  const submitPumpAssessment = () => {
    setIsPumpAssessmentActive(false);
    setIsFinalized(true);
    setShowPumpFinalizationModal(false);
  };

  const calculatePerformance = () => {
    if (timeObserved > 0) {
      const performance = (totalSams / timeObserved) * 100;
      setObservedPerformance(Number(performance.toFixed(2)));
    }
    // Calculate PUMP score as straight multiplication
    const score = (pace * utilization * methods) / 10000;
    setPumpScore(Number(score.toFixed(1)));
  };

  const updateQuantity = (id: number, value: number) => {
    setRows((prevRows) => {
      const newRows = prevRows.map((row) =>
        row.id === id ? { ...row, quantity: Math.max(0, value) } : row,
      );
      return newRows;
    });

    // Set highlighted tag group when ticker quantity is used
    const targetRow = rows.find((row) => row.id === id);
    if (targetRow && targetRow.tags && targetRow.tags.length > 0) {
      setHighlightedTagGroup(new Set(targetRow.tags));
    }
    // Note: Dynamic grouping logic will be handled by the syncActiveRowIds function
    // in the useEffect that triggers when rows change
  };

  const updateTempQuantity = (id: number, value: number) => {
    setTempQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, value),
    }));
  };

  const submitTempQuantity = (id: number) => {
    const tempValue = tempQuantities[id] || 0;
    if (tempValue > 0) {
      // Add to submitted quantities (separate from ticker quantities)
      setSubmittedQuantities((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + tempValue,
      }));

      // Track submission history for hover tooltip
      setQuantitySubmissionHistory((prev) => ({
        ...prev,
        [id]: [
          ...(prev[id] || []),
          {
            amount: tempValue,
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      }));

      // Clear the temporary input
      setTempQuantities((prev) => ({
        ...prev,
        [id]: 0,
      }));

      // Set highlighted tag group when enter quantity is used
      const targetRow = rows.find((row) => row.id === id);
      if (targetRow && targetRow.tags && targetRow.tags.length > 0) {
        setHighlightedTagGroup(new Set(targetRow.tags));
      }
      // Note: Dynamic grouping logic will be handled by the syncActiveRowIds function
      // in the useEffect that triggers when submittedQuantities change
    }
  };

  // Delete individual submitted quantity entry
  const deleteQuantityEntry = (rowId: number, entryIndex: number) => {
    if (!isObserving && !isPumpAssessmentActive) return;

    const history = quantitySubmissionHistory[rowId] || [];
    if (entryIndex >= 0 && entryIndex < history.length) {
      const entryToDelete = history[entryIndex];

      // Remove from submission history
      setQuantitySubmissionHistory((prev) => ({
        ...prev,
        [rowId]: prev[rowId].filter((_, index) => index !== entryIndex),
      }));

      // Subtract from submitted quantities
      setSubmittedQuantities((prev) => ({
        ...prev,
        [rowId]: Math.max(0, (prev[rowId] || 0) - entryToDelete.amount),
      }));
    }
  };

  // Clear all quantities for a row (both ticker and submitted)
  const clearAllQuantities = (rowId: number) => {
    if (!isObserving && !isPumpAssessmentActive) return;

    // Clear ticker quantity
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, quantity: 0 } : row)),
    );

    // Clear submitted quantities
    setSubmittedQuantities((prev) => ({
      ...prev,
      [rowId]: 0,
    }));

    // Clear submission history
    setQuantitySubmissionHistory((prev) => ({
      ...prev,
      [rowId]: [],
    }));

    // Clear temp quantity if any
    setTempQuantities((prev) => ({
      ...prev,
      [rowId]: 0,
    }));
  };

  const calculateTotalSams = () => {
    const total = rows.reduce(
      (sum, row) =>
        sum +
        (row.quantity + (submittedQuantities[row.id] || 0)) * row.samValue,
      0,
    );
    setTotalSams(total);
  };

  // Delay timer functionality
  const startDelay = () => {
    if (!isDelayActive) {
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
        // Get employee name from the selected employee
        const selectedEmployee = employees.find(
          (emp) => emp.employeeId === employeeId,
        );
        const employeeName = selectedEmployee?.name || "Unknown Employee";

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
    setEmployeeSearch("");
    setShowEmployeeDropdown(false);
    setObservationReason("");
    setStandard("");
    resetStandardSelection();
    setSelectedStandardData(null);
    setRows([]);
    setOriginalRowOrder([]);
    setActiveRowIds(new Set());
    setIsDynamicGroupingActive(false);
    setHighlightedTagGroup(new Set());
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
    setQuantitySubmissionHistory({});
    setTempQuantities({});
    setSubmittedQuantities({});
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
    const controller = new AbortController();

    loadStandards(controller.signal);
    loadDelayReasons(controller.signal);
    loadObservationReasons(controller.signal);
    loadTeamMembers(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const loadDelayReasons = async (signal?: AbortSignal) => {
    try {
      const timeoutId = setTimeout(() => {
        if (!signal?.aborted) {
          console.warn("Delay reasons request timed out after 10 seconds");
        }
      }, 10000);

      const response = await fetch("/api/delay-reasons", {
        signal: signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setDelayReasons(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to fetch delay reasons`,
        );
      }
    } catch (error) {
      // Don't show errors for aborted requests during component unmount
      if (error instanceof Error && error.name === "AbortError") {
        if (!signal?.aborted) {
          console.warn("Delay reasons request was aborted");
        }
        return; // Silently return for component unmount
      }

      console.error("Error loading delay reasons:", error);
      let errorMessage = "Failed to load delay reasons";

      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      // Set empty array as fallback and show non-blocking notification
      setDelayReasons([]);
      console.warn("Delay reasons could not be loaded:", errorMessage);
    }
  };

  const loadObservationReasons = async (signal?: AbortSignal) => {
    try {
      const timeoutId = setTimeout(() => {
        if (!signal?.aborted) {
          console.warn(
            "Observation reasons request timed out after 10 seconds",
          );
        }
      }, 10000);

      const response = await fetch("/api/observation-reasons", {
        signal: signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setObservationReasons(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to fetch observation reasons`,
        );
      }
    } catch (error) {
      // Don't show errors for aborted requests during component unmount
      if (error instanceof Error && error.name === "AbortError") {
        if (!signal?.aborted) {
          console.warn("Observation reasons request was aborted");
        }
        return; // Silently return for component unmount
      }

      console.error("Error loading observation reasons:", error);

      // Set fallback reasons as backup
      const fallbackReasons = [
        {
          id: "1",
          name: "Performance Review",
          description: "Regular performance assessment",
        },
        {
          id: "2",
          name: "Training Assessment",
          description: "Evaluate training effectiveness",
        },
        {
          id: "3",
          name: "Incident Follow-up",
          description: "Post-incident observation",
        },
        {
          id: "4",
          name: "Routine Check",
          description: "Regular operational oversight",
        },
      ];
      setObservationReasons(fallbackReasons);
      console.warn(
        "Using fallback observation reasons due to error:",
        error.message,
      );
    }
  };

  const loadTeamMembers = async (signal?: AbortSignal) => {
    try {
      const timeoutId = setTimeout(() => {
        if (!signal?.aborted) {
          console.warn("Team members request timed out after 10 seconds");
        }
      }, 10000);

      const response = await fetch("/api/users-tenant?role=Team Member", {
        signal: signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const teamMembers = data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          employeeId: user.employeeId || user.id,
        }));

        // If no team members found, add some fallback demo employees
        if (teamMembers.length === 0) {
          const fallbackEmployees = [
            { id: "emp001", name: "John Smith", employeeId: "emp001" },
            { id: "emp002", name: "Sarah Johnson", employeeId: "emp002" },
            { id: "emp003", name: "Michael Brown", employeeId: "emp003" },
            { id: "emp004", name: "Lisa Davis", employeeId: "emp004" },
            { id: "emp005", name: "Robert Wilson", employeeId: "emp005" },
          ];
          setEmployees(fallbackEmployees);
        } else {
          setEmployees(teamMembers);
        }
      } else {
        // Fallback to demo employees if API fails
        const fallbackEmployees = [
          { id: "emp001", name: "John Smith", employeeId: "emp001" },
          { id: "emp002", name: "Sarah Johnson", employeeId: "emp002" },
          { id: "emp003", name: "Michael Brown", employeeId: "emp003" },
          { id: "emp004", name: "Lisa Davis", employeeId: "emp004" },
          { id: "emp005", name: "Robert Wilson", employeeId: "emp005" },
        ];
        setEmployees(fallbackEmployees);
      }
    } catch (error) {
      // Don't show errors for aborted requests during component unmount
      if (error instanceof Error && error.name === "AbortError") {
        if (!signal?.aborted) {
          console.warn("Team members request was aborted");
        }
        return; // Silently return for component unmount
      }

      console.error("Error loading team members:", error);

      // Set fallback employees on error
      const fallbackEmployees = [
        { id: "emp001", name: "John Smith", employeeId: "emp001" },
        { id: "emp002", name: "Sarah Johnson", employeeId: "emp002" },
        { id: "emp003", name: "Michael Brown", employeeId: "emp003" },
        { id: "emp004", name: "Lisa Davis", employeeId: "emp004" },
        { id: "emp005", name: "Robert Wilson", employeeId: "emp005" },
      ];
      setEmployees(fallbackEmployees);
      console.warn("Using fallback employees due to error:", error.message);
    }
  };

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
    syncActiveRowIds();
  }, [rows, submittedQuantities, syncActiveRowIds]);

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
      if (showEmployeeDropdown && !target.closest(".employee-dropdown")) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStandardDropdown, showEmployeeDropdown]);

  // Helper function to get tag color with gold highlighting for active use
  const getTagColor = (
    tag: string,
    isActive: boolean,
    isCurrentlyInUse = false,
    rowTags: string[] = [],
  ) => {
    // Only highlight gold if this tag is in the currently highlighted group
    if (highlightedTagGroup.has(tag)) {
      return "bg-yellow-200 text-yellow-800 border-yellow-500 shadow-md font-semibold";
    }

    // Get the original tag group color for consistent mapping
    const tagGroupColor = getTagGroupColor(rowTags);

    // Create a single consistent color mapping that we'll use with different opacities
    const getConsistentTagColors = (reducedOpacity = false) => {
      if (!tagGroupColor || !rowTags.length) {
        return reducedOpacity
          ? "bg-gray-100 text-gray-600 border-gray-200 opacity-60"
          : "bg-gray-100 text-gray-700 border-gray-300";
      }

      const baseColorMap: Record<
        string,
        { bg: string; text: string; border: string }
      > = {
        "bg-rose-50": {
          bg: "bg-rose-100",
          text: "text-rose-700",
          border: "border-rose-300",
        },
        "bg-blue-50": {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-300",
        },
        "bg-green-50": {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-300",
        },
        "bg-purple-50": {
          bg: "bg-purple-100",
          text: "text-purple-700",
          border: "border-purple-300",
        },
        "bg-indigo-50": {
          bg: "bg-indigo-100",
          text: "text-indigo-700",
          border: "border-indigo-300",
        },
        "bg-pink-50": {
          bg: "bg-pink-100",
          text: "text-pink-700",
          border: "border-pink-300",
        },
        "bg-cyan-50": {
          bg: "bg-cyan-100",
          text: "text-cyan-700",
          border: "border-cyan-300",
        },
        "bg-amber-50": {
          bg: "bg-amber-100",
          text: "text-amber-700",
          border: "border-amber-300",
        },
        "bg-emerald-50": {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-300",
        },
        "bg-violet-50": {
          bg: "bg-violet-100",
          text: "text-violet-700",
          border: "border-violet-300",
        },
      };

      const colors = baseColorMap[tagGroupColor.bg] || {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-300",
      };

      const opacity = reducedOpacity ? " opacity-60" : "";
      return `${colors.bg} ${colors.text} ${colors.border}${opacity}`;
    };

    // If there's a highlighted tag group, all other tags should use reduced opacity
    if (highlightedTagGroup.size > 0) {
      return getConsistentTagColors(true);
    }

    // When no group is highlighted, use the original logic with proper state handling
    if (isCurrentlyInUse && isActive) {
      return "bg-yellow-200 text-yellow-800 border-yellow-400 shadow-md font-semibold";
    }
    if (isActive) {
      return "bg-green-100 text-green-700 border-green-300";
    }

    // Use original pastel colors for tag groups (full opacity)
    return getConsistentTagColors(false);
  };

  return (
    <div className="font-poppins text-black bg-gray-100 min-h-screen overflow-x-hidden">
      <Banner
        title="Observation Form"
        subtitle="Complete work sampling observations and performance analysis"
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

            {/* Observation Overview */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Observation Overview
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {/* Standard Selection - Multi-level Dropdown */}
                <div className="relative standard-dropdown">
                  <button
                    onClick={() =>
                      setShowStandardDropdown(!showStandardDropdown)
                    }
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
                {/* Dynamic Employee Dropdown with Search */}
                <div className="relative employee-dropdown">
                  <div
                    onClick={() =>
                      !isObserving &&
                      setShowEmployeeDropdown(!showEmployeeDropdown)
                    }
                    className={`w-full p-3 rounded-lg border border-gray-300 bg-white disabled:opacity-70 cursor-pointer flex justify-between items-center ${
                      isObserving
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={employeeId ? "text-black" : "text-gray-500"}
                    >
                      {employeeId
                        ? employees.find((emp) => emp.employeeId === employeeId)
                            ?.name +
                          ` (${employees.find((emp) => emp.employeeId === employeeId)?.employeeId})`
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
                          onChange={(e) => setEmployeeSearch(e.target.value)}
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
                                setEmployeeId(employee.employeeId);
                                setShowEmployeeDropdown(false);
                                setEmployeeSearch("");
                                setShowPreviousObservations(true);
                              }}
                              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{employee.name}</div>
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
                  {observationReasons.map((reason) => (
                    <option key={reason.id} value={reason.name}>
                      {reason.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Standard Notes Section */}
              {selectedStandardData && selectedStandardData.notes && (
                <div className="mt-4">
                  <div
                    onClick={() => !isObserving && setShowStandardNotes(true)}
                    className={`w-full p-3 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 text-left flex justify-between items-center transition-all duration-200 ${
                      isObserving
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-blue-100 hover:border-blue-400 hover:shadow-md cursor-pointer"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-blue-600">📝</span>
                      <span className="text-blue-800 font-medium">
                        {selectedStandardData.name} - Standard Notes Available
                      </span>
                    </span>
                    <span className="text-blue-600 text-sm hover:text-blue-800 transition-colors">
                      Click to view notes ↗
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PUMP Grade Factor */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  PUMP Grade Factor (%) Assessment
                </h3>
                {isPumpAssessmentActive && (
                  <button
                    onClick={submitPumpAssessment}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                  >
                    Submit PUMP
                  </button>
                )}
              </div>
              <div className="flex items-end justify-between w-full">
                {/* Pace */}
                <div className="flex-1 text-center">
                  <label className="block mb-2 font-medium text-center">
                    Pace
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      disabled={
                        (!isObserving && !isPumpAssessmentActive) || pace <= 5
                      }
                      onClick={() => setPace(Math.max(5, pace - 5))}
                      className="p-2 rounded bg-blue-500 text-white cursor-pointer disabled:opacity-50 disabled:bg-gray-300 hover:bg-blue-600 flex items-center justify-center w-8 h-8"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="5"
                      max="200"
                      step="5"
                      value={pace}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 100;
                        setPace(Math.round(value / 5) * 5);
                      }}
                      disabled={!isObserving && !isPumpAssessmentActive}
                      className="w-full p-3 rounded-lg border border-gray-300 disabled:opacity-50 text-center"
                      style={{ textAlign: "center", margin: "auto" }}
                    />
                    <button
                      disabled={
                        (!isObserving && !isPumpAssessmentActive) || pace >= 200
                      }
                      onClick={() => setPace(Math.min(200, pace + 5))}
                      className="p-2 rounded bg-blue-500 text-white cursor-pointer disabled:opacity-50 disabled:bg-gray-300 hover:bg-blue-600 flex items-center justify-center w-8 h-8"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Multiplication Symbol */}
                <div className="text-2xl font-bold text-gray-600 pb-3 px-4">
                  ×
                </div>

                {/* Utilization */}
                <div className="flex-1 text-center">
                  <label className="block mb-2 font-medium text-center">
                    Utilization
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      disabled={
                        (!isObserving && !isPumpAssessmentActive) ||
                        utilization <= 5
                      }
                      onClick={() =>
                        setUtilization(Math.max(5, utilization - 5))
                      }
                      className="p-2 rounded bg-blue-500 text-white cursor-pointer disabled:opacity-50 disabled:bg-gray-300 hover:bg-blue-600 flex items-center justify-center w-8 h-8"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      step="5"
                      value={utilization}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 100;
                        setUtilization(
                          Math.min(100, Math.round(value / 5) * 5),
                        );
                      }}
                      disabled={!isObserving && !isPumpAssessmentActive}
                      className="w-full p-3 rounded-lg border border-gray-300 disabled:opacity-50 text-center"
                      style={{ textAlign: "center", margin: "auto" }}
                    />
                    <button
                      disabled={
                        (!isObserving && !isPumpAssessmentActive) ||
                        utilization >= 100
                      }
                      onClick={() =>
                        setUtilization(Math.min(100, utilization + 5))
                      }
                      className="p-2 rounded bg-blue-500 text-white cursor-pointer disabled:opacity-50 disabled:bg-gray-300 hover:bg-blue-600 flex items-center justify-center w-8 h-8"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Multiplication Symbol */}
                <div className="text-2xl font-bold text-gray-600 pb-3 px-4">
                  ×
                </div>

                {/* Methods and Procedures */}
                <div className="flex-1 text-center">
                  <label className="block mb-2 font-medium text-center">
                    Methods and Procedures
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      disabled={
                        (!isObserving && !isPumpAssessmentActive) ||
                        methods <= 5
                      }
                      onClick={() => setMethods(Math.max(5, methods - 5))}
                      className="p-2 rounded bg-blue-500 text-white cursor-pointer disabled:opacity-50 disabled:bg-gray-300 hover:bg-blue-600 flex items-center justify-center w-8 h-8"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="5"
                      max="200"
                      step="5"
                      value={methods}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 100;
                        setMethods(Math.round(value / 5) * 5);
                      }}
                      disabled={!isObserving && !isPumpAssessmentActive}
                      className="w-full p-3 rounded-lg border border-gray-300 disabled:opacity-50 text-center"
                      style={{ textAlign: "center", margin: "auto" }}
                    />
                    <button
                      disabled={
                        (!isObserving && !isPumpAssessmentActive) ||
                        methods >= 200
                      }
                      onClick={() => setMethods(Math.min(200, methods + 5))}
                      className="p-2 rounded bg-blue-500 text-white cursor-pointer disabled:opacity-50 disabled:bg-gray-300 hover:bg-blue-600 flex items-center justify-center w-8 h-8"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Equals Symbol */}
                <div className="text-2xl font-bold text-gray-600 pb-3 px-4">
                  =
                </div>

                {/* PUMP Score Display */}
                <div className="flex-1 text-center">
                  <div className="text-center bg-white rounded-lg p-4 border border-gray-300">
                    <div
                      className="text-3xl font-bold text-orange-600 mb-2"
                      style={{ fontSize: "31px" }}
                    >
                      {pumpScore.toFixed(1)}%
                    </div>
                    <div className="text-gray-600 font-medium">
                      PUMP Score %
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observation Timer and Controls */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Observed Performance
              </h3>
              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {timeObserved.toFixed(2)}
                  </div>
                  <div className="text-gray-600">Minutes Observed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {isObserving || isPumpAssessmentActive
                      ? "—"
                      : totalSams.toFixed(2)}
                  </div>
                  <div className="text-gray-600">Total SAMs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {isObserving || isPumpAssessmentActive
                      ? "—"
                      : `${observedPerformance.toFixed(1)}%`}
                  </div>
                  <div className="text-gray-600">Observed Performance</div>
                </div>
                <div className="flex justify-center items-center">
                  <button
                    onClick={isObserving ? stopObservation : startObservation}
                    disabled={
                      isFinalized ||
                      isPumpAssessmentActive ||
                      (!isObserving &&
                        (!selectedStandardData ||
                          !employeeId ||
                          !observationReason))
                    }
                    className={`px-6 py-3 text-white border-none rounded-lg cursor-pointer font-medium disabled:opacity-70 ${
                      isObserving
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {isObserving ? "Stop Observation" : "Start Observation"}
                  </button>
                </div>
              </div>
            </div>

            {/* Standards Form */}
            {selectedStandardData && (
              <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
                <h3 className="text-lg font-semibold mb-6">
                  Observed Performance
                </h3>

                {/* UOM Operations Table */}
                <div className="bg-white rounded-lg p-6 border border-gray-300 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold">Operations</h4>
                    <div className="text-sm font-medium">
                      {highlightedTagGroup.size > 0 && (
                        <div className="flex items-center gap-3 text-yellow-600 mb-1">
                          <span className="flex items-center gap-2">
                            🏆 Tag group highlighted - Group moved to top with
                            gold styling
                          </span>
                          <button
                            onClick={() => {
                              // Clear all visual highlighting states while preserving quantities
                              setHighlightedTagGroup(new Set());
                              setIsDynamicGroupingActive(false);
                              // Force recalculation to ensure UI consistency without affecting quantities
                              syncActiveRowIds();
                            }}
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 rounded hover:bg-yellow-200 transition-colors"
                          >
                            Clear Highlighting
                          </button>
                        </div>
                      )}
                      {isDynamicGroupingActive && (
                        <div className="flex items-center gap-2 text-green-600">
                          ⚡️ Smart grouping active - Active tag groups moved to
                          top
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="p-3 text-left font-semibold">
                            UOM / Description
                          </th>
                          <th className="p-3 text-left font-semibold">Tags</th>
                          <th className="p-3 text-center font-semibold">
                            Enter Quantity
                          </th>
                          <th className="p-3 text-center font-semibold">
                            Ticker Quantity
                          </th>
                          <th className="p-3 text-center font-semibold">
                            Total Quantity
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
                          const activeTags = getActiveTagsForRows(activeRowIds);
                          const hasActiveSharedTags =
                            row.tags?.some((tag) => activeTags.has(tag)) ||
                            false;
                          const isInActiveTagGroup =
                            isDynamicGroupingActive && hasActiveSharedTags;

                          // Check if this row is in the highlighted tag group
                          const isInHighlightedGroup =
                            row.tags?.some((tag) =>
                              highlightedTagGroup.has(tag),
                            ) || false;

                          // Get pastel color for this row's tag group
                          const tagGroupColor = getTagGroupColor(
                            row.tags || [],
                          );

                          // Determine row styling based on activity level
                          let rowClasses =
                            "border-b border-gray-300 transition-all duration-200";

                          // Priority 1: Highlighting takes precedence over all other states
                          if (isInHighlightedGroup) {
                            rowClasses +=
                              " bg-yellow-100 border-l-4 border-l-yellow-500 shadow-sm"; // Gold highlighting for highlighted tag group
                          } else if (highlightedTagGroup.size > 0) {
                            // When there's a highlighted group but this row isn't in it, use original pastel color with reduced opacity
                            if (
                              tagGroupColor &&
                              row.tags &&
                              row.tags.length > 0
                            ) {
                              rowClasses += ` ${tagGroupColor.bg} border-l-2 ${tagGroupColor.border} opacity-60`; // Original color with reduced opacity
                            } else {
                              rowClasses +=
                                " bg-gray-50 border-l-2 border-l-gray-200 opacity-60"; // Default subdued appearance
                            }
                          } else if (isActive) {
                            rowClasses +=
                              " bg-yellow-50 border-l-4 border-l-yellow-400"; // Light gold highlighting for active rows
                          } else if (isInActiveTagGroup) {
                            rowClasses += " bg-green-50"; // Green highlighting for rows in active tag group
                          } else if (
                            tagGroupColor &&
                            row.tags &&
                            row.tags.length > 0
                          ) {
                            rowClasses += ` ${tagGroupColor.bg} border-l-2 ${tagGroupColor.border}`; // Original pastel colors for tag groups
                          } else {
                            rowClasses += " bg-white"; // Default background
                          }

                          return (
                            <tr key={row.id} className={rowClasses}>
                              <td className="p-3">
                                <div className="font-medium">{row.uom}</div>
                                <div
                                  className="text-xs text-gray-600 mt-1"
                                  style={{
                                    fontSize: "0.625em",
                                    lineHeight: "1.2",
                                  }}
                                >
                                  {row.description}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {(row.tags || []).map((tag, tagIndex) => {
                                    const activeTags =
                                      getActiveTagsForRows(activeRowIds);
                                    const isTagActive = activeTags.has(tag);
                                    const isCurrentlyInUse =
                                      activeRowIds.has(row.id) && isTagActive;
                                    return (
                                      <span
                                        key={tagIndex}
                                        className={`px-2 py-1 rounded-full text-xs border transition-all duration-200 ${getTagColor(tag, isTagActive, isCurrentlyInUse, row.tags || [])}`}
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
                                  <input
                                    type="number"
                                    min="0"
                                    value={tempQuantities[row.id] || 0}
                                    disabled={
                                      !isObserving && !isPumpAssessmentActive
                                    }
                                    onChange={(e) =>
                                      updateTempQuantity(
                                        row.id,
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === "Enter" &&
                                        tempQuantities[row.id] > 0
                                      ) {
                                        submitTempQuantity(row.id);
                                      }
                                    }}
                                    className="w-16 text-center p-1 border border-gray-300 rounded disabled:opacity-50"
                                    placeholder="0"
                                  />
                                  <button
                                    disabled={
                                      !isObserving || !tempQuantities[row.id]
                                    }
                                    onClick={() => submitTempQuantity(row.id)}
                                    className="p-1 rounded bg-green-500 text-white cursor-pointer disabled:opacity-50 disabled:bg-gray-300 hover:bg-green-600 flex items-center justify-center w-8 h-8"
                                    title="Add to total"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="20,6 9,17 4,12"></polyline>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    disabled={
                                      !isObserving && !isPumpAssessmentActive
                                    }
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
                                    disabled={
                                      !isObserving && !isPumpAssessmentActive
                                    }
                                    onChange={(e) =>
                                      updateQuantity(
                                        row.id,
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="w-16 text-center p-1 border border-gray-300 rounded disabled:opacity-50"
                                  />
                                  <button
                                    disabled={
                                      !isObserving && !isPumpAssessmentActive
                                    }
                                    onClick={() =>
                                      updateQuantity(row.id, row.quantity + 1)
                                    }
                                    className="px-2 py-1 border border-gray-300 rounded bg-white cursor-pointer disabled:opacity-50 hover:bg-gray-50"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td
                                className="p-3 text-center font-medium relative"
                                onMouseEnter={() =>
                                  setHoveredQuantityRowId(row.id)
                                }
                                onMouseLeave={() =>
                                  setHoveredQuantityRowId(null)
                                }
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <span className="cursor-help">
                                    {row.quantity +
                                      (submittedQuantities[row.id] || 0)}
                                  </span>

                                  {/* Clear All Button - only show if there are quantities to clear */}
                                  {(row.quantity > 0 ||
                                    (submittedQuantities[row.id] || 0) > 0) &&
                                    (isObserving || isPumpAssessmentActive) && (
                                      <button
                                        onClick={() =>
                                          clearAllQuantities(row.id)
                                        }
                                        className="ml-1 p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors w-5 h-5 flex items-center justify-center text-xs"
                                        title="Clear all quantities"
                                      >
                                        ×
                                      </button>
                                    )}
                                </div>

                                {/* Hover Tooltip */}
                                {hoveredQuantityRowId === row.id &&
                                  (quantitySubmissionHistory[row.id]?.length >
                                    0 ||
                                    row.quantity > 0) && (
                                    <div
                                      className="absolute z-[9999] bg-gray-800 text-white text-xs rounded-lg p-3 shadow-xl min-w-56 pointer-events-auto"
                                      style={{
                                        top: "100%",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        marginTop: "5px",
                                        boxShadow:
                                          "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                                      }}
                                    >
                                      <div className="font-semibold mb-2 text-center border-b border-gray-600 pb-1">
                                        Quantity Breakdown
                                      </div>

                                      {/* Ticker Quantity */}
                                      {row.quantity > 0 && (
                                        <div className="mb-2">
                                          <div className="text-blue-300 font-medium">
                                            Ticker Quantity:
                                          </div>
                                          <div className="pl-2">
                                            • {row.quantity} (live counter)
                                          </div>
                                        </div>
                                      )}

                                      {/* Submitted Entries */}
                                      {quantitySubmissionHistory[row.id]
                                        ?.length > 0 && (
                                        <div>
                                          <div className="text-green-300 font-medium mb-1">
                                            Submitted Entries:
                                          </div>
                                          <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {quantitySubmissionHistory[
                                              row.id
                                            ].map((entry, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between pl-2 text-xs group"
                                              >
                                                <span>
                                                  • {entry.amount} at{" "}
                                                  {entry.timestamp}
                                                </span>
                                                {(isObserving ||
                                                  isPumpAssessmentActive) && (
                                                  <button
                                                    onClick={() =>
                                                      deleteQuantityEntry(
                                                        row.id,
                                                        index,
                                                      )
                                                    }
                                                    className="ml-2 p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                    title="Delete this entry"
                                                  >
                                                    ×
                                                  </button>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                          <div className="mt-2 pt-1 border-t border-gray-600 text-center">
                                            <span className="text-green-300">
                                              Total Submitted:{" "}
                                              {submittedQuantities[row.id] || 0}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Instructions */}
                                      {(isObserving ||
                                        isPumpAssessmentActive) && (
                                        <div className="mt-2 pt-1 border-t border-gray-600 text-center text-gray-400 text-xs">
                                          Hover over entries to delete • Click ×
                                          to clear all
                                        </div>
                                      )}

                                      {/* Arrow pointer */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                                    </div>
                                  )}
                              </td>
                              <td className="p-3 text-right">
                                {row.samValue.toFixed(4)}
                              </td>
                              <td className="p-3 text-right font-medium">
                                {(
                                  (row.quantity +
                                    (submittedQuantities[row.id] || 0)) *
                                  row.samValue
                                ).toFixed(4)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                              disabled={!isObserving && !isPumpAssessmentActive}
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
                              disabled={!isObserving && !isPumpAssessmentActive}
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

            {/* Delay Tracking */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
              <h3 className="text-lg font-semibold mb-4">Delay Tracking</h3>
              <div className="flex gap-4 mb-4 items-center">
                <button
                  onClick={startDelay}
                  disabled={!isObserving || isDelayActive}
                  className="px-4 py-2 bg-red-500 text-white border-none rounded-lg cursor-pointer disabled:opacity-50 text-sm font-medium"
                >
                  Start Delay
                </button>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  disabled={!isObserving || !isDelayActive}
                  className="flex-1 p-3 rounded-lg border border-gray-300 disabled:opacity-50 bg-white"
                >
                  <option value="">Select delay reason...</option>
                  {delayReasons.map((reason) => (
                    <option key={reason.id} value={reason.name}>
                      {reason.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={stopDelay}
                  disabled={!isDelayActive || !delayReason}
                  className="px-4 py-2 bg-green-500 text-white border-none rounded-lg cursor-pointer disabled:opacity-50 text-sm font-medium"
                >
                  Stop Delay
                </button>
              </div>

              {delays.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Recorded Delays</h4>
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Total:{" "}
                      {delays
                        .reduce((total, delay) => total + delay.duration, 0)
                        .toFixed(1)}
                      s
                    </div>
                  </div>
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
                <span>TLC Leader Notes</span>
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
                      <div className="text-4xl text-gray-400 mb-4">��</div>
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

      {/* PUMP Finalization Modal */}
      {showPumpFinalizationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Finalize Your PUMP Grade Factor (%) Assessment
            </h2>
            <p className="text-gray-600 mb-6">
              Please review and finalize your PUMP Grade Factor assessment
              before completing the observation.
            </p>
            <button
              onClick={() => setShowPumpFinalizationModal(false)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Continue with PUMP Assessment
            </button>
          </div>
        </div>
      )}

      {/* Standard Notes Modal */}
      {showStandardNotes && selectedStandardData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowStandardNotes(false)}
              className="absolute right-6 top-6 bg-transparent border-none text-2xl cursor-pointer"
            >
              ×
            </button>
            <h2 className="text-2xl mb-6 text-red-600">
              Standard Notes - {selectedStandardData.name}
            </h2>

            <div className="flex flex-col gap-6">
              {/* Standard Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Standard Details</h3>
                <p className="text-sm text-gray-600">
                  <strong>Facility:</strong>{" "}
                  {selectedStandardData.facility.name} |
                  <strong> Department:</strong>{" "}
                  {selectedStandardData.department.name} |
                  <strong> Area:</strong> {selectedStandardData.area.name}
                </p>
              </div>

              {/* Main Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Standard Notes</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {selectedStandardData.notes}
                  </div>
                </div>
              </div>

              {/* Version History (if available) */}
              {selectedStandardData.versions &&
                selectedStandardData.versions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Recent Version Changes
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      {(() => {
                        const latestVersion = selectedStandardData.versions![0];
                        const previousVersion =
                          selectedStandardData.versions![1];

                        return (
                          <div>
                            <h4 className="font-medium text-yellow-800 mb-2">
                              Latest Change (Version {latestVersion.version})
                            </h4>
                            <p className="text-sm text-yellow-700 mb-2">
                              <strong>Date:</strong>{" "}
                              {new Date(
                                latestVersion.createdAt,
                              ).toLocaleDateString()}
                            </p>
                            {latestVersion.versionNotes && (
                              <div className="text-sm text-yellow-800">
                                <strong>Change Notes:</strong>
                                <div className="mt-1 whitespace-pre-wrap">
                                  {latestVersion.versionNotes}
                                </div>
                              </div>
                            )}
                            {!latestVersion.versionNotes && (
                              <p className="text-sm text-yellow-600 italic">
                                No change notes available for this version.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowStandardNotes(false)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
