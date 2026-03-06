import { Router } from 'express';
import {
  getUsers,
  getUserByUsername,
  getUserById,
  updateUser,
  toggleFollow,
  getUserArtworks,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getUsers);
router.get('/username/:username', getUserByUsername);
router.get('/:id', getUserById);
router.patch('/:id', authenticate, updateUser);
router.post('/:id/follow', authenticate, toggleFollow);
router.get('/:id/artworks', getUserArtworks);

export default router;
