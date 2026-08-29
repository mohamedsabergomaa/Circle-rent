import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { rejectListingSchema } from './admin.validation';
import { ApiError } from '../../common/errors/ApiError';

export class AdminController {
  async getPendingListings(req: Request, res: Response, next: NextFunction) {
    try {
      const listings = await adminService.getPendingListings();
      res.json(listings);
    } catch (error) {
      next(error);
    }
  }

  async approveListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await adminService.approveListing(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async rejectListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dto = rejectListingSchema.parse(req.body);
      const result = await adminService.rejectListing(id, dto.reason);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        next(ApiError.badRequest(error.errors?.[0]?.message || error.issues?.[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }
}

export const adminController = new AdminController();
