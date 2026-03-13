"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', eventController_1.getEvents);
router.get('/:id', eventController_1.getEvent);
router.post('/', auth_1.authenticate, eventController_1.createEvent);
router.patch('/:id', auth_1.authenticate, eventController_1.updateEvent);
router.delete('/:id', auth_1.authenticate, eventController_1.deleteEvent);
router.post('/:id/rsvp', auth_1.authenticate, eventController_1.toggleRsvp);
exports.default = router;
//# sourceMappingURL=events.js.map