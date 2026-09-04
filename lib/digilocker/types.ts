/**
 * DigiLocker Credential Verification Types & Interfaces
 * Provider-agnostic specification for digital qualification verification in WorkSync.
 */

export type DigiLockerEnv = 'sandbox' | 'production'

export type DigiLockerVerificationStatus =
  | 'verified'
  | 'not_verified'
  | 'simulation'
  | 'not_configured'
  | 'error'
  | 'pending'

export interface IDigiLockerConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  env: DigiLockerEnv
  authUrl: string
  tokenUrl: string
  issuedFilesUrl: string
  pullUriUrl: string
  scope: string
}

export interface IDigiLockerOAuthState {
  state: string
  codeVerifier: string
  traineeId: string
  certificateId?: string | null
  returnUrl?: string | null
  createdAt: number
}

export interface IDigiLockerAuthResponse {
  code?: string
  state?: string
  error?: string
  errorDescription?: string
}

export interface IDigiLockerTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  digilocker_id?: string
  name?: string
  dob?: string
  gender?: string
}

export interface IDigiLockerDocument {
  uri: string
  name: string
  type: string
  size?: string
  date?: string
  parent?: string
  mime?: string
  issuer: string
  issuerId: string
  doctype: string
  description?: string
}

export interface IDigiLockerVerificationResult {
  success: boolean
  status: DigiLockerVerificationStatus
  credentialReference: string
  verifiedAt: string | null
  traineeId: string
  issuer: string | null
  grade: string | null
  nsqfLevel: number | null
  documentUri: string | null
  isSimulation: boolean
  isLiveConfigured: boolean
  message: string
  details?: Record<string, unknown>
}
