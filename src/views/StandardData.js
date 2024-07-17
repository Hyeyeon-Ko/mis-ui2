import React, { useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import '../styles/StandardData.css';

function StandardData() {
    
  return (
    <div className="content">
      <div className="standard-data-list">
        <h2>기준 자료</h2>
        <div className="header-row">
          <Breadcrumb items={['기준 자료']} />
          <div className="buttons-container">
            <button className="data-add-button">추가</button>
            <button className="data-delete-button">삭제</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StandardData;
