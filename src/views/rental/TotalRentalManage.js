import React, { useState } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import '../../styles/common/Page.css';
import '../../styles/rental/TotalRentalManage.css';

function TotalRentalManage() {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const centerData = [
    { detailCd: '100', detailNm: '센터 1' },
    { detailCd: '111', detailNm: '센터 2' },
    { detailCd: '102', detailNm: '센터 3' },
    { detailCd: '103', detailNm: '센터 4' },
    { detailCd: '104', detailNm: '센터 5' },
  ];

  const handleCenterClick = (detailCd) => {
    setSelectedCenter(detailCd);
    setSelectedRows([]); 
  };

  const detailColumns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={(e) => {
            const isChecked = e.target.checked;
            setSelectedRows(isChecked ? [1, 2, 3] : []);
          }}
        />
      ),
      accessor: 'select',
      width: '5%',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          name="detailSelect"
          checked={selectedRows.includes(row.detailId)}
        />
      ),
    },
    { header: 'NO', accessor: 'no' },
    { header: '제품군', accessor: 'category' },
    { header: '업체명', accessor: 'companyName' },
    { header: '계약번호', accessor: 'contractNumber' },
    { header: '모델명', accessor: 'modelName' },
    { header: '설치일자', accessor: 'installDate' },
    { header: '만료일자', accessor: 'expiryDate' },
    { header: '렌탈료', accessor: 'rentalFee' },
    { header: '위치분류', accessor: 'locationCategory' },
    { header: '설치위치', accessor: 'installationLocation' },
    { header: '신청번호', accessor: 'applicationNumber' },
    { header: '특이사항', accessor: 'remarks' },
  ];

  const filteredDetails = selectedCenter
    ? [
        {
          no: 1,
          category: '컴퓨터',
          companyName: 'ABC 렌탈',
          contractNumber: '12345',
          modelName: '모델 A',
          installDate: '2024-01-01',
          expiryDate: '2025-01-01',
          rentalFee: '₩100,000',
          locationCategory: '사무실',
          installationLocation: '서울',
          applicationNumber: '98765',
          remarks: '특이사항 없음',
        },
        {
          no: 2,
          category: '프린터',
          companyName: 'XYZ 렌탈',
          contractNumber: '67890',
          modelName: '모델 B',
          installDate: '2023-06-01',
          expiryDate: '2024-06-01',
          rentalFee: '₩50,000',
          locationCategory: '사무실',
          installationLocation: '부산',
          applicationNumber: '54321',
          remarks: '특이사항 있음',
        },
      ]
    : [];

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
                  <button className="totalRentalManage-excel-button">엑 셀</button>
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
