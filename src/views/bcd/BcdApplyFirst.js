import React from 'react';
import ApplyComponent from '../../components/apply/ApplyComponents';

// 명함 신청 컴포넌트
function BcdApplyFirst() {
  const buttons = [
    { to: '/api/bcd/own', label: '본 인' },
    { to: '/api/bcd/other', label: '타 인' },
  ];

  return (
    <ApplyComponent 
      title="명함신청" 
      breadcrumbItems={['신청하기', '명함신청']} 
      buttons={buttons} 
    />
  );
}

export default BcdApplyFirst;
