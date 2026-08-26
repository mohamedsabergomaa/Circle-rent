import { Request, Response, NextFunction } from 'express';
import { favoritesService } from './favorites.service';
import { createFavoriteSchema } from './favorites.validation';

export class FavoritesController {
  async getFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const favorites = await favoritesService.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  }

  async addFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const data = createFavoriteSchema.parse(req.body);
      const result = await favoritesService.addFavorite(userId, data);
      res.status(201).json(result);
    } catch (error) {
      if ((error as any).status === 409) {
        return res.status(409).json({ message: (error as any).message });
      }
      next(error);
    }
  }

  async removeFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { id: listingId } = req.params;
      const result = await favoritesService.removeFavorite(userId, listingId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async checkFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { id: listingId } = req.params;
      const result = await favoritesService.checkFavorite(userId, listingId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const favoritesController = new FavoritesController();
