/* 
 * Settings - DPR Preparation Application
 * Screen 18: Settings
 * 18-screen workflow: Login → Dashboard → Client Mgmt → Project Creation → Project Information → Document Submission → Loan Repayment → Cash Flow → Break-Even → Balance Sheet → Implementation Schedule → Document Management → Risk Assessment → Conclusion & Confirmation → Final Reports → Settings
 * 
 * Integrates with all prior modules for user preferences, firm configuration, and system settings.
 * 
 * Per SRS Section 18 and Screen 18 Requirements:
 * - User Profile section (Name, Email, User Type toggle, Membership Number for CA)
 * - Firm Configuration section (Firm Name, Address, GST Number, Registration)
 * - CA Dashboard Settings (Default review period, Show aging queue, Auto-notify applicants)
 * - Preferences section (Default DPR type, Currency, Date format, Dashboard progress, Auto-save assumptions)
 * - Data Management section (Retention period, Auto-archive, Export data backup)
 * - About section (Version, Terms of Service, Privacy Policy)
 * - Logout functionality
 * 
 * User Type Differentiation:
 * - Applicant: Sees only My Projects, restricted 17-screen workflow, cannot access CA review
 * - CA Firm: Sees all projects, all 18 screens, full CA review workflow, can generate all reports
 * - Switching user type warns: "Switching user type will change accessible screens and permissions"
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [userType, setUserType] = useState<'ca' | 'applicant'>('applicant');
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("dpr_user_type");
    if (storedType) {
      setUserType(storedType as 'ca' | 'applicant');
    }
  }, []);

  // User Profile state
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [membershipNumber, setMembershipNumber] = useState<string>("");
  const [lastLogin, setLastLogin] = useState<string>("");
  const [accountStatus, setAccountStatus] = useState<string>("Active");

  // Firm Configuration state
  const [firmName, setFirmName] = useState<string>("");
  const [firmAddress, setFirmAddress] = useState<string>("");
  const [firmGSTNumber, setFirmGSTNumber] = useState<string>("");
  const [firmRegistration, setFirmRegistration] = useState<string>("");
  const [defaultReviewPeriod, setDefaultReviewPeriod] = useState<string>("5 business days");
  const [showAgingQueue, setShowAgingQueue] = useState<boolean>(true);
  const [autoNotifyApplicants, setAutoNotifyApplicants] = useState<boolean>(true);

  // Preferences state
  const [defaultDPRType, setDefaultDPRType] = useState<string>("Earthmoving Equipment Rental");
  const [defaultCurrency, setDefaultCurrency] = useState<string>("INR");
  const [dateFormat, setDateFormat] = useState<string>("DD/MM/YYYY");
  const [dashboardProgress, setDashboardProgress] = useState<string>("Most advanced project");
  const [autoSaveAssumptions, setAutoSaveAssumptions] = useState<boolean>(true);

  // Form validation and state
  const [showSwitchTypeWarning, setShowSwitchTypeWarning] = useState<boolean>(false);

  useEffect(() => {
    // Initialize form values based on user type
    const mockData = {
      ca: {
        fullName: "Rahul Sharma",
        email: "rahul.sharma@cafirms.com",
        membershipNumber: "MH0521",
        lastLogin: "25-11-2026 02:30 PM",
        accountStatus: "Active",
        firmName: "Sharma & Associates",
        firmAddress: "12, Commercial Complex, Connaught Place, New Delhi",
        firmGSTNumber: "07AAHSS1234C",
        firmRegistration: "M No: 072185",
        defaultReviewPeriod: "5 business days",
        showAgingQueue: true,
        autoNotifyApplicants: true,
        defaultDPRType: "Earthmoving Equipment Rental",
        defaultCurrency: "INR",
        dateFormat: "DD/MM/YYYY",
        dashboardProgress: "Most advanced project",
        autoSaveAssumptions: true,
      },
      applicant: {
        fullName: "Kalicheti Vijay Kumar Reddy",
        email: "kalicheti.vk@example.com",
        membershipNumber: "",
        lastLogin: "15-11-2026 10:15 AM",
        accountStatus: "Active",
        firmName: "",
        firmAddress: "",
        firmGSTNumber: "",
        firmRegistration: "",
        defaultReviewPeriod: "5 business days",
        showAgingQueue: true,
        autoNotifyApplicants: true,
        defaultDPRType: "Earthmoving Equipment Rental",
        defaultCurrency: "INR",
        dateFormat: "DD/MM/YYYY",
        dashboardProgress: "Most advanced project",
        autoSaveAssumptions: true,
      },
    };

    const data = mockData[userType as 'ca' | 'applicant'];
    if (data) {
      setFullName(data.fullName);
      setEmail(data.email);
      setMembershipNumber(data.membershipNumber);
      setLastLogin(data.lastLogin);
      setAccountStatus(data.accountStatus);
      setFirmName(data.firmName);
      setFirmAddress(data.firmAddress);
      setFirmGSTNumber(data.firmGSTNumber);
      setFirmRegistration(data.firmRegistration);
      setDefaultReviewPeriod(data.defaultReviewPeriod);
      setShowAgingQueue(data.showAgingQueue);
      setAutoNotifyApplicants(data.autoNotifyApplicants);
      setDefaultDPRType(data.defaultDPRType);
      setDefaultCurrency(data.defaultCurrency);
      setDateFormat(data.dateFormat);
      setDashboardProgress(data.dashboardProgress);
      setAutoSaveAssumptions(data.autoSaveAssumptions);
    }
  }, [userType]);

  // Handle user type switch - warn and prevent
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as 'ca' | 'applicant';
    setShowSwitchTypeWarning(true);
    // Revert - we'll handle this via a modal/confirmation in production
    // For now, just show the warning and stay on current type
    e.target.checked = userType === 'ca' ? true : false;
  };

  const confirmUserTypeSwitch = () => {
    setShowSwitchTypeWarning(false);
    // In production, this would trigger a confirmation modal
    // For now, just navigate based on the new type
    const newType = (document.querySelector('input[name="userType"]:checked') as HTMLInputElement | null)?.value;
    if (newType) {
      localStorage.setItem("dpr_user_type", newType);
      setUserType(newType as 'ca' | 'applicant');
      // Reset form values for new user type
      const mockData = {
        ca: {
          fullName: "Rahul Sharma",
          email: "rahul.sharma@cafirms.com",
          membershipNumber: "MH0521",
          lastLogin: "25-11-2026 02:30 PM",
          accountStatus: "Active",
          firmName: "Sharma & Associates",
          firmAddress: "12, Commercial Complex, Connaught Place, New Delhi",
          firmGSTNumber: "07AAHSS1234C",
          firmRegistration: "M No: 072185",
          defaultReviewPeriod: "5 business days",
          showAgingQueue: true,
          autoNotifyApplicants: true,
          defaultDPRType: "Earthmoving Equipment Rental",
          defaultCurrency: "INR",
          dateFormat: "DD/MM/YYYY",
          dashboardProgress: "Most advanced project",
          autoSaveAssumptions: true,
        },
        applicant: {
          fullName: "Kalicheti Vijay Kumar Reddy",
          email: "kalicheti.vk@example.com",
          membershipNumber: "",
          lastLogin: "15-11-2026 10:15 AM",
          accountStatus: "Active",
          firmName: "",
          firmAddress: "",
          firmGSTNumber: "",
          firmRegistration: "",
          defaultReviewPeriod: "5 business days",
          showAgingQueue: true,
          autoNotifyApplicants: true,
          defaultDPRType: "Earthmoving Equipment Rental",
          defaultCurrency: "INR",
          dateFormat: "DD/MM/YYYY",
          dashboardProgress: "Most advanced project",
          autoSaveAssumptions: true,
        },
      };
      const data = mockData[newType as 'ca' | 'applicant'];
      if (data) {
        setFullName(data.fullName);
        setEmail(data.email);
        setMembershipNumber(data.membershipNumber);
        setLastLogin(data.lastLogin);
        setAccountStatus(data.accountStatus);
        setFirmName(data.firmName);
        setFirmAddress(data.firmAddress);
        setFirmGSTNumber(data.firmGSTNumber);
        setFirmRegistration(data.firmRegistration);
        setDefaultReviewPeriod(data.defaultReviewPeriod);
        setShowAgingQueue(data.showAgingQueue);
        setAutoNotifyApplicants(data.autoNotifyApplicants);
        setDefaultDPRType(data.defaultDPRType);
        setDefaultCurrency(data.defaultCurrency);
        setDateFormat(data.dateFormat);
        setDashboardProgress(data.dashboardProgress);
        setAutoSaveAssumptions(data.autoSaveAssumptions);
      }
      router.push("/dashboard");
    }
  };

  // Handle preference saves
  const handleSavePreferences = () => {
    // In production, save preferences to user profile / system config
    alert("Preferences saved successfully!");
  };

  // Handle firm configuration save
  const handleSaveFirmConfig = () => {
    // In production, save firm configuration
    alert("Firm configuration saved successfully!");
  };

  // Handle data management actions
  const handleManageDataRetention = () => {
    // In production, open data retention management interface
    // Only for Admin users
    alert("Data retention management interface. Only for Admin users. Incorrect changes may affect data accessibility.");
  };

  // Handle check for updates
  const checkForUpdates = () => {
    // In production, check for newer version
    alert("You have the latest version v1.0 of the DPR Preparation System.");
  };

  // Applicants limited to screens 1-17, CA firms to all 18
  const navigateBasedOnType = (targetScreen: string) => {
    if (userType === 'applicant') {
      // Applicants can access screens 1-17; screen 18 (Settings) is CA-only
      // but we allow access for completion of the workflow
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
            <h2 className="font-semibold text-secondary text-lg">Settings</h2>
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
        <div className="max-w-5xl mx-auto">
          {/* User Profile Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">User Profile</h3>
            
            {/* Applicant/type switch */}
            <div className="mb-4">
              <label className="block text-secondary font-medium mb-2">
                <input
                  type="radio"
                  name="userType"
                  value="applicant"
                  checked={userType === 'applicant'}
                  onChange={handleUserTypeChange}
                  className="w-4 h-4 rounded border-primary cursor-pointer mr-2"
                />
                Applicant
              </label>
              <label className="block text-secondary font-medium mb-2">
                <input
                  type="radio"
                  name="userType"
                  value="ca"
                  checked={userType === 'ca'}
                  onChange={handleUserTypeChange}
                  className="w-4 h-4 rounded border-primary cursor-pointer mr-2"
                />
                Chartered Accountant
              </label>
              {showSwitchTypeWarning && (
                <div className="mt-2 p-3 rounded-md bg-warning/10 border-warning">
                  <p className="font-medium text-warning">
                    ⚠️ Switching user type will change accessible screens and permissions. Your project data may be filtered differently.
                  </p>
                  <button
                    onClick={confirmUserTypeSwitch}
                    className="text-primary text-sm underline cursor-pointer mt-1"
                  >
                    Continue Switch
                  </button>
                  <button
                    onClick={() => setShowSwitchTypeWarning(false)}
                    className="text-zinc-500 text-sm ml-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-secondary font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  readOnly
                />
              </div>
            </div>

            {userType === 'ca' && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-secondary font-medium mb-1">Membership Number</label>
                  <input
                    type="text"
                    value={membershipNumber}
                    onChange={(e) => setMembershipNumber(e.target.value)}
                    placeholder="MH0521"
                    className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-secondary font-medium mb-1">Last Login</label>
                  <p className="text-zinc-500 text-sm">{lastLogin}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-secondary font-medium mb-1">Account Status</label>
              <p className="text-zinc-500 text-sm">{accountStatus}</p>
            </div>

            {userType === 'ca' && (
              <button
                onClick={() => setShowSwitchTypeWarning(true)}
                className="mt-3 w-full text-primary text-sm font-medium underline"
              >
                Change User Type
              </button>
            )}
          </div>

          {/* Firm Configuration Section (CA only) */}
          {userType === 'ca' && (
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="text-secondary font-medium mb-4">Firm Configuration</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-secondary font-medium mb-1">Firm Name</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Sharma & Associates"
                    className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-secondary font-medium mb-1">Firm Address</label>
                  <input
                    type="text"
                    value={firmAddress}
                    onChange={(e) => setFirmAddress(e.target.value)}
                    placeholder="12, Commercial Complex, Connaught Place, New Delhi"
                    className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-secondary font-medium mb-1">Firm GST Number</label>
                  <input
                    type="text"
                    value={firmGSTNumber}
                    onChange={(e) => setFirmGSTNumber(e.target.value)}
                    placeholder="07AAHSS1234C"
                    className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-secondary font-medium mb-1">Firm Registration</label>
                  <input
                    type="text"
                    value={firmRegistration}
                    onChange={(e) => setFirmRegistration(e.target.value)}
                    placeholder="M No: 072185"
                    className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-secondary font-medium mb-1">Default Review Period</label>
                  <select
                    value={defaultReviewPeriod}
                    onChange={(e) => setDefaultReviewPeriod(e.target.value)}
                    className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="3 business days">3 business days</option>
                    <option value="5 business days" selected>
                      5 business days
                    </option>
                    <option value="7 business days">7 business days</option>
                    <option value="10 business days">10 business days</option>
                    <option value="15 business days">15 business days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-secondary font-medium mb-1">Show Aging Queue</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showAgingQueue}
                      onChange={(e) => setShowAgingQueue(e.target.checked)}
                      className="w-4 h-4 rounded border-primary cursor-pointer"
                    />
                    Show aging queue (display "Days in queue" next to pending DPR assignments)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-secondary font-medium mb-1">Auto-Notify Applicants</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoNotifyApplicants}
                      onChange={(e) => setAutoNotifyApplicants(e.target.checked)}
                      className="w-4 h-4 rounded border-primary cursor-pointer"
                    />
                    Auto-send notification emails to applicants at status changes
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveFirmConfig}
                className="w-full mt-4 btn-primary"
              >
                Save Firm Configuration
              </button>
            </div>
          )}

          {/* Preferences Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Preferences</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-secondary font-medium mb-1">Default DPR Type</label>
                <select
                  value={defaultDPRType}
                  onChange={(e) => setDefaultDPRType(e.target.value)}
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Earthmoving Equipment Rental">Earthmoving Equipment Rental</option>
                  <option value="Store">Store</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Study">Study</option>
                  <option value="AI Chat">AI Chat Assistant</option>
                  <option value="CRM">CRM Dashboard</option>
                  <option value="Chess">Chess</option>
                  <option value="Flappy Bird">Flappy Bird</option>
                  <option value="Bedwars">Bedwars</option>
                  <option value="Crosscut">Crosscut</option>
                  {/* Custom types could be added here */}
                </select>
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Default Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="INR">INR (Indian Rupees)</option>
                  <option value="USD">USD (US Dollars)</option>
                  <option value="EUR">EUR (Euros)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-secondary font-medium mb-1">Date Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="DD/MM/YYYY" selected>
                    DD/MM/YYYY (Indian)
                  </option>
                  <option value="MM/DD/YYYY">
                    MM/DD/YYYY (US)
                  </option>
                  <option value="YYYY-MM-DD">
                    YYYY-MM-DD (ISO)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Dashboard Progress</label>
                <select
                  value={dashboardProgress}
                  onChange={(e) => setDashboardProgress(e.target.value)}
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Average across projects">Average across projects</option>
                  <option value="Most advanced project" selected>
                    Most advanced project
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-secondary font-medium mb-1">Auto-Save Assumptions</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoSaveAssumptions}
                  onChange={(e) => setAutoSaveAssumptions(e.target.checked)}
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                Yes (every 5 minutes) [default] / No
                <span className="text-zinc-500 text-xs ml-2">
                  "Yes": System automatically saves assumption inputs every 5 minutes to prevent data loss
                  if browser crashes or user navigates away unexpectedly
                </span>
              </label>
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full mt-4 btn-primary"
            >
              Save Preferences
            </button>
          </div>

          {/* Data Management Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-secondary font-medium mb-4">Data Management</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-secondary font-medium mb-1">Retention Period for Project Data</label>
                <select
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="3 years">3 years</option>
                  <option value="5 years" selected>
                    5 years
                  </option>
                  <option value="7 years">7 years</option>
                </select>
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Auto-Archive Projects Inactive For</label>
                <select
                  className="w-full rounded border-primary px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="6 months">6 months</option>
                  <option value="1 year" selected>
                    1 year
                  </option>
                  <option value="2 years">2 years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-secondary font-medium mb-1">Export Data Backup</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-primary cursor-pointer"
                />
                Enable weekly auto-backup [default]
                <span className="text-zinc-500 text-xs ml-2">
                  System performs weekly backup of all project data to secure storage every Sunday
                  at 02:00 AM
                </span>
              </label>
            </div>

            <button
              onClick={handleManageDataRetention}
              className="w-full mt-4 btn-primary"
            >
              Manage Data Retention
            </button>
            <p className="text-zinc-500 text-xs mt-2">
              Only for Admin users. Incorrect changes may affect data accessibility.
            </p>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-secondary font-medium mb-4">About</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-zinc-500 text-sm">DPR Preparation System v1.0</p>
                <p className="text-zinc-500 text-sm">Developed for Chartered Accountant firms</p>
                <p className="text-zinc-500 text-sm">for MUDRA DPR preparation (Earthmoving Equipment Rental business type)</p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm">Based on: Pradhan Mantri MUDRA Yojana (PMMY) Guidelines</p>
                <p className="text-zinc-500 text-sm">and PMMY Overview</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={checkForUpdates}
                className="w-full text-primary text-sm font-medium underline"
              >
                Check for Updates
              </button>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-primary text-sm font-medium underline"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-primary text-sm font-medium underline"
              >
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-8 p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-red-600 font-medium mb-2">Logout</p>
            <p className="text-zinc-500 text-sm">
              Are you sure you want to sign out? Your current project progress will be saved
              and you can resume when you log back in.
            </p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => {
                  localStorage.removeItem("dpr_user_type");
                  localStorage.removeItem("dpr_user_id");
                  router.push("/login");
                }}
                className="btn-primary flex-1"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowSwitchTypeWarning(true)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}