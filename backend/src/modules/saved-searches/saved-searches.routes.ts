import { Router } from 'express';
import { savedSearchesController } from './saved-searches.controller';
import { authGuard } from '../../common/middleware/authGuard';

const router = Router();

router.use(authGuard);

router.get('/', savedSearchesController.getSavedSearches);
router.post('/', savedSearchesController.createSavedSearch);
router.put('/:id', savedSearchesController.updateSavedSearch);
router.delete('/:id', savedSearchesController.deleteSavedSearch);

export default router;
