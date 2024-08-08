import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import '../../styles/SealExportList.css';

function SealExportList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchSealExportList();
  }, []);

  const fetchSealExportList = () => {
    const mockData = [
      {
        id: 1,
        expDate: '2024-08-01',
        returnDate: '2024-08-02',
        purpose: '사용인감계',
        sealType: { corporateSeal: 1, personalSeal: 0, companySeal: 0 },
        approval: { applicant: '김', manager: '나', teamLead: '박', director: '이' },
        notes: '특이사항 없음'
      },
      {
        id: 2,
        expDate: '2024-08-03',
        returnDate: '2024-08-04',
        purpose: '00계약',
        sealType: { corporateSeal: 0, personalSeal: 1, companySeal: 0 },
        approval: { applicant: '김', manager: '나', teamLead: '박', director: '이' },
        notes: '첨부파일 있음'
      },
    ];

    setApplications(mockData);
    setFilteredApplications(mockData);
  };

  const handleSearch = ({ searchType, keyword, startDate, endDate }) => {
    let filtered = applications;

    if (keyword) {
      filtered = filtered.filter(app => {
        if (searchType === '사용목적') return app.purpose.includes(keyword);
        if (searchType === '인장구분') return (
          app.sealType.corporateSeal.includes(keyword) ||
          app.sealType.personalSeal.includes(keyword) ||
          app.sealType.companySeal.includes(keyword)
        );
        if (searchType === '전체') {
          return (
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
        const appDate = new Date(app.expDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return appDate >= start && appDate <= end;
      });
    }

    setFilteredApplications(filtered);
  };

  return (
    <div className="content">
      <div className="seal-export-list">
        <h2>인장 반출 대장</h2>
        <Breadcrumb items={['인장 관리', '인장 반출 대장']} />
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
                <th rowSpan="2">일련번호</th>
                <th rowSpan="2">반출일자</th>
                <th rowSpan="2">반납일자</th>
                <th rowSpan="2">사용목적</th>
                <th colSpan="3">인장구분</th>
                <th colSpan="4">결재</th>
                <th rowSpan="2">비고</th>
              </tr>
              <tr>
                <th>법인인감</th>
                <th>사용인감</th>
                <th>회사인</th>
                <th>신청자</th>
                <th>담당자</th>
                <th>팀장</th>
                <th>본부장</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{app.id}</td>
                  <td>{app.expDate}</td>
                  <td>{app.returnDate}</td>
                  <td>{app.purpose}</td>
                  <td>{app.sealType.corporateSeal}</td>
                  <td>{app.sealType.personalSeal}</td>
                  <td>{app.sealType.companySeal}</td>
                  <td>{app.approval.applicant}</td>
                  <td>{app.approval.manager}</td>
                  <td>{app.approval.teamLead}</td>
                  <td>{app.approval.director}</td>
                  <td>{app.notes}</td>
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

export default SealExportList;
