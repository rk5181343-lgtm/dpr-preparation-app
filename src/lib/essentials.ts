/*
 * The short list of things a bank DPR actually needs.
 *
 * Kept deliberately small: eight financial inputs, each of which can be typed
 * in, evidenced by an upload, or filled with a clearly labelled app estimate.
 * Personal and KYC details are never estimated.
 */

export type EssentialGroup = "Project cost" | "Means of finance" | "Revenue and expenses" | "Loan terms";

export type EssentialItem = {
  id: string;
  label: string;
  why: string;
  group: EssentialGroup;
  unit: string;
  docLabel: string;
  estimate: number;
};

type EstimateSet = {
  projectCost: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
};

const ESTIMATES: Record<string, EstimateSet> = {
  "earthmoving-equipment-rental": { projectCost: 1500000, monthlyRevenue: 90000, monthlyExpenses: 65000 },
  "excavator-rental": { projectCost: 1500000, monthlyRevenue: 90000, monthlyExpenses: 65000 },
  "jcb-rental": { projectCost: 1100000, monthlyRevenue: 75000, monthlyExpenses: 52000 },
  "crane-rental": { projectCost: 2200000, monthlyRevenue: 130000, monthlyExpenses: 95000 },
  "rice-mill": { projectCost: 4500000, monthlyRevenue: 850000, monthlyExpenses: 640000 },
  "flour-mill": { projectCost: 2500000, monthlyRevenue: 520000, monthlyExpenses: 400000 },
  "dairy-farm": { projectCost: 1200000, monthlyRevenue: 120000, monthlyExpenses: 82000 },
  hotel: { projectCost: 12000000, monthlyRevenue: 600000, monthlyExpenses: 380000 },
  restaurant: { projectCost: 2500000, monthlyRevenue: 350000, monthlyExpenses: 230000 },
  "wholesale-trading": { projectCost: 2500000, monthlyRevenue: 1500000, monthlyExpenses: 1380000 },
  "retail-trading": { projectCost: 1200000, monthlyRevenue: 450000, monthlyExpenses: 400000 },
  "diagnostic-centre": { projectCost: 4000000, monthlyRevenue: 400000, monthlyExpenses: 280000 },
};

const FALLBACK: EstimateSet = { projectCost: 1500000, monthlyRevenue: 250000, monthlyExpenses: 190000 };

export function getEssentials(activityId: string): EssentialItem[] {
  const set = ESTIMATES[activityId] ?? FALLBACK;
  const promoter = Math.round(set.projectCost * 0.3);
  const workingCapital = Math.round(set.monthlyExpenses * 2);

  return [
    {
      id: "projectCost",
      label: "Total project cost",
      why: "Everything spent to start: machine, installation, deposit and first working capital.",
      group: "Project cost",
      unit: "Rs.",
      docLabel: "machine or asset quotation",
      estimate: set.projectCost,
    },
    {
      id: "workingCapital",
      label: "Working capital needed",
      why: "Money to run the business until customers start paying.",
      group: "Project cost",
      unit: "Rs.",
      docLabel: "working capital workings",
      estimate: workingCapital,
    },
    {
      id: "promoterContribution",
      label: "Your own contribution",
      why: "The part you fund yourself. Banks usually expect at least 25-30% of project cost.",
      group: "Means of finance",
      unit: "Rs.",
      docLabel: "own fund proof or bank statement",
      estimate: promoter,
    },
    {
      id: "termLoan",
      label: "Bank loan required",
      why: "Project cost minus your own contribution. This is the amount the DPR requests.",
      group: "Means of finance",
      unit: "Rs.",
      docLabel: "loan application",
      estimate: set.projectCost - promoter,
    },
    {
      id: "monthlyRevenue",
      label: "Expected monthly revenue",
      why: "What you expect to bill or sell in a normal month.",
      group: "Revenue and expenses",
      unit: "Rs.",
      docLabel: "orders, rate card or customer enquiry",
      estimate: set.monthlyRevenue,
    },
    {
      id: "monthlyExpenses",
      label: "Monthly running expenses",
      why: "Fuel, salary, rent, power, maintenance and other monthly costs.",
      group: "Revenue and expenses",
      unit: "Rs.",
      docLabel: "expense estimate",
      estimate: set.monthlyExpenses,
    },
    {
      id: "interestRate",
      label: "Interest rate",
      why: "The bank's yearly interest. 12% is a common starting point.",
      group: "Loan terms",
      unit: "% p.a.",
      docLabel: "bank interest quote",
      estimate: 12,
    },
    {
      id: "tenureMonths",
      label: "Repayment period",
      why: "How many months you take to repay the loan.",
      group: "Loan terms",
      unit: "months",
      docLabel: "bank repayment terms",
      estimate: 60,
    },
  ];
}
