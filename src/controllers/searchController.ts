import { Response } from 'express';
import Artwork from '../models/Artwork';
import User from '../models/User';
import { AuthRequest } from '../types';

export const search = async (req: AuthRequest, res: Response): Promise<void> => {
  const { q, type = 'all' } = req.query as { q?: string; type?: string };

  if (!q || q.trim().length < 2) {
    res.status(400).json({ success: false, error: 'Query must be at least 2 characters' });
    return;
  }

  const results: Record<string, unknown[]> = {};

  if (type === 'all' || type === 'artworks') {
    results.artworks = await Artwork.find(
      { $text: { $search: q }, status: 'published' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .populate('artist', 'name avatar slug');
  }

  if (type === 'all' || type === 'users') {
    results.users = await User.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);
  }

  res.json({ success: true, data: results });
};
