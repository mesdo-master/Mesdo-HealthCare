const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user/User");

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://mesdo-healthcare-1.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Ensure email exists
        if (!profile.emails || profile.emails.length === 0) {
          console.error("No email found in Google profile:", profile);
          return done(new Error("Email not available from Google"), null);
        }

        const email = profile.emails[0].value;
        const googleId = profile.id;

        // Check if user exists with this email or googleId
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
          // Update existing user with googleId if not set
          if (!user.googleId) {
            user.googleId = googleId;
            user.provider = "google";
            await user.save();
          }
        } else {
          // Create new user
          const username = await generateUsername(email);
          user = new User({
            email,
            name: profile.displayName || email.split("@")[0],
            username,
            googleId,
            provider: "google",
            isVerified: true, // Google accounts are pre-verified
            onboardingCompleted: false,
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        console.error("Error in Google strategy:", err);
        return done(err, null);
      }
    }
  )
);

// Helper function to generate unique username
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

module.exports = passport;
