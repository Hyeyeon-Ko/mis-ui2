import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext.js';
import axios from 'axios';
import '../styles/common/NotificationModal.css';

const NotificationModal = ({ onClose, position }) => {
  const { notifications } = useContext(AuthContext);
  const [readNotifications, setReadNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {

    console.log("noti: ", notifications);
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
                  <span className="notification-comment">{noti.respondDate}</span>
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
