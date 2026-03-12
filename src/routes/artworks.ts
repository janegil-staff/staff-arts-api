import { Router } from "express";
// Legg til i import:
import {
  getArtworks,
  getArtwork,
  getArtworkMediums, // <-- ny
  createArtwork,
  updateArtwork,
  deleteArtwork,
  toggleLike,
  toggleSave,
  getSavedArtworks
} from "../controllers/artworkController";
import {
  getComments,
  addComment,
  deleteComment,
} from "../controllers/commentController";

import { authenticate, optionalAuthenticate } from "../middleware/auth";

const router = Router();

router.get('/saved', authenticate, getSavedArtworks);
router.get("/mediums", getArtworkMediums);
router.get("/", optionalAuthenticate, getArtworks);
router.get("/:id", optionalAuthenticate, getArtwork);
router.post("/", authenticate, createArtwork);
router.patch("/:id", authenticate, updateArtwork);
router.delete("/:id", authenticate, deleteArtwork);
router.post("/:id/like", authenticate, toggleLike);
router.post("/:id/save", authenticate, toggleSave);

router.get("/:id/comments", getComments);
router.post("/:id/comments", authenticate, addComment);
router.delete("/:id/comments/:commentId", authenticate, deleteComment);

export default router;
