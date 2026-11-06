/*
 * Client Management Page - DPR Preparation Application
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      // user type check
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white dark:bg-black border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16l-4-4 4-4m0 0l4 4-4 4m0-10l4 4-4 4m0 0l-4 4 4 4m0 6l4 4-4 4m0 0l-4-4 4-4m0 0l4-4-4-4m0 0l-4 4 4-4m0-6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">Client Management</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-sm">Welcome, DPR Workspace</span>
          <button onClick={() => router.push("/login")} className="text-primary text-sm font-medium underline">
            Home
          </button>
        </div>
      </header>
      <main className="p-6">
        <div className="mb-8">
          <h3 className="text-secondary font-medium mb-4">Search Clients</h3>
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button className="btn-primary mt-2 py-2 px-4 rounded-md font-medium text-lg transition-colors hover:bg-[#2d3a6e]">
            + Add New Client
          </button>
        </div>
        <div>
          <h3 className="text-secondary font-medium mb-4">Clients List</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <article className="rounded-lg border border-zinc-200 p-4">
              <h4 className="font-medium text-secondary">Kalicheti Vijay Kumar Reddy</h4>
              <p className="text-zinc-500 text-sm">Nellore, Andhra Pradesh</p>
            </article>
            <article className="rounded-lg border border-zinc-200 p-4">
              <h4 className="font-medium text-secondary">Arun Kumar Constructions</h4>
              <p className="text-zinc-500 text-sm">Chennai, Tamil Nadu</p>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}