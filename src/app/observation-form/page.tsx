"use client";

import { useState, useEffect } from "react";

type Row = {
  id: number;
  uom: string;
  description: string;
  quantity: number;
  samValue: number;
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
  // Observation tracking
  const [isObserving, setIsObserving] = useState(false);
  const [timeObserved, setTimeObserved] = useState(0);
  const [totalSams, setTotalSams] = useState(0);
  const [employeeId, setEmployeeId] = useState("");
  const [observationReason, setObservationReason] = useState("");
  const [standard, setStandard] = useState("");
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

  // Data rows for operations
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      uom: "SEW",
      description: "Sew Operation",
      quantity: 0,
      samValue: 0.45,
    },
    {
      id: 2,
      uom: "TRIM",
      description: "Trim Operation",
      quantity: 0,
      samValue: 0.32,
    },
  ]);

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
    }
  };

  const calculatePerformance = () => {
    if (timeObserved > 0) {
      const performance = (totalSams / timeObserved) * 100;
      setObservedPerformance(Number(performance.toFixed(2)));
    }
    // Calculate PUMP score
    const score = (pace * utilization * methods) / 10000;
    setPumpScore(Number(score.toFixed(2)));
  };

  const updateQuantity = (id: number, value: number) => {
    setRows((prevRows) => {
      const newRows = prevRows.map((row) =>
        row.id === id ? { ...row, quantity: Math.max(0, value) } : row,
      );
      return newRows;
    });
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmissionSuccess(true);
      resetForm();

      setTimeout(() => {
        setSubmissionSuccess(false);
      }, 3000);
    } catch (error) {
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
    setRows((prev) => prev.map((row) => ({ ...row, quantity: 0 })));
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

  const bestPracticesList = [
    "Follow standard operating procedures",
    "Maintain proper workstation organization",
    "Use recommended tools and equipment",
    "Apply correct handling techniques",
    "Maintain quality checkpoints",
    "Document process variations",
    "Follow safety protocols",
    "Maintain cleanliness standards",
  ];

  const processAdherenceList = [
    "Optimize material handling flow",
    "Reduce unnecessary movements",
    "Improve workstation layout",
    "Standardize work sequence",
    "Enhance quality inspection process",
    "Update process documentation",
    "Implement visual management",
    "Streamline changeover process",
  ];

  return (
    <div className="font-sans bg-gray-100 min-h-screen">
      {/* Navigation Header */}
      <header className="bg-white px-6 py-4 shadow-md">
        <h1 className="m-0 text-red-600 text-2xl font-semibold">
          "Gaze" Observation Application
        </h1>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-6xl mx-auto">
        {/* Observation Form */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Observation Details</h2>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block mb-2 font-medium">Employee ID</label>
              <select
                value={employeeId}
                disabled={isObserving || isFinalized}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  if (e.target.value && standard) {
                    setShowPreviousObservations(true);
                  }
                }}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Select Employee ID *</option>
                <option value="emp001">EMP001 - John Smith</option>
                <option value="emp002">EMP002 - Sarah Johnson</option>
                <option value="emp003">EMP003 - Michael Brown</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Standard</label>
              <select
                value={standard}
                disabled={isObserving || isFinalized}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Select Standard *</option>
                <option value="std1">
                  PDC - Picking - OSR Standard (0.45 SAM)
                </option>
                <option value="std2">
                  PDC - Picking - Case Standard (0.65 SAM)
                </option>
                <option value="std3">
                  PDC - Picking - Each Standard (0.32 SAM)
                </option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Observation Reason
              </label>
              <select
                value={observationReason}
                disabled={isObserving || isFinalized}
                onChange={(e) => {
                  setObservationReason(e.target.value);
                  if (e.target.value) {
                    setShowReasonInstructions(true);
                  }
                }}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Select Reason *</option>
                <option value="performance">Performance Review</option>
                <option value="training">Training Assessment</option>
                <option value="incident">Incident Follow-up</option>
                <option value="routine">Routine Check</option>
              </select>
            </div>
          </div>

          {/* PUMP Section (Grade Factor %) */}
          <div className="mb-6 p-5 bg-white rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold mb-5 text-center">
              Grade Factor % (P.U.M.P)
            </h3>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex flex-col items-center min-w-[120px]">
                <label
                  title="100% Pace is a motivated pace that a team member can sustain throughout an entire shift."
                  className="block mb-2 font-medium cursor-help"
                >
                  Pace %
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  step="5"
                  value={pace}
                  disabled={!isObserving || isFinalized}
                  onChange={(e) => {
                    if (isObserving && !isFinalized) {
                      let value = Number(e.target.value);
                      if (value < 0) value = 0;
                      if (value > 150) value = 150;
                      setPace(value);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-center disabled:opacity-50"
                />
              </div>

              <div className="flex items-center text-xl font-bold text-gray-600">
                ×
              </div>

              <div className="flex flex-col items-center min-w-[120px]">
                <label
                  title="Utilization measures the time spent while on productive tasks."
                  className="block mb-2 font-medium cursor-help"
                >
                  Utilization %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={utilization}
                  disabled={!isObserving || isFinalized}
                  onChange={(e) => {
                    if (isObserving && !isFinalized) {
                      let value = Number(e.target.value);
                      if (value < 0) value = 0;
                      if (value > 100) value = 100;
                      setUtilization(value);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-center disabled:opacity-50"
                />
              </div>

              <div className="flex items-center text-xl font-bold text-gray-600">
                ×
              </div>

              <div className="flex flex-col items-center min-w-[120px]">
                <label
                  title="100% Methods and Procedures means following all safety and quality expectations."
                  className="block mb-2 font-medium cursor-help"
                >
                  Methods %
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  step="5"
                  value={methods}
                  disabled={!isObserving || isFinalized}
                  onChange={(e) => {
                    if (isObserving && !isFinalized) {
                      let value = Number(e.target.value);
                      if (value < 0) value = 0;
                      if (value > 150) value = 150;
                      setMethods(value);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-center disabled:opacity-50"
                />
              </div>

              <div className="flex items-center text-xl font-bold text-gray-600">
                =
              </div>

              <div className="flex flex-col items-center min-w-[120px]">
                <label
                  title="PUMP Grade Factor Performance is calculated from Pace, Utilization, and Methods"
                  className="block mb-2 font-medium cursor-help"
                >
                  PUMP Score %
                </label>
                <input
                  type="number"
                  readOnly
                  value={pumpScore}
                  className="w-full p-2 border border-gray-300 rounded text-center bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Operations Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="p-3 text-left font-semibold">UOM</th>
                  <th className="p-3 text-left font-semibold">Description</th>
                  <th className="p-3 text-center font-semibold">Quantity</th>
                  <th className="p-3 text-right font-semibold">SAM Value</th>
                  <th className="p-3 text-right font-semibold">Total SAMs</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-300">
                    <td className="p-3">{row.uom}</td>
                    <td className="p-3">{row.description}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={!isObserving}
                          onClick={() =>
                            updateQuantity(row.id, row.quantity - 1)
                          }
                          className="px-2 py-1 border border-gray-300 rounded bg-white cursor-pointer disabled:opacity-50"
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
                          className="w-16 p-1 border border-gray-300 rounded text-center disabled:opacity-50"
                        />
                        <button
                          disabled={!isObserving}
                          onClick={() =>
                            updateQuantity(row.id, row.quantity + 1)
                          }
                          className="px-2 py-1 border border-gray-300 rounded bg-white cursor-pointer disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {row.samValue.toFixed(4)}
                    </td>
                    <td className="p-3 text-right">
                      {(row.quantity * row.samValue).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-100">
                  <td className="p-3">
                    <button
                      disabled={
                        !employeeId ||
                        !observationReason ||
                        !standard ||
                        isFinalized
                      }
                      onClick={() =>
                        isObserving ? stopObservation() : startObservation()
                      }
                      className={`px-5 py-2 text-white border-none rounded cursor-pointer font-semibold disabled:opacity-50 ${
                        isObserving
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {isObserving
                        ? "Finalize Observation"
                        : isFinalized
                          ? "Finalized"
                          : "Start Observation"}
                    </button>
                  </td>
                  <td colSpan={3} className="p-3 font-semibold text-right">
                    Total SAMs:
                  </td>
                  <td className="p-3 font-semibold text-right">
                    {totalSams.toFixed(4)}
                  </td>
                </tr>
                <tr className="bg-gray-100">
                  <td colSpan={4} className="p-3 font-semibold text-right">
                    Time Observed (minutes):
                  </td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      readOnly
                      value={timeObserved.toFixed(2)}
                      className="w-20 p-1 border border-gray-300 rounded text-right bg-gray-100"
                    />
                  </td>
                </tr>
                {!isObserving && (
                  <tr className="bg-gray-100">
                    <td
                      colSpan={4}
                      className="p-3 font-semibold text-right text-red-600 text-lg"
                    >
                      Observed Performance %:
                    </td>
                    <td className="p-3 font-semibold text-right text-red-600 text-lg">
                      {observedPerformance || "0.00"}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          {/* Delay Timer Section */}
          <div className="p-5 bg-white rounded-lg border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Unavoidable Delay Time
            </h3>
            <div className="flex gap-4 mb-4 items-center">
              <button
                disabled={
                  !isObserving || (isDelayActive && !delayReason) || isFinalized
                }
                onClick={() => {
                  if (!isDelayActive) {
                    setDelayStartTime(Date.now());
                    setIsDelayActive(true);
                  } else {
                    stopDelay();
                  }
                }}
                className={`px-6 py-3 text-white border-none rounded-lg cursor-pointer font-medium disabled:opacity-50 ${
                  isDelayActive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isDelayActive ? "Finish Delay" : "Start Delay"}
              </button>

              <select
                value={delayReason}
                disabled={!isDelayActive}
                onChange={(e) => setDelayReason(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 flex-1 disabled:opacity-50"
              >
                <option value="">Select Delay Reason</option>
                <option value="congestion">Congestion</option>
                <option value="lack-of-work">Lack of Work</option>
                <option value="out-of-supplies">Out of Supplies / 5S</option>
              </select>
            </div>

            {/* Delay History */}
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4">
              {delays.length ? (
                delays.map((delay, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2"
                    style={{
                      borderBottom:
                        index < delays.length - 1
                          ? "1px solid #e2e2e2"
                          : "none",
                    }}
                  >
                    <div>
                      <strong>
                        {delay.reason
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </strong>
                      <div className="text-gray-600 text-sm">
                        {delay.timestamp}
                      </div>
                    </div>
                    <div className="font-medium">
                      {Math.round(delay.duration)} seconds
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-600">
                  No delays recorded
                </div>
              )}

              {delays.length > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between items-center">
                  <div className="font-semibold">Total Delay Time:</div>
                  <div className="font-semibold text-red-600">
                    {Math.round(
                      delays.reduce((sum, delay) => sum + delay.duration, 0),
                    )}{" "}
                    seconds
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Best Practices and Process Adherence */}
          <div className="flex gap-6 mb-6">
            <div className="flex-1 p-5 rounded-lg bg-gray-100 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
              <div className="flex flex-col gap-3">
                {bestPracticesList.map((practice, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={bestPracticesChecked.includes(practice)}
                      onChange={() => toggleBestPractice(practice)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="flex-1">{practice}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex-1 p-5 rounded-lg bg-gray-100 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4">
                Process Adherence Opportunities
              </h3>
              <div className="flex flex-col gap-3">
                {processAdherenceList.map((opportunity, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={processAdherenceChecked.includes(opportunity)}
                      onChange={() => toggleProcessAdherence(opportunity)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="flex-1">{opportunity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-5 bg-white rounded-lg border border-gray-300 mb-6">
            <h3 className="text-lg font-semibold mb-4">Observation Comments</h3>
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
        </div>

        {/* Performance Trends Section */}
        <div className="bg-gray-100 rounded-lg p-6 border border-gray-300 mb-6">
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

      {/* Previous Observations Popup */}
      {showPreviousObservations && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPreviousObservations(false)}
              className="absolute right-6 top-6 bg-transparent border-none text-2xl cursor-pointer"
            >
              ×
            </button>
            <h2 className="text-2xl mb-4 pr-10">
              {employeeId === "emp001"
                ? "John Smith"
                : employeeId === "emp002"
                  ? "Sarah Johnson"
                  : "Michael Brown"}
              's Previous Observations
            </h2>

            {previousObservations[employeeId]?.[standard] ? (
              <div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-white rounded-lg text-center border border-gray-300">
                    <div className="text-2xl font-semibold text-blue-500">
                      95.8%
                    </div>
                    <div className="text-gray-600 text-sm">
                      Average Performance
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg text-center border border-gray-300">
                    <div className="text-2xl font-semibold text-green-500">
                      102.3%
                    </div>
                    <div className="text-gray-600 text-sm">
                      Highest Performance
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg text-center border border-gray-300">
                    <div className="text-2xl font-semibold text-orange-500">
                      89.8%
                    </div>
                    <div className="text-gray-600 text-sm">
                      Lowest Performance
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg text-center border border-gray-300">
                    <div className="text-2xl font-semibold text-purple-500">
                      5
                    </div>
                    <div className="text-gray-600 text-sm">
                      Total Observations
                    </div>
                  </div>
                </div>

                <h3 className="text-lg mb-4">Detailed History</h3>
                <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg mb-4 font-semibold border border-gray-300">
                  <div>Date</div>
                  <div>Observed Performance</div>
                  <div>Grade Factor Performance</div>
                </div>

                {previousObservations[employeeId][standard].map(
                  (obs, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200"
                    >
                      <div>{obs.date}</div>
                      <div>{obs.observedPerf}%</div>
                      <div>{obs.gradeFactorPerf}%</div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-100 rounded-lg text-gray-600">
                This will be the first observation for this team member on this
                standard.
              </div>
            )}
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
              {observationReason === "routine" && "Routine Check Instructions"}
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
                      Begin with a brief explanation of the observation purpose
                    </li>
                    <li>
                      Maintain a neutral, professional demeanor throughout
                    </li>
                    <li>
                      Take detailed notes on specific behaviors and actions
                    </li>
                    <li>
                      Schedule immediate follow-up discussion to share feedback
                    </li>
                    <li>Focus on objective data and specific examples</li>
                  </ul>
                </div>
              )}

              {observationReason === "training" && (
                <div>
                  <h3 className="text-lg mb-4">Purpose:</h3>
                  <ul className="pl-5 leading-relaxed">
                    <li>Assess effectiveness of training programs</li>
                    <li>Verify proper application of learned skills</li>
                    <li>Identify additional training needs</li>
                    <li>Evaluate readiness for independent work</li>
                  </ul>
                  <h3 className="text-lg my-4">
                    Leader Interaction Guidelines:
                  </h3>
                  <ul className="pl-5 leading-relaxed">
                    <li>Review training objectives before observation</li>
                    <li>Observe application of specific trained skills</li>
                    <li>
                      Document both strengths and areas needing reinforcement
                    </li>
                    <li>Provide immediate constructive feedback</li>
                    <li>Discuss next steps in training progression</li>
                  </ul>
                </div>
              )}

              {observationReason === "incident" && (
                <div>
                  <h3 className="text-lg mb-4">Purpose:</h3>
                  <ul className="pl-5 leading-relaxed">
                    <li>Verify corrective actions are being followed</li>
                    <li>Ensure safety protocols are being maintained</li>
                    <li>Document compliance with updated procedures</li>
                    <li>Prevent incident recurrence</li>
                  </ul>
                  <h3 className="text-lg my-4">
                    Leader Interaction Guidelines:
                  </h3>
                  <ul className="pl-5 leading-relaxed">
                    <li>
                      Review incident details and corrective actions beforehand
                    </li>
                    <li>
                      Focus observation on specific areas related to incident
                    </li>
                    <li>Document all safety-related behaviors</li>
                    <li>Provide immediate feedback on any safety concerns</li>
                    <li>
                      Discuss preventive measures and ongoing safety awareness
                    </li>
                  </ul>
                </div>
              )}

              {observationReason === "routine" && (
                <div>
                  <h3 className="text-lg mb-4">Purpose:</h3>
                  <ul className="pl-5 leading-relaxed">
                    <li>Maintain regular performance monitoring</li>
                    <li>Ensure consistent application of standards</li>
                    <li>Identify potential process improvements</li>
                    <li>Support continuous improvement culture</li>
                  </ul>
                  <h3 className="text-lg my-4">
                    Leader Interaction Guidelines:
                  </h3>
                  <ul className="pl-5 leading-relaxed">
                    <li>Conduct observation as part of normal routine</li>
                    <li>Maintain casual but professional atmosphere</li>
                    <li>
                      Document both positive practices and improvement
                      opportunities
                    </li>
                    <li>Provide balanced feedback on overall performance</li>
                    <li>Discuss any process improvement suggestions</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
