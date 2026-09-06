'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Briefcase, GraduationCap, IdCard, Landmark, Loader2, AlertTriangle } from 'lucide-react'
import { ROLES, type Role } from '@/lib/auth/roles'
import { AccessibilityControls } from '@/components/accessibility-controls'

interface RoleDossier {
  id: Role
  name: string
  title: string
  badgeText: string
  description: string
  demoEmail: string
  buttonLabel: string
  icon: typeof Landmark
}

const ROLE_DOSSIERS: RoleDossier[] = [
  { id: 'admin', name: 'Dr. Sanjay Patil', title: 'Director of Policy & Analytics', badgeText: 'Government', description: 'Statewide outcomes and programme oversight.', demoEmail: 'admin@worksync.gov', buttonLabel: 'Sign in as Government', icon: Landmark },
  { id: 'provider', name: 'Sahyadri Vocational Institute', title: 'Centre Head / Training Officer', badgeText: 'Provider', description: 'Training delivery, placement, and skill-gap performance.', demoEmail: 'provider@worksync.gov', buttonLabel: 'Sign in as Training Provider', icon: GraduationCap },
  { id: 'employer', name: 'Deccan Electricals Pvt. Ltd.', title: 'HR Operations & Talent Verification Cell', badgeText: 'Employer', description: 'Employment, wage, and retention verification.', demoEmail: 'employer@worksync.gov', buttonLabel: 'Sign in as Employer', icon: Briefcase },
  { id: 'trainee', name: 'Trainee KP-0001', title: 'Trainee ID: KP-0001 (Electrician)', badgeText: 'Trainee', description: 'Credentials, verified outcomes, and career progress.', demoEmail: 'trainee@worksync.gov', buttonLabel: 'Sign in as Trainee', icon: IdCard },
]

const DEMO_PASSWORD = 'sih2024'

export default function LoginPage() {
  const router = useRouter()
  const [loadingRole, setLoadingRole] = useState<Role | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.session) {
          const from = new URLSearchParams(window.location.search).get('from')
          router.replace(from || ROLES[json.session.role as Role].homeHref)
        } else setCheckingSession(false)
      })
      .catch(() => { if (!cancelled) setCheckingSession(false) })
    return () => { cancelled = true }
  }, [router])

  const executeLogin = async (email: string, password: string, role: Role) => {
    setError(null)
    setLoadingRole(role)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Invalid credentials. Please try again.')
        setLoadingRole(null)
        return
      }
      const from = new URLSearchParams(window.location.search).get('from')
      router.push(from || json.redirectTo)
    } catch {
      setError('Could not connect to the authentication server. Please try again.')
      setLoadingRole(null)
    }
  }

  const handleCardSubmit = (event: FormEvent, role: Role, email: string) => {
    event.preventDefault()
    void executeLogin(email, DEMO_PASSWORD, role)
  }

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="flex flex-col items-center gap-3"><Loader2 className="size-7 animate-spin text-primary" /><span className="text-xs font-semibold text-muted-foreground">Verifying session…</span></div></div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background px-4 py-6 text-foreground font-sans antialiased sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-surface"><Image src="/favicon.png" alt="WorkSync institutional crest" width={44} height={44} className="size-full object-cover" priority /></div>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-x-2 gap-y-0.5"><span className="font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl">WorkSync</span><span className="text-muted-foreground" aria-hidden="true">|</span><span className="text-sm font-semibold text-brand">महाराष्ट्र शासन</span></div><p className="text-xs leading-5 text-muted-foreground">Department of Skills, Employment, Entrepreneurship &amp; Innovation</p></div>
          </div>
          <div className="flex items-center gap-2"><AccessibilityControls /><span className="hidden text-xs text-muted-foreground sm:block">Institutional access</span></div>
        </header>

        <main className="flex flex-1 flex-col justify-center py-8 sm:py-10">
          <div className="mb-7 max-w-2xl"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand">MSSDS access portal</p><h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Login to your account</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Choose the stakeholder view that matches your work.</p><p className="mt-4 border-l-2 border-primary pl-3 text-xs leading-5 text-muted-foreground">Statewide analytical showcase · 48 learner records across Maharashtra districts; operational queues use a separate seeded subset · figures are illustrative.</p></div>
          {error && <div role="alert" className="mb-6 flex w-full items-start gap-2.5 rounded-control border border-at-risk/40 bg-at-risk/10 p-3 text-sm text-foreground"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-at-risk" /><div>{error}</div></div>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ROLE_DOSSIERS.map((role) => { const Icon = role.icon; const isLoading = loadingRole === role.id; return <form key={role.id} onSubmit={(event) => handleCardSubmit(event, role.id, role.demoEmail)} className="flex min-h-[220px] flex-col rounded-card border border-border bg-card p-5 shadow-overlay transition-colors hover:border-border-strong"><div className="flex flex-col items-start gap-4"><span className="inline-flex items-center rounded-pill border border-border bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">{role.badgeText}</span><div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-brand"><Icon className="size-5" aria-hidden="true" /></div><div className="min-w-0"><h2 className="font-serif text-lg font-semibold leading-6 text-foreground">{role.name}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{role.title}</p></div></div><p className="text-sm leading-6 text-muted-foreground">{role.description}</p></div><button type="submit" disabled={loadingRole !== null} className="mt-auto inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <><span>{role.buttonLabel}</span><ArrowRight className="size-4" aria-hidden="true" /></>}</button><p className="mt-3 text-center text-[11px] text-muted-foreground">Demo access is prefilled · password <code className="font-mono text-foreground">{DEMO_PASSWORD}</code></p></form> })}
          </div>
        </main>

        <footer className="border-t border-border pt-4 text-center text-xs leading-5 text-muted-foreground"><p>MSSDS · Department of Skills, Employment, Entrepreneurship &amp; Innovation · Government of Maharashtra</p></footer>
      </div>
    </div>
  )
}
