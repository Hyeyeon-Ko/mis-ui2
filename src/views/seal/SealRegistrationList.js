import React, { useState, useEffect, useContext, useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import SealRegistrationAddModal from './SealRegistrationAddModal';
import SealRegistrationUpdateModal from './SealRegistrationUpdateModal';
import ConfirmModal from '../../components/common/ConfirmModal'; 
import '../../styles/seal/SealRegistrationList.css';
import axios from 'axios';
import Pagination from '../../components/common/Pagination';
import { AuthContext } from '../../components/AuthContext';

function SealRegistrationList() {
  const { auth } = useContext(AuthContext);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); 
  const [totalPages, setTotalPages] = useState('1')
  const [currentPage, setCurrentPage] = useState('1')

  const itemsPerPage = 10;

  useEffect(() => {
    fetchSealRegistrationList(currentPage, itemsPerPage);
  }, [currentPage]);

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  const fetchSealRegistrationList = useCallback(async (pageIndex = 1, pageSize = itemsPerPage) => {
    try {
      const response = await axios.get(`/api/seal/registrationList2`, {
        // ApplyRequestDTO parameters
        userId: auth.userId || '',
        instCd: auth.instCd || '',
       // documentType: '',

        // PostPageRequest parameters
        pageIndex,
        pageSize
      });

      const data = response.data.data;
      const totalPages = data.totalPages;
      const currentPage = data.number + 1;

      if (response.data.code === 200) {
        const data2 = data.content.map(item => ({
          draftId: item.draftId,
          seal: item.sealNm,
          sealImage: item.sealImage, 
          sealImageUrl: `data:image/png;base64,${item.sealImage}`, 
          department: item.useDept,
          purpose: item.purpose,
          manager: item.manager,
          subManager: item.subManager,
          draftDate: item.draftDate,
        }));

        setFilteredApplications(data2);
        setTotalPages(totalPages);
        setCurrentPage(currentPage);
      } else {
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error fetching seal registration list:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [auth.instCd]);

  useEffect(() => {
    fetchSealRegistrationList();
  }, [fetchSealRegistrationList]);

  const handleAddApplication = () => {
    setIsAddModalOpen(true);
  };

  const handleModifyApplication = () => {
    if (selectedApplications.length === 0) {
      alert('수정할 항목을 선택하세요.');
      return;
    }
    if (selectedApplications.length > 1) {
      alert('수정할 항목을 하나만 선택하세요.');
      return;
    }
    const selectedIndex = selectedApplications[0];
    const selectedData = filteredApplications[selectedIndex];
    setSelectedDraftId(selectedData.draftId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteApplication = () => {
    if (selectedApplications.length === 0) {
      alert('삭제할 항목을 선택하세요.');
      return;
    }
    setIsConfirmModalOpen(true); 
  };

  const confirmDelete = async () => {
    try {
      const draftIdsToDelete = selectedApplications.map(index => filteredApplications[index].draftId);
      const deletePromises = draftIdsToDelete.map(draftId => 
        axios.delete(`/api/seal/register/${draftId}`)
      );
      await Promise.all(deletePromises);
  
      alert('선택한 항목이 성공적으로 삭제되었습니다.');
      fetchSealRegistrationList();
      setSelectedApplications([]);
    } catch (error) {
      console.error('Error deleting applications:', error);
      alert('선택한 항목 삭제 중 오류가 발생했습니다.');
    }
    setIsConfirmModalOpen(false); 
  };

  const handleSelectApplication = (index) => {
    setSelectedApplications((prevSelectedApplications) => {
      if (prevSelectedApplications.includes(index)) {
        return prevSelectedApplications.filter((i) => i !== index);
      } else {
        return [...prevSelectedApplications, index];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map((_, index) => index));
    }
  };

  const handleSave = () => {
    fetchSealRegistrationList();
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setSelectedApplications([]);
  };

  return (
    <div className='content'>
      <div className='seal-registration-list'>
        <h2>인장 등록대장</h2>
        <div className="seal-header-row">
          <Breadcrumb items={['인장 대장', '인장 등록대장']} />
          <div className="seal-header-buttons">
            <CustomButton className="seal-add-button" onClick={handleAddApplication}>추 가</CustomButton>
            <CustomButton className="seal-modify-button" onClick={handleModifyApplication}>수 정</CustomButton>
            <CustomButton className="seal-delete-button" onClick={handleDeleteApplication}>삭 제</CustomButton>
          </div>
        </div>
        <table className="seal-registration-table">
          <thead>
            <tr>
              <th rowSpan="2">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  checked={filteredApplications.length > 0 && selectedApplications.length === filteredApplications.length}
                />
              </th>
              <th rowSpan="2">인명</th>
              <th rowSpan="2">인영</th>
              <th rowSpan="2">사용부서</th>
              <th rowSpan="2">용도</th>
              <th colSpan="2">관리자</th>
              <th rowSpan="2">등록일</th>
            </tr>
            <tr>
              <th>정</th>
              <th>부</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app, index) => (
                <tr
                  key={index}
                  onClick={() => handleSelectApplication(index)}
                  className={selectedApplications.includes(index) ? 'selected-row' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(index)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectApplication(index);
                      }}
                    />
                  </td>
                  <td>{app.seal}</td>
                  <td>
                    <img src={app.sealImageUrl} alt="Seal" className="seal-image" />
                  </td>
                  <td>{app.department}</td>
                  <td>{app.purpose}</td>
                  <td>{app.manager}</td>
                  <td>{app.subManager}</td>
                  <td>{app.draftDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">조회된 데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination totalPages={totalPages} onPageChange={handlePageClick} />
        <SealRegistrationAddModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedApplications([]);
          }}
          onSave={handleSave}
        />
        {selectedDraftId && (
          <SealRegistrationUpdateModal
            isOpen={isUpdateModalOpen}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedApplications([]);
            }}
            onSave={handleSave}
            draftId={selectedDraftId}
          />
        )}
        {isConfirmModalOpen && (
          <ConfirmModal
            message="정말 삭제하시겠습니까?"
            onConfirm={confirmDelete}
            onCancel={() => setIsConfirmModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default SealRegistrationList;
