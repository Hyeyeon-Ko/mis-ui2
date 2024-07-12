import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import CircleButton from '../components/CircleButton';
import '../styles/BcdApplyFirst.css';
import '../styles/common/Page.css';

/* (명함 신청 중) 본인/타인 선택 페이지 */
function BcdApplyFirst() {
  return (
    <div className='content'>
        <div className="apply-document-content">
            <h2>명함신청</h2>
            <Breadcrumb items={['신청하기', '명함신청']} />
            <div className="apply-button-container">
                <CircleButton to="/api/bsc/own" label="본인" />
                <CircleButton to="/api/bsc/other" label="타인" />
            </div>
        </div>
    </div>
  );
}

export default BcdApplyFirst;
