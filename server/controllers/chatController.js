// backend/controllers/chatController.js
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/user/User");
const Conversation = require("../models/Conversation");
const Business = require("../models/recruiter/BusinessProfile");
const Job = require("../models/recruiter/Job");
const { io } = require("../utils/socket");

const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Fetch conversation and messages
    const [conversation, messages] = await Promise.all([
      Conversation.findById(conversationId).populate(
        "participants",
        "name email profilePicture"
      ),
      Message.find({ conversationId }).sort({ createdAt: 1 }),
    ]);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (user) => user._id.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you are not a member of this conversation",
      });
    }

    const isGroupChat = conversation.isGroup;

    if (isGroupChat) {
      const otherUsers = conversation.participants.filter(
        (user) => user._id.toString() !== userId
      );
      return res.status(200).json({
        success: true,
        message: "Group chat history fetched successfully",
        otherUser: otherUsers,
        messages,
      });
    } else {
      // console.log(conversation)
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
    }
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({
      success: false,
      message: "Fetching chat history failed",
      error: error.message || error,
    });
  }
};

const initiateChat = async (req, res) => {
  const senderId = req.user.id;
  const { username } = req.body;
  const receiver = await User.findOne({ username });
  const receiverId = receiver._id;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    res.status(200).json({ conversationId: conversation._id });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, conversationId } = req.body;
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
    conversation.participants.forEach((participantId) => {
      io.to(participantId.toString()).emit("newMessage", populatedMessage);
    });

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Message send error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
};

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "lastMessage",
        select: "text image createdAt",
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Get participant info excluding the current user
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipantId = conv.participants.find(
          (id) => id.toString() !== userId.toString()
        );

        const user = await User.findById(otherParticipantId).select(
          "name profilePicture"
        );

        return {
          ...conv,
          otherParticipant: user,
        };
      })
    );

    res.status(200).json(populatedConversations);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, participantIds, description } = req.body;

    // Debug logging
    console.log("CreateGroup request body:", req.body);
    console.log("participantIds type:", typeof participantIds);
    console.log("participantIds value:", participantIds);

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Ensure participantIds is an array and has proper format
    let validParticipantIds = participantIds;
    if (typeof participantIds === "string") {
      try {
        validParticipantIds = JSON.parse(participantIds);
      } catch (e) {
        return res
          .status(400)
          .json({ error: "Invalid participant IDs format" });
      }
    }

    if (!Array.isArray(validParticipantIds)) {
      return res
        .status(400)
        .json({ error: "Participant IDs must be an array" });
    }

    // ensure at least 2 participants + creator (total 3 people minimum)
    if (validParticipantIds.length < 2) {
      return res
        .status(400)
        .json({ error: "Need at least 2 members to create a group" });
    }

    // Validate all participant IDs are valid ObjectIds
    const mongoose = require("mongoose");
    const validObjectIds = validParticipantIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validObjectIds.length !== validParticipantIds.length) {
      return res
        .status(400)
        .json({ error: "All participant IDs must be valid" });
    }

    console.log("Valid participant IDs:", validObjectIds);
    console.log("Current user ID:", req.user._id);

    const convo = await Conversation.create({
      isGroup: true,
      name: name.trim(),
      description: description?.trim() || "",
      participants: [...validObjectIds, req.user._id],
      admins: [req.user._id],
      category: "Groups",
    });

    console.log("Group created successfully:", convo);
    return res.status(201).json(convo);
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ error: "Failed to create group" });
  }
};

const getjobsConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      category: "Recruitment",
    }).sort({ updatedAt: -1 });

    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        let otherParticipant = null;

        if (conv.job && conv.job.length > 0) {
          // Fetch the job using the first job ID in the array
          const jobData = await Job.findById(conv.job[0]);
          // console.log(jobData)

          if (jobData && jobData.organization) {
            // Fetch the organization user by organizationId
            otherParticipant = await Business.findById(jobData.organization);
          }
        }

        return {
          ...conv.toObject(), // convert Mongoose doc to plain object
          otherParticipant,
        };
      })
    );
    // console.log("You are here",populatedConversations)
    res.status(200).json(populatedConversations);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
};

module.exports = {
  getjobsConversations,
  getAllConversations,
  getChatHistory,
  initiateChat,
  sendMessage,
  createGroup,
};
