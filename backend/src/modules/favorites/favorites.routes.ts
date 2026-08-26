import { Router } from 'express';
import { favoritesController } from './favorites.controller';
import { authGuard } from '../../common/middleware/authGuard';

const router = Router();

router.use(authGuard);

router.get('/', favoritesController.getFavorites);
router.post('/', favoritesController.addFavorite);
router.delete('/:id', favoritesController.removeFavorite);
router.get('/:id/check', favoritesController.checkFavorite);

export default router;
