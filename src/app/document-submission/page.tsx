/*
 * Document Submission - checklist driven by the selected business activity.
 * The required documents come from the activity configuration, so a rice mill
 * and a hotel ask for different evidence.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActivityConfig, type RequiredDocument } from "@/lib/activity-config";
import { loadCurrentProject } from "@/lib/project-store";

const MIN_COMPLIANCE = 80;

export default function DocumentSubmissionPage() {
  const router = useRouter();
  const [activityName, setActivityName] = useState("");
  const [categories, setCategories] = useState<RequiredDocument[]>([]);
  const [storageKey, setStorageKey] = useState("dpr_uploads_default");
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "error">("info");

  useEffect(() => {
    const project = loadCurrentProject();
    const config = getActivityConfig(
      project?.activityId ?? "earthmoving-equipment-rental",
      project?.activityName
    );
    setCategories(config.documents);
    setActivityName(project?.activityName ?? config.activityName);
    const key = `dpr_uploads_${project?.id ?? "default"}`;
    setStorageKey(key);
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(parsed)) {
        setUploaded(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      setUploaded([]);
    }
  }, []);

  const persist = (next: string[]) => {
    setUploaded(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  const handleFile = (category: RequiredDocument, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!category.formats.includes(extension)) {
      setMessageTone("error");
      setMessage(`${category.name}: accepted formats are ${category.formats.join(", ").toUpperCase()}.`);
      return;
    }
    if (file.size > category.maxMb * 1024 * 1024) {
      setMessageTone("error");
      setMessage(`${category.name}: file must be under ${category.maxMb}MB.`);
      return;
    }

    persist(uploaded.includes(category.name) ? uploaded : [...uploaded, category.name]);
    setMessageTone("info");
    setMessage(`${file.name} added to ${category.name}.`);
  };

  const requiredCategories = categories.filter((category) => category.required);
  const uploadedRequired = requiredCategories.filter((category) => uploaded.includes(category.name)).length;
  const compliance = requiredCategories.length
    ? Math.round((uploadedRequired / requiredCategories.length) * 100)
    : 0;
  const meetsMinimum = compliance >= MIN_COMPLIANCE;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">DPR</span>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">Document Submission</h2>
            <p className="text-zinc-500 text-sm">{activityName || "DPR Preparation System"}</p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-primary text-sm font-medium underline">
          Home
        </button>
      </header>

      <main className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-secondary font-medium text-lg mb-3">Compliance Status</h3>
            <p className="text-sm text-zinc-500 mb-4">
              {requiredCategories.length} mandatory documents for {activityName || "this activity"}. At least{" "}
              {MIN_COMPLIANCE}% is required before the DPR can be generated.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-zinc-500">Uploaded</p>
                <p className="text-2xl font-bold text-primary">
                  {uploadedRequired} <span className="text-base font-normal text-zinc-500">of {requiredCategories.length}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Compliance</p>
                <p className="text-2xl font-bold text-primary">{compliance}%</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${compliance}%` }} />
            </div>
            <p className={`text-sm mt-2 ${meetsMinimum ? "text-primary" : "text-red-600"}`}>
              {meetsMinimum
                ? "Minimum compliance reached. Documents are ready for review."
                : `Upload ${requiredCategories.length - uploadedRequired} more mandatory document(s) to reach ${MIN_COMPLIANCE}%.`}
            </p>
          </section>

          {message && (
            <div
              className={`rounded-md px-4 py-3 text-sm ${
                messageTone === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-primary/5 text-primary border border-primary/20"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-4">
            {categories.map((category) => {
              const isUploaded = uploaded.includes(category.name);
              return (
                <section
                  key={category.name}
                  className={`bg-white rounded-lg p-5 border ${isUploaded ? "border-primary/40" : "border-zinc-200"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-secondary">
                      {category.name}
                      {category.required && <span className="text-red-600 ml-1">*</span>}
                    </h4>
                    {isUploaded ? (
                      <span className="text-primary text-sm">✓ Uploaded</span>
                    ) : (
                      <span className="text-zinc-500 text-sm">↑ Upload</span>
                    )}
                  </div>
                  <label className="block text-sm text-secondary mb-1">Select {category.name} File</label>
                  <input
                    type="file"
                    accept={category.formats.map((format) => `.${format}`).join(",")}
                    onChange={(event) => handleFile(category, event)}
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm cursor-pointer"
                  />
                  <p className="text-zinc-500 text-xs mt-1">
                    Max {category.maxMb}MB, {category.formats.map((format) => format.toUpperCase()).join("/")} formats
                  </p>
                </section>
              );
            })}
          </div>

          <div className="flex gap-3 pb-6">
            <button
              onClick={() => {
                if (!meetsMinimum) {
                  setMessageTone("error");
                  setMessage(`Minimum ${MIN_COMPLIANCE}% compliance required before continuing (currently ${compliance}%).`);
                  return;
                }
                router.push("/loan-repayment");
              }}
              className="btn-primary"
            >
              Continue to Loan Repayment
            </button>
            <button onClick={() => router.push("/project-information")} className="btn-secondary">
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
