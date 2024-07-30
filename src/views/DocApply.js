import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import CustomButton from '../components/common/CustomButton';
import '../styles/DocApply.css';
import '../styles/common/Page.css';

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
  });

  const [activeTab, setActiveTab] = useState('reception'); 

  useEffect(() => {
    setDefaultValues();
  }, [auth.hngNm, auth.userId, activeTab]);

  const setDefaultValues = () => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      receptionDate: dateString,
      drafter: auth.hngNm,
      userId: auth.userId,
    }));
  };

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
    console.log('Submitting form data:', formData);
    alert('신청이 완료되었습니다.');
    navigate('/api/myPendingList'); 
  };

  return (
    <div className="content">
      <div className="doc-content">
        <h2>문서수발신</h2>
        <Breadcrumb items={['신청하기', '문서수발신']} />
        <div className="doc-apply-content">
          <div className="tab-container">
            <button 
              className={`tab-button ${activeTab === 'reception' ? 'active' : ''}`} 
              onClick={() => handleTabChange('reception')}
            >
              문서 수신
            </button>
            <button 
              className={`tab-button ${activeTab === 'sending' ? 'active' : ''}`} 
              onClick={() => handleTabChange('sending')}
            >
              문서 발신
            </button>
          </div>
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
          </form>
          <div className="doc-apply-button-container">
            <CustomButton className="apply-request-button" type="submit">
                문서 신청하기
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocApply;
