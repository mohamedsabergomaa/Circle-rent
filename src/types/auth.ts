import type { CircleUser } from './user'

export type AuthSession = {
  user: CircleUser
  token: string
  createdAt: string
}

export type SignUpInput = {
  fullName: string
  phoneNumber: string
  email?: string
}

export type SignInInput = {
  phoneNumber: string
}

export type OnboardingInput = Pick<CircleUser, 'city' | 'neighborhood' | 'bio' | 'avatarUrl'>
