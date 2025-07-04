"use client";

import { SignIn } from "@stackframe/stack";
import { useEffect, useState } from "react";

export default function PhoenixPGSLogin() {
  const [isConfigured, setIsConfigured] = useState(true); // Default to true to avoid flash
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Only check configuration client-side to avoid SSR issues
    const checkConfig = () => {
      try {
        const hasRequiredEnvVars =
          process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
          process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
          process.env.NEXT_PUBLIC_STACK_PROJECT_ID !== "st_proj_placeholder" &&
          process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY !==
            "pk_placeholder";

        if (!hasRequiredEnvVars) {
          setIsConfigured(false);
          setShowError(true);
        }
      } catch (error) {
        setIsConfigured(false);
        setShowError(true);
      }
    };

    // Small delay to avoid flash
    const timer = setTimeout(checkConfig, 100);
    return () => clearTimeout(timer);
  }, []);

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
                alt=""
              />
              <img
                loading="lazy"
                srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5"
                className="aspect-[2.17] object-cover object-center w-2/5 mt-5 min-h-[20px] min-w-[20px] overflow-hidden max-w-[457px] mx-auto"
                alt=""
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

                {/* Login Content */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
                  {showError ? (
                    <div className="text-center">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-red-800 mb-4">
                          Authentication Not Configured
                        </h2>
                        <p className="text-red-600 mb-4">
                          Stack Auth environment variables are missing. Please
                          configure:
                        </p>
                        <ul className="text-left text-sm text-red-600 space-y-1">
                          <li>• NEXT_PUBLIC_STACK_PROJECT_ID</li>
                          <li>• NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY</li>
                          <li>• STACK_SECRET_SERVER_KEY</li>
                        </ul>
                      </div>
                    </div>
                  ) : isConfigured ? (
                    <StackSignInWrapper />
                  ) : (
                    <div className="text-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                  )}
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

function StackSignInWrapper() {
  try {
    return <SignIn />;
  } catch (error) {
    return (
      <div className="text-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            Unable to load authentication component. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }
}
