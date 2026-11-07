/*
 * Project Creation - industry, business activity, project type and purpose.
 * The first screen a user sees when they start a new DPR.
 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DPR_PURPOSES, INDUSTRIES, PROJECT_TYPES } from "@/lib/industry-master";
import { createProjectId, setCurrentProject, upsertProject } from "@/lib/project-store";

const STEP_TITLES = ["Industry", "Business activity", "Project type", "Project details"];
const field = "w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ProjectCreationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [customActivity, setCustomActivity] = useState("");
  const [projectType, setProjectType] = useState<string>(PROJECT_TYPES[0]);
  const [purpose, setPurpose] = useState<string>(DPR_PURPOSES[0]);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [error, setError] = useState("");

  const industries = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return INDUSTRIES;
    return INDUSTRIES.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.activities.some((activity) => activity.name.toLowerCase().includes(term))
    );
  }, [query]);

  const industry = INDUSTRIES.find((item) => item.id === industryId);
  const selectedActivity = industry?.activities.find((item) => item.id === activityId);
  const activityName =
    activityId === "custom-activity"
      ? customActivity.trim() || "Custom Activity"
      : selectedActivity?.name ?? "";

  const createProject = () => {
    if (!industry || !activityId || !activityName) {
      setError("Select an industry and a business activity first.");
      return;
    }
    const id = createProjectId();
    const now = new Date().toISOString();
    upsertProject({
      id,
      name: projectName.trim() || `${activityName} DPR`,
      clientName: clientName.trim(),
      industryId: industry.id,
      industryName: industry.name,
      activityId,
      activityName,
      projectType,
      purpose,
      answers: {},
      progress: 0,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    setCurrentProject(id);
    router.push("/project-information");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">DPR</span>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">Create New Project</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-primary text-sm font-medium underline">
          Home
        </button>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-wrap gap-2">
            {STEP_TITLES.map((title, index) => {
              const number = index + 1;
              const state =
                number === step ? "bg-primary text-white" : number < step ? "bg-primary/15 text-primary" : "bg-zinc-100 text-zinc-500";
              return (
                <span key={title} className={`px-3 py-1 rounded-full text-xs font-medium ${state}`}>
                  {number}. {title}
                </span>
              );
            })}
          </div>

          {step === 1 && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-secondary font-medium text-lg mb-1">What type of business or industry are you planning to establish?</h3>
              <p className="text-sm text-zinc-500 mb-4">Pick the closest industry. The next step narrows it to the exact business activity.</p>
              <input
                className={`${field} mb-4`}
                placeholder="Search industry or activity, e.g. rice, rental, dairy"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {industries.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIndustryId(item.id);
                      setActivityId("");
                      setError("");
                    }}
                    className={`text-left rounded-md border p-4 ${
                      industryId === item.id ? "border-primary bg-primary/5" : "border-zinc-200 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                        {item.glyph}
                      </span>
                      <div>
                        <p className="font-medium text-secondary text-sm">{item.name}</p>
                        <p className="text-xs text-zinc-500">{item.description}</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">{item.activities.length} activities</p>
                  </button>
                ))}
                {industries.length === 0 && <p className="text-sm text-zinc-500">No industry matches that search.</p>}
              </div>
            </section>
          )}

          {step === 2 && industry && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-secondary font-medium text-lg mb-1">Select the business activity</h3>
              <p className="text-sm text-zinc-500 mb-4">{industry.name} — the questions and document checklist change with this choice.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {industry.activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => {
                      setActivityId(activity.id);
                      setError("");
                    }}
                    className={`text-left rounded-md border p-4 ${
                      activityId === activity.id ? "border-primary bg-primary/5" : "border-zinc-200 hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-secondary text-sm">{activity.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{activity.description}</p>
                  </button>
                ))}
              </div>
              {activityId === "custom-activity" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-secondary mb-1">Describe your activity</label>
                  <input
                    className={field}
                    value={customActivity}
                    onChange={(event) => setCustomActivity(event.target.value)}
                    placeholder="e.g. Coir pith processing unit"
                  />
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-secondary font-medium text-lg mb-4">Project type and DPR purpose</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {PROJECT_TYPES.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm cursor-pointer ${
                      projectType === type ? "border-primary bg-primary/5" : "border-zinc-200"
                    }`}
                  >
                    <input type="radio" name="project-type" checked={projectType === type} onChange={() => setProjectType(type)} />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              <h4 className="text-secondary font-medium mb-2">DPR purpose</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DPR_PURPOSES.map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm cursor-pointer ${
                      purpose === item ? "border-primary bg-primary/5" : "border-zinc-200"
                    }`}
                  >
                    <input type="radio" name="dpr-purpose" checked={purpose === item} onChange={() => setPurpose(item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-secondary font-medium text-lg mb-4">Project details</h3>
              <div className="rounded-md bg-zinc-50 border border-zinc-200 p-4 mb-4 text-sm">
                <p><span className="text-zinc-500">Industry:</span> {industry?.name ?? "—"}</p>
                <p><span className="text-zinc-500">Activity:</span> {activityName || "—"}</p>
                <p><span className="text-zinc-500">Project type:</span> {projectType}</p>
                <p><span className="text-zinc-500">Purpose:</span> {purpose}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Project name</label>
                  <input
                    className={field}
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder={`${activityName || "Project"} DPR`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Client name</label>
                  <input
                    className={field}
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="Proprietor or firm name"
                  />
                </div>
              </div>
            </section>
          )}

          {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

          <div className="flex gap-3 pb-6">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="btn-secondary">
                Back
              </button>
            )}
            {step < 4 && (
              <button
                onClick={() => {
                  if (step === 1 && !industryId) {
                    setError("Select an industry to continue.");
                    return;
                  }
                  if (step === 2 && (!activityId || (activityId === "custom-activity" && !customActivity.trim()))) {
                    setError("Select a business activity to continue.");
                    return;
                  }
                  setError("");
                  setStep(step + 1);
                }}
                className="btn-primary"
              >
                Continue
              </button>
            )}
            {step === 4 && (
              <button onClick={createProject} className="btn-primary">
                Create project and continue
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
