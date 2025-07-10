"use client";

import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header Image */}
        <div className="text-center mb-8">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F9540c05b913c42ac9eca0746ebb9464b?width=2000"
            alt="PhoenixPGS Performance Guidance Platform"
            className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-8">
            Your Performance Guidance Platform
          </h1>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors mr-4"
            >
              View Dashboard
            </Link>

            <Link
              href="/login"
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/standards"
            className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">Standards</h3>
            <p className="text-gray-600">Manage performance standards</p>
          </Link>

          <Link
            href="/observation-form"
            className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">Observations</h3>
            <p className="text-gray-600">Submit new observations</p>
          </Link>

          <Link
            href="/reporting"
            className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">Reports</h3>
            <p className="text-gray-600">View reports and analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
