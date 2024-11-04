import React, { useCallback, useEffect, useRef, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import CustomButton from '../../components/common/CustomButton';
import EmailModal from '../../components/common/EmailModal';
import '../../styles/bcd/BcdOrder.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { FadeLoader } from 'react-spinners';
import { AuthContext } from '../../components/AuthContext'; 
import useTonerChange from '../../hooks/useTonerChange';


function TonerOrderList() {
  const { handleSelectAll, handleSelect, applications, selectedApplications, setApplications, setSelectedApplications} = useTonerChange();
  const { auth, refreshSidebar } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const navigate = useNavigate();

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  const fetchTonerOrderList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/toner/order`, {
        params: {
          instCd:auth.instCd,
        },
      });
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching toner order list: ', error);
      alert('토너 발주 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [auth.instCd, setApplications]);

  useEffect(() => {
    fetchTonerOrderList();
  }, [fetchTonerOrderList]);

  const handleRowClick = (row) => {
    const draftId = row.draftId; 
    if (selectedApplications.includes(draftId)) {
      setSelectedApplications(selectedApplications.filter((appDraftId) => appDraftId !== draftId));
    } else {
      setSelectedApplications([...selectedApplications, draftId]);
    }
  };

  const handleMouseDown = (rowIndex) => {
    dragStartIndex.current = rowIndex;
    const draftId = applications[rowIndex].draftId; 
    if (selectedApplications.includes(draftId)) {
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
        const draftId = applications[i]?.draftId; 
        if (dragMode.current === 'select' && draftId && !newSelectedApplications.includes(draftId)) {
          newSelectedApplications.push(draftId); 
        } else if (dragMode.current === 'deselect' && draftId && newSelectedApplications.includes(draftId)) {
          newSelectedApplications = newSelectedApplications.filter(id => id !== draftId); 
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
      const requestData = {
        draftIds: selectedApplications,
        instCd: auth.instCd, 
      };
  
      const response = await axios.post(`/api/toner/order/excel`, requestData, {
        responseType: 'blob',
      });
      
      fileDownload(response.data, '토너 발주내역.xlsx');
    } catch (error) {
      console.error('Error downloading excel: ', error);
    }
  };

  const handleOrderRequest = () => {
    if (selectedApplications.length === 0) {
      alert('발주 요청 할 토너 신청 목록을 선택하세요');
      return;
    }
    setShowEmailModal(true);
  }

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
        instCd: auth.instCd,
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
          checked={selectedApplications.includes(row.draftId)}
          onClick={(e) => e.stopPropagation()} 
          onChange={(event) => handleSelect(event, row.draftId)}
        />
      ),
    },
    {
      header: '신청부서', 
      accessor: 'teamNm',
      width: '15%',
    },
    {
      header: '품명', 
      accessor: 'tonerNm',
      width: '18%',
    },
    { 
      header: '수량', 
      accessor: 'quantity', 
      width: '8%', 
    },
    { 
      header: '단가', 
      accessor: 'price', 
      width: '8%', 
    },
    { 
      header: '가격', 
      accessor: 'totalPrice', 
      width: '8%', 
    },
    { 
      header: '비고', 
      accessor: 'mngNum', 
      width: '8%', 
    },
  ];

  return (
    <div className="content">
      <div className="order">
        <h2>토너 발주</h2>
        <div className="bcdorder-header-row">
          <Breadcrumb items={['토너 관리', '토너 발주']} />
          <div className="buttons-container">
            <CustomButton className="excel-button" onClick={handleExcelDownload}>
              엑셀변환
            </CustomButton>
            <CustomButton className="order-request-button" onClick={handleOrderRequest}>
              발주요청
            </CustomButton>
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : (
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

      <EmailModal show={showEmailModal} onClose={() => setShowEmailModal(false)} onSend={handleSendEmail} orderType="토너" />
    </div>
  );
}

export default TonerOrderList;
