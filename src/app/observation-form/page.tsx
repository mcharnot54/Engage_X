"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface TableRow {
  id: number;
  uom: string;
  description: string;
  quantity: number;
  samValue: number;
}

export default function ObservationForm() {
  // State management
  const [standard, setStandard] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [observationReason, setObservationReason] = useState("");
  const [showReasonInstructions, setShowReasonInstructions] = useState(false);
  const [showPreviousObservations, setShowPreviousObservations] =
    useState(false);

  // PUMP Score state
  const [pace, setPace] = useState(0);
  const [utilization, setUtilization] = useState(0);
  const [methods, setMethods] = useState(0);
  const [pumpScore, setPumpScore] = useState(0);

  // Observation state
  const [isObserving, setIsObserving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [timeObserved, setTimeObserved] = useState(0);
  const [observedPerformance, setObservedPerformance] = useState("0.00");

  // Table data
  const [rows, setRows] = useState<TableRow[]>([
    {
      id: 1,
      uom: "SEW",
      description: "Sew Operation",
      quantity: 0,
      samValue: 0.025,
    },
    {
      id: 2,
      uom: "TRIM",
      description: "Trim Operation",
      quantity: 0,
      samValue: 0.015,
    },
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total SAMs
  const totalSams = rows.reduce(
    (sum, row) => sum + row.quantity * row.samValue,
    0,
  );

  // Update PUMP score when any factor changes
  useEffect(() => {
    const newPumpScore = (pace * utilization * methods) / 10000;
    setPumpScore(newPumpScore);
  }, [pace, utilization, methods]);

  // Calculate observed performance
  useEffect(() => {
    if (timeObserved > 0 && totalSams > 0) {
      const performance = ((totalSams / timeObserved) * 100).toFixed(2);
      setObservedPerformance(performance);
    }
  }, [totalSams, timeObserved]);

  // Timer for observation
  useEffect(() => {
    if (isObserving) {
      timerRef.current = setInterval(() => {
        setTimeObserved((prev) => prev + 0.01);
      }, 10);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isObserving]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 0) newQuantity = 0;
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, quantity: newQuantity } : row,
      ),
    );
  };

  const startObservation = () => {
    if (!employeeId || !observationReason || !standard) return;
    setIsObserving(true);
    setTimeObserved(0);
  };

  const stopObservation = () => {
    setIsObserving(false);
    setIsFinalized(true);
  };

  const handleReasonChange = (reason: string) => {
    setObservationReason(reason);
    if (reason) {
      setShowReasonInstructions(true);
    }
  };

  const handleEmployeeChange = (empId: string) => {
    setEmployeeId(empId);
    if (empId && standard) {
      setShowPreviousObservations(true);
    }
  };

  const renderInstructionContent = () => {
    const instructions = {
      performance: {
        title: "Performance Review Instructions",
        purpose: [
          "Evaluate current performance levels against established standards",
          "Identify areas of excellence and opportunities for improvement",
          "Document performance trends and patterns",
          "Provide basis for coaching and development plans",
        ],
        guidelines: [
          "Begin with a brief explanation of the observation purpose",
          "Maintain a neutral, professional demeanor throughout",
          "Take detailed notes on specific behaviors and actions",
          "Schedule immediate follow-up discussion to share feedback",
          "Focus on objective data and specific examples",
        ],
      },
      training: {
        title: "Training Assessment Instructions",
        purpose: [
          "Assess effectiveness of training programs",
          "Verify proper application of learned skills",
          "Identify additional training needs",
          "Evaluate readiness for independent work",
        ],
        guidelines: [
          "Review training objectives before observation",
          "Observe application of specific trained skills",
          "Document both strengths and areas needing reinforcement",
          "Provide immediate constructive feedback",
          "Discuss next steps in training progression",
        ],
      },
      incident: {
        title: "Incident Follow-up Instructions",
        purpose: [
          "Verify corrective actions are being followed",
          "Ensure safety protocols are being maintained",
          "Document compliance with updated procedures",
          "Prevent incident recurrence",
        ],
        guidelines: [
          "Review incident details and corrective actions beforehand",
          "Focus observation on specific areas related to incident",
          "Document all safety-related behaviors",
          "Provide immediate feedback on any safety concerns",
          "Discuss preventive measures and ongoing safety awareness",
        ],
      },
      routine: {
        title: "Routine Check Instructions",
        purpose: [
          "Maintain regular performance monitoring",
          "Ensure consistent application of standards",
          "Identify potential process improvements",
          "Support continuous improvement culture",
        ],
        guidelines: [
          "Conduct observation as part of normal routine",
          "Maintain casual but professional atmosphere",
          "Document both positive practices and improvement opportunities",
          "Provide balanced feedback on overall performance",
          "Discuss any process improvement suggestions",
        ],
      },
    };

    const currentInstructions =
      instructions[observationReason as keyof typeof instructions];
    if (!currentInstructions) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Purpose:</h3>
          <ul className="pl-5 list-disc space-y-1 leading-relaxed">
            {currentInstructions.purpose.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Leader Interaction Guidelines:
          </h3>
          <ul className="pl-5 list-disc space-y-1 leading-relaxed">
            {currentInstructions.guidelines.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Observation Form</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Observation Details</h2>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Standard Select */}
            <div>
              <label
                htmlFor="standard-select"
                className="block mb-2 font-medium text-gray-700"
              >
                Standard
              </label>
              <select
                id="standard-select"
                value={standard}
                disabled={isObserving || isFinalized}
                onChange={(e) => setStandard(e.target.value)}
                className={`w-full p-3 border border-gray-300 rounded-lg bg-white transition-all duration-200 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%3E%3Cpath%20d%3D%22M7%2010L1%204h12z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] pr-8 ${
                  isObserving || isFinalized
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <option value="" disabled>
                  Select Standard *
                </option>
                <optgroup label="PDC - Picking">
                  <option value="std1">
                    PDC - Picking - OSR - OSR Standard (0.45 SAM)
                  </option>
                  <option value="std2">
                    PDC - Picking - Case - Case Pick Standard (0.65 SAM)
                  </option>
                  <option value="std3">
                    PDC - Picking - Each - Each Pick Standard (0.32 SAM)
                  </option>
                </optgroup>
                <optgroup label="PDC - Packing">
                  <option value="std4">
                    PDC - Packing - Singles - Singles Pack Standard (0.28 SAM)
                  </option>
                  <option value="std5">
                    PDC - Packing - Multi - Multi Pack Standard (0.22 SAM)
                  </option>
                </optgroup>
                <optgroup label="PDC - Receiving">
                  <option value="std6">
                    PDC - Receiving - Unload - Truck Unload Standard (0.50 SAM)
                  </option>
                  <option value="std7">
                    PDC - Receiving - Sort - Carton Sort Standard (0.35 SAM)
                  </option>
                </optgroup>
                <optgroup label="RDC - Picking">
                  <option value="std8">
                    RDC - Picking - Pallet - Full Pallet Pick Standard (0.75
                    SAM)
                  </option>
                  <option value="std9">
                    RDC - Picking - Layer - Layer Pick Standard (0.55 SAM)
                  </option>
                </optgroup>
                <optgroup label="RDC - Loading">
                  <option value="std10">
                    RDC - Loading - Outbound - Truck Load Standard (0.40 SAM)
                  </option>
                  <option value="std11">
                    RDC - Loading - Stage - Load Stage Standard (0.30 SAM)
                  </option>
                </optgroup>
              </select>
            </div>

            {/* Employee ID Select */}
            <div>
              <label
                htmlFor="employee-id"
                className="block mb-2 font-medium text-gray-700"
              >
                Employee ID
              </label>
              <select
                id="employee-id"
                value={employeeId}
                disabled={isObserving || isFinalized}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className={`w-full p-3 border border-gray-300 rounded-lg bg-white transition-all duration-200 shadow-sm appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 9L1 4h10z\' fill=\'%23666666\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-8 ${
                  isObserving || isFinalized
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <option value="">Select Employee ID *</option>
                <option value="emp001">EMP001 - John Smith</option>
                <option value="emp002">EMP002 - Sarah Johnson</option>
                <option value="emp003">EMP003 - Michael Brown</option>
                <option value="emp004">EMP004 - Lisa Anderson</option>
                <option value="emp005">EMP005 - David Wilson</option>
              </select>
            </div>

            {/* Observation Reason Select */}
            <div>
              <label
                htmlFor="observation-reason"
                className="block mb-2 font-medium text-gray-700"
              >
                Observation Reason
              </label>
              <select
                id="observation-reason"
                value={observationReason}
                disabled={isObserving || isFinalized}
                onChange={(e) => handleReasonChange(e.target.value)}
                className={`w-full p-3 border border-gray-300 rounded-lg bg-white transition-all duration-200 shadow-sm appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 9L1 4h10z\' fill=\'%23666666\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-8 ${
                  isObserving || isFinalized
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <option value="">Select Reason *</option>
                <option value="performance">Performance Review</option>
                <option value="training">Training Assessment</option>
                <option value="incident">Incident Follow-up</option>
                <option value="routine">Routine Check</option>
              </select>
            </div>
          </div>

          {/* PUMP Score Section */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-center mb-6">
              Grade Factor % (P.U.M.P)
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {/* Pace */}
              <div className="flex flex-col items-center w-36">
                <label
                  title="100% Pace is a motivated pace that a team member can sustain throughout an entire shift."
                  className="block mb-3 font-medium text-gray-700 cursor-help text-center"
                >
                  Pace %
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  step="5"
                  value={pace || ""}
                  disabled={!isObserving || isFinalized}
                  onChange={(e) => {
                    if (isObserving && !isFinalized) {
                      let value = Number(e.target.value);
                      if (value < 0) value = 0;
                      if (value > 150) value = 150;
                      setPace(value);
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="text-2xl font-bold text-gray-600 mt-8">×</div>

              {/* Utilization */}
              <div className="flex flex-col items-center w-36">
                <label
                  title="Utilization measures the time spent while on productive tasks."
                  className="block mb-3 font-medium text-gray-700 cursor-help text-center"
                >
                  Utilization %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={utilization || ""}
                  disabled={!isObserving || isFinalized}
                  onChange={(e) => {
                    if (isObserving && !isFinalized) {
                      let value = Number(e.target.value);
                      if (value < 0) value = 0;
                      if (value > 100) value = 100;
                      setUtilization(value);
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="text-2xl font-bold text-gray-600 mt-8">×</div>

              {/* Methods */}
              <div className="flex flex-col items-center w-36">
                <label
                  title="100% Methods and Procedures means following all safety and quality expectations."
                  className="block mb-3 font-medium text-gray-700 cursor-help text-center"
                >
                  Methods %
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  step="5"
                  value={methods || ""}
                  disabled={!isObserving || isFinalized}
                  onChange={(e) => {
                    if (isObserving && !isFinalized) {
                      let value = Number(e.target.value);
                      if (value < 0) value = 0;
                      if (value > 150) value = 150;
                      setMethods(value);
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="text-2xl font-bold text-gray-600 mt-8">=</div>

              {/* PUMP Score */}
              <div className="flex flex-col items-center w-36">
                <label
                  title="PUMP Grade Factor Performance is calculated from Pace, Utilization, and Methods"
                  className="block mb-3 font-medium text-gray-700 cursor-help text-center"
                >
                  PUMP Score %
                </label>
                <input
                  type="number"
                  readOnly
                  value={pumpScore.toFixed(2)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-center bg-gray-100 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="p-3 text-left font-semibold text-gray-700">
                    UOM
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-700 min-w-[300px]">
                    UOM Description
                  </th>
                  <th className="p-3 text-center font-semibold text-gray-700">
                    Quantity
                  </th>
                  <th className="p-3 text-right font-semibold text-gray-700">
                    SAM Value
                  </th>
                  <th className="p-3 text-right font-semibold text-gray-700">
                    Total SAMs
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200">
                    <td className="p-3 font-medium">{row.uom}</td>
                    <td className="p-3">{row.description}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={!isObserving}
                          onClick={() =>
                            updateQuantity(row.id, row.quantity - 1)
                          }
                          className="p-1 w-8 h-8 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-16 p-1 border border-gray-300 rounded text-center"
                        />
                        <button
                          disabled={!isObserving}
                          onClick={() =>
                            updateQuantity(row.id, row.quantity + 1)
                          }
                          className="p-1 w-8 h-8 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="p-3">
                    <button
                      disabled={
                        !employeeId ||
                        !observationReason ||
                        !standard ||
                        isFinalized
                      }
                      onClick={isObserving ? stopObservation : startObservation}
                      style={{
                        backgroundColor: isObserving
                          ? "#ff4444"
                          : !employeeId || !observationReason || !standard
                            ? "#cccccc"
                            : "#4CAF50",
                        display: isFinalized ? "none" : "block",
                      }}
                      className="px-5 py-2 text-white border-none rounded cursor-pointer transition-all duration-300 font-semibold text-sm shadow-sm"
                    >
                      {isObserving
                        ? "Finalize Observation"
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
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-3 font-semibold text-right">
                    <span className="inline-flex items-center gap-2">
                      <span>Time Observed</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5ZM8.75 11.5H7.25V7.25H8.75V11.5ZM8.75 5.75H7.25V4.25H8.75V5.75Z"
                          fill="#666"
                        ></path>
                      </svg>
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      min="0"
                      readOnly
                      value={timeObserved.toFixed(2)}
                      className="w-20 p-1 border border-gray-300 rounded text-right"
                    />
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td
                    colSpan={4}
                    className="p-3 font-semibold text-right text-red-600 text-lg"
                  >
                    Observed Performance %:
                  </td>
                  <td className="p-3 font-semibold text-right text-red-600 text-lg">
                    {observedPerformance}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Instruction Modal */}
      {showReasonInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto relative shadow-xl">
            <button
              onClick={() => setShowReasonInstructions(false)}
              className="absolute right-6 top-6 text-2xl hover:bg-gray-100 p-2 rounded"
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-red-600">
              {observationReason === "performance" &&
                "Performance Review Instructions"}
              {observationReason === "training" &&
                "Training Assessment Instructions"}
              {observationReason === "incident" &&
                "Incident Follow-up Instructions"}
              {observationReason === "routine" && "Routine Check Instructions"}
            </h2>
            {renderInstructionContent()}
          </div>
        </div>
      )}
    </div>
  );
}
