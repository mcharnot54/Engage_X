"use client";

import { useUser } from "@stackframe/stack";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    module: string;
    action: string;
  };
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const user = useUser({ or: "redirect" });
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermissions() {
      if (!user) {
        setLoading(false);
        return;
      }

      // If no specific permission is required, allow access
      if (!requiredPermission) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        // Check user permissions via API
        const response = await fetch(`/api/users/${user.id}/permissions`);
        if (response.ok) {
          const permissions = await response.json();
          const hasPermission = permissions.some(
            (p: any) =>
              p.module === requiredPermission.module &&
              p.action === requiredPermission.action,
          );
          setHasAccess(hasPermission);
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setHasAccess(false);
      }

      setLoading(false);
    }

    checkPermissions();
  }, [user, requiredPermission]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
