/* 
 * Conclusion & Confirmation - DPR Preparation Application
 * Screen 16: Conclusion & Confirmation
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → Cash Flow → Break-Even → Balance Sheet → Implementation Schedule → Document Management → Risk Assessment → Conclusion & Confirmation → ... 
 * 
 * Integrates with:
   - Risk Assessment: Risks assessed, summary report generated
   - Document Management: 80% compliance verified, documents uploaded
   - Dashboard: Project selection and navigation
 * 
 * Per SRS Section 15 and Screen 16 Requirements:
   - Applicant confirmation statement (read-only, auto-generated)
   - Personal and business information accuracy confirmation (mandatory checkbox)
   - Financial projections understanding confirmation (mandatory checkbox: "I understand projections are estimates")
   - Machine quotation reliance confirmation (mandatory checkbox: "Quotations are planning assumptions, not confirmed orders")
   - Signature field (digital signature or typed name)
   - Date of declaration (auto-filled with current date, editable)
   - Place/location (mandatory, defaults to applicant address city)
   - Actions: "Preview DPR" button, "Submit for CA Review" button, "Download Completed DPR" button
   - Validations: All mandatory fields must be filled before actions enabled
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConclusionPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('ca');
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // Form state
  const [infoAccuracy, setInfoAccuracy] = useState(false);
  const [projectionsUnderstanding, setProjectionsUnderstanding] = useState(false);
  const [quotationReliance, setQuotationReliance] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const [declarationDate, setDeclarationDate] = useState<Date>(new Date());
  const [placeLocation, setPlaceLocation] = useState<string>("");
  
  // Auto-fill place from prior context (simulated)
  const [autoFilledPlace, setAutoFilledPlace] = useState<string>("");
  
  // Track if form is complete
  const isFormComplete = infoAccuracy && projectionsUnderstanding && quotationReliance && signature.trim().length > 0;
  
  // Handle input changes
  const handleInfoAccuracyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfoAccuracy(e.target.checked);
  };
  const handleProjectionsUnderstandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectionsUnderstanding(e.target.checked);
  };
  const handleQuotationRelianceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuotationReliance(e.target.checked);
  };
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(e.target.value);
  };
  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceLocation(e.target.value);
  };

  // Declaration date auto-filled
  useEffect(() => {
    setDeclarationDate(new Date());
  }, []);

  // Generate auto-generated confirmation statement
  const confirmationStatement = infoAccuracy && projectionsUnderstanding && quotationReliance
    ? "I hereby confirm that all information provided in this Detailed Project Report is true and correct to the best of my knowledge. I understand that the financial projections are estimates and rely on the machine quotations as planning assumptions, not confirmed orders."
    : "";

  // Generate preview DPR
  const generatePreview = () => {
    // Collect all data from prior modules (simulated)
    const previewData = {
      applicantType: userType,
      formComplete: isFormComplete,
      infoAccuracy,
      projectionsUnderstanding,
      quotationReliance,
      signature: signature || "Not provided",
      declarationDate: declarationDate.toLocaleDateString(),
      placeLocation: placeLocation || autoFilledPlace || "Nellore", // default from PDF applicant
      totalProjectCost: "10.00 lakh", // from project creation
      mudraLoan: "10.00 lakh", // from project creation
      compliancePercentage: Math.min(95, 80 + Math.floor(Math.random() * 15)), // simulated
      riskAssessment: "Completed", // from risk assessment module
    };
    
    // Store preview data and navigate
    localStorage.setItem("dprPreviewData", JSON.stringify(previewData));
    
    // Applicants limited to screens 1-17, CA firms to all 18
    if (userType === 'applicant') {
      router.push("/final-reports");
    } else {
      router.push("/final-reports");
    }
  };

  // Submit for CA Review
  const submitForReview = () => {
    if (!isFormComplete) {
      alert("Please complete all mandatory fields before submitting for CA Review.");
      return;
    }
    
    // In a real system, this would route to CA workflow
    // For now, simulate and navigate
    alert("DPR submitted for CA Review. Reference number will be provided upon CA assignment.");
    
    // Navigate based on user type
    if (userType === 'applicant') {
      router.push("/final-reports");
    } else {
      router.push("/final-reports");
    }
  };

  // Back handler
  const handleBack = () => {
    router.push('/risk-assessment');
  };

  // Auto-fill place location if empty (simulated PDF applicant context)
  useEffect(() => {
    if (!placeLocation && autoFilledPlace) {
      setPlaceLocation(autoFilledPlace);
    }
  }, [placeLocation, autoFilledPlace]);

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
            <h2 className="font-semibold text-secondary text-lg">Conclusion & Confirmation</h2>
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
          {/* Confirmation Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Applicant Declaration and Confirmation</h3>
            
            <p className="text-zinc-500 text-sm mb-4">
              Please confirm that all information provided in this Detailed Project Report is true and correct, and that you understand the nature of the financial projections.
            </p>
            
            {/* Confirmation Statement */}
            {confirmationStatement && (
              <div className="bg-primary/10 border-primary rounded-padding p-4 mb-6">
                <p className="font-medium text-secondary mb-2">Confirmation Statement:</p>
                <p className="text-sm leading-relaxed">{confirmationStatement}</p>
              </div>
            )}
            
            {/* Mandatory Checkboxes */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={infoAccuracy}
                    onChange={handleInfoAccuracyChange}
                    className="w-4 h-4 rounded border-primary cursor-pointer"
                  />
                  <span>
                    I confirm that all personal and business information provided in this DPR is accurate and complete.
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={projectionsUnderstanding}
                    onChange={handleProjectionsUnderstandingChange}
                    className="w-4 h-4 rounded border-primary cursor-pointer"
                  />
                  <span>
                    I understand that the financial projections contained in this DPR are estimates and may differ from actual results.
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={quotationReliance}
                    onChange={handleQuotationRelianceChange}
                    className="w-4 h-4 rounded border-primary cursor-pointer"
                  />
                  <span>
                    Quotations are planning assumptions, not confirmed orders.
                  </span>
                </label>
              </div>
            </div>
            
            {/* Signature Section */}
            <div>
              <label className="block text-secondary font-medium mb-2">Signature</label>
              <p className="text-zinc-500 text-sm mb-1">
                {signature ? `Typed: ${signature}` : "Enter your name or digital signature"}
              </p>
              <input
                type="text"
                value={signature}
                onChange={handleSignatureChange}
                placeholder="John Doe / Digital Signature"
                className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            {/* Date and Place */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-secondary font-medium mb-1">Date of Declaration</label>
                <p className="text-zinc-500 text-sm">
                  <span className="font-medium">{declarationDate.toLocaleDateString()}</span>
                  {userType === 'applicant' && (
                    <button
                      onClick={() => setDeclarationDate(new Date())}
                      className="text-primary text-xs ml-1 underline cursor-pointer"
                    >
                      Reset to Today
                    </button>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Place / Location</label>
                <input
                  type="text"
                  value={placeLocation}
                  onChange={handlePlaceChange}
                  placeholder="Nellore"
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={generatePreview}
              disabled={!isFormComplete}
              className={isFormComplete ? 'btn-primary' : 'btn-secondary opacity-50'}
            >
              {isFormComplete ? 'Preview DPR' : 'Complete Mandatory Fields First'}
            </button>
            <button
              onClick={submitForReview}
              disabled={!isFormComplete}
              className={isFormComplete ? 'btn-primary' : 'btn-secondary opacity-50'}
            >
              {isFormComplete ? 'Submit for CA Review' : 'Complete Mandatory Fields First'}
            </button>
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              Back to Risk Assessment
            </button>
          </div>
          
          {/* Form completion progress */}
          {isFormComplete && (
            <div className="mt-4 p-3 rounded-md bg-primary/10 border-primary">
              <p className="font-medium text-secondary">✅ All mandatory fields complete. Ready to proceed.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}