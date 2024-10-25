import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/bcd/EmailModal.css';
import { FadeLoader } from 'react-spinners';
import deleteIcon from '../../assets/images/delete2.png';
import useBdcChange from '../../hooks/bdc/useBdcChange';

const inputFields = [
  { id: 'fromEmail', label: '발신자 이메일', placeholder: '발신자 이메일을 입력하세요', type: 'text' },
  { id: 'password', label: '발신자 비밀번호', placeholder: '발신자 비밀번호를 입력하세요', type: 'password' },
  { id: 'toEmail', label: '수신자 이메일', placeholder: '수신자 이메일을 입력하세요', type: 'text' },
  { id: 'subject', label: '이메일 제목', placeholder: '제목을 입력하세요', type: 'text' },
];

/* 이메일 작성 모달 */
const EmailModal = ({ show, onClose, onSend, orderType, selectedApplications }) => {
  const { handleEmailChange, emailData, setEmailData } = useBdcChange();

  useEffect(() => {
    if (show) {
      const emailSettingsUrl = orderType === '명함' ? '/api/bsc/order/email-settings' : '/api/toner/order/email-settings';

      fetch(emailSettingsUrl)
        .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then((data) => {
          setEmailData((prevData) => ({
            ...prevData,
            toEmail: data.data.toEmail,
          }));

          if (orderType === '명함' && selectedApplications.length > 0) {
            fetch(`/api/bsc/order/preview?draftIds=${selectedApplications.join(',')}`)
              .then((response) => response.blob())
              .then((blob) => {
                const fileUrl = URL.createObjectURL(blob);
                setEmailData((prevData) => ({
                  ...prevData,
                  fileUrl: fileUrl, 
                  fileName: '명함 발주내역', 
                }));
              })
              .catch((error) => console.error('Error fetching preview file:', error));
          }
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
  }, [show, orderType, setEmailData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileNameWithoutExtension = file.name.endsWith('.xlsx') 
        ? file.name.slice(0, -5) 
        : file.name;
  
      setEmailData((prevData) => ({
        ...prevData,
        file: file,
        fileName: fileNameWithoutExtension,
      }));
    }
  };
  
  const handleDeleteFile = () => {
    setEmailData((prevData) => ({
      ...prevData,
      fileUrl: '',
      fileName: '',
      file: null,
    }));
  };

  const handleSend = () => {
    setEmailData((prevData) => ({ ...prevData, isLoading: true }));
    const defaultFileName = orderType === '명함' ? '명함발주' : '토너발주';
    const fileToSend = emailData.fileName.trim() === '' ? defaultFileName : emailData.fileName.trim();
    
    const sendData = {
      ...emailData,
      fileName: fileToSend,
    };

    onSend(sendData)
      .finally(() => {
        setEmailData((prevData) => ({ ...prevData, isLoading: false }));
        onClose();
      });
  };

  if (!show) return null;

  return (
    <div className="email-modal-overlay">
      <div className="email-modal-container">
        <h3>{orderType === '명함' ? '명함 발주 이메일 작성' : '토너 발주 이메일 작성'}</h3>
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
            placeholder="수정할 엑셀 파일명을 입력하세요"
            value={emailData.fileName}
            onChange={handleEmailChange}
          />
        </div>
        {emailData.fileUrl || emailData.file ? (
          <div className="email-input-group">
            <label>미리보기 파일</label>
            <div className="email-file-display">
              <span className="file-name">{emailData.fileName + ".xlsx"}</span>
              <div className="file-actions">
                <button type="button" className="file-delete-button" onClick={handleDeleteFile}>
                  <img src={deleteIcon} alt="삭제" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="email-input-group">
            <label htmlFor="file">파일 첨부</label>
            <input id="file" type="file" onChange={handleFileChange} />
          </div>
        )}
        <div className="email-modal-buttons">
          <button
            className="email-modal-button cancel"
            onClick={onClose}
            disabled={emailData.isLoading}
          >
            취소
          </button>
          <button
            className="email-modal-button confirm"
            onClick={handleSend}
            disabled={emailData.isLoading}
          >
            전송
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
  orderType: PropTypes.string.isRequired, 
};

export default EmailModal;
