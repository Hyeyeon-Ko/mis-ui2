import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import '../../styles/CorpDocRnpList.css';

function CorpDocRnpList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = [
        {
          date: '2024-05-02',
          submitter: '현대로보틱스',
          usagePurpose: '결제계좌등록',
          certificate: { incoming: 3, used: 0, left: 18 },
          registry: { incoming: 0, used: 1, left: 20 },
          status: '결제 진행중',
        },
        {
          date: '2024-05-03',
          submitter: '재단본부',
          usagePurpose: '결제계좌등록',
          certificate: { incoming: 5, used: 0, left: 20 },
          registry: { incoming: 0, used: 9, left: 3 },
          status: '결제 진행중',
        },
      ];
      setApplications(fetchedData);
      setFilteredApplications(fetchedData);
    };
    fetchData();
  }, []);

  const handleSearch = ({ searchType, keyword, startDate, endDate }) => {
    let filtered = applications;

    if (keyword) {
      // 검색 조건, 총무팀 요청사항에 따라 변경 필요
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

  return (
    <div className='content'>
      <div className='corpDoc-rnp-list'>
        <h2>서류 수불 대장</h2>
        <Breadcrumb items={['법인서류 관리', '서류 수불 대장']} />
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
                <th rowSpan="2">입고일자</th>
                <th rowSpan="2">제출처</th>
                <th rowSpan="2">사용목적</th>
                <th colSpan="3">법인인감증명서</th>
                <th colSpan="3">법인등기부등본</th>
                <th rowSpan="2">결재</th>
              </tr>
              <tr>
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
                  <td>{app.date}</td>
                  <td>{app.submitter}</td>
                  <td>{app.usagePurpose}</td>
                  <td>{app.certificate.incoming}</td>
                  <td>{app.certificate.used}</td>
                  <td>{app.certificate.left}</td>
                  <td>{app.registry.incoming}</td>
                  <td>{app.registry.used}</td>
                  <td>{app.registry.left}</td>
                  <td>{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data available</div>
        )}
      </div>
    </div>
  );
}

export default CorpDocRnpList;
