import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; 
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import axios from 'axios'; 
import '../../styles/common/Page.css';
import '../../styles/toner/TonerApply.css';

function DetailTonerApplication() {
  const { draftId } = useParams(); 
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchTonerDetails = async () => {
      try {
        const response = await axios.get(`/api/toner/${draftId}`);
        setApplications(response.data.data);
      } catch (error) {
        console.error('Error fetching toner details:', error);
        alert('토너 신청 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTonerDetails();
  }, [draftId]);

  const numberedApplications = applications.map((application, index) => ({
    ...application,
    index: index + 1 
  }));

  const applyColumns = [
    { 
      header: 'No.', 
      accessor: 'index', 
      width: '5%',
    },
    { header: '관리번호', accessor: 'mngNum', width: '14%' },
    { header: '토너명', accessor: 'tonerNm', width: '14%' },
    { header: '부서', accessor: 'teamNm', width: '11%' },
    { header: '위치', accessor: 'location', width: '11%' },
    { header: '프린터명', accessor: 'printNm', width: '11%' },
    { header: '단가', accessor: 'price', width: '9%' },
    { header: '수량', accessor: 'quantity', width: '5%' },
    { header: '금액', accessor: 'totalPrice', width: '11%' },
  ];

  return (
    <div className="content">
      <div className="all-applications">
        <h2>토너 상세보기</h2>
        <Breadcrumb items={['토너 관리', '토너 상세보기']} />
        <div className='toner-apply-header'>
          <label className='toner-apply-header-label'>상세 신청 내역&gt;&gt;</label>
        </div>
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <Table columns={applyColumns} data={numberedApplications} isToner={true} />
        )}
      </div>
    </div>
  );
}

export default DetailTonerApplication;
