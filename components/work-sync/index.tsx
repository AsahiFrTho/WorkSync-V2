'use client'

import type * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, ArrowDown, ArrowUp, Check, ChevronRight, Circle, Clock3, EyeOff, Filter, Minus, PanelRight, ShieldCheck, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'

export type Tone = 'verified' | 'pending' | 'at-risk' | 'neutral'

const toneConfig: Record<Tone, { label: string; icon: LucideIcon; className: string }> = {
  verified: { label: 'Verified', icon: Check, className: 'border-verified/35 bg-verified/10 text-verified' },
  pending: { label: 'Pending', icon: Clock3, className: 'border-pending/35 bg-pending/10 text-pending' },
  'at-risk': { label: 'At risk', icon: AlertTriangle, className: 'border-at-risk/35 bg-at-risk/10 text-at-risk' },
  neutral: { label: 'Not assessed', icon: Minus, className: 'border-border bg-muted text-muted-foreground' },
}

export function StatTile({ label, value, metadata, icon: Icon = PanelRight, trend, polarity = 'higher-is-better', density = 'comfortable', onClick }: { label: string; value: string | number; metadata?: string; icon?: LucideIcon; trend?: { value: string; direction: 'up' | 'down' | 'flat' }; polarity?: 'higher-is-better' | 'lower-is-better' | 'neutral'; density?: 'comfortable' | 'compact'; onClick?: () => void }) {
  const densityClass = density === 'compact' ? 'stat-tile-compact' : 'stat-tile-comfortable'
  const content = <div className={cn('flex items-start justify-between gap-4', densityClass)}><div className="min-w-0"><p className="text-label font-sans font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1"><p className="font-serif text-display leading-none tracking-tight text-foreground tabular-nums stat-tile-value">{value}</p>{trend ? <span className="stat-tile-inline-trend hidden text-meta font-medium">{trend.value}</span> : null}</div>{metadata ? <p className="mt-3 text-meta leading-relaxed text-muted-foreground stat-tile-caption">{metadata}</p> : null}</div>{onClick ? <span title={`Open ${label} details`} aria-label={`Open ${label} details`} className="inline-flex size-5 shrink-0 items-center justify-center text-brand"><ArrowRight aria-hidden="true" /></span> : null}</div>
  const isGood = trend?.direction === 'flat' ? polarity === 'neutral' : trend?.direction === (polarity === 'lower-is-better' ? 'down' : 'up')
  const trendClass = polarity === 'neutral' || trend?.direction === 'flat' ? 'border-border text-muted-foreground' : isGood ? 'border-verified/35 text-verified' : 'border-at-risk/35 text-at-risk'
  const trendIcon = trend?.direction === 'up' ? <ArrowUp /> : trend?.direction === 'down' ? <ArrowDown /> : <Minus />
  const trendNode = trend ? <span className={cn('mt-4 inline-flex items-center gap-1 rounded-pill border px-2 py-1 text-meta font-medium compact-stat-badge', trendClass)}><span aria-hidden="true">{trendIcon}</span>{trend.value}</span> : null
  return onClick ? <button type="button" onClick={onClick} className="group w-full rounded-card border border-border bg-surface p-5 text-left transition-ui hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">{content}{trendNode}</button> : <div className="rounded-card border border-border bg-surface p-5">{content}{trendNode}</div>
}

export function SectionCard({ title, description, actions, children, className }: { title?: string; description?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) { return <section className={cn('rounded-card border border-border bg-surface', className)}><div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">{title ? <div><h2 className="font-serif text-section-title text-foreground">{title}</h2>{description ? <p className="mt-1 text-meta text-muted-foreground">{description}</p> : null}</div> : <span />}{actions}</div><div className="p-5">{children}</div></section> }

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) { return <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow ? <div className="mb-2 text-label font-semibold uppercase tracking-[0.12em] text-brand"><span>{eyebrow}</span></div> : null}<h1 className="font-serif text-page-title text-balance text-foreground">{title}</h1>{description ? <p className="mt-2 max-w-2xl text-body leading-relaxed text-muted-foreground">{description}</p> : null}</div>{actions ? <div className="shrink-0">{actions}</div> : null}</header> }

export type FilterOption = { label: string; value: string }
export function FilterBar({ options, onChange }: { options: FilterOption[]; onChange?: (value: string) => void }) { return <div className="flex flex-wrap items-center gap-2" aria-label="Filters"><span className="mr-1 inline-flex items-center gap-2 text-meta font-semibold text-muted-foreground"><Filter aria-hidden="true" />Filter by</span>{options.map((option) => <button key={option.value} type="button" onClick={() => onChange?.(option.value)} className="rounded-control border border-border bg-canvas px-3 py-2 text-meta text-foreground transition-ui hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">{option.label}</button>)}</div> }

type Column<T> = { key: keyof T; header: string; numeric?: boolean; sortable?: boolean; render?: (value: T[keyof T], row: T) => React.ReactNode }
type ExactlySixOrFewer<T> = [] | [Column<T>] | [Column<T>, Column<T>] | [Column<T>, Column<T>, Column<T>] | [Column<T>, Column<T>, Column<T>, Column<T>, Column<T>] | [Column<T>, Column<T>, Column<T>, Column<T>, Column<T>, Column<T>]
export function DataTable<T extends { id: string }>({ columns, rows, onRowClick }: { columns: Column<T>[]; rows: T[]; onRowClick?: (row: T) => void }) { return <div className="overflow-x-auto rounded-card border border-border"><table className="w-full border-collapse text-left text-body"><thead className="bg-muted text-meta uppercase tracking-[0.08em] text-muted-foreground"><tr>{columns.map((column) => <th key={String(column.key)} scope="col" className={cn('px-4 py-3 font-semibold', column.numeric && 'tabular-nums text-right')}><span className={cn('inline-flex items-center gap-2', column.numeric && 'justify-end')}>{column.header}{column.sortable ? <span aria-label="Sortable column" title="Sortable column" className="inline-flex items-center text-foreground" aria-hidden="true"><ArrowUp /></span> : null}</span></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} tabIndex={onRowClick ? 0 : undefined} onClick={() => onRowClick?.(row)} onKeyDown={(event) => { if (onRowClick && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onRowClick(row) } }} className={cn('border-t border-border', onRowClick && 'cursor-pointer transition-ui hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-2 focus-visible:outline-brand')}>{columns.map((column) => <td key={String(column.key)} className={cn('px-4 py-3 text-foreground', column.numeric && 'text-right tabular-nums')}>{column.render ? column.render(row[column.key], row) : String(row[column.key])}</td>)}</tr>)}</tbody></table></div> }

export function DetailSheet({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: React.ReactNode; description?: React.ReactNode; children: React.ReactNode }) { const closeRef = useRef<HTMLButtonElement>(null); useEffect(() => { if (!open) return; closeRef.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey) }, [open, onClose]); if (!open) return null; return <div className="fixed inset-0 z-50 bg-ink/30" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside role="dialog" aria-modal="true" aria-labelledby="detail-sheet-title" className="ml-auto flex h-full w-full max-w-[480px] flex-col border-l border-border bg-surface shadow-overlay"><div className="flex items-start justify-between gap-4 border-b border-border p-5"><div><h2 id="detail-sheet-title" className="font-serif text-section-title text-foreground">{title}</h2>{description ? <p className="mt-1 text-meta text-muted-foreground">{description}</p> : null}</div><button ref={closeRef} type="button" onClick={onClose} aria-label="Close details" className="rounded-control p-2 text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-brand"><X aria-hidden="true" /></button></div><div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div></aside></div> }

export function ConsentBadge({ state }: { state: 'active' | 'expired' | 'revoked' | 'missing' }) { const tone: Tone = state === 'active' ? 'verified' : state === 'expired' ? 'pending' : 'at-risk'; const labels = { active: 'Active', expired: 'Expired', revoked: 'Revoked', missing: 'Missing' } as const; const Icons = { active: ShieldCheck, expired: Clock3, revoked: X, missing: AlertTriangle } as const; const Icon = Icons[state]; return <span className={cn('inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-meta font-medium', toneConfig[tone].className)}><Icon aria-hidden="true" />{labels[state]}</span> }
export function StatusPill({ tone, label }: { tone: Tone; label?: string }) { const config = toneConfig[tone]; const Icon = config.icon; return <span className={cn('inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-meta font-medium', config.className)}><Icon aria-hidden="true" /><span>{label ?? config.label}</span></span> }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border px-6 py-12 text-center"><Circle aria-hidden="true" className="size-5 text-muted-foreground" /><h2 className="font-serif text-section-title text-foreground">{title}</h2><p className="max-w-md text-body leading-relaxed text-muted-foreground">{description}</p>{action}</div> }
export function LoadingSkeleton({ label = 'Loading content' }: { label?: string }) { return <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-5" role="status" aria-label={label}><span className="size-4 animate-pulse rounded-pill bg-muted" /><span className="text-meta text-muted-foreground">{label}</span></div> }
export function ChartFrame({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <SectionCard title={title} description={description}><div className="min-h-48">{children}</div></SectionCard> }

export { ChevronRight, ShieldCheck, Check, Clock3, AlertTriangle }
export { Modal }
export type { LucideIcon }

export function PrimitiveDemoToggle() { const [active, setActive] = useState(false); return <button type="button" aria-pressed={active} onClick={() => setActive(!active)} className="rounded-control border border-border px-3 py-2 text-meta">{active ? 'Active' : 'Inactive'}</button> }

export const primitiveNotes = 'WorkSync shared primitives use semantic tokens, keyboard affordances, and non-color status cues.'

export default undefined

// Keep React in the generated declaration surface for consumers using JSX.
void Modal
void PrimitiveDemoToggle
void primitiveNotes
void useState
void useEffect
void useRef
void cn
void ChevronRight
void ShieldCheck
void Check
void Clock3
void AlertTriangle
void Filter
void EyeOff
void PanelRight
void X
void ArrowUp
void ArrowDown
void Minus
void Circle

