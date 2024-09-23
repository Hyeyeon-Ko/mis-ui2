import React from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import '../../styles/common/Page.css';

function TonerApplyFirst() {
  return (
    <div className="content">
      <div className="apply-document-content">
        <h2>토너신청</h2>
        <Breadcrumb items={['신청하기', '토너신청']} />
        <div className="toner-form-wrapper">
          <div className="toner-form-left">

          </div>
          <div className="toner-form-right">

          </div>
        </div>
      </div>
    </div>
  );
}

export default TonerApplyFirst;
