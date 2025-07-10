"use client";

import { useState } from "react";

interface CsvExportImportProps {
  onExportSuccess?: (message: string) => void;
  onImportSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export default function CsvExportImport({
  onExportSuccess,
  onImportSuccess,
  onError,
}: CsvExportImportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedTable, setSelectedTable] = useState("standards");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [neonDatabaseUrl, setNeonDatabaseUrl] = useState("");
  const [showImportForm, setShowImportForm] = useState(false);

  const tableOptions = [
    { value: "organizations", label: "Organizations" },
    { value: "facilities", label: "Facilities" },
    { value: "departments", label: "Departments" },
    { value: "areas", label: "Areas" },
    { value: "standards", label: "Standards" },
    { value: "uomEntries", label: "UOM Entries" },
    { value: "users", label: "Users" },
    { value: "observations", label: "Observations" },
  ];

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      const response = await fetch("/api/export/csv");

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all-standards-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onExportSuccess?.("All standards exported successfully!");
    } catch (error: any) {
      console.error("Error exporting all data:", error);
      onError?.(error.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTable = async () => {
    try {
      setIsExporting(true);
      const response = await fetch("/api/export/csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table: selectedTable }),
      });

      if (!response.ok) {
        throw new Error("Failed to export table");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedTable}-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onExportSuccess?.(`${selectedTable} exported successfully!`);
    } catch (error: any) {
      console.error("Error exporting table:", error);
      onError?.(error.message || "Failed to export table");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile || !neonDatabaseUrl.trim()) {
      onError?.("Please select a file and provide Neon database URL");
      return;
    }

    try {
      setIsImporting(true);
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("tableType", selectedTable);
      formData.append("neonDatabaseUrl", neonDatabaseUrl.trim());

      const response = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import data");
      }

      let message = `Successfully imported ${result.imported} out of ${result.total} records`;
      if (result.errors && result.errors.length > 0) {
        message += `. ${result.errors.length} errors occurred.`;
        console.warn("Import errors:", result.errors);
      }

      onImportSuccess?.(message);

      // Reset form
      setImportFile(null);
      setShowImportForm(false);
      const fileInput = document.getElementById(
        "import-file",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Error importing data:", error);
      onError?.(error.message || "Failed to import data");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-blue-800">
        Data Export & Import
      </h2>

      {/* Export Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-blue-700">Export Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Table to Export
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              disabled={isExporting}
              className="w-full p-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
            >
              {tableOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleExportTable}
              disabled={isExporting}
              className="px-4 py-2 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold hover:bg-green-600 disabled:opacity-50"
            >
              {isExporting ? "Exporting..." : "📄 Export Selected Table"}
            </button>

            <button
              onClick={handleExportAll}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-500 text-white border-none rounded-md cursor-pointer font-semibold hover:bg-blue-600 disabled:opacity-50"
            >
              {isExporting ? "Exporting..." : "📋 Export All Standards"}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Export Selected Table:</strong> Exports only the selected
              table type
            </p>
            <p>
              <strong>Export All Standards:</strong> Exports complete standards
              data with all related information
            </p>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-blue-700">
          Import to Neon Database
        </h3>

        {!showImportForm ? (
          <button
            onClick={() => setShowImportForm(true)}
            className="px-4 py-2 bg-purple-500 text-white border-none rounded-md cursor-pointer font-semibold hover:bg-purple-600"
          >
            🚀 Import Data to Neon
          </button>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Table Type for Import
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  disabled={isImporting}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
                >
                  {tableOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV File to Import
                </label>
                <input
                  id="import-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  disabled={isImporting}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neon Database URL
              </label>
              <input
                type="text"
                placeholder="postgresql://username:password@hostname/database?sslmode=require"
                value={neonDatabaseUrl}
                onChange={(e) => setNeonDatabaseUrl(e.target.value)}
                disabled={isImporting}
                className="w-full p-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-600 mt-1">
                Get this from your Neon console under "Connection Details"
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={isImporting || !importFile || !neonDatabaseUrl.trim()}
                className="px-4 py-2 bg-green-500 text-white border-none rounded-md cursor-pointer font-semibold hover:bg-green-600 disabled:opacity-50"
              >
                {isImporting ? "Importing..." : "Import to Neon"}
              </button>

              <button
                onClick={() => {
                  setShowImportForm(false);
                  setImportFile(null);
                  setNeonDatabaseUrl("");
                }}
                disabled={isImporting}
                className="px-4 py-2 bg-gray-500 text-white border-none rounded-md cursor-pointer font-semibold hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">
          📋 Important Notes:
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            • <strong>Export first:</strong> Export your local data before
            importing to Neon
          </li>
          <li>
            • <strong>Import order:</strong> Import in order: Organizations →
            Facilities → Departments → Areas → Standards → UOM Entries
          </li>
          <li>
            • <strong>Data relationships:</strong> Ensure parent records exist
            before importing child records
          </li>
          <li>
            • <strong>Backup:</strong> Always backup your Neon database before
            importing large datasets
          </li>
        </ul>
      </div>
    </div>
  );
}
