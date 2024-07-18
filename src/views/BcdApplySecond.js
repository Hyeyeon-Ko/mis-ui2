import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../components/common/Breadcrumb';
import CustomButton from '../components/CustomButton';
import FinalConfirmationModal from '../views/FinalConfirmationModal';
import { AuthContext } from '../components/AuthContext';
import '../styles/BcdApplySecond.css';
import '../styles/common/Page.css';

import backImage_eng from '../assets/images/backimage_eng.png';
import backImage_company from '../assets/images/backimage_company.png';

function BcdApplySecond() {
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isOwn = location.pathname === '/api/bsc/own';

  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    center: '',
    department: '',
    team: '',
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
  });

  const [userIdInput, setUserIdInput] = useState('');
  const [showFinalConfirmationModal, setShowFinalConfirmationModal] = useState(false);

  useEffect(() => {
    if (isOwn) {
      fetchUserInfo(auth.userId);
    }
  }, [isOwn, auth.userId]);

  const fetchUserInfo = async (userId) => {
    try {
      const response = await axios.get(`/api/info/${userId}`);
      console.log('Lookup User Response:', response.data);
      if (response.data && response.data.data) {
        const userData = response.data.data;
        setFormData({
          ...formData,
          name: userData.userName,
          center: userData.centerNm,
          team: userData.teamNm,
          mobile1: userData.telNum.split('-')[0],
          mobile2: userData.telNum.split('-')[1],
          mobile3: userData.telNum.split('-')[2],
          email: userData.email.split('@')[0],
          userId: userId,
        });
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
    setFormData({ ...formData, [name]: value });
  };

  const handleCardTypeChange = (e) => {
    setFormData({ ...formData, cardType: e.target.value });
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
      instCd: formData.center,
      deptCd: formData.department,
      teamCd: formData.team,
      gradeCd: formData.position,
      extTel: `${formData.phone1}-${formData.phone2}-${formData.phone3}`,
      faxTel: `${formData.fax1}-${formData.fax2}-${formData.fax3}`,
      phoneTel: `${formData.mobile1}-${formData.mobile2}-${formData.mobile3}`,
      email: `${formData.email}@kmi.or.kr`,
      address: formData.address,
      division: formData.cardType === 'personal' ? 'B' : 'A',
      quantity: formData.quantity,
    };

    try {
      const response = await axios.post('/api/bcd/', requestData);
      console.log('Confirm Request Response:', response.data);
      if (response.data.code === 200) {
        alert('명함 신청이 완료되었습니다.');
        navigate('/');
      } else {
        alert('명함 신청 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('명함 신청 중 오류가 발생했습니다.');
    }
  };

  const handleLookupUser = async () => {
    try {
      const response = await axios.get(`/api/info/${userIdInput}`);
      console.log('Lookup User Response:', response.data);
      if (response.data && response.data.data) {
        const userData = response.data.data;
        setFormData({
          ...formData,
          name: userData.userName,
          center: userData.centerNm,
          team: userData.teamNm,
          mobile1: userData.telNum.split('-')[0],
          mobile2: userData.telNum.split('-')[1],
          mobile3: userData.telNum.split('-')[2],
          email: userData.email.split('@')[0],
          userId: userIdInput,
        });
      } else {
        console.error('No data found for the user');
        alert('사용자 정보를 불러오는 중 오류가 발생했습니다. 유효한 사번을 입력하세요.');
      }
    } catch (error) {
      console.error('Error fetching user info:', error.response ? error.response.data : error.message);
      alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="content">
      <div className="apply-content">
        <h2>명함 신청하기</h2>
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
                      -
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
              </div>
            </div>
            <div className="form-right">
              <div className="form-group-horizontal">
                <label className="bold-label">명함 정보 입력</label>
                <CustomButton className="preview-button">명함시안미리보기</CustomButton>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">이름</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">영문이름</label>
                <div className="name-inputs">
                  <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required className="english-name" />
                  <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required className="english-name" />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">센터</label>
                <input type="text" name="center" value={formData.center} onChange={handleChange} required />
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">부서</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} required />
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">팀 명</label>
                <input type="text" name="team" value={formData.team} onChange={handleChange} required />
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">직위 / 직책</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} required />
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">내선 번호</label>
                <div className="phone-inputs">
                  <input type="tel" name="phone1" value={formData.phone1} onChange={handleChange} required className="phone-number" />
                  <input type="tel" name="phone2" value={formData.phone2} onChange={handleChange} required className="phone-number" />
                  <input type="tel" name="phone3" value={formData.phone3} onChange={handleChange} required className="phone-number" />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">팩스 번호</label>
                <div className="phone-inputs">
                  <input type="tel" name="fax1" value={formData.fax1} onChange={handleChange} required className="phone-number" />
                  <input type="tel" name="fax2" value={formData.fax2} onChange={handleChange} required className="phone-number" />
                  <input type="tel" name="fax3" value={formData.fax3} onChange={handleChange} required className="phone-number" />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">휴대폰 번호</label>
                <div className="phone-inputs">
                  <input type="tel" name="mobile1" value={formData.mobile1} onChange={handleChange} required className="phone-number" />
                  <input type="tel" name="mobile2" value={formData.mobile2} onChange={handleChange} required className="phone-number" />
                  <input type="tel" name="mobile3" value={formData.mobile3} onChange={handleChange} required className="phone-number" />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">메일 주소</label>
                <div className="email-input">
                  <input type="text2" name="email" value={formData.email} onChange={handleChange} required className="email-full" />
                  <span>@ kmi.or.kr</span>
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">주소</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required />
              </div>
            </div>
          </form>
        </div>
        <div className="apply-buttons-container">
          <CustomButton className="apply-request-button" onClick={handleApplyRequest}>명함신청</CustomButton>
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
      />
    </div>
  );
}

export default BcdApplySecond;
