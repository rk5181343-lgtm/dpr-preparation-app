/*
 * Start a DPR: pick the industry, then the exact business activity.
 * Project type and purpose default to New Project / Bank Loan DPR so a normal
 * user is never asked about options they do not care about.
 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { INDUSTRIES } from "@/lib/industry-master";
import { createProjectId, setCurrentProject, upsertProject } from "@/lib/project-store";

const field = "w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ProjectCreationPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [customActivity, setCustomActivity] = useState("");
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
  const activity = industry?.activities.find((item) => item.id === activityId);
  const activityName =
    activityId === "custom-activity" ? customActivity.trim() : activity?.name ?? "";

  const start = () => {
    if (!industry || !activityId || !activityName) {
      setError("Pick an industry and a business activity first.");
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
      projectType: "New Project",
      purpose: "Bank Loan DPR",
      answers: {},
      estimated: [],
      uploads: {},
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
            <h2 className="font-semibold text-secondary text-lg">Start a new DPR</h2>
            <p className="text-zinc-500 text-sm">Two choices: your industry, then your exact business</p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-primary text-sm font-medium underline">
          My projects
        </button>
      </header>

      <main className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-secondary font-medium text-lg mb-1">1. What industry are you in?</h3>
            <p className="text-sm text-zinc-500 mb-3">Pick the closest one. This decides the questions and documents later.</p>
            <input
              className={`${field} mb-3`}
              placeholder="Search, e.g. rice, rental, dairy, hotel"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {industries.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIndustryId(item.id);
                    setActivityId("");
                    setError("");
                  }}
                  className={`text-left rounded-md border px-4 py-3 text-sm ${
                    industryId === item.id ? "border-primary bg-primary/5 text-secondary font-medium" : "border-zinc-200 text-secondary"
                  }`}
                >
                  {item.name}
                </button>
              ))}
              {industries.length === 0 && <p className="text-sm text-zinc-500">No match. Try another word.</p>}
            </div>
          </section>

          {industry && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-secondary font-medium text-lg mb-1">2. Which business exactly?</h3>
              <p className="text-sm text-zinc-500 mb-3">{industry.name}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {industry.activities.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivityId(item.id);
                      setError("");
                    }}
                    className={`text-left rounded-md border px-4 py-3 text-sm ${
                      activityId === item.id ? "border-primary bg-primary/5 text-secondary font-medium" : "border-zinc-200 text-secondary"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              {activityId === "custom-activity" && (
                <input
                  className={`${field} mt-3`}
                  value={customActivity}
                  onChange={(event) => setCustomActivity(event.target.value)}
                  placeholder="Describe your business, e.g. coir pith processing"
                />
              )}
            </section>
          )}

          {industry && activityId && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-secondary font-medium text-lg mb-3">3. Name it (optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-secondary mb-1">Project name</label>
                  <input
                    className={field}
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder={`${activityName || "Project"} DPR`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary mb-1">Client or firm name</label>
                  <input
                    className={field}
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="Leave blank if not known yet"
                  />
                </div>
              </div>
            </section>
          )}

          {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

          <div className="flex gap-3 pb-8">
            <button onClick={start} className="btn-primary">
              Show what this DPR needs
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-secondary">
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
