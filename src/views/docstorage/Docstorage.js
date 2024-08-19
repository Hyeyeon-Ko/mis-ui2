import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import DocstorageAddModal from '../../views/docstorage/DocstorageAddModal';
import DocstorageUpdateModal from '../../views/docstorage/DocstorageUpdateModal';
import DocstorageApplyModal from '../../views/docstorage/DocstorageApplyModal';
import TypeSelect from '../../components/TypeSelect'; 
import StatusSelect from '../../components/StatusSelect';
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/docstorage/Docstorage.css';
import { AuthContext } from '../../components/AuthContext';

function Docstorage() {
  const { auth } = useContext(AuthContext);
  const { userId, deptCd } = auth;
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null); 
  const [selectedType, setSelectedType] = useState('전체'); 
  const [selectedStatus, setSelectedStatus] = useState('전체');  
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
      axios.get('/api/docstorageList/dept', { params })
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

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleStatusChange = (event) => {  
    setSelectedStatus(event.target.value);
  };

  const handleSave = (newData) => {
    fetchDocstorageDetails(); 
    setShowAddModal(false);
  };

  const handleRowSelect = (e, row, index) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.detailId]);
    } else {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.detailId));
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

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
        alert("삭제할 항목을 선택하세요.");
        return;
    }

    const selectedDocs = docstorageDetails.filter(doc => selectedRows.includes(doc.detailId));
    const hasShreddedDocs = selectedDocs.some(doc => doc.type === 'B' && doc.status === 'E');

    if (hasShreddedDocs) {
        alert("파쇄 완료된 문서는 삭제가 불가합니다.");
        return;
    }

    try {
        for (const detailId of selectedRows) {
            await axios.delete('/api/docstorage/', { params: { detailId } });
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
  } else if (selectedRows.length !== 1) {
    alert("수정할 항목을 하나만 선택하세요.");
    return;
  }

  const detailId = selectedRows[0];
  const selectedDoc = docstorageDetails.find(doc => doc.detailId === detailId);

  if (selectedDoc.type === 'B' && selectedDoc.status === 'E') {
    alert("파쇄 완료된 문서는 수정이 불가합니다.");
    return;
  }

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

    const response = await axios.post(url, payload);

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
      fetchDocstorageDetails();
    }
  } catch (error) {
    console.error('문서보관 정보를 수정하는 중 에러 발생:', error);
    alert('수정에 실패했습니다.');
  }
};

  const downloadExcel = async () => {
    if (selectedRows.length === 0) {
      alert("엑셀로 내보낼 항목을 선택하세요.");
      return;
    }

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

    const hasShreddedDocs = selectedDocs.some(doc => doc.typeDisplay === '파쇄');
  
    if (hasShreddedDocs) {
      alert("파쇄된 문서와 관련해서는 신청이 불가합니다.");
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
          onChange={(e) => handleRowSelect(e, row, index)}
          checked={selectedRows.includes(row.detailId)}
        />
      ),
    },
    { header: 'NO', accessor: 'no' },
    {
      header: (
        <TypeSelect
          types={types}
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
        />
      ),
      accessor: 'typeDisplay',
      width: '10%',
    },
    {
      header: (
        <StatusSelect
          statusOptions={statusOptions}
          selectedStatus={selectedStatus}  
          onStatusChange={handleStatusChange} 
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
    { header: '신청번호', accessor: 'tsdNum' },
    { header: '폐기일자', accessor: 'disposalDate' },
    { header: '번호', accessor: 'dpdNum' },
  ];

  const filteredDocstorageDetails =
  docstorageDetails
    .filter((doc) => selectedType === '전체' || doc.typeDisplay === selectedType || (selectedType === '미신청' && !doc.typeDisplay))
    .filter((doc) => selectedStatus === '전체' || doc.statusDisplay === selectedStatus); 

  return (
    <div className='content'>
      <div className='docstorage-content'>
        <div className="docstorage-content-inner">
          <h2>문서보관 신청</h2>
          <Breadcrumb items={['신청하기', '문서보관 신청']} />
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
      />
      <DocstorageApplyModal
        show={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        selectedRows={selectedRows} 
        onApplySuccess={handleApplySuccess} 
      />
    </div>
  );
}

export default Docstorage;
