/* 
 * Risk Assessment - DPR Preparation Application
 * Screen 15: Risk Assessment
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → Cash Flow → Break-Even → Balance Sheet → Implementation Schedule → Document Management → Risk Assessment → ... 
 * 
 * Integrates with:
   - Implementation Schedule: Risk timing relates to project stages
   - Document Management: Verified documents reduce certain risks
   - Dashboard: Project selection and navigation
 * 
 * Per SRS Section 14 and Screen 15 Requirements:
   - Risk Matrix pre-populated from PDF with 5 principal risks
   - Risk categories with description, impact level, mitigation strategy
   - Status: Not Identified / Identified / Mitigated / Resolved
   - Risk summary report with prioritized actions
   - Risk categories from PDF:
     1. Equipment condition: Mechanic's inspection, repair estimate, preventive servicing reserves
     2. Demand and collection: Written work orders, customer fuel/transport terms, prompt invoicing
     3. Operating safety: Competent operator, maintained insurance, site condition inspection
     4. Funding: Monthly cash flow review, drawings within available cash
     5. Budget overrun: Revise project and funding plan before committing to assets above budget
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RiskAssessmentPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('ca');
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // Risk matrix pre-populated from PDF (SRS Section 14)
  type Risk = {
    id: number;
    category: string;
    description: string;
    impactLevel: string;
    mitigation: string;
    status: string;
  };

  const initialRisks: Risk[] = [
    {
      id: 1,
      category: "Equipment condition",
      description: "Risk: Equipment condition - used machinery may have hidden defects, wear issues, or insufficient maintenance history",
      impactLevel: "Not Identified",
      mitigation: "Mechanic's inspection, repair estimate, preventive servicing reserves",
      status: "Not Identified"
    },
    {
      id: 2,
      category: "Demand and collection",
      description: "Risk: Demand and collection - delayed customer payments, fuel/transport disputes, unreliable work orders",
      impactLevel: "Not Identified",
      mitigation: "Written work orders, customer fuel/transport terms, prompt invoicing",
      status: "Not Identified"
    },
    {
      id: 3,
      category: "Operating safety",
      description: "Risk: Operating safety - competent operator, maintained insurance, site condition inspection",
      impactLevel: "Not Identified",
      mitigation: "Competent operator, maintained insurance, site condition inspection",
      status: "Not Identified"
    },
    {
      id: 4,
      category: "Funding",
      description: "Risk: Funding - monthly cash flow insufficient, drawings exceed available cash, seasonal variability",
      impactLevel: "Not Identified",
      mitigation: "Monthly cash flow review, drawings within available cash",
      status: "Not Identified"
    },
    {
      id: 5,
      category: "Budget overrun",
      description: "Risk: Budget overrun - committing to assets above budget, revised project and funding plan needed",
      impactLevel: "Not Identified",
      mitigation: "Revise project and funding plan before committing to assets above budget",
      status: "Not Identified"
    }
  ];

  const statusOptions = ["Not Identified", "Identified", "Mitigated", "Resolved"];
  const impactLevels = ["Low", "Medium", "High"];

  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  const [selectedRiskId, setSelectedRiskId] = useState<number | null>(null);

  // Handle status change
  const handleStatusChange = (riskId: number, newStatus: string) => {
    setRisks(prev => prev.map(risk => 
      risk.id === riskId ? { ...risk, status: newStatus as typeof risk.status } : risk
    ));
  };

  // Handle impact level change
  const handleImpactChange = (riskId: number, newImpact: string) => {
    setRisks(prev => prev.map(risk => 
      risk.id === riskId ? { ...risk, impactLevel: newImpact as typeof risk.impactLevel } : risk
    ));
  };

  // Remove risk (only for CA firms - but we'll keep it simple)
  const removeRisk = (riskId: number) => {
    setRisks(prev => prev.filter(risk => risk.id !== riskId));
  };

  // Generate risk summary report
  const generateReport = () => {
    const identifiedRisks = risks.filter(r => r.status === "Identified");
    const mitigatedRisks = risks.filter(r => r.status === "Mitigated");
    const resolvedRisks = risks.filter(r => r.status === "Resolved");
    
    const priorityActions = risks
      .filter(r => r.status === "Not Identified" || r.status === "Identified")
      .map(r => ({
        category: r.category,
        description: r.description,
        suggestedAction: r.mitigation,
        priority: r.impactLevel
      }));

    // Store report in localStorage for cross-module access
    const report = {
      generatedAt: new Date().toISOString(),
      totalRisks: risks.length,
      identifiedRisks: identifiedRisks.length,
      mitigatedRisks: mitigatedRisks.length,
      resolvedRisks: resolvedRisks.length,
      priorityActions: priorityActions,
      riskDetails: risks.map(r => ({
        category: r.category,
        status: r.status,
        impactLevel: r.impactLevel,
        description: r.description,
        mitigation: r.mitigation
      }))
    };
    
    localStorage.setItem("riskAssessmentReport", JSON.stringify(report));
    
    // Navigate based on user type
    if (userType === 'applicant') {
      router.push("/conclusion");
    } else {
      router.push("/conclusion");
    }
  };

  // Back handler
  const handleBack = () => {
    router.push('/document-management');
  };

  // Compute summary stats
  const identifiedCount = risks.filter(r => r.status === "Identified").length;
  const mitigatedCount = risks.filter(r => r.status === "Mitigated").length;
  const resolvedCount = risks.filter(r => r.status === "Resolved").length;

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
            <h2 className="font-semibold text-secondary text-lg">Risk Assessment</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-sm">Welcome, {userType === 'ca' ? 'CA Firm' : 'Applicant'}</span>
          <button
            onClick={() => {
              localStorage.removeItem("dpr_user_type");
              localStorage.removeItem("dpr_user_id");
              router.push("/login");
            }}
            className="text-primary text-sm font-medium underline"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Risk Summary Statistics */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Risk Assessment Summary</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-md bg-primary/10 border-primary">
                <p className="font-medium text-secondary">Total Risks</p>
                <p className="text-2xl font-bold text-primary">{risks.length}</p>
              </div>
              <div className={identifiedCount > 0 ? 'p-3 rounded-md bg-primary/10 border border-primary' : 'p-3 rounded-md bg-zinc-100 border border-zinc-300'}>
                <p className="font-medium text-secondary">Identified</p>
                <p className={identifiedCount > 0 ? 'text-2xl font-bold text-primary' : 'text-2xl font-bold text-zinc-400'}>
                  {identifiedCount}
                </p>
              </div>
              <div className={mitigatedCount > 0 ? 'p-3 rounded-md bg-primary/10 border border-primary' : 'p-3 rounded-md bg-zinc-100 border border-zinc-300'}>
                <p className="font-medium text-secondary">Mitigated</p>
                <p className={mitigatedCount > 0 ? 'text-2xl font-bold text-primary' : 'text-2xl font-bold text-zinc-400'}>
                  {mitigatedCount}
                </p>
              </div>
            </div>
            <div className={resolvedCount > 0 ? 'p-3 rounded-md bg-green-100 border border-green-500' : 'p-3 rounded-md bg-zinc-100 border border-zinc-300'}>
              <p className="font-medium text-secondary">Resolved</p>
              <p className={resolvedCount > 0 ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-zinc-400'}>
                {resolvedCount}
              </p>
            </div>
          </div>

          {/* Risk Matrix Table */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Risk Matrix</h3>
            <p className="text-zinc-500 text-sm">
              5 principal risks from PDF analysis. Select a risk to edit status and impact level.
            </p>
            
            <table className="w-full rounded-border overflow-hidden">
              <thead>
                <tr className="bg-primary/10 border-b border-zinc-200">
                  <th className="p-3 text-left text-secondary font-medium">#</th>
                  <th className="p-3 text-left text-secondary font-medium">Risk Category</th>
                  <th className="p-3 text-left text-secondary font-medium">Description</th>
                  <th className="p-3 text-left text-secondary font-medium">Impact Level</th>
                  <th className="p-3 text-left text-secondary font-medium">Status</th>
                  <th className="p-3 text-left text-secondary font-medium">Mitigation Strategy</th>
                  <th className="p-3 text-left text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk.id} className="border-b border-zinc-200">
                    <td className="p-3 font-medium">{risk.id}</td>
                    <td className="p-3 font-medium text-secondary">{risk.category}</td>
                    <td className="p-3 truncate">{risk.description}</td>
                    <td className="p-3">
                      <select
                        value={risk.impactLevel}
                        onChange={(e) => handleImpactChange(risk.id, e.target.value)}
                        className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={risk.status}
                        onChange={(e) => handleStatusChange(risk.id, e.target.value)}
                        className="w-full rounded border-primary px-2 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Not Identified">Not Identified</option>
                        <option value="Identified">Identified</option>
                        <option value="Mitigated">Mitigated</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="p-3 truncate">{risk.mitigation}</td>
                    <td className="p-3">
                      {userType === 'ca' ? (
                        <button
                          onClick={() => removeRisk(risk.id)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-zinc-400 text-xs">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add New Risk (CA firms only) */}
            {userType === 'ca' && (
              <div className="mt-4 p-3 rounded-md bg-primary/10 border-primary">
                <h4 className="font-medium text-secondary mb-2">Add Custom Risk</h4>
                <p className="text-sm text-zinc-500">Only available for CA firms.</p>
              </div>
            )}

            {/* Risk Priority Actions */}
            {identifiedCount > 0 && (
              <div className="mt-4 p-3 rounded-md bg-primary/10 border-primary">
                <h4 className="font-medium text-secondary mb-2">Priority Actions</h4>
                <p className="text-sm text-zinc-500">
                  {identifiedCount} risk(s) identified requiring attention:
                </p>
                <ul className="text-sm space-y-1">
                  {risks
                    .filter(r => r.status === "Not Identified" || r.status === "Identified")
                    .map((risk, i) => (
                      <li key={risk.id} className="text-xs">
                        <strong>{risk.category}:</strong> {risk.status === "Not Identified" ? "Add mitigation" : "Review mitigation"} - {risk.impactLevel} impact
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* Generate Risk Report */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-secondary font-medium mb-4">Risk Summary Report</h3>
            <p className="text-zinc-500 text-sm mb-4">
              Generated risk assessment report with prioritized actions for CA review.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="font-medium text-secondary">Total Risks</p>
                <p className="text-2xl font-bold text-primary">{risks.length}</p>
                <p className="text-zinc-500 text-xs">5 principal risks from PDF analysis</p>
              </div>
              <div>
                <p className="font-medium text-secondary">Identified</p>
                <p className={identifiedCount > 0 ? 'text-2xl font-bold text-primary' : 'text-2xl font-bold text-zinc-400'}>
                  {identifiedCount}
                </p>
                <p className="text-zinc-500 text-xs">require attention</p>
              </div>
            </div>
            
            <p className="text-sm text-zinc-500 mt-2">
              Report saved to localStorage. Priority actions focus on risks with "Not Identified" or "Identified" status.
            </p>
            
            <button
              onClick={generateReport}
              className="btn-primary w-full py-3 rounded-md font-medium text-lg transition-colors hover:bg-[#2d3a6e]"
            >
              Generate Risk Summary Report
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              Back to Document Management
            </button>
            <button
              onClick={generateReport}
              className="btn-primary"
            >
              {identifiedCount > 0 ? 'Generate Report' : 'No Risks Identified'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}