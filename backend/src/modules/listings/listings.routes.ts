import { Router } from 'express';
import multer from 'multer';
import { listingsController } from './listings.controller';
import { reviewsController } from '../reviews/reviews.controller';
import { authGuard } from '../../common/middleware/authGuard';
import { optionalAuth } from '../../common/middleware/optionalAuth';

const router = Router();

// Multer config — memory storage, max 8 photos, 5MB each, images only
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'));
    }
  },
});

const uploadPhotos = upload.array('photos', 8);

// Handle multer errors with friendly messages
const handleUploadError = (req: any, res: any, next: any) => {
  uploadPhotos(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB per photo.' });
      }
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. Maximum 8 photos allowed.' });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Public routes (optionalAuth so owner can view own drafts, mine=true can detect auth)
router.get('/', optionalAuth, listingsController.getListings);
router.get('/:id', optionalAuth, listingsController.getListingById);
router.get('/:id/reviews', listingsController.getListingReviews);
router.get('/:id/availability', listingsController.getListingAvailability);

// Protected routes
router.post('/', authGuard, handleUploadError, listingsController.createListing);
router.put('/:id', authGuard, handleUploadError, listingsController.updateListing);
router.delete('/:id', authGuard, listingsController.deleteListing);
router.post('/:id/reviews', authGuard, reviewsController.createReview);

export default router;
