export type CircleUser = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  avatarUrl?: string;
  city?: string;
  neighborhood?: string;
  bio?: string;
  preferredLanguage: 'ar';
  phoneVerified: boolean;
  identityVerified: boolean;
  onboardingCompleted: boolean;
  memberSince: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  user: CircleUser;
  token: string;
  createdAt: string;
};

export type SignUpInput = {
  fullName: string;
  phoneNumber: string;
  email?: string;
};

export type SignInInput = {
  phoneNumber: string;
};

export type OnboardingInput = Pick<CircleUser, 'city' | 'neighborhood' | 'bio' | 'avatarUrl'>;
