'use client'

import { useMemo } from 'react'
import { Building2, Award, HelpCircle, CheckCircle2, AlertTriangle, ShieldCheck, Scale } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, Th, Td } from '@/components/ui/table'
import { DataState } from '@/components/data-state'
import { useProgramData } from '@/lib/use-program-data'
import { providerScorecards } from '@/lib/compute'
import { cn } from '@/lib/utils'

const BADGE_TONES: Record<string, 'success' | 'warning' | 'destructive'> = {
  Strong: 'success',
  Improving: 'warning',
  'Needs attention': 'destructive',
}

function MiniBar({ value, invert = false }: { value: number; invert?: boolean }) {
  const tone = invert
    ? value >= 80
      ? 'bg-success'
      : value >= 50
        ? 'bg-warning'
        : 'bg-destructive'
    : value >= 70
      ? 'bg-success'
      : value >= 45
        ? 'bg-warning'
        : 'bg-destructive'
  return (
    <div className="flex min-w-[110px] items-center gap-2">
      <Progress value={value} indicatorClassName={tone} className="flex-1 h-1.5" />
      <span className="w-9 text-right text-[11px] font-semibold text-foreground tabular-nums">{value}%</span>
    </div>
  )
}

export default function ScorecardPage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const cards = useMemo(() => providerScorecards(db), [db])
  const best = [...cards].sort((a, b) => b.composite - a.composite)[0]

  return (
    <AppShell>
      <PageHeader
        eyebrow="MSSDS • Institutional Accountability & Ranking"
        title="Vocational Training Provider Scorecards"
        description="Comprehensive accountability assessment evaluating training providers across placement conversion, employer verification fidelity, 3-month retention, and data hygiene."
      />
      
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          
          {/* ========================================================================= */}
          {/* FORMULA & GOVERNANCE TIERS EXPLAINER BANNER                               */}
          {/* ========================================================================= */}
          <Card className="border border-border bg-card shadow-xs rounded-xl overflow-hidden">
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Scale className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Composite Score Formula & Governance Benchmark
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Composite Index = <strong>Outcome Quality (40%)</strong> + <strong>Data Hygiene & Verification (35%)</strong> + <strong>Follow-up & Skill Alignment (25%)</strong>
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-border text-muted-foreground font-mono self-start sm:self-auto">
                  MSSDS AUDIT STANDARD
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-success/30 bg-success/5 p-3 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-success text-[11px] uppercase">Tier 1: Strong (80–100)</span>
                    <CheckCircle2 className="size-3.5 text-success" />
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Priority allocation for upcoming government skill funding batches, expedited certification, and statewide commendation.
                  </p>
                </div>

                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-warning text-[11px] uppercase">Tier 2: Improving (65–79)</span>
                    <AlertTriangle className="size-3.5 text-warning" />
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Standard compliance status with scheduled quarterly follow-up and curriculum adjustment recommendations.
                  </p>
                </div>

                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-destructive text-[11px] uppercase">Tier 3: Needs Attention (&lt;65)</span>
                    <AlertTriangle className="size-3.5 text-destructive" />
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Mandatory corrective action plan required within 60 days; conditional renewal of center affiliation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* PROVIDER SCORECARDS GRID (MINIMALIST INSTITUTIONAL THEMING)                */}
          {/* ========================================================================= */}
          <div className="grid gap-6 lg:grid-cols-3">
            {cards.map((c) => (
              <Card key={c.provider.id} className="overflow-hidden border border-border bg-card shadow-xs rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-primary">
                        <Building2 className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground leading-tight truncate">{c.provider.name}</div>
                        <div className="text-[11px] font-normal text-muted-foreground truncate mt-0.5">
                          {c.provider.district} · {c.learners} registered learners
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-2xl font-black tracking-tight text-foreground tabular-nums">{c.composite}</div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Index</div>
                    </div>
                  </div>

                  <CardContent className="flex flex-col gap-2.5 pt-4 pb-3">
                    {[
                      ['Placement rate', c.placementRate],
                      ['Verified placement', c.verifiedRate],
                      ['Retention (3 mo)', c.retentionRate],
                      ['Data completeness', c.completeness],
                      ['Follow-up completion', c.followUpRate],
                      ['Employer verification', c.employerVerRate],
                    ].map(([label, v]) => (
                      <div key={label as string} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-normal text-muted-foreground truncate">
                          {label}
                        </span>
                        <MiniBar value={v as number} />
                      </div>
                    ))}
                    
                    <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                      <span className="text-[11px] text-muted-foreground">Avg Wage Growth:</span>
                      <span className={cn('text-xs font-bold tabular-nums', c.wageGrowth >= 0 ? 'text-success' : 'text-destructive')}>
                        +{c.wageGrowth}%
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-2">Skill Gap:</span>
                      <span className="text-xs font-bold text-foreground tabular-nums">{c.gapScore}</span>
                    </div>
                  </CardContent>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-muted/10 px-5 py-3">
                  <Badge variant={BADGE_TONES[c.badge]} className="text-[10px] font-semibold px-2 py-0.5">
                    {c.badge}
                  </Badge>
                  {best?.provider.id === c.provider.id && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
                      <Award className="size-3.5 text-primary" />
                      Top Performer
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* COMPARATIVE METRICS MATRIX TABLE                                         */}
          {/* ========================================================================= */}
          <Card className="overflow-hidden border border-border bg-card shadow-xs rounded-xl">
            <CardHeader className="border-b border-border bg-muted/20 pb-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Comparative Performance Matrix</CardTitle>
                  <CardDescription className="text-xs font-normal text-muted-foreground mt-0.5">
                    Side-by-side evaluation of all affiliated vocational training providers
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                  {cards.length} Institutions
                </Badge>
              </div>
            </CardHeader>
            <Table minWidthClass="min-w-[980px]">
              <thead className="bg-muted/30 text-xs">
                <tr>
                  {[
                    'Provider',
                    'Learners',
                    'Placement',
                    'Verified',
                    'Retention (3m)',
                    'Wage Growth',
                    'Completeness',
                    'Follow-ups',
                    'Employer Ver.',
                    'Gap Score',
                    'Status',
                  ].map((h) => (
                    <Th key={h}>{h}</Th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs">
                {cards.map((c) => (
                  <tr key={c.provider.id} className="transition-colors hover:bg-muted/30">
                    <Td className="font-semibold text-foreground">{c.provider.name}</Td>
                    <Td className="tabular-nums">{c.learners}</Td>
                    <Td className="tabular-nums">{c.placementRate}%</Td>
                    <Td className="tabular-nums font-medium text-success">{c.verifiedRate}%</Td>
                    <Td className="tabular-nums">{c.retentionRate}%</Td>
                    <Td className="font-semibold text-success tabular-nums">+{c.wageGrowth}%</Td>
                    <Td className="tabular-nums">{c.completeness}%</Td>
                    <Td className="tabular-nums">{c.followUpRate}%</Td>
                    <Td className="tabular-nums">{c.employerVerRate}%</Td>
                    <Td className="tabular-nums font-mono">{c.gapScore}</Td>
                    <Td>
                      <Badge variant={BADGE_TONES[c.badge]} className="text-[10px] font-semibold">
                        {c.badge}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </DataState>
      </div>
    </AppShell>
  )
}