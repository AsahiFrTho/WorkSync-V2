/**
 * Official Government Labour-Market & Employment Indicators Registry.
 *
 * Source: Ministry of Statistics and Programme Implementation (MoSPI),
 * Periodic Labour Force Survey (PLFS) Annual Report (July 2022 – June 2023).
 * Audited against official source PDF: lib/market-intelligence/data/sources/AR_PLFS_2022_23N.pdf.
 *
 * DATA INTEGRITY GUARANTEE:
 * - Every statistic directly corresponds to a published table and page number.
 * - Zero fabricated, interpolated, or extrapolated figures.
 * - If an indicator is not published, status is explicitly marked 'unavailable'.
 */

export interface IOfficialGovIndicator {
  id: string;
  category: "workforce_participation" | "labour_market" | "wage_benchmark" | "skill_training";
  label: string;
  metricType: string;
  scope: {
    level: "state" | "national";
    entity: string;
    population: string;
    disaggregation?: {
      urban?: string;
      rural?: string;
      male?: string;
      female?: string;
    };
  };
  value: number | null;
  displayValue: string;
  unit: string;
  status: "verified" | "unavailable";
  source: {
    organization: string;
    dataset: string;
    report: string;
    publicationYear: number;
    tableNumber: string;
    pageNumber: number | string;
    sourceUrl: string;
    referencePeriod: string;
  };
  benchmarkLabel: string;
  citationNotes: string;
  limitations: string[];
}

export interface IOfficialTradeBenchmark {
  trade: string;
  ncoCode: string;
  ncoDivision: string;
  occupationTitle: string;
  value: number | null;
  displayValue: string;
  unit: string;
  status: "verified" | "unavailable";
  scope: string;
  source: {
    tableNumber: string;
    pageNumber: number | string;
    dataset: string;
  };
  citation: string;
}

export const OFFICIAL_MAHARASHTRA_INDICATORS: IOfficialGovIndicator[] = [
  {
    id: "plfs-mh-lfpr-15plus",
    category: "workforce_participation",
    label: "Labour Force Participation Rate (LFPR)",
    metricType: "Usual Status (ps+ss)",
    scope: {
      level: "state",
      entity: "Maharashtra",
      population: "Persons aged 15 years and above",
      disaggregation: {
        rural: "64.6%",
        urban: "52.4%",
        male: "77.4%",
        female: "40.7%",
      },
    },
    value: 59.4,
    displayValue: "59.4%",
    unit: "%",
    status: "verified",
    source: {
      organization: "Ministry of Statistics and Programme Implementation (MoSPI)",
      dataset: "Periodic Labour Force Survey (PLFS)",
      report: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      tableNumber: "Table 6",
      pageNumber: 84,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      referencePeriod: "July 2022 – June 2023",
    },
    benchmarkLabel: "Official Statewide Participation (Maharashtra)",
    citationNotes: "MoSPI PLFS 2022–23, Table (6), Page 84. Persons aged 15+, Usual Status (ps+ss). All-India comparison: 57.9%.",
    limitations: [
      "Published as statewide aggregate across rural and urban Maharashtra; not district-specific.",
      "Survey period: July 2022 to June 2023.",
    ],
  },
  {
    id: "plfs-mh-wpr-15plus",
    category: "labour_market",
    label: "Worker Population Ratio (WPR)",
    metricType: "Usual Status (ps+ss)",
    scope: {
      level: "state",
      entity: "Maharashtra",
      population: "Persons aged 15 years and above",
      disaggregation: {
        rural: "63.2%",
        urban: "50.0%",
        male: "74.7%",
        female: "39.8%",
      },
    },
    value: 57.6,
    displayValue: "57.6%",
    unit: "%",
    status: "verified",
    source: {
      organization: "Ministry of Statistics and Programme Implementation (MoSPI)",
      dataset: "Periodic Labour Force Survey (PLFS)",
      report: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      tableNumber: "Table 7",
      pageNumber: 89,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      referencePeriod: "July 2022 – June 2023",
    },
    benchmarkLabel: "Official Statewide Employment Ratio (Maharashtra)",
    citationNotes: "MoSPI PLFS 2022–23, Table (7), Page 89. Persons aged 15+, Usual Status (ps+ss). All-India comparison: 56.0%.",
    limitations: [
      "Statewide employment ratio across all economic activities in Maharashtra.",
      "Rural WPR: 63.2%, Urban WPR: 50.0%.",
    ],
  },
  {
    id: "plfs-mh-ur-15plus",
    category: "labour_market",
    label: "Unemployment Rate (UR)",
    metricType: "Usual Status (ps+ss)",
    scope: {
      level: "state",
      entity: "Maharashtra",
      population: "Persons aged 15 years and above",
      disaggregation: {
        rural: "2.2%",
        urban: "4.6%",
        male: "3.5%",
        female: "2.3%",
      },
    },
    value: 3.1,
    displayValue: "3.1%",
    unit: "%",
    status: "verified",
    source: {
      organization: "Ministry of Statistics and Programme Implementation (MoSPI)",
      dataset: "Periodic Labour Force Survey (PLFS)",
      report: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      tableNumber: "Table 8",
      pageNumber: 94,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      referencePeriod: "July 2022 – June 2023",
    },
    benchmarkLabel: "Official Statewide Unemployment (Maharashtra)",
    citationNotes: "MoSPI PLFS 2022–23, Table (8), Page 94. Persons aged 15+, Usual Status (ps+ss). All-India comparison: 3.2% (Urban: 5.4%, Rural: 2.4%).",
    limitations: [
      "Statewide rate; urban unemployment in Maharashtra is 4.6% vs rural 2.2%.",
    ],
  },
  {
    id: "plfs-mh-regular-wage",
    category: "wage_benchmark",
    label: "Statewide Regular Salaried Wage Benchmark",
    metricType: "4-Quarter Mean Earnings",
    scope: {
      level: "state",
      entity: "Maharashtra",
      population: "Regular wage/salaried employees (Urban Person)",
    },
    value: 24758.39,
    displayValue: "₹24,758/mo",
    unit: "INR/month",
    status: "verified",
    source: {
      organization: "Ministry of Statistics and Programme Implementation (MoSPI)",
      dataset: "Periodic Labour Force Survey (PLFS)",
      report: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      tableNumber: "Table 24",
      pageNumber: 200,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      referencePeriod: "July 2022 – June 2023",
    },
    benchmarkLabel: "Statewide Regular Wage (Maharashtra Urban)",
    citationNotes: "MoSPI PLFS 2022–23, Table (24), Page 200. Unweighted annual average of published quarters (Q1: ₹23,225.64, Q2: ₹24,666.07, Q3: ₹25,796.48, Q4: ₹25,345.36). Combined Rural+Urban statewide mean: ₹22,029.14/mo.",
    limitations: [
      "Average across all formal/regular wage employees in urban Maharashtra; not trade-specific.",
    ],
  },
  {
    id: "plfs-mh-self-employed",
    category: "wage_benchmark",
    label: "Statewide Self-Employed Earnings Benchmark",
    metricType: "4-Quarter Mean Gross Earnings",
    scope: {
      level: "state",
      entity: "Maharashtra",
      population: "Self-employed persons (Rural + Urban Person)",
    },
    value: 17637.46,
    displayValue: "₹17,637/mo",
    unit: "INR/month",
    status: "verified",
    source: {
      organization: "Ministry of Statistics and Programme Implementation (MoSPI)",
      dataset: "Periodic Labour Force Survey (PLFS)",
      report: "Annual Report (July 2022 – June 2023)",
      publicationYear: 2023,
      tableNumber: "Table 26",
      pageNumber: 208,
      sourceUrl: "https://www.mospi.gov.in/publication/periodic-labour-force-survey-annual-report-july-2022-june-2023",
      referencePeriod: "July 2022 – June 2023",
    },
    benchmarkLabel: "Statewide Self-Employment (Maharashtra)",
    citationNotes: "MoSPI PLFS 2022–23, Table (26), Page 208. Unweighted annual average of published quarters (Q1: ₹16,037.72, Q2: ₹16,184.87, Q3: ₹18,509.51, Q4: ₹19,817.73). Urban self-employed mean: ₹25,405.25/mo.",
    limitations: [
      "Average gross earnings across all self-employed activities in Maharashtra; not sector-specific.",
    ],
  },
  {
    id: "official-skill-completion",
    category: "skill_training",
    label: "Formal Vocational Training Completion Indicator",
    metricType: "Annual Certified Trainee Completion Rate",
    scope: {
      level: "state",
      entity: "Maharashtra",
      population: "Vocational trainees",
    },
    value: null,
    displayValue: "Official data unavailable",
    unit: "%",
    status: "unavailable",
    source: {
      organization: "Government of India / MoSPI PLFS / MSDE",
      dataset: "Published Administrative Annual Datasets",
      report: "PLFS 2022–23 Summary Tables & State Portal Reports",
      publicationYear: 2023,
      tableNumber: "N/A",
      pageNumber: "N/A",
      sourceUrl: "https://msde.gov.in/",
      referencePeriod: "2022–2023",
    },
    benchmarkLabel: "Statewide Vocational Completion Rate",
    citationNotes: "Neither the PLFS 2022–23 annual summary tables nor published state portal records provide a verified, auditable statewide formal vocational completion rate for this exact cycle.",
    limitations: [
      "Official data unavailable. Work-Sync does not interpolate, synthesize, or estimate missing government statistics.",
    ],
  },
];

export const OFFICIAL_OCCUPATION_BENCHMARKS: IOfficialTradeBenchmark[] = [
  {
    trade: "Electrician",
    ncoCode: "7411.0100",
    ncoDivision: "NCO-2015 Division 7",
    occupationTitle: "Craft and related trades workers",
    value: 15147,
    displayValue: "₹15,147/mo",
    unit: "INR/month",
    status: "verified",
    scope: "All-India Urban Person",
    source: {
      tableNumber: "Table 33",
      pageNumber: 269,
      dataset: "MoSPI PLFS 2022–23",
    },
    citation: "PLFS 2022–23 Table 33, Page 269 (NCO Division 7 Craft & related trades, Urban Person). Not district-level.",
  },
  {
    trade: "CNC Machine Operator",
    ncoCode: "7223.0101",
    ncoDivision: "NCO-2015 Division 8",
    occupationTitle: "Plant and machine operators and assemblers",
    value: 16426,
    displayValue: "₹16,426/mo",
    unit: "INR/month",
    status: "verified",
    scope: "All-India Urban Person",
    source: {
      tableNumber: "Table 33",
      pageNumber: 269,
      dataset: "MoSPI PLFS 2022–23",
    },
    citation: "PLFS 2022–23 Table 33, Page 269 (NCO Division 8 Plant & machine operators, Urban Person). Not district-level.",
  },
  {
    trade: "Tailor",
    ncoCode: "7531.0101",
    ncoDivision: "Self-Employed Gross Earnings",
    occupationTitle: "Self-Employed Activities (Rural + Urban Person)",
    value: 17637.46,
    displayValue: "₹17,637/mo",
    unit: "INR/month",
    status: "verified",
    scope: "Maharashtra Statewide Self-Employed",
    source: {
      tableNumber: "Table 26",
      pageNumber: 208,
      dataset: "MoSPI PLFS 2022–23",
    },
    citation: "PLFS 2022–23 Table 26, Page 208 (Maharashtra Self-Employed 4-quarter mean). Not tailoring-specific.",
  },
  {
    trade: "Solar PV Installer",
    ncoCode: "7411.0301",
    ncoDivision: "N/A",
    occupationTitle: "Solar Photovoltaic System Installer",
    value: null,
    displayValue: "Official data unavailable",
    unit: "INR/month",
    status: "unavailable",
    scope: "All-India / Maharashtra",
    source: {
      tableNumber: "N/A",
      pageNumber: "N/A",
      dataset: "MoSPI PLFS 2022–23",
    },
    citation: "No separate occupation-group or state wage benchmark is published in PLFS 2022–23 for Solar PV Installer.",
  },
];
