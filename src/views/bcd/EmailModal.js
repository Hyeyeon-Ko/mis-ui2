import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/bcd/EmailModal.css';
import { FadeLoader } from 'react-spinners';
import useBdcChange from '../../hooks/bdc/useBdcChange';

const inputFields = [
  {
    id: 'fromEmail',
    label: '발신자 이메일',
    placeholder: '발신자 이메일을 입력하세요',
    type: 'text',
  },
  {
    id: 'password',
    label: '발신자 비밀번호',
    placeholder: '발신자 비밀번호를 입력하세요',
    type: 'password',
  },
  {
    id: 'toEmail',
    label: '수신자 이메일',
    placeholder: '수신자 이메일을 입력하세요',
    type: 'text',
  },
  {
    id: 'subject',
    label: '이메일 제목',
    placeholder: '제목을 입력하세요',
    type: 'text',
  },
];
/* 이메일 작성 모달 */
const EmailModal = ({ show, onClose, onSend }) => {
  const { handleEmailChange, emailData, setEmailData } = useBdcChange();
  // const [emailData, setEmailData] = useState(emailModalData);

  useEffect(() => {
    if (show) {
      fetch(`/api/bsc/order/email-settings`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          setEmailData((prevData) => ({
            ...prevData,
            toEmail: data.data.toEmail,
          }));
        })
        .catch((error) => console.error('Error fetching email settings:', error));
    } else {
      setEmailData({
        fromEmail: '',
        password: '',
        toEmail: '',
        subject: '',
        body: '',
        fileName: '',
        isLoading: false,
      });
    }
  }, [show, setEmailData]);

  const handleSend = () => {
    setEmailData((prevData) => ({ ...prevData, isLoading: true }));
    const fileToSend = emailData.fileName.trim() === '' ? '명함발주' : emailData.fileName.trim();
    
    const sendData = {
      ...emailData,
      fileName: fileToSend,
    };
    
    onSend(sendData)
      .finally(() => {
        setEmailData((prevData) => ({ ...prevData, isLoading: false }));
        window.location.href = '/bcd/orderList';
        onClose();
      });
  };

  if (!show) return null;

  return (
    <div className="email-modal-overlay">
      <div className="email-modal-container">
        <h3>이메일 작성</h3>
        {inputFields.map(({ id, label, placeholder, type }) => (
          <div className="email-input-group" key={id}>
            <label htmlFor={id}>{label}</label>
            <input
              id={id}
              type={type}
              placeholder={placeholder}
              value={emailData[id]}
              onChange={handleEmailChange}
            />
          </div>
        ))}

        <div className="email-input-group">
          <label htmlFor="body">이메일 내용</label>
          <textarea
            id="body"
            placeholder="내용을 입력하세요"
            value={emailData.body}
            onChange={handleEmailChange}
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className="email-input-group">
          <label htmlFor="fileName">엑셀 파일명</label>
          <input
            id="fileName"
            type="text"
            placeholder="엑셀 파일명을 입력하세요"
            value={emailData.fileName}
            onChange={handleEmailChange}
          />
        </div>
        <div className="email-modal-buttons">
          <button
            className="email-modal-button cancel"
            onClick={onClose}
            disabled={emailData.isLoading}
          >
            <span>취소</span>
          </button>
          <button
            className="email-modal-button confirm"
            onClick={handleSend}
            disabled={emailData.isLoading}
          >
            <span>전송</span>
          </button>
        </div>
        {emailData.isLoading && (
          <div className="loading-overlay">
            <FadeLoader color="#2789FE" height={15} loading={emailData.isLoading} margin={2} radius={2} speedMultiplier={1} width={5} />
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
