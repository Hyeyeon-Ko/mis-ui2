import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import StatusFilters from '../components/StatusFilter';
import CenterSelect from '../components/CenterSelect';
import '../styles/ApplicationsList.css';
import '../styles/common/Page.css';
import axios from 'axios';

/**
 * 전체 신청 내역 페이지 컴포넌트
 */
function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [filters, setFilters] = useState({
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: false,
  });
  const [centers] = useState([
    '전체', '재단본부', '광화문', '여의도센터', '강남센터', '수원센터', '대구센터', '부산센터', '광주센터', '제주센터', '협력사'
  ]);
  const [selectedCenter, setSelectedCenter] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toISOString().split('T')[0];
    const timePart = date.toTimeString().split(' ')[0].substring(0, 5);
    return `${datePart} ${timePart}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'A':
        return '승인대기';
      case 'B':
        return '승인완료';
      case 'C':
        return '반려';
      case 'D':
        return '발주완료';
      case 'E':
        return '완료';
      case 'F':
        return '신청취소';
      default:
        return status;
    }
  };

  const fetchApplications = async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/applyList', {
        params: {
          documentType: filterParams.documentType || null,
          startDate: filterParams.startDate || '',
          endDate: filterParams.endDate || '',
        },
      });

      const data = Array.isArray(response.data.data.bcdMasterResponses) ? response.data.data.bcdMasterResponses : [];

      const transformedData = data.map(application => ({
        ...application,
        center: application.instNm,
        title: application.title,
        draftDate: application.draftDate ? parseDateTime(application.draftDate) : '',
        drafter: application.drafter,
        approvalDate: application.respondDate ? parseDateTime(application.respondDate) : '',
        orderDate: application.orderDate ? parseDateTime(application.orderDate) : '',
        status: getStatusText(application.applyStatus),
        draftId: application.draftId,
      }));

      transformedData.sort((a, b) => new Date(a.draftDate) - new Date(b.draftDate));

      setApplications(transformedData);
    } catch (error) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: !prevFilters[name],
    }));
  };

  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
  };

  const handleSearch = () => {
    fetchApplications({
      documentType,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setDocumentType('');
    setFilters({
      statusApproved: false,
      statusRejected: false,
      statusOrdered: false,
      statusClosed: false,
    });
    fetchApplications();
  };

  const isAnyFilterActive = Object.values(filters).some((value) => value);

  const filteredApplications = applications.filter((application) => {
    if (selectedCenter !== '전체' && application.center !== selectedCenter) return false;
    if (isAnyFilterActive) {
      if (filters.statusApproved && application.status === '승인완료') return true;
      if (filters.statusRejected && application.status === '반려') return true;
      if (filters.statusOrdered && application.status === '발주완료') return true;
      if (filters.statusClosed && application.status === '완료') return true;
      return false;
    }
    return true;
  });

  const columns = [
    {
      header: <CenterSelect centers={centers} selectedCenter={selectedCenter} onCenterChange={handleCenterChange} />,
      accessor: 'center',
      width: '12%',
    },
    { header: '제목', accessor: 'title', width: '24%' },
    { header: '기안일시', accessor: 'draftDate', width: '13%' },
    { header: '기안자', accessor: 'drafter', width: '6%' },
    { header: '승인/반려일시', accessor: 'approvalDate', width: '13%' },
    { header: '발주일시', accessor: 'orderDate', width: '14%' },
    {
      header: '문서상태',
      accessor: 'status',
      width: '10%',
      Cell: ({ row }) => (
        <span
          className={row.status === '승인대기' ? 'status-pending clickable' : ''}
          onClick={() => {
            if (row.status === '승인대기') {
              navigate(`/api/bcd/applyList/${row.draftId}?readonly=true`);
            }
          }}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="all-applications">
        <h2>전체 신청 내역</h2>
        <Breadcrumb items={['신청 내역 관리', '전체 신청 내역']} />
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
        <StatusFilters filters={filters} onFilterChange={handleFilterChange} />
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

export default ApplicationsList;
