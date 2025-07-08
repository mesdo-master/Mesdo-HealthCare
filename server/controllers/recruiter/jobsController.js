const Job = require("../../models/recruiter/Job");
const Business = require("../../models/recruiter/BusinessProfile");
const User = require("../../models/user/User");
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const mongoose = require("mongoose");
const { io } = require("../../utils/socket");

const getAllJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const businessProfile = await Business.findOne({ userId }).populate("jobs");
    res.status(200).json({ success: true, jobs: businessProfile.jobs });
  } catch (error) {
    console.error("Error fetching jobs: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createJob = async (req, res) => {
  try {
    const { formData, description } = req.body;
    console.log("createJob req.body:", req.body);

    const recruiter = await Business.findOne({ userId: req.user._id });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter (Business) not found" });
    }

    // Ensure language is always an array of strings
    let languageArray = [];
    if (Array.isArray(formData.language)) {
      languageArray = formData.language.filter(
        (l) => typeof l === "string" && l.trim() !== ""
      );
    } else if (
      typeof formData.language === "string" &&
      formData.language.trim() !== ""
    ) {
      languageArray = [formData.language];
    }

    const newJob = new Job({
      organization: recruiter._id,
      jobTitle: formData.jobTitle,
      jobCategory: formData.jobCategory,
      location: formData.location,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      openings: formData.openings,
      salaryRangeFrom: formData.salaryRangeFrom,
      salaryRangeTo: formData.salaryRangeTo,
      employmentType: formData.employmentType,
      experience: formData.experience,
      skills: formData.skills,
      qualification: formData.qualification,
      department: formData.department,
      Shift: formData.Shift,
      language: languageArray,
      specialization: formData.specialization,
      hospitalLogo: recruiter.orgLogo,
      HospitalName: recruiter.name,
      jobDescription: description,
    });
    await newJob.save();

    recruiter.jobs.push(newJob._id);
    await recruiter.save();
    res.status(201).json({
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error) {
    console.error("Error creating job:", error, req.body);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

const getOrgLogo = async (req, res) => {
  try {
    const { orgId } = req.query;
    const businessProfile = await Business.findOne({ _id: orgId });
    if (!businessProfile) {
      return res.status(404).json({ error: "Business profile not found" });
    }
    res.status(200).json(businessProfile);
  } catch (error) {
    console.error("Error fetching organization logo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllApplicants = async (req, res) => {
  try {
    const { jobId } = req.query;
    const job = await Job.findById(jobId).populate("applied");
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const initiateChatUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const senderId = currentUser._id;
    const { jobId } = req.body;

    const jobFound = await Job.findById(jobId).populate("organization");

    if (!jobFound) {
      return res.status(404).json({ message: "Job not found" });
    }

    const receiverId = jobFound.organization._id;

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      category: "Recruitment",
      job: jobId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        category: "Recruitment",
        job: jobId,
      });
    }

    res.status(200).json({ conversationId: conversation._id });
  } catch (err) {
    console.error("initiateChatUser error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const jobGetMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const userId = req.user.id;

    // Fetch conversation and messages
    const [conversation, messages] = await Promise.all([
      Conversation.findById(conversationId),
      Message.find({ conversationId }).sort({ createdAt: 1 }),
    ]);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const otherUser = conversation.participants.find(
      (user) => user._id.toString() !== userId
    );
    if (!otherUser) {
      return res.status(400).json({
        success: false,
        message: "Other user not found in the conversation",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat history fetched successfully",
      otherUser,
      messages,
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({
      success: false,
      message: "Fetching chat history failed",
      error: error.message || error,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, conversationId } = req.body;
    // console.log("receiverId -----------------> ",receiverId)
    const senderId = req.user.id;

    if (!text && !req.file) {
      return res.status(400).json({ error: "Message is empty." });
    }

    let conversation;

    // 1. Validate conversationId
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findById(conversationId);
    }

    // 2. If not found and not a group, create/find 1-1 conversation
    if (!conversation && receiverId) {
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId], $size: 2 },
        isGroup: false,
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
          isGroup: false,
        });
      }
    }

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // 3. Create the message
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId || null, // null for group
      message: text,
      conversationId: conversation._id,
    });

    const populatedMessage = await Message.findById(newMessage._id).lean();

    // 4. Update conversation metadata
    conversation.lastMessage = populatedMessage.message;
    conversation.lastMessageTime = Date.now();
    await conversation.save();

    // 5. Emit to all participants
    // conversation.participants.forEach((participantId) => {
    io.emit("newMessage", populatedMessage);
    // });

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Message send error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    // Optionally remove job from Business.jobs array
    await Business.updateOne({ jobs: jobId }, { $pull: { jobs: jobId } });
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { formData, description } = req.body;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    // Ensure language is always an array of strings
    let languageArray = [];
    if (Array.isArray(formData.language)) {
      languageArray = formData.language.filter(
        (l) => typeof l === "string" && l.trim() !== ""
      );
    } else if (
      typeof formData.language === "string" &&
      formData.language.trim() !== ""
    ) {
      languageArray = [formData.language];
    }
    // Update fields
    Object.assign(job, {
      jobTitle: formData.jobTitle,
      jobCategory: formData.jobCategory,
      location: formData.location,
      endDate: formData.endDate || job.endDate,
      openings: formData.openings,
      salaryRangeFrom: formData.salaryRangeFrom,
      salaryRangeTo: formData.salaryRangeTo,
      employmentType: formData.employmentType,
      experience: formData.experience,
      skills: formData.skills,
      qualification: formData.qualification,
      department: formData.department,
      Shift: formData.Shift,
      language: languageArray,
      specialization: formData.specialization,
      jobDescription: description,
      status: formData.status || job.status,
    });
    await job.save();
    res.status(200).json({ message: "Job updated successfully", job });
  } catch (error) {
    console.error("Error updating job:", error, req.body);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

module.exports = {
  getAllJobs,
  createJob,
  getOrgLogo,
  getAllApplicants,
  initiateChatUser,
  jobGetMessages,
  sendMessage,
  deleteJob,
  updateJob,
};
