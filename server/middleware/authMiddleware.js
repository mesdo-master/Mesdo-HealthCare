const jwt = require("jsonwebtoken");
const User = require("../models/user/User");

const protectRoute = async (req, res, next) => {
  try {
    console.log("=== AUTH MIDDLEWARE START ===");
    console.log("Request URL:", req.originalUrl);
    console.log("Request method:", req.method);
    console.log("All cookies:", req.cookies);
    console.log("Authorization header:", req.headers.authorization);
    console.log("User-Agent:", req.headers["user-agent"]);
    console.log("Origin:", req.headers.origin);
    console.log("Referer:", req.headers.referer);

    // Get token from multiple sources (in order of preference)
    const tokenFromCookie = req.cookies["jwt-mesdo"];
    const tokenFromFallback = req.cookies["jwt-mesdo-fallback"];
    const tokenFromLegacy = req.cookies["jwt-mesdo-legacy"];
    const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    console.log("Token from primary cookie:", tokenFromCookie);
    console.log("Token from fallback cookie:", tokenFromFallback);
    console.log("Token from legacy cookie:", tokenFromLegacy);
    console.log("Token from header:", tokenFromHeader);

    // Use the first available token
    const token =
      tokenFromCookie ||
      tokenFromFallback ||
      tokenFromLegacy ||
      tokenFromHeader;

    if (!token) {
      console.log("ERROR: No token found in any source");
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided", success: false });
    }

    console.log("Token found, verifying...");
    console.log(
      "Token source:",
      tokenFromCookie
        ? "primary-cookie"
        : tokenFromFallback
        ? "fallback-cookie"
        : tokenFromLegacy
        ? "legacy-cookie"
        : "header"
    );

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      console.log("ERROR: Token verification failed");
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid Token", success: false });
    }

    console.log("Token verified, decoded:", decoded);
    console.log("User ID from token:", decoded.userId);

    // Find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("ERROR: User not found for ID:", decoded.userId);
      return res
        .status(401)
        .json({ message: "User not found", success: false });
    }

    console.log("User found - ID:", user._id);
    console.log("User found - Email:", user.email);
    console.log("User found - Name:", user.name);
    console.log("User found - Username:", user.username);
    req.user = user;
    console.log("=== AUTH MIDDLEWARE SUCCESS ===");
    next();
  } catch (error) {
    console.log("=== AUTH MIDDLEWARE ERROR ===");
    console.error("Error in protectRoute middleware:", error.message);
    console.error("Error name:", error.name);
    console.error("Error stack:", error.stack);

    if (error.name === "TokenExpiredError") {
      console.log("Token expired error");
      return res.status(401).json({ message: "Token expired", success: false });
    } else if (error.name === "JsonWebTokenError") {
      console.log("Invalid token error");
      return res.status(401).json({ message: "Invalid token", success: false });
    } else {
      console.log("Other auth error");
      return res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  }
};

module.exports = { protectRoute };
