import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
import { AuthContext } from '../../components/AuthContext';
import axios from 'axios';
import '../../styles/common/Header.css';
import userImg from '../../assets/images/user.png';
import adminImg from '../../assets/images/admin.png';
import notiImg from '../../assets/images/noti.png';
import NotificationModal from '../../../src/components/NotificationModal';

/* 헤더 component */
function Header() {
  const { auth, logout, toggleMode } = useContext(AuthContext);
  const [showNotiModal, setShowNotiModal] = useState(false);
  const [notiPosition, setNotiPosition] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const notiButtonRef = useRef(null);

  const handleNotiClick = () => {
    const buttonRect = notiButtonRef.current.getBoundingClientRect();
    setNotiPosition(buttonRect);
    setShowNotiModal(!showNotiModal);
  };

  // Function to decrement unread notifications
  const decrementUnreadCount = () => {
    setUnreadCount(prevCount => Math.max(prevCount - 1, 0)); // Decrease by 1, minimum 0
  };

  const decrementAllUnreadCount = () => {
    setUnreadCount(0);
  }

  // DB에서 unread 알림 개수를 불러오는 함수
  const fetchUnReadNotiNum = useCallback(async () => {
    try {
      const response = await axios.get(`/api/noti/unread/${auth.userId}`);
      setUnreadCount(response.data.data);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  }, [auth.userId]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchUnReadNotiNum();
    }
  }, [fetchUnReadNotiNum, auth.isAuthenticated]);

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
              <span>{auth.userNm}({auth.userId})</span>
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
      {showNotiModal && (
        <NotificationModal
          onClose={handleNotiClick}
          position={notiPosition}
          decrementUnreadCount={decrementUnreadCount}
          decrementAllUnreadCount={decrementAllUnreadCount}
        />
      )}
    </header>
  );
}

export default Header;
