import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext.js';
import '../styles/common/NotificationModal.css';

const NotificationModal = ({ onClose, position }) => {
  const { notifications } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("noti: ", notifications);
  const formatContent = (content) => {
    return content.split('/').join('<br />');
  };

  const handleItemClick = () => {
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
        <ul>
          {notifications.length > 0 ? (
            [...notifications].reverse().map((noti, index) => (
              <li key={index} onClick={handleItemClick} className="notification-item">
                <span className="notification-content" dangerouslySetInnerHTML={{ __html: formatContent(noti.content) }}></span>
                <span className="notification-comment">{noti.respondDate}</span>
              </li>
            ))
          ) : (
            <li>알림이 없습니다.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationModal;
