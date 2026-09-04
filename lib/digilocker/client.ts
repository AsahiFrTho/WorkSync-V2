import crypto from 'crypto'
import type {
  DigiLockerEnv,
  IDigiLockerConfig,
  IDigiLockerDocument,
  IDigiLockerOAuthState,
  IDigiLockerTokenResponse,
  IDigiLockerVerificationResult,
} from './types'

/**
 * Checks if live DigiLocker credentials are fully configured via environment variables.
 */
export function isDigiLockerConfigured(): boolean {
  const clientId = process.env.DIGILOCKER_CLIENT_ID?.trim()
  const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET?.trim()
  const redirectUri = process.env.DIGILOCKER_REDIRECT_URI?.trim()
  return Boolean(clientId && clientSecret && redirectUri)
}

/**
 * Resolves DigiLocker API configuration from environment variables.
 * Returns null if required credentials are not supplied.
 */
export function getDigiLockerConfig(): IDigiLockerConfig | null {
  if (!isDigiLockerConfigured()) {
    return null
  }

  const env: DigiLockerEnv =
    (process.env.DIGILOCKER_ENV?.trim().toLowerCase() as DigiLockerEnv) === 'production'
      ? 'production'
      : 'sandbox'

  // Standard DigiLocker 2.0 endpoints
  const isProd = env === 'production'
  const baseUrl = isProd
    ? 'https://api.digitallocker.gov.in/public/oauth2'
    : 'https://api.sandbox.digitallocker.gov.in/public/oauth2'

  return {
    clientId: process.env.DIGILOCKER_CLIENT_ID!.trim(),
    clientSecret: process.env.DIGILOCKER_CLIENT_SECRET!.trim(),
    redirectUri: process.env.DIGILOCKER_REDIRECT_URI!.trim(),
    env,
    authUrl: `${baseUrl}/1/authorize`,
    tokenUrl: `${baseUrl}/1/token`,
    issuedFilesUrl: `${baseUrl}/2/files/issued`,
    pullUriUrl: `${baseUrl}/1/xml`,
    scope: 'openid profile pull_doc',
  }
}

/**
 * Generates cryptographic PKCE code verifier and SHA-256 code challenge.
 */
export function generatePkcePair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto
    .randomBytes(32)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9_-]/g, '')

  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  return { codeVerifier, codeChallenge }
}

/**
 * Generates an OAuth state token bundling session context.
 */
export function generateOAuthState(
  traineeId: string,
  certificateId?: string | null,
  returnUrl?: string | null
): { state: string; stateData: IDigiLockerOAuthState; codeVerifier: string; codeChallenge: string } {
  const { codeVerifier, codeChallenge } = generatePkcePair()
  const randomSalt = crypto.randomBytes(16).toString('hex')

  const stateData: IDigiLockerOAuthState = {
    state: randomSalt,
    codeVerifier,
    traineeId,
    certificateId: certificateId || null,
    returnUrl: returnUrl || `/trainee?id=${traineeId}`,
    createdAt: Date.now(),
  }

  return {
    state: randomSalt,
    stateData,
    codeVerifier,
    codeChallenge,
  }
}

/**
 * Generates the DigiLocker authorization URL if configured.
 * Returns null if live credentials are not present.
 */
export function buildDigiLockerAuthorizationUrl(
  config: IDigiLockerConfig,
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: config.scope,
  })

  return `${config.authUrl}?${params.toString()}`
}

/**
 * Server-side exchange of DigiLocker OAuth authorization code for an access token.
 * Never exposes client secrets or access tokens to the browser.
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  config: IDigiLockerConfig
): Promise<{ success: boolean; data?: IDigiLockerTokenResponse; error?: string }> {
  try {
    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    })

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: bodyParams.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `DigiLocker token exchange failed (${response.status}): ${errorText.slice(0, 200)}`,
      }
    }

    const data: IDigiLockerTokenResponse = await response.json()
    return { success: true, data }
  } catch (err: any) {
    return {
      success: false,
      error: `Network error connecting to DigiLocker token endpoint: ${err?.message || err}`,
    }
  }
}

/**
 * Fetches issued documents list from DigiLocker API using the server-held access token.
 */
export async function fetchIssuedDocuments(
  accessToken: string,
  config: IDigiLockerConfig
): Promise<{ success: boolean; documents?: IDigiLockerDocument[]; error?: string }> {
  try {
    const response = await fetch(config.issuedFilesUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `DigiLocker issued files query failed (${response.status})`,
      }
    }

    const json = await response.json()
    const items: any[] = json.items || json.directory || []

    const documents: IDigiLockerDocument[] = items.map((item) => ({
      uri: item.uri || '',
      name: item.name || '',
      type: item.type || '',
      size: item.size,
      date: item.date,
      parent: item.parent,
      mime: item.mime,
      issuer: item.issuer || 'Skill India / NCVET',
      issuerId: item.issuer_id || 'in.gov.skillindia',
      doctype: item.doctype || item.type || 'SKLCR',
      description: item.description,
    }))

    return { success: true, documents }
  } catch (err: any) {
    return {
      success: false,
      error: `Error querying DigiLocker issued files: ${err?.message || err}`,
    }
  }
}

/**
 * Performs credential verification.
 * Respects strict safety guidelines:
 * - If credentials missing and not demo: clearly flags 'not_configured'
 * - If demo: clearly labels 'Simulation — Not Live DigiLocker Verification'
 * - Never claims official verification unless confirmed by active DigiLocker API.
 */
export async function verifyTraineeCredential(params: {
  traineeId: string
  certificateId: string
  mode?: 'live' | 'demo'
}): Promise<IDigiLockerVerificationResult> {
  const isConfigured = isDigiLockerConfigured()
  const isDemoMode = params.mode === 'demo'

  // Case 1: Demo / Simulation Verification requested
  if (isDemoMode) {
    return {
      success: true,
      status: 'simulation',
      credentialReference: params.certificateId || 'MSD-2024-DEMO',
      verifiedAt: new Date().toISOString(),
      traineeId: params.traineeId,
      issuer: 'NCVET / MSSDS (Simulated)',
      grade: 'A',
      nsqfLevel: 4,
      documentUri: `in.gov.skillindia.cert-${params.certificateId || 'demo'}`,
      isSimulation: true,
      isLiveConfigured: isConfigured,
      message: 'Simulation — Not Live DigiLocker Verification',
      details: {
        note: 'Simulated credential verification for developer / hackathon testing. Not an official government record.',
      },
    }
  }

  // Case 2: Live verification requested but no credentials configured in environment
  if (!isConfigured) {
    return {
      success: false,
      status: 'not_configured',
      credentialReference: params.certificateId,
      verifiedAt: null,
      traineeId: params.traineeId,
      issuer: null,
      grade: null,
      nsqfLevel: null,
      documentUri: null,
      isSimulation: false,
      isLiveConfigured: false,
      message: 'DigiLocker integration is not configured. Live credentials (DIGILOCKER_CLIENT_ID / SECRET) are required.',
    }
  }

  // Case 3: Live verification configured
  // Note: Actual verification requires interactive OAuth grant by candidate.
  // When queried statically without OAuth session, indicate pending authorization.
  return {
    success: false,
    status: 'pending',
    credentialReference: params.certificateId,
    verifiedAt: null,
    traineeId: params.traineeId,
    issuer: null,
    grade: null,
    nsqfLevel: null,
    documentUri: null,
    isSimulation: false,
    isLiveConfigured: true,
    message: 'DigiLocker consent flow required to pull authoritative issued credential.',
  }
}
