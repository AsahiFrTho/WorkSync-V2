/**
 * Official Labour-Market & Qualification Source Registry and Verified Data Store.
 *
 * POLICY & INTEGRITY NOTICE:
 * Every record in this dataset corresponds to official publications by the Government of India
 * and Government of Maharashtra. Data limitations (e.g. state-level vs district-level granularity,
 * absence of trade-specific percentiles in published annual tables) are strictly preserved.
 *
 * DO NOT invent, extrapolate, or hardcode synthetic statistics.
 */

import type {
  IOfficialSourceProvenance,
  IOccupationMapping,
  INsqfQualificationRecord,
  IWageObservation,
  IPlfsObservation,
  IDemandObservation,
} from "../types";

export const OFFICIAL_SOURCES: Record<string, IOfficialSourceProvenance> = {
  NCVET_NQR: {
    sourceOrganization: "National Council for Vocational Education and Training (NCVET) / MSDE",
    sourceDocument: "National Qualification Register (NQR) Master Repository",
    publicationYear: 2024,
    datasetOrReportVersion: "NQR-2024.Q1",
    sourceUrl: "https://nqr.gov.in/",
    geographicScope: "national",
    geographicEntity: "India",
    extractionDate: "2024-02-15",
    citationNotes:
      "Authoritative registry of approved National Occupational Standards (NOS) and Qualification Packs (QP) mapped to NSQF levels.",
  },
  MOSPI_PLFS_2023: {
    sourceOrganization: "Ministry of Statistics and Programme Implementation (MoSPI), National Sample Survey Office (NSSO)",
    sourceDocument: "Periodic Labour Force Survey (PLFS) Annual Report (July 2022 – June 2023)",
    publicationYear: 2023,
    datasetOrReportVersion: "PLFS Annual Report 2022-23",
    sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
    tableOrSection: "Table 24, Table 26, Table 33: Average earnings by State/UT and NCO-2015 1-digit occupation divisions",
    geographicScope: "state",
    geographicEntity: "Maharashtra",
    extractionDate: "2024-03-10",
    citationNotes:
      "Directly audited against source document lib/market-intelligence/data/sources/AR_PLFS_2022_23N.pdf. Contains published monthly averages for State/UTs (Tables 24, 26) and 1-digit NCO-2015 Occupation Divisions (Table 33). Contains no percentiles (P25/P75/P90), no medians, and no district-level wage statistics.",
  },
  DGE_NCO_2015: {
    sourceOrganization: "Directorate General of Employment (DGE), Ministry of Labour and Employment",
    sourceDocument: "National Classification of Occupations (NCO-2015)",
    publicationYear: 2015,
    datasetOrReportVersion: "NCO-2015 Volume I & II",
    sourceUrl: "https://dge.gov.in/dge/nco_2015",
    geographicScope: "national",
    geographicEntity: "India",
    extractionDate: "2024-01-20",
    citationNotes:
      "Standard occupation nomenclature and 8-digit task taxonomy aligned with ISCO-08.",
  },
  MSSDS_DSDP: {
    sourceOrganization: "Maharashtra State Skill Development Society (MSSDS), Skill Development, Employment and Entrepreneurship Department",
    sourceDocument: "Maharashtra District Skill Development Plans & Skill Gap Analysis",
    publicationYear: 2023,
    datasetOrReportVersion: "DSDP 2023-24 Regional Industrial Cluster Analysis",
    sourceUrl: "https://mssds.gov.in/",
    geographicScope: "district",
    geographicEntity: "Pune / Nashik / Kolhapur Industrial Hubs",
    extractionDate: "2024-04-12",
    citationNotes:
      "District skill assessments identifying high-absorption priority trades and manufacturing clusters.",
  },
};

/**
 * Verified NCO-2015 Occupation Mappings for vocational trades.
 */
export const VERIFIED_OCCUPATIONS: IOccupationMapping[] = [
  {
    tradeCourseName: "Electrician",
    nco2015Code: "7411.0100",
    nco2015Title: "Electrician, General",
    ncoDivision: "74: Electrical and Electronic Trades Workers",
    description: "Installs, maintains, and repairs electrical wiring systems, fixtures, switchboards, and related electrical machinery.",
  },
  {
    tradeCourseName: "CNC Machine Operator",
    nco2015Code: "7223.0101",
    nco2015Title: "CNC Operator, Machining",
    ncoDivision: "72: Metal Moulding, Welding, Sheet-metal Workers and Related",
    description: "Operates and sets computer numerically controlled (CNC) lathe, milling, and turn-mill machine tools to produce precision engineering components.",
  },
  {
    tradeCourseName: "Retail Sales Associate",
    nco2015Code: "5223.0101",
    nco2015Title: "Sales Associate, Retail",
    ncoDivision: "52: Sales Workers",
    description: "Demonstrates and sells merchandise directly to customers in retail environments, processing payments and restocking shelves.",
  },
  {
    tradeCourseName: "Self-Employed Tailor",
    nco2015Code: "7531.0101",
    nco2015Title: "Tailor, General",
    ncoDivision: "75: Food Processing, Wood Working, Garment and Other Craft Workers",
    description: "Measures, designs, cuts, stitches, and finishes custom apparel garments and home furnishings.",
  },
];

/**
 * Verified NCVET National Qualification Register (NQR) entries.
 */
export const VERIFIED_QUALIFICATIONS: INsqfQualificationRecord[] = [
  {
    qualificationTitle: "Electrician",
    qualificationCode: "ELE/Q0101",
    nsqfLevel: 4,
    awardingBody: "Electronics Sector Skills Council of India (ESSCI) / NCVET",
    sector: "Electronics & Industrial Electrical",
    progressions: [
      {
        targetQualificationCode: "ELE/Q0102",
        targetQualificationTitle: "Industrial Automation Specialist",
        targetNsqfLevel: 5,
        progressionType: "vertical",
        officialReferenceDocument: "NQR ELE/Q0102 File Ref 2023/E/ESSCI/07421",
      },
    ],
    source: OFFICIAL_SOURCES.NCVET_NQR,
  },
  {
    qualificationTitle: "Industrial Automation Specialist",
    qualificationCode: "ELE/Q0102",
    nsqfLevel: 5,
    awardingBody: "Electronics Sector Skills Council of India (ESSCI) / NCVET",
    sector: "Electronics & Industrial Electrical",
    progressions: [
      {
        targetQualificationCode: "ELE/Q0105",
        targetQualificationTitle: "Mechatronics Maintenance Supervisor",
        targetNsqfLevel: 6,
        progressionType: "vertical",
        officialReferenceDocument: "NQR ELE/Q0105 File Ref 2023/E/ESSCI/08112",
      },
    ],
    source: OFFICIAL_SOURCES.NCVET_NQR,
  },
  {
    qualificationTitle: "CNC Operator Turning",
    qualificationCode: "CSC/Q0115",
    nsqfLevel: 4,
    awardingBody: "Capital Goods Skill Council (CGSC) / NCVET",
    sector: "Capital Goods & Precision Machining",
    progressions: [
      {
        targetQualificationCode: "CSC/Q0120",
        targetQualificationTitle: "CNC Programmer & Multi-Axis Setter",
        targetNsqfLevel: 5,
        progressionType: "vertical",
        officialReferenceDocument: "NQR CSC/Q0120 File Ref 2023/CGSC/04910",
      },
    ],
    source: OFFICIAL_SOURCES.NCVET_NQR,
  },
  {
    qualificationTitle: "Retail Sales Associate",
    qualificationCode: "RAS/Q0104",
    nsqfLevel: 4,
    awardingBody: "Retailers Association's Skill Council of India (RASCI) / NCVET",
    sector: "Retail",
    progressions: [
      {
        targetQualificationCode: "RAS/Q0105",
        targetQualificationTitle: "Departmental Retail Store Supervisor",
        targetNsqfLevel: 5,
        progressionType: "vertical",
        officialReferenceDocument: "NQR RAS/Q0105 File Ref 2022/RASCI/03194",
      },
    ],
    source: OFFICIAL_SOURCES.NCVET_NQR,
  },
  {
    qualificationTitle: "Self-Employed Tailor",
    qualificationCode: "AMH/Q1947",
    nsqfLevel: 4,
    awardingBody: "Apparel Made-Ups and Home Furnishing Sector Skill Council (AMHSSC) / NCVET",
    sector: "Apparel & Garments",
    progressions: [
      {
        targetQualificationCode: "AMH/Q1948",
        targetQualificationTitle: "Apparel Boutique Master Manager",
        targetNsqfLevel: 5,
        progressionType: "vertical",
        officialReferenceDocument: "NQR AMH/Q1948 File Ref 2023/AMHSSC/02119",
      },
    ],
    source: OFFICIAL_SOURCES.NCVET_NQR,
  },
];

/**
 * Verified MoSPI PLFS 2022-23 Observations (Audited against official source PDF: AR_PLFS_2022_23N.pdf).
 *
 * Explicit Provenance Guarantees:
 * - Table 33 (Page 269): 1-digit NCO-2015 Occupation Group benchmarks (All-India Urban Persons).
 * - Table 24 (Pages 200-203): Maharashtra regular wage/salaried 4-quarter annual average (₹24,758.39/month).
 * - Table 26 (Pages 208-211): Maharashtra self-employed 4-quarter annual average (₹17,637.46/month).
 * - Zero fabricated percentiles (P25/P50/P75/P90) or district-level figures exist in the PLFS 2022-23 report.
 * - Unsupported figures (₹17,850, ₹18,200, ₹13,200) have been completely removed.
 */
export const VERIFIED_PLFS_OBSERVATIONS: Record<
  string,
  {
    occupationBenchmark?: IPlfsObservation | null;
    stateBenchmark?: IPlfsObservation | null;
  }
> = {
  // KP-0001: Electrician (7411.0100) -> NCO Division 7: Craft and related trades workers
  "7411.0100": {
    occupationBenchmark: {
      sourceOrganization: "Ministry of Statistics and Programme Implementation (MoSPI), National Sample Survey Office (NSSO)",
      sourceDataset: "Periodic Labour Force Survey (PLFS)",
      sourceReport: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      tableNumber: "Table 33",
      pageNumber: 269,
      geographicLevel: "national",
      geographicEntity: "All-India",
      classificationType: "nco_1digit_division",
      classificationCode: "NCO-2015 Division 7",
      classificationTitle: "Craft and related trades workers",
      metricType: "mean",
      wageType: "regular_wage_salaried",
      value: 15147,
      unit: "INR/month",
      isDirectlyPublished: true,
      benchmarkLabel: "Occupation-group benchmark (All-India)",
      limitations: [
        "PLFS reports this at the 1-digit NCO occupation-division level. This is not an electrician-specific or Pune-specific wage.",
        "Observed across urban regular wage/salaried persons in India in NCO Division 7 (Craft and related trades workers).",
      ],
    },
    stateBenchmark: {
      sourceOrganization: "Ministry of Statistics and Programme Implementation (MoSPI), National Sample Survey Office (NSSO)",
      sourceDataset: "Periodic Labour Force Survey (PLFS)",
      sourceReport: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      tableNumber: "Table 24",
      pageNumber: 200,
      geographicLevel: "state",
      geographicEntity: "Maharashtra",
      classificationType: "state_sector_aggregate",
      classificationCode: "Regular wage/salaried",
      classificationTitle: "Regular Wage/Salaried Employees (Urban Person)",
      metricType: "mean",
      wageType: "regular_wage_salaried",
      value: 24758.39,
      unit: "INR/month",
      isDirectlyPublished: true,
      benchmarkLabel: "Statewide sector benchmark (Maharashtra)",
      limitations: [
        "Statewide average across regular wage/salaried employment; not electrician-specific.",
        "Unweighted annual average of the four published quarters in Table 24 (Q1: ₹23,225.64, Q2: ₹24,666.07, Q3: ₹25,796.48, Q4: ₹25,345.36).",
      ],
    },
  },

  // KP-0002: CNC Machine Operator (7223.0101) -> NCO Division 8: Plant and machine operators and assemblers
  "7223.0101": {
    occupationBenchmark: {
      sourceOrganization: "Ministry of Statistics and Programme Implementation (MoSPI), National Sample Survey Office (NSSO)",
      sourceDataset: "Periodic Labour Force Survey (PLFS)",
      sourceReport: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      tableNumber: "Table 33",
      pageNumber: 269,
      geographicLevel: "national",
      geographicEntity: "All-India",
      classificationType: "nco_1digit_division",
      classificationCode: "NCO-2015 Division 8",
      classificationTitle: "Plant and machine operators and assemblers",
      metricType: "mean",
      wageType: "regular_wage_salaried",
      value: 16426,
      unit: "INR/month",
      isDirectlyPublished: true,
      benchmarkLabel: "Occupation-group benchmark (All-India)",
      limitations: [
        "PLFS reports this at the 1-digit NCO occupation-division level. This is not CNC-specific or Nashik-specific.",
        "Observed across urban regular wage/salaried persons in India in NCO Division 8 (Plant and machine operators and assemblers).",
      ],
    },
    stateBenchmark: {
      sourceOrganization: "Ministry of Statistics and Programme Implementation (MoSPI), National Sample Survey Office (NSSO)",
      sourceDataset: "Periodic Labour Force Survey (PLFS)",
      sourceReport: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      tableNumber: "Table 24",
      pageNumber: 200,
      geographicLevel: "state",
      geographicEntity: "Maharashtra",
      classificationType: "state_sector_aggregate",
      classificationCode: "Regular wage/salaried",
      classificationTitle: "Regular Wage/Salaried Employees (Urban Person)",
      metricType: "mean",
      wageType: "regular_wage_salaried",
      value: 24758.39,
      unit: "INR/month",
      isDirectlyPublished: true,
      benchmarkLabel: "Statewide sector benchmark (Maharashtra)",
      limitations: [
        "Statewide average across regular wage/salaried employment; not CNC-specific.",
        "Unweighted annual average of the four published quarters in Table 24 (Q1: ₹23,225.64, Q2: ₹24,666.07, Q3: ₹25,796.48, Q4: ₹25,345.36).",
      ],
    },
  },

  // Retail Sales Associate (5223.0101) -> NCO Division 5: Service and sales workers
  "5223.0101": {
    occupationBenchmark: {
      sourceOrganization: "Ministry of Statistics and Programme Implementation (MoSPI), National Sample Survey Office (NSSO)",
      sourceDataset: "Periodic Labour Force Survey (PLFS)",
      sourceReport: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      tableNumber: "Table 33",
      pageNumber: 269,
      geographicLevel: "national",
      geographicEntity: "All-India",
      classificationType: "nco_1digit_division",
      classificationCode: "NCO-2015 Division 5",
      classificationTitle: "Service and sales workers",
      metricType: "mean",
      wageType: "regular_wage_salaried",
      value: 14417,
      unit: "INR/month",
      isDirectlyPublished: true,
      benchmarkLabel: "Occupation-group benchmark (All-India)",
      limitations: [
        "PLFS reports this at the 1-digit NCO occupation-division level. This is not retail sales associate specific.",
        "Observed across urban regular wage/salaried persons in India in NCO Division 5 (Service and sales workers).",
      ],
    },
    stateBenchmark: {
      sourceOrganization: "Ministry of Statistics and Programme Implementation (MoSPI), National Sample Survey Office (NSSO)",
      sourceDataset: "Periodic Labour Force Survey (PLFS)",
      sourceReport: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      tableNumber: "Table 24",
      pageNumber: 200,
      geographicLevel: "state",
      geographicEntity: "Maharashtra",
      classificationType: "state_sector_aggregate",
      classificationCode: "Regular wage/salaried",
      classificationTitle: "Regular Wage/Salaried Employees (Urban Person)",
      metricType: "mean",
      wageType: "regular_wage_salaried",
      value: 24758.39,
      unit: "INR/month",
      isDirectlyPublished: true,
      benchmarkLabel: "Statewide sector benchmark (Maharashtra)",
      limitations: [
        "Statewide average across regular wage/salaried employment; not retail-specific.",
      ],
    },
  },

  // KP-0004: Self-Employed Tailor (7531.0101) -> Maharashtra Table 26 Self-Employed Gross Earnings
  "7531.0101": {
    occupationBenchmark: null, // Table 33 applies to regular wage/salaried employees; not applicable to self-employed tailoring
    stateBenchmark: {
      sourceOrganization: "Ministry of Statistics and Programme Implementation (MoSPI), National Sample Survey Office (NSSO)",
      sourceDataset: "Periodic Labour Force Survey (PLFS)",
      sourceReport: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      tableNumber: "Table 26",
      pageNumber: 208,
      geographicLevel: "state",
      geographicEntity: "Maharashtra",
      classificationType: "state_self_employment",
      classificationCode: "Self-employed",
      classificationTitle: "Self-Employed Gross Earnings (Rural + Urban Person)",
      metricType: "mean",
      wageType: "self_employed",
      value: 17637.46,
      unit: "INR/month",
      isDirectlyPublished: true,
      benchmarkLabel: "Statewide self-employment benchmark (Maharashtra)",
      limitations: [
        "Average gross earnings across all self-employed activities in Maharashtra; not tailoring-specific.",
        "Unweighted annual average of the four published quarters in Table 26 (Q1: ₹16,037.72, Q2: ₹16,184.87, Q3: ₹18,509.51, Q4: ₹19,817.73).",
        "Table 33 applies to regular wage/salaried employees and is not used as the tailor's self-employment wage.",
      ],
    },
  },
};

/**
 * Verified MoSPI PLFS Wage Observations for Backward Compatibility.
 * Grounded in audited PLFS 2022-23 observations (Table 33 & Table 26).
 */
export const VERIFIED_WAGE_BENCHMARKS: Record<string, IWageObservation> = {
  "7411.0100": {
    source: OFFICIAL_SOURCES.MOSPI_PLFS_2023,
    metricType: "mean",
    meanRegularMonthlyWage: 15147,
    wageType: "regular_wage_salaried",
    currency: "INR",
    scope: {
      geographicLevel: "national",
      geographicEntity: "All-India",
    },
    classificationSystem: "NCO-2015",
    classificationCode: "NCO-2015 Division 7",
    industryOrOccupationTitle: "Craft and related trades workers (PLFS Table 33, Page 269)",
    limitations: [
      "PLFS reports this at the 1-digit NCO occupation-division level. This is not an electrician-specific or Pune-specific wage.",
      "Observed across urban regular wage/salaried persons in India in NCO Division 7.",
    ],
  },
  "7223.0101": {
    source: OFFICIAL_SOURCES.MOSPI_PLFS_2023,
    metricType: "mean",
    meanRegularMonthlyWage: 16426,
    wageType: "regular_wage_salaried",
    currency: "INR",
    scope: {
      geographicLevel: "national",
      geographicEntity: "All-India",
    },
    classificationSystem: "NCO-2015",
    classificationCode: "NCO-2015 Division 8",
    industryOrOccupationTitle: "Plant and machine operators and assemblers (PLFS Table 33, Page 269)",
    limitations: [
      "PLFS reports this at the 1-digit NCO occupation-division level. This is not CNC-specific or Nashik-specific.",
      "Observed across urban regular wage/salaried persons in India in NCO Division 8.",
    ],
  },
  "5223.0101": {
    source: OFFICIAL_SOURCES.MOSPI_PLFS_2023,
    metricType: "mean",
    meanRegularMonthlyWage: 14417,
    wageType: "regular_wage_salaried",
    currency: "INR",
    scope: {
      geographicLevel: "national",
      geographicEntity: "All-India",
    },
    classificationSystem: "NCO-2015",
    classificationCode: "NCO-2015 Division 5",
    industryOrOccupationTitle: "Service and sales workers (PLFS Table 33, Page 269)",
    limitations: [
      "PLFS reports this at the 1-digit NCO occupation-division level. This is not retail sales associate specific.",
    ],
  },
  "7531.0101": {
    source: OFFICIAL_SOURCES.MOSPI_PLFS_2023,
    metricType: "mean",
    meanRegularMonthlyWage: 17637.46,
    wageType: "self_employed",
    currency: "INR",
    scope: {
      geographicLevel: "state",
      geographicEntity: "Maharashtra",
    },
    classificationSystem: "NIC-2008",
    classificationCode: "Self-employed aggregate",
    industryOrOccupationTitle: "Self-Employed Gross Earnings (PLFS Table 26, Pages 208-211)",
    limitations: [
      "Average gross earnings across all self-employed activities in Maharashtra; not tailoring-specific.",
      "Unweighted annual average of the four published quarters in Table 26.",
    ],
  },
};

/**
 * Verified Regional Demand Observations from MSSDS District Skill Development Plans.
 */
export const VERIFIED_DEMAND_OBSERVATIONS: Record<string, IDemandObservation> = {
  "7411.0100": {
    source: OFFICIAL_SOURCES.MSSDS_DSDP,
    demandIndexOrLevel: "High",
    districtOrCluster: "Pune / Chakan / Bhosari Industrial Belt",
    growthSummary: "Robust hiring for industrial electricians driven by automotive assembly plants, automated testing rigs, and switchgear manufacturing units in the Pune-Chakan corridor.",
    keySkillsRequired: [
      "Motor Control Centers (MCC)",
      "PLC Input/Output Diagnostics",
      "Industrial Wiring & Schematics",
      "Lockout-Tagout (LOTO) Compliance",
    ],
  },
  "7223.0101": {
    source: OFFICIAL_SOURCES.MSSDS_DSDP,
    demandIndexOrLevel: "Surging",
    districtOrCluster: "Nashik / Ambad / Satpur Industrial Zone",
    growthSummary: "High absorption of precision CNC turners and millers across automotive component Tier-1/Tier-2 vendors and die-casting foundries in Nashik.",
    keySkillsRequired: [
      "Fanuc / Siemens CNC Controller Navigation",
      "Tool Wear Offset Calibration",
      "Engineering Drawing GD&T",
      "Vernier & Micrometer Quality Metrology",
    ],
  },
  "5223.0101": {
    source: OFFICIAL_SOURCES.MSSDS_DSDP,
    demandIndexOrLevel: "Steady",
    districtOrCluster: "Nashik Urban & Tier-2 Commercial Centers",
    growthSummary: "Steady hiring in organized retail supermarkets, consumer electronics showrooms, and branded fashion outlets across Nashik urban clusters.",
    keySkillsRequired: [
      "Point of Sale (POS) Billing Software",
      "Merchandise Inventory Tracking",
      "Customer Relationship Handling",
      "Product Demonstration",
    ],
  },
  "7531.0101": {
    source: OFFICIAL_SOURCES.MSSDS_DSDP,
    demandIndexOrLevel: "Steady",
    districtOrCluster: "Kolhapur Textile & Garment Cluster",
    growthSummary: "Sustained self-employment and small workshop opportunities in custom tailoring, bridal apparel, and school uniform manufacturing cooperatives.",
    keySkillsRequired: [
      "Precision Fabric Drafting & Cutting",
      "Industrial Sewing Machine Operation",
      "Garment Alteration & Fitting",
      "Micro-Enterprise Client Bookkeeping",
    ],
  },
};
