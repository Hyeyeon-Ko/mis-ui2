import React, { useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import deleteIcon from '../assets/images/delete.png';
import '../styles/DocOutList.css';

function DocOutList() {

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
 
  /**
   * 삭제 핸들러
   * @param {Object} admin 
   */
  const handleDelete = () => {
  };

  const columns = [
    { header: '접수일자', accessor: 'draftDate', width: '8%' },
    { header: '문서번호', accessor: 'docId', width: '8%' },
    { header: '발신처', accessor: 'sender', width: '10%' },
    { header: '제목', accessor: 'title', width: '20%' },
    { header: '접수인', accessor: 'drafter', width: '8%' },
    {
      header: '신청 삭제',
      accessor: 'delete',
      width: '10%',
      Cell: ({ row }) => (
        <div className="icon-cell">
          <img src={deleteIcon} alt="Delete" className="action-icon" onClick={() => handleDelete(row)} />
        </div>
      ),
    },
  ];

  // Sample data to be displayed in the table
  const data = [
    { draftDate: '24.07.01', docId: '24-001', sender: 'KB 국민카드', title: '2월 전국센터 간식포인트 지급 요청', drafter: '김규동' },
    { draftDate: '24.07.02', docId: '24-002', sender: '신한은행 서초구지점', title: '한국의학연구소 실소유자 확인 서류', drafter: '윤재준' },
    // Add more sample data as needed
  ];

  return (
    <div className="content">
      <div className="doc-out-list">
        <h2>문서 발신 대장</h2>
        <Breadcrumb items={['문서수발신 관리', '문서 발신 대장']} />
        <ConditionFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <div class="doc-out-content">
            <Table columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}

export default DocOutList;
