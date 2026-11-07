/*
 * Project Information - dynamic form engine.
 * Renders the questions configured for the selected business activity, with
 * per-section grouping, required-field validation and draft saving.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getActivityConfig, type Question } from "@/lib/activity-config";
import { calculateProgress, loadCurrentProject, upsertProject, type Project } from "@/lib/project-store";

const field = "w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ProjectInformationPage() {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    const current = loadCurrentProject();
    if (current) {
      setProject(current);
      setAnswers(current.answers ?? {});
    }
    setLoaded(true);
  }, []);

  const config = useMemo(
    () => (project ? getActivityConfig(project.activityId, project.activityName) : null),
    [project]
  );

  const isVisible = (question: Question) =>
    !question.showIf || answers[question.showIf.questionId] === question.showIf.equals;

  const visibleQuestions = config ? config.questions.filter(isVisible) : [];
  const required = visibleQuestions.filter((question) => question.required);
  const answeredRequired = required.filter((question) => (answers[question.id] ?? "").trim() !== "").length;
  const progress = config ? calculateProgress(answers, config) : 0;

  const persist = (status: "draft" | "in_progress") => {
    if (!project || !config) return false;
    const unanswered = required.filter((question) => (answers[question.id] ?? "").trim() === "");
    if (status === "in_progress" && unanswered.length > 0) {
      setMissing(unanswered.map((question) => question.label));
      setMessage("");
      return false;
    }
    setMissing([]);
    const next: Project = {
      ...project,
      answers,
      progress: calculateProgress(answers, config),
      status,
    };
    upsertProject(next);
    setProject(next);
    setMessage(status === "draft" ? "Draft saved." : "Saved.");
    return true;
  };

  if (!loaded) {
    return <div className="min-h-screen bg-zinc-50 p-6 text-sm text-zinc-500">Loading project…</div>;
  }

  if (!project || !config) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-secondary font-medium text-lg mb-2">No project selected</h2>
            <p className="text-sm text-zinc-600 mb-4">
              Create a project first: choose the industry and business activity, and the questions below will adapt to it.
            </p>
            <button onClick={() => router.push("/project-creation")} className="btn-primary">
              Create new project
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">DPR</span>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">Project Information</h2>
            <p className="text-zinc-500 text-sm">
              {project.industryName} · {project.activityName}
            </p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-primary text-sm font-medium underline">
          Home
        </button>
      </header>

      <main className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <section className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-secondary font-medium text-lg">{project.name}</h3>
                <p className="text-sm text-zinc-500">{config.summary}</p>
              </div>
              <button onClick={() => router.push("/project-creation")} className="text-primary text-sm underline whitespace-nowrap">
                Change activity
              </button>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-zinc-600">
                {answeredRequired} of {required.length} required answers
              </span>
              <span className="text-primary font-medium">{progress}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-zinc-500 mt-2">Revenue basis for this activity: {config.revenueBasis}</p>
          </section>

          {missing.length > 0 && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              <p className="font-medium mb-1">Complete these required fields before continuing:</p>
              <ul className="list-disc pl-5">
                {missing.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </div>
          )}

          {config.sections.map((section) => {
            const questions = visibleQuestions.filter((question) => question.section === section);
            if (questions.length === 0) return null;
            return (
              <section key={section} className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="text-secondary font-medium mb-4">{section}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions.map((question) => {
                    const value = answers[question.id] ?? "";
                    const update = (next: string) => setAnswers((previous) => ({ ...previous, [question.id]: next }));
                    const wide = question.type === "textarea";
                    return (
                      <div key={question.id} className={wide ? "md:col-span-2" : ""}>
                        <label className="block text-sm font-medium text-secondary mb-1">
                          {question.label}
                          {question.required && <span className="text-red-600 ml-1">*</span>}
                          {question.unit && <span className="text-zinc-400 font-normal ml-1">({question.unit})</span>}
                        </label>
                        {question.type === "textarea" ? (
                          <textarea
                            className={field}
                            rows={3}
                            value={value}
                            placeholder={question.placeholder}
                            onChange={(event) => update(event.target.value)}
                          />
                        ) : question.type === "select" ? (
                          <select className={field} value={value} onChange={(event) => update(event.target.value)}>
                            <option value="">Select…</option>
                            {(question.options ?? []).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className={field}
                            type={question.type === "number" ? "number" : question.type === "date" ? "date" : "text"}
                            value={value}
                            placeholder={question.placeholder}
                            onChange={(event) => update(event.target.value)}
                          />
                        )}
                        {question.help && <p className="text-xs text-zinc-500 mt-1">{question.help}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {message && <p className="text-sm text-primary">{message}</p>}

          <div className="flex flex-wrap gap-3 pb-6">
            <button onClick={() => persist("draft")} className="btn-secondary">
              Save draft
            </button>
            <button
              onClick={() => {
                if (persist("in_progress")) router.push("/document-submission");
              }}
              className="btn-primary"
            >
              Save &amp; continue to documents
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
