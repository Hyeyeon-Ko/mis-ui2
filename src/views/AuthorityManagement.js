import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import CustomButton from '../components/CustomButton';
import AuthorityAddModal from '../views/AuthorityAddModal';
import ConfirmModal from '../components/common/ConfirmModal'; 
import '../styles/AuthorityManagement.css';
import '../styles/common/Page.css';
import editIcon from '../assets/images/edit.png';
import deleteIcon from '../assets/images/delete.png';
import axios from 'axios';

/* 권한 관리 페이지 */
function AuthorityManagement() {
  const [applications, setApplications] = useState([]); // 권한 목록 상태
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ConfirmModal 표시 여부 상태
  const [selectedAdmin, setSelectedAdmin] = useState(null); // 선택된 관리자의 데이터

  // TODO : 기준자료 연동 후에 센터코드 -> 센터명으로 수정
  // 권한 목록 불러오기 함수
  const fetchAuthorityList = async () => {
    try {
      const response = await axios.get('/api/auth'); // 권한 목록을 가져오는 GET 요청
      console.log('Response data: ', response.data);

      const data = response.data.data || response.data;
      const transformedData = data.map(item => ({
        id: item.userId, 
        role: item.userRole,
        centerName: `${item.instCd} (${item.deptNm})`,
        name: `${item.hngNm}(${item.userId})`,
        email: item.email,
        authId: item.authId,
      }));
      console.log('Transformed data:', transformedData);
      setApplications(transformedData); // 권한 목록 상태 업데이트
    } catch (error) {
      console.error('Error fetching authority list: ', error);
    }
  };

  // 컴포넌트 마운트 시 권한 목록 불러오기
  useEffect(() => {
    fetchAuthorityList();
  }, []);

  // TODO : 수정 버튼 클릭시 -> 권한 추가시 모달 띄우기 (사번은 수정불가)
  // 수정 버튼 클릭 핸들러
  const handleEdit = (id) => {
    console.log(`Edit item with id ${id}`);
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = (admin) => {
    setSelectedAdmin(admin);
    setShowConfirmModal(true);
  };

  // ConfirmModal의 확인 버튼 클릭 핸들러
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/auth/admin/${selectedAdmin.authId}`); // authId를 포함하여 삭제 요청
      fetchAuthorityList(); // 삭제 후 리스트 갱신
      setShowConfirmModal(false); // ConfirmModal 닫기
      setSelectedAdmin(null); // 선택된 관리자 초기화
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  // 추가 후 권한 목록 갱신 함수
  const handleAdd = () => {
    fetchAuthorityList(); // 데이터를 다시 불러와 리스트를 업데이트
    setShowModal(false); // 모달 닫기
  };

  // 테이블 컬럼 설정
  const columns = [
    { header: '권한', accessor: 'role', width: '15%' },
    { header: '센터(부서)', accessor: 'centerName', width: '20%' },
    { header: '이름(사번)', accessor: 'name', width: '20%' },
    {
      header: '이메일',
      accessor: 'email',
      width: '25%',
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
          <img src={deleteIcon} alt="Delete" className="action-icon" onClick={() => handleDelete(row)} />
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
      <AuthorityAddModal show={showModal} onClose={() => setShowModal(false)} onAdd={handleAdd} />
      {showConfirmModal && selectedAdmin && (
      <ConfirmModal 
        message={`${selectedAdmin.name}님의<br>${selectedAdmin.role} 권한을 취소하시겠습니까?`} 
        onConfirm={handleConfirmDelete} 
        onCancel={() => setShowConfirmModal(false)} 
      />
    )}
    </div>
  );
}

export default AuthorityManagement;
