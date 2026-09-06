import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { signUpSchema, signInSchema, verifyOtpSchema, onboardingSchema } from './auth.validation';
import { ApiError } from '../../common/errors/ApiError';

export const authController = {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = signUpSchema.parse(req.body);
      const result = await authService.signUp(parsedData);
      await authService.sendOtp(parsedData.phoneNumber);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        next(ApiError.badRequest(error.errors?.[0]?.message || error.issues?.[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  },

  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = signInSchema.parse(req.body);
      await authService.sendOtp(parsedData.phoneNumber);
      res.json({ otpSent: true });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        next(ApiError.badRequest(error.errors?.[0]?.message || error.issues?.[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = verifyOtpSchema.parse(req.body);
      const result = await authService.verifyOtp(parsedData.phoneNumber, parsedData.code);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        next(ApiError.badRequest(error.errors?.[0]?.message || error.issues?.[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw ApiError.unauthorized();
      }
      const user = await authService.getMe(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async signOut(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement real token invalidation (blocklist in Redis, or short-lived tokens + refresh pattern)
      res.json({ message: 'Signed out' });
    } catch (error) {
      next(error);
    }
  },

  async onboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw ApiError.unauthorized();
      }
      const parsedData = onboardingSchema.parse(req.body);
      const user = await authService.completeOnboarding(userId, parsedData);
      const { generateToken } = require('../../common/config/jwt');
      const token = generateToken({ userId: user.id });
      res.json({ user, token });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        next(ApiError.badRequest(error.errors?.[0]?.message || error.issues?.[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }
};
