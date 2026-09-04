/**
 * Authoritative Repository for Official Labour-Market Intelligence & Qualifications.
 *
 * Rules:
 * 1. Accepts: trainee course/trade, district, NSQF level.
 * 2. Matches trainee to available official evidence.
 * 3. Scope Hierarchy:
 *    district + trade -> state + trade -> national + trade.
 * 4. Records actual geographic scope used.
 * 5. NEVER silently substitutes unrelated occupations.
 * 6. Returns null / unavailable when there is insufficient evidence.
 * 7. Returns source metadata with every benchmark.
 * 8. Never creates synthetic wage numbers.
 */

import type {
  IMarketEvidence,
  GeographicScopeLevel,
  IOccupationMapping,
  INsqfQualificationRecord,
  IWageObservation,
  IPlfsObservation,
  IDemandObservation,
  IOfficialSourceProvenance,
} from "./types";
import {
  OFFICIAL_SOURCES,
  VERIFIED_OCCUPATIONS,
  VERIFIED_QUALIFICATIONS,
  VERIFIED_WAGE_BENCHMARKS,
  VERIFIED_PLFS_OBSERVATIONS,
  VERIFIED_DEMAND_OBSERVATIONS,
} from "./data";

export interface IGetMarketEvidenceParams {
  course?: string | null;
  district?: string | null;
  nsqfLevel?: number | null;
}

/**
 * Normalizes course string and finds exact or tightly aligned vocational occupation.
 * Rejects loose or unrelated matches.
 */
function findMatchingOccupation(course?: string | null): IOccupationMapping | null {
  if (!course || typeof course !== "string") return null;
  const normalized = course.trim().toLowerCase();

  // Strict vocational trade checks
  if (normalized.includes("electrician") || normalized.includes("electrical")) {
    return VERIFIED_OCCUPATIONS.find((o) => o.nco2015Code === "7411.0100") || null;
  }
  if (normalized.includes("cnc") || (normalized.includes("machine") && normalized.includes("operator"))) {
    return VERIFIED_OCCUPATIONS.find((o) => o.nco2015Code === "7223.0101") || null;
  }
  if (normalized.includes("retail") || normalized.includes("sales associate")) {
    return VERIFIED_OCCUPATIONS.find((o) => o.nco2015Code === "5223.0101") || null;
  }
  if (normalized.includes("tailor") || normalized.includes("sewing") || normalized.includes("apparel")) {
    return VERIFIED_OCCUPATIONS.find((o) => o.nco2015Code === "7531.0101") || null;
  }

  return null;
}

/**
 * Retrieves official market intelligence for a given trainee.
 * Returns null if no verified official evidence exists for the candidate's occupation.
 */
export async function getMarketEvidence(
  params: IGetMarketEvidenceParams
): Promise<IMarketEvidence | null> {
  const { course, district, nsqfLevel } = params;

  // 1. Strict Trade / Occupation Resolution
  const occupation = findMatchingOccupation(course);
  if (!occupation) {
    // Rule: Never silently substitute unrelated occupations. Return null when insufficient evidence.
    return null;
  }

  // 2. Resolve Official NCVET NQR Qualifications for this trade
  const tradeLower = occupation.tradeCourseName.toLowerCase();
  const primaryQuals = VERIFIED_QUALIFICATIONS.filter((q) =>
    q.qualificationTitle.toLowerCase().includes(tradeLower)
  );

  const progressionCodes = new Set<string>();
  primaryQuals.forEach((pq) => {
    pq.progressions?.forEach((prog) => {
      progressionCodes.add(prog.targetQualificationCode);
    });
  });

  const qualifications: INsqfQualificationRecord[] = VERIFIED_QUALIFICATIONS.filter(
    (q) =>
      primaryQuals.some((pq) => pq.qualificationCode === q.qualificationCode) ||
      progressionCodes.has(q.qualificationCode)
  );

  // 3. Resolve Verified PLFS 2022-23 Observations (Occupation & State)
  const plfsEntry = VERIFIED_PLFS_OBSERVATIONS[occupation.nco2015Code];
  const occupationBenchmark = plfsEntry?.occupationBenchmark || null;
  const stateBenchmark = plfsEntry?.stateBenchmark || null;

  // 4. Resolve Legacy Wage Observation for backward compatibility
  const rawWage = VERIFIED_WAGE_BENCHMARKS[occupation.nco2015Code] || null;

  // 5. Resolve Regional Demand Observation
  const rawDemand = VERIFIED_DEMAND_OBSERVATIONS[occupation.nco2015Code] || null;

  // 6. Determine Actual Scope Used
  const requestedDistrict = (district || "Unknown District").trim();
  let actualGeographicScope: GeographicScopeLevel = "national";
  let actualGeographicEntity = "India";

  if (rawDemand && rawDemand.districtOrCluster.toLowerCase().includes(requestedDistrict.toLowerCase())) {
    actualGeographicScope = "district";
    actualGeographicEntity = rawDemand.districtOrCluster;
  } else if (stateBenchmark && stateBenchmark.geographicLevel === "state") {
    actualGeographicScope = "state";
    actualGeographicEntity = stateBenchmark.geographicEntity;
  } else if (rawWage && rawWage.scope.geographicLevel === "state") {
    actualGeographicScope = "state";
    actualGeographicEntity = rawWage.scope.geographicEntity;
  } else if (occupationBenchmark) {
    actualGeographicScope = occupationBenchmark.geographicLevel;
    actualGeographicEntity = occupationBenchmark.geographicEntity;
  }

  // 7. Aggregate Provenance of Sources Actually Used
  const sourcesUsedMap = new Map<string, IOfficialSourceProvenance>();

  if (qualifications.length > 0) {
    sourcesUsedMap.set(OFFICIAL_SOURCES.NCVET_NQR.sourceOrganization, OFFICIAL_SOURCES.NCVET_NQR);
  }
  if (occupationBenchmark || stateBenchmark || rawWage) {
    sourcesUsedMap.set(OFFICIAL_SOURCES.MOSPI_PLFS_2023.sourceOrganization, OFFICIAL_SOURCES.MOSPI_PLFS_2023);
  }
  if (rawDemand) {
    sourcesUsedMap.set(rawDemand.source.sourceOrganization, rawDemand.source);
  }
  sourcesUsedMap.set(OFFICIAL_SOURCES.DGE_NCO_2015.sourceOrganization, OFFICIAL_SOURCES.DGE_NCO_2015);

  const sourcesUsed = Array.from(sourcesUsedMap.values());

  // 8. Transparent Limitations Documentation
  const limitations: string[] = [
    `Occupation classified via Ministry of Labour & Employment NCO-2015 code ${occupation.nco2015Code}.`,
  ];

  if (occupationBenchmark) {
    limitations.push(...occupationBenchmark.limitations);
  }
  if (stateBenchmark) {
    limitations.push(...stateBenchmark.limitations);
  }
  if (!occupationBenchmark && !stateBenchmark) {
    limitations.push("Official PLFS benchmark unavailable for this occupation/geography in imported datasets.");
  }

  return {
    occupationCode: occupation.nco2015Code,
    occupationTitle: occupation.nco2015Title,
    trade: occupation.tradeCourseName,
    matchedScope: {
      requestedDistrict,
      actualGeographicScope,
      actualGeographicEntity,
    },
    occupationBenchmark,
    stateBenchmark,
    wageBenchmark: rawWage,
    qualifications,
    demandIndicator: rawDemand,
    sourcesUsed,
    datasetVersion: "GovEvidence-v2024.1-PLFS2023",
    limitations,
  };
}
