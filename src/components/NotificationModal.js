import React, { useContext, useState, useEffect } from 'react';
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
        setReadNotifications([...readNotifications, id]);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    navigate('/api/myApplyList');
  };

  // DB에서 알림을 불러오는 함수
  const fetchNotificationsFromDB = async () => {
    try {
      const response = await axios.get(`/api/noti/${auth.userId}`);
      console.log("response: ", response);
      const fetchedNotifications = Array.isArray(response.data.data) ? response.data.data : [];
      console.log("NotificationModal -> fetchedNoti: ", fetchedNotifications);

      // 기존 알림과 중복되지 않는 새로운 알림만 추가
      setNotifications((prevNotifications) => {
        console.log("prev: ", prevNotifications);
        const updatedNotifications = prevNotifications.filter(
          (prevNoti) => !fetchedNotifications.some((noti) => noti.id === prevNoti.id)
        );
        return [...fetchedNotifications, ...updatedNotifications];
      });
    } catch (error) {
      console.error("Error fetching notifications from DB:", error);
    }
  };

  useEffect(() => {
    fetchNotificationsFromDB(); // 모달 열릴 때 DB에서 알림 불러오기
  }, []);

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
            {notifications.length > 0 ? (
              [...notifications].reverse().map((noti, index) => (
                <li
                  key={index}
                  onClick={() => handleItemClick(noti.id)}
                  className={`notification-item ${readNotifications.includes(noti.id) ? '' : 'unclicked'}`}
                >
                  <span
                    className="notification-content"
                    dangerouslySetInnerHTML={{ __html: formatContent(noti.content) }}
                  ></span>
                  <span className="notification-date">{noti.createdDate}</span>
                </li>
              ))
            ) : (
              <li>알림이 없습니다.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
