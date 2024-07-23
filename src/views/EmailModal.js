import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/EmailModal.css';

/* 이메일 작성 모달 */
const EmailModal = ({ show, onClose, onSend }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fileName, setFileName] = useState(''); 

  const handleSend = () => {
    const fileToSend = fileName.trim() === '' ? '명함발주' : fileName.trim();
    onSend(subject, body, fileToSend);
  };

  if (!show) return null;

  return (
    <div className="email-modal-overlay">
      <div className="email-modal-container">
        <h3>이메일 작성</h3>
        <input
          type="text"
          placeholder="이메일 제목을 입력하세요."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          placeholder="전송할 메일의 내용을 입력하세요."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <input
          type="text"
          placeholder="엑셀 파일 이름을 입력하세요."
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <div className="email-modal-buttons">
          <button className="email-modal-button cancel" onClick={onClose}><span>취소</span></button>
          <button className="email-modal-button confirm" onClick={handleSend}><span>전송</span></button>
        </div>
      </div>
    </div>
  );
};

EmailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
};

export default EmailModal;
