import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConfirmModal from '../../components/common/ConfirmModal';
import SealApprovalModal from './SealApprovalModal';
import ConditionFilter from '../../components/common/ConditionFilter'; 
import SignitureImage from '../../assets/images/signiture.png';
import '../../styles/seal/SealManagementList.css';
import { AuthContext } from '../../components/AuthContext';

const SealManagementTable = ({ filteredApplications, handleRowClick, clickedRows }) => {
  return (
      <table className="table">
          <thead>
              <tr>
                  <th>일자</th>
                  <th>제출처</th>
                  <th>사용목적</th>
                  <th>법인인감</th>
                  <th>사용인감</th>
                  <th>회사인</th>
                  <th>결재</th>
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
                              className={`status-${app.status.replace(/\s+/g, '-').toLowerCase()} clickable ${clickedRows.includes(app.id) ? 'confirmed' : ''}`}
                              onClick={() => handleRowClick(app.status, app)}
                          >
                              {app.status}
                          </td>
                      </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="7">조회된 데이터가 없습니다.</td>
                  </tr>
              )}
          </tbody>
      </table>
  );
};

function SealManagementList() {

  const [applications, setApplications] = useState([]);
  const { auth } = useContext(AuthContext); 
  const [clickedRows, setClickedRows] = useState([]);
  const [filterInputs, setFilterInputs] = useState({
    searchType: '전체',
    keyword: '',
  });
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);

  const fetchSealManagementList = useCallback(async () => {
    try {
      const { instCd } = auth;  

      const response = await axios.get(`/api/seal/managementList`, {
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
  
      setApplications(fetchedData);
      setFilteredApplications(fetchedData);

      const clickedRows = JSON.parse(localStorage.getItem('clickedRows')) || [];
      setClickedRows(clickedRows);
    } catch (error) {
      console.error('Error fetching seal management list:', error);
    }
  }, [auth, setApplications, setFilteredApplications]);

  useEffect(() => {
    fetchSealManagementList();
  }, [fetchSealManagementList]);

  const applyFilters = useCallback(() => {
    let filteredData = applications;

    const keyword = filterInputs.keyword.toLowerCase().trim();
    if (keyword) {
      if (filterInputs.searchType === '전체') {
        filteredData = filteredData.filter(application =>
          application.date.toLowerCase().includes(keyword) ||
          application.submitter.toLowerCase().includes(keyword) ||
          application.purpose.toLowerCase().includes(keyword)
        );
      } else if (filterInputs.searchType === '일자') {
        filteredData = filteredData.filter(application => 
          application.date.toLowerCase().includes(keyword)
        );
      } else if (filterInputs.searchType === '제출처') {
        filteredData = filteredData.filter(application => 
          application.submitter.toLowerCase().includes(keyword)
        );
      } else if (filterInputs.searchType === '사용목적') {
        filteredData = filteredData.filter(application => 
          application.purpose.toLowerCase().includes(keyword)
        );
      }
    }

    setFilteredApplications(filteredData);
  }, [applications, filterInputs, setFilteredApplications]);

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


  const handleReset = () => {
    setFilterInputs({
      searchType: '전체',
      keyword: '',
    });
    setFilteredApplications(applications); 
  };

  const handleConfirmDelete = () => {
      setShowDeleteModal(false);
  };
    
  const closeModal = () => {
      setModalVisible(false);
      setSelectedDocumentDetails(null);
  };

  return (
    <div className="content">
      <div className="seal-management-list">
        <h2>인장 관리대장</h2>
        <Breadcrumb items={['인장 대장', '인장 관리대장']} />

        <ConditionFilter
          startDate={null}  
          setStartDate={() => {}} 
          endDate={null} 
          setEndDate={() => {}} 
          filters={{}} 
          setFilters={() => {}}
          onSearch={applyFilters} 
          onReset={handleReset} 
          showStatusFilters={false}
          showSearchCondition={true}
          showDocumentType={false}
          searchType={filterInputs.searchType}
          setSearchType={(searchType) => setFilterInputs(prev => ({ ...prev, searchType }))}
          keyword={filterInputs.keyword}
          setKeyword={(keyword) => setFilterInputs(prev => ({ ...prev, keyword }))}
          searchOptions={['전체', '일자', '제출처', '사용목적']}
          setDocumentType={() => {}}
        />

        <SealManagementTable 
               filteredApplications={filteredApplications} 
               handleRowClick={handleRowClick} 
               clickedRows={clickedRows} 
            />
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
