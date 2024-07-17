import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import '../styles/ApplicationsList.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 승인 대기 목록 페이지 */
function PendingApprovalList() {

  const [applications, setApplications] = useState([]);
  const [centers, setCenters] = useState(['전체', '재단본부', '기타']);
  const [selectedCenter, setSelectedCenter] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Timestamp Parsing: "YYYY-MM-DD"
  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // 승인 대기 목록 데이터 가져오기
  const fetchPendingList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/pendingList');
      console.log('Response data: ', response.data);

      const data = Array.isArray(response.data.data.bcdPendingResponses) ? response.data.data.bcdPendingResponses : [];

      const transformedData = data.map(item => ({
        ...item,
        center: item.instCd,
        title: item.title,
        draftDate: item.draftDate ? parseDate(item.draftDate) : '',
        drafter: item.drafter,
        status: '승인대기', // 상태를 '승인대기'로 설정
      }));

      console.log('Transformed data:', transformedData);

      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching pending list:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingList();
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
        {loading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table columns={columns} data={filteredApplications} />
        )}
      </div>
    </div>
  );
}

export default PendingApprovalList;
