import React, { useContext, useState, useEffect, useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import CustomButton from '../../components/common/CustomButton';
import ConditionFilter from '../../components/common/ConditionFilter'; 
import CorpDocApprovalModal from '../../views/corpdoc/CorpDocApprovalModal';
import CorpDocStoreModal from './CorpDocStoreModal';
import IssueModal from '../../components/common/ConfirmModal';
import SignitureImage from '../../assets/images/signiture.png';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/corpdoc/CorpDocIssueList.css';

function CorpDocIssueList() {
  const { refreshSidebar } = useContext(AuthContext);
  const [applications, setApplications] = useState([]); 
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filteredPendingApplications, setFilteredPendingApplications] = useState([]);
  const [filterInputs, setFilterInputs] = useState({
    searchType: '전체',
    keyword: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedPendingApp, setSelectedPendingApp] = useState(null);
  const [totalCorpseal, setTotalCorpseal] = useState(0);
  const [totalCoregister, setTotalCoregister] = useState(0);

  const fetchIssueData = useCallback(async () => {
    try {
      const response = await axios.get('/api/corpDoc/issueList');
      console.log("issueList: ", response.data.data.issueList);

      if (response.data) {
        const issueListData = response.data.data.issueList.map(item => ({
          id: item.draftId,
          date: item.draftDate,
          issueDate: item.issueDate.split("T")[0],
          submission: item.submission || '', 
          purpose: item.purpose || '',       
          corpSeal: {
            incoming: item.status === "X" ? item.certCorpseal : 0,
            used: item.status === "X" ? 0 : item.certCorpseal,
            left: item.totalCorpseal
          },
          registry: {
            incoming: item.status === "X" ? item.certCoregister : 0,
            used: item.status === "X" ? 0 : item.certCoregister,
            left: item.totalCoregister
          },
          note: item.note,
          applicantName: item.drafter || '',  
          center: item.instNm || '',         
          approveStatus: '결재진행중',
          status: item.status,
          approvers: [],
          signitureImage: SignitureImage,
        }));

        const issuePendingListData = response.data.data.issuePendingList.map(item => ({
          id: item.draftId,
          useDate: item.useDate,
          submission: item.submission || '',  
          purpose: item.purpose || '',      
          corpSeal: { incoming: 0, used: item.certCorpseal, left: item.totalCorpseal },
          registry: { incoming: 0, used: item.certCoregister, left: item.totalCoregister },
          usesignet: { used: item.certUsesignet },
          warrant: { used: item.warrant },
          status: item.status,
          applicantName: item.drafter || '',  
          center: item.instNm || '',         
          approvers: [],
          signitureImage: SignitureImage,
        }));

        setApplications(issueListData);
        setFilteredApplications(issueListData);
        setFilteredPendingApplications(issuePendingListData);

        const totalValues = extractTotalValues(issueListData);

        setTotalCorpseal(totalValues.totalCorpseal);
        setTotalCoregister(totalValues.totalCoregister);
      }
    } catch (error) {
      console.error("Error fetching issue data:", error);
    }
  }, []); 

  useEffect(() => {
    fetchIssueData();
  }, [fetchIssueData]);

  const applyFilters = useCallback(() => {
    let filteredData = applications;

    const keyword = filterInputs.keyword.toLowerCase().trim();
    if (keyword) {
      if (filterInputs.searchType === '전체') {
        filteredData = filteredData.filter(application =>
          application.applicantName.toLowerCase().includes(keyword) ||
          application.center.toLowerCase().includes(keyword) ||
          application.submission.toLowerCase().includes(keyword) ||
          application.purpose.toLowerCase().includes(keyword) ||
          application.issueDate.includes(keyword)
        );
      } else if (filterInputs.searchType === '발급/입고일자') {
        filteredData = filteredData.filter(application =>
          application.issueDate.includes(keyword)
        );
      } else if (filterInputs.searchType === '센터') {
        filteredData = filteredData.filter(application =>
          application.center.toLowerCase().includes(keyword)
        );
      } else if (filterInputs.searchType === '이름') {
        filteredData = filteredData.filter(application =>
          application.applicantName.toLowerCase().includes(keyword)
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

  const extractTotalValues = (data) => {
    if (!data || !Array.isArray(data)) {
      return { totalCorpseal: 0, totalCoregister: 0 };
    }
    
    const lastRow = data[data.length - 1];
    const totalCorpseal = lastRow?.corpSeal?.left ?? 0;
    const totalCoregister = lastRow?.registry?.left ?? 0;
  
    return { totalCorpseal, totalCoregister };
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

  const handleIssue = (app) => {
    setSelectedPendingApp(app);
    setShowIssueModal(true);
  };

  const handleconfirmIssue = async () => {
    if (filteredApplications.length === 0) {
      alert('입고된 서류가 없습니다. 먼저 서류 입고를 해주세요.');
      setShowIssueModal(false);
      return;
    }
  
    const { totalCorpseal, totalCoregister } = extractTotalValues(filteredApplications);
  
    if (totalCorpseal === 0 || totalCoregister === 0) {
      alert('입고된 서류가 없습니다. 서류 입고를 해주세요.');
      return;
    }
  
    try {
      const response = await axios.put(`/api/corpDoc/issue?draftId=${selectedPendingApp.id}`, {
        totalCorpseal,
        totalCoregister
      });
  
      if (response.status === 200) {
        fetchIssueData();
        setShowIssueModal(false);
        
        refreshSidebar();
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('서류를 발급할 수 없습니다. 잔고를 확인해주세요.');
      } else {
        alert('서류 발급 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      setShowIssueModal(false);
    }
  };
  
  return (
    <div className='content'>
      <div className='corpDoc-issue-list'>
        <h2>서류 발급 대장</h2>
        <div className='corpDoc-header-row'>
          <Breadcrumb items={['법인서류 대장', '서류 발급 대장']} />
          <CustomButton className="store-button" onClick={() => setShowStoreModal(true)}>
            입고 등록하기
          </CustomButton>
        </div>

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
          searchOptions={['전체', '발급/입고일자', '센터', '이름', '제출처', '사용목적']}
          setDocumentType={() => {}}
        />

        <table className="corpDoc-issue-table">
          <thead>
            <tr>
              <th rowSpan="2">No.</th>
              <th rowSpan="2">발급/입고일자</th>
              <th colSpan="2">신청자</th>
              <th rowSpan="2">제출처</th>
              <th rowSpan="2">사용목적</th>
              <th colSpan="3">법인인감증명서</th>
              <th colSpan="3">법인등기사항전부증명서</th>
              <th rowSpan="2">비고</th>
              <th rowSpan="2">결재</th>
            </tr>
            <tr>
              <th>센터</th>
              <th>이름</th>
              <th>입고</th>
              <th>사용</th>
              <th>잔고</th>
              <th>입고</th>
              <th>사용</th>
              <th>잔고</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{app.issueDate}</td>
                  <td>{app.center}</td>
                  <td>{app.status === "X" ? '' : app.applicantName}</td>
                  <td>{app.submission}</td>
                  <td>{app.purpose}</td>
                  <td>{app.corpSeal.incoming}</td>
                  <td>{app.corpSeal.used}</td>
                  <td>{app.corpSeal.left}</td>
                  <td>{app.registry.incoming}</td>
                  <td>{app.registry.used}</td>
                  <td>{app.registry.left}</td>
                  <td>{app.note}</td>
                  <td
                    className={`status-${app.approveStatus.replace(/\s+/g, '-').toLowerCase()} clickable ${
                      clickedRows.includes(app.id) ? 'confirmed' : ''}`}
                    onClick={() => handleRowClick(app.approveStatus, app)}>
                    {app.approveStatus}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" style={{ textAlign: 'center' }}>데이터가 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className='corpDoc-issue-pending-list'>
          <h3>발급 대기 목록</h3>
          <table className="table">
            <thead>
              <tr>
                <th rowSpan="2">No.</th>
                <th rowSpan="2">사용일자</th>
                <th colSpan="2">신청자</th>
                <th rowSpan="2">제출처</th>
                <th rowSpan="2">사용목적</th>
                <th colSpan="4">필요 수량</th>
                <th rowSpan="2">발급</th>
              </tr>
              <tr>
                <th>센터</th>
                <th>이름</th>
                <th>법인인감증명서</th>
                <th>법인등기사항전부증명서</th>
                <th>사용인감계</th>
                <th>위임장</th>
              </tr>
            </thead>
            <tbody>
              {filteredPendingApplications.length > 0 ? (
                filteredPendingApplications.map((app, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{app.useDate}</td>
                    <td>{app.center}</td>
                    <td>{app.applicantName}</td>
                    <td>{app.submission}</td>
                    <td>{app.purpose}</td>
                    <td>{app.corpSeal.used}</td>
                    <td>{app.registry.used}</td>
                    <td>{app.usesignet.used}</td>
                    <td>{app.warrant.used}</td>
                    <td>
                    <Button className="confirm-issue-button" onClick={() => handleIssue(app)}>
                      발 급
                    </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center' }}>데이터가 없습니다</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {modalVisible && selectedDocumentDetails && (
        <CorpDocApprovalModal
          show={modalVisible}
          onClose={() => setModalVisible(false)}
          documentDetails={selectedDocumentDetails}
        />
      )}
      {showIssueModal && selectedPendingApp && (
        <IssueModal
          show={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          onCancel={() => setShowIssueModal(false)}
          onConfirm={handleconfirmIssue}
          message={`법인서류를 발급하시겠습니까?`}
        />
      )}
      <CorpDocStoreModal
        show={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        totalCorpseal={totalCorpseal}
        totalCoregister={totalCoregister}
        onSave={fetchIssueData}
      />
    </div>
  );
}

export default CorpDocIssueList;
