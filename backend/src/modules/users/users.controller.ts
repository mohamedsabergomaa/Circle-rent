import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { updateProfileSchema } from './users.validation';

export class UsersController {
  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await usersService.getPublicProfile(id);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - req.user is set by authGuard
      const userId = req.user.userId;
      const data = updateProfileSchema.parse(req.body);
      const updatedUser = await usersService.updateProfile(userId, data);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async submitVerification(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - req.user is set by authGuard
      const userId = req.user.userId;
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const identityCard = files?.['identityCard']?.[0];
      const selfie = files?.['selfie']?.[0];

      if (!identityCard || !selfie) {
        return res.status(400).json({ message: 'Both identityCard and selfie are required' });
      }

      const result = await usersService.submitVerification(userId, identityCard, selfie);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
