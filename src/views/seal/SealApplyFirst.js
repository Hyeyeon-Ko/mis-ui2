import React from 'react';
import ApplyComponent from '../../components/apply/ApplyComponents';

// 인장 신청 컴포넌트
function SealApplyFirst() {

  const buttons = [
    { to: '/api/seal/imprint', label: '날 인' },
    { to: '/api/seal/export', label: '반 출' },
  ];

  return (
    <ApplyComponent 
      title="인장신청" 
      breadcrumbItems={['신청하기', '인장신청']} 
      buttons={buttons} 
    />
  );
}

export default SealApplyFirst;
