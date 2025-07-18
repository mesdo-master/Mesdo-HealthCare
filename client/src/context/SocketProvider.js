import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [activeConversations, setActiveConversations] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());

  // Get authentication state
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  // Event listeners storage
  const eventListeners = useRef(new Map());

  // Maximum reconnection attempts
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Get stored JWT token for authentication
  const getAuthToken = useCallback(() => {
    return localStorage.getItem("jwt-mesdo-token");
  }, []);

  // Socket utility functions (defined before socketUtils object)
  const emit = useCallback(
    (event, data) => {
      if (!socketRef.current || !isConnected) {
        console.warn(`🔌 Socket: Cannot emit ${event} - not connected`);
        return false;
      }

      socketRef.current.emit(event, data);
      return true;
    },
    [isConnected]
  );

  const on = useCallback((event, callback) => {
    if (!socketRef.current) return;

    socketRef.current.on(event, callback);

    // Store listener for cleanup
    if (!eventListeners.current.has(event)) {
      eventListeners.current.set(event, new Set());
    }
    eventListeners.current.get(event).add(callback);
  }, []);

  const off = useCallback((event, callback) => {
    if (!socketRef.current) return;

    socketRef.current.off(event, callback);

    // Remove from stored listeners
    if (eventListeners.current.has(event)) {
      eventListeners.current.get(event).delete(callback);
    }
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!currentUser || !isAuthenticated) {
      console.log("🔌 Socket: User not authenticated, skipping connection");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.log("🔌 Socket: No auth token found, skipping connection");
      return;
    }

    console.log("🔌 Socket: Initializing connection...");

    const newSocket = io(
      process.env.REACT_APP_SOCKET_URL ||
        "https://mesdo-healthcare-1.onrender.com",
      {
        auth: {
          token: token,
        },
        query: {
          userId: currentUser._id,
          userType: "User",
        },
        withCredentials: true,
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      }
    );

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);

      // Request online users list
      newSocket.emit("get-online-users");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);

      // Clear state on disconnect
      setOnlineUsers(new Map());
      setTypingUsers(new Map());
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      setReconnectAttempts(attemptNumber);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Socket reconnection attempt ${attemptNumber}`);
      setReconnectAttempts(attemptNumber);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ Socket reconnection error:", error);
      setConnectionError(error.message);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed after maximum attempts");
      setConnectionError("Connection failed after maximum attempts");
    });

    // User presence handlers
    newSocket.on("userOnline", (userData) => {
      console.log("👤 User came online:", userData.username);
      setOnlineUsers((prev) => {
        const updated = new Map(prev);
        updated.set(userData.userId, {
          ...userData,
          status: "online",
          lastSeen: new Date(),
        });
        return updated;
      });
    });

    newSocket.on("userOffline", (userData) => {
      console.log("👤 User went offline:", userData.username);
      setOnlineUsers((prev) => {
        const updated = new Map(prev);
        updated.set(userData.userId, {
          ...userData,
          status: "offline",
          lastSeen: new Date(userData.lastSeen),
        });
        return updated;
      });
    });

    newSocket.on("online-users", (users) => {
      console.log("👥 Received online users list:", users.length);
      const usersMap = new Map();
      users.forEach((user) => {
        usersMap.set(user.userId, {
          ...user,
          status: "online",
        });
      });
      setOnlineUsers(usersMap);
    });

    // Typing indicators
    newSocket.on("user-typing", (data) => {
      const { conversationId, userId, username, isTyping } = data;

      setTypingUsers((prev) => {
        const updated = new Map(prev);
        const conversationTyping = updated.get(conversationId) || new Map();

        if (isTyping) {
          conversationTyping.set(userId, { username, timestamp: Date.now() });
        } else {
          conversationTyping.delete(userId);
        }

        if (conversationTyping.size > 0) {
          updated.set(conversationId, conversationTyping);
        } else {
          updated.delete(conversationId);
        }

        return updated;
      });
    });

    // Conversation management
    newSocket.on("conversation-joined", (data) => {
      console.log("💬 Joined conversation:", data.conversationId);
      setActiveConversations((prev) => new Set([...prev, data.conversationId]));
    });

    newSocket.on("conversation-left", (data) => {
      console.log("💬 Left conversation:", data.conversationId);
      setActiveConversations((prev) => {
        const updated = new Set(prev);
        updated.delete(data.conversationId);
        return updated;
      });
    });

    newSocket.on("user-joined-conversation", (data) => {
      console.log("👤 User joined conversation:", data.username);
    });

    newSocket.on("user-left-conversation", (data) => {
      console.log("👤 User left conversation:", data.username);
    });

    // Error handling
    newSocket.on("error", (error) => {
      console.error("❌ Socket error:", error);
      setConnectionError(error.message);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return newSocket;
  }, [currentUser, isAuthenticated, getAuthToken]);

  // Cleanup socket connection
  const cleanup = useCallback(() => {
    if (socketRef.current) {
      console.log("🧹 Cleaning up socket connection");

      // Remove all event listeners
      eventListeners.current.forEach((listeners, event) => {
        listeners.forEach((listener) => {
          socketRef.current.off(event, listener);
        });
      });
      eventListeners.current.clear();

      // Disconnect socket
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers(new Map());
      setActiveConversations(new Set());
      setTypingUsers(new Map());
    }
  }, []);

  // Initialize socket when user is authenticated
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      const newSocket = initializeSocket();

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    } else {
      cleanup();
    }
  }, [currentUser, isAuthenticated, initializeSocket, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Socket utility functions object
  const socketUtils = {
    // Event listener management
    on,
    off,
    emit,

    // Conversation management
    joinConversation: useCallback(
      (conversationId) => {
        return emit("join-conversation", { conversationId });
      },
      [emit]
    ),

    leaveConversation: useCallback(
      (conversationId) => {
        return emit("leave-conversation", { conversationId });
      },
      [emit]
    ),

    // Message operations
    sendMessage: useCallback(
      (messageData) => {
        return emit("send-message", messageData);
      },
      [emit]
    ),

    markMessageRead: useCallback(
      (messageId) => {
        return emit("mark-message-read", { messageId });
      },
      [emit]
    ),

    addReaction: useCallback(
      (messageId, emoji) => {
        return emit("add-reaction", { messageId, emoji });
      },
      [emit]
    ),

    // Typing indicators
    startTyping: useCallback(
      (conversationId) => {
        return emit("typing-start", { conversationId });
      },
      [emit]
    ),

    stopTyping: useCallback(
      (conversationId) => {
        return emit("typing-stop", { conversationId });
      },
      [emit]
    ),

    // User presence
    getOnlineUsers: useCallback(() => {
      return emit("get-online-users");
    }, [emit]),

    // Connection management
    reconnect: useCallback(() => {
      if (socketRef.current) {
        socketRef.current.connect();
      } else {
        initializeSocket();
      }
    }, [initializeSocket]),

    disconnect: useCallback(() => {
      cleanup();
    }, [cleanup]),
  };

  // Context value
  const contextValue = {
    socket: socketRef.current,
    isConnected,
    connectionError,
    reconnectAttempts,
    onlineUsers,
    activeConversations,
    typingUsers,
    ...socketUtils,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hooks for specific socket functionality
export const useSocketConnection = () => {
  const { isConnected, connectionError, reconnectAttempts, reconnect } =
    useSocket();
  return { isConnected, connectionError, reconnectAttempts, reconnect };
};

export const useOnlineUsers = () => {
  const { onlineUsers } = useSocket();
  return onlineUsers;
};

export const useTypingIndicators = (conversationId) => {
  const { typingUsers } = useSocket();
  return typingUsers.get(conversationId) || new Map();
};

export const useConversationSocket = (conversationId) => {
  const {
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageRead,
    addReaction,
    startTyping,
    stopTyping,
    on,
    off,
  } = useSocket();

  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);

      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, joinConversation, leaveConversation]);

  return {
    sendMessage,
    markMessageRead,
    addReaction,
    startTyping,
    stopTyping,
    on,
    off,
  };
};
