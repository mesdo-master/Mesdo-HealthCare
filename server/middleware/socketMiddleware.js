const jwt = require("jsonwebtoken");
const User = require("../models/user/User");
const BusinessProfile = require("../models/recruiter/BusinessProfile");

/**
 * Socket authentication middleware
 */
const authenticateSocket = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token =
      socket.handshake.auth.token ||
      socket.handshake.query.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new Error("User not found"));
    }

    // Check if user is verified
    if (!user.isVerified) {
      return next(new Error("User not verified"));
    }

    // Attach user info to socket
    socket.user = user;
    socket.userType = "User";
    socket.authenticated = true;

    console.log(`🔐 Socket authenticated: ${user.username} (${user._id})`);
    next();
  } catch (error) {
    console.error("❌ Socket authentication error:", error.message);
    next(new Error("Authentication failed"));
  }
};

/**
 * Rate limiting middleware for socket events
 */
const rateLimitSocket = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map();

  return (socket, next) => {
    const userId = socket.user?._id?.toString();
    if (!userId) return next();

    const now = Date.now();
    const userRequests = requests.get(userId) || [];

    // Clean old requests
    const validRequests = userRequests.filter((time) => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      return next(new Error("Rate limit exceeded"));
    }

    validRequests.push(now);
    requests.set(userId, validRequests);

    next();
  };
};

/**
 * Conversation authorization middleware
 */
const authorizeConversation = async (socket, conversationId, next) => {
  try {
    const Conversation = require("../models/Conversation");

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new Error("Conversation not found"));
    }

    const isParticipant = conversation.isParticipant(
      socket.user._id,
      socket.userType
    );
    if (!isParticipant) {
      return next(new Error("Not authorized to access this conversation"));
    }

    socket.currentConversation = conversation;
    next();
  } catch (error) {
    console.error("❌ Conversation authorization error:", error.message);
    next(new Error("Authorization failed"));
  }
};

/**
 * Message validation middleware
 */
const validateMessage = (socket, messageData, next) => {
  const { conversationId, message, messageType = "text" } = messageData;

  // Required fields
  if (!conversationId || !message) {
    return next(new Error("Conversation ID and message are required"));
  }

  // Message length validation
  if (message.length > 5000) {
    return next(new Error("Message too long (max 5000 characters)"));
  }

  // Message type validation
  const validTypes = [
    "text",
    "image",
    "file",
    "audio",
    "video",
    "location",
    "system",
  ];
  if (!validTypes.includes(messageType)) {
    return next(new Error("Invalid message type"));
  }

  // Sanitize message content
  messageData.message = message.trim();

  next();
};

/**
 * Typing indicator throttling
 */
const throttleTyping = () => {
  const typingTimers = new Map();

  return (socket, conversationId, next) => {
    const userId = socket.user._id.toString();
    const key = `${userId}-${conversationId}`;

    // Clear existing timer
    if (typingTimers.has(key)) {
      clearTimeout(typingTimers.get(key));
    }

    // Set new timer to auto-stop typing
    const timer = setTimeout(() => {
      socket.emit("typing-stop", { conversationId });
      typingTimers.delete(key);
    }, 3000);

    typingTimers.set(key, timer);
    next();
  };
};

/**
 * Event logging middleware
 */
const logSocketEvent = (eventName) => {
  return (socket, data, next) => {
    console.log(
      `📡 Socket Event: ${eventName} from ${socket.user?.username} (${socket.id})`
    );
    if (data && typeof data === "object") {
      console.log(`📡 Event Data:`, JSON.stringify(data, null, 2));
    }
    next();
  };
};

/**
 * Error handling middleware
 */
const handleSocketError = (socket, error, eventName) => {
  console.error(`❌ Socket Error in ${eventName}:`, error.message);

  socket.emit("error", {
    event: eventName,
    message: error.message,
    timestamp: new Date().toISOString(),
  });

  // Log error for monitoring
  if (process.env.NODE_ENV === "production") {
    // Here you could send to error tracking service
    console.error("Production Socket Error:", {
      userId: socket.user?._id,
      username: socket.user?.username,
      event: eventName,
      error: error.message,
      stack: error.stack,
    });
  }
};

/**
 * Connection validation middleware
 */
const validateConnection = (socket, next) => {
  // Check if user is still active
  if (!socket.user || !socket.authenticated) {
    return next(new Error("Invalid connection state"));
  }

  // Check connection limits
  const maxConnections = process.env.MAX_CONNECTIONS_PER_USER || 5;
  const userConnections = Array.from(
    socket.server.sockets.sockets.values()
  ).filter((s) => s.user?._id?.toString() === socket.user._id.toString());

  if (userConnections.length > maxConnections) {
    return next(new Error("Too many connections"));
  }

  next();
};

module.exports = {
  authenticateSocket,
  rateLimitSocket,
  authorizeConversation,
  validateMessage,
  throttleTyping,
  logSocketEvent,
  handleSocketError,
  validateConnection,
};
