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
                  previewFile: {
                    url: fileUrl,
                    name: '명함 발주내역', 
                  },
                  files: [],
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
        previewFile: null,
        files: [],
        isLoading: false,
      });
    }
  }, [show, orderType, setEmailData, selectedApplications]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      file,
      name: file.name,
    }));

    setEmailData((prevData) => ({
      ...prevData,
      files: [...prevData.files, ...newFiles],
    }));
  };

  const handleDeleteFile = (fileName) => {
    setEmailData((prevData) => ({
      ...prevData,
      files: prevData.files.filter((file) => file.name !== fileName),
    }));
  };

  const handlePreviewFileNameChange = (e) => {
    setEmailData((prevData) => ({
      ...prevData,
      previewFile: {
        ...prevData.previewFile,
        name: e.target.value,
      },
    }));
  };

  const handleSend = () => {
    setEmailData((prevData) => ({ ...prevData, isLoading: true }));
    const sendData = {
      ...emailData,
      previewFileName: emailData.previewFile?.name || '', 
      files: emailData.files.map(({ file, name }) => ({ file, name })), 
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

        <div className="scrollable-content">
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

          {emailData.previewFile && (
            <div className="email-input-group">
              
              <label htmlFor="fileName">엑셀 파일명<p className="auto-attach-note">*명함 발주내역 엑셀 파일은 자동 첨부됩니다. 필요 시 파일명을 수정하세요.</p></label>
              <input
                id="fileName"
                type="text"
                placeholder="수정할 엑셀 파일명을 입력하세요"
                value={emailData.previewFile.name}
                onChange={handlePreviewFileNameChange}
              />
              <div className="email-file-display">
                <span className="file-name">{emailData.previewFile.name}.xlsx</span>
                <div className="file-actions">
                  <button type="button" className="file-delete-button" onClick={() => handleDeleteFile(emailData.previewFile.name)}>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="email-input-group">
            <label htmlFor="file">추가 파일 첨부</label>
            <input id="file" type="file" multiple onChange={handleFileChange} />
            {emailData.files.length > 0 && (
              <div className="email-file-container">
                {emailData.files.map((file, index) => (
                  <div key={index} className="file-chip">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      className="file-delete-button"
                      onClick={() => handleDeleteFile(file.name)}
                    >
                      <img src={deleteIcon} alt="삭제" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="email-modal-buttons">
          <button
            className="email-modal-button confirm"
            onClick={handleSend}
            disabled={emailData.isLoading}
          >
            전 송
          </button>
          <button
            className="email-modal-button cancel"
            onClick={onClose}
            disabled={emailData.isLoading}
          >
            취 소
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
