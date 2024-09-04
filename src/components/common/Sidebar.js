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
    const currentPath = location.pathname;
    const currentQueryParams = new URLSearchParams(location.search);
    const itemPath = url.split('?')[0];
    const itemQueryParams = new URLSearchParams(url.split('?')[1]);

    if (currentPath !== itemPath) {
      return '';
    }

    for (const [key, value] of itemQueryParams.entries()) {
      if (currentQueryParams.get(key) !== value) {
        return '';
      }
    }

    return 'active';
  };

  const applyItems = [
    { label: '명함신청', url: '/api/bcd' },
    { label: '인장신청', url: '/api/seal' },
    { label: '법인서류', url: '/api/corpDoc' },
    { label: '문서수발신', url: '/api/doc' },
    { label: '문서이관/파쇄', url: '/api/docstorage' },
  ];

  const myApplyItems = [
    { label: '전체 신청내역', url: '/api/myApplyList' },
    { label: '승인대기 내역', url: '/api/myPendingList' },
  ];

  const bcdItems = [
    { label: '전체 신청내역', url: '/api/applyList?documentType=명함신청' },
    { label: '승인대기 내역', url: '/api/pendingList?documentType=명함신청' },
    { label: '명함 발주', url: '/api/bcd/orderList' },
  ];

  const docItems = [
    { label: '전체 신청내역', url: '/api/applyList?documentType=문서수발신' },
    { label: '승인대기 내역', url: '/api/pendingList?documentType=문서수발신' },
  ];

  const docManageItems = [
    { label: '문서 수신 대장', url: '/api/doc/receiveList' },
    { label: '문서 발신 대장', url: '/api/doc/sendList' },
  ];

  const sections = {
    'A': [{ title: '명함 관리', items: bcdItems }],
    'B': [
      { title: '인장 관리', items: [
        { label: '전체 신청내역', url: '/api/applyList?documentType=인장신청', subIndex: 'B-1' },
        { label: '승인대기 내역', url: '/api/pendingList?documentType=인장신청', subIndex: 'B-1' },      
      ]},
      { title: '인장 대장', items: [
        { label: '인장 관리대장', url: '/api/seal/managementList', subIndex: 'B-1' },
        { label: '인장 반출대장', url: '/api/seal/exportList', subIndex: 'B-1' },
        { label: '인장 등록대장', url: '/api/seal/registrationList', subIndex: 'B-1' },
        { label: '전국 인장 등록대장', url: '/api/seal/sealRegistrationList', subIndex: 'B-2' },
      ]}
    ],
    'C': [
      { title: '법인서류 관리', items: [
        { label: '전체 신청내역', url: '/api/applyList?documentType=법인서류', subIndex: 'C-1' },
        { label: '승인대기 내역', url: '/api/pendingList?documentType=법인서류', subIndex: 'C-1' },
      ]},
      { title: '법인서류 대장', items: [
        { label: '서류 발급 대장', url: '/api/corpDoc/issueList', subIndex: 'C-2' },
        { label: '서류 수불 대장', url: '/api/corpDoc/rnpList', subIndex: 'C-1' },
      ]}
    ],
    'D': [
      { title: '문서수발신 관리', items: docItems },
      { title: '문서수발신 대장', items: docManageItems }
    ],
    'E': [
      { title: '문서 관리', items: [
        { label: '문서보관 목록표', url: '/api/docstorageList', subIndex: 'E-1' },
        { label: '전국 문서보관 목록표', url: '/api/totalDocstorageList', subIndex: 'E-2' },
      ]}
    ],
    'F': [
      { title: '자산 관리', items: [
        { label: '렌탈현황 목록표', url: '/api/rentalList', subIndex: 'F-1' },
        { label: '전국 렌탈현황 목록표', url: '/api/totalRentalList', subIndex: 'F-2' },
      ]}
    ]
  };

  const filterItemsByPermission = (sectionKey, permissions) => {
    const section = sections[sectionKey];
    if (!section) return [];
  
    return section.map(sectionItem => ({
      ...sectionItem,
      items: sectionItem.items.filter(item => {
        const subIndex = item.subIndex;
        if (permissions.includes(sectionKey)) {
          return true;
        }
        if (subIndex) {
          return permissions.includes(subIndex);
        }
        return permissions.includes(sectionKey);
      })
    })).filter(sectionItem => sectionItem.items.length > 0);
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
            title="나의 신청내역"
            items={myApplyItems}
            isActive={isActive}
            location={location}
            defaultOpen={false}
          />
        </>
      ) : (
        <>
          {auth.sidebarPermissions && Object.keys(sections).map((sectionKey) => {
            const filteredSections = filterItemsByPermission(sectionKey, auth.sidebarPermissions);
            return filteredSections.map((sectionItem, index) => (
              <SidebarSection
                key={`${sectionKey}-${index}`}
                title={sectionItem.title}
                items={sectionItem.items}
                isActive={isActive}
                location={location}
                defaultOpen={false}
              />
            ));
          })}
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

  const isAnyItemActive = items.some(item => isActive(item.url) === 'active');

  return (
    <div className="sidebar-section">
      <h3 
        onClick={toggleOpen} 
        className={`toggle-header ${!isOpen && isAnyItemActive ? 'active-toggle' : ''}`}
      >
        <img
          src={isOpen ? dropdownActiveIcon : dropdownDefaultIcon}
          alt="Toggle Icon"
          className="toggle-icon" 
        /> 
        {title}
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
