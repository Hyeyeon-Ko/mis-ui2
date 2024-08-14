import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import deleteIcon from '../../assets/images/delete.png';
import '../../styles/doc/DocOutList.css';
import axios from 'axios';

function DocOutList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchDocOutList();
  }, []);

  const fetchDocOutList = async () => {
    try {
      const response = await axios.get('/api/doc/sendList');

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
        setApplications(formattedData);
        setFilteredApplications(formattedData);
      }
    } catch (error) {
      console.error('Error fetching document list:', error);
    }
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
      fetchDocOutList();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleSearch = ({ searchType, keyword, startDate, endDate }) => {
    let filtered = applications;

    if (keyword) {
      filtered = filtered.filter(app => {
        if (searchType === '수신처') return app.resSender.includes(keyword);
        if (searchType === '제목') return app.title.includes(keyword);
        if (searchType === '접수인') return app.drafter.includes(keyword);
        if (searchType === '전체') {
          return (
            app.resSender.includes(keyword) ||
            app.title.includes(keyword) ||
            app.drafter.includes(keyword)
          );
        }
        return true;
      });
    }

    if (startDate && endDate) {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.draftDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return appDate >= start && appDate <= end;
      });
    }

    setFilteredApplications(filtered);
  };

  const columns = [
    { header: '접수일자', accessor: 'draftDate', width: '8%' },
    { header: '문서번호', accessor: 'docId', width: '8%' },
    { header: '수신처', accessor: 'resSender', width: '10%' },
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
          onReset={() => setFilteredApplications(applications)}
          showDocumentType={false}
          showSearchCondition={true}
          excludeSender={true}
        />
        <div className="doc-out-content">
            <Table columns={columns} data={filteredApplications} />
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
