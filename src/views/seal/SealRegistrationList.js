import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import '../../styles/SealRegistrationList.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';

function SealRegistrationList() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);

  useEffect(() => {
    fetchSealRegistrationList();
  }, []);

  const fetchSealRegistrationList = () => {
    const mockData = [
      {
        seal: '사용인감',
        sealImage: corporateSeal,
        department: '디지털혁신실',
        purpose: '계약용',
        managerPrimary: '김00',
        managerSecondary: '박00',
        date: '2024-08-01',
      },
      {
        seal: '법인인감',
        sealImage: facsimileSeal,
        department: '디지털혁신실',
        purpose: '문서발급',
        managerPrimary: '김00',
        managerSecondary: '박00',
        date: '2024-08-01',
      },
    ];

    setApplications(mockData);
    setFilteredApplications(mockData);
  };

  return (
    <div className='content'>
      <div className='seal-registration-list'>
        <h2>인장 등록 대장</h2>
        <Breadcrumb items={['인장 관리', '인장 등록 대장']} />
        {filteredApplications.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th rowSpan="2">인영</th>
                <th rowSpan="2">인영</th>
                <th rowSpan="2">사용부서</th>
                <th rowSpan="2">용도</th>
                <th colSpan="2">관리자</th>
                <th rowSpan="2">등록일</th>
              </tr>
              <tr>
                <th>정</th>
                <th>부</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{app.seal}</td>
                  <td>
                    <img src={app.sealImage} alt="Seal" className="seal-image" />
                  </td>
                  <td>{app.department}</td>
                  <td>{app.purpose}</td>
                  <td>{app.managerPrimary}</td>
                  <td>{app.managerSecondary}</td>
                  <td>{app.date}</td>
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

export default SealRegistrationList;
