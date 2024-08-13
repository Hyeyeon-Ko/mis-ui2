import React, { useState, useEffect, useContext } from 'react';
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

  const deptCd = '006';

  useEffect(() => {
    if (userId) {
      const params = { deptCd };
      console.log('Sending request with params:', params);  

      axios.get('/api/docstorageList/dept', { params })  
        .then(response => {
          let data = response.data.data;

          console.log('Received data:', data);

          if (Array.isArray(data)) {
            data = data.map((item, index) => ({
              ...item,
              no: index + 1, 
              typeDisplay: item.type === 'A' ? '이관' : item.type === 'B' ? '파쇄' : '',
              statusDisplay: item.status === 'N' ? '미신청' : item.status === 'A' ? '승인대기' : item.status === 'E' ? '완료' : ''
            }));

            setDocstorageDetails(data);
          } else {
            console.error('Unexpected data format:', data);
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

  const detailColumns = [
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
    { header: '기안번호', accessor: 'dpdraftNum' },
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
                  <button className="docstorage-add-button" onClick={() => setShowAddModal(true)}>추 가</button>
                  <button className="docstorage-modify-button">수 정</button>
                  <button className="docstorage-delete-button">삭 제</button>
                  <button className="docstorage-excel-button">엑 셀</button>
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
        onSave={handleSave}
      />
    </div>
  );
}

export default Docstorage;
