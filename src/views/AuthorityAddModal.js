import React from 'react';
import PropTypes from 'prop-types';
import '../styles/AuthorityAddModal.css';

/* 권한 추가 모달 */
const AuthorityAddModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-container">
        <h3>권한 추가</h3>
        <p>권한을 부여할 사람을 선택하세요</p>
        <select>
          <option>재단본부</option>
        </select>
        <select>
          <option>총무팀 - 홍길동(2024000111)</option>
        </select>
        <select>
          <option>명함신청 관리자</option>
        </select>
        <div className="add-modal-buttons">
          <button className="add-modal-button cancel" onClick={onClose}><span>취    소</span></button>
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
