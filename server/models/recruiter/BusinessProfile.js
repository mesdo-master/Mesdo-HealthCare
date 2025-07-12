const mongoose = require("mongoose");

const businessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    about: {
      type: String,
    },
    name: {
      type: String,
    },
    website: {
      type: String,
    },
    industry: {
      type: String,
    },
    organizationSize: {
      type: String,
    },
    organizationType: {
      type: String,
    },
    orgLogo: {
      type: String,
    },
    orgBanner: {
      type: String,
    },
    tagline: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    overview: {
      type: String,
    },
    locationName: {
      type: String,
    },
    locationAddress: {
      type: String,
    },
    founded: {
      type: String,
    },
    socials: {
      type: String,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  { timestamps: true }
);

businessProfileSchema.index({
  name: "text",
  about: "text",
  industry: "text",
  overview: "text",
  tagline: "text",
  locationName: "text",
  locationAddress: "text",
});

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);
