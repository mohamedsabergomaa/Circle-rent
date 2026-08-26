import { ApiError } from '../../common/errors/ApiError';
import { generateToken } from '../../common/config/jwt';
import { CircleUser, AuthSession, SignUpInput, OnboardingInput } from './auth.types';
import { prisma } from '../../common/config/prisma';
import { resend } from '../../common/config/resend';

const toCircleUser = (user: any): CircleUser => ({
  id: user.id,
  fullName: user.fullName,
  phoneNumber: user.phoneNumber,
  email: user.email || undefined,
  avatarUrl: user.avatarUrl || undefined,
  city: user.city || undefined,
  neighborhood: user.neighborhood || undefined,
  bio: user.bio || undefined,
  preferredLanguage: user.preferredLanguage as 'ar',
  phoneVerified: user.phoneVerified,
  identityVerified: user.identityVerified,
  onboardingCompleted: user.onboardingCompleted,
  memberSince: user.createdAt.toISOString(),
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

// In-memory store for OTPs (TODO: Move to Redis or DB later)
export const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const authService = {
  async signUp(data: SignUpInput): Promise<AuthSession> {
    try {
      const user = await prisma.user.create({
        data: {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          email: data.email,
        },
      });

      const token = generateToken({ userId: user.id });

      return {
        user: toCircleUser(user),
        token,
        createdAt: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw ApiError.conflict('Phone number or email already in use');
      }
      throw error;
    }
  },

  async sendOtp(phoneNumber: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) {
      throw ApiError.notFound('User not found. Please sign up first.');
    }
    if (!user.email) {
      throw ApiError.badRequest('No email on file for this user');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    otpStore.set(phoneNumber, { code, expiresAt });
    
    // Fallback console log for dev
    console.log(`[STUB] OTP for ${phoneNumber} is: ${code}`);

    try {
      await resend.emails.send({
        from: 'Circle <onboarding@resend.dev>',
        to: user.email,
        subject: 'Your Circle verification code',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Welcome to Circle</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 4px; color: #333;">${code}</h1>
            <p style="color: #666; font-size: 14px;">This code expires in 5 minutes.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Failed to send OTP email via Resend:', error);
      // We don't throw the error so the request doesn't crash, allowing the fallback log to be used
    }
  },

  async verifyOtp(phoneNumber: string, code: string): Promise<AuthSession> {
    const stored = otpStore.get(phoneNumber);

    if (!stored || stored.code !== code || stored.expiresAt < Date.now()) {
      throw ApiError.badRequest('Invalid or expired code');
    }

    // OTP verified, remove from store
    otpStore.delete(phoneNumber);

    const user = await prisma.user.update({
      where: { phoneNumber },
      data: { phoneVerified: true }
    });
    
    if (!user) {
      throw ApiError.notFound('User not found. Please sign up first.');
    }

    const token = generateToken({ userId: user.id });

    return {
      user: toCircleUser(user),
      token,
      createdAt: new Date().toISOString(),
    };
  },

  async getMe(userId: string): Promise<CircleUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return toCircleUser(user);
  },

  async completeOnboarding(userId: string, data: OnboardingInput): Promise<CircleUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        city: data.city,
        neighborhood: data.neighborhood,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        onboardingCompleted: true,
      },
    });

    return toCircleUser(user);
  }
};
