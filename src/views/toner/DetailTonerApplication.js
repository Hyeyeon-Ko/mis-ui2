import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import '../../styles/common/Page.css';
import '../../styles/toner/TonerApply.css';

function DetailTonerApplication() {
  const location = useLocation();
  const [applications, setApplications] = useState([]);

  const isReadOnly = location.state?.readOnly || false;  
  const tonerDetails = location.state?.tonerDetails || [];  

  useEffect(() => {
    if (tonerDetails.length > 0) {
      setApplications(tonerDetails);  
    }
  }, [tonerDetails]);

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
        <h2>{isReadOnly ? '토너 상세보기' : '토너수정'}</h2>
        <Breadcrumb items={isReadOnly ? ['토너 관리', '토너 상세보기'] : ['나의 신청내역', '승인대기 내역', '토너수정']} />
        <div className='toner-apply-header'>
          <label className='toner-apply-header-label'>상세 신청 내역&gt;&gt;</label>
        </div>
        <Table columns={applyColumns} data={numberedApplications} isToner={true} />
      </div>
    </div>
  );
}

export default DetailTonerApplication;
