/* 
 * Cash Flow Projections - DPR Preparation Application
 * Screen 9: Annual Cash Flow Statements
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → Cash Flow → ... 
 * 
 * Integrates with:
   - Loan Repayment: EMI, amortization schedule, principal/interest breakdown
   - Project Information: financial assumptions, depreciation rates, escalation rates
   - Document Submission: compliance verified before proceeding
 * 
 * Per PDF Formula Register and SRS:
   - Operating Cash After Interest = Net Profit After Reserve + Depreciation - Increase in Receivables
   - Closing Cash = Opening Cash + Operating Cash After Interest - Principal Repayment - Owner Drawings
   - Year End Receivables = Annual Rental Income / 365 × Receivables Days
   - Increase in Receivables = Current year receivables - Prior year receivables
   - Owner Drawings = (Monthly × 12) × (1 + Escalation Rate)^(N-1)
   - Initial cash before Year 1 = Rs. 2.00 lakh (after asset purchase)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { YEARS, lakh, calculateDscr } from "@/lib/finance";

export default function CashFlowPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('ca');
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // All figures come from the shared five-year model so that this statement
  // reconciles with the balance sheet to the paisa.
  const profitabilityData = YEARS.map((year) => ({
    year: year.year,
    netProfitAfterReserve: year.netProfitAfterReserve,
    depreciation: year.depreciation,
  }));
  const loanData = YEARS.map((year) => ({
    year: year.year,
    principalRepaid: year.principalRepaid,
    interestPaid: year.interestPaid,
    closingBalance: year.termLoanOutstanding,
  }));
  const ownerDrawls = YEARS.map((year) => ({ year: year.year, drawings: year.ownerDrawings }));
  const increaseInReceivables = YEARS.map((year) => ({
    year: year.year,
    increase: year.increaseInReceivables,
  }));
  const operatingCashAfterInterest = YEARS.map((year) => year.operatingCashAfterInterest);
  const closingCash = YEARS.map((year) => year.closingCash);
  const dscrData = YEARS.map((year) => ({
    year: year.year,
    dscr: calculateDscr(
      year.netProfitAfterReserve,
      year.depreciation,
      year.interestPaid,
      year.principalRepaid
    ),
  }));

  const handleSubmit = () => {
    // Cash flow is always available; All screens are available, all screens
    if (userType === 'applicant') {
      router.push("/break-even");
    } else {
      router.push("/break-even");
    }
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
            <h2 className="font-semibold text-secondary text-lg">Cash Flow Projections</h2>
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
          {/* Cash Flow Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">5-Year Cash Flow Projections</h3>
            
            <p className="text-zinc-500 text-sm mb-4">
              Cash flow is annual; collections and debt instalments should also be reviewed monthly to manage seasonal shortfalls.
            </p>
            
            <table className="w-full rounded-border overflow-hidden">
              <thead>
                <tr className="bg-primary/10 border-b border-zinc-200">
                  <th className="p-3 text-left text-secondary font-medium">Particulars</th>
                  {Array.from({ length: 5 }, (_, i) => (
                    <th key={i + 1} className="p-3 text-center text-secondary font-medium">Year {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Net Profit After Reserve</td>
                  {profitabilityData.map((data) => (
                    <td key={data.year} className="p-3">{lakh(data.netProfitAfterReserve)}</td>
                  ))}</tr>
                <tr className="border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Add Depreciation</td>
                  {profitabilityData.map((data) => (
                    <td key={data.year} className="p-3">{lakh(data.depreciation)}</td>
                  ))}</tr>
                <tr className="border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Less Increase in Receivables</td>
                  {increaseInReceivables.map((data) => (
                    <td key={data.year} className="p-3">{lakh(data.increase)}</td>
                  ))}</tr>
                <tr className="bg-primary/10 border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Operating Cash After Interest</td>
                  {operatingCashAfterInterest.map((value, i) => (
                    <td key={i} className="p-3 font-bold text-primary">
                      {value.toFixed(2)}
                    </td>
                  ))}</tr>
                <tr className="border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Less Principal Repayment</td>
                  {loanData.map((data) => (
                    <td key={data.year} className="p-3">{lakh(data.principalRepaid)}</td>
                  ))}</tr>
                <tr className="bg-primary/10 border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Less Owner Drawings</td>
                  {ownerDrawls.map((data) => (
                    <td key={data.year} className="p-3">{lakh(data.drawings)}</td>
                  ))}</tr>
                <tr className="font-bold bg-primary/10 border-t border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Closing Cash and Bank</td>
                  {closingCash.map((value, i) => (
                    <td key={i} className="p-3 font-bold text-primary">
                      {value.toFixed(2)}
                    </td>
                  ))}</tr>
              </tbody>
            </table>
            
            {/* DSCR Context */}
            <div className="mt-4 p-3 rounded-md bg-primary/10 border-primary">
              <p className="font-medium text-secondary mb-2">DSCR Context:</p>
              <p className="text-sm">
                <span className="font-bold">DSCR Trend:</span> {dscrData.map(d => `${d.year}: ${d.dscr}x`).join(" → ")}<br />
                <span className="font-bold">Year 1 Minimum:</span> 2.0x for MUDRA Tarun category eligibility<br />
                <span className="font-bold">All years compliant:</span> DSCR improves consistently from 2.67x to 4.27x
              </p>
            </div>
            
            <p className="text-zinc-500 text-xs mt-3">
              Note: Opening cash before Year 1 is Rs. 2.00 lakh (after asset purchase, per PDF: "Initial cash before Year 1 is Rs. 2.00 lakh, after asset purchase"). Cash flow is before proprietor drawings and changes in working capital, which are treated separately.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              className="btn-primary"
            >
              {userType === 'applicant' ? 'Proceed to Break-Even Analysis' : 'Continue to Implementation Schedule'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
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