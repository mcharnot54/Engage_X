"use client";

import { useState, useRef } from "react";

interface UserProfileData {
  id: string;
  name: string;
  email?: string;
  employeeId: string;
  department?: string;
  role?: string;
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
}

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserProfileData;
  onSave: (userData: UserProfileData) => void;
}

export function UserProfile({
  isOpen,
  onClose,
  userData,
  onSave,
}: UserProfileProps) {
  const [editedData, setEditedData] = useState<UserProfileData>(userData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditedData({ ...editedData, profilePicture: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              User Profile
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

          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center overflow-hidden">
                  {editedData.profilePicture ? (
                    <img
                      src={editedData.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-red-600">
                      {editedData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {isEditing && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click the + button to upload a profile picture
                </p>
              )}
            </div>

            {/* User Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md text-gray-800">
                    {editedData.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.employeeId}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        employeeId: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md text-gray-800">
                    {editedData.employeeId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md text-gray-800">
                    {editedData.email || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.department || ""}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        department: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md text-gray-800">
                    {editedData.department || "Not assigned"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                {isEditing ? (
                  <select
                    value={editedData.role || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, role: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Role</option>
                    <option value="System Administrator">
                      System Administrator
                    </option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Team Member">Team Member</option>
                    <option value="Observer">Observer</option>
                    <option value="Manager">Manager</option>
                  </select>
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md text-gray-800">
                    {editedData.role || "Not assigned"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.phoneNumber || ""}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md text-gray-800">
                    {editedData.phoneNumber || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={editedData.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        isActive: e.target.value === "active",
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        editedData.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {editedData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
