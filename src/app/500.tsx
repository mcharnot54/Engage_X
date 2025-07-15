"use client";

import Link from "next/link";

// Force dynamic rendering to prevent SSG issues
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = false;

export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          Server Error
        </h2>
        <p className="text-gray-500 mb-8">
          Something went wrong on the server.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
