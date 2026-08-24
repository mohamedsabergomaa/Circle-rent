import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import { authGuard } from '../../common/middleware/authGuard';

const router = Router();

const signInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 sign-in requests per `window` (here, per 15 minutes)
  message: { message: 'Too many sign-in attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
}); // TODO: Consider changing to a custom store using Redis or rate limiting by phone number

router.post('/sign-up', authController.signUp);
router.post('/sign-in', signInLimiter, authController.signIn);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes
router.use(authGuard);
router.get('/me', authController.getMe);
router.post('/sign-out', authController.signOut);
router.put('/onboarding', authController.onboarding);

export default router;
