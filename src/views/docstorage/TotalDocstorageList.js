import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import DocstorageAddModal from './DocstorageAddModal'; 
import '../../styles/common/Page.css';
import '../../styles/docstorage/TotalDocstorageList.css';
import axios from 'axios';

function TotalDocstorageList() {
  const [centerData, setCenterData] = useState([]);
  const [selectedCenterCode, setSelectedCenterCode] = useState(null);
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [centerDocstorageResponses, setCenterDocstorageResponses] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false); 
  const [selectedRows, setSelectedRows] = useState([]); 

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/docstorageList/total');
        const { centerResponses, centerDocstorageResponses } = response.data.data;

        const sortedCenterData = [...centerResponses].sort((a, b) => {
          return a.detailNm.localeCompare(b.detailNm, 'ko-KR');
        });

        setCenterData([...sortedCenterData]); 
        setCenterDocstorageResponses(centerDocstorageResponses[0]); 

      } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다.', error);
      }
    };
    fetchData();
  }, []);

  const handleCenterClick = (detailCd) => {
    setSelectedRows([]); 
    setSelectedCenterCode(detailCd);
  
    if (!centerDocstorageResponses) return;
  
    const centerMapping = {
      "100": centerDocstorageResponses.foundationResponses,
      "111": centerDocstorageResponses.gwanghwamunResponses,
      "112": centerDocstorageResponses.yeouidoResponses,
      "113": centerDocstorageResponses.gangnamResponses,
      "211": centerDocstorageResponses.suwonResponses,
      "611": centerDocstorageResponses.daeguResponses,
      "612": centerDocstorageResponses.busanResponses,
      "711": centerDocstorageResponses.gwangjuResponses,
      "811": centerDocstorageResponses.jejuResponses,
    };
  
    const selectedDetails = centerMapping[detailCd] || [];
  
    const numberedDetails = selectedDetails.map((item, index) => ({
      ...item,
      no: index + 1,
      detailId: item.detailId || `id-${index}`, 
    }));
    
    setDocstorageDetails(numberedDetails);
  };

  const handleSave = (newData) => {
    setShowAddModal(false); 
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

  const downloadExcel = async () => {
    try {
      const detailIds = selectedRows.map(row => row.detailId);
      const response = await axios.post('/api/docstorage/excel', detailIds, {
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
    
  const subCategoryColumns = [
    {
      header: '센터명',
      accessor: 'detailNm',
      width: '100%',
      Cell: ({ row }) => {
        const { detailCd } = row;
        return (
          <div
            className="totalDocstorage-details-table"
            style={{ cursor: 'pointer' }}
            onClick={() => handleCenterClick(detailCd)}
          >
            <span>{row.detailNm}</span>
          </div>
        );
      }
    },
  ];

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
          onChange={() => handleRowClick(row)}
          checked={selectedRows.includes(row.detailId)}
        />
      ),
    },
    { header: 'NO', accessor: 'no' },
    { header: '팀명', accessor: 'teamNm' },
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

  return (
    <div className='content'>
      <div className="totalDocstorage-content">
        <div className='totalDocstorage-content-inner'>
            <h2>전국 문서보관 목록표</h2>
            <Breadcrumb items={['자산 및 문서 관리', '전국 문서보관 목록표']} />
            <div className="totalDocstorage-tables-section">
            <div className="totalDocstorage-sub-category-section">
                <div className="totalDocstorage-header-buttons">
                <label className='totalDocstorage-sub-category-label'>센 터&gt;&gt;</label>
                </div>
                <div className="totalDocstorage-sub-category-table">
                <Table
                    columns={subCategoryColumns}
                    data={centerData}
                />
                </div>
            </div>
            <div className="totalDocstorage-details-content">
                <div className="totalDocstorage-header-buttons">
                <label className='totalDocstorage-detail-content-label'>문서보관 내역&gt;&gt;</label>
                <div className="totalDocstorage-detail-buttons">
                    <button className="totalDocstorage-excel-button" onClick={downloadExcel}>엑 셀</button>
                </div>
                </div>
                <div className="totalDocstorage-details-table">
                    <Table
                    columns={detailColumns}
                    data={docstorageDetails}
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
    </div>
  );
}

export default TotalDocstorageList;
