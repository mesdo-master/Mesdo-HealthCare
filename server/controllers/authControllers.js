const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user/User");
const {
  resetPasswordEmail,
  sendVerificationEmail,
  generateVerificationCode,
} = require("../utils/emailHandlers");
const passport = require("../utils/passport");
const BusinessProfile = require("../models/recruiter/BusinessProfile");

const googleAuth = (req, res) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
};

// Google Auth Callback
const googleAuthCallback = async (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ message: "Google authentication failed", success: false });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Set multiple cookie variations for better browser compatibility
    res.cookie("jwt-mesdo", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("jwt-mesdo-fallback", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("jwt-mesdo-legacy", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with token in URL as additional fallback
    res.redirect(`https://mesdo-health-care-u5s9.vercel.app?token=${token}`);
  })(req, res, next);
};

const generateUsername = async (email) => {
  const { nanoid } = await import("nanoid");

  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();
  let username = `${base}-${nanoid(5)}`;

  while (await User.findOne({ username })) {
    username = `${base}-${nanoid(5)}`;
  }

  return username;
};

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: false,
      });
    }

    const verificationCode = generateVerificationCode();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: await generateUsername(email),
      email,
      password: hashedPassword,
      verificationToken: verificationCode,
      verificationTokenExpires: Date.now() + 3600000, // 1 hour
      isVerified: false, // Explicitly set to false for new users
    });
    console.log("user create :", user);

    await user.save();

    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent.success) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return res
        .status(500)
        .json({ message: "Error sending verification email" });
    }

    res.status(201).json({
      message:
        "Registration successful. Please check your email for verification code.",
      success: true,
      email: email,
      requiresVerification: true,
    });
  } catch (error) {
    console.log("Error in signup: ", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        message: "Email and verification code are required",
        success: false,
      });
    }

    const user = await User.findOne({
      email,
      verificationToken: verificationCode,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification code",
        success: false,
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Create and send token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Set multiple cookie variations for better browser compatibility
    res.cookie("jwt-mesdo", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("jwt-mesdo-fallback", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("jwt-mesdo-legacy", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Email verified successfully. You are now logged in.",
      success: true,
      user: user,
      token: token, // Include token in response for frontend storage
    });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already verified", success: false });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Update user with new verification code
    user.verificationToken = verificationCode;
    user.verificationTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent.success) {
      return res
        .status(500)
        .json({ message: "Error sending verification email", success: false });
    }

    res.json({ message: "Verification email sent", success: true });
  } catch (error) {
    res.status(500).json({
      message: "Error resending verification email",
      error: error.message,
      success: false,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=== LOGIN ATTEMPT START ===");
    console.log("Login email:", email);
    console.log("Request origin:", req.headers.origin);
    console.log("Request referer:", req.headers.referer);
    console.log("User-Agent:", req.headers["user-agent"]);
    console.log("Existing cookies:", req.cookies);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("ERROR: User not found for email:", email);
      return res.status(400).json({ email: "user not found", success: false });
    }

    console.log("User found - ID:", user._id);
    console.log("User found - Email:", user.email);
    console.log("User found - Name:", user.name);
    console.log("User found - Username:", user.username);

    // Check password first
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("ERROR: Password mismatch for user:", user.email);
      return res
        .status(400)
        .json({ password: "Invalid Password", success: false });
    }

    console.log("Password verified successfully");

    // For existing users (those who don't have verificationToken field or have null verificationToken),
    // automatically verify them and allow login
    if (!user.verificationToken && !user.isVerified) {
      console.log("Auto-verifying existing user");
      user.isVerified = true;
      await user.save();
    }

    // Only require verification for users who have a verificationToken (new signups)
    if (user.verificationToken && !user.isVerified) {
      console.log("User requires email verification");
      return res.status(400).json({
        message: "Please verify your email before logging in",
        success: false,
        requiresVerification: true,
        email: email,
      });
    }

    // Create and send token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    console.log("JWT token created for user:", user._id);
    console.log("Token length:", token.length);

    // Set multiple cookie variations for better browser compatibility
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    };

    console.log("Setting cookie with options:", cookieOptions);

    // Set primary cookie
    res.cookie("jwt-mesdo", token, cookieOptions);

    // Set fallback cookie for browsers that don't support sameSite: "none"
    res.cookie("jwt-mesdo-fallback", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax", // More permissive for some browsers
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Set another fallback without sameSite for older browsers
    res.cookie("jwt-mesdo-legacy", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log("All cookies set successfully");

    const businessProfile = await BusinessProfile.findOne({
      userId: user._id,
    });

    console.log("Business profile found:", businessProfile ? "Yes" : "No");

    const responseData = {
      message: "Logged in successfully",
      success: true,
      reDirectUrl: "/",
      token: token, // Include token in response for frontend storage
      user: user,
      orgInfo: businessProfile,
    };

    console.log("Sending response with user ID:", user._id);
    console.log("Token included in response:", !!responseData.token);
    console.log("=== LOGIN ATTEMPT SUCCESS ===");

    res.json(responseData);
  } catch (error) {
    console.log("=== LOGIN ATTEMPT ERROR ===");
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

const logout = (req, res) => {
  // Clear all cookie variations
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  res.clearCookie("jwt-mesdo", cookieOptions);
  res.clearCookie("jwt-mesdo-fallback", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  res.clearCookie("jwt-mesdo-legacy", {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  console.log("All authentication cookies cleared");

  res.json({
    message: "Logged out successfully",
    success: true,
    reDirectUrl: "/",
  });
};

const getCurrentUser = async (req, res) => {
  try {
    console.log("=== GET CURRENT USER START ===");
    console.log("Request URL:", req.originalUrl);
    console.log("Request origin:", req.headers.origin);
    console.log("User from middleware - ID:", req.user._id);
    console.log("User from middleware - Email:", req.user.email);
    console.log("User from middleware - Name:", req.user.name);
    console.log("User from middleware - Username:", req.user.username);
    console.log("User onboarding status:", req.user.onboardingCompleted);
    console.log(
      "User recruiter onboarding status:",
      req.user.recruiterOnboardingCompleted
    );

    // Auto-migrate existing users: if onboardingCompleted is undefined, set it to true
    if (
      req.user.onboardingCompleted === undefined ||
      req.user.onboardingCompleted === null
    ) {
      console.log("Auto-migrating user onboarding status");
      await User.findByIdAndUpdate(req.user._id, {
        onboardingCompleted: true,
        recruiterOnboardingCompleted: true,
      });
      req.user.onboardingCompleted = true;
      req.user.recruiterOnboardingCompleted = true;
    }

    const businessProfile = await BusinessProfile.findOne({
      userId: req.user._id,
    });

    console.log("Business profile found:", businessProfile ? "Yes" : "No");
    if (businessProfile) {
      console.log("Business profile org name:", businessProfile.orgName);
    }

    const responseData = {
      user: req.user,
      orgInfo: businessProfile,
      success: true,
    };
    console.log("Sending user data - ID:", req.user._id);
    console.log("=== GET CURRENT USER SUCCESS ===");

    res.json(responseData);
  } catch (error) {
    console.log("=== GET CURRENT USER ERROR ===");
    console.error("Error in getCurrentUser controller:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (user) {
      console.log(user);
      resetPasswordEmail(user);

      return res.json({
        success: true,
        message: "Password reset link sent to your indox",
      });
    } else {
      return res
        .status(404)
        .json({ error: "Email not found. Please check and try again." });
    }
  } catch (error) {
    console.error("Error checking user existence:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const resetPasswordFunc = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    console.log(token, " ", password);

    // Find the user with the matching reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token hasn't expired
    });
    console.log("resetpasswordexpires :", Date.now());
    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired.",
        success: false,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and clear the reset token and expiry time
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: "Your password has been updated successfully!",
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resetting password", success: false });
  }
};

module.exports = {
  resendVerification,
  verifyEmail,
  signup,
  login,
  logout,
  getCurrentUser,
  forgetPassword,
  resetPasswordFunc,
  googleAuth,
  googleAuthCallback,
};
