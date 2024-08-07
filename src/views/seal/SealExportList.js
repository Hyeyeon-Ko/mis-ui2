import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import deleteIcon from '../../assets/images/delete.png';
import '../../styles/SealExportList.css';

function SealExportList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchSealExportList();
  }, []);

  const fetchSealExportList = () => {
    const mockData = [
      {
        draftId: 1,
        exportDate: '2024-08-01',
        returnDate: '2024-08-02',
        purpose: 'Official Use',
        sealType: 'Type A',
        approval: 'Approved',
        note: 'First export',
        deleted: false,
      },
      {
        draftId: 2,
        exportDate: '2024-08-02',
        returnDate: '2024-08-03',
        purpose: 'Personal Use',
        sealType: 'Type B',
        approval: 'Pending',
        note: 'Second export',
        deleted: false,
      },
      {
        draftId: 3,
        exportDate: '2024-08-03',
        returnDate: '2024-08-04',
        purpose: 'Business Use',
        sealType: 'Type C',
        approval: 'Rejected',
        note: 'Third export',
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
        if (searchType === '사용목적') return app.purpose.includes(keyword);
        if (searchType === '인장구분') return app.sealType.includes(keyword);
        if (searchType === '전체') {
          return (
            app.purpose.includes(keyword) ||
            app.sealType.includes(keyword)
          );
        }
        return true;
      });
    }

    if (startDate && endDate) {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.exportDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return appDate >= start && appDate <= end;
      });
    }

    setFilteredApplications(filtered);
  };

  const columns = [
    { header: '일련번호', accessor: 'draftId', width: '10%' },
    { header: '반출일자', accessor: 'exportDate', width: '15%' },
    { header: '반납일자', accessor: 'returnDate', width: '15%' },
    { header: '사용목적', accessor: 'purpose', width: '20%' },
    { header: '인장구분', accessor: 'sealType', width: '15%' },
    { header: '결재', accessor: 'approval', width: '10%' },
    { header: '비고', accessor: 'note', width: '10%' },
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
      <div className="seal-export-list">
        <h2>인장 반출 대장</h2>
        <Breadcrumb items={['인장 관리', '인장 반출 대장']} />
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
        <div className="seal-export-content">
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

export default SealExportList;
