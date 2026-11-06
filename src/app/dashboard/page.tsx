/*
 * Dashboard - DPR Preparation Application
 * Screen 2: project hub with the 18-step workflow, project cards and quick actions.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProjectStatus = "not_started" | "in_progress" | "completed";

type ProjectCard = {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  progress: number;
  screenReached: number;
};

const STEPS: { screen: number; title: string; route: string }[] = [
  { screen: 1, title: "Client Management", route: "/client-management" },
  { screen: 2, title: "Project Creation", route: "/project-creation" },
  { screen: 3, title: "Project Information", route: "/project-information" },
  { screen: 4, title: "Document Submission", route: "/document-submission" },
  { screen: 5, title: "Loan Repayment & DSCR", route: "/loan-repayment" },
  { screen: 6, title: "Cash Flow Projections", route: "/cash-flow" },
  { screen: 7, title: "Break-Even Analysis", route: "/break-even" },
  { screen: 8, title: "Break-Even Report", route: "/break-even-report" },
  { screen: 9, title: "Balance Sheet", route: "/balance-sheet" },
  { screen: 10, title: "Implementation Schedule", route: "/implementation-schedule" },
  { screen: 11, title: "Document Management", route: "/document-management" },
  { screen: 12, title: "Risk Assessment", route: "/risk-assessment" },
  { screen: 13, title: "Conclusion & Confirmation", route: "/conclusion" },
  { screen: 14, title: "Final Reports", route: "/final-reports" },
  { screen: 15, title: "Settings", route: "/settings" },
];

const STATUS_LABEL: Record<ProjectStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_STYLE: Record<ProjectStatus, string> = {
  not_started: "bg-zinc-100 text-zinc-600",
  in_progress: "bg-accent/15 text-[#8a5a00]",
  completed: "bg-primary/10 text-primary",
};

const INITIAL_PROJECTS: ProjectCard[] = [
  {
    id: "proj-001",
    name: "Kalicheti Earthmovers - Nellore",
    clientName: "Kalicheti Vijay Kumar Reddy",
    status: "in_progress",
    progress: 65,
    screenReached: 9,
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
    screenReached: 15,
  },
];

export default function DashboardPage() {
  const [projects] = useState<ProjectCard[]>(INITIAL_PROJECTS);
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("dpr_user_type", "ca");
    if (!localStorage.getItem("dpr_user_id")) {
      localStorage.setItem("dpr_user_id", "local");
    }
  }, []);

  const openStep = useCallback(
    (route: string) => {
      router.push(route);
    },
    [router]
  );

  const activeProject = projects[0];
  const reached = activeProject?.screenReached ?? 0;
  const overall = Math.round((reached / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">DPR</span>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">DPR Preparation System</h2>
            <p className="text-zinc-500 text-sm">Earthmoving equipment rental · MUDRA Tarun</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 text-sm">{overall}% complete</span>
          <button
            onClick={() => router.push("/settings")}
            className="text-primary text-sm font-medium underline"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Projects */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-secondary font-medium text-lg">My Projects</h3>
              <button onClick={() => router.push("/project-creation")} className="btn-primary">
                New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="bg-white rounded-lg border border-zinc-200 p-5 flex flex-col gap-3"
                >
                  <div>
                    <h4 className="font-medium text-secondary line-clamp-1">{project.name}</h4>
                    <p className="text-zinc-500 text-sm line-clamp-1 mt-1">{project.clientName}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLE[project.status]}`}
                      >
                        {STATUS_LABEL[project.status]}
                      </span>
                      <span className="text-primary font-medium text-sm">{project.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => openStep(STEPS[Math.min(project.screenReached, STEPS.length - 1)].route)}
                    className="btn-secondary w-full"
                  >
                    {project.status === "completed" ? "Review Project" : "Continue Project"}
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Workflow */}
          <section className="bg-white rounded-lg border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-secondary font-medium text-lg">Preparation Workflow</h3>
              <span className="text-sm text-zinc-500">
                {Math.min(reached, STEPS.length)} of {STEPS.length} stages reached
              </span>
            </div>

            <ol className="space-y-1">
              {STEPS.map((step, index) => {
                const isDone = index < reached;
                const isCurrent = index === reached;
                return (
                  <li key={step.screen}>
                    <button
                      onClick={() => openStep(step.route)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                        isCurrent
                          ? "bg-accent/15"
                          : isDone
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "hover:bg-zinc-50"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full text-xs flex items-center justify-center flex-none ${
                          isDone
                            ? "bg-primary text-white"
                            : isCurrent
                              ? "bg-accent text-[#1a365d] font-semibold"
                              : "bg-zinc-200 text-zinc-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={`flex-1 text-sm ${
                          isDone || isCurrent ? "text-secondary font-medium" : "text-zinc-500"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {isDone ? "Done" : isCurrent ? "In progress" : "Pending"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
