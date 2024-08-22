import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import RentalAddModal from './RentalAddModal'; 
import RentalUpdateModal from './RentalUpdateModal'; 
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/rental/RentalManage.css';

function RentalDetailTable() {
  const { auth } = useContext(AuthContext);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]); 
  const [selectedRental, setSelectedRental] = useState(null); 
  const [rentalDetails, setRentalDetails] = useState([]);  // State to store fetched data

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

  const handleRowClick = (row) => {
    const detailId = row.detailId;
    if (selectedRows.includes(detailId)) {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== detailId));
    } else {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, detailId]);
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
      Cell: ({ row }) => (
        <input
          type="checkbox"
          name="detailSelect"
          onChange={() => handleRowClick(row)}
          checked={selectedRows.includes(row.detailId)}
        />
      ),
    },
    { header: 'NO', accessor: 'detailId' },
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

  const fetchRentalData = async () => {
    try {
      const response = await axios.get('/api/rentalList/center', {
        params: { instCd: auth.instCd },
      });

      const transformedData = response.data.data.map((item) => ({
        ...item,
        status: getStatusText(item.status),
      }));

      setRentalDetails(transformedData);
      setSelectedRows([]);
    } catch (error) {
      console.error('센터 렌탈현황을 불러오는데 실패했습니다.', error);
    }
  }

  useEffect(() => {
    fetchRentalData();
  }, []);

  useEffect(() => {
    console.log("rentalDetails: ", rentalDetails);
  })

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
    fetchRentalData();  // Re-fetch data after save
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
  
    try {
      // PUT 요청을 한 번만 보내고, 선택된 detailIds를 리스트로 전달
      await axios.put('/api/rental/finish', selectedRows);

      alert('선택된 항목이 최종 업데이트되었습니다.');

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
        console.error('렌탈현황 정보를 최종 업데이트하는 중 에러 발생:', error);
        alert('최종 업데이트에 실패했습니다.');
    }
  };

  const handleRowSelect = (selectedRows) => {
    setSelectedRows(selectedRows);
  };

  const handleModifyButtonClick = () => {
    if (selectedRows.length === 1) {
      const rentalData = rentalDetails.find(detail => detail.detailId === selectedRows[0]);
      setSelectedRental(rentalData);
      setIsUpdateModalVisible(true);
    } else if (selectedRows.length === 0) {
      alert("수정할 항목을 선택해주세요.");
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
                  <button className="rental-delete-button" onClick={handleDeleteButtonClick}>삭 제</button>
                  <button className="rental-excel-button">엑 셀</button>
                  <button className="rental-apply-button" onClick={handleFinishButtonClick}>완 료</button>
                </div>
              </div>
              <div className="rental-details-table">
                <Table
                  columns={detailColumns}
                  data={rentalDetails}
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

export default RentalDetailTable;
