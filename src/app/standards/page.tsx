"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import CsvExportImport from "@/components/CsvExportImport";

interface Organization {
  id: number;
  name: string;
  code: string;
  logo: string | null;
}

interface Facility {
  id: number;
  name: string;
  ref: string | null;
  city: string | null;
  organizationId: number;
  organization?: {
    name: string;
  };
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
  tags?: string[];
}

interface Standard {
  id: number;
  name: string;
  facilityId: number;
  departmentId: number;
  areaId: number;
  facility: {
    name: string;
    organization?: {
      name: string;
      id?: number;
    };
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
  createdAt: string;
  version?: number;
  baseStandardId?: number;
  isCurrentVersion?: boolean;
  versionNotes?: string;
  createdBy?: string;
  notes: string;
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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [savedStandards, setSavedStandards] = useState<Standard[]>([]);

  // Form state
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [standardName, setStandardName] = useState("");
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [newOrganizationCode, setNewOrganizationCode] = useState("");
  const [newOrganizationLogo, setNewOrganizationLogo] = useState("");
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
      tags: [],
    },
  ]);
  const [bestPractices, setBestPractices] = useState<string[]>([""]);
  const [processOpportunities, setProcessOpportunities] = useState<string[]>([
    "",
  ]);
  const [standardNotes, setStandardNotes] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // CSV Upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Edit Standard state
  const [editStandardDialogOpen, setEditStandardDialogOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null);
  const [editVersionNotes, setEditVersionNotes] = useState("");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<Standard[]>([]);

  // Load data from API
  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/organizations");
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      const data = await response.json();
      setOrganizations(data);
    } catch (error: any) {
      console.error("Error loading organizations:", error);

      // Try to get more specific error information from the API response
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        try {
          const response = await fetch("/api/organizations");
          const errorData = await response.json();
          if (errorData.details?.includes("DATABASE_URL")) {
            setError(
              "Database connection error: Please configure DATABASE_URL in .env.local file",
            );
          } else {
            setError(
              `Failed to load organizations: ${errorData.details || error.message}`,
            );
          }
        } catch {
          setError("Failed to load organizations - Check database connection");
        }
      } else {
        setError("Failed to load organizations");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadFacilities = async (organizationId?: number) => {
    try {
      if (organizationId) {
        const response = await fetch(
          `/api/facilities?organizationId=${organizationId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch facilities");
        }
        const data = await response.json();
        setFacilities(
          data.map((f: any) => ({
            ...f,
            ref: f.ref || "",
            city: f.city || "",
            dateAdded: f.dateAdded
              ? new Date(f.dateAdded).toISOString().split("T")[0]
              : "",
          })),
        );
      } else {
        setFacilities([]);
      }
    } catch (error) {
      console.error("Error loading facilities:", error);
      setError("Failed to load facilities");
    }
  };

  const loadDepartments = async (facilityId?: number) => {
    try {
      if (facilityId) {
        const response = await fetch(
          `/api/departments?facilityId=${facilityId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch departments");
        }
        const data = await response.json();
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
        const response = await fetch(`/api/areas?departmentId=${departmentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch areas");
        }
        const data = await response.json();
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
      const response = await fetch("/api/standards");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to fetch standards`,
        );
      }
      const data = await response.json();
      setSavedStandards(data.data || data);
      setError(""); // Clear any previous errors
    } catch (error: any) {
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
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    }
  };

  const clearSelections = () => {
    setSelectedOrganization("");
    setSelectedFacility("");
    setSelectedDepartment("");
    setSelectedArea("");
    setSelectedStandard("");
    setStandardName("");
  };

  const clearOrganizationInfo = () => {
    setNewOrganizationName("");
    setNewOrganizationCode("");
    setNewOrganizationLogo("");
  };

  const clearFacilityInfo = () => {
    setNewFacilityRef("");
    setNewFacilityCity("");
    setNewFacilityName("");
  };

  const addOrganization = async () => {
    if (!newOrganizationName.trim() || !newOrganizationCode.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newOrganizationName,
          code: newOrganizationCode,
          logo: newOrganizationLogo || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          setError(
            errorData.error ||
              "Organization code already exists. Please use a different code.",
          );
          return;
        }
        const errorMessage =
          errorData.error ||
          `Failed to create organization (${response.status})`;
        setError(errorMessage);
        return;
      }

      await loadOrganizations();
      setSuccessMessage("Organization added successfully!");
      setShowSaveSuccess(true);
      clearOrganizationInfo();
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error adding organization:", error);
      setError(error.message || "Failed to add organization");
    } finally {
      setIsLoading(false);
    }
  };

  const addFacility = async () => {
    if (!newFacilityName.trim() || !selectedOrganization) {
      setError("Please select an organization and enter facility name");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/facilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFacilityName,
          organizationId: Number(selectedOrganization),
          ref: newFacilityRef || undefined,
          city: newFacilityCity || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create facility");
      }

      await loadFacilities(Number(selectedOrganization));
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
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDepartmentName,
          facilityId: Number(selectedFacility),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create department");
      }

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
      const response = await fetch("/api/areas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newAreaName,
          departmentId: Number(selectedDepartment),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create area");
      }

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
      if (
        !selectedOrganization ||
        !selectedFacility ||
        !selectedDepartment ||
        !selectedArea
      ) {
        setError("Please select organization, facility, department and area");
        return;
      }

      const standardNameToSave =
        selectedStandard === "new" ? standardName : selectedStandard;
      if (!standardNameToSave) {
        setError("Please enter a standard name");
        return;
      }

      if (!standardNotes.trim()) {
        setError("Please enter standard notes");
        return;
      }

      setIsLoading(true);

      const uomData = uomEntries
        .filter((entry) => entry.uom && entry.description && entry.samValue > 0)
        .map((entry) => ({
          uom: entry.uom,
          description: entry.description,
          samValue: entry.samValue,
          tags: entry.tags || [],
        }));

      const validBestPractices = bestPractices.filter((practice) =>
        practice.trim(),
      );
      const validProcessOpportunities = processOpportunities.filter((opp) =>
        opp.trim(),
      );

      const response = await fetch("/api/standards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: standardNameToSave,
          facilityId: Number(selectedFacility),
          departmentId: Number(selectedDepartment),
          areaId: Number(selectedArea),
          bestPractices: validBestPractices,
          processOpportunities: validProcessOpportunities,
          uomEntries: uomData,
          notes: standardNotes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create standard");
      }

      await loadStandards();
      setSuccessMessage("Standard saved successfully!");
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);

      // Reset form
      clearSelections();
      setUomEntries([
        { id: 1, uom: "", description: "", samValue: 0, tags: [] },
      ]);
      setBestPractices([""]);
      setProcessOpportunities([""]);
      setStandardNotes("");
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
      tags: [],
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
    value: string | number | string[],
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

  const addTagToUomEntry = (id: number, tag: string) => {
    if (!tag.trim()) return;
    const newEntries = uomEntries.map((entry) => {
      if (entry.id === id) {
        const currentTags = entry.tags || [];
        if (!currentTags.includes(tag)) {
          return {
            ...entry,
            tags: [...currentTags, tag],
          };
        }
      }
      return entry;
    });
    setUomEntries(newEntries);
  };

  const removeTagFromUomEntry = (id: number, tagToRemove: string) => {
    const newEntries = uomEntries.map((entry) => {
      if (entry.id === id) {
        return {
          ...entry,
          tags: (entry.tags || []).filter((tag) => tag !== tagToRemove),
        };
      }
      return entry;
    });
    setUomEntries(newEntries);
  };

  const getAllExistingTags = () => {
    const allTags = new Set<string>();
    uomEntries.forEach((entry) => {
      (entry.tags || []).forEach((tag) => allTags.add(tag));
    });
    savedStandards.forEach((standard) => {
      standard.uomEntries.forEach((entry) => {
        (entry.tags || []).forEach((tag) => allTags.add(tag));
      });
    });
    return Array.from(allTags).sort();
  };

  const downloadCsvTemplate = async () => {
    try {
      const response = await fetch("/api/standards/template");
      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "standards-template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading template:", error);
      setError("Failed to download template");
    }
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setCsvFile(file || null);
    setUploadResult(null);
  };

  const uploadCsvFile = async () => {
    if (!csvFile) {
      setError("Please select a CSV file");
      return;
    }

    try {
      setIsUploading(true);
      setUploadResult(null);

      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await fetch("/api/standards/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success && result.created > 0) {
        // Refresh standards list
        await loadStandards();
        setSuccessMessage(`Successfully uploaded ${result.created} standards!`);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 5000);

        // Clear file input
        setCsvFile(null);
        const fileInput = document.getElementById(
          "csv-upload",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setError("Failed to upload CSV file");
    } finally {
      setIsUploading(false);
    }
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

  const handleEditStandard = (standard: Standard) => {
    setEditingStandard(standard);

    // Populate form with current standard data
    setSelectedOrganization(
      standard.facility.organization?.id?.toString() || "",
    );
    setSelectedFacility(standard.facilityId.toString());
    setSelectedDepartment(standard.departmentId.toString());
    setSelectedArea(standard.areaId.toString());
    setStandardName(standard.name);
    setStandardNotes(standard.notes || "");
    setBestPractices(
      standard.bestPractices.length > 0 ? standard.bestPractices : [""],
    );
    setProcessOpportunities(
      standard.processOpportunities.length > 0
        ? standard.processOpportunities
        : [""],
    );

    // Set UOM entries with proper IDs for editing
    const formattedUomEntries = standard.uomEntries.map((entry, index) => ({
      id: entry.id || Date.now() + index,
      uom: entry.uom,
      description: entry.description,
      samValue: entry.samValue,
      tags: entry.tags || [],
    }));
    setUomEntries(
      formattedUomEntries.length > 0
        ? formattedUomEntries
        : [{ id: Date.now(), uom: "", description: "", samValue: 0, tags: [] }],
    );

    setEditVersionNotes("");
    setEditStandardDialogOpen(true);
  };

  const handleSaveEditedStandard = async () => {
    if (!editingStandard) return;

    try {
      setIsLoading(true);

      const uomData = uomEntries
        .filter((entry) => entry.uom && entry.description && entry.samValue > 0)
        .map((entry) => ({
          uom: entry.uom,
          description: entry.description,
          samValue: entry.samValue,
          tags: entry.tags || [],
        }));

      const validBestPractices = bestPractices.filter((practice) =>
        practice.trim(),
      );
      const validProcessOpportunities = processOpportunities.filter((opp) =>
        opp.trim(),
      );

      const response = await fetch(`/api/standards/${editingStandard.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_version",
          data: {
            name: standardName,
            facilityId: Number(selectedFacility),
            departmentId: Number(selectedDepartment),
            areaId: Number(selectedArea),
            bestPractices: validBestPractices,
            processOpportunities: validProcessOpportunities,
            uomEntries: uomData,
            versionNotes: editVersionNotes,
            createdBy: "current_user", // You can replace this with actual user data
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create new version");
      }

      await loadStandards();
      setSuccessMessage("New version of standard created successfully!");
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);

      // Close dialog and reset form
      setEditStandardDialogOpen(false);
      setEditingStandard(null);
      clearSelections();
      setUomEntries([
        { id: 1, uom: "", description: "", samValue: 0, tags: [] },
      ]);
      setBestPractices([""]);
      setProcessOpportunities([""]);
      setStandardNotes("");
      setEditVersionNotes("");
    } catch (error) {
      console.error("Error creating new version:", error);
      setError("Failed to create new version of standard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewVersionHistory = async (standard: Standard) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/standards/${standard.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_history",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch version history");
      }

      const history = await response.json();
      setVersionHistory(history);
      setShowVersionHistory(true);
    } catch (error) {
      console.error("Error fetching version history:", error);
      setError("Failed to fetch version history");
    } finally {
      setIsLoading(false);
    }
  };

  // Load dependent data when selections change
  useEffect(() => {
    if (selectedOrganization) {
      loadFacilities(Number(selectedOrganization));
      setSelectedFacility("");
      setSelectedDepartment("");
      setSelectedArea("");
    }
  }, [selectedOrganization]);

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
    loadOrganizations();
    loadStandards();
  }, []);

  if (error) {
    setTimeout(() => setError(""), 5000);
  }

  return (
    <div className="font-poppins text-black bg-gray-100 min-h-screen overflow-x-hidden">
      <Banner
        title="Standards Management"
        subtitle="Manage and configure work standards for facilities and departments"
      />
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

            {/* CSV Export/Import Section */}
            <CsvExportImport
              onExportSuccess={(message) => {
                setSuccessMessage(message);
                setShowSaveSuccess(true);
                setTimeout(() => setShowSaveSuccess(false), 3000);
              }}
              onImportSuccess={(message) => {
                setSuccessMessage(message);
                setShowSaveSuccess(true);
                setTimeout(() => setShowSaveSuccess(false), 5000);
              }}
              onError={(error) => {
                setError(error);
                setTimeout(() => setError(""), 5000);
              }}
            />

            {/* CSV Upload Section */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                Bulk Standard Upload
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CSV File
                  </label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    disabled={isUploading}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Upload multiple standards at once. Max: 75 UOMs, 20 Best
                    Practices, 20 Process Opportunities per standard.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={downloadCsvTemplate}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white border-none rounded-md cursor-pointer font-semibold hover:bg-blue-600 disabled:opacity-50"
                  >
                    📥 Download Template
                  </button>
                  <button
                    onClick={uploadCsvFile}
                    disabled={!csvFile || isUploading}
                    className="px-4 py-2 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold hover:bg-green-600 disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "🚀 Upload Standards"}
                  </button>
                </div>
              </div>

              {/* Upload Results */}
              {uploadResult && (
                <div
                  className={`p-4 rounded-lg border ${uploadResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <h3
                    className={`font-semibold mb-2 ${uploadResult.success ? "text-green-800" : "text-red-800"}`}
                  >
                    Upload Results
                  </h3>

                  {uploadResult.success && (
                    <p className="text-green-700 mb-2">
                      ✅ Successfully created {uploadResult.created} standards
                    </p>
                  )}

                  {uploadResult.errors?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-red-700 mb-1">Errors:</h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        {uploadResult.errors.map(
                          (error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {uploadResult.warnings?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-yellow-700 mb-1">
                        Warnings:
                      </h4>
                      <ul className="text-sm text-yellow-600 space-y-1">
                        {uploadResult.warnings.map(
                          (warning: string, index: number) => (
                            <li key={index}>• {warning}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {uploadResult.details?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">
                        Details:
                      </h4>
                      <div className="max-h-32 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-1 text-left">Row</th>
                              <th className="px-2 py-1 text-left">Standard</th>
                              <th className="px-2 py-1 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResult.details.map(
                              (detail: any, index: number) => (
                                <tr key={index} className="border-b">
                                  <td className="px-2 py-1">{detail.row}</td>
                                  <td className="px-2 py-1">
                                    {detail.standardName}
                                  </td>
                                  <td className="px-2 py-1">
                                    <span
                                      className={
                                        detail.status === "created"
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }
                                    >
                                      {detail.status === "created"
                                        ? "✅ Created"
                                        : "❌ Error"}
                                    </span>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-md">
              <h2 className="text-xl font-semibold mb-6">
                Standard Transformation
              </h2>
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="relative">
                  <select
                    value={selectedOrganization}
                    onChange={(e) => {
                      setSelectedOrganization(e.target.value);
                    }}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((organization) => (
                      <option value={organization.id} key={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                  {organizations.length === 0 && !isLoading && (
                    <div className="text-xs text-gray-500 mt-1">
                      Add an organization first using the form below
                    </div>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={selectedFacility}
                    disabled={!selectedOrganization || isLoading}
                    onChange={(e) => {
                      setSelectedFacility(e.target.value);
                    }}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((facility) => (
                      <option value={facility.id} key={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                  {selectedOrganization &&
                    facilities.length === 0 &&
                    !isLoading && (
                      <div className="text-xs text-gray-500 mt-1">
                        Add a facility for this organization using the form
                        below
                      </div>
                    )}
                  {!selectedOrganization && (
                    <div className="text-xs text-gray-500 mt-1">
                      Select an organization first
                    </div>
                  )}
                </div>

                <div className="relative">
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
                </div>

                <div className="relative">
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
                </div>

                <div className="relative">
                  <select
                    value={selectedStandard}
                    onChange={(e) => setSelectedStandard(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Standard</option>
                    {savedStandards
                      .filter(
                        (s) =>
                          !selectedArea || s.areaId === Number(selectedArea),
                      )
                      .map((standard) => (
                        <option value={standard.name} key={standard.id}>
                          {standard.name}
                        </option>
                      ))}
                    <option value="new">New Standard</option>
                  </select>
                </div>
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

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter notes and comments for this standard..."
                  value={standardNotes}
                  onChange={(e) => setStandardNotes(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white disabled:opacity-50 resize-vertical"
                  required
                />
              </div>

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
                <div className="flex flex-col gap-6">
                  {uomEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                    >
                      <div className="grid grid-cols-3 gap-4 mb-4">
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

                      {/* Tag Management */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Tags (for dynamic grouping)
                        </label>

                        {/* Existing Tags */}
                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                          {(entry.tags || []).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {tag}
                              <button
                                onClick={() =>
                                  removeTagFromUomEntry(entry.id, tag)
                                }
                                disabled={isLoading}
                                className="ml-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {(entry.tags || []).length === 0 && (
                            <span className="text-gray-400 text-sm italic">
                              No tags assigned
                            </span>
                          )}
                        </div>

                        {/* Add Tag Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add tag (e.g., Assembly, Quality, Packaging)"
                            disabled={isLoading}
                            className="flex-1 p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const target = e.target as HTMLInputElement;
                                addTagToUomEntry(entry.id, target.value.trim());
                                target.value = "";
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              addTagToUomEntry(entry.id, input.value.trim());
                              input.value = "";
                            }}
                            disabled={isLoading}
                            className="px-3 py-2 bg-blue-500 text-white border-none rounded-md cursor-pointer disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>

                        {/* Existing Tags Suggestions */}
                        {getAllExistingTags().length > 0 && (
                          <div className="space-y-2">
                            <span className="text-xs text-gray-600">
                              Existing tags (click to add):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {getAllExistingTags()
                                .filter(
                                  (tag) => !(entry.tags || []).includes(tag),
                                )
                                .map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={() =>
                                      addTagToUomEntry(entry.id, tag)
                                    }
                                    disabled={isLoading}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
                                  >
                                    + {tag}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
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
                  className="px-6 py-3 bg-white border border-gray-300 rounded-md cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStandard}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50 whitespace-nowrap"
                >
                  {isLoading ? "Saving..." : "Save Standard"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mt-6 w-full">
              <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-md h-fit">
                <h2 className="text-xl font-semibold mb-6">
                  Organization Transformation
                </h2>
                <div className="flex flex-col gap-4">
                  <input
                    placeholder="Enter Organization Name"
                    value={newOrganizationName}
                    onChange={(e) => setNewOrganizationName(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  />
                  <input
                    placeholder="Enter Organization Code"
                    value={newOrganizationCode}
                    onChange={(e) => setNewOrganizationCode(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  />
                  <input
                    type="url"
                    placeholder="Enter Logo URL (optional)"
                    value={newOrganizationLogo}
                    onChange={(e) => setNewOrganizationLogo(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  />
                  <button
                    onClick={addOrganization}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Add Organization"}
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-md h-fit">
                <h2 className="text-xl font-semibold mb-6">
                  Facility Transformation
                </h2>
                <div className="flex flex-col gap-4">
                  <select
                    value={selectedOrganization}
                    onChange={(e) => setSelectedOrganization(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
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
                    value={selectedOrganization}
                    onChange={(e) => setSelectedOrganization(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedFacility}
                    disabled={!selectedOrganization || isLoading}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
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
                    value={selectedOrganization}
                    onChange={(e) => setSelectedOrganization(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-50"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedFacility}
                    disabled={!selectedOrganization || isLoading}
                    onChange={(e) => {
                      setSelectedFacility(e.target.value);
                    }}
                    className="w-full p-2 rounded-md border border-gray-300 bg-white disabled:opacity-60"
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
                        <th className="p-3 text-left">Organization</th>
                        <th className="p-3 text-left">Facility</th>
                        <th className="p-3 text-left">Department</th>
                        <th className="p-3 text-left">Area</th>
                        <th className="p-3 text-left">Standard</th>
                        <th className="p-3 text-left">Version</th>
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
                          <td className="p-3">
                            {standard.facility.organization?.name || "N/A"}
                          </td>
                          <td className="p-3">{standard.facility.name}</td>
                          <td className="p-3">{standard.department.name}</td>
                          <td className="p-3">{standard.area.name}</td>
                          <td className="p-3">{standard.name}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              v{(standard as any).version || 1}
                            </span>
                          </td>
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
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleEditStandard(standard)}
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-blue-500 text-white border-none rounded cursor-pointer disabled:opacity-50 hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleViewVersionHistory(standard)
                                }
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-gray-500 text-white border-none rounded cursor-pointer disabled:opacity-50 hover:bg-gray-600"
                              >
                                History
                              </button>
                            </div>
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

        {/* Edit Standard Dialog */}
        {editStandardDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    Edit Standard: {editingStandard?.name}
                  </h2>
                  <button
                    onClick={() => {
                      setEditStandardDialogOpen(false);
                      setEditingStandard(null);
                      clearSelections();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Version Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version Notes (Required)
                    </label>
                    <textarea
                      value={editVersionNotes}
                      onChange={(e) => setEditVersionNotes(e.target.value)}
                      placeholder="Describe the changes made in this version..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Standard Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Name
                    </label>
                    <input
                      type="text"
                      value={standardName}
                      onChange={(e) => setStandardName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Location Selection */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facility
                      </label>
                      <select
                        value={selectedFacility}
                        onChange={(e) => setSelectedFacility(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Facility</option>
                        {facilities.map((facility) => (
                          <option key={facility.id} value={facility.id}>
                            {facility.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area
                      </label>
                      <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Area</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* UOM Entries */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">UOM Entries</h3>
                      <button
                        onClick={addUomEntry}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        + Add UOM Entry
                      </button>
                    </div>
                    <div className="space-y-4">
                      {uomEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                        >
                          <div className="grid grid-cols-3 gap-4 mb-4">
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
                              step="0.0001"
                              value={entry.samValue}
                              onChange={(e) =>
                                updateUomEntry(
                                  entry.id,
                                  "samValue",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 rounded-md border border-gray-300 bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Best Practices</h3>
                      <button
                        onClick={addBestPractice}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        + Add Practice
                      </button>
                    </div>
                    <div className="space-y-3">
                      {bestPractices.map((practice, index) => (
                        <input
                          key={index}
                          placeholder="Enter best practice"
                          value={practice}
                          onChange={(e) =>
                            updateBestPractice(index, e.target.value)
                          }
                          className="w-full p-2 rounded-md border border-gray-300 bg-white"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Process Opportunities */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Process Opportunities
                      </h3>
                      <button
                        onClick={addProcessOpportunity}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        + Add Opportunity
                      </button>
                    </div>
                    <div className="space-y-3">
                      {processOpportunities.map((opportunity, index) => (
                        <input
                          key={index}
                          placeholder="Enter process adherence opportunity"
                          value={opportunity}
                          onChange={(e) =>
                            updateProcessOpportunity(index, e.target.value)
                          }
                          className="w-full p-2 rounded-md border border-gray-300 bg-white"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                  <button
                    onClick={() => {
                      setEditStandardDialogOpen(false);
                      setEditingStandard(null);
                      clearSelections();
                    }}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditedStandard}
                    disabled={isLoading || !editVersionNotes.trim()}
                    className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isLoading ? "Creating Version..." : "Create New Version"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Version History Dialog */}
        {showVersionHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Version History</h2>
                  <button
                    onClick={() => setShowVersionHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Version</th>
                        <th className="p-3 text-left">Standard Name</th>
                        <th className="p-3 text-left">Created Date</th>
                        <th className="p-3 text-left">Created By</th>
                        <th className="p-3 text-left">Version Notes</th>
                        <th className="p-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versionHistory.map((version) => (
                        <tr
                          key={version.id}
                          className="border-b border-gray-300"
                        >
                          <td className="p-3">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              v{(version as any).version || 1}
                            </span>
                          </td>
                          <td className="p-3">{version.name}</td>
                          <td className="p-3">
                            {new Date(version.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            {(version as any).createdBy || "System"}
                          </td>
                          <td className="p-3">
                            <div className="max-w-xs">
                              {(version as any).versionNotes ||
                                "No notes provided"}
                            </div>
                          </td>
                          <td className="p-3">
                            {(version as any).isCurrentVersion ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Current
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                Historical
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
