"use client";

import { useState, useEffect } from "react";

interface Facility {
  id: number;
  name: string;
  ref: string | null;
  city: string | null;
  dateAdded?: string;
}

interface Department {
  id: number;
  name: string;
  facilityId: number;
  facility?: {
    name: string;
  };
}

interface Area {
  id: number;
  name: string;
  departmentId: number;
  department?: {
    name: string;
    facility?: {
      name: string;
    };
  };
}

interface UomEntry {
  id: number;
  uom: string;
  description: string;
  samValue: number;
}

interface Standard {
  id: number;
  name: string;
  facilityId: number;
  departmentId: number;
  areaId: number;
  facility: {
    name: string;
  };
  department: {
    name: string;
  };
  area: {
    name: string;
  };
  uomEntries: UomEntry[];
  bestPractices: string[];
  processOpportunities: string[];
}

export default function Standards() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingName, setEditingName] = useState("");
  const [editingFacility, setEditingFacility] = useState("");
  const [editingDepartment, setEditingDepartment] = useState("");
  const [editingArea, setEditingArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Database-driven state
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [savedStandards, setSavedStandards] = useState<Standard[]>([]);

  // Form state
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [standardName, setStandardName] = useState("");
  const [newFacilityName, setNewFacilityName] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newAreaName, setNewAreaName] = useState("");
  const [newFacilityRef, setNewFacilityRef] = useState("");
  const [newFacilityCity, setNewFacilityCity] = useState("");
  const [uomEntries, setUomEntries] = useState([
    {
      id: 1,
      uom: "",
      description: "",
      samValue: 0,
    },
  ]);
  const [bestPractices, setBestPractices] = useState<string[]>([""]);
  const [processOpportunities, setProcessOpportunities] = useState<string[]>([
    "",
  ]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Load data from database
  const loadFacilities = async () => {
    try {
      setIsLoading(true);
      const data = await getFacilities();
      setFacilities(
        data.map((f) => ({
          ...f,
          ref: f.ref || "",
          city: f.city || "",
          dateAdded: f.dateAdded
            ? new Date(f.dateAdded).toISOString().split("T")[0]
            : "",
        })),
      );
    } catch (error) {
      console.error("Error loading facilities:", error);
      setError("Failed to load facilities");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartments = async (facilityId?: number) => {
    try {
      if (facilityId) {
        const data = await getDepartmentsByFacility(facilityId);
        setDepartments(data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
      setError("Failed to load departments");
    }
  };

  const loadAreas = async (departmentId?: number) => {
    try {
      if (departmentId) {
        const data = await getAreasByDepartment(departmentId);
        setAreas(data);
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error("Error loading areas:", error);
      setError("Failed to load areas");
    }
  };

  const loadStandards = async () => {
    try {
      const data = await getStandards();
      setSavedStandards(data);
    } catch (error) {
      console.error("Error loading standards:", error);
      setError("Failed to load standards");
    }
  };

  const clearSelections = () => {
    setSelectedFacility("");
    setSelectedDepartment("");
    setSelectedArea("");
    setSelectedStandard("");
    setStandardName("");
  };

  const clearFacilityInfo = () => {
    setNewFacilityRef("");
    setNewFacilityCity("");
    setNewFacilityName("");
  };

  const addFacility = async () => {
    if (!newFacilityName.trim()) return;

    try {
      setIsLoading(true);
      await createFacility({
        name: newFacilityName,
        ref: newFacilityRef || undefined,
        city: newFacilityCity || undefined,
      });

      await loadFacilities();
      setSuccessMessage("Facility added successfully!");
      setShowSaveSuccess(true);
      clearFacilityInfo();
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding facility:", error);
      setError("Failed to add facility");
    } finally {
      setIsLoading(false);
    }
  };

  const addDepartment = async () => {
    try {
      if (!newDepartmentName || !selectedFacility) {
        setError("Please select a facility and enter department name");
        return;
      }

      setIsLoading(true);
      await createDepartment({
        name: newDepartmentName,
        facilityId: Number(selectedFacility),
      });

      await loadDepartments(Number(selectedFacility));
      setSuccessMessage("Department added successfully!");
      setShowSaveSuccess(true);
      setNewDepartmentName("");
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding department:", error);
      setError("Failed to add department");
    } finally {
      setIsLoading(false);
    }
  };

  const addArea = async () => {
    try {
      if (!newAreaName.trim() || !selectedDepartment) {
        setError("Please enter an area name and select a department");
        return;
      }

      setIsLoading(true);
      await createArea({
        name: newAreaName,
        departmentId: Number(selectedDepartment),
      });

      await loadAreas(Number(selectedDepartment));
      setSuccessMessage("Area added successfully!");
      setShowSaveSuccess(true);
      setNewAreaName("");
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding area:", error);
      setError("Failed to add area");
    } finally {
      setIsLoading(false);
    }
  };

  const saveStandard = async () => {
    try {
      if (!selectedFacility || !selectedDepartment || !selectedArea) {
        setError("Please select facility, department and area");
        return;
      }

      const standardNameToSave =
        selectedStandard === "new" ? standardName : selectedStandard;
      if (!standardNameToSave) {
        setError("Please enter a standard name");
        return;
      }

      setIsLoading(true);

      const uomData = uomEntries
        .filter((entry) => entry.uom && entry.description && entry.samValue > 0)
        .map((entry) => ({
          uom: entry.uom,
          description: entry.description,
          samValue: entry.samValue,
        }));

      const validBestPractices = bestPractices.filter((practice) =>
        practice.trim(),
      );
      const validProcessOpportunities = processOpportunities.filter((opp) =>
        opp.trim(),
      );

      await createStandard({
        name: standardNameToSave,
        facilityId: Number(selectedFacility),
        departmentId: Number(selectedDepartment),
        areaId: Number(selectedArea),
        bestPractices: validBestPractices,
        processOpportunities: validProcessOpportunities,
        uomEntries: uomData,
      });

      await loadStandards();
      setSuccessMessage("Standard saved successfully!");
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);

      // Reset form
      clearSelections();
      setUomEntries([{ id: 1, uom: "", description: "", samValue: 0 }]);
      setBestPractices([""]);
      setProcessOpportunities([""]);
    } catch (error) {
      console.error("Error saving standard:", error);
      setError("Failed to save standard");
    } finally {
      setIsLoading(false);
    }
  };

  const addUomEntry = () => {
    const newEntries = [...uomEntries];
    newEntries.push({
      id: Date.now(),
      uom: "",
      description: "",
      samValue: 0,
    });
    setUomEntries(newEntries);
  };

  const addBestPractice = () => {
    setBestPractices([...bestPractices, ""]);
  };

  const addProcessOpportunity = () => {
    setProcessOpportunities([...processOpportunities, ""]);
  };

  const updateUomEntry = (
    id: number,
    field: string,
    value: string | number,
  ) => {
    const newEntries = uomEntries.map((entry) => {
      if (entry.id === id) {
        return {
          ...entry,
          [field]: field === "samValue" ? Number(value) : value,
        };
      }
      return entry;
    });
    setUomEntries(newEntries);
  };

  const updateBestPractice = (index: number, value: string) => {
    const newPractices = [...bestPractices];
    newPractices[index] = value;
    setBestPractices(newPractices);
  };

  const updateProcessOpportunity = (index: number, value: string) => {
    const newOpportunities = [...processOpportunities];
    newOpportunities[index] = value;
    setProcessOpportunities(newOpportunities);
  };

  // Load dependent data when selections change
  useEffect(() => {
    if (selectedFacility) {
      loadDepartments(Number(selectedFacility));
      setSelectedDepartment("");
      setSelectedArea("");
    }
  }, [selectedFacility]);

  useEffect(() => {
    if (selectedDepartment) {
      loadAreas(Number(selectedDepartment));
      setSelectedArea("");
    }
  }, [selectedDepartment]);

  useEffect(() => {
    loadFacilities();
    loadStandards();
  }, []);

  if (error) {
    setTimeout(() => setError(""), 5000);
  }

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
                  Dashboard
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 bg-white overflow-x-auto overflow-y-auto min-w-0">
            <div className="flex flex-row relative ml-5 leading-normal mt-2 pb-0.5 mr-5 mb-4 text-red-600 justify-between items-center">
              <h2 className="ml-0 text-2xl text-red-600">Transformation</h2>
              {isLoading && (
                <div className="text-blue-600 text-sm">Loading...</div>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-md">
              <h2 className="text-xl font-semibold mb-6">
                Standard Transformation
              </h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <select
                  value={selectedFacility}
                  onChange={(e) => {
                    setSelectedFacility(e.target.value);
                  }}
                  disabled={isLoading}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                >
                  <option value="">Select Facility</option>
                  {facilities.map((facility) => (
                    <option value={facility.id} key={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDepartment}
                  disabled={!selectedFacility || isLoading}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                  }}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option value={department.id} key={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedArea}
                  disabled={!selectedDepartment || isLoading}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
                >
                  <option value="">Select Area</option>
                  {areas.map((area) => (
                    <option value={area.id} key={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStandard}
                  onChange={(e) => setSelectedStandard(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                >
                  <option value="">Select Standard</option>
                  {savedStandards
                    .filter(
                      (s) => !selectedArea || s.areaId === Number(selectedArea),
                    )
                    .map((standard) => (
                      <option value={standard.name} key={standard.id}>
                        {standard.name}
                      </option>
                    ))}
                  <option value="new">New Standard</option>
                </select>
              </div>

              {selectedStandard === "new" && (
                <input
                  placeholder="Enter Standard Name"
                  value={standardName}
                  onChange={(e) => setStandardName(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white mt-4 disabled:opacity-50"
                />
              )}

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold">UOM Details</h3>
                  <button
                    onClick={addUomEntry}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    + Add UOM
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {uomEntries.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-3 gap-4">
                      <input
                        placeholder="UOM"
                        value={entry.uom}
                        onChange={(e) =>
                          updateUomEntry(entry.id, "uom", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                      />
                      <input
                        placeholder="UOM Description"
                        value={entry.description}
                        onChange={(e) =>
                          updateUomEntry(
                            entry.id,
                            "description",
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                        className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                      />
                      <input
                        type="number"
                        placeholder="SAM Value"
                        step="0.0001"
                        value={entry.samValue}
                        onChange={(e) =>
                          updateUomEntry(entry.id, "samValue", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold">Best Practices</h3>
                  <button
                    onClick={addBestPractice}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    + Add Practice
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {bestPractices.map((practice, index) => (
                    <input
                      placeholder="Enter best practice"
                      value={practice}
                      onChange={(e) =>
                        updateBestPractice(index, e.target.value)
                      }
                      disabled={isLoading}
                      className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                      key={index}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold">
                    Process Adherence Opportunities
                  </h3>
                  <button
                    onClick={addProcessOpportunity}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    + Add Opportunity
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {processOpportunities.map((opportunity, index) => (
                    <input
                      placeholder="Enter process adherence opportunity"
                      value={opportunity}
                      onChange={(e) =>
                        updateProcessOpportunity(index, e.target.value)
                      }
                      disabled={isLoading}
                      className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                      key={index}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  disabled={isLoading}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-md cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStandard}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Standard"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6 w-full">
              <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-md h-fit">
                <h2 className="text-xl font-semibold mb-6">
                  Facility Transformation
                </h2>
                <div className="flex flex-col gap-4">
                  <input
                    placeholder="Enter Facility Name"
                    value={newFacilityName}
                    onChange={(e) => setNewFacilityName(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  />
                  <input
                    placeholder="Enter Facility Reference"
                    value={newFacilityRef}
                    onChange={(e) => setNewFacilityRef(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  />
                  <input
                    placeholder="Enter Facility City"
                    value={newFacilityCity}
                    onChange={(e) => setNewFacilityCity(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  />
                  <button
                    onClick={addFacility}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Add Facility"}
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-md h-fit">
                <h2 className="text-xl font-semibold mb-6">
                  Department Transformation
                </h2>
                <div className="flex flex-col gap-4">
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Enter Department Name"
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  />
                  <button
                    onClick={addDepartment}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Add Department"}
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-md h-fit">
                <h2 className="text-xl font-semibold mb-6">
                  Area Transformation
                </h2>
                <div className="flex flex-col gap-4">
                  <select
                    value={selectedFacility}
                    onChange={(e) => {
                      setSelectedFacility(e.target.value);
                    }}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDepartment}
                    disabled={!selectedFacility || isLoading}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                    }}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Enter Area Name"
                    value={newAreaName}
                    disabled={!selectedDepartment || isLoading}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
                  />
                  <button
                    onClick={addArea}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Add Area"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-6 w-full">
              <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-md flex-1 min-w-0">
                <h2 className="text-xl font-semibold mb-6">Saved Standards</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Facility</th>
                        <th className="p-3 text-left">Department</th>
                        <th className="p-3 text-left">Area</th>
                        <th className="p-3 text-left">Standard</th>
                        <th className="p-3 text-left">Best Practices</th>
                        <th className="p-3 text-left">Process Opportunities</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedStandards.map((standard) => (
                        <tr
                          key={standard.id}
                          className="border-b border-gray-300"
                        >
                          <td className="p-3">{standard.facility.name}</td>
                          <td className="p-3">{standard.department.name}</td>
                          <td className="p-3">{standard.area.name}</td>
                          <td className="p-3">{standard.name}</td>
                          <td className="p-3">
                            <div className="text-sm text-gray-600">
                              {standard.bestPractices.length} practices
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm text-gray-600">
                              {standard.processOpportunities.length}{" "}
                              opportunities
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              disabled={isLoading}
                              className="px-3 py-1.5 bg-green-500 text-white border-none rounded cursor-pointer disabled:opacity-50"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showSaveSuccess && (
          <div className="fixed bottom-5 right-5 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
            {successMessage || "Changes saved successfully!"}
          </div>
        )}
      </div>
    </div>
  );
}
