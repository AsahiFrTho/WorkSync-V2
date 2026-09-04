export interface ITrainingPeriodEvidence {
  startDate?: string | null;
  endDate?: string | null;
  hours?: number | null;
}

export interface ICertificateEvidence {
  certificateId?: string | null;
  issueDate?: string | null;
  nsqfLevel?: number | null;
  issuer?: string | null;
  grade?: string | null;
  digilockerStatus?: "verified" | "not_verified" | "simulation" | "not_configured" | null;
  digilockerVerifiedAt?: string | null;
  verificationSource?: "digilocker_official" | "database_record" | "self_reported" | "demo_simulation" | null;
}

export interface ITraineeEvidence {
  traineeId: string;
  name: string;
  course: string;
  district: string;
  status: "enrolled" | "completed" | "certified" | "employed" | "retained" | string;
  trainingProvider?: string | null;
  trainingPeriod?: ITrainingPeriodEvidence | null;
  skills: string[];
  certificate?: ICertificateEvidence | null;
}

export interface IFollowUpEvidence {
  milestone: "30_day" | "90_day" | "180_day" | "365_day" | string;
  status: "pending" | "retained" | "left_job" | "wage_increased" | "unreachable" | string;
  dueDate: string;
  completedDate?: string | null;
  currentWage?: number | null;
  verifiedBy?: string | null;
  notes?: string | null;
}

export interface IVerificationMetadataEvidence {
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  method?: "employer_portal" | "hr_call" | "offer_letter" | "payslip" | "pf_uan" | string | null;
  disputeReason?: string | null;
  remarks?: string | null;
}

export interface IEmploymentEvidence {
  hasRecord: boolean;
  employerName?: string | null;
  jobRole?: string | null;
  employmentType?: "wage_employment" | "self_employment" | "apprenticeship" | string | null;
  district?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean | null;
  startingWage?: number | null;
  latestWage?: number | null;
  trainingRelevance?: "directly_related" | "partially_related" | "unrelated" | string | null;
  verificationStatus?: "pending" | "verified" | "disputed" | "flagged" | string | null;
  verificationMetadata?: IVerificationMetadataEvidence | null;
  followUps?: IFollowUpEvidence[];
  notes?: string | null;
}

export interface IWageProgressionEvidence {
  startingWage: number;
  latestWage: number;
  wageDelta: number;
  growthPercentage: number;
}

import type {
  IOfficialLabourMarketEvidence,
  IMarketEvidence,
  IPlfsObservation,
} from "@/lib/market-intelligence/types";

export type { IOfficialLabourMarketEvidence, IPlfsObservation };

export interface INormalizedTraineeEvidence {
  trainee: ITraineeEvidence;
  employment: IEmploymentEvidence;
  wageProgression: IWageProgressionEvidence;
  marketEvidence?: IOfficialLabourMarketEvidence | null;
  aggregatedAt: string;
}

/**
 * AI Curriculum Intelligence Result Schema
 *
 * This is the AI-written counterpart to lib/compute.ts's CurriculumInsight:
 * that interface holds the numbers (employment/wage deltas, report counts),
 * this one holds the plain-English policy narrative Gemini (or the
 * deterministic fallback) writes ABOUT those numbers. The AI is never given
 * a chance to invent the numbers themselves -- see buildPrompt() in
 * lib/ai/curriculum-intelligence.ts.
 */
export interface ICurriculumPolicyMemo {
  course: string;
  generatedAt: string;
  headline: string; // one-line summary for a policymaker scanning many of these
  diagnosis: string; // why this course was flagged, grounded in the exact numbers provided
  recommendedAction: string; // concrete, specific curriculum fix
  predictedImpact: string; // plain-language framing of the employment/wage delta as an opportunity
  confidence: "High" | "Medium" | "Low"; // driven by sample size, not vibes
  evidenceUsed: string[];
  source?: "gemini" | "evidence-fallback";
}

export interface ICareerRoadmapStage {
  timeframe: string; // e.g. "Current Role", "Next 3–6 Months", "6–12 Months", "12–24 Months"
  stage: "current" | "short_term" | "medium_term" | "long_term";
  targetRole: string;
  skillsToAcquire: string[];
  recommendedCertification: string;
  estimatedWageRange: string; // e.g. "₹22,000 – ₹28,000 / month" or "₹18,500 / month (Current)"
  rationale: string;
}

export interface IPlfsBenchmarkDetail {
  value: number;
  unit: string;
  tableNumber: string;
  pageNumber: number | string;
  benchmarkLabel: string;
  geographicLevel: string;
  geographicEntity: string;
  limitations: string[];
}

export interface IWageOutlook {
  currentVerifiedWage: string; // e.g. "₹18,500 / month"
  marketBenchmark?: string; // e.g. "₹15,147/month (Mean regular wage)"
  marketBenchmarkSource?: string; // e.g. "MoSPI PLFS 2022-23"
  marketBenchmarkScope?: string; // e.g. "All-India Urban Person — NCO Division 7"
  marketBenchmarkUnavailableReason?: string; // Reason if official data is missing
  occupationGroupBenchmark?: IPlfsBenchmarkDetail | null;
  statewideBenchmark?: IPlfsBenchmarkDetail | null;
  afterNextSkill: string; // e.g. "₹21,000 – ₹25,000 / month"
  oneToTwoYears: string; // e.g. "₹27,000 – ₹35,000 / month"
  threeToFiveYears: string; // e.g. "₹35,000 – ₹50,000 / month"
  potentialGrowthPercentage: string; // e.g. "+35% to +60%"
  growthSummary: string; // Explanation of trajectory and market factors
  disclaimer: string; // "Future wage figures are AI-generated estimates based on available evidence and are not guaranteed."
}

export interface IActionPlanMonth {
  month: number; // 1, 2, 3
  title: string; // e.g. "Foundational Automation & Core Controls"
  focusArea: string; // e.g. "Skill Gap Bridging"
  actions: string[]; // concrete actionable items
}

export interface IActionPlan90Day {
  summary: string;
  months: IActionPlanMonth[];
}

/**
 * AI Career Intelligence Result Schema
 */
export interface IAICareerIntelligenceResult {
  traineeId: string;
  generatedAt: string;
  careerOutcome: "Strong" | "Positive" | "Moderate" | "Needs Attention" | "At Risk";
  outcomeConfidence: number; // 0 - 100
  trainingEmploymentAlignment: "Direct Match" | "Partial Match" | "Unrelated" | "Mismatched";
  alignmentReason: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskReason: string;
  careerInsight: string;
  recommendedNextSkill: {
    skill: string;
    rationale: string;
  };
  evidenceUsed: string[];
  careerRoadmap?: ICareerRoadmapStage[];
  wageOutlook?: IWageOutlook;
  actionPlan90Days?: IActionPlan90Day;
  source?: "gemini" | "evidence-fallback";
}

