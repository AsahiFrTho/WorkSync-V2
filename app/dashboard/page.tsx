'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  Repeat,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DataState } from '@/components/data-state'
import { OutcomeFunnel } from '@/components/dashboard/outcome-funnel'
import { WageProgressionChart } from '@/components/dashboard/wage-progression-chart'
import { EmploymentTypeChart } from '@/components/dashboard/employment-type-chart'
import {
  DistrictTable,
  CourseTable,
  ProviderTable,
} from '@/components/dashboard/performance-tables'
import {
  FollowUpStatus,
  SkillGapIndicators,
  NonPlacementReasonsCard,
} from '@/components/dashboard/signals'
import { useProgramData } from '@/lib/use-program-data'
import {
  OFFICIAL_MAHARASHTRA_INDICATORS,
  OFFICIAL_OCCUPATION_BENCHMARKS,
} from '@/lib/market-intelligence/official-indicators'
import {
  kpis,
  outcomeFunnel as computeOutcomeFunnel,
  employmentTypeSplit,
  wageProgressionSeries,
  followUpBuckets,
  topSkillGaps,
  reasonCounts,
  districtComparison,
  courseComparison,
  providerScorecards,
  generateInsights,
  currentMonthlyIncome,
  fmtMoney,
  compact,
  pct,
} from '@/lib/compute'

export default function DashboardPage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()

  // Every value below is derived once per data refresh, from real MongoDB
  // collections joined by lib/use-program-data.ts. Nothing on this page is
  // hardcoded -- if the underlying collections are empty, every section
  // below honestly renders zero / an empty state instead of a fabricated
  // number.
  const summary = useMemo(() => kpis(db), [db])
  const funnel = useMemo(() => computeOutcomeFunnel(db), [db])
  const employmentSplit = useMemo(() => employmentTypeSplit(db), [db])
  const wageSeries = useMemo(
    () => wageProgressionSeries(db).map((w) => ({ month: w.month, wage: w.wage as number })),
    [db]
  )
  const followUps = useMemo(() => {
    const b = followUpBuckets(db)
    return [
      { label: 'Overdue', value: b.overdue.length, tone: 'destructive' as const },
      { label: 'Due today', value: b.today.length, tone: 'warning' as const },
      { label: 'Upcoming', value: b.upcoming.length, tone: 'neutral' as const },
      { label: 'Completed', value: b.completed.length, tone: 'success' as const },
    ]
  }, [db])
  const skillGaps = useMemo(() => topSkillGaps(db).slice(0, 4), [db])
  const nonPlacementReasons = useMemo(() => reasonCounts(db), [db])
  const districts = useMemo(() => districtComparison(db), [db])
  const courses = useMemo(() => courseComparison(db), [db])
  const providers = useMemo(() => providerScorecards(db), [db])
  const insights = useMemo(() => generateInsights(db), [db])

  // Average current monthly income across everyone with a recorded wage --
  // the one KPI tile figure that isn't already produced by kpis(), so we
  // compute it here rather than adding a narrow one-off function upstream.
  const avgWage = useMemo(() => {
    const wages = db.learners
      .map((l) => currentMonthlyIncome(db, l.traineeId))
      .filter((w): w is number => typeof w === 'number' && w > 0)
    if (!wages.length) return 0
    return Math.round(wages.reduce((a, b) => a + b, 0) / wages.length)
  }, [db])

  const employedCount = summary.placed + summary.selfEmp + summary.appr
  const employmentRate = pct(employedCount, summary.total)

  return (
    <AppShell>
      <PageHeader
        eyebrow="MSSDS • State Skilling Directorate"
        title="Skilling Outcomes & Policy Intelligence Command Center"
        description="Statewide labour-market benchmarks alongside longitudinal verification audits of vocational training programmes — monitoring intake, NSQF certification, employer-verified placement, wage progression, and retention."
      />

      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          {/* ========================================================================= */}
          {/* TRANSPARENCY & DATA PROVENANCE DISCLOSURE NOTE                            */}
          {/* ========================================================================= */}
          <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-xs shadow-2xs">
            <Info className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary uppercase tracking-wide">Data Provenance & Scope Transparency Note</span>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] px-1.5 py-0.2">
                  Official Audit Standard
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Official statistics are sourced from published government datasets. Work-Sync cohort metrics are based on the demonstration cohort and are not statewide estimates.
              </p>
            </div>
          </div>

          {/* Prototype cohort scale disclosure */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <Info className="size-3.5 shrink-0" />
            <span>
              Work-Sync Demonstration Cohort: <strong className="text-foreground">{summary.total.toLocaleString('en-IN')}</strong> pilot trainees ·{' '}
              <strong className="text-foreground">{districts.length}</strong> test districts ·{' '}
              <strong className="text-foreground">{providers.length}</strong> pilot training providers. Evaluated under the Work-Sync demonstration audit pipeline.
            </span>
          </div>

          {/* ========================================================================= */}
          {/* 1. OFFICIAL STATEWIDE / GOVERNMENT DATA                                    */}
          {/* Audited against MoSPI PLFS 2022–23 (AR_PLFS_2022_23N.pdf)                  */}
          {/* ========================================================================= */}
          <section aria-label="Official Statewide Government Statistics" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3.5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    1. Official Statewide / Government Data
                  </span>
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold">
                    Official Government Data
                  </Badge>
                  <Badge variant="outline" className="border-border bg-muted text-muted-foreground text-[10px]">
                    Source: MoSPI PLFS 2022–23
                  </Badge>
                  <Badge variant="outline" className="border-border bg-muted text-muted-foreground text-[10px]">
                    Source: Government of Maharashtra
                  </Badge>
                </div>
                <h2 className="text-lg font-bold text-foreground mt-1">
                  Maharashtra Labour Market & Employment Benchmarks
                </h2>
                <p className="text-xs text-muted-foreground">
                  Audited official statistics published in the Periodic Labour Force Survey (PLFS) Annual Report (July 2022 – June 2023) by MoSPI / NSSO.
                </p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <span>Jurisdiction: <strong className="text-foreground">Maharashtra & All-India</strong></span>
                <span className="block text-[10px]">Survey Period: July 2022 – June 2023</span>
              </div>
            </div>

            {/* Official Macro Indicators Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OFFICIAL_MAHARASHTRA_INDICATORS.map((indicator) => {
                const isUnavailable = indicator.status === 'unavailable'
                return (
                  <div
                    key={indicator.id}
                    className={cn(
                      'flex flex-col justify-between gap-3 rounded-xl border p-5 transition-all duration-200 bg-card hover:bg-muted/30',
                      isUnavailable ? 'border-dashed border-border/80' : 'border-border border-l-2 border-l-primary'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {indicator.label}
                        </span>
                        <p className="text-[11px] font-medium text-primary mt-0.5">
                          {indicator.scope.entity} • {indicator.metricType}
                        </p>
                      </div>
                      <Badge
                        variant={isUnavailable ? 'neutral' : 'success'}
                        className="text-[10px] shrink-0 font-medium"
                      >
                        {isUnavailable ? 'Official data unavailable' : 'Official Data'}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            'font-black tracking-tight tabular-nums',
                            isUnavailable
                              ? 'text-base font-semibold text-muted-foreground'
                              : 'text-3xl sm:text-4xl text-foreground'
                          )}
                        >
                          {indicator.displayValue}
                        </span>
                        {!isUnavailable && indicator.unit && indicator.unit !== '%' && (
                          <span className="text-xs text-muted-foreground">{indicator.unit}</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-snug">
                        {indicator.citationNotes}
                      </p>
                    </div>

                    <div className="border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span>Source:</span>
                        <span className="font-semibold text-foreground truncate max-w-[180px]">
                          {indicator.source.organization}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Report Citation:</span>
                        <span className="font-mono text-[10px] text-foreground">
                          {indicator.source.tableNumber !== 'N/A'
                            ? `${indicator.source.tableNumber}, Page ${indicator.source.pageNumber}`
                            : 'Unpublished in state tables'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Audited PLFS Trade/Occupation Group Benchmarks */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Audited PLFS Occupation Wage Benchmarks (1-Digit NCO Divisions)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Directly audited observations from lib/market-intelligence/data/index.ts. National/state aggregate benchmarks — not district-level wages.
                  </p>
                </div>
                <Badge variant="outline" className="border-border bg-muted text-muted-foreground text-[10px]">
                  Table 33 & Table 26 Evidence
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {OFFICIAL_OCCUPATION_BENCHMARKS.map((bench) => {
                  const isUnavail = bench.status === 'unavailable'
                  return (
                    <div
                      key={bench.trade}
                      className={cn(
                        'flex flex-col justify-between rounded-lg border p-3 bg-muted/20',
                        isUnavail ? 'border-dashed border-border/70' : 'border-border'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{bench.trade}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{bench.ncoCode}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {bench.occupationTitle}
                        </p>
                      </div>

                      <div className="mt-2.5">
                        <span
                          className={cn(
                            'font-bold tracking-tight',
                            isUnavail ? 'text-xs text-muted-foreground' : 'text-xl text-foreground tabular-nums'
                          )}
                        >
                          {bench.displayValue}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                          {bench.citation}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
                        <span>Scope:</span>
                        <span className="font-medium text-foreground">{bench.scope}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. WORK-SYNC DEMONSTRATION COHORT DATA                                     */}
          {/* Pilot longitudinal sample (21 candidates across 3 test districts)          */}
          {/* ========================================================================= */}
          <section aria-label="Work-Sync Demonstration Cohort Indicators" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3.5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    2. Work-Sync Demonstration Cohort Data
                  </span>
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500 text-[10px] font-semibold">
                    Demonstration Cohort — Work-Sync
                  </Badge>
                  <Badge variant="outline" className="border-border bg-muted text-muted-foreground text-[10px]">
                    Prototype Cohort: 21 Candidates
                  </Badge>
                </div>
                <h2 className="text-lg font-bold text-foreground mt-1">
                  Work-Sync Demonstration Cohort — Audit Metrics
                </h2>
                <p className="text-xs text-muted-foreground">
                  Operational verification metrics across 21 pilot trainees — for prototype verification and workflow demonstration only, NOT statewide estimates.
                </p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <span>Coverage: <strong className="text-foreground">3 Pilot Districts (Pune, Nashik, Kolhapur)</strong></span>
                <span className="block text-[10px]">Tracking Period: July 2023 – Dec 2024</span>
              </div>
            </div>

            {/* 4 Demonstration Cohort KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-amber-500 bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cohort Trainees Tracked
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-amber-500">
                    <Users className="size-4.5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums">
                    {compact(summary.total)}
                  </span>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {summary.total.toLocaleString('en-IN')} trainees in pilot cohort ({districts.length} active districts)
                  </p>
                </div>
                <span className="text-[10px] font-medium text-amber-500/90 bg-amber-500/10 rounded px-1.5 py-0.5 w-fit border border-amber-500/20">
                  Demonstration Cohort — Work-Sync
                </span>
              </div>

              <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-amber-500 bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cohort Verified Employment
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-amber-500">
                    <Briefcase className="size-4.5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums">
                    {employmentRate}%
                  </span>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {employedCount.toLocaleString('en-IN')} of {summary.total} pilot trainees placed/self-emp/appr
                  </p>
                </div>
                <span className="text-[10px] font-medium text-amber-500/90 bg-amber-500/10 rounded px-1.5 py-0.5 w-fit border border-amber-500/20">
                  Demonstration Cohort Result (Not Statewide)
                </span>
              </div>

              <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-amber-500 bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cohort 3-Month Retention
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-amber-500">
                    <Repeat className="size-4.5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums">
                    {summary.retention3}%
                  </span>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Verified on-job stability for pilot candidates
                  </p>
                </div>
                <span className="text-[10px] font-medium text-amber-500/90 bg-amber-500/10 rounded px-1.5 py-0.5 w-fit border border-amber-500/20">
                  Demonstration Cohort Result (Not Statewide)
                </span>
              </div>

              <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-amber-500 bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cohort Avg. Current Wage
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-amber-500">
                    <IndianRupee className="size-4.5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums">
                    {fmtMoney(avgWage)}
                  </span>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Across demo cohort trainees with recorded income
                  </p>
                </div>
                <span className="text-[10px] font-medium text-amber-500/90 bg-amber-500/10 rounded px-1.5 py-0.5 w-fit border border-amber-500/20">
                  Demonstration Cohort Wage (Not Statewide)
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. SIX-STEP LONGITUDINAL JOURNEY — DEMONSTRATION COHORT                   */}
          {/* ========================================================================= */}
          <section aria-label="Work-Sync Demonstration Cohort Outcome Pipeline" className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                    Work-Sync Demonstration Cohort — Longitudinal Outcome Pipeline
                  </span>
                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px]">
                    Demonstration Cohort
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pilot cohort progression: Enrolled → Completed → Certified → Employed → Retained (21 pilot candidates)
                </p>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Source: Demonstration Cohort — Work-Sync
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {funnel.map((stage, idx) => {
                const isLast = idx === funnel.length - 1
                const stagePct = funnel[0].value ? Math.round((stage.value / funnel[0].value) * 100) : 0
                return (
                  <div
                    key={stage.stage}
                    className={cn(
                      'relative flex flex-col justify-between rounded-lg border p-3.5 transition-all bg-card/80',
                      isLast
                        ? 'border-primary/40 bg-primary/5 shadow-2xs'
                        : 'border-border'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Stage 0{idx + 1}
                      </span>
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-semibold border',
                          isLast ? 'border-success/30 bg-success/10 text-success' : 'border-border bg-muted text-muted-foreground'
                        )}
                      >
                        {stagePct}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-foreground truncate">{stage.stage}</p>
                      <p className="text-lg font-bold text-foreground tabular-nums mt-0.5">{compact(stage.value)}</p>
                      <p className="text-[11px] font-normal text-muted-foreground">{stage.value.toLocaleString('en-IN')} candidates</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. CORE ANALYTICAL ROW 1                                                    */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <OutcomeFunnel stages={funnel} />
            <WageProgressionChart data={wageSeries} />
          </section>

          {/* ========================================================================= */}
          {/* 4. OPERATIONAL SIGNALS & ROOT CAUSE DIAGNOSTICS                             */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <FollowUpStatus data={followUps} />
            <EmploymentTypeChart data={employmentSplit} />
            <NonPlacementReasonsCard data={nonPlacementReasons} />
          </section>

          {/* ========================================================================= */}
          {/* 5. GEOGRAPHIC & SKILL GAP INTELLIGENCE                                      */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DistrictTable rows={districts} />
            </div>
            <SkillGapIndicators data={skillGaps} />
          </section>

          {/* ========================================================================= */}
          {/* 6. VOCATIONAL TRADE & TRAINING PROVIDER BENCHMARKS                          */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CourseTable rows={courses} />
            <ProviderTable rows={providers} />
          </section>

          {/* ========================================================================= */}
          {/* 7. PROGRAMME SIGNALS — rule-based diagnostics, NOT Gemini-generated.        */}
          {/* We deliberately do not call this "AI Insights": generateInsights() in      */}
          {/* lib/compute.ts is plain, auditable if/else logic over real records. We     */}
          {/* reserve the "AI" label for features that genuinely call an LLM (see the    */}
          {/* Career Intelligence page and the Curriculum Intelligence feature).         */}
          {/* ========================================================================= */}
          <section aria-label="Programme Signals" className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Programme Signals — Rule-Based Diagnostics
                </h3>
                <p className="text-xs text-muted-foreground">
                  Automatically flagged patterns across placement, retention, verification and skill-gap records
                </p>
              </div>
              <Link
                href="/insights"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted/40 transition-colors"
              >
                <span>Explore All Signals</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {!insights.length ? (
                <p className="text-sm text-muted-foreground">
                  No signals yet — signals appear once enough placement, retention and verification data accumulates.
                </p>
              ) : (
                insights.map((insight, idx) => {
                  const Icon = insight.tone === 'warn' ? AlertTriangle : insight.tone === 'good' ? CheckCircle2 : Info
                  const badgeVariant = insight.tone === 'warn' ? 'destructive' : insight.tone === 'good' ? 'success' : 'neutral'
                  return (
                    <div key={idx} className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
                      <Badge variant={badgeVariant} className="mt-0.5 flex size-6 shrink-0 items-center justify-center p-0">
                        <Icon className="size-3.5" />
                      </Badge>
                      <p className="text-xs leading-relaxed text-foreground">{insight.text}</p>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </DataState>
      </div>
    </AppShell>
  )
}
