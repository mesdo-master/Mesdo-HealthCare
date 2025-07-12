const User = require("../../models/user/User");
const axios = require("axios");
const Business = require("../../models/recruiter/BusinessProfile");
const Tesseract = require("tesseract.js");
const { State, City } = require("country-state-city");
const fs = require("fs");
const pdf = require("pdf-parse");
const docxParser = require("docx-parser");
const path = require("path");
const { fromBuffer } = require("pdf2pic");
const { writeFile } = require("fs").promises;
const cloudinary = require("../../config/cloudinary");

const generateUsername = async (fullName) => {
  // Convert full name to a base username
  let baseUsername = fullName
    .toLowerCase()
    .replace(/\s+/g, "") // Remove all spaces
    .replace(/[^a-z0-9]/g, ""); // Remove special characters

  let username = baseUsername;

  let isUnique = false;
  let counter = 1000;

  if (
    !(await User.findOne({
      username,
    }))
  ) {
    isUnique = true;
  }

  // Check uniqueness and append number if needed
  while (!isUnique) {
    const existingUser = await User.findOne({
      username,
    });
    if (!existingUser) {
      isUnique = true;
    } else {
      username = `${baseUsername}${counter}`;
      counter++;
    }
  }

  return username;
};

const getPredata = async (req, res) => {
  try {
    const userFound = await User.findOne({
      _id: req.user._id,
    });
    res.json({
      message: "predata fetched successfully",
      success: true,
      user: userFound,
    });
  } catch (error) {
    console.error("Error in fetching predata:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

const completeOnboarding = async (req, res) => {
  try {
    // Find the user by their ID from the authenticated request
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Extract formData from the request body
    const formData = req.body;

    // Update basic profile fields
    user.name = formData.name;
    user.email = formData.email;
    user.phoneNo = formData.phoneNo;
    user.gender = formData.gender;
    user.location.city = formData.city;
    user.location.state = formData.state;
    user.headline = formData.tagline;
    user.about = formData.aboutYou;
    user.dob = formData.dob ? new Date(formData.dob) : null;

    // Update education array (qualifications)
    user.education = formData.qualifications.map((qual) => ({
      schoolName: qual.university,
      degree: qual.course,
      fieldOfStudy: qual.specialization,
      endDate: qual.passingYear ? new Date(`${qual.passingYear}-01-01`) : null,
      description: qual.description,
    }));

    // Update experience array (workExperience)
    user.experience = formData.workExperience.map((exp) => ({
      title: exp.jobTitle,
      company: exp.hospital,
      location: exp.location,
      startDate: exp.startDate,
      current: exp.currentlyWorking,
      endDate: exp.currentlyWorking ? null : exp.endDate,
      description: exp.description,
    }));

    // Update skills
    user.skills = formData.Skills;

    // Update achievements
    user.achievements = formData.Achievements.map((ach) => ({
      award: ach.award,
      issuer: ach.issuer,
      year: ach.year,
      description: ach.description,
    }));

    // Update interests
    user.interests = formData.interest;

    // Mark onboarding as completed
    user.onboardingCompleted = true;

    user.username = await generateUsername(formData.name);

    // Save the updated user document to the database
    await user.save();

    // Send success response with the updated user data
    res.json({
      message: "Onboarding completed",
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phoneNo: user.phoneNo,
        gender: user.gender,
        location: user.location,
        headline: user.headline,
        about: user.about,
        dob: user.dob,
        education: user.education,
        experience: user.experience,
        skills: user.skills,
        achievements: user.achievements,
        interests: user.interests,
        onboardingCompleted: user.onboardingCompleted,
        recruiterOnboardingCompleted: user.recruiterOnboardingCompleted,
        profilePicture: user.profilePicture,
        role: user.role,
        resume: user.resume,
      },
    });
  } catch (error) {
    console.error("Error in completeOnboarding:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// — Utility: extract text from PDF buffer
async function extractPdf(buffer) {
  const data = await pdf(buffer); // :contentReference[oaicite:1]{index=1}
  return data.text;
}

// — Utility: extract text from DOCX file on disk
function extractDocx(path) {
  return new Promise((resolve, reject) => {
    docxParser.parseDocx(path, (text) => resolve(text)); // :contentReference[oaicite:2]{index=2}
  });
}

const resumeExtraction = async (req, res) => {
  if (!req.file)
    return res.status(400).json({
      error: "No file uploaded",
    });

  let rawText;
  try {
    const { path, mimetype } = req.file;
    const buffer = await fs.promises.readFile(path);

    if (mimetype === "application/pdf") {
      rawText = await extractPdf(buffer);
    } else if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      rawText = await extractDocx(path);
    } else {
      return res.status(400).json({
        error: "Unsupported file type",
      });
    }
    await fs.promises.unlink(path);
  } catch (error) {
    return res.status(500).json({
      error: "Text extraction failed",
      details: err,
    });
  }

  const prompt = ` You are a resume parsing assistant. Extract structured data from resumes into JSON format:
{ "name": "", "email": "", "phoneNo": "", "gender": "", "dob": "", "state": "", "city": "", "tagline": "", "aboutYou": "", "qualifications": [ { "qualification": "", "course": "", "specialization": "", "university": "", "passingYear": "", "description": "", "skills": [] } ], "workexperience": [ { "title": "", "institution": "", "type": "", "location": "", "startDate": "", "currentlyWorking": false, "endDate": "", "description": "", "tags": [] } ], "Skills": [], "achievements": [ { "award": "", "issuer": "", "year": "", "description": "" } ], "interests": [] }
Rules:Output JSON only, no extra text.

Resume: """ ${rawText} """ `;

  const response = await axios.post(
    `${process.env.LANGDB_BASE_URL}/v1/chat/completions`,
    {
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LANGDB_API_KEY}`,
      },
    }
  );

  const structuredData = JSON.parse(response.data.choices[0].message.content);
  return res.status(200).json({
    success: true,
    data: structuredData,
  });
};

const completeRecruiterOnboarding = async (req, res) => {
  try {
    // Find the user by their ID from the authenticated request
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Extract formData from the request body
    const formData = req.body;

    // Find the business profile associated with the user
    const businessProfile = await Business.findOne({
      userId: req.user._id,
    });
    if (!businessProfile) {
      return res.status(404).json({
        message: "Business profile not found",
        success: false,
      });
    }

    // Helper function to conditionally update fields
    const updateIfValid = (field, value) => {
      if (value !== undefined && value !== null && value !== "") {
        businessProfile[field] = value;
      }
    };

    // Conditionally update business profile fields
    updateIfValid("name", formData.name);
    updateIfValid("orgLogo", formData.orgLogo);
    updateIfValid("tagline", formData.tagline);
    updateIfValid("phoneNo", formData.phoneNo);
    updateIfValid("overview", formData.overview);
    updateIfValid("locationName", formData.locationName);
    updateIfValid("locationAddress", formData.locationAddress);
    updateIfValid("website", formData.website);
    updateIfValid("industry", formData.industry);
    updateIfValid("organizationSize", formData.organizationSize);
    updateIfValid("organizationType", formData.organizationType);

    // Save the updated business profile
    await businessProfile.save();

    // Mark recruiter onboarding as completed in the user document
    user.recruiterOnboardingCompleted = true;
    await user.save();

    // Send success response with updated user data and business profile
    res.json({
      message: "Recruiter onboarding completed",
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phoneNo: user.phoneNo,
        gender: user.gender,
        location: user.location,
        headline: user.headline,
        about: user.about,
        dob: user.dob,
        onboardingCompleted: user.onboardingCompleted,
        recruiterOnboardingCompleted: user.recruiterOnboardingCompleted,
        profilePicture: user.profilePicture,
        role: user.role,
      },
      businessProfile: businessProfile,
    });
  } catch (error) {
    console.error("Error in completeRecruiterOnboarding:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

const getAllIndianStates = async (req, res) => {
  const states = State.getStatesOfCountry("IN");
  // console.log(states)
  res.json(states);
};

const getAllIndianCities = async (req, res) => {
  const { stateCode } = req.params;
  const cities = City.getCitiesOfState("IN", stateCode);
  // console.log(cities)
  res.json(cities);
};

const saveResume = async (req, res) => {
  try {
    const resumeUrl = req.file?.path;

    if (!resumeUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Resume file not uploaded" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { resume: resumeUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: updatedUser.resume,
    });
  } catch (error) {
    console.error("Error saving resume:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  completeOnboarding,
  resumeExtraction,
  getPredata,
  completeRecruiterOnboarding,
  getAllIndianStates,
  getAllIndianCities,
  saveResume,
};
