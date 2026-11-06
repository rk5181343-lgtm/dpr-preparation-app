"use client";

import { usePathname, useRouter } from "next/navigation";

const STEPS: { title: string; route: string }[] = [
  { title: "Client Management", route: "/client-management" },
  { title: "Project Creation", route: "/project-creation" },
  { title: "Project Information", route: "/project-information" },
  { title: "Document Submission", route: "/document-submission" },
  { title: "Loan Repayment & DSCR", route: "/loan-repayment" },
  { title: "Cash Flow Projections", route: "/cash-flow" },
  { title: "Break-Even Analysis", route: "/break-even" },
  { title: "Break-Even Report", route: "/break-even-report" },
  { title: "Balance Sheet", route: "/balance-sheet" },
  { title: "Implementation Schedule", route: "/implementation-schedule" },
  { title: "Document Management", route: "/document-management" },
  { title: "Risk Assessment", route: "/risk-assessment" },
  { title: "Conclusion & Confirmation", route: "/conclusion" },
  { title: "Final Reports", route: "/final-reports" },
  { title: "Settings", route: "/settings" },
];

export default function StepProgress() {
  const pathname = usePathname();
  const router = useRouter();
  const index = STEPS.findIndex((step) => step.route === pathname);

  if (index === -1) return null;

  const current = STEPS[index];
  const previous = STEPS[index - 1];
  const next = STEPS[index + 1];
  const percent = Math.round(((index + 1) / STEPS.length) * 100);

  return (
    <div className="bg-white border-b border-zinc-200">
      <div className="px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => previous && router.push(previous.route)}
            disabled={!previous}
            className="px-3 py-1 rounded border border-zinc-300 text-sm text-secondary disabled:opacity-40"
          >
            Prev
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-secondary">
                Step {index + 1} of {STEPS.length} · {current.title}
              </span>
              <span className="text-xs text-zinc-500">{percent}% of workflow</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <button
            onClick={() => next && router.push(next.route)}
            disabled={!next}
            className="px-3 py-1 rounded border border-zinc-300 text-sm text-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {STEPS.map((step, stepIndex) => (
            <button
              key={step.route}
              title={`${stepIndex + 1}. ${step.title}`}
              onClick={() => router.push(step.route)}
              className={`w-6 h-6 rounded text-[11px] font-medium ${
                stepIndex === index
                  ? "bg-primary text-white"
                  : stepIndex < index
                    ? "bg-primary/15 text-primary"
                    : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {stepIndex + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
