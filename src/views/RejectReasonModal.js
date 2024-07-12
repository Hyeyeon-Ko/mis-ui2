import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/RejectReasonModal.css';

/* 반려 사유 모달 */
const RejectReasonModal = ({ show, onClose }) => {

  // 반려 사유를 저장하는 상태 관리
  const [reason, setReason] = useState('');

  // 텍스트 영역의 변경 핸들러
  const handleTextareaChange = (event) => {
    setReason(event.target.value);
  };

  // 모달이 표시되지 않으면 null 반환
  if (!show) return null;

  return (
    <div className="reject-modal-overlay">
      <div className="reject-modal-container">
        <h3>반려 사유 작성</h3>
        <textarea
          placeholder={reason ? '' : "반려 사유를 작성해주세요.\n해당 내용은 명함 신청자에게 전달됩니다."}
          value={reason}
          onChange={handleTextareaChange}
        />
        <div className="reject-modal-buttons">
          <button className="reject-modal-button cancel" onClick={onClose}><span>취    소</span></button>
          <button className="reject-modal-button confirm"><span>반    려</span></button>
        </div>
      </div>
    </div>
  );
};

// 컴포넌트의 props 타입 정의
RejectReasonModal.propTypes = {
  show: PropTypes.bool.isRequired, // 모달 표시 여부
  onClose: PropTypes.func.isRequired, // 모달 닫기 핸들러
};

export default RejectReasonModal;
