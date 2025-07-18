const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);

// Import models
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/user/User");
const BusinessProfile = require("../models/recruiter/BusinessProfile");
const Notification = require("../models/user/Notification");

// Import middleware
const {
  authenticateSocket,
  rateLimitSocket,
  validateMessage,
  handleSocketError,
  validateConnection,
} = require("../middleware/socketMiddleware");

// Socket.IO server with enhanced configuration
const io = new Server(server, {
  cors: {
    origin: [
      "https://mesdo.vercel.app",
      "https://mesdo-health-care-u5s9.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB for file uploads
  allowEIO3: true,
  connectionStateRecovery: {
    // Enable connection state recovery
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

// Apply middleware
io.use(authenticateSocket);
io.use(rateLimitSocket(100, 60000)); // 100 requests per minute
io.use(validateConnection);

// Active users tracking
const activeUsers = new Map();
const userRooms = new Map();
const conversationRooms = new Map();

// Utility functions
const getUserRoom = (userId) => `user_${userId}`;
const getConversationRoom = (conversationId) =>
  `conversation_${conversationId}`;

// Room management utilities
const joinUserRoom = (socket, userId) => {
  const userRoom = getUserRoom(userId);
  socket.join(userRoom);

  if (!userRooms.has(userId)) {
    userRooms.set(userId, new Set());
  }
  userRooms.get(userId).add(socket.id);

  console.log(`👤 User ${userId} joined personal room: ${userRoom}`);
};

const leaveUserRoom = (socket, userId) => {
  const userRoom = getUserRoom(userId);
  socket.leave(userRoom);

  if (userRooms.has(userId)) {
    userRooms.get(userId).delete(socket.id);
    if (userRooms.get(userId).size === 0) {
      userRooms.delete(userId);
    }
  }

  console.log(`👤 User ${userId} left personal room: ${userRoom}`);
};

const joinConversationRoom = (socket, conversationId) => {
  const conversationRoom = getConversationRoom(conversationId);
  socket.join(conversationRoom);

  if (!conversationRooms.has(conversationId)) {
    conversationRooms.set(conversationId, new Set());
  }
  conversationRooms.get(conversationId).add(socket.id);

  console.log(
    `💬 Socket ${socket.id} joined conversation: ${conversationRoom}`
  );
};

const leaveConversationRoom = (socket, conversationId) => {
  const conversationRoom = getConversationRoom(conversationId);
  socket.leave(conversationRoom);

  if (conversationRooms.has(conversationId)) {
    conversationRooms.get(conversationId).delete(socket.id);
    if (conversationRooms.get(conversationId).size === 0) {
      conversationRooms.delete(conversationId);
    }
  }

  console.log(`💬 Socket ${socket.id} left conversation: ${conversationRoom}`);
};

// Broadcast to conversation participants
const broadcastToConversation = async (
  conversationId,
  event,
  data,
  excludeSocketId = null
) => {
  const conversationRoom = getConversationRoom(conversationId);

  if (excludeSocketId) {
    io.to(conversationRoom).except(excludeSocketId).emit(event, data);
  } else {
    io.to(conversationRoom).emit(event, data);
  }
};

// Broadcast to user's personal room
const broadcastToUser = (userId, event, data) => {
  const userRoom = getUserRoom(userId);
  io.to(userRoom).emit(event, data);
};

// Send notification to user
const sendNotificationToUser = async (userId, notificationData) => {
  try {
    // Create notification in database
    const notification = new Notification({
      recipient: userId,
      sender: notificationData.senderId,
      type: notificationData.type,
      data: notificationData.data,
      mode: notificationData.mode || "individual",
    });

    await notification.save();

    // Broadcast to user's room
    broadcastToUser(userId, "newNotification", {
      id: notification._id,
      type: notification.type,
      data: notification.data,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
    });

    console.log(
      `🔔 Notification sent to user ${userId}: ${notificationData.type}`
    );
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};

// Main socket connection handler
io.on("connection", (socket) => {
  console.log(`🔌 New socket connection: ${socket.id}`);
  console.log(`👤 User: ${socket.user.username} (${socket.user._id})`);

  // Store active user with enhanced tracking
  activeUsers.set(socket.user._id.toString(), {
    socketId: socket.id,
    userId: socket.user._id,
    username: socket.user.username,
    userType: socket.userType,
    connectedAt: new Date(),
    lastSeen: new Date(),
    status: "online",
    deviceInfo: {
      userAgent: socket.handshake.headers["user-agent"],
      ip: socket.handshake.address,
    },
  });

  // Join user's personal room
  joinUserRoom(socket, socket.user._id);

  // Emit user online status
  socket.broadcast.emit("userOnline", {
    userId: socket.user._id,
    username: socket.user.username,
    userType: socket.userType,
    status: "online",
  });

  // Handle joining conversations
  socket.on("join-conversation", async (data) => {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        return handleSocketError(
          socket,
          new Error("Conversation ID is required"),
          "join-conversation"
        );
      }

      // Verify user is participant in conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return handleSocketError(
          socket,
          new Error("Conversation not found"),
          "join-conversation"
        );
      }

      const isParticipant = conversation.isParticipant(
        socket.user._id,
        socket.userType
      );
      if (!isParticipant) {
        return handleSocketError(
          socket,
          new Error("Not authorized to join this conversation"),
          "join-conversation"
        );
      }

      // Join conversation room
      joinConversationRoom(socket, conversationId);

      // Update user's last seen in conversation
      const participant = conversation.participants.find(
        (p) =>
          p.user.toString() === socket.user._id.toString() &&
          p.userType === socket.userType
      );
      if (participant) {
        participant.lastSeen = new Date();
        await conversation.save();
      }

      // Emit success
      socket.emit("conversation-joined", {
        conversationId,
        message: "Successfully joined conversation",
        participantCount: conversation.participants.length,
      });

      // Notify other participants
      broadcastToConversation(
        conversationId,
        "user-joined-conversation",
        {
          userId: socket.user._id,
          username: socket.user.username,
          userType: socket.userType,
          conversationId,
          timestamp: new Date(),
        },
        socket.id
      );
    } catch (error) {
      handleSocketError(socket, error, "join-conversation");
    }
  });

  // Handle leaving conversations
  socket.on("leave-conversation", async (data) => {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        return handleSocketError(
          socket,
          new Error("Conversation ID is required"),
          "leave-conversation"
        );
      }

      // Leave conversation room
      leaveConversationRoom(socket, conversationId);

      // Emit success
      socket.emit("conversation-left", {
        conversationId,
        message: "Successfully left conversation",
      });

      // Notify other participants
      broadcastToConversation(
        conversationId,
        "user-left-conversation",
        {
          userId: socket.user._id,
          username: socket.user.username,
          userType: socket.userType,
          conversationId,
          timestamp: new Date(),
        },
        socket.id
      );
    } catch (error) {
      handleSocketError(socket, error, "leave-conversation");
    }
  });

  // Handle sending messages with enhanced validation
  socket.on("send-message", async (data) => {
    try {
      // Validate message data
      validateMessage(socket, data, (error) => {
        if (error) {
          return handleSocketError(socket, error, "send-message");
        }
      });

      const {
        conversationId,
        message,
        messageType = "text",
        category = "Personal",
        priority = "normal",
        attachments = [],
        replyTo,
        receiverId,
        receiverType,
      } = data;

      // Verify conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return handleSocketError(
          socket,
          new Error("Conversation not found"),
          "send-message"
        );
      }

      const isParticipant = conversation.isParticipant(
        socket.user._id,
        socket.userType
      );
      if (!isParticipant) {
        return handleSocketError(
          socket,
          new Error("Not authorized to send messages to this conversation"),
          "send-message"
        );
      }

      // Create message
      const newMessage = await Message.createMessage({
        conversationId,
        senderId: socket.user._id,
        senderType: socket.userType,
        receiverId,
        receiverType,
        message,
        messageType,
        category,
        priority,
        attachments,
        replyTo,
      });

      // Update conversation
      await conversation.updateLastMessage(
        message,
        socket.user._id,
        socket.userType
      );

      // Populate message for response
      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender.user", "username name profilePicture")
        .populate("receiver.user", "username name profilePicture")
        .populate("replyTo");

      // Broadcast to conversation participants
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
        priority: populatedMessage.priority,
        attachments: populatedMessage.attachments,
        replyTo: populatedMessage.replyTo,
        status: populatedMessage.status,
        createdAt: populatedMessage.createdAt,
        reactions: populatedMessage.reactions,
        readBy: populatedMessage.readBy,
      });

      // Send notifications to offline participants
      for (const participant of conversation.participants) {
        if (participant.user.toString() !== socket.user._id.toString()) {
          const isOnline = activeUsers.has(participant.user.toString());

          if (!isOnline) {
            await sendNotificationToUser(participant.user, {
              senderId: socket.user._id,
              type: "new_message",
              data: {
                username: socket.user.username,
                fullName: socket.user.name,
                profileImage: socket.user.profilePicture,
                message:
                  message.length > 50
                    ? message.substring(0, 50) + "..."
                    : message,
                conversationId: conversationId,
                messageType: messageType,
              },
              mode: "individual",
            });
          }
        }
      }

      // Emit success to sender
      socket.emit("message-sent", {
        messageId: populatedMessage._id,
        status: "delivered",
        timestamp: new Date(),
      });

      console.log(
        `📨 Message sent in conversation ${conversationId} by ${socket.user.username}`
      );
    } catch (error) {
      handleSocketError(socket, error, "send-message");
    }
  });

  // Handle message reactions
  socket.on("add-reaction", async (data) => {
    try {
      const { messageId, emoji } = data;

      if (!messageId || !emoji) {
        return handleSocketError(
          socket,
          new Error("Message ID and emoji are required"),
          "add-reaction"
        );
      }

      const message = await Message.findById(messageId);
      if (!message) {
        return handleSocketError(
          socket,
          new Error("Message not found"),
          "add-reaction"
        );
      }

      await message.addReaction(socket.user._id, socket.userType, emoji);

      // Broadcast to conversation
      broadcastToConversation(
        message.conversationId,
        "message-reaction-added",
        {
          messageId,
          userId: socket.user._id,
          userType: socket.userType,
          username: socket.user.username,
          emoji,
          timestamp: new Date(),
        }
      );
    } catch (error) {
      handleSocketError(socket, error, "add-reaction");
    }
  });

  // Handle message read receipts
  socket.on("mark-message-read", async (data) => {
    try {
      const { messageId } = data;

      if (!messageId) {
        return handleSocketError(
          socket,
          new Error("Message ID is required"),
          "mark-message-read"
        );
      }

      const message = await Message.findById(messageId);
      if (!message) {
        return handleSocketError(
          socket,
          new Error("Message not found"),
          "mark-message-read"
        );
      }

      await message.markAsRead(socket.user._id, socket.userType);

      // Broadcast to conversation
      broadcastToConversation(message.conversationId, "message-read", {
        messageId,
        userId: socket.user._id,
        userType: socket.userType,
        username: socket.user.username,
        readAt: new Date(),
      });
    } catch (error) {
      handleSocketError(socket, error, "mark-message-read");
    }
  });

  // Handle typing indicators with throttling
  socket.on("typing-start", (data) => {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        return handleSocketError(
          socket,
          new Error("Conversation ID is required"),
          "typing-start"
        );
      }

      broadcastToConversation(
        conversationId,
        "user-typing",
        {
          userId: socket.user._id,
          username: socket.user.username,
          userType: socket.userType,
          isTyping: true,
          timestamp: new Date(),
        },
        socket.id
      );
    } catch (error) {
      handleSocketError(socket, error, "typing-start");
    }
  });

  socket.on("typing-stop", (data) => {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        return handleSocketError(
          socket,
          new Error("Conversation ID is required"),
          "typing-stop"
        );
      }

      broadcastToConversation(
        conversationId,
        "user-typing",
        {
          userId: socket.user._id,
          username: socket.user.username,
          userType: socket.userType,
          isTyping: false,
          timestamp: new Date(),
        },
        socket.id
      );
    } catch (error) {
      handleSocketError(socket, error, "typing-stop");
    }
  });

  // Handle getting online users
  socket.on("get-online-users", () => {
    try {
      const onlineUsers = Array.from(activeUsers.values()).map((user) => ({
        userId: user.userId,
        username: user.username,
        userType: user.userType,
        status: user.status,
        lastSeen: user.lastSeen,
      }));

      socket.emit("online-users", {
        users: onlineUsers,
        count: onlineUsers.length,
        timestamp: new Date(),
      });
    } catch (error) {
      handleSocketError(socket, error, "get-online-users");
    }
  });

  // Handle heartbeat/ping
  socket.on("ping", () => {
    socket.emit("pong", { timestamp: new Date() });
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id}, reason: ${reason}`);

    // Update user status
    const user = activeUsers.get(socket.user._id.toString());
    if (user) {
      user.status = "offline";
      user.lastSeen = new Date();

      // Keep user in activeUsers for a short time for reconnection
      setTimeout(() => {
        activeUsers.delete(socket.user._id.toString());
      }, 30000); // 30 seconds
    }

    // Leave user room
    leaveUserRoom(socket, socket.user._id);

    // Leave all conversation rooms
    const userConversations = Array.from(conversationRooms.keys()).filter(
      (convId) => {
        const roomSockets = conversationRooms.get(convId);
        return roomSockets && roomSockets.has(socket.id);
      }
    );

    userConversations.forEach((convId) => {
      leaveConversationRoom(socket, convId);
    });

    // Broadcast user offline status
    socket.broadcast.emit("userOffline", {
      userId: socket.user._id,
      username: socket.user.username,
      userType: socket.userType,
      status: "offline",
      lastSeen: new Date(),
    });

    console.log(`👤 User ${socket.user.username} disconnected`);
  });

  // Handle errors
  socket.on("error", (error) => {
    handleSocketError(socket, error, "socket-error");
  });
});

// Global error handling
io.on("error", (error) => {
  console.error("❌ Socket.IO server error:", error);
});

// Periodic cleanup of inactive users
setInterval(() => {
  const now = Date.now();
  const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

  for (const [userId, user] of activeUsers.entries()) {
    if (now - user.lastSeen.getTime() > inactiveThreshold) {
      activeUsers.delete(userId);
      console.log(`🧹 Cleaned up inactive user: ${user.username}`);
    }
  }
}, 60000); // Run every minute

// Export for use in other modules
module.exports = {
  io,
  app,
  server,
  activeUsers,
  broadcastToUser,
  sendNotificationToUser,
  broadcastToConversation,
  getUserRoom,
  getConversationRoom,
};
