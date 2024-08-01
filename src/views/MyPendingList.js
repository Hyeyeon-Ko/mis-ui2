import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import '../styles/MyPendingList.css';
import '../styles/common/Page.css';
import axios from 'axios';

function MyPendingList() {
  const [pendingApplications, setPendingApplications] = useState([]); 
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [selectedApplication, setSelectedApplication] = useState(null); 
  const navigate = useNavigate(); 

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  
  const fetchPendingApplications = async () => {
    try {
      const response = await axios.get('/api/myPendingList');
      if (response.data && response.data.data) {
        const data = [
          ...(response.data.data.bcdPendingResponses || []),
          ...(response.data.data.docPendingResponses || [])
        ];

        const uniqueData = data.reduce((acc, current) => {
          const x = acc.find(item => item.draftId === current.draftId && item.docType === current.docType);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        const transformedData = uniqueData.map(application => ({
          draftId: application.draftId,
          title: application.title,
          draftDate: application.draftDate ? parseDateTime(application.draftDate) : '',
          drafter: application.drafter,
          lastUpdateDate: application.lastUpdateDate ? parseDateTime(application.lastUpdateDate) : '',
          lastUpdater: application.lastUpdateDate ? application.lastUpdater : '', 
          docType: application.docType, 
        }));

        transformedData.sort((a, b) => new Date(b.draftDate) - new Date(a.draftDate));

        setPendingApplications(transformedData);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching pending applications:', error.response ? error.response.data : error.message);
    }
  };

  const handleCancelClick = (application) => {
    setSelectedApplication(application);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const endpoint = selectedApplication.docType === '명함신청' ? '/api/bcd/' : '/api/doc/';
      await axios.put(`${endpoint}${selectedApplication.draftId}`);
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
        <Button
          className="modify-button"
          onClick={() => navigate(row.docType === '명함신청' ? `/api/bcd/${row.draftId}` : `/api/doc/${row.draftId}`, { state: { returnTo: '/api/myPendingList' } })}
        >
          수 정
        </Button>
      ),
    },
    {
      header: '신청취소',
      accessor: 'cancel',
      width: '9%',
      Cell: ({ row }) => (
        <Button className="cancel-button" onClick={() => handleCancelClick(row)}>
          취 소
        </Button>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="pending-applications">
        <h2>승인대기 내역</h2>
        <Breadcrumb items={['나의 신청내역', '승인대기 내역']} />
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
