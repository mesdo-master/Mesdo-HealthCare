import React from 'react';
import { useNotifications } from '../context/NotificationContextFinal';
import { useSocket } from '../context/SocketProvider';

const NotificationDebug = () => {
  const { unreadMessageCount, isListenerActive, debugNotificationSystem } = useNotifications();
  const { isConnected } = useSocket();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testGlobalNotification = () => {
    if (window.notificationSystem) {
      window.notificationSystem.testNotification();
    } else {
      alert('Notification system not available');
    }
  };

  return null;
};

export default NotificationDebug;