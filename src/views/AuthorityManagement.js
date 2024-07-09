import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import CustomButton from '../components/CustomButton';
import AuthorityAddModal from '../views/AuthorityAddModal'; 
import '../styles/AuthorityManagement.css';
import '../styles/common/Page.css';

/* 권한 관리 페이지 */
function AuthorityManagement() {
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false); 

  useEffect(() => {
  }, []);

  const handleDelete = (id) => {
    setApplications(applications.filter(app => app.id !== id));
  };

  const columns = [
    { header: '센터(부서)', accessor: 'centerName', width: '32%' },
    { header: '이름(사번)', accessor: 'name', width: '25%' },
    {
      header: '이메일',
      accessor: 'email',
      width: '43%',
      Cell: ({ row }) => (
        <div className="email-cell">
          <span className="email-text">{row.email}</span>
          <CustomButton className="delete-button" onClick={() => handleDelete(row.id)}>X</CustomButton>
        </div>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="admin-list">
        <h2>권한 관리</h2>
        <div className="header-row">
          <Breadcrumb items={['권한 관리']} />
          <div className="buttons-container">
            <CustomButton className="authority-add-button" onClick={() => setShowModal(true)}>권한추가</CustomButton>
          </div>
        </div>
        <Table columns={columns} data={applications} />
      </div>
      <AuthorityAddModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

export default AuthorityManagement;
