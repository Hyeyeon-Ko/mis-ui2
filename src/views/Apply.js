import React from 'react';
import CircleButton from '../components/CircleButton';
import '../styles/Apply.css';

/* 메인페이지 */
function Apply() {

  return (
    <div className="main-content">
      <div className="button-container">
        <CircleButton to="/bcd" label="명함신청" />
        <CircleButton to="/seal" label="인장신청" />
        <CircleButton to="/corpDoc" label="법인서류" />
      </div>
      <div className="button-container">
        <CircleButton to="/doc" label="문서수발신" />
        <CircleButton to="/docstorage" label="문서이관/파쇄" />
      </div>
    </div>
  );
}

export default Apply;
