import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import TonerPriceModal from './TonerPriceModal';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/rental/RentalManage.css';
import useTonerChange from '../../hooks/useTonerChange';
import { reverseDivisionMap } from '../../datas/tonerData';

function TonerPriceList() {
  const { selectedRows, setSelectedRows, handleRowSelect } = useTonerChange();
  const { auth } = useContext(AuthContext);
  const [tonerDetails, setTonerDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedToner, setSelectedToner] = useState(null);

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select'); 

  const fetchTonerData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/toner/price/list`, {
        params: { instCd: auth.instCd },
      });

      if (response.data.data && response.data.data.length > 0) {
        const transformedData = response.data.data.map((item) => ({
          ...item,
        }));

        setTonerDetails(transformedData);
        setSelectedRows([]);
      } else {
        setTonerDetails([]);
      }
    } catch (error) {
      console.error('토너 정보를 불러오는데 실패했습니다.', error);
    } finally {
      setLoading(false);
    }
  }, [auth.instCd, setSelectedRows]);

  useEffect(() => {
    fetchTonerData();
  }, [fetchTonerData]);

  const handleAddButtonClick = () => {
    setIsAddModalVisible(true);
  };

  const handleEditButtonClick = async () => {
    if (selectedRows.length === 0) {
      alert('수정할 항목을 선택하세요.');
      return;
    } else if (selectedRows.length > 1) {
      alert('수정할 항목을 하나만 선택하세요.');
      return;
    }
  
    try {
      const selectedTonerName = selectedRows[0];
      const response = await axios.get(`/api/toner/price/${selectedTonerName}`);
      setSelectedToner(response.data.data); 
      setIsEditModalVisible(true); 
    } catch (error) {
      console.error('토너 정보를 불러오는 중 오류가 발생했습니다.', error);
      alert('토너 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteButtonClick = async () => { 
    if (selectedRows.length === 0) {
      alert("삭제할 항목을 선택하세요.");
      return;
    }

    try {
      for (const tonerNm of selectedRows) {
        await axios.delete(`/api/toner/price/${tonerNm}`);  
      }
      alert('선택된 항목이 삭제되었습니다.');

      setTonerDetails(prevDetails => {
        const updatedDetails = prevDetails
          .filter(item => !selectedRows.includes(item.tonerNm))
          .map((item, index) => ({
            ...item
          }));
        return updatedDetails;
      });
      setSelectedRows([]);
    } catch (error) {
      console.error('토너 정보를 삭제하는 중 에러 발생: ', error);
      alert('삭제에 실패했습니다');
    }
  };
  
  const handleModalClose = () => {
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
  };

  const handleSave = (newTonerData) => {
    setTonerDetails((prevDetails) => [...prevDetails, ...newTonerData]);  
    handleModalClose();
    fetchTonerData();
  };

  const handleRowClick = (row, index) => {
    const isChecked = !selectedRows.includes(row.tonerNm);
    if (isChecked) {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.tonerNm]);
    } else {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.tonerNm));
    }
  };

  const handleMouseDown = (index) => {
    dragStartIndex.current = index;
    const tonerNm = tonerDetails[index].tonerNm;
    if (selectedRows.includes(tonerNm)) {
      dragMode.current = 'deselect';
    } else {
      dragMode.current = 'select';
    }
  };

  const handleMouseOver = (index) => {
    if (dragStartIndex.current !== null) {
      dragEndIndex.current = index;
      const start = Math.min(dragStartIndex.current, dragEndIndex.current);
      const end = Math.max(dragStartIndex.current, dragEndIndex.current);

      let newSelectedRows = [...selectedRows];

      for (let i = start; i <= end; i++) {
        const tonerNm = tonerDetails[i].tonerNm;
        if (dragMode.current === 'select' && !newSelectedRows.includes(tonerNm)) {
          newSelectedRows.push(tonerNm);
        } else if (dragMode.current === 'deselect' && newSelectedRows.includes(tonerNm)) {
          newSelectedRows = newSelectedRows.filter(id => id !== tonerNm);
        }
      }

      setSelectedRows(newSelectedRows);
    }
  };

  const handleMouseUp = () => {
    dragStartIndex.current = null;
    dragEndIndex.current = null;
  };

  // const handleExcelDownload = async () => {
  //   if (selectedRows.length === 0) {
  //     alert("엑셀 파일로 내보낼 항목을 선택하세요.");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(`/api/toner/excel`, selectedRows, {
  //       responseType: 'blob',
  //     });

  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.setAttribute('download', '토너 관리표.xlsx');
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   } catch (error) {
  //     console.error("엑셀 다운로드 실패:", error);
  //   }
  // };

  const detailColumns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={(e) => {
            const isChecked = e.target.checked;
            setSelectedRows(isChecked ? tonerDetails.map(d => d.tonerNm) : []);
          }}
        />
      ),
      accessor: 'select',
      width: '5%',
      Cell: ({ row }) => {
        const tonerNm = row?.tonerNm || row?.original?.tonerNm;
        return (
          <input
            type="checkbox"
            name="detailSelect"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleRowSelect(e, row)}
            checked={tonerNm && selectedRows.includes(tonerNm)}
          />
        );
      },
    },
    { header: '모델명', accessor: 'modelNm' },
    { header: '제조사', accessor: 'company' },
    { header: '토너명', accessor: 'tonerNm' },
    { 
      header: '구분', 
      accessor: 'division',
      Cell: ({ row }) => {
        const divisionValue = row?.division; 
        return divisionValue ? (reverseDivisionMap[divisionValue] || divisionValue) : 'N/A';
      }
    },
    { header: '가격', accessor: 'price' },
    { header: '비고', accessor: 'specialNote' },
  ];

  return (
    <div className='content'>
      <div className='rental-content'>
        <div className="rental-content-inner">
          <h2>토너 단가표</h2>
          <Breadcrumb items={['토너 관리', '토너 단가표']} />
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="rental-tables-section">
                <div className="rental-details-content">
                  <div className="rental-header-buttons">
                    <label className='rental-detail-content-label'>토너 단가 정보&gt;&gt;</label>
                    <div className="rental-detail-buttons">
                      <button className="rental-add-button" onClick={handleAddButtonClick}>추 가</button>
                      <button className="rental-modify-button" onClick={handleEditButtonClick}>수 정</button>
                      <button className="rental-delete-button" onClick={handleDeleteButtonClick}>삭 제</button>
                      {/* <button className="rental-excel-button" onClick={handleExcelDownload}>엑 셀</button> */}
                    </div>
                  </div>
                  <div className="rental-details-table">
                    <Table
                      columns={detailColumns}
                      data={tonerDetails}
                      onRowClick={handleRowClick}
                      onRowMouseDown={handleMouseDown}
                      onRowMouseOver={handleMouseOver}
                      onRowMouseUp={handleMouseUp}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <TonerPriceModal
        show={isAddModalVisible}
        onClose={handleModalClose}
        onSave={handleSave}
        editMode={false}
      />
      <TonerPriceModal
        show={isEditModalVisible}
        onClose={handleModalClose}
        onSave={handleSave}
        editMode={true}
        selectedData={selectedToner}
      />
    </div>
  );
}

export default TonerPriceList;
