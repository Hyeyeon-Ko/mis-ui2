import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import '../styles/ApplicationsList.css';
import '../styles/common/Page.css';

/* 승인 대기 목록 페이지 */
function PendingApprovalList() {
  const [applications, setApplications] = useState([]);
  const [centers, setCenters] = useState(['전체', '재단본부', '기타']); 
  const [selectedCenter, setSelectedCenter] = useState('전체');

  useEffect(() => {
    const mockApplications = [
      {
        id: 1,
        center: '재단본부',
        title: '명함신청서(윤성아)',
        draftDate: '2023-06-05',
        drafter: '최민성',
        status: '승인대기',
      },
    ];
    setApplications(mockApplications);
  }, []);

  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
  };

  const filteredApplications = selectedCenter === '전체'
    ? applications
    : applications.filter(app => app.center === selectedCenter);

  const columns = [
    {
      header: (
        <div className="center-header">
          센터 <span className="arrow">▼</span>
          <select value={selectedCenter} onChange={handleCenterChange} className="center-select">
            {centers.map(center => (
              <option key={center} value={center}>{center}</option>
            ))}
          </select>
        </div>
      ),
      accessor: 'center',
      width: '18%',
    },
    { header: '제목', accessor: 'title', width: '28%' },
    { header: '기안일자', accessor: 'draftDate', width: '15%' },
    { header: '기안자', accessor: 'drafter', width: '10%' },
    { 
      header: '문서상태', 
      accessor: 'status', 
      width: '17%',
      Cell: () => (
        <span className="status-pending">승인대기</span>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="order">
        <h2>승인 대기 목록</h2>
        <Breadcrumb items={['신청 목록 관리', '승인 대기 목록']} />
        <Table columns={columns} data={filteredApplications} />
      </div>
    </div>
  );
}

export default PendingApprovalList;
