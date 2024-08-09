import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/DocApply.css';
import '../../styles/common/Page.css';

function DocApply() {
  const { auth } = useContext(AuthContext);             
  const navigate = useNavigate();                       

  const [formData, setFormData] = useState({
    receptionDate: '',
    drafter: '',
    receiver: '',
    sender: '',
    title: '',
    purpose: '',
    userId: '',
    division: '', 
  });

  const [activeTab, setActiveTab] = useState('reception'); 

  const setDefaultValues = useCallback(() => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      receptionDate: dateString,
      drafter: auth.hngNm,
      userId: auth.userId,
      division: activeTab === 'reception' ? 'A' : 'B', 
    }));
  }, [auth.hngNm, auth.userId, activeTab]);

  useEffect(() => {
    setDefaultValues();
  }, [setDefaultValues]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDefaultValues();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      drafterId: formData.userId,
      drafter: formData.drafter,
      division: formData.division,
      sender: activeTab === 'reception' ? formData.receiver : '',
      receiver: activeTab === 'sending' ? formData.sender : '',
      docTitle: formData.title,
      purpose: formData.purpose,
      instCd: auth.instCd, 
    };
    
    try {
      const response = await fetch('/api/doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert('신청이 완료되었습니다.');
        navigate('/api/myPendingList');
      } else {
        alert('신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
      alert('신청에 실패했습니다.');
    }
  };

  return (
    <div className="content">
      <div className="doc-content">
        <h2>문서수발신</h2>
        <Breadcrumb items={['신청하기', '문서수발신']} />
        <div className='doc-main'>
          <div className="tab-container">
            <button 
              className={`tab-button ${activeTab === 'reception' ? 'active' : ''}`} 
              onClick={() => handleTabChange('reception')}
            >
              문서 수신 신청
            </button>
            <button 
              className={`tab-button ${activeTab === 'sending' ? 'active' : ''}`} 
              onClick={() => handleTabChange('sending')}
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
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>
              <div className="doc-form-group">
                <label>{activeTab === 'reception' ? '발신처' : '수신처'}</label>
                <input 
                  type="text" 
                  name={activeTab === 'reception' ? 'receiver' : 'sender'} 
                  value={activeTab === 'reception' ? formData.receiver : formData.sender} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="doc-form-group">
                <label>제 목</label>
                <textarea 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="doc-form-group">
                <label>사용 용도</label>
                <textarea 
                  name="purpose" 
                  value={formData.purpose} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className='corpDoc-form-group'>
                  <label>첨부파일</label>
                  <input
                      type="file"
                      name="attachment"
                  />
              </div>
              <div className="doc-apply-button-container">
                <CustomButton className="apply-request-button" type="submit">
                    문서 신청하기
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocApply;
