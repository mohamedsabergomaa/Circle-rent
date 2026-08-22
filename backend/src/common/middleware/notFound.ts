import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(ApiError.notFound('Not found'));
};
