import React from 'react';
import CircleButton from '../components/CircleButton';
import '../styles/Apply.css';

/* 메인페이지 */
function Apply() {

  return (
    <div className="main-content">
      <div className="button-container">
        <CircleButton to="/api/bcd" label="명함신청" />
        <CircleButton to="/api/seal" label="인장관리" />
        <CircleButton to="/api/corpDoc" label="법인서류" />
      </div>
      <div className="button-container">
        <CircleButton to="/api/doc" label="문서수발신" />
        <CircleButton to="/api/docstorage" label="문서이관/파쇄" />
      </div>
    </div>
  );
}

export default Apply;
