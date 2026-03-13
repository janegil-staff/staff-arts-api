"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exhibitionController_1 = require("../controllers/exhibitionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', exhibitionController_1.getExhibitions);
router.get('/:id', exhibitionController_1.getExhibition);
router.post('/', auth_1.authenticate, exhibitionController_1.createExhibition);
router.patch('/:id', auth_1.authenticate, exhibitionController_1.updateExhibition);
router.delete('/:id', auth_1.authenticate, exhibitionController_1.deleteExhibition);
router.post('/:id/attend', auth_1.authenticate, exhibitionController_1.toggleAttend);
exports.default = router;
//# sourceMappingURL=exhibitions.js.map