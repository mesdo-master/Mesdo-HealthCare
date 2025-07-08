const express = require('express');
// const Message = require('../../models/user/Message');
const User = require('../../models/user/User');
const { protectRoute } = require('../../middleware/authMiddleware');
const { getAllConversations } = require('../../controllers/user/messageController');
const router = express.Router();

router.get('/',protectRoute,getAllConversations)

module.exports = router;