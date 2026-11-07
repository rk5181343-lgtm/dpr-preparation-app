/* 
 * Final Reports - DPR Preparation Application
 * Screen 17: Final Reports
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → Cash Flow → Break-Even → Balance Sheet → Implementation Schedule → Document Management → Risk Assessment → Conclusion & Conorganisationation → Final Reports → Settings
 * 
 * Integrates with all prior modules for financial data, document compliance, risk assessment, and approval workflow status.
 * 
 * Per SRS Section 15 and Screen 17 Requirements:
 * - 7 report type checkboxes for different report categories
 * - Report customization (prepared by, organisation, watermark, applicant logo)
 * - Generate Reports button with sequential PDF generation
 * - All 6 report types with specific content per Report Generation requirements
 * - "All of the Above" option for comprehensive deliverance
 * - Report saved to Downloads folder with naming convention
 * - Previous navigation to Screen 16: Final Review and Approval
 * 
 * Report Types and Contents:
 * 1. DPR Summary Report: 1-page summary with key financials, applicant profile, project details, Year 1 financial summary, DSCR, cash available, document checklist, disclaimer
 * 2. Detailed 5-Year Projection Report: Full P&L, Cash Flow, Balance Sheet for 5 years with 11 metrics across Years 1-5
 * 3. Loan Appraisal Report: Loan terms, amortization schedule, DSCR analysis, cash flow adequacy, margin analysis, risk factors, lender recommendations
 * 4. Implementation Schedule Report: Project stages with timing, responsible persons, dependencies, critical path, Gantt chart or timeline view
 * 5. Document Checklist Report: All mandatory documents with upload status, verification notes, gaps identification, compliance score
 * 6. Break-Even & Sensitivity Analysis Report: Base case results, 3 scenario tables, graphs (revenue/DSCR/cash trends), key takeaways
 * 7. Review Letter: certification, review scope, observations, approval/rejection statement, preparer details, date, conditions/recommendations
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FinalReportsPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('ca');
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // Form state - report type selections
  const [reportTypes, setReportTypes] = useState<{
    dprSummary: boolean;
    detailedProjection: boolean;
    loanAppraisal: boolean;
    implementationSchedule: boolean;
    documentChecklist: boolean;
    breakEvenSensitivity: boolean;
  }>({
    dprSummary: false,
    detailedProjection: false,
    loanAppraisal: false,
    implementationSchedule: false,
    documentChecklist: false,
    breakEvenSensitivity: false,
  });

  // Customization state
  const [caName, setCaName] = useState<string>("");
  const [organisationName, setFirmName] = useState<string>("");
  const [includeApplicantName, setIncludeApplicantName] = useState<boolean>(false);
  const [confidentialWatermark, setConfidentialWatermark] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customReportName, setCustomReportName] = useState<string>("");

  // Track if at least one report type is selected
  const hasSelectedReports = Object.values(reportTypes).some(
    (selected) => selected
  );

  // Generate individual report
  const generateReport = (
    reportType:
      | "dprSummary"
      | "detailedProjection"
      | "loanAppraisal"
      | "implementationSchedule"
      | "documentChecklist"
      | "breakEvenSensitivity"
  ) => {
    // In a real system, this would generate PDFs using a library like jsPDF or a server-side generator
    // For now, simulate generation and navigate or alert
    const reportName = {
      dprSummary: "DPR_Summary_EarthmovingRental",
      detailedProjection: "Detailed_FiveYear_Projection",
      loanAppraisal: "Loan_Appraisal_Report",
      implementationSchedule: "Implementation_Schedule_Report",
      documentChecklist: "Document_Checklist_Report",
      breakEvenSensitivity: "BreakEven_Sensitivity_Analysis",
    }[reportType];

    const fullName = `${reportName}_${customReportName || "Kalicheti"}_${selectedDate.toLocaleDateString()}`;

    // Simulate PDF generation
    setCustomReportName(fullName);
    alert(`Generating ${reportType.replace(/([A-Z])/g, " $1").trim()} report... Saved as: ${fullName}.pdf`);

    // In production, this would actually generate and save the PDF
    // For now, navigate based on user type
    if (userType === 'applicant') {
      router.push("/settings");
    } else {
      router.push("/settings");
    }
  };

  // Generate all 6 reports ("All of the Above")
  const generateAllReports = () => {
    if (!hasSelectedReports) {
      alert("Please select at least one report type to generate.");
      return;
    }

    // Simulate sequential generation of all selected reports
    let count = 0;
    const total = Object.values(reportTypes).filter((s) => s).length;

    const interval = setInterval(() => {
      count++;
      const progress = `${count} of ${total} reports generating...`;
      // Simulate different generation times
      if (count >= total) {
        clearInterval(interval);
        alert(
          `All ${total} reports generated successfully. Saved to Downloads folder.`
        );
        // Navigate based on user type
        if (userType === 'applicant') {
          router.push("/settings");
        } else {
          router.push("/settings");
        }
      }
    }, 2000); // 2s per report for simulation
  };

  // Handle input changes for report types
  const handleReportTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    reportType: keyof typeof reportTypes
  ) => {
    setReportTypes({
      ...reportTypes,
      [reportType]: e.target.checked,
    });
  };

  // Handle customization changes
  const handleCaNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaName(e.target.value);
  };

  const handleFirmNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirmName(e.target.value);
  };

  const handleIncludeApplicantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeApplicantName(e.target.checked);
  };

  const handleConfidentialWatermarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfidentialWatermark(e.target.checked);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  };

  const handleCustomReportNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomReportName(e.target.value);
  };

  // Declaration date auto-filled
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  // All screens are available
  const navigateBasedOnType = (targetScreen: string) => {
    if (userType === 'applicant') {
      router.push(targetScreen);
    } else {
      router.push(targetScreen);
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
            <h2 className="font-semibold text-secondary text-lg">Final Reports</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-sm">DPR Workspace</span>
          <button
            onClick={() => {
              localStorage.removeItem("dpr_user_type");
              localStorage.removeItem("dpr_user_id");
              router.push("/dashboard");
            }}
            className="text-primary text-sm font-medium underline"
          >
            Home
          </button>
        </div>
      </header>
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Downloadable sample DPR */}
          <section className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden border border-zinc-200">
            <div className="bg-primary px-6 py-5">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.18em] mb-2">
                Ready-made example
              </p>
              <h3 className="text-white text-lg font-semibold">Download a completed DPR</h3>
              <p className="text-white/80 text-sm mt-1 leading-relaxed">
                A finished earthmoving equipment rental report: cost of the project, means of finance, five year
                projections, cash flow, balance sheet, break-even, schedule and document checklist.
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { href: "/samples/sample-dpr-earthmoving.pdf", label: "PDF", meta: "8 pages, print ready" },
                  { href: "/samples/sample-dpr-earthmoving.docx", label: "Word", meta: "Editable text" },
                  { href: "/samples/sample-dpr-earthmoving.xlsx", label: "Excel", meta: "Financial model" },
                ].map((file) => (
                  <a
                    key={file.href}
                    href={file.href}
                    download
                    className="group rounded-md border border-zinc-200 px-4 py-4 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <span className="block text-secondary font-semibold group-hover:text-primary">
                      {file.label}
                    </span>
                    <span className="block text-zinc-500 text-xs mt-1">{file.meta}</span>
                    <span className="inline-block mt-3 text-sm font-medium text-primary underline">Download</span>
                  </a>
                ))}
              </div>
              <p className="text-zinc-500 text-xs mt-4">
                Example figures only, no personal identity details. Replace names and numbers with your own before
                sending anything to a bank.
              </p>
            </div>
          </section>

          {/* Report Type Selection */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-6">Select Report Type</h3>
            <p className="text-zinc-500 text-sm mb-4">
              Choose one or more report types to generate. Select "All of the Above" to generate all 6 reports in sequence.
            </p>
            
            {/* DPR Summary Report */}
            <div className="mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportTypes.dprSummary}
                  onChange={(e) => handleReportTypeChange(e, "dprSummary")}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                <span>
                  DPR Summary Report (1-page summary with key financials)
                </span>
              </label>
              <p className="text-zinc-500 text-xs mt-1">
                Contents: Applicant profile, project details, Year 1 financial summary (rental income, operating expenses, EBITDA, depreciation, loan interest, PBT reserve, tax reserve, net profit after reserve), DSCR, cash available, key 5-year metrics, document checklist with statuses, disclaimer
              </p>
            </div>

            {/* Detailed 5-Year Projection Report */}
            <div className="mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportTypes.detailedProjection}
                  onChange={(e) => handleReportTypeChange(e, "detailedProjection")}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                <span>
                  Detailed 5-Year Projection Report (Full P&L, Cash Flow, Balance Sheet for 5 yrs)
                </span>
              </label>
              <p className="text-zinc-500 text-xs mt-1">
                Contents: Full 5-year P&L account (all 11 metrics across Years 1-5), Cash Flow Statement (all 7 line items across 5 years), Projected Balance Sheet (all 7 line items across 5 years), with comparative side-by-side tables
              </p>
            </div>

            {/* Loan Appraisal Report */}
            <div className="mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportTypes.loanAppraisal}
                  onChange={(e) => handleReportTypeChange(e, "loanAppraisal")}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                <span>
                  Loan Appraisal Report (Loan terms, amortization, DSCR analysis)
                </span>
              </label>
              <p className="text-zinc-500 text-xs mt-1">
                Contents: Loan amount and terms, security/collateral details, repayment schedule (60 monthly instalments with principal/interest breakdown), DSCR analysis (5-year trend), cash flow adequacy, margin analysis (promoter contribution %), risk factors identified, lender recommendations
              </p>
            </div>

            {/* Implementation Schedule Report */}
            <div className="mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportTypes.implementationSchedule}
                  onChange={(e) => handleReportTypeChange(e, "implementationSchedule")}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                <span>
                  Implementation Schedule Report (Project stages, timing, responsibilities)
                </span>
              </label>
              <p className="text-zinc-500 text-xs mt-1">
                Contents: All project stages with indicative timing (Quotations inspection Weeks 1-2, Bank appraisal Subject to lender, Promoter contribution After sanction, Insurance commissioning Within 2 weeks after purchase, Commercial operation After equipment readiness), responsible persons (applicant/operator), dependencies between stages, status tracking (Not Started/In Progress/Completed/Delayed), critical path identification, Gantt chart or timeline view
              </p>
            </div>

            {/* Document Checklist Report */}
            <div className="mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportTypes.documentChecklist}
                  onChange={(e) => handleReportTypeChange(e, "documentChecklist")}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                <span>
                  Document Checklist Report (Upload status, gaps, compliance score)
                </span>
              </label>
              <p className="text-zinc-500 text-xs mt-1">
                Contents: List of all mandatory documents for MUDRA/Tarun category, upload status for each (Uploaded/Pending/Verified/Rejected), verification notes, gaps identification (missing documents), compliance score (% of mandatory documents verified)
              </p>
            </div>

            {/* Break-Even & Sensitivity Analysis Report */}
            <div className="mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportTypes.breakEvenSensitivity}
                  onChange={(e) => handleReportTypeChange(e, "breakEvenSensitivity")}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                <span>
                  Break-Even & Sensitivity Analysis Report (Scenario results, graphs, DSCR trends)
                </span>
              </label>
              <p className="text-zinc-500 text-xs mt-1">
                Contents: Base case results (Revenue Year 1: Rs. 12.96 lakh, Net profit: Rs. 4.07 lakh, DSCR: 2.67x), Scenario 1: Rental income 20% lower, Scenario 2: Operating expenses 20% higher, Scenario 3: Both adverse conditions, Graphs: Revenue trends across 5 years, DSCR trend across 5 years, Cash balance trend across 5 years, Key takeaways
              </p>
            </div>

            {/* "All of the Above" option */}
            <div className="mt-4 p-3 rounded-md bg-primary/10 border-primary">
              <p className="font-medium text-secondary mb-2">All of the Above</p>
              <p className="text-zinc-500 text-sm">
                Selects all 6 report types for generation in one click. Generates all reports sequentially. May take 15-30 seconds depending on report complexity. All reports saved to Downloads folder with sequential naming.
              </p>
              <button
                onClick={generateAllReports}
                disabled={!hasSelectedReports}
                className={hasSelectedReports ? 'btn-primary' : 'btn-secondary opacity-50'}
              >
                Generate All 6 Reports
              </button>
              <p className="text-zinc-500 text-xs mt-2">
                Estimated generation time: 5-15 seconds for single report, 15-30 seconds for "All of the Above"
              </p>
            </div>
          </div>

          {/* Report Customization */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Report Customization</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-secondary font-medium mb-1">Prepared By</label>
                <input
                  type="text"
                  value={caName}
                  onChange={handleCaNameChange}
                  placeholder="Prepared By"
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Organisation Name</label>
                <input
                  type="text"
                  value={organisationName}
                  onChange={handleFirmNameChange}
                  placeholder="Organisation Name"
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-secondary font-medium mb-1">Date Generated</label>
                <input
                  type="date"
      value={selectedDate.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Include Applicant Name/Logo</label>
                <input
                  type="checkbox"
                  checked={includeApplicantName}
                  onChange={handleIncludeApplicantNameChange}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                <span className="ml-2">
                  If selected, applicant name appears on report header; if also has logo file upload, logo appears
                </span>
              </div>
            </div>

            <div>
              <label className="block text-secondary font-medium mb-1">Confidential Watermark</label>
              <input
                type="checkbox"
                checked={confidentialWatermark}
                onChange={handleConfidentialWatermarkChange}
                className="w-4 h-4 rounded border-primary cursor-pointer"
              />
              <span className="ml-2">
                Adds "CONFIDENTIAL" watermark across PDF pages (does not affect print quality, only visible on-screen/preview; does not print if printer settings exclude watermarks)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            {/* Generate selected reports button */}
            {hasSelectedReports && (
              <button
                onClick={() => {
                  const firstSelected = (Object.keys(reportTypes) as Array<keyof typeof reportTypes>).find(
                    (key) => reportTypes[key]
                  );
                  if (firstSelected) generateReport(firstSelected);
                }}
                disabled={!hasSelectedReports}
                className={hasSelectedReports ? 'btn-primary' : 'btn-secondary opacity-50'}
              >
                {hasSelectedReports && Object.values(reportTypes).some(v => v) ? 'Generate Selected Reports' : 'Select Report Type First'}
              </button>
            )}

            {/* Generate all reports button (visible when all selected or "All of Above" logic) */}
            {Object.values(reportTypes).every(v => v) && (
              <button
                onClick={generateAllReports}
                className="btn-primary"
              >
                Generate All 6 Reports
              </button>
            )}

            <button
              onClick={() => navigateBasedOnType("/conclusion")}
              className="btn-secondary"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Conclusion
            </button>
          </div>

          {/* Form completion progress */}
          {hasSelectedReports && (
            <div className="mt-4 p-3 rounded-md bg-primary/10 border-primary">
              <p className="font-medium text-secondary">
                ✅ Report type(s) selected. Ready to generate.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}