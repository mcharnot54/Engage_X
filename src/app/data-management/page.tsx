"use client";

import { useState } from "react";
import { Banner } from "@/components/ui/Banner";
import CsvExportImport from "@/components/CsvExportImport";

export default function DataManagement() {
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(""), 5000);
  };

  return (
    <div className="font-poppins text-black bg-gray-100 min-h-screen overflow-x-hidden">
      <Banner
        title="Data Management"
        subtitle="Export local database data and import to Neon database"
      />

      <div className="flex flex-col max-w-7xl mx-auto bg-gray-100 min-h-[calc(100vh-80px)] rounded-xl border border-gray-300 mt-5 p-5 overflow-y-auto">
        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-md">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Database Migration Tools
            </h1>
            <p className="text-gray-600">
              Use these tools to export your local database data and import it
              into your Neon database.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <CsvExportImport
            onExportSuccess={handleSuccess}
            onImportSuccess={handleSuccess}
            onError={handleError}
          />

          {/* Step-by-step guide */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📝 Step-by-Step Migration Guide
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Export Your Local Data
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Start by exporting your local database tables in the correct
                    order. Export each table type separately for better control.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Get Your Neon Database URL
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Log into your Neon console and copy the database connection
                    string from "Connection Details". It should look like:{" "}
                    <code className="bg-gray-200 px-1 rounded text-xs">
                      postgresql://username:password@hostname/database?sslmode=require
                    </code>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Import in Correct Order
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Import tables in this order to maintain data relationships:
                  </p>
                  <ol className="text-sm text-gray-600 mt-2 ml-4 list-decimal">
                    <li>Organizations</li>
                    <li>Facilities</li>
                    <li>Departments</li>
                    <li>Areas</li>
                    <li>Users</li>
                    <li>Standards</li>
                    <li>UOM Entries</li>
                    <li>Observations</li>
                  </ol>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                  ✓
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Verify Your Migration
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    After importing, check your Neon database to ensure all data
                    was imported correctly. Test your application with the new
                    database connection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips and Warnings */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">💡 Pro Tips</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Export one table at a time for better error handling</li>
                <li>• Save your exports locally as backup</li>
                <li>• Test with a small dataset first</li>
                <li>• Use meaningful filenames with dates</li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">
                ⚠️ Important Warnings
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Always backup your Neon database first</li>
                <li>• Don't share database URLs publicly</li>
                <li>• Import may take time for large datasets</li>
                <li>• Duplicate data will be updated, not duplicated</li>
              </ul>
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed bottom-5 right-5 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
