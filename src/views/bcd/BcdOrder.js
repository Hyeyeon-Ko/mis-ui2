import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 추가
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import CustomButton from '../../components/common/CustomButton';
import EmailModal from './EmailModal';
import CenterSelect from '../../components/CenterSelect';
import '../../styles/bcd/BcdOrder.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { FadeLoader } from 'react-spinners';

function BcdOrder() {
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [centers] = useState([
    '전체',
    '재단본부',
    '광화문',
    '여의도센터',
    '강남센터',
    '수원센터',
    '대구센터',
    '부산센터',
    '광주센터',
    '제주센터',
    '협력사',
  ]);
  const [selectedCenter, setSelectedCenter] = useState('전체');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // navigate 함수 가져오기

  // 드래그 기능을 위한 ref 변수들
  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  // Timestamp Parsing: "YYYY-MM-DD"
  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Timestamp Parsing: "YYYY-MM-DD HH:MM"
  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toISOString().split('T')[0];
    const timePart = date.toTimeString().split(' ')[0].substring(0, 5);
    return `${datePart} ${timePart}`;
  };

  // 발주 리스트 가져오기
  const fetchBcdOrderList = useCallback(async () => {
    try {
      const response = await axios.get('/api/bsc/order');
      const data = response.data.data || response.data;
      const transformedData = data.map((item) => ({
        id: item.draftId,
        center: item.instNm,
        title: item.title,
        draftDate: parseDate(item.draftDate),
        drafter: item.drafter,
        respondDate: parseDateTime(item.respondDate),
        quantity: item.quantity,
      }));
      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching bcdOrder list: ', error);
    }
  }, []);

  // 컴포넌트 마운트 시 발주 리스트 가져오기
  useEffect(() => {
    fetchBcdOrderList();
  }, [fetchBcdOrderList]);

  // 전체 선택/해제 핸들러
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedApplications(applications.map((app) => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  // 개별 선택/해제 핸들러
  const handleSelect = (event, id) => {
    if (event.target.checked) {
      setSelectedApplications([...selectedApplications, id]);
    } else {
      setSelectedApplications(selectedApplications.filter((appId) => appId !== id));
    }
  };

  // 행 클릭 시 체크박스 선택/해제 핸들러
  const handleRowClick = (row) => {
    const id = row.id;
    if (selectedApplications.includes(id)) {
      setSelectedApplications(selectedApplications.filter((appId) => appId !== id));
    } else {
      setSelectedApplications([...selectedApplications, id]);
    }
  };

  // 마우스 다운 시 드래그 시작 위치 설정
  const handleMouseDown = (rowIndex) => {
    dragStartIndex.current = rowIndex;

    const appId = applications[rowIndex].id;
    if (selectedApplications.includes(appId)) {
      dragMode.current = 'deselect'; 
    } else {
      dragMode.current = 'select'; 
    }
  };

  // 마우스 오버 시 드래그 상태에 따라 선택/해제 처리
  const handleMouseOver = (rowIndex) => {
    if (dragStartIndex.current !== null) {
      dragEndIndex.current = rowIndex;
  
      const start = Math.min(dragStartIndex.current, dragEndIndex.current);
      const end = Math.max(dragStartIndex.current, dragEndIndex.current);
  
      let newSelectedApplications = [...selectedApplications];
  
      for (let i = start; i <= end; i++) {
        const appId = applications[i]?.id;
        if (dragMode.current === 'select' && appId && !newSelectedApplications.includes(appId)) {
          newSelectedApplications.push(appId); 
        } else if (dragMode.current === 'deselect' && appId && newSelectedApplications.includes(appId)) {
          newSelectedApplications = newSelectedApplications.filter(id => id !== appId); 
        }
      }
  
      setSelectedApplications(newSelectedApplications);
    }
  };
  
  // 마우스 업 시 드래그 상태 초기화
  const handleMouseUp = () => {
    dragStartIndex.current = null;
    dragEndIndex.current = null;
  };

  // 센터 선택 핸들러
  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
  };

  // 선택된 센터에 따라 신청 내역 필터링
  const filteredApplications =
    selectedCenter === '전체'
      ? applications
      : applications.filter((app) => app.center === selectedCenter);

  // 엑셀 변환 버튼 클릭 핸들러
  const handleExcelDownload = async () => {
    if (selectedApplications.length === 0) {
      alert('엑셀변환 할 명함 신청 목록을 선택하세요.');
      return;
    }

    try {
      const response = await axios.post('/api/bsc/order/excel', selectedApplications, {
        responseType: 'blob',
      });
      fileDownload(response.data, '명함 발주내역.xlsx');
    } catch (error) {
      console.error('Error downloading excel: ', error);
    }
  };

  // 발주 요청 버튼 클릭 핸들러
  const handleOrderRequest = () => {
    if (selectedApplications.length === 0) {
      alert('발주요청 할 명함 신청 목록을 선택하세요.');
      return;
    }
    setShowEmailModal(true);
  };

  const handleSendEmail = async (emailData) => {
    setIsLoading(true);
    try {
      await axios.post('/api/bsc/order', {
        draftIds: selectedApplications,
        emailSubject: emailData.subject,
        emailBody: emailData.body,
        fileName: emailData.fileName,
        fromEmail: emailData.fromEmail,
        toEmail: emailData.toEmail,
      });
  
      const updatedApplications = applications.filter(app => !selectedApplications.includes(app.id));
      setApplications(updatedApplications);
      setSelectedApplications([]); 
  
      setShowEmailModal(false);
      alert('발주 요청이 성공적으로 완료되었습니다.');
      
      navigate('/api/applyList?documentType=명함신청', { replace: true });
      
    } catch (error) {
      console.error('Error sending order request: ', error);
      alert('발주 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 테이블 컬럼 정의
  const columns = [
    {
      header: <input type="checkbox" onChange={handleSelectAll} />,
      accessor: 'select',
      width: '3.5%',
      Cell: ({ row, index }) => (
        <input
          type="checkbox"
          className="order-checkbox"
          checked={selectedApplications.includes(row.id)}
          onChange={(event) => handleSelect(event, row.id)}
          onClick={(e) => e.stopPropagation()} 
        />
      ),
    },
    {
      header: (
        <CenterSelect
          centers={centers}
          selectedCenter={selectedCenter}
          onCenterChange={handleCenterChange}
        />
      ),
      accessor: 'center',
      width: '18%',
    },
    { 
      header: '제목', 
      accessor: 'title', 
      width: '28%', 
    },
    { 
      header: '신청일자', 
      accessor: 'draftDate', 
      width: '15%', 
    },
    { 
      header: '신청자', 
      accessor: 'drafter', 
      width: '10%', 
    },
    { 
      header: '승인일시', 
      accessor: 'respondDate', 
      width: '17%', 
    },
    { 
      header: '수량', 
      accessor: 'quantity', 
      width: '9.5%', 
    },
  ];

  return (
    <div className="content">
      <div className="order">
        <h2>명함 발주</h2>
        <div className="bcdorder-header-row">
          <Breadcrumb items={['발주 관리', '명함 발주']} />
          <div className="buttons-container">
            <CustomButton className="excel-button" onClick={handleExcelDownload}>
              엑셀변환
            </CustomButton>
            <CustomButton className="order-request-button" onClick={handleOrderRequest}>
              발주요청
            </CustomButton>
          </div>
        </div>
        <Table 
          columns={columns} 
          data={filteredApplications} 
          rowClassName="clickable-row"
          onRowClick={(row, rowIndex) => handleRowClick(row)}
          onRowMouseDown={(rowIndex) => handleMouseDown(rowIndex)}  
          onRowMouseOver={(rowIndex) => handleMouseOver(rowIndex)}  
          onRowMouseUp={handleMouseUp}    
        />
      </div>
      {isLoading && (
        <div className="loading-overlay">
          <FadeLoader
            color="#ffffff"
            height={15}
            loading={isLoading}
            margin={2}
            radius={2}
            speedMultiplier={1}
            width={5}
          />
        </div>
      )}
      <EmailModal show={showEmailModal} onClose={() => setShowEmailModal(false)} onSend={handleSendEmail} />
    </div>
  );
}

export default BcdOrder;
