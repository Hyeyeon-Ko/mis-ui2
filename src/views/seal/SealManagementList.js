import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import ConfirmModal from '../../components/common/ConfirmModal';
import SealApprovalModal from './SealApprovalModal';
import SignitureImage from '../../assets/images/signiture.png';
import '../../styles/seal/SealManagementList.css';

function SealManagementList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);

  useEffect(() => {
    fetchSealManagementList();
  }, []);

  const fetchSealManagementList = () => {
    const fetchedData = [
      {
        date: '2024-08-01',
        submitter: '재단본부',
        purpose: '사용인감계',
        sealType: { corporateSeal: 1, personalSeal: 0, companySeal: 0 },
        quantity : 1,
        applicantName: '김범수',
        signitureImage: SignitureImage,
        approval: [
          { name: '나얼', approvalDate: '2024-08-08', signitureImage: SignitureImage },
          { name: '박효신', approvalDate: '2024-08-09', signitureImage: SignitureImage },
          { name: '이수', approvalDate: '2024-08-10', signitureImage: SignitureImage },
        ],
        status: '결재완료',
      },
      {
        date: '2024-08-02',
        submitter: '재단본부',
        purpose: '00계약',
        sealType: { corporateSeal: 0, personalSeal: 1, companySeal: 0 },
        quantity : 3,
        applicantName: '나얼',
        signitureImage: SignitureImage,
        approval: [{}],
        status: '결재진행중',
      },
    ];

    setApplications(fetchedData);
    setFilteredApplications(fetchedData);

    const clickedRows = JSON.parse(localStorage.getItem('clickedRows')) || [];
      setClickedRows(clickedRows);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
  };

  const handleSearch = ({ searchType, keyword, startDate, endDate }) => {
    let filtered = applications;

    if (keyword) {
      filtered = filtered.filter(app => {
        if (searchType === '제출처') return app.submitter.includes(keyword);
        if (searchType === '사용목적') return app.purpose.includes(keyword);
        if (searchType === '인장구분') return (
          app.sealType.corporateSeal.includes(keyword) ||
          app.sealType.personalSeal.includes(keyword) ||
          app.sealType.companySeal.includes(keyword)
        );
        if (searchType === '전체') {
          return (
            app.submitter.includes(keyword) ||
            app.purpose.includes(keyword) ||
            app.sealType.corporateSeal.includes(keyword) ||
            app.sealType.personalSeal.includes(keyword) ||
            app.sealType.companySeal.includes(keyword)
          );
        }
        return true;
      });
    }

    if (startDate && endDate) {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return appDate >= start && appDate <= end;
      });
    }

    setFilteredApplications(filtered);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDocumentDetails(null);
  };

  const handleRowClick = (status, document) => {
    if (status === '결재진행중' || status === '결재완료') {
      if (status === '결재완료') {
        setClickedRows(prevClickedRows => {
          const newClickedRows = [...prevClickedRows, document.id];
          localStorage.setItem('clickedRows', JSON.stringify(newClickedRows));
          return newClickedRows;
        });
      }
      setSelectedDocumentDetails({
        ...document,
        approvers: document.approval || [],
        signitureImage: document.signitureImage || SignitureImage,
      });
      setModalVisible(true);
    }
  };

  return (
    <div className="content">
      <div className="seal-management-list">
        <h2>인장 관리 대장</h2>
        <Breadcrumb items={['인장 대장', '인장 관리 대장']} />
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
        {filteredApplications.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th rowSpan="2">일자</th>
                <th rowSpan="2">제출처</th>
                <th rowSpan="2">사용목적</th>
                <th colSpan="3">인장구분</th>
                <th rowSpan="2">날인부수</th>
                <th rowSpan="2">결재</th>
              </tr>
              <tr>
                <th>법인인감</th>
                <th>사용인감</th>
                <th>회사인</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{app.date}</td>
                  <td>{app.submitter}</td>
                  <td>{app.purpose}</td>
                  <td>{app.sealType.corporateSeal}</td>
                  <td>{app.sealType.personalSeal}</td>
                  <td>{app.sealType.companySeal}</td>
                  <td>{app.quantity}</td>
                  <td
                    className={`status-${app.status.replace(/\s+/g, '-').toLowerCase()} clickable ${
                      clickedRows.includes(app.id) ? 'confirmed' : ''
                    }`}
                    onClick={() => handleRowClick(app.status, app)}
                  >
                    {app.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data available</div>
        )}
        {showDeleteModal && (
          <ConfirmModal
            message="이 문서를 삭제하시겠습니까?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </div>
      {modalVisible && selectedDocumentDetails && (
        <SealApprovalModal
          show={modalVisible}
          onClose={closeModal}
          documentDetails={{
            date: selectedDocumentDetails.date,
            applicantName: selectedDocumentDetails.applicantName,
            approvers: selectedDocumentDetails.approvers,
            signitureImage: selectedDocumentDetails.signitureImage,
          }}
        />
      )}
    </div>
  );
}

export default SealManagementList;
