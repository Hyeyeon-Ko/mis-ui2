import React, { useEffect, useRef, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext.js';
import axios from 'axios';
import '../styles/common/NotificationModal.css';

const NotificationModal = ({ onClose, decrementUnreadCount, decrementAllUnreadCount }) => {
  const { notifications, setNotifications, auth } = useContext(AuthContext);
  const [readNotifications, setReadNotifications] = useState([]);
  const modalRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const readNotis = notifications.filter((noti) => noti.isRead).map((noti) => noti.id);
    setReadNotifications(readNotis);
  }, [notifications]);

  const formatContent = (content) => content.split('/').join('<br />');

  const handleItemClick = async (id) => {
    if (!readNotifications.includes(id)) {
      try {
        await axios.put(`/api/noti/read/${id}`);
        setNotifications((prevNotifications) =>
          prevNotifications.map((noti) => (noti.id === id ? { ...noti, isRead: true } : noti))
        );
        decrementUnreadCount();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    navigate('/myApplyList');
  };

  const fetchNotificationsFromDB = useCallback(async () => {
    try {
      const response = await axios.get(`/api/noti/${auth.userId}`);
      const notifications = Array.isArray(response.data.data) ? response.data.data : [];
      setNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications from DB:", error);
    }
  }, [auth.userId, setNotifications]);

  useEffect(() => {
    fetchNotificationsFromDB();
  }, [fetchNotificationsFromDB]);

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
  );
  const unreadNotifications = sortedNotifications.filter((noti) => !noti.isRead);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  const readNotificationsSorted = sortedNotifications.filter(
    (noti) => noti.isRead && new Date(noti.createdDate) > thirtyDaysAgo
  );

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/noti/allRead', null, { params: { userId: auth.userId } });
      setNotifications((prevNotifications) =>
        prevNotifications.map((noti) => ({ ...noti, isRead: true }))
      );
      decrementAllUnreadCount();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-content-header">
          <h3>Notification</h3>
          <div className="modal-buttons">
            <button type="button" className="button-all-read" onClick={handleMarkAllAsRead}>
              모두읽음
            </button>
            <button className="close-modal" onClick={onClose}>X</button>
          </div>
        </div>
        <div className="modal-content-detail">
          <ul>
            {unreadNotifications.length > 0
              ? unreadNotifications.map((noti) => (
                  <li
                    key={noti.id}
                    onClick={() => handleItemClick(noti.id)}
                    className="notification-item unclicked"
                  >
                    <span
                      className="notification-content"
                      dangerouslySetInnerHTML={{ __html: formatContent(noti.content) }}
                    ></span>
                    <span className="notification-date">{noti.createdDate}</span>
                  </li>
                ))
              : null}
            {readNotificationsSorted.length > 0
              ? readNotificationsSorted.map((noti) => (
                  <li key={noti.id} onClick={() => handleItemClick(noti.id)} className="notification-item">
                    <span
                      className="notification-content"
                      dangerouslySetInnerHTML={{ __html: formatContent(noti.content) }}
                    ></span>
                    <span className="notification-date">{noti.createdDate}</span>
                  </li>
                ))
              : null}
            {notifications.length === 0 && <li>알림이 없습니다.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
