import React from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import NotificationToast from './NotificationToast';

const NotificationManager = () => {
  const { 
    toastNotifications, 
    removeToastNotification, 
    markToastAsRead 
  } = useNotifications();

  return (
    <NotificationToast
      notifications={toastNotifications}
      onRemove={removeToastNotification}
      onMarkAsRead={markToastAsRead}
    />
  );
};

export default NotificationManager;
