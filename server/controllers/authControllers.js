const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user/User");
const { resetPasswordEmail } = require("../utils/emailHandlers");
const passport = require("../utils/passport");
const BusinessProfile = require("../models/recruiter/BusinessProfile");
// const { sendVerificationEmail } = require("../utils/emailServices");

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

    // Set cookie (same as signup/login)
    res.cookie("jwt-mesdo", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend
    res.redirect("https://mesdo.vercel.app");
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

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    // const verificationCode = generateVerificationCode();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: await generateUsername(email),
      email,
      password: hashedPassword,
      // verificationToken: verificationCode,
      // verificationTokenExpires: Date.now() + 3600000, // 1 hour
    });
    console.log("user create :", user);

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // try {
    //   const emailSent = await sendVerificationEmail(email, verificationCode);
    //   if (!emailSent) {
    //     // If email fails, delete the user and return error
    //     await User.findByIdAndDelete(newUser._id);
    //     return res
    //       .status(500)
    //       .json({ message: "Error sending verification email" });
    //   }
    // } catch (emailError) {
    //   // If email fails, delete the user and return error
    //   await User.findByIdAndDelete(newUser._id);
    //   return res
    //     .status(500)
    //     .json({ message: "Error sending verification email" });
    // }

    res.cookie("jwt-mesdo", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // sameSite: "none",
      // path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      reDirectUrl: "/",
      token: token,
    });
  } catch (error) {
    console.log("Error in signup: ", error);
    res.status(500).json({
      message: "Internal server error",
      reDirectUrl: "/",
      success: false,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    console.log(user.verificationToken, code, email);
    if (user.verificationToken !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (Date.now() > user.verificationTokenExpires) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying email", error: error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Update user with new verification code
    user.verificationToken = verificationCode;
    user.verificationTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Error sending verification email" });
    }

    res.json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500).json({
      message: "Error resending verification email",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ email: "user not found", success: false });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ password: "Invalid Password", success: false });
    }

    // Create and send token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    console.log("login token", token);

    await res.cookie("jwt-mesdo", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // sameSite: "none",
      // path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    console.log("login cookie :", req.cookies["jwt-mesdo"]);

    res.json({
      message: "Logged in successfully",
      success: true,
      reDirectUrl: "/",
      token: token,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

const logout = (req, res) => {
  res.clearCookie("jwt-mesdo", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // sameSite: "none",
    // path: "/",
  });
  res.json({
    message: "Logged out successfully",
    success: true,
    reDirectUrl: "/",
  });
};

const getCurrentUser = async (req, res) => {
  try {
    console.log("Current User: ", req.user.name);
    const businessProfile = await BusinessProfile.findOne({
      userId: req.user._id,
    });
    res.json({ user: req.user, orgInfo: businessProfile, success: true });
  } catch (error) {
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
