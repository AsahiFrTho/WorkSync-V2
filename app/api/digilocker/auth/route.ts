import { NextRequest, NextResponse } from 'next/server'
import {
  getDigiLockerConfig,
  generateOAuthState,
  buildDigiLockerAuthorizationUrl,
  isDigiLockerConfigured,
} from '@/lib/digilocker/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const traineeId = searchParams.get('traineeId')?.trim() || 'KP-0001'
  const certificateId = searchParams.get('certificateId')?.trim() || null
  const returnUrl = searchParams.get('returnUrl')?.trim() || `/trainee?id=${traineeId}`

  // Check if live DigiLocker credentials are configured
  if (!isDigiLockerConfigured()) {
    const acceptsJson = request.headers.get('accept')?.includes('application/json')
    if (acceptsJson) {
      return NextResponse.json(
        {
          success: false,
          status: 'not_configured',
          message:
            'DigiLocker integration is not configured. Server environment variables (DIGILOCKER_CLIENT_ID, DIGILOCKER_CLIENT_SECRET, DIGILOCKER_REDIRECT_URI) are required.',
        },
        { status: 503 }
      )
    }

    // Graceful redirect back with status query parameter
    const redirectBack = new URL(returnUrl, request.url)
    redirectBack.searchParams.set('dl_status', 'not_configured')
    return NextResponse.redirect(redirectBack)
  }

  const config = getDigiLockerConfig()!
  const { state, stateData, codeChallenge } = generateOAuthState(
    traineeId,
    certificateId,
    returnUrl
  )

  const authUrl = buildDigiLockerAuthorizationUrl(config, state, codeChallenge)

  const response = NextResponse.redirect(authUrl)

  // Store state and codeVerifier in secure, HttpOnly cookie (expires in 10 minutes)
  response.cookies.set('worksync_dl_oauth_state', JSON.stringify(stateData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  })

  return response
}
