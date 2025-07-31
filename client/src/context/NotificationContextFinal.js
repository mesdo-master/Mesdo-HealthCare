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
      debugNotificationSystem: () => {},
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [messageEventCount, setMessageEventCount] = useState(0);
  const [isListenerActive, setIsListenerActive] = useState(false);
  
  const socketContext = useSocket();
  const { currentUser, mode, businessProfile } = useAuth();
  
  console.log('🔔 NOTIFICATION PROVIDER: Initialized with:', {
    hasSocket: !!socketContext,
    isConnected: socketContext?.isConnected,
    currentUser: currentUser?._id,
    mode,
    businessProfile: businessProfile?._id
  });

  // FIXED notification handler - prevents duplicates
  const handleNewMessage = useCallback((messageData) => {
    console.log('🚨 NOTIFICATION HANDLER: New message received!');
    console.log('🚨 NOTIFICATION HANDLER: Message data:', messageData);
    
    // Increment event counter for debugging
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
    
    // FIXED: Don't notify if sender is current user
    const isOwnMessage = String(senderId) === String(currentUserId) || 
                        (mode === 'recruiter' && String(senderId) === String(businessProfileId));
    
    if (isOwnMessage) {
      console.log('🚨 NOTIFICATION HANDLER: Ignoring own message');
      return;
    }
    
    console.log('🚨 NOTIFICATION HANDLER: Processing notification');
    
    // Update unread count (only once per message)
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

  // FIXED: Mark conversation as read - prevents double decrements
  const markConversationAsRead = useCallback((conversationId) => {
    console.log('📖 NOTIFICATION: Marking conversation as read:', conversationId);
    
    // Only update if conversation was actually unread
    setUnreadConversations(prev => {
      if (prev.has(conversationId)) {
        const updated = new Set(prev);
        updated.delete(conversationId);
        console.log('📖 NOTIFICATION: Conversation marked as read, remaining unread:', updated.size);
        
        // Decrease unread count only when we actually remove an unread conversation
        setUnreadMessageCount(current => {
          const newCount = Math.max(0, current - 1);
          console.log('📖 NOTIFICATION: Updated unread count:', current, '->', newCount);
          return newCount;
        });
        
        return updated;
      }
      console.log('📖 NOTIFICATION: Conversation was already read, no change needed');
      return prev;
    });
  }, []);

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

  // NEW: Comprehensive debug function
  const debugNotificationSystem = useCallback(() => {
    console.log('🔍 NOTIFICATION DEBUG: Full system check');
    console.log('🔍 Current user:', currentUser?._id);
    console.log('🔍 Business profile:', businessProfile?._id);
    console.log('🔍 Mode:', mode);
    console.log('🔍 Socket connected:', socketContext?.isConnected);
    console.log('🔍 Socket object exists:', !!socketContext?.socket);
    console.log('🔍 Listener active:', isListenerActive);
    console.log('🔍 Unread count:', unreadMessageCount);
    console.log('🔍 Unread conversations:', Array.from(unreadConversations));
    console.log('🔍 Current route:', window.location.pathname);
    
    // Test socket events
    if (socketContext?.socket) {
      console.log('🔍 Testing socket event emission...');
      socketContext.socket.emit('debug-test', { from: 'notification-context' });
    }
    
    // Test notification handler directly
    console.log('🔍 Testing notification handler directly...');
    handleNewMessage({
      conversationId: 'debug-' + Date.now(),
      sender: { _id: 'debug-sender-123' },
      senderId: 'debug-sender-123',
      senderName: 'Debug Sender',
      message: 'Debug notification test from ' + window.location.pathname,
      text: 'Debug notification test'
    });
  }, [currentUser, businessProfile, mode, socketContext, isListenerActive, unreadMessageCount, unreadConversations, handleNewMessage]);

  // Track route changes and socket status (React Router compatible)
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('🗺 NOTIFICATION STATUS CHECK:', {
        route: window.location.pathname,
        socketConnected: socketContext?.isConnected,
        listenerActive: isListenerActive,
        unreadCount: unreadMessageCount,
        hasSocketContext: !!socketContext
      });
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [socketContext?.isConnected, isListenerActive, unreadMessageCount, socketContext]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // FIXED: Single event listener - prevents duplicates
  useEffect(() => {
    console.log('🔔 NOTIFICATION: Setting up socket listeners (SINGLE)');
    console.log('🔔 NOTIFICATION: Current route:', window.location.pathname);
    
    if (!socketContext) {
      console.log('🔔 NOTIFICATION: No socket context, waiting...');
      return;
    }
    
    console.log('🔔 NOTIFICATION: Socket state:', {
      hasSocketContext: !!socketContext,
      isConnected: socketContext.isConnected,
      hasSocket: !!socketContext.socket,
      hasOnOff: !!(socketContext.on && socketContext.off),
      currentRoute: window.location.pathname
    });

    // COMPREHENSIVE event listener setup - listen to ALL possible message events
    const messageHandler = (data) => {
      console.log('🔥 NOTIFICATION: Socket event received - newMessage');
      console.log('🔥 NOTIFICATION: Current tab/route:', window.location.pathname);
      console.log('🔥 NOTIFICATION: Data:', data);
      handleNewMessage(data);
    };

    const newMessageHandler = (data) => {
      console.log('🔥 NOTIFICATION: Socket event received - new-message');
      console.log('🔥 NOTIFICATION: Current tab/route:', window.location.pathname);
      console.log('🔥 NOTIFICATION: Data:', data);
      handleNewMessage(data);
    };

    const messageReceivedHandler = (data) => {
      console.log('🔥 NOTIFICATION: Socket event received - message-received');
      console.log('🔥 NOTIFICATION: Current tab/route:', window.location.pathname);
      console.log('🔥 NOTIFICATION: Data:', data);
      handleNewMessage(data);
    };
    
    // Use ONLY ONE method - prefer context method, fallback to direct socket
    let listenerAdded = false;
    
    if (socketContext.on && socketContext.off && socketContext.isConnected) {
      console.log('✅ NOTIFICATION: Using context on/off methods (SINGLE)');
      socketContext.on('newMessage', messageHandler);
      socketContext.on('new-message', newMessageHandler);
      socketContext.on('message-received', messageReceivedHandler);
      listenerAdded = true;
      setIsListenerActive(true);
    } else if (socketContext.socket && socketContext.socket.connected && !listenerAdded) {
      console.log('✅ NOTIFICATION: Using direct socket access (SINGLE)');
      socketContext.socket.on('newMessage', messageHandler);
      socketContext.socket.on('new-message', newMessageHandler);
      socketContext.socket.on('message-received', messageReceivedHandler);
      listenerAdded = true;
      setIsListenerActive(true);
    }
    
    if (!listenerAdded) {
      console.warn('⚠️ NOTIFICATION: No socket listener could be added');
      setIsListenerActive(false);
    }
    
    // Global notification test for debugging
    window.notificationSystem = {
      isActive: listenerAdded,
      currentRoute: window.location.pathname,
      socketConnected: socketContext?.isConnected,
      testNotification: () => handleNewMessage({
        conversationId: 'global-test',
        sender: 'global-test-user',
        senderId: 'global-test-user',
        senderName: 'Global Test',
        message: 'Global test notification from ' + window.location.pathname
      }),
      simulateRealMessage: () => {
        console.log('📨 SIMULATING REAL MESSAGE...');
        // Simulate a message from a different user
        const differentUserId = currentUser?._id === '507f1f77bcf86cd799439011' ? '507f1f77bcf86cd799439012' : '507f1f77bcf86cd799439011';
        handleNewMessage({
          conversationId: 'sim-' + Date.now(),
          sender: { _id: differentUserId },
          senderId: differentUserId,
          senderName: 'Simulated User',
          message: 'This is a simulated message from another user',
          text: 'This is a simulated message from another user',
          createdAt: new Date().toISOString()
        });
      },
      checkNotificationState: () => {
        console.log('🔍 NOTIFICATION STATE CHECK:', {
          unreadCount: unreadMessageCount,
          unreadConversations: Array.from(unreadConversations),
          notifications: notifications.length,
          isListenerActive: isListenerActive,
          socketConnected: socketContext?.isConnected,
          currentUser: currentUser?._id,
          businessProfile: businessProfile?._id,
          mode: mode
        });
      }
    };
    
    console.log('✅ NOTIFICATION: Socket listeners set up for ALL TABS');
    
    return () => {
      console.log('🔔 NOTIFICATION: Cleaning up socket listeners');
      
      // Cleanup ALL event listeners
      if (socketContext.off) {
        socketContext.off('newMessage', messageHandler);
        socketContext.off('new-message', newMessageHandler);
        socketContext.off('message-received', messageReceivedHandler);
      } else if (socketContext.socket) {
        socketContext.socket.off('newMessage', messageHandler);
        socketContext.socket.off('new-message', newMessageHandler);
        socketContext.socket.off('message-received', messageReceivedHandler);
      }
      
      setIsListenerActive(false);
      
      // Clear global test
      if (window.notificationSystem) {
        window.notificationSystem.isActive = false;
      }
    };
  }, [socketContext, socketContext?.isConnected, handleNewMessage]);

  const contextValue = {
    unreadMessageCount,
    unreadConversations,
    notifications,
    messageEventCount,
    isListenerActive,
    markConversationAsRead,
    clearNotifications: () => setNotifications([]),
    testNotification,
    testSocketConnection,
    debugNotificationSystem,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};