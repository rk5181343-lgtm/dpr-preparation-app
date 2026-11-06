/*
 * Settings - DPR Preparation Application
 * Screen 18: Workspace preferences and data management.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Preferences = {
  fullName: string;
  email: string;
  phone: string;
  dprType: string;
  currency: string;
  dateFormat: string;
  dashboardProgress: string;
  autoSaveAssumptions: boolean;
  retentionMonths: string;
  autoArchive: boolean;
  weeklyBackup: boolean;
};

const DEFAULTS: Preferences = {
  fullName: "",
  email: "",
  phone: "",
  dprType: "MUDRA Tarun - Earthmoving equipment rental",
  currency: "INR (Rs.)",
  dateFormat: "DD-MM-YYYY",
  dashboardProgress: "Most advanced project",
  autoSaveAssumptions: true,
  retentionMonths: "36",
  autoArchive: true,
  weeklyBackup: false,
};

const inputClass =
  "w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/20";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("dpr_settings");
    if (stored) {
      try {
        setPrefs({ ...DEFAULTS, ...(JSON.parse(stored) as Partial<Preferences>) });
      } catch {
        // keep defaults
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("dpr_settings", JSON.stringify(prefs));
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [prefs, loaded]);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((previous) => ({ ...previous, [key]: value }));

  const clearAll = () => {
    ["dpr_settings", "implementationSchedule", "riskAssessmentReport", "dpr_document_uploaded", "dprPreviewData", "dpr_user_type", "dpr_user_id"].forEach(
      (key) => localStorage.removeItem(key)
    );
    setPrefs(DEFAULTS);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-[#1a365d] flex items-center justify-center">
            <span className="text-white text-xs font-bold">DPR</span>
          </div>
          <div>
            <h2 className="font-semibold text-[#2d3748] text-lg">Settings</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-[#1a365d]">Saved</span>}
          <button onClick={() => router.push("/dashboard")} className="text-[#1a365d] text-sm font-medium underline">
            Home
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-[#1a365d] font-semibold text-lg mb-1">Profile</h3>
            <p className="text-sm text-zinc-500 mb-4">Shown on generated reports and declarations.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2d3748] mb-1">Full name</label>
                <input className={inputClass} value={prefs.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Applicant or preparer name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3748] mb-1">Email</label>
                <input className={inputClass} type="email" value={prefs.email} onChange={(e) => update("email", e.target.value)} placeholder="name@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3748] mb-1">Phone</label>
                <input className={inputClass} value={prefs.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3748] mb-1">Default DPR type</label>
                <select className={inputClass} value={prefs.dprType} onChange={(e) => update("dprType", e.target.value)}>
                  <option>MUDRA Tarun - Earthmoving equipment rental</option>
                  <option>MUDRA Kishore - Equipment rental</option>
                  <option>MUDRA Shishu - Equipment rental</option>
                </select>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-[#1a365d] font-semibold text-lg mb-1">Preferences</h3>
            <p className="text-sm text-zinc-500 mb-4">Formatting used across projections and reports.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2d3748] mb-1">Currency</label>
                <select className={inputClass} value={prefs.currency} onChange={(e) => update("currency", e.target.value)}>
                  <option>INR (Rs.)</option>
                  <option>INR (lakh)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3748] mb-1">Date format</label>
                <select className={inputClass} value={prefs.dateFormat} onChange={(e) => update("dateFormat", e.target.value)}>
                  <option>DD-MM-YYYY</option>
                  <option>MM-DD-YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3748] mb-1">Dashboard progress</label>
                <select className={inputClass} value={prefs.dashboardProgress} onChange={(e) => update("dashboardProgress", e.target.value)}>
                  <option>Most advanced project</option>
                  <option>Average of all projects</option>
                </select>
              </div>
              <label className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={prefs.autoSaveAssumptions} onChange={(e) => update("autoSaveAssumptions", e.target.checked)} />
                <span className="text-sm text-[#2d3748]">Auto-save assumptions as they are entered</span>
              </label>
            </div>
          </section>

          {/* Data management */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-[#1a365d] font-semibold text-lg mb-1">Data management</h3>
            <p className="text-sm text-zinc-500 mb-4">This build stores project data in the browser.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2d3748] mb-1">Retention period</label>
                <select className={inputClass} value={prefs.retentionMonths} onChange={(e) => update("retentionMonths", e.target.value)}>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="60">60 months</option>
                </select>
              </div>
              <label className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={prefs.autoArchive} onChange={(e) => update("autoArchive", e.target.checked)} />
                <span className="text-sm text-[#2d3748]">Archive inactive projects</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={prefs.weeklyBackup} onChange={(e) => update("weeklyBackup", e.target.checked)} />
                <span className="text-sm text-[#2d3748]">Weekly export backup</span>
              </label>
            </div>
            <button onClick={clearAll} className="mt-5 px-4 py-2 rounded-md border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50">
              Clear saved project data
            </button>
          </section>

          {/* About */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-[#1a365d] font-semibold text-lg mb-1">About</h3>
            <p className="text-sm text-zinc-600">
              DPR Preparation System v1.0 — built on the Pradhan Mantri MUDRA Yojana project report format for
              earthmoving equipment rental proposals.
            </p>
            <ul className="text-sm text-zinc-500 mt-3 space-y-1">
              <li>18-screen preparation workflow</li>
              <li>Five-year projections, DSCR, break-even and balance sheet</li>
              <li>Document checklist and implementation schedule</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
