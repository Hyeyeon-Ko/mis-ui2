import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import CustomButton from '../components/CustomButton';
import AuthorityAddModal from '../views/AuthorityAddModal'; 
import '../styles/AuthorityManagement.css';
import '../styles/common/Page.css';
import editIcon from '../assets/images/edit.png';
import deleteIcon from '../assets/images/delete.png';

/* 권한 관리 페이지 */
function AuthorityManagement() {
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Mock data for testing
    const mockData = [
      {
        id: 1,
        centerName: '재단본부(총무팀)',
        name: '고혜연(2024060034)',
        email: 'khy33355@kmi.or.kr',
        role: 'ADMIN',
      },
      {
        id: 2,
        centerName: '재단본부(총무팀)',
        name: '윤성아(2024060035)',
        email: 'sungah12@kmi.or.kr',
        role: 'MASTER',
      },
    ];
    setApplications(mockData);
  }, []);

  const handleEdit = (id) => {
    console.log(`Edit item with id ${id}`);
  };

  const handleDelete = (id) => {
    setApplications(applications.filter(app => app.id !== id));
  };

  const columns = [
    { header: '권한', accessor: 'role', width: '15%' },
    { header: '센터(부서)', accessor: 'centerName', width: '15%' },
    { header: '이름(사번)', accessor: 'name', width: '20%' },
    {
      header: '이메일',
      accessor: 'email',
      width: '30%',
      Cell: ({ row }) => (
        <div className="email-cell">
          <span className="email-text">{row.email}</span>
        </div>
      ),
    },
    {
      header: '수정',
      accessor: 'edit',
      width: '4%',
      Cell: ({ row }) => (
        <div className="icon-cell">
          <img src={editIcon} alt="Edit" className="action-icon" onClick={() => handleEdit(row.id)} />
        </div>
      ),
    },
    {
      header: '삭제',
      accessor: 'delete',
      width: '8%',
      Cell: ({ row }) => (
        <div className="icon-cell">
          <img src={deleteIcon} alt="Delete" className="action-icon" onClick={() => handleDelete(row.id)} />
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
