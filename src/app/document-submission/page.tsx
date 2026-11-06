/*
 * Document Submission - DPR Preparation Application
 * Screen 4: mandatory document uploads for MUDRA Tarun submission.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DocumentCategory = {
  id: number;
  name: string;
  required: boolean;
  acceptedTypes: string[];
  maxSizeMb: number;
};

const CATEGORIES: DocumentCategory[] = [
  { id: 1, name: "PAN Card", required: true, acceptedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5 },
  { id: 2, name: "Aadhaar Card", required: true, acceptedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5 },
  { id: 3, name: "Address Proof", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 10 },
  { id: 4, name: "Bank Statements", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 10 },
  { id: 5, name: "Machine Quotation", required: true, acceptedTypes: ["pdf", "jpg", "png"], maxSizeMb: 10 },
  { id: 6, name: "Insurance Proposal", required: true, acceptedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5 },
  { id: 7, name: "Operator Credentials", required: true, acceptedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5 },
  { id: 8, name: "Business Premises Consent", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 10 },
  { id: 9, name: "PAN and Aadhaar KYC", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 5 },
  { id: 10, name: "Registration Permissions", required: true, acceptedTypes: ["pdf"], maxSizeMb: 5 },
  { id: 11, name: "Promoter Contribution Evidence", required: true, acceptedTypes: ["pdf", "jpg"], maxSizeMb: 5 },
  { id: 12, name: "Customer Enquiries / LOI", required: false, acceptedTypes: ["pdf"], maxSizeMb: 10 },
  { id: 13, name: "Valuation Report", required: false, acceptedTypes: ["pdf"], maxSizeMb: 10 },
];

const REQUIRED = CATEGORIES.filter((category) => category.required).length;
const MIN_COMPLIANCE = 80;

export default function DocumentSubmissionPage() {
  const router = useRouter();
  const [uploaded, setUploaded] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "error">("info");

  useEffect(() => {
    const stored = localStorage.getItem("dpr_document_uploaded");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as number[];
        if (Array.isArray(parsed)) setUploaded(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  const handleFile = (category: DocumentCategory, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!category.acceptedTypes.includes(extension)) {
      setMessageTone("error");
      setMessage(`${category.name}: accepted formats are ${category.acceptedTypes.join(", ").toUpperCase()}.`);
      return;
    }
    if (file.size > category.maxSizeMb * 1024 * 1024) {
      setMessageTone("error");
      setMessage(`${category.name}: file must be under ${category.maxSizeMb}MB.`);
      return;
    }

    const next = uploaded.includes(category.id) ? uploaded : [...uploaded, category.id];
    setUploaded(next);
    localStorage.setItem("dpr_document_uploaded", JSON.stringify(next));
    setMessageTone("info");
    setMessage(`${file.name} added to ${category.name}.`);
  };

  const uploadedRequired = CATEGORIES.filter(
    (category) => category.required && uploaded.includes(category.id)
  ).length;
  const compliance = Math.round((uploadedRequired / REQUIRED) * 100);
  const meetsMinimum = compliance >= MIN_COMPLIANCE;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">DPR</span>
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-lg">Document Submission</h2>
            <p className="text-zinc-500 text-sm">DPR Preparation System</p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-primary text-sm font-medium underline">
          Home
        </button>
      </header>

      <main className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Compliance */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-secondary font-medium text-lg mb-3">Compliance Status</h3>
            <p className="text-sm text-zinc-500 mb-4">
              {REQUIRED} mandatory documents. At least {MIN_COMPLIANCE}% is required before the DPR can be generated.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-zinc-500">Uploaded</p>
                <p className="text-2xl font-bold text-primary">
                  {uploadedRequired} <span className="text-base font-normal text-zinc-500">of {REQUIRED}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Compliance</p>
                <p className="text-2xl font-bold text-primary">{compliance}%</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${compliance}%` }} />
            </div>
            <p className={`text-sm mt-2 ${meetsMinimum ? "text-primary" : "text-red-600"}`}>
              {meetsMinimum
                ? "Minimum compliance reached. Documents are ready for review."
                : `Upload ${REQUIRED - uploadedRequired} more mandatory document(s) to reach ${MIN_COMPLIANCE}%.`}
            </p>
          </section>

          {message && (
            <div
              className={`rounded-md px-4 py-3 text-sm ${
                messageTone === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-primary/5 text-primary border border-primary/20"
              }`}
            >
              {message}
            </div>
          )}

          {/* Upload cards */}
          <div className="space-y-4">
            {CATEGORIES.map((category) => {
              const isUploaded = uploaded.includes(category.id);
              return (
                <section
                  key={category.id}
                  className={`bg-white rounded-lg p-5 border ${
                    isUploaded ? "border-primary/40" : "border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-secondary">
                      {category.name}
                      {category.required && <span className="text-red-600 ml-1">*</span>}
                    </h4>
                    {isUploaded ? (
                      <span className="text-primary text-sm">✓ Uploaded</span>
                    ) : (
                      <span className="text-zinc-500 text-sm">↑ Upload</span>
                    )}
                  </div>

                  <label className="block text-sm text-secondary mb-1">
                    Select {category.name} File
                  </label>
                  <input
                    type="file"
                    accept={category.acceptedTypes.map((type) => `.${type}`).join(",")}
                    onChange={(event) => handleFile(category, event)}
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm cursor-pointer"
                  />
                  <p className="text-zinc-500 text-xs mt-1">
                    Max {category.maxSizeMb}MB, {category.acceptedTypes.map((type) => type.toUpperCase()).join("/")} formats
                  </p>
                </section>
              );
            })}
          </div>

          <div className="flex gap-3 pb-6">
            <button
              onClick={() => {
                if (!meetsMinimum) {
                  setMessageTone("error");
                  setMessage(`Minimum ${MIN_COMPLIANCE}% compliance required before continuing (currently ${compliance}%).`);
                  return;
                }
                router.push("/loan-repayment");
              }}
              className="btn-primary"
            >
              Continue to Loan Repayment
            </button>
            <button onClick={() => router.push("/project-information")} className="btn-secondary">
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
