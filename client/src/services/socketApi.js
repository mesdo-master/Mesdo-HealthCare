import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://mesdo-healthcare-1.onrender.com";

// Create axios instance with default config
const socketApi = axios.create({
  baseURL: `${API_BASE_URL}/api/socket`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
socketApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt-mesdo-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
socketApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("jwt-mesdo-token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * Conversation API methods
 */
export const conversationApi = {
  // Get user conversations
  getConversations: async (params = {}) => {
    const response = await socketApi.get("/conversations", { params });
    return response.data;
  },

  // Create new conversation
  createConversation: async (conversationData) => {
    const response = await socketApi.post("/conversations", conversationData);
    return response.data;
  },

  // Get conversation messages
  getMessages: async (conversationId, params = {}) => {
    const response = await socketApi.get(
      `/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },

  // Add participant to conversation
  addParticipant: async (conversationId, participantData) => {
    const response = await socketApi.post(
      `/conversations/${conversationId}/participants`,
      participantData
    );
    return response.data;
  },

  // Remove participant from conversation
  removeParticipant: async (conversationId, participantData) => {
    const response = await socketApi.delete(
      `/conversations/${conversationId}/participants`,
      {
        data: participantData,
      }
    );
    return response.data;
  },
};

/**
 * Message API methods
 */
export const messageApi = {
  // Send message (REST fallback)
  sendMessage: async (messageData) => {
    const response = await socketApi.post("/messages", messageData);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (messageIds) => {
    const response = await socketApi.patch("/messages/read", { messageIds });
    return response.data;
  },

  // Get unread messages count
  getUnreadCount: async () => {
    const response = await socketApi.get("/messages/unread-count");
    return response.data;
  },
};

/**
 * User presence API methods
 */
export const presenceApi = {
  // Get online users
  getOnlineUsers: async () => {
    const response = await socketApi.get("/users/online");
    return response.data;
  },
};

/**
 * Utility functions
 */
export const socketApiUtils = {
  // Create a personal conversation
  createPersonalConversation: async (
    participantId,
    participantType = "User"
  ) => {
    return conversationApi.createConversation({
      participants: [
        {
          user: participantId,
          userType: participantType,
          role: "member",
        },
      ],
      category: "Personal",
    });
  },

  // Create a group conversation
  createGroupConversation: async (participants, name, description = "") => {
    return conversationApi.createConversation({
      participants,
      category: "Groups",
      name,
      description,
    });
  },

  // Create a job-related conversation
  createJobConversation: async (participants, jobId, organizationId) => {
    return conversationApi.createConversation({
      participants,
      category: "Jobs",
      jobId,
      organizationId,
    });
  },

  // Get conversations by category
  getConversationsByCategory: async (category, page = 1, limit = 20) => {
    return conversationApi.getConversations({
      category,
      page,
      limit,
    });
  },

  // Get messages with pagination
  getMessagesPaginated: async (conversationId, page = 1, limit = 50) => {
    return conversationApi.getMessages(conversationId, {
      page,
      limit,
    });
  },

  // Send text message
  sendTextMessage: async (conversationId, message) => {
    return messageApi.sendMessage({
      conversationId,
      message,
      messageType: "text",
    });
  },

  // Send image message
  sendImageMessage: async (conversationId, imageUrl, caption = "") => {
    return messageApi.sendMessage({
      conversationId,
      message: caption,
      messageType: "image",
      attachments: [
        {
          type: "image",
          url: imageUrl,
        },
      ],
    });
  },

  // Send file message
  sendFileMessage: async (conversationId, fileUrl, filename, mimeType) => {
    return messageApi.sendMessage({
      conversationId,
      message: `Shared file: ${filename}`,
      messageType: "file",
      attachments: [
        {
          type: "file",
          url: fileUrl,
          filename,
          mimeType,
        },
      ],
    });
  },

  // Handle API errors
  handleApiError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return {
            type: "validation",
            message: data.message || "Invalid request data",
          };
        case 401:
          return {
            type: "authentication",
            message: "Authentication required",
          };
        case 403:
          return {
            type: "authorization",
            message: "Access denied",
          };
        case 404:
          return {
            type: "not_found",
            message: "Resource not found",
          };
        case 429:
          return {
            type: "rate_limit",
            message: "Too many requests",
          };
        case 500:
          return {
            type: "server_error",
            message: "Internal server error",
          };
        default:
          return {
            type: "unknown",
            message: data.message || "An error occurred",
          };
      }
    } else if (error.request) {
      // Network error
      return {
        type: "network",
        message: "Network error. Please check your connection.",
      };
    } else {
      // Other error
      return {
        type: "unknown",
        message: error.message || "An unexpected error occurred",
      };
    }
  },
};

export default socketApi;
