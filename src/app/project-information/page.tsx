/*
 * What this DPR needs - eight financial items, no jargon.
 * Each item can be typed in, evidenced by an upload, or filled with a clearly
 * labelled app estimate. Personal and KYC details are never estimated.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEssentials } from "@/lib/essentials";
import { loadCurrentProject, upsertProject, type Project } from "@/lib/project-store";

const field = "w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20";
const money = (value: number) => value.toLocaleString("en-IN");

export default function ProjectInformationPage() {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [estimated, setEstimated] = useState<string[]>([]);
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const current = loadCurrentProject();
    if (current) {
      setProject(current);
      setValues(current.answers ?? {});
      setEstimated(current.estimated ?? []);
      setUploads(current.uploads ?? {});
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <div className="min-h-screen bg-zinc-50 p-6 text-sm text-zinc-500">Opening your project…</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-secondary font-medium text-lg mb-2">No project open</h2>
            <p className="text-sm text-zinc-600 mb-4">Start by choosing your industry and business.</p>
            <button onClick={() => router.push("/project-creation")} className="btn-primary">
              Choose industry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const items = getEssentials(project.activityId);
  const groups = Array.from(new Set(items.map((item) => item.group)));
  const resolved = items.filter((item) => (values[item.id] ?? "").trim() !== "" || uploads[item.id]).length;
  const progress = Math.round((resolved / items.length) * 100);

  const setValue = (id: string, next: string) => {
    setValues((previous) => ({ ...previous, [id]: next }));
    setEstimated((previous) => previous.filter((entry) => entry !== id));
  };

  const useEstimate = (id: string, estimate: number) => {
    setValues((previous) => ({ ...previous, [id]: String(estimate) }));
    setEstimated((previous) => (previous.includes(id) ? previous : [...previous, id]));
  };

  const save = (goNext: boolean) => {
    const next: Project = {
      ...project,
      answers: values,
      estimated,
      uploads,
      progress,
      status: progress === 100 ? "completed" : "in_progress",
    };
    upsertProject(next);
    setProject(next);
    setMessage("Saved.");
    if (goNext) router.push("/document-submission");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">DPR</span>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">{project.name}</h2>
            <p className="text-zinc-500 text-sm">{project.activityName}</p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-primary text-sm font-medium underline">
          My projects
        </button>
      </header>

      <main className="p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-secondary font-medium text-lg mb-1">What this DPR needs</h3>
            <p className="text-sm text-zinc-600 mb-3">
              Eight money figures are enough to start. For each one you can type the number, attach the paper, or tap{" "}
              <span className="font-medium">Use app estimate</span> and let us fill a starting figure for you.
            </p>
            <div className="rounded-md bg-accent/10 border border-accent/40 px-4 py-3 text-sm text-[#8a5a00] mb-4">
              App estimates cover money figures only. Names, PAN, Aadhaar, address and experience are never invented — you
              enter those yourself in the document step.
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-zinc-600">
                {resolved} of {items.length} ready
              </span>
              <span className="text-primary font-medium">{progress}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </section>

          {groups.map((group) => (
            <section key={group} className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-secondary font-medium mb-4">{group}</h4>
              <div className="space-y-4">
                {items
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const value = values[item.id] ?? "";
                    const isEstimated = estimated.includes(item.id);
                    const uploaded = uploads[item.id];
                    const status = !value && !uploaded ? "Not set" : isEstimated ? "App estimate" : value ? "Your value" : "Document attached";
                    const statusStyle =
                      status === "Not set"
                        ? "bg-zinc-100 text-zinc-600"
                        : status === "App estimate"
                          ? "bg-accent/15 text-[#8a5a00]"
                          : "bg-primary/10 text-primary";
                    return (
                      <div key={item.id} className="rounded-md border border-zinc-200 p-4">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <p className="font-medium text-secondary text-sm">
                            {item.label} <span className="text-zinc-400 font-normal">({item.unit})</span>
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusStyle}`}>{status}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">{item.why}</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            className={field}
                            inputMode="decimal"
                            value={value}
                            placeholder={`Not set — app estimate ${money(item.estimate)}`}
                            onChange={(event) => setValue(item.id, event.target.value)}
                          />
                          <button onClick={() => useEstimate(item.id, item.estimate)} className="btn-secondary whitespace-nowrap">
                            Use app estimate
                          </button>
                        </div>
                        <div className="mt-2">
                          <label className="block text-xs text-zinc-500 mb-1">
                            Have the {item.docLabel}? Attach it instead (optional)
                          </label>
                          <input
                            type="file"
                            className="w-full text-xs"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              setUploads((previous) => ({ ...previous, [item.id]: file.name }));
                            }}
                          />
                          {uploaded && <p className="text-xs text-primary mt-1">Attached: {uploaded}</p>}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}

          <section className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-secondary font-medium mb-2">Personal details — you fill these</h4>
            <p className="text-sm text-zinc-600">
              Promoter name, PAN, Aadhaar, address and past experience must come from you or your documents. The app will not
              create or guess them.
            </p>
          </section>

          {message && <p className="text-sm text-primary">{message}</p>}

          <div className="flex flex-wrap gap-3 pb-8">
            <button onClick={() => save(true)} className="btn-primary">
              Save &amp; continue to documents
            </button>
            <button onClick={() => save(false)} className="btn-secondary">
              Save
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-secondary">
              My projects
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
