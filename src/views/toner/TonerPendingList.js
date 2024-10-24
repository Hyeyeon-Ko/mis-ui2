import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import CustomButton from '../../components/common/CustomButton';
import RejectReasonModal from '../../components/ReasonModal';
import '../../styles/bcd/BcdOrder.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { FadeLoader } from 'react-spinners';
import { AuthContext } from '../../components/AuthContext'; 
import useTonerChange from '../../hooks/useTonerChange';

function TonerPendingList() {
  const { handleSelectAll, handleSelect, applications, selectedApplications, setApplications, setSelectedApplications} = useTonerChange();
  const { auth, refreshSidebar } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  const fetchTonerPendingList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/toner/pending', {
        params: {
          instCd: auth.instCd,
        },
      });
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching toner pending list: ', error);
      alert('토너 대기 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [auth.instCd, setApplications]);

  useEffect(() => {
    fetchTonerPendingList();
  }, [fetchTonerPendingList]);

  const filteredApplications = applications.filter(row => row.holding === null);

  const handleRowClick = (row) => {
    const draftId = row.draftId;
    if (expandedRows.includes(draftId)) {
      setExpandedRows(expandedRows.filter(id => id !== draftId));  // 이미 열려있으면 닫기
    } else {
      setExpandedRows([...expandedRows, draftId]);  // 닫혀 있으면 열기
    }
  };

  const getExpandedRows = () => {
    const expandedData = [];
    filteredApplications.forEach(row => {
      expandedData.push(row);
      if (expandedRows.includes(row.draftId)) {
        // draftId가 동일한 holding이 T인 데이터를 추가
        const holdingRows = applications.filter(holdingRow => holdingRow.draftId === row.draftId && holdingRow.holding === 'T');
        expandedData.push(...holdingRows);
      }
    });
    return expandedData;
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

  // TODO: 엑셀 파일 형식 받은 후 연동
  const handleExcelDownload = async () => {
    if (selectedApplications.length === 0) {
      
      alert('엑셀변환 할 명함 신청 목록을 선택하세요.');
      return;
    }

    try {
      const response = await axios.post(`/api/toner/pending/excel`, selectedApplications, {
        responseType: 'blob',
      });
      fileDownload(response.data, '토너 승인대기 내역(기안상신용).xlsx');
    } catch (error) {
      console.error('Error downloading excel: ', error);
    }
  };

  const handleApprove = async () => {
    if (selectedApplications.length === 0) {
      alert('승인할 신청을 선택하세요.');
      return;
    }

    try {
      setIsLoading(true);
      const tonerConfirmRequestDTO = {
        draftIds: selectedApplications, 
        confirmRequestDTO: {
          userId: auth.userId, 
          rejectReason: null, 
        }
      };
      await axios.post(`/api/toner/confirm`, tonerConfirmRequestDTO);  
      alert('선택한 신청이 승인되었습니다.');
      fetchTonerPendingList(); 
    } catch (error) {
      console.error('Error approving applications: ', error);
      alert('신청 승인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisapproveConfirm = async (reason) => {
    try {
      setIsLoading(true);
      const tonerConfirmRequestDTO = {
        draftIds: selectedApplications, 
        confirmRequestDTO: {
          userId: auth.userId, 
          rejectReason: reason
        }
      };
      await axios.post(`/api/toner/confirm/return`, tonerConfirmRequestDTO);
      alert('선택한 신청이 반려되었습니다.');
      setShowRejectModal(false);
      await fetchTonerPendingList();
      await refreshSidebar();
      navigate(`/toner/pendingList`);
    } catch (error) {
      console.error('Error disapproving applications: ', error);
      alert('신청 반려 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDisapprove = () => {
    if (selectedApplications.length === 0) {
      alert('반려할 신청을 선택하세요.');
      return;
    }

    setShowRejectModal(true);
  }

  const handleDisapproveClose = () => {
    setShowRejectModal(false);
  };  

  const columns = [
    {
      header: <input type="checkbox" onChange={handleSelectAll} />,
      accessor: 'select',
      width: '3.5%',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          className="order-checkbox"
          checked={selectedApplications.includes(row.draftId)}
          onChange={(event) => handleSelect(event, row.draftId)}
          onClick={(e) => e.stopPropagation()} 
        />
      ),
    },
    { header: '신청자', accessor: 'drafter', width: '5%' },
    { header: '신청일자', accessor: 'draftDate', width: '10%' },
    { header: '관리번호', accessor: 'mngNum', width: '8%' },
    { header: '부서', accessor: 'teamNm', width: '10%' },
    { header: '위치', accessor: 'location', width: '15%' },
    { header: '프린터명', accessor: 'printNm', width: '12%' },
    { header: '토너명', accessor: 'tonerNm', width: '12%' },
    { header: '수량', accessor: 'quantity', width: '3%' },
    { header: '금액', accessor: 'totalPrice', width: '8%' },
  ];

  return (
    <div className="content">
      <div className="order">
        <h2>토너 대기</h2>
        <div className="bcdorder-header-row">
          <Breadcrumb items={['토너 관리', '토너 대기']} />
          <div className="buttons-container">
            <CustomButton className="toner-button" onClick={handleApprove}>
              승인
            </CustomButton>
            <CustomButton className="toner-button" onClick={handleDisapprove}>
              반려
            </CustomButton>
            <CustomButton className="excel-button" onClick={handleExcelDownload}>
              엑셀
            </CustomButton>
          </div>
        </div>
        {loading ? (
          <div className="loading-container">
            <FadeLoader color="#ffffff" height={15} margin={2} radius={2} width={5} />
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={getExpandedRows()}  // 확장된 행들 포함
            rowClassName="clickable-row"
            onRowClick={(row) => handleRowClick(row)}  // 클릭 시 확장/축소
            onRowMouseDown={(rowIndex) => handleMouseDown(rowIndex)}  
            onRowMouseOver={(rowIndex) => handleMouseOver(rowIndex)}  
            onRowMouseUp={handleMouseUp}    
          />
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
      <RejectReasonModal show={showRejectModal} onClose={handleDisapproveClose} onConfirm={handleDisapproveConfirm} modalType="reject"/>

    </div>
  );
}

export default TonerPendingList;
