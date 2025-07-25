const express = require('express');
const { getChatHistory, initiateChat, sendMessage, getAllConversations, createGroup, getjobsConversations, clearMessages, deleteConversation, deleteMessage, editMessage } = require('../controllers/chatController');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');

router.get('/allConversations',protectRoute,getAllConversations);
router.get('/getjobsConversations',protectRoute,getjobsConversations)
router.post('/initiate', protectRoute, initiateChat);
router.post('/createGroup',protectRoute,createGroup);
router.post("/sendMessage", protectRoute,sendMessage);
router.get('/:conversationId', protectRoute, getChatHistory);
router.delete('/clear/:conversationId', protectRoute, clearMessages);
router.delete('/messages/:messageId', protectRoute, deleteMessage);
router.put('/messages/:messageId', protectRoute, editMessage);
router.delete('/:conversationId', protectRoute, deleteConversation);

module.exports = router