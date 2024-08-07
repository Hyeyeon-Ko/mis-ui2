import React from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import CircleButton from '../../components/CircleButton';
import '../../styles/SealApply.css';
import '../../styles/common/Page.css';

/* (인장 신청 중) 날인/반출 선택 페이지 */
function SealApplyFirst() {
    return (
    <div className="content">
      <div className="seal-content">
        <h2>인장신청</h2>
        <Breadcrumb items={['신청하기', '인장신청']} />
        <div className="apply-button-container">
            <CircleButton to="/api/seal/imprint" label="날 인" />
            <CircleButton to="/api/seal/export" label="반 출" />
        </div>
      </div>
    </div>
  );
}

export default SealApplyFirst;
