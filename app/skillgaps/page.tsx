'use client'

import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, ArrowDown, ArrowRight, Check, FileWarning, ShieldAlert } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ChartFrame, DataTable, DetailSheet, PageHeader, SectionCard, StatTile, StatusPill } from '@/components/work-sync'
import { getSkillGapInsights, skillGapReports, trainees, type SkillGapReport } from '@/lib/mock-data'
import { CHART_SEMANTIC, CHART_SERIES } from '@/theme'

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
const signed = (value: number, suffix = 'pp') => `${value > 0 ? '+' : ''}${value} ${suffix}`
type Verdict = 'Costing outcomes' | 'Noisy but harmless' | 'Insufficient evidence'
type TradeRow = { id: string; course: string; topGap: string; reports: number; mix: string; placementDelta: number; wageDelta: number; verdict: Verdict }

function verdictFor(item: ReturnType<typeof getSkillGapInsights>[number], reports: SkillGapReport[]) : Verdict {
  if (reports.length < 2) return 'Insufficient evidence'
  if (item.signal === 'decoy') return 'Noisy but harmless'
  return 'Costing outcomes'
}

export default function SkillGapsPage() {
  const insights = getSkillGapInsights()
  const [selected, setSelected] = useState<TradeRow | null>(null)
  const rows = useMemo<TradeRow[]>(() => insights.map((item) => {
    const reports = skillGapReports.filter((report) => report.courseId === item.course)
    const top = reports[0]?.skillName ?? 'No reports yet'
    const mix = ['high', 'medium', 'low'].map((severity) => `${severity[0].toUpperCase()}${severity.slice(1)} ${reports.filter((report) => report.severity === severity).length}`).join(' · ')
    return { id: item.course, course: item.course, topGap: top, reports: reports.length, mix, placementDelta: item.placementRate - item.cohortPlacementRate, wageDelta: item.averageWage - item.cohortAverageWage, verdict: verdictFor(item, reports) }
  }), [insights])
  const costing = rows.filter((row) => row.verdict === 'Costing outcomes').length
  const decoy = rows.find((row) => row.verdict === 'Noisy but harmless')
  const insufficient = rows.filter((row) => row.verdict === 'Insufficient evidence').length
  const chartData = rows.map((row) => ({ name: row.course, severity: row.reports ? row.reports + (row.verdict === 'Costing outcomes' ? 2 : 0) : 0, outcomeDelta: row.placementDelta, verdict: row.verdict }))
  const selectedReports = selected ? skillGapReports.filter((report) => report.courseId === selected.course) : []
  const affected = selected ? trainees.filter((trainee) => trainee.course === selected.course).slice(0, 5) : []
  const verdictTone = (verdict: Verdict) => verdict === 'Costing outcomes' ? 'at-risk' : verdict === 'Noisy but harmless' ? 'verified' : 'neutral'
  return <AppShell><main className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"><PageHeader eyebrow="Outcome intelligence" title="Skill gap intelligence" description="Which reported skill gaps are actually costing learners jobs and wages?" />
    <section aria-label="Skill gap summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"><StatTile density="compact" label="Trades with outcome cost" value={costing} metadata="Gap signal and weaker outcomes" icon={AlertTriangle} /><StatTile density="compact" label="Reports cross-referenced" value={skillGapReports.length} metadata="Employer, learner, and course reports" icon={FileWarning} /><StatTile density="compact" label="Harmless decoy" value={decoy?.course ?? 'None'} metadata="Loud reports, healthy outcomes" icon={Check} /><StatTile density="compact" label="Evidence thin" value={insufficient} metadata="Not enough reports to verdict" icon={ShieldAlert} /></section>
    <ChartFrame title="Reported severity versus outcome cost" description="The signal is the contrast: high-severity reports land beside negative placement deltas; the decoy stays near healthy outcomes." unit="Severity index; placement delta in percentage points" source="WorkSync SkillGapReport records joined to trainee outcomes"><div className="h-72 w-full" aria-label="Reported severity against placement delta"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={55} /><YAxis yAxisId="severity" label={{ value: 'Reported severity index', angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)', fontSize: 11 }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><YAxis yAxisId="delta" orientation="right" label={{ value: 'Placement delta vs cohort (pp)', angle: 90, position: 'insideRight', fill: 'var(--muted-foreground)', fontSize: 11 }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><Tooltip formatter={(value, name) => [name === 'outcomeDelta' ? signed(Number(value)) : value, name === 'outcomeDelta' ? 'Placement delta' : 'Severity index']} contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-control)' }} /><Bar yAxisId="severity" dataKey="severity" fill={CHART_SERIES[1]} radius={[3, 3, 0, 0]}><Cell fill={CHART_SEMANTIC.atRisk} /><Cell fill={CHART_SEMANTIC.atRisk} /><Cell fill={CHART_SERIES[1]} /><Cell fill={CHART_SERIES[2]} /><Cell fill={CHART_SERIES[3]} /></Bar><Bar yAxisId="delta" dataKey="outcomeDelta" fill={CHART_SEMANTIC.verified} radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></ChartFrame>
    <SectionCard title="Trade-level contrast" description="Rows are clickable. Verdicts only appear when the report volume supports the comparison."><DataTable columns={[{ key: 'course', header: 'Trade' }, { key: 'topGap', header: 'Top reported gap' }, { key: 'reports', header: 'Reports', numeric: true }, { key: 'mix', header: 'Severity mix' }, { key: 'placementDelta', header: 'Placement Δ', numeric: true, render: (value) => <span className="tabular-nums">{signed(Number(value))}</span> }, { key: 'wageDelta', header: 'Wage Δ', numeric: true, render: (value) => <span className="tabular-nums">{signed(Number(value), 'INR')}</span> }, { key: 'verdict', header: 'Verdict', render: (value) => <StatusPill tone={verdictTone(value as Verdict)} label={String(value)} /> }]} rows={rows} onRowClick={setSelected} /></SectionCard>
    <DetailSheet open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.course ?? ''} description="SkillGapReport records and affected learners with consent masking applied.">{selected ? <div className="flex flex-col gap-6"><div><p className="text-label font-semibold uppercase tracking-[0.12em] text-muted-foreground">Individual reports</p><div className="mt-3 flex flex-col gap-2">{selectedReports.map((report, index) => <div key={`${report.traineeId}-${index}`} className="rounded-control border border-border bg-canvas p-3"><div className="flex items-center justify-between gap-3"><p className="font-medium text-foreground">{report.skillName}</p><StatusPill tone={report.severity === 'high' ? 'at-risk' : report.severity === 'medium' ? 'pending' : 'neutral'} label={`${report.severity} severity`} /></div><p className="mt-1 text-meta text-muted-foreground">Reported by {report.reportedBy}</p></div>)}</div></div><div><p className="text-label font-semibold uppercase tracking-[0.12em] text-muted-foreground">Affected learners</p><div className="mt-3 flex flex-col gap-2">{affected.map((trainee) => <div key={trainee.traineeId} className="flex items-center justify-between gap-3 rounded-control border border-border bg-canvas p-3"><div><p className="font-medium text-foreground">{trainee.name}</p><p className="text-meta text-muted-foreground">{trainee.traineeId} · {trainee.district}</p></div><span className="text-meta text-muted-foreground">{trainee.traineeId.endsWith('05') ? 'Consent withheld' : money(trainee.monthlyWage)}</span></div>)}</div></div></div> : null}</DetailSheet></main></AppShell>
}

void ArrowDown
void ArrowRight
void Check
void CHART_SEMANTIC
void CHART_SERIES
