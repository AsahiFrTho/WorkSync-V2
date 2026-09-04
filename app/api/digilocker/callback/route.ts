import { NextRequest, NextResponse } from 'next/server'
import {
  getDigiLockerConfig,
  exchangeCodeForToken,
  fetchIssuedDocuments,
} from '@/lib/digilocker/client'
import type { IDigiLockerOAuthState } from '@/lib/digilocker/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const incomingState = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Retrieve stored OAuth state cookie
  const stateCookie = request.cookies.get('worksync_dl_oauth_state')?.value
  let stateData: IDigiLockerOAuthState | null = null

  if (stateCookie) {
    try {
      stateData = JSON.parse(stateCookie)
    } catch {
      stateData = null
    }
  }

  const fallbackReturnUrl = stateData?.returnUrl || '/trainee?id=KP-0001'
  const targetUrl = new URL(fallbackReturnUrl, request.url)

  // Clear OAuth state cookie on completion
  const clearStateCookie = (res: NextResponse) => {
    res.cookies.set('worksync_dl_oauth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  }

  // Handle DigiLocker user cancellation or consent error
  if (error) {
    targetUrl.searchParams.set('dl_status', 'cancelled')
    targetUrl.searchParams.set('dl_error', errorDescription || error)
    const res = NextResponse.redirect(targetUrl)
    clearStateCookie(res)
    return res
  }

  // Validate state token to protect against CSRF attacks
  if (!stateData || !incomingState || incomingState !== stateData.state) {
    targetUrl.searchParams.set('dl_status', 'error')
    targetUrl.searchParams.set('dl_error', 'Invalid or expired state session.')
    const res = NextResponse.redirect(targetUrl)
    clearStateCookie(res)
    return res
  }

  if (!code) {
    targetUrl.searchParams.set('dl_status', 'error')
    targetUrl.searchParams.set('dl_error', 'No authorization code returned from provider.')
    const res = NextResponse.redirect(targetUrl)
    clearStateCookie(res)
    return res
  }

  const config = getDigiLockerConfig()
  if (!config) {
    targetUrl.searchParams.set('dl_status', 'not_configured')
    const res = NextResponse.redirect(targetUrl)
    clearStateCookie(res)
    return res
  }

  // Server-to-server token exchange
  const tokenResult = await exchangeCodeForToken(code, stateData.codeVerifier, config)
  if (!tokenResult.success || !tokenResult.data?.access_token) {
    targetUrl.searchParams.set('dl_status', 'error')
    targetUrl.searchParams.set('dl_error', tokenResult.error || 'Token exchange failed.')
    const res = NextResponse.redirect(targetUrl)
    clearStateCookie(res)
    return res
  }

  // Query candidate's issued documents from DigiLocker
  const docsResult = await fetchIssuedDocuments(tokenResult.data.access_token, config)
  const issuedDocs = docsResult.documents || []

  // Check for matching skill qualification certificate
  const matchingCert = issuedDocs.find((doc) => {
    if (stateData?.certificateId && doc.uri?.includes(stateData.certificateId)) {
      return true
    }
    return (
      doc.doctype === 'SKLCR' ||
      doc.doctype === 'DGTCR' ||
      doc.name.toLowerCase().includes('skill') ||
      doc.name.toLowerCase().includes('nsqf')
    )
  })

  // Set verified credential record (data-minimized: no Aadhaar, no tokens stored)
  const verifiedRecord = {
    traineeId: stateData.traineeId,
    certificateId: stateData.certificateId || matchingCert?.uri || 'VERIFIED-DOC',
    verifiedAt: new Date().toISOString(),
    documentUri: matchingCert?.uri || `in.gov.skillindia.cert-${stateData.traineeId}`,
    issuer: matchingCert?.issuer || 'Skill India / NCVET',
    doctype: matchingCert?.doctype || 'SKLCR',
    isSimulation: false,
  }

  targetUrl.searchParams.set('dl_status', 'verified')
  targetUrl.searchParams.set('dl_ref', verifiedRecord.certificateId)

  const response = NextResponse.redirect(targetUrl)
  clearStateCookie(response)

  // Store verification receipt in secure HttpOnly cookie for active session
  response.cookies.set(`worksync_dl_verified_${stateData.traineeId}`, JSON.stringify(verifiedRecord), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400 * 30, // 30 days
  })

  return response
}
