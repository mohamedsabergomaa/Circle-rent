import { Router } from 'express';
import multer from 'multer';
import { bookingsController } from './bookings.controller';
import { authGuard } from '../../common/middleware/authGuard';

const router = Router();

// Multer config for return photo uploads — memory storage, single file, 5MB max, images only
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'));
    }
  },
});

// Handle multer errors with friendly messages
const handleReturnUpload = (req: any, res: any, next: any) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// All routes are protected
router.post('/', authGuard, bookingsController.createBooking);
router.get('/', authGuard, bookingsController.listBookings);
router.get('/:id', authGuard, bookingsController.getBookingById);
router.put('/:id/status', authGuard, bookingsController.updateStatus);
router.put('/:id/return', authGuard, handleReturnUpload, bookingsController.submitReturn);

export default router;
