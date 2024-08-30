import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import ConditionFilter from '../../components/common/ConditionFilter';
import CorpDocApprovalModal from '../../views/corpdoc/CorpDocApprovalModal';
import SignitureImage from '../../assets/images/signiture.png';
import axios from 'axios';
import '../../styles/corpdoc/CorpDocIssueList.css';

function CorpDocIssueList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [filteredPendingApplications, setFilteredPendingApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);

  useEffect(() => {
    fetchIssueData();
  }, []);

  const fetchIssueData = async () => {
    try {
      const response = await axios.get('/api/corpDoc/IssueList');
      console.log("response: ", response);

      if (response.data) {
        const issueListData = response.data.data.issueList.map(item => ({
          id: item.draftId,
          issueDate: item.issueDate,
          submission: item.submission,
          purpose: item.purpose,
          certificate: { incoming: 0, used: item.certCorpseal, left: item.totalCorpseal },
          registry: { incoming: 0, used: item.certCoregister, left: item.totalCoregister },
          applicantName: item.drafter,
          center: item.instNm,
          approveStatus: '결재진행중',
          approvers: [],
          signitureImage: SignitureImage,
        }));

        const issuePendingListData = response.data.data.issuePendingList.map(item => ({
          id: item.draftId,
          date: item.draftDate,
          useDate: item.useDate,
          submission: item.submission,
          purpose: item.purpose,
          certificate: { incoming: 0, used: item.certCorpseal, left: item.totalCorpseal },
          registry: { incoming: 0, used: item.certCoregister, left: item.totalCoregister },
          status: item.status,
          applicantName: item.drafter,
          center: item.instNm,
          approvers: [],
          signitureImage: SignitureImage,
        }));

        setApplications(issueListData);
        setFilteredApplications(issueListData);
        setPendingApplications(issuePendingListData);
        setFilteredPendingApplications(issuePendingListData);
        console.log("applications: ", filteredApplications);
        console.log("pendingApplications: ", filteredPendingApplications);
      }
    } catch (error) {
      console.error("Error fetching issue data:", error);
    }
  };

  const handleSearch = ({ searchType, keyword, startDate, endDate }, listType = 'applications') => {
    let filtered = listType === 'applications' ? applications : pendingApplications;

    if (keyword) {
      filtered = filtered.filter(app => {
        if (searchType === '제출처') return app.submission.includes(keyword);
        if (searchType === '사용목적') return app.purpose.includes(keyword);
        if (searchType === '인장구분') return app.status.includes(keyword);
        if (searchType === '전체') {
          return (
            app.submission.includes(keyword) ||
            app.purpose.includes(keyword) ||
            app.status.includes(keyword)
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

    if (listType === 'applications') {
      setFilteredApplications(filtered);
    } else {
      setFilteredPendingApplications(filtered);
    }
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
      <div className='corpDoc-issue-list'>
        <h2>서류 발급 대장</h2>
        <Breadcrumb items={['법인서류 대장', '서류 발급 대장']} />
        <ConditionFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onSearch={(searchParams) => handleSearch(searchParams, 'applications')}
          onReset={() => setFilteredApplications(applications)}
          showDocumentType={false}
          showSearchCondition={true}
          excludeRecipient={true}
        />
        {filteredApplications.length > 0 ? (
          <table className="corpDoc-issue-table">
            <thead>
              <tr>
                <th rowSpan="2">No.</th>
                <th rowSpan="2">발급일자</th>
                <th colSpan="2">신청자</th>
                <th rowSpan="2">제출처</th>
                <th rowSpan="2">사용목적</th>
                <th colSpan="3">법인인감증명서</th>
                <th colSpan="3">법인등기사항전부증명서</th>
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
              {filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{app.issueDate}</td>
                  <td>{app.center}</td>
                  <td>{app.applicantName}</td>
                  <td>{app.submission}</td>
                  <td>{app.purpose}</td>
                  <td>{app.certificate.incoming}</td>
                  <td>{app.certificate.used}</td>
                  <td>{app.certificate.left}</td>
                  <td>{app.registry.incoming}</td>
                  <td>{app.registry.used}</td>
                  <td>{app.registry.left}</td>
                  <td>{app.approveStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data available</div>
        )}
        <div className='corpDoc-issue-pending-list'>
          <h3>서류 발급 대기 목록</h3>
          {filteredPendingApplications.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th rowSpan="2">No.</th>
                  <th rowSpan="2">사용일자</th>
                  <th colSpan="2">신청자</th>
                  <th rowSpan="2">제출처</th>
                  <th rowSpan="2">사용목적</th>
                  <th colSpan="2">필요 수량</th>
                  <th rowSpan="2">발급</th>
                </tr>
                <tr>
                  <th>센터</th>
                  <th>이름</th>
                  <th>법인인감증명서</th>
                  <th>법인등기사항전부증명서</th>
                </tr>
              </thead>
              <tbody>
                {filteredPendingApplications.map((app, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{app.useDate}</td>
                    <td>{app.center}</td>
                    <td>{app.applicantName}</td>
                    <td>{app.submission}</td>
                    <td>{app.purpose}</td>
                    <td>{app.certificate.used}</td>
                    <td>{app.registry.used}</td>
                    <td>
                    <Button className="confirm-issue-button">
                      발 급
                    </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No pending data available</div>
          )}
        </div>
      </div>
      {modalVisible && selectedDocumentDetails && (
        <CorpDocApprovalModal
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

export default CorpDocIssueList;
