"use client";

import { useState } from "react";

export default function PhoenixPGSLogin() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login attempted with:", credentials);
      // Here you would integrate with your authentication system
    }, 1000);
  };

  return (
    <>
      <div className="text-gray-300 bg-black">
        <div>
          <div className="bg-white flex flex-col">
            <div className="flex gap-5 max-md:flex-col max-md:gap-0">
              {/* First Column - Left Images (50% width) */}
              <div className="flex flex-col w-1/2 max-md:w-full">
                <div className="flex flex-col -mr-px w-auto">
                  <div className="flex"></div>
                  <img
                    loading="lazy"
                    srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F2694dcae253f53f4f26b3127d235225aa9e82edc"
                    className="aspect-[0.58] object-cover object-center w-3/5 min-h-[51px] min-w-[20px] overflow-hidden mx-auto mt-5 -mb-1"
                    alt=""
                  />
                  <img
                    loading="lazy"
                    srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F8bb6816c50123434bc990c779230032f94d63bf5"
                    className="aspect-[2.17] object-cover object-center w-3/5 mt-5 min-h-[20px] min-w-[20px] overflow-hidden max-w-[457px] mx-auto"
                    alt=""
                  />
                </div>
              </div>

              {/* Second Column - Login Form (50% width) */}
              <div className="flex flex-col w-1/2 ml-5 max-md:w-full max-md:ml-0">
                <div className="flex flex-col ml-5 w-auto">
                  <div className="bg-white flex flex-col justify-center min-h-screen p-4">
                    <div className="flex gap-5 max-md:flex-col max-md:gap-0">
                      <div className="flex flex-col w-full">
                        <div className="w-auto max-w-md">
                          {/* Logo/Branding Section */}
                          <div className="text-center mb-8">
                            <img
                              loading="lazy"
                              srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1"
                              className="aspect-[2.53] object-cover object-center w-full mt-5 min-h-[20px] min-w-[20px] overflow-hidden"
                              alt="PhoenixPGS Logo"
                            />
                            <h1 className="text-3xl font-bold text-white mb-2">
                              PhoenixPGS
                            </h1>
                            <p className="text-red-600 font-normal">
                              Welcome back! Please sign in to your account.
                            </p>
                          </div>

                          {/* Login Form */}
                          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-2xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Username Field */}
                              <div>
                                <label
                                  htmlFor="username"
                                  className="block text-sm font-medium text-gray-400 mb-2"
                                >
                                  Username or Email
                                </label>
                                <input
                                  type="text"
                                  id="username"
                                  name="username"
                                  value={credentials.username}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-[1px_1px_3px_0px_rgba(0,0,0,1)]"
                                  placeholder="Enter your username or email"
                                  required
                                  aria-describedby="username-help"
                                />
                              </div>

                              {/* Password Field */}
                              <div>
                                <label
                                  htmlFor="password"
                                  className="block text-sm font-medium text-gray-400 mb-2"
                                >
                                  Password
                                </label>
                                <input
                                  type="password"
                                  id="password"
                                  name="password"
                                  value={credentials.password}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-[1px_1px_3px_0px_rgba(0,0,0,1)]"
                                  placeholder="Enter your password"
                                  required
                                  aria-describedby="password-help"
                                />
                              </div>

                              {/* Remember Me & Forgot Password */}
                              <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-orange-500 bg-white/10 border-white/30 rounded focus:ring-orange-500 focus:ring-2"
                                  />
                                  <span className="ml-2 text-sm text-gray-400">
                                    Remember me
                                  </span>
                                </label>
                                <button
                                  type="button"
                                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200"
                                >
                                  Forgot password?
                                </button>
                              </div>

                              {/* Login Button */}
                              <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:transform-none"
                                aria-describedby="login-button-help"
                              >
                                {isLoading ? (
                                  <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Signing in...
                                  </div>
                                ) : (
                                  "Sign In"
                                )}
                              </button>
                            </form>

                            {/* Additional Options */}
                            <div className="mt-6 pt-6 border-t border-white/20">
                              <p className="text-center text-sm text-slate-300">
                                Don't have an account?{" "}
                                <button className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200">
                                  Contact Administrator
                                </button>
                              </p>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="text-center mt-8">
                            <p className="text-xs text-slate-400">
                              © 2024 PhoenixPGS. All rights reserved.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
