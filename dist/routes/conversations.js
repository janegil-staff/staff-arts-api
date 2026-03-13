"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/conversations.ts
const express_1 = require("express");
const conversationController_1 = require("../controllers/conversationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', conversationController_1.getConversations);
router.post('/', conversationController_1.getOrCreateConversation);
router.get('/unread', conversationController_1.getUnreadCounts);
router.get('/:id/messages', conversationController_1.getMessages);
router.post('/:id/messages', conversationController_1.sendMessage);
exports.default = router;
//# sourceMappingURL=conversations.js.map