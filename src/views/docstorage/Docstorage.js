import React, { useState, useContext, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import DocstorageAddModal from '../../views/docstorage/DocstorageAddModal';
import '../../styles/common/Page.css';
import '../../styles/Docstorage.css'; 
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';

function Docstorage() { 
  const { auth } = useContext(AuthContext); 
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchDocstorageData = async () => {
      try {
        const response = await axios.get('/api/docstorageList/dept', {
          params: { userId: auth.userId }, // userId를 쿼리 파라미터로 전달
        });

        const dataWithNumbers = response.data.data.map((item, index) => ({
          ...item,
          no: index + 1, // 데이터에 번호 추가
        }));

        setDocstorageDetails(dataWithNumbers); // 받아온 데이터를 상태에 저장
      } catch (error) {
        console.error('문서보관 데이터를 불러오는데 실패했습니다.', error);
      }
    };

    if (auth.userId) {
      fetchDocstorageData();
    }
  }, [auth.userId]);

  const handleSave = (newData) => {
    console.log(newData);
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
