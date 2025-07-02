"use client";

import { useState } from "react";

interface SidebarMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SidebarSection {
  title: string;
  items: SidebarMenuItem[];
}

interface SidebarProps {
  title?: string;
  showLogo?: boolean;
  sections?: SidebarSection[];
  applications?: string[];
  showUserProfile?: boolean;
  className?: string;
}

export function Sidebar({
  title,
  showLogo = false,
  sections = [],
  applications = [],
  showUserProfile = false,
  className = "",
}: SidebarProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div
      className={`bg-white border-r border-gray-300 transition-all duration-300 flex flex-col justify-between relative shadow-md ${className}`}
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
              transform: isSidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)",
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

          {showLogo ? (
            <img
              loading="lazy"
              srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F981851a2ebf64f97b0e4c0d203be9b02?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F981851a2ebf64f97b0e4c0d203be9b02?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F981851a2ebf64f97b0e4c0d203be9b02?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F981851a2ebf64f97b0e4c0d203be9b02?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F981851a2ebf64f97b0e4c0d203be9b02?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F981851a2ebf64f97b0e4c0d203be9b02?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F981851a2ebf64f97b0e4c0d203be9b02?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F981851a2ebf64f97b0e4c0d203be9b02"
              style={{
                aspectRatio: "0.46",
                objectFit: "cover",
                objectPosition: "center",
                width: isSidebarCollapsed ? "32px" : "100%",
                height: isSidebarCollapsed ? "70px" : "auto",
                marginLeft: isSidebarCollapsed ? "0" : "20px",
                minHeight: "20px",
                minWidth: "20px",
                overflow: "hidden",
                maxWidth: isSidebarCollapsed ? "32px" : "189px",
              }}
            />
          ) : (
            title && (
              <span
                className="text-xl font-semibold"
                style={{ display: isSidebarCollapsed ? "none" : "block" }}
              >
                {title}
              </span>
            )
          )}
        </div>

        {/* Applications List */}
        {!isSidebarCollapsed && applications.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-700">
              Available Applications
            </h3>
            <div className="space-y-2">
              {applications.map((app) => (
                <div
                  key={app}
                  className="py-2 px-3 bg-gray-50 rounded hover:bg-red-50 transition-colors cursor-pointer border border-gray-100 hover:border-red-200"
                >
                  <div className="font-montserrat text-lg font-medium text-gray-800">
                    {app}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        {!isSidebarCollapsed && sections.length > 0 && (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="text-sm text-gray-600">
                <h3 className="font-semibold mb-2">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="cursor-pointer hover:text-red-600 transition-colors"
                      onClick={item.onClick}
                    >
                      {item.href ? (
                        <a href={item.href}>{item.label}</a>
                      ) : (
                        item.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      {showUserProfile && (
        <div
          className={`${!isSidebarCollapsed ? "border-t border-gray-200" : ""} pt-4`}
        >
          <div
            className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} mb-3`}
          >
            <div
              className={`${isSidebarCollapsed ? "w-8 h-8" : "w-12 h-12"} rounded-full bg-red-100 flex items-center justify-center overflow-hidden`}
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-sm">
                  John Smith
                </div>
                <a
                  href="/profile"
                  className="text-xs text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                >
                  View Profile
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
