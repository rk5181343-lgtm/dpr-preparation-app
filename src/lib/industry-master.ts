/*
 * Industry and business activity master.
 *
 * This is the seed data for the selection flow. The UI reads it through the
 * helpers below, so the same shape can later be served from a database or an
 * administrator panel without touching any page component.
 */

export type BusinessActivity = {
  id: string;
  name: string;
  description: string;
};

export type Industry = {
  id: string;
  name: string;
  description: string;
  glyph: string;
  activities: BusinessActivity[];
};

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const activity = (name: string, description = ""): BusinessActivity => ({
  id: slug(name),
  name,
  description,
});

const industry = (
  name: string,
  glyph: string,
  description: string,
  activities: BusinessActivity[]
): Industry => ({ id: slug(name), name, glyph, description, activities });

export const INDUSTRIES: Industry[] = [
  industry("Manufacturing", "MFG", "Production and processing units", [
    activity("Rice Mill", "Paddy processing and rice recovery"),
    activity("Flour Mill", "Wheat and grain milling"),
    activity("Food Processing", "Packaged and processed foods"),
    activity("Dairy Processing", "Milk chilling and value-added products"),
    activity("Textile Manufacturing", "Spinning, weaving and fabric"),
    activity("Garment Manufacturing", "Apparel stitching and finishing"),
    activity("Plastic Products Manufacturing", "Moulded and extruded plastics"),
    activity("Paper Products Manufacturing", "Paper, board and packaging"),
    activity("Cement Products Manufacturing", "Blocks, pipes and tiles"),
    activity("Steel Fabrication", "Structural and fabrication work"),
    activity("Engineering Workshop", "Machining and job work"),
    activity("Furniture Manufacturing", "Wood and modular furniture"),
    activity("Packaging Manufacturing", "Corrugated and flexible packaging"),
    activity("Pharmaceutical Manufacturing", "Formulations and packaging"),
    activity("Chemical Manufacturing", "Industrial and specialty chemicals"),
    activity("Other Manufacturing", "Any other manufacturing activity"),
  ]),
  industry("Construction and Infrastructure", "CON", "Equipment, contracting and projects", [
    activity("Earthmoving Equipment Rental", "Excavators, JCB and earthmoving fleet"),
    activity("Excavator Rental", "Excavator fleet on hourly hire"),
    activity("JCB Rental", "Backhoe loader hire"),
    activity("Crane Rental", "Crane and lifting equipment hire"),
    activity("Construction Contractor", "Civil works contracting"),
    activity("Road Construction", "Road and pavement works"),
    activity("Building Construction", "Residential and commercial builds"),
    activity("Infrastructure Projects", "Public infrastructure works"),
    activity("Equipment Leasing", "Construction equipment leasing"),
    activity("Other Construction Activities", "Any other construction activity"),
  ]),
  industry("Agriculture and Allied Activities", "AGR", "Farming, livestock and agri services", [
    activity("Dairy Farm", "Milk production unit"),
    activity("Poultry Farm", "Broiler or layer unit"),
    activity("Fish Farming", "Aquaculture pond farming"),
    activity("Shrimp Farming", "Brackish water shrimp culture"),
    activity("Crop Cultivation", "Field and cash crops"),
    activity("Horticulture", "Fruits, vegetables and flowers"),
    activity("Greenhouse Farming", "Protected cultivation"),
    activity("Agricultural Equipment", "Implements and machinery services"),
    activity("Cold Storage", "Temperature controlled storage"),
    activity("Food Grading and Processing", "Sorting, grading and packing"),
    activity("Other Agriculture Activities", "Any other allied activity"),
  ]),
  industry("Hospitality and Tourism", "HOS", "Stay, food and travel services", [
    activity("Hotel", "Rooms, restaurant and banquets"),
    activity("Restaurant", "Food and beverage outlet"),
    activity("Resort", "Leisure and holiday property"),
    activity("Lodge", "Budget accommodation"),
    activity("Banquet Hall", "Events and function space"),
    activity("Catering Business", "Outdoor and event catering"),
    activity("Tourism Services", "Travel and tour operations"),
    activity("Other Hospitality Activities", "Any other hospitality activity"),
  ]),
  industry("Trading and Distribution", "TRD", "Wholesale, retail and supply chains", [
    activity("Wholesale Trading", "Bulk buy and resale"),
    activity("Retail Trading", "Retail store operations"),
    activity("Supermarket", "Multi-category retail"),
    activity("Building Materials Trading", "Cement, steel and fittings"),
    activity("Fertilizer Trading", "Agri input distribution"),
    activity("Hardware Trading", "Hardware and tools"),
    activity("FMCG Distribution", "Fast moving consumer goods"),
    activity("Automobile Spare Parts", "Spares and accessories"),
    activity("Other Trading Activities", "Any other trading activity"),
  ]),
  industry("Service Industry", "SRV", "Professional and support services", [
    activity("IT Services", "Software and IT support"),
    activity("Consultancy", "Advisory and professional services"),
    activity("Repair and Maintenance Centre", "Equipment repair services"),
    activity("Automobile Service Centre", "Vehicle servicing and repairs"),
    activity("Educational Institution", "School, college or coaching"),
    activity("Training Centre", "Skill and vocational training"),
    activity("Logistics Services", "Warehousing and distribution"),
    activity("Transport Services", "Goods and passenger transport"),
    activity("Other Service Activities", "Any other service activity"),
  ]),
  industry("Healthcare", "HLT", "Clinics, diagnostics and pharmacy", [
    activity("Diagnostic Centre", "Pathology and imaging"),
    activity("Hospital", "Multi-specialty care"),
    activity("Clinic", "Outpatient practice"),
    activity("Dental Clinic", "Dental care"),
    activity("Physiotherapy Centre", "Rehabilitation services"),
    activity("Pharmacy", "Retail pharmacy"),
    activity("Medical Laboratory", "Sample testing laboratory"),
    activity("Other Healthcare Activities", "Any other healthcare activity"),
  ]),
  industry("Energy and Utilities", "ENR", "Renewables and utility projects", [
    activity("Solar Power Project", "Utility or captive solar plant"),
    activity("Solar Installation Business", "Rooftop solar EPC"),
    activity("Renewable Energy", "Biomass, wind and hybrids"),
    activity("Energy Infrastructure", "Distribution and storage"),
    activity("Other Energy Projects", "Any other energy project"),
  ]),
  industry("Other Industries", "OTH", "Activities outside the standard list", [
    activity("Custom Activity", "Describe your own business activity"),
  ]),
];

export const PROJECT_TYPES = [
  "New Project",
  "Business Expansion",
  "Modernisation",
  "Diversification",
  "Replacement of Machinery",
  "Working Capital Enhancement",
];

export const DPR_PURPOSES = ["Bank Loan DPR"];

export function findIndustry(industryId: string): Industry | undefined {
  return INDUSTRIES.find((item) => item.id === industryId);
}

export function findActivity(
  industryId: string,
  activityId: string
): { industry: Industry; activity: BusinessActivity } | undefined {
  const found = findIndustry(industryId);
  const match = found?.activities.find((item) => item.id === activityId);
  if (!found || !match) return undefined;
  return { industry: found, activity: match };
}

export function searchIndustries(query: string): Industry[] {
  const term = query.trim().toLowerCase();
  if (!term) return INDUSTRIES;
  return INDUSTRIES.filter(
    (item) =>
      item.name.toLowerCase().includes(term) ||
      item.activities.some((entry) => entry.name.toLowerCase().includes(term))
  );
}
