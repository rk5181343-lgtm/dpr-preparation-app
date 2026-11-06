/* 
 * Break-Even & Sensitivity Analysis Report - DPR Preparation Application
 * Screen 12: Report Generation (Break-Even & Sensitivity)
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → Cash Flow → Break-Even → Break-Even Report → ... 
 * 
 * Integrates with:
   - Break-Even: Accounting (141 days) and Cash (164 days) break-even calculations
   - Sensitivity: Base case, -20% rental income, +20% operating expenses, both adverse
   - Balance Sheet: 5-year projections, asset/liability validation
   - Dashboard: Project selection and navigation
 * 
 * Per DPR SRS Section 11 and Report Generation Requirements:
   - Base case results: Revenue, Net Profit, DSCR
   - Scenario 1: Rental income 20% lower
   - Scenario 2: Operating expenses 20% higher
   - Scenario 3: Both adverse conditions
   - Custom scenario (user-defined)
   - Graphs: Revenue trends (5 years), DSCR trends (5 years), Cash balance trends (5 years)
   - Report generation: PDF with professional formatting
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BreakEvenReportPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('ca');
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // Base case data from prior modules
  const baseDailyRate = 6000; // Rs. per day
  const baseUtilisation = 216; // billable days Year 1
  const baseOperatingExpenses = 5.37; // Rs. lakh Year 1
  const baseRentalIncome = 12.96; // Rs. lakh Year 1
  const baseEBITDA = 7.59; // Rs. lakh Year 1
  const baseNetProfit = 4.07; // Rs. lakh Year 1 (after tax reserve)
  const baseDSCR = 2.67; // Year 1 DSCR
  
  // 5-year rental income (with 5% annual escalation)
  const rentalIncome5yr = [12.96, 14.36, 15.88, 17.50, 19.25];
  
  // 5-year operating expenses (with 8% repairs escalation, 5% other expenses escalation)
  const operatingExpenses5yr = [5.37, 5.83, 6.33, 6.87, 7.45];
  
  // 5-year DSCR (from Loan Repayment module)
  const dscr5yr = [2.67, 3.03, 3.41, 3.82, 4.27];
  
  // 5-year cash balance (from Cash Flow module)
  const cashBalance5yr = [3.59, 6.99, 11.30, 16.62, 23.02];
  
  // Sensitivity scenario results (from PDF Table 11 analysis)
  const sensitivityScenarios = [
    {
      id: 1,
      name: "Base Case",
      description: "Current assumptions - no modifications",
      rentalIncomeMod: 0,
      operatingExpenseMod: 0,
      revenue: baseRentalIncome,
      expenses: baseOperatingExpenses,
      netProfit: baseNetProfit,
      dscr: baseDSCR,
      color: "primary"
    },
    {
      id: 2,
      name: "Rental Income 20% Lower",
      description: "Revenue stressed; operating costs unchanged",
      rentalIncomeMod: -20,
      operatingExpenseMod: 0,
      revenue: (baseRentalIncome * 0.80).toFixed(2),
      expenses: baseOperatingExpenses,
      netProfit: ((baseRentalIncome * 0.80) - baseOperatingExpenses).toFixed(2),
      dscr: (baseDSCR * 0.80).toFixed(2),
      color: "secondary"
    },
    {
      id: 3,
      name: "Operating Expenses 20% Higher",
      description: "Costs increased; revenue unchanged",
      rentalIncomeMod: 0,
      operatingExpenseMod: 20,
      revenue: baseRentalIncome,
      expenses: (baseOperatingExpenses * 1.20).toFixed(2),
      netProfit: (baseRentalIncome - baseOperatingExpenses * 1.20).toFixed(2),
      dscr: (baseDSCR / 1.20).toFixed(2),
      color: "warning"
    },
    {
      id: 4,
      name: "Both Adverse Conditions",
      description: "Revenue lower + expenses higher simultaneously",
      rentalIncomeMod: -20,
      operatingExpenseMod: 20,
      revenue: (baseRentalIncome * 0.80).toFixed(2),
      expenses: (baseOperatingExpenses * 1.20).toFixed(2),
      netProfit: ((baseRentalIncome * 0.80) - baseOperatingExpenses * 1.20).toFixed(2),
      dscr: (baseDSCR * 0.80 / 1.20).toFixed(2),
      color: "error"
    }
  ];

  // Graph data points (5 years)
  const graphData = {
    years: [1, 2, 3, 4, 5],
    revenue: rentalIncome5yr,
    expenses: operatingExpenses5yr,
    dscr: dscr5yr,
    cash: cashBalance5yr
  };

  const handleGenerateReport = () => {
    // Generate break-even and sensitivity report
    // Applicants limited to screens 1-17, CA firms to all 18
    if (userType === 'applicant') {
      router.push("/implementation-schedule");
    } else {
      router.push("/implementation-schedule");
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

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
            <h2 className="font-semibold text-secondary text-lg">Break-Even & Sensitivity Report</h2>
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
          {/* Report Summary Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Break-Even & Sensitivity Analysis Report</h3>
            
            <p className="text-zinc-500 text-sm mb-4">
              This report presents the break-even analysis and sensitivity scenarios for the earthmoving equipment rental MUDRA Tarun project, based on assumptions from the Detailed Project Report.
            </p>
            
            {/* Base Case Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-secondary">Base Case</h4>
                <p className="text-2xl font-bold text-primary">Revenue: Rs. {baseRentalIncome.toLocaleString()} lakh</p>
                <p className="text-2xl font-bold text-success">Net Profit: Rs. {baseNetProfit.toLocaleString()} lakh</p>
                <p className="text-2xl font-bold text-primary">DSCR: {baseDSCR.toFixed(2)}x</p>
                <p className="text-zinc-500 text-xs">Utilisation: {baseUtilisation} billable days</p>
              </div>
              <div>
                <h4 className="font-medium text-secondary">Accounting Break-Even</h4>
                <p className="text-lg">141 billable days</p>
                <p className="text-lg">Revenue equivalent: Rs. 8.44 lakh</p>
                <p className="text-zinc-500 text-xs">Conservative utilisation test</p>
              </div>
            </div>
            
            {/* Cash Break-Even */}
            <div className="mt-4 p-3 rounded-md bg-primary/10 border-primary">
              <p className="font-medium text-secondary mb-2">Cash Break-Even</p>
              <p className="text-2xl font-bold text-primary">164 billable days</p>
              <p className="text-lg">Revenue equivalent: Rs. 9.84 lakh</p>
              <p className="text-zinc-500 text-xs">Includes debt instalments and owner drawings, before tax reserve and receivable movements</p>
            </div>
          </div>

          {/* Sensitivity Scenarios */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Sensitivity Scenarios</h3>
            <p className="text-zinc-500 text-sm mb-4">
              Four scenarios showing how DSCR and net profit change under different conditions.
            </p>
            
            <table className="w-full rounded-border overflow-hidden">
              <thead>
                <tr className="bg-primary/10 border-b border-zinc-200">
                  <th className="p-3 text-left text-secondary font-medium">Scenario</th>
                  <th className="p-3 text-left text-secondary font-medium">Revenue (Rs. lakh)</th>
                  <th className="p-3 text-left text-secondary font-medium">Net Profit (Rs. lakh)</th>
                  <th className="p-3 text-left text-secondary font-medium">DSCR (times)</th>
                  <th className="p-3 text-left text-secondary font-medium">Meets MUDRA Minimum</th>
                </tr>
              </thead>
              <tbody>
                {sensitivityScenarios.map((scenario) => (
                  <tr key={scenario.id} className={scenario.id === 1 ? 'bg-primary/10' : ''}>
                    <td className={`p-3 font-medium text-secondary ${scenario.color}`}>
                      {scenario.name}
                    </td>
                    <td className="p-3">{Number(scenario.revenue).toFixed(2)}</td>
                    <td className="p-3">{Number(scenario.netProfit).toFixed(2)}</td>
                    <td className="p-3">{Number(scenario.dscr).toFixed(2)}x</td>
                    <td className="p-3">
                      {Number(scenario.dscr) >= 2.0 ? '✅ Yes' : '❌ No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <p className="text-zinc-500 text-xs mt-3">
              PDF references: "Rental income 20% lower" and "Operating expenses 20% higher" and "Both adverse conditions" from Table 11 of the SRS.
            </p>
          </div>

          {/* Graphs Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Key Trends (5-Year)</h3>
            <p className="text-zinc-500 text-sm mb-3">
              The following trends illustrate business performance across the 5-year projection period.
            </p>
            
            {/* Simple text-based trend display since we're in a screen format */}
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-bold text-secondary">Revenue Trend:</span> Grows from Rs. 12.96 lakh (Year 1) to Rs. 19.25 lakh (Year 5) at 5% annual escalation. Total growth: 48.5% over 5 years.
              </li>
              <li>
                <span className="font-bold text-secondary">DSCR Trend:</span> Improves from 2.67x (Year 1) to 4.27x (Year 5). Year 1 at MUDRA minimum; subsequent years comfortably above 2.0x threshold.
              </li>
              <li>
                <span className="font-bold text-secondary">Cash Balance Trend:</span> Grows from Rs. 3.59 lakh (Year 1) to Rs. 23.02 lakh (Year 5). Cumulative wealth creation through profitable operations and debt amortization.
              </li>
              <li>
                <span className="font-bold text-secondary">Expense Trend:</span> Operating expenses grow from Rs. 5.37 lakh (Year 1) to Rs. 7.45 lakh (Year 5), reflecting 8% repairs escalation and 5% other expenses escalation annually.
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleGenerateReport}
              className="btn-primary"
            >
              {userType === 'applicant' ? 'Proceed to CA Review Workflow' : 'Generate Full DPR Report'}
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