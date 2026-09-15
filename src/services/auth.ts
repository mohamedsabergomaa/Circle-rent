import { api, ApiError } from "../lib/api"

import type {
  AuthSession,
  OnboardingInput,
  SignInInput,
  SignUpInput,
} from "../types/auth"

import type { CircleUser } from "../types/user"
import { normalizeUser } from "../types/user"

function saveToken(token: string) {
  localStorage.setItem("circle_token", token)
}

function clearToken() {
  localStorage.removeItem("circle_token")
}

function mapSession(session: AuthSession): AuthSession {
  return {
    ...session,
    user: normalizeUser(session.user),
  }
}

export async function signUp(input: SignUpInput): Promise<AuthSession> {
  const session = await api<AuthSession>("/auth/sign-up", {
    method: "POST",

    body: JSON.stringify(input),
  })

  saveToken(session.token)

  return mapSession(session)
}

export async function signIn(input: SignInInput): Promise<AuthSession> {
  try {
    const session = await api<AuthSession>("/auth/sign-in", {
      method: "POST",

      body: JSON.stringify(input),
    })

    saveToken(session.token)

    return mapSession(session)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401)
      throw new ApiError(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة.")

    throw err
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api("/auth/forgot-password", {
    method: "POST",

    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await api("/auth/reset-password", {
    method: "POST",

    body: JSON.stringify({ email, code, newPassword }),
  })
}

export async function getSession(): Promise<CircleUser | null> {
  const token = localStorage.getItem("circle_token")

  if (!token) return null

  try {
    const raw = await api<CircleUser>("/auth/me")

    return raw ? normalizeUser(raw) : null
  } catch {
    clearToken()

    return null
  }
}

export async function signOut(): Promise<void> {
  try {
    await api("/auth/sign-out", { method: "POST" })
  } finally {
    clearToken()
  }
}

export async function completeOnboarding(
  input: OnboardingInput,
): Promise<AuthSession> {
  const session = await api<AuthSession>("/auth/onboarding", {
    method: "PUT",

    body: JSON.stringify(input),
  })

  return mapSession(session)
}
