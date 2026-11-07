/*
 * Activity configuration: questions, document checklist and analysis sections
 * per business activity. Everything the form engine and document checklist need
 * comes from here, so a new activity is a config entry, not new code.
 */

export type QuestionType = "text" | "number" | "date" | "select" | "textarea";

export type Question = {
  id: string;
  label: string;
  type: QuestionType;
  section: string;
  required?: boolean;
  help?: string;
  unit?: string;
  options?: string[];
  placeholder?: string;
  showIf?: { questionId: string; equals: string };
};

export type RequiredDocument = {
  name: string;
  required: boolean;
  maxMb: number;
  formats: string[];
};

export type ActivityConfig = {
  activityId: string;
  activityName: string;
  summary: string;
  revenueBasis: string;
  sections: string[];
  questions: Question[];
  documents: RequiredDocument[];
  technicalSections: string[];
};

export const SECTIONS = ["Project basics", "Capacity and operations", "Revenue", "Operating costs", "Financing"];

const doc = (name: string, required = true, maxMb = 5, formats = ["pdf", "jpg", "png"]): RequiredDocument => ({
  name,
  required,
  maxMb,
  formats,
});

const KYC_DOCUMENTS = [
  doc("PAN Card", true, 5),
  doc("Aadhaar Card", true, 5),
  doc("Address Proof", true, 10, ["pdf", "jpg"]),
  doc("Bank Statements", true, 10, ["pdf", "jpg"]),
];

const REGISTRATION_DOCUMENTS = [
  doc("Udyam Registration", false, 5),
  doc("GST Registration", false, 5),
  doc("Business Registration Proof", true, 5),
];

const loanQuestions: Question[] = [
  { id: "loanAmount", label: "Proposed term loan", type: "number", section: "Financing", unit: "Rs.", required: true },
  { id: "promoterContribution", label: "Promoter contribution", type: "number", section: "Financing", unit: "Rs.", required: true },
  { id: "interestRate", label: "Expected interest rate", type: "number", section: "Financing", unit: "% p.a." },
  { id: "tenureMonths", label: "Repayment tenure", type: "number", section: "Financing", unit: "months" },
];

const CONFIGS: Record<string, ActivityConfig> = {
  "earthmoving-equipment-rental": {
    activityId: "earthmoving-equipment-rental",
    activityName: "Earthmoving Equipment Rental",
    summary: "Fleet of earthmoving machines hired out on hourly or daily rates.",
    revenueBasis: "Billable machine hours × rental rate per hour",
    sections: SECTIONS,
    documents: [
      doc("Machine Quotation", false, 10),
      doc("Insurance Proposal", true, 5),
      doc("Operator Credentials", true, 5),
      doc("Business Premises Consent", true, 10, ["pdf", "jpg"]),
      ...KYC_DOCUMENTS,
      doc("Registration Permissions", true, 5, ["pdf"]),
      doc("Promoter Contribution Evidence", true, 5, ["pdf", "jpg"]),
      doc("Customer Enquiries / LOI", false, 10, ["pdf"]),
      doc("Valuation Report", false, 10, ["pdf"]),
    ],
    technicalSections: [
      "Equipment utilisation and operating capacity",
      "Rental model and customer contracts",
      "Fuel consumption and maintenance plan",
      "Operator deployment and insurance",
    ],
    questions: [
      { id: "equipmentCategory", label: "Equipment category", type: "select", section: "Project basics", required: true, options: ["Excavator", "Backhoe Loader (JCB)", "Crane", "Loader", "Tipper", "Mixed Fleet"] },
      { id: "numberOfMachines", label: "Number of machines", type: "number", section: "Capacity and operations", required: true },
      { id: "equipmentSpecifications", label: "Equipment specifications", type: "textarea", section: "Project basics", placeholder: "Model, capacity, year of manufacture" },
      { id: "purchasePrice", label: "Purchase price per machine", type: "number", section: "Project basics", unit: "Rs.", required: true },
      { id: "supplierDetails", label: "Supplier / dealer details", type: "text", section: "Project basics" },
      { id: "downPayment", label: "Down payment", type: "number", section: "Financing", unit: "Rs." },
      { id: "workingHoursPerMonth", label: "Working hours per machine per month", type: "number", section: "Capacity and operations", required: true },
      { id: "rentalRatePerHour", label: "Rental rate per hour", type: "number", section: "Revenue", unit: "Rs.", required: true },
      { id: "utilisation", label: "Expected utilisation", type: "number", section: "Capacity and operations", unit: "%", required: true },
      { id: "operatingDays", label: "Operating days per year", type: "number", section: "Capacity and operations", required: true },
      { id: "idleTime", label: "Expected idle time", type: "number", section: "Capacity and operations", unit: "%" },
      { id: "dieselConsumption", label: "Diesel consumption", type: "number", section: "Operating costs", unit: "litres/hour" },
      { id: "dieselPrice", label: "Diesel price", type: "number", section: "Operating costs", unit: "Rs./litre" },
      { id: "maintenanceExpenses", label: "Maintenance expenses", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "operatorSalary", label: "Operator salary", type: "number", section: "Operating costs", unit: "Rs./month" },
      { id: "insurance", label: "Insurance", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "transportation", label: "Transportation", type: "number", section: "Operating costs", unit: "Rs./year" },
      ...loanQuestions,
    ],
  },
  "rice-mill": {
    activityId: "rice-mill",
    activityName: "Rice Mill",
    summary: "Paddy procurement, milling and rice sales with by-product recovery.",
    revenueBasis: "Saleable rice quantity × selling price",
    sections: SECTIONS,
    documents: [
      doc("Machinery Quotations", false, 10),
      doc("Land and Building Documents", true, 10, ["pdf", "jpg"]),
      doc("Civil Construction Estimate", false, 10, ["pdf"]),
      doc("Electricity Connection Approval", true, 5, ["pdf"]),
      ...KYC_DOCUMENTS,
      ...REGISTRATION_DOCUMENTS,
      doc("Paddy Procurement Arrangements", false, 10, ["pdf"]),
      doc("Pollution / Factory Licence", false, 5, ["pdf"]),
    ],
    technicalSections: [
      "Manufacturing process and paddy flow",
      "Production capacity and recovery yield",
      "Raw material and storage requirements",
      "Power and manpower requirements",
    ],
    questions: [
      { id: "proposedCapacity", label: "Proposed production capacity", type: "number", section: "Capacity and operations", unit: "MT/day", required: true },
      { id: "paddyProcessingCapacity", label: "Paddy processing capacity", type: "number", section: "Capacity and operations", unit: "quintals/day", required: true },
      { id: "operatingDays", label: "Operating days per year", type: "number", section: "Capacity and operations", required: true },
      { id: "workingHours", label: "Working hours per day", type: "number", section: "Capacity and operations" },
      { id: "utilisation", label: "Expected capacity utilisation", type: "number", section: "Capacity and operations", unit: "%", required: true },
      { id: "paddyPrice", label: "Paddy procurement price", type: "number", section: "Revenue", unit: "Rs./quintal", required: true },
      { id: "riceRecovery", label: "Rice recovery percentage", type: "number", section: "Capacity and operations", unit: "%", required: true },
      { id: "byProductRecovery", label: "By-product recovery", type: "number", section: "Capacity and operations", unit: "%" },
      { id: "riceSellingPrice", label: "Rice selling price", type: "number", section: "Revenue", unit: "Rs./quintal", required: true },
      { id: "rawMaterialConsumption", label: "Raw material consumption", type: "number", section: "Operating costs", unit: "quintals/year" },
      { id: "powerConsumption", label: "Power consumption", type: "number", section: "Operating costs", unit: "units/year" },
      { id: "labourRequirement", label: "Labour requirement", type: "number", section: "Operating costs", unit: "persons" },
      { id: "machineryRequirement", label: "Machinery requirement", type: "textarea", section: "Project basics" },
      { id: "storageRequirement", label: "Storage requirement", type: "number", section: "Capacity and operations", unit: "sq.ft." },
      { id: "packagingExpenses", label: "Packaging expenses", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "transportation", label: "Transportation expenses", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "otherOperatingCosts", label: "Other operating costs", type: "number", section: "Operating costs", unit: "Rs./year" },
      ...loanQuestions,
    ],
  },
  "dairy-farm": {
    activityId: "dairy-farm",
    activityName: "Dairy Farm",
    summary: "Milch animals, milk production and daily milk sale.",
    revenueBasis: "Saleable milk quantity × milk selling price",
    sections: SECTIONS,
    documents: [
      doc("Animal Purchase Quotations", false, 10, ["pdf", "jpg"]),
      doc("Land and Shed Documents", true, 10, ["pdf", "jpg"]),
      doc("Veterinary Tie-up Letter", false, 5, ["pdf"]),
      doc("Milk Buyer Agreement", false, 5, ["pdf"]),
      ...KYC_DOCUMENTS,
      ...REGISTRATION_DOCUMENTS,
      doc("Insurance Proposal for Animals", false, 5),
    ],
    technicalSections: [
      "Production cycle and lactation assumptions",
      "Land, shed and water requirements",
      "Seasonal variation in milk yield",
      "Animal health and veterinary support",
    ],
    questions: [
      { id: "numberOfAnimals", label: "Number of animals", type: "number", section: "Capacity and operations", required: true },
      { id: "animalCategories", label: "Animal categories", type: "text", section: "Capacity and operations", placeholder: "e.g. 20 milch, 10 heifers" },
      { id: "purchasePricePerAnimal", label: "Purchase price per animal", type: "number", section: "Project basics", unit: "Rs.", required: true },
      { id: "milkProduction", label: "Average milk production", type: "number", section: "Capacity and operations", unit: "litres/animal/day", required: true },
      { id: "lactationDays", label: "Lactation days per year", type: "number", section: "Capacity and operations" },
      { id: "milkSellingPrice", label: "Milk selling price", type: "number", section: "Revenue", unit: "Rs./litre", required: true },
      { id: "feedExpenses", label: "Feed expenses", type: "number", section: "Operating costs", unit: "Rs./animal/month", required: true },
      { id: "veterinaryExpenses", label: "Veterinary expenses", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "labourExpenses", label: "Labour expenses", type: "number", section: "Operating costs", unit: "Rs./month" },
      { id: "landAndShed", label: "Land and shed requirement", type: "number", section: "Project basics", unit: "sq.ft." },
      { id: "waterAndElectricity", label: "Water and electricity", type: "number", section: "Operating costs", unit: "Rs./month" },
      { id: "insurance", label: "Insurance", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "otherOperatingCosts", label: "Other operating costs", type: "number", section: "Operating costs", unit: "Rs./year" },
      ...loanQuestions,
    ],
  },
  hotel: {
    activityId: "hotel",
    activityName: "Hotel",
    summary: "Room inventory, occupancy and food and beverage revenue.",
    revenueBasis: "Available room nights × occupancy × average room tariff",
    sections: SECTIONS,
    documents: [
      doc("Building Plan Approval", true, 10, ["pdf"]),
      doc("Furniture and Fixture Quotations", false, 10, ["pdf"]),
      doc("Fire Safety Clearance", true, 5, ["pdf"]),
      doc("Tourism / Trade Licence", false, 5, ["pdf"]),
      ...KYC_DOCUMENTS,
      ...REGISTRATION_DOCUMENTS,
      doc("Market Study", false, 10, ["pdf"]),
    ],
    technicalSections: [
      "Room capacity and occupancy assumptions",
      "Tariff structure and seasonality",
      "Service facilities and staffing",
      "Location and demand drivers",
    ],
    questions: [
      { id: "numberOfRooms", label: "Number of rooms", type: "number", section: "Capacity and operations", required: true },
      { id: "roomCategories", label: "Room categories", type: "text", section: "Capacity and operations", placeholder: "e.g. 10 standard, 6 deluxe" },
      { id: "roomTariff", label: "Average room tariff", type: "number", section: "Revenue", unit: "Rs./night", required: true },
      { id: "occupancy", label: "Expected occupancy", type: "number", section: "Revenue", unit: "%", required: true },
      { id: "operatingDays", label: "Operating days per year", type: "number", section: "Capacity and operations" },
      { id: "restaurantFacility", label: "Restaurant facility", type: "select", section: "Capacity and operations", options: ["Yes", "No", "Planned"] },
      { id: "foodRevenue", label: "Estimated food and beverage revenue", type: "number", section: "Revenue", unit: "Rs./year" },
      { id: "staffRequirement", label: "Staff requirement", type: "number", section: "Operating costs", unit: "persons" },
      { id: "foodCost", label: "Food cost", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "maintenance", label: "Maintenance", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "electricity", label: "Electricity", type: "number", section: "Operating costs", unit: "Rs./month" },
      { id: "marketing", label: "Marketing expenses", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "otherOperatingCosts", label: "Other operating costs", type: "number", section: "Operating costs", unit: "Rs./year" },
      ...loanQuestions,
    ],
  },
  "wholesale-trading": {
    activityId: "wholesale-trading",
    activityName: "Wholesale Trading",
    summary: "Bulk purchase and resale with inventory and credit cycles.",
    revenueBasis: "Sales quantity × selling price",
    sections: SECTIONS,
    documents: [
      doc("Supplier Quotations", false, 10, ["pdf"]),
      doc("Purchase Agreements", false, 10, ["pdf"]),
      doc("Godown / Warehouse Proof", true, 10, ["pdf", "jpg"]),
      ...KYC_DOCUMENTS,
      ...REGISTRATION_DOCUMENTS,
      doc("Sales Orders / Customer Letters", false, 10, ["pdf"]),
    ],
    technicalSections: [
      "Product mix and sourcing",
      "Inventory holding and turnover",
      "Debtor and creditor cycles",
      "Warehousing and distribution",
    ],
    questions: [
      { id: "productCategories", label: "Product categories", type: "text", section: "Project basics", required: true },
      { id: "purchasePrice", label: "Average purchase price", type: "number", section: "Revenue", unit: "Rs./unit", required: true },
      { id: "sellingPrice", label: "Average selling price", type: "number", section: "Revenue", unit: "Rs./unit", required: true },
      { id: "salesVolume", label: "Expected annual sales volume", type: "number", section: "Revenue", unit: "units", required: true },
      { id: "grossMargin", label: "Gross profit margin", type: "number", section: "Revenue", unit: "%" },
      { id: "inventoryDays", label: "Inventory holding period", type: "number", section: "Capacity and operations", unit: "days" },
      { id: "debtorDays", label: "Debtor credit period", type: "number", section: "Capacity and operations", unit: "days" },
      { id: "creditorDays", label: "Supplier credit period", type: "number", section: "Capacity and operations", unit: "days" },
      { id: "warehouseExpenses", label: "Warehouse expenses", type: "number", section: "Operating costs", unit: "Rs./month" },
      { id: "transportation", label: "Transportation", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "otherOperatingExpenses", label: "Other operating expenses", type: "number", section: "Operating costs", unit: "Rs./year" },
      ...loanQuestions,
    ],
  },
};

function buildDefaultConfig(activityId: string, activityName: string): ActivityConfig {
  return {
    activityId,
    activityName,
    summary: `Project inputs for ${activityName}.`,
    revenueBasis: "Billable capacity × unit price",
    sections: SECTIONS,
    documents: [
      doc("Machinery / Equipment Quotations", false, 10, ["pdf"]),
      doc("Land or Premises Documents", false, 10, ["pdf", "jpg"]),
      ...KYC_DOCUMENTS,
      ...REGISTRATION_DOCUMENTS,
      doc("Project Cost Estimate", false, 10, ["pdf", "xlsx"]),
      doc("Market Study", false, 10, ["pdf"]),
    ],
    technicalSections: [
      "Project background and objectives",
      "Capacity and operating assumptions",
      "Infrastructure and manpower",
      "Implementation schedule",
    ],
    questions: [
      { id: "activityDescription", label: "Describe the proposed activity", type: "textarea", section: "Project basics", required: true },
      { id: "projectLocation", label: "Project location", type: "text", section: "Project basics", required: true },
      { id: "capacity", label: "Annual capacity / service volume", type: "number", section: "Capacity and operations", required: true },
      { id: "capacityUnit", label: "Capacity unit", type: "text", section: "Capacity and operations", placeholder: "e.g. units, kg, hours" },
      { id: "utilisation", label: "Expected utilisation", type: "number", section: "Capacity and operations", unit: "%" },
      { id: "unitPrice", label: "Average price per unit", type: "number", section: "Revenue", unit: "Rs.", required: true },
      { id: "rawMaterialCost", label: "Raw material / purchase cost", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "labourCost", label: "Labour cost", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "powerFuel", label: "Power and fuel", type: "number", section: "Operating costs", unit: "Rs./year" },
      { id: "rent", label: "Rent", type: "number", section: "Operating costs", unit: "Rs./month" },
      { id: "otherExpenses", label: "Other operating expenses", type: "number", section: "Operating costs", unit: "Rs./year" },
      ...loanQuestions,
    ],
  };
}

export function getActivityConfig(activityId: string, activityName?: string): ActivityConfig {
  const existing = CONFIGS[activityId];
  if (existing) return existing;
  return buildDefaultConfig(activityId, activityName ?? "Custom Activity");
}

export function listConfiguredActivities(): string[] {
  return Object.keys(CONFIGS);
}
