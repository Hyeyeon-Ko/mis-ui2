import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import DocstorageUpdateModal from './DocstorageUpdateModal'; 
import DocstorageBulkUpdateModal from './DocstorageBulkUpdateModal'; 
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import StatusSelect from '../../components/StatusSelect';  
import '../../styles/common/Page.css';
import '../../styles/docstorage/DocstorageList.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function DocstorageList() {
  const { auth } = useContext(AuthContext);
  const categories = [
    { categoryCode: 'B', categoryName: '문서보관 내역' },
    { categoryCode: 'A', categoryName: '승인대기 내역' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('B'); 
  const [deptResponses, setDeptResponses] = useState([]);
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [selectedDoc, setSelectedDoc] = useState(null); 
  const [pendingApproval, setPendingApproval] = useState(null);
  const [selectedDeptCd, setSelectedDeptCd] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [showBulkEditModal, setShowBulkEditModal] = useState(false); 

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  const statusOptions = [
    { label: '전체', value: '전체' },
    { label: '승인완료', value: '승인완료' },
    { label: '처리완료', value: '처리완료' },
  ];

  const fetchDeptList = useCallback(async () => {
    try {
      const response = await axios.get(`/api/docstorageList/deptList`, {
        params: { instCd: auth.instCd },
      });
      setDeptResponses(response.data.data);
    } catch (error) {
      console.error('부서 리스트를 불러오는데 실패했습니다.', error);
    }
  }, [auth.instCd]);

  const fetchPendingApprovalList = useCallback(async () => {
    try {
      const response = await axios.get(`/api/docstorageList/pending`, {
        params: { instCd: auth.instCd },
      });
      const pendingList = response.data.data;
      const numberedDetails = pendingList.map((item, index) => ({
        ...item,
        no: index + 1,
        typeDisplay: item.type === 'A' ? '이관' : item.type === 'B' ? '파쇄' : '',
        status: item.status === 'B' ? '승인완료' : item.status === 'E' ? '처리완료' : item.status, 
      }));
      setDocstorageDetails(numberedDetails);
      setSelectedRows([]);
    } catch (error) {
      console.error('승인대기 내역을 불러오는데 실패했습니다.', error);
    }
  }, [auth.instCd]);
  
  const fetchDocstorageData = useCallback(async (deptCd) => {
    try {
      const response = await axios.get(`/api/docstorageList/center`, {
        params: { deptCd },
      });
      const numberedDetails = response.data.data.map((item, index) => ({
        ...item,
        no: index + 1,
        typeDisplay: item.type === 'A' ? '이관' : item.type === 'B' ? '파쇄' : '',
        status: item.status === 'B' ? '승인완료' : item.status === 'E' ? '처리완료' : item.status,
      }));
      setDocstorageDetails(numberedDetails);
      setSelectedRows([]);
    } catch (error) {
      console.error('문서보관 내역을 불러오는데 실패했습니다.', error);
    }
  }, []);

  const fetchTotalDeptData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/docstorageList/totalDept`, {
        params: { instCd: auth.instCd }, 
      });
      const totalDeptData = response.data.data.map((item, index) => ({
        ...item,
        no: index + 1,
        typeDisplay: item.type === 'A' ? '이관' : item.type === 'B' ? '파쇄' : '',
        status: item.status === 'B' ? '승인완료' : item.status === 'E' ? '처리완료' : item.status,
      }));
      setDocstorageDetails(totalDeptData);
      setSelectedRows([]);
    } catch (error) {
      console.error('전체 부서 데이터를 불러오는데 실패했습니다.', error);
    }
  }, [auth.instCd]);

  useEffect(() => {
    if (auth.instCd) {
      if (selectedCategory === 'A') {
        fetchPendingApprovalList();
      } else if (selectedDeptCd) {
        fetchDocstorageData(selectedDeptCd);
      } else {
        fetchTotalDeptData(); 
        fetchDeptList();      
      }
    }
  }, [auth.instCd, selectedCategory, selectedDeptCd, fetchDocstorageData, fetchDeptList, fetchPendingApprovalList, fetchTotalDeptData]);

  const handleDeptChange = (e) => {
    const deptCd = e.target.value;
    setSelectedDeptCd(deptCd);
    setSelectedRows([]);

    if (deptCd) {
      fetchDocstorageData(deptCd); 
    } else {
      fetchTotalDeptData(); 
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

  const handleMouseDown = (index) => {
    dragStartIndex.current = index;

    const detailId = docstorageDetails[index].detailId;
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
        const detailId = docstorageDetails[i].detailId;
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

  const handleEdit = async () => {
    if (selectedRows.length === 0) {
      setSelectedDoc(null);
      setShowEditModal(true);
      return;
    } else if (selectedRows.length === 1) {
      const detailId = selectedRows[0];
      const selectedDoc = docstorageDetails.find(doc => doc.detailId === detailId);
  
      if (selectedDoc.type === 'B' && selectedDoc.status === 'E') {
        alert("파쇄 완료된 문서는 수정이 불가합니다.");
        return;
      }
  
      try {
        const response = await axios.get(`/api/docstorage/`, { params: { detailId } });
        const data = response.data.data;
        setSelectedDoc({ ...data, detailId });
        setShowEditModal(true);
      } catch (error) {
        console.error('문서보관 정보를 가져오는 중 에러 발생:', error);
        alert('수정할 항목을 불러오지 못했습니다.');
      }
    } else if (selectedRows.length > 1) {
      setShowBulkEditModal(true); 
    }
  };
  
  const handleBulkUpdate = async (payload) => {
    try {
      const response = await axios.put(`/api/docstorage/bulkUpdate`, payload);
      if (response.status === 200) {
        alert('일괄 수정이 완료되었습니다.');
        setShowBulkEditModal(false);
        fetchDocstorageData(selectedDeptCd); 
        setSelectedRows([]);
      }
    } catch (error) {
      console.error('문서 일괄 수정 중 오류 발생:', error);
      alert('일괄 수정에 실패했습니다.');
    }
  };  

  const handleUpdate = async (updatedData, isFileUpload = false) => {
    try {
        if (isFileUpload) {
            const response = await axios.post(`/api/docstorage/update`, updatedData);
            if (response.status === 200) {
                alert('수정이 완료되었습니다.');
                setShowEditModal(false);
                fetchDocstorageData(selectedDeptCd); 
                setSelectedRows([]);
            }
        } else {
            const { detailId } = selectedDoc; 
            const response = await axios.put(`/api/docstorage/`, updatedData, {
                params: { detailId } 
            });
            if (response.status === 200) {
                alert('수정이 완료되었습니다.');
                setShowEditModal(false);
                fetchDocstorageData(selectedDeptCd); 
                setSelectedRows([]);
            }
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            alert("존재하지 않는 문서관리번호가 존재합니다"); 
        } else {
            console.error('문서보관 정보를 수정하는 중 에러 발생:', error);
            alert('수정에 실패했습니다.');
        }
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.post(`/api/docstorage/excel`, selectedRows, {
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
    
        await axios.put(`/api/docstorage/approve`, draftIds);
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

  const handleFinish = async () => {
    const selectedDetailIds = docstorageDetails
      .filter(detail => selectedRows.includes(detail.detailId)) 
      .map(detail => detail.detailId);
  
    if (selectedDetailIds.length === 0) {
      alert('완료할 문서를 선택하세요.');
      return;
    }
  
    try {
      const response = await axios.post(`/api/docstorage/finish`, selectedDetailIds);
  
      if (response.status === 200) {
        alert('선택된 문서가 완료되었습니다.');
        fetchDocstorageData(selectedDeptCd); 
      }
    } catch (error) {
      console.error('문서보관 완료 처리 중 오류 발생:', error);
      alert('문서보관 완료 처리 중 오류가 발생했습니다.');
    }
  };  

  const handleCloseModal = () => {
    setShowConfirmModal(false); 
    setPendingApproval(null); 
  };

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
            onClick={(e) => e.stopPropagation()} 
            onChange={() => handleRowClick(row)}
            checked={selectedRows.includes(row.detailId)}
          />
        ),
      }
    ] : []),
    { header: 'NO', accessor: 'no' },
    ...(selectedCategory === 'A' ? [{ header: '분류', accessor: 'typeDisplay' }] : []),
    ...(selectedCategory === 'B' ? [
      {
        header: (
          <StatusSelect
            statusOptions={statusOptions}
            selectedStatus={selectedStatus}
            onStatusChange={(e) => setSelectedStatus(e.target.value)} 
          />
        ),
        accessor: 'status',
      }
    ] : []),
    { header: '팀 명', accessor: 'teamNm' },
    { header: '문서관리번호', accessor: 'docId' },
    { header: '입고위치', accessor: 'location' },
    { header: '문서명', accessor: 'docNm' },
    { header: '관리자(정)', accessor: 'manager' },
    { header: '관리자(부)', accessor: 'subManager' },
    { header: '보존연한', accessor: 'storageYear' },
    { header: '생성일자', accessor: 'createDate' },
    { header: '이관일자', accessor: 'transferDate' },
    { header: '신청번호', accessor: 'tsdNum' },
    { header: '폐기일자', accessor: 'disposalDate' },
    { header: '신청번호', accessor: 'dpdraftNum' },
  ];

  const filteredDocstorageDetails = docstorageDetails
    .filter((doc) => selectedStatus === '전체' || doc.status === selectedStatus)
    .map((doc, index) => ({
      ...doc,
      no: index + 1, 
    }));

  return (
    <div className='content'>
      <div className="docstorage-content">
        <div className='docstorage-content-inner'>
            <h2>문서보관 목록표</h2>
            <Breadcrumb items={['문서 관리', '문서보관 목록표']} />
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
                {selectedCategory !== 'A' && (
                  <>
                    <label htmlFor="dept" className="docstorage-category-label" style={{ marginLeft: '20px' }}>부 서&gt;&gt;</label>
                    <select
                      id="dept"
                      className="docstorage-category-dropdown"
                      value={selectedDeptCd || ''}
                      onChange={handleDeptChange}
                    >
                      <option value="">전체</option>
                      {deptResponses.map(dept => (
                        <option key={dept.detailCd} value={dept.detailCd}>
                          {dept.detailNm}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>
            <div className="docstorage-tables-section">
              <div className="docstorage-details-content">
                <div className="docstorage-header-buttons">
                  <label className='docstorage-detail-content-label'>
                    {selectedCategory === 'A' ? '승인대기 내역' : '문서보관 내역'}&gt;&gt;
                  </label>
                  {selectedCategory === 'B' && (
                    <div className="docstorage-detail-buttons">
                        <button className="docstorage-modify-button" onClick={handleEdit}>수 정</button>
                        <button className="docstorage-excel-button" onClick={downloadExcel}>엑 셀</button>
                        <button className="docstorage-finish-button" onClick={handleFinish}>완 료</button>
                    </div>
                  )}
                </div>
                <div className="docstorage-details-table">
                  <Table
                    columns={detailColumns}
                    data={filteredDocstorageDetails}  
                    onRowClick={handleRowClick} 
                    onRowMouseDown={handleMouseDown}  
                    onRowMouseOver={handleMouseOver}  
                    onRowMouseUp={handleMouseUp} 
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
                selectedDetailIds={selectedRows}
                onSave={handleUpdate}
              />
            )}
            {showBulkEditModal && (
              <DocstorageBulkUpdateModal
                show={showBulkEditModal}
                onClose={() => setShowBulkEditModal(false)}
                selectedDetailIds={selectedRows}
                onSave={handleBulkUpdate}
              />
            )}
        </div>
      </div>
    </div>
  );
}

export default DocstorageList;
