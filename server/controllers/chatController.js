// backend/controllers/chatController.js
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/user/User");
const Conversation = require("../models/Conversation");
const Business = require("../models/recruiter/BusinessProfile");
const Job = require("../models/recruiter/Job");
const { broadcastToConversation } = require("../utils/socket");

const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

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

    // Check if user is participant
    const userType = req.user.role === 'recruiter' ? 'BusinessProfile' : 'User';
    const isParticipant = conversation.isParticipant(userId, userType);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you are not a member of this conversation",
      });
    }

    const isGroupChat = conversation.isGroup;

    if (isGroupChat) {
      const otherUsers = conversation.participants
        .filter((participant) => participant.user._id.toString() !== userId)
        .map((participant) => participant.user);

      return res.status(200).json({
        success: true,
        message: "Group chat history fetched successfully",
        otherUsers,
        messages,
        conversation: {
          id: conversation._id,
          name: conversation.name,
          isGroup: true,
          category: conversation.category,
          participantCount: conversation.participants.length,
        },
      });
    } else {
      // Find the other participant
      const otherParticipant = conversation.participants.find(
        (participant) => participant.user._id.toString() !== userId
      );

      return res.status(200).json({
        success: true,
        message: "Chat history fetched successfully",
        otherUser: otherParticipant ? otherParticipant.user : null,
        messages,
        conversation: {
          id: conversation._id,
          category: conversation.category,
          isGroup: false,
          lastMessage: conversation.lastMessage,
          lastMessageTime: conversation.lastMessageTime,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error in getChatHistory:", error);
    res.status(500).json({
      success: false,
      message: "Fetching chat history failed",
      error: error.message || error,
    });
  }
};

const initiateChat = async (req, res) => {
  const senderId = req.user._id;
  const { username } = req.body;

  try {
    const receiver = await User.findOne({ username });
    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const receiverId = receiver._id;

    // Check if conversation already exists with new model structure
    let conversation = await Conversation.findOne({
      $and: [
        {
          participants: {
            $elemMatch: {
              user: senderId,
              userType: "User",
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
      category: "Personal",
      status: "active",
    });

    if (!conversation) {
      // Create new conversation with enhanced structure
      const participants = [
        {
          user: senderId,
          userType: "User",
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
        category: "Personal",
        isGroup: false,
        isPrivate: true,
        createdBy: {
          user: senderId,
          userType: "User",
        },
        status: "active",
      });

      console.log("✅ New personal conversation created:", conversation._id);
    } else {
      console.log("✅ Existing personal conversation found:", conversation._id);
    }

    res.status(200).json({
      conversationId: conversation._id,
      success: true,
      message: "Conversation initiated successfully",
    });
  } catch (err) {
    console.error("❌ initiateChat error:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
      success: false,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    console.log("📨 sendMessage called with body:", req.body);
    console.log("📨 User:", req.user);

    const { receiverId, text, conversationId } = req.body;
    const senderId = req.user?._id;
    const senderUserType = req.user?.role === 'recruiter' ? 'BusinessProfile' : 'User';

    if (!senderId) {
      return res.status(401).json({ error: 'User not authenticated.', success: false });
    }

    console.log("📨 Processing message:", {
      senderId,
      receiverId,
      conversationId,
      textLength: text?.length,
    });

    if (!text && !req.file) {
      console.log("❌ Message validation failed: empty message");
      return res.status(400).json({
        error: "Message is empty.",
        success: false,
      });
    }

    let conversation;

    // 1. Validate conversationId
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      console.log("🔍 Finding conversation by ID:", conversationId);
      conversation = await Conversation.findById(conversationId);
      console.log("🔍 Found conversation:", conversation ? "Yes" : "No");
    }

    // 2. If not found and receiverId provided, find/create personal conversation
    if (!conversation && receiverId) {
      console.log("🔍 Finding/creating conversation for receiver:", receiverId);

      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        console.log("❌ Invalid receiverId:", receiverId);
        return res.status(400).json({
          error: "Invalid receiver ID.",
          success: false,
        });
      }

      conversation = await Conversation.findOne({
        $and: [
          {
            participants: {
              $elemMatch: {
                user: senderId,
                userType: "User",
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
        category: "Personal",
        status: "active",
      });

      console.log(
        "🔍 Found existing conversation:",
        conversation ? "Yes" : "No"
      );

      if (!conversation) {
        console.log("🆕 Creating new conversation");

        // Verify receiver exists
        const receiverExists = await User.findById(receiverId);
        if (!receiverExists) {
          console.log("❌ Receiver not found:", receiverId);
          return res.status(404).json({
            error: "Receiver not found.",
            success: false,
          });
        }

        // Create new conversation
        const participants = [
          {
            user: senderId,
            userType: "User",
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
          category: "Personal",
          isGroup: false,
          isPrivate: true,
          createdBy: {
            user: senderId,
            userType: "User",
          },
          status: "active",
        });

        console.log("✅ New conversation created:", conversation._id);
      }
    }

    if (!conversation) {
      console.log("❌ No conversation found or created");
      return res.status(404).json({
        error: "Conversation not found.",
        success: false,
      });
    }

    console.log("📨 Creating message in conversation:", conversation._id);

    // 3. Create the message with new model structure
    const messageData = {
      conversationId: conversation._id,
      sender: {
        user: senderId,
        userType: senderUserType,
      },
      message: text,
      messageType: "text",
      category: conversation.category,
      status: "sent",
    };

    // Add receiver if specified
    if (receiverId) {
      const receiver = await User.findById(receiverId);
      messageData.receiver = {
        user: receiverId,
        userType: receiver.role === 'recruiter' ? 'BusinessProfile' : 'User',
      };
    }

    console.log("📨 Message data:", messageData);

    const newMessage = await Message.create(messageData);
    console.log("✅ Message created:", newMessage._id);

    // Populate the message for response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender.user", "name username profilePicture")
      .populate("receiver.user", "name username profilePicture")
      .lean();

    console.log("✅ Message populated");

    // 4. Update conversation metadata with new method
    console.log("📨 Updating conversation last message");
    await conversation.updateLastMessage(text, senderId, senderUserType);
    console.log("✅ Conversation updated");

    // 5. Emit to conversation room using new socket structure
    console.log("📨 Broadcasting to conversation room");
    broadcastToConversation(conversation._id, "newMessage", {
      id: populatedMessage._id,
      _id: populatedMessage._id,
      conversationId: conversation._id,
      sender: populatedMessage.sender.user._id,
      senderData: populatedMessage.sender.user,
      receiver: populatedMessage.receiver?.user?._id,
      message: populatedMessage.message,
      messageType: populatedMessage.messageType,
      category: populatedMessage.category,
      status: populatedMessage.status,
      createdAt: populatedMessage.createdAt,
    });
    console.log("✅ Message broadcasted");

    console.log("✅ Message send completed successfully");

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversationId: conversation._id,
    });
  } catch (err) {
    console.error("❌ Message send error:", err);
    console.error("❌ Error stack:", err.stack);

    res.status(500).json({
      error: "Failed to send message.",
      details: err.message,
      success: false,
    });
  }
};

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("🔍 Fetching all conversations for user:", userId);

    // Use the new model's static method to find conversations
    const conversations = await Conversation.findByParticipant(userId, "User");

    console.log("📊 Found conversations:", conversations.length);

    // Transform conversations for response
    const populatedConversations = conversations.map((conv) => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(
        (participant) =>
          !(
            participant.user._id.toString() === userId.toString() &&
            participant.userType === "User"
          )
      );

      return {
        _id: conv._id, // ✅ Added _id for consistency
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
              _id: otherParticipant.user._id, // ✅ Added _id for consistency
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

    console.log(
      "📤 Sending response with conversations:",
      populatedConversations.length
    );

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

const createGroup = async (req, res) => {
  try {
    const { name, description, userIds } = req.body;
    const creatorId = req.user._id;

    if (!name || !userIds || userIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Group name and participants are required." });
    }

    // Create participants array with creator as owner
    const participants = [
      {
        user: creatorId,
        userType: "User",
        role: "owner",
        joinedAt: new Date(),
      },
    ];

    // Add other participants as members
    userIds.forEach((userId) => {
      if (userId !== creatorId.toString()) {
        participants.push({
          user: userId,
          userType: "User",
          role: "member",
          joinedAt: new Date(),
        });
      }
    });

    const conversation = await Conversation.create({
      participants: participants,
      name: name,
      description: description || "",
      category: "Groups",
      isGroup: true,
      isPrivate: false,
      createdBy: {
        user: creatorId,
        userType: "User",
      },
      status: "active",
    });

    const populatedConversation = await Conversation.findById(
      conversation._id
    ).populate("participants.user", "name username profilePicture");

    res.status(201).json({
      success: true,
      conversation: populatedConversation,
      message: "Group created successfully",
    });
  } catch (err) {
    console.error("❌ Create group error:", err);
    res.status(500).json({
      error: "Failed to create group.",
      details: err.message,
      success: false,
    });
  }
};

const getjobsConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("🔍 Fetching job conversations for user:", userId);

    // Get job-related conversations - try both "Jobs" and "Recruitment" categories
    const conversations = await Conversation.findByParticipant(
      userId,
      "User",
      "Recruitment" // ✅ Changed from "Jobs" to "Recruitment"
    );

    console.log("📊 Found conversations:", conversations.length);

    // Transform conversations for response
    const populatedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (participant) =>
          !(
            participant.user._id.toString() === userId.toString() &&
            participant.userType === "User"
          )
      );

      return {
        _id: conv._id, // ✅ Added _id for consistency
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
              _id: otherParticipant.user._id, // ✅ Added _id for consistency
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

    console.log(
      "📤 Sending response with conversations:",
      populatedConversations.length
    );

    res.status(200).json({
      success: true,
      conversations: populatedConversations,
      count: populatedConversations.length,
    });
  } catch (err) {
    console.error("❌ Get job conversations error:", err);
    res.status(500).json({
      error: "Failed to fetch job conversations.",
      details: err.message,
      success: false,
    });
  }
};

module.exports = {
  getChatHistory,
  initiateChat,
  sendMessage,
  getAllConversations,
  createGroup,
  getjobsConversations,
};
