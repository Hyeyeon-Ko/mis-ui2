import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/common/Sidebar.css';
import logo from '../../assets/images/logo.png';
import { AuthContext } from '../AuthContext';
import dropdownDefaultIcon from '../../assets/images/dropdownDefault.png';
import dropdownActiveIcon from '../../assets/images/dropdownActive.png';
import axios from 'axios';

function Sidebar() {
  const location = useLocation();
  const { auth, sidebarUpdate } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [pendingCounts, setPendingCounts] = useState({
    bcdPendingCount: 0,
    docPendingCount: 0,
    corpDocPendingCount: 0,
    sealPendingCount: 0,
    corpDocIssuePendingCount: 0,
    orderPendingCount: 0, 
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }

  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const response = await axios.get('/api/pendingCount', {
          params: {
            instCd: auth.instCd,
            userId: auth.userId,
          },
        });
        setPendingCounts(response.data.data);
      } catch (error) {
        console.error('Error fetching pending counts:', error);
      }
    };
  
    fetchPendingCounts();
  }, [auth.instCd, auth.userId, sidebarUpdate]); 
  
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
    { label: '명함신청', url: '/bcd' },
    { label: '인장신청', url: '/seal' },
    { label: '법인서류', url: '/corpDoc' },
    { label: '문서수발신', url: '/doc' },
    { label: '', url: '/' },
    { label: '', url: '/' },
    { label: '토너신청', url: '/toner' },
    { label: '문서이관/파쇄', url: '/docstorage' },
    { label: '', url: '/' },
    { label: '', url: '/' },
  ];

  const myApplyItems = [
    { label: '전체 신청내역', url: '/myApplyList' },
    { label: '승인대기 내역', url: '/myPendingList' },
  ];

  const docManageItems = [
    { label: '문서 수신 대장', url: '/doc/receiveList' },
    { label: '문서 발신 대장', url: '/doc/sendList' },
  ];

  const sections = {
    'A': [
      { title: '명함 관리', items: [
        { label: '전체 신청내역', url: '/applyList?documentType=명함신청', subIndex: 'A-1' },
        { label: '승인대기 내역', url: '/pendingList?documentType=명함신청', count: pendingCounts.bcdPendingCount, subIndex: 'A-2' },
        { label: '명함 발주', url: '/bcd/orderList', count: pendingCounts.orderPendingCount, subIndex: 'A-1' },
      ] }
    ],
    'B': [
      { title: '인장 관리', items: [
        { label: '전체 신청내역', url: '/applyList?documentType=인장신청', subIndex: 'B-1' },
        { label: '승인대기 내역', url: '/pendingList?documentType=인장신청', count: pendingCounts.sealPendingCount , subIndex: 'B-1' },
      ]},
      { title: '인장 대장', items: [
        { label: '인장 관리대장', url: '/seal/managementList', subIndex: 'B-1'  },
        { label: '인장 반출대장', url: '/seal/exportList', subIndex: 'B-1'  },
        { label: '인장 등록대장', url: '/seal/registrationList', subIndex: 'B-1'  },
        { label: '전국 인장 등록대장', url: '/seal/sealRegistrationList', subIndex: 'B-2' },
      ]}
    ],
    'C': [
      { title: '법인서류 관리', items: [
        { label: '전체 신청내역', url: '/applyList?documentType=법인서류', subIndex: 'C-1' },
        { label: '승인대기 내역', url: '/pendingList?documentType=법인서류', count: pendingCounts.corpDocPendingCount, subIndex: 'C-1' },
      ]},
      { title: '법인서류 대장', items: [
        { label: '서류 발급 대장', url: '/corpDoc/issueList', count: pendingCounts.corpDocIssuePendingCount, subIndex: 'C-2' },
        { label: '서류 수불 대장', url: '/corpDoc/rnpList', subIndex: 'C-1' },
      ]}
    ],
    'D': [
      { title: '문서수발신 관리', items: [
        { label: '전체 신청내역', url: '/applyList?documentType=문서수발신', subIndex: 'D-1' },
        { label: '승인대기 내역', url: '/pendingList?documentType=문서수발신', count: pendingCounts.docPendingCount, subIndex: 'D-2' },
      ] },
      { title: '문서수발신 대장', items: docManageItems },
    ],
    'E': [
      { title: '문서 관리', items: [
        { label: '문서보관 목록표', url: '/docstorageList', subIndex: 'E-1' },
        { label: '전국 문서보관 목록표', url: '/totalDocstorageList', subIndex: 'E-2' },
      ]}
    ],
    'F': [
      { title: '자산 관리', items: [
        { label: '렌탈현황 관리표', url: '/rentalList', subIndex: 'F-1' },
        { label: '전국 렌탈현황 관리표', url: '/totalRentalList', subIndex: 'F-2' },
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
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-toggle-button" onClick={toggleSidebar}> {/* 사이드바 토글 버튼 */}
        {isSidebarOpen ? '≡' : '≡'}
      </div>
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
                defaultOpen={sectionItem.items.some(item => item.count > 0)}
              />
            ));
          })}
          {(auth.role === 'MASTER' || auth.role === 'ADMIN') && (
            <div className="sidebar-section">
              <h2>
                <Link to="/std" className={isActive('/std')}>기준자료 관리</Link>
              </h2>
            </div>
          )}
          {auth.role === 'MASTER' && (
            <div className="sidebar-section">
              <h2>
                <Link to="/auth" className={isActive('/auth')}>권한 관리</Link>
              </h2>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SidebarSection({ title, items, isActive, defaultOpen }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    const hasPendingItems = items.some(item => item.count > 0);
    if (hasPendingItems) {
      setIsOpen(true);
    }
  }, [items]); 

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
            <li key={index} className="sidebar-item">
              <Link to={item.url} className={isActive(item.url)}>
                {item.label}
                {item.count > 0 && <span className="pending-count">{item.count}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Sidebar;
