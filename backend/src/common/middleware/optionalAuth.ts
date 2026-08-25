import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

/**
 * Optional auth middleware — parses JWT if present but does NOT reject
 * unauthenticated requests. Sets req.user if valid token found.
 * Use for routes that behave differently for authenticated vs anonymous users
 * (e.g. owner can view own drafts, public cannot).
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
      } catch {
        // Invalid token — proceed as unauthenticated
      }
    }
  }

  next();
};
