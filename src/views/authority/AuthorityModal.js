import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../styles/authority/AuthorityModal.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/* 권한 관리 모달 */
const AuthorityModal = ({ show, onClose, onSave, adminData, existingAdmins }) => {
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isStandardChecked, setIsStandardChecked] = useState(false);
  const [initialRole, setInitialRole] = useState('');
  const [initialStandardChecked, setInitialStandardChecked] = useState(false);
  const [queryResult, setQueryResult] = useState([]);

  const fetchAdminData = useCallback(async (authId) => {
    try {
      const response = await axios.get(`/api/auth/admin/${authId}`);
      const data = response.data.data;
      setRole(data.userRole);
      setUserId(data.userId || '');
      setUserName(data.userName || '');
      setIsStandardChecked(data.detailRole === 'Y');
      setInitialRole(data.userRole);
      setInitialStandardChecked(data.detailRole === 'Y');
      setQueryResult([
        {
          id: adminData.authId,
          role: data.userRole,
          name: `${data.userName}(${data.userId})`,
          permissions: {
            standardDataManagement: data.detailRole === 'Y',
          },
        },
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  }, [adminData]);

  useEffect(() => {
    if (show) {
      if (adminData) {
        fetchAdminData(adminData.authId);
      } else {
        resetForm();
      }
    }
  }, [show, adminData, fetchAdminData]);

  const resetForm = () => {
    setRole('');
    setUserId('');
    setUserName('');
    setIsStandardChecked(false);
    setInitialRole('');
    setInitialStandardChecked(false);
    setQueryResult([]);
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    if (selectedRole === 'MASTER') {
      setIsStandardChecked(true);
    } else {
      setIsStandardChecked(false);
    }

    setQueryResult(prevResult => {
      if (prevResult.length > 0) {
        return [{
          ...prevResult[0],
          role: selectedRole,
          permissions: {
            standardDataManagement: selectedRole === 'MASTER',
          }
        }];
      } else {
        return prevResult;
      }
    });
  };

  const handleQuery = async () => {
    try {
      if (!role) {
        alert('권한을 선택하세요');
        return;
      }
      if (!userId) {
        alert('사번을 입력하세요');
        return;
      }

      const existingAdmin = existingAdmins.find(admin => admin.userId === userId);
      if (existingAdmin) {
        alert('이미 존재하는 관리자입니다');
        resetForm();
        return;
      }

      const response = await axios.post(`/api/auth`, null, { params: { userId: userId } });
      const userName = response.data.data;

      setQueryResult([{
        id: 1,
        role: role,
        name: `${userName}(${userId})`,
        permissions: {
          standardDataManagement: role === 'MASTER',
        },
      }]);
      setUserName(userName);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert('본인은 조회할 수 없습니다.');
        resetForm();
      } else {
        console.error('Error fetching user name:', error);
      }
    }
  };

  const handleCheckboxChange = () => {
    if (role === 'MASTER') {
      alert('MASTER 권한의 경우 기준자료관리는 필수입니다.');
      return;
    }
    setIsStandardChecked(!isStandardChecked);

    setQueryResult(prevResult => {
      if (prevResult.length > 0) {
        return [{
          ...prevResult[0],
          permissions: {
            standardDataManagement: !isStandardChecked
          }
        }];
      } else {
        return prevResult;
      }
    });
  };

  const handleSave = async () => {
    if (!role || (!userId && !adminData)) {
      alert('권한과 사번을 입력하세요');
      return;
    }
  
    if (role === initialRole && isStandardChecked === initialStandardChecked) {
      alert('권한 또는 기준자료관리 상태가 변경되지 않았습니다');
      return;
    }
  
    const requestData = {
      userRole: role,
      userId: userId,
      userNm: userName,
      detailRole: isStandardChecked ? 'Y' : 'N',
    };
  
    try {
      if (!adminData) {
        await axios.post(`/api/auth/admin`, requestData);
        alert('추가 완료되었습니다');
      } else {
        await axios.put(`/api/auth/admin/${adminData.authId}`, requestData);
        alert('수정 완료되었습니다');
      }
      onSave();
      onClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert('이미 존재하는 관리자입니다.');
        resetForm();
      } else {
        console.error('Error saving admin:', error);
      }
    }
  };
  
  if (!show) return null;

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-container">
        <div className="modal-header">
          <h3>{adminData ? '권한 수정' : '권한 추가'}</h3>
          <button className="authority-close-button" onClick={onClose}>X</button>
        </div>
        {!adminData && <p>권한을 부여할 사람을 선택하세요</p>}
        <div className="input-group">
          <select value={role} onChange={handleRoleChange}>
            <option value="">권한 선택</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MASTER">MASTER</option>
          </select>
          {!adminData && (
            <>
              <input
                type="text"
                placeholder="사번을 입력하세요."
                value={userId}
                onChange={(e) => setUserId(e.target.value)} 
              />
              <button className="query-button" onClick={handleQuery}>조회</button>
            </>
          )}
        </div>
        {queryResult.length > 0 && (
          <table className="result-table">
            <thead>
              <tr>
                <th className="fixed-width">권한</th>
                <th className="fixed-width">이름(사번)</th>
                <th className="fixed-width">기준자료관리</th>
              </tr>
            </thead>
            <tbody>
              {queryResult.map((item) => (
                <tr key={item.id}>
                  <td className="fixed-width">{item.role}</td>
                  <td className="fixed-width">{item.name}</td>
                  <td className="fixed-width">
                    <input
                      type="checkbox"
                      checked={isStandardChecked}
                      onChange={handleCheckboxChange}
                      disabled={role === 'MASTER'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="add-modal-buttons">
          <button className="add-modal-button confirm" onClick={handleSave}>
            <span>{adminData ? '수정' : '추가'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

AuthorityModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  adminData: PropTypes.object,
  existingAdmins: PropTypes.array.isRequired, 
};

export default AuthorityModal;
