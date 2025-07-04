"use client";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          This is a simplified admin page for testing.
        </p>
      </div>
    </div>
  );
}
