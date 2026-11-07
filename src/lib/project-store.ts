/*
 * Project records. One project holds the industry/activity selection and the
 * answers captured by the dynamic form engine. Stored locally for this
 * single-workspace build; the Project type is the shape a database row needs.
 */

import type { ActivityConfig } from "./activity-config";

export type ProjectStatus = "draft" | "in_progress" | "completed";

export type Project = {
  id: string;
  name: string;
  clientName: string;
  industryId: string;
  industryName: string;
  activityId: string;
  activityName: string;
  projectType: string;
  purpose: string;
  answers: Record<string, string>;
  progress: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

const PROJECTS_KEY = "dpr_projects";
const CURRENT_KEY = "dpr_current_project";

function readProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Project[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string");
  } catch {
    return [];
  }
}

export function loadProjects(): Project[] {
  return readProjects().sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

export function loadProject(id: string): Project | null {
  return readProjects().find((item) => item.id === id) ?? null;
}

export function loadCurrentProject(): Project | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(CURRENT_KEY);
  if (!id) return null;
  return loadProject(id);
}

export function setCurrentProject(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_KEY, id);
}

export function createProjectId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function upsertProject(project: Project): Project {
  const all = readProjects();
  const index = all.findIndex((item) => item.id === project.id);
  const next = { ...project, updatedAt: new Date().toISOString() };
  if (index >= 0) all[index] = next;
  else all.push(next);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
  }
  return next;
}

export function calculateProgress(answers: Record<string, string>, config: ActivityConfig): number {
  const required = config.questions.filter((question) => question.required);
  if (required.length === 0) return 0;
  const answered = required.filter((question) => (answers[question.id] ?? "").trim() !== "").length;
  return Math.round((answered / required.length) * 100);
}
