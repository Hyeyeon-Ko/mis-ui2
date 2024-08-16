import React, { useState, useContext, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import '../../styles/common/Page.css';
import '../../styles/docstorage/DocstorageList.css';
import ConfirmModal from '../../components/common/ConfirmModal';
import DocstorageUpdateModal from '../../views/docstorage/DocstorageUpdateModal'; // Import the modal
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';

function DocstorageList() {
  const { auth } = useContext(AuthContext);
  const categories = [
    { categoryCode: 'A', categoryName: '승인대기 내역' },
    { categoryCode: 'B', categoryName: '문서보관 내역' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('A'); 
  const [deptResponses, setDeptResponses] = useState([]);
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [deptDocstorageResponses, setDeptDocstorageResponses] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false); // For the edit modal
  const [selectedDoc, setSelectedDoc] = useState(null); // For the selected document
  const [pendingApproval, setPendingApproval] = useState(null);

  useEffect(() => {
    const fetchDocstorageData = async () => {
      try {
        let response;
        if (selectedCategory === 'A') {
          response = await axios.get('/api/docstorageList/pending', {
            params: { instCd: '100' }, 
          });
        } else if (selectedCategory === 'B') {
          response = await axios.get('/api/docstorageList/center', {
            params: { instCd: auth.instCd },
          });

          const { deptResponses, deptDocstorageResponses } = response.data.data;
          setDeptResponses(deptResponses);
          setDeptDocstorageResponses(deptDocstorageResponses);

          if (deptResponses.length > 0) {
            const firstDeptCd = deptResponses[0].detailCd;
            handleDeptClick(firstDeptCd);
          }
        }

        if (response && response.data) {
          const pendingList = response.data.data;
          const numberedDetails = pendingList.map((item, index) => ({
            ...item,
            no: index + 1,
            typeDisplay: item.type === 'A' ? '이관' : item.type === 'B' ? '파쇄' : '',
          }));
          setDocstorageDetails(numberedDetails);
        }
      } catch (error) {
        console.error('문서보관 데이터를 불러오는데 실패했습니다.', error);
      }
    };

    if (auth.instCd) {
      fetchDocstorageData();
    }
  }, [auth.instCd, selectedCategory]);

  const handleDeptClick = (detailCd) => {
    const selectedDept = deptDocstorageResponses.find(dept => dept.deptCd === detailCd);

    if (selectedDept) {
      const numberedDetails = selectedDept.docstorageResponseDTOList.map((item, index) => ({
        ...item,
        no: index + 1,
        typeDisplay: item.type === 'A' ? '이관' : item.type === 'B' ? '파쇄' : '',
      }));
      setDocstorageDetails(numberedDetails);
    } else {
      setDocstorageDetails([]);
    }
  };

  const handleRowSelect = (e, row) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.detailId]);
    } else {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.detailId));
    }
  };

  const handleEdit = async () => {
    if (selectedRows.length === 0) {
      setSelectedDoc(null);
      setShowEditModal(true);
      return;
    } else if (selectedRows.length !== 1) {
      alert("수정할 항목을 하나만 선택하세요.");
      return;
    }

    const detailId = selectedRows[0];
    const selectedDoc = docstorageDetails.find(doc => doc.detailId === detailId);

    try {
      const response = await axios.get('/api/docstorage/', { params: { detailId } });
      const data = response.data.data;
      setSelectedDoc({ ...data, detailId }); 
      setShowEditModal(true);
    } catch (error) {
      console.error('문서보관 정보를 가져오는 중 에러 발생:', error);
      alert('수정할 항목을 불러오지 못했습니다.');
    }
  };

  const handleUpdate = async (updatedData, isFileUpload = false) => {
    try {
      let url;
      let payload;

      if (isFileUpload) {
        url = '/api/docstorage/update';
        payload = updatedData;
      } else {
        const { detailId, ...updatePayload } = updatedData;
        url = `/api/docstorage/?detailId=${detailId}`;
        payload = updatePayload;
      }

      const response = await axios.put(url, payload);

      if (response.status === 200) {
        if (!isFileUpload) {
          setDocstorageDetails(prevDetails =>
            prevDetails.map(doc =>
              doc.detailId === updatedData.detailId ? { ...doc, ...updatedData } : doc
            )
          );
        }
        setShowEditModal(false);
        alert('수정이 완료되었습니다.');
      }
    } catch (error) {
      console.error('문서보관 정보를 수정하는 중 에러 발생:', error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      alert("삭제할 항목을 선택하세요.");
      return;
    }
  
    try {
      for (const detailId of selectedRows) {
        await axios.delete('/api/docstorage/', {
          params: { detailId }
        });
      }
      alert('선택된 항목이 삭제되었습니다.');
  
      setDocstorageDetails(prevDetails => {
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
      console.error('문서보관 정보를 삭제하는 중 에러 발생:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.post('/api/docstorage/excel', selectedRows, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '문서보관 목록표.xlsx'); 
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('엑셀 파일 다운로드 중 오류 발생:', error);
    }
  };

  const showConfirm = () => {
    setPendingApproval('approve'); 
    setShowConfirmModal(true); 
  };

  const handleConfirmModal = async () => {
    if (pendingApproval === 'approve') {
      try {
        const draftIds = docstorageDetails.map(detail => detail.draftId);
    
        if (draftIds.length === 0) {
          alert('승인할 문서가 없습니다.');
          return;
        }
    
        await axios.put('/api/docstorage/approve', draftIds);
        alert('모든 문서가 승인되었습니다.');
        setDocstorageDetails([]); 
      } catch (error) {
        console.error('승인 처리 중 오류 발생:', error);
        alert('승인 처리 중 오류가 발생했습니다.');
      }
    }

    setShowConfirmModal(false); 
    setPendingApproval(null); 
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false); 
    setPendingApproval(null); 
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
            onChange={(e) => {
              const isChecked = e.target.checked;
              setSelectedRows(isChecked ? docstorageDetails.map(d => d.detailId) : []);
            }}
          />
        ),
        accessor: 'select',
        width: '5%',
        Cell: ({ row }) => (
          <input
            type="checkbox"
            name="detailSelect"
            onChange={(e) => handleRowSelect(e, row)}
            checked={selectedRows.includes(row.detailId)}
          />
        ),
      }
    ] : []),
    { header: 'NO', accessor: 'no' },
    ...(selectedCategory === 'A' ? [{ header: '분류', accessor: 'typeDisplay' }] : []),
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
              {selectedCategory !== 'A' && (
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
                    {selectedCategory === 'A' ? '승인대기 내역' : '문서보관 내역'}&gt;&gt;
                  </label>
                  {selectedCategory === 'B' && (
                    <div className="docstorage-detail-buttons">
                        <button className="docstorage-modify-button" onClick={handleEdit}>수 정</button>
                        <button className="docstorage-delete-button" onClick={handleDelete}>삭 제</button>
                        <button className="docstorage-excel-button" onClick={downloadExcel}>엑 셀</button>
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
            {selectedCategory === 'A' && (
              <div className="docstorage-approve-section">
                <button className="custom-button docstorage-approve-button" onClick={showConfirm}>승 인</button>
              </div>
            )}
            {showConfirmModal && (
              <ConfirmModal
                message="승인하시겠습니까?"
                onConfirm={handleConfirmModal}
                onCancel={handleCloseModal}
              />
            )}
            {showEditModal && (
              <DocstorageUpdateModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                docData={selectedDoc} 
                onSave={handleUpdate}
              />
            )}
        </div>
      </div>
    </div>
  );
}

export default DocstorageList;
