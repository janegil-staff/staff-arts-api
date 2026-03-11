// src/routes/conversations.ts
import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUnreadCounts,
} from '../controllers/conversationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.post('/', getOrCreateConversation);
router.get('/unread', getUnreadCounts);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;