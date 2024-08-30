import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import CorpDocApprovalModal from '../../views/corpdoc/CorpDocApprovalModal';
import SignitureImage from '../../assets/images/signiture.png';
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
    const fetchData = async () => {
      const fetchedData = [
        {
          id: 1,
          date: '2024-05-02',
          submitter: '현대로보틱스',
          usagePurpose: '결제계좌등록',
          certificate: { incoming: 3, used: 0, left: 18 },
          registry: { incoming: 0, used: 1, left: 20 },
          status: '결재완료',
          applicantName: '홍길동',
          signitureImage: SignitureImage,
          approvers: [
            { name: '김철수', approvalDate: '2024-08-08', signitureImage: SignitureImage },
            { name: '박영희', approvalDate: '2024-08-10', signitureImage: SignitureImage },
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
          approvers: [
            {},
          ],
        },
      ];
      setApplications(fetchedData);
      setFilteredApplications(fetchedData);

      const clickedRows = JSON.parse(localStorage.getItem('clickedRows')) || [];
      setClickedRows(clickedRows);
    };
    fetchData();
  }, []);
  

  const handleSearch = ({ searchType, keyword, startDate, endDate }) => {
    let filtered = applications;

    if (keyword) {
      filtered = filtered.filter(app => {
        if (searchType === '제출처') return app.submitter.includes(keyword);
        if (searchType === '사용목적') return app.usagePurpose.includes(keyword);
        if (searchType === '인장구분') return app.status.includes(keyword);
        if (searchType === '전체') {
          return (
            app.submitter.includes(keyword) ||
            app.usagePurpose.includes(keyword) ||
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
                <th rowSpan="2">수령일자</th>
                <th rowSpan="2">신청자</th>
                <th rowSpan="2">제출처</th>
                <th rowSpan="2">사용목적</th>
                <th colSpan="4">법인서류</th>
                <th rowSpan="2">수령인</th>
              </tr>
              <tr>
                <th>입감</th>
                <th>등기</th>
                <th>사용인감계</th>
                <th>위임장</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{app.date}</td>
                  <td>{app.drafter}</td>
                  <td>{app.submitter}</td>
                  <td>{app.usagePurpose}</td>
                  <td>{app.certificate.used}</td>
                  <td>{app.registry.used}</td>
                  <td></td>
                  <td></td>
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
