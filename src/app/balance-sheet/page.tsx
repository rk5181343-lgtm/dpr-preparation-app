/* 
 * Balance Sheet Projections - DPR Preparation Application
 * Screen 11: Five-Year Balance Sheet Projections
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → Cash Flow → Break-Even → Balance Sheet → ... 
 * 
 * Integrates with:
   - Cash Flow: Closing cash and bank balances
   - Loan Repayment: Term loan outstanding, principal/interest breakdown
   - Project Information: Depreciation rates, project cost, means of finance
   - Document Submission: Compliance verified before proceeding
 * 
 * Per PDF Formula Register and SRS Section 10, Table 10:
   - Fixed Assets Net Book Value: Opening WDV (13.00 lakh) - Accumulated Depreciation
   - Written Down Value (15%): Year 1: 13.00 × 15% = 1.95, Closing: 11.05
   - Subsequent years: Opening WDV × 15%, Closing = Opening - Depreciation
   - Trade Receivables: Annual Rental Income / 12 (one month of revenue)
   - Cash and Bank: From Cash Flow projections closing balances
   - Total Assets: Fixed Assets + Trade Receivables + Cash and Bank
   - Proprietor Capital: Opening (5.00 lakh) + Cumulative Net Profit After Reserve - Cumulative Owner Drawings
   - Term Loan Outstanding: From loan amortization closing balances
   - Total Capital and Liabilities: Proprietor Capital + Term Loan Outstanding
   - Validation: Total Assets = Total Capital and Liabilities for each year
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { YEARS, lakh } from "@/lib/finance";

export default function BalanceSheetPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('ca');
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // Every figure below is derived from the shared five-year model, which uses
  // unrounded amounts throughout, so the sheet balances in all five years.
  const depreciationRates = YEARS.map((year) => ({
    year: year.year,
    depreciation: year.depreciation,
    closingWDV: year.closingWdv,
  }));
  const tradeReceivables = YEARS.map((year) => ({ year: year.year, yearEnd: year.receivables }));
  const cashAndBank = YEARS.map((year) => year.closingCash);
  const totalAssets = YEARS.map((year) => ({ year: year.year, total: year.totalAssets }));
  const proprietorCapital = YEARS.map((year) => ({
    year: year.year,
    capital: year.proprietorCapital,
  }));
  const termLoanOutstanding = YEARS.map((year) => ({
    year: year.year,
    outstanding: year.termLoanOutstanding,
  }));
  const totalCapitalLiabilities = YEARS.map((year) => ({
    year: year.year,
    total: year.totalCapitalLiabilities,
  }));
  const isBalanced = YEARS.every((year) => Math.abs(year.totalAssets - year.totalCapitalLiabilities) < 0.005);

  const handleSubmit = () => {
    // Balance sheet always available; All screens are available, all screens
    if (userType === 'applicant') {
      router.push("/implementation-schedule");
    } else {
      router.push("/implementation-schedule");
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
            <h2 className="font-semibold text-secondary text-lg">Balance Sheet Projections</h2>
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
          {/* Balance Sheet Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Five-Year Balance Sheet Projections</h3>
            
            <p className="text-zinc-500 text-sm mb-4">
              Validation: Total assets = Total capital and liabilities for each year (fundamental balance sheet equation).
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
                  <td className="p-3 font-medium text-secondary">Fixed Assets Net Book Value</td>
                  {depreciationRates.map((data) => (
                    <td key={data.year} className="p-3">{lakh(data.closingWDV)}</td>
                  ))}</tr>
                <tr className="border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Trade Receivables</td>
                  {tradeReceivables.map((data) => (
                    <td key={data.year} className="p-3">{lakh(data.yearEnd)}</td>
                  ))}</tr>
                <tr className="border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Cash and Bank</td>
                  {cashAndBank.map((value, i) => (
                    <td key={i} className="p-3">{lakh(value)}</td>
                  ))}</tr>
                <tr className="bg-primary/10 border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Total Assets</td>
                  {totalAssets.map((data) => (
                    <td key={data.year} className="p-3 font-bold text-primary">{lakh(data.total)}</td>
                  ))}</tr>
                <tr className="border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Proprietor Capital</td>
                  {proprietorCapital.map((data) => (
                    <td key={data.year} className="p-3">{lakh(data.capital)}</td>
                  ))}</tr>
                <tr className="bg-primary/10 border-b border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Term Loan Outstanding</td>
                  {termLoanOutstanding.map((data) => (
                    <td key={data.year} className="p-3">{lakh(data.outstanding)}</td>
                  ))}</tr>
                <tr className="font-bold bg-primary/10 border-t border-zinc-200">
                  <td className="p-3 font-medium text-secondary">Total Capital and Liabilities</td>
                  {totalCapitalLiabilities.map((data) => (
                    <td key={data.year} className="p-3 font-bold text-primary">{lakh(data.total)}</td>
                  ))}</tr>
              </tbody>
            </table>
            
            {/* Balance Sheet Validation */}
            <div className={isBalanced ? 'mt-4 p-3 rounded-md bg-primary/10 border border-primary' : 'mt-4 p-3 rounded-md bg-red-100 border border-red-400'}>
              <p className="font-medium text-secondary mb-2">Balance Sheet Validation:</p>
              <p className="text-sm">
                <span className="font-bold">Year 5 Validation:</span> Total Assets = {totalAssets[4].total.toFixed(2)} lakh = Total Capital and Liabilities = {totalCapitalLiabilities[4].total.toFixed(2)} lakh 
                {isBalanced ? '✅ Equation holds' : '❌ Mismatch - review calculations'}
                <br />
                <span className="font-bold">Fundamental Equation:</span> For each year, Total Assets must equal Total Capital and Liabilities (Proprietor Capital + Term Loan Outstanding).
              </p>
              <p className="text-xs text-zinc-500">
                Minor rounding differences (0.01 lakh) expected per PDF's "figures rounded independently; calculations use unrounded amounts" policy.
              </p>
            </div>
          </div>

          {/* Key Observations */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-secondary font-medium mb-4">Key Observations</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="font-bold text-secondary">Opening Balance Sheet:</span> Fixed assets Rs. 13.00 lakh + Cash Rs. 2.00 lakh = Proprietor capital Rs. 5.00 lakh + Term loan Rs. 10.00 lakh (as stated in PDF Executive Summary).
              </li>
              <li>
                <span className="font-bold text-secondary">Loan Repayment:</span> Term loan fully repaid by end of Year 5 (closing balance Rs. 0.00), which is standard for 60-month MUDRA Tarun tenure with 60 monthly instalments.
              </li>
              <li>
                <span className="font-bold text-secondary">Capital Buildup:</span> Proprietor capital grows from Rs. 5.00 lakh (opening) to Rs. 30.40 lakh (Year 5), reflecting accumulated profits net of drawings.
              </li>
              <li>
                <span className="font-bold text-secondary">Assets Growth:</span> Total assets grow from Rs. 15.72 lakh (Year 1) to Rs. 30.40 lakh (Year 5), reflecting business growth and profit retention.
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              className="btn-primary"
            >
              {userType === 'applicant' ? 'Proceed to Break-Even Review' : 'Continue'}
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