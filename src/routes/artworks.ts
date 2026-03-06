import { Router } from 'express';
import {
  getArtworks,
  getArtwork,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  toggleLike,
  toggleSave,
} from '../controllers/artworkController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getArtworks);
router.get('/:id', getArtwork);
router.post('/', authenticate, createArtwork);
router.patch('/:id', authenticate, updateArtwork);
router.delete('/:id', authenticate, deleteArtwork);
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/save', authenticate, toggleSave);

export default router;
