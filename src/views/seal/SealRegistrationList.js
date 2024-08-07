import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import deleteIcon from '../../assets/images/delete.png';
import '../../styles/SealRegistrationList.css';

function SealRegistrationList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchSealRegistrationList();
  }, []);

  const fetchSealRegistrationList = () => {
    const mockData = [
      {
        draftId: 1,
        draftDate: '2024-08-01',
        submitTo: 'Department A',
        purpose: 'Official Use',
        sealType: 'Type A',
        numSeals: 2,
        approval: 'Approved',
        deleted: false,
      },
      {
        draftId: 2,
        draftDate: '2024-08-02',
        submitTo: 'Department B',
        purpose: 'Personal Use',
        sealType: 'Type B',
        numSeals: 3,
        approval: 'Pending',
        deleted: false,
      },
      {
        draftId: 3,
        draftDate: '2024-08-03',
        submitTo: 'Department C',
        purpose: 'Business Use',
        sealType: 'Type C',
        numSeals: 1,
        approval: 'Rejected',
        deleted: false,
      },
    ];

    setApplications(mockData);
    setFilteredApplications(mockData);
  };

  const handleDeleteClick = (draftId) => {
    if (draftId) {
      setSelectedDraftId(draftId);
      setShowDeleteModal(true);
    } else {
      console.error('Invalid draftId:', draftId);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedDraftId === null) return;

    const updatedApplications = applications.filter(app => app.draftId !== selectedDraftId);
    setApplications(updatedApplications);
    setFilteredApplications(updatedApplications);
    setShowDeleteModal(false);
  };

  const handleSearch = ({ searchType, keyword, startDate, endDate }) => {
    let filtered = applications;

    if (keyword) {
      filtered = filtered.filter(app => {
        if (searchType === '제출처') return app.submitTo.includes(keyword);
        if (searchType === '사용목적') return app.purpose.includes(keyword);
        if (searchType === '인장구분') return app.sealType.includes(keyword);
        if (searchType === '전체') {
          return (
            app.submitTo.includes(keyword) ||
            app.purpose.includes(keyword) ||
            app.sealType.includes(keyword)
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
    { header: '일자', accessor: 'draftDate', width: '10%' },
    { header: '제출처', accessor: 'submitTo', width: '15%' },
    { header: '사용목적', accessor: 'purpose', width: '20%' },
    { header: '인장구분', accessor: 'sealType', width: '15%' },
    { header: '날인부수', accessor: 'numSeals', width: '10%' },
    { header: '결재', accessor: 'approval', width: '10%' },
    {
      header: '신청 삭제',
      accessor: 'delete',
      width: '10%',
      Cell: ({ row }) => {
        return (
          <div className="icon-cell">
            <img
              src={deleteIcon}
              alt="Delete"
              className="action-icon"
              onClick={() => handleDeleteClick(row.draftId)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="content">
      <div className="seal-registration-list">
        <h2>인장 등록 대장</h2>
        <Breadcrumb items={['인장 관리', '인장 등록 대장']} />
        <ConditionFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onSearch={handleSearch}
          onReset={() => setFilteredApplications(applications)}
          showDocumentType={false}
          showSearchCondition={true}
          excludeRecipient={true}
        />
        <div className="seal-registration-content">
          <Table columns={columns} data={filteredApplications}/>
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

export default SealRegistrationList;
