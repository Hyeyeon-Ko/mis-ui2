import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import CustomButton from '../components/CustomButton'; 
import '../styles/BcdOrder.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 발주 페이지 */
function BcdOrder() {

  // 신청 내역, 선택된 신청 내역, 센터 목록, 선택된 센터 상태 관리
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [centers, setCenters] = useState(['전체', '재단본부', '기타']); 
  const [selectedCenter, setSelectedCenter] = useState('전체'); 

  // Timestamp Parsing: "YYYY-MM-DD"
  const parseDraftDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Timestamp Parsing: "YYYY-MM-DD HH:MM"
  const parseRespondDate = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toISOString().split('T')[0];
    const timePart = date.toTimeString().split(' ')[0].substring(0, 5);
    return `${datePart} ${timePart}`;
  };

  // 발주 리스트 가져오기
  const fetchBcdOrderList = async () => {
    try {
      const response = await axios.get('/api/bsc/order');
      console.log('Response data: ', response.data);

      const data = response.data.data || response.data;
      const transformedData = data.map(item => ({
        id: item.draftId,
        center: item.instNm,
        title: item.title,
        draftDate: parseDraftDate(item.draftDate), 
        drafter: item.drafter, 
        respondDate: parseRespondDate(item.respondDate), 
        quantity: item.quantity,
      }));
      console.log('Transformed data: ', transformedData);
      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching bcdOrder list: ', error);
    }
  };

  // 컴포넌트 마운트 시 발주 리스트 가져오기
  useEffect(() => {
    fetchBcdOrderList();
  }, []);

  // 전체 선택/해제 핸들러
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedApplications(applications.map(app => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  // 개별 선택/해제 핸들러
  const handleSelect = (event, id) => {
    if (event.target.checked) {
      setSelectedApplications([...selectedApplications, id]);
    } else {
      setSelectedApplications(selectedApplications.filter(appId => appId !== id));
    }
  };

  // 센터 선택 핸들러
  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
  };

  // 선택된 센터에 따라 신청 내역 필터링
  const filteredApplications = selectedCenter === '전체'
    ? applications
    : applications.filter(app => app.center === selectedCenter);

  // TODO : 엑셀변환 & 발주요청
  //        => 정확한 프로세스 결정되면 백엔드 구현 후에 추가.

  // 테이블 컬럼 정의
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
    { header: '승인일시', accessor: 'respondDate', width: '17%' },
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
