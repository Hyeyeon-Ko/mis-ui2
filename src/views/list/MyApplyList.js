import React, { useState, useContext, useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import DateFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import RejectReasonModal from '../../components/RejectReasonModal'; 
import { AuthContext } from '../../components/AuthContext'; 
import '../../styles/list/MyApplyList.css';
import '../../styles/common/Page.css';
import axios from 'axios';

function MyApplyList() {
  const { auth } = useContext(AuthContext); 
  const [applications, setApplications] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); 
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [documentType, setDocumentType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewedRejections, setViewedRejections] = useState(new Set(JSON.parse(localStorage.getItem('viewedRejections')) || []));

  const fetchApplications = useCallback(async (filterParams = {}) => {
    try {
      const response = await axios.get('/api/myApplyList', {
        params: {
          documentType: filterParams.documentType || documentType || null,
          startDate: filterParams.startDate || startDate.toISOString().split('T')[0],
          endDate: filterParams.endDate || endDate.toISOString().split('T')[0],
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

      const filteredData = documentType
        ? uniqueData.filter(application => application.docType === documentType)
        : uniqueData;

      const transformedData = filteredData
        .filter(application => application.applyStatus !== 'X')
        .map(application => ({
          ...application,
          draftDate: application.draftDate ? parseDateTime(application.draftDate) : '',
          approvalDate: application.respondDate ? parseDateTime(application.respondDate) : '',
          drafter: application.drafter,
          applyStatus: getStatusText(application.applyStatus),
          rejectionReason: application.rejectReason,
          manager: application.approver || application.disapprover || '',
        }));

      transformedData.sort((a, b) => new Date(b.draftDate) - new Date(a.draftDate));
  
      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching applications:', error.response?.data || error.message);
    }
  }, [documentType, startDate, endDate, auth.userId]);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
        return '처리완료';
      case 'F':
        return '신청취소';
      case 'G':
        return '발급완료';
      default:
        return status;
    }
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

  const handleSearch = () => {
    fetchApplications({
      documentType: documentType || null,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    });
  };

  const handleReset = () => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setStartDate(defaultStartDate);
    setEndDate(new Date());
    setDocumentType('');
    fetchApplications();
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
      Cell: ({ row }) => (
        row.applyStatus === '발주완료' || row.applyStatus === '발급완료' ? (
          <button
            className="status-button"
            onClick={() => handleButtonClick(row)}
          >
            수령확인
          </button>
        ) :
        row.applyStatus === '반려' ? (
          <button
            className="status-button"
            style={
              viewedRejections.has(row.draftId)
                ? { color: "black", textDecoration: 'underline' }
                : { color: "#2789FE", textDecoration: 'underline' }
            }
            onClick={() => handleButtonClick(row)}
          >
            {row.applyStatus}
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
        <h2>전체 신청내역</h2>
        <Breadcrumb items={['나의 신청내역', '전체 신청내역']} />
        <DateFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          documentType={documentType}
          setDocumentType={setDocumentType} 
          onSearch={handleSearch}
          onReset={handleReset}
          setFilters={() => {}} 
        />
        <Table columns={applicationColumns} data={applications} />
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
    </div>
  );
}

export default MyApplyList;
