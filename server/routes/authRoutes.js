const express = require('express');
const { protectRoute } = require('../middleware/authMiddleware');
const { signup, login, logout, getCurrentUser, forgetPassword, resetPasswordFunc, googleAuth, googleAuthCallback } = require('../controllers/authControllers');
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute ,getCurrentUser);
router.post("/forget-password",forgetPassword);
router.post("/reset-password/:token",resetPasswordFunc);
router.get("/auth/google", googleAuth);
router.get("/auth/google/callback", googleAuthCallback);



module.exports = router;