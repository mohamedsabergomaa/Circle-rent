import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import * as authService from "../services/auth"

import type {
  AuthSession,
  OnboardingInput,
  SignInInput,
  SignUpInput,
} from "../types/auth"

import type { CircleUser } from "../types/user"

type AuthValue = {
  user: CircleUser | null

  loading: boolean

  token: string | null

  signUp: (input: SignUpInput) => Promise<AuthSession>

  signIn: (input: SignInInput) => Promise<AuthSession>

  completeOnboarding: (input: OnboardingInput) => Promise<AuthSession>

  refreshUser: () => Promise<CircleUser | null>

  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CircleUser | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService
      .getSession()

      .then((u) => setUser(u))

      .finally(() => setLoading(false))
  }, [])

  const saveUser = useCallback(async (op: Promise<AuthSession>) => {
    const session = await op

    setUser(session.user)

    return session
  }, [])

  const refreshUser = useCallback(async () => {
    const fresh = await authService.getSession()

    setUser(fresh)

    return fresh
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,

      loading,

      token: localStorage.getItem("circle_token"),

      signUp: (input) => saveUser(authService.signUp(input)),

      signIn: (input) => saveUser(authService.signIn(input)),

      completeOnboarding: (input) =>
        saveUser(authService.completeOnboarding(input)),

      refreshUser,

      signOut: async () => {
        await authService.signOut()
        setUser(null)
      },
    }),
    [loading, saveUser, refreshUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) throw new Error("useAuth must be used inside AuthProvider")

  return value
}
