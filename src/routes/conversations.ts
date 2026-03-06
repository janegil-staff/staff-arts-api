import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from '../controllers/conversationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // all conversation routes require auth

router.get('/', getConversations);
router.post('/', getOrCreateConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;
