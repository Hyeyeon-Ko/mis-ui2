import React, { useState, useContext, useCallback, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import DateFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import RejectReasonModal from '../../components/RejectReasonModal'; 
import ApprovalModal from './ApprovalModal';
import { AuthContext } from '../../components/AuthContext'; 
import '../../styles/list/MyApplyList.css';
import '../../styles/common/Page.css';
import axios from 'axios';

function MyApplyList() {
  const { auth } = useContext(AuthContext); 
  const [applications, setApplications] = useState([]); 
  const [filteredApplications, setFilteredApplications] = useState([]); 
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); 
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [documentType, setDocumentType] = useState('');  
  const [filters, setFilters] = useState({
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewedRejections, setViewedRejections] = useState(new Set(JSON.parse(localStorage.getItem('viewedRejections')) || []));
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [documentDetails, setDocumentDetails] = useState({});

  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get('/api/myApplyList', {
        params: {
          userId: auth.userId, 
        },
      });
  
      const data = response.data?.data || {};
      const combinedData = [
        ...(data.myBcdResponses || []),
        ...(data.myDocResponses || []),
        ...(data.myCorpDocResponses || []),
        ...(data.mySealResponses || []),
      ];
  
      const uniqueData = combinedData.reduce((acc, current) => {
        const x = acc.find(item => item.draftId === current.draftId && item.docType === current.docType);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
  
      const transformedData = uniqueData
        .filter(application => application.applyStatus !== 'X')
        .map(application => ({
          ...application,
          draftDate: application.draftDate ? parseDateTime(application.draftDate) : '',
          approvalDate: application.respondDate ? parseDateTime(application.respondDate) : '',
          drafter: application.drafter,
          applyStatus: getStatusText(application.applyStatus),
          rejectionReason: application.rejectReason,
          manager: application.approver || application.disapprover || '',
        }))
        .sort((a, b) => new Date(b.draftDate) - new Date(a.draftDate));
  
      setApplications(transformedData);
      setFilteredApplications(transformedData); 
    } catch (error) {
      console.error('Error fetching applications:', error.response?.data || error.message);
    }
  }, [auth.userId]);

  useEffect(() => {
    fetchApplications();  
  }, [fetchApplications]);

  const applyStatusFilters = useCallback(() => {
    let filteredData = applications;

    const selectedStatuses = [];
    if (filters.statusApproved) selectedStatuses.push('승인완료');
    if (filters.statusRejected) selectedStatuses.push('반려');
    if (filters.statusOrdered) selectedStatuses.push('발주완료');
    if (filters.statusClosed) selectedStatuses.push('처리완료');

    if (selectedStatuses.length > 0) {
      filteredData = filteredData.filter(application =>
        selectedStatuses.includes(application.applyStatus)
      );
    } else {
      filteredData = [...applications]; 
    }

    setFilteredApplications(filteredData);
  }, [applications, filters]);

  useEffect(() => {
    applyStatusFilters();
  }, [filters, applyStatusFilters]);

  const applyFilters = () => {
    let filteredData = applications;

    if (startDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      filteredData = filteredData.filter(application => new Date(application.draftDate) >= startOfDay);
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filteredData = filteredData.filter(application => new Date(application.draftDate) <= endOfDay);
    }

    if (documentType) {
      filteredData = filteredData.filter(application => application.docType === documentType);
    }

    setFilteredApplications(filteredData);
  };
  
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
      case 'A': return '승인대기';
      case 'B': return '승인완료';
      case 'C': return '반려';
      case 'D': return '발주완료';
      case 'E': return '처리완료';
      case 'F': return '신청취소';
      case 'G': return '발급완료';
      default: return status;
    }
  };

  const handleFilterChange = (e) => {
    const { name } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: !prevFilters[name],
    }));
  };
      
  const handleReset = () => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setStartDate(defaultStartDate);
    setEndDate(new Date());
    setDocumentType('');
    setFilters({
      statusApproved: false,
      statusRejected: false,
      statusOrdered: false,
      statusClosed: false,
    });
    setFilteredApplications(applications); 
  };

  const handleButtonClick = (application) => {
    setSelectedApplication(application);
    if (application.applyStatus === '반려') {
      setRejectionReason(application.rejectionReason);
      setShowRejectionModal(true);
    } else {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  const handleCloseRejectionModal = () => {
    if (selectedApplication) {
      const newViewedRejections = new Set([...viewedRejections, selectedApplication.draftId]);
      setViewedRejections(newViewedRejections);
      localStorage.setItem('viewedRejections', JSON.stringify(Array.from(newViewedRejections)));
    }
    setShowRejectionModal(false);
    setSelectedApplication(null);
  };

  const handleConfirmModal = async () => {
    if (selectedApplication) {
      try {
        const apiUrl = selectedApplication.applyStatus === '발급완료' ? 
        '/api/corpDoc/completeApply' : 
        '/api/bcd/completeApply';

        await axios.put(apiUrl, null, {
          params: { draftId: selectedApplication.draftId }
        });

        const successMessage = selectedApplication.applyStatus === '발급완료' ? 
        '법인서류 수령이 확인되었습니다.' : 
        '명함 수령이 확인되었습니다.';

        alert(successMessage);
        fetchApplications(); 
      } catch (error) {
        console.error('Error completing application:', error.response?.data || error.message);
      } finally {
        setShowModal(false);
        setSelectedApplication(null);
      }
    }
  };

  const handleApprovalClick = (application) => {
    const allowedDocumentTypes = ['명함신청', '문서수신', '문서발신'];
    if (allowedDocumentTypes.includes(application.docType)) {
  
      setDocumentDetails({
        signitureImage: application.signitureImage || '',
        approvers: application.approvalLineResponses || [], 
      });
      setShowApprovalModal(true);
    }
  };
    
  const applicationColumns = [
    { header: '문서분류', accessor: 'docType', width: '11%' },
    { header: '제목', accessor: 'title', width: '30%' },
    { header: '신청일시', accessor: 'draftDate', width: '14%' },
    { header: '신청자', accessor: 'drafter', width: '9%' },
    { header: '승인/반려일시', accessor: 'approvalDate', width: '14%' },
    { header: '담당자', accessor: 'manager', width: '9%' },
    {
      header: '신청상태',
      accessor: 'applyStatus',
      width: '12%',
      Cell: ({ row }) => {
        const allowedDocumentTypes = ['명함신청', '문서수신', '문서발신'];
        const isAllowedDocType = allowedDocumentTypes.includes(row.docType);
  
        return (row.applyStatus === '승인대기' || row.applyStatus === '승인완료') && isAllowedDocType ? (
          <button
            className="status-button"
            style={{ color: '#2789FE', textDecoration: 'underline' }}
            onClick={() => handleApprovalClick(row)}
          >
            {row.applyStatus}
          </button>
        ) : row.applyStatus === '발주완료' || row.applyStatus === '발급완료' ? (
          <button
            className="status-button"
            onClick={() => handleButtonClick(row)}
          >
            수령확인
          </button>
        ) : row.applyStatus === '반려' ? (
          <button
            className="status-button"
            style={
              viewedRejections.has(row.draftId)
                ? { color: 'black', textDecoration: 'underline' }
                : { color: '#2789FE', textDecoration: 'underline' }
            }
            onClick={() => handleButtonClick(row)}
          >
            {row.applyStatus}
          </button>
        ) : row.applyStatus === '처리완료' ? (
          <span
            style={{
              fontWeight: row.applyStatus === '처리완료' ? 'bold' : 'normal',
              color: row.applyStatus === '처리완료' ? 'rgb(169, 169, 169)' : 'rgb(255, 255, 255)',
            }}
          >
            {row.applyStatus}
          </span>
        ) : (
          row.applyStatus
        );
      },
    },
  ];
  
  return (
    <div className="content">
      <div className="user-applications">
        <h2>전체 신청내역</h2>
        <Breadcrumb items={['나의 신청내역', '전체 신청내역']} />
        <DateFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          documentType={documentType}
          setDocumentType={setDocumentType} 
          onSearch={applyFilters}
          onReset={handleReset}
          showStatusFilters={true}
          forceShowAllStatusFilters={true}
          filters={filters}
          setFilters={setFilters}
          onFilterChange={handleFilterChange}
          searchOptions={[]}          
        />
        <Table columns={applicationColumns} data={filteredApplications} />
      </div>
      {showModal && (
        <ConfirmModal
          message={selectedApplication.applyStatus === '발급완료' ? "법인서류를 수령하셨습니까?" : "명함을 수령하셨습니까?"}
          onConfirm={handleConfirmModal}
          onCancel={handleCloseModal}
        />
      )}
      {showRejectionModal && (
        <RejectReasonModal
          show={showRejectionModal}
          onClose={handleCloseRejectionModal}
          onConfirm={() => {}}
          reason={rejectionReason}
          isViewOnly={true}
        />
      )}
      {showApprovalModal && (
        <ApprovalModal
          show={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          documentDetails={documentDetails}
        />
      )}
    </div>
  );
}

export default MyApplyList;
