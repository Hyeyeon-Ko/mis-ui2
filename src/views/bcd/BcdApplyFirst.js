import React from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import CircleButton from '../../components/CircleButton';
import '../../styles/bcd/BcdApplyFirst.css';
import '../../styles/common/Page.css';

/* (명함 신청 중) 본인/타인 선택 페이지 */
function BcdApplyFirst() {
  return (
    <div className="content">
      <div className="apply-document-content">
        <h2>명함신청</h2>
        <Breadcrumb items={['신청하기', '명함신청']} />
        <div className="apply-button-container">
          <CircleButton to="/bcd/own" label="본 인" />
          <CircleButton to="/bcd/other" label="타 인" />
        </div>
      </div>
    </div>
  );
}

export default BcdApplyFirst;
