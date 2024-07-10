import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/AuthorityAddModal.css';

/* 권한 추가 모달 */
const AuthorityAddModal = ({ show, onClose }) => {
  const [role, setRole] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [queryResult, setQueryResult] = useState([]);

  useEffect(() => {
    if (!show) {
      setRole('');
      setEmployeeId('');
      setQueryResult([]);
    }
  }, [show]);

  const handleQuery = () => {
    const isMaster = role === 'MASTER';
    const result = [
      {
        id: 1,
        role: role,
        name: `고혜연(${employeeId})`,
        permissions: {
          cardManagement: isMaster,
          assetManagement: isMaster,
        },
      },
    ];
    setQueryResult(result);
  };

  const handleCheckboxChange = (index, field) => {
    setQueryResult(prevResult =>
      prevResult.map((item, idx) =>
        idx === index
          ? { ...item, permissions: { ...item.permissions, [field]: !item.permissions[field] } }
          : item
      )
    );
  };

  if (!show) return null;

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-container">
        <div className="modal-header">
          <h3>권한 추가</h3>
          <button className="close-button" onClick={onClose}>X</button>
        </div>
        <p>권한을 부여할 사람을 선택하세요</p>
        <div className="input-group">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">권한 선택</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MASTER">MASTER</option>
          </select>
          <input
            type="text"
            placeholder="사번을 입력하세요."
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <button className="query-button" onClick={handleQuery}>조회</button>
        </div>
        {queryResult.length > 0 && (
          <table className="result-table">
            <thead>
              <tr>
                <th className="fixed-width">권한</th>
                <th className="fixed-width">이름(사번)</th>
                <th className="fixed-width">명함관리</th>
                <th className="fixed-width">자산관리</th>
              </tr>
            </thead>
            <tbody>
              {queryResult.map((item, index) => (
                <tr key={item.id}>
                  <td className="fixed-width">{item.role}</td>
                  <td className="fixed-width">{item.name}</td>
                  <td className="fixed-width">
                    <input
                      type="checkbox"
                      checked={item.permissions.cardManagement}
                      onChange={() => handleCheckboxChange(index, 'cardManagement')}
                    />
                  </td>
                  <td className="fixed-width">
                    <input
                      type="checkbox"
                      checked={item.permissions.assetManagement}
                      onChange={() => handleCheckboxChange(index, 'assetManagement')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="add-modal-buttons">
          <button className="add-modal-button confirm"><span>추    가</span></button>
        </div>
      </div>
    </div>
  );
};

AuthorityAddModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AuthorityAddModal;
