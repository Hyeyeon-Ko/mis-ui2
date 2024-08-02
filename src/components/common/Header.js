import React, { useContext } from 'react';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Header.css';
import userImg from '../../assets/images/user.png';
import adminImg from '../../assets/images/admin.png';

/* 헤더 component */
function Header() {
  const { auth, logout, toggleMode } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
          {auth.isAuthenticated ? (
            <>
              <span>{auth.hngNm}({auth.userId})</span>
              <span> | </span>
              <span> {auth.isUserMode ? 'USER' : auth.role} </span>
              <span> | </span>
              <button onClick={logout} className="logout-button">로그아웃</button>
              <img 
                src={auth.isUserMode ? userImg : adminImg} 
                alt={auth.isUserMode ? "User" : "Admin"} 
                className="role-image" 
                onClick={toggleMode}
                style={{ cursor: 'pointer' }}
              />
            </>
          ) : (
            <a href="/api/login">로그인</a>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
