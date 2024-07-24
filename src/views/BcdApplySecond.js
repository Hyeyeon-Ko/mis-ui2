import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../components/common/Breadcrumb';
import CustomButton from '../components/common/CustomButton';
import FinalConfirmationModal from '../views/FinalConfirmationModal';
import PreviewModal from '../views/PreviewModal'; 
import { AuthContext } from '../components/AuthContext';
import '../styles/BcdApplySecond.css';
import '../styles/common/Page.css';

import backImage_eng from '../assets/images/backimage_eng.png';
import backImage_company from '../assets/images/backimage_company.png';

function BcdApplySecond() {
  const { auth } = useContext(AuthContext);             
  const location = useLocation();                       
  const navigate = useNavigate();                       
  const isOwn = location.pathname === '/api/bcd/own';   

  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    center: '',
    department: '',
    team: '',
    teamNm: '', 
    position: '',
    phone1: '',
    phone2: '',
    phone3: '',
    fax1: '',
    fax2: '',
    fax3: '',
    mobile1: '',
    mobile2: '',
    mobile3: '',
    email: '',
    address: '',
    quantity: 1,
    cardType: 'personal',
    userId: '',
    engAddress: '',
    engPosition: '',
    engTeam: '',
  });

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
    gradeMap: {}
  });

  const [addressOptions, setAddressOptions] = useState([]); 
  const [floor, setFloor] = useState(''); 

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
          userId: userId,
        }));
      } else {
        console.error('No data found for the user');
        alert('사용자 정보를 불러오는 중 오류가 발생했습니다. 유효한 사번을 입력하세요.');
      }
    } catch (error) {
      console.error('Error fetching user info:', error.response ? error.response.data : error.message);
      alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const fetchBcdStd = async () => {
    try {
      const response = await axios.get('/api/std/bcd');
      if (response.data && response.data.data) {
        const data = response.data.data;
        const instMap = {};
        const deptMap = {};
        const teamMap = {};
        const gradeMap = {};

        data.instInfo.forEach(inst => instMap[inst.detailNm] = inst.detailCd);
        data.deptInfo.forEach(dept => deptMap[dept.detailNm] = dept.detailCd);
        data.teamInfo.forEach(team => teamMap[team.detailNm] = team.detailCd);
        data.gradeInfo.forEach(grade => gradeMap[grade.detailNm] = grade.detailCd);

        setMappings({ instMap, deptMap, teamMap, gradeMap });
        setBcdData(data);
      } else {
        console.error('No standard data found');
        alert('기준자료를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error fetching BCD standard data:', error.response ? error.response.data : error.message);
      alert('기준자료를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleInputClick = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      e.preventDefault();
    }
  };
  

  const handleLookupUser = async () => {
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
        console.error('No data found for the user');
        alert('사용자 정보를 불러오는 중 오류가 발생했습니다. 유효한 사번을 입력하세요.');
      }
    } catch (error) {
      console.error('Error fetching user info:', error.response ? error.response.data : error.message);
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
      'fax2', 'fax3', 'mobile1', 'mobile2', 'mobile3', 'email', 'address'
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
    setShowFinalConfirmationModal(true);
  };

  const handleConfirmRequest = async () => {
    setShowFinalConfirmationModal(false);

    const requestData = {
      drafter: auth.hngNm,
      drafterId: auth.userId,
      userId: formData.userId,
      korNm: formData.name,
      engNm: `${formData.lastName} ${formData.firstName}`,
      instCd: mappings.instMap[formData.center],
      deptCd: mappings.deptMap[formData.department],
      teamCd: mappings.teamMap[formData.team],
      teamNm: formData.team,
      gradeCd: mappings.gradeMap[formData.position],
      extTel: `${formData.phone1}-${formData.phone2}-${formData.phone3}`,
      faxTel: `${formData.fax1}-${formData.fax2}-${formData.fax3}`,
      phoneTel: `${formData.mobile1}-${formData.mobile2}-${formData.mobile3}`,
      email: `${formData.email}@kmi.or.kr`,
      address: formData.address,
      engAddress: formData.engAddress,
      division: formData.cardType === 'personal' ? 'B' : 'A',
      quantity: formData.quantity,
    };

    try {
      const response = await axios.post('/api/bcd/', requestData);
      console.log('Confirm Request Response:', response.data);
      if (response.data.code === 200) {
        alert('명함 신청이 완료되었습니다.');
        navigate('/api/myApplyList');
      } else {
        alert('명함 신청 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('명함 신청 중 오류가 발생했습니다.');
    }
  };

  const handleCenterChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    const selectedCenter = e.target.value;
    const selectedInstInfo = bcdData.instInfo.find(inst => inst.detailNm === selectedCenter);
  
    const addressOptions = [];
    let engAddress = '';
    if (selectedInstInfo) {
      if (selectedInstInfo.etcItem1) {
        addressOptions.push(selectedInstInfo.etcItem1);
        engAddress = selectedInstInfo.etcItem2; 
      }
      if (selectedInstInfo.etcItem3) {
        addressOptions.push(selectedInstInfo.etcItem3);
        engAddress = selectedInstInfo.etcItem4; 
      }
      if (selectedInstInfo.etcItem5) {
        addressOptions.push(selectedInstInfo.etcItem5);
        engAddress = selectedInstInfo.etcItem6; 
      }
    }
  
    setAddressOptions(addressOptions);
    setFormData({ ...formData, center: selectedCenter, address: addressOptions[0] || '', engAddress, department: '', team: '' });
  };
    
  const handleTeamChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    const selectedTeam = e.target.value;
    const selectedTeamInfo = bcdData.teamInfo.find(team => team.detailNm === selectedTeam);
    const engTeam = selectedTeamInfo ? selectedTeamInfo.etcItem1 : '';
  
    setFormData({ ...formData, team: selectedTeam, engTeam });
  };
  
  const handlePositionChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    const selectedPosition = e.target.value;
    const selectedPositionInfo = bcdData.gradeInfo.find(position => position.detailNm === selectedPosition);
    const engPosition = selectedPositionInfo ? selectedPositionInfo.etcItem1 : '';
  
    setFormData({ ...formData, position: selectedPosition, engPosition });
  };

  const handleDepartmentChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    setFormData({ ...formData, department: e.target.value, team: '' });
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    setPreviewVisible(true);
  };

  const handleAddressChange = (e) => {
    if (!formData.userId) {
      alert('사번 조회를 통해 명함 대상자를 선택하세요.');
      return;
    }
    const updatedAddress = e.target.value + (floor ? `, ${floor}` : '');
    setFormData({ ...formData, address: updatedAddress });
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
  
    const originalEngAddress = bcdData.instInfo.find(inst => inst.detailNm === formData.center)?.etcItem2 || '';
    const updatedEngAddress = updatedFloor ? `${updatedFloor}F, ${originalEngAddress}` : originalEngAddress;
  
    setFormData({ ...formData, address: updatedAddress, engAddress: updatedEngAddress });
  };
                  
  return (
    <div className="content">
      <div className="apply-content">
        <h2>명함신청</h2>
        <Breadcrumb items={['신청하기', '명함신청']} />
        <div className="form-wrapper">
          <form className="business-card-form">
            <div className="form-left">
              <div className="form-group">
                <label className="bold-label">명함 대상자 선택</label>
                {isOwn ? (
                  <input type="text" value={`${formData.name} (${formData.userId})`} readOnly />
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
                    onClick={handleInputClick}
                  />
                  <label htmlFor="personal">[뒷면] 영문 명함</label>
                  <input
                    type="radio"
                    id="company"
                    name="cardType"
                    value="company"
                    checked={formData.cardType === 'company'}
                    onChange={handleCardTypeChange}
                    onClick={handleInputClick}
                  />
                  <label htmlFor="company">[뒷면] 회사 정보</label>
                </div>
                <div className="image-preview">
                  {formData.cardType === 'personal' && (
                    <img src={backImage_eng} alt="영문 명함" className="card-preview" />
                  )}
                  {formData.cardType === 'company' && (
                    <img src={backImage_company} alt="회사 정보" className="card-preview" />
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
                <div className="sub-label2">(수량 단위: 1 * 100매입)</div>
              </div>
            </div>
            <div className="form-right">
              <div className="form-group-horizontal">
                <label className="bold-label">명함 정보 입력</label>
                <CustomButton type="button" className="preview-button" onClick={handlePreview}>명함시안 미리보기</CustomButton>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">이 름</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required readOnly={!isOwn} onClick={handleInputClick} />
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">영문 이름</label>
                <div className="name-inputs">
                  <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required className="english-name" onClick={handleInputClick} />
                  <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required className="english-name" onClick={handleInputClick} />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">센 터</label>
                <select name="center" value={formData.center} onChange={handleCenterChange} required onClick={handleInputClick}>
                  <option value="">선택하세요</option>
                  {bcdData.instInfo.map((center) => (
                    <option key={center.detailCd} value={center.detailNm}>{center.detailNm}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">부 서</label>
                <select name="department" value={formData.department} onChange={handleDepartmentChange} required onClick={handleInputClick}>
                  <option value="">선택하세요</option>
                  {bcdData.deptInfo
                    .filter((dept) => dept.etcItem1 === mappings.instMap[formData.center])
                    .map((department) => (
                      <option key={department.detailCd} value={department.detailNm}>{department.detailNm}</option>
                    ))}
                </select>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">팀 명</label>
                <select name="team" value={formData.team} onChange={handleTeamChange} required onClick={handleInputClick}>
                  <option value="">선택하세요</option>
                  {bcdData.teamInfo
                    .filter((team) => team.etcItem1 === mappings.deptMap[formData.department])
                    .map((team) => (
                      <option key={team.detailCd} value={team.detailNm}>{team.detailNm}</option>
                    ))}
                </select>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">직위 / 직책</label>
                <select name="position" value={formData.position} onChange={handlePositionChange} required onClick={handleInputClick}>
                  <option value="">선택하세요</option>
                  {bcdData.gradeInfo.map((position) => (
                    <option key={position.detailCd} value={position.detailNm}>{position.detailNm}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">내선 번호</label>
                <div className="phone-inputs">
                  <input type="tel" name="phone1" value={formData.phone1} onChange={handleChange} required className="phone-number" onClick={handleInputClick} />
                  <input type="tel" name="phone2" value={formData.phone2} onChange={handleChange} required className="phone-number" onClick={handleInputClick} />
                  <input type="tel" name="phone3" value={formData.phone3} onChange={handleChange} required className="phone-number" onClick={handleInputClick} />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">팩스 번호</label>
                <div className="phone-inputs">
                  <input type="tel" name="fax1" value={formData.fax1} onChange={handleChange} required className="phone-number" onClick={handleInputClick} />
                  <input type="tel" name="fax2" value={formData.fax2} onChange={handleChange} required className="phone-number" onClick={handleInputClick} />
                  <input type="tel" name="fax3" value={formData.fax3} onChange={handleChange} required className="phone-number" onClick={handleInputClick} />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">휴대폰 번호</label>
                <div className="phone-inputs">
                  <input type="tel" name="mobile1" value={formData.mobile1} onChange={handleChange} required className="phone-number" onClick={handleInputClick} />
                  <input type="tel" name="mobile2" value={formData.mobile2} onChange={handleChange} required className="phone-number" onClick={handleInputClick} />
                  <input type="tel" name="mobile3" value={formData.mobile3} onChange={handleChange} required className="phone-number" onClick={handleInputClick} />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">메일 주소</label>
                <div className="email-input">
                  <input type="text2" name="email" value={formData.email} onChange={handleChange} required className="email-full" onClick={handleInputClick} />
                  <span>@ kmi.or.kr</span>
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">주소</label>
                <select name="address" value={formData.address.split(',')[0]} onChange={handleAddressChange} required className="address-select" onClick={handleInputClick}>
                  {addressOptions.map((address, index) => (
                    <option key={index} value={address}>{address}</option>
                  ))}
                </select>
                <input type="text3" value={floor} onChange={handleFloorChange} required className="floor-input" onClick={handleInputClick} />층
              </div>
            </div>
          </form>
        </div>
        <div className="apply-buttons-container">
          <CustomButton className="apply-request-button" onClick={handleApplyRequest}>명함 신청하기</CustomButton>
        </div>
      </div>
      <FinalConfirmationModal 
        show={showFinalConfirmationModal} 
        onClose={() => setShowFinalConfirmationModal(false)} 
        applicant={{ name: auth.hngNm, id: auth.userId }}
        recipient={{ name: formData.name, id: formData.userId }}
        cardType={formData.cardType === 'personal' ? '[뒷면] 영문 명함' : '[뒷면] 회사 정보'}
        quantity={formData.quantity}
        onConfirm={handleConfirmRequest}
        title="최종 신청 확인"
        confirmButtonText="신 청"
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
