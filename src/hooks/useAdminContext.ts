"use client";

import { useState, useEffect } from "react";

export interface AdminUser {
  id: string;
  name: string;
  organizationid?: number;
  isSystemAdmin: boolean;
}

export interface TenantContext {
  organizationId?: number;
  isSystemAdmin: boolean;
  userId?: string;
}

export interface AdminContext {
  user: AdminUser | null;
  tenantContext: TenantContext | null;
  isLoading: boolean;
  error: string | null;
}

export function useAdminContext() {
  const [context, setContext] = useState<AdminContext>({
    user: null,
    tenantContext: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    fetchAdminContext();
  }, []);

  const fetchAdminContext = async () => {
    try {
      setContext((prev) => ({ ...prev, isLoading: true, error: null }));

      // For demo purposes, switch between admin and regular user
      // In production, this would be determined by actual authentication
      const isAdminView = window.location.search.includes("admin=true");
      const userParam = isAdminView ? "?user=admin" : "?user=regular";

      const response = await fetch(`/api/tenant-context${userParam}`);
      if (!response.ok) {
        throw new Error("Failed to fetch admin context");
      }

      const data = await response.json();

      setContext({
        user: data.user,
        tenantContext: data.tenantContext,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching admin context:", error);
      setContext((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  };

  return { ...context, refetch: fetchAdminContext };
}
