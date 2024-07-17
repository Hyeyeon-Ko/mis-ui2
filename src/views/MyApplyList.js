import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import DateFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import ConfirmModal from '../components/common/ConfirmModal';
import '../styles/MyApplyList.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 나의 전체 신청 목록 페이지 */
function MyApplyList() {
  const [applications, setApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

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

  const fetchApplications = async (filterParams = {}) => {
    try {
      const response = await axios.get('/api/myApplyList', {
        params: {
          documentType: filterParams.documentType || null,
          startDate: filterParams.startDate || '',
          endDate: filterParams.endDate || '',
        },
      });

      if (response.data && response.data.data) {
        const data = Array.isArray(response.data.data.bcdMasterResponses) ? response.data.data.bcdMasterResponses : [];

        const uniqueData = data.reduce((acc, current) => {
          const x = acc.find(item => item.draftId === current.draftId);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        const transformedData = uniqueData
          .map(application => ({
            ...application,
            draftDate: application.draftDate ? parseDateTime(application.draftDate) : '',
            approvalDate: application.respondDate ? parseDateTime(application.respondDate) : '',
            drafter: application.drafter,
            applyStatus: getStatusText(application.applyStatus), 
          }))
          .filter(application => application.applyStatus !== '승인대기');

        setApplications(transformedData);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error.response ? error.response.data : error.message);
    }
  };

  const handleButtonClick = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  const handleSearch = () => {
    fetchApplications({
      documentType: documentType || null,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setDocumentType('');
    fetchApplications();
  };

  const applicationColumns = [
    { header: '제목', accessor: 'title', width: '32%' },
    { header: '기안일시', accessor: 'draftDate', width: '14%' },
    { header: '기안자', accessor: 'drafter', width: '9%' },
    { header: '승인/반려일시', accessor: 'approvalDate', width: '14%' },
    { header: '담당자', accessor: 'manager', width: '9%' },
    {
      header: '신청상태',
      accessor: 'applyStatus',
      width: '12%',
      Cell: ({ row }) => (
        row.applyStatus === '발주완료' ? (
          <button className="status-button" onClick={() => handleButtonClick(row)}>
            발주완료
          </button>
        ) : (
          row.applyStatus
        )
      ),
    },
  ];

  return (
    <div className="content">
      <div className="user-applications">
        <h2>전체 신청 목록</h2>
        <Breadcrumb items={['나의 신청내역', '전체 신청 목록']} />
        <DateFilter 
          startDate={startDate} 
          setStartDate={setStartDate} 
          endDate={endDate} 
          setEndDate={setEndDate} 
          documentType={documentType} 
          setDocumentType={setDocumentType} 
          onSearch={handleSearch} 
          onReset={handleReset}
        />
        <Table columns={applicationColumns} data={applications} />
      </div>
      {showModal && (
        <ConfirmModal
          message="명함을 수령하셨습니까?"
          onConfirm={handleCloseModal}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
}

export default MyApplyList;
