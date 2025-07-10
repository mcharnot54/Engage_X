"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
// import ErrorBoundary from "../components/ErrorBoundary";

// Force dynamic rendering to avoid SSG issues with Builder.io
export const dynamic = "force-dynamic";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

    return (
    <div>
      <div className="pointer-events-auto text-gray-300 bg-white">
        <div className="bg-white text-gray-300 pointer-events-auto">
          <div className="mb-[200px] bg-white">
            <div className="flex gap-5 max-md:flex-col max-md:gap-0 -mb-[3px]">
              {/* First Column - Empty for spacing */}
              <div className="flex flex-col w-1/5 max-md:w-full max-md:ml-0" />

              {/* Second Column - Main Content */}
              <div className="flex flex-col w-3/5 ml-5 max-md:w-full max-md:ml-0">
                {/* Top Image Section */}
                <div className="flex flex-col relative min-h-[352px] p-5">
                  <section className="flex flex-col relative min-h-[352px] p-5 w-full self-stretch flex-grow max-w-[1200px] mx-auto">
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F9540c05b913c42ac9eca0746ebb9464b?width=2000"
                      className="block aspect-[2.98] object-cover w-full mt-5 min-h-[20px] min-w-[20px] overflow-hidden pointer-events-auto"
                      alt="PhoenixPGS Performance Guidance Platform banner"
                    />
                  </section>
                  {/* Welcome Content Section */}
                  <div className="flex items-center bg-white justify-center min-h-[200px] pointer-events-auto mb-auto pl-[37px]">
                    <div className="text-center pointer-events-auto">
                      <p className="text-[28px] text-red-600 leading-7 mb-8">
                        <b>Your Performance Guidance Platform</b>
                      </p>
                      <div className="space-y-4 flex flex-col items-center">
                        <Link
                          href="/dashboard"
                          className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                        >
                          View Dashboard
                        </Link>
                        <Link
                          href="/login"
                          className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                        >
                          Sign In
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col relative min-h-[100px] px-5 pb-5">
                  <section className="flex flex-col relative min-h-[100px] px-5 pb-5 w-full self-stretch flex-grow max-w-[1200px] mx-auto" />
                </div>
              </div>

              {/* Third Column - Empty for spacing */}
              <div className="flex flex-col w-1/5 ml-5 max-md:w-full max-md:ml-0" />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}