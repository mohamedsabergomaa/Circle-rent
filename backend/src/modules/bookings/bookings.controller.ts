import { Request, Response, NextFunction } from 'express';
import { bookingsService } from './bookings.service';
import {
  createBookingSchema,
  updateStatusSchema,
  listBookingsSchema,
  submitReturnSchema,
} from './bookings.validation';
import { ApiError } from '../../common/errors/ApiError';

export class BookingsController {
  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - req.user set by authGuard
      const renterId = req.user.userId;
      const data = createBookingSchema.parse(req.body);
      const booking = await bookingsService.createBooking(renterId, data);
      res.status(201).json(booking);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        next(ApiError.badRequest(error.errors?.[0]?.message || error.issues?.[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }

  async listBookings(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - req.user set by authGuard
      const userId = req.user.userId;
      const { role } = listBookingsSchema.parse(req.query);
      const bookings = await bookingsService.listBookings(userId, role);
      res.json(bookings);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        next(ApiError.badRequest(error.errors?.[0]?.message || error.issues?.[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }

  async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // @ts-ignore - req.user set by authGuard
      const requesterId = req.user.userId;
      const booking = await bookingsService.getBookingById(id, requesterId);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // @ts-ignore - req.user set by authGuard
      const requesterId = req.user.userId;
      const dto = updateStatusSchema.parse(req.body);
      const booking = await bookingsService.updateStatus(id, requesterId, dto);
      res.json(booking);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        next(ApiError.badRequest(error.errors?.[0]?.message || error.issues?.[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }

  async submitReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // @ts-ignore - req.user set by authGuard
      const requesterId = req.user.userId;
      const dto = submitReturnSchema.parse(req.body);
      const photoFile = req.file as Express.Multer.File | undefined;
      const booking = await bookingsService.submitReturn(id, requesterId, dto, photoFile);
      res.json(booking);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        next(ApiError.badRequest(error.errors?.[0]?.message || error.issues?.[0]?.message || 'Validation error'));
      } else {
        next(error);
      }
    }
  }
}

export const bookingsController = new BookingsController();
