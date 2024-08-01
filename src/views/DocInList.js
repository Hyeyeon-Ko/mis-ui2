import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import deleteIcon from '../assets/images/delete.png';
import '../styles/DocInList.css';
import axios from 'axios';

function DocInList() {
  const [applications, setApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filters, setFilters] = useState({});
 
  useEffect(() => {
    fetchDocInList(filters);
  }, [filters]);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const fetchDocInList = async (filterParams = {}) => {
    try {
      const response = await axios.get('/api/doc/receiveList', {
        params: {
          startDate: filterParams.startDate || '',
          endDate: filterParams.endDate || '',
          draftId: Number(filterParams.draftId),
        },
      });
      console.log('response: ', response);

      if (response.data && response.data.data) {
        const formattedData = response.data.data.map(item => ({
          draftDate: item.draftDate,
          docId: item.docId,
          receiver: item.resSender,
          title: item.title,
          drafter: item.drafter,
        }));
        console.log('formattedDate: ', formattedData);
        setApplications(formattedData);
      }
    } catch (error) {
      console.error('Error fetching document list:', error);
    }
  };

  const handleDelete = () => {
  };

  const handleSearch = () => {
    setFilters({
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
    });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setFilters({});
  };

  const columns = [
    { header: '접수일자', accessor: 'draftDate', width: '8%' },
    { header: '문서번호', accessor: 'docId', width: '8%' },
    { header: '수신처', accessor: 'receiver', width: '10%' },
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

//   // Sample data to be displayed in the table
//   const data = [
//     { draftDate: '24.07.01', docId: '24-001', receiver: 'KB 국민카드', title: '2월 전국센터 간식포인트 지급 요청', drafter: '김규동' },
//     { draftDate: '24.07.02', docId: '24-002', receiver: '신한은행 서초구지점', title: '한국의학연구소 실소유자 확인 서류', drafter: '윤재준' },
//   ];

  return (
    <div className="content">
      <div className="doc-in-list">
        <h2>문서 수신 대장</h2>
        <Breadcrumb items={['문서수발신 관리', '문서 수신 대장']} />
        <ConditionFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        <div class="doc-in-content">
            <Table columns={columns} data={applications} />
        </div>
      </div>
    </div>
  );
}

export default DocInList;
