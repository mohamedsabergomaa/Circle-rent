import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const adminGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // authGuard has already run, so req.user.userId is available
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user || user.isAdmin !== true) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    next(error);
  }
};
