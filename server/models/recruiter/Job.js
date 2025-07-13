// models/Job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
    },
    hospitalLogo: {
      type: String,
      default: "",
    },
    HospitalName: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobCategory: {
      type: String,
    },
    location: {
      type: String,
    },
    // endDate defaults to 30 days from creation
    endDate: {
      type: Date,
      default: function () {
        // 30 days in milliseconds: 30 * 24 * 60 * 60 * 1000
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
    },
    jobStatus: {
      type: String,
      default: "Active",
    },
    openings: {
      type: String,
    },
    salaryRangeFrom: {
      type: Number,
    },
    salaryRangeTo: {
      type: Number,
    },
    employmentType: {
      type: String,
    },
    primaryUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or whichever model your "primaryUser" references
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    coworker: {
      type: String,
    },
    branch: {
      type: String,
    },
    experience: {
      type: String,
    },
    skills: [
      {
        type: String,
      },
    ],
    qualification: {
      type: String,
    },
    department: {
      type: String,
    },
    Shift: {
      type: String,
    },
    language: [
      {
        type: String,
      },
    ],
    specialization: {
      type: String,
    },
    jobDescription: {
      type: String,
    },
    status: {
      type: String,
      default: "Active",
    },
    applied: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // New field for tracking application status
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
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
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Pre-save middleware to clean language field
jobSchema.pre("save", function (next) {
  if (this.language !== undefined) {
    if (Array.isArray(this.language)) {
      this.language = this.language.filter(
        (lang) => typeof lang === "string" && lang.trim() !== ""
      );
    } else if (
      typeof this.language === "string" &&
      this.language.trim() !== ""
    ) {
      this.language = [this.language];
    } else {
      this.language = [];
    }
  }
  next();
});

// Pre-update middleware to clean language field
jobSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.language !== undefined) {
    if (Array.isArray(update.$set.language)) {
      update.$set.language = update.$set.language.filter(
        (lang) => typeof lang === "string" && lang.trim() !== ""
      );
    } else if (
      typeof update.$set.language === "string" &&
      update.$set.language.trim() !== ""
    ) {
      update.$set.language = [update.$set.language];
    } else {
      update.$set.language = [];
    }
  }
  next();
});

// Create text index for search functionality, excluding language field
jobSchema.index(
  {
    jobTitle: "text",
    jobCategory: "text",
    location: "text",
    skills: "text",
    qualification: "text",
    department: "text",
    specialization: "text",
    jobDescription: "text",
    HospitalName: "text",
  },
  {
    default_language: "english",
    language_override: "textLanguage", // Use a field that doesn't exist to avoid conflicts
  }
);

module.exports = mongoose.model("Job", jobSchema);
