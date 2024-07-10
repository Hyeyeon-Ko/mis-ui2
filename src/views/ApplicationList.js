import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import DateFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import '../styles/ApplicationsList.css';
import '../styles/common/Page.css';

/* 전체 신청 내역 페이지 */
function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filters, setFilters] = useState({
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: false,
  });
  const [centers, setCenters] = useState(['전체', '재단본부', '기타']);
  const [selectedCenter, setSelectedCenter] = useState('전체');

  useEffect(() => {
    const mockApplications = [
      {
        id: 1,
        center: '재단본부',
        title: '명함신청서(고혜연)',
        draftDate: '2023-06-01',
        drafter: '최민성',
        approvalDate: '2023-06-03',
        orderDate: '2023-06-03',
        status: '발주완료',
      },
    ];
    setApplications(mockApplications);
  }, []);

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
  };

  const isAnyFilterActive = Object.values(filters).some((value) => value);

  const filteredApplications = applications.filter((application) => {
    if (selectedCenter !== '전체' && application.center !== selectedCenter) return false;
    if (isAnyFilterActive) {
      if (filters.statusApproved && application.status === '승인완료') return true;
      if (filters.statusRejected && application.status === '반려') return true;
      if (filters.statusOrdered && application.status === '발주완료') return true;
      if (filters.statusClosed && application.status === '종결') return true;
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
        <DateFilter 
          startDate={startDate} 
          setStartDate={setStartDate} 
          endDate={endDate} 
          setEndDate={setEndDate} 
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
            종결
          </label>
        </div>
        <Table columns={columns} data={filteredApplications} />
      </div>
    </div>
  );
}

export default ApplicationsList;
