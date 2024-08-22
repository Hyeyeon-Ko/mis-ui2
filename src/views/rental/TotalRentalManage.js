import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import '../../styles/common/Page.css';
import '../../styles/rental/TotalRentalManage.css';

function TotalRentalManage() {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [centerData, setCenterData] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);

  useEffect(() => {
    const fetchRentalData = async () => {
      try {
        const response = await axios.get('/api/rentalList/total');
        const data = response.data.data;

        setCenterData(data.centerResponses);

        if (data.centerRentalResponses.length > 0) {
          const firstCenterRentalData = data.centerRentalResponses[0].foundationResponses;
          setFilteredDetails(firstCenterRentalData);
        }
      } catch (error) {
        console.error("렌탈 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    fetchRentalData();
  }, []);

  const handleCenterClick = (detailCd) => {
    setSelectedCenter(detailCd);
    setSelectedRows([]);

    const centerRentalData = centerData.find(center => center.detailCd === detailCd);
    if (centerRentalData) {
      const rentalData = centerRentalData.foundationResponses || [];
      setFilteredDetails(rentalData);
    } else {
      setFilteredDetails([]);
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

  const detailColumns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={(e) => {
            const isChecked = e.target.checked;
            setSelectedRows(isChecked ? filteredDetails.map(d => d.detailId) : []);
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
    { header: 'NO', accessor: 'detailId' },
    { header: '제품군', accessor: 'category' },
    { header: '업체명', accessor: 'companyNm' },
    { header: '계약번호', accessor: 'contractNum' },
    { header: '모델명', accessor: 'modelNm' },
    { header: '설치일자', accessor: 'installDate' },
    { header: '만료일자', accessor: 'expiryDate' },
    { header: '렌탈료', accessor: 'rentalFee' },
    { header: '위치분류', accessor: 'location' },
    { header: '설치위치', accessor: 'installationSite' },
    { header: '특이사항', accessor: 'specialNote' },
  ];

  const subCategoryColumns = [
    {
      header: '센터명',
      accessor: 'detailNm',
      width: '100%',
      Cell: ({ row }) => {
        const { detailCd } = row;
        return (
          <div
            className="totalRentalManage-details-table"
            style={{ cursor: 'pointer' }}
            onClick={() => handleCenterClick(detailCd)}
          >
            <span>{row.detailNm}</span>
          </div>
        );
      }
    },
  ];

  const handleExcelDownload = async () => {
    if (!selectedCenter || selectedRows.length === 0) {
      alert("엑셀 파일로 내보낼 항목을 선택하세요.");
      return;
    }

    try {
      const response = await axios.post('/api/rental/excel/total', {
        centerId: selectedCenter,
        rentalIds: selectedRows,
      }, {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '전국_렌탈현황_관리표.xlsx'); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("엑셀 다운로드 실패:", error);
    }
  };

  return (
    <div className='content'>
      <div className="totalRentalManage-content">
        <div className='totalRentalManage-content-inner'>
          <h2>전국 렌탈현황 관리표</h2>
          <Breadcrumb items={['자산 및 대여 관리', '전국 렌탈현황 관리표']} />
          <div className="totalRentalManage-tables-section">
            <div className="totalRentalManage-sub-category-section">
              <div className="totalRentalManage-header-buttons">
                <label className='totalRentalManage-sub-category-label'>센 터&gt;&gt;</label>
              </div>
              <div className="totalRentalManage-sub-category-table">
                <Table
                  columns={subCategoryColumns}
                  data={centerData}
                />
              </div>
            </div>
            <div className="totalRentalManage-details-content">
              <div className="totalRentalManage-header-buttons">
                <label className='totalRentalManage-detail-content-label'>렌탈 현황&gt;&gt;</label>
                <div className="totalRentalManage-detail-buttons">
                  <button
                    className="totalRentalManage-excel-button"
                    onClick={handleExcelDownload}
                  >
                    엑 셀
                  </button>
                </div>
              </div>
              <div className="totalRentalManage-details-table">
                <Table
                  columns={detailColumns}
                  data={filteredDetails}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TotalRentalManage;
