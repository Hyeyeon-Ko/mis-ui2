import React from 'react';
import ApplicationList from './../list/ApplicationList';

function SealApplicationList() {
  return (
    <ApplicationList 
      documentType="인장신청" 
      title="인장신청 내역" 
      breadcrumbItems={['신청내역 관리', '인장신청 내역']} 
    />
  );
}

export default SealApplicationList;
