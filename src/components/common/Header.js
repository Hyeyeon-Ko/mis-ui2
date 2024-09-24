import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Header.css';
import userImg from '../../assets/images/user.png';
import adminImg from '../../assets/images/admin.png';
import notiImg from '../../assets/images/noti.png';
import NotificationModal from '../../../src/components/NotificationModal';

/* 헤더 component */
function Header() {
  const { auth, logout, toggleMode, notifications } = useContext(AuthContext);
  const [showNotiModal, setShowNotiModal] = useState(false);
  const [notiPosition, setNotiPosition] = useState(null);
  const notiButtonRef = useRef(null);
  const unreadCount = notifications.filter(noti => !noti.isRead).length;

  const handleNotiClick = () => {
    const buttonRect = notiButtonRef.current.getBoundingClientRect();
    setNotiPosition(buttonRect);
    setShowNotiModal(!showNotiModal);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
          {auth.isAuthenticated ? (
            <>
              <div className="notification-wrapper">
                <img
                  ref={notiButtonRef}
                  src={notiImg}
                  alt="Notifications"
                  className="notification-icon"
                  onClick={handleNotiClick}
                  style={{ cursor: 'pointer', marginRight: '10px' }}
                />
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </div>
              <span>{auth.hngNm}({auth.userId})</span>
              <span> | </span>
              <span> {auth.isUserMode ? 'USER' : auth.role} </span>
              <span> | </span>
              <button onClick={logout} className="logout-button">로그아웃</button>
              <img 
                src={auth.isUserMode || auth.originalRole === 'USER' ? userImg : adminImg} 
                alt={auth.isUserMode || auth.originalRole === 'USER' ? "User" : "Admin"} 
                className="role-image" 
                onClick={auth.originalRole !== 'USER' ? toggleMode : null}
                style={{ cursor: auth.originalRole !== 'USER' ? 'pointer' : 'default' }}
              />
            </>
          ) : (
            <a href="/login">로그인</a>
          )}
        </div>
      </div>
      {showNotiModal && <NotificationModal onClose={handleNotiClick} position={notiPosition} />}
    </header>
  );
}

export default Header;
