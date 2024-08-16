import React, { useState, useEffect, useContext } from 'react';
import { useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import DocstorageAddModal from '../../views/docstorage/DocstorageAddModal';
import DocstorageApplyModal from '../../views/docstorage/DocstorageApplyModal';
import TypeSelect from '../../components/TypeSelect'; 
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/docstorage/Docstorage.css';
import { AuthContext } from '../../components/AuthContext';

function Docstorage() {
  const { auth } = useContext(AuthContext);
  const { userId } = auth;
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null); 
  const [selectedType, setSelectedType] = useState('전체'); 
  const [types] = useState([
    '전체',
    '이관',
    '파쇄',
    '미신청',
  ]);

  const deptCd = '006';

  const fetchDocstorageDetails = useCallback(() => {
    if (userId) {
      const params = { deptCd };
      axios.get('/api/docstorageList/dept', { params })
        .then(response => {
          let data = response.data.data;

          if (Array.isArray(data)) {
            data = data.map((item, index) => ({
              ...item,
              no: index + 1,
              typeDisplay: item.type === 'A' ? '이관' : item.type === 'B' ? '파쇄' : '',
              statusDisplay: item.status === 'A' ? '신청완료' : item.status === 'E' ? '완료' : ''
            }));

            setDocstorageDetails(data);
            console.log('response: ', response);
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

  const handleSave = (newData) => {
    fetchDocstorageDetails(); 
    setShowAddModal(false);
  };

  const handleRowSelect = (e, row) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.detailId]);
    } else {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.detailId));
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
        alert("삭제할 항목을 선택하세요.");
        return;
    }

    const selectedDocs = docstorageDetails.filter(doc => selectedRows.includes(doc.detailId));
    const hasShreddedDocs = selectedDocs.some(doc => doc.type === 'B' && doc.status === 'E');

    // "파쇄"이면서 "완료" 상태인 문서가 있으면 삭제 불가
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
      alert("선택된 항목이 없습니다.");
      return;
    } else if (selectedRows.length !== 1) {
      alert("수정할 항목을 하나만 선택하세요.");
      return;
    }

    const detailId = selectedRows[0];
    const selectedDoc = docstorageDetails.find(doc => doc.detailId === detailId);

    // "파쇄"이면서 "완료" 상태인 문서인지 확인
    if (selectedDoc.type === 'B' && selectedDoc.status === 'E') {
        alert("파쇄 완료된 문서는 수정이 불가합니다.");
        return;
    }

    try {
        const response = await axios.get('/api/docstorage/', { params: { detailId } });
        const data = response.data.data;
        console.log("selected Data: ", data);
        setSelectedDoc(data);
        setShowEditModal(true);
    } catch (error) {
        console.error('문서보관 정보를 가져오는 중 에러 발생:', error);
        alert('수정할 항목을 불러오지 못했습니다.');
    }
};

  const handleUpdate = async (updatedData) => {
    try {
      const response = await axios.put('/api/docstorage/', updatedData);
      if (response.data.code === 200) {
        setDocstorageDetails(prevDetails => prevDetails.map(doc =>
          doc.detailId === updatedData.detailId ? { ...doc, ...updatedData } : doc
        ));
        setShowEditModal(false);
        alert('수정이 완료되었습니다.');
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
      Cell: ({ row }) => (
        <input
          type="checkbox"
          name="detailSelect"
          onChange={(e) => handleRowSelect(e, row)}
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
    { header: '상태', accessor: 'statusDisplay' },
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
    { header: '기안번호', accessor: 'dpdNum' },
  ];

  const filteredDocstorageDetails =
  selectedType === '전체'
    ? docstorageDetails
    : selectedType === '미신청'
    ? docstorageDetails.filter((doc) => doc.typeDisplay === null || doc.typeDisplay === '')
    : docstorageDetails.filter((doc) => doc.typeDisplay === selectedType);

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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <DocstorageAddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        initialData={selectedDoc ? null : {}}
        docData={null} 
        onSave={handleSave}
      />
      {selectedDoc && (
        <DocstorageAddModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialData={null} 
          docData={selectedDoc} 
          onSave={handleUpdate}
        />
      )}
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
