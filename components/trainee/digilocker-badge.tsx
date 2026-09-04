'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronDown,
  FileCheck2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DigiLockerVerificationStatus } from '@/lib/digilocker/types'

interface DigiLockerBadgeProps {
  traineeId: string
  certificateId?: string | null
  issuer?: string | null
  nsqfLevel?: number | null
  grade?: string | null
  issueDate?: string | null
  initialStatus?: DigiLockerVerificationStatus
  initialVerifiedAt?: string | null
  initialDocUri?: string | null
  isLiveConfigured?: boolean
}

export function DigiLockerBadge({
  traineeId,
  certificateId,
  issuer,
  nsqfLevel,
  grade,
  issueDate,
  initialStatus = 'not_verified',
  initialVerifiedAt = null,
  initialDocUri = null,
  isLiveConfigured = false,
}: DigiLockerBadgeProps) {
  const [status, setStatus] = useState<DigiLockerVerificationStatus>(initialStatus)
  const [verifiedAt, setVerifiedAt] = useState<string | null>(initialVerifiedAt)
  const [documentUri, setDocumentUri] = useState<string | null>(initialDocUri)
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLiveVerification = () => {
    if (!isLiveConfigured) return
    setIsLoading(true)
    const params = new URLSearchParams({
      traineeId,
      certificateId: certificateId || '',
      returnUrl: window.location.pathname + window.location.search,
    })
    window.location.href = `/api/digilocker/auth?${params.toString()}`
  }

  const handleSimulateVerification = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/digilocker/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId,
          certificateId: certificateId || 'DEMO-CERT',
          mode: 'demo',
        }),
      })
      const data = await res.json()
      if (data.success && data.status === 'simulation') {
        setStatus('simulation')
        setVerifiedAt(data.verifiedAt || new Date().toISOString())
        setDocumentUri(data.documentUri || `in.gov.skillindia.cert-${certificateId || 'demo'}`)
      } else {
        setErrorMsg(data.message || 'Simulation failed.')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error during simulation.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStatus('not_verified')
    setVerifiedAt(null)
    setDocumentUri(null)
    setShowDetails(false)
    setErrorMsg(null)
  }

  const formatDisplayDate = (d?: string | null) => {
    if (!d) return 'Recently'
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return d
    }
  }

  const effectiveReference =
    documentUri ||
    (status === 'simulation'
      ? `in.gov.skillindia.cert-${certificateId || 'demo'}`
      : (certificateId || 'VERIFIED-DOC'))

  return (
    <div className="mt-3 rounded-lg border border-border/80 bg-background/50 p-3 text-xs">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          <span>Digital Credential</span>
        </div>

        {/* Status Indicator Tag */}
        {status === 'verified' && (
          <Badge variant="success" className="gap-1 text-[10px] font-bold px-2 py-0.5">
            <ShieldCheck className="size-3" />
            <span>✓ DigiLocker Verified</span>
          </Badge>
        )}

        {status === 'simulation' && (
          <Badge
            variant="outline"
            className="gap-1 text-[10px] font-bold border-amber-500/40 bg-amber-500/10 text-amber-400 px-2 py-0.5"
          >
            <Sparkles className="size-3" />
            <span>Demo Credential</span>
          </Badge>
        )}

        {status === 'not_verified' && isLiveConfigured && (
          <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
            Unverified
          </Badge>
        )}

        {status === 'not_verified' && !isLiveConfigured && (
          <Badge
            variant="outline"
            className="text-[10px] font-medium border-border/60 bg-muted/30 text-muted-foreground"
          >
            Live API Not Configured
          </Badge>
        )}
      </div>

      <div className="pt-2.5">
        {/* CASE 1: GENUINELY VERIFIED (Live DigiLocker confirmation) */}
        {status === 'verified' && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-semibold text-success">
                <span>Credential verified through DigiLocker</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Verified on:</span>
                <span className="font-medium text-foreground">{formatDisplayDate(verifiedAt)}</span>
              </div>
              {documentUri && (
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/80 truncate">
                  <span>Doc URI:</span>
                  <span className="truncate max-w-[180px]">{documentUri}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails((prev) => !prev)}
                className="h-6 text-[11px] font-medium text-success hover:text-success/90 hover:bg-success/10 px-2 flex items-center gap-1"
              >
                <ChevronDown
                  className={cn('size-3 transition-transform duration-200', showDetails && 'rotate-180')}
                />
                <span>{showDetails ? 'Hide Verification Details' : 'View Verification Details'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* CASE 2: SIMULATION / DEMO MODE (Explicitly labeled) */}
        {status === 'simulation' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-1.5 text-amber-400">
              <span className="font-semibold">Simulation — Not Live DigiLocker Verification</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Candidate qualification matched in local test sandbox. This is a hackathon simulation
              and not an official government DigiLocker record.
            </p>
            {documentUri && (
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/80">
                <span>Demo URI:</span>
                <span className="truncate max-w-[180px]">{documentUri}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails((prev) => !prev)}
                className="h-6 text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 px-2 flex items-center gap-1"
              >
                <ChevronDown
                  className={cn('size-3 transition-transform duration-200', showDetails && 'rotate-180')}
                />
                <span>{showDetails ? 'Hide Verification Details' : 'View Verification Details'}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-2"
              >
                <RefreshCw className="mr-1 size-3" />
                Reset Status
              </Button>
            </div>
          </div>
        )}

        {/* EXPANDABLE VERIFICATION DETAILS PANEL (Shared for Simulation and Verified states) */}
        {showDetails && (status === 'simulation' || status === 'verified') && (
          <div className="mt-2.5 rounded-md border border-border/80 bg-card/80 p-3 space-y-2 text-[11px] animate-in fade-in-50 duration-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-primary">
                Verification Details
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {status === 'simulation' ? 'SANDBOX-SIMULATION' : 'DIGILOCKER-OFFICIAL'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-0.5 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Verification Status:</span>
                <span
                  className={cn(
                    'font-semibold text-right',
                    status === 'simulation' ? 'text-amber-400' : 'text-success'
                  )}
                >
                  {status === 'simulation'
                    ? 'Simulation — Not Live DigiLocker Verification'
                    : 'Credential verified through DigiLocker'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-0.5 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Verification Source:</span>
                <span className="font-medium text-foreground text-right">
                  {status === 'simulation' ? 'Local Hackathon Sandbox' : 'DigiLocker National Gateway'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-0.5 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Credential Reference:</span>
                <span className="font-mono text-[10px] text-primary break-all text-right sm:max-w-[60%]">
                  {effectiveReference}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-0.5 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Credential:</span>
                <span className="font-semibold text-foreground text-right">
                  NSQF Qualification Certificate
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-0.5 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Certificate ID:</span>
                <span className="font-mono font-bold text-foreground text-right">
                  {certificateId || '—'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-0.5 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Qualification:</span>
                <span className="font-semibold text-foreground text-right">
                  {nsqfLevel ? `NSQF Level ${nsqfLevel}` : 'NSQF Level 4'}
                  {grade ? ` (Grade ${grade})` : ''}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-0.5 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Awarding Body:</span>
                <span className="font-medium text-foreground text-right">
                  {issuer || (status === 'simulation' ? 'NCVET / MSSDS (Simulated)' : 'Skill India / NCVET')}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-0.5 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Issue Date:</span>
                <span className="font-medium text-foreground text-right">{issueDate || '—'}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-0.5 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Verification Timestamp:</span>
                <span className="font-medium text-foreground text-right">
                  {formatDisplayDate(verifiedAt)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pt-0.5">
                <span className="text-muted-foreground font-medium shrink-0">Verification Result:</span>
                <span className="text-right sm:max-w-[65%] font-medium text-muted-foreground">
                  {status === 'simulation'
                    ? 'Candidate qualification matched in local test sandbox.'
                    : 'Candidate qualification verified through official DigiLocker repository.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CASE 3: LIVE CONFIGURED BUT NOT YET VERIFIED */}
        {status === 'not_verified' && isLiveConfigured && (
          <div className="flex flex-col gap-2.5">
            <div>
              <p className="font-medium text-foreground">DigiLocker Verification</p>
              <p className="text-[11px] text-muted-foreground">
                Credential has not yet been verified through candidate DigiLocker consent.
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleLiveVerification}
              disabled={isLoading}
              className="h-7 w-full text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Connecting to DigiLocker...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-1.5 size-3.5" />
                  Verify via DigiLocker
                </>
              )}
            </Button>
          </div>
        )}

        {/* CASE 4: LIVE INTEGRATION NOT CONFIGURED (Safe dev fallback) */}
        {status === 'not_verified' && !isLiveConfigured && (
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-medium text-foreground">DigiLocker Integration</p>
              <p className="text-[11px] text-muted-foreground">
                Live verification is not configured in this environment (DIGILOCKER_CLIENT_ID missing).
                Demo mode only.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1 text-[11px] text-destructive">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-0.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateVerification}
                disabled={isLoading}
                className="h-7 w-full text-xs font-semibold border-border hover:bg-muted/50 hover:text-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 size-3.5 text-amber-400" />
                    Test Demo Verification
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
