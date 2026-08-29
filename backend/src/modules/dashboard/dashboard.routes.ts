import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authGuard } from '../../common/middleware/authGuard';

const router = Router();

router.get('/owner/summary', authGuard, dashboardController.getOwnerSummary);
router.get('/renter/summary', authGuard, dashboardController.getRenterSummary);

export default router;
