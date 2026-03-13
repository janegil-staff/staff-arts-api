"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trackController_1 = require("../controllers/trackController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', trackController_1.getTracks);
router.get('/:id', trackController_1.getTrack);
router.post('/', auth_1.authenticate, trackController_1.createTrack);
router.patch('/:id', auth_1.authenticate, trackController_1.updateTrack);
router.delete('/:id', auth_1.authenticate, trackController_1.deleteTrack);
exports.default = router;
//# sourceMappingURL=tracks.js.map