"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", userController_1.getUsers);
router.get("/username/:username", auth_1.optionalAuthenticate, userController_1.getUserByUsername);
router.get("/:id", auth_1.optionalAuthenticate, userController_1.getUserById);
router.patch("/:id", auth_1.authenticate, userController_1.updateUser);
router.post("/:id/follow", auth_1.authenticate, userController_1.toggleFollow);
router.get("/:id/artworks", auth_1.optionalAuthenticate, userController_1.getUserArtworks);
router.delete("/:id", auth_1.authenticate, userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.js.map