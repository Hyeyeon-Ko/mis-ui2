import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import ConfirmModal from '../components/common/ConfirmModal';
import deleteIcon from '../assets/images/delete.png';
import '../styles/DocOutList.css';
import axios from 'axios';

function DocOutList() {
  const [applications, setApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filters, setFilters] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
 
  useEffect(() => {
    fetchDocOutList(filters);
  }, [filters]);

  const fetchDocOutList = async (filterParams = {}) => {
    try {
      const response = await axios.get('/api/doc/sendList', {
        params: {
          startDate: filterParams.startDate || '',
          endDate: filterParams.endDate || '',
        },
      });
      console.log('response: ', response);

      if (response.data && response.data.data) {
        const formattedData = response.data.data.map(item => ({
          draftId: item.draftId,
          draftDate: item.draftDate,
          docId: item.docId,
          resSender: item.resSender,
          title: item.title,
          drafter: item.drafter,
          status: item.status,
        }));
        console.log('formattedData: ', formattedData);
        setApplications(formattedData);
      }
    } catch (error) {
      console.error('Error fetching document list:', error);
    }
  };

  const handleSearch = () => {
    setFilters({
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setFilters({});
  };

  const handleDeleteClick = (draftId) => {
    if (draftId) {
      setSelectedDraftId(draftId);
      setShowDeleteModal(true);
    } else {
      console.error('Invalid draftId:', draftId);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedDraftId === null) return;

    try {
      await axios.put('/api/doc/delete', null, {
        params: {
          draftId: selectedDraftId,
        },
      });
      setShowDeleteModal(false);
      fetchDocOutList(filters); // 삭제 후 데이터 새로 고침
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const columns = [
    { header: '접수일자', accessor: 'draftDate', width: '8%' },
    { header: '문서번호', accessor: 'docId', width: '8%' },
    { header: '발신처', accessor: 'resSender', width: '10%' },
    { header: '제목', accessor: 'title', width: '20%' },
    { header: '접수인', accessor: 'drafter', width: '8%' },
    { header: '상태', accessor: 'status', width: '8%'},
    {
      header: '신청 삭제',
      accessor: 'delete',
      width: '10%',
      Cell: ({ row }) => (
        <div className="icon-cell">
          <img
            src={deleteIcon}
            alt="Delete"
            className="action-icon"
            onClick={() => handleDeleteClick(row.draftId)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="doc-out-list">
        <h2>문서 발신 대장</h2>
        <Breadcrumb items={['문서수발신 관리', '문서 발신 대장']} />
        <ConditionFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onSearch={handleSearch}
          onReset={handleReset}
        />
        <div className="doc-out-content">
            <Table columns={columns} data={applications} />
        </div>
        {showDeleteModal && (
          <ConfirmModal
            message="이 문서를 삭제하시겠습니까?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default DocOutList;
