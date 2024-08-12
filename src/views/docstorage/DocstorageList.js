import React, { useState, useEffect, useContext } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import DocstorageAddModal from '../../views/docstorage/DocstorageAddModal'; 
import '../../styles/common/Page.css';
import '../../styles/DocstorageList.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';

function DocstorageList() {
  const { auth } = useContext(AuthContext);
  const categories = [
    { categoryCode: 'A', categoryName: '승인대기 내역' },
    { categoryCode: 'B', categoryName: '문서보관 내역' },
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0].categoryCode);
  const [docstorageData, setDocstorageData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/docstorageList', {
          params: { userId: auth.userId },
        });
        const numberedData = response.data.data.map((item, index) => ({
          ...item,
          no: index + 1,
        }));
        setDocstorageData(numberedData);
      } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다.', error);
      }
    };
    if (auth.userId) {
      fetchData();
    }
  }, [auth.userId]);

  const subCategoryColumns = [
    {
      header: '부서명',
      accessor: 'deptNm',
      width: '100%',
    },
  ];

  const detailColumns = [
    ...(selectedCategory === 'B' ? [
      {
        header: (
          <input
            type="checkbox"
          />
        ),
        accessor: 'select',
        width: '5%',
        Cell: () => (
          <input
            type="checkbox"
            name="detailSelect"
          />
        ),
      }
    ] : []),
    { header: 'NO', accessor: 'no' },
    { header: '팀 명', accessor: 'teamNm' },
    { header: '문서관리번호', accessor: 'docId' },
    { header: '입고위치', accessor: 'location' },
    { header: '문서명', accessor: 'docNm' },
    { header: '관리자(정)', accessor: 'manager' },
    { header: '관리자(부)', accessor: 'subManager' },
    { header: '보존연한', accessor: 'storageYear' },
    { header: '생성일자', accessor: 'createDate' },
    { header: '이관일자', accessor: 'transferDate' },
    { header: '기안번호', accessor: 'tsdNum' }, 
    { header: '폐기일자', accessor: 'disposalDate' }, 
    { header: '기안번호', accessor: 'dpdraftNum' }, 
  ];

  const mappedSubCategories = categories.map(subCategory => ({
    ...subCategory,
    onClick: () => {},
    isSelected: false,
  }));

  const isApprovalPending = selectedCategory === 'A';

  const handleSave = (newData) => {
    // Handle saving the new data here
    console.log(newData);
    setShowAddModal(false); // Close the modal after saving
  };

  return (
    <div className='content'>
      <div className="docstorage-content">
        <div className='docstorage-content-inner'>
            <h2>문서보관 목록표</h2>
            <Breadcrumb items={['자산 및 문서 관리', '문서보관 목록표']} />
            <div className="docstorage-category-section">
              <div className="docstorage-category">
                <label htmlFor="category" className="docstorage-category-label">내 역&gt;&gt;</label>
                <select
                id="category"
                className="docstorage-category-dropdown"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                >
                {categories.map(category => (
                    <option key={category.categoryCode} value={category.categoryCode}>
                    {category.categoryName}
                    </option>
                ))}
                </select>
              </div>
            </div>
            <div className="docstorage-tables-section">
              {!isApprovalPending && (
                <div className="docstorage-sub-category-section">
                  <div className="docstorage-header-buttons">
                    <label className='docstorage-sub-category-label'>부 서&gt;&gt;</label>
                  </div>
                  <div className="docstorage-sub-category-table">
                    <Table
                      columns={subCategoryColumns}
                      data={mappedSubCategories}
                    />
                  </div>
                </div>
              )}
              <div className="docstorage-details-content">
                <div className="docstorage-header-buttons">
                  <label className='docstorage-detail-content-label'>
                    {isApprovalPending ? '승인대기 내역' : '문서보관 내역'}&gt;&gt;
                  </label>
                  {!isApprovalPending && (
                    <div className="docstorage-detail-buttons">
                        <button className="docstorage-add-button" onClick={() => setShowAddModal(true)}>추 가</button>
                        <button className="docstorage-modify-button">수 정</button>
                        <button className="docstorage-delete-button">삭 제</button>
                        <button className="docstorage-excel-button">엑 셀</button>
                    </div>
                  )}
                </div>
                <div className="docstorage-details-table">
                  <Table
                    columns={detailColumns}
                    data={docstorageData} 
                  />
                </div>
              </div>
            </div>
        </div>
      </div>
      <DocstorageAddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default DocstorageList;
