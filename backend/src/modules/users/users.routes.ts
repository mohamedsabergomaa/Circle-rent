import { Router } from 'express';
import multer from 'multer';
import { usersController } from './users.controller';
import { authGuard } from '../../common/middleware/authGuard';

const router = Router();

// Multer config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

const uploadFields = upload.fields([
  { name: 'identityCard', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

// Handle multer errors
const handleUploadError = (req: any, res: any, next: any) => {
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.get('/:id', usersController.getPublicProfile);
router.put('/me', authGuard, usersController.updateProfile);
router.post('/me/verification', authGuard, handleUploadError, usersController.submitVerification);

export default router;
