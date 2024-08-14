import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import DocstorageAddModal from '../../views/docstorage/DocstorageAddModal';
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/Docstorage.css';
import { AuthContext } from '../../components/AuthContext';

function Docstorage() {
  const { auth } = useContext(AuthContext);
  const { userId } = auth;
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // 수정 모달 상태 추가
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null); // 선택된 문서 상태 추가
  const navigate = useNavigate();

  const deptCd = '006';

  useEffect(() => {
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
              statusDisplay: item.status === 'A' ? '승인대기' : item.status === 'E' ? '완료' : ''
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
  }, [userId]);

  const handleSave = (newData) => {
    if (Array.isArray(newData)) {
      newData = newData.map((item, index) => ({
        ...item,
        no: docstorageDetails.length + index + 1,
        typeDisplay: item.type === 'A' ? '이관' : item.type === 'B' ? '파쇄' : '',
        statusDisplay: item.status === 'N' ? '미신청' : item.status === 'A' ? '승인대기' : item.status === 'E' ? '완료' : ''
      }));

      setDocstorageDetails([...docstorageDetails, ...newData]);
    } else {
      console.error("Expected newData to be an array, but got:", newData);
    }
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

  const handleEdit = async () => {
    if (selectedRows.length !== 1) {
      alert("수정할 항목을 하나만 선택하세요.");
      return;
    }

    try {
      const detailId = selectedRows[0];
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
    { header: '분류', accessor: 'typeDisplay' },
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

  return (
    <div className='content'>
      <div className='docstorage-content'>
        <div className="docstorage-content-inner">
          <h2>문서보관 목록표</h2>
          <Breadcrumb items={['자산 및 문서 관리', '문서보관 목록표']} />
          <div className="docstorage-tables-section">
            <div className="docstorage-details-content">
              <div className="docstorage-header-buttons">
                <label className='docstorage-detail-content-label'>문서보관 내역&gt;&gt;</label>
                <div className="docstorage-detail-buttons">
                  <button className="docstorage-add-button" onClick={() => {
                    setSelectedDoc(null); // 초기 데이터를 설정하기 위해 null로 설정
                    setShowAddModal(true);
                  }}>추 가</button>
                  <button className="docstorage-modify-button" onClick={handleEdit}>수 정</button>
                  <button className="docstorage-delete-button" onClick={handleDelete}>삭 제</button>
                  <button className="docstorage-excel-button" onClick={downloadExcel}>엑 셀</button>
                  <button className="docstorage-apply-button">신 청</button>
                </div>
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
      <DocstorageAddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        initialData={selectedDoc ? null : {}} // 추가 모달일 때 기본 데이터
        docData={null} // 추가 모달일 때 docData는 null
        onSave={handleSave}
      />
      {selectedDoc && (
        <DocstorageAddModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialData={null} // 수정 모달일 때 기본 데이터는 필요 없음
          docData={selectedDoc} // 수정할 데이터
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

export default Docstorage;
