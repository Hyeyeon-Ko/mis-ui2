import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/EmailModal.css';
import { FadeLoader } from 'react-spinners';

/* 이메일 작성 모달 */
const EmailModal = ({ show, onClose, onSend }) => {
  const [fromEmail, setFromEmail] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetch('/api/bsc/order/email-settings')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setFromEmail(data.data.fromEmail);
          setToEmail(data.data.toEmail);
        })
        .catch(error => console.error('Error fetching email settings:', error));
    } else {
      setSubject('');
      setBody('');
      setFileName('');
      setIsLoading(false); 
    }
  }, [show]);

  const handleSend = () => {
    setIsLoading(true);
    const fileToSend = fileName.trim() === '' ? '명함발주' : fileName.trim();
    const emailData = {
      fromEmail,
      toEmail,
      subject,
      body,
      fileName: fileToSend,
    };
    console.log('Sending email data: ', emailData);
    onSend(emailData).finally(() => {
      setIsLoading(false); 
      window.location.href = '/api/bcd/orderList'; 
      onClose(); 
    });
  };

  if (!show) return null;

  return (
    <div className="email-modal-overlay">
      <div className="email-modal-container">
        <h3>이메일 작성</h3>
        <div className="email-input-group">
          <label>발신자 이메일</label>
          <input
            type="text"
            placeholder="발신자 이메일을 입력하세요"
            value={fromEmail}
            readOnly
          />
        </div>
        <div className="email-input-group">
          <label>수신자 이메일</label>
          <input
            type="text"
            placeholder="수신자 이메일을 입력하세요"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
          />
        </div>
        <div className="email-input-group">
          <label>제목</label>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="email-input-group">
          <label>내용</label>
          <textarea
            placeholder="내용을 입력하세요"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className="email-input-group">
          <label>엑셀 파일명</label>
          <input
            type="text"
            placeholder="엑셀 파일명을 입력하세요"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        <div className="email-modal-buttons">
          <button className="email-modal-button cancel" onClick={onClose} disabled={isLoading}>
            <span>취소</span>
          </button>
          <button className="email-modal-button confirm" onClick={handleSend} disabled={isLoading}>
            <span>전송</span>
          </button>
        </div>
        {isLoading && (
          <div className="loading-overlay">
            <FadeLoader color="#2789FE" height={15} loading={isLoading} margin={2} radius={2} speedMultiplier={1} width={5} />
          </div>
        )}
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
