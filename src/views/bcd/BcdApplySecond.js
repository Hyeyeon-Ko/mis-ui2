import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import FinalConfirmationModal from './FinalConfirmationModal';
import PreviewModal from './PreviewModal';
import OrgChartModal from './../../components/OrgChartModal';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/bcd/BcdApplySecond.css';
import '../../styles/common/Page.css';

import backImageEng from '../../assets/images/backimage_eng.png';
import backImageCompany from '../../assets/images/backimage_company.png';
import Form from '../../components/common/Form';
import { inputValue } from '../../datas/bdcDatas';


function BcdApplySecond() {
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isOwn = location.pathname === '/bcd/own';

  const [formData, setFormData] = useState(inputValue);

  const [userIdInput, setUserIdInput] = useState('');
  const [showFinalConfirmationModal, setShowFinalConfirmationModal] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [bcdData, setBcdData] = useState({
    instInfo: [],
    deptInfo: [],
    teamInfo: [],
    gradeInfo: [],
  });

  const [mappings, setMappings] = useState({
    instMap: {},
    deptMap: {},
    teamMap: {},
    gradeMap: {},
  });

  const [addressOptions, setAddressOptions] = useState([]);
  const [floor, setFloor] = useState('');
  const [isPreviewChecked, setIsPreviewChecked] = useState(false);

  const [showOrgChart, setShowOrgChart] = useState(false); 
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const [orgData, setOrgData] = useState([]); 
  const [expandedNodes, setExpandedNodes] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (isOwn) {
      fetchUserInfo(auth.userId);
    }
    fetchBcdStd();
  }, [isOwn, auth.userId]);

  const fetchUserInfo = async (userId) => {
    try {
      const response = await axios.get(`/api/info/${userId}`);
      if (response.data && response.data.data) {
        const userData = response.data.data;
        setFormData((prevFormData) => ({
          ...prevFormData,
          name: userData.userName,
          center: userData.centerNm,
          team: userData.teamNm,
          teamNm: userData.teamNm,
          mobile1: userData.telNum.split('-')[0],
          mobile2: userData.telNum.split('-')[1],
          mobile3: userData.telNum.split('-')[2],
          email: userData.email.split('@')[0],
          userId,
        }));
      } else {
        alert('사용자 정보를 불러오는 중 오류가 발생했습니다. 유효한 사번을 입력하세요.');
      }
    } catch (error) {
      alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const fetchBcdStd = async () => {
    try {
      const response = await axios.get('/api/std/bcd');
      if (response.data && response.data.data) {
        const data = response.data.data;

        data.instInfo.sort((a, b) => a.detailNm.localeCompare(b.detailNm));
        data.deptInfo.sort((a, b) => a.detailNm.localeCompare(b.detailNm));
        data.teamInfo.sort((a, b) => {
          if (a.detailCd === '000') return -1;
          if (b.detailCd === '000') return 1;
          return a.detailNm.localeCompare(b.detailNm);
        });

        const instMap = {};
        const deptMap = {};
        const teamMap = {};
        const gradeMap = {};

        data.instInfo.forEach((inst) => { instMap[inst.detailNm] = inst.detailCd; });
        data.deptInfo.forEach((dept) => { deptMap[dept.detailNm] = dept.detailCd; });
        data.teamInfo.forEach((team) => {
          teamMap[team.detailNm] = team.detailCd;
        });

        data.gradeInfo.forEach((grade) => {
          gradeMap[grade.detailNm] = grade.detailCd;
        });

        setMappings({ instMap, deptMap, teamMap, gradeMap });
        setBcdData(data);
      } else {
        alert('기준자료를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('기준자료를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const fetchOrgChart = () => {
    const { instCd } = auth;
    axios.get(`/api/std/orgChart`, {
      params: { instCd }
    })
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
    console.log(`Fetching team members for detailCd: ${detailCd}`);
    axios.get(`/api/info/orgChart`, { params: { detailCd } })
      .then(response => {
        console.log('Team members response:', response.data); 
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
  
  // const handleInputClick = (e) => {
  //   if (!formData.userId) {
  //     alert('사번 조회를 통해 명함 대상자를 선택하세요.');
  //     e.preventDefault();
  //   }
  // };

  const handleLookupUser = async () => {
    if (!userIdInput) {
      alert('사번을 입력하세요.');
      return;
    }
    try {
      const response = await axios.get(`/api/info/${userIdInput}`);
      if (response.data && response.data.data) {
        const userData = response.data.data;

        setFormData((prevFormData) => ({
          ...prevFormData,
          name: userData.userName,
          center: userData.centerNm,
          team: userData.teamNm,
          teamNm: userData.teamNm,
          mobile1: userData.telNum.split('-')[0],
          mobile2: userData.telNum.split('-')[1],
          mobile3: userData.telNum.split('-')[2],
          email: userData.email.split('@')[0],
          userId: userIdInput,
        }));
      } else {
        alert('사용자 정보를 불러오는 중 오류가 발생했습니다. 유효한 사번을 입력하세요.');
      }
    } catch (error) {
      alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['phone1', 'phone2', 'phone3', 'fax1', 'fax2', 'fax3', 'mobile1', 'mobile2', 'mobile3'].includes(name)) {
      if (isNaN(value) || value.length > 4) return;
    }
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleCardTypeChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    setFormData((prevFormData) => ({ ...prevFormData, cardType: e.target.value }));
  };

  const handleUserIdChange = (e) => {
    setUserIdInput(e.target.value);
  };

  const validateForm = () => {
    const requiredFields = [
      'name', 'firstName', 'lastName', 'center', 'department',
      'team', 'position', 'phone1', 'phone2', 'phone3', 'fax1',
      'fax2', 'fax3', 'mobile1', 'mobile2', 'mobile3', 'email', 'address',
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return false;
      }
    }
    return true;
  };

  const handleApplyRequest = () => {
    if (!formData.name) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    if (!validateForm()) {
      alert('모든 명함 정보를 입력해주세요.');
      return;
    }
    if (!isPreviewChecked) {
      alert('명함 시안 미리보기를 확인해주세요.');
      return;
    }

    if (auth.roleNm !== '팀원' && (auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2')) {
      setSelectedUsers([]);
      setShowFinalConfirmationModal(true); 
    } else {
      if (auth.roleNm !== '팀원') {
        autoSelectApproversAndSubmit(); 
      } else {
        fetchOrgChart();
      }
    }
  };
  
  const handleOrgChartConfirm = () => {
    setShowOrgChart(false);
    setShowFinalConfirmationModal(true);
  };

  const handleConfirmRequest = async () => {
    setShowFinalConfirmationModal(false);

    const isCustomTeam = formData.team === '000';

    let teamCd, teamNm;

    if (isCustomTeam) {
      teamCd = '000';
      teamNm = formData.teamNm;
    } else {
      const selectedTeam = bcdData.teamInfo.find((team) => team.detailCd === formData.team);
      if (selectedTeam) {
        teamCd = selectedTeam.detailCd;
        teamNm = selectedTeam.detailNm;
      }
    }

    const approverIds = selectedUsers.map(user => user.userId);

    const requestData = {
      drafter: auth.hngNm,
      drafterId: auth.userId,
      userId: formData.userId,
      korNm: formData.name,
      engNm: `${formData.lastName} ${formData.firstName}`,
      instCd: mappings.instMap[formData.center],
      deptCd: mappings.deptMap[formData.department],
      teamCd: teamCd,
      teamNm: teamNm,
      engTeamNm: isCustomTeam ? formData.engTeam : null,
      gradeCd: formData.position,
      gradeNm: formData.position === '000' ? formData.gradeNm : formData.gradeNm,
      enGradeNm: formData.position === '000' ? formData.enGradeNm : null,
      extTel: `${formData.phone1}-${formData.phone2}-${formData.phone3}`,
      faxTel: `${formData.fax1}-${formData.fax2}-${formData.fax3}`,
      phoneTel: `${formData.mobile1}-${formData.mobile2}-${formData.mobile3}`,
      email: `${formData.email}@kmi.or.kr`,
      address: formData.address,
      engAddress: formData.engAddress,
      division: formData.cardType === 'personal' ? 'B' : 'A',
      quantity: formData.quantity,
      approverIds: approverIds,
      currentApproverIndex: 0,
    };

    try {
      const endpoint = (auth.roleNm !== '팀원' && (auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2')) ? '/bcd/leader' : '/bcd/';

      const response = await axios.post(endpoint, requestData);
      if (response.data.code === 200) {
        alert('명함 신청이 완료되었습니다.');
        navigate('/myPendingList');
      } else {
        alert('명함 신청 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('명함 신청 중 오류가 발생했습니다.');
    }
  };

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
          managerDept
        } = response.data.data[0];
  
        const approvers = [
          {
            userId: managerId,
            userNm: managerNm,
            positionNm: managerPositionNm,
            roleNm: managerRoleNm,
            department: managerDept,
            status: '대기',
            docType: '명함신청',
            seq: 1,
          },
          {
            userId: teamLeaderId,
            userNm: teamLeaderNm,
            positionNm: teamLeaderPositionNm,
            roleNm: teamLeaderRoleNm,
            department: teamLeaderDept,
            status: '대기',
            docType: '명함신청',
            seq: 2,
          }
        ];
  
        setSelectedUsers(approvers); 
        setShowFinalConfirmationModal(true);  
      }
    } catch (error) {
      console.error('Error fetching approvers data:', error);
      alert('결재자 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };  
    
  useEffect(() => {
  }, [formData]);
  
  const handleCenterChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    const selectedCenter = e.target.value;
    const selectedInstInfo = bcdData.instInfo.find((inst) => inst.detailNm === selectedCenter);

    const options = [];
    if (selectedInstInfo) {
      if (selectedInstInfo.etcItem1) {
        options.push({ address: selectedInstInfo.etcItem1, engAddress: selectedInstInfo.etcItem2 });
      }
      if (selectedInstInfo.etcItem3) {
        options.push({ address: selectedInstInfo.etcItem3, engAddress: selectedInstInfo.etcItem4 });
      }
      if (selectedInstInfo.etcItem5) {
        options.push({ address: selectedInstInfo.etcItem5, engAddress: selectedInstInfo.etcItem6 });
      }
    }

    setAddressOptions(options);
    setFormData({
      ...formData,
      center: selectedCenter,
      address: options[0]?.address || '',
      engAddress: options[0]?.engAddress || '',
      department: '',
      team: '',
    });
  };

  const handleDepartmentChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }

    const selectedDepartment = e.target.value;
    setFormData({ ...formData, department: selectedDepartment, team: '' });
  };

  const handleTeamChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
  
    const selectedTeam = e.target.value;
  
    if (selectedTeam === '000') { 
      setFormData({ ...formData, team: selectedTeam, teamNm: '', engTeam: '' });
    } else {
      const selectedTeamInfo = bcdData.teamInfo.find((team) => team.detailCd === selectedTeam);
  
      if (selectedTeamInfo) {
        const engTeam = selectedTeamInfo.etcItem2 || '';  
        setFormData({ ...formData, team: selectedTeam, teamNm: selectedTeamInfo.detailNm, engTeam });
      } else {
        setFormData({ ...formData, team: '', teamNm: '', engTeam: '' });  
      }
    }
  };
  
  const handlePositionChange = (e) => {
  if (!formData.userId) {
    alert('사번 조회를 통해 명함 대상자를 선택하세요.');
    return;
  }

  const selectedPosition = e.target.value;
  const selectedPositionInfo = bcdData.gradeInfo.find((position) => position.detailCd === selectedPosition);

  if (selectedPositionInfo) {
    const enGradeNm = selectedPositionInfo.etcItem2 || '';
    setFormData({
      ...formData,
      position: selectedPosition,
      gradeNm: selectedPosition === '000' ? '' : selectedPositionInfo.detailNm,
      enGradeNm: selectedPosition === '000' ? '' : enGradeNm,
    });
  } else {
    setFormData({ ...formData, position: '', gradeNm: '', enGradeNm: '' });
  }
};
  
  const fetchFilteredGradeInfo = () => {
    const selectedTeamInfo = bcdData.teamInfo.find((team) => team.detailNm === formData.team);
    const selectedEtcItem1 = selectedTeamInfo ? selectedTeamInfo.etcItem1 : '';

    const filteredGradeInfo = bcdData.gradeInfo.filter(
      (grade) => grade.etcItem1 === '000' || grade.etcItem1 === selectedEtcItem1,
    );

    return filteredGradeInfo.sort((a, b) => a.detailNm.localeCompare(b.detailNm));
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    if (!validateForm()) {
      alert('모든 명함 정보를 입력해주세요.');
      return;
    }
    setIsPreviewChecked(true);
    setPreviewVisible(true);
  };

  const handleAddressChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    const selectedAddress = addressOptions.find((option) => option.address === e.target.value);
    const updatedAddress = selectedAddress.address + (floor ? `, ${floor}` : '');
    setFormData({ ...formData, address: updatedAddress, engAddress: selectedAddress.engAddress });
  };

  const handleFloorChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    const updatedFloor = e.target.value;
    setFloor(updatedFloor);

    const baseAddress = formData.address.split(',')[0];
    const updatedAddress = `${baseAddress}${updatedFloor ? `, ${updatedFloor}` : ''}`;

    const originalEngAddress = addressOptions.find((option) => option.address === baseAddress)?.engAddress || '';
    const updatedEngAddress = updatedFloor ? `${updatedFloor}F, ${originalEngAddress}` : originalEngAddress;

    setFormData({ ...formData, address: updatedAddress, engAddress: updatedEngAddress });
  };

  return (
    <div className="content">
      <div className="apply-content">
        <h2>명함신청</h2>
        <Breadcrumb items={['신청하기', '명함신청']} />

          <Form>
            {() => {
              return (
                <div className="form-wrapper">
                  <div className="form-left">
                    <div className="form-group">
                      <label className="bold-label">명함 대상자 선택</label>
                      {isOwn ? (
                        <input className='form-name-input' type="text" value={`${formData.name} (${formData.userId})`} readOnly />
                      ) : (
                        <div className="form-horizontal">
                          <input type="text" placeholder="사번을 입력하세요." value={userIdInput} onChange={handleUserIdChange} />
                          <button type="button" className="lookup-button" onClick={handleLookupUser}>조회</button>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="bold-label">명함 종류</label>
                      <div className="card-type">
                        <input
                          type="radio"
                          id="personal"
                          name="cardType"
                          value="personal"
                          checked={formData.cardType === 'personal'}
                          onChange={handleCardTypeChange}
                        />
                        <label htmlFor="personal">[뒷면] 영문 명함</label>
                        <input
                          type="radio"
                          id="company"
                          name="cardType"
                          value="company"
                          checked={formData.cardType === 'company'}
                          onChange={handleCardTypeChange}
                        />
                        <label htmlFor="company">[뒷면] 회사 정보</label>
                      </div>
                      <div className="image-preview">
                        {formData.cardType === 'personal' && (
                          <img src={backImageEng} alt="영문 명함" className="card-preview" />
                        )}
                        {formData.cardType === 'company' && (
                          <img src={backImageCompany} alt="회사 정보" className="card-preview" />
                        )}
                      </div>
                      <div className="form-group-horizontal quantity-group">
                        <label className="bold-label">명함 수량 선택</label>
                        <div className="quantity-selector">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, quantity: Math.max(formData.quantity - 1, 1) })}
                          >
                            −
                          </button>
                          <span>{formData.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="sub-label2">(수량 단위: 1 * 200매입)</div>
                    </div>
                  </div>
                  <div className="form-right">
                    <div className="form-group-horizontal">
                      <label className="bold-label"></label>
                    </div>
                    <div className="form-group-horizontal">
                      <label className="form-label">이 름</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required readOnly={!isOwn} />
                    </div>
                    <div className="form-group-horizontal">
                      <label className="form-label">영문 이름</label>
                      <div className="name-inputs">
                        <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required className="english-name" />
                        <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required className="english-name" />
                      </div>
                    </div>
                    <div className="form-group-horizontal">
                      <label className="form-label">센 터</label>
                      <select name="center" value={formData.center} onChange={handleCenterChange} required>
                        <option value="">선택하세요</option>
                        {bcdData.instInfo.map((center) => (
                          <option key={center.detailCd} value={center.detailNm}>{center.detailNm}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group-horizontal">
                      <label className="form-label">부 서</label>
                      <select name="department" value={formData.department} onChange={handleDepartmentChange} required>
                        <option value="">선택하세요</option>
                        {bcdData.deptInfo
                          .filter((dept) =>                       dept.etcItem1 === mappings.instMap[formData.center])
                          .map((department) => (
                            <option key={department.detailCd} value={department.detailNm}>{department.detailNm}</option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group-horizontal">
                      <label className="form-label">팀</label>
                      <select
                        name="team"
                        value={formData.team}
                        onChange={handleTeamChange}
                        required
                      >
                        <option value="">선택하세요</option>
                        {bcdData.teamInfo
                          .filter(
                            (team) =>
                              team.etcItem1 === mappings.deptMap[formData.department] ||
                              team.detailCd === '000'
                          )
                          .map((team) => (
                            <option key={team.detailCd} value={team.detailCd}>
                              {team.detailCd === '000' ? team.detailNm : `${team.detailNm} | ${team.etcItem2}`}
                            </option>
                          ))}
                      </select>
                    </div>
                    {formData.team === '000' && (
                      <div className="additional-inputs">
                        <div className="form-group-horizontal">
                          <label className="form-label">팀 명</label>
                          <input
                            type="text"
                            name="teamNm"
                            value={formData.teamNm}
                            onChange={handleChange}
                            required
                            placeholder="팀명"
                           
                          />
                        </div>
                        <div className="form-group-horizontal">
                          <label className="form-label">영문 팀명</label>
                          <input
                            type="text"
                            name="engTeam"
                            value={formData.engTeam}
                            onChange={handleChange}
                            required
                            placeholder="영문 팀명"
       
                          />
                        </div>
                      </div>
                    )}
                    <div className="form-group-horizontal">
                      <label className="form-label">직위 / 직책</label>
                      <select name="position" value={formData.position} onChange={handlePositionChange} required >
                        <option value="">선택하세요</option>
                        {fetchFilteredGradeInfo().map((position) => (
                          <option key={position.detailCd} value={position.detailCd}>
                            {position.detailCd === '000' ? position.detailNm : `${position.detailNm} | ${position.etcItem2}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.position === '000' && (
                      <div className="additional-inputs">
                        <div className="form-group-horizontal">
                          <label className="form-label">직위</label>
                          <input
                            type="text"
                            name="gradeNm"
                            value={formData.gradeNm}
                            onChange={handleChange}
                            required
                            placeholder="직위"
              
                          />
                        </div>
                        <div className="form-group-horizontal">
                          <label className="form-label">영문 직위</label>
                          <input
                            type="text"
                            name="enGradeNm"
                            value={formData.enGradeNm}
                            onChange={handleChange}
                            required
                            placeholder="영문 직위"
        
                          />
                        </div>
                      </div>
                    )}
                    <div className="form-group-horizontal">
                      <label className="form-label">내선 번호</label>
                      <div className="phone-inputs">
                        <input type="tel" name="phone1" value={formData.phone1} onChange={handleChange} required className="phone-number" />
                        <input type="tel" name="phone2" value={formData.phone2} onChange={handleChange} required className="phone-number"  />
                        <input type="tel" name="phone3" value={formData.phone3} onChange={handleChange} required className="phone-number"  />
                      </div>
                    </div>
                    <div className="form-group-horizontal">
                      <label className="form-label">팩스 번호</label>
                      <div className="phone-inputs">
                        <input type="tel" name="fax1" value={formData.fax1} onChange={handleChange} required className="phone-number"  />
                        <input type="tel" name="fax2" value={formData.fax2} onChange={handleChange} required className="phone-number"  />
                        <input type="tel" name="fax3" value={formData.fax3} onChange={handleChange} required className="phone-number"  />
                      </div>
                    </div>
                    <div className="form-group-horizontal">
                      <label className="form-label">휴대폰 번호</label>
                      <div className="phone-inputs">
                        <input type="tel" name="mobile1" value={formData.mobile1} onChange={handleChange} required className="phone-number"  />
                        <input type="tel" name="mobile2" value={formData.mobile2} onChange={handleChange} required className="phone-number"  />
                        <input type="tel" name="mobile3" value={formData.mobile3} onChange={handleChange} required className="phone-number"  />
                      </div>
                    </div>
                    <div className="form-group-horizontal">
                      <label className="form-label">메일 주소</label>
                      <div className="email-input">
                        <input type="text2" name="email" value={formData.email} onChange={handleChange} required className="email-full"  />
                        <span>@ kmi.or.kr</span>
                      </div>
                    </div>
                    <div className="form-group-horizontal">
                      <label className="form-label">주소</label>
                      <select className="address-select" name="address" value={formData.address.split(',')[0]} onChange={handleAddressChange} required>
                        {addressOptions.map((option, index) => (
                          <option key={index} value={option.address}>{option.address}</option>
                        ))}
                      </select>
                      <input type="text3" value={floor} onChange={handleFloorChange} required className="floor-input"  />층
                    </div>
                  </div>                  
                </div>
                )
              }
            }
          </Form>

        <div className="apply-buttons-container">
          <CustomButton 
            type="button" 
            className="apply-preview-button" 
            onClick={handlePreview} 
            disabled={!validateForm()}
          >
            명함시안 미리보기
          </CustomButton>
          <CustomButton 
            className="apply-request-button" 
            onClick={handleApplyRequest}
          >
            명함 신청하기
          </CustomButton>
        </div>
      </div>
      <OrgChartModal
        show={showOrgChart}
        onClose={() => setShowOrgChart(false)} 
        onConfirm={handleOrgChartConfirm}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        renderOrgTree={renderOrgTree}
        teamMembers={teamMembers}
        mode="bcd" 
      />
      <FinalConfirmationModal
        show={showFinalConfirmationModal}
        onClose={() => setShowFinalConfirmationModal(false)}
        applicant={{ name: auth.hngNm, id: auth.userId }}
        recipient={{ name: formData.name, id: formData.userId }}
        cardType={formData.cardType === 'personal' ? '[뒷면] 영문 명함' : '[뒷면] 회사 정보'}
        quantity={formData.quantity}
        onConfirm={handleConfirmRequest}
      />
      <PreviewModal
        show={previewVisible}
        onClose={() => setPreviewVisible(false)}
        formData={formData}
      />
    </div>
  );
}

export default BcdApplySecond;
