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
    const userType = (req.user?.role === 'recruiter') ? 'BusinessProfile' : 'User';
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

      // ✅ FIXED: Normalize message structure for group chats too
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
          sender: actualSenderId, // ✅ Use the actual ID for alignment
          senderData: msg.sender?.user, // Keep populated data for display
          senderType: msg.sender?.userType
        };
      });

      return res.status(200).json({
        success: true,
        message: "Group chat history fetched successfully",
        otherUsers,
        messages: normalizedMessages, // ✅ Use normalized messages
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
      console.log('🔍 SERVER DEBUG: Finding other participant:', {
        userId: userId,
        userIdType: typeof userId,
        participants: conversation.participants.map(p => ({
          userId: p.user._id,
          userType: p.userType,
          userName: p.user.name
        }))
      });
      
      const otherParticipant = conversation.participants.find(
        (participant) => participant.user._id.toString() !== userId.toString()
      );
      
      console.log('🎯 SERVER DEBUG: Other participant found:', {
        otherParticipant: otherParticipant ? {
          userId: otherParticipant.user._id,
          userName: otherParticipant.user.name,
          userType: otherParticipant.userType
        } : null
      });

      // ✅ FIXED: Normalize message structure for consistent alignment
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
          sender: actualSenderId, // ✅ Use the actual ID for alignment
          senderData: msg.sender?.user, // Keep populated data for display
          senderType: msg.sender?.userType
        };
      });

      console.log("🎯 USER getChatHistory: Normalized message structure sample:", {
        originalSample: messages[0]?.sender,
        normalizedSample: normalizedMessages[0]?.sender,
        messageCount: normalizedMessages.length
      });

      return res.status(200).json({
        success: true,
        message: "Chat history fetched successfully",
        otherUser: otherParticipant ? otherParticipant.user : null,
        messages: normalizedMessages, // ✅ Use normalized messages
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
    console.log("🎯 CHAT CONTROLLER: sendMessage called with:", req.body);
    console.log("🎯 CHAT CONTROLLER: req.user:", req.user);

    const { receiverId, text, conversationId } = req.body;
    
    // Enhanced user validation
    if (!req.user || !req.user._id) {
      console.error("❌ User authentication failed:", req.user);
      return res.status(401).json({ 
        error: 'User not authenticated.', 
        success: false 
      });
    }

    // ✅ FIXED: Determine correct sender ID based on user role
    let senderId = req.user._id;
    let senderUserType = 'User';
    
    if (req.user?.role === 'recruiter') {
      // For recruiters, use business profile ID as sender
      const businessProfile = await Business.findOne({ userId: req.user._id });
      if (businessProfile) {
        senderId = businessProfile._id;
        senderUserType = 'BusinessProfile';
        console.log("✅ CHAT: Recruiter message - using business profile ID:", senderId);
      } else {
        console.warn("⚠️ CHAT: Recruiter has no business profile, using user ID");
        senderUserType = 'User';
      }
    }

    console.log("📨 Authenticated user details:", {
      originalUserId: req.user._id,
      actualSenderId: senderId,
      senderUserType,
      userRole: req.user?.role || 'no-role',
      hasUser: !!req.user,
      userObject: req.user ? 'present' : 'missing'
    });

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

      try {
        // Try to find conversation with both User types first
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
                  userType: { $in: ["User", "BusinessProfile"] },
                },
              },
            },
          ],
          category: { $in: ["Personal", "Recruitment"] },
          status: "active",
        });

        console.log(
          "🔍 Found existing conversation:",
          conversation ? "Yes" : "No"
        );

        if (!conversation) {
          console.log("🆕 Creating new conversation");

          // Verify receiver exists (try both User and BusinessProfile)
          let receiverExists = await User.findById(receiverId);
          let receiverUserType = "User";

          if (!receiverExists) {
            receiverExists = await Business.findById(receiverId);
            receiverUserType = "BusinessProfile";
          }

          if (!receiverExists) {
            console.log("❌ Receiver not found in either collection:", receiverId);
            return res.status(404).json({
              error: "Receiver not found.",
              success: false,
            });
          }

          console.log("✅ Receiver found in", receiverUserType, "collection");

          // Create new conversation with appropriate user types
          const participants = [
            {
              user: senderId,
              userType: "User",
              role: "owner",
              joinedAt: new Date(),
            },
            {
              user: receiverId,
              userType: receiverUserType,
              role: "member",
              joinedAt: new Date(),
            },
          ];

          const conversationCategory = receiverUserType === "BusinessProfile" ? "Recruitment" : "Personal";

          conversation = await Conversation.create({
            participants: participants,
            category: conversationCategory,
            isGroup: false,
            isPrivate: true,
            createdBy: {
              user: senderId,
              userType: "User",
            },
            status: "active",
          });

          console.log("✅ New conversation created:", conversation._id, "Category:", conversationCategory);
        }
      } catch (conversationError) {
        console.error("❌ Error during conversation lookup/creation:", conversationError);
        return res.status(500).json({
          error: "Failed to find or create conversation.",
          details: conversationError.message,
          success: false,
        });
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
      console.log("🔍 Looking up receiver:", receiverId);
      
      // Validate receiverId format
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        console.error("❌ Invalid receiverId format:", receiverId);
        return res.status(400).json({
          error: "Invalid receiver ID format.",
          success: false,
        });
      }

      try {
        // First try to find in User collection
        console.log("🔍 Attempting User.findById with:", receiverId);
        const receiver = await User.findById(receiverId);
        console.log("🔍 User lookup result:", receiver ? "Found" : "Not found");
        
        if (receiver && typeof receiver === 'object' && receiver._id) {
          console.log("✅ Found receiver in User collection:", {
            id: receiver._id,
            role: receiver.role || 'no-role',
            username: receiver.username || 'no-username',
            hasRole: 'role' in receiver,
            receiverType: typeof receiver,
            receiverKeys: Object.keys(receiver)
          });
          
          // Safely check role with fallback
          const receiverRole = receiver.role || 'user'; // Default to 'user' if role is missing
          messageData.receiver = {
            user: receiverId,
            userType: (receiverRole === 'recruiter') ? 'BusinessProfile' : 'User',
          };
        } else {
          // Try to find receiver in BusinessProfile if not found in User
          console.log("🔍 Trying BusinessProfile collection...");
          const businessReceiver = await Business.findById(receiverId);
          console.log("🔍 BusinessProfile lookup result:", businessReceiver ? "Found" : "Not found");
          
          if (businessReceiver && typeof businessReceiver === 'object' && businessReceiver._id) {
            console.log("✅ Found receiver in BusinessProfile collection:", businessReceiver._id);
            messageData.receiver = {
              user: receiverId,
              userType: 'BusinessProfile',
            };
          } else {
            console.warn(`⚠️ Receiver not found in either User or BusinessProfile: ${receiverId}`);
            // Don't add receiver if not found, but continue with message creation
            // This allows messages to be sent even if receiver lookup fails
          }
        }
      } catch (receiverError) {
        console.error("❌ Error during receiver lookup:", receiverError);
        console.error("❌ Receiver lookup error stack:", receiverError.stack);
        // Continue without receiver rather than failing the entire message
        console.warn("⚠️ Continuing message send without receiver due to lookup error");
      }
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
      sender: senderId, // ✅ FIXED: Use the correct sender ID 
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

    // ✅ FIXED: Normalize response message structure like recruiter controller
    const responseMessage = {
      ...populatedMessage,
      sender: senderId, // ✅ Use the actual sender ID for alignment
      senderData: populatedMessage.sender.user, // ✅ Populated data for display
      senderType: senderUserType
    };

    console.log("🎯 CHAT API: Sending normalized response with sender ID:", {
      senderId: senderId,
      senderData: populatedMessage.sender.user,
      responseMessageSender: responseMessage.sender
    });

    res.status(201).json({
      success: true,
      message: responseMessage,
      conversationId: conversation._id,
    });
  } catch (err) {
    console.error("❌ Message send error:", err);
    console.error("❌ Error stack:", err.stack);
    console.error("❌ Error name:", err.name);
    console.error("❌ Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err)));

    // Log additional context for debugging
    console.error("❌ Request context:", {
      body: req.body,
      userId: req.user?._id,
      userRole: req.user?.role,
      hasUser: !!req.user
    });

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

const clearMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: "Conversation not found" 
      });
    }

    const userType = (req.user?.role === 'recruiter') ? 'BusinessProfile' : 'User';
    const isParticipant = conversation.participants.some(
      (participant) => participant.user.toString() === userId.toString() && participant.userType === userType
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
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: "Conversation not found" 
      });
    }

    const userType = (req.user?.role === 'recruiter') ? 'BusinessProfile' : 'User';
    const isParticipant = conversation.participants.some(
      (participant) => participant.user.toString() === userId.toString() && participant.userType === userType
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

// Delete individual message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const userType = req.user?.role === 'recruiter' ? 'BusinessProfile' : 'User';

    console.log('🗑️ Delete message request:', { messageId, userId, userType });

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is the sender of the message
    const isSender = message.sender.user.toString() === userId.toString() && 
                     message.sender.userType === userType;

    if (!isSender) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    console.log('✅ Message deleted successfully:', messageId);

    // Broadcast to conversation participants
    broadcastToConversation(message.conversationId, 'messageDeleted', {
      messageId,
      conversationId: message.conversationId,
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

// Edit individual message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message: newMessageText } = req.body;
    const userId = req.user._id;
    const userType = req.user?.role === 'recruiter' ? 'BusinessProfile' : 'User';

    console.log('✏️ Edit message request:', { messageId, userId, userType, newMessageText });

    // Validate input
    if (!newMessageText || newMessageText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is the sender of the message
    const isSender = message.sender.user.toString() === userId.toString() && 
                     message.sender.userType === userType;

    if (!isSender) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    // Update the message
    message.message = newMessageText.trim();
    message.editedAt = new Date();
    await message.save();

    console.log('✅ Message edited successfully:', messageId);

    // Broadcast to conversation participants
    broadcastToConversation(message.conversationId, 'messageEdited', {
      messageId,
      conversationId: message.conversationId,
      newMessage: newMessageText.trim(),
      editedAt: message.editedAt,
    });

    res.status(200).json({
      success: true,
      message: "Message edited successfully",
      data: {
        messageId,
        newMessage: newMessageText.trim(),
        editedAt: message.editedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error editing message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit message",
      error: error.message,
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
  clearMessages,
  deleteConversation,
  deleteMessage,
  editMessage,
};
