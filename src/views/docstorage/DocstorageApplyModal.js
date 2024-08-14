import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/DocstorageAddModal.css';

const DocstorageApplyModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="docstorage-apply-modal-overlay">
      <div className="docstorage-apply-modal-container">
        <div className="docstorage-apply-modal-header">
          <h3>문서보관 항목 추가</h3>
          <button className="docstorage-apply-close-button" onClick={onClose}>X</button>
        </div>
        <p className="docstorage-apply-instructions">
          엑셀 파일 첨부 혹은 직접 입력으로 렌탈제품을 추가하세요.
        </p>
        <div className="docstorage-apply-tab-container">
          <button className="docstorage-apply-tab active">
            파일 첨부하기
          </button>
          <button className="docstorage-apply-tab">
            직접 입력하기
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
};

export default DocstorageApplyModal;
