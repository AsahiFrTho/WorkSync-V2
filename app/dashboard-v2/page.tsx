'use client'

import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BriefcaseBusiness, IndianRupee, Users, WalletCards } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ChartFrame, PageHeader, SectionCard, StatTile } from '@/components/work-sync'
import { DataState } from '@/components/data-state'
import { useProgramData } from '@/lib/use-program-data'
import { cohortWageSeries, currentMonthlyIncome, employmentStatus, kpis, outcomeFunnel, cohortWageSeries as wageSeriesForDb, pct } from '@/lib/compute'
import { CHART_SERIES } from '@/theme'

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export default function DashboardV2Page() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const summary = useMemo(() => kpis(db), [db])
  const funnel = useMemo(() => outcomeFunnel(db), [db])
  const wageSeries = useMemo(() => cohortWageSeries(db, {}, 1), [db])
  const districtRows = useMemo(() => [...new Set(db.learners.map((learner) => learner.district))].map((district) => {
    const learners = db.learners.filter((learner) => learner.district === district)
    const placed = learners.filter((learner) => employmentStatus(db, learner.traineeId).key === 'placed').length
    const wages = learners.map((learner) => currentMonthlyIncome(db, learner.traineeId)).filter((wage): wage is number => Boolean(wage))
    return { district, trainees: learners.length, placement: pct(placed, learners.length), wage: wages.length ? Math.round(wages.reduce((sum, wage) => sum + wage, 0) / wages.length) : 0 }
  }), [db])
  const wageMin = wageSeries.length ? Math.floor(Math.min(...wageSeries.map((point) => point.wage)) / 5000) * 5000 : 0
  const wageMax = wageSeries.length ? Math.ceil(Math.max(...wageSeries.map((point) => point.wage)) / 5000) * 5000 : 10000

  return <AppShell><PageHeader eyebrow="Government executive view" title="Maharashtra skilling outcomes" description="A single live view of training, placement, verification, retention, and wage outcomes." /><div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"><DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
    <section aria-label="Executive outcome summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"><StatTile density="compact" label="Trainees enrolled" value={summary.total} metadata="Live programme denominator" icon={Users} /><StatTile density="compact" label="Placement rate" value={`${pct(summary.placed + summary.selfEmp + summary.appr, summary.total)}%`} metadata="Placed, self-employed, or apprenticed" icon={BriefcaseBusiness} /><StatTile density="compact" label="Pending verification" value={summary.pendingVer} metadata="Employer records awaiting review" icon={WalletCards} /><StatTile density="compact" label="Average monthly wage" value={money(Math.round(db.learners.map((learner) => currentMonthlyIncome(db, learner.traineeId)).filter((wage): wage is number => Boolean(wage)).reduce((sum, wage, _, wages) => sum + wage / wages.length, 0)))} metadata="Mean recorded current income" icon={IndianRupee} /></section>
    <ChartFrame title="Cohort wage progression" description={wageSeries.length ? `Placement-relative checkpoints; latest supported checkpoint is ${wageSeries[wageSeries.length - 1].month} months (n shown per point).` : 'No placement-relative wage checkpoints are available yet.'} unit="INR per month" source="Live OutcomeEvent records"><div className="h-64 w-full">{wageSeries.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={wageSeries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontFamily: 'var(--font-sans)' }} axisLine={false} tickLine={false} /><YAxis domain={[wageMin, wageMax]} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontFamily: 'var(--font-sans)' }} axisLine={false} tickLine={false} width={42} /><Tooltip formatter={(value, _name, item) => [`${money(Number(value))} · n=${item.payload.n}`, 'Mean monthly wage']} contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-control)' }} /><Area type="stepAfter" dataKey="wage" stroke={CHART_SERIES[0]} fill={CHART_SERIES[0]} fillOpacity={0.08} strokeWidth={2} /></AreaChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No wage data to plot.</div>}</div></ChartFrame>
    <SectionCard title="Five-stage cohort funnel" description="Computed from the same live database used by every operational screen."><div className="flex flex-col gap-2">{funnel.map((stage, index) => <div key={stage.stage} className="flex items-center gap-3"><div className="rounded-control border border-border bg-canvas px-4 py-3" style={{ width: `${Math.max(22, stage.value / Math.max(1, funnel[0].value) * 100)}%` }}><p className="text-meta text-muted-foreground">{stage.stage}</p><p className="font-serif text-2xl tabular-nums text-foreground">{stage.value}</p></div>{index > 0 ? <span className="text-meta text-muted-foreground">−{funnel[index - 1].value - stage.value}</span> : null}</div>)}</div></SectionCard>
    <SectionCard title="District comparison" description="Live district-level learner counts, placement rates, and recorded wages."><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted-foreground"><th className="p-3">District</th><th className="p-3 text-right">Trainees</th><th className="p-3 text-right">Placement</th><th className="p-3 text-right">Avg wage</th></tr></thead><tbody>{districtRows.map((row) => <tr key={row.district} className="border-b border-border"><td className="p-3 text-foreground">{row.district}</td><td className="p-3 text-right tabular-nums">{row.trainees}</td><td className="p-3 text-right tabular-nums">{row.placement}%</td><td className="p-3 text-right tabular-nums">{row.wage ? money(row.wage) : '—'}</td></tr>)}</tbody></table>{!districtRows.length ? <p className="p-6 text-center text-sm text-muted-foreground">No district records available.</p> : null}</div></SectionCard>
  </DataState></div></AppShell>
}

void wageSeriesForDb
void CHART_SERIES
void Area
void AreaChart
void CartesianGrid
void XAxis
void YAxis
void Tooltip
void ResponsiveContainer
void currentMonthlyIncome
void employmentStatus
void kpis
void outcomeFunnel
void pct
void money
