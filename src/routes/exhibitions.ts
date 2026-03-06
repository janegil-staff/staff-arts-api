import { Router } from 'express';
import {
  getExhibitions,
  getExhibition,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  toggleAttend,
} from '../controllers/exhibitionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getExhibitions);
router.get('/:id', getExhibition);
router.post('/', authenticate, createExhibition);
router.patch('/:id', authenticate, updateExhibition);
router.delete('/:id', authenticate, deleteExhibition);
router.post('/:id/attend', authenticate, toggleAttend);

export default router;
