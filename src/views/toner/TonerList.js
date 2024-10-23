import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import TonerInfoModal from './TonerInfoModal';
import CustomSelect from '../../components/CustomSelect';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/rental/RentalManage.css';
import useTonerChange from '../../hooks/useTonerChange';

function TonerList() {
  const { selectedRows, setSelectedRows, handleRowSelect } = useTonerChange();
  const { auth } = useContext(AuthContext);
  const [tonerDetails, setTonerDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [filteredTonerDetails, setFilteredTonerDetails] = useState([]);
  const [selectedToner, setSelectedToner] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('전체');
  const [selectedTeamNm, setSelectedTeamNm] = useState('전체');
  const [selectedLocation, setSelectedLocation] = useState('전체');
  const [selectedProductNm, setSelectedProductNm] = useState('전체');
  const [selectedModelNm, setSelectedModelNm] = useState('전체');
  const [selectedCompany, setSelectedCompany] = useState('전체');
  const [selectedTonerNm, setSelectedTonerNm] = useState('전체');

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  const fetchTonerData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/toner/manage/list`, {
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

  const floorOptions = getUniqueOptions(tonerDetails, 'floor');
  const teamOptions = getUniqueOptions(tonerDetails, 'teamNm');
  const locationOptions = getUniqueOptions(tonerDetails, 'location');
  const productOptions = getUniqueOptions(tonerDetails, 'productNm');
  const modelOptions = getUniqueOptions(tonerDetails, 'modelNm');
  const companyOptions = getUniqueOptions(tonerDetails, 'company');
  const tonerOptions = getUniqueOptions(tonerDetails, 'tonerNm');

  useEffect(() => {
    let filteredData = tonerDetails;

    if (selectedFloor !== '전체') {
      filteredData = filteredData.filter(item => item.floor === selectedFloor);
    }
    if (selectedTeamNm !== '전체') {
      filteredData = filteredData.filter(item => item.teamNm === selectedTeamNm);
    }
    if (selectedLocation !== '전체') {
      filteredData = filteredData.filter(item => item.location === selectedLocation);
    }
    if (selectedProductNm !== '전체') {
      filteredData = filteredData.filter(item => item.productNm === selectedProductNm);
    }
    if (selectedModelNm !== '전체') {
      filteredData = filteredData.filter(item => item.modelNm === selectedModelNm);
    }
    if (selectedCompany !== '전체') {
      filteredData = filteredData.filter(item => item.company === selectedCompany);
    }
    if (selectedTonerNm !== '전체') {
      filteredData = filteredData.filter(item => item.tonerNm === selectedTonerNm);
    }

    filteredData = filteredData.map((item) => ({
      ...item,
    }));

    setFilteredTonerDetails(filteredData);
  }, [ selectedFloor, selectedTeamNm, selectedLocation, selectedProductNm, selectedModelNm, selectedCompany, selectedTonerNm, tonerDetails ]);  

  const handleAddButtonClick = () => {
    setIsAddModalVisible(true);
  }

  const handleEditButtonClick = async () => {
    if (selectedRows.length === 0) {
      alert('수정할 항목을 선택하세요.');
      return;
    }
    else if (selectedRows.length > 1) {
      alert('수정할 항목을 하나만 선택하세요.');
      return;
    }
    
    try {
      const selectedTonerName = selectedRows[0];
      const response = await axios.get(`/api/toner/manage/${selectedTonerName}`);
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
      for (const mngNum of selectedRows) {
        await axios.delete(`/api/toner/manage/${mngNum}`);  
      }
      alert('선택된 항목이 삭제되었습니다.');

      setTonerDetails(prevDetails => {
        const updatedDetails = prevDetails
          .filter(item => !selectedRows.includes(item.mngNum))
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

  const handleRowClick = (row) => {
    const isChecked = !selectedRows.includes(row.mngNum);
    if (isChecked) {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.mngNum]);
    } else {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.mngNum));
    }
  };

  const handleMouseDown = (index) => {
    dragStartIndex.current = index;
    const mngNum = tonerDetails[index].mngNum;
    if (selectedRows.includes(mngNum)) {
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
        const mngNum = tonerDetails[i].mngNum;
        if (dragMode.current === 'select' && !newSelectedRows.includes(mngNum)) {
          newSelectedRows.push(mngNum);
        } else if (dragMode.current === 'deselect' && newSelectedRows.includes(mngNum)) {
          newSelectedRows = newSelectedRows.filter(id => id !== mngNum);
        }
      }

      setSelectedRows(newSelectedRows);
    }
  };

  const handleMouseUp = () => {
    dragStartIndex.current = null;
    dragEndIndex.current = null;
  };

  const handleExcelDownload = async () => {
    if (selectedRows.length === 0) {
      alert("엑셀 파일로 내보낼 항목을 선택하세요.");
      return;
    }

    try {
      const response = await axios.post(`/api/toner/manage/excel`, selectedRows, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '토너 관리표.xlsx');
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
            setSelectedRows(isChecked ? tonerDetails.map(d => d.mngNum) : []);
          }}
        />
      ),
      accessor: 'select',
      width: '5%',
      Cell: ({ row }) => {
        const mngNum = row?.mngNum || row?.original?.mngNum;
        return (
          <input
            type="checkbox"
            name="detailSelect"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleRowSelect(e, row)}
            checked={mngNum && selectedRows.includes(mngNum)}
          />
        );
      },
    },
    { header: '관리번호', accessor: 'mngNum' },
    { 
      header: (
        <CustomSelect
          label="층"
          options={floorOptions}
          selectedValue={selectedFloor}
          onChangeHandler={(e) => setSelectedFloor(e.target.value)} 
        />
      ), 
      accessor: 'floor' 
    },    
    { 
      header: (
        <CustomSelect
          label="사용부서"
          options={teamOptions}
          selectedValue={selectedTeamNm}
          onChangeHandler={(e) => setSelectedTeamNm(e.target.value)} 
        />
      ), 
      accessor: 'teamNm' 
    },    
    { header: '관리자(정)', accessor: 'manager' },
    { header: '관리자(부)', accessor: 'subManager' },
    { 
      header: (
        <CustomSelect
          label="위치"
          options={locationOptions}
          selectedValue={selectedLocation}
          onChangeHandler={(e) => setSelectedLocation(e.target.value)} 
        />
      ), 
      accessor: 'location' 
    },    
    { 
      header: (
        <CustomSelect
          label="품명"
          options={productOptions}
          selectedValue={selectedProductNm}
          onChangeHandler={(e) => setSelectedProductNm(e.target.value)} 
        />
      ), 
      accessor: 'productNm' 
    },    
    { 
      header: (
        <CustomSelect
          label="모델명"
          options={modelOptions}
          selectedValue={selectedModelNm}
          onChangeHandler={(e) => setSelectedModelNm(e.target.value)} 
        />
      ), 
      accessor: 'modelNm' 
    },    
    { header: 'S/N', accessor: 'sn' },
    { 
      header: (
        <CustomSelect
          label="제조사"
          options={companyOptions}
          selectedValue={selectedCompany}
          onChangeHandler={(e) => setSelectedCompany(e.target.value)} 
        />
      ), 
      accessor: 'company' 
    },    
    { header: '제조년월', accessor: 'manuDate' },
    { 
      header: (
        <CustomSelect
          label="토너(잉크)명"
          options={tonerOptions}
          selectedValue={selectedTonerNm}
          onChangeHandler={(e) => setSelectedTonerNm(e.target.value)} 
        />
      ), 
      accessor: 'tonerNm' 
    },    
    { header: '단가', accessor: 'price' },
  ];

  return (
    <div className='content'>
      <div className='rental-content'>
        <div className="rental-content-inner">
          <h2>토너 관리표</h2>
          <Breadcrumb items={['토너 관리', '토너 관리표']} />
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="rental-tables-section">
                <div className="rental-details-content">
                  <div className="rental-header-buttons">
                    <label className='rental-detail-content-label'>토너 정보&gt;&gt;</label>
                    <div className="rental-detail-buttons">
                      <button className="rental-add-button" onClick={handleAddButtonClick}>추 가</button>
                      <button className="rental-modify-button" onClick={handleEditButtonClick}>수 정</button>
                      <button className="rental-delete-button" onClick={handleDeleteButtonClick}>삭 제</button>
                      <button className="rental-excel-button" onClick={handleExcelDownload}>엑 셀</button>
                    </div>
                  </div>
                  <div className="rental-details-table">
                    <Table
                      columns={detailColumns}
                      data={filteredTonerDetails}
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
      <TonerInfoModal
        show={isAddModalVisible}
        onClose={handleModalClose}
        onSave={handleSave}
        editMode={false}
      />
      <TonerInfoModal
        show={isEditModalVisible}
        onClose={handleModalClose}
        onSave={handleSave}
        editMode={true}
        selectedData={selectedToner}
      />
    </div>
  );
}

export default TonerList;

const getUniqueOptions = (data, key) => {
  const uniqueValues = [...new Set(data.map(item => item[key]))].sort((a, b) => a.localeCompare(b));
  return [{ label: '전체', value: '전체' }, ...uniqueValues.map(value => ({ label: value, value }))];
};
