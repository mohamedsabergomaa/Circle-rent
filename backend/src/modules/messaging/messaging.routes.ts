import { Router } from 'express';
import { messagingController } from './messaging.controller';
import { authGuard } from '../../common/middleware/authGuard';

const router = Router();

router.use(authGuard);

router.get('/', messagingController.getConversations);
router.post('/', messagingController.createConversation);
router.get('/:conversationId/messages', messagingController.getMessages);
router.post('/:conversationId/messages', messagingController.sendMessage);
router.put('/:conversationId/read', messagingController.markAsRead);

export default router;
