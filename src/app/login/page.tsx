/*
 * Login Page - DPR Preparation Application
 * 
 * Provides authentication entry point with two user types:
 * - Chartered Accountant: Full access to all firm projects, review capabilities, all 18 screens
 * - Applicant: Own project only, limited to screens 1-17, cannot access CA review workflow
 * 
 * Design Reference: DPR UI Design Specification, Screen 1: Login
 */

"use client";

import { useState, useEffect } from "react";

export default function LoginPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('applicant');
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    const storedId = localStorage.getItem("dpr_user_id");

    if (storedType && storedId) {
      setUserType(storedType as 'ca' | 'applicant');
      setUserId(storedId);
      // Redirect based on user type after a brief moment
      const redirectTarget = storedType === 'ca' 
        ? '/dashboard' 
        : '/my-projects';
      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 500);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate authentication - in production, this would call an auth API
    // For now, we accept any credentials and redirect based on user type
    const validCredentials = 
      (userType === 'ca' && userId.startsWith('CA-')) ||
      (userType === 'applicant' && userId.length >= 3);

    if (validCredentials) {
      // Store session
      localStorage.setItem("dpr_user_type", userType);
      localStorage.setItem("dpr_user_id", userId);
      
      const redirectTarget = userType === 'ca' 
        ? '/dashboard' 
        : '/my-projects';
      
      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 500);
    } else {
      setError("Invalid user ID or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-black rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-12">
          <img
            src="/next.svg"
            alt="DPR System"
            className="dark:invert h-10 w-auto"
            width={100}
            height={36}
          />
        </div>

        <h2 className="text-xl font-semibold text-center mb-6 text-black dark:text-zinc-50">
          DPR Preparation System
        </h2>

        {/* User Type Selector */}
        <div className="space-y-4 mb-8">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="user-type"
              value="ca"
              checked={userType === 'ca'}
              onChange={(e) => setUserType('ca')}
              className="w-4 h-4 rounded border-primary cursor-pointer"
            />
            <span>Chartered Accountant</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="user-type"
              value="applicant"
              checked={userType === 'applicant'}
              onChange={(e) => setUserType('applicant')}
              className="w-4 h-4 rounded border-primary cursor-pointer"
            />
            <span>Applicant</span>
          </label>
        </div>

        {/* Login Form */}
        {userType === 'ca' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary">
                CA User ID
              </label>
              <input
                type="text"
                placeholder="CA-XXXXXX"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>
        )}

        {userType === 'applicant' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary">
                Applicant ID
              </label>
              <input
                type="text"
                placeholder="APL-XXX"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>
        )}

        {/* Error message */}
        {error && (
          <div className="alert alert-error rounded-md mb-6">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="alert alert-warning rounded-md">
            <span className="font-medium">Signing in...</span>
          </div>
        )}

        {/* CTA Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3 rounded-md font-medium text-lg transition-colors hover:bg-[#2d3a6e]"
        >
          {isLoading ? "Signing in..." : "Continue"}
        </button>

        <p className="text-center mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          <a href="#/" className="font-medium underline">
            Forgot credentials?
          </a>
        </p>
      </div>
    </div>
  );
}