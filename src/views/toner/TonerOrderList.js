import React, { useCallback, useEffect, useRef, useContext, useState } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/bcd/BcdOrder.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { AuthContext } from '../../components/AuthContext'; 
import useTonerChange from '../../hooks/useTonerChange';


function TonerOrderList() {
  const { handleSelectAll, handleSelect, applications, selectedApplications, setApplications, setSelectedApplications} = useTonerChange();
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

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
      const response = await axios.post(`/api/toner/order/excel`, selectedApplications, {
        responseType: 'blob',
      });
      fileDownload(response.data, '명함 발주내역.xlsx');
    } catch (error) {
      console.error('Error downloading excel: ', error);
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
      header: '품명', 
      accessor: 'tonerNm',
      width: '20%',
    },
    { 
      header: '수량', 
      accessor: 'quantity', 
      width: '10%', 
    },
    { 
      header: '단가', 
      accessor: 'price', 
      width: '10%', 
    },
    { 
      header: '가격', 
      accessor: 'totalPrice', 
      width: '10%', 
    },
    { 
      header: '비고', 
      accessor: 'mngNum', 
      width: '10%', 
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
            <CustomButton className="order-request-button">
              발주요청
            </CustomButton>
          </div>
        </div>
        {loading ? ( // Display the Loading component while loading is true
          <Loading />
        ) : (
          <Table 
            columns={columns} 
            data={applications || []} 
            rowClassName="clickable-row"
            onRowClick={(row, rowIndex) => handleRowClick(row)}
            onRowMouseDown={(rowIndex) => handleMouseDown(rowIndex)}  
            onRowMouseOver={(rowIndex) => handleMouseOver(rowIndex)}  
            onRowMouseUp={handleMouseUp}    
          />
        )}
      </div>
    </div>
  );
}

export default TonerOrderList;
