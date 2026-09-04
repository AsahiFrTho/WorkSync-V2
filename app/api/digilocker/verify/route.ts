import { NextRequest, NextResponse } from 'next/server'
import {
  isDigiLockerConfigured,
  verifyTraineeCredential,
} from '@/lib/digilocker/client'
import type { IDigiLockerVerificationResult } from '@/lib/digilocker/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const traineeId = searchParams.get('traineeId')?.trim()
  const certificateId = searchParams.get('certificateId')?.trim() || ''
  const mode = searchParams.get('mode') === 'demo' ? 'demo' : 'live'

  if (!traineeId) {
    return NextResponse.json(
      { success: false, error: 'traineeId query parameter is required' },
      { status: 400 }
    )
  }

  // Check if there is an active verified receipt cookie for this trainee
  const cookieReceipt = request.cookies.get(`worksync_dl_verified_${traineeId}`)?.value
  if (cookieReceipt) {
    try {
      const parsed = JSON.parse(cookieReceipt)
      const result: IDigiLockerVerificationResult = {
        success: true,
        status: parsed.isSimulation ? 'simulation' : 'verified',
        credentialReference: parsed.certificateId || certificateId,
        verifiedAt: parsed.verifiedAt || null,
        traineeId,
        issuer: parsed.issuer || 'Skill India / NCVET',
        grade: 'A',
        nsqfLevel: 4,
        documentUri: parsed.documentUri || null,
        isSimulation: Boolean(parsed.isSimulation),
        isLiveConfigured: isDigiLockerConfigured(),
        message: parsed.isSimulation
          ? 'Simulation — Not Live DigiLocker Verification'
          : 'Credential verified through DigiLocker',
      }
      return NextResponse.json(result)
    } catch {
      // ignore parse error and proceed
    }
  }

  const result = await verifyTraineeCredential({
    traineeId,
    certificateId,
    mode,
  })

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const traineeId = typeof body?.traineeId === 'string' ? body.traineeId.trim() : ''
    const certificateId = typeof body?.certificateId === 'string' ? body.certificateId.trim() : ''
    const mode = body?.mode === 'demo' ? 'demo' : 'live'

    if (!traineeId) {
      return NextResponse.json(
        { success: false, error: 'traineeId is required in request body' },
        { status: 400 }
      )
    }

    const result = await verifyTraineeCredential({
      traineeId,
      certificateId,
      mode,
    })

    const response = NextResponse.json(result)

    // If demo mode was explicitly triggered, we can optionally save a demo session cookie
    if (result.status === 'simulation') {
      const demoRecord = {
        traineeId,
        certificateId: result.credentialReference,
        verifiedAt: result.verifiedAt,
        documentUri: result.documentUri,
        issuer: result.issuer,
        isSimulation: true,
      }
      response.cookies.set(`worksync_dl_verified_${traineeId}`, JSON.stringify(demoRecord), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 86400, // 24 hours
      })
    }

    return response
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: `Invalid request payload: ${err?.message || err}`,
      },
      { status: 400 }
    )
  }
}
