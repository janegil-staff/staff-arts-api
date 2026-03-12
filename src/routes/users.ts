import { Router } from 'express';
import {
  getUsers,
  getUserByUsername,
  getUserById,
  updateUser,
  toggleFollow,
  getUserArtworks,
} from '../controllers/userController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', getUsers);
router.get('/username/:username', optionalAuthenticate, getUserByUsername);
router.get('/:id', optionalAuthenticate, getUserById);
router.patch('/:id', authenticate, updateUser);
router.post('/:id/follow', authenticate, toggleFollow);
router.get('/:id/artworks', optionalAuthenticate, getUserArtworks);

export default router;
