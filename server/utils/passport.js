const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user/User");

// Google OAuth temporarily disabled
/*
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://mesdo-lbvk.onrender.com/auth/google/callback", // Use full URL for clarity
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

        // Atomically update or create user
        const user = await User.findOneAndUpdate(
          { $or: [{ googleId }, { email }] },
          {
            $setOnInsert: {
              email,
              name: profile.displayName || email.split("@")[0],
              username: email.split("@")[0], // fallback username
              onboardingCompleted: false,
            },
            $set: { googleId }, // always set googleId
          },
          { new: true, upsert: true }
        );

        return done(null, user);
      } catch (err) {
        console.error("Error in Google strategy:", err);
        return done(err, null);
      }
    }
  )
);
*/

// No serialize/deserialize required for JWT strategy
module.exports = passport;
