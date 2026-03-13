"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Legg til i import:
const artworkController_1 = require("../controllers/artworkController");
const commentController_1 = require("../controllers/commentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/saved', auth_1.authenticate, artworkController_1.getSavedArtworks);
router.get("/mediums", artworkController_1.getArtworkMediums);
router.get("/", auth_1.optionalAuthenticate, artworkController_1.getArtworks);
router.get("/:id", auth_1.optionalAuthenticate, artworkController_1.getArtwork);
router.post("/", auth_1.authenticate, artworkController_1.createArtwork);
router.patch("/:id", auth_1.authenticate, artworkController_1.updateArtwork);
router.delete("/:id", auth_1.authenticate, artworkController_1.deleteArtwork);
router.post("/:id/like", auth_1.authenticate, artworkController_1.toggleLike);
router.post("/:id/save", auth_1.authenticate, artworkController_1.toggleSave);
router.get("/:id/comments", commentController_1.getComments);
router.post("/:id/comments", auth_1.authenticate, commentController_1.addComment);
router.delete("/:id/comments/:commentId", auth_1.authenticate, commentController_1.deleteComment);
exports.default = router;
//# sourceMappingURL=artworks.js.map