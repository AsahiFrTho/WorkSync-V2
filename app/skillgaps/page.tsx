'use client'

import { AlertTriangle, FileWarning, ShieldAlert } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ChartFrame, PageHeader, SectionCard, StatTile } from '@/components/work-sync'
import { DataState } from '@/components/data-state'
import { useProgramData } from '@/lib/use-program-data'
import { generateCurriculumInsights, topSkillGaps } from '@/lib/compute'

export default function SkillGapsPage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const gaps = topSkillGaps(db)
  const insights = generateCurriculumInsights(db)
  const costing = insights.filter((item) => item.severity === 'high').length
  return <AppShell><PageHeader eyebrow="Outcome intelligence" title="Skill gap intelligence" description="Which reported skill gaps are connected to live learner outcomes?" /><div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"><DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}><section aria-label="Skill gap summary" className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4"><StatTile density="compact" label="Outcome-linked courses" value={costing} metadata="High-severity computed signals" icon={AlertTriangle} /><StatTile density="compact" label="Reports cross-referenced" value={db.skillGaps.length} metadata="Live skill-gap records" icon={FileWarning} /><StatTile density="compact" label="Distinct skills" value={gaps.length} metadata="Grouped from live reports" icon={ShieldAlert} /></section><ChartFrame title="Most reported skill gaps" description="Counts are grouped from live SkillGapReport records; no mock benchmark is used." unit="Reports" source="Live SkillGapReport collection"><div className="flex flex-col gap-3">{gaps.length ? gaps.map((gap) => <div key={gap.name} className="flex items-center justify-between gap-4 rounded-control border border-border bg-canvas p-4"><div><p className="font-medium text-foreground">{gap.name}</p><p className="text-meta text-muted-foreground">High {gap.high} · Medium {gap.medium} · Low {gap.low}</p></div><span className="font-serif text-2xl tabular-nums text-foreground">{gap.total}</span></div>) : <div className="p-8 text-center text-sm text-muted-foreground">No skill-gap reports are available.</div>}</div></ChartFrame><SectionCard title="Outcome-linked interventions" description="Courses appear only when the compute engine has enough evidence to compare them with the cohort."><div className="flex flex-col gap-3">{insights.length ? insights.map((item) => <div key={item.course} className="rounded-control border border-border bg-canvas p-4"><div className="flex items-center justify-between gap-4"><p className="font-medium text-foreground">{item.course}</p><span className="text-meta tabular-nums text-muted-foreground">{item.employmentRateDelta > 0 ? '+' : ''}{item.employmentRateDelta}pp employment</span></div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.recommendedFix}</p></div>) : <p className="p-8 text-center text-sm text-muted-foreground">No course-level intervention signal is available.</p>}</div></SectionCard></DataState></div></AppShell>
}
