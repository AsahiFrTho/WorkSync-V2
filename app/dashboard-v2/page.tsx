'use client'

import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AppShell } from '@/components/app-shell'
import { BriefcaseBusiness, IndianRupee, Users, WalletCards } from 'lucide-react'
import { ChartFrame, DataTable, DetailSheet, PageHeader, SectionCard, StatTile, StatusPill } from '@/components/work-sync'
import { getFunnel, getKpis, getWageSeries, trainees, type Trainee } from '@/lib/mock-data'
import { CHART_SERIES } from '@/theme'

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
const placed = (trainee: Trainee) => trainee.status === 'employed' || trainee.status === 'retained'

type DistrictRow = { id: string; district: string; trainees: number; placement: number; wage: number }
type DetailRow = { id: string; name: string; district: string; course: string; status: string; wage: string }

function recordRows(records: Trainee[]): DetailRow[] {
  return records.map((record) => ({ id: record.traineeId, name: record.name, district: record.district, course: record.course, status: record.status, wage: record.monthlyWage ? money(record.monthlyWage) : '—' }))
}

export default function DashboardV2Page() {
  const kpis = getKpis()
  const funnel = getFunnel()
  const wageSeries = getWageSeries()
  const [sheet, setSheet] = useState<{ title: string; description: string; rows: DetailRow[] } | null>(null)
  const cohortPlacement = Math.round(trainees.filter(placed).length / trainees.length * 100)
  const verifiedEmployment = trainees.filter((record) => placed(record) && Number(record.traineeId.slice(-2)) % 5 !== 0).length
  const verifiedRate = Math.round(verifiedEmployment / trainees.length * 100)
  const takeaway = wageSeries.at(-1)!.wage > wageSeries[0].wage
    ? `Average monthly wage rises ${Math.round((wageSeries.at(-1)!.wage / wageSeries[0].wage - 1) * 100)}% from the first recorded checkpoint to month 12.`
    : 'Average monthly wage is not yet showing an upward trajectory across the cohort.'

  const districtRows = useMemo<DistrictRow[]>(() => {
    const districts = [...new Set(trainees.map((record) => record.district))]
    return districts.map((district) => {
      const records = trainees.filter((record) => record.district === district)
      const placedRecords = records.filter(placed)
      return { id: district, district, trainees: records.length, placement: Math.round(placedRecords.length / records.length * 100), wage: placedRecords.length ? Math.round(placedRecords.reduce((sum, record) => sum + record.monthlyWage, 0) / placedRecords.length) : 0 }
    }).sort((a, b) => b.placement - a.placement)
  }, [])

  const tableColumns = [
    { key: 'name', header: 'Trainee' },
    { key: 'district', header: 'District' },
    { key: 'course', header: 'Trade' },
    { key: 'status', header: 'Status' },
    { key: 'wage', header: 'Monthly wage', numeric: true },
  ] satisfies Array<{ key: keyof DetailRow; header: string; numeric?: boolean }>

  return (
    <AppShell>
      <main className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Government executive view" title="Maharashtra skilling outcomes" description="Is Maharashtra's skilling investment producing verified employment, and where is it failing?" />

        <section aria-label="Executive outcome summary" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label={kpis[0].label} value={kpis[0].value} metadata="Across the demonstration cohort" icon={Users} onClick={() => setSheet({ title: 'All enrolled trainees', description: 'The records behind the enrolled cohort count.', rows: recordRows(trainees) })} />
            <StatTile label="Placement rate" value={`${cohortPlacement}%`} metadata="Employed or retained" icon={BriefcaseBusiness} trend={{ value: '+12.4%', direction: 'up' }} onClick={() => setSheet({ title: 'Placed trainees', description: 'Employment records counted in the placement rate.', rows: recordRows(trainees.filter(placed)) })} />
            <StatTile label="Verified employment" value={`${verifiedRate}%`} metadata="Employer-verified subset" icon={WalletCards} trend={{ value: '+8.1%', direction: 'up' }} onClick={() => setSheet({ title: 'Verified employment', description: 'Placed records with a verified employer signal.', rows: recordRows(trainees.filter((record) => placed(record) && Number(record.traineeId.slice(-2)) % 5 !== 0)) })} />
            <StatTile label="Average monthly wage" value={money(kpis[3].value)} metadata="Among trainees with recorded wages" icon={IndianRupee} polarity="higher-is-better" onClick={() => setSheet({ title: 'Wage records', description: 'Trainees with a recorded monthly wage.', rows: recordRows(trainees.filter((record) => record.monthlyWage > 0)) })} />
          </div>
          <ChartFrame title="Wage progression" description={takeaway}>
            <div className="h-64 w-full" aria-label="Average monthly wage progression chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wageSeries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ background: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-control)' }} />
                  <Area type="monotone" dataKey="wage" stroke={CHART_SERIES[0]} fill={CHART_SERIES[0]} fillOpacity={0.12} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>
        </section>

        <SectionCard title="Five-stage cohort funnel" description="The cohort progression from enrolment to retained employment.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {funnel.map((stage, index) => <div key={stage.stage} className="rounded-control border border-border bg-canvas p-4"><p className="text-meta text-muted-foreground">{index + 1}. {stage.stage}</p><p className="mt-2 font-serif text-2xl tabular-nums text-foreground">{stage.value}</p></div>)}
          </div>
        </SectionCard>

        <SectionCard title="District comparison" description="Sortable-ready comparison of placement and wage outcomes by district.">
          <DataTable columns={[{ key: 'district', header: 'District', sortable: true }, { key: 'trainees', header: 'Trainees', numeric: true, sortable: true }, { key: 'placement', header: 'Placement', numeric: true, sortable: true }, { key: 'wage', header: 'Average wage', numeric: true, sortable: true }]} rows={districtRows} />
        </SectionCard>

        <SectionCard title="Verified versus claimed" description="Employer verification distinguishes claimed placement from evidence-backed employment.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-control border border-border bg-canvas p-4"><div className="flex items-center justify-between gap-4"><p className="text-meta text-muted-foreground">Claimed placement</p><StatusPill tone="pending" label={`${cohortPlacement}%`} /></div><p className="mt-3 font-serif text-3xl tabular-nums text-foreground">{trainees.filter(placed).length}</p><p className="mt-1 text-meta text-muted-foreground">employed or retained records</p></div>
            <div className="rounded-control border border-border bg-canvas p-4"><div className="flex items-center justify-between gap-4"><p className="text-meta text-muted-foreground">Verified employment</p><StatusPill tone="verified" label={`${verifiedRate}%`} /></div><p className="mt-3 font-serif text-3xl tabular-nums text-foreground">{verifiedEmployment}</p><p className="mt-1 text-meta text-muted-foreground">records with employer evidence</p></div>
          </div>
        </SectionCard>

        <DetailSheet open={Boolean(sheet)} onClose={() => setSheet(null)} title={sheet?.title ?? ''} description={sheet?.description}>
          {sheet ? <DataTable columns={tableColumns} rows={sheet.rows} /> : null}
        </DetailSheet>
      </main>
    </AppShell>
  )
}

