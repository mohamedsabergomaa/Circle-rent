import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getOwnerSummary(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - req.user set by authGuard
      const userId = req.user.userId;
      const summary = await dashboardService.getOwnerSummary(userId);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  async getRenterSummary(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - req.user set by authGuard
      const userId = req.user.userId;
      const summary = await dashboardService.getRenterSummary(userId);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
