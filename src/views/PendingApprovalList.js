import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import CenterSelect from '../components/CenterSelect';
import '../styles/ApplicationsList.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 승인 대기 내역 페이지 */
function PendingApprovalList() {
  const [applications, setApplications] = useState([]);
  const [centers] = useState([
    '전체', '재단본부', '광화문', '여의도센터', '강남센터',
    '수원센터', '대구센터', '부산센터', '광주센터', '제주센터', '협력사'
  ]);
  const [selectedCenter, setSelectedCenter] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingList();
  }, []);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toISOString().split('T')[0];
    const timePart = date.toTimeString().split(' ')[0].substring(0, 5);
    return `${datePart} ${timePart}`;
  };

  const fetchPendingList = async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/pendingList', {
        params: {
          documentType: filterParams.documentType || '',
          startDate: filterParams.startDate || '',
          endDate: filterParams.endDate || '',
        },
      });
      const data = Array.isArray(response.data.data.bcdPendingResponses) ? response.data.data.bcdPendingResponses : [];
      const transformedData = data.map(item => ({
        ...item,
        center: item.instNm,
        title: item.title,
        draftDate: item.draftDate ? parseDateTime(item.draftDate) : '',
        drafter: item.drafter,
        status: '승인대기',
        draftId: item.draftId,
        docType: item.docType || '미정'
      }));

      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching pending list:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
  };

  const handleRowClick = (draftId) => {
    navigate(`/api/bcd/applyList/${draftId}?readonly=true`);
  };

  const handleSearch = () => {
    fetchPendingList({
      documentType,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setDocumentType('');
    setSelectedCenter('전체');
    fetchPendingList();
  };

  const filteredApplications = applications.filter((app) => {
    if (selectedCenter !== '전체' && app.center !== selectedCenter) return false;
    if (startDate && new Date(app.draftDate) < new Date(startDate)) return false;
    if (endDate && new Date(app.draftDate) > new Date(endDate)) return false;
    if (documentType && app.docType !== documentType) return false;
    return true;
  });

  const columns = [
    { header: '문서분류', accessor: 'docType', width: '10%' },
    {
      header: <CenterSelect centers={centers} selectedCenter={selectedCenter} onCenterChange={handleCenterChange} />,
      accessor: 'center',
      width: '10%',
    },
    { header: '제목', accessor: 'title', width: '28%' },
    { header: '기안일시', accessor: 'draftDate', width: '12%' },
    { header: '기안자', accessor: 'drafter', width: '8%' },
    {
      header: '문서상태',
      accessor: 'status',
      width: '10%',
      Cell: ({ row }) => (
        <span
          className="status-pending clickable"
          onClick={() => handleRowClick(row.draftId)}
        >
          승인대기
        </span>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="order">
        <h2>승인 대기 내역</h2>
        <Breadcrumb items={['신청 내역 관리', '승인 대기 내역']} />
        <ConditionFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          documentType={documentType}
          setDocumentType={setDocumentType}
          onSearch={handleSearch}
          onReset={handleReset}
        />
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
