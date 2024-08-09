import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import CorpDocApprovalModal from '../../views/corpdoc/CorpDocApprovalModal';
import deleteIcon from '../assets/images/delete.png';
import '../styles/CorpDocIssueList.css';

function CorpDocIssueList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);

  useEffect(() => {
    fetchCorpDocIssueList();
  }, []);

  const fetchCorpDocIssueList = () => {
    const fetchedData = [
      {
        id: 1,
        date: '2024-05-02',
        submitter: '현대로보틱스',
        usagePurpose: '결제계좌등록',
        certificate: { incoming: 3, used: 0, left: 18 },
        registry: { incoming: 0, used: 1, left: 20 },
        status: '결재진행중',
        applicantName: '홍길동', // Added applicant name
        imageUrl: 'path/to/image1.jpg', // Added image URL
        approvers: [
          { name: '김철수', approvalDate: '2024-08-08' },
          { name: '박영희', approvalDate: '2024-08-08' },
        ],
      },
      {
        id: 2,
        date: '2024-05-03',
        submitter: '재단본부',
        usagePurpose: '결제계좌등록',
        certificate: { incoming: 5, used: 0, left: 20 },
        registry: { incoming: 0, used: 9, left: 3 },
        status: '결재진행중',
        applicantName: '이영희', // Added applicant name
        imageUrl: 'path/to/image2.jpg', // Added image URL
        approvers: [
          {},
        ],
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
    { header: '법인인감증명서', accessor: 'sealType', width: '15%' },
    { header: '법인등기부등본', accessor: 'numSeals', width: '10%' },
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
      <div className="corpDoc-issue-list">
        <h2>서류 발급 대장</h2>
        <Breadcrumb items={['법인서류 관리', '서류 발급 대장']} />
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
        <div className="corpDoc-issue-content">
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

export default CorpDocIssueList;
