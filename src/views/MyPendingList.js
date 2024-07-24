import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import '../styles/MyPendingList.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 승인 대기 내역 페이지 */
function MyPendingList() {
  const [pendingApplications, setPendingApplications] = useState([]);     // 승인 대기 내역 상태 관리
  const [showConfirmModal, setShowConfirmModal] = useState(false);        // 확인 모달 표시 상태 관리
  const [selectedApplication, setSelectedApplication] = useState(null);   // 선택된 신청 내역 상태 관리
  const navigate = useNavigate();                                         // 경로 이동을 위한 네비게이트 함수

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  // Timestamp Parsing: "YYYY-MM-DD HH:MM"
  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toISOString().split('T')[0];
    const timePart = date.toTimeString().split(' ')[0].substring(0, 5);
    return `${datePart} ${timePart}`;
  };

  // 승인 대기 내역 가져오기
  const fetchPendingApplications = async () => {
    try {
      const response = await axios.get('/api/myPendingList');
      if (response.data && response.data.data && response.data.data.bcdPendingResponses) {
        const data = Array.isArray(response.data.data.bcdPendingResponses) ? response.data.data.bcdPendingResponses : [];
        const transformedData = data.map(application => ({
          draftId: application.draftId,
          title: application.title,
          draftDate: application.draftDate ? parseDateTime(application.draftDate) : '',
          drafter: application.drafter,
          lastUpdateDate: application.lastUpdateDate ? parseDateTime(application.lastUpdateDate) : '',
          lastUpdater: application.lastUpdater,
        }));
        setPendingApplications(transformedData);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching pending applications:', error.response ? error.response.data : error.message);
    }
  };

  // 취소 버튼 클릭 핸들러
  const handleCancelClick = (application) => {
    setSelectedApplication(application);
    setShowConfirmModal(true);
  };

  // 확인 모달 확인 버튼 클릭 핸들러
  const handleConfirmCancel = async () => {
    try {
      await axios.put(`/api/bcd/${selectedApplication.draftId}`);
      setShowConfirmModal(false);
      setSelectedApplication(null);
      fetchPendingApplications();
      alert('취소가 완료되었습니다.');
    } catch (error) {
      console.error('Error cancelling application:', error);
      setShowConfirmModal(false);
      setSelectedApplication(null);
    }
  };

  // 확인 모달 닫기 핸들러
  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedApplication(null);
  };

  const pendingColumns = [
    { header: '제목', accessor: 'title', width: '30%' },
    { header: '기안일시', accessor: 'draftDate', width: '14%' },
    { header: '기안자', accessor: 'drafter', width: '9%' },
    { header: '수정일시', accessor: 'lastUpdateDate', width: '14%' },
    { header: '최종수정자', accessor: 'lastUpdater', width: '11%' },
    {
      header: '수정',
      accessor: 'modify',
      width: '6%',
      Cell: ({ row }) => (
        <Button className="modify-button" onClick={() => navigate(`/api/bcd/${row.draftId}`, { state: { returnTo: '/api/myPendingList' } })}>수정</Button>
      ),
    },
    {
      header: '신청취소',
      accessor: 'cancel',
      width: '9%',
      Cell: ({ row }) => (
        <Button className="cancel-button" onClick={() => handleCancelClick(row)}>
          취소
        </Button>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="pending-applications">
        <h2>승인 대기 내역</h2>
        <Breadcrumb items={['나의 신청내역', '승인 대기 내역']} />
        <Table columns={pendingColumns} data={pendingApplications} />
      </div>
      {showConfirmModal && (
        <ConfirmModal
          message="정말 취소하시겠습니까?"
          onConfirm={handleConfirmCancel}
          onCancel={handleCloseConfirmModal}
        />
      )}
    </div>
  );
}

export default MyPendingList;
