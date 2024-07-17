import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/EmailModal.css';

/* 이메일 작성 모달 */
const EmailModal = ({ show, onClose, onSend }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fileName, setFileName] = useState(''); 

  const handleSubjectChange = (event) => {
    setSubject(event.target.value);
  };

  const handleBodyChange = (event) => {
    setBody(event.target.value);
  };

  const handleFileNameChange = (event) => {
    setFileName(event.target.value);
  };

  const handleSend = () => {
    const fileToSend = fileName.trim() === '' ? '명함발주' : fileName.trim();
    onSend(subject, body, fileToSend); // fileName 값 포함
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
          onChange={handleSubjectChange}
        />
        <textarea
          type="text"
          placeholder="전송할 메일의 내용을 입력하세요."
          value={body}
          onChange={handleBodyChange}
        />
        <input
          type="text"
          placeholder="엑셀 파일 이름을 입력하세요."
          value={fileName}
          onChange={handleFileNameChange}
        />
        <div className="email-modal-buttons">
          <button className="email-modal-button cancel" onClick={onClose}><span>취    소</span></button>
          <button className="email-modal-button confirm" onClick={handleSend}><span>전    송</span></button>
        </div>
      </div>
    </div>
  );
};

// 컴포넌트의 props 타입 정의
EmailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
};

export default EmailModal;
