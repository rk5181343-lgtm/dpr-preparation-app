/* 
 * Implementation Schedule - DPR Preparation Application
 * Screen 13: Implementation Schedule
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → Cash Flow → Break-Even → Balance Sheet → Implementation Schedule → ... 
 * 
 * Integrates with:
   - Balance Sheet: Fixed assets, loan outstanding, capital structure
   - Break-Even Report: Sensitivity analysis results
   - Document Submission: Compliance verified, documents uploaded
   - Dashboard: Project selection and navigation
 * 
 * Per SRS Section 12 and Screen 13 Requirements:
   - Editable table with standard stages
   - Stage name (dropdown with standard stages)
   - Description (optional text)
   - Start week (mandatory, integer, ≥1)
   - End week (mandatory, integer, >Start week)
   - Responsible person (optional)
   - Status (mandatory, dropdown: Not Started/In Progress/Completed/Delayed)
   - Dependencies (optional, link to other stages)
   - Standard stages populated from PDF:
     1. Quotations inspection and customer enquiries (Weeks 1-2)
     2. Bank appraisal and sanction (Subject to lender processing)
     3. Promoter contribution and asset purchase (After sanction)
     4. Insurance commissioning and operator engagement (Within 2 weeks after purchase)
     5. Commercial operation and billing (After equipment readiness)
 */

"use client";

import { useState, useEffect } from "react";
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

export default function ImplementationSchedulePage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('ca');
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // Standard stages from PDF (populated default values)
  const standardStages: Stage[] = [
    { id: 1, name: "Quotations inspection and customer enquiries", description: "Initial customer enquiries and quotation requests", startWeek: 1, endWeek: 2, status: "Not Started", responsible: "", dependencies: "" },
    { id: 2, name: "Bank appraisal and sanction", description: "Subject to lender processing and approval", startWeek: 3, endWeek: 8, status: "Not Started", responsible: "", dependencies: "1" },
    { id: 3, name: "Promoter contribution and asset purchase", description: "After sanction, promoter contribution and used asset purchase", startWeek: 9, endWeek: 12, status: "Not Started", responsible: "", dependencies: "2" },
    { id: 4, name: "Insurance commissioning and operator engagement", description: "Within 2 weeks after purchase, insurance commissioning and operator engagement", startWeek: 13, endWeek: 14, status: "Not Started", responsible: "", dependencies: "3" },
    { id: 5, name: "Commercial operation and billing", description: "After equipment readiness, start billing customers", startWeek: 15, endWeek: 20, status: "Not Started", responsible: "", dependencies: "4" }
  ];

  // Stage status options
  const statusOptions = ["Not Started", "In Progress", "Completed", "Delayed"];

  // Handle stage status change
  const handleStatusChange = (stageId: number, newStatus: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId ? { ...stage, status: newStatus } : stage
    ));
  };

  // Add new stage
  const [newStage, setNewStage] = useState<{ name: string; description: string; startWeek: number; endWeek: number; responsible: string; dependencies: string }>({ name: "", description: "", startWeek: 1, endWeek: 2, responsible: "", dependencies: "" });
  const addStage = () => {
    const nextId = standardStages.length + 1;
    setStages(prev => [...prev, { ...newStage, id: nextId, status: "Not Started" }]);
    setNewStage({ name: "", description: "", startWeek: 1, endWeek: 2, responsible: "", dependencies: "" });
  };

  // Remove stage
  const removeStage = (stageId: number) => {
    setStages(prev => prev.filter(stage => stage.id !== stageId));
  };

  // Save stages
  const handleSave = () => {
    // Implementation schedule saved; persists to localStorage or would integrate with API
    localStorage.setItem("implementationSchedule", JSON.stringify(stages));
    // All screens are available
    if (userType === 'applicant') {
      router.push("/document-management");
    } else {
      router.push("/document-management");
    }
  };

  // Load stages from localStorage after mount (not during prerender)
  const [stages, setStages] = useState<Stage[]>(standardStages);

  useEffect(() => {
    const stored = localStorage.getItem("implementationSchedule");
    if (stored) {
      try {
        setStages(JSON.parse(stored) as Stage[]);
      } catch {
        // Ignore malformed saved data and keep PDF defaults
      }
    }
  }, []);

  useEffect(() => {
    // Sync updated stages to localStorage
    localStorage.setItem("implementationSchedule", JSON.stringify(stages));
  }, [stages]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const completedCount = stages.filter((stage) => stage.status === "Completed").length;
  const inProgressCount = stages.filter((stage) => stage.status === "In Progress").length;
  const totalCount = stages.length;

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
            <h2 className="font-semibold text-secondary text-lg">Implementation Schedule</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-sm">DPR Workspace</span>
          <button
            onClick={() => {
              localStorage.removeItem("dpr_user_type");
              localStorage.removeItem("dpr_user_id");
              router.push("/login");
            }}
            className="text-primary text-sm font-medium underline"
          >
            Home
          </button>
        </div>
      </header>
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Stages Table */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Project Implementation Stages</h3>
            <p className="text-zinc-500 text-sm mb-4">
              Standard project stages populated from PDF. Edit stage details, timing, and status as needed.
            </p>
            
            <div className="card p-4 mb-4">
              <h4 className="font-medium text-secondary mb-3">Standard Stages (from PDF)</h4>
              <ol className="space-y-2 text-sm">
                <li>
                  <strong>1. Quotations inspection and customer enquiries</strong> (Weeks 1-2): Initial customer enquiries and quotation requests
                </li>
                <li>
                  <strong>2. Bank appraisal and sanction</strong> (Weeks 3-8): Subject to lender processing and approval
                </li>
                <li>
                  <strong>3. Promoter contribution and asset purchase</strong> (Weeks 9-12): After sanction, promoter contribution and used asset purchase
                </li>
                <li>
                  <strong>4. Insurance commissioning and operator engagement</strong> (Weeks 13-14): Within 2 weeks after purchase, insurance commissioning and operator engagement
                </li>
                <li>
                  <strong>5. Commercial operation and billing</strong> (Weeks 15-20): After equipment readiness, start billing customers
                </li>
              </ol>
            </div>
            
            {/* Editable Stages Table */}
            <div className="overflow-x-auto">
              <table className="w-full rounded-border overflow-hidden">
                <thead>
                  <tr className="bg-primary/10 border-b border-zinc-200">
                    <th className="p-3 text-left text-secondary font-medium">#</th>
                    <th className="p-3 text-left text-secondary font-medium">Stage Name</th>
                    <th className="p-3 text-left text-secondary font-medium">Description</th>
                    <th className="p-3 text-left text-secondary font-medium">Start Week</th>
                    <th className="p-3 text-left text-secondary font-medium">End Week</th>
                    <th className="p-3 text-left text-secondary font-medium">Status</th>
                    <th className="p-3 text-left text-secondary font-medium">Responsible</th>
                    <th className="p-3 text-left text-secondary font-medium">Dependencies</th>
                    <th className="p-3 text-left text-secondary font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stage, i) => (
                    <tr key={stage.id} className="border-b border-zinc-200">
                      <td className="p-3 font-medium">{stage.id}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, name: e.target.value } : s))}
                          className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </td>
                      <td className="p-3">
                        <textarea
                          value={stage.description || ""}
                          onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, description: e.target.value } : s))}
                          className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                          rows={2}
                        />{" "}
                        {stage.description || "(no description)"}
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={stage.startWeek || 1}
                          onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, startWeek: Number(e.target.value) } : s))}
                          className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          min={1}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={stage.endWeek || 2}
                          onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, endWeek: Number(e.target.value) } : s))}
                          className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          min={1}
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={stage.status || "Not Started"}
                          onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, status: e.target.value } : s))}
                          className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Delayed">Delayed</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={stage.responsible || ""}
                          onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, responsible: e.target.value } : s))}
                          className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={stage.dependencies || ""}
                          onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, dependencies: e.target.value } : s))}
                          className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => removeStage(stage.id)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add New Stage Form */}
            <div className="mt-4 p-3 rounded-md bg-primary/10 border-primary">
              <h4 className="font-medium text-secondary mb-2">Add New Stage</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-secondary">Stage Name</label>
                  <input
                    type="text"
                    value={newStage.name}
                    onChange={(e) => setNewStage(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Site preparation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary">Start Week</label>
                  <input
                    type="number"
                    value={newStage.startWeek}
                    onChange={(e) => setNewStage(prev => ({ ...prev, startWeek: Number(e.target.value) }))}
                    className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    min={1}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary">End Week</label>
                  <input
                    type="number"
                    value={newStage.endWeek}
                    onChange={(e) => setNewStage(prev => ({ ...prev, endWeek: Number(e.target.value) }))}
                    className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    min={1}
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary">Dependencies</label>
                  <input
                    type="text"
                    value={newStage.dependencies}
                    onChange={(e) => setNewStage(prev => ({ ...prev, dependencies: e.target.value }))}
                    className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., 1,3 (comma-separated)"
                  />
                </div>
              </div>
              <button
                onClick={addStage}
                className="btn-primary w-full mt-2 py-2"
              >
                Add Stage
              </button>
            </div>
          </div>

          {/* Stage Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Schedule Summary</h3>
            <p className="text-zinc-500 text-sm mb-3">
              Total stages: {stages.length} out of 5 standard stages.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {stages.map((stage) => (
                <div key={stage.id} className={stage.status === 'Completed' ? 'p-3 rounded-md bg-green-100' : stage.status === 'In Progress' ? 'p-3 rounded-md bg-primary/10' : 'p-3 rounded-md bg-zinc-100'}>
                  <p className="font-medium text-secondary">{stage.name}</p>
                  <p className="text-xs text-zinc-500">Weeks {stage.startWeek}-{stage.endWeek} | {stage.status}</p>
                  {stage.dependencies && <p className="text-xs text-zinc-500 mt-1">Dep: {stage.dependencies}</p>}
                </div>
              ))}
            </div>
            
            {/* Completion status */}
            <div className={completedCount === totalCount ? 'mt-3 p-2 rounded-md bg-green-100 border border-green-500' : 'mt-3 p-2 rounded-md bg-primary/10 border border-primary'}>
              <p className="font-medium text-secondary">Progress: {completedCount}/{totalCount} stages completed</p>
              {inProgressCount > 0 && <p className="text-xs text-zinc-500">{inProgressCount} stage(s) in progress</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              {userType === 'applicant' ? 'Save & Continue' : 'Save & Continue'}
            </button>
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}