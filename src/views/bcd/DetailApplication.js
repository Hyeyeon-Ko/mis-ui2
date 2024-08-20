import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import FinalConfirmationModal from './FinalConfirmationModal';
import RejectReasonModal from '../../components/RejectReasonModal';
import ApplicationHistoryModal from './ApplicationHistoryModal';
import PreviewModal from './PreviewModal';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/bcd/BcdApplySecond.css';
import '../../styles/common/Page.css';

import backImageEng from '../../assets/images/backimage_eng.png';
import backImageCompany from '../../assets/images/backimage_company.png';

function DetailApplication() {
  const { auth } = useContext(AuthContext);
  const { draftId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    center: '',
    department: '',
    teamNm: '',
    addTeamNm: '',
    addEngTeamNm: '',
    position: '',
    engPosition: '',
    gradeNm: '',
    addGradeNm: '',
    enGradeNm: '',
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
  });

  const [addressOptions, setAddressOptions] = useState([]);
  const [floor, setFloor] = useState('');
  const [showFinalConfirmationModal, setShowFinalConfirmationModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const isReadOnly = new URLSearchParams(location.search).get('readonly') === 'true';

  const [bcdData, setBcdData] = useState({
    instInfo: [],
    deptInfo: [],
    teamInfo: [],
    gradeInfo: [],
  });

  const addressInputRef = useRef(null);

  const fetchAddressOptions = useCallback((centerCd, baseAddress) => {
    const selectedInstInfo = bcdData.instInfo.find((inst) => inst.detailCd === centerCd);

    const options = [];
    let engAddress = '';
    if (selectedInstInfo) {
      if (selectedInstInfo.etcItem1) {
        options.push(selectedInstInfo.etcItem1);
        engAddress = selectedInstInfo.etcItem2;
      }
      if (selectedInstInfo.etcItem3) {
        options.push(selectedInstInfo.etcItem3);
        engAddress = selectedInstInfo.etcItem4;
      }
      if (selectedInstInfo.etcItem5) {
        options.push(selectedInstInfo.etcItem5);
        engAddress = selectedInstInfo.etcItem6;
      }
    }

    setAddressOptions(options);

    if (!baseAddress && options.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        address: options[0],
        engAddress,
      }));
    }
  }, [bcdData.instInfo]);

  useEffect(() => {
    fetchBcdStd();
  }, []);

  useEffect(() => {
    fetchApplicationDetail(draftId);
  }, [draftId]);

  useEffect(() => {
    if (formData.center) {
      fetchAddressOptions(formData.center, formData.address);
    }
  }, [formData.center, formData.address, fetchAddressOptions]);

  useEffect(() => {
    if (addressInputRef.current) {
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.whiteSpace = 'pre';
      span.style.fontSize = '14.5px';
      span.style.fontFamily = 'Arial';
      span.innerText = formData.address;
      document.body.appendChild(span);
      const width = span.offsetWidth + 20;
      addressInputRef.current.style.width = `${width}px`;
      document.body.removeChild(span);
    }
  }, [formData.address, addressInputRef]); 
    
  const fetchApplicationDetail = async (draftId) => {
    try {
      const response = await axios.get(`/api/bcd/applyList/${draftId}`);
      if (response.data && response.data.data) {
        const data = response.data.data;
        const [phone1, phone2, phone3] = data.extTel.split('-');
        const [fax1, fax2, fax3] = data.faxTel.split('-');
        const [mobile1, mobile2, mobile3] = data.phoneTel.split('-');
        const email = data.email.split('@')[0];
        const [baseAddress, floor] = data.address.split(', ');
        const [teamNm] = data.teamNm.split('|');
        const [gradeNm] = data.gradeNm.split('|');

        setFormData({
          name: data.korNm,
          firstName: data.engNm.split(' ')[1],
          lastName: data.engNm.split(' ')[0],
          center: data.instCd,
          department: data.deptCd,
          team: data.teamCd,
          position: data.gradeCd,
          teamNm: teamNm.trim(),
          addTeamNm: data.addTeamNm,
          addEngTeamNm: data.addEngTeamNm,
          gradeNm: gradeNm.trim(),
          addGradeNm: data.addGradeNm,
          enGradeNm: data.enGradeNm,
          phone1,
          phone2,
          phone3,
          fax1,
          fax2,
          fax3,
          mobile1,
          mobile2,
          mobile3,
          email,
          address: baseAddress,
          quantity: data.quantity,
          cardType: data.division === 'B' ? 'personal' : 'company',
          userId: data.userId,
          engAddress: data.engAddress,
        });
        setFloor(floor || '');
      } else {
        alert('신청 정보를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('신청 정보를 불러오는 중 오류가 발생했습니다.');
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

        data.instInfo.forEach((inst) => { instMap[inst.detailCd] = inst.detailNm; });
        data.deptInfo.forEach((dept) => { deptMap[dept.detailCd] = dept.detailNm; });
        data.teamInfo.forEach((team) => { teamMap[team.detailCd] = team.detailNm; });
        data.gradeInfo.forEach((grade) => { gradeMap[grade.detailCd] = grade.detailNm; });

        setBcdData(data);
      } else {
        alert('기준자료를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('기준자료를 불러오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    // bcdData가 변경될 때마다 콘솔에 출력
    console.log('formData:', formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCardTypeChange = (e) => {
    setFormData({ ...formData, cardType: e.target.value });
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
    if (!validateForm()) {
      alert('모든 명함 정보를 입력해주세요.');
      return;
    }
    setShowFinalConfirmationModal(true);
  };

  const handleConfirmRequest = async () => {
    setShowFinalConfirmationModal(false);

    const fullAddress = `${formData.address}${floor ? `, ${floor}` : ''}`;

    const requestData = {
      drafter: auth.hngNm,
      drafterId: auth.userId,
      userId: formData.userId,
      korNm: formData.name,
      engNm: `${formData.lastName} ${formData.firstName}`,
      instCd: formData.center,
      deptCd: formData.department,
      teamCd: formData.team,
      teamNm: formData.team === '000' ? formData.addTeamNm : formData.teamNm,
      engTeamNm: formData.team === '000' ? formData.addEngTeamNm : formData.engTeamNm,
      gradeCd: formData.position,
      gradeNm: formData.gradeNm,
      addGradeNm: formData.addGradenM,
      enGradeNm: formData.enGradeNm,
      extTel: `${formData.phone1}-${formData.phone2}-${formData.phone3}`,
      faxTel: `${formData.fax1}-${formData.fax2}-${formData.fax3}`,
      phoneTel: `${formData.mobile1}-${formData.mobile2}-${formData.mobile3}`,
      email: `${formData.email}@kmi.or.kr`,
      address: fullAddress,
      engAddress: formData.engAddress,
      division: formData.cardType === 'personal' ? 'B' : 'A',
      quantity: formData.quantity,
    };

    try {
      const response = await axios.post(`/api/bcd/update?draftId=${draftId}`, requestData);
      if (response.data.code === 200) {
        alert('명함 수정이 완료되었습니다.');
        navigate('/api/myPendingList');
      } else {
        alert('명함 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('명함 수정 중 오류가 발생했습니다.');
    }
  };

  const handleApprove = async () => {
    try {
      const response = await axios.post(`/api/bcd/applyList/${draftId}`);
      if (response.data.code === 200) {
        alert('명함이 승인되었습니다.');
        navigate('/api/pendingList');
      } else {
        alert('명함 승인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('명함 승인 중 오류가 발생했습니다.');
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleRejectClose = () => {
    setShowRejectModal(false);
  };

  const handleRejectConfirm = async (reason) => {
    try {
      const response = await axios.post(`/api/bcd/applyList/return/${draftId}`, reason, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      if (response.data.code === 200) {
        alert('명함이 반려되었습니다.');
        navigate('/api/pendingList');
      } else {
        alert('명함 반려 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('명함 반려 중 오류가 발생했습니다.');
    }
  };

  const handleHistoryClick = () => {
    setShowHistoryModal(true);
  };

  const handleHistoryClose = () => {
    setShowHistoryModal(false);
  };

  const handleCenterChange = (e) => {
    const selectedCenter = e.target.value;
    setFormData({ ...formData, center: selectedCenter, department: '', team: '', address: '' });
    fetchAddressOptions(selectedCenter);
  };

  const handleDepartmentChange = (e) => {
    setFormData({ ...formData, department: e.target.value, team: '' });
  };

  const handleTeamChange = (e) => {
    const selectedTeam = e.target.value;
    const selectedTeamInfo = bcdData.teamInfo.find((team) => team.detailCd === selectedTeam);
    const engTeam = selectedTeamInfo ? selectedTeamInfo.etcItem1 : '';

    setFormData({ ...formData, team: selectedTeam, engTeam });
  };

  const handlePositionChange = (e) => {
    const selectedPosition = e.target.value;
    const selectedPositionInfo = bcdData.gradeInfo.find((position) => position.detailCd === selectedPosition);
    const enGradeNm = selectedPositionInfo ? selectedPositionInfo.etcItem2 : '';
    setFormData((prevFormData) => ({
      ...prevFormData,
      position: selectedPosition,
      gradeNm: selectedPosition === '000' ? prevFormData.addGradeNm : null,
      enGradeNm: selectedPosition === '000' ? enGradeNm : null,
    }));
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setPreviewVisible(true);
  };

  const handleAddressChange = (e) => {
    const updatedAddress = e.target.value + (floor ? `, ${floor}` : '');
    setFormData({ ...formData, address: updatedAddress });
  };

  const handleFloorChange = (e) => {
    const updatedFloor = e.target.value;
    setFloor(updatedFloor);

    const baseAddress = formData.address.split(',')[0];
    const updatedAddress = `${baseAddress}${updatedFloor ? `, ${updatedFloor}` : ''}`;

    const originalEngAddress = bcdData.instInfo.find((inst) => inst.detailCd === formData.center)?.etcItem2 || '';
    const updatedEngAddress = updatedFloor ? `${updatedFloor}F, ${originalEngAddress}` : originalEngAddress;

    setFormData({ ...formData, address: updatedAddress, engAddress: updatedEngAddress });
  };

  const handleNumberInput = (e) => {
    const { value, maxLength } = e.target;
    const numericValue = value.replace(/\D/g, '');
    setFormData({ ...formData, [e.target.name]: numericValue.slice(0, maxLength) });
  };

  return (
    <div className="content">
      <div className="apply-content">
        <h2>{isReadOnly ? '명함 상세보기' : '명함수정'}</h2>
        <Breadcrumb items={['나의 신청내역', '승인 대기 내역', isReadOnly ? '명함 상세보기' : '명함수정']} />
        <div className="form-wrapper">
          <form className="business-card-form">
            <div className="form-left">
              <div className="form-group">
                <label className="bold-label">명함 대상자 선택</label>
                <div className="form-horizontal">
                  <input type="text" value={`${formData.name} (${formData.userId})`} readOnly />
                  {isReadOnly && (
                    <button type="button" className="history-button" onClick={handleHistoryClick}>
                      신청이력 조회
                    </button>
                  )}
                </div>
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
                    disabled={isReadOnly}
                  />
                  <label htmlFor="personal">[뒷면] 영문 명함</label>
                  <input
                    type="radio"
                    id="company"
                    name="cardType"
                    value="company"
                    checked={formData.cardType === 'company'}
                    onChange={handleCardTypeChange}
                    disabled={isReadOnly}
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
                  {isReadOnly ? (
                    <div className="quantity-display">
                      {formData.quantity} 통
                    </div>
                  ) : (
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
                  )}
                </div>
                <div className="sub-label2">(수량 단위: 1 * 200매)</div>
              </div>
            </div>
            <div className="form-right">
              <div className="form-group-horizontal">
                <label className="bold-label">명함 정보 입력</label>
                <CustomButton className="preview-button" onClick={handlePreview}>명함시안미리보기</CustomButton>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">이름</label>
                <input type="text" name="name" value={formData.name} readOnly />
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">영문이름</label>
                <div className="name-inputs">
                  <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required={!isReadOnly} readOnly={isReadOnly} className="english-name" />
                  <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required={!isReadOnly} readOnly={isReadOnly} className="english-name" />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">센터</label>
                <select name="center" value={formData.center} onChange={handleCenterChange} required={!isReadOnly} disabled={isReadOnly}>
                  <option value="">선택하세요</option>
                  {bcdData.instInfo.map((center) => (
                    <option key={center.detailCd} value={center.detailCd}>{center.detailNm}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">부서</label>
                <select 
                  name="department" 
                  value={formData.department} 
                  onChange={handleDepartmentChange} 
                  required={!isReadOnly} 
                  disabled={isReadOnly}
                  defaultValue={bcdData.deptInfo.find((dept) => dept.detailCd === formData.department)?.detailCd || ''}
                >
                  <option value="">선택하세요</option>
                  {bcdData.deptInfo
                    .filter((dept) => dept.etcItem1 === formData.center)
                    .map((department) => (
                      <option key={department.detailCd} value={department.detailCd}>
                        {department.detailNm}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">팀</label>
                <select name="team" value={formData.team} onChange={handleTeamChange} required={!isReadOnly} disabled={isReadOnly}>
                  <option value="">선택하세요</option>
                  {bcdData.teamInfo
                    .filter((team) => team.etcItem1 === formData.department || team.detailCd === '000')
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
                      name="addTeamNm"
                      value={formData.addTeamNm}
                      onChange={handleChange}
                      required
                      placeholder="팀명"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="form-group-horizontal">
                    <label className="form-label">영문 팀명</label>
                    <input
                      type="text"
                      name="addEngTeamNm"
                      value={formData.addEngTeamNm}
                      onChange={handleChange}
                      required
                      placeholder="영문 팀명"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}
              <div className="form-group-horizontal">
                <label className="form-label">직위 / 직책</label>
                <select name="position" value={formData.position} onChange={handlePositionChange} required={!isReadOnly} disabled={isReadOnly}>
                  <option value="">선택하세요</option>
                  {bcdData.gradeInfo.map((position) => (
                    <option key={position.detailCd} value={position.detailCd}>
                      {`${position.detailNm}  | ${position.etcItem2}`}
                    </option>
                  ))}
                </select>
              </div>
              {formData.position === '000' && (
                <div className="additional-inputs">
                <div className="form-group-horizontal">
                  <label className="form-label">직위명</label>
                  <input
                    type="text"
                    name="addGradeNm"
                    value={formData.addGradeNm}
                    onChange={handleChange}
                    placeholder="직위"
                    required={!isReadOnly} 
                    disabled={isReadOnly}
                  />
                </div>
                <div className="form-group-horizontal">
                  <label className="form-label">영문 직위명</label>
                  <input
                    type="text"
                    name="enGradeNm"
                    value={formData.enGradeNm}
                    onChange={handleChange}
                    placeholder="영문 직위"
                    required={!isReadOnly} 
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              )}
              <div className="form-group-horizontal">
                <label className="form-label">내선 번호</label>
                <div className="phone-inputs">
                  <input type="tel" name="phone1" value={formData.phone1} onInput={handleNumberInput} maxLength="4" required={!isReadOnly} readOnly={isReadOnly} className="phone-number" />
                  <input type="tel" name="phone2" value={formData.phone2} onInput={handleNumberInput} maxLength="4" required={!isReadOnly} readOnly={isReadOnly} className="phone-number" />
                  <input type="tel" name="phone3" value={formData.phone3} onInput={handleNumberInput} maxLength="4" required={!isReadOnly} readOnly={isReadOnly} className="phone-number" />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">팩스 번호</label>
                <div className="phone-inputs">
                  <input type="tel" name="fax1" value={formData.fax1} onInput={handleNumberInput} maxLength="4" required={!isReadOnly} readOnly={isReadOnly} className="phone-number" />
                  <input type="tel" name="fax2" value={formData.fax2} onInput={handleNumberInput} maxLength="4" required={!isReadOnly} readOnly={isReadOnly} className="phone-number" />
                  <input type="tel" name="fax3" value={formData.fax3} onInput={handleNumberInput} maxLength="4" required={!isReadOnly} readOnly={isReadOnly} className="phone-number" />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">휴대폰 번호</label>
                <div className="phone-inputs">
                  <input type="tel" name="mobile1" value={formData.mobile1} onInput={handleNumberInput} maxLength="4" required={!isReadOnly} readOnly={isReadOnly} className="phone-number" />
                  <input type="tel" name="mobile2" value={formData.mobile2} onInput={handleNumberInput} maxLength="4" required={!isReadOnly} readOnly={isReadOnly} className="phone-number" />
                  <input type="tel" name="mobile3" value={formData.mobile3} onInput={handleNumberInput} maxLength="4" required={!isReadOnly} readOnly={isReadOnly} className="phone-number" />
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">메일 주소</label>
                <div className="email-input">
                  <input type="text2" name="email" value={formData.email} onChange={handleChange} required={!isReadOnly} readOnly={isReadOnly} className="email-full" />
                  <span>@ kmi.or.kr</span>
                </div>
              </div>
              <div className="form-group-horizontal">
                <label className="form-label">주소</label>
                {isReadOnly ? (
                  <div className="address-floor-input">
                    <input type="text" name="address" value={formData.address} readOnly className="address-select" ref={addressInputRef} />
                    <input type="text3" value={floor} readOnly className="floor-input3" />
                    <span>층</span>
                  </div>
                ) : (
                  <div className="address-floor-input">
                    <select name="address" value={formData.address.split(',')[0]} onChange={handleAddressChange} required className="address-select">
                      {addressOptions.map((address, index) => (
                        <option key={index} value={address}>{address}</option>
                      ))}
                    </select>
                    <input type="text3" value={floor} onChange={handleFloorChange} required className="floor-input2" />
                    <span>층</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
        <div className="apply-buttons-container">
          {!isReadOnly ? (
            <CustomButton className="apply-request-button" onClick={handleApplyRequest}>수정완료</CustomButton>
          ) : (
            <div className="approval-buttons">
              <CustomButton className="approve-button" onClick={handleApprove}>승인</CustomButton>
              <CustomButton className="reject-button" onClick={handleReject}>반려</CustomButton>
            </div>
          )}
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
        title="최종 수정 확인"
        confirmButtonText="수 정"
      />
      <RejectReasonModal show={showRejectModal} onClose={handleRejectClose} onConfirm={handleRejectConfirm} />
      <ApplicationHistoryModal show={showHistoryModal} onClose={handleHistoryClose} draftId={draftId} />
      <PreviewModal
        show={previewVisible}
        onClose={() => setPreviewVisible(false)}
        formData={formData}
      />
    </div>
  );
}

export default DetailApplication;
