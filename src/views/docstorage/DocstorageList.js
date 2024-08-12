import React, { useState, useContext, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
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
  const [deptResponses, setDeptResponses] = useState([]);
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [deptDocstorageResponses, setDeptDocstorageResponses] = useState([]);

  useEffect(() => {
    const fetchDocstorageData = async () => {
      try {
        const response = await axios.get('/api/docstorageList/center', {
          params: { instCd: auth.instCd },
        });

        const { deptResponses, deptDocstorageResponses } = response.data.data;

        setDeptResponses(deptResponses);
        setDeptDocstorageResponses(deptDocstorageResponses);

        if (deptResponses.length > 0) {
          const firstDeptCd = deptResponses[0].detailCd;
          handleDeptClick(firstDeptCd);
        }
      } catch (error) {
        console.error('문서보관 데이터를 불러오는데 실패했습니다.', error);
      }
    };

    if (auth.instCd && selectedCategory === 'B') {
      fetchDocstorageData();
    }
  }, [auth.instCd, selectedCategory]);

  const handleDeptClick = (detailCd) => {
    const selectedDept = deptDocstorageResponses.find(dept => dept.deptCd === detailCd);

    if (selectedDept) {
      const numberedDetails = selectedDept.docstorageResponseDTOList.map((item, index) => ({
        ...item,
        no: index + 1,
      }));
      setDocstorageDetails(numberedDetails);
    } else {
      setDocstorageDetails([]);
    }
  };

  const subCategoryColumns = [
    {
      header: '부서명',
      accessor: 'detailNm',
      width: '100%',
      Cell: ({ row }) => {
        const { detailCd } = row;
        return (
          <div
            className="docstorage-details-table"
            style={{ cursor: 'pointer' }}
            onClick={() => handleDeptClick(detailCd)}
          >
            <span>{row.detailNm}</span>
          </div>
        );
      }
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
                      data={deptResponses}
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
                        <button className="docstorage-modify-button">수 정</button>
                        <button className="docstorage-delete-button">삭 제</button>
                        <button className="docstorage-excel-button">엑 셀</button>
                    </div>
                  )}
                </div>
                <div className="docstorage-details-table">
                  <Table
                    columns={detailColumns}
                    data={docstorageDetails}
                  />
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default DocstorageList;
