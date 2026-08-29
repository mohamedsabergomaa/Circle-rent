import { Router } from 'express';
import { adminController } from './admin.controller';
import { authGuard } from '../../common/middleware/authGuard';
import { adminGuard } from '../../common/middleware/adminGuard';

const router = Router();

// All admin routes require authentication + admin privileges
router.get('/listings/pending', authGuard, adminGuard, adminController.getPendingListings);
router.put('/listings/:id/approve', authGuard, adminGuard, adminController.approveListing);
router.put('/listings/:id/reject', authGuard, adminGuard, adminController.rejectListing);

export default router;
