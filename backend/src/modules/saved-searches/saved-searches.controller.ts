import { Request, Response, NextFunction } from 'express';
import { savedSearchesService } from './saved-searches.service';
import { createSavedSearchSchema, updateSavedSearchSchema } from './saved-searches.validation';

export class SavedSearchesController {
  async getSavedSearches(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const searches = await savedSearchesService.getSavedSearches(userId);
      res.json(searches);
    } catch (error) {
      next(error);
    }
  }

  async createSavedSearch(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const data = createSavedSearchSchema.parse(req.body);
      const result = await savedSearchesService.createSavedSearch(userId, data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateSavedSearch(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { id } = req.params;
      const data = updateSavedSearchSchema.parse(req.body);
      const result = await savedSearchesService.updateSavedSearch(userId, id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteSavedSearch(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { id } = req.params;
      const result = await savedSearchesService.deleteSavedSearch(userId, id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const savedSearchesController = new SavedSearchesController();
