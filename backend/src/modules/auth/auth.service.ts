import { ApiError } from '../../common/errors/ApiError';
import { generateToken } from '../../common/config/jwt';
import { CircleUser, AuthSession, SignUpInput, OnboardingInput } from './auth.types';

// In-memory store for OTPs (TODO: Move to Redis or DB later)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const authService = {
  async signUp(data: SignUpInput): Promise<AuthSession> {
    // TODO: Replace with prisma.user.create(...) once User model exists
    const mockUser: CircleUser = {
      id: 'mock-user-id-' + Date.now(),
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      preferredLanguage: 'ar',
      phoneVerified: true, // Assuming true after sign up/otp flow
      identityVerified: false,
      onboardingCompleted: false,
      memberSince: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = generateToken({ userId: mockUser.id });

    return {
      user: mockUser,
      token,
      createdAt: new Date().toISOString(),
    };
  },

  async sendOtp(phoneNumber: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    otpStore.set(phoneNumber, { code, expiresAt });
    
    // Stub for actual SMS sending
    console.log(`[STUB] OTP for ${phoneNumber} is: ${code}`);
  },

  async verifyOtp(phoneNumber: string, code: string): Promise<AuthSession> {
    const stored = otpStore.get(phoneNumber);

    if (!stored || stored.code !== code || stored.expiresAt < Date.now()) {
      throw ApiError.badRequest('Invalid or expired code');
    }

    // OTP verified, remove from store
    otpStore.delete(phoneNumber);

    // TODO: Replace mock user lookup with prisma.user.findUnique(...) once User model exists
    // If user doesn't exist, we might need to handle it differently, but for now mock it as existing
    const mockUser: CircleUser = {
      id: 'mock-user-id-from-signin',
      fullName: 'Mock User',
      phoneNumber,
      preferredLanguage: 'ar',
      phoneVerified: true,
      identityVerified: false,
      onboardingCompleted: false,
      memberSince: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = generateToken({ userId: mockUser.id });

    return {
      user: mockUser,
      token,
      createdAt: new Date().toISOString(),
    };
  },

  async getMe(userId: string): Promise<CircleUser> {
    // TODO: Replace with prisma.user.findUnique({ where: { id: userId } })
    const mockUser: CircleUser = {
      id: userId,
      fullName: 'Mock User ' + userId,
      phoneNumber: '+1234567890',
      preferredLanguage: 'ar',
      phoneVerified: true,
      identityVerified: false,
      onboardingCompleted: false,
      memberSince: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return mockUser;
  },

  async completeOnboarding(userId: string, data: OnboardingInput): Promise<CircleUser> {
    // TODO: Replace with prisma.user.update(...)
    const mockUser: CircleUser = {
      id: userId,
      fullName: 'Mock User',
      phoneNumber: '+1234567890',
      ...data,
      preferredLanguage: 'ar',
      phoneVerified: true,
      identityVerified: false,
      onboardingCompleted: true,
      memberSince: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return mockUser;
  }
};
