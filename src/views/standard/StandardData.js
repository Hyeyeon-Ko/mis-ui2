import React, { useEffect, useState, useContext, useRef } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import StandardAddModal from '../standard/StandardAddModal';
import '../../styles/standard/StandardData.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import useStandardChange from '../../hooks/useStandardChange';

function StandardData() {
  const {selectedDetails, details, setSelectedDetails,setDetails, handleDetailSelect, handleSelectAll} = useStandardChange();
  const [subCategories, setSubCategories] = useState([]);
  const [headerData, setHeaderData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('A');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('detail');
  const [editDetailData, setEditDetailData] = useState(null);
  const { auth } = useContext(AuthContext);

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  const categories = [
    { categoryCode: 'A', categoryName: 'A 공통' },
    { categoryCode: 'B', categoryName: 'B 권한' },
    { categoryCode: 'C', categoryName: 'C 인사정보' },
  ];

  useEffect(() => {
    fetchSubCategories(selectedCategory);
    setSelectedDetails([]);
     // eslint-disable-next-line
  }, [selectedCategory]);

  const fetchSubCategories = async (classCd) => {
    try {
      const response = await axios.get(`/api/std/groupInfo`, { params: { classCd } });
      const data = response.data.data || [];
      data.sort((a, b) => parseInt(a.groupCd, 10) - parseInt(b.groupCd, 10));
      setSubCategories(data);
      setSelectedSubCategory('');
      setSubCategoryName('');
      setDetails([]);
      setSelectedDetails([]);
    } catch (error) {
      console.error('중분류를 가져오는 중 에러 발생:', error.response ? error.response.data : error.message);
      setSubCategories([]);
      setSelectedSubCategory('');
      setSubCategoryName('');
      setDetails([]);
      setSelectedDetails([]);
    }
  };

  const fetchDetails = async (groupCd) => {
    try {
      const response = await axios.get(`/api/std/detailInfo`, { params: { groupCd } });
      const data = response.data.data || [];
      if (Array.isArray(data)) {
        data.sort((a, b) => parseInt(a.detailCd, 10) - parseInt(b.detailCd, 10));
        setDetails(data);
      } else {
        console.error('예상치 못한 데이터 형식:', data);
        setDetails([]);
      }
      setSelectedDetails([]);
    } catch (error) {
      console.error('상세 정보를 가져오는 중 에러 발생:', error);
      setDetails([]);
      setSelectedDetails([]);
    }
  };

  const fetchSelectedDetail = async (groupCd, detailCd) => {
    try {
      const response = await axios.get(`/api/std/detailInfo/${detailCd}`, { params: { groupCd } });
      const detailData = response.data.data;
      setEditDetailData(detailData);
      setModalMode('edit');
      setShowModal(true);
    } catch (error) {
      console.error('선택된 상세 정보를 가져오는 중 에러 발생:', error);
      alert('상세 정보 가져오기에 실패했습니다.');
    }
  };

  const fetchHeaderData = async (groupCd) => {
    try {
      const response = await axios.get(`/api/std/header`, { params: { groupCd } });
      const headerData = response.data.data[0] || {};
      setHeaderData(headerData);
    } catch (error) {
      console.error('헤더 정보를 가져오는 중 에러 발생:', error);
    }
  };

  const handleAddRow = () => {
    if (!selectedSubCategory) {
      alert('중분류 코드를 선택하세요.');
      return;
    }

    setEditDetailData(null);
    setModalMode('detail');
    setShowModal(true);
  };

  const handleModifyRow = () => {
    if (selectedDetails.length !== 1) {
      alert('수정할 상세 코드를 하나만 선택하세요.');
      return;
    }
    fetchSelectedDetail(selectedSubCategory, selectedDetails[0]);
  };

  const handleSaveRow = async (newRow) => {
    if (modalMode === 'detail') {
      try {
        await axios.post(`/api/std/detailInfo`, {
          detailCd: newRow.detailCode,
          groupCd: selectedSubCategory,
          detailNm: newRow.detailName,
          fromDd: '',
          toDd: '',
          etcItem1: newRow.items[0],
          etcItem2: newRow.items[1],
          etcItem3: newRow.items[2],
          etcItem4: newRow.items[3],
          etcItem5: newRow.items[4],
          etcItem6: newRow.items[5],
          etcItem7: newRow.items[6],
          etcItem8: newRow.items[7],
          etcItem9: newRow.items[8],
          etcItem10: newRow.items[9],
          etcItem11: newRow.items[10],
        });
        alert('상세 코드가 추가되었습니다.');
        fetchDetails(selectedSubCategory);
        setShowModal(false);
        setSelectedDetails([]);
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          alert('해당 중분류 그룹에 이미 존재하는 상세 코드입니다.');
        } else {
          console.error('상세 정보를 저장하는 중 에러 발생:', error);
        }
      }
    } else if (modalMode === 'edit') {
      try {
        const oriDetailCd = selectedDetails[0];
        await axios.put(`/api/std/detailInfo`, {
          detailCd: newRow.detailCode,
          groupCd: selectedSubCategory,
          detailNm: newRow.detailName,
          fromDd: '',
          toDd: '',
          etcItem1: newRow.items[0],
          etcItem2: newRow.items[1],
          etcItem3: newRow.items[2],
          etcItem4: newRow.items[3],
          etcItem5: newRow.items[4],
          etcItem6: newRow.items[5],
          etcItem7: newRow.items[6],
          etcItem8: newRow.items[7],
          etcItem9: newRow.items[8],
          etcItem10: newRow.items[9],
          etcItem11: newRow.items[10],
        }, {
          params: { oriDetailCd }
        });
        alert('상세 코드가 수정되었습니다.');
        fetchDetails(selectedSubCategory);
        setShowModal(false);
        setSelectedDetails([]);
      } catch (error) {
        console.error('상세 정보를 업데이트하는 중 에러 발생:', error);
        alert('상세 코드 수정에 실패했습니다.');
      }
    } else if (modalMode === 'group') {
      try {
        await axios.post(`/api/std/groupInfo`, {
          classCd: newRow.classCd,
          groupCd: newRow.groupCd,
          groupNm: newRow.groupNm,
        });
        alert('중분류 코드가 추가되었습니다.');
        fetchSubCategories(selectedCategory);
        setShowModal(false);
      } catch (error) {
        console.error('중분류 정보를 저장하는 중 에러 발생:', error);
        alert('중분류 코드 추가에 실패했습니다.');
      }
    }
  };

  const handleAddSubCategoryRow = () => {
    setModalMode('group');
    setShowModal(true);
  };

  const handleSubCategoryClick = (groupCd, groupNm) => {
    setSelectedSubCategory(groupCd);
    setSubCategoryName(`${groupCd} ${groupNm}`);
    fetchDetails(groupCd);
    fetchHeaderData(groupCd);
    setSelectedDetails([]);
  };

  const resetModal = () => {
    setShowModal(false);
  };


  const handleRowClick = (row) => {
    const detailCd = row.detailCd;
    handleDetailSelect(detailCd);
  };

  const handleDeleteRow = async () => {
    if (selectedDetails.length === 0) {
      alert('삭제할 상세 코드를 선택하세요.');
      return;
    }

    try {
      for (const detailCd of selectedDetails) {
        await axios.put(`/api/std/deleteDetailInfo`, null, {
          params: { groupCd: selectedSubCategory, detailCd }
        });
      }
      alert('상세 코드가 삭제되었습니다.');
      fetchDetails(selectedSubCategory);
      setSelectedDetails([]);
    } catch (error) {
      console.error('상세 정보를 삭제하는 중 에러 발생:', error);
      alert('상세 코드 삭제에 실패했습니다.');
    }
  };

  const handleMouseDown = (rowIndex) => {
    dragStartIndex.current = rowIndex;

    const detailCd = details[rowIndex]?.detailCd;
    if (selectedDetails.includes(detailCd)) {
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

      let newSelectedDetails = [...selectedDetails];

      for (let i = start; i <= end; i++) {
        const detailCd = details[i]?.detailCd;
        if (dragMode.current === 'select' && !newSelectedDetails.includes(detailCd)) {
          newSelectedDetails.push(detailCd); 
        } else if (dragMode.current === 'deselect' && newSelectedDetails.includes(detailCd)) {
          newSelectedDetails = newSelectedDetails.filter(id => id !== detailCd); 
        }
      }

      setSelectedDetails(newSelectedDetails);
    }
  };

  const handleMouseUp = () => {
    dragStartIndex.current = null;
    dragEndIndex.current = null;
  };

  const mappedSubCategories = subCategories.map(subCategory => ({
    ...subCategory,
    onClick: () => handleSubCategoryClick(subCategory.groupCd, subCategory.groupNm),
    isSelected: subCategory.groupCd === selectedSubCategory,
  }));

  const subCategoryColumns = [
    {
      header: '분류 코드',
      accessor: 'groupNm',
      width: '100%',
      Cell: ({ row }) => (
        <div
          className={`details-table ${row.isSelected ? 'selected-sub-category' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={() => row.onClick(row.groupCd, row.groupNm)}
        >
          <span className={row.isSelected ? 'selected-sub-category-text' : ''}>
            {row.groupCd} {row.groupNm}
          </span>
        </div>
      )
    },
  ];

  const detailColumns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={selectedDetails.length === details.length}
        />
      ),
      accessor: 'select',
      width: '5%',
      Cell: ({ row }) => {
        const detailCd = row?.original?.detailCd || row?.detailCd;
        if (!detailCd) {
          console.warn('상세 코드가 누락됨:', row);
          return null;
        }
        return (
          <input
            type="checkbox"
            name="detailSelect"
            checked={selectedDetails.includes(detailCd)}
            onClick={(e) => e.stopPropagation()}
            onChange={() => handleDetailSelect(detailCd)}
          />
        );
      },
    },
    { header: headerData.detailNm || '', accessor: 'detailCd' },
    { header: headerData.etcItem1 || '', accessor: 'detailNm' },
    { header: headerData.etcItem2 || '', accessor: 'etcItem1' },
    { header: headerData.etcItem3 || '', accessor: 'etcItem2' },
    { header: headerData.etcItem4 || '', accessor: 'etcItem3' },
    { header: headerData.etcItem5 || '', accessor: 'etcItem4' },
    { header: headerData.etcItem6 || '', accessor: 'etcItem5' },
    { header: headerData.etcItem7 || '', accessor: 'etcItem6' },
    { header: headerData.etcItem8 || '', accessor: 'etcItem7' },
    { header: headerData.etcItem9 || '', accessor: 'etcItem8' },
    { header: headerData.etcItem10 || '', accessor: 'etcItem9' },
    { header: headerData.etcItem11 || '', accessor: 'etcItem10' },
    selectedSubCategory === 'A000' && { header: '항목10', accessor: 'etcItem11' },
  ].filter(Boolean);
    
  const getModalTitle = () => {
    if (modalMode === 'detail') {
      return `${subCategoryName} 추가`;
    } else if (modalMode === 'group') {
      return `중분류 추가`;
    } else {
      return `상세 정보 수정`;
    }
  };

  return (
    <div className="content">
      <div className='standard-data-content'>
        <h2>기준 자료</h2>
        <Breadcrumb items={['기준자료']} />
        <div className="category-section">
          <div className="category">
            <label htmlFor="category" className="category-label">대분류 코드&gt;&gt;</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="category-dropdown"
            >
              {categories.map(category => (
                <option key={category.categoryCode} value={category.categoryCode}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="tables-section">
          <div className="sub-category-section">
            <div className="header-buttons">
              <label className='sub-category-label'>중분류 코드&gt;&gt;</label>
              <button className="data-add-button" onClick={handleAddSubCategoryRow} disabled={!auth.hasStandardDataAuthority}>추 가</button>
            </div>
            <div className="sub-category-table">
              <Table
                columns={subCategoryColumns}
                data={mappedSubCategories}
              />
            </div>
          </div>
          <div className="details-content">
            <div className="header-buttons">
              <label className='detail-content-label'>상세 코드&gt;&gt;</label>
              <div className="detail-buttons">
                <button className="data-add-button" onClick={handleAddRow} disabled={!auth.hasStandardDataAuthority}>추 가</button>
                <button className="data-modify-button" onClick={handleModifyRow} disabled={!auth.hasStandardDataAuthority}>수 정</button>
                <button className="data-delete-button" onClick={handleDeleteRow} disabled={!auth.hasStandardDataAuthority}>삭 제</button>
              </div>
            </div>
            <div className="details-table">
              <Table
                columns={detailColumns}
                data={details}
                onRowClick={handleRowClick}  
                onRowMouseDown={handleMouseDown}  
                onRowMouseOver={handleMouseOver}  
                onRowMouseUp={handleMouseUp}    
              />
            </div>
          </div>
        </div>
      </div>
      <StandardAddModal
        show={showModal}
        onClose={resetModal}
        onSave={handleSaveRow}
        mode={modalMode}
        title={getModalTitle()}
        selectedCategory={selectedCategory}
        detailData={editDetailData} 
      />
    </div>
  );
}

export default StandardData;
