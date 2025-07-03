"use client";

import { useState, useEffect } from "react";

interface ExternalSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (source: string) => Promise<void>;
}

interface SyncStatus {
  isLoading: boolean;
  availableSources: string[];
  lastSyncResult?: {
    syncedCount: number;
    errors: string[];
  };
}

export function ExternalSyncModal({
  isOpen,
  onClose,
  onSync,
}: ExternalSyncModalProps) {
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    availableSources: [],
  });

  useEffect(() => {
    if (isOpen) {
      checkAvailableSources();
    }
  }, [isOpen]);

  const checkAvailableSources = async () => {
    try {
      const response = await fetch("/api/users/external-sync?test=true");
      if (response.ok) {
        const data = await response.json();
        setSyncStatus((prev) => ({
          ...prev,
          availableSources: data.availableSources,
        }));
      }
    } catch (error) {
      console.error("Error checking available sources:", error);
    }
  };

  const handleSync = async () => {
    setSyncStatus((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch("/api/users/external-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source: selectedSource }),
      });

      if (response.ok) {
        const result = await response.json();
        setSyncStatus((prev) => ({
          ...prev,
          isLoading: false,
          lastSyncResult: {
            syncedCount: result.syncedCount,
            errors: result.errors,
          },
        }));

        await onSync(selectedSource);
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      console.error("Error during sync:", error);
      setSyncStatus((prev) => ({
        ...prev,
        isLoading: false,
        lastSyncResult: {
          syncedCount: 0,
          errors: ["Sync failed. Please try again."],
        },
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Sync Users from External Sources
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={syncStatus.isLoading}
              >
                <option value="all">All Available Sources</option>
                {syncStatus.availableSources.includes("active_directory") && (
                  <option value="active_directory">Active Directory</option>
                )}
                {syncStatus.availableSources.includes("sailpoint") && (
                  <option value="sailpoint">SailPoint IdentityNow</option>
                )}
              </select>
            </div>

            {syncStatus.availableSources.length === 0 && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p className="text-sm">
                  No external sources are currently configured. Please check
                  your environment variables:
                </p>
                <ul className="text-xs mt-2 list-disc list-inside">
                  <li>
                    AD_TENANT_ID, AD_CLIENT_ID, AD_CLIENT_SECRET (for Active
                    Directory)
                  </li>
                  <li>
                    SAILPOINT_BASE_URL, SAILPOINT_CLIENT_ID,
                    SAILPOINT_CLIENT_SECRET (for SailPoint)
                  </li>
                </ul>
              </div>
            )}

            {syncStatus.lastSyncResult && (
              <div className="bg-gray-100 border border-gray-300 rounded p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Last Sync Result
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  Synced {syncStatus.lastSyncResult.syncedCount} users
                </p>
                {syncStatus.lastSyncResult.errors.length > 0 && (
                  <div className="text-sm">
                    <p className="text-red-600 font-medium mb-1">Errors:</p>
                    <ul className="text-red-600 text-xs space-y-1">
                      {syncStatus.lastSyncResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <p className="text-sm">
                This will sync user data from the selected external source(s).
                Existing users will be updated, and new users will be created.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={syncStatus.isLoading}
            >
              Close
            </button>
            <button
              onClick={handleSync}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={
                syncStatus.isLoading || syncStatus.availableSources.length === 0
              }
            >
              {syncStatus.isLoading ? "Syncing..." : "Start Sync"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
