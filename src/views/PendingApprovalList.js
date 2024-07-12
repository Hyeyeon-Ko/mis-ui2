import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import '../styles/ApplicationsList.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 승인 대기 목록 페이지 */
function PendingApprovalList() {
  
  // 신청 내역, 센터 목록, 선택된 센터 상태 관리
  const [applications, setApplications] = useState([]);
  const [centers, setCenters] = useState(['전체', '재단본부', '기타']); 
  const [selectedCenter, setSelectedCenter] = useState('전체');

  // Timestamp Parsing: "YYYY-MM-DD"
  const parseDraftDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // 승인 대기 목록 데이터 가져오기
  const fetchPendingList = async () => {
    try {
      const response = await axios.get('/api/pendingList');
      console.log('Response data: ', response.data);

      // API 응답 데이터 구조에 맞게 데이터 추출
      const data = response.data.bcdPendingResponses || [];
      
      const transformedData = data.map(item => ({
        id: item.draftId,
        center: item.instNm,
        title: item.title,
        draftDate: parseDraftDate(item.draftDate),
        drafter: item.drafter,
        status: item.applyStatus,
      }));
      console.log('Transformed data: ', transformedData);
      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching pending list: ', error);
    }
  };

  useEffect(() => {
    fetchPendingList();
  }, []);

  // 센터 선택 핸들러
  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
  };

  // 선택된 센터에 따라 신청 내역 필터링
  const filteredApplications = selectedCenter === '전체'
    ? applications
    : applications.filter(app => app.center === selectedCenter);

  // 테이블 컬럼 정의
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
