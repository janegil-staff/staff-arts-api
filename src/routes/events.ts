import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleRsvp,
} from '../controllers/eventController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', authenticate, createEvent);
router.patch('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);
router.post('/:id/rsvp', authenticate, toggleRsvp);

export default router;
