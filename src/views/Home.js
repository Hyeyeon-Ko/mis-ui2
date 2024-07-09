import React from 'react';
import CircleButton from '../components/CircleButton';
import '../styles/Home.css';

function Home() {
  return (
    <div className="main-content">
      <div className="button-container">
        <CircleButton to="/api/bsc" label="명함신청" />
        <CircleButton to="/api/corpdoc" label="법인서류" />
      </div>
      <div className="button-container">
        <CircleButton to="/api/seal" label="인장관리" />
        <CircleButton to="/api/doc" label="문서수발신" />
      </div>
    </div>
  );
}                                                                                                

export default Home;
