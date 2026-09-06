'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { SectionCard } from '@/components/work-sync'
import { DataState } from '@/components/data-state'
import { useProgramData } from '@/lib/use-program-data'
import { currentMonthlyIncome, eventsFor, learnerTimeline, placementEvent } from '@/lib/compute'

const money = (value?: number | null) => value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value) : '—'

export default function TraineePage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const [traineeId, setTraineeId] = useState('')
  const selectedId = traineeId || db.learners[0]?.traineeId || ''
  const learner = db.learners.find((item) => item.traineeId === selectedId)
  const events = useMemo(() => learner ? eventsFor(db, learner.traineeId) : [], [db, learner])
  const timeline = useMemo(() => learner ? learnerTimeline(db, learner.traineeId) : [], [db, learner])
  return <AppShell><PageHeader eyebrow="Trainee outcome passport" title="Trainee Outcome Passport" description="A live joined view of training, certification, employment, and recorded outcomes." /><div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"><DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>{learner ? <><SectionCard title="Identity and consent" description="Joined from live trainee, detail, and consent records."><p className="font-serif text-2xl text-foreground">{learner.consentStatus === 'active' ? learner.name : 'Consent-restricted learner'}</p><p className="mt-1 text-meta text-muted-foreground">{learner.traineeId} · {learner.district} · {learner.course}</p><p className="mt-1 text-meta text-muted-foreground">{learner.trainingProvider || 'Provider not recorded'} · Consent: {learner.consentStatus}</p></SectionCard><div className="grid gap-6 md:grid-cols-3"><SectionCard title="Current income" description="Latest recorded wage or self-employment income."><p className="font-serif text-3xl tabular-nums text-foreground">{money(currentMonthlyIncome(db, learner.traineeId))}</p></SectionCard><SectionCard title="Placement" description="Latest placement event."><p className="font-medium text-foreground">{placementEvent(db, learner.traineeId)?.employerName || 'Not recorded'}</p><p className="text-meta text-muted-foreground">{placementEvent(db, learner.traineeId)?.jobRole || 'No role recorded'}</p></SectionCard><SectionCard title="Outcome events" description="All live events for this learner."><p className="font-serif text-3xl tabular-nums text-foreground">{events.length}</p></SectionCard></div><SectionCard title="Outcome timeline" description="Events are ordered by their recorded date."><div className="flex flex-col gap-3">{timeline.length ? timeline.map((item) => <div key={`${item.date}-${item.title}`} className="border-l-2 border-border pl-4"><p className="font-medium text-foreground">{item.title}</p><p className="text-meta text-muted-foreground">{item.date} · {item.desc}</p></div>) : <p className="p-6 text-center text-sm text-muted-foreground">No timeline events are available.</p>}</div></SectionCard></> : <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No learners are available in the live programme data.</div>}</DataState></div></AppShell>
}
