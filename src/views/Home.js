import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

/* 메인페이지 */
function Home() {
  return (
    <div className="home-main">
      <Link to="/apply" className="home-section-link">
        <div className="home-section apply">
          <div className="title">
            <h2>신청하기</h2>
          </div>
          <div className="content">
            <ul>
              <li>▪ 명함신청</li>
              <li>▪ 인장신청</li>
              <li>▪ 법인서류</li>
              <li>▪ 문서수발신</li>
            </ul>
          </div>
        </div>
      </Link>
      <Link to="/asset" className="home-section-link">
        <div className="home-section asset">
          <div className="title">
            <h2>자산 및 문서관리</h2>
          </div>
          <div className="content">
            <ul>
              <li>▪ 제품 렌트</li>
              <li>▪ 문서보관 신청</li>
            </ul>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default Home;
