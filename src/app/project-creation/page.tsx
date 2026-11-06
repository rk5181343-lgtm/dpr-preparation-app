/*
 * Project Creation Page - DPR Preparation Application
 * Screen 5: Project Type Selection
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjectCreationPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('applicant');
  const [projectType, setProjectType] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white dark:bg-black border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16l-4-4 4-4m0 0l4 4-4 4m0-10l4 4-4 4m0 0l-4 4 4 4m0 6l4 4-4 4m0 0l-4-4 4-4m0 0l4-4-4-4m0 0l-4 4 4-4m0-6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">Project Creation</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-sm">Welcome, {userType === 'ca' ? 'CA Firm' : 'Applicant'}</span>
          <button
            onClick={() => {
              localStorage.removeItem("dpr_user_type");
              localStorage.removeItem("dpr_user_id");
              router.push("/login");
            }}
            className="text-primary text-sm font-medium underline"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="p-6">
        <div>
          <h3 className="text-secondary font-medium mb-4">Select Project Type</h3>
          <p className="text-zinc-600">
            Earthmoving Equipment Rental - MUDRA Tarun Category
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="project-type"
                  value="earthmoving"
                  checked={projectType === "earthmoving"}
                  onChange={(e) => setProjectType("earthmoving")}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                <span>Earthmoving Equipment Rental</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="project-type"
                  value="other"
                  checked={projectType === "other"}
                  onChange={(e) => setProjectType("other")}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                <span>Other</span>
              </label>
            </div>
          </div>
          {projectType === "other" && (
            <div>
              <input
                type="text"
                placeholder="Enter project type"
                className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
          <button
            onClick={() => router.push("/screen-6")}
            className="w-full btn-primary py-3 rounded-md font-medium text-lg transition-colors hover:bg-[#2d3a6e]"
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}