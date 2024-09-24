import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext.js';
import axios from 'axios';
import '../styles/common/NotificationModal.css';

const NotificationModal = ({ onClose, position }) => {
  const { notifications, setNotifications, auth } = useContext(AuthContext);
  const [readNotifications, setReadNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const readNotis = notifications.filter((noti) => noti.isRead).map((noti) => noti.id);
    setReadNotifications(readNotis);
  }, [notifications]);

  const formatContent = (content) => {
    return content.split('/').join('<br />');
  };

  const handleItemClick = async (id) => {
    if (!readNotifications.includes(id)) {
      try {
        await axios.put(`/api/noti/read/${id}`);
        setNotifications((prevNotifications) =>
          prevNotifications.map((noti) =>
            noti.id === id ? { ...noti, isRead: true } : noti
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    navigate('/myApplyList');
  };

  // DB에서 알림을 불러오는 함수
  const fetchNotificationsFromDB = useCallback(async () => {
    try {
      const response = await axios.get(`/api/noti/${auth.userId}`);
      const fetchedNotifications = Array.isArray(response.data.data) ? response.data.data : [];

      // 기존 알림과 중복되지 않는 새로운 알림만 추가
      setNotifications((prevNotifications) => {
        const updatedNotifications = prevNotifications.filter(
          (prevNoti) => !fetchedNotifications.some((noti) => noti.id === prevNoti.id)
        );
        return [...fetchedNotifications, ...updatedNotifications];
      });
    } catch (error) {
      console.error("Error fetching notifications from DB:", error);
    }
  }, [auth.userId, setNotifications]);

  useEffect(() => {
    fetchNotificationsFromDB();
  }, [fetchNotificationsFromDB]);

  // 알림을 읽은 것과 읽지 않은 것으로 나눈 뒤 각각 createdDate로 정렬
  const sortedNotifications = [...notifications]
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  const unreadNotifications = sortedNotifications.filter(noti => !noti.isRead);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  const readNotificationsSorted = sortedNotifications
    .filter(noti => noti.isRead && new Date(noti.createdDate) > thirtyDaysAgo);


  return (
    <div
      className="modal-backdrop"
      style={{
        top: position ? position.bottom + 12 : '100px',
        right: '30px',
        position: 'absolute'
      }}
    >
      <div className="modal-content">
        <div className="modal-content-header">
          <h3>Notification</h3>
          <button className="close-modal" onClick={onClose}>X</button>
        </div>
        <div className='modal-content-detail'> 
          <ul>
            {/* 미확인 알림을 먼저 표시 */}
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((noti, index) => (
                <li
                  key={index}
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
            ) : null}

            {/* 확인한 알림을 그 밑에 표시 */}
            {readNotificationsSorted.length > 0 ? (
              readNotificationsSorted.map((noti, index) => (
                <li
                  key={index}
                  onClick={() => handleItemClick(noti.id)}
                  className="notification-item"
                >
                  <span
                    className="notification-content"
                    dangerouslySetInnerHTML={{ __html: formatContent(noti.content) }}
                  ></span>
                  <span className="notification-date">{noti.createdDate}</span>
                </li>
              ))
            ) : null}
            
            {/* 알림이 없을 때 */}
            {notifications.length === 0 && (
              <li>알림이 없습니다.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
