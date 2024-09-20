import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import OrgChartModal from './../../components/OrgChartModal';
import '../../styles/doc/DocApply.css';
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

  const [attachment, setAttachment] = useState(null);
  const [activeTab, setActiveTab] = useState('reception');
  const [showOrgChart, setShowOrgChart] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [orgData, setOrgData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);

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

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const validateForm = () => {
    const requiredFields = ['drafter', 'title', 'purpose'];
    if (activeTab === 'reception') {
      requiredFields.push('receiver');
    } else {
      requiredFields.push('sender');
    }

    return requiredFields.every((field) => formData[field].trim() !== '');
  };

  const handleApplyRequest = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (formData.division === 'A') {
      handleReceiveRequest();
    } else {
      fetchOrgChart();
    }
  };

  const handleReceiveRequest = async () => {
    const payload = new FormData();
  
    payload.append('docRequest', new Blob([JSON.stringify({
      drafterId: formData.userId,
      drafter: formData.drafter,
      division: formData.division,
      receiver: '',
      sender: formData.receiver, 
      docTitle: formData.title,
      purpose: formData.purpose,
      instCd: auth.instCd,
      deptCd: auth.deptCd,
    })], {
      type: 'application/json'
    }));
  
    if (attachment) {
      payload.append('file', attachment);
    }
  
    try {
      const response = await fetch('/api/doc/receive', {
        method: 'POST',
        body: payload,
      });
      if (response.ok) {
        alert('문서 수신 신청이 완료되었습니다.');
        navigate('/api/myPendingList');
      } else {
        alert('문서 수신 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
      alert('문서 수신 신청에 실패했습니다.');
    }
  };
  
  const handleSendRequest = async () => {
    const payload = new FormData();
  
    payload.append('docRequest', new Blob([JSON.stringify({
      drafterId: formData.userId,
      drafter: formData.drafter,
      division: formData.division,
      sender: '', 
      receiver: formData.sender, 
      docTitle: formData.title,
      purpose: formData.purpose,
      instCd: auth.instCd,
      deptCd: auth.deptCd,
      approverIds: selectedUsers.map(user => user.userId),
    })], {
      type: 'application/json'
    }));
  
    if (attachment) {
      payload.append('file', attachment);
    }
  
    try {
      const response = await fetch('/api/doc/send', {
        method: 'POST',
        body: payload,
      });
      if (response.ok) {
        alert('문서 발신 신청이 완료되었습니다.');
        navigate('/api/myPendingList');
      } else {
        alert('문서 발신 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
      alert('문서 발신 신청에 실패했습니다.');
    }
  };
  
  const fetchOrgChart = () => {
    const { instCd } = auth;
    axios.get(`/api/std/orgChart`, { params: { instCd } })
      .then(response => {
        console.log(response);
        setOrgData(response.data.data);
        setExpandedNodes({});
        setShowOrgChart(true);
      })
      .catch(error => console.error('Error fetching organization data:', error));
    
  };

  const handleToggle = (detailCd) => {
    setExpandedNodes((prevState) => ({
      ...prevState,
      [detailCd]: !prevState[detailCd],
    }));
  };

  const hasChildren = (detailCd) => {
    return orgData.some(dept => dept.parentCd === detailCd);
  };

  const fetchTeamMembers = (detailCd) => {
    axios.get(`/api/info/orgChart`, { params: { detailCd } })
      .then(response => {
        setTeamMembers(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching team members:', error);
      });
  };

  const renderOrgTree = (parentId, level = 0) => {
    const children = orgData.filter(dept => dept.parentCd === parentId);
    if (children.length === 0) return null;

    return (
      <ul className="org-list">
        {children.map(dept => (
          <li key={dept.detailCd} className={`org-item level-${level}`}>
            <div className="org-item-header" onClick={() => hasChildren(dept.detailCd) && handleToggle(dept.detailCd)}>
              {hasChildren(dept.detailCd) ? (
                <span className="toggle-button">
                  {expandedNodes[dept.detailCd] ? '∧' : '∨'}
                </span>
              ) : (
                <span className="no-toggle"></span>
              )}
              <span className={`icon ${hasChildren(dept.detailCd) ? 'folder-icon' : 'file-icon'}`}></span>
              <span onClick={() => fetchTeamMembers(dept.detailCd)}>{dept.detailNm}</span>
            </div>
            {expandedNodes[dept.detailCd] && renderOrgTree(dept.detailCd, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  const handleOrgChartConfirm = () => {
    setShowOrgChart(false);
    handleSendRequest();
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
            <form className="doc-form">
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
              <div className='doc-form-group'>
                <label>첨부파일</label>
                <input
                  type="file"
                  name="attachment"
                  onChange={handleFileChange}
                />
              </div>
              <div className="doc-apply-button-container">
                <CustomButton className="apply-request-button" type="button" onClick={handleApplyRequest}>
                  문서 신청하기
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showOrgChart && (
        <OrgChartModal
          show={showOrgChart}
          onClose={() => setShowOrgChart(false)}
          onConfirm={handleOrgChartConfirm}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          renderOrgTree={renderOrgTree}
          teamMembers={teamMembers}
          mode="doc"
        />
      )}
    </div>
  );
}

export default DocApply;
