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
  id: number;
  reason: string;
  startTime: number;
  endTime?: number;
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

  // PUMP scoring
  const [pace, setPace] = useState(100);
  const [utilization, setUtilization] = useState(100);
  const [methods, setMethods] = useState(100);
  const [pumpScore, setPumpScore] = useState(0);

  // Form data
  const [comments, setComments] = useState("");
  const [supervisorSignature, setSupervisorSignature] = useState("");
  const [teamMemberSignature, setTeamMemberSignature] = useState("");
  const [aiNotes, setAiNotes] = useState("");

  // Delay tracking
  const [isDelayActive, setIsDelayActive] = useState(false);
  const [delayStartTime, setDelayStartTime] = useState<number | null>(null);
  const [delayReason, setDelayReason] = useState("");
  const [delays, setDelays] = useState<Delay[]>([]);

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Methods
  const startObservation = () => {
    if (!isObserving && !isFinalized) {
      setIsObserving(true);
      const interval = setInterval(() => {
        setTimeObserved((prev) => {
          const newTime = prev + 1 / 60;
          calculatePerformance(newTime);
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
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      calculatePerformance(timeObserved);
    }
  };

  const calculatePerformance = (currentTime?: number) => {
    const time = currentTime !== undefined ? currentTime : timeObserved;
    if (time > 0) {
      const performance = (totalSams / time) * 100;
      setObservedPerformance(Number(performance.toFixed(2)));
    }
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
    calculatePerformance();
  };

  const generateAINotes = () => {
    const performanceLevel = observedPerformance >= 95;
    const feedback = performanceLevel
      ? "Your consistent high performance is impressive..."
      : "I see great potential in your work...";
    setAiNotes(`During today's observation, I noticed...

${feedback}`);
  };

  const submitObservation = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionError("");
    setSubmissionSuccess(false);

    try {
      // Validation
      if (!employeeId || !observationReason || !standard) {
        throw new Error("Please fill in all required fields");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmissionSuccess(true);
      resetForm();

      setTimeout(() => {
        setSubmissionSuccess(false);
      }, 3000);
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Failed to submit observation",
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
    setComments("");
    setSupervisorSignature("");
    setTeamMemberSignature("");
    setObservedPerformance(0);
    setAiNotes("");
    setIsFinalized(false);
    setIsObserving(false);
    setDelays([]);
  };

  useEffect(() => {
    calculateTotalSams();
  }, [rows]);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

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
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee ID</option>
                <option value="emp001">EMP001 - John Smith</option>
                <option value="emp002">EMP002 - Sarah Johnson</option>
                <option value="emp003">EMP003 - Michael Brown</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Standard</label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Standard</option>
                <option value="std1">
                  PDC - Picking - OSR Standard (0.45 SAM)
                </option>
                <option value="std2">
                  PDC - Picking - Case Standard (0.65 SAM)
                </option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Observation Reason
              </label>
              <select
                value={observationReason}
                onChange={(e) => setObservationReason(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Reason</option>
                <option value="performance">Performance Review</option>
                <option value="training">Training Assessment</option>
                <option value="routine">Routine Check</option>
              </select>
            </div>
          </div>

          {/* Observation Timer and Controls */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <button
              onClick={() =>
                isObserving ? stopObservation() : startObservation()
              }
              disabled={!employeeId || !standard || !observationReason}
              className={`px-6 py-3 text-white border-none rounded-lg cursor-pointer font-semibold transition-colors ${
                isObserving
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isObserving ? "Stop Observation" : "Start Observation"}
            </button>

            <div className="text-lg font-semibold">
              Time: {timeObserved.toFixed(2)} minutes
            </div>

            <div className="text-lg font-semibold text-red-600">
              Performance: {observedPerformance}%
            </div>
          </div>

          {/* Data Rows */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Operations</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">
                      UOM
                    </th>
                    <th className="border border-gray-300 p-3 text-left">
                      Description
                    </th>
                    <th className="border border-gray-300 p-3 text-left">
                      Quantity
                    </th>
                    <th className="border border-gray-300 p-3 text-left">
                      SAM Value
                    </th>
                    <th className="border border-gray-300 p-3 text-left">
                      Total SAMs
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="border border-gray-300 p-3">{row.uom}</td>
                      <td className="border border-gray-300 p-3">
                        {row.description}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) =>
                            updateQuantity(row.id, Number(e.target.value))
                          }
                          className="w-full p-2 border border-gray-300 rounded"
                          min="0"
                        />
                      </td>
                      <td className="border border-gray-300 p-3">
                        {row.samValue}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {(row.quantity * row.samValue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comments */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter any observations or comments..."
            />
          </div>

          {/* AI Notes */}
          {aiNotes && (
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                AI Generated Notes
              </label>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <pre className="whitespace-pre-wrap text-sm">{aiNotes}</pre>
              </div>
              <button
                onClick={generateAINotes}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Regenerate AI Notes
              </button>
            </div>
          )}

          {!aiNotes && (
            <button
              onClick={generateAINotes}
              className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Generate AI Notes
            </button>
          )}

          {/* Submit Button */}
          <button
            onClick={submitObservation}
            disabled={isSubmitting || !isFinalized}
            className={`px-6 py-3 bg-blue-500 text-white border-none rounded-lg cursor-pointer font-semibold transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? "Submitting..." : "Submit Observation"}
          </button>

          {submissionSuccess && (
            <div className="text-green-600 mt-4 font-semibold">
              Observation submitted successfully!
            </div>
          )}

          {submissionError && (
            <div className="text-red-600 mt-4 font-semibold">
              {submissionError}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
