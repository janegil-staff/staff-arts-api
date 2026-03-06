import { Router } from 'express';
import {
  getTracks,
  getTrack,
  createTrack,
  updateTrack,
  deleteTrack,
} from '../controllers/trackController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getTracks);
router.get('/:id', getTrack);
router.post('/', authenticate, createTrack);
router.patch('/:id', authenticate, updateTrack);
router.delete('/:id', authenticate, deleteTrack);

export default router;
