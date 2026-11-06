/*
 * Implementation Schedule - DPR Preparation Application
 * Screen 10: project stages with timing, ownership, dependencies and status.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stage = {
  id: number;
  name: string;
  description: string;
  startWeek: number;
  endWeek: number;
  status: string;
  responsible: string;
  dependencies: string;
};

const STATUSES = ["Not Started", "In Progress", "Completed", "Delayed"];

const DEFAULT_STAGES: Stage[] = [
  {
    id: 1,
    name: "Quotations inspection and customer enquiries",
    description: "Initial customer enquiries and quotation requests",
    startWeek: 1,
    endWeek: 2,
    status: "Not Started",
    responsible: "",
    dependencies: "",
  },
  {
    id: 2,
    name: "Bank appraisal and sanction",
    description: "Subject to lender processing and approval",
    startWeek: 3,
    endWeek: 8,
    status: "Not Started",
    responsible: "",
    dependencies: "1",
  },
  {
    id: 3,
    name: "Promoter contribution and asset purchase",
    description: "After sanction, promoter contribution and used asset purchase",
    startWeek: 9,
    endWeek: 12,
    status: "Not Started",
    responsible: "",
    dependencies: "2",
  },
  {
    id: 4,
    name: "Insurance commissioning and operator engagement",
    description: "Within 2 weeks after purchase: insurance commissioning and operator engagement",
    startWeek: 13,
    endWeek: 14,
    status: "Not Started",
    responsible: "",
    dependencies: "3",
  },
  {
    id: 5,
    name: "Commercial operation and billing",
    description: "After equipment readiness, start billing customers",
    startWeek: 15,
    endWeek: 20,
    status: "Not Started",
    responsible: "",
    dependencies: "4",
  },
];

const field = "w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ImplementationSchedulePage() {
  const router = useRouter();
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("implementationSchedule");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Stage[];
        if (Array.isArray(parsed) && parsed.length > 0) setStages(parsed);
      } catch {
        // keep defaults
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("implementationSchedule", JSON.stringify(stages));
  }, [stages, loaded]);

  const patch = (id: number, changes: Partial<Stage>) =>
    setStages((previous) =>
      previous.map((stage) => (stage.id === id ? { ...stage, ...changes } : stage))
    );

  const addStage = () =>
    setStages((previous) => [
      ...previous,
      {
        id: previous.reduce((max, stage) => Math.max(max, stage.id), 0) + 1,
        name: "",
        description: "",
        startWeek: 1,
        endWeek: 2,
        status: "Not Started",
        responsible: "",
        dependencies: "",
      },
    ]);

  const removeStage = (id: number) =>
    setStages((previous) => previous.filter((stage) => stage.id !== id));

  const completed = stages.filter((stage) => stage.status === "Completed").length;
  const inProgress = stages.filter((stage) => stage.status === "In Progress").length;
  const percent = stages.length ? Math.round((completed / stages.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">DPR</span>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">Implementation Schedule</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {saved && <span className="text-xs text-primary">Saved</span>}
          <button onClick={() => router.push("/dashboard")} className="text-primary text-sm font-medium underline">
            Home
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-secondary font-medium text-lg mb-3">Schedule Summary</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-zinc-500">Stages</p>
                <p className="text-2xl font-bold text-primary">{stages.length}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Completed</p>
                <p className="text-2xl font-bold text-primary">{completed}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">In progress</p>
                <p className="text-2xl font-bold text-primary">{inProgress}</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
            <p className="text-xs text-zinc-500 mt-2">{percent}% of stages completed</p>
          </section>

          {/* Stages */}
          {stages.map((stage, index) => (
            <section key={stage.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Stage {index + 1}</p>
                  <h4 className="text-secondary font-medium">{stage.name || "Untitled stage"}</h4>
                </div>
                <button
                  onClick={() => removeStage(stage.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary mb-1">Stage name</label>
                  <input
                    className={field}
                    value={stage.name}
                    onChange={(event) => patch(stage.id, { name: event.target.value })}
                    placeholder="Stage name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                  <textarea
                    className={field}
                    rows={2}
                    value={stage.description}
                    onChange={(event) => patch(stage.id, { description: event.target.value })}
                    placeholder="What happens in this stage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Start week</label>
                  <input
                    type="number"
                    min={1}
                    className={field}
                    value={stage.startWeek}
                    onChange={(event) => patch(stage.id, { startWeek: Number(event.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">End week</label>
                  <input
                    type="number"
                    min={1}
                    className={field}
                    value={stage.endWeek}
                    onChange={(event) => patch(stage.id, { endWeek: Number(event.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Status</label>
                  <select
                    className={field}
                    value={stage.status}
                    onChange={(event) => patch(stage.id, { status: event.target.value })}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Responsible</label>
                  <input
                    className={field}
                    value={stage.responsible}
                    onChange={(event) => patch(stage.id, { responsible: event.target.value })}
                    placeholder="Applicant / operator"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary mb-1">Dependencies</label>
                  <input
                    className={field}
                    value={stage.dependencies}
                    onChange={(event) => patch(stage.id, { dependencies: event.target.value })}
                    placeholder="Stage numbers, e.g. 1, 2"
                  />
                </div>
              </div>
            </section>
          ))}

          <button onClick={addStage} className="btn-secondary w-full">
            + Add stage
          </button>

          <div className="flex gap-3 pb-6">
            <button
              onClick={() => {
                localStorage.setItem("implementationSchedule", JSON.stringify(stages));
                setSaved(true);
                router.push("/document-management");
              }}
              className="btn-primary"
            >
              Save & continue
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-secondary">
              Back to dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
