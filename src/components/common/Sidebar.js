import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/common/Sidebar.css';
import logo from '../../assets/images/logo.png';

/* 사이드바 component */
function Sidebar() {
  const location = useLocation();

  const isActive = (url) => {
    return location.pathname === url ? 'active' : '';
  };

  const applyItems = [
    { label: '명함신청', url: '/api/bsc' },
    { label: '법인서류', url: '/api/legalDoc' },
    { label: '인장관리', url: '/api/seal' },
    { label: '문서수발신', url: '/api/doc' },
  ];

  const manageItems = [
    { label: '전체 신청 목록', url: '/api/applyList' },
    { label: '승인 대기 목록', url: '/api/pendingList' },
    { label: '명함 발주', url: '/api/bsc/orderList' },
  ];

  return (
    <div className="sidebar">
      <Link to="/">
        <img src={logo} alt="KMI Logo" className="logo" />
      </Link>
      <SidebarSection title="신청하기" items={applyItems} isActive={isActive} />
      <div className="sidebar-section">
        <h2>
          <Link to="/api/myApplyList" className={isActive('/api/myApplyList')}>나의 신청내역</Link>
        </h2>
      </div>
      <SidebarSection title="신청 목록 관리" items={manageItems} isActive={isActive} />
      <div className="sidebar-section">
        <h2>
          <Link to="/api/auth" className={isActive('/api/auth')}>권한 관리</Link>
        </h2>
      </div>
    </div>
  );
}

function SidebarSection({ title, items, isActive }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="sidebar-section">
      <h3 onClick={toggleOpen} className="toggle-header">
        <span className="toggle-icon">{isOpen ? '∨' : '>'}</span> {title}
      </h3>
      {isOpen && (
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <Link to={item.url} className={isActive(item.url)}>{item.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Sidebar;
