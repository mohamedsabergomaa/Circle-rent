import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { ApiError } from '../errors/ApiError';

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ApiError.unauthorized('Authorization header missing');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Invalid authorization format. Expected: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw ApiError.unauthorized('Token missing');
    }

    try {
      const decoded = verifyToken(token);
      (req as any).user = decoded; // Attach payload to req.user
      next();
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};
