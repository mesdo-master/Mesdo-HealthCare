const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    pronouns: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNo: {
      type: String,
    },
    gender: {
      type: String,
    },
    password: {
      type: String,
      required: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    profilePictureId: {
      type: String,
      default: "",
    },
    Banner: {
      type: String,
      default: "",
    },
    BannerId: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "Student",
    },
    about: {
      type: String,
      default: "",
    },
    location: {
      city: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      country: {
        type: String,
        default: "",
      },
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: [
      {
        title: {
          type: String,
        },
        institution: {
          type: String, // Changed from 'company' to 'institution'
        },
        type: {
          type: String, // Added to store employment type (e.g., "Full-Time")
          enum: [
            "fullTime",
            "partTime",
            "contract",
            "internship",
            "volunteer",
            // Legacy format support for existing users
            "Full-Time",
            "Part-Time",
            "Contract",
            "Internship",
            "Volunteer",
            "",
          ], // Updated to support both old and new format values
          default: "",
        },
        location: {
          type: String,
        },
        startDate: {
          type: String,
        },
        currentlyWorking: {
          type: Boolean, // Changed from 'current' to match frontend
          default: false,
        },
        endDate: {
          type: String,
          default: null,
        },
        description: {
          type: String,
          default: "",
        },
        tags: {
          type: [String], // Added to support tags
          default: [],
        },
      },
    ],
    certifications: [
      {
        image: {
          type: String,
        },
        name: {
          type: String,
        },
        issuedBy: {
          type: String,
        },
        year: {
          type: String,
        },
      },
    ],
    publications: [
      {
        title: {
          type: String,
        },
        issuer: {
          type: String,
        },
        date: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
    education: [
      {
        qualification: { type: String }, // Changed from 'degree'
        course: { type: String }, // New field for course
        specialization: { type: String }, // Changed from 'fieldOfStudy'
        university: { type: String }, // Changed from 'schoolName'
        passingYear: { type: String }, // Changed from 'endDate' (no startDate needed)
        description: { type: String, default: "" },
        skills: { type: [String], default: [] }, // Added for multiple skills
      },
    ],
    achievements: [
      {
        title: {
          type: String,
        },
        issuer: {
          type: String,
        },
        date: {
          type: String,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],
    interests: {
      type: [String],
      default: [],
    },
    connections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    pendingRequests: {
      // the requests that were sent to this user and are pending
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    sentRequests: {
      // the requests that were sent by this user and are pending
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    appliedJobs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Job",
      default: [],
    },
    // New field for tracking application status from user's perspective
    jobApplications: [
      {
        job: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
          required: true,
        },
        status: {
          type: String,
          enum: [
            "Applied",
            "Under Review",
            "Interview",
            "Accepted",
            "Rejected",
          ],
          default: "Applied",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        statusUpdatedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: "",
        },
      },
    ],
    savedJobs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Job",
      default: [],
    },
    hiddenJobs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Job",
      default: [],
    },
    dob: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "recruiter", "admin"],
      default: "user",
    },
    resume: {
      type: String,
      default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    recruiterOnboardingCompleted: {
      type: Boolean,
      default: false,
    },
    followedOrganizations: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "BusinessProfile",
      default: [],
    },
    appearance: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
    },

    preferences: {
      language: {
        type: String,
        enum: ["English", "Spanish", "French", "German", "Chinese"], // Available languages
        default: "English",
      },
      profilePhotos: {
        type: String,
        enum: ["All members", "Connections only", "No one"], // Who can see profile photos
        default: "All members",
      },
      feedView: {
        type: String,
        enum: [
          "Most relevant posts",
          "Most recent posts",
          "Trending posts",
          "Posts from connections only",
        ], // Feed display preference
        default: "Most relevant posts",
      },
      unfollowedPeople: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    notificationSettings: {
      quietHours: {
        type: Boolean,
        default: false, // Whether quiet hours are enabled
      },
      fromTime: {
        type: String,
        default: "23:00", // Start time for quiet hours
      },
      toTime: {
        type: String,
        default: "07:00", // End time for quiet hours
      },
      weekendOnly: {
        type: Boolean,
        default: false, // Whether quiet hours apply only on weekends
      },
      notifications: {
        groupNotifications: {
          type: Boolean,
          default: true, // Notifications for group activities
        },
        emailNotifications: {
          type: Boolean,
          default: true, // Email notifications
        },
        soundNotifications: {
          type: Boolean,
          default: true, // Sound notifications
        },
        jobPostNotifications: {
          type: Boolean,
          default: true, // Notifications for job posts
        },
        pageNotifications: {
          type: Boolean,
          default: true, // Notifications for page updates
        },
      },
    },
    privacySettings: {
      invitesConnect: {
        type: String,
        enum: ["Everyone on Mesdo", "Only people in my network", "No one"], // Who can send connection invites
        default: "Everyone on Mesdo",
      },
      invitesFromNetwork: {
        type: String,
        enum: [
          "Allow Page invitations",
          "Allow Group invitations",
          "Allow Event invitations",
          "Do not allow any invitations",
        ], // Whether to allow invites from network
        default: "Allow Page invitations",
      },
      messages: {
        type: String,
        enum: ["Allow Message Requests", "Only from connections", "No one"], // Who can send messages
        default: "Allow Message Requests",
      },
      shareProfile: {
        type: Boolean,
        default: true,
      },
      signalInterest: {
        type: Boolean,
        default: true,
      },
      focusedInbox: {
        type: Boolean,
        default: true,
      },
      readReceipts: {
        type: Boolean,
        default: true,
      },
      harmfulDetection: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

userSchema.index({
  name: "text",
  username: "text",
  headline: "text",
  about: "text",
  skills: "text",
  "location.city": "text",
  "location.state": "text",
  "location.country": "text",
});

const User = mongoose.model("User", userSchema);

module.exports = User;
