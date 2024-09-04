import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConfirmModal from '../../components/common/ConfirmModal';
import SealApprovalModal from './SealApprovalModal';
import SignitureImage from '../../assets/images/signiture.png';
import '../../styles/seal/SealManagementList.css';
import { AuthContext } from '../../components/AuthContext';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function SealManagementList() {
  const { auth } = useContext(AuthContext); 
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);

  const fetchSealManagementList = useCallback(async () => {
    try {
      const { instCd } = auth;  

      const response = await axios.get(`${apiUrl}/api/seal/managementList`, {
        params: {
          instCd,
        },
      });
    
      const fetchedData = response.data.data.map(item => ({
        id: item.draftId,
        date: item.useDate,
        submitter: item.submission,
        purpose: item.purpose,
        drafter: item.drafter, 
        sealType: {
          corporateSeal: item.corporateSeal !== "" ? item.corporateSeal : 0,
          facsimileSeal: item.facsimileSeal !== "" ? item.facsimileSeal : 0,
          companySeal: item.companySeal !== "" ? item.companySeal : 0,
        },
        signitureImage: SignitureImage, 
        approval: [],  
        status: '결재진행중', 
      }));
  
      setFilteredApplications(fetchedData);
  
      const clickedRows = JSON.parse(localStorage.getItem('clickedRows')) || [];
      setClickedRows(clickedRows);
    } catch (error) {
      console.error('Error fetching seal management list:', error);
    }
  }, [auth]);

  useEffect(() => {
    fetchSealManagementList();
  }, [fetchSealManagementList]);

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
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
        applicantName: document.drafter,
        approvers: document.approval || [],
        signitureImage: document.signitureImage || SignitureImage,
      });
      setModalVisible(true);
    }
  };
  
  return (
    <div className="content">
      <div className="seal-management-list">
        <h2>인장 관리대장</h2>
        <Breadcrumb items={['인장 대장', '인장 관리대장']} />
        <table className="table">
          <thead>
            <tr>
              <th rowSpan="2">일자</th>
              <th rowSpan="2">제출처</th>
              <th rowSpan="2">사용목적</th>
              <th colSpan="3">인장구분</th>
              <th rowSpan="2">결재</th>
            </tr>
            <tr>
              <th>법인인감</th>
              <th>사용인감</th>
              <th>회사인</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{app.date}</td>
                  <td>{app.submitter}</td>
                  <td>{app.purpose}</td>
                  <td>{app.sealType.corporateSeal}</td>
                  <td>{app.sealType.facsimileSeal}</td>
                  <td>{app.sealType.companySeal}</td>
                  <td
                    className={`status-${app.status.replace(/\s+/g, '-').toLowerCase()} clickable ${
                      clickedRows.includes(app.id) ? 'confirmed' : ''
                    }`}
                    onClick={() => handleRowClick(app.status, app)}
                  >
                    {app.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
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
