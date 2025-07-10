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
            className="w-[90%] max-w-[711px] mx-auto rounded-lg mt-[113px]"
          />
        </div>

        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-[26px] font-bold text-red-600 mb-8 leading-10">
            Your Performance Guidance Platform
          </h1>

          <div>
            <Link
              href="/login"
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"></div>
      </div>
    </div>
  );
}
