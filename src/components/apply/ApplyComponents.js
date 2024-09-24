import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import CircleButton from '../CircleButton';
import '../../styles/apply/ApplyComponents.css'
import '../../styles/common/Page.css';

// 신청 컴포넌트
function ApplyComponents({ title, breadcrumbItems, buttons }) {
  return (
    <div className="content">
      <div className="apply-content">
        <h2>{title}</h2>
        <Breadcrumb items={breadcrumbItems} />
        <div className="apply-button-container">
          {buttons.map((button, index) => (
            <CircleButton key={index} to={button.to} label={button.label} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ApplyComponents;
