'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Landmark,
  GraduationCap,
  Briefcase,
  IdCard,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Lock,
  Mail,
  KeyRound,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { ROLES, type Role } from '@/lib/auth/roles'
import { cn } from '@/lib/utils'

interface RoleDossier {
  id: Role
  name: string
  title: string
  badgeText: string
  organization: string
  location: string
  secondaryOrgLine?: string
  description: string
  capabilities: string[]
  demoEmail: string
  buttonLabel: string
  icon: typeof Landmark
}

const ROLE_DOSSIERS: RoleDossier[] = [
  {
    id: 'admin',
    name: 'Dr. Sanjay Patil',
    title: 'Director of Policy & Analytics',
    badgeText: 'Executive Oversight',
    organization: 'Maharashtra State Skill Development Society (MSSDS)',
    location: 'Mantralaya, Mumbai',
    description:
      'Statewide longitudinal outcomes, 12-district comparative analytics, certification-to-placement funnels, wage growth indices, and 6-month retention monitoring.',
    capabilities: [
      'Executive KPI Funnel (Enrolled → Certified → Retained)',
      '12-District & Course-Wise Performance Benchmarks',
      'Longitudinal Wage Growth & 6-Month Retention Audits',
    ],
    demoEmail: 'admin@worksync.gov',
    buttonLabel: 'Sign in as Government',
    icon: Landmark,
  },
  {
    id: 'provider',
    name: 'Sahyadri Vocational Institute',
    title: 'Centre Head / Training Officer',
    badgeText: 'Curriculum & Gaps',
    organization: 'Affiliated to MSSDS (Pune & Nashik Centres)',
    location: 'Pune Center (96 Active VTPs)',
    description:
      'Batch certification outcomes, skill gap diagnostics mapped against live employer demand, trade-wise placement rates, and candidate non-placement root causes.',
    capabilities: [
      'Trade Skill-Gap Matrix vs. Industry Demand',
      'Course Placement Rates & Median Wage Metrics',
      'Dropout & Unplaced Trainee Diagnostic Signals',
    ],
    demoEmail: 'provider@worksync.gov',
    buttonLabel: 'Sign in as Training Provider',
    icon: GraduationCap,
  },
  {
    id: 'employer',
    name: 'Deccan Electricals Pvt. Ltd.',
    title: 'HR Operations & Talent Verification Cell',
    badgeText: 'Verification & Retention',
    organization: 'Chakan Industrial Area, Pune',
    location: 'Manufacturing & Power Sector',
    description:
      'Direct candidate employment confirmation, wage verification, 30/90/180-day retention milestone audits, and trade relevance validation.',
    capabilities: [
      '1-Click Employment & Wage Record Confirmation',
      '30-Day, 90-Day & 180-Day Retention Milestones',
      'Direct Trade Alignment & Dispute Flagging',
    ],
    demoEmail: 'employer@worksync.gov',
    buttonLabel: 'Sign in as Employer',
    icon: Briefcase,
  },
  {
    id: 'trainee',
    name: 'Trainee KP-0001',
    title: 'Trainee ID: KP-0001 (Electrician)',
    badgeText: 'Outcome Passport',
    organization: 'Yashaswi Skill Academy, Pune',
    location: 'Employed at Deccan Electricals (₹16,800/mo)',
    description:
      'Verifiable Trainee Outcome Passport, NSQF Level 4 certification records, verified multi-stage employment timeline, and AI Career Intelligence recommendations.',
    capabilities: [
      'Verifiable Digital Outcome Passport (NSQF Level 4)',
      'Multi-Stage Retention & Monthly Wage Timeline',
      'AI Career Intelligence & Upskilling Pathways',
    ],
    demoEmail: 'trainee@worksync.gov',
    buttonLabel: 'Sign in as Trainee',
    icon: IdCard,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [loadingRole, setLoadingRole] = useState<Role | null>(null)
  const [isCustomAuthLoading, setIsCustomAuthLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Per-card form states prefilled with demo credentials
  const [credentials, setCredentials] = useState<Record<Role, { email: string; password: string }>>({
    admin: { email: 'admin@worksync.gov', password: 'sih2024' },
    provider: { email: 'provider@worksync.gov', password: 'sih2024' },
    employer: { email: 'employer@worksync.gov', password: 'sih2024' },
    trainee: { email: 'trainee@worksync.gov', password: 'sih2024' },
  })


  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.session) {
          const from = new URLSearchParams(window.location.search).get('from')
          router.replace(from || ROLES[json.session.role as Role].homeHref)
        } else {
          setCheckingSession(false)
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingSession(false)
      })
    return () => {
      cancelled = true
    }
  }, [router])

  const executeLogin = async (email: string, password: string, roleForLoader?: Role) => {
    setError(null)
    if (roleForLoader) {
      setLoadingRole(roleForLoader)
    } else {
      setIsCustomAuthLoading(true)
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Invalid credentials. Please try again.')
        setLoadingRole(null)
        setIsCustomAuthLoading(false)
        return
      }
      const from = new URLSearchParams(window.location.search).get('from')
      router.push(from || json.redirectTo)
    } catch {
      setError('Could not connect to the authentication server. Please try again.')
      setLoadingRole(null)
      setIsCustomAuthLoading(false)
    }
  }

  const handleCardSubmit = (e: FormEvent, roleId: Role) => {
    e.preventDefault()
    const { email, password } = credentials[roleId]
    executeLogin(email, password, roleId)
  }

  const handleFillDemoPassword = (roleId: Role) => {
    setCredentials((prev) => ({
      ...prev,
      [roleId]: { ...prev[roleId], password: 'sih2024' },
    }))
  }


  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-7 animate-spin text-brand" />
          <span className="text-xs font-semibold text-zinc-300">Verifying session…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-foreground font-sans antialiased selection:bg-brand/30 selection:text-foreground bg-background">
      
      {/* No hero image, no gradient — institutional quiet */}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTAINER                                                   */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 max-w-[1520px] mx-auto">
        
        {/* ========================================================================= */}
        {/* TOP: WORKSYNC INSTITUTIONAL HEADER & BRANDING                             */}
        {/* ========================================================================= */}
        <header className="flex flex-col items-center text-center space-y-2 pt-2 sm:pt-4">
          <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface border border-border shadow-md ring-1 ring-border">
              <Image
                src="/favicon.png"
                alt="WorkSync Institutional Crest"
                width={48}
                height={48}
                className="size-full object-cover"
                priority
              />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                  WorkSync
                </span>
                <span className="text-brand font-light text-sm">|</span>
                <span className="text-xs sm:text-sm font-bold text-brand tracking-wide">
                  महाराष्ट्र शासन
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-zinc-200 drop-shadow-sm">
                Department of Skills, Employment, Entrepreneurship &amp; Innovation
              </p>
            </div>
          </div>

          <div className="space-y-0.5 max-w-xl">
            <p className="text-xs sm:text-sm font-bold text-brand tracking-wider uppercase drop-shadow-sm">
              One Platform. Many Opportunities.
            </p>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* CENTER / MAIN: DETAILED ROLE LOGIN PANELS (SOURCE OF TRUTH)               */}
        {/* ========================================================================= */}
        <main className="my-auto py-6 sm:py-8 w-full mx-auto flex flex-col items-center">
          
          {/* Section Titles */}
          <div className="text-center mb-6 sm:mb-8 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase drop-shadow-md">
              Login to Your Account
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-zinc-200 drop-shadow-sm">
              Choose your role to continue
            </p>
          </div>

          {/* Global Error Notification */}
          {error && (
            <div className="mb-6 w-full max-w-lg flex items-start gap-2.5 rounded-xl border border-red-500/50 bg-red-950/90 p-3 text-xs font-medium text-red-100 shadow-xl backdrop-blur-md">
              <AlertTriangle className="size-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* 4 Rich Role Panels (Horizontal on Desktop, 2x2 Tablet, 1-col Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
            {ROLE_DOSSIERS.map((role) => {
              const Icon = role.icon
              const isCurrentLoading = loadingRole === role.id
              const roleCreds = credentials[role.id]

              return (
                <div
                  key={role.id}
                  className="flex flex-col justify-between rounded-card border border-border bg-card backdrop-blur-md p-5 sm:p-6 transition-all duration-200 hover:border-brand/50 hover:bg-card shadow-overlay hover:shadow-[0_16px_42px_rgba(0,0,0,0.4)]"
                >
                  <div className="space-y-4">
                    {/* Header: Icon, Person/Org Name, Title & Outlined Badge */}
                    <div className="flex items-start justify-between gap-3 border-b border-border pb-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-brand shadow-inner">
                          <Icon className="size-5.5 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base font-bold text-foreground tracking-tight truncate leading-tight">
                            {role.name}
                          </h2>
                          <p className="text-xs font-semibold text-brand truncate mt-0.5">
                            {role.title}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 inline-flex items-center rounded-pill border border-border bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand shadow-2xs">
                        {role.badgeText}
                      </span>
                    </div>

                    {/* Organization & Location Meta */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Building2 className="size-3.5 text-brand shrink-0" />
                        <span className="truncate">{role.organization}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-3.5 text-muted shrink-0" />
                        <span className="truncate">{role.location}</span>
                      </div>
                    </div>

                    {/* Role Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed min-h-[56px]">
                      {role.description}
                    </p>

                    {/* Operational Capabilities Checklist */}
                    <div className="space-y-2 border-t border-border pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">
                        Operational Capabilities:
                      </span>
                      <div className="space-y-1.5">
                        {role.capabilities.map((cap, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-foreground">
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand" />
                            <span className="leading-snug">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Role Authentication Form */}
                  <form
                    onSubmit={(e) => handleCardSubmit(e, role.id)}
                    className="mt-5 pt-3.5 border-t border-border space-y-3"
                  >
                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor={`email-${role.id}`}
                        className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand" />
                        <input
                          id={`email-${role.id}`}
                          type="email"
                          required
                          value={roleCreds.email}
                          onChange={(e) =>
                            setCredentials((prev) => ({
                              ...prev,
                              [role.id]: { ...prev[role.id], email: e.target.value },
                            }))
                          }
                          className="w-full rounded-control border border-border bg-surface py-2 pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor={`password-${role.id}`}
                          className="text-[10px] font-bold uppercase tracking-wider text-brand block"
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => handleFillDemoPassword(role.id)}
                          className="text-[10px] font-semibold text-brand hover:text-accent transition-colors cursor-pointer"
                        >
                          Use demo password
                        </button>
                      </div>
                      <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand" />
                        <input
                          id={`password-${role.id}`}
                          type="password"
                          required
                          value={roleCreds.password}
                          onChange={(e) =>
                            setCredentials((prev) => ({
                              ...prev,
                              [role.id]: { ...prev[role.id], password: e.target.value },
                            }))
                          }
                          className="w-full rounded-control border border-border bg-surface py-2 pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={loadingRole !== null || isCustomAuthLoading}
                      className={cn(
                        'w-full h-11 rounded-control bg-brand hover:bg-accent active:bg-brand/80 text-background font-bold text-xs sm:text-sm flex items-center justify-center gap-2 px-4 shadow-overlay transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isCurrentLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin text-black" />
                          <span>Signing in…</span>
                        </>
                      ) : (
                        <>
                          <span>{role.buttonLabel}</span>
                          <ArrowRight className="size-3.5 text-black" />
                        </>
                      )}
                    </button>

                    {/* Demo Credentials Note */}
                    <p className="text-center text-[10px] text-muted-foreground">
                      Demo: <code className="text-brand font-mono">{role.demoEmail}</code> · password <code className="text-brand font-mono">sih2024</code>
                    </p>
                  </form>
                </div>
              )
            })}
          </div>

          {/* Prototype Architecture Notice */}
          <div className="mt-8 w-full max-w-4xl rounded-control border border-border bg-surface/40 p-3.5 backdrop-blur-sm text-xs">
            <div className="flex items-start gap-2.5">
              <Info className="size-4 text-brand shrink-0 mt-0.5" />
              <div className="text-muted-foreground font-normal leading-relaxed text-[11px] sm:text-xs">
                <strong className="font-semibold text-foreground">In production, this login will be replaced by:</strong> State Single Sign-On (SSO) · Aadhaar e-KYC verification · dedicated role providers.
              </div>
            </div>
          </div>

          {/* Disabled SSO / Aadhaar affordance */}
          <div className="mt-5 w-full max-w-md flex flex-col items-center">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground opacity-60 py-1.5 px-3 rounded-control bg-muted border border-border backdrop-blur-sm cursor-not-allowed"
            >
              <Lock className="size-3.5 text-muted-foreground" />
              <span>State SSO / Aadhaar e-KYC — coming soon</span>
            </button>
          </div>
        </main>

        {/* Footer attribution */}
        <footer className="w-full pt-4 pb-2 space-y-3">
          <div className="text-center text-[11px] text-muted-foreground space-y-0.5 drop-shadow-sm">
            <p>
              MSSDS · Department of Skills, Employment, Entrepreneurship &amp; Innovation · Government of Maharashtra
            </p>
          </div>
        </footer>

      </div>
    </div>
  )
}
