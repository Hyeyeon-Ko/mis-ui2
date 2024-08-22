import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import RentalAddModal from './RentalAddModal'; 
import RentalUpdateModal from './RentalUpdateModal'; 
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/rental/RentalManage.css';

function RentalManage() {
  const { auth } = useContext(AuthContext);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]); 
  const [selectedRental, setSelectedRental] = useState(null); 
  const [rentalDetails, setRentalDetails] = useState([]);  

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  const getStatusText = (status) => {
    switch (status) {
      case 'A':
        return '';
      case 'E':
        return '완료';
      default:
        return status;
    }
  };

  const fetchRentalData = async () => {
    try {
      const response = await axios.get('/api/rentalList/center', {
        params: { instCd: auth.instCd },
      });
      const transformedData = response.data.data.map((item, index) => ({
        ...item,
        no: index + 1, 
        status: getStatusText(item.status),
      }));
  
      setRentalDetails(transformedData);
      setSelectedRows([]);
    } catch (error) {
      console.error('센터 렌탈현황을 불러오는데 실패했습니다.', error);
    }
  };
  
  useEffect(() => {
    fetchRentalData();
  }, []);

  const handleRowClick = (row, index) => {
    const detailId = row.detailId;
    if (selectedRows.includes(detailId)) {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== detailId));
    } else {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, detailId]);
    }
  };

  const handleMouseDown = (index) => {
    dragStartIndex.current = index;
    const detailId = rentalDetails[index].detailId;
    if (selectedRows.includes(detailId)) {
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
        const detailId = rentalDetails[i].detailId;
        if (dragMode.current === 'select' && !newSelectedRows.includes(detailId)) {
          newSelectedRows.push(detailId);
        } else if (dragMode.current === 'deselect' && newSelectedRows.includes(detailId)) {
          newSelectedRows = newSelectedRows.filter(id => id !== detailId);
        }
      }

      setSelectedRows(newSelectedRows);
    }
  };

  const handleMouseUp = () => {
    dragStartIndex.current = null;
    dragEndIndex.current = null;
  };

  const handleAddButtonClick = () => {
    setIsAddModalVisible(true);
  };

  const handleModalClose = () => {
    setIsAddModalVisible(false);
    setIsUpdateModalVisible(false);
    setSelectedRental(null);
  };

  const handleSave = (data) => {
    setIsAddModalVisible(false);
    setIsUpdateModalVisible(false);
    setSelectedRental(null);
    fetchRentalData(); 
  };

  const handleDeleteButtonClick = async () => {
    if (selectedRows.length === 0) {
        alert("삭제할 항목을 선택하세요.");
        return;
    }
  
    try {
        for (const detailId of selectedRows) {
            await axios.delete('/api/rental/', { params: { detailId } });
        }
        alert('선택된 항목이 삭제되었습니다.');
  
        setRentalDetails(prevDetails => {
            const updatedDetails = prevDetails
                .filter(item => !selectedRows.includes(item.detailId))
                .map((item, index) => ({
                    ...item,
                    no: index + 1 
                }));
            
            return updatedDetails;
        });
  
        setSelectedRows([]); 
    } catch (error) {
        console.error('렌탈현황 정보를 삭제하는 중 에러 발생:', error);
        alert('삭제에 실패했습니다.');
    }
  };

  const handleFinishButtonClick = async () => {
    if (selectedRows.length === 0) {
        alert("최종 업데이트할 항목을 선택하세요.");
        return;
    }

    // "완료" 상태인 항목이 포함되어 있는지 확인
    const completedItems = selectedRows.filter(rowId => {
        const selectedItem = rentalDetails.find(item => item.detailId === rowId);
        return selectedItem && selectedItem.status === '완료';
    });

    if (completedItems.length > 0) {
        alert("이미 완료된 항목이 선택되었습니다. 완료된 항목은 업데이트할 수 없습니다.");
        return;
    }

    try {
        await axios.put('/api/rental/finish', selectedRows);

        alert('선택된 항목이 최종 업데이트되었습니다.');

        setRentalDetails(prevDetails => {
            const updatedDetails = prevDetails.map(item => {
                if (selectedRows.includes(item.detailId)) {
                    return {
                        ...item,
                        status: '완료', // 완료된 항목의 상태만 업데이트
                    };
                }
                return item;
            });
            return updatedDetails;
        });

        setSelectedRows([]);
    } catch (error) {
        console.error('렌탈현황 정보를 최종 업데이트하는 중 에러 발생:', error);
        alert('최종 업데이트에 실패했습니다.');
    }
};

  const handleModifyButtonClick = () => {
    if (selectedRows.length === 1) {
      const rentalData = rentalDetails.find(detail => detail.detailId === selectedRows[0]);
      setSelectedRental(rentalData);
      setIsUpdateModalVisible(true);
    } else if (selectedRows.length === 0) {
      setSelectedRental(null);
      setIsUpdateModalVisible(true);
    } else {
      alert("하나의 항목만 선택하여 수정할 수 있습니다.");
    }
  };

  const handleExcelDownload = async () => {
    if (selectedRows.length === 0) {
      alert("엑셀 파일로 내보낼 항목을 선택하세요.");
      return;
    }

    try {
      const response = await axios.post('/api/rental/excel', selectedRows, {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '렌탈현황 관리표.xlsx'); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("엑셀 다운로드 실패:", error);
    }
  };

  const detailColumns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={(e) => {
            const isChecked = e.target.checked;
            setSelectedRows(isChecked ? rentalDetails.map(d => d.detailId) : []);
          }}
        />
      ),
      accessor: 'select',
      width: '5%',
      Cell: ({ row, index }) => (
        <input
          type="checkbox"
          name="detailSelect"
          onChange={() => handleRowClick(row, index)}
          checked={selectedRows.includes(row.detailId)}
        />
      ),
    },
    { header: 'NO', accessor: 'no' },
    { header: '제품군', accessor: 'category' },
    { header: '업체명', accessor: 'companyNm' },
    { header: '계약번호', accessor: 'contractNum' },
    { header: '모델명', accessor: 'modelNm' },
    { header: '설치일자', accessor: 'installDate' },
    { header: '만료일자', accessor: 'expiryDate' },
    { header: '렌탈료', accessor: 'rentalFee' },
    { header: '위치분류', accessor: 'location' },
    { header: '설치위치', accessor: 'installationSite' },
    { header: '특이사항', accessor: 'specialNote' },
    { header: '상태', accessor: 'status' },
  ];

  return (
    <div className='content'>
      <div className='rental-content'>
        <div className="rental-content-inner">
          <h2>렌탈현황 관리표</h2>
          <Breadcrumb items={['신청하기', '렌탈현황 관리표']} />
          <div className="rental-tables-section">
            <div className="rental-details-content">
              <div className="rental-header-buttons">
                <label className='rental-detail-content-label'>렌탈 현황&gt;&gt;</label>
                <div className="rental-detail-buttons">
                  <button className="rental-add-button" onClick={handleAddButtonClick}>추 가</button>
                  <button className="rental-modify-button" onClick={handleModifyButtonClick}>수 정</button>
                  <button className="rental-delete-button" onClick={handleDeleteButtonClick}>삭 제</button>
                  <button className="rental-excel-button" onClick={handleExcelDownload}>엑 셀</button>
                  <button className="rental-apply-button" onClick={handleFinishButtonClick}>완 료</button>
                </div>
              </div>
              <div className="rental-details-table">
                <Table
                  columns={detailColumns}
                  data={rentalDetails}
                  onRowClick={handleRowClick}  
                  onRowMouseDown={handleMouseDown}  
                  onRowMouseOver={handleMouseOver}  
                  onRowMouseUp={handleMouseUp}  
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <RentalAddModal 
        show={isAddModalVisible} 
        onClose={handleModalClose} 
        onSave={handleSave} 
      />
      <RentalUpdateModal
        show={isUpdateModalVisible}
        onClose={handleModalClose}
        onSave={handleSave}
        rentalData={selectedRental} 
      />
    </div>
  );
}

export default RentalManage;
