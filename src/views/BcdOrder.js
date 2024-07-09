import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import CustomButton from '../components/CustomButton'; 
import '../styles/BcdOrder.css';
import '../styles/common/Page.css';

/* 발주 페이지 */
function BcdOrder() {
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [centers, setCenters] = useState(['전체', '재단본부', '기타']); 
  const [selectedCenter, setSelectedCenter] = useState('전체'); 

  useEffect(() => {
    
  }, []);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedApplications(applications.map(app => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelect = (event, id) => {
    if (event.target.checked) {
      setSelectedApplications([...selectedApplications, id]);
    } else {
      setSelectedApplications(selectedApplications.filter(appId => appId !== id));
    }
  };

  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
  };

  const filteredApplications = selectedCenter === '전체'
    ? applications
    : applications.filter(app => app.center === selectedCenter);

  const columns = [
    {
      header: <input type="checkbox" onChange={handleSelectAll} />,
      accessor: 'select',
      width: '3.5%',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedApplications.includes(row.id)}
          onChange={(event) => handleSelect(event, row.id)}
        />
      ),
    },
    { 
      header: (
        <div className="center-header">
          센터 <span className="arrow">▼</span>
          <select value={selectedCenter} onChange={handleCenterChange} className="center-select">
            {centers.map(center => (
              <option key={center} value={center}>{center}</option>
            ))}
          </select>
        </div>
      ),
      accessor: 'center',
      width: '18%',
    },
    { header: '제목', accessor: 'title', width: '28%' },
    { header: '기안일자', accessor: 'draftDate', width: '15%' },
    { header: '기안자', accessor: 'drafter', width: '10%' },
    { header: '승인일시', accessor: 'approvalDate', width: '17%' },
    { header: '수량', accessor: 'quantity', width: '9.5%' },
  ];

  return (
    <div className="content">
      <div className="order">
        <h2>명함 발주</h2>
        <div className="header-row">
          <Breadcrumb items={['신청 목록 관리', '명함 발주']} />
          <div className="buttons-container">
            <CustomButton className="excel-button">엑셀변환</CustomButton>
            <CustomButton className="order-request-button">발주요청</CustomButton>
          </div>
        </div>
        <Table columns={columns} data={filteredApplications} />
      </div>
    </div>
  );
}

export default BcdOrder;
