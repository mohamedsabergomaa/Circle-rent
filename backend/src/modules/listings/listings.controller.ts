import { Request, Response, NextFunction } from 'express';
import { listingsService } from './listings.service';
import {
  createListingSchema,
  updateListingSchema,
  searchListingsSchema,
} from './listings.validation';

export class ListingsController {
  async getListings(req: Request, res: Response, next: NextFunction) {
    try {
      const query = searchListingsSchema.parse(req.query);

      // If mine=true, return owner's own listings (requires auth)
      if (query.mine) {
        // @ts-ignore - req.user set by authGuard/optionalAuth
        const user = req.user;
        if (!user) {
          return res.status(401).json({ message: 'Authentication required for mine=true' });
        }
        const listings = await listingsService.getOwnerListings(user.userId);
        return res.json(listings);
      }

      // Public search
      const listings = await listingsService.searchListings(query);
      res.json(listings);
    } catch (error) {
      next(error);
    }
  }

  async getListingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // @ts-ignore - req.user may be set by optionalAuth
      const requesterId = req.user?.userId;
      const listing = await listingsService.getListingById(id, requesterId);
      res.json(listing);
    } catch (error) {
      next(error);
    }
  }

  async getListingReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const reviews = await listingsService.getListingReviews(id);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  async getListingAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const availability = await listingsService.getListingAvailability(id);
      res.json(availability);
    } catch (error) {
      next(error);
    }
  }

  async createListing(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - req.user set by authGuard
      const ownerId = req.user.userId;

      // Parse included/features from form-data — they may arrive as JSON strings or repeated fields
      const body = { ...req.body };
      if (typeof body.included === 'string') {
        try { body.included = JSON.parse(body.included); } catch { body.included = [body.included]; }
      }
      if (typeof body.features === 'string') {
        try { body.features = JSON.parse(body.features); } catch { body.features = [body.features]; }
      }

      const data = createListingSchema.parse(body);
      const photos = (req.files as Express.Multer.File[]) || [];

      const listing = await listingsService.createListing(ownerId, data, photos);
      res.status(201).json(listing);
    } catch (error) {
      next(error);
    }
  }

  async updateListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // @ts-ignore - req.user set by authGuard
      const ownerId = req.user.userId;

      // Parse included/features from form-data
      const body = { ...req.body };
      if (typeof body.included === 'string') {
        try { body.included = JSON.parse(body.included); } catch { body.included = [body.included]; }
      }
      if (typeof body.features === 'string') {
        try { body.features = JSON.parse(body.features); } catch { body.features = [body.features]; }
      }

      const data = updateListingSchema.parse(body);
      const photos = (req.files as Express.Multer.File[]) || [];

      const listing = await listingsService.updateListing(
        id,
        ownerId,
        data,
        photos.length > 0 ? photos : undefined
      );
      res.json(listing);
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // @ts-ignore - req.user set by authGuard
      const ownerId = req.user.userId;

      const result = await listingsService.deleteListing(id, ownerId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const listingsController = new ListingsController();
