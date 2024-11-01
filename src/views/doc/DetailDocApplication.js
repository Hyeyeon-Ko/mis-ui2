import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import axios from 'axios';
import '../../styles/doc/DocApply.css';
import '../../styles/common/Page.css';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import downloadIcon from '../../assets/images/download.png';
import deleteIcon from '../../assets/images/delete2.png'; 
import useDocChange from '../../hooks/useDocChange';

function DetailDocApplication() {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [initialData, setInitialData] = useState(null);
  const [activeTab, setActiveTab] = useState('DocA');
  const [isEdit, setIsEdit] = useState(false);
  const { file, formData, existingFile, setExistingFile, setFormData, handleChange, handleFileChange,  handleFileDelete} = useDocChange();

  const fetchDocDetail = useCallback(async (id) => {
    try {
      const response = await axios.get(`/api/doc/${id}`);
      if (response.data && response.data.data) {
        const { draftDate, division, receiver, sender, docTitle, purpose, fileName, filePath } = response.data.data;
        const fetchedData = {
          receptionDate: parseDateTime(draftDate),
          drafter: auth.userNm, 
          division: division || '',
          receiver: receiver || '',
          sender: sender || '',
          title: docTitle || '',
          purpose: purpose || '',
        };
        setFormData(fetchedData);
        setInitialData(fetchedData);
        setActiveTab(division === 'A' ? 'DocA' : 'DocB');
        setExistingFile(fileName && filePath ? { name: fileName, path: filePath } : null); 
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
    }
  }, [auth.userNm, setFormData, setExistingFile]);

  useEffect(() => {
    if (draftId) {
      fetchDocDetail(draftId);
      setIsEdit(true);
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        drafter: auth.userNm || '' 
      }));
    }
  }, [draftId, auth.userNm, fetchDocDetail, setFormData]);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleFileDownload = async ({ downloadNotes, downloadType }) => {
    
    if (existingFile) {
      try {
        const documentType = "doc";
        
        const response = await axios.get(
          `/api/file/download/${encodeURIComponent(existingFile.name)}?documentType=${encodeURIComponent(documentType)}`, 
          {
            responseType: 'blob',
          }
        );
  
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', existingFile.name); 
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } catch (error) {
        console.error('Error downloading the file:', error);
        alert('파일 다운로드에 실패했습니다.');
      }
    }
  };
      
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFileDeleted = !file && !existingFile;

    const requiredInputs = {
      to: (activeTab === 'DocA') ? formData.sender : formData.receiver,
      title: formData.title,
      purpose: formData.purpose,
      file: file || existingFile,
    };

    // validation
    const { isValid, message } = validateForm(activeTab, requiredInputs, '', '');
    
    if (!isValid) {
        alert(message);
        return;
    }

    if (JSON.stringify(formData) === JSON.stringify(initialData) && !file && !isFileDeleted) {
        navigate('/myPendingList');
        return;
    }

    try {
        const formDataToSend = new FormData();

        formDataToSend.append('docUpdateRequest', new Blob([JSON.stringify({
            drafter: formData.drafter,
            division: formData.division, 
            receiver: activeTab === 'DocA' ? null : formData.receiver,
            sender: activeTab === 'DocA' ? formData.sender : null,
            docTitle: formData.title,
            purpose: formData.purpose,
        })], { type: 'application/json' }));

        if (file) {
            formDataToSend.append('file', file);
        }

        await axios.post(`/api/doc/update?draftId=${draftId}&isFileDeleted=${isFileDeleted}`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        alert('문서 수정이 완료되었습니다');
        navigate('/MyPendingList');
    } catch (error) {
        console.error('Error submitting document:', error);
        alert('문서 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelRequest = () => {
    navigate('/myPendingList');
  }

  return (
    <div className="content">
      <div className="doc-content">
        <h2>문서수발신 수정</h2>
        <Breadcrumb items={['나의 신청내역', '승인대기 내역', '문서수발신 수정']} />
        <div className="doc-main">
          <div className="tab-container">
            <button
              className={`tab-button ${activeTab === 'DocA' ? 'active' : ''}`}
              onClick={() => setActiveTab('DocA')}
              disabled
            >
              문서 수신 신청
            </button>
            <button
              className={`tab-button ${activeTab === 'DocB' ? 'active' : ''}`}
              onClick={() => setActiveTab('DocB')}
              disabled
            >
              문서 발신 신청
            </button>
          </div>
          <div className="doc-apply-content">
            <form className="doc-form" onSubmit={handleSubmit}>
              <div className="doc-form-group">
                <label>접수 일자</label>
                <input
                  type="date"
                  name="receptionDate"
                  value={formData.receptionDate}
                  readOnly
                />
              </div>
              <div className="doc-form-group">
                <label>접수인</label>
                <input
                  type="text"
                  name="drafter"
                  value={formData.drafter}
                  readOnly
                />
              </div>
              <div className="doc-form-group">
                <label>{activeTab === 'DocA' ? '발신처' : '수신처'} <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name={activeTab === 'DocA' ? 'sender' : 'receiver'}
                  value={activeTab === 'DocA' ? formData.sender : formData.receiver}
                  onChange={handleChange}
                />
              </div>
              <div className="doc-form-group">
                <label>제 목 <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              <div className="doc-form-group">
                <label>사용목적 <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                />
              </div>
              <div className="doc-form-group file-group">
                <label>첨부 파일 <span style={{ color: 'red' }}>*</span></label>
                <p> 접수문서 첫 페이지를 스캔해 첨부해주세요.</p>
                {existingFile ? (
                    <div className="file-display">
                        <span className="file-name">{existingFile.name}</span>
                        <div className="file-actions">
                            <button
                                type="button"
                                className="download-button"
                                onClick={handleFileDownload}
                            >
                                <img src={downloadIcon} alt="다운로드" />
                            </button>
                            <button
                                type="button"
                                className="file-delete-button"
                                onClick={handleFileDelete}
                            >
                                <img src={deleteIcon} alt="삭제" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <input
                        type="file"
                        name="file"
                        className="file-input"
                        onChange={handleFileChange}
                    />
                )}
              </div>
              <div className="modify-buttons-container">
                <CustomButton className="apply-request-button" type="submit">{isEdit ? '수정완료' : '문서 신청하기'}</CustomButton>
                <CustomButton className="apply-cancel-button" onClick={handleCancelRequest}>수정취소</CustomButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailDocApplication;
