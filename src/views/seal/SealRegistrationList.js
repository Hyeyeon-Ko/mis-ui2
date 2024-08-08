import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/SealRegistrationList.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';

function SealRegistrationList() {
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);

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
        manager: '김00',
        subManager: '박00',
        date: '2024-08-01',
      },
      {
        seal: '법인인감',
        sealImage: facsimileSeal,
        department: '디지털혁신실',
        purpose: '문서발급',
        manager: '김00',
        subManager: '박00',
        date: '2024-08-01',
      },
      {
        seal: '회사인',
        sealImage: companySeal,
        department: '디지털혁신실',
        purpose: '계약용',
        manager: '이00',
        subManager: '최00',
        date: '2024-08-02',
      },
    ];

    setFilteredApplications(mockData);
  };

  const handleAddApplication = () => {
    alert('추가 버튼 클릭됨');
  };

  const handleModifyApplication = () => {
    if (selectedApplications.length !== 1) {
      alert('수정할 항목을 하나만 선택하세요.');
      return;
    }
    alert('수정 버튼 클릭됨');
  };

  const handleDeleteApplication = () => {
    if (selectedApplications.length === 0) {
      alert('삭제할 항목을 선택하세요.');
      return;
    }
    alert('삭제 버튼 클릭됨');
  };

  const handleSelectApplication = (index) => {
    setSelectedApplications((prevSelectedApplications) => {
      if (prevSelectedApplications.includes(index)) {
        return prevSelectedApplications.filter((i) => i !== index);
      } else {
        return [...prevSelectedApplications, index];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map((_, index) => index));
    }
  };

  return (
    <div className='content'>
      <div className='seal-registration-list'>
        <h2>인장 등록 대장</h2>
        <div className="seal-header-row">
          <Breadcrumb items={['인장 관리', '인장 등록 대장']} />
          <div className="seal-header-buttons">
            <CustomButton className="seal-add-button" onClick={handleAddApplication}>추 가</CustomButton>
            <CustomButton className="seal-modify-button" onClick={handleModifyApplication}>수 정</CustomButton>
            <CustomButton className="seal-delete-button" onClick={handleDeleteApplication}>삭 제</CustomButton>
          </div>
        </div>
        {filteredApplications.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th rowSpan="2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectAll();
                    }}
                    checked={selectedApplications.length === filteredApplications.length}
                  />
                </th>
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
                <tr
                  key={index}
                  onClick={() => handleSelectApplication(index)}
                  className={selectedApplications.includes(index) ? 'selected-row' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(index)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectApplication(index);
                      }}
                    />
                  </td>
                  <td>{app.seal}</td>
                  <td>
                    <img src={app.sealImage} alt="Seal" className="seal-image" />
                  </td>
                  <td>{app.department}</td>
                  <td>{app.purpose}</td>
                  <td>{app.manager}</td>
                  <td>{app.subManager}</td>
                  <td>{app.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No seal available</div>
        )}
      </div>
    </div>
  );
}

export default SealRegistrationList;
