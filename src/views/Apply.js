import React from 'react';
import CircleButton from '../components/CircleButton';
import '../styles/Apply.css';


/* 메인페이지 */
function Apply() {

  return (
    <div className="main-content">
      <div className="kmi-intro">
        <h1 className="kmi-title">
          <span>K</span>orea <span>M</span>edical <span>I</span>nstitute
        </h1>
        <p className="kmi-subtitle">
          글로벌 No.1 평생건강관리 파트너 KMI 입니다.<br />
          이용할 서비스를 선택하세요.
        </p>
      </div>

      <div className="button-container">
        <CircleButton to="/bcd" label="명함신청" />
        <CircleButton to="/doc" label="문서수발신" />
        {/* <CircleButton to="/tonerApply" label="토너신청" /> */}
      </div>
    </div>
  );
}

export default Apply;
