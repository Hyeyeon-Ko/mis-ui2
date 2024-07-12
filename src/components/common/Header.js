import React, { useContext } from 'react';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Header.css';

/* 헤더 component */
function Header() {
  const { auth, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
          {auth.isAuthenticated ? (
            <>
              <span>{auth.hngNm}({auth.userId})</span>
              <span> | </span>
              <span> {auth.role} </span>
              <span> | </span>
              <button onClick={logout} className="logout-button">로그아웃</button>
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
