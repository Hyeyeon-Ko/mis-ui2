import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Breadcrumb from '../components/common/Breadcrumb';
import DateFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal'; 
import '../styles/MyApplications.css';
import '../styles/common/Page.css';

/* 나의 신청내역 페이지 */
function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const mockApplications = [
      {
        id: 1,
        title: '[재단본부]명함신청서(고혜연)',
        draftDate: '2023-06-01 10:00',
        drafter: '최민성',
        approvalDate: '2023-06-02',
        manager: '이진채',
        status: '발주완료',
      },
      {
        id: 2,
        title: '[재단본부]명함신청서(윤성아)',
        draftDate: '2023-06-05 10:00',
        drafter: '최민성',
        approvalDate: '',
        manager: '',
        status: '승인대기',
      },
    ];
    setApplications(mockApplications);

    const mockPendingApplications = [
      {
        id: 1,
        title: '[재단본부]명함신청서(윤성아)',
        draftDate: '2023-06-05 10:00',
        drafter: '최민성',
        modifyDate: '',
        modifier: '',
      },
    ];
    setPendingApplications(mockPendingApplications);
  }, []);

  const handleButtonClick = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  const handleCancelClick = (application) => {
    setSelectedApplication(application);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
    setSelectedApplication(null);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedApplication(null);
  };

  const applicationColumns = [
    { header: '제목', accessor: 'title', width: '32%' },
    { header: '기안일시', accessor: 'draftDate', width: '14%' },
    { header: '기안자', accessor: 'drafter', width: '9%' },
    { header: '승인/반려일시', accessor: 'approvalDate', width: '14%' },
    { header: '담당자', accessor: 'manager', width: '9%' },
    {
      header: '신청상태',
      accessor: 'status',
      width: '12%',
      Cell: ({ row }) => (
        row.status === '발주완료' ? (
          <button className="status-button" onClick={() => handleButtonClick(row)}>
            발주완료
          </button>
        ) : (
          row.status
        )
      ),
    },
  ];

  const pendingColumns = [
    { header: '제목', accessor: 'title', width: '33%' },
    { header: '기안일시', accessor: 'draftDate', width: '14%' },
    { header: '기안자', accessor: 'drafter', width: '9%' },
    { header: '수정일시', accessor: 'modifyDate', width: '14%' },
    { header: '수정자', accessor: 'modifier', width: '9%' },
    {
      header: '수정',
      accessor: 'modify',
      width: '6%',
      Cell: ({ row }) => (
        <Button className="modify-button" onClick={() => navigate('/detailInfo')}>수정</Button>
      ),
    },
    {
      header: '취소',
      accessor: 'cancel',
      width: '6%',
      Cell: ({ row }) => (
        <Button className="cancel-button" onClick={() => handleCancelClick(row)}>
          취소
        </Button>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="user-applications">
        <h2>나의 신청내역</h2>
        <Breadcrumb items={['나의 신청내역']} />
        <DateFilter 
          startDate={startDate} 
          setStartDate={setStartDate} 
          endDate={endDate} 
          setEndDate={setEndDate} 
        />
        <Table columns={applicationColumns} data={applications} />
      </div>
      <div className="divider"></div> 
      <div className="pending-applications">
        <h2>승인 대기 목록</h2>
        <Table columns={pendingColumns} data={pendingApplications} />
      </div>
      {showModal && (
        <ConfirmModal
          message="명함을 수령하셨습니까?"
          onConfirm={handleCloseModal}
          onCancel={handleCloseModal}
        />
      )}
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

export default MyApplications;
