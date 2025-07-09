"use client";

import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

interface SystemStatus {
  database: "connected" | "error" | "checking";
  builderIO: "configured" | "missing" | "checking";
  stackAuth: "configured" | "missing" | "checking";
  environment: "development" | "production";
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus>({
    database: "checking",
    builderIO: "checking",
    stackAuth: "checking",
    environment: "development",
  });

  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    // Check Builder.io configuration (client-side only)
    const builderKey =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_BUILDER_API_KEY
        : null;
    const builderStatus =
      builderKey && builderKey !== "YOUR_BUILDER_API_KEY_HERE"
        ? "configured"
        : "missing";

    // Check Stack Auth configuration (client-side only)
    const stackProjectId =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_STACK_PROJECT_ID
        : null;
    const stackClientKey =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
        : null;
    const stackStatus =
      stackProjectId && stackClientKey ? "configured" : "missing";

    // Check database connection
    let dbStatus: "connected" | "error" = "error";
    let stats = null;

    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        dbStatus = "connected";
        stats = await response.json();
      }
    } catch (error) {
      console.error("Database check failed:", error);
    }

    setStatus({
      database: dbStatus,
      builderIO: builderStatus,
      stackAuth: stackStatus,
      environment:
        typeof window !== "undefined" && process.env.NODE_ENV === "production"
          ? "production"
          : "development",
    });

    setDbStats(stats);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "configured":
        return "text-green-600 bg-green-100";
      case "missing":
      case "error":
        return "text-red-600 bg-red-100";
      case "checking":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "configured":
        return "✅";
      case "missing":
      case "error":
        return "❌";
      case "checking":
        return "⏳";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Status
          </h1>
          <p className="text-gray-600">
            Real-time status of all system components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Database Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Database Connection</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.database)}`}
              >
                {getStatusIcon(status.database)} {status.database}
              </span>
            </div>
            {status.database === "connected" && dbStats && (
              <div className="space-y-2 text-sm text-gray-600">
                <p>Organizations: {dbStats.stats?.totalOrganizations || 0}</p>
                <p>Facilities: {dbStats.stats?.totalFacilities || 0}</p>
                <p>Observations: {dbStats.stats?.totalObservations || 0}</p>
                <p>Users: {dbStats.stats?.totalUsers || 0}</p>
              </div>
            )}
            {status.database === "error" && (
              <p className="text-red-600 text-sm">
                Unable to connect to database. Check DATABASE_URL configuration.
              </p>
            )}
          </Card>

          {/* Builder.io Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Builder.io</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.builderIO)}`}
              >
                {getStatusIcon(status.builderIO)} {status.builderIO}
              </span>
            </div>
            {status.builderIO === "missing" && (
              <div className="text-sm text-gray-600">
                <p className="text-red-600 mb-2">API key not configured</p>
                <p>Add NEXT_PUBLIC_BUILDER_API_KEY to .env.local</p>
                <a
                  href="https://builder.io/account/space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Get API key from Builder.io →
                </a>
              </div>
            )}
            {status.builderIO === "configured" && (
              <p className="text-green-600 text-sm">
                Ready to load Builder.io content
              </p>
            )}
          </Card>

          {/* Stack Auth Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stack Auth</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.stackAuth)}`}
              >
                {getStatusIcon(status.stackAuth)} {status.stackAuth}
              </span>
            </div>
            {status.stackAuth === "missing" && (
              <div className="text-sm text-gray-600">
                <p className="text-red-600 mb-2">
                  Authentication not configured
                </p>
                <p>Add Stack Auth keys to .env.local:</p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li>NEXT_PUBLIC_STACK_PROJECT_ID</li>
                  <li>NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY</li>
                  <li>STACK_SECRET_SERVER_KEY</li>
                </ul>
              </div>
            )}
            {status.stackAuth === "configured" && (
              <p className="text-green-600 text-sm">
                Authentication system ready
              </p>
            )}
          </Card>

          {/* Environment Info */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Environment</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${status.environment === "production" ? "text-blue-600 bg-blue-100" : "text-purple-600 bg-purple-100"}`}
              >
                ℹ️ {status.environment}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Next.js: 15.3.5</p>
              <p>
                Node.js:{" "}
                {typeof window === "undefined" ? process.version : "Client"}
              </p>
              <p>Build: {new Date().toLocaleString()}</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Go to Homepage
            </Button>
            <Button
              onClick={checkSystemStatus}
              className="bg-green-600 hover:bg-green-700"
            >
              Refresh Status
            </Button>
          </div>
        </Card>

        {/* Demo Ready Status */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Demo Readiness</h3>
          {status.database === "connected" ? (
            <div className="text-green-600">
              <p className="font-medium">✅ System is demo-ready!</p>
              <p className="text-sm mt-1">
                Core functionality is working. Dashboard and data are
                accessible.
              </p>
            </div>
          ) : (
            <div className="text-red-600">
              <p className="font-medium">❌ System needs configuration</p>
              <p className="text-sm mt-1">
                Please configure the database connection for full functionality.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
