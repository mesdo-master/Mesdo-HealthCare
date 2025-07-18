const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const Business = require("../../models/recruiter/BusinessProfile");
const mongoose = require("mongoose");
const { io } = require("../../utils/socket");
const User = require("../../models/user/User");

const checkRecuriter = async (req, res) => {
  try {
    // Validate that the user is authenticated and has a valid _id.
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check if a recruiter already exists for the user.
    const existingRecruiter = await Business.findOne({ userId: req.user._id });
    if (existingRecruiter) {
      return res.status(200).json({
        message: "Recruiter already exists",
        recruiter: existingRecruiter,
      });
    }

    // Create a new recruiter and save it.
    const newRecruiter = new Business({ userId: req.user._id });
    await newRecruiter.save();

    // Return a 201 status for successful creation.
    return res.status(201).json({
      message: "Recruiter created successfully",
      recruiter: newRecruiter,
    });
  } catch (error) {
    console.error("Error in checkRecruiter:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const orgLogoUpload = async (req, res) => {
  try {
    // Validate that the user is authenticated and has a valid _id.
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check if a recruiter already exists for the user.
    const existingRecruiter = await Business.findOne({ userId: req.user._id });
    if (!existingRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    // Update the recruiter's orgLogo field with the uploaded file path.
    existingRecruiter.orgLogo = req.file.path;
    await existingRecruiter.save();

    return res.status(200).json({
      message: "Logo uploaded successfully",
      recruiter: existingRecruiter,
    });
  } catch (error) {
    console.error("Error in orgLogoUpload:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const orgBannerUpload = async (req, res) => {
  try {
    // Validate that the user is authenticated and has a valid _id.
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check if a recruiter already exists for the user.
    const existingRecruiter = await Business.findOne({ userId: req.user._id });
    if (!existingRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    // Update the recruiter's orgLogo field with the uploaded file path.
    existingRecruiter.orgBanner = req.file.path;
    await existingRecruiter.save();

    return res.status(200).json({
      message: "Logo uploaded successfully",
      recruiter: existingRecruiter,
    });
  } catch (error) {
    console.error("Error in orgLogoUpload:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const fetchOrgData = async (req, res) => {
  try {
    const { orgname } = req.query;

    // Check if a recruiter already exists for the user.
    const existingRecruiter = await Business.findOne({ _id: orgname });

    if (!existingRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    return res.status(200).json({ recruiter: existingRecruiter });
  } catch (error) {
    console.error("Error in fetchOrgData:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Set by protectRoute middleware
    const updateFields = req.body;

    const updatedProfile = await Business.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, upsert: true } // Create one if not exists
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const initiateChatRecuriter = async (req, res) => {
  const { jobId, orgId, receiverId } = req.body;

  if (!jobId || !orgId || !receiverId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (orgId === receiverId) {
    return res
      .status(400)
      .json({ message: "Cannot initiate chat with yourself" });
  }

  const senderId = orgId;
  console.log("Recruiter controller", senderId, orgId, receiverId);

  try {
    // Check if conversation already exists with new model structure
    let conversation = await Conversation.findOne({
      $and: [
        {
          participants: {
            $elemMatch: {
              user: senderId,
              userType: "BusinessProfile",
            },
          },
        },
        {
          participants: {
            $elemMatch: {
              user: receiverId,
              userType: "User",
            },
          },
        },
      ],
      category: "Recruitment",
      job: jobId,
      status: "active",
    });

    if (!conversation) {
      // Create new conversation with enhanced structure
      const participants = [
        {
          user: senderId,
          userType: "BusinessProfile",
          role: "owner",
          joinedAt: new Date(),
        },
        {
          user: receiverId,
          userType: "User",
          role: "member",
          joinedAt: new Date(),
        },
      ];

      conversation = await Conversation.create({
        participants: participants,
        category: "Recruitment",
        job: jobId,
        isGroup: false,
        isPrivate: true,
        createdBy: {
          user: senderId,
          userType: "BusinessProfile",
        },
        status: "active",
      });

      console.log("✅ New recruitment conversation created:", conversation._id);
    } else {
      console.log(
        "✅ Existing recruitment conversation found:",
        conversation._id
      );
    }

    res.status(200).json({
      conversationId: conversation._id,
      success: true,
      message: "Conversation initiated successfully",
    });
  } catch (err) {
    console.error("❌ initiateChatRecuriter error:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
      success: false,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, conversationId, senderId } = req.body;

    if (!text && !req.file) {
      return res.status(400).json({ error: "Message is empty." });
    }

    let conversation;

    // 1. Validate conversationId
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // 3. Create the message with new model structure
    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: {
        user: senderId,
        userType: "BusinessProfile",
      },
      receiver: receiverId
        ? {
            user: receiverId,
            userType: "User",
          }
        : undefined,
      message: text,
      messageType: "text",
      category: "Recruitment",
      status: "sent",
    });

    // Populate the message for response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender.user", "name username profilePicture")
      .populate("receiver.user", "name username profilePicture")
      .lean();

    // 4. Update conversation metadata with new method
    await conversation.updateLastMessage(text, senderId, "BusinessProfile");

    // 5. Emit to conversation room using new socket structure
    const { broadcastToConversation } = require("../../utils/socket");
    broadcastToConversation(conversation._id, "newMessage", {
      id: populatedMessage._id,
      conversationId: conversation._id,
      sender: populatedMessage.sender,
      receiver: populatedMessage.receiver,
      message: populatedMessage.message,
      messageType: populatedMessage.messageType,
      category: populatedMessage.category,
      status: populatedMessage.status,
      createdAt: populatedMessage.createdAt,
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversationId: conversation._id,
    });
  } catch (err) {
    console.error("❌ Message send error:", err);
    res.status(500).json({
      error: "Failed to send message.",
      details: err.message,
      success: false,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { orgId } = req.query;

    // Fetch conversation and messages with proper population
    const [conversation, messages] = await Promise.all([
      Conversation.findById(conversationId)
        .populate("participants.user", "name username profilePicture")
        .populate("job", "jobTitle"),
      Message.findByConversation(conversationId, { sortOrder: 1 }),
    ]);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Find the other participant (not the current org)
    const otherParticipant = conversation.participants.find(
      (participant) => participant.user._id.toString() !== orgId
    );

    if (!otherParticipant) {
      return res.status(400).json({
        success: false,
        message: "Other user not found in the conversation",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat history fetched successfully",
      otherUser: otherParticipant.user,
      messages,
      conversation: {
        id: conversation._id,
        category: conversation.category,
        job: conversation.job,
        lastMessage: conversation.lastMessage,
        lastMessageTime: conversation.lastMessageTime,
        messageCount: conversation.messageCount,
      },
    });
  } catch (error) {
    console.error("❌ Error in getMessages:", error);
    res.status(500).json({
      success: false,
      message: "Fetching chat history failed",
      error: error.message || error,
    });
  }
};

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const businessProfile = await Business.findOne({ userId: userId });

    if (!businessProfile) {
      return res.status(404).json({
        error: "Business profile not found",
        success: false,
      });
    }

    // Use the new model's static method to find conversations
    const conversations = await Conversation.findByParticipant(
      businessProfile._id,
      "BusinessProfile"
    );

    // Transform conversations for response
    const populatedConversations = conversations.map((conv) => {
      // Find the other participant (not the current business)
      const otherParticipant = conv.participants.find(
        (participant) =>
          !(
            participant.user._id.toString() ===
              businessProfile._id.toString() &&
            participant.userType === "BusinessProfile"
          )
      );

      return {
        id: conv._id,
        category: conv.category,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        messageCount: conv.messageCount,
        isGroup: conv.isGroup,
        name: conv.name,
        job: conv.job,
        otherParticipant: otherParticipant
          ? {
              id: otherParticipant.user._id,
              name: otherParticipant.user.name,
              username: otherParticipant.user.username,
              profilePicture: otherParticipant.user.profilePicture,
              userType: otherParticipant.userType,
              role: otherParticipant.role,
            }
          : null,
        participants: conv.participants,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      conversations: populatedConversations,
      count: populatedConversations.length,
    });
  } catch (err) {
    console.error("❌ Get conversations error:", err);
    res.status(500).json({
      error: "Failed to fetch conversations.",
      details: err.message,
      success: false,
    });
  }
};

module.exports = {
  getAllConversations,
  sendMessage,
  checkRecuriter,
  orgLogoUpload,
  fetchOrgData,
  orgBannerUpload,
  updateProfile,
  initiateChatRecuriter,
  getMessages,
};
