"use client";

import { SignIn } from "@stackframe/stack";
import Link from "next/link";

export default function PhoenixPGSLogin() {
  // Check if Stack Auth is configured
  const isStackConfigured = !!(
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
    process.env.STACK_SECRET_SERVER_KEY
  );

  if (!isStackConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Not Available
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Authentication is not configured. Please set up the required
              environment variables.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-300 bg-black min-h-screen">
      <div className="bg-white flex flex-col min-h-screen">
        <div className="flex gap-5 max-md:flex-col max-md:gap-0 min-h-screen">
          {/* First Column - Left Images (50% width) */}
          <div className="flex flex-col w-1/2 max-md:w-full pb-11">
            <div className="flex flex-col -mr-px w-auto">
              <div className="flex"></div>
              <img
                loading="lazy"
                srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc"
                className="aspect-[0.58] object-cover object-center w-2/5 min-h-[51px] min-w-[20px] overflow-hidden mx-auto mt-5 -mb-1"
                alt="Decorative pattern image"
              />
              <img
                loading="lazy"
                srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5"
                className="aspect-[2.17] object-cover object-center w-2/5 mt-5 min-h-[20px] min-w-[20px] overflow-hidden max-w-[457px] mx-auto"
                alt="Decorative banner image"
              />
            </div>
          </div>

          {/* Second Column - Login Form (50% width) */}
          <div className="flex flex-col w-1/2 ml-5 max-md:w-full max-md:ml-0">
            <div className="flex flex-col justify-center min-h-screen p-4">
              <div className="w-auto max-w-md mx-auto">
                {/* Logo/Branding Section */}
                <div className="text-center mb-8">
                  <img
                    loading="lazy"
                    srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1"
                    className="aspect-[2.53] object-cover object-center w-full mt-5 min-h-[20px] min-w-[20px] overflow-hidden"
                    alt="PhoenixPGS Logo"
                  />
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    PhoenixPGS
                  </h1>
                  <p className="text-gray-600 font-normal">
                    Welcome back! Please sign in to your account.
                  </p>
                </div>

                {/* Stack Auth Sign In Component */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
                  <SignIn />
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                  <p className="text-xs text-gray-400">
                    © 2024 PhoenixPGS. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
