'use client'

import type * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { BadgeCheck, BriefcaseBusiness, ChevronDown, ClipboardCheck, GraduationCap, LayoutDashboard, LineChart, LogOut, MoreHorizontal, PhoneCall, Puzzle, RefreshCw, Settings, ShieldCheck, Sparkles, UserCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlobalSearch } from '@/components/global-search'
import { ThemeToggle } from '@/components/theme-toggle'
import { ROLES, type Role } from '@/lib/auth/roles'
import { useSessionContext } from '@/lib/auth/session-context'

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard; hint: string }

const NAVIGATION: Record<Role, { primary: NavItem[]; more: NavItem[] }> = {
  admin: { primary: [
    { label: 'State command center', href: '/dashboard', icon: LayoutDashboard, hint: 'Statewide macro metrics' },
    { label: 'Statewide analytics', href: '/analytics', icon: LineChart, hint: 'Provider and trade analytics' },
    { label: 'Skill gap intelligence', href: '/skillgaps', icon: Puzzle, hint: 'Employer gaps and outcomes' },
    { label: 'AI policy insights', href: '/insights', icon: Sparkles, hint: 'Evidence-based signals' },
    { label: 'Learner registry', href: '/learners', icon: Users, hint: 'Consent and outcome records' },
    { label: 'Verification queue', href: '/verification', icon: BadgeCheck, hint: 'Employer audit queue' },
    { label: 'Follow-up operations', href: '/followups', icon: PhoneCall, hint: 'Longitudinal contact queue' },
  ], more: [
    { label: 'Provider scorecards', href: '/scorecard', icon: BriefcaseBusiness, hint: 'Accountability and ranking' },
    { label: 'Data quality audit', href: '/dataquality', icon: ClipboardCheck, hint: 'Hygiene and completeness' },
    { label: 'Programme settings', href: '/settings', icon: Settings, hint: 'Policy and threshold config' },
  ] },
  provider: { primary: [
    { label: 'Training and placement', href: '/analytics', icon: LineChart, hint: 'Cohort yield and outcomes' },
    { label: 'Skill gap intelligence', href: '/skillgaps', icon: Puzzle, hint: 'Deficit engine and simulator' },
    { label: 'AI course improvements', href: '/insights', icon: Sparkles, hint: 'Actionable trade signals' },
  ], more: [{ label: 'Institutional scorecard', href: '/scorecard', icon: BriefcaseBusiness, hint: 'Accountability and ranking' }] },
  employer: { primary: [{ label: 'Talent and verification', href: '/employer', icon: BriefcaseBusiness, hint: 'Joining and wage verification' }], more: [] },
  trainee: { primary: [{ label: 'My outcome passport', href: '/trainee', icon: UserCheck, hint: 'Credentials and wage history' }], more: [] },
}

const ROLE_ICONS: Record<Role, typeof ShieldCheck> = { admin: ShieldCheck, provider: GraduationCap, employer: BriefcaseBusiness, trainee: Users }

function isActive(pathname: string, href: string) { return pathname === href || (href !== '/dashboard' && href !== '/analytics' && href !== '/employer' && href !== '/trainee' && pathname.startsWith(href)) }

function Brand() { return <Link href="/dashboard" className="flex min-w-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-ring"><div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-surface"><Image src="/favicon.png" alt="WorkSync" width={36} height={36} className="size-full object-cover" priority /></div><div className="min-w-0"><p className="font-sans text-sm font-semibold tracking-[0.08em] text-foreground">WORK<span className="text-primary">SYNC</span></p><p className="truncate text-[10px] text-muted-foreground">Skilling outcomes intelligence</p></div></Link> }

function SignOutButton({ className }: { className?: string }) { const router = useRouter(); const { setSessionUser } = useSessionContext(); const [busy, setBusy] = useState(false); const signOut = useCallback(async () => { setBusy(true); try { await fetch('/api/auth/logout', { method: 'POST' }); setSessionUser(null) } finally { router.push('/login') } }, [router, setSessionUser]); return <button type="button" onClick={() => void signOut()} disabled={busy} className={cn('inline-flex items-center gap-2', className)}>{busy ? <RefreshCw className="animate-spin" /> : <LogOut />} Sign out</button> }

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) { const active = isActive(pathname, item.href); const Icon = item.icon; return <Link href={item.href} aria-current={active ? 'page' : undefined} className={cn('group flex items-center gap-3 rounded-control border-l-2 px-3 py-2.5 transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-ring', active ? 'border-primary bg-primary/10 text-foreground' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground')}><Icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} aria-hidden="true" /><span className="min-w-0"><span className="block truncate text-xs font-medium">{item.label}</span><span className="block truncate text-[10px] text-muted-foreground">{item.hint}</span></span></Link> }

export function AppShell({ children }: { children: React.ReactNode }) { const pathname = usePathname(); const { session, role, loading } = useSessionContext(); const roleInfo = ROLES[role]; const RoleIcon = ROLE_ICONS[role]; const navigation = NAVIGATION[role]; const [moreOpen, setMoreOpen] = useState(false); const name = loading && !session ? 'Verifying session…' : session?.name || roleInfo.label; return <div className="flex min-h-screen w-full bg-background font-sans print:block">
  <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-sidebar lg:flex print:hidden"><div className="flex flex-col gap-8 p-5"><Brand /><nav className="flex flex-col gap-1" aria-label="Primary navigation"><p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Workspace</p>{navigation.primary.map((item) => <NavLink key={item.href} item={item} pathname={pathname} />)}<button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} className="mt-2 flex items-center gap-3 rounded-control px-3 py-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"><MoreHorizontal className="size-4" /> More <ChevronDown className={cn('ml-auto size-4 transition-transform', moreOpen && 'rotate-180')} /></button>{moreOpen && <div className="flex flex-col gap-1 border-l border-border pl-2">{navigation.more.map((item) => <NavLink key={item.href} item={item} pathname={pathname} />)}</div>}</nav></div><div className="flex flex-col gap-3 border-t border-border p-5"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-control border border-border bg-surface text-primary"><RoleIcon className="size-4" /></div><div className="min-w-0"><p className="truncate text-xs font-medium text-foreground">{name}</p><p className="truncate text-[10px] text-muted-foreground">{roleInfo.organization}</p></div></div><SignOutButton className="w-full justify-center rounded-control border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" /><p className="text-[10px] leading-4 text-muted-foreground">MSSDS · Department of Skills, Employment, Entrepreneurship & Innovation</p></div></aside>
  <div className="flex min-w-0 flex-1 flex-col"><header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6 lg:px-8 print:hidden"><div className="lg:hidden"><Brand /></div><div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex"><ShieldCheck className="size-4 text-primary" /> {roleInfo.label} <span className="text-border">/</span> <span className="text-foreground">{pathname === '/dashboard' ? 'State command center' : pathname.slice(1) || 'Overview'}</span></div><GlobalSearch className="ml-auto hidden w-full max-w-sm md:flex" /><div className="flex items-center gap-2"><span className="hidden rounded-control border border-border px-2 py-1 text-[10px] text-muted-foreground sm:inline-flex">{roleInfo.shortLabel}</span><ThemeToggle /><SignOutButton className="hidden rounded-control border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex" /></div></header><div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2 lg:hidden print:hidden">{navigation.primary.map((item) => <Link key={item.href} href={item.href} className={cn('whitespace-nowrap rounded-control px-3 py-1.5 text-xs', isActive(pathname, item.href) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>{item.label}</Link>)}</div><main className="min-w-0 flex-1">{children}</main></div></div> }
