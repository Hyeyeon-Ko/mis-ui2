import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import DateFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import ConfirmModal from '../components/common/ConfirmModal';
import RejectReasonModal from '../views/RejectReasonModal'; 
import '../styles/MyApplyList.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 나의 전체 신청 내역 페이지 */
function MyApplyList() {
  const [applications, setApplications] = useState([]);                   // 신청 내역 상태 관리
  const [startDate, setStartDate] = useState(null);                       // 시작 날짜 상태 관리
  const [endDate, setEndDate] = useState(null);                           // 종료 날짜 상태 관리
  const [documentType, setDocumentType] = useState('');                   // 문서 타입 상태 관리
  const [showModal, setShowModal] = useState(false);                      // 확인 모달 표시 상태 관리
  const [selectedApplication, setSelectedApplication] = useState(null);   // 선택된 신청 내역 상태 관리
  const [showRejectionModal, setShowRejectionModal] = useState(false);    // 반려 모달 표시 상태 관리
  const [rejectionReason, setRejectionReason] = useState('');             // 반려 이유 상태 관리
  const navigate = useNavigate();                                         // 경로 이동을 위한 네비게이트 함수

  useEffect(() => {
    fetchApplications();
  }, []);

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
        return '완료';
      case 'F':
        return '신청취소';
      default:
        return status;
    }
  };

  // 신청 내역 가져오기
  const fetchApplications = async (filterParams = {}) => {
    try {
      const response = await axios.get('/api/myApplyList', {
        params: {
          documentType: filterParams.documentType || null,
          startDate: filterParams.startDate || '',
          endDate: filterParams.endDate || '',
        },
      });

      const data = response.data?.data?.myApplyResponses || [];

      const uniqueData = data.reduce((acc, current) => {
        const x = acc.find(item => item.draftId === current.draftId);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      const transformedData = uniqueData.map(application => ({
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
  };

  // 상태 버튼 클릭 핸들러
  const handleButtonClick = (application) => {
    setSelectedApplication(application);
    if (application.applyStatus === '반려') {
      setRejectionReason(application.rejectionReason || '사내메일을 입력하세요.');
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
    { header: '기안일시', accessor: 'draftDate', width: '14%' },
    { header: '기안자', accessor: 'drafter', width: '9%' },
    { header: '승인/반려일시', accessor: 'approvalDate', width: '14%' },
    { header: '담당자', accessor: 'manager', width: '9%' }, 
    {
      header: '신청상태',
      accessor: 'applyStatus',
      width: '12%',
      Cell: ({ row }) => (
        row.applyStatus === '발주완료' || row.applyStatus === '반려' ? (
          <button 
            className="status-button" 
            style={row.applyStatus === '반려' ? { color: "#2789FE", textDecoration: 'underline' } : {}}
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
        <h2>전체 신청 내역</h2>
        <Breadcrumb items={['나의 신청내역', '전체 신청 내역']} />
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
