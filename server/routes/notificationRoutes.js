const express = require("express");
const {
  markAsRead,
  getNotifications,
  getUnreadNotifications,
  markAllAsRead,
} = require("../controllers/notificationController");
const { protectRoute } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.get("/unread", protectRoute, getUnreadNotifications);
router.put("/:id/read", protectRoute, markAsRead);
router.put("/mark-all-read", protectRoute, markAllAsRead);

module.exports = router;
