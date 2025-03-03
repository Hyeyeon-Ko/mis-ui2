import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import DocstorageAddModal from '../../views/docstorage/DocstorageAddModal';
import DocstorageUpdateModal from '../../views/docstorage/DocstorageUpdateModal';
import DocstorageApplyModal from '../../views/docstorage/DocstorageApplyModal';
import DocstorageBulkUpdateModal from '../../views/docstorage/DocstorageBulkUpdateModal';
import CustomSelect from '../../components/CustomSelect';
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/docstorage/Docstorage.css';
import { AuthContext } from '../../components/AuthContext';
import useDocstorageChange from '../../hooks/useDocstorageChange';


function Docstorage() {
  const {handleTypeChange, handleStatusChange, handleRowSelect, selectedType, selectedRows,selectedStatus, setSelectedRows} = useDocstorageChange();
  const { auth } = useContext(AuthContext);
  const { userId, deptCd } = auth;
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null); 
 
  const [types] = useState([
    '전체',
    '이관',
    '파쇄',
    '미신청',
  ]);
  const statusOptions = [
    { label: '전체', value: '전체' },
    { label: '신청완료', value: '신청완료' },
    { label: '승인완료', value: '승인완료' },
    { label: '처리완료', value: '처리완료' },
  ];

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select'); 

  const fetchDocstorageDetails = useCallback(() => {
    if (userId && deptCd) {
      const params = { deptCd };
      axios.get(`/api/docstorageList/dept`, { params })
        .then(response => {
          let data = response.data.data;

          if (Array.isArray(data)) {
            data = data.map((item, index) => ({
              ...item,
              no: index + 1,
              typeDisplay: item.type === 'A' ? '이관' : item.type === 'B' ? '파쇄' : '',
              statusDisplay: item.status === 'A' ? '신청완료' : item.status === 'B' ? '승인완료' : item.status === 'E' ? '처리완료' : '',
            }));

            setDocstorageDetails(data);
          } else {
            setDocstorageDetails([]);
          }
        })
        .catch(error => {
          console.error('Error fetching docstorage details:', error);
          setDocstorageDetails([]);
        });
    }
  }, [userId, deptCd]);

  useEffect(() => {
    fetchDocstorageDetails();
  }, [fetchDocstorageDetails]);

  const handleSave = (newData) => {
    fetchDocstorageDetails(); 
    setShowAddModal(false);
  };

  const handleRowClick = (row, index) => {
    const isChecked = !selectedRows.includes(row.detailId);
    handleRowSelect({ target: { checked: isChecked }, stopPropagation: () => {} }, row, index);
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

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
        alert("삭제할 항목을 선택하세요.");
        return;
    }
  
    const selectedDocs = docstorageDetails.filter(doc => selectedRows.includes(doc.detailId));
    
    const hasInvalidDocs = selectedDocs.some(doc => doc.status === 'B' || doc.status === 'E');
    
    if (hasInvalidDocs) {
        alert("승인완료 또는 처리완료인 문서는 삭제가 불가합니다.");
        return;
    }
  
    const hasShreddedDocs = selectedDocs.some(doc => doc.type === 'B' && doc.status === 'E');
  
    if (hasShreddedDocs) {
        alert("파쇄 완료된 문서는 삭제가 불가합니다.");
        return;
    }
  
    try {
        for (const detailId of selectedRows) {
            await axios.delete(`/api/docstorage/`, { params: { detailId } });
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
  

  const handleEdit = async () => {
    if (selectedRows.length === 0) {
      setSelectedDoc(null);
      setShowEditModal(true); 
      return;
    }

    const selectedDocs = docstorageDetails.filter(doc => selectedRows.includes(doc.detailId));
    
    const hasInvalidDocs = selectedDocs.some(doc => 
      (doc.type === 'A' || doc.type === 'B') && (doc.status === 'B' || doc.status === 'E')
    );

    if (hasInvalidDocs) {
      alert("승인완료 또는 처리완료인 문서는 수정이 불가합니다.");
      return;
    }

    if (selectedRows.length === 1) {
      const detailId = selectedRows[0];
      try {
        const response = await axios.get(`/api/docstorage/`, { params: { detailId } });
        const data = response.data.data;
        setSelectedDoc({ ...data, detailId }); 
        setShowEditModal(true); 
      } catch (error) {
        console.error('문서보관 정보를 가져오는 중 에러 발생:', error);
        alert('수정할 항목을 불러오지 못했습니다.');
      }
      return;
    }

    if (selectedRows.length > 1) {
      setShowBulkEditModal(true); 
    }
  };

  const handleUpdate = async (updatedData, isFileUpload = false) => {
    try {
        if (isFileUpload) {
            const response = await axios.post(`/api/docstorage/update`, updatedData);
            if (response.status === 200) {
                alert('수정이 완료되었습니다.');
                setShowEditModal(false);
                fetchDocstorageDetails();
            }
        } else {
            const { detailId } = selectedDoc; 
            const response = await axios.put(`/api/docstorage/`, updatedData, {
                params: { detailId } 
            });
            if (response.status === 200) {
                alert('수정이 완료되었습니다.');
                setShowEditModal(false);
                fetchDocstorageDetails();
            }
        }
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                alert("존재하지 않는 문서관리번호가 존재합니다."); 
            } else {
                alert('수정 중 오류가 발생했습니다.');
            }
        } else {
            console.error('문서보관 정보를 수정하는 중 에러 발생:', error);
            alert('수정에 실패했습니다.');
        }
    }
  };

  const handleBulkUpdate = async (payload) => {
    try {
      const response = await axios.put(`/api/docstorage/bulkUpdate`, payload);
      if (response.status === 200) {
        alert('일괄 수정이 완료되었습니다.');
        setShowBulkEditModal(false);
        fetchDocstorageDetails();
        setSelectedRows([]);
      }
    } catch (error) {
      console.error('문서 일괄 수정 중 오류 발생:', error);
      alert('일괄 수정에 실패했습니다.');
    }
  };

  const downloadExcel = async () => {
    if (selectedRows.length === 0) {
      alert("엑셀로 내보낼 항목을 선택하세요.");
      return;
    }

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

  const handleApplySuccess = () => {
    fetchDocstorageDetails(); 
    setSelectedRows([]); 
  };

  const handleApplyButtonClick = () => {
    if (selectedRows.length === 0) {
      alert("신청할 항목을 선택하세요.");
      return;
    }
    
    const selectedDocs = docstorageDetails.filter(doc => selectedRows.includes(doc.detailId));
  
    const hasInvalidDocs = selectedDocs.some(doc => doc.type === 'B' || doc.status === 'A');
    
    if (hasInvalidDocs) {
      alert("이미 신청한 문서 또는 파쇄 문서는 신청이 불가합니다.");
      return;
    }
  
    setShowApplyModal(true);
  };
  
  const detailColumns = [
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
      Cell: ({ row, index }) => (
        <input
          type="checkbox"
          name="detailSelect"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleRowSelect(e, row, index)}
          checked={selectedRows.includes(row.detailId)}
        />
      ),
    },
    { header: 'NO', accessor: 'no' },
    {
      header: (
        <CustomSelect
          label="분류"
          options={types}
          selectedValue={selectedType}
          onChangeHandler={handleTypeChange}
        />
      ),
      accessor: 'typeDisplay',
      width: '10%',
    },
    {
      header: (
        <CustomSelect
          label="상태"
          options={statusOptions}
          selectedValue={selectedStatus}  
          onChangeHandler={handleStatusChange} 
        />
      ),
      accessor: 'statusDisplay',
      width: '10%',
    },
    { header: '팀 명', accessor: 'teamNm' },
    { header: '문서관리번호', accessor: 'docId' },
    { header: '입고위치', accessor: 'location' },
    { header: '문서명', accessor: 'docNm' },
    { header: '관리자(정)', accessor: 'manager' },
    { header: '관리자(부)', accessor: 'subManager' },
    { header: '보존연한', accessor: 'storageYear' },
    { header: '생성일자', accessor: 'createDate' },
    { header: '이관일자', accessor: 'transferDate' },
    { header: '이관신청번호', accessor: 'tsdNum' },
    { header: '폐기일자', accessor: 'disposalDate' },
    { header: '폐기신청번호', accessor: 'dpdNum' },
  ];

  const filteredDocstorageDetails =
  docstorageDetails
    .filter((doc) => selectedType === '전체' || doc.typeDisplay === selectedType || (selectedType === '미신청' && !doc.typeDisplay))
    .filter((doc) => selectedStatus === '전체' || doc.statusDisplay === selectedStatus)
    .map((doc, index) => ({
      ...doc,
      no: index + 1, 
    })); 

  return (
    <div className='content'>
      <div className='docstorage-content'>
        <div className="docstorage-content-inner">
          <h2>문서이관/파쇄</h2>
          <Breadcrumb items={['신청하기', '문서이관/파쇄']} />
          <div className="docstorage-tables-section">
            <div className="docstorage-details-content">
              <div className="docstorage-header-buttons">
                <label className='docstorage-detail-content-label'>문서보관 내역&gt;&gt;</label>
                <div className="docstorage-detail-buttons">
                  <button className="docstorage-add-button" onClick={() => {
                    setSelectedDoc(null);
                    setShowAddModal(true);
                  }}>추 가</button>
                  <button className="docstorage-modify-button" onClick={handleEdit}>수 정</button>
                  <button className="docstorage-delete-button" onClick={handleDelete}>삭 제</button>
                  <button className="docstorage-excel-button" onClick={downloadExcel}>엑 셀</button>
                  <button className="docstorage-apply-button" onClick={handleApplyButtonClick}>신 청</button>
                </div>
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
        </div>
      </div>
      <DocstorageAddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />
      <DocstorageUpdateModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        docData={selectedDoc} 
        onSave={handleUpdate}
        modalType="user"
      />
      <DocstorageApplyModal
        show={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        selectedRows={selectedRows} 
        onApplySuccess={handleApplySuccess} 
      />
      <DocstorageBulkUpdateModal
        show={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        selectedDetailIds={selectedRows}
        onSave={handleBulkUpdate}
        modalType="user"
      />
    </div>
  );
}

export default Docstorage;
