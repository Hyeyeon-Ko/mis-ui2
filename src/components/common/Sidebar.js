import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/common/Sidebar.css';
import logo from '../../assets/images/logo.png';
import { AuthContext } from '../AuthContext';
import dropdownDefaultIcon from '../../assets/images/dropdownDefault.png';
import dropdownActiveIcon from '../../assets/images/dropdownActive.png';

/* Sidebar component */
function Sidebar() {
  const location = useLocation();
  const { auth } = useContext(AuthContext);

  const isActive = (url) => {
    return location.pathname === url ? 'active' : '';
  };

  const applyItems = [
    { label: '명함신청', url: '/api/bcd' },
    { label: '인장신청', url: '/api/seal' },
    { label: '법인서류', url: '/api/corpDoc' },
    { label: '문서수발신', url: '/api/doc' },
  ];

  const assetApplyItems = [
    { label: '문서보관 신청', url: '/api/docstorage' },
  ]

  const myApplyItems = [
    { label: '전체 신청내역', url: '/api/myApplyList' },
    { label: '승인대기 내역', url: '/api/myPendingList' },
  ];

  const manageItems = [
    { label: '전체 신청내역', url: '/api/applyList' },
    { label: '승인대기 내역', url: '/api/pendingList' },
  ];

  const corpDocItems = [
    { label: '서류 발급 대장', url: '/api/corpDoc/issueList'},
    { label: '서류 수불 대장', url: '/api/corpDoc/rnpList'},
  ]

  const sealItems = [
    { label: '인장 관리 대장', url: '/api/seal/managementList' },
    { label: '인장 반출 대장', url: '/api/seal/exportList' },
    { label: '인장 등록 대장', url: '/api/seal/registrationList' },
  ]

  const docItems = [
    { label: '문서 수신 대장', url: '/api/doc/receiveList' },
    { label: '문서 발신 대장', url: '/api/doc/sendList' },
  ];

  const orderItems = [
    { label: '명함 발주', url: '/api/bcd/orderList' },
  ];

  const assetItems = [
    { label: '렌탈현황 관리표', url: '/api/rentalList'},
    { label: '문서보관 목록표', url: '/api/docstorageList'},
    { label: '전국 렌탈현황 관리표', url: '/api/totalRentalList'},
    { label: '전국 문서보관 목록표', url: '/api/totalDocstorageList'},
  ]
  

  const sections = {
    'A': { title: '신청내역 관리', items: manageItems },
    'B': { title: '발주 관리', items: orderItems },
    'C': { title: '인장 관리', items: sealItems},
    'D': { title: '법인서류 관리', items: corpDocItems},
    'E': { title: '문서수발신 관리', items: docItems },
    'F': { title: '자산 및 문서 관리', items: assetItems },
  };

  return (
    <div className="sidebar">
      <Link to="/">
        <img src={logo} alt="KMI Logo" className="logo" />
      </Link>
      {auth.isUserMode || auth.role === 'USER' ? (
        <>
          <SidebarSection 
            title="신청하기" 
            items={applyItems} 
            isActive={isActive} 
            location={location} 
            defaultOpen={false} 
          />
          <SidebarSection 
            title="자산 및 문서 관리" 
            items={assetApplyItems} 
            isActive={isActive} 
            location={location} 
            defaultOpen={false} 
          />
          <SidebarSection 
            title="나의 신청내역" 
            items={myApplyItems} 
            isActive={isActive} 
            location={location} 
            defaultOpen={false} 
          />
        </>
      ) : (
        <>
          {auth.sidebarPermissions && auth.sidebarPermissions.map((perm, index) => (
            sections[perm] && <SidebarSection 
              key={index} 
              title={sections[perm].title} 
              items={sections[perm].items} 
              isActive={isActive} 
              location={location} 
              defaultOpen={false} 
            />
          ))}
          {(auth.role === 'MASTER' || auth.role === 'ADMIN') && (
            <div className="sidebar-section">
              <h2>
                <Link to="/api/std" className={isActive('/api/std')}>기준자료 관리</Link>
              </h2>
            </div>
          )}
          {auth.role === 'MASTER' && (
            <div className="sidebar-section">
              <h2>
                <Link to="/api/auth" className={isActive('/api/auth')}>권한 관리</Link>
              </h2>
            </div>
          )}
        </>
      )}
      <div className="sidebar-section">
          <h2 style={{ color: '#EDF1F5' }}>권한 관리</h2>
      </div>
    </div>
  );
}

function SidebarSection({ title, items, isActive, location, defaultOpen }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="sidebar-section">
      <h3 onClick={toggleOpen} className={`toggle-header ${!isOpen && items.some(item => location.pathname === item.url) ? 'active-toggle' : ''}`}>
        <img 
          src={isOpen ? dropdownActiveIcon : dropdownDefaultIcon}
          alt="Toggle Icon"
          className="toggle-icon"/> {title}
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
