/*
 * Dashboard Page - DPR Preparation Application
 * 
 * Project hub displaying all 18 screens with progress tracking.
 * 
 * Design Reference: DPR UI Design Specification, Screen 2: Dashboard
 * 
 * Features:
 * - 18-step progress bar showing workflow status
 * - Project cards for existing projects
 * - Quick access to all workflow stages
 * - User type-based visibility (CA vs Applicant)
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ProjectCard {
  id: string;
  name: string;
  clientName: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number; // 0-100
  screenReached: number; // last screen number reached
}

const DUMMY_PROJECTS: ProjectCard[] = [
  {
    id: "proj-001",
    name: "Kalicheti Earthmovers - Nellore",
    clientName: "Kalicheti Vijay Kumar Reddy",
    status: "in_progress",
    progress: 65,
    screenReached: 12,
  },
  {
    id: "proj-002",
    name: "Arun Excavators - Chennai",
    clientName: "Arun Kumar",
    status: "not_started",
    progress: 0,
    screenReached: 0,
  },
  {
    id: "proj-003",
    name: "Mohan Constructions - Bangalore",
    clientName: "Mohan Singh",
    status: "completed",
    progress: 100,
    screenReached: 18,
  },
];

const SCREEN_ROUTES: Record<number, string> = {
  1: "/login",
  2: "/dashboard",
  3: "/client-management",
  4: "/project-creation",
  5: "/project-creation",
  6: "/project-information",
  7: "/document-submission",
  8: "/loan-repayment",
  9: "/cash-flow",
  10: "/break-even",
  11: "/balance-sheet",
  12: "/implementation-schedule",
  13: "/break-even-report",
  14: "/document-management",
  15: "/risk-assessment",
  16: "/conclusion",
  17: "/final-reports",
  18: "/settings",
};

export default function DashboardPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('applicant');
  const [projects, setProjects] = useState<ProjectCard[]>(DUMMY_PROJECTS);
  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    const storedId = localStorage.getItem("dpr_user_id");

    if (storedType && storedId) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  const navigateTo = useCallback((screenNumber: number) => {
    // Applicants cannot access screens beyond 17 (CA review workflow)
    if (userType === 'applicant' && screenNumber > 17) {
      console.warn("Applicant access denied: CA review workflow screens are not available");
      return;
    }
    router.push(SCREEN_ROUTES[screenNumber] ?? "/dashboard");
  }, [userType, router]);

  const getProgressPercentage = useCallback((screen: number) => {
    // 18 screens total, each contributes equally
    return Math.round((screen / 18) * 100);
  }, []);

  const progressBarClasses = {
    base: "relative flex items-center gap-3 px-3 py-2 rounded-md",
    completed: "bg-primary/10 text-primary",
    current: "bg-primary/20",
    default: "text-zinc-400"
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header with user info and progress */}
      <header className="bg-white dark:bg-black border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16l-4-4 4-4m0 0l4 4-4 4m0-10l4 4-4 4m0 0l-4 4 4 4m0 6l4 4-4 4m0 0l-4-4 4-4m0 0l4-4-4-4m0 0l-4 4 4-4m0-6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">DPR Preparation System</h2>
            <p className="text-zinc-500 text-sm">Version 1.0.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-sm">
            Welcome, {userType === 'ca' ? 'CA Firm' : 'Applicant'}
          </span>
          <button
            onClick={() => {
              // Clear session and redirect to login
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

      {/* Main Content */}
      <main className="p-6">
        {/* Progress Overview Section */}
        <section className="mb-8">
          <h3 className="text-secondary font-medium mb-4">Workflow Progress</h3>
          
          <div className="space-y-3">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((screen) => {
              const proj = projects[0]; // Use first project for demo
              const lastScreen = proj.screenReached;
              const isCompleted = lastScreen >= screen;
              const isCurrent = lastScreen === screen - 1;
              const percentage = getProgressPercentage(screen);

              const divClass = progressBarClasses.base + " " + (
                isCompleted
                  ? progressBarClasses.completed
                  : isCurrent
                    ? progressBarClasses.current
                    : progressBarClasses.default
              );

              const span1Class = "w-2 h-2 rounded-full bg-primary " + (isCompleted ? "" : "opacity-50");
              const span2Class = "flex-1 text-sm " + (isCompleted ? "font-medium" : "text-muted-foreground");

              return (
                <div
                  key={screen}
                  className={divClass}
                >
                  <span className={span1Class}></span>
                  <span className={span2Class}>Step {screen}</span>
                  <span className="text-xs opacity-70">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Project Cards Section */}
        <section className="mb-8">
          <h3 className="text-secondary font-medium mb-4">My Projects</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-5">
                  <h4 className="font-medium text-secondary truncate line-clamp-1">
                    {project.name}
                  </h4>
                  <p className="text-zinc-500 text-sm line-clamp-1 mt-1">
                    {project.clientName}
                  </p>
                </div>
                <div className="p-3 border-t border-zinc-100">
                  <div className="flex justify-between items-start">
                    <span className="text-zinc-500 text-xs">
                      Status: {project.status}
                    </span>
                    <span className="text-primary font-medium text-sm">
                      {project.progress}% complete
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-width"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={() => navigateTo(project.screenReached + 1)}
                  className="w-full py-2 px-3 text-sm text-primary font-medium hover:bg-primary/10 group-hover:bg-primary/10 rounded-md mt-2"
                >
                  Continue Project
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Quick Stats / Next Steps */}
        {userType === 'ca' && (
          <section className="mt-8">
            <h3 className="text-secondary font-medium mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="p-4 rounded-lg border border-primary hover:bg-primary/5 transition-colors"
                onClick={() => router.push("/login")}
              >
                <svg className="w-5 h-5 mb-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"></path>
                </svg>
                New Project
              </button>
              <button
                className="p-4 rounded-lg border border-secondary hover:bg-secondary/5 transition-colors"
                onClick={() => router.push("/project-creation")}
              >
                <svg className="w-5 h-5 mb-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Client Management
              </button>
              <button
                className="p-4 rounded-lg border border-accent hover:bg-accent/5 transition-colors"
                onClick={() => router.push("/project-information")}
              >
                <svg className="w-5 h-5 mb-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19l3 3l-3 3"></path>
                </svg>
                Project Creation
              </button>
            </div>
          </section>
        )}

        {userType !== 'ca' && (
          <section className="mt-8">
            <h3 className="text-secondary font-medium mb-4">Next Available Screen</h3>
            <p className="text-zinc-600">
              You are currently at screen {projects[0]?.screenReached || 0} of 18.
              CA review workflow screens (18) are not available for applicants.
            </p>
          </section>
        )}

        {projects.length === 0 && userType !== 'ca' && (
          <section className="mt-8 text-center py-12">
            <p className="text-zinc-500">
              No projects found. Start by creating a new project from the dashboard.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}