const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/authMiddleware");
const {
  getUserConversations,
  createConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessagesCount,
  addParticipant,
  removeParticipant,
  getOnlineUsers,
} = require("../controllers/socketController");

// Apply authentication middleware to all routes
router.use(protectRoute);

// Conversation routes
router.get("/conversations", getUserConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:conversationId/messages", getConversationMessages);
router.post("/conversations/:conversationId/participants", addParticipant);
router.delete("/conversations/:conversationId/participants", removeParticipant);

// Message routes
router.post("/messages", sendMessage);
router.patch("/messages/read", markMessagesAsRead);
router.get("/messages/unread-count", getUnreadMessagesCount);

// User presence routes
router.get("/users/online", getOnlineUsers);

module.exports = router;
