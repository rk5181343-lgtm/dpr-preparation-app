/*
 * Document Submission - DPR Preparation Application
 * Screen 7: Document Upload and Compliance Tracking
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → ...
 *
 * 13 mandatory document categories for MUDRA Tarun submission.
 * Minimum 80% compliance required before the file can go for CA review.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type DocumentCategory = {
  id: number;
  name: string;
  required: boolean;
  acceptedTypes: string[];
  maxSizeMb: number;
  note: string;
};

const documentCategories: DocumentCategory[] = [
  { id: 1, name: "PAN Card", required: true, acceptedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5, note: "Applicant PAN" },
  { id: 2, name: "Aadhaar Card", required: true, acceptedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5, note: "Address must match" },
  { id: 3, name: "Address Proof", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 10, note: "Utility bill or rent agreement" },
  { id: 4, name: "Bank Statements", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 10, note: "Last 6 months" },
  { id: 5, name: "Machine Quotation", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 10, note: "Model, year, serial number and condition" },
  { id: 6, name: "Insurance Proposal", required: true, acceptedTypes: ["pdf"], maxSizeMb: 5, note: "Equipment insurance" },
  { id: 7, name: "Operator Credentials", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 5, note: "Licence and experience" },
  { id: 8, name: "Business Premises Consent", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 10, note: "Lease or ownership deed" },
  { id: 9, name: "PAN and Aadhaar KYC", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 5, note: "Self-attested copies" },
  { id: 10, name: "Registration Permissions", required: true, acceptedTypes: ["pdf"], maxSizeMb: 5, note: "Trade licences where applicable" },
  { id: 11, name: "Customer Enquiries / LOI", required: false, acceptedTypes: ["pdf"], maxSizeMb: 10, note: "Optional - supports demand" },
  { id: 12, name: "Valuation Report", required: false, acceptedTypes: ["pdf"], maxSizeMb: 10, note: "Optional - used equipment valuation" },
  { id: 13, name: "Promoter Contribution Evidence", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 5, note: "Rs. 5.00 lakh own contribution" },
];

const REQUIRED_COUNT = documentCategories.filter((category) => category.required).length;
const MIN_COMPLIANCE = 80;

export default function DocumentSubmissionPage() {
  const [userType, setUserType] = useState<"ca" | "applicant">("applicant");
  const [uploaded, setUploaded] = useState<number[]>([]);
  const [verified, setVerified] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as "ca" | "applicant");
    }
  }, []);

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    category: DocumentCategory
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!category.acceptedTypes.includes(extension)) {
      setMessage(
        `Invalid file type for ${category.name}. Accepted types: ${category.acceptedTypes.join(", ")}`
      );
      return;
    }

    if (file.size > category.maxSizeMb * 1024 * 1024) {
      setMessage(`File size exceeds ${category.maxSizeMb} MB limit for ${category.name}`);
      return;
    }

    setUploaded((previous) =>
      previous.includes(category.id) ? previous : [...previous, category.id]
    );
    setVerified((previous) =>
      previous.includes(category.id) ? previous : [...previous, category.id]
    );
    setMessage(`${file.name} uploaded and verified for ${category.name}.`);
  };

  const requiredUploaded = documentCategories.filter(
    (category) => category.required && uploaded.includes(category.id)
  ).length;
  const compliancePercentage = Math.round((requiredUploaded / REQUIRED_COUNT) * 100);
  const meetsMinimum = compliancePercentage >= MIN_COMPLIANCE;

  const handleSubmit = () => {
    if (!meetsMinimum) {
      setMessage(
        `Minimum ${MIN_COMPLIANCE}% document compliance required before CA review. Current: ${compliancePercentage}%.`
      );
      return;
    }
    setMessage("");
    localStorage.setItem("dpr_document_uploaded", JSON.stringify(uploaded));
    router.push("/loan-repayment");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v10a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">Document Submission</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-sm">
            Welcome, {userType === "ca" ? "CA Firm" : "Applicant"}
          </span>
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
        <div className="max-w-3xl mx-auto">
          {/* Compliance summary */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-header mb-0">Submission Compliance</h3>
              <span className="text-sm font-semibold text-secondary">
                {requiredUploaded} of {REQUIRED_COUNT} mandatory documents
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-3 ${meetsMinimum ? "bg-primary" : "bg-accent"}`}
                style={{ width: `${compliancePercentage}%` }}
              />
            </div>
            <p className="text-sm text-zinc-600 mt-2">
              Compliance: <span className="font-semibold text-secondary">{compliancePercentage}%</span>{" "}
              (minimum {MIN_COMPLIANCE}% required before CA review)
            </p>
          </div>

          {message && <div className="alert-info mb-6">{message}</div>}

          {/* Document categories */}
          <div className="card mb-8">
            <h3 className="section-header">MUDRA Tarun Document Checklist</h3>
            <div className="divide-y divide-zinc-200">
              {documentCategories.map((category) => {
                const isUploaded = uploaded.includes(category.id);
                const isVerified = verified.includes(category.id);
                return (
                  <div key={category.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-secondary">
                        {category.id}. {category.name}
                        {category.required ? (
                          <span className="text-red-600 text-xs ml-2">Mandatory</span>
                        ) : (
                          <span className="text-zinc-400 text-xs ml-2">Optional</span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">{category.note}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {category.acceptedTypes.join(", ").toUpperCase()} · max {category.maxSizeMb} MB
                      </p>
                      {isUploaded && (
                        <p className="text-xs mt-1 text-primary">
                          {isVerified ? "✔ Verified" : "Uploaded"}
                        </p>
                      )}
                    </div>
                    <div className="w-48">
                      <input
                        type="file"
                        onChange={(event) => handleFileSelect(event, category)}
                        accept={category.acceptedTypes.map((type) => `.${type}`).join(",")}
                        className="w-full text-xs text-zinc-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button onClick={handleSubmit} className="btn-primary">
              {userType === "applicant" ? "Proceed to Loan Repayment" : "Continue to CA Review Workflow"}
            </button>
            <button onClick={() => router.push("/project-information")} className="btn-secondary">
              Back
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-secondary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
