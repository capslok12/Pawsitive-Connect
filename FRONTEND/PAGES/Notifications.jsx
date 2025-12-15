import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = ({ auth }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.get(`${backend}/api/notifications`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await axios.patch(`${backend}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_report': return '🚨';
      case 'rescue_assigned': return '✅';
      case 'adoption_request': return '🏠';
      default: return '💬';
    }
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="dashboard">
      <h2>🔔 Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="empty-state">
          <h3>No notifications yet</h3>
          <p>You'll see important updates here</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
              
              {!notification.isRead && (
                <button 
                  onClick={() => markAsRead(notification._id)}
                  className="mark-read-btn"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 800px;
        }
        
        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 4px solid #3498db;
        }
        
        .notification-item.unread {
          background: #f8f9fa;
          border-left-color: #e74c3c;
        }
        
        .notification-icon {
          font-size: 24px;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-content h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
        }
        
        .notification-content p {
          margin: 0 0 8px 0;
          color: #7f8c8d;
        }
        
        .mark-read-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #7f8c8d;
        }
      `}</style>
    </div>
  );
};

export default Notifications;