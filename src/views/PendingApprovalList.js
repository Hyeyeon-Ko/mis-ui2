import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Breadcrumb from '../components/common/Breadcrumb';
import '../styles/ApplicationsList.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 승인 대기 내역 페이지 */
function PendingApprovalList() {
  const [applications, setApplications] = useState([]);
  const [centers, setCenters] = useState(['전체', '재단본부', '광화문', '여의도센터', '강남센터', '수원센터', '대구센터', '부산센터', '광주센터', '제주센터', '협력사']);
  const [selectedCenter, setSelectedCenter] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Timestamp Parsing: "YYYY-MM-DD HH:MM"
  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toISOString().split('T')[0];
    const timePart = date.toTimeString().split(' ')[0].substring(0, 5);
    return `${datePart} ${timePart}`;
  };

  // 승인 대기 내역 데이터 가져오기
  const fetchPendingList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/pendingList');
      console.log('Response data: ', response.data);

      const data = Array.isArray(response.data.data.bcdPendingResponses) ? response.data.data.bcdPendingResponses : [];

      const transformedData = data.map(item => ({
        ...item,
        center: item.instNm,
        title: item.title,
        draftDate: item.draftDate ? parseDateTime(item.draftDate) : '',
        drafter: item.drafter,
        status: '승인대기', // 상태를 '승인대기'로 설정
        draftId: item.draftId 
      }));

      // 기안일자를 기준으로 내림차순 정렬
      transformedData.sort((a, b) => new Date(b.draftDate) - new Date(a.draftDate));

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

  const handleRowClick = (draftId) => {
    navigate(`/api/bcd/applyList/${draftId}?readonly=true`);
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
      width: '15%',
    },
    { header: '제목', accessor: 'title', width: '28%' },
    { header: '기안일자', accessor: 'draftDate', width: '12%' },
    { header: '기안자', accessor: 'drafter', width: '8%' },
    { 
      header: '문서상태', 
      accessor: 'status', 
      width: '10%',
      Cell: () => (
        <span className="status-pending">승인대기</span>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="order">
        <h2>승인 대기 내역</h2>
        <Breadcrumb items={['신청 내역 관리', '승인 대기 내역']} />
        {loading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index} style={{ width: col.width }}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((row, rowIndex) => (
                <tr key={rowIndex} onClick={() => handleRowClick(row.draftId)}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.Cell ? col.Cell({ row }) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PendingApprovalList;
