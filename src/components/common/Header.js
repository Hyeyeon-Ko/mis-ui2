import React from 'react';
import '../../styles/common/Header.css';

/* 헤더 component */
function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
            {/* 임시헤더 */}
          <span>고혜연(2024060034) | USER | </span>
          <a href="/logout">로그아웃</a>
        </div>
      </div>
    </header>
  );
}

export default Header;
