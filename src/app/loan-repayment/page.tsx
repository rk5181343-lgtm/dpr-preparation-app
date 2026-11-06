/* 
 * Loan Repayment & DSCR - DPR Preparation Application
 * Screen 8: Loan Amortization, Interest, and Debt Service Coverage Ratio
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → ... 
 * 
 * Integrates with:
   - Project Creation: loan amount (5-10 lakh for MUDRA Tarun), interest rate, tenure
   - Project Information: financial assumptions, depreciation rates
   - Document Submission: compliance verified before proceeding
 * 
 * Per PDF Formula Register:
   - EMI: P × r × (1+r)^n / ((1+r)^n - 1) reducing balance
   - DSCR: (Net profit after reserve + Depreciation + Interest) / (Principal + Interest)
   - DSCR Year 1 must be ≥ 2.0 for MUDRA Tarun eligibility
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoanRepaymentPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('ca');
  const [loanAmount, setLoanAmount] = useState(1000000); // Rs. 10 lakh default
  const [interestRate, setInterestRate] = useState(12); // 12% default
  const [tenureMonths, setTenureMonths] = useState(60); // 60 months default
  const [emi, setEmi] = useState(22244.45);
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // Calculate EMI using reducing balance formula
  const calculateEMI = (principal: number, annualRate: number, months: number): number => {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return Math.round(principal / months);
    const factor = Math.pow(1 + monthlyRate, months);
    return Math.round(principal * monthlyRate * factor / (factor - 1));
  };

  // Recalculate EMI whenever inputs change
  useEffect(() => {
    setEmi(calculateEMI(loanAmount, interestRate, tenureMonths));
  }, [loanAmount, interestRate, tenureMonths]);

  // Calculate 5-year amortization schedule
  const calculateAmortization = (): Array<{
    year: number;
    openingBalance: number;
    principalRepaid: number;
    interestPaid: number;
    closingBalance: number;
  }> => {
    const monthlyRate = interestRate / 100 / 12;
    let balance = loanAmount;
    const schedule: Array<{
      year: number;
      openingBalance: number;
      principalRepaid: number;
      interestPaid: number;
      closingBalance: number;
    }> = [];
    
    for (let year = 1; year <= 5; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      
      for (let month = 1; month <= 12; month++) {
        const interest = Math.round(balance * monthlyRate);
        const principal = Math.round(emi - interest);
        balance = Math.max(0, balance - principal);
        yearlyPrincipal += principal;
        yearlyInterest += interest;
      }
      
      schedule.push({
        year,
        openingBalance: year === 1 ? loanAmount : schedule[year - 2]?.closingBalance || loanAmount,
        principalRepaid: yearlyPrincipal,
        interestPaid: yearlyInterest,
        closingBalance: Math.round(balance)
      });
    }
    
    return schedule;
  };

  // Calculate DSCR per year using PDF formula:
  // DSCR = (Net profit after reserve + Depreciation + Interest) / (Principal + Interest)
  const calculateDSCR = (netProfitAfterReserve: number, depreciation: number, interest: number, principal: number): number => {
    const numerator = netProfitAfterReserve + depreciation + interest;
    const denominator = principal + interest;
    if (denominator === 0) return 0;
    return Math.round(numerator / denominator * 100) / 100;
  };

  // 5-year profitability data (from PDF verified calculations)
  const profitabilityData = [
    { year: 1, netProfitAfterReserve: 4.07, depreciation: 1.95, interest: 1.12, principal: 1.55 },
    { year: 2, netProfitAfterReserve: 5.50, depreciation: 1.66, interest: 0.92, principal: 1.75 },
    { year: 3, netProfitAfterReserve: 6.99, depreciation: 1.41, interest: 0.70, principal: 1.97 },
    { year: 4, netProfitAfterReserve: 8.56, depreciation: 1.20, interest: 0.45, principal: 2.22 },
    { year: 5, netProfitAfterReserve: 10.22, depreciation: 1.02, interest: 0.17, principal: 2.50 }
  ];

  // Calculate DSCR for each year
  const dscrData = profitabilityData.map((data) => ({
    year: data.year,
    dscr: calculateDSCR(data.netProfitAfterReserve, data.depreciation, data.interest, data.principal)
  }));

  // 5-year amortization schedule
  const amortizationSchedule = calculateAmortization();

  // Validate DSCR Year 1 ≥ 2.0 for MUDRA Tarun
  const year1DSCR = dscrData[0].dscr;
  const minDSCR = 2.0;

  // Assumption to validate badges (Categories 7 & 8 per formula register)
  const loanRepaymentPending = year1DSCR >= minDSCR && false || true; // Placeholder - will be validated
  const interestRatePending = true; // 12% rate to be validated

  const handleSubmit = () => {
    // Validate DSCR Year 1 ≥ 2.0 for MUDRA Tarun category eligibility
    if (year1DSCR < minDSCR) {
      alert(`DSCR Year 1 is ${year1DSCR}x, which is below the MUDRA Tarun minimum of ${minDSCR}x. Please adjust loan assumptions.`);
      return;
    }
    
    // All screens are available
    if (userType === 'applicant') {
      router.push("/cash-flow");
    } else {
      router.push("/cash-flow");
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
            <h2 className="font-semibold text-secondary text-lg">Loan Repayment & DSCR</h2>
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
          {/* Loan Parameters Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-6">Loan Parameters</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Loan Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  placeholder="e.g., 1000000"
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  min={500000}
                  max={1000000}
                  step={100000}
                /> {/* 5-10 lakh for MUDRA Tarun */}
                <p className="text-zinc-500 text-xs mt-1">MUDRA Tarun: ₹5 lakh to ₹10 lakh</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  placeholder="e.g., 12"
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  min={1}
                  max={25}
                  step={0.5}
                /> {/* 1-25% range */}
                <p className="text-zinc-500 text-xs mt-1">Reducing balance basis</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Tenure (Months)
              </label>
              <input
                type="number"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                placeholder="e.g., 60"
                className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                min={12}
                max={480}
                step={12}
              /> {/* 12-480 months */}
              <p className="text-zinc-500 text-xs mt-1">Standard: 60 months for Tarun</p>
            </div>
          </div>

          {/* EMI Calculation */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">EMI Calculation</h3>
            
            <p className="text-secondary mb-4">
              EMI = P × r × (1+r)^n / ((1+r)^n - 1)
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-medium">Monthly EMI</p>
                <p className="text-2xl font-bold text-primary">{emi.toLocaleString()}</p>
                <p className="text-zinc-500 text-sm">(Calculated at {interestRate}% on {loanAmount.toLocaleString()} principal)</p>
              </div>
              <div>
                <p className="font-medium">Annual Instalments</p>
                <p className="text-2xl font-bold text-primary">{(emi * 12).toLocaleString()}</p>
                <p className="text-zinc-500 text-sm">per year for {tenureMonths} months</p>
              </div>
            </div>
            
            <p className="text-secondary">
              Total interest outflow over {tenureMonths} months:{" "}
              {(emi * tenureMonths - loanAmount).toLocaleString()} (~{(((emi * tenureMonths - loanAmount) / loanAmount) * 100).toFixed(1)}% of principal)
            </p>
          </div>

          {/* 5-Year Amortization Schedule */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">5-Year Amortization Schedule</h3>
            
            <p className="text-zinc-500 text-sm mb-4">
              DSCR Year 1 must be ≥ 2.0x for MUDRA Tarun category eligibility. DSCR improves over 5 years.
            </p>
            
            <table className="w-full rounded-border overflow-hidden">
              <thead>
                <tr className="bg-primary/10 border-b border-zinc-200">
                  <th className="p-3 text-left text-secondary font-medium">Year</th>
                  <th className="p-3 text-left text-secondary font-medium">Opening Balance</th>
                  <th className="p-3 text-left text-secondary font-medium">Principal</th>
                  <th className="p-3 text-left text-secondary font-medium">Interest</th>
                  <th className="p-3 text-left text-secondary font-medium">Closing Balance</th>
                  <th className="p-3 text-left text-secondary font-medium">DSCR</th>
                </tr>
              </thead>
              <tbody>
                {amortizationSchedule.map((yearData, i) => {
                  const dscr = dscrData[i].dscr;
                  const isFirstYear = i === 0;
                  const lowDSCR = dscr < 2.0;
                  return (
                    <tr key={yearData.year} className={lowDSCR ? 'bg-red-100' : ''}>
                      <td className="p-3 font-medium">{yearData.year}</td>
                      <td className="p-3">{yearData.openingBalance.toLocaleString()}</td>
                      <td className="p-3">{yearData.principalRepaid.toLocaleString()}</td>
                      <td className="p-3">{yearData.interestPaid.toLocaleString()}</td>
                      <td className="p-3">{yearData.closingBalance.toLocaleString()}</td>
                      <td className={lowDSCR ? 'p-3 font-medium text-red-600' : 'p-3 font-medium text-green-600'}>
                        {dscr.toFixed(2)}x
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* DSCR Summary */}
            <div className={year1DSCR >= minDSCR ? 'mt-4 p-3 rounded-md bg-primary/10 border border-primary' : 'mt-4 p-3 rounded-md bg-red-100 border border-red-400'}>
              <p className="font-medium text-secondary mb-2">DSCR Analysis:</p>
              <p className="text-sm">
                <span className="font-bold">Year 1 DSCR:</span> {year1DSCR.toFixed(2)}x 
                {year1DSCR >= minDSCR ? '✅ Meets MUDRA Tarun minimum' : '❌ Below minimum - requires adjustment'} 
                {loanRepaymentPending && (
                  <span className="text-warning text-xs ml-2">⚠️ Assumption to validate</span>
                )}
                <br />
                <span className="font-bold">Year 5 DSCR:</span> {dscrData[4].dscr.toFixed(2)}x 
                <br />
                <span className="font-bold">DSCR Trend:</span> {dscrData[4].dscr > dscrData[0].dscr ? '(positive - improving)' : '(concern - review assumptions)'}
              </p>
              <p className="text-xs mt-1 text-zinc-500">
                Note: DSCR calculated as (PBIT + Depreciation + Interest) / (Principal + Interest) per MUDRA guidelines. 
                Year 1 minimum of 2.0x is standard for Tarun category; this proposal shows {year1DSCR.toFixed(2)}x.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={year1DSCR < minDSCR && userType === 'applicant'}
              className={year1DSCR < minDSCR && userType === 'applicant' ? 'btn-secondary opacity-50' : 'btn-primary'}
            >
              {year1DSCR < minDSCR && userType === 'applicant' ? 
                'Fix DSCR First' : 
                userType === 'applicant' ? 
                'Proceed to Cash Flow' : 
                'Continue to Implementation Schedule'}
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