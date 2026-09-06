'use client'

import type { ReactNode } from 'react'
import { X, LockKeyhole, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type Status = 'verified' | 'pending' | 'at-risk' | 'neutral'

export function StatTile({ label, value, detail, status = 'neutral', onClick }: { label: string; value: ReactNode; detail?: string; status?: Status; onClick?: () => void }) {
  const content = <div className="flex min-h-32 flex-col justify-between gap-5 p-5">
    <div className="flex items-start justify-between gap-3"><span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</span>{status !== 'neutral' && <StatusPill status={status} compact />}</div>
    <div><div className="font-serif text-4xl leading-none tracking-tight tabular-nums text-foreground">{value}</div>{detail && <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>}</div>
  </div>
  return onClick ? <button type="button" onClick={onClick} className="block w-full rounded-card border border-border bg-card text-left transition-colors duration-150 ease-out hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{content}</button> : <div className="rounded-card border border-border bg-card">{content}</div>
}

export function SectionCard({ title, description, action, children, className }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <Card className={cn('rounded-card border-border bg-card shadow-none', className)}><CardHeader className="flex-row items-start justify-between gap-4 border-b border-border py-4"><div className="flex flex-col gap-1">{title && <CardTitle className="font-sans text-base font-semibold tracking-normal">{title}</CardTitle>}{description && <CardDescription>{description}</CardDescription>}</div>{action}</CardHeader><CardContent className="p-0">{children}</CardContent></Card>
}

export function PageHeader({ eyebrow, title, question, actions }: { eyebrow?: string; title: string; question: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div className="flex flex-col gap-2">{eyebrow && <span className="text-xs font-medium uppercase tracking-[0.14em] text-primary">{eyebrow}</span>}<h1 className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">{title}</h1><p className="max-w-2xl text-sm leading-6 text-muted-foreground">{question}</p></div>{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}</header>
}

export function FilterBar({ children }: { children: ReactNode }) { return <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface p-3">{children}</div> }

export function DataTable<T extends { id?: string | number }>({ columns, rows, rowKey, onRowClick, empty }: { columns: { key: keyof T; label: string; render?: (row: T) => ReactNode }[]; rows: T[]; rowKey?: (row: T, index: number) => string | number; onRowClick?: (row: T) => void; empty?: ReactNode }) {
  if (!rows.length) return <EmptyState title="No records yet" description="There is no data matching the current view." />
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-border bg-surface text-xs uppercase tracking-[0.1em] text-muted-foreground"><tr>{columns.slice(0, 6).map((column) => <th key={String(column.key)} className="px-4 py-3 font-medium">{column.label}</th>)}</tr></thead><tbody className="divide-y divide-border">{rows.map((row, index) => <tr key={rowKey?.(row, index) ?? row.id ?? index} onClick={() => onRowClick?.(row)} className={cn('transition-colors duration-150 ease-out', onRowClick && 'cursor-pointer hover:bg-surface focus-within:bg-surface')} tabIndex={onRowClick ? 0 : undefined} onKeyDown={(event) => { if (onRowClick && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onRowClick(row) } }}>{columns.slice(0, 6).map((column) => <td key={String(column.key)} className="px-4 py-3 align-middle tabular-nums text-foreground">{column.render ? column.render(row) : String(row[column.key] ?? '—')}</td>)}</tr>)}</tbody></table></div>
}

export function DetailSheet({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex justify-end" role="presentation"><button aria-label="Close details" className="absolute inset-0 cursor-default bg-ink/20" onClick={onClose} /><aside role="dialog" aria-modal="true" aria-labelledby="detail-sheet-title" className="relative h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card p-6 shadow-overlay sm:p-8"><div className="flex items-start justify-between gap-4 border-b border-border pb-5"><div><h2 id="detail-sheet-title" className="font-serif text-2xl text-foreground">{title}</h2>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div><button type="button" aria-label="Close details" onClick={onClose} className="rounded-control p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"><X /></button></div><div className="flex flex-col gap-6 py-6">{children}</div></aside></div>
}

export function ConsentBadge({ status }: { status: 'active' | 'expired' | 'revoked' | 'missing' }) { const active = status === 'active'; return <Badge variant={active ? 'success' : 'warning'} title={active ? 'Personal details are visible with consent' : 'Personal details are masked because consent is not active'}><LockKeyhole aria-hidden="true" /> Consent {status}</Badge> }
export function StatusPill({ status, compact = false }: { status: Status; compact?: boolean }) { const labels = { verified: 'Verified', pending: 'Pending', 'at-risk': 'At risk', neutral: 'Recorded' }; return <Badge variant={status === 'verified' ? 'success' : status === 'pending' ? 'warning' : status === 'at-risk' ? 'destructive' : 'neutral'} className={compact ? 'px-1.5 text-[10px]' : undefined}><ShieldCheck aria-hidden="true" />{labels[status]}</Badge> }
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="flex min-h-40 flex-col items-center justify-center gap-2 p-8 text-center"><div className="rounded-full border border-border bg-surface p-3 text-muted-foreground"><ShieldCheck /></div><h3 className="font-sans text-sm font-semibold text-foreground">{title}</h3><p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p></div> }
export function LoadingSkeleton({ rows = 3 }: { rows?: number }) { return <div className="flex flex-col gap-3 p-5" aria-label="Loading"><Skeleton className="h-5 w-1/3" />{Array.from({ length: rows }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div> }
export function ChartFrame({ title, subtitle, unit, source, children }: { title: string; subtitle: string; unit: string; source?: string; children: ReactNode }) { return <SectionCard title={title} description={subtitle} action={<span className="text-xs text-muted-foreground">Unit: {unit}</span>}><div className="p-5">{children}<p className="mt-4 text-xs text-muted-foreground">Source: {source ?? 'employer-verified records'}</p></div></SectionCard> }
