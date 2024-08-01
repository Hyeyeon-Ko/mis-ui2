import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import StandardAddModal from '../views/StandardAddModal';
import '../styles/StandardData.css';
import '../styles/common/Page.css';
import axios from 'axios';

function StandardData() {
  const [subCategories, setSubCategories] = useState([]);
  const [details, setDetails] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('A');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('detail');
  const [editDetailData, setEditDetailData] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const categories = [
    { categoryCode: 'A', categoryName: 'A 공통' },
    { categoryCode: 'B', categoryName: 'B 권한' },
  ];

  useEffect(() => {
    fetchSubCategories(selectedCategory);
    setSelectedDetail(null);
  }, [selectedCategory]);

  const fetchSubCategories = async (classCd) => {
    try {
      const response = await axios.get('/api/std/groupInfo', { params: { classCd } });
      const data = response.data.data || [];
      data.sort((a, b) => parseInt(a.groupCd, 10) - parseInt(b.groupCd, 10));
      setSubCategories(data);
      setSelectedSubCategory('');
      setSubCategoryName('');
      setDetails([]);
      setSelectedDetail(null);
    } catch (error) {
      console.error('Error fetching sub-categories:', error.response ? error.response.data : error.message);
      setSubCategories([]);
      setSelectedSubCategory('');
      setSubCategoryName('');
      setDetails([]);
      setSelectedDetail(null);
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
        console.error('Unexpected data format:', data);
        setDetails([]);
      }
      setSelectedDetail(null);
    } catch (error) {
      console.error('Error fetching details:', error);
      setDetails([]);
      setSelectedDetail(null);
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
      console.error('Error fetching selected detail:', error);
      alert('상세 정보 가져오기에 실패했습니다.');
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
    if (!selectedDetail) {
      alert('수정할 상세 코드를 선택하세요.');
      return;
    }
    fetchSelectedDetail(selectedSubCategory, selectedDetail);
  };

  const handleSaveRow = async (newRow) => {
    if (modalMode === 'detail') {
      console.log('Saving new detail with the following data:', {
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
        setShowModal(false);
        setSelectedDetail(null);
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          alert('해당 중분류그룹에 이미 존재하는 상세코드 입니다');
        } else {
          console.error('Error saving detail info:', error);
        }
      }
    } else if (modalMode === 'edit') {
      try {
        await axios.put('/api/std/detailInfo', {
          groupCd: selectedSubCategory,
          detailCd: newRow.detailCode,
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
        setShowModal(false);
        setSelectedDetail(null);
      } catch (error) {
        console.error('Error updating detail info:', error);
        alert('상세 코드 수정에 실패했습니다.');
      }
    } else if (modalMode === 'group') {
      try {
        await axios.post('/api/std/groupInfo', {
          classCd: newRow.classCd,
          groupCd: newRow.groupCd,
          groupNm: newRow.groupNm,
        });
        alert('중분류 코드가 추가되었습니다.');
        fetchSubCategories(selectedCategory);
        setShowModal(false);
      } catch (error) {
        console.error('Error saving group info:', error);
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
    setSelectedDetail(null);
  };

  const resetModal = () => {
    setShowModal(false);
  };

  const handleDetailSelect = (detailCd) => {
    setSelectedDetail(detailCd);
  };

  const handleDeleteRow = async () => {
    if (!selectedDetail) {
      alert('삭제할 상세 코드를 선택하세요.');
      return;
    }

    try {
      await axios.put('/api/std/deleteDetailInfo', null, {
        params: { groupCd: selectedSubCategory, detailCd: selectedDetail }
      });
      alert('상세 코드가 삭제되었습니다.');
      fetchDetails(selectedSubCategory); 
      setSelectedDetail(null);
    } catch (error) {
      console.error('Error deleting detail:', error);
      alert('상세 코드 삭제에 실패했습니다.');
    }
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
      header: '선택',
      accessor: 'select',
      width: '5%',
      Cell: ({ row }) => {
        const detailCd = row?.original?.detailCd || row?.detailCd; 
        if (!detailCd) {
          console.warn('Missing detailCd:', row);
          return null;
        }
        return (
          <input
            type="radio"
            name="detailSelect"
            checked={selectedDetail === detailCd}
            onChange={() => handleDetailSelect(detailCd)}
          />
        );
      },
    },
    { header: '상세코드', accessor: 'detailCd' },
    { header: '상세명', accessor: 'detailNm' },
    { header: '항목 1', accessor: 'etcItem1' },
    { header: '항목 2', accessor: 'etcItem2' },
    { header: '항목 3', accessor: 'etcItem3' },
    { header: '항목 4', accessor: 'etcItem4' },
    { header: '항목 5', accessor: 'etcItem5' },
    { header: '항목 6', accessor: 'etcItem6' },
  ];

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
                <button className="data-modify-button" onClick={handleModifyRow}>수 정</button>
                <button className="data-delete-button" onClick={handleDeleteRow}>삭 제</button>
              </div>
            </div>
              <div className="details-table">
                <Table
                  columns={detailColumns}
                  data={details}
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
