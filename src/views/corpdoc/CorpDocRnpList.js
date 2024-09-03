import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import CorpDocApprovalModal from '../../views/corpdoc/CorpDocApprovalModal';
import SignitureImage from '../../assets/images/signiture.png';
import axios from 'axios';
import '../../styles/corpdoc/CorpDocRnpList.css';

function CorpDocRnpList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);

  useEffect(() => {
    fetchRnpData();
  }, []);

  const fetchRnpData = async () => {
    try {
      const response = await axios.get('/api/corpDoc/rnpList');
      console.log("response: ", response);

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
          status: '결재진행중', // Assuming status is always in progress
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
  };

  const handleSearch = ({ searchType, keyword, startDate, endDate }) => {
    let filtered = applications;

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
        {filteredApplications.length > 0 ? (
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
              {filteredApplications.map((app, index) => (
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
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data available</div>
        )}
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

export default CorpDocRnpList;
