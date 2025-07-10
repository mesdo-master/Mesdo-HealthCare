const Job = require("../../models/recruiter/Job");
const User = require("../../models/user/User");
const mongoose = require("mongoose");

const getJobs = async (req, res) => {
  try {
    console.log("=== GET JOBS START ===");
    console.log("User from middleware:", req.user?._id);

    let hiddenJobIds = [];

    // If user is authenticated, get their hidden jobs
    if (req.user && req.user._id) {
      try {
        console.log("Fetching hidden jobs for user:", req.user._id);
        const user = await User.findById(req.user._id).select("hiddenJobs");
        hiddenJobIds = user && user.hiddenJobs ? user.hiddenJobs : [];
        console.log("Hidden job IDs:", hiddenJobIds);
      } catch (userError) {
        console.log("Error fetching user hidden jobs:", userError);
        // Continue without filtering if user lookup fails
        hiddenJobIds = [];
      }
    }

    // Fetch all jobs excluding hidden ones
    const jobs = await Job.find({
      _id: { $nin: hiddenJobIds },
    }).sort({ createdAt: -1 });

    console.log(
      `Found ${jobs.length} jobs (excluding ${hiddenJobIds.length} hidden)`
    );
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEachJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const filterJobs = async (req, res) => {
  try {
    const {
      jobTitle,
      location,
      skills,
      specializations,
      experience,
      jobTypes,
      languages,
      salaryRange,
    } = req.body;
    console.log("filter options:", req.body);
    const query = {};

    // Job title (partial match, case-insensitive)
    if (jobTitle?.trim()) {
      query.jobTitle = { $regex: jobTitle.trim(), $options: "i" };
    }

    // Location (partial match)
    if (location?.trim()) {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    // Skills (match all selected)
    if (Array.isArray(skills) && skills.length) {
      query.skills = { $all: skills };
    }

    // Specializations (match at least one)
    if (Array.isArray(specializations) && specializations.length) {
      query.specialization = { $in: specializations };
    }

    // Experience overlap
    if (typeof experience === "number" && experience > 0) {
      query["experience"] = `${experience}`;
    }

    // Job types
    if (Array.isArray(jobTypes) && jobTypes.length > 0) {
      query.employmentType = { $in: jobTypes };
    }

    // Languages
    if (Array.isArray(languages) && languages.length > 0) {
      query.language = { $all: languages };
    }

    // Salary filter
    if (typeof salaryRange === "number" && salaryRange > 0) {
      query["salaryRangeFrom"] = { $lte: salaryRange };
      query["salaryRangeTo"] = { $gte: salaryRange };
    }

    // Exclude hidden jobs for authenticated user
    let hiddenJobIds = [];
    if (req.user && req.user._id) {
      try {
        const user = await User.findById(req.user._id).select("hiddenJobs");
        hiddenJobIds = user && user.hiddenJobs ? user.hiddenJobs : [];
      } catch (userError) {
        console.log("Error fetching user hidden jobs:", userError);
        hiddenJobIds = [];
      }
    }

    if (hiddenJobIds.length > 0) {
      query._id = { $nin: hiddenJobIds };
    }

    console.log("Final Filter Query:", query);
    const jobs = await Job.find(query);
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error filtering jobs:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const applyJob = async (req, res) => {
  try {
    console.log("=== APPLY JOB START ===");
    console.log("Request body:", req.body);
    console.log("User from middleware:", req.user?._id);

    const { jobId, note } = req.body;

    // Basic validation
    if (!jobId) {
      console.log("ERROR: No jobId provided");
      return res.status(400).json({ message: "Job ID is required" });
    }

    if (!req.user || !req.user._id) {
      console.log("ERROR: User not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("Finding job with ID:", jobId);

    // Find the job by ID with basic error handling
    let job;
    try {
      job = await Job.findById(jobId);
    } catch (jobError) {
      console.log("ERROR finding job:", jobError);
      return res.status(400).json({ message: "Invalid job ID format" });
    }

    if (!job) {
      console.log("ERROR: Job not found for ID:", jobId);
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("Job found:", job.jobTitle);
    console.log("Finding user with ID:", req.user._id);

    // Find the user
    let user;
    try {
      user = await User.findById(req.user._id);
    } catch (userError) {
      console.log("ERROR finding user:", userError);
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    if (!user) {
      console.log("ERROR: User not found for ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.email || user.name || "Unknown");

    // Check if user already applied
    const alreadyApplied = job.applied.some(
      (appliedUserId) => appliedUserId.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      console.log("User already applied to this job");
      return res.status(400).json({ message: "Already applied to this job" });
    }

    console.log("Attempting to update job...");

    // Try a simple update first
    try {
      const updateResult = await Job.updateOne(
        { _id: jobId },
        { $push: { applied: req.user._id } }
      );

      console.log("Job update result:", updateResult);

      if (updateResult.modifiedCount === 0) {
        console.log("WARNING: No documents were modified");
      }
    } catch (updateError) {
      console.log("ERROR updating job:", updateError);
      throw updateError;
    }

    console.log("Attempting to update user...");

    // Update user's applied jobs
    try {
      if (!user.appliedJobs.includes(jobId)) {
        user.appliedJobs.push(jobId);
        await user.save();
        console.log("User appliedJobs updated successfully");
      } else {
        console.log("Job already in user's appliedJobs");
      }
    } catch (userUpdateError) {
      console.log("ERROR updating user:", userUpdateError);
      // Don't fail the entire operation if user update fails
    }

    console.log("=== APPLY JOB SUCCESS ===");
    res.status(200).json({ message: "Applied successfully" });
  } catch (error) {
    console.log("=== APPLY JOB ERROR ===");
    console.error("Full error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);

    // Send a generic error response
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const toggleSaveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSaved = user.savedJobs.includes(jobId);

    if (isSaved) {
      // Remove the job from savedJobs
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      // Add the job to savedJobs
      user.savedJobs.push(jobId);
    }

    await user.save();

    res.status(200).json({
      message: isSaved
        ? "Job removed from saved list"
        : "Job saved successfully",
      saved: !isSaved,
    });
  } catch (error) {
    console.error("Error toggling saved job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkSave = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ saved: false, message: "User not found" });
    }

    const isSaved = user.savedJobs.includes(jobId);
    return res.status(200).json({ saved: isSaved });
  } catch (error) {
    console.error("Error checking saved job:", error);
    return res.status(500).json({ saved: false, message: "Server error" });
  }
};

const getAppliedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("appliedJobs");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ appliedJobs: user.appliedJobs });
  } catch (err) {
    console.error("Error getting applied jobs:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedJobs");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ savedJobs: user.savedJobs });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const hideJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if job is already hidden
    if (user.hiddenJobs.includes(jobId)) {
      return res.status(400).json({ message: "Job is already hidden" });
    }

    // Add job to hidden jobs
    user.hiddenJobs.push(jobId);
    await user.save();

    res.status(200).json({
      message: "Job hidden successfully",
      hiddenJobId: jobId,
    });
  } catch (error) {
    console.error("Error hiding job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const unhideJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if job is in hidden jobs
    if (!user.hiddenJobs.includes(jobId)) {
      return res.status(400).json({ message: "Job is not hidden" });
    }

    // Remove job from hidden jobs
    user.hiddenJobs = user.hiddenJobs.filter((id) => id.toString() !== jobId);
    await user.save();

    res.status(200).json({
      message: "Job unhidden successfully",
      unhiddenJobId: jobId,
    });
  } catch (error) {
    console.error("Error unhiding job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getHiddenJobs = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "hiddenJobs",
      model: "Job",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Hidden jobs retrieved successfully",
      hiddenJobs: user.hiddenJobs || [],
    });
  } catch (error) {
    console.error("Error fetching hidden jobs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getJobs,
  getEachJob,
  filterJobs,
  applyJob,
  toggleSaveJob,
  checkSave,
  getAppliedJobs,
  getSavedJobs,
  hideJob,
  unhideJob,
  getHiddenJobs,
};
