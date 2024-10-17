import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/rental/RentalManage.css';
import useTonerChange from '../../hooks/useTonerChange';

function TonerList() {
  const { selectedRows, setSelectedRows, handleRowSelect } = useTonerChange();
  const { auth } = useContext(AuthContext);
  const [tonerDetails, setTonerDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  const fetchTonerData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/toner`, {
        params: { instCd: auth.instCd },
      });

      console.log(response);

      if (response.data.data && response.data.data.length > 0) {
        const transformedData = response.data.data.map((item) => ({
          ...item,
        }));

        setTonerDetails(transformedData);
        setSelectedRows([]);
      } else {
        setTonerDetails([]);
      }
    } catch (error) {
      console.error('토너 정보를 불러오는데 실패했습니다.', error);
    } finally {
      setLoading(false);
    }
  }, [auth.instCd, setSelectedRows]);

  useEffect(() => {
    fetchTonerData();
  }, [fetchTonerData]);

  const handleRowClick = (row) => {
    const isChecked = !selectedRows.includes(row.mngNum);
    if (isChecked) {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.mngNum]);
    } else {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.mngNum));
    }
  };

  const handleMouseDown = (index) => {
    dragStartIndex.current = index;
    const mngNum = tonerDetails[index].mngNum;
    if (selectedRows.includes(mngNum)) {
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
        const mngNum = tonerDetails[i].mngNum;
        if (dragMode.current === 'select' && !newSelectedRows.includes(mngNum)) {
          newSelectedRows.push(mngNum);
        } else if (dragMode.current === 'deselect' && newSelectedRows.includes(mngNum)) {
          newSelectedRows = newSelectedRows.filter(id => id !== mngNum);
        }
      }

      setSelectedRows(newSelectedRows);
    }
  };

  const handleMouseUp = () => {
    dragStartIndex.current = null;
    dragEndIndex.current = null;
  };

  const handleExcelDownload = async () => {
    if (selectedRows.length === 0) {
      alert("엑셀 파일로 내보낼 항목을 선택하세요.");
      return;
    }

    try {
      const response = await axios.post(`/api/toner/excel`, selectedRows, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '토너 관리표.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("엑셀 다운로드 실패:", error);
    }
  };

  const detailColumns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={(e) => {
            const isChecked = e.target.checked;
            setSelectedRows(isChecked ? tonerDetails.map(d => d.mngNum) : []);
          }}
        />
      ),
      accessor: 'select',
      width: '5%',
      Cell: ({ row }) => {
        const mngNum = row?.mngNum || row?.original?.mngNum;
        return (
          <input
            type="checkbox"
            name="detailSelect"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleRowSelect(e, row)}
            checked={mngNum && selectedRows.includes(mngNum)}
          />
        );
      },
    },
    { header: '관리번호', accessor: 'mngNum' },
    { header: '층', accessor: 'floor' },
    { header: '부서', accessor: 'teamNm' },
    { header: '관리자(정)', accessor: 'manager' },
    { header: '관리자(부)', accessor: 'subManager' },
    { header: '위치', accessor: 'location' },
    { header: '제품명', accessor: 'productNm' },
    { header: '모델명', accessor: 'modelNm' },
    { header: 'S/N', accessor: 'sn' },
    { header: '제조사', accessor: 'company' },
    { header: '제조일', accessor: 'manuDate' },
    { header: '토너명', accessor: 'tonerNm' },
    { header: '색상', accessor: 'color' },
    { header: '가격', accessor: 'price' },
  ];

  return (
    <div className='content'>
      <div className='rental-content'>
        <div className="rental-content-inner">
          <h2>프린트/토너 관리표</h2>
          <Breadcrumb items={['토너 관리', '프린트/토너 관리표']} />
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="rental-tables-section">
                <div className="rental-details-content">
                  <div className="rental-header-buttons">
                    <label className='rental-detail-content-label'>토너 정보&gt;&gt;</label>
                    <div className="rental-detail-buttons">
                      <button className="rental-add-button" onClick={() => { /* 추가 모달 열기 */ }}>추 가</button>
                      <button className="rental-modify-button" onClick={() => { /* 수정 모달 열기 */ }}>수 정</button>
                      <button className="rental-delete-button" onClick={() => { /* 삭제 처리 */ }}>삭 제</button>
                      <button className="rental-excel-button" onClick={handleExcelDownload}>엑 셀</button>
                    </div>
                  </div>
                  <div className="rental-details-table">
                    <Table
                      columns={detailColumns}
                      data={tonerDetails}
                      onRowClick={handleRowClick}
                      onRowMouseDown={handleMouseDown}
                      onRowMouseOver={handleMouseOver}
                      onRowMouseUp={handleMouseUp}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TonerList;
