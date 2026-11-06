/* 
 * Document Management - DPR Preparation Application
 * Screen 14: Document Upload and Validation
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → Cash Flow → Break-Even → Balance Sheet → Implementation Schedule → Document Management → ... 
 * 
 * Integrates with:
   - Document Submission: 13 categories already uploaded/compliance checked
   - Implementation Schedule: Project timing and dependencies
   - Dashboard: Project selection and navigation
 * 
 * Per SRS Section 13 and Screen 14 Requirements:
   - 12 mandatory document categories + optional categories
   - File type validation (PDF, JPG, PNG)
   - File size limits per category
   - At least 80% of required documents must be uploaded before "Submit for Review" becomes available
   - Machine quotation validations (model, year, serial number, condition assessment)
   - Bank statements must show at least 6 months history
   - Promoter contribution evidence must show Rs. 5.00 lakh transfer/investment
   - Verification status: pending/verified/rejected
   - Verification notes by reviewer
   - Project completeness score: (verified documents / total required) × 100
   - Minimum 80% compliance required before CA review submission
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DocumentManagementPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('applicant');
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // 12 mandatory document categories for MUDRA submission (from SRS Screen 13)
  // Note: Module 7 had 13 categories; this screen has 12 mandatory + some optional
  const documentCategories = [
    { id: 1, name: "PAN Card", mandatory: true, uploaded: false, acceptedTypes: ["pdf", "jpg", "png"], maxSize: 5 }, // MB
    { id: 2, name: "Aadhaar Card", mandatory: true, uploaded: false, acceptedTypes: ["pdf", "jpg", "png"], maxSize: 5 }, // MB
    { id: 3, name: "Address Proof", mandatory: true, uploaded: false, acceptedTypes: ["pdf", "jpg"], maxSize: 10 }, // MB
    { id: 4, name: "Bank Statements", mandatory: true, uploaded: false, acceptedTypes: ["pdf", "jpg"], maxSize: 10 }, // MB (last 6 months)
    { id: 5, name: "Machine Quotation", mandatory: true, uploaded: false, acceptedTypes: ["pdf", "jpg"], maxSize: 10 }, // MB (must include model, year, serial, condition)
    { id: 6, name: "Insurance Proposal", mandatory: true, uploaded: false, acceptedTypes: ["pdf"], maxSize: 5 }, // MB
    { id: 7, name: "Operator Credentials", mandatory: true, uploaded: false, acceptedTypes: ["pdf", "jpg"], maxSize: 5 }, // MB
    { id: 8, name: "Business Premises Consent", mandatory: true, uploaded: false, acceptedTypes: ["pdf", "jpg"], maxSize: 10 }, // MB (lease/ownership deed)
    { id: 9, name: "PAN and Aadhaar KYC", mandatory: true, uploaded: false, acceptedTypes: ["pdf", "jpg"], maxSize: 5 }, // MB
    { id: 10, name: "Registration Permissions", mandatory: true, uploaded: false, acceptedTypes: ["pdf"], maxSize: 5 }, // MB (trade licenses)
    { id: 11, name: "Customer Enquiries/LOI", mandatory: false, uploaded: false, acceptedTypes: ["pdf"], maxSize: 10 }, // MB (optional)
    { id: 12, name: "Valuation Report", mandatory: false, uploaded: false, acceptedTypes: ["pdf"], maxSize: 10 }, // MB (optional)
  ];

  // Track upload status for each category
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'verified' | 'rejected'>('idle');
  const [compliancePercentage, setCompliancePercentage] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalRequired, setTotalRequired] = useState(12); // 12 mandatory categories

  // Calculate compliance percentage
  const calculateCompliance = (): number => {
    if (totalRequired === 0) return 0;
    return Math.round((uploadedCount / totalRequired) * 100);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, categoryId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const category = documentCategories.find(c => c.id === categoryId);
    const accepted = category?.acceptedTypes || [];
    const isTypeAccepted = accepted.includes(fileExtension as any);

    if (!isTypeAccepted) {
      alert(`Invalid file type for ${category?.name}. Accepted types: ${accepted.join(", ")}`);
      return;
    }

    // Validate file size
    const maxSizeMb = category?.maxSize ?? 10;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`File size exceeds limit of ${maxSizeMb}MB for ${category?.name}`);
      return;
    }

    // Simulate upload
    setUploadProgress("uploading");
    setTimeout(() => {
      setUploadProgress("verified");
      setUploadedCount(prev => {
        const newCount = prev + 1;
        setCompliancePercentage(calculateCompliance());
        return newCount;
      });
    }, 1000);
  };

  // Verify a document (CA firm only)
  const verifyDocument = (categoryId: number, status: 'verified' | 'rejected', notes: string) => {
    const category = documentCategories.find(c => c.id === categoryId);
    if (!category || userType !== 'ca') return;
    
    // In a real system, this would call an API to update verification status
    // For demo, just update locally
    setUploadProgress("verified");
    setCompliancePercentage(calculateCompliance());
    alert(`Document ${category.name} ${status}: ${notes || "No notes"}`);
  };

  // Compliance check
  const meetsCompliance = calculateCompliance() >= 80;

  const handleBack = () => {
    router.push('/implementation-schedule');
  };

  const handleSubmit = () => {
    if (!meetsCompliance) {
      alert("Minimum 80% document compliance required before submitting for CA review. Please upload more documents.");
      return;
    }
    
    // Applicants limited to screens 1-17, CA firms to all 18
    if (userType === 'applicant') {
      router.push("/risk-assessment");
    } else {
      router.push("/risk-assessment");
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
            <h2 className="font-semibold text-secondary text-lg">Document Management</h2>
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
          {/* Compliance Status */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Compliance Status</h3>
            <p className="text-zinc-500 text-sm mb-4">
              12 mandatory document categories required for MUDRA Tarun submission. Minimum 80% compliance required before CA review submission.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="font-medium text-secondary">Uploaded</p>
                <p className="text-2xl font-bold text-primary">{uploadedCount}</p>
                <p className="text-zinc-500 text-xs">of {totalRequired} mandatory</p>
              </div>
              <div>
                <p className="font-medium text-secondary">Compliance</p>
                <p className="text-2xl font-bold {compliancePercentage >= 80 ? 'text-primary' : 'text-red-600'}">
                  {compliancePercentage}%
                </p>
                <p className="text-zinc-500 text-xs">minimum 80% required</p>
              </div>
            </div>
            
            <progress
              className="w-full mt-2 height-2 rounded-md {compliancePercentage >= 80 ? 'bg-primary' : 'bg-red-500'}"
              value={compliancePercentage}
              max={100}
              aria-label="Document compliance progress"
            />
            
            {compliancePercentage >= 80 && userType === 'applicant' && (
              <p className="mt-2 text-primary text-sm">
                ✅ 80% compliance reached → "Submit for CA Review" available
              </p>
            )}\n\n{compliancePercentage < 80 && userType === 'applicant' && (
              <p className="mt-2 text-red-600 text-sm">
                ❌ Minimum 80% not met. Upload more documents before submitting.
              </p>
            )}\n\n{userType === 'ca' && compliancePercentage >= 80 && (
              <p className="mt-2 text-primary text-sm">
                ✅ 80% compliance reached. CA can review documents.
              </p>
            )}\n\n{compliancePercentage < 80 && userType === 'ca' && (
              <p className="mt-2 text-red-600 text-sm">
                ❌ Minimum 80% not met. Upload more documents.
              </p>
            )}</div>

          {/* Document Upload Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-6">Upload Documents for MUDRA Tarun Submission</h3>
            <p className="text-zinc-500 text-sm mb-4">
              Upload documents in the categories below. Each document must meet the file type and size requirements.
            </p>
            
            {documentCategories.map((category) => (
              <div key={category.id} className="mb-4 p-3 rounded-md border-2 border-zinc-200 {category.mandatory ? '' : 'border-zinc-300'}">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={category.mandatory ? 'text-secondary font-medium' : 'text-zinc-400'}>
                      {category.name}{category.mandatory ? ' *' : ''}
                    </span>
                    {category.mandatory && !category.uploaded && (
                      <span className="text-primary text-sm">↑ Upload</span>
                    )}
                  </div>
                  {category.uploaded && (
                    <span className="text-primary text-sm">✓ Uploaded</span>
                  )}
                  {(!category.mandatory || category.uploaded) && (
                    <span className="text-zinc-500 text-xs">({category.acceptedTypes.join("/").toUpperCase()}, max {category.maxSize}MB)</span>
                  )}
                </div>

                {category.mandatory && !category.uploaded && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Select {category.name} File
                    </label>
                    <input
                      type="file"
                      accept={category.acceptedTypes.map(t => `.${t}`).join(",")}
                      onChange={(e) => handleFileSelect(e, category.id)}
                      className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    />
                    {category.maxSize && (
                      <p className="text-zinc-500 text-xs mt-1">Max {category.maxSize}MB, PDF/JPG/PNG formats</p>
                    )}
                  </div>
                )}

                {category.mandatory && category.uploaded && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-primary">Verified</span>
                  </div>
                )}

                {(!category.mandatory || category.uploaded) && category.maxSize && (
                  <p className="text-zinc-500 text-xs mt-1">Max {category.maxSize}MB</p>
                )}
              </div>
            ))}

            {/* Optional note about machine quotation validations */}
            {documentCategories.some(c => c.id === 5) && (
              <div className="mt-4 p-3 rounded-md bg-primary/10 border-primary">
                <p className="font-medium text-secondary mb-2">Machine Quotation Validations</p>
                <p className="text-sm text-zinc-500">
                  Machine quotation document must include:<br />
                  • Equipment model name/description<br />
                  • Year of manufacture<br />
                  • Serial number<br />
                  • Condition assessment (e.g., "Good/5 years old/Recently overhauled")<br />
                  • Purchase price in INR<br />
                  • Seller/dealer name and contact
                </p>
              </div>
            )}

            {/* Optional note about bank statements */}
            {documentCategories.some(c => c.id === 4) && (
              <div className="mt-4 p-3 bg-primary/10 border-primary">
                <p className="font-medium text-secondary mb-2">Bank Statements</p>
                <p className="text-sm text-zinc-500">
                  Must show at least 6 months history. Account holder name must match applicant name. Stamped/validated preferred.
                </p>
              </div>
            )}

            {/* Optional note about promoter contribution */}
            {documentCategories.some(c => c.id === 9) && (
              <div className="mt-4 p-3 bg-primary/10 border-primary">
                <p className="font-medium text-secondary mb-2">PAN and Aadhaar KYC</p>
                <p className="text-sm text-zinc-500">
                  Additional identity/address proof if applicable. Must match applicant details.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={!meetsCompliance && userType === 'applicant'}
              className={!meetsCompliance && userType === 'applicant' ? 'btn-secondary opacity-50' : 'btn-primary'}
            >
              {compliancePercentage < 80 && userType === 'applicant' ? 'Upload More Documents' : userType === 'applicant' ? 'Submit for CA Review' : 'Continue to CA Review'}
            </button>
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              Back to Implementation Schedule
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}