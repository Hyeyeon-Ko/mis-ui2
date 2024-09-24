import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import '../../styles/docstorage/DocstorageApplyModal.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const DocstorageApplyModal = ({ show, onClose, selectedRows, onApplySuccess }) => {

  const { auth } = useContext(AuthContext);
  if (!show) return null;

  const handleApply = async (type) => {
    try {
      const applyData = {
        instCd: auth.instCd,  
        deptCd: auth.deptCd,  
        type: type,     
        detailIds: selectedRows,
      };

      await axios.post(`/api/docstorage/apply`, applyData);

      alert(`문서보관 ${type === 'A' ? '이관' : '파쇄'} 신청이 완료되었습니다.`);
      onClose(); 
      onApplySuccess(); 
    } catch (error) {
      console.error('문서보관 신청 중 오류 발생:', error);
      alert('신청에 실패했습니다.');
    }
  };

  return (
    <div className="docstorage-apply-modal-overlay">
      <div className="docstorage-apply-modal-container">
        <div className="docstorage-apply-modal-header">
          <h3>문서보관 신청 분류</h3>
          <button className="docstorage-apply-close-button" onClick={onClose}>X</button>
        </div>
        <p className="docstorage-apply-instructions">
          문서보관 신청 분류를 선택하세요.
        </p>
        <div className="docstorage-apply-tab-container">
          <button
            className="docstorage-apply-tab active"
            onClick={() => handleApply('A')}
          >
            이관 신청
          </button>
          <button
            className="docstorage-apply-tab"
            onClick={() => handleApply('B')}
          >
            파쇄 신청
          </button>
        </div>
        <hr className="modal-tab-separator" />
      </div>
    </div>
  );
};

DocstorageApplyModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRows: PropTypes.array.isRequired,
  onApplySuccess: PropTypes.func.isRequired, 
};

export default DocstorageApplyModal;
