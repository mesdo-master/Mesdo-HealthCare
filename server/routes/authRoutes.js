const express = require("express");
const { protectRoute } = require("../middleware/authMiddleware");
const {
  signup,
  login,
  logout,
  getCurrentUser,
  forgetPassword,
  resetPasswordFunc,
  googleAuth,
  googleAuthCallback,
  verifyEmail,
  resendVerification,
} = require("../controllers/authControllers");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/current-user", protectRoute, getCurrentUser);
router.get("/me", protectRoute, getCurrentUser); // Add this route to match frontend calls
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPasswordFunc);
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

module.exports = router;
