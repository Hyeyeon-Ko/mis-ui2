import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import CustomButton from '../../components/common/CustomButton';
import AuthorityModal from '../authority/AuthorityModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import editIcon from '../../assets/images/edit.png';
import deleteIcon from '../../assets/images/delete.png';
import '../../styles/authority/AuthorityManagement.css';
import '../../styles/common/Page.css';
import axios from 'axios';

/**
 * 권한 관리 페이지 컴포넌트
 */
function AuthorityManagement() {
  const [applications, setApplications] = useState([]); // 신청 내역 상태 관리
  const [totalPages, setTotalPages] = useState('1')
  const [currentPage, setCurrentPage] = useState('1')
  const [showModal, setShowModal] = useState(false); // 권한 추가/수정 모달 표시 상태 관리
  const [showConfirmModal, setShowConfirmModal] = useState(false); // 확인 모달 표시 상태 관리
  const [selectedAdmin, setSelectedAdmin] = useState(null); // 선택된 관리자 상태 관리
  const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 상태 관리

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAuthorityList(currentPage, itemsPerPage);
  }, [currentPage]);

  /**
   * 권한 내역 가져오기
   */
  // todo: pageIndex랑, pageSize 받아서 넣으면 됨
  const fetchAuthorityList = async (pageIndex = 1, pageSize = itemsPerPage) => {
    try {
      const response = await axios.get(`/api/auth/`, {
        params: { pageIndex, pageSize }
      });

      const data = response.data.data;
      const totalPages = data.totalPages;
      const currentPage = data.number+1;
      console.log("responsese: ", response)
      console.log("totalPages: ", totalPages)

      const transformedData = data.content.map((item) => ({
        id: item.userId,
        role: item.userRole,
        centerName: `${item.instNm} (${item.deptNm})`,
        name: `${item.hngNm}(${item.userId})`,
        email: item.email,
        authId: item.authId,
        permissions: {
          cardManagement: item.cardManagement,
          assetManagement: item.assetManagement,
        },
      }));

      setApplications(transformedData);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (error) {
      console.error('Error fetching authority list: ', error);
    }
  };

  /**
   * 페이지 변경 핸들러
   */
  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  /**
   * 수정 핸들러
   * @param {Object} admin
   */
  const handleEdit = async (admin) => {
    try {
      const response = await axios.get(`/api/auth/admin/${admin.authId}`);
      const adminData = response.data.data;

      setSelectedAdmin({
        ...admin,
        role: adminData.userRole,
        permissions: {
          standardDataManagement: adminData.canHandleStd === 'Y',
        },
      });
      setIsEditMode(true);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  /**
   * 권한 삭제 확인 핸들러
   */
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/auth/admin/${selectedAdmin.authId}`);
      fetchAuthorityList();
      setShowConfirmModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  /**
   * 저장 핸들러
   */
  const handleSave = () => {
    fetchAuthorityList();
    setShowModal(false);
    setSelectedAdmin(null);
  };

  /**
   * 삭제 핸들러
   * @param {Object} admin
   */
  const handleDelete = (admin) => {
    setSelectedAdmin(admin);
    setShowConfirmModal(true);
  };

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
          <img
            src={editIcon}
            alt="Edit"
            className="action-icon"
            onClick={() => handleEdit(row)}
          />
        </div>
      ),
    },
    {
      header: '삭제',
      accessor: 'delete',
      width: '8%',
      Cell: ({ row }) => (
        <div className="icon-cell">
          <img
            src={deleteIcon}
            alt="Delete"
            className="action-icon"
            onClick={() => handleDelete(row)}
          />
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
            <CustomButton
              className="authority-add-button"
              onClick={() => {
                setIsEditMode(false);
                setShowModal(true);
              }}
            >
              권한추가
            </CustomButton>
          </div>
        </div>
        <Table columns={columns} data={applications} />
        <ReactPaginate
          breakLabel="<...>"
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={totalPages}
          pageCount={totalPages}
          previousLabel="<"
          renderOnZeroPageCount={null}
          containerClassName="pagination" // Custom CSS class
          activeClassName="active" // Active page styling
        />
      </div>
      <AuthorityModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        adminData={isEditMode ? selectedAdmin : null}
        existingAdmins={applications}
      />
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
