import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import ConfirmModal from '../components/common/ConfirmModal';
import deleteIcon from '../assets/images/delete.png';
import '../styles/SealRegistrationList.css';

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
        sealName: 'Seal A',
        sealImage: 'imageA.png',
        department: 'Department A',
        purpose: 'Official Use',
        manager: 'Manager A',
        registrationDate: '2024-08-01',
        deleted: false,
      },
      {
        draftId: 2,
        sealName: 'Seal B',
        sealImage: 'imageB.png',
        department: 'Department B',
        purpose: 'Personal Use',
        manager: 'Manager B',
        registrationDate: '2024-08-02',
        deleted: false,
      },
      {
        draftId: 3,
        sealName: 'Seal C',
        sealImage: 'imageC.png',
        department: 'Department C',
        purpose: 'Business Use',
        manager: 'Manager C',
        registrationDate: '2024-08-03',
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
        if (searchType === '사용부서') return app.department.includes(keyword);
        if (searchType === '용도') return app.purpose.includes(keyword);
        if (searchType === '관리자') return app.manager.includes(keyword);
        if (searchType === '전체') {
          return (
            app.department.includes(keyword) ||
            app.purpose.includes(keyword) ||
            app.manager.includes(keyword)
          );
        }
        return true;
      });
    }

    if (startDate && endDate) {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.registrationDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return appDate >= start && appDate <= end;
      });
    }

    setFilteredApplications(filtered);
  };

  const columns = [
    { header: '인영', accessor: 'sealName', width: '15%' },
    {
      header: '인영이미지',
      accessor: 'sealImage',
      width: '15%',
      Cell: ({ row }) => {
        return (
          <div className="image-cell">
            <img src={row.sealImage} alt={row.sealName} className="seal-image" />
          </div>
        );
      },
    },
    { header: '사용부서', accessor: 'department', width: '15%' },
    { header: '용도', accessor: 'purpose', width: '20%' },
    { header: '관리자', accessor: 'manager', width: '15%' },
    { header: '등록일', accessor: 'registrationDate', width: '10%' },
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
