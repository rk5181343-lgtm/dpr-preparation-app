/*
 * Login Page - DPR Preparation Application
 * Screen 1: Authentication entry point for CA firms and applicants.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userType, setUserType] = useState<"ca" | "applicant">("ca");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Existing session goes straight to the dashboard
  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    const storedId = localStorage.getItem("dpr_user_id");
    if (storedType && storedId) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = userId.trim();
    const isValid =
      userType === "ca" ? /^CA-/i.test(trimmed) : trimmed.length >= 3;

    if (!isValid) {
      setError(
        userType === "ca"
          ? "Enter a CA user ID such as CA-123456."
          : "Enter an applicant ID of at least 3 characters."
      );
      return;
    }

    setIsLoading(true);
    localStorage.setItem("dpr_user_type", userType);
    localStorage.setItem("dpr_user_id", trimmed);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-md bg-[#1a365d] flex items-center justify-center mb-3">
            <span className="text-white font-bold tracking-wide">DPR</span>
          </div>
          <h1 className="text-xl font-semibold text-[#1a365d] text-center">
            DPR Preparation System
          </h1>
          <p className="text-sm text-zinc-500 mt-1 text-center">
            Earthmoving equipment rental · MUDRA Tarun
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* User type */}
          <fieldset>
            <legend className="block text-sm font-medium text-[#2d3748] mb-2">
              Sign in as
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 border border-zinc-300 rounded-md px-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="user-type"
                  value="ca"
                  checked={userType === "ca"}
                  onChange={() => setUserType("ca")}
                />
                <span className="text-sm text-[#2d3748]">CA Firm</span>
              </label>
              <label className="flex items-center gap-2 border border-zinc-300 rounded-md px-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="user-type"
                  value="applicant"
                  checked={userType === "applicant"}
                  onChange={() => setUserType("applicant")}
                />
                <span className="text-sm text-[#2d3748]">Applicant</span>
              </label>
            </div>
          </fieldset>

          {/* User ID */}
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-[#2d3748] mb-2"
            >
              {userType === "ca" ? "CA User ID" : "Applicant ID"}
            </label>
            <input
              id="userId"
              type="text"
              placeholder={userType === "ca" ? "CA-123456" : "APL-001"}
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              autoComplete="username"
              required
            />
            <p className="text-xs text-zinc-500 mt-1">
              {userType === "ca"
                ? "CA IDs start with CA- and unlock all 18 screens."
                : "Applicants can access screens 1-17."}
            </p>
          </div>

          {error && (
            <div className="alert-alert alert-error rounded-md">
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? "Signing in…" : "Continue"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Demo build — any ID in the formats above signs you in.
        </p>
      </div>
    </div>
  );
}
