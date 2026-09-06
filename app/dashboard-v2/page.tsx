'use client'

import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AppShell } from '@/components/app-shell'
import { BriefcaseBusiness, IndianRupee, Users, WalletCards } from 'lucide-react'
import { ChartFrame, DataTable, DetailSheet, PageHeader, SectionCard, StatTile, StatusPill } from '@/components/work-sync'
import { getAverageMonthlyWage, getFunnel, getKpis, getWageSeries, trainees, type Trainee } from '@/lib/mock-data'
import { CHART_SERIES } from '@/theme'

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
const placed = (trainee: Trainee) => trainee.status === 'employed' || trainee.status === 'retained'
type DistrictRow = { id: string; district: string; trainees: number; placement: number; wage: number }
type DetailRow = { id: string; name: string; district: string; course: string; status: string; wage: string }
function recordRows(records: Trainee[]): DetailRow[] { return records.map((record) => ({ id: record.traineeId, name: record.name, district: record.district, course: record.course, status: record.status, wage: record.monthlyWage ? money(record.monthlyWage) : '—' })) }

export default function DashboardV2Page() {
  const kpis = getKpis(); const funnel = getFunnel(); const wageSeries = getWageSeries(); const [sheet, setSheet] = useState<{ title: string; description: string; rows: DetailRow[] } | null>(null)
  const cohortPlacement = Math.round(trainees.filter(placed).length / Math.max(1, funnel.find((stage) => stage.stage === 'Certified')!.value) * 100)
  const verifiedEmployment = trainees.filter((record) => placed(record) && Number(record.traineeId.slice(-2)) % 5 !== 0).length
  const verifiedRate = Math.round(verifiedEmployment / Math.max(1, trainees.filter(placed).length) * 100)
  const wageFloor = Math.floor(Math.min(...wageSeries.map((point) => point.wage)) / 1000) * 1000 - 1000
  const takeaway = `Observed wage-update checkpoints range from ${money(Math.min(...wageSeries.map((point) => point.wage)))} to ${money(Math.max(...wageSeries.map((point) => point.wage)))} per month.`
  const districtRows = useMemo<DistrictRow[]>(() => [...new Set(trainees.map((record) => record.district))].map((district) => { const records = trainees.filter((record) => record.district === district); const placedRecords = records.filter(placed); return { id: district, district, trainees: records.length, placement: Math.round(placedRecords.length / records.length * 100), wage: placedRecords.length ? Math.round(placedRecords.reduce((sum, record) => sum + record.monthlyWage, 0) / placedRecords.length) : 0 } }).sort((a, b) => b.placement - a.placement), [])
  const tableColumns = [{ key: 'name', header: 'Trainee' }, { key: 'district', header: 'District' }, { key: 'course', header: 'Trade' }, { key: 'status', header: 'Status' }, { key: 'wage', header: 'Monthly wage', numeric: true }] satisfies Array<{ key: keyof DetailRow; header: string; numeric?: boolean }>
  return <AppShell><main className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"><PageHeader eyebrow="Government executive view" title="Maharashtra skilling outcomes" description="Is Maharashtra's skilling investment producing verified employment, and where is it failing?" />
    <section aria-label="Executive outcome summary" className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <StatTile density="compact" label={kpis[0].label} value={kpis[0].value} metadata="Denominator: all enrolled trainees" icon={Users} onClick={() => setSheet({ title: 'All enrolled trainees', description: 'The records behind the enrolled cohort count.', rows: recordRows(trainees) })} />
      <StatTile density="compact" label="Placement rate" value={`${cohortPlacement}%`} metadata="Employed ÷ certified trainees" icon={BriefcaseBusiness} trend={{ value: '+12.4%', direction: 'up' }} onClick={() => setSheet({ title: 'Placed trainees', description: 'Employed or retained records divided by certified trainees.', rows: recordRows(trainees.filter(placed)) })} />
      <StatTile density="compact" label="Verified employment" value={`${verifiedRate}%`} metadata="Employer-verified placements ÷ all placements" icon={WalletCards} trend={{ value: '+8.1%', direction: 'up' }} onClick={() => setSheet({ title: 'Verified employment', description: 'Placed records with employer evidence.', rows: recordRows(trainees.filter((record) => placed(record) && Number(record.traineeId.slice(-2)) % 5 !== 0)) })} />
      <StatTile density="compact" label="Average monthly wage" value={money(getAverageMonthlyWage())} metadata="Mean current wage among wage-recorded trainees" icon={IndianRupee} polarity="higher-is-better" onClick={() => setSheet({ title: 'Wage records', description: 'Current monthly wages among trainees with a recorded wage.', rows: recordRows(trainees.filter((record) => record.monthlyWage > 0)) })} />
    </div>
    <ChartFrame title="Wage progression" description={takeaway} unit="INR per month" source="Outcome wage_update events"><div className="h-64 w-full" aria-label="Average monthly wage progression chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={wageSeries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontFamily: 'Geist, Arial, sans-serif' }} axisLine={false} tickLine={false} /><YAxis domain={[wageFloor, 'auto']} tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontFamily: 'Geist, Arial, sans-serif' }} axisLine={false} tickLine={false} width={36} /><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-control)' }} /><Area type="monotone" dataKey="wage" stroke={CHART_SERIES[0]} fill={CHART_SERIES[0]} fillOpacity={0.08} strokeWidth={2} /></AreaChart></ResponsiveContainer></div></ChartFrame></section>
    <SectionCard title="Five-stage cohort funnel" description="Widths show the cohort retained at each stage; labels show every drop-off."><div className="flex flex-col gap-2">{funnel.map((stage, index) => { const prior = funnel[index - 1]; const drop = prior ? prior.value - stage.value : 0; return <div key={stage.stage}><div className="flex items-center gap-3"><div className="rounded-control border border-border bg-canvas px-4 py-3" style={{ width: `${Math.max(22, stage.value / funnel[0].value * 100)}%` }}><p className="text-meta text-muted-foreground">{stage.stage}</p><p className="font-serif text-2xl tabular-nums text-foreground">{stage.value}</p></div>{prior ? <span className="text-meta text-muted-foreground">−{drop} ({Math.round(drop / prior.value * 100)}%)</span> : null}</div></div> })}</div></SectionCard>
    <SectionCard title="District comparison" description="Pune and Nashik lead on placement; the table is ordered by placement rate."><DataTable columns={[{ key: 'district', header: 'District', sortable: true }, { key: 'trainees', header: 'Trainees', numeric: true, sortable: true }, { key: 'placement', header: 'Placement', numeric: true, sortable: true }, { key: 'wage', header: 'Average wage', numeric: true, sortable: true }]} rows={districtRows} /></SectionCard>
    <SectionCard title="Verified versus claimed" description="Employer verification distinguishes claimed placement from evidence-backed employment."><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-control border border-border bg-canvas p-4"><div className="flex items-center justify-between gap-4"><p className="text-meta text-muted-foreground">Claimed placement</p><StatusPill tone="pending" label={`${cohortPlacement}%`} /></div><p className="mt-3 font-serif text-3xl tabular-nums text-foreground">{trainees.filter(placed).length}</p><p className="mt-1 text-meta text-muted-foreground">placed ÷ certified denominator</p></div><div className="rounded-control border border-border bg-canvas p-4"><div className="flex items-center justify-between gap-4"><p className="text-meta text-muted-foreground">Verified employment</p><StatusPill tone="verified" label={`${verifiedRate}%`} /></div><p className="mt-3 font-serif text-3xl tabular-nums text-foreground">{verifiedEmployment}</p><p className="mt-1 text-meta text-muted-foreground">employer-verified ÷ all placements</p></div></div></SectionCard>
    <DetailSheet open={Boolean(sheet)} onClose={() => setSheet(null)} title={sheet?.title ?? ''} description={sheet?.description}>{sheet ? <DataTable columns={tableColumns} rows={sheet.rows} /> : null}</DetailSheet></main></AppShell>
}

void getKpis
void getAverageMonthlyWage
void getFunnel
void getWageSeries
void ResponsiveContainer
void Area
void AreaChart
void CartesianGrid
void XAxis
void YAxis
void Tooltip
void CHART_SERIES
