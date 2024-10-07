import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import { AuthContext } from '../../components/AuthContext'; 
import '../../styles/list/MyPendingList.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import Pagination from '../../components/common/Pagination';



function MyPendingList() {
  const { auth } = useContext(AuthContext); 
  const [pendingApplications, setPendingApplications] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [totalPages, setTotalPages] = useState('1');
  const [currentPage, setCurrentPage] = useState('1');
  const navigate = useNavigate();

  const fetchPendingApplications = useCallback(async () => {
    try {
      const response = await axios.get(`/api/myPendingList`, {
        params: {
          userId: auth.userId, 
          instCd: auth.instCd,
        },
      });
      if (response.data && response.data.data) {
        const data = [
          ...(response.data.data.bcdPendingResponses || []),
          ...(response.data.data.docPendingResponses || []),
          ...(response.data.data.corpDocPendingResponses || []),
          ...(response.data.data.sealPendingResponses || []),
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
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (error) {
      console.error('Error fetching pending applications:', error.response ? error.response.data : error.message);
    }
  }, [auth.userId]); 

  useEffect(() => {
    fetchPendingApplications();
  }, [fetchPendingApplications]); 

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleCancelClick = (application) => {
    setSelectedApplication(application);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
      let endpoint = '';
  
      switch (selectedApplication.docType) {
        case '명함신청':
          endpoint = '/api/bcd/';
          break;
        case '문서발신':
        case '문서수신': 
          endpoint = '/api/doc/';
          break;
        case '법인서류':
          endpoint = '/api/corpDoc/';
          break;
        case '인장신청(날인)':
          endpoint = '/api/seal/imprint/';
          break;
        case '인장신청(반출)':
          endpoint = '/api/seal/export/';
          break;
        default:
          console.error('Unknown document type:', selectedApplication.docType);
          return;
      }
  
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

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  const pendingColumns = [
    { header: '제목', accessor: 'title', width: '30%' },
    { header: '신청일시', accessor: 'draftDate', width: '14%' },
    { header: '신청자', accessor: 'drafter', width: '9%' },
    { header: '수정일시', accessor: 'lastUpdateDate', width: '14%' },
    { header: '최종수정자', accessor: 'lastUpdater', width: '11%' },
    {
      header: '수정',
      accessor: 'modify',
      width: '6%',
      Cell: ({ row }) => (
        <Button
          className="modify-button"
          onClick={() => {
            let path;
            switch (row.docType) {
              case '명함신청':
                path = `/bcd/${row.draftId}`;
                break;
              case '문서수발신':
                path = `/doc/${row.draftId}`;
                break;
              case '법인서류':
                path = `/corpDoc/${row.draftId}`;
                break;
              case '인장신청(날인)':
                path = `/seal/imprint/${row.draftId}`;
                break;
              case '인장신청(반출)':
                path = `/seal/export/${row.draftId}`;
                break;
              default:
                path = `/doc/${row.draftId}`; 
            }
            navigate(path, { state: { returnTo: '/api/myPendingList' } });
          }}
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
        <Pagination totalPages={totalPages} onPageChange={handlePageClick} />
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
