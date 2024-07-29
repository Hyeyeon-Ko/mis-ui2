import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import StandardAddModal from '../views/StandardAddModal';
import '../styles/StandardData.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 기준자료 페이지 */
function StandardData() {
  const [subCategories, setSubCategories] = useState([]);
  const [details, setDetails] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('A');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('detail');
  const [selectedRows, setSelectedRows] = useState({}); // 수정된 부분
  const [editDetailData, setEditDetailData] = useState(null);

  const categories = [
    { categoryCode: 'A', categoryName: 'A 공통' },
    { categoryCode: 'B', categoryName: 'B 권한' },
  ];

  useEffect(() => {
    fetchSubCategories(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    fetchSubCategories('A');
  }, []);

  const fetchSubCategories = async (classCd) => {
    try {
      console.log('Fetching sub-categories for class:', classCd);
      const response = await axios.get('/api/std/groupInfo', { params: { classCd } });
      const data = response.data.data || [];
      console.log('Sub-categories data:', data);
      setSubCategories(data);
      setSelectedSubCategory('');
      setSubCategoryName('');
      setDetails([]);
    } catch (error) {
      console.error('Error fetching sub-categories:', error.response ? error.response.data : error.message);
      setSubCategories([]);
      setSelectedSubCategory('');
      setSubCategoryName('');
      setDetails([]);
    }
  };

  const fetchDetails = async (groupCd) => {
    try {
      console.log('Fetching details for group:', groupCd);
      const response = await axios.get(`/api/std/detailInfo`, { params: { groupCd } });
      const data = response.data.data || [];
      console.log('Fetched details data:', data); 
      setDetails(data);
    } catch (error) {
      console.error('Error fetching details:', error);
      setDetails([]);
    }
  };

  const handleAddRow = () => {
    setEditDetailData(null);
    setModalMode('detail');
    setShowModal(true);
  };

  const handleSaveRow = async (newRow) => {
    console.log('Saving row:', newRow);
    if (modalMode === 'detail') {
      try {
        await axios.post('/api/std/detailInfo', {
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
        });
        alert('상세 코드가 추가되었습니다.');
        fetchDetails(selectedSubCategory);
      } catch (error) {
        console.error('Error saving detail info:', error);
      }
    } else if (modalMode === 'edit') {
      try {
        await axios.put('/api/std/detailInfo', {
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
        });
        alert('상세 코드가 수정되었습니다.');
        fetchDetails(selectedSubCategory);
      } catch (error) {
        console.error('Error updating detail info:', error);
      }
    } else {
      try {
        await axios.post('/api/std/groupInfo', {
          classCd: newRow.classCode,
          groupCd: newRow.groupCode,
          groupName: newRow.groupName,
        });
        alert('중분류 코드가 추가되었습니다.');
        setSubCategories(prevSubCategories => [
          { groupCd: newRow.groupCode, groupNm: newRow.groupName, classCd: newRow.classCode },
          ...prevSubCategories,
        ]);
      } catch (error) {
        console.error('Error saving group info:', error);
      }
    }
    setShowModal(false);
  };

  const handleAddSubCategoryRow = () => {
    setModalMode('group');
    setShowModal(true);
  };

  const handleEditRow = () => {
    const selectedDetail = Object.keys(selectedRows).find(key => selectedRows[key]);
    if (!selectedDetail) {
      alert('수정할 상세 코드를 하나만 선택하세요.');
      return;
    }
    const detailToEdit = details.find(detail => detail.detailCd === selectedDetail);
    console.log('Editing detail:', detailToEdit);
    setEditDetailData(detailToEdit);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteRow = async () => {
    const selectedDetailCodes = Object.keys(selectedRows).filter(key => selectedRows[key]);
    if (selectedDetailCodes.length === 0) {
      alert('삭제할 상세 코드를 선택하세요.');
      return;
    }
    try {
      console.log('Deleting details:', selectedDetailCodes);
      for (const detailCd of selectedDetailCodes) {
        await axios.delete('/api/std/deleteDetailInfo', {
          params: {
            groupCd: selectedSubCategory,
            detailCd: detailCd,
          },
        });
      }
      alert('상세 코드가 삭제되었습니다.');
      fetchDetails(selectedSubCategory);
      setSelectedRows({});
    } catch (error) {
      console.error('Error deleting detail info:', error);
    }
  };

  const handleSubCategoryClick = (groupCd, groupNm) => {
    console.log('Sub-category clicked:', groupCd, groupNm);
    setSelectedSubCategory(groupCd);
    setSubCategoryName(`${groupCd} ${groupNm}`);
    fetchDetails(groupCd);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelectedRows = details.reduce((acc, detail) => {
        acc[detail.detailCd] = true;
        return acc;
      }, {});
      setSelectedRows(newSelectedRows);
    } else {
      setSelectedRows({});
    }
  };

  const handleRowSelect = (event, detailCd) => {
    setSelectedRows(prevSelectedRows => ({
      ...prevSelectedRows,
      [detailCd]: event.target.checked,
    }));
  };

  const resetModal = () => {
    setShowModal(false);
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
      header: <input type="checkbox" className="detail-checkbox" onChange={handleSelectAll} />,
      accessor: 'select',
      width: '3%',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          className="detail-checkbox"
          checked={!!selectedRows[row.original?.detailCd]}
          onChange={(event) => handleRowSelect(event, row.original?.detailCd)}
        />
      )
    },
    { header: '상세코드', accessor: 'detailCd'},
    { header: '상세명', accessor: 'detailNm'},
    { header: '항목 1', accessor: 'etcItem1'},
    { header: '항목 2', accessor: 'etcItem2'},
    { header: '항목 3', accessor: 'etcItem3'},
    { header: '항목 4', accessor: 'etcItem4'},
    { header: '항목 5', accessor: 'etcItem5'},
    { header: '항목 6', accessor: 'etcItem6'},
  ];

  const getModalTitle = () => {
    if (modalMode === 'detail') {
      return `${subCategoryName} 추가`;
    } else if (modalMode === 'edit') {
      return `${subCategoryName} 수정`;
    } else {
      const selectedCategoryName = categories.find(category => category.categoryCode === selectedCategory)?.categoryName;
      return `${selectedCategoryName} 정보 추가`;
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
              <button className="data-add-button" onClick={handleAddSubCategoryRow}>추 가</button>
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
                <button className="data-add-button" onClick={handleAddRow}>추 가</button>
                <button className="data-modify-button" onClick={handleEditRow}>수 정</button>
                <button className="data-delete-button" onClick={handleDeleteRow}>삭 제</button>
              </div>
            </div>
            {/* <div className='details-table-wrapper'> */}
              <div className="details-table">
                <Table
                  columns={detailColumns}
                  data={details}
                />
              </div>
            {/* </div> */}
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
