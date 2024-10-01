import { useState } from 'react';
import { inputValue } from '../../datas/bdcDatas';

export const useFormHandlers = (auth, bcdData, mappings) => {
  const [formData, setFormData] = useState(inputValue);
  const [userIdInput, setUserIdInput] = useState('');
  const [addressOptions, setAddressOptions] = useState([]);
  const [floor, setFloor] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['phone1', 'phone2', 'phone3', 'fax1', 'fax2', 'fax3', 'mobile1', 'mobile2', 'mobile3'].includes(name)) {
      if (isNaN(value) || value.length > 4) {
        return;
      }
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

  return {
    formData,
    userIdInput,
    handleChange,
    handleUserIdChange,
    handleCardTypeChange,
    handleCenterChange,
    handleDepartmentChange,
    handleTeamChange,
    handlePositionChange,
    handleAddressChange,
    handleFloorChange,
  };
};