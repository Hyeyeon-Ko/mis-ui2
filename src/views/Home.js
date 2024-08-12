import React from 'react';
import CircleButton from '../components/CircleButton';
import '../styles/Home.css';

/* 메인페이지 */
function Home() {

  return (
    <div className="main-content">
      <div className="button-container">
        <CircleButton to="/api/bcd" label="명함신청" />
        <CircleButton to="/api/seal" label="인장관리" />
      </div>
      <div className="button-container">
        <CircleButton to="/api/corpDoc" label="법인서류" />
        <CircleButton to="/api/doc" label="문서수발신" />
      </div>
    </div>
  );
}

export default Home;
