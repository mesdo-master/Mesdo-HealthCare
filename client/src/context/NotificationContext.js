import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketProvider';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('⚠️ useNotifications called outside of NotificationProvider, returning defaults');
    return {
      unreadMessageCount: 0,
      unreadConversations: new Set(),
      notifications: [],
      messageEventCount: 0,
      markConversationAsRead: () => {},
      clearNotifications: () => {},
      markNotificationAsRead: () => {},
      testNotification: () => {},
      testSocketConnection: () => {},
      setUnreadMessageCount: () => {},
      setUnreadConversations: () => {}
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [messageEventCount, setMessageEventCount] = useState(0);
  
  const socketContext = useSocket();
  const { currentUser, mode, businessProfile } = useAuth();
  
  // Debug socket context
  console.log('📢 Socket context:', socketContext);
  
  const { isConnected, on, off } = socketContext || {};

  // Handle new message notifications
  const handleNewMessage = useCallback((messageData) => {
    setMessageEventCount(prev => prev + 1);
    
    console.log('📢 NOTIFICATION: New message received');
    console.log('📢 Message data:', messageData);
    
    // Validate message data (using actual structure from the app)
    if (!messageData || !(messageData.conversationId || messageData.conversation)) {
      console.warn('📢 Invalid message data:', messageData);
      return;
    }
    
    const conversationId = messageData.conversationId || messageData.conversation;
    
    // Don't show notification for own messages
    const currentUserId = currentUser?._id;
    const businessProfileId = businessProfile?._id;
    
    // Handle different sender ID formats from the actual message structure
    // Check various possible fields where sender ID might be stored
    const senderId = messageData.sender || 
                    messageData.senderId || 
                    messageData.senderID ||
                    messageData.from ||
                    messageData.userId;
    
    // If we can't determine sender ID, don't process notification
    if (!senderId) {
      console.warn('📢 No sender ID found, skipping notification');
      return;
    }
    
    // Convert IDs to strings for reliable comparison (handles ObjectId vs string issues)
    const senderIdStr = String(senderId);
    const currentUserIdStr = String(currentUserId);
    const businessProfileIdStr = String(businessProfileId);
    
    // Check if this message is from the current user (regardless of mode)
    const isOwnMessage = senderIdStr === currentUserIdStr || 
                        (mode === 'recruiter' && senderIdStr === businessProfileIdStr);
    
    if (isOwnMessage) {
      console.log('📢 Ignoring own message');
      return;
    }
    
    console.log('📢 Processing notification for conversation:', conversationId);
    
    // Add to unread count
    setUnreadMessageCount(prev => {
      console.log('📢 Updating unread count:', prev + 1);
      return prev + 1;
    });
    
    // Add conversation to unread set
    setUnreadConversations(prev => {
      const updated = new Set([...prev, conversationId]);
      console.log('📢 Updated unread conversations:', updated);
      return updated;
    });
    
    // Add to notifications list
    const messageText = messageData.message || messageData.content || '';
    const senderName = messageData.senderName || messageData.sender?.name || 'Someone';
    
    const notification = {
      id: Date.now(),
      type: 'message',
      title: 'New Message',
      message: `${senderName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
      conversationId: conversationId,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('New Message', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: conversationId // Prevent duplicate notifications
      });
    }
    
    console.log('📢 Notification processed successfully');
  }, [currentUser, mode, businessProfile]);

  // Handle message read
  const markConversationAsRead = useCallback((conversationId) => {
    console.log('📖 Marking conversation as read:', conversationId);
    
    setUnreadConversations(prev => {
      const updated = new Set(prev);
      updated.delete(conversationId);
      return updated;
    });
    
    // Update unread count (this is approximate - ideally should come from server)
    setUnreadMessageCount(prev => Math.max(0, prev - 1));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Test function to manually trigger notifications (for debugging)
  const testNotification = useCallback(() => {
    console.log('🧪 Testing notification manually');
    const testData = {
      conversationId: 'test-conversation-123',
      senderId: 'other-user',
      senderName: 'Test User',
      content: 'This is a test notification message',
      message: 'Test message'
    };
    handleNewMessage(testData);
  }, [handleNewMessage]);

  // Test socket connection
  const testSocketConnection = useCallback(() => {
    console.log('🧪 Testing socket connection:');
    console.log('Socket context:', socketContext);
    console.log('Is connected:', isConnected);
    console.log('Socket object:', socketContext?.socket);
    console.log('Socket connected:', socketContext?.socket?.connected);
    
    if (socketContext?.socket) {
      console.log('🧪 Emitting test event...');
      socketContext.socket.emit('test-notification-system', { test: true });
      
      // Test if we can manually trigger a newMessage event
      console.log('🧪 Manually triggering newMessage event...');
      handleNewMessage({
        conversationId: 'test-123',
        sender: 'other-user-id',
        message: 'Test message from socket test',
        senderName: 'Test User'
      });
    }
  }, [socketContext, isConnected, handleNewMessage]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Set up socket listeners
  useEffect(() => {
    console.log('📢 Socket setup effect running:', { isConnected, socketContext });
    
    if (!isConnected) {
      console.log('📢 Socket not connected, skipping event listeners');
      return;
    }

    if (!on || !off) {
      console.error('📢 Socket on/off functions not available:', { on: typeof on, off: typeof off });
      return;
    }

    console.log('📢 Setting up socket event listeners with functions:', { on: typeof on, off: typeof off });

    // Create message handlers
    const messageReadHandler = (data) => {
      console.log('📖 Message read event:', data);
      if (data.conversationId) {
        markConversationAsRead(data.conversationId);
      }
    };

    const conversationReadHandler = (data) => {
      console.log('📖 Conversation read event:', data);
      if (data.conversationId) {
        markConversationAsRead(data.conversationId);
      }
    };

    // Listen for various message events (using the ACTUAL event names from the app)
    console.log('📢 Registering newMessage listener...');
    on('newMessage', handleNewMessage); // This is the REAL event name used in the app
    on('new-message', handleNewMessage);
    on('message-received', handleNewMessage);
    on('receiveMessage', handleNewMessage);
    on('message', handleNewMessage);
    
    // FALLBACK: Try direct socket access if available
    if (socketContext && socketContext.socket) {
      console.log('📢 FALLBACK: Adding direct socket listener');
      socketContext.socket.on('newMessage', (data) => {
        console.log('📢 DIRECT SOCKET: newMessage received:', data);
        handleNewMessage(data);
      });
    }
    
    // Listen for message read events
    on('message-read', messageReadHandler);
    on('conversation-read', conversationReadHandler);
    on('messageRead', messageReadHandler); // Alternative event name

    console.log('📢 Socket event listeners set up successfully');

    return () => {
      console.log('📢 Cleaning up socket event listeners');
      off('newMessage', handleNewMessage); // REAL event name
      off('new-message', handleNewMessage);
      off('message-received', handleNewMessage);
      off('receiveMessage', handleNewMessage);
      off('message', handleNewMessage);
      off('message-read', messageReadHandler);
      off('conversation-read', conversationReadHandler);
      off('messageRead', messageReadHandler);
      
      // Cleanup direct socket listener
      if (socketContext && socketContext.socket) {
        console.log('📢 FALLBACK CLEANUP: Removing direct socket listener');
        socketContext.socket.off('newMessage', handleNewMessage);
      }
    };
  }, [isConnected, on, off, handleNewMessage, markConversationAsRead]);

  const contextValue = {
    // Unread counts
    unreadMessageCount,
    unreadConversations,
    
    // Notifications
    notifications,
    messageEventCount, // For debugging
    
    // Actions
    markConversationAsRead,
    clearNotifications,
    markNotificationAsRead,
    testNotification, // For debugging
    testSocketConnection, // For debugging
    
    // Setters (for manual updates)
    setUnreadMessageCount,
    setUnreadConversations
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};