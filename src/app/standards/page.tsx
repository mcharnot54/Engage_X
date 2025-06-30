"use client";

import { useState, useEffect } from "react";

interface Facility {
  id: number;
  name: string;
  ref: string;
  city: string;
  dateAdded: string;
}

interface Department {
  id: number;
  name: string;
  facilityId: number;
  facilityName: string;
}

interface Area {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
  facilityId: number;
  facilityName: string;
}

interface UomEntry {
  id: number;
  uom: string;
  description: string;
  samValue: string;
}

interface Standard {
  id: number;
  facilityId: number;
  facility: string;
  departmentId: number;
  department: string;
  areaId: number;
  area: string;
  standard: string;
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
  const [submittedObservations, setSubmittedObservations] = useState<any[]>([]);
  const [savedStandards, setSavedStandards] = useState<Standard[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
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
  const [uomEntries, setUomEntries] = useState<UomEntry[]>([
    {
      id: 1,
      uom: "",
      description: "",
      samValue: "",
    },
  ]);
  const [bestPractices, setBestPractices] = useState<string[]>([""]);
  const [processOpportunities, setProcessOpportunities] = useState<string[]>([
    "",
  ]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);

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

  const addFacility = () => {
    if (!newFacilityName.trim()) return;
    const newFacility: Facility = {
      id: Date.now(),
      name: newFacilityName,
      ref: newFacilityRef,
      city: newFacilityCity,
      dateAdded: new Date().toISOString().split("T")[0],
    };
    setFacilities([...facilities, newFacility]);
    setSuccessMessage("Facility added successfully!");
    setShowSaveSuccess(true);
    clearFacilityInfo();
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const addDepartment = () => {
    try {
      if (!newDepartmentName || !selectedFacility) {
        setSuccessMessage("Please select a facility and enter department name");
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        return;
      }
      const facilityId = Number(selectedFacility);
      if (isNaN(facilityId)) {
        throw new Error("Invalid facility ID format");
      }
      const facility = facilities.find((f) => f.id === facilityId);
      if (!facility) {
        setSuccessMessage("Selected facility not found");
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        return;
      }
      const newDepartment: Department = {
        id: Date.now(),
        name: newDepartmentName,
        facilityId: facility.id,
        facilityName: facility.name,
      };
      setDepartments([...departments, newDepartment]);
      setSuccessMessage("Department added successfully!");
      setShowSaveSuccess(true);
      setNewDepartmentName("");
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding department:", error);
      setSuccessMessage("Error adding department. Please try again.");
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const addArea = () => {
    try {
      if (!newAreaName.trim()) {
        setSuccessMessage("Please enter an area name");
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        return;
      }
      if (!selectedDepartment) {
        setSuccessMessage("Please select a department");
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        return;
      }
      const facilityId = Number(selectedFacility);
      const departmentId = Number(selectedDepartment);
      if (isNaN(facilityId) || isNaN(departmentId)) {
        throw new Error("Invalid ID format");
      }
      const facility = facilities.find((f) => f.id === facilityId);
      const department = departments.find((d) => d.id === departmentId);
      if (!facility || !department) {
        setSuccessMessage("Selected facility or department not found");
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        return;
      }
      const newArea: Area = {
        id: Date.now(),
        name: newAreaName,
        departmentId: department.id,
        departmentName: department.name,
        facilityId: facility.id,
        facilityName: facility.name,
      };
      setAreas([...areas, newArea]);
      setSuccessMessage("Area added successfully!");
      setShowSaveSuccess(true);
      setNewAreaName("");
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding area:", error);
      setSuccessMessage("Error adding area. Please try again.");
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const saveStandard = () => {
    try {
      const facilityId = Number(selectedFacility);
      const departmentId = Number(selectedDepartment);
      const areaId = Number(selectedArea);
      if (isNaN(facilityId) || isNaN(departmentId) || isNaN(areaId)) {
        throw new Error("Invalid ID format");
      }
      const facility = facilities.find((f) => f.id === facilityId);
      const department = departments.find((d) => d.id === departmentId);
      const area = areas.find((a) => a.id === areaId);
      if (!facility || !department || !area) {
        setSuccessMessage("Please select facility, department and area");
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        return;
      }
      const newStandard: Standard = {
        id: Date.now(),
        facilityId: facility.id,
        facility: facility.name,
        departmentId: department.id,
        department: department.name,
        areaId: area.id,
        area: area.name,
        standard: selectedStandard === "new" ? standardName : selectedStandard,
        uomEntries: [...uomEntries],
        bestPractices: [...bestPractices],
        processOpportunities: [...processOpportunities],
      };
      setSavedStandards([...savedStandards, newStandard]);
      setSuccessMessage("Standard saved successfully!");
      setShowSaveSuccess(true);
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 3000);
      clearSelections();
      setUomEntries([
        {
          id: 1,
          uom: "",
          description: "",
          samValue: "",
        },
      ]);
      setBestPractices([""]);
      setProcessOpportunities([""]);
    } catch (error) {
      console.error("Error saving standard:", error);
      setSuccessMessage("Error saving standard. Please try again.");
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const addUomEntry = () => {
    const newEntries = [...uomEntries];
    newEntries.push({
      id: Date.now(),
      uom: "",
      description: "",
      samValue: "",
    });
    setUomEntries(newEntries);
  };

  const addBestPractice = () => {
    const newPractices = [...bestPractices];
    newPractices.push("");
    setBestPractices(newPractices);
  };

  const addProcessOpportunity = () => {
    const newOpportunities = [...processOpportunities];
    newOpportunities.push("");
    setProcessOpportunities(newOpportunities);
  };

  const updateUomEntry = (id: number, field: string, value: string) => {
    const newEntries = uomEntries.map((entry) => {
      if (entry.id === id) {
        return { ...entry, [field]: value };
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

  const openEditDialog = (item: any, type: string) => {
    setEditingItem({ ...item });
    setEditingType(type);
    if (type === "standard") {
      setEditingName(item.standard || "");
      setEditingFacility(item.facility || "");
      setEditingDepartment(item.department || "");
      setEditingArea(item.area || "");
    } else {
      setEditingName(item.name || "");
      setEditingFacility(item.facilityName || "");
      setEditingDepartment(item.departmentName || "");
      setEditingArea(item.area || "");
    }
    setEditDialogOpen(true);
  };

  const saveChanges = () => {
    if (editingType === "facility") {
      setFacilities(
        facilities.map((f) =>
          f.id === editingItem.id
            ? {
                ...f,
                name: editingName,
                ref: editingItem.ref,
                city: editingItem.city,
              }
            : f,
        ),
      );
    } else if (editingType === "department") {
      setDepartments(
        departments.map((d) =>
          d.id === editingItem.id
            ? {
                ...d,
                name: editingName,
                facilityName: editingFacility,
              }
            : d,
        ),
      );
    } else if (editingType === "area") {
      setAreas(
        areas.map((a) =>
          a.id === editingItem.id
            ? {
                ...a,
                name: editingName,
                facilityName: editingFacility,
                departmentName: editingDepartment,
              }
            : a,
        ),
      );
    } else if (editingType === "standard") {
      setSavedStandards(
        savedStandards.map((s) =>
          s.id === editingItem.id
            ? {
                ...s,
                facility: editingFacility,
                department: editingDepartment,
                area: editingArea,
                standard: editingName,
              }
            : s,
        ),
      );
    }
    setEditDialogOpen(false);
    setSuccessMessage(
      `${
        editingType.charAt(0).toUpperCase() + editingType.slice(1)
      } updated successfully!`,
    );
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const fetchObservationHistory = async () => {
    // API endpoint doesn't exist yet - placeholder for future implementation
    try {
      // const response = await fetch("/api/observations/history");
      // const data = await response.json();
      // setSubmittedObservations(data);
      setSubmittedObservations([]); // Set empty array as default
    } catch (error) {
      console.error("Error fetching observation history:", error);
      setSubmittedObservations([]);
    }
  };

  useEffect(() => {
    fetchObservationHistory();
  }, []);

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
            </div>

            <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-md">
              <h2 className="text-xl font-semibold mb-6">
                Standard Transformation
              </h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <select
                  value={selectedFacility}
                  onChange={(e) => {
                    setSelectedFacility(e.target.value);
                    setSelectedDepartment("");
                    setSelectedArea("");
                  }}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white"
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
                  disabled={!selectedFacility}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedArea("");
                  }}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
                >
                  <option value="">Select Department</option>
                  {departments
                    .filter(
                      (dept) => dept.facilityId === Number(selectedFacility),
                    )
                    .map((department) => (
                      <option value={department.id} key={department.id}>
                        {department.name}
                      </option>
                    ))}
                </select>

                <select
                  value={selectedArea}
                  disabled={!selectedDepartment}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
                >
                  <option value="">Select Area</option>
                  {areas
                    .filter(
                      (area) =>
                        area.departmentId === Number(selectedDepartment),
                    )
                    .map((area) => (
                      <option value={area.id} key={area.id}>
                        {area.name}
                      </option>
                    ))}
                </select>

                <select
                  value={selectedStandard}
                  onChange={(e) => setSelectedStandard(e.target.value)}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white"
                >
                  <option value="">Select Standard</option>
                  <option value="standard1">Standard 1</option>
                  <option value="standard2">Standard 2</option>
                  <option value="new">New Standard</option>
                </select>
              </div>

              {selectedStandard === "new" && (
                <input
                  placeholder="Enter Standard Name"
                  value={standardName}
                  onChange={(e) => setStandardName(e.target.value)}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white mt-4"
                />
              )}

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold">UOM Details</h3>
                  <button
                    onClick={addUomEntry}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5"
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
                        className="w-full p-2 rounded-md border border-gray-300 bg-white"
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
                        className="w-full p-2 rounded-md border border-gray-300 bg-white"
                      />
                      <input
                        type="number"
                        placeholder="SAM Value"
                        value={entry.samValue}
                        onChange={(e) =>
                          updateUomEntry(entry.id, "samValue", e.target.value)
                        }
                        className="w-full p-2 rounded-md border border-gray-300 bg-white"
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
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5"
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
                      className="w-full p-2 rounded-md border border-gray-300 bg-white"
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
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5"
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
                      className="w-full p-2 rounded-md border border-gray-300 bg-white"
                      key={index}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button className="px-6 py-3 bg-white border border-gray-300 rounded-md cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={saveStandard}
                  className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5"
                >
                  Save Standard
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
                    className="w-full p-2 rounded-md border border-gray-300 bg-white"
                  />
                  <input
                    placeholder="Enter Facility Reference"
                    value={newFacilityRef}
                    onChange={(e) => setNewFacilityRef(e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white"
                  />
                  <input
                    placeholder="Enter Facility City"
                    value={newFacilityCity}
                    onChange={(e) => setNewFacilityCity(e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white"
                  />
                  <button
                    onClick={() => {
                      addFacility();
                      setNewFacilityName("");
                      setNewFacilityRef("");
                      setNewFacilityCity("");
                    }}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5"
                  >
                    Add Facility
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
                    className="w-full p-2 rounded-md border border-gray-300 bg-white"
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
                    className="w-full p-2 rounded-md border border-gray-300 bg-white"
                  />
                  <button
                    onClick={addDepartment}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5"
                  >
                    Add Department
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
                      setSelectedDepartment("");
                      setSelectedArea("");
                    }}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white"
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
                    disabled={!selectedFacility}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedArea("");
                    }}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
                  >
                    <option value="">Select Department</option>
                    {departments
                      .filter(
                        (dept) => dept.facilityId === Number(selectedFacility),
                      )
                      .map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                  </select>
                  <input
                    placeholder="Enter Area Name"
                    value={newAreaName}
                    disabled={!selectedDepartment}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
                  />
                  <button
                    onClick={addArea}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5"
                  >
                    Add Area
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
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedStandards.map((standard) => (
                        <tr
                          key={standard.id}
                          className="border-b border-gray-300"
                        >
                          <td className="p-3">{standard.facility}</td>
                          <td className="p-3">{standard.department}</td>
                          <td className="p-3">{standard.area}</td>
                          <td className="p-3">{standard.standard}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() =>
                                openEditDialog(standard, "standard")
                              }
                              className="px-3 py-1.5 bg-green-500 text-white border-none rounded cursor-pointer"
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
