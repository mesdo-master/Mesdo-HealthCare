const express = require('express');
const { markAsRead, getNotifications, getUnreadNotifications } = require('../controllers/notificationController');
const { protectRoute } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/',protectRoute, getNotifications);
router.get('/unread',protectRoute, getUnreadNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;