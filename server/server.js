require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { server, app } = require("./utils/socket");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 5020;

app.set("trust proxy", true);

//!Middilewares
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://mesdo.vercel.app",
        "https://mesdo-health-care-u5s9.vercel.app",
        "http://localhost:3000",
        "https://mesdo-healthcare-4-ui.vercel.app",
      ];

      // Check exact matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check for Vercel deployment pattern
      if (origin.match(/^https:\/\/mesdo-health-care-.*\.vercel\.app$/)) {
        return callback(null, true);
      }

      // Check for other mesdo vercel deployments
      if (origin.match(/^https:\/\/.*mesdo.*\.vercel\.app$/)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);

app.set("trust proxy", 1); // trust first proxy

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

// Initialize Passport
const passport = require("./utils/passport");
app.use(passport.initialize());

app.use(express.static(path.join(__dirname)));

const authRoutes = require("./routes/authRoutes");
const onBoardingRoutes = require("./routes/user/onBoardingRoutes");
const userRoutes = require("./routes/user/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const recuriterRoutes = require("./routes/recruiter/recuriterRoutes");
const jobsRecuriterRoutes = require("./routes/recruiter/jobsRoute");
const jobsUserRoutes = require("./routes/user/JobRoutes");
const messagesRoutes = require("./routes/user/messageRoutes");
const followRoutes = require("./routes/user/followRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const searchRoutes = require("./routes/searchRoutes");
const socketRoutes = require("./routes/socketRoutes");

//Routes
app.use("/auth", authRoutes);
app.use("/onboarding", onBoardingRoutes);
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
app.use("/recuriter", recuriterRoutes);
app.use("/jobs", jobsRecuriterRoutes);
app.use("/userSide", jobsUserRoutes);
app.use("/notifications", notificationRoutes);
app.use("/messages", messagesRoutes);
app.use("/follow", followRoutes);
app.use("/settings", settingsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/socket", socketRoutes);

app.get("/", (req, res) => {
  res.send("Hey, welcome to Mesdo");
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Page not found" });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if connection fails
  });

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
