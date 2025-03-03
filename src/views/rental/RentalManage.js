import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import RentalAddModal from './RentalAddModal'; 
import RentalUpdateModal from './RentalUpdateModal'; 
import RentalBulkUpdateModal from './RentalBulkUpdateModal';
import CustomSelect from '../../components/CustomSelect';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/rental/RentalManage.css';
import useRentalChange from '../../hooks/useRentalChange';
import Loading from '../../components/common/Loading';

function RentalManage() {
  const { selectedRows, setSelectedRows, handleRowSelect } = useRentalChange();
  const { auth } = useContext(AuthContext);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isBulkUpdateModalVisible, setIsBulkUpdateModalVisible] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null); 
  const [rentalDetails, setRentalDetails] = useState([]);  
  const [filteredRentalDetails, setFilteredRentalDetails] = useState([]); 
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [lastUpdtDate, setLastUpdtDate] = useState(null);
  const [totalRentalFee, setTotalRentalFee] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const statusOptions = [
    { label: '전체', value: '전체' },
    { label: '완료', value: '완료' },
    { label: '대기', value: '' },
  ];

  const categoryOptions = [
    { label: '전체', value: '전체' },
    { label: '비데', value: '비데' },
    { label: '정수기', value: '정수기' },
    { label: '공기청정기', value: '공기청정기' },
  ];  

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

  const calculateTotalRentalFee = (filteredDetails) => {
    const completedItems = filteredDetails.filter(item => item.status === '완료');
    
    const total = completedItems.reduce((sum, item) => {
        const fee = parseFloat(item.rentalFee.replace(/,/g, '')); 
        return sum + (isNaN(fee) ? 0 : fee); 
    }, 0);
    
    setTotalRentalFee(total);  
  };
  
  const fetchRentalData = useCallback(async () => {
    setLoading(true);
    try {
        const response = await axios.get(`/api/rentalList/center`, {
            params: { instCd: auth.instCd },
        });

        if (response.data.data && response.data.data.length > 0) {
            const transformedData = response.data.data.map((item, index) => ({
                ...item,
                no: index + 1,
                status: getStatusText(item.status),
            }));

            setRentalDetails(transformedData);
            setSelectedRows([]);

            if (response.data.data[0].lastUpdtDate) {
                setLastUpdtDate(response.data.data[0].lastUpdtDate);
            } else {
                setLastUpdtDate(null); 
            }
            calculateTotalRentalFee(transformedData);
        } else {
            setRentalDetails([]); 
            setLastUpdtDate(null);
            setTotalRentalFee(0);
        }
    } catch (error) {
        console.error('센터 렌탈현황을 불러오는데 실패했습니다.', error);
    } finally {
        setLoading(false);
    }
}, [auth.instCd, setSelectedRows]);
  
  useEffect(() => {
    fetchRentalData();
  }, [fetchRentalData]);

  useEffect(() => {
    let filteredData = rentalDetails;
  
    if (selectedStatus !== '전체') {
      filteredData = filteredData.filter(item => item.status === selectedStatus);
    }
  
    if (selectedCategory !== '전체') {
      filteredData = filteredData.filter(item => item.category === selectedCategory);
    }
  
    filteredData = filteredData.map((item, index) => ({
      ...item,
      no: index + 1,  
    }));
  
    setFilteredRentalDetails(filteredData);
  
    calculateTotalRentalFee(filteredData);
  
  }, [selectedStatus, selectedCategory, rentalDetails]);
    
  const handleRowClick = (row, index) => {
    const isChecked = !selectedRows.includes(row.detailId);
    if (isChecked) {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.detailId]);
    } else {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.detailId));
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
    setIsBulkUpdateModalVisible(false);
    setSelectedRental(null);
  };

  const handleSave = (data) => {
    setIsAddModalVisible(false);
    setIsUpdateModalVisible(false);
    setIsBulkUpdateModalVisible(false);
    setSelectedRental(null);
    fetchRentalData(); 
  };

  const handleDeleteButtonClick = async () => {
    if (selectedRows.length === 0) {
      alert("삭제할 항목을 선택하세요.");
      return;
    }
    setShowDeleteModal(true);
  }

  const handleConfirmDelete = async () => {
    try {
        for (const detailId of selectedRows) {
            await axios.delete(`/api/rental/`, { params: { detailId } });
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
        setShowDeleteModal(false);
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

    const completedItems = selectedRows.filter(rowId => {
        const selectedItem = rentalDetails.find(item => item.detailId === rowId);
        return selectedItem && selectedItem.status === '완료';
    });

    if (completedItems.length > 0) {
        alert("이미 완료된 항목은 업데이트할 수 없습니다.");
        return;
    }

    try {
        await axios.put(`/api/rental/finish`, selectedRows);

        alert('선택된 항목이 최종 업데이트되었습니다.');

        setRentalDetails(prevDetails => {
            const updatedDetails = prevDetails.map(item => {
                if (selectedRows.includes(item.detailId)) {
                    return {
                        ...item,
                        status: '완료',
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

      const completedItems = selectedRows.filter(rowId => {
        const selectedItem = rentalDetails.find(item => item.detailId === rowId);
        return selectedItem && selectedItem.status === '완료';
    });

    if (completedItems.length > 0) {
        alert("완료된 항목은 수정할 수 없습니다.");
        return;
    }

    if (selectedRows.length === 1) {
      const rentalData = rentalDetails.find(detail => detail.detailId === selectedRows[0]);
      setSelectedRental(rentalData);
      setIsUpdateModalVisible(true);
    } else if (selectedRows.length === 0) {
      setSelectedRental(null);
      setIsUpdateModalVisible(true);
    } else {
      setIsBulkUpdateModalVisible(true);
    }
  };

  const handleExcelDownload = async () => {
    if (selectedRows.length === 0) {
      alert("엑셀 파일로 내보낼 항목을 선택하세요.");
      return;
    }

    try {
      const response = await axios.post(`/api/rental/excel`, selectedRows, {
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
        Cell: ({ row }) => {
            const detailId = row?.detailId || row?.original?.detailId; 
            return (
                <input
                    type="checkbox"
                    name="detailSelect"
                    onClick={(e) => e.stopPropagation()} 
                    onChange={(e) => handleRowSelect(e, row)}
                    checked={detailId && selectedRows.includes(detailId)}
                />
            );
        },
    },
    { header: 'NO', accessor: 'no' },
    { header: (
      <CustomSelect
        label="상태"
        options={statusOptions}  
        selectedValue={selectedStatus}  
        onChangeHandler={(e) => setSelectedStatus(e.target.value)} 
      />
     ), accessor: 'status' },
    { header: '업체명', accessor: 'companyNm' },
    { header: (
      <CustomSelect
        label="제품군"
        options={categoryOptions}  
        selectedValue={selectedCategory}  
        onChangeHandler={(e) => setSelectedCategory(e.target.value)} 
      />
    ), accessor: 'category' },    
    { header: '계약번호', accessor: 'contractNum' },
    { header: '모델명', accessor: 'modelNm' },
    { header: '설치일자', accessor: 'installDate' },
    { header: '만료일자', accessor: 'expiryDate' },
    { header: '렌탈료', accessor: 'rentalFee' },
    { header: '위치분류', accessor: 'location' },
    { header: '설치장소', accessor: 'installationSite' },
    { header: '특이사항', accessor: 'specialNote' },
];
  
  return (
    <div className='content'>
      <div className='rental-content'>
        <div className="rental-content-inner">
          <h2>렌탈 관리표</h2>
          <Breadcrumb items={['자산 관리', '렌탈 관리표']} />
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="rental-tables-section">
                <div className="rental-details-content">
                  <div className="rental-header-buttons">
                    <label className='rental-detail-content-label'>렌탈 현황&gt;&gt;</label>
                    <div className="rental-detail-buttons">
                      {lastUpdtDate && (
                        <div className="last-updt-date">
                        최종 수정일자: {lastUpdtDate} &nbsp; 
                        <span className="total-rental-fee">
                          총 렌탈료(완료 항목): {totalRentalFee.toLocaleString()} 원
                        </span>
                      </div>
                    )}
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
                      data={filteredRentalDetails}
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
      {showDeleteModal && (
          <ConfirmModal
            message="정말 삭제하시겠습니까?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
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
      <RentalBulkUpdateModal
        show={isBulkUpdateModalVisible}
        onClose={handleModalClose}
        onSave={handleSave}
        selectedDetailIds={selectedRows}
      />
    </div>
  );
}

export default RentalManage;
