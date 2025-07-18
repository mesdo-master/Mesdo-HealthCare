import { useEffect, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketProvider";

/**
 * Hook for handling real-time messages
 */
export const useMessages = (
  conversationId,
  onNewMessage,
  onMessageRead,
  onMessageReaction
) => {
  const { on, off, sendMessage, markMessageRead, addReaction } = useSocket();
  const listenersRef = useRef(new Set());

  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        onNewMessage?.(message);
      }
    };

    const handleMessageRead = (data) => {
      if (data.conversationId === conversationId) {
        onMessageRead?.(data);
      }
    };

    const handleMessageReaction = (data) => {
      if (data.conversationId === conversationId) {
        onMessageReaction?.(data);
      }
    };

    // Add event listeners
    on("newMessage", handleNewMessage);
    on("message-read", handleMessageRead);
    on("message-reaction-added", handleMessageReaction);

    // Store listeners for cleanup
    listenersRef.current.add(["newMessage", handleNewMessage]);
    listenersRef.current.add(["message-read", handleMessageRead]);
    listenersRef.current.add(["message-reaction-added", handleMessageReaction]);

    return () => {
      // Cleanup listeners
      listenersRef.current.forEach(([event, handler]) => {
        off(event, handler);
      });
      listenersRef.current.clear();
    };
  }, [conversationId, onNewMessage, onMessageRead, onMessageReaction, on, off]);

  return {
    sendMessage: useCallback(
      (messageData) => {
        return sendMessage({ ...messageData, conversationId });
      },
      [sendMessage, conversationId]
    ),

    markMessageRead: useCallback(
      (messageId) => {
        return markMessageRead(messageId);
      },
      [markMessageRead]
    ),

    addReaction: useCallback(
      (messageId, emoji) => {
        return addReaction(messageId, emoji);
      },
      [addReaction]
    ),
  };
};

/**
 * Hook for handling typing indicators
 */
export const useTypingIndicator = (conversationId) => {
  const { startTyping, stopTyping } = useSocket();
  const typingTimeoutRef = useRef(null);

  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    startTyping(conversationId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId);
    }, 2000);
  }, [conversationId, startTyping, stopTyping]);

  const handleStopTyping = useCallback(() => {
    if (!conversationId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    stopTyping(conversationId);
  }, [conversationId, stopTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { handleTyping, handleStopTyping };
};

/**
 * Hook for handling user presence
 */
export const useUserPresence = (onUserOnline, onUserOffline) => {
  const { on, off, getOnlineUsers } = useSocket();
  const listenersRef = useRef(new Set());

  useEffect(() => {
    const handleUserOnline = (userData) => {
      onUserOnline?.(userData);
    };

    const handleUserOffline = (userData) => {
      onUserOffline?.(userData);
    };

    // Add event listeners
    on("userOnline", handleUserOnline);
    on("userOffline", handleUserOffline);

    // Store listeners for cleanup
    listenersRef.current.add(["userOnline", handleUserOnline]);
    listenersRef.current.add(["userOffline", handleUserOffline]);

    // Get initial online users
    getOnlineUsers();

    return () => {
      // Cleanup listeners
      listenersRef.current.forEach(([event, handler]) => {
        off(event, handler);
      });
      listenersRef.current.clear();
    };
  }, [onUserOnline, onUserOffline, on, off, getOnlineUsers]);

  return { getOnlineUsers };
};

/**
 * Hook for handling notifications
 */
export const useNotifications = (onNewNotification) => {
  const { on, off } = useSocket();
  const listenersRef = useRef(new Set());

  useEffect(() => {
    const handleNewNotification = (notification) => {
      onNewNotification?.(notification);
    };

    // Add event listener
    on("newNotification", handleNewNotification);

    // Store listener for cleanup
    listenersRef.current.add(["newNotification", handleNewNotification]);

    return () => {
      // Cleanup listeners
      listenersRef.current.forEach(([event, handler]) => {
        off(event, handler);
      });
      listenersRef.current.clear();
    };
  }, [onNewNotification, on, off]);
};

/**
 * Hook for handling conversation events
 */
export const useConversationEvents = (
  onUserJoined,
  onUserLeft,
  onParticipantAdded,
  onParticipantRemoved
) => {
  const { on, off } = useSocket();
  const listenersRef = useRef(new Set());

  useEffect(() => {
    const handleUserJoined = (data) => {
      onUserJoined?.(data);
    };

    const handleUserLeft = (data) => {
      onUserLeft?.(data);
    };

    const handleParticipantAdded = (data) => {
      onParticipantAdded?.(data);
    };

    const handleParticipantRemoved = (data) => {
      onParticipantRemoved?.(data);
    };

    // Add event listeners
    on("user-joined-conversation", handleUserJoined);
    on("user-left-conversation", handleUserLeft);
    on("participant-added", handleParticipantAdded);
    on("participant-removed", handleParticipantRemoved);

    // Store listeners for cleanup
    listenersRef.current.add(["user-joined-conversation", handleUserJoined]);
    listenersRef.current.add(["user-left-conversation", handleUserLeft]);
    listenersRef.current.add(["participant-added", handleParticipantAdded]);
    listenersRef.current.add(["participant-removed", handleParticipantRemoved]);

    return () => {
      // Cleanup listeners
      listenersRef.current.forEach(([event, handler]) => {
        off(event, handler);
      });
      listenersRef.current.clear();
    };
  }, [
    onUserJoined,
    onUserLeft,
    onParticipantAdded,
    onParticipantRemoved,
    on,
    off,
  ]);
};

/**
 * Hook for handling socket connection status
 */
export const useSocketStatus = () => {
  const { isConnected, connectionError, reconnectAttempts, reconnect } =
    useSocket();

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    reconnect,
    isReconnecting: reconnectAttempts > 0,
  };
};

/**
 * Hook for debounced socket events
 */
export const useDebounceSocket = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook for throttled socket events
 */
export const useThrottleSocket = (callback, delay) => {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef(null);

  const throttledCallback = useCallback(
    (...args) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        // Execute immediately
        callback(...args);
        lastCallRef.current = now;
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastCallRef.current = Date.now();
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};
