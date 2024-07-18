import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import '../styles/ApplicationsList.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 전체 신청 내역 페이지 */
function ApplicationsList() {
  const [applications, setApplications] = useState([]);                 // 신청 내역 상태 관리
  const [startDate, setStartDate] = useState(null);                     // 시작 날짜 상태 관리
  const [endDate, setEndDate] = useState(null);                         // 종료 날짜 상태 관리
  const [documentType, setDocumentType] = useState('');                 // 문서 타입 상태 관리
  const [filters, setFilters] = useState({
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: false,
  }); // 상태 필터 상태 관리
  const [centers, setCenters] = useState(['전체', '재단본부', '기타']);  // 센터 목록 상태 관리
  const [selectedCenter, setSelectedCenter] = useState('전체');         // 선택된 센터 상태 관리
  const [loading, setLoading] = useState(false);                        // 로딩 상태 관리
  const [error, setError] = useState(null);                             // 에러 상태 관리

  // Timestamp Parsing: "YYYY-MM-DD"
  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Timestamp Parsing: "YYYY-MM-DD HH:MM"
  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toISOString().split('T')[0];
    const timePart = date.toTimeString().split(' ')[0].substring(0, 5);
    return `${datePart} ${timePart}`;
  };

  // applyStatus 매핑
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

  useEffect(() => {
    fetchApplications();
  }, []);

  // 신청 내역 가져오기
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

      console.log('Response data:', response.data);

      const data = Array.isArray(response.data.data.bcdMasterResponses) ? response.data.data.bcdMasterResponses : [];

      const transformedData = data.map(application => ({
        ...application,
        center: application.instCd, 
        title: application.title, 
        draftDate: application.draftDate ? parseDate(application.draftDate) : '',
        drafter: application.drafter, 
        approvalDate: application.respondDate ? parseDate(application.respondDate) : '', 
        orderDate: application.orderDate ? parseDateTime(application.orderDate) : '',
        status: getStatusText(application.applyStatus),
      }));

      console.log('Transformed data:', transformedData);

      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (e) => {
    const { name } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: !prevFilters[name],
    }));
  };

  // 센터 선택 핸들러
  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    fetchApplications({
      documentType,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    });
  };

  // 초기화 버튼 클릭 핸들러
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

  // 활성화된 필터 여부 확인
  const isAnyFilterActive = Object.values(filters).some((value) => value);

  // 필터링된 신청 내역
  const filteredApplications = applications.filter((application) => {
    if (application.status === '승인대기') return false; // 승인대기 상태 제외
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
      width: '14%',
    },
    { 
      header: '제목', 
      accessor: 'title', 
      width: '22%',
    },
    { header: '기안일자', accessor: 'draftDate', width: '14%' },
    { header: '기안자', accessor: 'drafter', width: '6%' },
    { header: '승인/반려일자', accessor: 'approvalDate', width: '14%' },
    { header: '발주일시', accessor: 'orderDate', width: '12%' },
    { 
      header: '문서상태', 
      accessor: 'status', 
      width: '10%',
    },
  ];

  return (
    <div className="content">
      <div className="all-applications">
        <h2>전체 신청 목록</h2>
        <Breadcrumb items={['신청 목록 관리', '전체 신청 목록']} />
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
        <div className="status-filters">
          <label>
            <input
              type="checkbox"
              name="statusApproved"
              checked={filters.statusApproved}
              onChange={handleFilterChange}
            />
            승인완료
          </label>
          <label>
            <input
              type="checkbox"
              name="statusRejected"
              checked={filters.statusRejected}
              onChange={handleFilterChange}
            />
            반려
          </label>
          <label>
            <input
              type="checkbox"
              name="statusOrdered"
              checked={filters.statusOrdered}
              onChange={handleFilterChange}
            />
            발주완료
          </label>
          <label>
            <input
              type="checkbox"
              name="statusClosed"
              checked={filters.statusClosed}
              onChange={handleFilterChange}
            />
            완료
          </label>
        </div>
        {loading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            <Table columns={columns} data={filteredApplications} />
          </>
        )}
      </div>
    </div>
  );
}

export default ApplicationsList;
