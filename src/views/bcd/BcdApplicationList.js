import React from 'react';
import ApplicationList from './../list/ApplicationList';

function BcdApplicationList() {
  return (
    <ApplicationList 
      documentType="명함신청" 
      title="명함신청 내역" 
      breadcrumbItems={['신청내역 관리', '명함신청 내역']} 
    />
  );
}

export default BcdApplicationList;
