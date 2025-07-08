const express = require('express');
const { getChatHistory, initiateChat, sendMessage, getAllConversations, createGroup, getjobsConversations } = require('../controllers/chatController');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');

router.get('/allConversations',protectRoute,getAllConversations);
router.get('/getjobsConversations',protectRoute,getjobsConversations)
router.post('/initiate', protectRoute, initiateChat);
router.post('/createGroup',protectRoute,createGroup);
router.post("/sendMessage", protectRoute,sendMessage);
router.get('/:conversationId', protectRoute, getChatHistory);

module.exports = router