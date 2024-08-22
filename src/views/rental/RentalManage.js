import React, { useState } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import RentalAddModal from './RentalAddModal'; 
import RentalUpdateModal from './RentalUpdateModal'; 
import '../../styles/common/Page.css';
import '../../styles/rental/RentalManage.css';

function RentalManage() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]); 
  const [selectedRental, setSelectedRental] = useState(null); 

  const detailColumns = [
    { header: 'NO' },
    { header: '제품군' },
    { header: '업체명' },
    { header: '계약번호' },
    { header: '모델명' },
    { header: '설치일자' },
    { header: '만료일자' },
    { header: '렌탈료' },
    { header: '위치분류' },
    { header: '설치위치' },
    { header: '특이사항' },
  ];

  const filteredDetails = [
  ];

  const handleAddButtonClick = () => {
    setIsAddModalVisible(true);
  };

  const handleModalClose = () => {
    setIsAddModalVisible(false);
    setIsUpdateModalVisible(false);
    setSelectedRental(null);
  };

  const handleSave = (data) => {
    console.log('Saved data:', data);
    setIsAddModalVisible(false);
    setIsUpdateModalVisible(false);
    setSelectedRental(null);
  };

  const handleRowSelect = (selectedRows) => {
    setSelectedRows(selectedRows);
  };

  const handleModifyButtonClick = () => {
    if (selectedRows.length === 1) {
      const rentalData = filteredDetails.find(detail => detail.id === selectedRows[0]);
      setSelectedRental(rentalData);
      setIsUpdateModalVisible(true);
    } else if (selectedRows.length === 0) {
      setIsUpdateModalVisible(true);
    } else {
      alert("하나의 항목만 선택하여 수정할 수 있습니다.");
    }
  };

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
                  <button className="rental-delete-button">삭 제</button>
                  <button className="rental-excel-button">엑 셀</button>
                  <button className="rental-apply-button">완 료</button>
                </div>
              </div>
              <div className="rental-details-table">
                <Table
                  columns={detailColumns}
                  data={filteredDetails}
                  selectedRows={selectedRows}
                  onRowSelect={handleRowSelect}
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
