import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../components/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import CorpDocApprovalModal from '../../views/corpdoc/CorpDocApprovalModal';
import ConditionFilter from '../../components/common/ConditionFilter';
import SignitureImage from '../../assets/images/signiture.png';
import axios from 'axios';
import '../../styles/corpdoc/CorpDocRnpList.css';

function CorpDocRnpList() {
  const { auth } = useContext(AuthContext);

  const [applications, setApplications] = useState([]); 
  const [filteredApplications, setFilteredApplications] = useState([]); 
  const [filterInputs, setFilterInputs] = useState({
    searchType: '전체',
    keyword: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);

  const fetchRnpData = useCallback(async () => {
    try {
      const response = await axios.get('/api/corpDoc/rnpList', {
        params: { instCd: auth.instCd },
      });

      if (response.data) {
        const rnpListData = response.data.data.map(item => ({
          id: item.draftId,
          date: item.draftDate,
          drafter: item.drafter,
          submission: item.submission,
          purpose: item.purpose,
          corpSeal: item.certCorpseal,
          registry: item.certCoregister,
          usesignet: item.certUsesignet,
          warrant: item.warrant,
          status: '결재진행중',
          signitureImage: SignitureImage,
          approvers: [],
        }));

        setApplications(rnpListData);
        setFilteredApplications(rnpListData);

        const clickedRows = JSON.parse(localStorage.getItem('clickedRows')) || [];
        setClickedRows(clickedRows);
      }
    } catch (error) {
      console.error("Error fetching RNP data:", error);
    }
  }, [auth.instCd]);

  useEffect(() => {
    fetchRnpData();
  }, [fetchRnpData]);

  const applyFilters = useCallback(() => {
    let filteredData = applications;

    const keyword = filterInputs.keyword.toLowerCase().trim();
    if (keyword) {
      if (filterInputs.searchType === '전체') {
        filteredData = filteredData.filter(application =>
          application.drafter.toLowerCase().includes(keyword) ||
          application.submission.toLowerCase().includes(keyword) ||
          application.purpose.toLowerCase().includes(keyword) ||
          application.date.includes(keyword)
        );
      } else if (filterInputs.searchType === '수령일자') {
        filteredData = filteredData.filter(application =>
          application.date.includes(keyword)
        );
      } else if (filterInputs.searchType === '신청자') {
        filteredData = filteredData.filter(application =>
          application.drafter.toLowerCase().includes(keyword)
        );
      } else if (filterInputs.searchType === '제출처') {
        filteredData = filteredData.filter(application =>
          application.submission.toLowerCase().includes(keyword)
        );
      } else if (filterInputs.searchType === '사용목적') {
        filteredData = filteredData.filter(application =>
          application.purpose.toLowerCase().includes(keyword)
        );
      }
    }

    setFilteredApplications(filteredData);
  }, [applications, filterInputs]);

  const handleReset = () => {
    setFilterInputs({
      searchType: '전체',
      keyword: '',
    });
    setFilteredApplications(applications);
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
        signitureImage: document.signitureImage || SignitureImage,
      });
      setModalVisible(true);
    }
  };

  return (
    <div className='content'>
      <div className='corpDoc-rnp-list'>
        <h2>서류 수불 대장</h2>
        <Breadcrumb items={['법인서류 대장', '서류 수불 대장']} />

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
          searchOptions={['전체', '수령일자', '신청자', '제출처', '사용목적']}
        />

        <table className="table">
          <thead>
            <tr>
              <th rowSpan="2">수령일자</th>
              <th rowSpan="2">신청자</th>
              <th rowSpan="2">제출처</th>
              <th rowSpan="2">사용목적</th>
              <th colSpan="4">법인서류</th>
              <th rowSpan="2">수령인</th>
            </tr>
            <tr>
              <th>법인인감증명서</th>
              <th>법인등기사항전부증명서</th>
              <th>사용인감계</th>
              <th>위임장</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{app.date}</td>
                  <td>{app.drafter}</td>
                  <td>{app.submission}</td>
                  <td>{app.purpose}</td>
                  <td>{app.corpSeal}</td>
                  <td>{app.registry}</td>
                  <td>{app.usesignet}</td>
                  <td>{app.warrant}</td>
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
                <td colSpan="9" style={{ textAlign: 'center' }}>데이터가 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {modalVisible && selectedDocumentDetails && (
        <CorpDocApprovalModal
          show={modalVisible}
          onClose={closeModal}
          documentDetails={selectedDocumentDetails}
        />
      )}
    </div>
  );
}

export default CorpDocRnpList;
