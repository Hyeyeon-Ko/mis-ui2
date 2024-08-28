import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import DateFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import RejectReasonModal from '../../components/RejectReasonModal'; 
import '../../styles/list/MyApplyList.css';
import '../../styles/common/Page.css';
import axios from 'axios';

/* 나의 전체 신청내역 페이지 */
function MyApplyList() {
  const [applications, setApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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
          documentType: filterParams.documentType || null,
          startDate: filterParams.startDate || '',
          endDate: filterParams.endDate || '',
        },
      });
  
      const data = response.data?.data || {};
      const combinedData = [
        ...(data.myBcdResponses || []),
        ...(data.myDocResponses || []),
        ...(data.myCorpDocResponses || []),
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

      const transformedData = filteredData.map(application => ({
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
  }, [documentType]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications, documentType]);

  // Timestamp Parsing: "YYYY-MM-DD HH:MM"
  const parseDateTime = (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
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
        return '처리완료';
      case 'F':
        return '신청취소';
      default:
        return status;
    }
  };

  // 상태 버튼 클릭 핸들러
  const handleButtonClick = (application) => {
    setSelectedApplication(application);
    if (application.applyStatus === '반려') {
      setRejectionReason(application.rejectionReason);
      setShowRejectionModal(true);
    } else {
      setShowModal(true);
    }
  };

  // 확인 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  // 반려 모달 닫기 핸들러
  const handleCloseRejectionModal = () => {
    if (selectedApplication) {
      const newViewedRejections = new Set([...viewedRejections, selectedApplication.draftId]);
      setViewedRejections(newViewedRejections);
      localStorage.setItem('viewedRejections', JSON.stringify(Array.from(newViewedRejections)));
    }
    setShowRejectionModal(false);
    setSelectedApplication(null);
  };

  // 확인 모달 확인 버튼 클릭 핸들러
  const handleConfirmModal = async () => {
    if (selectedApplication) {
      try {
        await axios.put('/api/bcd/completeApply', null, {
          params: { draftId: selectedApplication.draftId }
        });
        alert('명함 수령이 확인되었습니다.');
        fetchApplications();
      } catch (error) {
        console.error('Error completing application:', error.response?.data || error.message);
      } finally {
        setShowModal(false);
        setSelectedApplication(null);
      }
    }
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    fetchApplications({
      documentType: documentType || null,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    });
  };

  // 초기화 버튼 클릭 핸들러
  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
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
        row.applyStatus === '발주완료' ? (
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
        />
        <Table columns={applicationColumns} data={applications} />
      </div>
      {showModal && (
        <ConfirmModal
          message="명함을 수령하셨습니까?"
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
