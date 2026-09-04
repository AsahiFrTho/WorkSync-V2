'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  ShieldAlert,
  Route,
  Calendar,
  Award,
  Clock,
  ArrowDown,
  Compass,
  ShieldCheck,
  Building2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { IAICareerIntelligenceResult } from '@/lib/ai/types'

interface CareerIntelligenceCardProps {
  traineeId: string
}

const outcomeVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'neutral' | 'default'> = {
  'Strong': 'success',
  'Positive': 'success',
  'Moderate': 'neutral',
  'Needs Attention': 'warning',
  'At Risk': 'destructive',
}

const alignmentVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  'Direct Match': 'success',
  'Partial Match': 'warning',
  'Unrelated': 'destructive',
  'Mismatched': 'destructive',
}

const riskVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  'Low': 'success',
  'Moderate': 'warning',
  'High': 'destructive',
  'Critical': 'destructive',
}

export function CareerIntelligenceCard({ traineeId }: CareerIntelligenceCardProps) {
  const [data, setData] = useState<IAICareerIntelligenceResult | null>(null)
  const [source, setSource] = useState<'gemini' | 'evidence-fallback'>('gemini')
  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'roadmap' | 'wage' | 'actionPlan'>('roadmap')

  const fetchIntelligence = useCallback(async () => {
    try {
      setLoading(true)
      setErrorStatus(null)
      const res = await fetch(`/api/ai/career-intelligence?traineeId=${traineeId}`)
      if (!res.ok) {
        setErrorStatus(res.status)
        return
      }
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
        if (json.source) {
          setSource(json.source)
        }
      } else if (json.traineeId) {
        setData(json)
      } else {
        setErrorStatus(500)
      }
    } catch {
      setErrorStatus(500)
    } finally {
      setLoading(false)
    }
  }, [traineeId])

  useEffect(() => {
    fetchIntelligence()
  }, [fetchIntelligence])

  const evidenceItems: string[] = data?.evidenceUsed
    ? Array.isArray(data.evidenceUsed)
      ? data.evidenceUsed
      : (Object.values(data.evidenceUsed) as string[])
    : []

  const isFallback = source === 'evidence-fallback'

  return (
    <Card className="overflow-hidden border border-border bg-card">
      {/* Header Banner */}
      <CardHeader className="border-b border-border bg-muted/20 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7.5 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm font-bold text-foreground sm:text-base">
                AI Career Intelligence & Upskilling Pathway
              </CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground">
                Decision support synthesizing verified credentials, trade alignment, and career trajectories
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="default" className="font-bold text-[11px]">
              {isFallback ? (
                <span className="flex items-center gap-1">
                  <Cpu className="size-3 text-primary" /> Evidence Synthesis
                </span>
              ) : (
                'Policy AI'
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        {/* Skeleton Pulse Loading State */}
        {loading && (
          <div className="flex flex-col gap-4 py-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted/60" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="h-20 rounded-xl bg-muted" />
              <div className="h-20 rounded-xl bg-muted" />
              <div className="h-20 rounded-xl bg-muted" />
            </div>
            <div className="h-24 rounded-xl bg-muted/60" />
          </div>
        )}

        {/* Error State */}
        {!loading && errorStatus && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-warning/30 bg-warning/10 p-6 text-center">
            <AlertTriangle className="size-6 text-warning" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-foreground">
                Career Intelligence Unavailable
              </p>
              <p className="max-w-md text-xs font-medium text-muted-foreground">
                The career intelligence engine could not locate records for this candidate. Please ensure database is seeded.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchIntelligence}
              className="mt-1 h-8 text-xs font-bold border-border bg-card hover:bg-muted text-foreground"
            >
              <RefreshCw className="mr-1.5 size-3.5 text-primary" /> Retry Synthesis
            </Button>
          </div>
        )}

        {/* Success Content */}
        {!loading && data && (
          <div className="flex flex-col gap-5">
            {/* Verified Source Indicator */}
            <div className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary shadow-2xs">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              <span>Grounded in MoSPI PLFS 2022–23 &amp; NCVET NQR Qualification Framework</span>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-3.5 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Career Trajectory
                </span>
                <div className="mt-2 flex items-center">
                  <Badge
                    variant={outcomeVariantMap[data.careerOutcome] || 'neutral'}
                    className="text-xs font-bold px-2.5 py-0.5"
                  >
                    {data.careerOutcome}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-3.5 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Training Alignment
                </span>
                <div className="mt-2 flex items-center">
                  <Badge
                    variant={alignmentVariantMap[data.trainingEmploymentAlignment] || 'neutral'}
                    className="text-xs font-bold px-2.5 py-0.5"
                  >
                    {data.trainingEmploymentAlignment}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Retention Risk
                  </span>
                  <Badge
                    variant={riskVariantMap[data.riskLevel] || 'neutral'}
                    className="text-xs font-bold px-2.5 py-0.5"
                  >
                    {data.riskLevel}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Model Confidence:</span>
                    <span className="font-extrabold text-foreground tabular-nums">
                      {data.outcomeConfidence}%
                    </span>
                  </div>
                  <Progress value={data.outcomeConfidence} className="h-1.5" />
                </div>
              </div>
            </div>

            {/* Strategic Narrative */}
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-foreground shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Brain className="size-4 text-primary" aria-hidden="true" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Synthesized Career Insight
                </h4>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed font-medium text-foreground text-pretty">
                {data.careerInsight}
              </p>
            </div>

            {/* Alignment & Risk Detailed Reasons */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/20 p-3.5 text-xs shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Alignment Rationale</span>
                </div>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {data.alignmentReason}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/20 p-3.5 text-xs shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <AlertCircle className="size-3.5 text-warning" />
                  <span>Retention Risk Assessment</span>
                </div>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {data.riskReason}
                </p>
              </div>
            </div>

            {/* Recommended Next Skill Card */}
            <div className="flex items-start gap-3.5 rounded-xl border border-primary/30 bg-primary/10 p-4 text-foreground shadow-2xs">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Lightbulb className="size-4.5" aria-hidden="true" />
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Recommended Next Skill:
                  </span>
                  <Badge variant="default" className="text-xs font-bold py-0.5 px-2.5">
                    {data.recommendedNextSkill?.skill || 'Domain Skill Enhancement'}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-foreground/90 leading-relaxed text-pretty">
                  {data.recommendedNextSkill?.rationale}
                </p>
              </div>
            </div>

            {/* 3 Extended Capabilities: Career Roadmap, Wage Outlook, 90-Day Action Plan */}
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              {/* Section Header with Segmented Tab Controls */}
              <div className="flex flex-col gap-3 pb-3 border-b border-border lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
                    <Compass className="size-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground sm:text-sm">
                      AI-Powered Career Roadmap
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      Actionable progression, wage outlook & 90-day execution milestones
                    </p>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border">
                  <button
                    type="button"
                    onClick={() => setActiveTab('roadmap')}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all",
                      activeTab === 'roadmap'
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Route className="size-3.5" />
                    Personalized Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('wage')}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all",
                      activeTab === 'wage'
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <TrendingUp className="size-3.5" />
                    Wage Outlook
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('actionPlan')}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all",
                      activeTab === 'actionPlan'
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Calendar className="size-3.5" />
                    90-Day Action Plan
                  </button>
                </div>
              </div>

              {/* Tab 1: Personalized Roadmap */}
              {activeTab === 'roadmap' && (
                <div className="flex flex-col gap-4">
                  {data.careerRoadmap && data.careerRoadmap.length > 0 ? (
                    <div className="relative flex flex-col gap-3">
                      {data.careerRoadmap.map((stage, idx) => {
                        const isCurrent = stage.stage === 'current' || idx === 0
                        return (
                          <div key={idx} className="relative flex flex-col gap-2">
                            <div
                              className={cn(
                                "flex flex-col gap-3 rounded-xl border p-4 shadow-2xs transition-all",
                                isCurrent
                                  ? "border-success/40 bg-success/5"
                                  : "border-border bg-muted/20"
                              )}
                            >
                              {/* Stage Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant={isCurrent ? 'success' : 'default'}
                                    className="text-[11px] font-extrabold uppercase tracking-wide"
                                  >
                                    {isCurrent ? (
                                      <span className="flex items-center gap-1">
                                        <CheckCircle2 className="size-3" />
                                        {stage.timeframe}
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <Clock className="size-3" />
                                        {stage.timeframe}
                                      </span>
                                    )}
                                  </Badge>
                                  <span className="text-xs font-bold text-foreground sm:text-sm">
                                    {stage.targetRole}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold font-mono",
                                      isCurrent
                                        ? "border border-success/30 bg-success/15 text-success"
                                        : "border border-primary/30 bg-primary/10 text-primary"
                                    )}
                                  >
                                    {stage.estimatedWageRange}
                                  </span>
                                </div>
                              </div>

                              {/* Skills to acquire / Verified competencies */}
                              {stage.skillsToAcquire && stage.skillsToAcquire.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {isCurrent ? "Verified Competencies:" : "Skills To Acquire:"}
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {stage.skillsToAcquire.map((skill, sIdx) => (
                                      <span
                                        key={sIdx}
                                        className="inline-flex items-center rounded-md border border-border/70 bg-card px-2.5 py-0.5 text-xs font-medium text-foreground shadow-2xs"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Recommended Certification & Rationale */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/50 text-xs">
                                <div className="flex items-start gap-1.5 text-muted-foreground">
                                  <Award className="size-3.5 text-primary shrink-0 mt-0.5" />
                                  <span>
                                    <strong className="text-foreground font-semibold">Recommended Certification: </strong>
                                    {stage.recommendedCertification}
                                  </span>
                                </div>
                                <div className="flex items-start gap-1.5 text-muted-foreground">
                                  <Sparkles className="size-3.5 text-primary shrink-0 mt-0.5" />
                                  <span>
                                    <strong className="text-foreground font-semibold">Progression Rationale: </strong>
                                    {stage.rationale}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Flow Connector Arrow */}
                            {idx < (data.careerRoadmap?.length ?? 0) - 1 && (
                              <div className="flex items-center justify-center -my-1 text-primary/70">
                                <span className="flex size-5 items-center justify-center rounded-full border border-border bg-card shadow-2xs">
                                  <ArrowDown className="size-3 text-primary" />
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Roadmap stages currently being synthesized from candidate profile.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Wage Outlook */}
              {activeTab === 'wage' && (
                <div className="flex flex-col gap-5">
                  {/* Section 1 & 2: Current Verified Wage & Official Labour-Market Evidence */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-primary" />
                      <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Verified Baseline &amp; Official Labour-Market Evidence
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Card 1: Current Verified Wage */}
                      <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-success/30 bg-success/5 p-4 shadow-2xs">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Current Verified Wage
                          </span>
                          <Badge variant="success" className="text-[10px] font-bold py-0.5 px-1.5">
                            <CheckCircle2 className="size-2.5 mr-1" /> Candidate Record
                          </Badge>
                        </div>
                        <div>
                          <div className="text-lg font-extrabold font-mono text-success sm:text-xl">
                            {data.wageOutlook?.currentVerifiedWage || "Verification Pending"}
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            Directly verified via employer confirmation / payslip milestone
                          </p>
                        </div>
                      </div>

                      {/* Card 2: All-India Occupation Group Benchmark */}
                      {data.wageOutlook?.occupationGroupBenchmark ? (
                        <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-2xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              All-India Occupation Group Benchmark
                            </span>
                            <Badge variant="outline" className="text-[10px] font-bold py-0.5 px-1.5 border-primary/40 text-primary">
                              MoSPI PLFS
                            </Badge>
                          </div>
                          <div>
                            <div className="text-lg font-extrabold font-mono text-foreground sm:text-xl">
                              ₹{data.wageOutlook.occupationGroupBenchmark.value.toLocaleString("en-IN")}/month
                            </div>
                            <p className="mt-1 text-[11px] font-semibold text-foreground/80">
                              {data.wageOutlook.occupationGroupBenchmark.benchmarkLabel}
                            </p>
                            <p className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                              PLFS 2022–23 • {data.wageOutlook.occupationGroupBenchmark.tableNumber}, Page {data.wageOutlook.occupationGroupBenchmark.pageNumber}
                            </p>
                          </div>
                          {data.wageOutlook.occupationGroupBenchmark.limitations?.[0] && (
                            <p className="text-[10px] text-muted-foreground italic border-t border-border/40 pt-1.5">
                              Note: {data.wageOutlook.occupationGroupBenchmark.limitations[0]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-border bg-muted/15 p-4 shadow-2xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Occupation Group Benchmark
                            </span>
                            <Badge variant="neutral" className="text-[10px] font-bold py-0.5 px-1.5">
                              Unavailable
                            </Badge>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-muted-foreground">
                              Official Benchmark Unavailable
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {data.wageOutlook?.marketBenchmarkUnavailableReason || "Official PLFS benchmark unavailable for this occupation/geography."}
                            </p>
                          </div>
                          <p className="text-[10px] text-muted-foreground italic border-t border-border/40 pt-1.5">
                            Emerging/specialized trades do not have separate 1-digit NCO PLFS survey tables.
                          </p>
                        </div>
                      )}

                      {/* Card 3: Maharashtra Statewide Benchmark */}
                      {data.wageOutlook?.statewideBenchmark ? (
                        <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-2xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              Maharashtra Statewide Benchmark
                            </span>
                            <Badge variant="outline" className="text-[10px] font-bold py-0.5 px-1.5 border-primary/40 text-primary">
                              State Average
                            </Badge>
                          </div>
                          <div>
                            <div className="text-lg font-extrabold font-mono text-foreground sm:text-xl">
                              ₹{data.wageOutlook.statewideBenchmark.value.toLocaleString("en-IN")}/month
                            </div>
                            <p className="mt-1 text-[11px] font-semibold text-foreground/80">
                              {data.wageOutlook.statewideBenchmark.benchmarkLabel}
                            </p>
                            <p className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                              PLFS 2022–23 • {data.wageOutlook.statewideBenchmark.tableNumber}, Page {data.wageOutlook.statewideBenchmark.pageNumber}
                            </p>
                          </div>
                          {data.wageOutlook.statewideBenchmark.limitations?.[0] && (
                            <p className="text-[10px] text-muted-foreground italic border-t border-border/40 pt-1.5">
                              Note: {data.wageOutlook.statewideBenchmark.limitations[0]}
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Section 3: AI Projected Wage Progression */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-primary/30 bg-primary/10 p-3.5 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-4 text-primary shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          AI Projected Wage Progression:
                        </span>
                      </div>
                      <Badge variant="default" className="text-xs font-extrabold px-3 py-1 self-start sm:self-auto font-mono">
                        {data.wageOutlook?.potentialGrowthPercentage || "+40% to +80%"}
                      </Badge>
                    </div>

                    {/* 3 Forward-Looking Projection Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* After Next Skill */}
                      <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4 shadow-2xs">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            After Next Skill
                          </span>
                          <Badge variant="default" className="text-[10px] font-bold py-0.5 px-1.5">
                            AI Estimate
                          </Badge>
                        </div>
                        <div>
                          <div className="text-base font-extrabold font-mono text-foreground sm:text-lg">
                            {data.wageOutlook?.afterNextSkill || "₹21,000 – ₹25,000 / mo"}
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            Projected upon acquiring recommended next skill
                          </p>
                        </div>
                      </div>

                      {/* 1–2 Years */}
                      <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4 shadow-2xs">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            1–2 Years
                          </span>
                          <Badge variant="default" className="text-[10px] font-bold py-0.5 px-1.5">
                            AI Projection
                          </Badge>
                        </div>
                        <div>
                          <div className="text-base font-extrabold font-mono text-foreground sm:text-lg">
                            {data.wageOutlook?.oneToTwoYears || "₹27,000 – ₹35,000 / mo"}
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            Upon transitioning to advanced trade technician tier
                          </p>
                        </div>
                      </div>

                      {/* 3–5 Years */}
                      <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4 shadow-2xs">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            3–5 Years
                          </span>
                          <Badge variant="default" className="text-[10px] font-bold py-0.5 px-1.5">
                            AI Projection
                          </Badge>
                        </div>
                        <div>
                          <div className="text-base font-extrabold font-mono text-foreground sm:text-lg">
                            {data.wageOutlook?.threeToFiveYears || "₹35,000 – ₹50,000 / mo"}
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            Senior supervisory &amp; specialized compensation band
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Regional Wage Driver Analysis */}
                  {data.wageOutlook?.growthSummary && (
                    <div className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs text-muted-foreground shadow-2xs">
                      <div className="flex items-center gap-1.5 font-bold text-foreground mb-1">
                        <Sparkles className="size-3.5 text-primary" />
                        <span>Regional Wage Driver Analysis</span>
                      </div>
                      <p className="leading-relaxed font-medium">
                        {data.wageOutlook.growthSummary}
                      </p>
                    </div>
                  )}

                  {/* Mandatory Statutory Disclaimer */}
                  <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3.5 py-2.5 text-[11px] text-muted-foreground">
                    <AlertCircle className="size-3.5 text-warning shrink-0" />
                    <span>
                      {data.wageOutlook?.disclaimer ||
                        "Future wage figures are AI-generated estimates based on available evidence and are not guaranteed. Official market benchmarks reflect MoSPI PLFS observed survey data."}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 3: 90-Day Action Plan */}
              {activeTab === 'actionPlan' && (
                <div className="flex flex-col gap-4">
                  {/* Strategic Plan Objective Header */}
                  {data.actionPlan90Days?.summary && (
                    <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-xs text-foreground shadow-2xs">
                      <div className="flex items-center gap-1.5 font-bold text-primary mb-1">
                        <Calendar className="size-3.5" />
                        <span className="uppercase tracking-wider">Your Next 90 Days — Strategic Objective</span>
                      </div>
                      <p className="leading-relaxed font-medium">
                        {data.actionPlan90Days.summary}
                      </p>
                    </div>
                  )}

                  {/* Month-by-Month Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {data.actionPlan90Days?.months && data.actionPlan90Days.months.length > 0 ? (
                      data.actionPlan90Days.months.map((m) => (
                        <div
                          key={m.month}
                          className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4 shadow-2xs"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-1">
                              <Badge variant="default" className="text-[10px] font-extrabold uppercase px-2 py-0.5">
                                MONTH {m.month}
                              </Badge>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                {m.focusArea}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-foreground leading-snug">
                              {m.title}
                            </h5>
                            <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
                              {m.actions.map((act, aIdx) => (
                                <div key={aIdx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                                  <span className="leading-snug font-medium text-foreground/90">{act}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 p-4 text-center text-xs text-muted-foreground">
                        90-day action plan currently being synthesized.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Grounding Badges */}
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-3.5 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground font-bold">
                <FileCheck className="size-3.5 text-primary" aria-hidden="true" />
                <span>Evidence Grounding:</span>
              </div>
              {evidenceItems.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {evidenceItems.map((ev: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-mono font-medium text-foreground shadow-2xs"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-1 pt-2 border-t border-border text-[11px] text-muted-foreground font-medium italic">
                {isFallback
                  ? 'Synthesized from verified training, employment, verification, and wage evidence (evidence-grounded fallback mode).'
                  : 'AI-generated from available verified training, employment, verification, and wage evidence.'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
