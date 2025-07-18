const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/user/User");
const BusinessProfile = require("../models/recruiter/BusinessProfile");
const Notification = require("../models/user/Notification");
const {
  broadcastToUser,
  sendNotificationToUser,
  broadcastToConversation,
} = require("../utils/socket");

/**
 * Get conversations for a user
 */
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, page = 1, limit = 20 } = req.query;

    const conversations = await Conversation.findByParticipant(
      userId,
      "User",
      category
    )
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: "participants.user",
        select: "username name profilePicture",
      })
      .populate({
        path: "job",
        select: "jobTitle HospitalName",
      })
      .populate({
        path: "organization",
        select: "name orgLogo",
      })
      .sort({ lastMessageTime: -1 });

    res.json({
      success: true,
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: conversations.length,
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

/**
 * Create a new conversation
 */
const createConversation = async (req, res) => {
  try {
    const {
      participants,
      category = "Personal",
      name,
      description,
      jobId,
      organizationId,
    } = req.body;

    if (!participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Participants are required",
      });
    }

    // Add current user to participants if not already included
    const currentUserParticipant = {
      user: req.user._id,
      userType: "User",
      role: "owner",
    };

    const allParticipants = [currentUserParticipant, ...participants];

    // Check if conversation already exists for these participants (for personal conversations)
    if (category === "Personal" && allParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        category: "Personal",
        "participants.user": { $all: allParticipants.map((p) => p.user) },
        status: "active",
      });

      if (existingConversation) {
        return res.json({
          success: true,
          conversation: existingConversation,
          message: "Conversation already exists",
        });
      }
    }

    const conversation = await Conversation.createConversation(
      allParticipants,
      {
        category,
        name,
        description,
        job: jobId,
        organization: organizationId,
        createdBy: {
          user: req.user._id,
          userType: "User",
        },
      }
    );

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants.user")
      .populate("job")
      .populate("organization");

    res.status(201).json({
      success: true,
      conversation: populatedConversation,
      message: "Conversation created successfully",
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
};

/**
 * Get messages for a conversation
 */
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.isParticipant(req.user._id, "User");
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this conversation",
      });
    }

    const messages = await Message.findByConversation(conversationId, {
      limit: parseInt(limit),
      skip: (page - 1) * limit,
      sortOrder: -1, // Newest first
    });

    // Reverse for chronological order
    messages.reverse();

    res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

/**
 * Send a message (REST API fallback)
 */
const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      message,
      messageType = "text",
      category = "Personal",
      attachments = [],
    } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and message are required",
      });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.isParticipant(req.user._id, "User");
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages to this conversation",
      });
    }

    // Create message
    const newMessage = await Message.createMessage({
      conversationId,
      senderId: req.user._id,
      senderType: "User",
      message,
      messageType,
      category,
      attachments,
    });

    // Update conversation
    await conversation.updateLastMessage(message, req.user._id, "User");

    // Populate message for response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender.user")
      .populate("receiver.user");

    // Broadcast to conversation participants via socket
    broadcastToConversation(conversationId, "newMessage", {
      id: populatedMessage._id,
      conversationId,
      sender: {
        user: populatedMessage.sender.user,
        userType: populatedMessage.sender.userType,
      },
      receiver: populatedMessage.receiver,
      message: populatedMessage.message,
      messageType: populatedMessage.messageType,
      category: populatedMessage.category,
      attachments: populatedMessage.attachments,
      status: populatedMessage.status,
      createdAt: populatedMessage.createdAt,
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

/**
 * Mark messages as read
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: "Message IDs array is required",
      });
    }

    const messages = await Message.find({
      _id: { $in: messageIds },
      "sender.user": { $ne: req.user._id },
    });

    const updatedMessages = [];
    for (const message of messages) {
      await message.markAsRead(req.user._id, "User");
      updatedMessages.push(message._id);

      // Broadcast read receipt
      broadcastToConversation(message.conversationId, "message-read", {
        messageId: message._id,
        userId: req.user._id,
        userType: "User",
        readAt: new Date(),
      });
    }

    res.json({
      success: true,
      updatedMessages,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};

/**
 * Get unread messages count
 */
const getUnreadMessagesCount = async (req, res) => {
  try {
    const unreadMessages = await Message.findUnreadMessages(
      req.user._id,
      "User"
    );

    // Group by conversation
    const unreadByConversation = {};
    unreadMessages.forEach((message) => {
      const convId = message.conversationId.toString();
      if (!unreadByConversation[convId]) {
        unreadByConversation[convId] = 0;
      }
      unreadByConversation[convId]++;
    });

    res.json({
      success: true,
      totalUnread: unreadMessages.length,
      unreadByConversation,
    });
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread messages count",
    });
  }
};

/**
 * Add participant to conversation
 */
const addParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, userType = "User", role = "member" } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if current user is admin or owner
    const currentUserParticipant = conversation.participants.find(
      (p) =>
        p.user.toString() === req.user._id.toString() && p.userType === "User"
    );

    if (
      !currentUserParticipant ||
      !["admin", "owner"].includes(currentUserParticipant.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add participants",
      });
    }

    await conversation.addParticipant(userId, userType, role);

    // Broadcast to conversation
    broadcastToConversation(conversationId, "participant-added", {
      userId,
      userType,
      role,
      addedBy: req.user._id,
    });

    res.json({
      success: true,
      message: "Participant added successfully",
    });
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add participant",
    });
  }
};

/**
 * Remove participant from conversation
 */
const removeParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, userType = "User" } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if current user is admin/owner or removing themselves
    const currentUserParticipant = conversation.participants.find(
      (p) =>
        p.user.toString() === req.user._id.toString() && p.userType === "User"
    );

    const isSelfRemoval =
      userId === req.user._id.toString() && userType === "User";
    const isAuthorized =
      currentUserParticipant &&
      ["admin", "owner"].includes(currentUserParticipant.role);

    if (!isSelfRemoval && !isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove participants",
      });
    }

    await conversation.removeParticipant(userId, userType);

    // Broadcast to conversation
    broadcastToConversation(conversationId, "participant-removed", {
      userId,
      userType,
      removedBy: req.user._id,
    });

    res.json({
      success: true,
      message: "Participant removed successfully",
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove participant",
    });
  }
};

/**
 * Get online users
 */
const getOnlineUsers = async (req, res) => {
  try {
    const { activeUsers } = require("../utils/socket");

    const onlineUsers = Array.from(activeUsers.values()).map((user) => ({
      userId: user.userId,
      username: user.username,
      userType: user.userType,
      lastSeen: user.lastSeen,
      status: "online",
    }));

    res.json({
      success: true,
      onlineUsers,
      count: onlineUsers.length,
    });
  } catch (error) {
    console.error("Error fetching online users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch online users",
    });
  }
};

module.exports = {
  getUserConversations,
  createConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessagesCount,
  addParticipant,
  removeParticipant,
  getOnlineUsers,
};
