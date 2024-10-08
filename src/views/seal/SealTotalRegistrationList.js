import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import '../../styles/seal/SealTotalRegistrationList.css';
import { useSealForm } from '../../hooks/useSealForm';
import Pagination from '../../components/common/Pagination';

function SealTotalRegistrationList() {
  const [centerData, setCenterData] = useState([]);
  const {handleCenterChange, selectedCenter, filteredApplications, setFilteredApplications} = useSealForm();

  const [totalPages, setTotalPages] = useState('1')
  const [currentPage, setCurrentPage] = useState('1')
  const itemsPerPage = 10;

  const fetchTotalRegistrationList = async (pageIndex = 1, pageSize = itemsPerPage) => {
    try {
      const response = await axios.get(`/api/seal/totalRegistrationList2`, {
        params: {
          // PostPageRequest parameters
          pageIndex,
          pageSize,
        },
      });

      const data = response.data.data;
      const totalPages = data.totalPages;
      const currentPage = data.number + 1;
      
      setFilteredApplications(data);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);

    } catch (error) {
      console.error('Error fetching total registration list:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  useEffect(() => {
    const fetchCenterData = async () => {
      try {
        const response = await axios.get(`/api/rentalList/total`);
        const { centerResponses } = response.data.data;

        const nationwideCenter = { detailNm: '전국센터', detailCd: 'all' };
        setCenterData([nationwideCenter, ...centerResponses]); 
      } catch (error) {
        console.error('Error fetching center list:', error);
        alert('센터 목록을 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchCenterData(); 
  }, [setFilteredApplications]);

  return (
    <div className='content'>
      <div className='seal-total-registration-list'>
        <h2>전국 인장 등록대장</h2>
        <Breadcrumb items={['인장 대장', '전국 인장 등록대장']} />
        <div className="seal-total-category-section">
          <div className="seal-total-category">
            <label htmlFor="center" className="seal-total-category-label">센터&gt;&gt;</label>
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
            {['인영', '인영', '사용부서', '용도', '관리자(정)', '관리자(부)', '등록일'].map((header, idx) => (
              <th key={idx} rowSpan={header.includes('관리자') ? undefined : 2}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app, index) => (
              <tr key={index}>
                <td>{app.sealNm}</td>
                <td>
                  <img src={`data:image/png;base64,${app.sealImage}`} alt="Seal" className="seal-total-image" />
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
              <td colSpan="7">조회된 데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination totalPages={totalPages} onPageChange={handlePageClick} />
      </div>
    </div>
  );
}

export default SealTotalRegistrationList;
