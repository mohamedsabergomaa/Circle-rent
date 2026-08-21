import { api } from '../lib/api'
import type { AuthSession, OnboardingInput, SignInInput, SignUpInput } from '../types/auth'
import type { CircleUser } from '../types/user'

function saveToken(token: string) { localStorage.setItem('circle_token', token) }
function clearToken() { localStorage.removeItem('circle_token') }

export async function signUp(input: SignUpInput): Promise<AuthSession> {
  const session = await api<AuthSession>('/auth/sign-up', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  saveToken(session.token)
  return session
}

export async function signIn(input: SignInInput): Promise<{ otpSent: boolean }> {
  return api<{ otpSent: boolean }>('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function verifyOtp(phoneNumber: string, code: string): Promise<AuthSession> {
  const session = await api<AuthSession>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, code }),
  })
  saveToken(session.token)
  return session
}

export async function getSession(): Promise<CircleUser | null> {
  const token = localStorage.getItem('circle_token')
  if (!token) return null
  try {
    return await api<CircleUser>('/auth/me')
  } catch {
    clearToken()
    return null
  }
}

export async function signOut(): Promise<void> {
  try { await api('/auth/sign-out', { method: 'POST' }) } finally { clearToken() }
}

export async function completeOnboarding(input: OnboardingInput): Promise<AuthSession> {
  return api<AuthSession>('/auth/onboarding', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}
