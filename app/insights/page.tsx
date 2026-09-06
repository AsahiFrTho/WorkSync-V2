'use client'

import { Sparkles } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { InsightCard } from '@/components/insights/insight-card'
import { DataState } from '@/components/data-state'
import { useProgramData } from '@/lib/use-program-data'
import { generateCurriculumInsights } from '@/lib/compute'

export default function InsightsPage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const insights = generateCurriculumInsights(db).map((item, index) => ({
    id: `${item.course}-${index}`,
    priority: item.severity === 'high' ? 'High' : item.severity === 'medium' ? 'Medium' : 'Low',
    district: 'Programme-wide',
    title: `${item.course}: ${item.topSkillGap} is linked to an outcome gap`,
    narrative: item.recommendedFix,
    skillGap: item.topSkillGap,
    employerDemand: item.severity === 'high' ? 'High' : item.severity === 'medium' ? 'Medium' : 'Low',
    trainingCoverage: item.employmentRateDelta < 0 ? 'Low' : 'Medium',
    action: item.recommendedFix,
    confidence: Math.min(95, 50 + item.reportCount * 8),
  })) as Parameters<typeof InsightCard>[0]['insight'][]
  return <AppShell><PageHeader eyebrow="MSSDS • State Skilling Intelligence" title="Evidence-based programme insights" description="Signals are computed from live learner, skill-gap, and outcome records." /><div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"><DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}><div className="rounded-xl border border-border bg-card p-4"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="font-bold text-foreground">Live decision-support signals</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Only courses with enough live learner and report evidence are shown. These are recommendations, not verified registry facts.</p></div><Badge variant="default" className="ml-auto text-[10px]">LIVE</Badge></div></div>{insights.length ? <section aria-label="Detected policy insights" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}</section> : <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No evidence-backed curriculum insights are available for the current cohort.</div>}</DataState></div></AppShell>
}
