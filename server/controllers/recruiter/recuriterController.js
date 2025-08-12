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
    console.log("🎯 RECRUITER CONTROLLER: sendMessage called with:", req.body);
    const { receiverId, text, conversationId, senderId } = req.body;
    
    // ✅ FIXED: Use the senderId from client if provided (business profile ID), otherwise fallback
    let actualSenderId;
    let senderUserType;
    
    console.log("🎯 RECRUITER DEBUG: senderId from client:", senderId);
    console.log("🎯 RECRUITER DEBUG: senderId type:", typeof senderId);
    console.log("🎯 RECRUITER DEBUG: senderId isValid:", senderId ? mongoose.Types.ObjectId.isValid(senderId) : 'no senderId');
    console.log("🎯 RECRUITER DEBUG: req.user._id:", req.user._id);
    console.log("🎯 RECRUITER DEBUG: req.user.role:", req.user.role);
    
    if (senderId && mongoose.Types.ObjectId.isValid(senderId)) {
      // Client provided a valid senderId (should be business profile ID for recruiters)
      actualSenderId = senderId;
      senderUserType = 'BusinessProfile'; // Assume it's a business profile if explicitly provided
      console.log("✅ RECRUITER: Using senderId from client:", actualSenderId);
      console.log("✅ RECRUITER: Set senderUserType to:", senderUserType);
    } else if (req.user.role === 'recruiter') {
      // Fallback: Find the business profile for this user
      const Business = require("../../models/recruiter/BusinessProfile");
      console.log("🎯 RECRUITER DEBUG: Fallback - Looking for business profile with userId:", req.user._id);
      
      const businessProfile = await Business.findOne({ userId: req.user._id });
      console.log("🎯 RECRUITER DEBUG: Business profile lookup result:", businessProfile ? "Found" : "Not found");
      
      if (businessProfile) {
        actualSenderId = businessProfile._id; // ✅ Use business profile ID
        senderUserType = 'BusinessProfile';
        console.log("✅ RECRUITER: Using business profile ID from lookup:", actualSenderId);
      } else {
        actualSenderId = req.user._id; // Final fallback to user ID
        senderUserType = 'User';
        console.warn("⚠️ RECRUITER: No business profile found, using user ID");
      }
    } else {
      actualSenderId = req.user._id;
      senderUserType = 'User';
    }

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
    console.log("🎯 RECRUITER MESSAGE CREATION: Creating message with:", {
      actualSenderId,
      senderUserType,
      messageText: text
    });
    
    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: {
        user: actualSenderId,
        userType: senderUserType,
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
    
    console.log("🎯 RECRUITER MESSAGE CREATED: Message structure:", {
      messageId: newMessage._id,
      senderUserId: newMessage.sender.user,
      senderUserType: newMessage.sender.userType
    });

    // Populate the message for response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender.user", "name username profilePicture")
      .populate("receiver.user", "name username profilePicture")
      .lean();

    console.log("🎯 RECRUITER API: Message created with structure:", {
      originalSenderId: actualSenderId,
      senderUserType: senderUserType,
      messageId: populatedMessage._id,
      messageSender: populatedMessage.sender,
      senderUser: populatedMessage.sender?.user,
      businessProfileUsed: actualSenderId
    });

    // 4. Update conversation metadata with new method
    await conversation.updateLastMessage(text, actualSenderId, "BusinessProfile");

    // 5. Emit to conversation room using new socket structure
    const { broadcastToConversation } = require("../../utils/socket");
    const socketMessageData = {
      id: populatedMessage._id,
      _id: populatedMessage._id,
      conversationId: conversation._id,
      // ✅ CRITICAL FIX: Match the exact same structure as API response
      sender: {
        ...populatedMessage.sender, // Keep the full nested structure with populated user data
        userType: senderUserType // Override userType to ensure it's BusinessProfile for recruiters
      },
      senderId: actualSenderId, // ✅ Also provide direct access like API response
      senderData: populatedMessage.sender.user, // User data for display
      senderType: senderUserType, // ✅ Also match API response structure
      receiver: populatedMessage.receiver?.user?._id,
      message: populatedMessage.message,
      messageType: populatedMessage.messageType,
      category: populatedMessage.category,
      status: populatedMessage.status,
      createdAt: populatedMessage.createdAt,
    };

    console.log("🎯 RECRUITER SOCKET: Broadcasting message with:", {
      senderId: socketMessageData.sender,
      businessProfileId: actualSenderId,
      messageId: socketMessageData._id
    });

    broadcastToConversation(conversation._id, "newMessage", socketMessageData);

    // ✅ FIXED: Ensure the response includes the correct sender structure for alignment
    const responseMessage = {
      ...populatedMessage,
      // ✅ CRITICAL: Keep the original sender structure but ensure userType is correct
      sender: {
        ...populatedMessage.sender,
        userType: senderUserType // ✅ Override userType to ensure it's BusinessProfile for recruiters
      },
      // Also provide direct access for client-side comparison
      senderId: actualSenderId, // ✅ Direct sender ID for easy comparison
      senderData: populatedMessage.sender.user, // ✅ Populated user data for display  
      senderType: senderUserType
    };

    console.log("=".repeat(80));
    console.log("🎯 RECRUITER API: FINAL RESPONSE STRUCTURE");
    console.log("=".repeat(80));
    console.log("📤 actualSenderId:", actualSenderId);
    console.log("📤 actualSenderId type:", typeof actualSenderId);
    console.log("📤 senderUserType:", senderUserType);
    console.log("📤 Response message sender:", responseMessage.sender);
    console.log("📤 Response message senderId:", responseMessage.senderId);
    console.log("📤 Response message senderType:", responseMessage.senderType);
    console.log("📤 FULL RESPONSE MESSAGE:");
    console.log(JSON.stringify(responseMessage, null, 2));
    console.log("=".repeat(80));

    res.status(201).json({
      success: true,
      message: responseMessage,
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
    console.log('🔍 RECRUITER SERVER DEBUG: Finding other participant:', {
      orgId: orgId,
      orgIdType: typeof orgId,
      participants: conversation.participants.map(p => ({
        userId: p.user._id,
        userType: p.userType,
        userName: p.user.name
      }))
    });
    
    const otherParticipant = conversation.participants.find(
      (participant) => participant.user._id.toString() !== orgId.toString()
    );
    
    console.log('🎯 RECRUITER SERVER DEBUG: Other participant found:', {
      otherParticipant: otherParticipant ? {
        userId: otherParticipant.user._id,
        userName: otherParticipant.user.name,
        userType: otherParticipant.userType
      } : null
    });

    if (!otherParticipant) {
      return res.status(400).json({
        success: false,
        message: "Other user not found in the conversation",
      });
    }

    // ✅ CRITICAL FIX: Normalize message structure to match API response exactly
    const normalizedMessages = messages.map(msg => {
      // Extract the actual sender ID from the sender structure
      let actualSenderId;
      if (msg.sender?.user?._id) {
        actualSenderId = msg.sender.user._id;
      } else if (msg.sender?.user) {
        actualSenderId = msg.sender.user;
      } else {
        actualSenderId = msg.sender;
      }

      return {
        ...msg.toObject(),
        // ✅ CRITICAL FIX: Keep the exact same structure as sendMessage API response
        sender: {
          ...msg.sender, // Keep the full nested structure with populated user data
          userType: msg.sender?.userType // Ensure userType is preserved
        },
        senderId: actualSenderId, // ✅ Also provide direct access
        senderData: msg.sender?.user, // Keep populated data for display
        senderType: msg.sender?.userType
      };
    });

    console.log("🎯 RECRUITER getMessages: Normalized message structure sample:", {
      originalSample: messages[0]?.sender,
      normalizedSample: normalizedMessages[0]?.sender,
      normalizedSampleType: typeof normalizedMessages[0]?.sender,
      messageCount: normalizedMessages.length,
      orgId: orgId,
      orgIdType: typeof orgId,
      firstNormalizedMessage: normalizedMessages[0]
    });

    return res.status(200).json({
      success: true,
      message: "Chat history fetched successfully",
      otherUser: otherParticipant.user,
      messages: normalizedMessages, // ✅ Use normalized messages
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

const clearMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { orgId } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: "Conversation not found" 
      });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.user.toString() === orgId && participant.userType === "BusinessProfile"
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you are not a member of this conversation",
      });
    }

    await Message.deleteMany({ conversationId });
    await conversation.updateLastMessage("", null, null);

    res.status(200).json({
      success: true,
      message: "Messages cleared successfully",
    });
  } catch (error) {
    console.error("❌ Error clearing messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear messages",
      error: error.message,
    });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { orgId } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: "Conversation not found" 
      });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.user.toString() === orgId && participant.userType === "BusinessProfile"
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you are not a member of this conversation",
      });
    }

    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
      error: error.message,
    });
  }
};

const deleteRecruiterAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find and delete the business profile first
    const businessProfile = await Business.findOne({ userId: userId });
    if (businessProfile) {
      await Business.findByIdAndDelete(businessProfile._id);
      console.log(`Business profile deleted - ID: ${businessProfile._id}`);
    }

    // Delete the user from database
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Clear all authentication cookies
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };

    res.clearCookie("jwt-mesdo", cookieOptions);
    res.clearCookie("jwt-mesdo-fallback", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("jwt-mesdo-legacy", {
      httpOnly: true,
      secure: true,
      path: "/",
    });

    console.log(`Recruiter account deleted successfully - User ID: ${userId}, Email: ${deletedUser.email}`);

    res.json({
      message: "Account deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting recruiter account:", error);
    res.status(500).json({
      message: "Failed to delete account",
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
  clearMessages,
  deleteConversation,
  deleteRecruiterAccount,
};
