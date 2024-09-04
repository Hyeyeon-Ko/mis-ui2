import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import '../../styles/seal/SealTotalRegistrationList.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function SealTotalRegistrationList() {
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [centerData, setCenterData] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('all'); 

  useEffect(() => {
    const fetchCenterData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rentalList/total`);
        const { centerResponses } = response.data.data;

        const nationwideCenter = { detailNm: '전국센터', detailCd: 'all' };
        setCenterData([nationwideCenter, ...centerResponses]); 
      } catch (error) {
        console.error('Error fetching center list:', error);
        alert('센터 목록을 불러오는 중 오류가 발생했습니다.');
      }
    };

    const fetchTotalRegistrationList = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/seal/totalRegistrationList`);
        setFilteredApplications(response.data.data); 
      } catch (error) {
        console.error('Error fetching total registration list:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchCenterData(); 
    fetchTotalRegistrationList(); 
  }, []);

  const handleCenterChange = async (e) => {
    const selectedCenter = e.target.value;
    setSelectedCenter(selectedCenter);

    if (selectedCenter === 'all') {
      try {
        const response = await axios.get(`${apiUrl}/api/seal/totalRegistrationList`);
        setFilteredApplications(response.data.data);
      } catch (error) {
        console.error('Error fetching total registration list:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } else {
      try {
        const response = await axios.get(`/api/seal/registrationList?instCd=${selectedCenter}`);
        setFilteredApplications(response.data.data);
      } catch (error) {
        console.error('Error fetching center registration list:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className='content'>
      <div className='seal-total-registration-list'>
        <h2>전국 인장 등록대장</h2>
        <Breadcrumb items={['인장 대장', '전국 인장 등록대장']} />
        <div className="seal-total-category-section">
          <div className="seal-total-category">
            <label htmlFor="center" className="seal-total-category-label">센 터&gt;&gt;</label>
            <select
              id="center"
              className="seal-total-category-dropdown"
              value={selectedCenter} 
              onChange={handleCenterChange} 
            >
              {centerData.map(center => (
                <option key={center.detailCd} value={center.detailCd}>
                  {center.detailNm}
                </option>
              ))}
            </select>
          </div>
        </div>
        <table className="seal-total-registration-table">
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
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{app.sealNm}</td>
                  <td>
                    <img src={`/api/images/${encodeURIComponent(app.sealImage)}`} alt="Seal" className="seal-total-image" />
                  </td>
                  <td>{app.useDept}</td>
                  <td>{app.purpose}</td>
                  <td>{app.manager}</td>
                  <td>{app.subManager}</td>
                  <td>{app.draftDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SealTotalRegistrationList;
