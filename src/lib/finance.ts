/*
 * Shared five-year financial model.
 *
 * One source of truth for the loan schedule, cash flow and balance sheet so
 * every screen reports identical figures. Values are in Rs. lakh and stay
 * unrounded until they are formatted for display.
 */

export const ASSUMPTIONS = {
  loanAmount: 1000000, // Rs. 10.00 lakh MUDRA Tarun term loan
  interestRate: 12, // % per annum, reducing balance
  tenureMonths: 60,
  machineryWdv: 13.0, // Machine 12.00 + refurbishment 1.00
  depreciationRate: 0.15, // WDV method
  promoterCapital: 5.0,
  openingCash: 2.0, // After asset purchase
  profitAfterReserve: [4.07, 5.5, 6.99, 8.56, 10.22],
  ownerDrawings: [1.8, 1.89, 1.98, 2.08, 2.19],
  rentalIncome: [12.96, 14.36, 15.88, 17.5, 19.25],
} as const;

export type LoanYear = {
  year: number;
  openingBalance: number;
  principalRepaid: number;
  interestPaid: number;
  closingBalance: number;
};

const toLakh = (value: number) => value / 100000;

export function calculateEmi(principalRupees: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return Math.round(principalRupees / months);
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principalRupees * monthlyRate * factor) / (factor - 1));
}

/**
 * Reducing-balance amortisation grouped by year.
 *
 * The final instalment absorbs accumulated paise rounding so the loan always
 * closes at exactly zero, and months beyond the tenure report no repayment.
 */
export function buildLoanSchedule(
  principalRupees: number,
  annualRate: number,
  months: number,
  years = 5
): LoanYear[] {
  const monthlyRate = annualRate / 100 / 12;
  const emi = calculateEmi(principalRupees, annualRate, months);
  let balance = principalRupees;
  const schedule: LoanYear[] = [];

  for (let year = 1; year <= years; year++) {
    const openingBalance = balance;
    let principalPaid = 0;
    let interestPaid = 0;

    for (let month = 1; month <= 12; month++) {
      const instalment = (year - 1) * 12 + month;
      if (instalment > months || balance <= 0) break;
      const interest = Math.round(balance * monthlyRate);
      const principal =
        instalment === months ? balance : Math.min(Math.round(emi - interest), balance);
      balance = Math.max(0, balance - principal);
      principalPaid += principal;
      interestPaid += interest;
    }

    schedule.push({
      year,
      openingBalance,
      principalRepaid: principalPaid,
      interestPaid,
      closingBalance: balance,
    });
  }

  return schedule;
}

export type FinancialYear = {
  year: number;
  netProfitAfterReserve: number;
  depreciation: number;
  closingWdv: number;
  receivables: number;
  increaseInReceivables: number;
  operatingCashAfterInterest: number;
  openingCash: number;
  closingCash: number;
  principalRepaid: number;
  interestPaid: number;
  termLoanOutstanding: number;
  ownerDrawings: number;
  proprietorCapital: number;
  totalAssets: number;
  totalCapitalLiabilities: number;
};

function buildYears(): FinancialYear[] {
  const loans = buildLoanSchedule(
    ASSUMPTIONS.loanAmount,
    ASSUMPTIONS.interestRate,
    ASSUMPTIONS.tenureMonths
  );

  let wdv = ASSUMPTIONS.machineryWdv;
  let capital = ASSUMPTIONS.promoterCapital;
  let cash = ASSUMPTIONS.openingCash;
  let previousReceivables = 0;

  return ASSUMPTIONS.profitAfterReserve.map((profit, index) => {
    const loan = loans[index];
    const principalRepaid = toLakh(loan.principalRepaid);
    const interestPaid = toLakh(loan.interestPaid);

    const depreciation = wdv * ASSUMPTIONS.depreciationRate;
    wdv -= depreciation;

    const receivables = ASSUMPTIONS.rentalIncome[index] / 12;
    const increaseInReceivables = receivables - previousReceivables;
    previousReceivables = receivables;

    const operatingCashAfterInterest = profit + depreciation - increaseInReceivables;
    const openingCash = cash;
    cash = openingCash + operatingCashAfterInterest - principalRepaid - ASSUMPTIONS.ownerDrawings[index];

    capital = capital + profit - ASSUMPTIONS.ownerDrawings[index];
    const termLoanOutstanding = toLakh(loan.closingBalance);

    return {
      year: index + 1,
      netProfitAfterReserve: profit,
      depreciation,
      closingWdv: wdv,
      receivables,
      increaseInReceivables,
      operatingCashAfterInterest,
      openingCash,
      closingCash: cash,
      principalRepaid,
      interestPaid,
      termLoanOutstanding,
      ownerDrawings: ASSUMPTIONS.ownerDrawings[index],
      proprietorCapital: capital,
      totalAssets: wdv + receivables + cash,
      totalCapitalLiabilities: capital + termLoanOutstanding,
    };
  });
}

export const YEARS: FinancialYear[] = buildYears();

/** Format a Rs. lakh figure for display. */
export const lakh = (value: number): string => value.toFixed(2);

/** DSCR = (Net profit after reserve + Depreciation + Interest) / (Principal + Interest) */
export function calculateDscr(profit: number, depreciation: number, interest: number, principal: number): number {
  const denominator = principal + interest;
  if (denominator === 0) return 0;
  return Math.round(((profit + depreciation + interest) / denominator) * 100) / 100;
}
