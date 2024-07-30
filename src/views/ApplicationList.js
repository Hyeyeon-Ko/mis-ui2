import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import CustomButton from '../components/common/CustomButton'; 
import '../styles/ApplicationsList.css';
import '../styles/common/Page.css';
import axios from 'axios';
import fileDownload from 'js-file-download'; 

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCheckboxColumn, setShowCheckboxColumn] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showExcelButton, setShowExcelButton] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    // 상태에 따른 엑셀 버튼 표시 여부를 업데이트합니다.
    const isShowExcelButton = filters.statusClosed && selectedApplications.length > 0;
    setShowCheckboxColumn(filters.statusClosed);
    setShowExcelButton(isShowExcelButton);
  }, [filters, selectedApplications]);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
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

      transformedData.sort((a, b) => new Date(b.draftDate) - new Date(a.draftDate));

      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching applications:', error);
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
    if (isAnyFilterActive) {
      if (filters.statusApproved && application.status === '승인완료') return true;
      if (filters.statusRejected && application.status === '반려') return true;
      if (filters.statusOrdered && application.status === '발주완료') return true;
      if (filters.statusClosed && application.status === '완료') return true;
      return false;
    }
    return true;
  });

  const handleSelectAll = (isChecked) => {
    setSelectedApplications(isChecked ? filteredApplications.map(app => app.draftId) : []);
  };

  const handleSelect = (isChecked, id) => {
    setSelectedApplications(isChecked
      ? [...selectedApplications, id]
      : selectedApplications.filter(appId => appId !== id)
    );
  };

  const handleExcelDownload = async () => {
    if (selectedApplications.length === 0) {
      alert('엑셀변환 할 명함 신청 목록을 선택하세요.');
      return;
    }

    try {
      const response = await axios.post('/api/bsc/applyList/orderExcel', selectedApplications, {
        responseType: 'blob', 
      });
      fileDownload(response.data, 'order_details.xlsx');
    } catch (error) {
      console.error('Error downloading excel: ', error);
    }
  };

  const columns = [
    ...(showCheckboxColumn ? [{
      header: <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} />,
      accessor: 'select',
      width: '5%',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedApplications.includes(row.draftId)}
          onChange={(e) => handleSelect(e.target.checked, row.draftId)}
        />
      ),
    }] : []),
    { header: '문서분류', accessor: 'docType', width: '10%' },
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
        <div className="application-header-row">
          <Breadcrumb items={['신청 내역 관리', '전체 신청 내역']} />
            <div className="application-button-container">
            {showExcelButton && (
              <CustomButton className="excel-button2" onClick={handleExcelDownload}>
                엑셀변환
              </CustomButton>
            )}
          </div>
        </div>
        <ConditionFilter 
          startDate={startDate} 
          setStartDate={setStartDate} 
          endDate={endDate} 
          setEndDate={setEndDate} 
          documentType={documentType} 
          setDocumentType={setDocumentType} 
          onSearch={handleSearch} 
          onReset={handleReset}
          filters={filters}
          onFilterChange={handleFilterChange}
          showStatusFilters={true}
        />
        {loading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table columns={columns} data={filteredApplications} onSelect={handleSelect} selectedItems={selectedApplications} />
        )}
      </div>
    </div>
  );
}

export default ApplicationsList;
