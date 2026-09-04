/**
 * Strong typing definitions for the Official Labour-Market Intelligence & Qualification Layer.
 *
 * All records strictly require source traceability (provenance) to ensure zero fabrication
 * of government statistics.
 */

export type GeographicScopeLevel = "district" | "state" | "regional_cluster" | "national";

export interface IOfficialSourceProvenance {
  sourceOrganization: string; // e.g. "Ministry of Statistics and Programme Implementation (MoSPI)" or "NCVET"
  sourceDocument: string; // e.g. "Periodic Labour Force Survey (PLFS) Annual Report (July 2022 - June 2023)"
  publicationYear: number; // e.g. 2023
  datasetOrReportVersion?: string; // e.g. "PLFS 2022-23 Statement 41"
  sourceUrl: string; // Official portal link
  tableOrSection?: string; // e.g. "Statement 41: Average wage/salary earnings per day for regular wage/salaried employees"
  geographicScope: GeographicScopeLevel; // Scope of the published survey
  geographicEntity?: string; // e.g. "Maharashtra" or "Pune" or "All-India"
  extractionDate: string; // ISO date of retrieval
  citationNotes?: string; // Methodological constraints or notes
}

export interface IOccupationMapping {
  tradeCourseName: string; // Name in vocational training curriculum (e.g. "Electrician")
  nco2015Code: string; // 8-digit National Classification of Occupations 2015 code
  nco2015Title: string; // Official NCO-2015 occupation title
  ncoDivision: string; // 2-digit division title
  description: string;
}

export interface INsqfQualificationProgression {
  targetQualificationCode: string;
  targetQualificationTitle: string;
  targetNsqfLevel: number;
  progressionType: "vertical" | "horizontal";
  officialReferenceDocument?: string;
}

export interface INsqfQualificationRecord {
  qualificationTitle: string;
  qualificationCode: string;
  nsqfLevel: number;
  awardingBody: string; // e.g. "Electronics Sector Skills Council of India" / "NCVET"
  sector: string;
  entryRequirements?: string;
  progressions?: INsqfQualificationProgression[];
  source: IOfficialSourceProvenance;
}

export interface IPercentileDistribution {
  p25?: number;
  p50?: number; // Median
  p75?: number;
  p90?: number;
}

export interface IWageObservation {
  source: IOfficialSourceProvenance;
  metricType: "mean" | "median";
  meanRegularMonthlyWage: number;
  medianRegularMonthlyWage?: number;
  percentiles?: IPercentileDistribution; // Populated only if source genuinely published percentiles
  wageType: "regular_wage_salaried" | "casual_labour" | "self_employed";
  currency: "INR";
  scope: {
    geographicLevel: GeographicScopeLevel;
    geographicEntity: string; // e.g. "Maharashtra"
  };
  classificationSystem: "NIC-2008" | "NCO-2015";
  classificationCode: string; // e.g. "NIC Division C" or "NCO 7411"
  industryOrOccupationTitle: string;
  limitations: string[];
}

export interface IDemandObservation {
  source: IOfficialSourceProvenance;
  demandIndexOrLevel: "High" | "Moderate" | "Steady" | "Surging";
  districtOrCluster: string;
  growthSummary: string;
  keySkillsRequired: string[];
}

export interface IPlfsObservation {
  sourceOrganization: string;
  sourceDataset: string;
  sourceReport: string;
  publicationYear: number;
  sourceUrl: string;
  tableNumber: string;
  pageNumber: number | string;
  geographicLevel: "national" | "state";
  geographicEntity: string;
  classificationType: "nco_1digit_division" | "state_sector_aggregate" | "state_self_employment";
  classificationCode: string;
  classificationTitle: string;
  metricType: "mean";
  wageType: "regular_wage_salaried" | "self_employed";
  value: number;
  unit: "INR/month";
  isDirectlyPublished: boolean;
  benchmarkLabel: string;
  limitations: string[];
}

export interface IOfficialLabourMarketEvidence {
  occupationCode: string; // NCO-2015
  occupationTitle: string;
  trade: string;
  matchedScope: {
    requestedDistrict: string;
    actualGeographicScope: GeographicScopeLevel;
    actualGeographicEntity: string;
  };
  occupationBenchmark?: IPlfsObservation | null;
  stateBenchmark?: IPlfsObservation | null;
  wageBenchmark?: IWageObservation | null;
  qualifications: INsqfQualificationRecord[];
  demandIndicator?: IDemandObservation | null;
  sourcesUsed: IOfficialSourceProvenance[];
  datasetVersion: string;
  limitations: string[];
}

export type IMarketEvidence = IOfficialLabourMarketEvidence;
