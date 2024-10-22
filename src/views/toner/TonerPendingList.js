import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import CustomButton from '../../components/common/CustomButton';
import EmailModal from '../bcd/EmailModal';
import '../../styles/bcd/BcdOrder.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { FadeLoader } from 'react-spinners';
import { AuthContext } from '../../components/AuthContext'; 
import useBdcChange from '../../hooks/bdc/useBdcChange';

function TonerPendingList() {
  const { handleSelectAll, handleSelect, applications, selectedApplications, setApplications, setSelectedApplications} = useBdcChange();
  const { refreshSidebar } = useContext(AuthContext);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  const handleRowClick = (row) => {
    const id = row.id;
    if (selectedApplications.includes(id)) {
      setSelectedApplications(selectedApplications.filter((appId) => appId !== id));
    } else {
      setSelectedApplications([...selectedApplications, id]);
    }
  };

  const handleMouseDown = (rowIndex) => {
    dragStartIndex.current = rowIndex;

    const appId = applications[rowIndex].id;
    if (selectedApplications.includes(appId)) {
      dragMode.current = 'deselect'; 
    } else {
      dragMode.current = 'select'; 
    }
  };

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
  
  const handleMouseUp = () => {
    dragStartIndex.current = null;
    dragEndIndex.current = null;
  };

  const handleExcelDownload = async () => {
    if (selectedApplications.length === 0) {
      alert('엑셀변환 할 명함 신청 목록을 선택하세요.');
      return;
    }

    try {
      const response = await axios.post(`/api/bsc/order/excel`, selectedApplications, {
        responseType: 'blob',
      });
      fileDownload(response.data, '명함 발주내역.xlsx');
    } catch (error) {
      console.error('Error downloading excel: ', error);
    }
  };

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
      await axios.post(`/api/toner/order`, {
        draftIds: selectedApplications,
        emailSubject: emailData.subject,
        emailBody: emailData.body,
        fileName: emailData.fileName,
        fromEmail: emailData.fromEmail,
        toEmail: emailData.toEmail,
        password: emailData.password,
      });
  
      const updatedApplications = applications.filter(app => !selectedApplications.includes(app.id));
      setApplications(updatedApplications);
      setSelectedApplications([]); 
  
      setShowEmailModal(false);
      alert('발주 요청이 성공적으로 완료되었습니다.');
      refreshSidebar();
      navigate('/std', { replace: true });
      
    } catch (error) {
      console.error('Error sending order request: ', error);
      alert('발주 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
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
      header: '센터명', 
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
        <h2>토너 대기</h2>
        <div className="bcdorder-header-row">
          <Breadcrumb items={['토너 관리', '토너 대기']} />
          <div className="buttons-container">
            <CustomButton className="excel-button" onClick={handleExcelDownload}>
              엑셀변환
            </CustomButton>
            <CustomButton className="order-request-button" onClick={handleOrderRequest}>
              발주요청
            </CustomButton>
          </div>
        </div>
        {(
          <>
        <Table 
          columns={columns} 
          data={applications || []} 
          rowClassName="clickable-row"
          onRowClick={(row, rowIndex) => handleRowClick(row)}
          onRowMouseDown={(rowIndex) => handleMouseDown(rowIndex)}  
          onRowMouseOver={(rowIndex) => handleMouseOver(rowIndex)}  
          onRowMouseUp={handleMouseUp}    
        />
        </>

)}
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

export default TonerPendingList;
