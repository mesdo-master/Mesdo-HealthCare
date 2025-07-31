import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketProvider';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('⚠️ useNotifications called outside of NotificationProvider');
    return {
      unreadMessageCount: 0,
      unreadConversations: new Set(),
      notifications: [],
      messageEventCount: 0,
      markConversationAsRead: () => {},
      clearNotifications: () => {},
      testNotification: () => {},
      testSocketConnection: () => {},
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [messageEventCount, setMessageEventCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const socketContext = useSocket();
  const { currentUser, mode, businessProfile } = useAuth();
  
  console.log('🔔 NOTIFICATION PROVIDER: Initialized with:', {
    hasSocket: !!socketContext,
    isConnected: socketContext?.isConnected,
    currentUser: currentUser?._id,
    mode,
    businessProfile: businessProfile?._id
  });

  // SIMPLIFIED notification handler
  const handleNewMessage = useCallback((messageData) => {
    console.log('🚨 NOTIFICATION HANDLER: New message received!');
    console.log('🚨 NOTIFICATION HANDLER: Message data:', messageData);
    
    setMessageEventCount(prev => prev + 1);
    
    if (!messageData || !messageData.conversationId) {
      console.warn('🚨 NOTIFICATION HANDLER: Invalid message data');
      return;
    }
    
    // Get current user IDs for comparison
    const currentUserId = currentUser?._id;
    const businessProfileId = businessProfile?._id;
    
    // ROBUST sender ID extraction - check multiple possible fields
    let senderId = null;
    if (messageData.sender) {
      if (typeof messageData.sender === 'string') {
        senderId = messageData.sender;
      } else if (messageData.sender._id) {
        senderId = messageData.sender._id;
      } else if (messageData.sender.user?._id) {
        senderId = messageData.sender.user._id;
      }
    } else if (messageData.senderId) {
      senderId = messageData.senderId;
    } else if (messageData.from) {
      senderId = messageData.from;
    }
    
    console.log('🚨 NOTIFICATION HANDLER: ID comparison:', {
      extractedSenderId: senderId,
      currentUserId,
      businessProfileId,
      mode,
      rawSender: messageData.sender,
      senderId: messageData.senderId
    });
    
    if (!senderId) {
      console.warn('🚨 NOTIFICATION HANDLER: Could not extract sender ID');
      return;
    }
    
    // Don't notify if sender is current user - IMPROVED LOGIC
    const isOwnMessage = String(senderId) === String(currentUserId) || 
                        (mode === 'recruiter' && String(senderId) === String(businessProfileId)) ||
                        (mode === 'individual' && String(senderId) === String(currentUserId));
    
    if (isOwnMessage) {
      console.log('🚨 NOTIFICATION HANDLER: Ignoring own message');
      return;
    }
    
    console.log('🚨 NOTIFICATION HANDLER: Processing notification');
    
    // Update unread count
    setUnreadMessageCount(prev => {
      const newCount = prev + 1;
      console.log('🚨 NOTIFICATION HANDLER: Updating unread count:', newCount);
      return newCount;
    });
    
    // Update unread conversations
    setUnreadConversations(prev => {
      const updated = new Set([...prev, messageData.conversationId]);
      console.log('🚨 NOTIFICATION HANDLER: Updated unread conversations:', updated);
      return updated;
    });
    
    // Create notification
    const notification = {
      id: Date.now(),
      type: 'message',
      title: 'New Message',
      message: `${messageData.senderName || 'Someone'}: ${(messageData.message || messageData.text || '').substring(0, 50)}...`,
      conversationId: messageData.conversationId,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification('New Message', {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
    
    console.log('🚨 NOTIFICATION HANDLER: Notification processed successfully');
  }, [currentUser, mode, businessProfile]);

  // Mark conversation as read
  const markConversationAsRead = useCallback((conversationId) => {
    console.log('📖 NOTIFICATION: Marking conversation as read:', conversationId);
    setUnreadConversations(prev => {
      const updated = new Set(prev);
      updated.delete(conversationId);
      return updated;
    });
    setUnreadMessageCount(prev => Math.max(0, prev - 1));
  }, []);

  // Initialize unread status from server
  const initializeUnreadStatus = useCallback(async () => {
    if (!currentUser || isInitialized) return;
    
    try {
      console.log('🔄 NOTIFICATION: Initializing unread status from server');
      // This would typically fetch unread conversations from server
      // For now, we'll just mark as initialized
      setIsInitialized(true);
    } catch (error) {
      console.error('🚨 NOTIFICATION: Failed to initialize unread status:', error);
    }
  }, [currentUser, isInitialized]);

  // Test functions
  const testNotification = useCallback(() => {
    console.log('🧪 NOTIFICATION TEST: Manual trigger');
    handleNewMessage({
      conversationId: 'test-123',
      sender: 'test-user',
      senderId: 'test-user',
      senderName: 'Test User',
      message: 'This is a test notification',
      text: 'This is a test notification'
    });
  }, [handleNewMessage]);

  const testSocketConnection = useCallback(() => {
    console.log('🧪 SOCKET TEST: Connection info');
    console.log('Socket context:', socketContext);
    console.log('Is connected:', socketContext?.isConnected);
    console.log('Socket object:', socketContext?.socket);
    
    if (socketContext?.socket) {
      // Test emit
      socketContext.socket.emit('test-notification', { message: 'Test from client' });
      
      // Manual trigger
      handleNewMessage({
        conversationId: 'manual-test',
        sender: 'manual-user',
        senderId: 'manual-user', 
        senderName: 'Manual Test',
        message: 'Manual socket test message'
      });
    }
  }, [socketContext, handleNewMessage]);

  // Initialize when user changes
  useEffect(() => {
    initializeUnreadStatus();
  }, [initializeUnreadStatus]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // PERSISTENT socket event setup - works across all tabs
  useEffect(() => {
    console.log('🔔 NOTIFICATION: Setting up PERSISTENT socket listeners');
    
    if (!socketContext) {
      console.log('🔔 NOTIFICATION: No socket context, waiting...');
      return;
    }
    
    console.log('🔔 NOTIFICATION: Socket state:', {
      hasSocketContext: !!socketContext,
      isConnected: socketContext.isConnected,
      hasSocket: !!socketContext.socket,
      hasOnOff: !!(socketContext.on && socketContext.off)
    });

    // SINGLE event listener to prevent duplicates
    const messageHandler = (data) => {
      console.log('🔥 NOTIFICATION: Socket event received - newMessage');
      console.log('🔥 NOTIFICATION: Current tab/route:', window.location.pathname);
      console.log('🔥 NOTIFICATION: Data:', data);
      handleNewMessage(data);
    };
    
    // Use ONLY ONE method - prefer context method, fallback to direct socket
    let listenerAdded = false;
    
    if (socketContext.on && socketContext.off) {
      console.log('✅ NOTIFICATION: Using context on/off methods (SINGLE)');
      socketContext.on('newMessage', messageHandler);
      listenerAdded = true;
    } else if (socketContext.socket && !listenerAdded) {
      console.log('✅ NOTIFICATION: Using direct socket access (SINGLE)');
      socketContext.socket.on('newMessage', messageHandler);
      listenerAdded = true;
    }
    
    // Debug logging only (NO processing)
    const debugHandler = (eventName, ...args) => {
      if (eventName !== 'newMessage') { // Don't log the main event we're already handling
        console.log('🔍 NOTIFICATION DEBUG: Socket event:', eventName);
      }
    };
    
    if (socketContext.socket?.onAny && process.env.NODE_ENV === 'development') {
      socketContext.socket.onAny(debugHandler);
    }
    
    console.log('✅ NOTIFICATION: Socket listeners set up for ALL TABS');
    
    return () => {
      console.log('🔔 NOTIFICATION: Cleaning up socket listeners');
      
      // Cleanup the single listener method that was used
      if (socketContext.off) {
        socketContext.off('newMessage', messageHandler);
      } else if (socketContext.socket) {
        socketContext.socket.off('newMessage', messageHandler);
      }
      
      // Cleanup debug handler
      if (socketContext.socket?.offAny && process.env.NODE_ENV === 'development') {
        socketContext.socket.offAny(debugHandler);
      }
    };
  }, [socketContext, handleNewMessage]); // Removed isConnected dependency to make it more persistent

  const contextValue = {
    unreadMessageCount,
    unreadConversations,
    notifications,
    messageEventCount,
    markConversationAsRead,
    clearNotifications: () => setNotifications([]),
    testNotification,
    testSocketConnection,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};