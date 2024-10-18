import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import OrgChartModal from './../../components/OrgChartModal';
import '../../styles/doc/DocApply.css';
import '../../styles/common/Page.css';
import useDocChange from '../../hooks/useDocChange';

function DocApply() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('DocA');  // DocA : 문서수신 신청
  const [showOrgChart, setShowOrgChart] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [orgData, setOrgData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);

  const {handleChange, handleApplyFileChange, attachment, formData, setFormData} = useDocChange();

  const setDefaultValues = useCallback(() => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      receptionDate: dateString,
      drafter: auth.userNm,
      userId: auth.userId,
      division: activeTab === 'DocA' ? 'A' : 'B',
    }));
  }, [auth.userNm, auth.userId, activeTab, setFormData]);

  useEffect(() => {
    setDefaultValues();
  }, [setDefaultValues]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDefaultValues();
  };

  /**
   * @handleApplyRequest 문서수발신 신청 요청
   * 1. 신청폼 validation 진
   * 2. 신청자 소속팀 및 직급에 따라, 신청 request 유형 총 5가지
   *    1) 수신 신청
   *      - handleReceiveLeaderRequest
   *      - handleReceiveRequest
   *    2) 발신 신청
   *      - handleSendLeaderRequest
   *      - autoSelectApproversAndSubmit
   *      - fetchOrgChart
   *  */  
  //  
  
  const handleApplyRequest = (e) => {
    e.preventDefault();
  
    // 1. DocForm validation
    const requiredInputs = {
      to: (activeTab === 'DocA') ? formData.sender : formData.receiver,  // 수신 신청일 땐, 발신처
      title: formData.title,
      purpose: formData.purpose,
      file: attachment
    }

    const { isValid, message } = validateForm(activeTab, requiredInputs, '', '');
    if (!isValid) {
        alert(message);
        return;
    }
  
    // 2. Apply Request
    if (formData.division === 'A') {
      if (auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2') {
        handleReceiveLeaderRequest();
      } else {
        handleReceiveRequest();
      }
    } else {
      if ((auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2') && auth.roleNm !== '팀원') {
        handleSendLeaderRequest();
      } else {
        if (auth.roleNm !== '팀원') {
          autoSelectApproversAndSubmit(); 
        } else {
          fetchOrgChart(); 
        }
      }
    }
  };
  
  // 2-1-1. 문서 수신신청 1
  const handleReceiveRequest = async () => {
    const payload = new FormData();
  
    payload.append('docRequest', new Blob([JSON.stringify({
      drafterId: formData.userId,
      drafter: formData.drafter,
      division: formData.division,
      receiver: '',
      sender: formData.sender, 
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
        navigate('/myPendingList');
      } else {
        alert('문서 수신 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
      alert('문서 수신 신청에 실패했습니다.');
    }
  };

  // 2-1-2. 문서 수신신청 2
  const handleReceiveLeaderRequest = async () => {
    const payload = new FormData();
  
    payload.append('docRequest', new Blob([JSON.stringify({
      drafterId: formData.userId,
      drafter: formData.drafter,
      division: formData.division,
      receiver: '',
      sender: formData.sender, 
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
      const response = await fetch('/api/doc/receive/leader', {
        method: 'POST',
        body: payload,
      });
      if (response.ok) {
        alert('문서 수신 신청이 완료되었습니다.');
        navigate('/myApplyList');
      } else {
        alert('문서 수신 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
      alert('문서 수신 신청에 실패했습니다.');
    }

  }
  
  const handleSendRequest = async (approvers) => {
    const payload = new FormData();

    payload.append('docRequest', new Blob([JSON.stringify({
      drafterId: formData.userId,
      drafter: formData.drafter,
      division: formData.division,
      sender: '', 
      receiver: formData.receiver, 
      docTitle: formData.title,
      purpose: formData.purpose,
      instCd: auth.instCd,
      deptCd: auth.deptCd,
      approverIds: approvers.map(user => user.userId), 
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
        navigate('/myPendingList');
      } else {
        alert('문서 발신 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
      alert('문서 발신 신청에 실패했습니다.');
    }
  };
  
  // 2-2-2. 문서 발신신청 2
  const autoSelectApproversAndSubmit = async () => {
      try {
        const response = await axios.get('/api/info/confirm', { params: { instCd: auth.instCd } });

        if (response.data && response.data.data) {
          const {
            teamLeaderId,
            teamLeaderNm,
            teamLeaderRoleNm,
            teamLeaderPositionNm,
            teamLeaderDept,
            managerId,
            managerNm,
            managerRoleNm,
            managerPositionNm,
            managerDept,
          } = response.data.data[0];

          const teamLeader = {
            userId: teamLeaderId,
            userNm: teamLeaderNm,
            positionNm: teamLeaderPositionNm,
            roleNm: teamLeaderRoleNm,
            department: teamLeaderDept,
            status: '대기',
            docType: '문서수발신',
            seq: 1,
          };

          const manager = {
            userId: managerId,
            userNm: managerNm,
            positionNm: managerPositionNm,
            roleNm: managerRoleNm,
            department: managerDept,
            status: '대기',
            docType: '문서수발신',
            seq: 2,
          };

          const approvers = [manager, teamLeader];
          setSelectedUsers(approvers); 
          
          handleSendRequest(approvers);  

        }
      } catch (error) {
        console.error('Error fetching confirm data:', error);
      }
    };

  // 2-2-1. 문서 발신신청 1
  const handleSendLeaderRequest = async () => {
    const payload = new FormData();
  
    payload.append('docRequest', new Blob([JSON.stringify({
      drafterId: formData.userId,
      drafter: formData.drafter,
      division: formData.division,
      sender: '',
      receiver: formData.receiver,
      docTitle: formData.title,
      purpose: formData.purpose,
      instCd: auth.instCd,
      deptCd: auth.deptCd,
      approverIds: [],
    })], {
      type: 'application/json'
    }));
  
    if (attachment) {
      payload.append('file', attachment);
    }
  
    try {
      const response = await fetch('/api/doc/send/leader', {
        method: 'POST',
        body: payload,
      });
      if (response.ok) {
        alert('문서 발신 신청이 완료되었습니다.');
        navigate('/myPendingList');
      } else {
        alert('문서 발신 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
      alert('문서 발신 신청에 실패했습니다.');
    }
  };  

  // 2-2-3. 문서 발신신청 3
  const fetchOrgChart = () => {
    const { instCd } = auth;
    axios.get(`/api/std/orgChart`, { params: { instCd } })
      .then(response => {
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
    handleSendRequest(selectedUsers);
};

  return (
    <div className="content">
      <div className="doc-content">
        <h2>문서수발신</h2>
        <Breadcrumb items={['신청하기', '문서수발신']} />
        <div className='doc-main'>
          <div className="tab-container">
            <button
              className={`tab-button ${activeTab === 'DocA' ? 'active' : ''}`}
              onClick={() => handleTabChange('DocA')}
            >
              문서 수신 신청
            </button>
            <button
              className={`tab-button ${activeTab === 'DocB' ? 'active' : ''}`}
              onClick={() => handleTabChange('DocB')}
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
                <label>{activeTab === 'DocA' ? '발신처' : '수신처'} <span>*</span></label>
                <input
                  type="text"
                  name={activeTab === 'DocA' ? 'sender' : 'receiver'}
                  value={activeTab === 'DocA' ? formData.sender : formData.receiver}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="doc-form-group">
                <label>제 목 <span>*</span></label>
                <textarea
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="doc-form-group">
                <label>사용목적 <span>*</span></label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='doc-form-group'>
                <label>첨부파일 <span>*</span></label>
                <text> 접수문서 첫 페이지를 스캔해 첨부해주세요.</text>
                <input
                  type="file"
                  name="attachment"
                  onChange={handleApplyFileChange}
                  required
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
