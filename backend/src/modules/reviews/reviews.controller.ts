import { Request, Response, NextFunction } from 'express';
import { reviewsService } from './reviews.service';
import { createReviewSchema } from './reviews.validation';

export class ReviewsController {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { id: listingId } = req.params;
      const data = createReviewSchema.parse(req.body);

      const review = await reviewsService.createReview(userId, listingId, data);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewsController = new ReviewsController();
