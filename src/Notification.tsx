import React from 'react';
import './App.css';

export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'loading';
  show: boolean;
}

const Notification: React.FC<NotificationProps> = ({ message, type, show }) => {
  if (!show) return null;

  return (
    <div className={`notification-box ${type}`}>
      {message}
    </div>
  );
};

export default Notification;
