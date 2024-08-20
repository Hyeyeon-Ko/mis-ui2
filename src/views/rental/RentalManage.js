import React, { useState } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import '../../styles/common/Page.css';
import '../../styles/rental/RentalManage.css';

function RentalManage() {

  const detailColumns = [
    { header: 'NO' } ,
    { header: '제품군' } ,
    { header: '업체명' } ,
    { header: '계약번호' } ,
    { header: '모델명' } ,
    { header: '설치일자' } ,
    { header: '만료일자' } ,
    { header: '렌탈료' } ,
    { header: '위치분류' } ,
    { header: '설치위치' } ,
    { header: '신청번호' } ,
    { header: '특이사항' } ,
  ];

  const filteredDetails = [];

  return (
    <div className='content'>
      <div className='rental-content'>
        <div className="rental-content-inner">
          <h2>렌탈현황 관리표</h2>
          <Breadcrumb items={['신청하기', '렌탈현황 관리표']} />
          <div className="rental-tables-section">
            <div className="rental-details-content">
              <div className="rental-header-buttons">
                <label className='rental-detail-content-label'>렌탈 현황&gt;&gt;</label>
                <div className="rental-detail-buttons">
                  <button className="rental-add-button">추 가</button>
                  <button className="rental-modify-button">수 정</button>
                  <button className="rental-delete-button">삭 제</button>
                  <button className="rental-excel-button">엑 셀</button>
                  <button className="rental-apply-button">완 료</button>
                </div>
              </div>
              <div className="rental-details-table">
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

export default RentalManage;
